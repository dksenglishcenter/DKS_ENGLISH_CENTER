export type ExamSkill = "LISTENING" | "READING" | "WRITING" | "SPEAKING";

export type ExamQuestionType =
  | "MULTIPLE_CHOICE"
  | "TRUE_FALSE_NOTGIVEN"
  | "YES_NO_NOTGIVEN"
  | "MATCHING"
  | "CLASSIFICATION"
  | "MATCHING_PARAGRAPH"
  | "NOTE_COMPLETION"
  | "TABLE_COMPLETION"
  | "SUMMARY_COMPLETION"
  | "SENTENCE_COMPLETION";

/** Options are a letter→label map (A/B/C…) or a list of labels, or none. */
export type QuestionOptions = Record<string, string> | string[] | null;

export type ExamQuestion = {
  id: string;
  no: number;
  prompt: string;
  options: QuestionOptions;
  /** Revealed only in the result payload. */
  correctAnswers?: string[];
  explanation?: string | null;
};

export type ExamQuestionGroup = {
  id: string;
  order: number;
  type: ExamQuestionType;
  instruction: string;
  options: QuestionOptions;
  maxWords: number | null;
  questions: ExamQuestion[];
};

export type ExamSection = {
  id: string;
  order: number;
  heading: string | null;
  passageText: string | null;
  transcript: string | null;
  context: string | null;
  groups: ExamQuestionGroup[];
};

export type ExamTest = {
  id: string;
  code: string;
  title: string;
  skill: ExamSkill;
  module: string | null;
  durationMinutes: number;
  audioUrl: string | null;
  playOnce: boolean;
  sections: ExamSection[];
};

export type ExamTestSummary = {
  id: string;
  code: string;
  title: string;
  skill: ExamSkill;
  module: string | null;
  durationMinutes: number;
};

export type ExamAttempt = {
  id: string;
  status: "IN_PROGRESS" | "SUBMITTED" | "GRADED";
  startedAt: string;
  endsAt: string;
  durationMinutes: number;
};

export type AttemptAnswer = {
  questionId: string;
  value: string | null;
  isCorrect: boolean | null;
};

export type AttemptState = {
  attempt: ExamAttempt & { testId: string };
  answers: { questionId: string; value: string | null }[];
};

export type WritingSubmission = {
  id: string;
  responseText: string;
  status: "PENDING" | "GRADED";
  band: string | null;
  feedback: string | null;
  sampleAnswer: string | null;
} | null;

export type SpeakingSubmission = {
  id: string;
  audioUrl: string;
  status: "PENDING" | "GRADED";
  band: string | null;
  feedback: string | null;
} | null;

export type AttemptResult = {
  attempt: {
    id: string;
    status: string;
    startedAt: string;
    submittedAt: string | null;
    rawScore: number | null;
    band: string | null;
    total: number;
  };
  test: ExamTest;
  answers: AttemptAnswer[];
  writing: WritingSubmission;
  speaking: SpeakingSubmission;
};
