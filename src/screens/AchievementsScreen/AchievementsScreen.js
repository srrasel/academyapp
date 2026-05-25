import { useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTabBarPadding } from '../../hooks/useTabBarPadding';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import SegmentedTabs from '../../components/SegmentedTabs/SegmentedTabs';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import { badges, recentAchievements, certificate } from '../../data/achievements';
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

export default function AchievementsScreen() {
  const [activeTab, setActiveTab] = useState('badges');
  const bottomPad = useTabBarPadding();

  return (
    <SafeAreaView style={styles.scroll} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}>
        <Text style={styles.title}>Achievements</Text>
        <SegmentedTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

        {activeTab === 'badges' ? (
          <>
            <SectionHeader title="Your Badges" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.badgesRow}>
                {badges.map((badge) => (
                  <View key={badge.id} style={styles.badge}>
                    <View style={[styles.badgeCircle, { backgroundColor: badge.color }]}>
                      <Ionicons
                        name={BADGE_ICONS[badge.icon] || 'star'}
                        size={24}
                        color={colors.white}
                      />
                    </View>
                    <Text style={styles.badgeLabel}>{badge.label}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>

            <SectionHeader title="Recent Achievements" />
            {recentAchievements.map((item) => (
              <View key={item.id} style={styles.achievementRow}>
                <View style={styles.achievementIcon}>
                  <Ionicons name={item.icon} size={22} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.achievementTitle}>{item.title}</Text>
                  <Text style={styles.achievementDesc}>{item.description}</Text>
                </View>
                <Text style={styles.achievementTime}>{item.timeAgo}</Text>
              </View>
            ))}
          </>
        ) : (
          <View style={styles.certCard}>
            <View style={styles.certBorder}>
              <Text style={styles.certTitle}>CERTIFICATE OF COMPLETION</Text>
              <Text style={styles.certName}>{certificate.recipient}</Text>
              <Text style={styles.certCourse}>has successfully completed</Text>
              <Text style={[styles.certCourse, { fontWeight: '600', color: colors.text }]}>
                {certificate.course}
              </Text>
              <Text style={styles.certAcademy}>{certificate.academy}</Text>
              <Text style={[styles.certCourse, { marginTop: 8 }]}>{certificate.date}</Text>
              <View style={styles.seal}>
                <MaterialCommunityIcons name="seal" size={40} color={colors.gold} />
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
