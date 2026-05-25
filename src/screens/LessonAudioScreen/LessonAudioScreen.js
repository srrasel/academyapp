import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import LessonHeader from '../../components/LessonHeader/LessonHeader';
import { audioLesson } from '../../data/lessons';
import { colors } from '../../theme/colors';
import { styles } from './LessonAudioScreen.styles';

export default function LessonAudioScreen({ navigation }) {
  const lesson = audioLesson;
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.scroll} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 24 + insets.bottom }]}>
        <LessonHeader
          title={lesson.title}
          subtitle={lesson.unitLabel}
          onBack={() => navigation.goBack()}
        />

        <View style={styles.brainCard}>
          <View style={styles.brainIcon}>
            <MaterialCommunityIcons name="brain" size={64} color="#93C5FD" />
          </View>
          <Text style={styles.brainDesc}>{lesson.description}</Text>
        </View>

        <View style={styles.sliderRow}>
          <View style={styles.slider}>
            <View style={[styles.sliderFill, { width: `${lesson.progress}%` }]} />
          </View>
          <Text style={styles.time}>
            {lesson.currentTime} / {lesson.duration}
          </Text>
        </View>

        <View style={styles.controls}>
          <Pressable>
            <Ionicons name="play-back" size={28} color={colors.text} />
            <Text style={{ fontSize: 10, textAlign: 'center', color: colors.textMuted }}>15s</Text>
          </Pressable>
          <Pressable style={styles.playMain}>
            <Ionicons name="pause" size={32} color={colors.white} />
          </Pressable>
          <Pressable>
            <Ionicons name="play-forward" size={28} color={colors.text} />
            <Text style={{ fontSize: 10, textAlign: 'center', color: colors.textMuted }}>15s</Text>
          </Pressable>
        </View>

        <View style={styles.secondary}>
          {[
            { icon: 'speedometer-outline', label: lesson.speed },
            { icon: 'moon-outline', label: 'Sleep Timer' },
            { icon: 'create-outline', label: 'Add Note' },
            { icon: 'download-outline', label: 'Download' },
          ].map((item) => (
            <Pressable key={item.label} style={styles.secondaryItem}>
              <Ionicons name={item.icon} size={22} color={colors.primary} />
              <Text style={styles.secondaryLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 12 }}>
          Up Next
        </Text>
        <Pressable style={styles.upNext}>
          <View style={styles.upNextThumb} />
          <View style={{ flex: 1 }}>
            <Text style={styles.upNextTitle}>{lesson.upNext.title}</Text>
            <Text style={styles.upNextMeta}>{lesson.upNext.duration}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
