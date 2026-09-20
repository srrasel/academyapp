/** Learning journey copy per onboarding goal. */

const SHARED_SKILLS = [
  { id: 'communication', label: 'Communication', icon: 'chatbubbles-outline' },
  { id: 'wellbeing', label: 'Emotional Wellbeing', icon: 'heart-outline' },
  { id: 'problemSolving', label: 'Problem Solving', icon: 'extension-puzzle-outline' },
  { id: 'time', label: 'Time Management', icon: 'time-outline' },
];

const START_COURSE = {
  icon: 'walk-outline',
  title: 'Start the Main Course and Thrive',
  description: 'Start today and make progress.',
  skills: [],
};

export const learningJourneys = {
  coach: {
    id: 'coach',
    background: 'journeyPath',
    milestones: [
      {
        icon: 'star-outline',
        title: 'Become a Life Coach',
        description:
          'Build coaching skills, grow your confidence, and prepare to support others.',
        skills: [],
      },
      {
        icon: 'compass-outline',
        title: 'Choose Your Specialisation',
        description:
          'Life Coach, Sleep Coach, Elderly Coach, Financial Coach, and more.',
        skills: [
          { id: 'life', label: 'Life Coach', icon: 'heart-outline' },
          { id: 'sleep', label: 'Sleep Coach', icon: 'moon-outline' },
          { id: 'elderly', label: 'Elderly Coach', icon: 'people-outline' },
          { id: 'finance', label: 'Financial Coach', icon: 'stats-chart-outline' },
        ],
      },
      {
        icon: 'book-outline',
        title: 'Start the Main Course and Thrive',
        description: 'Start today and make progress.',
        skills: [],
      },
    ],
  },

  parenting: {
    id: 'parenting',
    background: 'journeyParent',
    milestones: [
      {
        icon: 'happy-outline',
        title: 'Parenting and Child Development',
        description:
          'Practical strategies, expert guidance, and support to help you raise confident, happy, and resilient children.',
        skills: [
          { id: 'knowledge', label: 'Knowledge', icon: 'book-outline' },
          { id: 'family', label: 'Family', icon: 'people-outline' },
          { id: 'observation', label: 'Observation', icon: 'eye-outline' },
          { id: 'connections', label: 'Connections', icon: 'git-network-outline' },
        ],
      },
      {
        icon: 'bulb-outline',
        title: 'Develop Knowledge and Skills',
        description: 'Gain knowledge, build skills, and grow every day.',
        skills: SHARED_SKILLS,
      },
      START_COURSE,
    ],
  },

  family: {
    id: 'family',
    background: 'journeySupport',
    milestones: [
      {
        icon: 'people-outline',
        title: 'Support Families and Friends',
        description:
          'Strengthen relationships, offer support, and create meaningful connections.',
        skills: [
          { id: 'knowledge', label: 'Knowledge', icon: 'book-outline' },
          { id: 'family', label: 'Family', icon: 'people-outline' },
          { id: 'observation', label: 'Observation', icon: 'eye-outline' },
          { id: 'connections', label: 'Connections', icon: 'git-network-outline' },
        ],
      },
      {
        icon: 'book-outline',
        title: 'Develop Knowledge and Skills',
        description: 'Gain knowledge, build skills, and grow every day.',
        skills: SHARED_SKILLS,
      },
      START_COURSE,
    ],
  },

  personal: {
    id: 'personal',
    background: 'journeyDiscover',
    milestones: [
      {
        icon: 'search-outline',
        title: 'Discover Yourself',
        description:
          'Gain clarity, understand your strengths, and become your best self.',
        skills: [
          { id: 'awareness', label: 'Self Awareness', icon: 'person-outline' },
          { id: 'confidence', label: 'Build Confidence', icon: 'sparkles-outline' },
          { id: 'goals', label: 'Set Goals', icon: 'flag-outline' },
          { id: 'mindset', label: 'Mindset Growth', icon: 'trending-up-outline' },
        ],
      },
      {
        icon: 'book-outline',
        title: 'Develop Essential Skills',
        description:
          'Improve communication, manage emotions, and solve problems effectively.',
        skills: SHARED_SKILLS,
      },
      START_COURSE,
    ],
  },

  education: {
    id: 'education',
    background: 'journeyEducation',
    milestones: [
      {
        icon: 'school-outline',
        title: 'Education',
        description:
          "Empower educators to inspire, support, and unlock every child's potential.",
        skills: [
          { id: 'safe', label: 'Build Positive Environments', icon: 'shield-outline' },
          { id: 'potential', label: "Unlock every Child's Potential", icon: 'bulb-outline' },
          { id: 'support', label: 'Students Support', icon: 'hand-left-outline' },
          { id: 'outcomes', label: 'Learning Disabilities', icon: 'bar-chart-outline' },
        ],
      },
      {
        icon: 'book-outline',
        title: 'Develop Skills',
        description: 'Gain knowledge, build skills, and grow every day.',
        skills: SHARED_SKILLS,
      },
      START_COURSE,
    ],
  },
};

export function getLearningJourney(goalId) {
  return learningJourneys[goalId] || learningJourneys.coach;
}
