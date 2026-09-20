import { useState } from 'react';
import { Alert, ScrollView, View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTabBarPadding } from '../../hooks/useTabBarPadding';
import { Ionicons } from '@expo/vector-icons';
import SegmentedTabs from '../../components/SegmentedTabs/SegmentedTabs';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import CertificatePreview from '../../components/CertificatePreview/CertificatePreview';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { useCourse } from '../../context/CourseContext';
import { useLocale } from '../../context/LocaleContext';
import { useMembership } from '../../hooks/useMembership';
import { buildProgressStats } from '../../services/progressService';
import {
  buildEarnedBadges,
  buildRecentAchievements,
  buildCertificate,
} from '../../services/achievementService';
import { getCertificatePdfUrl } from '../../data/achievements';
import { downloadAndSharePdf } from '../../utils/downloadPdf';
import { colors } from '../../theme/colors';
import { styles } from './AchievementsScreen.styles';

const BADGE_ICONS = {
  flag: 'flag',
  flame: 'flame',
  trophy: 'trophy',
  ribbon: 'medal',
};

const TABS = [
  { key: 'badges', label: 'Badges' },
  { key: 'certificates', label: 'Certificates' },
];

export default function AchievementsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('badges');
  const [downloadingCertificate, setDownloadingCertificate] = useState(false);
  const { profile } = useAuth();
  const { t, locale } = useLocale();
  const { features } = useMembership();
  const { course, units, progress } = useCourse();
  const stats = buildProgressStats(course, units, progress);
  const badges = buildEarnedBadges(progress, stats);
  const recentAchievements = buildRecentAchievements(progress, stats);
  const certificate = buildCertificate(profile, stats, course?.title);
  const bottomPad = useTabBarPadding();

  const handleDownloadCertificate = async () => {
    if (!certificate.unlocked) {
      Alert.alert(
        t('profile.certificateLockedTitle'),
        t('profile.certificateLockedMessage', { percent: stats.percent })
      );
      return;
    }

    setDownloadingCertificate(true);
    try {
      await downloadAndSharePdf(getCertificatePdfUrl(locale), {
        title: 'Bridge-Academy-Certificate',
        folder: 'certificates',
      });
    } catch {
      Alert.alert(t('achievements.download'), t('profile.certificateDownloadFailed'));
    } finally {
      setDownloadingCertificate(false);
    }
  };

  return (
    <SafeAreaView style={styles.scroll} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Achievements</Text>
          <Pressable onPress={() => navigation.navigate('Settings')} hitSlop={8}>
            <Ionicons name="settings-outline" size={24} color={colors.primary} />
          </Pressable>
        </View>

        <SegmentedTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

        {activeTab === 'badges' ? (
          <>
            <SectionHeader title="Your Badges" />
            {badges.length === 0 ? (
              <Text style={styles.emptyText}>Complete lessons and quizzes to earn badges.</Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.badgesRow}>
                  {badges.map((badge) => (
                    <View key={badge.id} style={styles.badge}>
                      <View style={[styles.badgeCircle, { backgroundColor: badge.color }]}>
                        <Ionicons
                          name={BADGE_ICONS[badge.icon] || 'star'}
                          size={26}
                          color={colors.white}
                        />
                      </View>
                      <Text style={styles.badgeLabel}>{badge.label}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}

            <SectionHeader title="Recent Achievements" />
            {recentAchievements.length === 0 ? (
              <Text style={styles.emptyText}>No achievements yet. Keep learning!</Text>
            ) : (
              recentAchievements.map((item) => (
                <View key={item.id} style={styles.achievementRow}>
                  <View style={[styles.achievementIcon, { backgroundColor: `${item.color}22` }]}>
                    <Ionicons name={item.icon} size={22} color={item.color} />
                  </View>
                  <View style={styles.achievementBody}>
                    <Text style={styles.achievementTitle}>{item.title}</Text>
                    <Text style={styles.achievementDesc}>{item.description}</Text>
                  </View>
                  <Text style={styles.achievementTime}>{item.timeAgo}</Text>
                </View>
              ))
            )}

            <SectionHeader title="Certificate Preview" />
            <CertificatePreview
              certificate={certificate}
              progressPercent={stats.percent}
              compact
            />
          </>
        ) : (
          <>
            <CertificatePreview
              certificate={certificate}
              progressPercent={stats.percent}
            />
            <PrimaryButton
              label={
                downloadingCertificate
                  ? t('profile.certificateDownloading')
                  : t('achievements.download')
              }
              onPress={handleDownloadCertificate}
              style={styles.downloadBtn}
              disabled={downloadingCertificate}
            />
            {certificate.unlocked ? (
              <View style={styles.benefitsCard}>
                <Text style={styles.benefitsTitle}>Your certificate benefits</Text>
                <Text style={styles.benefitsItem}>
                  • {features.certificateSigned ? 'Signed & stamped PDF certificate' : 'PDF Certificate Standard'}
                </Text>
                {features.discountPercent > 0 ? (
                  <Text style={styles.benefitsItem}>
                    • {features.discountPercent}% discount on follow-up course
                  </Text>
                ) : null}
                {features.hasCoachingProfile ? (
                  <Text style={styles.benefitsItem}>• Private profile on Coaching.vn</Text>
                ) : null}
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
