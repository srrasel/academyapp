export const course = {
  id: 'main',
  title: 'Become a Life Coach',
  subtitle: 'Your path to becoming a certified life coach',
  description:
    'Master the fundamentals of life coaching through structured units, practical exercises, and certification preparation.',
  stats: { units: 20, lessons: 100, hours: '40+' },
  progress: 35,
  completedUnits: 7,
  totalUnits: 20,
  currentUnitId: 7,
  learnings: [
    'Core coaching frameworks and ethics',
    'Active listening and powerful questioning',
    'Goal setting and accountability techniques',
    'Trauma-informed coaching approaches',
    'Building a sustainable coaching practice',
  ],
};

export const units = [
  { id: 1, title: 'Introduction to Life Coaching', completed: 5, total: 5, status: 'completed' },
  { id: 2, title: 'Ethics & Professional Standards', completed: 5, total: 5, status: 'completed' },
  { id: 3, title: 'Communication Skills', completed: 4, total: 5, status: 'completed' },
  { id: 4, title: 'Goal Setting Frameworks', completed: 0, total: 5, status: 'locked' },
  { id: 5, title: 'Active Listening Mastery', completed: 0, total: 5, status: 'locked' },
  { id: 6, title: 'Building Rapport', completed: 0, total: 5, status: 'locked' },
  { id: 7, title: 'Understanding Trauma', completed: 4, total: 5, status: 'in_progress' },
  { id: 8, title: 'Trauma-Informed Coaching', completed: 0, total: 5, status: 'locked' },
  { id: 9, title: 'Client Assessment Tools', completed: 0, total: 5, status: 'locked' },
  { id: 10, title: 'Coaching Session Structure', completed: 0, total: 5, status: 'locked' },
];

export const currentUnit = units.find((u) => u.id === 7);

export const subunits = [
  { id: 1, title: 'What is Trauma?', type: 'Video', duration: '18 min', status: 'completed' },
  { id: 2, title: 'Types of Trauma', type: 'Video', duration: '22 min', status: 'completed' },
  { id: 3, title: 'Trauma Responses', type: 'Audio', duration: '16 min', status: 'completed' },
  { id: 4, title: 'Coaching Trauma Survivors', type: 'Video', duration: '20 min', status: 'completed' },
  { id: 5, title: 'Unit 7 Test', type: 'Quiz', duration: '15 min', status: 'pending' },
];

export const quoteOfDay = {
  text: 'Healing begins when understanding starts.',
  author: 'Unknown',
};

export const nextCourse = {
  title: 'Advanced Coaching Level 2',
  locked: true,
};

export const recentActivity = {
  title: 'Lesson: Types of Trauma',
  duration: '22 min',
};
