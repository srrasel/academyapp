import { ScrollView, View, Text, Image, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenFooter from '../../components/ScreenFooter/ScreenFooter';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader/AppHeader';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import { course } from '../../data/course';
import { images } from '../../data/images';
import { colors } from '../../theme/colors';
import { styles } from './CourseOverviewScreen.styles';

export default function CourseOverviewScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const scrollBottom = 88 + insets.bottom;

  return (
    <SafeAreaView style={styles.scroll} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: scrollBottom }]}>
        <AppHeader variant="back" onBack={() => navigation.goBack()} />
        <Text style={styles.title}>{course.title}</Text>
        <Text style={styles.subtitle}>{course.subtitle}</Text>

        <View style={styles.hero}>
          <Image source={{ uri: images.journey }} style={styles.heroImage} />
          <Pressable style={styles.playOverlay}>
            <Ionicons name="play-circle" size={64} color={colors.white} />
          </Pressable>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{course.stats.units}</Text>
            <Text style={styles.statLabel}>Units</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{course.stats.lessons}</Text>
            <Text style={styles.statLabel}>Lessons</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{course.stats.hours}</Text>
            <Text style={styles.statLabel}>Hours</Text>
          </View>
        </View>

        <Text style={styles.description}>{course.description}</Text>

        <Text style={styles.sectionTitle}>What you'll learn</Text>
        {course.learnings.map((item) => (
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
