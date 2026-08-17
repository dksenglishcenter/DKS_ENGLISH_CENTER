import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ExamAttempt,
  ExamSkill,
  Prisma,
} from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
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
   * Start (or resume) an attempt. Reuses an in-progress attempt so a refresh
   * keeps the same server-side clock rather than restarting the timer.
   */
  async startAttempt(testId: string, userId: string) {
    const test = await this.prisma.examTest.findFirst({
      where: { id: testId, isPublished: true },
      select: { id: true, durationMinutes: true },
    });
    if (!test) throw new NotFoundException('Không tìm thấy đề thi.');

    const attempt =
      (await this.prisma.examAttempt.findFirst({
        where: { testId, userId, status: 'IN_PROGRESS' },
        orderBy: { startedAt: 'desc' },
      })) ??
      (await this.prisma.examAttempt.create({ data: { testId, userId } }));

    return this.withTiming(attempt, test.durationMinutes);
  }

  /** Autosave: upsert each answer by (attempt, question). */
  async saveAnswers(
    attemptId: string,
    userId: string,
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
  async submit(attemptId: string, userId: string) {
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
  async getResult(attemptId: string, userId: string) {
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
    userId: string,
  ): Promise<ExamAttempt> {
    const attempt = await this.prisma.examAttempt.findUnique({
      where: { id: attemptId },
    });
    if (!attempt) throw new NotFoundException('Không tìm thấy lượt thi.');
    if (attempt.userId !== userId) {
      throw new ForbiddenException('Đây không phải lượt thi của bạn.');
    }
    return attempt;
  }
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
