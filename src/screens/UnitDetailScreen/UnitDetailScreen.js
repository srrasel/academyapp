import { ScrollView, View, Text } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenFooter from '../../components/ScreenFooter/ScreenFooter';
import AppHeader from '../../components/AppHeader/AppHeader';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import ProgressRing from '../../components/ProgressRing/ProgressRing';
import SubunitRow from '../../components/SubunitRow/SubunitRow';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import { units, subunits } from '../../data/course';
import { styles } from './UnitDetailScreen.styles';

const UNIT_ABOUT =
  'Learn how trauma affects the mind and body, and discover coaching approaches that prioritize safety, empathy, and empowerment.';

function openSubunit(navigation, sub) {
  if (sub.type === 'Video') navigation.navigate('LessonVideo');
  else if (sub.type === 'Audio') navigation.navigate('LessonAudio');
  else if (sub.type === 'Quiz') navigation.navigate('Quiz');
}

export default function UnitDetailScreen({ navigation, route }) {
  const unitId = route.params?.unitId ?? 7;
  const unit = units.find((u) => u.id === unitId) || units[6];
  const percent = Math.round((unit.completed / unit.total) * 100);
  const nextSubunit = subunits.find((s) => s.status === 'pending') || subunits[0];
  const insets = useSafeAreaInsets();
  const scrollBottom = 88 + insets.bottom;

  return (
    <SafeAreaView style={styles.scroll} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: scrollBottom }]}>
        <AppHeader variant="back" onBack={() => navigation.goBack()} />
        <Text style={styles.title}>
          Unit {unit.id}: {unit.title}
        </Text>

        <View style={styles.progressRow}>
          <View style={styles.progressMeta}>
            <Text style={styles.progressLabel}>
              {unit.completed}/{unit.total} completed
            </Text>
            <ProgressBar progress={percent} />
          </View>
          <ProgressRing percent={percent} variant="dark" size="small" />
        </View>

        {subunits.map((sub, index) => (
          <SubunitRow
            key={sub.id}
            subunit={sub}
            isLast={index === subunits.length - 1}
            onPress={() => openSubunit(navigation, sub)}
          />
        ))}

        <Text style={styles.sectionTitle}>About this Unit</Text>
        <Text style={styles.about}>{UNIT_ABOUT}</Text>
      </ScrollView>

      <ScreenFooter>
        <PrimaryButton
          label="Continue to Next Subunit"
          onPress={() => openSubunit(navigation, nextSubunit)}
        />
      </ScreenFooter>
    </SafeAreaView>
  );
}
