import { useMemo, useState } from 'react';
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
import AdvancedCourseList from '../../components/AdvancedCourseList/AdvancedCourseList';
import { useCourse } from '../../context/CourseContext';
import { useLocale } from '../../context/LocaleContext';
import { showNotifications } from '../../utils/notifications';
import { buildProgressStats } from '../../services/progressService';
import { getLearnableUnitCount } from '../../utils/courseUnits';
import { recentActivity, getAdvancedCoursesForLocale } from '../../data/course';
import { colors } from '../../theme/colors';
import { styles } from './MyLearningScreen.styles';

export default function MyLearningScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('main');
  const { course, units, progress, currentUnit } = useCourse();
  const { t, locale } = useLocale();
  const safeCourse = course ?? {
    title: 'Life Coach Base Course',
    totalUnits: 20,
    stats: { units: 20, lessons: 199 },
  };
  const stats = buildProgressStats(safeCourse, units, progress);
  const unitCount = getLearnableUnitCount(units, safeCourse);
  const previewUnits = units.slice(0, 5);
  const bottomPad = useTabBarPadding();
  const advancedUnlocked = stats.percent >= 100;
  const localeAdvancedCourses = useMemo(
    () => getAdvancedCoursesForLocale(locale),
    [locale]
  );

  const tabs = useMemo(
    () => [
      { key: 'main', label: t('myLearning.mainCourse') },
      { key: 'advanced', label: t('myLearning.advancedCourses') },
    ],
    [t]
  );

  const openUnit = (unit) => {
    if (unit.status === 'locked') return;
    navigation.navigate('UnitDetail', { unitId: unit.id });
  };

  const openRecentLesson = () => {
    navigation.navigate('UnitDetail', { unitId: currentUnit?.id ?? 2 });
  };

  return (
    <SafeAreaView style={styles.scroll} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}>
        <AppHeader
          variant="title"
          title={t('myLearning.title')}
          onSearchPress={showNotifications}
        />

        <SegmentedTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

        {activeTab === 'main' ? (
          <>
            <NavyCard
              layout="stacked"
              title={safeCourse.title}
              meta={t('myLearning.unitsMeta', {
                units: unitCount,
              })}
              percent={stats.percent}
              onPress={() => navigation.navigate('CourseOverview')}
            />

            <View style={styles.unitList}>
              {previewUnits.map((unit, index) => (
                <UnitRow
                  key={unit.id}
                  unit={unit}
                  isActive={String(unit.id) === String(currentUnit?.id)}
                  onPress={() => openUnit(unit)}
                  showDivider={index < previewUnits.length - 1}
                />
              ))}
            </View>

            <OutlineButton
              label={t('myLearning.viewAllUnits', {
                count: unitCount,
              })}
              onPress={() => navigation.navigate('UnitList')}
            />

            <SectionHeader title={t('myLearning.recentActivity')} />
            <Pressable style={styles.activityCard} onPress={openRecentLesson}>
              <View style={styles.playIcon}>
                <Ionicons name="play" size={18} color={colors.white} />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle} numberOfLines={2}>
                  {recentActivity.title}
                </Text>
                {recentActivity.duration ? (
                  <Text style={styles.activityMeta}>{recentActivity.duration}</Text>
                ) : null}
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </Pressable>
          </>
        ) : (
          <View style={styles.advancedWrap}>
            <Text style={styles.advancedSectionTitle}>{t('myLearning.advancedTitle')}</Text>
            <Text style={styles.advancedSectionSubtitle}>
              {t('myLearning.advancedSubtitle')}
            </Text>
            <AdvancedCourseList
              courses={localeAdvancedCourses}
              unlocked={advancedUnlocked}
              progressPercent={stats.percent}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
