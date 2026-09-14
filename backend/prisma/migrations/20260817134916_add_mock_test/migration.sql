-- CreateEnum
CREATE TYPE "ExamSkill" AS ENUM ('LISTENING', 'READING', 'WRITING', 'SPEAKING');

-- CreateEnum
CREATE TYPE "ExamQuestionType" AS ENUM ('MULTIPLE_CHOICE', 'TRUE_FALSE_NOTGIVEN', 'YES_NO_NOTGIVEN', 'MATCHING', 'CLASSIFICATION', 'MATCHING_PARAGRAPH', 'NOTE_COMPLETION', 'TABLE_COMPLETION', 'SUMMARY_COMPLETION', 'SENTENCE_COMPLETION');

-- CreateEnum
CREATE TYPE "ExamAttemptStatus" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'GRADED');

-- CreateEnum
CREATE TYPE "ExamGradingStatus" AS ENUM ('PENDING', 'GRADED');


-- CreateTable
CREATE TABLE "exam_tests" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "skill" "ExamSkill" NOT NULL,
    "module" TEXT,
    "duration_minutes" INTEGER NOT NULL,
    "audio_url" TEXT,
    "play_once" BOOLEAN NOT NULL DEFAULT true,
    "source" TEXT,
    "band_scale" JSONB,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_sections" (
    "id" TEXT NOT NULL,
    "test_id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "heading" TEXT,
    "passage_text" TEXT,
    "transcript" TEXT,
    "context" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_question_groups" (
    "id" TEXT NOT NULL,
    "section_id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "type" "ExamQuestionType" NOT NULL,
    "instruction" TEXT NOT NULL,
    "options" JSONB,
    "max_words" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_question_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_questions" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "no" INTEGER NOT NULL,
    "prompt" TEXT NOT NULL,
    "options" JSONB,
    "correct_answers" TEXT[],
    "explanation" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_attempts" (
    "id" TEXT NOT NULL,
    "test_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "ExamAttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submitted_at" TIMESTAMP(3),
    "raw_score" INTEGER,
    "band" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_attempt_answers" (
    "id" TEXT NOT NULL,
    "attempt_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "value" TEXT,
    "is_correct" BOOLEAN,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_attempt_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_writing_submissions" (
    "id" TEXT NOT NULL,
    "attempt_id" TEXT NOT NULL,
    "response_text" TEXT NOT NULL,
    "status" "ExamGradingStatus" NOT NULL DEFAULT 'PENDING',
    "band" TEXT,
    "feedback" TEXT,
    "sample_answer" TEXT,
    "graded_by_id" TEXT,
    "graded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_writing_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_speaking_submissions" (
    "id" TEXT NOT NULL,
    "attempt_id" TEXT NOT NULL,
    "audio_url" TEXT NOT NULL,
    "status" "ExamGradingStatus" NOT NULL DEFAULT 'PENDING',
    "band" TEXT,
    "feedback" TEXT,
    "graded_by_id" TEXT,
    "graded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_speaking_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "exam_tests_code_key" ON "exam_tests"("code");

-- CreateIndex
CREATE INDEX "exam_tests_skill_idx" ON "exam_tests"("skill");

-- CreateIndex
CREATE INDEX "exam_sections_test_id_idx" ON "exam_sections"("test_id");

-- CreateIndex
CREATE INDEX "exam_question_groups_section_id_idx" ON "exam_question_groups"("section_id");

-- CreateIndex
CREATE INDEX "exam_questions_group_id_idx" ON "exam_questions"("group_id");

-- CreateIndex
CREATE INDEX "exam_attempts_user_id_idx" ON "exam_attempts"("user_id");

-- CreateIndex
CREATE INDEX "exam_attempts_test_id_idx" ON "exam_attempts"("test_id");

-- CreateIndex
CREATE UNIQUE INDEX "exam_attempt_answers_attempt_id_question_id_key" ON "exam_attempt_answers"("attempt_id", "question_id");

-- CreateIndex
CREATE UNIQUE INDEX "exam_writing_submissions_attempt_id_key" ON "exam_writing_submissions"("attempt_id");

-- CreateIndex
CREATE INDEX "exam_writing_submissions_status_idx" ON "exam_writing_submissions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "exam_speaking_submissions_attempt_id_key" ON "exam_speaking_submissions"("attempt_id");

-- CreateIndex
CREATE INDEX "exam_speaking_submissions_status_idx" ON "exam_speaking_submissions"("status");

-- AddForeignKey
ALTER TABLE "exam_sections" ADD CONSTRAINT "exam_sections_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "exam_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_question_groups" ADD CONSTRAINT "exam_question_groups_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "exam_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_questions" ADD CONSTRAINT "exam_questions_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "exam_question_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_attempts" ADD CONSTRAINT "exam_attempts_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "exam_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_attempts" ADD CONSTRAINT "exam_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_attempt_answers" ADD CONSTRAINT "exam_attempt_answers_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "exam_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_attempt_answers" ADD CONSTRAINT "exam_attempt_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "exam_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_writing_submissions" ADD CONSTRAINT "exam_writing_submissions_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "exam_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_writing_submissions" ADD CONSTRAINT "exam_writing_submissions_graded_by_id_fkey" FOREIGN KEY ("graded_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_speaking_submissions" ADD CONSTRAINT "exam_speaking_submissions_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "exam_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_speaking_submissions" ADD CONSTRAINT "exam_speaking_submissions_graded_by_id_fkey" FOREIGN KEY ("graded_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

