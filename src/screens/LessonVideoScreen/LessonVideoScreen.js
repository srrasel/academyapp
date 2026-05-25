import { useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import LessonHeader from '../../components/LessonHeader/LessonHeader';
import VideoPlayer from '../../components/VideoPlayer/VideoPlayer';
import ContentTabs from '../../components/ContentTabs/ContentTabs';
import ActionRow from '../../components/ActionRow/ActionRow';
import { videoLesson } from '../../data/lessons';
import { colors } from '../../theme/colors';
import { styles } from './LessonVideoScreen.styles';

const TABS = ['Overview', 'Notes', 'Resources'];

export default function LessonVideoScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('Overview');
  const lesson = videoLesson;
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.scroll} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 24 + insets.bottom }]}>
        <LessonHeader
          title={lesson.title}
          subtitle={lesson.unitLabel}
          onBack={() => navigation.goBack()}
        />
        <VideoPlayer
          currentTime={lesson.currentTime}
          duration={lesson.duration}
          progress={lesson.progress}
        />
        <ContentTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

        {activeTab === 'Overview' ? (
          <>
            <Text style={styles.sectionTitle}>About this lesson</Text>
            <Text style={styles.about}>{lesson.about}</Text>
            <Text style={styles.sectionTitle}>Key Points</Text>
            <View style={styles.keyPoints}>
              {lesson.keyPoints.map((point) => (
                <View key={point} style={styles.point}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                  <Text style={styles.pointText}>{point}</Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <Text style={styles.tabContent}>
            {activeTab === 'Notes' ? 'Your notes will appear here.' : 'Lesson resources and downloads.'}
          </Text>
        )}
        <ActionRow />
      </ScrollView>
    </SafeAreaView>
  );
}
