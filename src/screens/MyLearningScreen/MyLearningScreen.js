import { useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTabBarPadding } from '../../hooks/useTabBarPadding';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader/AppHeader';
import NavyCard from '../../components/NavyCard/NavyCard';
import SegmentedTabs from '../../components/SegmentedTabs/SegmentedTabs';
import UnitRow from '../../components/UnitRow/UnitRow';
import OutlineButton from '../../components/OutlineButton/OutlineButton';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import { course, units, recentActivity } from '../../data/course';
import { colors } from '../../theme/colors';
import { styles } from './MyLearningScreen.styles';

const TABS = [
  { key: 'main', label: 'Main Course' },
  { key: 'advanced', label: 'Advanced Courses' },
];

export default function MyLearningScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('main');
  const previewUnits = units.slice(0, 5);
  const bottomPad = useTabBarPadding();

  const openUnit = (unit) => {
    if (unit.status === 'locked') return;
    navigation.navigate('UnitDetail', { unitId: unit.id });
  };

  return (
    <SafeAreaView style={styles.scroll} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}>
        <AppHeader variant="title" title="My Learning" />

        <SegmentedTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

        {activeTab === 'main' ? (
          <>
            <Pressable onPress={() => navigation.navigate('CourseOverview')}>
              <NavyCard
                title="Become a Life Coach (Main Course)"
                meta="20 Units • 100 Lessons"
                percent={course.progress}
              />
            </Pressable>

            {previewUnits.map((unit) => (
              <UnitRow key={unit.id} unit={unit} onPress={() => openUnit(unit)} />
            ))}

            <OutlineButton
              label="View All 20 Units"
              onPress={() => navigation.navigate('UnitList')}
            />

            <SectionHeader title="Recent Activity" />
            <Pressable
              style={styles.activityCard}
              onPress={() => navigation.navigate('LessonVideo')}
            >
              <Ionicons name="play-circle" size={36} color={colors.primary} />
              <View>
                <Text style={styles.activityTitle}>{recentActivity.title}</Text>
                <Text style={styles.activityMeta}>{recentActivity.duration}</Text>
              </View>
            </Pressable>
          </>
        ) : (
          <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 24 }}>
            Advanced courses unlock after completing the main course.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
