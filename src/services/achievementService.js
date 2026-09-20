import { certificate as certTemplate } from '../data/achievements';

export function buildEarnedBadges(progress, stats) {
  const badges = [];
  const lessonsDone = stats.lessonsCompleted || 0;
  const streak = progress?.streak || 0;
  const quizScores = Object.values(progress?.quizScores ?? {});
  const avgScore = stats.averageScore || 0;

  if (lessonsDone >= 1) {
    badges.push({ id: 1, label: 'First Step', color: '#D4A84B', icon: 'flag' });
  }
  if (streak >= 7) {
    badges.push({ id: 2, label: '7 Day Streak', color: '#F59E0B', icon: 'flame' });
  }
  if (stats.unitsCompleted >= 1) {
    badges.push({ id: 3, label: 'Unit Master', color: '#D97706', icon: 'trophy' });
  }
  if (avgScore >= 80 || quizScores.some((q) => q.score / q.total >= 0.9)) {
    badges.push({ id: 4, label: 'Top Performer', color: '#B45309', icon: 'ribbon' });
  }

  return badges;
}

export function buildRecentAchievements(progress, stats) {
  const items = [];
  const lessonsDone = stats.lessonsCompleted || 0;
  const quizScores = Object.values(progress?.quizScores ?? {});

  if (lessonsDone >= 10) {
    items.push({
      id: 'explorer',
      title: 'Lesson Explorer',
      description: `Completed ${lessonsDone} lessons`,
      timeAgo: '2 days ago',
      icon: 'compass-outline',
      color: '#3B82F6',
    });
  }
  if (stats.unitsCompleted >= 1) {
    items.push({
      id: 'unit',
      title: 'Unit Champion',
      description: `Finished ${stats.unitsCompleted} unit(s)`,
      timeAgo: '5 days ago',
      icon: 'medal-outline',
      color: '#8B5CF6',
    });
  }
  const perfect = quizScores.find((q) => q.score === q.total);
  if (perfect) {
    items.push({
      id: 'perfect',
      title: 'Perfect Score',
      description: 'Scored 100% on a quiz',
      timeAgo: '1 week ago',
      icon: 'star-outline',
      color: '#F59E0B',
    });
  }

  if (!items.length && lessonsDone > 0) {
    items.push({
      id: 'start',
      title: 'Getting Started',
      description: 'Completed your first lessons',
      timeAgo: 'Recently',
      icon: 'rocket-outline',
      color: '#10B981',
    });
  }

  return items;
}

export function buildCertificate(profile, stats, courseTitle) {
  const unlocked = stats.percent >= 100;
  const tier = profile?.membershipTier || 'free';

  return {
    ...certTemplate,
    course: courseTitle || certTemplate.course,
    recipient: profile?.displayName || certTemplate.recipient,
    unlocked,
    membershipTier: tier,
    date: unlocked
      ? new Date().toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      : null,
  };
}

export function buildScoreTrend(progress) {
  const quizScores = Object.values(progress?.quizScores ?? {})
    .sort((a, b) => (a.completedAt || 0) - (b.completedAt || 0))
    .slice(-7);

  if (!quizScores.length) return [];

  return quizScores.map((q) => {
    const total = Number(q.total) || 0;
    if (!total) return 0;
    return Math.round((Number(q.score) / total) * 100);
  });
}
