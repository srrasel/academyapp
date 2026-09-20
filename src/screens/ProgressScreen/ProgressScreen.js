import { useState } from 'react';
import { ScrollView, View, Text, Pressable, Modal, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTabBarPadding } from '../../hooks/useTabBarPadding';
import { Ionicons } from '@expo/vector-icons';
import DonutChart from '../../components/DonutChart/DonutChart';
import SimpleLineChart from '../../components/SimpleLineChart/SimpleLineChart';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import { useCourse } from '../../context/CourseContext';
import {
  buildProgressStats,
  buildUnitProgressList,
} from '../../services/progressService';
import { buildScoreTrend } from '../../services/achievementService';
import { images } from '../../data/images';
import { colors } from '../../theme/colors';
import { styles } from './ProgressScreen.styles';

export default function ProgressScreen() {
  const navigation = useNavigation();
  const { course, units, progress } = useCourse();
  const stats = buildProgressStats(course, units, progress);
  const unitProgressList = buildUnitProgressList(units, progress);
  const scoreTrend = buildScoreTrend(progress);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const bottomPad = useTabBarPadding();

  return (
    <SafeAreaView style={styles.scroll} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerSpacer} />
          <Text style={styles.title}>My Progress</Text>
          <Pressable onPress={() => setCalendarOpen(true)} hitSlop={8} style={styles.headerSpacer}>
            <Ionicons name="calendar-outline" size={24} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.overallCard}>
          <DonutChart percent={stats.percent} />
          <View style={styles.statsCol}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Units Completed</Text>
              <Text style={styles.statValue}>
                {stats.unitsCompleted}/{stats.totalUnits}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Lessons Completed</Text>
              <Text style={styles.statValue}>
                {stats.lessonsCompleted}/{stats.totalLessons}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Hours Studied</Text>
              <Text style={styles.statValue}>{stats.hoursStudied}</Text>
            </View>
          </View>
        </View>

        <SimpleLineChart
          title="Test Performance"
          data={scoreTrend}
          trend={stats.scoreTrend}
          averageLabel="Average Score"
          averageValue={`${stats.averageScore || 0}%`}
          emptyLabel="Complete a quiz to see your score trend."
        />

        <View style={styles.grid}>
          <View style={styles.gridCard}>
            <Ionicons name="flame" size={24} color="#F59E0B" />
            <Text style={styles.gridValue}>{stats.streak} Days</Text>
            <Text style={styles.gridLabel}>Study Streak</Text>
            <Text style={styles.gridSub}>in a row</Text>
          </View>
          <View style={styles.gridCard}>
            <Ionicons name="time-outline" size={24} color={colors.primary} />
            <Text style={styles.gridValue}>{stats.monthlyStudyTime}</Text>
            <Text style={styles.gridLabel}>Total Study Time</Text>
            <Text style={styles.gridSub}>This Month</Text>
          </View>
        </View>

        <SectionHeader
          title="Unit Progress"
          linkLabel="See All"
          onLinkPress={() => navigation.navigate('UnitList')}
        />
        {unitProgressList.length === 0 ? (
          <Text style={styles.emptyText}>Start a lesson to see your unit progress here.</Text>
        ) : (
          unitProgressList.map((unit) => (
            <Pressable
              key={unit.id}
              style={styles.unitCard}
              onPress={() => navigation.navigate('UnitDetail', { unitId: unit.id })}
            >
              <Image source={images.welcome} style={styles.unitThumb} />
              <View style={styles.unitInfo}>
                <Text style={styles.unitTitle}>{unit.title}</Text>
                <Text style={styles.unitSubtitle} numberOfLines={1}>
                  {unit.subtitle}
                </Text>
                <ProgressBar progress={unit.percent} />
              </View>
              <Text style={styles.unitPercent}>{unit.percent}%</Text>
            </Pressable>
          ))
        )}
      </ScrollView>

      <Modal visible={calendarOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Study Calendar</Text>
            <Text style={styles.modalText}>
              {stats.streak > 0
                ? `You are on a ${stats.streak}-day streak. Keep learning daily!`
                : 'Complete a lesson today to start your study streak.'}
            </Text>
            <Text style={styles.modalText}>Total study time: {stats.monthlyStudyTime}</Text>
            <PrimaryButton label="Close" onPress={() => setCalendarOpen(false)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
