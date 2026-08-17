import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ExamAttempt,
  ExamQuestionType,
  ExamSkill,
  Prisma,
} from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ImportTestDto } from './dto/import-test.dto';
import { AnswerKeyItem, QuestionType, gradeTest } from './grading/grading';

/** Answers are hidden while taking; only these fields go to the client. */
const TAKING_QUESTION_SELECT = {
  id: true,
  no: true,
  prompt: true,
  options: true,
} satisfies Prisma.ExamQuestionSelect;

@Injectable()
export class MockTestService {
  constructor(private readonly prisma: PrismaService) {}

  /** Published tests, summary only, for the library screen. */
  listTests() {
    return this.prisma.examTest.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        code: true,
        title: true,
        skill: true,
        module: true,
        durationMinutes: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── Authoring (teacher / admin) ───────────────────────────────────────

  /** Every test with a question count, for the admin list. */
  async listAllForAdmin() {
    const tests = await this.prisma.examTest.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        code: true,
        title: true,
        skill: true,
        durationMinutes: true,
        isPublished: true,
        audioUrl: true,
        createdAt: true,
      },
    });
    return Promise.all(
      tests.map(async (t) => ({
        ...t,
        questionCount: await this.prisma.examQuestion.count({
          where: { group: { section: { testId: t.id } } },
        }),
      })),
    );
  }

  /** Create a whole test from an imported payload. */
  async importTest(dto: ImportTestDto) {
    const data = buildTestCreateInput(dto);
    try {
      const created = await this.prisma.examTest.create({
        data,
        select: { id: true, code: true, title: true },
      });
      return created;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(`Mã đề "${dto.code}" đã tồn tại.`);
      }
      throw error;
    }
  }

  async setPublished(id: string, isPublished: boolean) {
    await this.ensureTestExists(id);
    return this.prisma.examTest.update({
      where: { id },
      data: { isPublished },
      select: { id: true, isPublished: true },
    });
  }

  async setAudio(id: string, audioUrl: string | null) {
    await this.ensureTestExists(id);
    return this.prisma.examTest.update({
      where: { id },
      data: { audioUrl: audioUrl || null },
      select: { id: true, audioUrl: true },
    });
  }

  async remove(id: string) {
    await this.ensureTestExists(id);
    await this.prisma.examTest.delete({ where: { id } });
    return { message: 'Đã xóa đề thi.' };
  }

  private async ensureTestExists(id: string) {
    const test = await this.prisma.examTest.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!test) throw new NotFoundException('Không tìm thấy đề thi.');
  }

  // ── Student flow ──────────────────────────────────────────────────────

  /** Full test content to render the paper — WITHOUT the answer key. */
  async getTestForTaking(id: string) {
    const test = await this.prisma.examTest.findFirst({
      where: { id, isPublished: true },
      include: {
        sections: {
          orderBy: { order: 'asc' },
          include: {
            groups: {
              orderBy: { order: 'asc' },
              include: {
                questions: {
                  orderBy: { no: 'asc' },
                  select: TAKING_QUESTION_SELECT,
                },
              },
            },
          },
        },
      },
    });
    if (!test) throw new NotFoundException('Không tìm thấy đề thi.');
    return test;
  }

  /**
   * Start (or resume) an attempt. Taking a test needs no login — an anonymous
   * attempt has no userId and is reached only via its (unguessable) id. A
   * logged-in user resumes their in-progress attempt so a refresh keeps the
   * same server-side clock rather than restarting the timer.
   */
  async startAttempt(testId: string, userId: string | null) {
    const test = await this.prisma.examTest.findFirst({
      where: { id: testId, isPublished: true },
      select: { id: true, durationMinutes: true },
    });
    if (!test) throw new NotFoundException('Không tìm thấy đề thi.');

    const existing = userId
      ? await this.prisma.examAttempt.findFirst({
          where: { testId, userId, status: 'IN_PROGRESS' },
          orderBy: { startedAt: 'desc' },
        })
      : null;
    const attempt =
      existing ??
      (await this.prisma.examAttempt.create({ data: { testId, userId } }));

    return this.withTiming(attempt, test.durationMinutes);
  }

  /** Autosave: upsert each answer by (attempt, question). */
  async saveAnswers(
    attemptId: string,
    userId: string | null,
    answers: { questionId: string; value?: string }[],
  ) {
    const attempt = await this.getOwnedAttempt(attemptId, userId);
    if (attempt.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Bài đã nộp, không thể sửa.');
    }

    await this.prisma.$transaction(
      answers.map((a) =>
        this.prisma.examAttemptAnswer.upsert({
          where: {
            attemptId_questionId: { attemptId, questionId: a.questionId },
          },
          create: { attemptId, questionId: a.questionId, value: a.value ?? null },
          update: { value: a.value ?? null },
        }),
      ),
    );

    return { saved: answers.length };
  }

  /** Submit and auto-grade a Listening/Reading paper. Idempotent once graded. */
  async submit(attemptId: string, userId: string | null) {
    const attempt = await this.getOwnedAttempt(attemptId, userId);
    if (attempt.status !== 'IN_PROGRESS') {
      return this.getResult(attemptId, userId);
    }

    const test = await this.prisma.examTest.findUnique({
      where: { id: attempt.testId },
      include: {
        sections: { include: { groups: { include: { questions: true } } } },
      },
    });
    if (!test) throw new NotFoundException('Không tìm thấy đề thi.');

    if (test.skill !== ExamSkill.LISTENING && test.skill !== ExamSkill.READING) {
      throw new BadRequestException(
        'Writing/Speaking do giáo viên chấm — chưa hỗ trợ nộp tự động ở bước này.',
      );
    }

    // Flatten questions and carry the group's type down to each question.
    const questions = test.sections.flatMap((s) =>
      s.groups.flatMap((g) =>
        g.questions.map((q) => ({ ...q, type: g.type })),
      ),
    );
    const qidByNo = new Map(questions.map((q) => [q.no, q.id]));

    const saved = await this.prisma.examAttemptAnswer.findMany({
      where: { attemptId },
    });
    const valueByQid = new Map(saved.map((a) => [a.questionId, a.value]));

    const key: AnswerKeyItem[] = questions.map((q) => ({
      no: q.no,
      type: q.type.toLowerCase() as QuestionType,
      correct: q.correctAnswers,
    }));
    const answersByNo: Record<number, string | null> = {};
    for (const q of questions) {
      answersByNo[q.no] = valueByQid.get(q.id) ?? null;
    }

    const result = gradeTest(answersByNo, key);

    // Persist per-question correctness + the raw score in one transaction.
    await this.prisma.$transaction([
      ...result.items.map((item) => {
        const questionId = qidByNo.get(item.no)!;
        return this.prisma.examAttemptAnswer.upsert({
          where: { attemptId_questionId: { attemptId, questionId } },
          create: {
            attemptId,
            questionId,
            value: valueByQid.get(questionId) ?? null,
            isCorrect: item.correct,
          },
          update: { isCorrect: item.correct },
        });
      }),
      this.prisma.examAttempt.update({
        where: { id: attemptId },
        data: {
          status: 'GRADED',
          submittedAt: new Date(),
          rawScore: result.correctCount,
          band: bandFromScale(test.bandScale, result.correctCount),
        },
      }),
    ]);

    return this.getResult(attemptId, userId);
  }

  /** Result + review: the paper with answers revealed and the student's marks. */
  async getResult(attemptId: string, userId: string | null) {
    const attempt = await this.getOwnedAttempt(attemptId, userId);

    const test = await this.prisma.examTest.findUnique({
      where: { id: attempt.testId },
      include: {
        sections: {
          orderBy: { order: 'asc' },
          include: {
            groups: {
              orderBy: { order: 'asc' },
              include: { questions: { orderBy: { no: 'asc' } } },
            },
          },
        },
      },
    });
    if (!test) throw new NotFoundException('Không tìm thấy đề thi.');

    const answers = await this.prisma.examAttemptAnswer.findMany({
      where: { attemptId },
    });
    const total = test.sections.reduce(
      (n, s) => n + s.groups.reduce((m, g) => m + g.questions.length, 0),
      0,
    );

    return {
      attempt: {
        id: attempt.id,
        status: attempt.status,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
        rawScore: attempt.rawScore,
        band: attempt.band,
        total,
      },
      test,
      answers: answers.map((a) => ({
        questionId: a.questionId,
        value: a.value,
        isCorrect: a.isCorrect,
      })),
    };
  }

  /**
   * State of an in-progress attempt so the client can resume after a refresh:
   * the timer (from the original startedAt) and the saved answers. The answer
   * key is NOT included — that would leak answers before submitting.
   */
  async getAttemptState(attemptId: string) {
    const attempt = await this.prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: { test: { select: { durationMinutes: true } } },
    });
    if (!attempt) throw new NotFoundException('Không tìm thấy lượt thi.');

    const answers = await this.prisma.examAttemptAnswer.findMany({
      where: { attemptId },
      select: { questionId: true, value: true },
    });

    return {
      attempt: {
        ...this.withTiming(attempt, attempt.test.durationMinutes),
        testId: attempt.testId,
      },
      answers,
    };
  }

  private withTiming(attempt: ExamAttempt, durationMinutes: number) {
    const endsAt = new Date(
      attempt.startedAt.getTime() + durationMinutes * 60_000,
    );
    return {
      id: attempt.id,
      status: attempt.status,
      startedAt: attempt.startedAt,
      endsAt,
      durationMinutes,
    };
  }

  private async getOwnedAttempt(
    attemptId: string,
    userId: string | null,
  ): Promise<ExamAttempt> {
    const attempt = await this.prisma.examAttempt.findUnique({
      where: { id: attemptId },
    });
    if (!attempt) throw new NotFoundException('Không tìm thấy lượt thi.');
    // Anonymous attempts (no owner) are reached by holding the id. Only block
    // when the attempt has an owner and a different user is asking.
    if (attempt.userId && userId && attempt.userId !== userId) {
      throw new ForbiddenException('Đây không phải lượt thi của bạn.');
    }
    return attempt;
  }
}

// ── Import mapping (payload → Prisma nested create) ─────────────────────

type Dict = Record<string, unknown>;

function asObject(value: unknown, field: string): Dict {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new BadRequestException(`${field} phải là một đối tượng.`);
  }
  return value as Dict;
}
function asArray(value: unknown, field: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new BadRequestException(`${field} phải là một mảng.`);
  }
  return value;
}
function optText(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}
function reqText(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new BadRequestException(`${field} là bắt buộc.`);
  }
  return value;
}
function optJson(value: unknown): Prisma.InputJsonValue | undefined {
  return value == null ? undefined : (value as Prisma.InputJsonValue);
}
function requireEnum<T extends string>(
  allowed: Record<string, T>,
  value: unknown,
  field: string,
): T {
  const upper = String(value ?? '').toUpperCase();
  const values = Object.values(allowed) as string[];
  if (!values.includes(upper)) {
    throw new BadRequestException(
      `${field} không hợp lệ: "${String(value)}". Cho phép: ${values.join(', ')}.`,
    );
  }
  return upper as T;
}

function buildTestCreateInput(dto: ImportTestDto): Prisma.ExamTestCreateInput {
  const skill = requireEnum(ExamSkill, dto.skill, 'skill');
  const sections = asArray(dto.sections, 'sections');
  if (sections.length === 0) {
    throw new BadRequestException('Đề cần ít nhất 1 phần (section).');
  }

  return {
    code: dto.code.trim(),
    title: dto.title.trim(),
    skill,
    module: optText(dto.module),
    durationMinutes: dto.durationMinutes,
    audioUrl: optText(dto.audioUrl),
    playOnce: dto.playOnce === undefined ? true : Boolean(dto.playOnce),
    source: optText(dto.source),
    bandScale: optJson(dto.bandScale),
    isPublished: false,
    sections: {
      create: sections.map((raw, si) => {
        const s = asObject(raw, `sections[${si}]`);
        const groups = asArray(s.groups, `sections[${si}].groups`);
        return {
          order: typeof s.order === 'number' ? s.order : si,
          heading: optText(s.heading),
          passageText: optText(s.passageText),
          transcript: optText(s.transcript),
          context: optText(s.context),
          groups: {
            create: groups.map((rawGroup, gi) => {
              const g = asObject(rawGroup, `sections[${si}].groups[${gi}]`);
              const label = `sections[${si}].groups[${gi}]`;
              const questions = asArray(g.questions, `${label}.questions`);
              return {
                order: typeof g.order === 'number' ? g.order : gi,
                type: requireEnum(ExamQuestionType, g.type, `${label}.type`),
                instruction: reqText(g.instruction, `${label}.instruction`),
                options: optJson(g.options),
                maxWords:
                  g.maxWords == null ? null : Number(g.maxWords) || null,
                questions: {
                  create: questions.map((rawQ, qi) => {
                    const q = asObject(rawQ, `${label}.questions[${qi}]`);
                    const no = Number(q.no);
                    if (!Number.isInteger(no) || no < 1) {
                      throw new BadRequestException(
                        `${label}.questions[${qi}] thiếu số câu "no" hợp lệ.`,
                      );
                    }
                    // Accept "correctAnswers" or the shorter "answer" alias.
                    const raw = q.correctAnswers ?? q.answer;
                    const correctAnswers = Array.isArray(raw)
                      ? raw.map((x) => String(x))
                      : raw == null || raw === ''
                        ? []
                        : [String(raw)];
                    return {
                      no,
                      prompt: optText(q.prompt) ?? '',
                      options: optJson(q.options),
                      correctAnswers,
                      explanation: optText(q.explanation),
                    };
                  }),
                },
              };
            }),
          },
        };
      }),
    },
  };
}

/** Map a raw score to a band using the test's { "40": "9.0", ... } table. */
function bandFromScale(
  bandScale: Prisma.JsonValue | null,
  rawScore: number,
): string | null {
  if (!bandScale || typeof bandScale !== 'object' || Array.isArray(bandScale)) {
    return null;
  }
  const value = (bandScale as Record<string, unknown>)[String(rawScore)];
  return typeof value === 'string' ? value : null;
}
