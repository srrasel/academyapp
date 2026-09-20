import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  Modal,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import LessonHeader from '../../components/LessonHeader/LessonHeader';
import LessonHtmlContent from '../../components/LessonHtmlContent/LessonHtmlContent';
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import NoteEditorModal from '../../components/NoteEditorModal/NoteEditorModal';
import AdBanner from '../../components/AdBanner/AdBanner';
import { useLesson } from '../../hooks/useLesson';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { useLessonExtras } from '../../hooks/useLessonExtras';
import { useMarkLessonComplete } from '../../hooks/useMarkLessonComplete';
import { formatLessonSubtitle, completeAndGoNext } from '../../utils/lessonNavigation';
import { getPairedQuiz } from '../../utils/quizPairing';
import { useLocale } from '../../context/LocaleContext';
import { useCourse } from '../../context/CourseContext';
import { useMembership } from '../../hooks/useMembership';
import { requestUnitAdSlot } from '../../services/adFrequencyService';
import { colors } from '../../theme/colors';
import { styles } from './LessonAudioScreen.styles';

const AUTO_SCROLL_KEY = '@academy_audio_autoscroll';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function formatTime(ms) {
  if (!ms) return '0:00';
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

const SLEEP_OPTIONS = [5, 10, 15, 30];

function animatePlayerLayout() {
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
}

export default function LessonAudioScreen({ navigation, route }) {
  const { t } = useLocale();
  const { progress: courseProgress } = useCourse();
  const { features } = useMembership();
  const unitId = route.params?.unitId ?? 2;
  const lessonId = route.params?.lessonId ?? 3;
  const { lesson, lessons, loading } = useLesson(lessonId, unitId);
  const activeLessonId = lesson?.id ?? lessonId;
  const { note, updateNote, publishNote, bookmarked, toggleBookmarkState } = useLessonExtras(
    unitId,
    activeLessonId
  );
  const pairedQuiz = lesson ? getPairedQuiz(lesson, lessons) : null;
  const markComplete = useMarkLessonComplete();
  const { status, speed, sleepMinutes, toggle, seekBy, seekTo, changeSpeed, setSleepTimer, getEstimatedPositionMillis } =
    useAudioPlayer(lesson?.audioUrl);
  const [noteModal, setNoteModal] = useState(false);
  const [sleepModal, setSleepModal] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [playerExpanded, setPlayerExpanded] = useState(true);
  const [showAd, setShowAd] = useState(false);
  const completedRef = useRef(false);
  const sliderWidthRef = useRef(260);
  const miniSliderWidthRef = useRef(160);
  const scrollRef = useRef(null);
  const contentHeightRef = useRef(0);
  const layoutHeightRef = useRef(0);
  const smoothMaxScrollRef = useRef(0);
  const displayScrollYRef = useRef(0);
  const lastFrameTsRef = useRef(0);
  const followSuspendedRef = useRef(false);
  const collapseTimerRef = useRef(null);
  const lastScrollYRef = useRef(0);
  const autoScrollRef = useRef(autoScroll);
  const insets = useSafeAreaInsets();

  autoScrollRef.current = autoScroll;

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(AUTO_SCROLL_KEY).then((saved) => {
      if (!active || saved == null) return;
      setAutoScroll(saved === '1');
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    completedRef.current = false;
    followSuspendedRef.current = false;
    smoothMaxScrollRef.current = 0;
    displayScrollYRef.current = 0;
    lastScrollYRef.current = 0;
    lastFrameTsRef.current = 0;
    setPlayerExpanded(true);
  }, [activeLessonId]);

  const scheduleAutoCollapse = () => {
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }
    collapseTimerRef.current = setTimeout(() => {
      animatePlayerLayout();
      setPlayerExpanded(false);
    }, 1800);
  };

  // Auto-minimize player shortly after playback starts so reading space opens up.
  useEffect(() => {
    if (!status.isPlaying) {
      if (collapseTimerRef.current) {
        clearTimeout(collapseTimerRef.current);
        collapseTimerRef.current = null;
      }
      return undefined;
    }
    scheduleAutoCollapse();
    return () => {
      if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
    };
  }, [status.isPlaying]);

  const expandPlayer = () => {
    animatePlayerLayout();
    setPlayerExpanded(true);
    // Keep reading space open: collapse again if audio is still playing.
    if (status.isPlaying) scheduleAutoCollapse();
  };

  const collapsePlayer = () => {
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }
    animatePlayerLayout();
    setPlayerExpanded(false);
  };

  useEffect(() => {
    if (!lesson || !status.durationMillis || completedRef.current) return;
    const ratio = status.positionMillis / status.durationMillis;
    if (ratio >= 0.9) {
      completedRef.current = true;
      markComplete({ unitId, lessonId: lesson.id, minutes: 16, silent: true });
    }
  }, [status.positionMillis, status.durationMillis, lesson, markComplete, unitId]);

  const scrollToAudioRatio = useCallback((positionMillis, durationMillis, { snap = false } = {}) => {
    if (!autoScrollRef.current || followSuspendedRef.current) return;
    if (!durationMillis) return;

    const realMaxScroll = Math.max(0, contentHeightRef.current - layoutHeightRef.current);
    if (!realMaxScroll) return;

    // Ease content-length changes (e.g. pictures finishing load) so scroll never teleports.
    let smoothMax = smoothMaxScrollRef.current;
    if (!smoothMax || snap) {
      smoothMax = realMaxScroll;
    } else if (realMaxScroll > smoothMax) {
      smoothMax += Math.min(realMaxScroll - smoothMax, Math.max(12, (realMaxScroll - smoothMax) * 0.18));
    } else if (realMaxScroll < smoothMax) {
      smoothMax = realMaxScroll;
    }
    smoothMaxScrollRef.current = smoothMax;

    const ratio = Math.min(1, Math.max(0, positionMillis / durationMillis));
    const targetY = ratio * smoothMax;

    const now = Date.now();
    const prevTs = lastFrameTsRef.current || now;
    const dt = Math.min(48, Math.max(8, now - prevTs)) / 1000;
    lastFrameTsRef.current = now;

    let nextY = displayScrollYRef.current;
    const delta = targetY - nextY;

    if (snap) {
      nextY = targetY;
    } else if (Math.abs(delta) < 0.35) {
      nextY = targetY;
    } else {
      // Normal audio tracking stays tight; large layout jumps ease down slowly.
      const catchUpPxPerSec = Math.abs(delta) > 64 ? 90 : 420;
      const step = Math.min(Math.abs(delta), catchUpPxPerSec * dt);
      nextY += Math.sign(delta) * step;
    }

    if (!snap && Math.abs(nextY - lastScrollYRef.current) < 0.25) return;
    displayScrollYRef.current = nextY;
    lastScrollYRef.current = nextY;
    scrollRef.current?.scrollTo({ y: nextY, animated: false });
  }, []);

  // Frame-by-frame scroll while playing — interpolates between native status ticks.
  useEffect(() => {
    if (!autoScroll || !status.isPlaying || !status.durationMillis) return undefined;

    let rafId = 0;
    lastFrameTsRef.current = 0;
    const tick = () => {
      const pos = getEstimatedPositionMillis();
      scrollToAudioRatio(pos, status.durationMillis);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [
    autoScroll,
    status.isPlaying,
    status.durationMillis,
    getEstimatedPositionMillis,
    scrollToAudioRatio,
  ]);

  // Snap once when paused / seeking so position still matches after manual seek.
  useEffect(() => {
    if (!autoScroll || status.isPlaying) return;
    if (status.positionMillis <= 0 || !status.durationMillis) return;
    scrollToAudioRatio(status.positionMillis, status.durationMillis, { snap: true });
  }, [
    autoScroll,
    status.isPlaying,
    status.positionMillis,
    status.durationMillis,
    scrollToAudioRatio,
  ]);

  const setAutoScrollEnabled = async (enabled) => {
    setAutoScroll(enabled);
    followSuspendedRef.current = false;
    await AsyncStorage.setItem(AUTO_SCROLL_KEY, enabled ? '1' : '0');
    if (enabled) {
      requestAnimationFrame(() => {
        followSuspendedRef.current = false;
        const pos = getEstimatedPositionMillis();
        const duration = status.durationMillis;
        if (!duration) return;
        scrollToAudioRatio(pos, duration, { snap: true });
      });
    }
  };

  if (loading || !lesson) return <LoadingScreen />;

  if (!lesson.audioUrl) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.headerWrap}>
          <LessonHeader
            title={lesson.title}
            subtitle={formatLessonSubtitle(t, unitId, lesson.id, lessons)}
            onBack={() => navigation.goBack()}
            variant="light"
          />
        </View>
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 24 }]}>
          <Text style={styles.brainDesc}>
            Audio for this lesson is not available yet. You can read the lesson text below.
          </Text>
          <LessonHtmlContent html={lesson.htmlContent} />
        </ScrollView>
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <PrimaryButton
            label={
              pairedQuiz
                ? t('lesson.continueToQuestions') || 'Continue to Questions'
                : t('lesson.next')
            }
            onPress={() =>
              completeAndGoNext({
                navigation,
                unitId,
                lesson,
                lessons,
                markComplete,
                minutes: 10,
                progress: courseProgress,
              })
            }
          />
        </View>
      </SafeAreaView>
    );
  }

  const progress = status.durationMillis
    ? (status.positionMillis / status.durationMillis) * 100
    : 0;

  const goNext = () =>
    completeAndGoNext({
      navigation,
      unitId,
      lesson,
      lessons,
      markComplete,
      minutes: 16,
      progress: courseProgress,
    });

  const handleContinue = async () => {
    if (features.hasAds) {
      const show = await requestUnitAdSlot(unitId);
      if (show) {
        setShowAd(true);
        return;
      }
    }
    goNext();
  };

  const saveNote = async () => {
    const ok = await publishNote();
    if (ok) {
      Alert.alert('Note saved', 'Your note has been saved for this lesson.');
      setNoteModal(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerWrap}>
        <LessonHeader
          title={lesson.title}
          subtitle={formatLessonSubtitle(t, unitId, lesson.id, lessons)}
          onBack={() => navigation.goBack()}
          bookmarked={bookmarked}
          onBookmarkPress={async () => {
            const next = await toggleBookmarkState();
            Alert.alert(next ? 'Bookmarked' : 'Bookmark removed');
          }}
          variant="light"
        />
      </View>

      <View style={styles.playerPanel}>
        {playerExpanded ? (
          <>
            <View style={styles.brainCardCompact}>
              <MaterialCommunityIcons name="brain" size={36} color={colors.primary} />
              <Text style={styles.brainDescCompact} numberOfLines={2}>
                {lesson.description || 'Listen along while you follow the lesson content below.'}
              </Text>
              <Pressable
                onPress={collapsePlayer}
                hitSlop={10}
                style={styles.collapseBtn}
                accessibilityLabel="Minimize player"
              >
                <Ionicons name="chevron-up" size={22} color={colors.textMuted} />
              </Pressable>
            </View>

            <View style={styles.sliderRow}>
              <Text style={styles.time}>{formatTime(status.positionMillis)}</Text>
              <Pressable
                style={styles.slider}
                onLayout={(e) => {
                  sliderWidthRef.current = e.nativeEvent.layout.width;
                }}
                onPress={(e) => {
                  followSuspendedRef.current = false;
                  const ratio = e.nativeEvent.locationX / sliderWidthRef.current;
                  seekTo(ratio);
                }}
              >
                <View style={[styles.sliderFill, { width: `${progress}%` }]} />
              </Pressable>
              <Text style={styles.time}>{formatTime(status.durationMillis)}</Text>
            </View>

            <View style={styles.controls}>
              <Pressable
                style={styles.skipBtn}
                onPress={() => {
                  followSuspendedRef.current = false;
                  seekBy(-15000);
                }}
              >
                <Ionicons name="play-back" size={26} color={colors.primary} />
                <Text style={styles.skipLabel}>15s</Text>
              </Pressable>
              <Pressable
                style={styles.playMain}
                onPress={() => {
                  followSuspendedRef.current = false;
                  toggle();
                }}
              >
                <Ionicons
                  name={status.isPlaying ? 'pause' : 'play'}
                  size={36}
                  color={colors.white}
                  style={!status.isPlaying && { marginLeft: 4 }}
                />
              </Pressable>
              <Pressable
                style={styles.skipBtn}
                onPress={() => {
                  followSuspendedRef.current = false;
                  seekBy(15000);
                }}
              >
                <Ionicons name="play-forward" size={26} color={colors.primary} />
                <Text style={styles.skipLabel}>15s</Text>
              </Pressable>
            </View>

            <View style={styles.secondary}>
              <Pressable style={styles.secondaryItem} onPress={changeSpeed}>
                <Ionicons name="speedometer-outline" size={22} color={colors.primary} />
                <Text style={styles.secondaryLabel}>{speed.toFixed(1)}x Speed</Text>
              </Pressable>
              <Pressable
                style={styles.secondaryItem}
                onPress={() => setAutoScrollEnabled(!autoScroll)}
              >
                <Ionicons
                  name={autoScroll ? 'swap-vertical' : 'swap-vertical-outline'}
                  size={22}
                  color={autoScroll ? colors.primary : colors.textMuted}
                />
                <Text
                  style={[
                    styles.secondaryLabel,
                    autoScroll && styles.secondaryLabelActive,
                  ]}
                >
                  {autoScroll
                    ? t('lesson.autoScrollOn') || 'Auto-scroll On'
                    : t('lesson.autoScrollOff') || 'Auto-scroll Off'}
                </Text>
              </Pressable>
              <Pressable style={styles.secondaryItem} onPress={() => setSleepModal(true)}>
                <Ionicons name="moon-outline" size={22} color={colors.primary} />
                <Text style={styles.secondaryLabel}>
                  {sleepMinutes ? `${sleepMinutes}m Timer` : 'Sleep Timer'}
                </Text>
              </Pressable>
              <Pressable style={styles.secondaryItem} onPress={() => setNoteModal(true)}>
                <Ionicons name="create-outline" size={22} color={colors.primary} />
                <Text style={styles.secondaryLabel}>Add Note</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <View style={styles.miniPlayer}>
            <Pressable
              style={styles.miniPlayBtn}
              onPress={() => {
                followSuspendedRef.current = false;
                toggle();
              }}
              hitSlop={8}
            >
              <Ionicons
                name={status.isPlaying ? 'pause' : 'play'}
                size={18}
                color={colors.white}
                style={!status.isPlaying && { marginLeft: 2 }}
              />
            </Pressable>
            <Pressable style={styles.miniCenter} onPress={expandPlayer}>
              <View
                style={styles.miniSlider}
                onLayout={(e) => {
                  miniSliderWidthRef.current = e.nativeEvent.layout.width;
                }}
                onStartShouldSetResponder={() => true}
                onResponderRelease={(e) => {
                  followSuspendedRef.current = false;
                  const ratio = e.nativeEvent.locationX / miniSliderWidthRef.current;
                  seekTo(ratio);
                }}
              >
                <View style={[styles.sliderFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.miniTime}>
                {formatTime(status.positionMillis)} / {formatTime(status.durationMillis)}
              </Text>
            </Pressable>
            <Pressable onPress={expandPlayer} hitSlop={10} accessibilityLabel="Expand player">
              <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
            </Pressable>
          </View>
        )}
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.textScroll}
        contentContainerStyle={[styles.content, styles.textContent, { paddingBottom: 24 }]}
        showsVerticalScrollIndicator={false}
        onLayout={(e) => {
          layoutHeightRef.current = e.nativeEvent.layout.height;
        }}
        onContentSizeChange={(_w, h) => {
          contentHeightRef.current = h;
        }}
        onScroll={(e) => {
          if (followSuspendedRef.current) {
            displayScrollYRef.current = e.nativeEvent.contentOffset.y;
            lastScrollYRef.current = e.nativeEvent.contentOffset.y;
          }
        }}
        onScrollBeginDrag={() => {
          followSuspendedRef.current = true;
          if (playerExpanded && status.isPlaying) {
            collapsePlayer();
          }
        }}
        scrollEventThrottle={16}
      >
        <LessonHtmlContent
          html={lesson.htmlContent || lesson.html}
          text={lesson.content || lesson.about}
        />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <PrimaryButton
          label={
            pairedQuiz
              ? t('lesson.continueToQuestions') || 'Continue to Questions'
              : t('lesson.nextLesson')
          }
          onPress={handleContinue}
        />
      </View>

      <Modal visible={showAd} transparent animationType="slide">
        <View style={styles.adOverlay}>
          <View style={styles.adCard}>
            <AdBanner
              onContinue={() => {
                setShowAd(false);
                goNext();
              }}
              onNavigate={(screen) => {
                setShowAd(false);
                navigation.navigate(screen);
              }}
            />
          </View>
        </View>
      </Modal>

      <NoteEditorModal
        visible={noteModal}
        value={note}
        onChangeText={updateNote}
        onSave={saveNote}
        onClose={() => setNoteModal(false)}
      />

      <Modal visible={sleepModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Sleep Timer</Text>
            <Text style={styles.modalSub}>Playback stops after selected time</Text>
            {SLEEP_OPTIONS.map((min) => (
              <Pressable
                key={min}
                style={styles.sleepOption}
                onPress={() => {
                  setSleepTimer(min);
                  setSleepModal(false);
                  Alert.alert('Sleep Timer', `Audio will stop in ${min} minutes.`);
                }}
              >
                <Text style={styles.sleepOptionText}>{min} minutes</Text>
              </Pressable>
            ))}
            <Pressable
              style={styles.sleepOption}
              onPress={() => {
                setSleepTimer(0);
                setSleepModal(false);
              }}
            >
              <Text style={[styles.sleepOptionText, { color: '#EF4444' }]}>Cancel Timer</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
