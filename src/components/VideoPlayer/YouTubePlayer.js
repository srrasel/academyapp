import { useCallback, useState } from 'react';
import { View, Pressable, Text, Image } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import {
  extractYouTubeId,
  buildYouTubeEmbedHtml,
  toYouTubeWatchUrl,
  YOUTUBE_REFERER_ORIGIN,
} from '../../utils/mediaUrl';
import { styles } from './VideoPlayer.styles';

function isAllowedYouTubeEmbedUrl(url = '') {
  if (!url) return false;
  if (url === 'about:blank') return true;
  if (url.startsWith('data:')) return true;
  // Allow only embed / player assets — block full watch pages with suggestions.
  if (/youtube\.com\/embed\//i.test(url)) return true;
  if (/youtube\.com\/embed/i.test(url)) return true;
  if (/youtube\.googleapis\.com/i.test(url)) return true;
  if (/ytimg\.com/i.test(url)) return true;
  if (/googlevideo\.com/i.test(url)) return true;
  if (/google\.com\/recaptcha/i.test(url)) return true;
  if (/youtube-nocookie\.com\/embed\//i.test(url)) return true;
  // Initial local HTML document load.
  if (url.startsWith(YOUTUBE_REFERER_ORIGIN)) return true;
  return false;
}

export default function YouTubePlayer({ videoUrl, posterUrl }) {
  const videoId = extractYouTubeId(videoUrl);
  const [failed, setFailed] = useState(false);
  const [webKey, setWebKey] = useState(0);

  const openInYouTube = useCallback(() => {
    Linking.openURL(toYouTubeWatchUrl(videoUrl));
  }, [videoUrl]);

  const onShouldStartLoadWithRequest = useCallback(
    (request) => {
      const url = request?.url || '';
      if (isAllowedYouTubeEmbedUrl(url)) return true;

      // Anything else (watch pages, related videos, channel pages) opens externally
      // or is blocked so the in-app player stays embed-only.
      if (/youtube\.com|youtu\.be/i.test(url)) {
        Linking.openURL(url.startsWith('http') ? url : toYouTubeWatchUrl(videoUrl));
      }
      return false;
    },
    [videoUrl]
  );

  const onNavigationStateChange = useCallback(
    (navState) => {
      const url = navState?.url || '';
      if (!url || isAllowedYouTubeEmbedUrl(url)) return;
      // Reset embed if WebView somehow navigated to a full YouTube page.
      setWebKey((value) => value + 1);
    },
    []
  );

  if (!videoId) return null;

  if (failed) {
    return (
      <View style={styles.container}>
        <Pressable style={styles.youtubeFallback} onPress={openInYouTube}>
          {posterUrl ? (
            <Image source={{ uri: posterUrl }} style={styles.video} resizeMode="cover" />
          ) : (
            <View style={[styles.video, styles.youtubeFallbackBg]} />
          )}
          <View style={styles.overlay}>
            <View style={styles.playCircle}>
              <Ionicons name="logo-youtube" size={36} color={colors.white} />
            </View>
            <Text style={styles.youtubeFallbackText}>Tap to open in YouTube</Text>
          </View>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.youtubeFrame}>
        <WebView
          key={`${videoId}-${webKey}`}
          style={styles.video}
          source={{
            html: buildYouTubeEmbedHtml(videoId),
            baseUrl: YOUTUBE_REFERER_ORIGIN,
          }}
          originWhitelist={['*']}
          allowsFullscreenVideo
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled
          domStorageEnabled
          scrollEnabled={false}
          nestedScrollEnabled={false}
          setSupportMultipleWindows={false}
          onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
          onNavigationStateChange={onNavigationStateChange}
          onError={() => setFailed(true)}
          onHttpError={() => setFailed(true)}
        />
      </View>
      <Pressable style={styles.youtubeOpenBtn} onPress={openInYouTube}>
        <Ionicons name="open-outline" size={14} color={colors.white} />
        <Text style={styles.youtubeOpenText}>YouTube</Text>
      </Pressable>
    </View>
  );
}
