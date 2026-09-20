/** Practitioner toolkit trackers — PDF downloads from Bridge Academy media library. */

export const practitionerToolkit = [
  {
    id: 'track-sleep',
    lessonId: '22636',
    title: 'Sleep Problems Tracker',
    description: 'Track sleep patterns and coaching progress for clients with sleep issues.',
    icon: 'moon-outline',
    relatedUnit: 'Sleep Disorders',
    type: 'pdf',
    pdfUrl:
      'https://bridge-academy.vn/wp-content/uploads/2025/07/Sleep-Coach-Tracking-Document.pdf',
    pdfUrlVi:
      'https://bridge-academy.vn/wp-content/uploads/2025/07/Bang-theo-doi-chat-luong-giac-ngu.pdf',
  },
  {
    id: 'track-elderly',
    lessonId: '22646',
    title: 'Elderly Care Tracker',
    description: 'Progress tracker for coaching families and caregivers supporting elderly clients.',
    icon: 'people-outline',
    relatedUnit: 'Elderly Disease',
    type: 'pdf',
    pdfUrl:
      'https://bridge-academy.vn/wp-content/uploads/2025/07/Elderly_Tracking_Document.pdf',
    pdfUrlVi:
      'https://bridge-academy.vn/wp-content/uploads/2025/07/Bang-theo-doi-va-ho-tro-nguoi-cao-tuoi.pdf',
  },
  {
    id: 'track-sexual',
    lessonId: '22655',
    title: 'Sexual Coaching Progress Tracker',
    description: 'Document session goals and progress for sexual and relationship coaching.',
    icon: 'heart-outline',
    relatedUnit: 'Sex and Relationship',
    type: 'pdf',
    pdfUrl:
      'https://bridge-academy.vn/wp-content/uploads/2025/07/Sexual_Coaching_Tracker.pdf',
    pdfUrlVi:
      'https://bridge-academy.vn/wp-content/uploads/2025/07/Bang-Theo-Doi-Suc-Khoe-Tinh-Duc-Huan-Luyen-Gan-Ket.pdf',
  },
  {
    id: 'track-fear',
    lessonId: '22662',
    title: 'Fear of Failure Tracker',
    description: 'Worksheet to track confidence, goals, and progress with fear of failure.',
    icon: 'flag-outline',
    relatedUnit: 'Fear of Failure',
    type: 'pdf',
    pdfUrl: 'https://bridge-academy.vn/wp-content/uploads/2025/07/Fear_of_Failure.pdf',
    pdfUrlVi:
      'https://bridge-academy.vn/wp-content/uploads/2025/07/Bang-huan-luyen-noi-so-that-bai.pdf',
  },
  {
    id: 'track-eating',
    lessonId: '22668',
    title: 'Eating Disorder Coaching Tracker',
    description: 'Track coaching milestones when supporting clients with eating concerns.',
    icon: 'nutrition-outline',
    relatedUnit: 'Eating Disorders',
    type: 'pdf',
    pdfUrl:
      'https://bridge-academy.vn/wp-content/uploads/2025/07/Eating_Disorder_Coaching.pdf',
    pdfUrlVi:
      'https://bridge-academy.vn/wp-content/uploads/2025/07/Bang-huan-luyen-theo-doi-roi-loan-an-uong.pdf',
  },
  {
    id: 'track-stress',
    lessonId: '22674',
    title: 'Lifestyle & Stress Tracker',
    description: 'Progress tracker for lifestyle coaching and stress management.',
    icon: 'leaf-outline',
    relatedUnit: 'Lifestyle & Stress',
    type: 'pdf',
    pdfUrl:
      'https://bridge-academy.vn/wp-content/uploads/2025/07/Lifestyle_Stress_Management.pdf',
    pdfUrlVi:
      'https://bridge-academy.vn/wp-content/uploads/2025/07/Bang-quan-ly-cang-thang-cuoc-song.pdf',
  },
  {
    id: 'track-addiction',
    lessonId: '22677',
    title: 'Addiction Recovery Tracker',
    description: 'Document recovery goals and check-ins for addiction coaching support.',
    icon: 'fitness-outline',
    relatedUnit: 'Addiction',
    type: 'pdf',
    pdfUrl:
      'https://bridge-academy.vn/wp-content/uploads/2025/07/Addiction_Recovery_Tracker.pdf',
    pdfUrlVi:
      'https://bridge-academy.vn/wp-content/uploads/2025/07/Bang-theo-doi-hoi-phuc-nghien.pdf',
  },
  {
    id: 'intake',
    title: 'Client Intake Form',
    description: 'Structured intake questions for new coaching clients.',
    icon: 'document-text-outline',
  },
  {
    id: 'session',
    title: 'Session Planning Template',
    description: 'Plan goals, topics, and follow-up actions for each session.',
    icon: 'calendar-outline',
  },
  {
    id: 'wheel',
    title: 'Life Balance Wheel',
    description: 'Visual tool to assess client satisfaction across life areas.',
    icon: 'pie-chart-outline',
  },
  {
    id: 'smart',
    title: 'SMART Goals Worksheet',
    description: 'Help clients define specific, measurable coaching goals.',
    icon: 'checkmark-done-outline',
  },
  {
    id: 'reflection',
    title: 'Reflection Journal',
    description: 'Guided prompts for client self-reflection between sessions.',
    icon: 'book-outline',
  },
  {
    id: 'ethics',
    title: 'Ethics Checklist',
    description: 'Professional boundaries and referral guidelines for coaches.',
    icon: 'shield-checkmark-outline',
  },
];

export function resolveToolkitPdfUrl(item, locale = 'en') {
  if (!item) return '';
  if (locale === 'vi' && item.pdfUrlVi) return item.pdfUrlVi;
  return item.pdfUrl || item.url || '';
}

export function getPractitionerToolkit(locale = 'en') {
  return practitionerToolkit.map((item) => ({
    ...item,
    url: resolveToolkitPdfUrl(item, locale),
  }));
}
