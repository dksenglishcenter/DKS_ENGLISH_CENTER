import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Prisma, Role } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateUserDto,
  ListUsersQueryDto,
  UpdateUserDto,
} from './dto/user.dto';

const BCRYPT_ROUNDS = 12;

const USER_SELECT = {
  id: true,
  email: true,
  fullName: true,
  phone: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListUsersQueryDto) {
    const search = query.search?.trim();
    const where: Prisma.UserWhereInput = {
      ...(query.role ? { role: query.role } : {}),
      ...(search
        ? {
            OR: [
              { fullName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search } },
            ],
          }
        : {}),
    };

    const [totalItems, data] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        select: USER_SELECT,
      }),
    ]);

    return {
      data,
      meta: {
        totalItems,
        totalPages: Math.ceil(totalItems / query.pageSize),
        currentPage: query.page,
        pageSize: query.pageSize,
      },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: USER_SELECT,
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản.');
    }

    return { data: user };
  }

  async create(dto: CreateUserDto) {
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          fullName: this.normalizeName(dto.fullName),
          phone: dto.phone ?? null,
          passwordHash,
          role: dto.role,
        },
        select: USER_SELECT,
      });

      return { message: 'Đã tạo tài khoản.', data: user };
    } catch (error: unknown) {
      this.throwIfEmailConflict(error);
      throw error;
    }
  }

  async update(id: string, actorId: string, dto: UpdateUserDto) {
    if (Object.values(dto).every((value) => value === undefined)) {
      throw new BadRequestException('Cần cung cấp ít nhất một trường để cập nhật.');
    }

    const existing = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    });
    if (!existing) {
      throw new NotFoundException('Không tìm thấy tài khoản cần cập nhật.');
    }

    if (id === actorId && dto.role !== undefined && dto.role !== existing.role) {
      throw new ForbiddenException('Bạn không thể tự thay đổi quyền của mình.');
    }

    if (existing.role === Role.ADMIN && dto.role === Role.USER) {
      await this.ensureAnotherAdminExists(id);
    }

    const passwordHash = dto.password
      ? await bcrypt.hash(dto.password, BCRYPT_ROUNDS)
      : undefined;

    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          ...(dto.email !== undefined ? { email: dto.email } : {}),
          ...(dto.fullName !== undefined
            ? { fullName: this.normalizeName(dto.fullName) }
            : {}),
          ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
          ...(dto.role !== undefined ? { role: dto.role } : {}),
          ...(passwordHash !== undefined ? { passwordHash } : {}),
        },
        select: USER_SELECT,
      });

      return { message: 'Đã cập nhật tài khoản.', data: user };
    } catch (error: unknown) {
      this.throwIfEmailConflict(error);
      if (this.isRecordNotFound(error)) {
        throw new NotFoundException('Không tìm thấy tài khoản cần cập nhật.');
      }
      throw error;
    }
  }

  async remove(id: string, actorId: string) {
    if (id === actorId) {
      throw new ForbiddenException('Bạn không thể tự xóa tài khoản đang đăng nhập.');
    }

    const existing = await this.prisma.user.findUnique({
      where: { id },
      select: { role: true },
    });
    if (!existing) {
      throw new NotFoundException('Không tìm thấy tài khoản cần xóa.');
    }

    if (existing.role === Role.ADMIN) {
      await this.ensureAnotherAdminExists(id);
    }

    try {
      await this.prisma.user.delete({ where: { id } });
      return { message: 'Đã xóa tài khoản.' };
    } catch (error: unknown) {
      if (this.isRecordNotFound(error)) {
        throw new NotFoundException('Không tìm thấy tài khoản cần xóa.');
      }
      throw error;
    }
  }

  private normalizeName(value: string) {
    return value.trim().replace(/\s+/g, ' ');
  }

  private async ensureAnotherAdminExists(excludedId: string) {
    const otherAdmins = await this.prisma.user.count({
      where: { role: Role.ADMIN, id: { not: excludedId } },
    });
    if (otherAdmins === 0) {
      throw new BadRequestException(
        'Hệ thống phải còn ít nhất một tài khoản ADMIN.',
      );
    }
  }

  private throwIfEmailConflict(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('Email đã được sử dụng.');
    }
  }

  private isRecordNotFound(error: unknown) {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    );
  }
}
