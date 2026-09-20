export const videoLesson = {
  id: 1,
  title: 'What is Trauma?',
  unitLabel: 'Unit 7 • Subunit 1 of 5',
  duration: '12:45',
  currentTime: '0:15',
  progress: 12,
  about:
    'Explore the definition of trauma, how it differs from everyday stress, and why understanding trauma is essential for effective coaching.',
  keyPoints: [
    'Trauma is an emotional response to a deeply distressing event',
    'It can affect mind, body, and relationships over time',
    'Not all difficult experiences are traumatic',
    'Trauma-informed care prioritizes safety and choice',
  ],
};

export const audioLesson = {
  id: 3,
  title: 'Trauma and the Brain',
  unitLabel: 'Unit 7 • Subunit 3 of 5',
  description: 'Understanding how trauma impacts the brain and nervous system.',
  currentTime: '05:32',
  duration: '16:45',
  progress: 33,
  speed: '1.0x',
  upNext: {
    title: 'Healing Pathways',
    subunit: 'Subunit 4 of 5',
    duration: '20:15',
  },
};

export const quizData = {
  title: 'Unit 7 Test',
  subtitle: 'Question 3 of 20',
  progress: 15,
  question: 'Which of the following is a common response to trauma?',
  options: [
    { id: 'A', text: 'Immediate complete recovery without support' },
    { id: 'B', text: 'Emotional numbness', correct: true },
    { id: 'C', text: 'Complete loss of all emotional capacity' },
    { id: 'D', text: 'Only physical symptoms, never emotional' },
  ],
  explanation:
    'Emotional numbness is a common response to trauma as a way to cope with overwhelming emotions.',
  selectedId: 'B',
};
