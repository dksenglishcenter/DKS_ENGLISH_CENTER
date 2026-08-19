import {
  AnswerKeyItem,
  gradeOne,
  gradeTest,
  isCompletion,
  normalizeText,
} from './grading';

describe('normalizeText', () => {
  it('trims, lowercases and collapses inner spaces', () => {
    expect(normalizeText('  Central   Street ')).toBe('central street');
  });

  it('drops a single trailing full stop', () => {
    expect(normalizeText('roses.')).toBe('roses');
  });
});

describe('isCompletion', () => {
  it('separates gap-fill types from choice types', () => {
    expect(isCompletion('sentence_completion')).toBe(true);
    expect(isCompletion('multiple_choice')).toBe(false);
  });
});

describe('gradeOne — choice questions', () => {
  const mcq: AnswerKeyItem = { no: 8, type: 'multiple_choice', correct: 'C' };

  it('accepts the right letter regardless of case', () => {
    expect(gradeOne('C', mcq)).toBe(true);
    expect(gradeOne('c', mcq)).toBe(true);
  });

  it('rejects the wrong letter', () => {
    expect(gradeOne('B', mcq)).toBe(false);
  });

  it('matches TRUE/FALSE/NOT GIVEN case-insensitively', () => {
    const tfng: AnswerKeyItem = {
      no: 1,
      type: 'true_false_notgiven',
      correct: 'NOT GIVEN',
    };
    expect(gradeOne('not given', tfng)).toBe(true);
    expect(gradeOne('TRUE', tfng)).toBe(false);
  });
});

describe('gradeOne — gap-fill questions', () => {
  const gap: AnswerKeyItem = {
    no: 3,
    type: 'note_completion',
    correct: ['Central Street', 'Central St'],
  };

  it('accepts any listed variant, any case, extra spaces', () => {
    expect(gradeOne('central street', gap)).toBe(true);
    expect(gradeOne('  Central   St ', gap)).toBe(true);
    expect(gradeOne('Central Street.', gap)).toBe(true);
  });

  it('rejects a misspelling (IELTS needs correct spelling)', () => {
    expect(gradeOne('Centrel Street', gap)).toBe(false);
  });

  it('accepts a single-string key too', () => {
    const one: AnswerKeyItem = {
      no: 9,
      type: 'table_completion',
      correct: 'commuter',
    };
    expect(gradeOne('Commuter', one)).toBe(true);
  });
});

describe('gradeOne — blanks', () => {
  const key: AnswerKeyItem = { no: 1, type: 'multiple_choice', correct: 'A' };

  it('marks missing or empty answers wrong', () => {
    expect(gradeOne(null, key)).toBe(false);
    expect(gradeOne(undefined, key)).toBe(false);
    expect(gradeOne('   ', key)).toBe(false);
  });
});

describe('gradeTest', () => {
  const key: AnswerKeyItem[] = [
    { no: 1, type: 'true_false_notgiven', correct: 'FALSE' },
    { no: 2, type: 'multiple_choice', correct: 'C' },
    { no: 3, type: 'note_completion', correct: ['9.30', '9.30 am'] },
    { no: 4, type: 'sentence_completion', correct: ['brain dead'] },
  ];

  it('counts correct answers and marks unanswered as wrong', () => {
    const result = gradeTest(
      { 1: 'false', 2: 'C', 3: '9.30 am' /* 4 unanswered */ },
      key,
    );

    expect(result.total).toBe(4);
    expect(result.correctCount).toBe(3);
    expect(result.items.find((i) => i.no === 4)?.correct).toBe(false);
    expect(result.items.find((i) => i.no === 4)?.given).toBeNull();
  });

  it('returns a full breakdown for review', () => {
    const result = gradeTest({ 1: 'TRUE', 2: 'C', 3: 'wrong', 4: 'brain dead' }, key);
    expect(result.correctCount).toBe(2);
    expect(result.items).toHaveLength(4);
    expect(result.items[3].expected).toEqual(['brain dead']);
  });
});
