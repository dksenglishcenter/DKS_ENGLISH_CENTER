#!/usr/bin/env tsx
/**
 * HTTP runner: spawn Nest đã compile (dist) để DI hoạt động,
 * rồi gọi API + Prisma cleanup. Không dùng Jest.
 */
import 'dotenv/config';
import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { PrismaClient, Role } from '../generated/prisma/client';
import { AUTH_COOKIE_NAMES } from '../src/auth/auth-cookie.config';

type Json = Record<string, unknown>;

const PREFIX = `e2e-ops-${Date.now()}`;
const PASSWORD = 'Test@123456';
const FAKE_ID = 'cnonexistent0000000000001';

const created = {
  userIds: [] as string[],
  studentIds: [] as string[],
  classIds: [] as string[],
  invoiceIds: [] as string[],
};

function flattenMessage(body: unknown): string {
  if (!body || typeof body !== 'object') return String(body ?? '');
  const message = (body as Json).message;
  if (Array.isArray(message)) return message.join(' | ');
  if (typeof message === 'string') return message;
  return JSON.stringify(body);
}

class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly body: unknown,
  ) {
    super(`${status} ${flattenMessage(body)}`);
  }
}

const BACKEND_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TEST_PORT = Number(process.env.API_TEST_PORT ?? 39991);

function signAccessToken(user: { id: string; email: string; role: Role }) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Thiếu JWT_SECRET');
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role, type: 'access' },
    secret,
    { expiresIn: '15m' },
  );
}

async function waitForHealth(baseUrl: string) {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${baseUrl}/health`);
      if (res.ok) return;
    } catch {
      /* still booting */
    }
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
  throw new Error(`Timeout chờ backend ${baseUrl}/health`);
}

function startCompiledServer(): ChildProcess {
  const mainJs = join(BACKEND_ROOT, 'dist', 'src', 'main.js');
  if (!existsSync(mainJs)) {
    console.log('Chưa có dist — đang nest build...');
    const built = spawnSync('npx', ['nest', 'build'], {
      cwd: BACKEND_ROOT,
      stdio: 'inherit',
      shell: true,
    });
    if (built.status !== 0) {
      throw new Error('nest build thất bại');
    }
  }
  const child = spawn(process.execPath, [mainJs], {
    cwd: BACKEND_ROOT,
    env: { ...process.env, PORT: String(TEST_PORT) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout?.on('data', (chunk: Buffer) => {
    const text = chunk.toString();
    if (text.includes('ERROR') || text.includes('running')) process.stdout.write(text);
  });
  child.stderr?.on('data', (chunk: Buffer) => process.stderr.write(chunk));
  return child;
}

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
  const child = startCompiledServer();
  const baseUrl = `http://127.0.0.1:${TEST_PORT}`;
  const results: { name: string; ok: boolean; error?: string }[] = [];

  try {
    await waitForHealth(baseUrl);

  const request = async (
    path: string,
    init: RequestInit & { cookie?: string } = {},
  ) => {
    const headers = new Headers(init.headers);
    if (init.body && !headers.has('content-type')) {
      headers.set('content-type', 'application/json');
    }
    if (init.cookie) headers.set('cookie', init.cookie);

    const res = await fetch(`${baseUrl}${path}`, { ...init, headers });
    const text = await res.text();
    let body: unknown = text;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = text;
    }
    return { status: res.status, body, headers: res.headers };
  };

  const sessionCookie = (user: { id: string; email: string; role: Role }) =>
    `${AUTH_COOKIE_NAMES.accessToken}=${signAccessToken(user)}`;

  const authed = (cookie: string) => ({
    get: (path: string) => request(path, { cookie }),
    send: (method: string, path: string, body?: unknown) =>
      request(path, {
        method,
        cookie,
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
  });

  const test = async (name: string, fn: () => Promise<void>) => {
    try {
      await fn();
      results.push({ name, ok: true });
      console.log(`  ✓ ${name}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      results.push({ name, ok: false, error: message });
      console.log(`  ✗ ${name}`);
      console.log(`    ${message}`);
    }
  };

  const expectStatus = (res: { status: number; body: unknown }, status: number) => {
    if (res.status !== status) {
      throw new HttpError(res.status, res.body);
    }
    return res.body as Json;
  };

  const expectMessage = (body: Json, snippet: string) => {
    const text = flattenMessage(body);
    if (!text.includes(snippet)) {
      throw new Error(`Kỳ vọng message chứa "${snippet}", nhận: ${text}`);
    }
  };

  const createUser = async (role: Role, suffix: string) => {
    const email = `${PREFIX}-${role.toLowerCase()}-${suffix}@test.local`;
    const user = await prisma.user.create({
      data: {
        email,
        fullName: `E2E ${role} ${suffix}`,
        passwordHash: await bcrypt.hash(PASSWORD, 12),
        role,
      },
    });
    created.userIds.push(user.id);
    return { ...user, cookie: sessionCookie(user) };
  };

    console.log(`Test server: ${baseUrl}`);
    console.log(`Prefix: ${PREFIX}\n`);

    const admin = await createUser(Role.ADMIN, 'a');
    const teacherA = await createUser(Role.TEACHER, 'a');
    const teacherB = await createUser(Role.TEACHER, 'b');
    const parentA = await createUser(Role.PARENT, 'a');
    const parentB = await createUser(Role.PARENT, 'b');
    const adminApi = authed(admin.cookie);
    const teacherAApi = authed(teacherA.cookie);
    const teacherBApi = authed(teacherB.cookie);
    const parentAApi = authed(parentA.cookie);
    const parentBApi = authed(parentB.cookie);

    console.log('Students');
    await test('ADMIN tạo học viên', async () => {
      const body = expectStatus(
        await adminApi.send('POST', '/api/students', {
          fullName: 'Nguyen Van A',
          phone: '0901234567',
          status: 'STUDYING',
        }),
        201,
      );
      expectMessage(body, 'Đã tạo học viên');
      const data = body.data as Json;
      if (!data?.id) throw new Error('Thiếu student id');
      created.studentIds.push(String(data.id));
    });

    await test('Từ chối tạo thiếu họ tên', async () => {
      const res = await adminApi.send('POST', '/api/students', {
        phone: '0901234567',
      });
      expectStatus(res, 400);
      expectMessage(res.body as Json, 'Họ tên');
    });

    await test('Từ chối SĐT không hợp lệ', async () => {
      const res = await adminApi.send('POST', '/api/students', {
        fullName: 'Test Student',
        phone: '123',
      });
      expectStatus(res, 400);
      expectMessage(res.body as Json, 'Số điện thoại');
    });

    await test('TEACHER không tạo được HV', async () => {
      expectStatus(
        await teacherAApi.send('POST', '/api/students', {
          fullName: 'Should Fail',
          phone: '0903456789',
        }),
        403,
      );
    });

    await test('PARENT không tạo được HV', async () => {
      expectStatus(
        await parentAApi.send('POST', '/api/students', {
          fullName: 'Should Fail',
          phone: '0904567890',
        }),
        403,
      );
    });

    const studentMai = expectStatus(
      await adminApi.send('POST', '/api/students', {
        fullName: 'Tran Thi Mai',
        phone: '0905678901',
        status: 'STUDYING',
      }),
      201,
    ).data as Json;
    created.studentIds.push(String(studentMai.id));

    const studentNam = expectStatus(
      await adminApi.send('POST', '/api/students', {
        fullName: 'Le Van Nam',
        phone: '0906789012',
        status: 'FINISHED',
      }),
      201,
    ).data as Json;
    created.studentIds.push(String(studentNam.id));

    await test('ADMIN list HV có data + meta', async () => {
      const body = expectStatus(await adminApi.get('/api/students'), 200);
      if (!Array.isArray(body.data)) throw new Error('data phải là mảng');
      if (!(body.meta as Json)?.totalItems) throw new Error('thiếu meta.totalItems');
    });

    await test('Search HV theo tên', async () => {
      const body = expectStatus(
        await adminApi.get('/api/students?search=Mai'),
        200,
      );
      const rows = body.data as Json[];
      if (!rows.some((row) => String(row.fullName).includes('Mai'))) {
        throw new Error('Không tìm thấy Mai');
      }
    });

    await test('Filter HV theo STUDYING', async () => {
      const body = expectStatus(
        await adminApi.get('/api/students?status=STUDYING'),
        200,
      );
      const rows = body.data as Json[];
      if (!rows.every((row) => row.status === 'STUDYING')) {
        throw new Error('Có HV không phải STUDYING');
      }
    });

    await test('TEACHER không list được HV', async () => {
      expectStatus(await teacherAApi.get('/api/students'), 403);
    });

    await test('ADMIN get HV theo id', async () => {
      const body = expectStatus(
        await adminApi.get(`/api/students/${studentMai.id}`),
        200,
      );
      if ((body.data as Json).id !== studentMai.id) throw new Error('Sai HV');
    });

    await test('Get HV không tồn tại → 404', async () => {
      expectStatus(await adminApi.get(`/api/students/${FAKE_ID}`), 404);
    });

    await test('ADMIN cập nhật HV', async () => {
      const body = expectStatus(
        await adminApi.send('PATCH', `/api/students/${studentNam.id}`, {
          fullName: 'Le Van Nam Updated',
          status: 'FINISHED',
        }),
        200,
      );
      expectMessage(body, 'Đã cập nhật học viên');
      if ((body.data as Json).fullName !== 'Le Van Nam Updated') {
        throw new Error('Không cập nhật tên');
      }
    });

    await test('TEACHER không sửa HV', async () => {
      expectStatus(
        await teacherAApi.send('PATCH', `/api/students/${studentMai.id}`, {
          fullName: 'Should Fail',
        }),
        403,
      );
    });

    const studentDelete = expectStatus(
      await adminApi.send('POST', '/api/students', {
        fullName: 'Do Van Minh',
        phone: '0909012345',
        status: 'STUDYING',
      }),
      201,
    ).data as Json;
    created.studentIds.push(String(studentDelete.id));

    await test('Xóa HV = chuyển FINISHED', async () => {
      const body = expectStatus(
        await adminApi.send('DELETE', `/api/students/${studentDelete.id}`),
        200,
      );
      expectMessage(body, 'kết thúc');
      if ((body.data as Json).status !== 'FINISHED') {
        throw new Error('Chưa chuyển FINISHED');
      }
    });

    await test('Xóa HV đã FINISHED vẫn idempotent', async () => {
      const body = expectStatus(
        await adminApi.send('DELETE', `/api/students/${studentDelete.id}`),
        200,
      );
      if ((body.data as Json).status !== 'FINISHED') {
        throw new Error('Status không còn FINISHED');
      }
    });

    await test('Gắn PARENT với HV', async () => {
      const body = expectStatus(
        await adminApi.send('POST', `/api/students/${studentMai.id}/parents`, {
          parentUserId: parentA.id,
        }),
        201,
      );
      expectMessage(body, 'gắn phụ huynh');
    });

    await test('Từ chối gắn user không phải PARENT', async () => {
      const res = await adminApi.send(
        'POST',
        `/api/students/${studentMai.id}/parents`,
        { parentUserId: teacherA.id },
      );
      expectStatus(res, 400);
      expectMessage(res.body as Json, 'phụ huynh');
    });

    await test('Từ chối gắn PARENT trùng', async () => {
      const res = await adminApi.send(
        'POST',
        `/api/students/${studentMai.id}/parents`,
        { parentUserId: parentA.id },
      );
      expectStatus(res, 400);
      expectMessage(res.body as Json, 'đã được gắn');
    });

    await test('Gỡ liên kết phụ huynh', async () => {
      expectStatus(
        await adminApi.send(
          'POST',
          `/api/students/${studentNam.id}/parents`,
          { parentUserId: parentB.id },
        ),
        201,
      );
      const body = expectStatus(
        await adminApi.send(
          'DELETE',
          `/api/students/${studentNam.id}/parents/${parentB.id}`,
        ),
        200,
      );
      expectMessage(body, 'gỡ liên kết');
    });

    await test('Gỡ liên kết không tồn tại → 404', async () => {
      expectStatus(
        await adminApi.send(
          'DELETE',
          `/api/students/${studentNam.id}/parents/${parentB.id}`,
        ),
        404,
      );
    });

    console.log('\nClasses');
    await test('ADMIN tạo lớp', async () => {
      const body = expectStatus(
        await adminApi.send('POST', '/api/classes', {
          name: 'Lop A1 Sang',
          level: 'Beginner',
          teacherId: teacherA.id,
          scheduleDays: [1, 3, 5],
          startTime: '08:00',
          endTime: '10:00',
          room: 'P101',
          capacity: 20,
          status: 'OPEN',
        }),
        201,
      );
      expectMessage(body, 'Đã tạo lớp học');
      created.classIds.push(String((body.data as Json).id));
    });

    await test('Từ chối teacherId không phải TEACHER', async () => {
      const res = await adminApi.send('POST', '/api/classes', {
        name: 'Lop sai GV',
        teacherId: admin.id,
        scheduleDays: [1],
        startTime: '08:00',
        endTime: '10:00',
        capacity: 10,
      });
      expectStatus(res, 400);
      expectMessage(res.body as Json, 'TEACHER');
    });

    await test('TEACHER không tạo lớp', async () => {
      expectStatus(
        await teacherAApi.send('POST', '/api/classes', {
          name: 'Lop GV tao',
          teacherId: teacherA.id,
          capacity: 10,
        }),
        403,
      );
    });

    const classB = expectStatus(
      await adminApi.send('POST', '/api/classes', {
        name: 'Lop B1',
        level: 'Intermediate',
        teacherId: teacherA.id,
        scheduleDays: [2, 4],
        startTime: '14:00',
        endTime: '16:00',
        capacity: 15,
        status: 'OPEN',
      }),
      201,
    ).data as Json;
    created.classIds.push(String(classB.id));

    const classC = expectStatus(
      await adminApi.send('POST', '/api/classes', {
        name: 'Lop C1',
        teacherId: teacherB.id,
        scheduleDays: [6],
        startTime: '09:00',
        endTime: '11:00',
        capacity: 10,
        status: 'CLOSED',
      }),
      201,
    ).data as Json;
    created.classIds.push(String(classC.id));

    await test('ADMIN list tất cả lớp', async () => {
      const body = expectStatus(await adminApi.get('/api/classes'), 200);
      if (!Array.isArray(body.data)) throw new Error('data phải là mảng');
    });

    await test('Search lớp theo tên', async () => {
      const body = expectStatus(await adminApi.get('/api/classes?search=B1'), 200);
      const rows = body.data as Json[];
      if (!rows.some((row) => String(row.name).includes('B1'))) {
        throw new Error('Không thấy Lop B1');
      }
    });

    await test('TEACHER không list /classes', async () => {
      expectStatus(await teacherAApi.get('/api/classes'), 403);
    });

    await test('TEACHER /classes/mine chỉ lớp của mình', async () => {
      const body = expectStatus(await teacherAApi.get('/api/classes/mine'), 200);
      const rows = body.data as Json[];
      if (!rows.every((row) => row.teacherId === teacherA.id)) {
        throw new Error('Có lớp không thuộc GV A');
      }
    });

    await test('GV chưa có lớp → mine rỗng', async () => {
      const extra = await createUser(Role.TEACHER, 'empty');
      const body = expectStatus(await authed(extra.cookie).get('/api/classes/mine'), 200);
      if ((body.data as unknown[]).length !== 0) throw new Error('Mine phải rỗng');
    });

    await test('ADMIN xem chi tiết lớp', async () => {
      const body = expectStatus(
        await adminApi.get(`/api/classes/${classB.id}`),
        200,
      );
      if ((body.data as Json).id !== classB.id) throw new Error('Sai lớp');
    });

    await test('GV A xem được lớp của mình', async () => {
      expectStatus(await teacherAApi.get(`/api/classes/${classB.id}`), 200);
    });

    await test('GV B không xem lớp của GV A', async () => {
      expectStatus(await teacherBApi.get(`/api/classes/${classB.id}`), 403);
    });

    await test('Lớp không tồn tại → 404', async () => {
      expectStatus(await adminApi.get(`/api/classes/${FAKE_ID}`), 404);
    });

    await test('ADMIN cập nhật lớp', async () => {
      const body = expectStatus(
        await adminApi.send('PATCH', `/api/classes/${classC.id}`, {
          name: 'Lop C1 Updated',
          capacity: 12,
          status: 'CLOSED',
        }),
        200,
      );
      expectMessage(body, 'Đã cập nhật lớp học');
      if ((body.data as Json).name !== 'Lop C1 Updated') {
        throw new Error('Không đổi tên lớp');
      }
    });

    await test('TEACHER không sửa lớp', async () => {
      expectStatus(
        await teacherAApi.send('PATCH', `/api/classes/${classB.id}`, {
          name: 'Should Fail',
        }),
        403,
      );
    });

    const classToDelete = expectStatus(
      await adminApi.send('POST', '/api/classes', {
        name: 'Lop se xoa',
        teacherId: teacherA.id,
        capacity: 8,
      }),
      201,
    ).data as Json;
    created.classIds.push(String(classToDelete.id));

    await test('ADMIN xóa lớp', async () => {
      const body = expectStatus(
        await adminApi.send('DELETE', `/api/classes/${classToDelete.id}`),
        200,
      );
      expectMessage(body, 'xóa');
      expectStatus(await adminApi.get(`/api/classes/${classToDelete.id}`), 404);
    });

    await test('TEACHER không xóa lớp', async () => {
      expectStatus(
        await teacherAApi.send('DELETE', `/api/classes/${classB.id}`),
        403,
      );
    });

    const classEnroll = expectStatus(
      await adminApi.send('POST', '/api/classes', {
        name: 'Lop enroll',
        teacherId: teacherA.id,
        capacity: 2,
        status: 'OPEN',
      }),
      201,
    ).data as Json;
    created.classIds.push(String(classEnroll.id));

    const hv1 = expectStatus(
      await adminApi.send('POST', '/api/students', {
        fullName: 'HV Enroll Mot',
        phone: '0911111111',
        status: 'STUDYING',
      }),
      201,
    ).data as Json;
    const hv2 = expectStatus(
      await adminApi.send('POST', '/api/students', {
        fullName: 'HV Enroll Hai',
        phone: '0922222222',
        status: 'STUDYING',
      }),
      201,
    ).data as Json;
    const hv3 = expectStatus(
      await adminApi.send('POST', '/api/students', {
        fullName: 'HV Enroll Ba',
        phone: '0933333333',
        status: 'STUDYING',
      }),
      201,
    ).data as Json;
    created.studentIds.push(String(hv1.id), String(hv2.id), String(hv3.id));

    await test('Thêm HV vào lớp', async () => {
      const body = expectStatus(
        await adminApi.send('POST', `/api/classes/${classEnroll.id}/students`, {
          studentId: hv1.id,
        }),
        201,
      );
      expectMessage(body, 'thêm học viên');
    });

    await test('Từ chối enroll trùng', async () => {
      const res = await adminApi.send(
        'POST',
        `/api/classes/${classEnroll.id}/students`,
        { studentId: hv1.id },
      );
      expectStatus(res, 400);
      expectMessage(res.body as Json, 'đã có trong lớp');
    });

    await test('Chặn vượt sĩ số', async () => {
      expectStatus(
        await adminApi.send('POST', `/api/classes/${classEnroll.id}/students`, {
          studentId: hv2.id,
        }),
        201,
      );
      const res = await adminApi.send(
        'POST',
        `/api/classes/${classEnroll.id}/students`,
        { studentId: hv3.id },
      );
      expectStatus(res, 400);
      expectMessage(res.body as Json, 'sĩ số');
    });

    await test('TEACHER không enroll', async () => {
      expectStatus(
        await teacherAApi.send('POST', `/api/classes/${classEnroll.id}/students`, {
          studentId: hv3.id,
        }),
        403,
      );
    });

    await test('Gỡ HV khỏi lớp', async () => {
      const body = expectStatus(
        await adminApi.send(
          'DELETE',
          `/api/classes/${classEnroll.id}/students/${hv2.id}`,
        ),
        200,
      );
      expectMessage(body, 'gỡ');
    });

    await test('Gỡ HV không còn trong lớp → 404', async () => {
      expectStatus(
        await adminApi.send(
          'DELETE',
          `/api/classes/${classEnroll.id}/students/${hv2.id}`,
        ),
        404,
      );
    });

    console.log('\nAttendance');
    const classAtt = expectStatus(
      await adminApi.send('POST', '/api/classes', {
        name: 'Lop diem danh',
        teacherId: teacherA.id,
        capacity: 20,
        status: 'OPEN',
      }),
      201,
    ).data as Json;
    created.classIds.push(String(classAtt.id));
    expectStatus(
      await adminApi.send('POST', `/api/classes/${classAtt.id}/students`, {
        studentId: hv1.id,
      }),
      201,
    );
    expectStatus(
      await adminApi.send('POST', `/api/classes/${classAtt.id}/students`, {
        studentId: hv2.id,
      }),
      201,
    );

    await test('ADMIN mở buổi học', async () => {
      const body = expectStatus(
        await adminApi.send('POST', `/api/classes/${classAtt.id}/sessions`, {
          date: '2026-08-18',
          note: 'Buoi dau',
        }),
        201,
      );
      expectMessage(body, 'Đã mở buổi học');
      if ((body.data as Json).date !== '2026-08-18') {
        throw new Error(`Sai date: ${(body.data as Json).date}`);
      }
    });

    await test('GV A mở buổi lớp của mình', async () => {
      expectStatus(
        await teacherAApi.send('POST', `/api/classes/${classAtt.id}/sessions`, {
          date: '2026-08-19',
        }),
        201,
      );
    });

    await test('Upsert buổi cùng ngày cập nhật note', async () => {
      const body = expectStatus(
        await adminApi.send('POST', `/api/classes/${classAtt.id}/sessions`, {
          date: '2026-08-18',
          note: 'Buoi cap nhat',
        }),
        201,
      );
      if ((body.data as Json).note !== 'Buoi cap nhat') {
        throw new Error('Note chưa được upsert');
      }
    });

    await test('GV B không mở buổi lớp A', async () => {
      expectStatus(
        await teacherBApi.send('POST', `/api/classes/${classAtt.id}/sessions`, {
          date: '2026-08-20',
        }),
        403,
      );
    });

    await test('Từ chối date sai định dạng', async () => {
      const res = await adminApi.send(
        'POST',
        `/api/classes/${classAtt.id}/sessions`,
        { date: 'invalid-date' },
      );
      expectStatus(res, 400);
      expectMessage(res.body as Json, 'định dạng');
    });

    const classSched = expectStatus(
      await adminApi.send('POST', '/api/classes', {
        name: 'Lop T345',
        teacherId: teacherA.id,
        scheduleDays: [2, 3, 4],
        startsOn: '2026-08-10',
        endsOn: '2026-08-20',
        capacity: 10,
        status: 'OPEN',
      }),
      201,
    ).data as Json;
    created.classIds.push(String(classSched.id));

    await test('Từ chối điểm danh thứ không trong lịch', async () => {
      const res = await adminApi.send(
        'POST',
        `/api/classes/${classSched.id}/sessions`,
        { date: '2026-08-15' },
      );
      expectStatus(res, 400);
      expectMessage(res.body as Json, 'lịch lớp');
    });

    await test('Từ chối điểm danh trước ngày bắt đầu khóa', async () => {
      const res = await adminApi.send(
        'POST',
        `/api/classes/${classSched.id}/sessions`,
        { date: '2026-08-04' },
      );
      expectStatus(res, 400);
      expectMessage(res.body as Json, 'trở đi');
    });

    await test('Từ chối điểm danh sau ngày kết thúc khóa', async () => {
      const res = await adminApi.send(
        'POST',
        `/api/classes/${classSched.id}/sessions`,
        { date: '2026-08-25' },
      );
      expectStatus(res, 400);
      expectMessage(res.body as Json, 'không được sau');
    });

    await test('Cho phép điểm danh đúng thứ trong khoảng khóa', async () => {
      expectStatus(
        await adminApi.send('POST', `/api/classes/${classSched.id}/sessions`, {
          date: '2026-08-18',
        }),
        201,
      );
    });

    await test('Từ chối ngày kết thúc khóa trước ngày bắt đầu', async () => {
      const res = await adminApi.send('POST', '/api/classes', {
        name: 'Lop sai ngay',
        teacherId: teacherA.id,
        startsOn: '2026-08-20',
        endsOn: '2026-08-10',
        capacity: 10,
      });
      expectStatus(res, 400);
      expectMessage(res.body as Json, 'sau hoặc bằng');
    });

    const session = expectStatus(
      await adminApi.send('POST', `/api/classes/${classAtt.id}/sessions`, {
        date: '2026-08-21',
      }),
      201,
    ).data as Json;

    await test('Lưu điểm danh cả buổi', async () => {
      const body = expectStatus(
        await adminApi.send('PUT', `/api/sessions/${session.id}/attendance`, {
          records: [
            { studentId: hv1.id, status: 'PRESENT' },
            { studentId: hv2.id, status: 'ABSENT', note: 'Om' },
          ],
        }),
        200,
      );
      expectMessage(body, 'Đã lưu điểm danh');
    });

    await test('Cập nhật điểm danh đã lưu', async () => {
      expectStatus(
        await adminApi.send('PUT', `/api/sessions/${session.id}/attendance`, {
          records: [
            { studentId: hv1.id, status: 'LATE' },
            { studentId: hv2.id, status: 'PRESENT' },
          ],
        }),
        200,
      );
    });

    await test('GV A lưu điểm danh lớp mình', async () => {
      const s = expectStatus(
        await teacherAApi.send('POST', `/api/classes/${classAtt.id}/sessions`, {
          date: '2026-08-22',
        }),
        201,
      ).data as Json;
      expectStatus(
        await teacherAApi.send('PUT', `/api/sessions/${s.id}/attendance`, {
          records: [{ studentId: hv1.id, status: 'PRESENT' }],
        }),
        200,
      );
    });

    await test('GV B không lưu điểm danh lớp A', async () => {
      expectStatus(
        await teacherBApi.send('PUT', `/api/sessions/${session.id}/attendance`, {
          records: [{ studentId: hv1.id, status: 'PRESENT' }],
        }),
        403,
      );
    });

    await test('Từ chối records rỗng', async () => {
      const res = await adminApi.send(
        'PUT',
        `/api/sessions/${session.id}/attendance`,
        { records: [] },
      );
      expectStatus(res, 400);
      expectMessage(res.body as Json, 'ít nhất một học viên');
    });

    await test('Từ chối status điểm danh sai', async () => {
      expectStatus(
        await adminApi.send('PUT', `/api/sessions/${session.id}/attendance`, {
          records: [{ studentId: hv1.id, status: 'INVALID_STATUS' }],
        }),
        400,
      );
    });

    const classHist = expectStatus(
      await adminApi.send('POST', '/api/classes', {
        name: 'Lop lich su',
        teacherId: teacherA.id,
        capacity: 20,
        status: 'OPEN',
      }),
      201,
    ).data as Json;
    created.classIds.push(String(classHist.id));
    const stuA = expectStatus(
      await adminApi.send('POST', '/api/students', {
        fullName: 'HV A Rate',
        phone: '0971111111',
        status: 'STUDYING',
      }),
      201,
    ).data as Json;
    const stuB = expectStatus(
      await adminApi.send('POST', '/api/students', {
        fullName: 'HV B Rate',
        phone: '0972222222',
        status: 'STUDYING',
      }),
      201,
    ).data as Json;
    created.studentIds.push(String(stuA.id), String(stuB.id));
    expectStatus(
      await adminApi.send('POST', `/api/classes/${classHist.id}/students`, {
        studentId: stuA.id,
      }),
      201,
    );
    expectStatus(
      await adminApi.send('POST', `/api/classes/${classHist.id}/students`, {
        studentId: stuB.id,
      }),
      201,
    );

    for (let i = 1; i <= 5; i += 1) {
      const s = expectStatus(
        await adminApi.send('POST', `/api/classes/${classHist.id}/sessions`, {
          date: `2026-08-${10 + i}`,
        }),
        201,
      ).data as Json;
      expectStatus(
        await adminApi.send('PUT', `/api/sessions/${s.id}/attendance`, {
          records: [
            { studentId: stuA.id, status: i % 2 === 0 ? 'ABSENT' : 'PRESENT' },
            { studentId: stuB.id, status: 'PRESENT' },
          ],
        }),
        200,
      );
    }

    await test('Lịch sử lớp + tỷ lệ', async () => {
      const body = expectStatus(
        await adminApi.get(
          `/api/classes/${classHist.id}/attendance?from=2026-08-01&to=2026-08-31`,
        ),
        200,
      );
      const data = body.data as Json;
      const sessions = data.sessions as Json[];
      const rates = data.rates as Json[];
      if (sessions.length !== 5) throw new Error(`sessions=${sessions.length}`);
      const rateA = rates.find((row) => row.studentId === stuA.id)?.rate as Json;
      const rateB = rates.find((row) => row.studentId === stuB.id)?.rate as Json;
      if (rateA?.present !== 3) throw new Error(`HV A present=${rateA?.present}`);
      if (rateA?.percent !== 60) throw new Error(`HV A percent=${rateA?.percent}`);
      if (rateB?.present !== 5 || rateB?.percent !== 100) {
        throw new Error('HV B tỷ lệ phải 100%');
      }
    });

    await test('GV A xem lịch sử lớp mình', async () => {
      expectStatus(
        await teacherAApi.get(
          `/api/classes/${classHist.id}/attendance?from=2026-08-01&to=2026-08-31`,
        ),
        200,
      );
    });

    await test('GV B không xem lịch sử lớp A', async () => {
      expectStatus(
        await teacherBApi.get(
          `/api/classes/${classHist.id}/attendance?from=2026-08-01&to=2026-08-31`,
        ),
        403,
      );
    });

    await test('from sai định dạng → 400', async () => {
      const res = await adminApi.get(
        `/api/classes/${classHist.id}/attendance?from=invalid&to=2026-08-31`,
      );
      expectStatus(res, 400);
      expectMessage(res.body as Json, 'định dạng');
    });

    await test('Lịch sử điểm danh theo HV', async () => {
      const body = expectStatus(
        await adminApi.get(`/api/students/${stuA.id}/attendance`),
        200,
      );
      const records = (body.data as Json).records as unknown[];
      if (records.length !== 5) throw new Error(`records=${records.length}`);
    });

    await test('GV A xem điểm danh HV trong lớp mình', async () => {
      expectStatus(
        await teacherAApi.get(`/api/students/${stuA.id}/attendance`),
        200,
      );
    });

    console.log('\nTuition');
    await test('ADMIN tạo hóa đơn', async () => {
      const body = expectStatus(
        await adminApi.send('POST', '/api/tuition', {
          studentId: hv1.id,
          period: '2026-08',
          amount: 3_000_000,
          dueDate: '2026-08-31',
          note: 'HP T8',
        }),
        201,
      );
      expectMessage(body, 'Đã tạo khoản học phí');
      if ((body.data as Json).status !== 'UNPAID') throw new Error('Phải UNPAID');
      created.invoiceIds.push(String((body.data as Json).id));
    });

    await test('Trùng student+period → 409', async () => {
      const res = await adminApi.send('POST', '/api/tuition', {
        studentId: hv1.id,
        period: '2026-08',
        amount: 3_000_000,
        dueDate: '2026-08-31',
      });
      expectStatus(res, 409);
      expectMessage(res.body as Json, 'kỳ này');
    });

    await test('Period sai định dạng → 400', async () => {
      const res = await adminApi.send('POST', '/api/tuition', {
        studentId: hv1.id,
        period: '2026/08',
        amount: 1,
        dueDate: '2026-08-31',
      });
      expectStatus(res, 400);
      expectMessage(res.body as Json, 'YYYY-MM');
    });

    await test('Số tiền âm → 400', async () => {
      const res = await adminApi.send('POST', '/api/tuition', {
        studentId: hv1.id,
        period: '2026-09',
        amount: -1000,
        dueDate: '2026-09-30',
      });
      expectStatus(res, 400);
      expectMessage(res.body as Json, 'không được âm');
    });

    await test('TEACHER không tạo hóa đơn', async () => {
      expectStatus(
        await teacherAApi.send('POST', '/api/tuition', {
          studentId: hv2.id,
          period: '2026-08',
          amount: 1,
          dueDate: '2026-08-31',
        }),
        403,
      );
    });

    await test('PARENT không tạo hóa đơn', async () => {
      expectStatus(
        await parentAApi.send('POST', '/api/tuition', {
          studentId: hv2.id,
          period: '2026-08',
          amount: 1,
          dueDate: '2026-08-31',
        }),
        403,
      );
    });

    const invHv2a = expectStatus(
      await adminApi.send('POST', '/api/tuition', {
        studentId: hv2.id,
        period: '2026-08',
        amount: 2_500_000,
        dueDate: '2026-08-31',
      }),
      201,
    ).data as Json;
    const invHv2b = expectStatus(
      await adminApi.send('POST', '/api/tuition', {
        studentId: hv2.id,
        period: '2026-09',
        amount: 2_500_000,
        dueDate: '2026-09-30',
      }),
      201,
    ).data as Json;
    created.invoiceIds.push(String(invHv2a.id), String(invHv2b.id));

    await test('ADMIN list hóa đơn', async () => {
      const body = expectStatus(await adminApi.get('/api/tuition'), 200);
      if (!Array.isArray(body.data) || !(body.meta as Json)?.totalItems) {
        throw new Error('Sai envelope list');
      }
    });

    await test('Filter hóa đơn UNPAID', async () => {
      const body = expectStatus(
        await adminApi.get('/api/tuition?status=UNPAID'),
        200,
      );
      const rows = body.data as Json[];
      if (!rows.every((row) => row.status === 'UNPAID')) {
        throw new Error('Có hóa đơn không UNPAID');
      }
    });

    await test('Filter hóa đơn theo studentId', async () => {
      const body = expectStatus(
        await adminApi.get(`/api/tuition?studentId=${hv2.id}`),
        200,
      );
      const rows = body.data as Json[];
      if (!rows.every((row) => row.studentId === hv2.id)) {
        throw new Error('Lọc sai HV');
      }
    });

    await test('TEACHER không list hóa đơn', async () => {
      expectStatus(await teacherAApi.get('/api/tuition'), 403);
    });

    const invPatch = expectStatus(
      await adminApi.send('POST', '/api/tuition', {
        studentId: hv1.id,
        period: '2026-10',
        amount: 3_500_000,
        dueDate: '2026-10-31',
      }),
      201,
    ).data as Json;
    created.invoiceIds.push(String(invPatch.id));

    await test('ADMIN cập nhật hóa đơn', async () => {
      const body = expectStatus(
        await adminApi.send('PATCH', `/api/tuition/${invPatch.id}`, {
          amount: 4_000_000,
          note: 'Dieu chinh',
        }),
        200,
      );
      expectMessage(body, 'Đã cập nhật khoản học phí');
      if ((body.data as Json).amount !== 4_000_000) throw new Error('Sai amount');
    });

    await test('TEACHER không sửa hóa đơn', async () => {
      expectStatus(
        await teacherAApi.send('PATCH', `/api/tuition/${invPatch.id}`, {
          amount: 1,
        }),
        403,
      );
    });

    await test('Sửa hóa đơn không tồn tại → 404', async () => {
      expectStatus(
        await adminApi.send('PATCH', `/api/tuition/${FAKE_ID}`, { amount: 1 }),
        404,
      );
    });

    const invPay = expectStatus(
      await adminApi.send('POST', '/api/tuition', {
        studentId: hv1.id,
        period: '2026-11',
        amount: 3_000_000,
        dueDate: '2026-11-30',
      }),
      201,
    ).data as Json;
    created.invoiceIds.push(String(invPay.id));

    await test('Mark paid → PAID', async () => {
      const body = expectStatus(
        await adminApi.send('POST', `/api/tuition/${invPay.id}/mark-paid`),
        201,
      );
      expectMessage(body, 'xác nhận');
      if ((body.data as Json).status !== 'PAID') throw new Error('Chưa PAID');
    });

    await test('Mark paid lần 2 → 400', async () => {
      const res = await adminApi.send(
        'POST',
        `/api/tuition/${invPay.id}/mark-paid`,
      );
      expectStatus(res, 400);
      expectMessage(res.body as Json, 'đã được ghi nhận');
    });

    await test('TEACHER không mark-paid', async () => {
      expectStatus(
        await teacherAApi.send('POST', `/api/tuition/${invHv2b.id}/mark-paid`),
        403,
      );
    });

    const invDel = expectStatus(
      await adminApi.send('POST', '/api/tuition', {
        studentId: hv1.id,
        period: '2026-12',
        amount: 3_000_000,
        dueDate: '2026-12-31',
      }),
      201,
    ).data as Json;

    await test('ADMIN xóa hóa đơn', async () => {
      const body = expectStatus(
        await adminApi.send('DELETE', `/api/tuition/${invDel.id}`),
        200,
      );
      expectMessage(body, 'xóa');
    });

    await test('TEACHER không xóa hóa đơn', async () => {
      expectStatus(
        await teacherAApi.send('DELETE', `/api/tuition/${invHv2a.id}`),
        403,
      );
    });

    console.log('\nParent portal');
    const child1 = expectStatus(
      await adminApi.send('POST', '/api/students', {
        fullName: 'Con PH A Mot',
        phone: '0931111111',
        status: 'STUDYING',
      }),
      201,
    ).data as Json;
    const child2 = expectStatus(
      await adminApi.send('POST', '/api/students', {
        fullName: 'Con PH A Hai',
        phone: '0932222222',
        status: 'STUDYING',
      }),
      201,
    ).data as Json;
    const child3 = expectStatus(
      await adminApi.send('POST', '/api/students', {
        fullName: 'Con PH B',
        phone: '0933333333',
        status: 'STUDYING',
      }),
      201,
    ).data as Json;
    created.studentIds.push(
      String(child1.id),
      String(child2.id),
      String(child3.id),
    );
    expectStatus(
      await adminApi.send('POST', `/api/students/${child1.id}/parents`, {
        parentUserId: parentA.id,
      }),
      201,
    );
    expectStatus(
      await adminApi.send('POST', `/api/students/${child2.id}/parents`, {
        parentUserId: parentA.id,
      }),
      201,
    );
    expectStatus(
      await adminApi.send('POST', `/api/students/${child3.id}/parents`, {
        parentUserId: parentB.id,
      }),
      201,
    );

    const classParent = expectStatus(
      await adminApi.send('POST', '/api/classes', {
        name: 'Lop PH',
        teacherId: teacherA.id,
        capacity: 20,
        status: 'OPEN',
      }),
      201,
    ).data as Json;
    created.classIds.push(String(classParent.id));
    expectStatus(
      await adminApi.send('POST', `/api/classes/${classParent.id}/students`, {
        studentId: child1.id,
      }),
      201,
    );
    expectStatus(
      await adminApi.send('POST', `/api/classes/${classParent.id}/students`, {
        studentId: child2.id,
      }),
      201,
    );

    for (let i = 1; i <= 3; i += 1) {
      const s = expectStatus(
        await adminApi.send('POST', `/api/classes/${classParent.id}/sessions`, {
          date: `2026-08-${20 + i}`,
        }),
        201,
      ).data as Json;
      expectStatus(
        await adminApi.send('PUT', `/api/sessions/${s.id}/attendance`, {
          records: [
            { studentId: child1.id, status: 'PRESENT' },
            { studentId: child2.id, status: i === 2 ? 'ABSENT' : 'PRESENT' },
          ],
        }),
        200,
      );
    }

    const invChild1 = expectStatus(
      await adminApi.send('POST', '/api/tuition', {
        studentId: child1.id,
        period: '2026-08',
        amount: 3_000_000,
        dueDate: '2026-08-31',
      }),
      201,
    ).data as Json;
    const invChild2 = expectStatus(
      await adminApi.send('POST', '/api/tuition', {
        studentId: child2.id,
        period: '2026-08',
        amount: 3_000_000,
        dueDate: '2026-08-15',
      }),
      201,
    ).data as Json;
    const invChild3 = expectStatus(
      await adminApi.send('POST', '/api/tuition', {
        studentId: child3.id,
        period: '2026-08',
        amount: 2_500_000,
        dueDate: '2026-08-31',
      }),
      201,
    ).data as Json;
    created.invoiceIds.push(
      String(invChild1.id),
      String(invChild2.id),
      String(invChild3.id),
    );

    await test('PH A list đúng các con đã gắn', async () => {
      const body = expectStatus(await parentAApi.get('/api/parent/children'), 200);
      const ids = (body.data as Json[]).map((row) => row.id);
      if (!ids.includes(child1.id) || !ids.includes(child2.id)) {
        throw new Error(`Thiếu con: ${JSON.stringify(ids)}`);
      }
      if (ids.includes(child3.id)) throw new Error('Lọt con của PH B');
    });

    await test('PH B list 1 con', async () => {
      const body = expectStatus(await parentBApi.get('/api/parent/children'), 200);
      if ((body.data as Json[])[0]?.id !== child3.id) throw new Error('Sai con PH B');
    });

    await test('PH chưa gắn con → rỗng', async () => {
      const extra = await createUser(Role.PARENT, 'empty');
      const body = expectStatus(
        await authed(extra.cookie).get('/api/parent/children'),
        200,
      );
      if ((body.data as unknown[]).length !== 0) throw new Error('Phải rỗng');
    });

    await test('TEACHER không vào /parent/children', async () => {
      expectStatus(await teacherAApi.get('/api/parent/children'), 403);
    });

    await test('ADMIN không vào /parent/children', async () => {
      expectStatus(await adminApi.get('/api/parent/children'), 403);
    });

    await test('PH xem điểm danh con mình', async () => {
      const body = expectStatus(
        await parentAApi.get(`/api/parent/children/${child1.id}/attendance`),
        200,
      );
      const data = body.data as Json;
      const records = data.records as unknown[];
      const rate = data.rate as Json;
      if (records.length !== 3) throw new Error(`records=${records.length}`);
      if (rate.present !== 3 || rate.percent !== 100) {
        throw new Error(`rate=${JSON.stringify(rate)}`);
      }
      const classes = data.classes as Json[];
      if (!Array.isArray(classes) || classes.length < 1) {
        throw new Error('Thiếu classes trong điểm danh PH');
      }
      const first = classes[0];
      if (!Array.isArray(first.sessions)) {
        throw new Error('Thiếu sessions theo lớp');
      }
    });

    await test('Tỷ lệ có buổi vắng', async () => {
      const body = expectStatus(
        await parentAApi.get(`/api/parent/children/${child2.id}/attendance`),
        200,
      );
      const rate = (body.data as Json).rate as Json;
      if (rate.present !== 2 || rate.percent !== 67) {
        throw new Error(`rate=${JSON.stringify(rate)}`);
      }
    });

    await test('PH không xem con người khác', async () => {
      const res = await parentAApi.get(
        `/api/parent/children/${child3.id}/attendance`,
      );
      expectStatus(res, 403);
      expectMessage(res.body as Json, 'không có quyền');
    });

    await test('PH list hóa đơn con mình', async () => {
      const body = expectStatus(await parentAApi.get('/api/parent/invoices'), 200);
      const rows = body.data as Json[];
      if (rows.length !== 2) throw new Error(`invoices=${rows.length}`);
      if (!body.bank) throw new Error('Thiếu bank details');
    });

    await test('PH B chỉ thấy hóa đơn con B', async () => {
      const body = expectStatus(await parentBApi.get('/api/parent/invoices'), 200);
      if ((body.data as Json[])[0]?.studentId !== child3.id) {
        throw new Error('Lọt hóa đơn người khác');
      }
    });

    await test('TEACHER không xem hóa đơn parent', async () => {
      expectStatus(await teacherAApi.get('/api/parent/invoices'), 403);
    });

    await test('Reminders có khoản quá hạn', async () => {
      const body = expectStatus(await parentAApi.get('/api/parent/reminders'), 200);
      const rows = body.data as Json[];
      if (!rows.some((row) => row.overdue === true && row.studentId === child2.id)) {
        throw new Error('Thiếu reminder quá hạn child2');
      }
    });

    await test('PH báo chuyển khoản → PENDING', async () => {
      const body = expectStatus(
        await parentAApi.send(
          'POST',
          `/api/parent/invoices/${invChild1.id}/report-transfer`,
          {
            paymentProofUrl:
              'https://res.cloudinary.com/demo/image/upload/v1/dks-english-center/tuition/proofs/e2e-proof.jpg',
          },
        ),
        201,
      );
      expectMessage(body, 'báo chuyển khoản');
      if ((body.data as Json).status !== 'PENDING') throw new Error('Chưa PENDING');
      if (!(body.data as Json).paymentProofUrl) {
        throw new Error('Thiếu paymentProofUrl');
      }
    });

    await test('Báo CK thiếu minh chứng → 400', async () => {
      const unpaid = expectStatus(
        await adminApi.send('POST', '/api/tuition', {
          studentId: child1.id,
          period: '2026-11',
          amount: 1000000,
          dueDate: '2026-11-15',
        }),
        201,
      ).data as Json;
      created.invoiceIds.push(String(unpaid.id));
      const res = await parentAApi.send(
        'POST',
        `/api/parent/invoices/${unpaid.id}/report-transfer`,
        {},
      );
      expectStatus(res, 400);
    });

    await test('Báo CK URL ngoài hệ thống → 400', async () => {
      const unpaid = expectStatus(
        await adminApi.send('POST', '/api/tuition', {
          studentId: child1.id,
          period: '2026-12',
          amount: 1000000,
          dueDate: '2026-12-15',
        }),
        201,
      ).data as Json;
      created.invoiceIds.push(String(unpaid.id));
      const res = await parentAApi.send(
        'POST',
        `/api/parent/invoices/${unpaid.id}/report-transfer`,
        { paymentProofUrl: 'https://example.com/fake-proof.jpg' },
      );
      expectStatus(res, 400);
      expectMessage(res.body as Json, 'Cloudinary');
    });

    await test('Báo CK lần 2 → 400', async () => {
      const res = await parentAApi.send(
        'POST',
        `/api/parent/invoices/${invChild1.id}/report-transfer`,
        {
          paymentProofUrl:
            'https://res.cloudinary.com/demo/image/upload/v1/dks-english-center/tuition/proofs/e2e-proof-2.jpg',
        },
      );
      expectStatus(res, 400);
      expectMessage(res.body as Json, 'đã báo chuyển khoản');
    });

    await test('PENDING thiếu ảnh → cho bổ sung minh chứng', async () => {
      const unpaid = expectStatus(
        await adminApi.send('POST', '/api/tuition', {
          studentId: child1.id,
          period: '2027-01',
          amount: 1000000,
          dueDate: '2027-01-15',
        }),
        201,
      ).data as Json;
      created.invoiceIds.push(String(unpaid.id));

      await prisma.tuitionInvoice.update({
        where: { id: String(unpaid.id) },
        data: { status: 'PENDING', paymentProofUrl: null },
      });

      const body = expectStatus(
        await parentAApi.send(
          'POST',
          `/api/parent/invoices/${unpaid.id}/report-transfer`,
          {
            paymentProofUrl:
              'https://res.cloudinary.com/demo/image/upload/v1/dks-english-center/tuition/proofs/e2e-repair.jpg',
          },
        ),
        201,
      );
      expectMessage(body, 'bổ sung minh chứng');
      if (!(body.data as Json).paymentProofUrl) {
        throw new Error('Chưa lưu paymentProofUrl');
      }
    });

    await test('Không báo CK hóa đơn đã PAID', async () => {
      expectStatus(
        await adminApi.send('POST', `/api/tuition/${invChild2.id}/mark-paid`),
        201,
      );
      const res = await parentAApi.send(
        'POST',
        `/api/parent/invoices/${invChild2.id}/report-transfer`,
        {
          paymentProofUrl:
            'https://res.cloudinary.com/demo/image/upload/v1/dks-english-center/tuition/proofs/e2e-paid.jpg',
        },
      );
      expectStatus(res, 400);
      expectMessage(res.body as Json, 'đã được xác nhận');
    });

    await test('PH không báo CK hóa đơn con người khác', async () => {
      const res = await parentAApi.send(
        'POST',
        `/api/parent/invoices/${invChild3.id}/report-transfer`,
        {
          paymentProofUrl:
            'https://res.cloudinary.com/demo/image/upload/v1/dks-english-center/tuition/proofs/e2e-other.jpg',
        },
      );
      expectStatus(res, 403);
      expectMessage(res.body as Json, 'không có quyền');
    });

    await test('TEACHER không report-transfer', async () => {
      expectStatus(
        await teacherAApi.send(
          'POST',
          `/api/parent/invoices/${invChild3.id}/report-transfer`,
          {
            paymentProofUrl:
              'https://res.cloudinary.com/demo/image/upload/v1/dks-english-center/tuition/proofs/e2e-teacher.jpg',
          },
        ),
        403,
      );
    });

    console.log('\nDashboard');
    await test('ADMIN dashboard có ops stats', async () => {
      const body = expectStatus(await adminApi.get('/api/dashboard/stats'), 200);
      const ops = (body.stats as Json)?.ops as Json | undefined;
      if (!ops || typeof ops.studentsStudying !== 'number') {
        throw new Error('Thiếu stats.ops');
      }
    });

    await test('TEACHER không xem dashboard admin', async () => {
      expectStatus(await teacherAApi.get('/api/dashboard/stats'), 403);
    });
  } finally {
    console.log('\nCleanup test data...');
    try {
      const users = await prisma.user.findMany({
        where: { email: { startsWith: PREFIX } },
        select: { id: true },
      });
      const userIds = users.map((user) => user.id);
      const students = await prisma.student.findMany({
        where: { id: { in: created.studentIds } },
        select: { id: true },
      });
      const studentIds = students.map((student) => student.id);
      const classIds = created.classIds;

      if (classIds.length) {
        await prisma.attendanceRecord.deleteMany({
          where: { session: { classId: { in: classIds } } },
        });
        await prisma.classSession.deleteMany({
          where: { classId: { in: classIds } },
        });
        await prisma.enrollment.deleteMany({
          where: { classId: { in: classIds } },
        });
      }
      if (studentIds.length) {
        await prisma.tuitionInvoice.deleteMany({
          where: { studentId: { in: studentIds } },
        });
        await prisma.studentParent.deleteMany({
          where: { studentId: { in: studentIds } },
        });
        await prisma.student.deleteMany({ where: { id: { in: studentIds } } });
      }
      if (classIds.length) {
        await prisma.classGroup.deleteMany({ where: { id: { in: classIds } } });
      }
      if (userIds.length) {
        await prisma.user.deleteMany({ where: { id: { in: userIds } } });
      }
    } catch (error) {
      console.error('Cleanup lỗi:', error);
    }
    await prisma.$disconnect();
    child.kill('SIGTERM');
  }

  const passed = results.filter((item) => item.ok).length;
  const failed = results.filter((item) => !item.ok);
  console.log('\n=== Kết quả ===');
  console.log(`Total: ${results.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed.length}`);
  if (failed.length) {
    console.log('\nFailed:');
    for (const item of failed) console.log(`  - ${item.name}: ${item.error}`);
    process.exit(1);
  }
  console.log('\nTất cả testcase đã pass.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
