import { ScrollView, View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTabBarPadding } from '../../hooks/useTabBarPadding';
import { Ionicons } from '@expo/vector-icons';
import DonutChart from '../../components/DonutChart/DonutChart';
import SimpleLineChart from '../../components/SimpleLineChart/SimpleLineChart';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import { progressStats, scoreTrendData, unitProgressList } from '../../data/progress';
import { colors } from '../../theme/colors';
import { styles } from './ProgressScreen.styles';

export default function ProgressScreen() {
  const stats = progressStats;
  const bottomPad = useTabBarPadding();

  return (
    <SafeAreaView style={styles.scroll} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>My Progress</Text>
          <Pressable>
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
          data={scoreTrendData}
          trend={stats.scoreTrend}
          averageLabel="Average Score"
          averageValue={`${stats.averageScore}%`}
        />

        <View style={styles.grid}>
          <View style={styles.gridCard}>
            <Ionicons name="flame" size={24} color="#F59E0B" />
            <Text style={styles.gridValue}>{stats.streak} Days</Text>
            <Text style={styles.gridLabel}>Study Streak</Text>
          </View>
          <View style={styles.gridCard}>
            <Ionicons name="time-outline" size={24} color={colors.primary} />
            <Text style={styles.gridValue}>{stats.monthlyStudyTime}</Text>
            <Text style={styles.gridLabel}>This Month</Text>
          </View>
        </View>

        <SectionHeader title="Unit Progress" />
        {unitProgressList.map((unit) => (
          <View key={unit.id} style={styles.unitCard}>
            <View style={styles.unitThumb} />
            <View style={styles.unitInfo}>
              <Text style={styles.unitTitle}>{unit.title}</Text>
              <ProgressBar progress={unit.percent} />
            </View>
            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.primary }}>
              {unit.percent}%
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
