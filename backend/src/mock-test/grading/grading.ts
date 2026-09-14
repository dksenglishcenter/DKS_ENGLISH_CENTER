/**
 * Auto-grading for Listening & Reading answers.
 *
 * Kept as a pure module (no Nest, no DB) so it is easy to test and reuse.
 * Grading runs on the server only — never trust a score sent by the client.
 */

/** Types whose answer is a single letter/label chosen from fixed options. */
export type ChoiceType =
  | 'multiple_choice'
  | 'true_false_notgiven'
  | 'yes_no_notgiven'
  | 'matching'
  | 'classification'
  | 'matching_paragraph';

/** Types where the student types words into a gap. */
export type CompletionType =
  | 'note_completion'
  | 'table_completion'
  | 'summary_completion'
  | 'sentence_completion';

export type QuestionType = ChoiceType | CompletionType;

const COMPLETION_TYPES: ReadonlySet<string> = new Set<CompletionType>([
  'note_completion',
  'table_completion',
  'summary_completion',
  'sentence_completion',
]);

export function isCompletion(type: QuestionType): boolean {
  return COMPLETION_TYPES.has(type);
}

/** One question's marking info, flattened out of the test structure. */
export type AnswerKeyItem = {
  no: number;
  type: QuestionType;
  /** Choice types: one label. Completion: every accepted spelling/variant. */
  correct: string | string[];
};

export type GradedItem = {
  no: number;
  correct: boolean;
  given: string | null;
  expected: string[];
};

export type GradeResult = {
  correctCount: number;
  total: number;
  items: GradedItem[];
};

/**
 * Normalise a gap-fill answer for comparison: trim, lowercase, collapse inner
 * spaces and drop a trailing full stop. Spelling itself is kept — IELTS needs
 * correct spelling, so accepted spellings must be listed on the key instead.
 */
export function normalizeText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/\.$/, '');
}

function asList(value: string | string[]): string[] {
  return Array.isArray(value) ? value : [value];
}

/** Grade a single answer against its key. Blank/missing is always wrong. */
export function gradeOne(
  given: string | null | undefined,
  key: AnswerKeyItem,
): boolean {
  if (given == null || given.trim() === '') return false;

  if (isCompletion(key.type)) {
    const answer = normalizeText(given);
    return asList(key.correct).some((v) => normalizeText(v) === answer);
  }

  // Choice types: compare the chosen label case-insensitively.
  const chosen = normalizeText(given);
  return asList(key.correct).some((v) => normalizeText(v) === chosen);
}

/**
 * Grade a whole paper. `answers` maps question number → the student's answer.
 * Every question in `key` is marked, so unanswered questions score zero.
 */
export function gradeTest(
  answers: Record<number, string | null | undefined>,
  key: AnswerKeyItem[],
): GradeResult {
  const items = key.map((item): GradedItem => {
    const given = answers[item.no] ?? null;
    return {
      no: item.no,
      correct: gradeOne(given, item),
      given,
      expected: asList(item.correct),
    };
  });

  return {
    correctCount: items.filter((i) => i.correct).length,
    total: items.length,
    items,
  };
}
