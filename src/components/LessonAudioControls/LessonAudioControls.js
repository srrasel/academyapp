import { useRef } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { colors } from '../../theme/colors';
import { styles } from './LessonAudioControls.styles';

function formatTime(ms) {
  if (!ms) return '0:00';
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function LessonAudioControls({ audioUrl, compact = false }) {
  const { status, speed, toggle, seekBy, seekTo, changeSpeed } = useAudioPlayer(audioUrl);
  const sliderWidthRef = useRef(260);

  if (!audioUrl) return null;

  const progress = status.durationMillis
    ? (status.positionMillis / status.durationMillis) * 100
    : 0;

  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <View style={styles.titleRow}>
        <Ionicons name="headset-outline" size={18} color={colors.primary} />
        <Text style={styles.title}>Lesson audio</Text>
      </View>

      <View style={styles.sliderRow}>
        <Text style={styles.time}>{formatTime(status.positionMillis)}</Text>
        <Pressable
          style={styles.slider}
          onLayout={(e) => {
            sliderWidthRef.current = e.nativeEvent.layout.width;
          }}
          onPress={(e) => {
            const ratio = e.nativeEvent.locationX / sliderWidthRef.current;
            seekTo(ratio);
          }}
        >
          <View style={[styles.sliderFill, { width: `${progress}%` }]} />
        </Pressable>
        <Text style={styles.time}>{formatTime(status.durationMillis)}</Text>
      </View>

      <View style={styles.controls}>
        <Pressable style={styles.skipBtn} onPress={() => seekBy(-15000)}>
          <Ionicons name="play-back" size={22} color={colors.primary} />
          <Text style={styles.skipLabel}>15s</Text>
        </Pressable>
        <Pressable style={styles.playMain} onPress={toggle}>
          <Ionicons
            name={status.isPlaying ? 'pause' : 'play'}
            size={28}
            color={colors.white}
            style={!status.isPlaying && { marginLeft: 3 }}
          />
        </Pressable>
        <Pressable style={styles.skipBtn} onPress={() => seekBy(15000)}>
          <Ionicons name="play-forward" size={22} color={colors.primary} />
          <Text style={styles.skipLabel}>15s</Text>
        </Pressable>
        <Pressable style={styles.speedBtn} onPress={changeSpeed}>
          <Text style={styles.speedLabel}>{speed.toFixed(1)}x</Text>
        </Pressable>
      </View>
    </View>
  );
}
