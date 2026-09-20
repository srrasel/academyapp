import { useEffect, useRef, useState } from 'react';
import { View, Image, Pressable, Text, ActivityIndicator } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { images } from '../../data/images';
import { isYouTubeUrl, isDirectVideoUrl } from '../../utils/mediaUrl';
import YouTubePlayer from './YouTubePlayer';
import { styles } from './VideoPlayer.styles';

function formatTime(seconds) {
  if (!seconds || Number.isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function DirectVideoPlayer({ videoUrl, posterUrl, onProgress, onComplete }) {
  const videoRef = useRef(null);
  const completedRef = useRef(false);
  const trackWidthRef = useRef(0);
  const [status, setStatus] = useState({});
  const [loading, setLoading] = useState(Boolean(videoUrl));

  const position = status.positionMillis ?? 0;
  const duration = status.durationMillis ?? 1;
  const progress = Math.min(100, (position / duration) * 100);
  const isPlaying = status.isPlaying;

  useEffect(() => {
    completedRef.current = false;
  }, [videoUrl]);

  useEffect(() => {
    if (onProgress && duration > 0) {
      onProgress({ position, duration, progress });
    }
    if (progress >= 90 && onComplete && !completedRef.current) {
      completedRef.current = true;
      onComplete();
    }
  }, [position, duration, progress, onProgress, onComplete]);

  const togglePlay = async () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
  };

  const seekTo = async (ratio) => {
    if (!videoRef.current || !videoUrl) return;
    const next = Math.max(0, Math.min(1, ratio)) * duration;
    await videoRef.current.setPositionAsync(next);
  };

  const onTrackPress = (event) => {
    if (!trackWidthRef.current) return;
    const ratio = event.nativeEvent.locationX / trackWidthRef.current;
    seekTo(ratio);
  };

  const goFullscreen = async () => {
    if (!videoRef.current || !videoUrl) return;
    try {
      await videoRef.current.presentFullscreenPlayer();
    } catch {
      // Fullscreen may be unavailable on some platforms
    }
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        style={styles.video}
        source={{ uri: videoUrl }}
        useNativeControls={false}
        resizeMode={ResizeMode.COVER}
        posterSource={posterUrl ? { uri: posterUrl } : undefined}
        onPlaybackStatusUpdate={setStatus}
        onLoad={() => setLoading(false)}
        onError={() => setLoading(false)}
      />

      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator color={colors.white} />
        </View>
      )}

      {(!isPlaying || !videoUrl) && !loading && (
        <Pressable style={styles.overlay} onPress={togglePlay}>
          <View style={styles.playCircle}>
            <Ionicons name="play" size={32} color={colors.white} style={{ marginLeft: 4 }} />
          </View>
        </Pressable>
      )}

      <View style={styles.controls}>
        <Pressable style={styles.playBtn} onPress={togglePlay}>
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={18} color={colors.white} />
        </Pressable>
        <Pressable
          style={styles.sliderTrack}
          onPress={onTrackPress}
          onLayout={(e) => {
            trackWidthRef.current = e.nativeEvent.layout.width;
          }}
        >
          <View style={[styles.sliderFill, { width: `${progress}%` }]} />
          <View style={[styles.scrubber, { left: `${progress}%` }]} />
        </Pressable>
        <Text style={styles.time}>{formatTime(position / 1000)}</Text>
        <Pressable onPress={goFullscreen} hitSlop={8}>
          <Ionicons name="expand-outline" size={20} color={colors.white} />
        </Pressable>
      </View>
    </View>
  );
}

function PlaceholderPlayer() {
  return (
    <View style={styles.container}>
      <Image source={images.welcome} style={styles.video} resizeMode="cover" />
      <View style={styles.overlay}>
        <View style={styles.playCircle}>
          <Ionicons name="play" size={32} color={colors.white} style={{ marginLeft: 4 }} />
        </View>
      </View>
    </View>
  );
}

export default function VideoPlayer({ videoUrl, posterUrl, onProgress, onComplete }) {
  if (!videoUrl) return <PlaceholderPlayer />;
  if (isYouTubeUrl(videoUrl)) {
    return <YouTubePlayer videoUrl={videoUrl} posterUrl={posterUrl} />;
  }
  if (isDirectVideoUrl(videoUrl)) {
    return (
      <DirectVideoPlayer
        videoUrl={videoUrl}
        posterUrl={posterUrl}
        onProgress={onProgress}
        onComplete={onComplete}
      />
    );
  }

  return <YouTubePlayer videoUrl={videoUrl} posterUrl={posterUrl} />;
}
