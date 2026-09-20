const DEFAULT_OPTIONS_KEYS = [
  { id: 'A', key: 'quiz.optionA' },
  { id: 'B', key: 'quiz.optionB', correct: true },
  { id: 'C', key: 'quiz.optionC' },
  { id: 'D', key: 'quiz.optionD' },
];

export function parseQuestionCount(lesson) {
  const source = `${lesson?.duration ?? ''} ${lesson?.meta ?? ''}`;
  const match = source.match(/(\d+)\s*questions?/i);
  return match ? Math.min(Number(match[1]), 20) : 5;
}

export function buildQuizQuestionsForLesson(lesson, t = (key) => key) {
  if (lesson?.questions?.length) return lesson.questions;

  const count = parseQuestionCount(lesson);
  const topic = lesson?.title?.trim() || t('quiz.defaultTitle');

  return Array.from({ length: count }, (_, index) => ({
    id: String(index + 1),
    question: t('quiz.questionTemplate', { topic, num: index + 1 }),
    options: DEFAULT_OPTIONS_KEYS.map((option) => ({
      id: option.id,
      text: t(option.key),
      ...(option.correct ? { correct: true } : {}),
    })),
    explanation: t('quiz.explanationTemplate', { topic }),
  }));
}
