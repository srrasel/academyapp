export const CERTIFICATE_PDF_URL =
  'https://bridge-academy.vn/wp-content/uploads/2025/10/CERTIFICATE.pdf';

export const CERTIFICATE_PDF_URL_VI =
  'https://bridge-academy.vn/wp-content/uploads/2025/08/CERTIFICATE-1-VN.pdf';

export function getCertificatePdfUrl(locale = 'en') {
  return locale === 'vi' ? CERTIFICATE_PDF_URL_VI : CERTIFICATE_PDF_URL;
}

export const badges = [
  { id: 1, label: 'First Step', color: '#3B82F6', icon: 'flag' },
  { id: 2, label: '7 Day Streak', color: '#F59E0B', icon: 'flame' },
  { id: 3, label: 'Quiz Master', color: '#8B5CF6', icon: 'trophy' },
  { id: 4, label: 'Halfway', color: '#10B981', icon: 'ribbon' },
];

export const recentAchievements = [
  {
    id: 1,
    title: 'Lesson Explorer',
    description: 'Completed 10 lessons',
    timeAgo: '2 days ago',
    icon: 'compass-outline',
  },
  {
    id: 2,
    title: 'Unit Champion',
    description: 'Finished Unit 3',
    timeAgo: '5 days ago',
    icon: 'medal-outline',
  },
  {
    id: 3,
    title: 'Perfect Score',
    description: 'Scored 100% on a quiz',
    timeAgo: '1 week ago',
    icon: 'star-outline',
  },
];

export const certificate = {
  recipient: 'Sarah Johnson',
  course: 'Life Coach Base Course – General Psychology',
  academy: 'Bridge Academy',
  date: 'May 20, 2026',
};
