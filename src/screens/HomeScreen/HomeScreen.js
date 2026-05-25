import { ScrollView, View, Text, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTabBarPadding } from '../../hooks/useTabBarPadding';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader/AppHeader';
import NavyCard from '../../components/NavyCard/NavyCard';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import { course, currentUnit, quoteOfDay, nextCourse } from '../../data/course';
import { images } from '../../data/images';
import { colors } from '../../theme/colors';
import { styles } from './HomeScreen.styles';

export default function HomeScreen({ navigation }) {
  const unitProgress = Math.round((currentUnit.completed / currentUnit.total) * 100);
  const bottomPad = useTabBarPadding();

  return (
    <SafeAreaView style={styles.scroll} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}>
        <AppHeader />
        <Text style={styles.greeting}>Hello, Sarah 👋</Text>
        <Text style={styles.subGreeting}>Keep going! You're doing great.</Text>

        <NavyCard
          label="Main Course Progress"
          subtitle={`You've completed ${course.completedUnits} of ${course.totalUnits} units`}
          percent={course.progress}
          buttonLabel="Continue Unit 7"
          onButtonPress={() =>
            navigation.navigate('UnitDetail', { unitId: currentUnit.id })
          }
        />

        <SectionHeader title="Current Unit" />
        <View style={styles.unitCard}>
          <View style={styles.unitRow}>
            <Image source={{ uri: images.welcome }} style={styles.thumb} />
            <View style={styles.unitInfo}>
              <Text style={styles.unitTitle}>
                Unit {currentUnit.id}: {currentUnit.title}
              </Text>
              <ProgressBar progress={unitProgress} />
              <Text style={styles.unitMeta}>
                {currentUnit.completed}/{currentUnit.total} Subunits Completed
              </Text>
            </View>
          </View>
          <PrimaryButton
            label="Continue Learning"
            onPress={() =>
              navigation.navigate('UnitDetail', { unitId: currentUnit.id })
            }
            style={{ marginTop: 12 }}
          />
        </View>

        <SectionHeader title="Quote of the Day" />
        <View style={styles.quoteCard}>
          <Text style={styles.quoteText}>"{quoteOfDay.text}"</Text>
          <Text style={styles.quoteAuthor}>— {quoteOfDay.author}</Text>
        </View>

        <SectionHeader
          title="Next Courses"
          linkLabel="See All"
          onLinkPress={() => navigation.navigate('CourseOverview')}
        />
        <Pressable
          style={styles.nextCard}
          onPress={() => navigation.navigate('CourseOverview')}
        >
          <View style={styles.nextThumb} />
          <Text style={styles.nextTitle}>{nextCourse.title}</Text>
          {nextCourse.locked && (
            <Ionicons name="lock-closed" size={20} color={colors.locked} />
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
