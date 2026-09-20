/** Rotating sponsored creatives for Free-plan placements. */
export const SPONSORED_ADS = [
  {
    id: 'coaching-vn-session',
    title: 'Book a coaching session',
    body: 'Talk with a certified coach about goals, stress, or career direction. First discovery call available this week.',
    sponsor: 'Sponsored • coaching.vn',
    cta: 'Visit coaching.vn',
    url: 'https://www.coaching.vn',
  },
  {
    id: 'sleep-wellness',
    title: 'Sleep better starting tonight',
    body: 'Practical sleep routines used by wellness coaches — wind-down tips, morning light, and caffeine timing.',
    sponsor: 'Sponsored • Sleep & Wellness Hub',
    cta: 'Learn more',
    url: 'https://www.bridge-academy.vn',
  },
  {
    id: 'life-coach-track',
    title: 'Become a life coach',
    body: 'Explore follow-up coaching tracks after your base course — practice hours, mentoring, and certification pathways.',
    sponsor: 'Sponsored • Bridge Academy Partners',
    cta: 'Explore courses',
    url: 'https://www.bridge-academy.vn',
  },
  {
    id: 'mental-health-tools',
    title: 'Daily mental fitness tools',
    body: 'Mood check-ins, journaling prompts, and CBT-inspired worksheets for everyday practice.',
    sponsor: 'Sponsored • MindTools Partner',
    cta: 'See resources',
    url: 'https://www.coaching.vn',
  },
  {
    id: 'upgrade-soft',
    title: 'Prefer an ad-free experience?',
    body: 'Silver and Gold unlock video lessons, toolkit access, and remove advertisements.',
    sponsor: 'Bridge Academy',
    cta: 'View plans',
    url: null,
    navigateTo: 'Membership',
  },
];

export function pickSponsoredAd(seed = Date.now()) {
  const index = Math.abs(Number(seed)) % SPONSORED_ADS.length;
  return SPONSORED_ADS[index];
}
