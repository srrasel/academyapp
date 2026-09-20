import { ScrollView, View, Text, Image, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenFooter from '../../components/ScreenFooter/ScreenFooter';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader/AppHeader';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import { useCourse } from '../../context/CourseContext';
import { fetchLessons } from '../../services/courseService';
import { openLesson } from '../../utils/lessonNavigation';
import { INTRO_UNIT_ID, getLearnableUnitCount } from '../../utils/courseUnits';
import { images } from '../../data/images';
import { colors } from '../../theme/colors';
import { styles } from './CourseOverviewScreen.styles';

export default function CourseOverviewScreen({ navigation }) {
  const { course, currentUnit, units } = useCourse();
  const safeCourse = course ?? {
    title: 'Life Coach Base Course',
    subtitle: 'General Psychology',
    description: '',
    learnings: [],
    stats: { units: 20, hours: '25-30' },
  };
  const unitCount = getLearnableUnitCount(units, safeCourse);
  const insets = useSafeAreaInsets();
  const scrollBottom = 88 + insets.bottom;

  const playIntro = async () => {
    const rawUnitId = currentUnit?.id ?? '2';
    const unitId = String(rawUnitId) === INTRO_UNIT_ID ? '2' : rawUnitId;
    const lessons = await fetchLessons(unitId);
    const first = lessons[0];
    if (first) {
      openLesson(navigation, unitId, first);
    } else {
      navigation.navigate('UnitDetail', { unitId });
    }
  };

  return (
    <SafeAreaView style={styles.scroll} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: scrollBottom }]}>
        <AppHeader
          variant="backTitle"
          title={safeCourse.title}
          onBack={() => navigation.goBack()}
        />
        <Text style={styles.subtitle}>{safeCourse.subtitle}</Text>

        <View style={styles.hero}>
          <Image source={{ uri: images.journey }} style={styles.heroImage} />
          <Pressable style={styles.playOverlay} onPress={playIntro}>
            <View style={styles.playCircle}>
              <Ionicons name="play" size={28} color={colors.white} style={{ marginLeft: 4 }} />
            </View>
          </Pressable>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{unitCount}</Text>
            <Text style={styles.statLabel}>Units</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{safeCourse.stats?.hours ?? '25-30'}</Text>
            <Text style={styles.statLabel}>Hours</Text>
          </View>
        </View>

        <Text style={styles.description}>{safeCourse.description}</Text>

        <Text style={styles.sectionTitle}>What you'll learn</Text>
        {(safeCourse.learnings || []).map((item) => (
          <View key={item} style={styles.learnItem}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={styles.learnText}>{item}</Text>
          </View>
        ))}
      </ScrollView>

      <ScreenFooter>
        <PrimaryButton
          label="Start Learning"
          onPress={() => navigation.navigate('UnitList')}
        />
      </ScreenFooter>
    </SafeAreaView>
  );
}
