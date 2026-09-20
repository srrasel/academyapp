import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';

export const styles = StyleSheet.create({
  container: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.navy,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  video: {
    width: '100%',
    height: 210,
  },
  youtubeFrame: {
    width: '100%',
    height: 210,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  hiddenPoster: {
    width: 0,
    height: 0,
    opacity: 0,
  },
  youtubeFallback: {
    width: '100%',
    height: 210,
    position: 'relative',
  },
  youtubeFallbackBg: {
    backgroundColor: colors.navy,
  },
  youtubeFallbackText: {
    color: colors.white,
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  youtubeOpenBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 2,
  },
  youtubeOpenText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    bottom: 52,
  },
  playCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(15,42,110,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.navy,
  },
  playBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderTrack: {
    flex: 1,
    height: 20,
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
  },
  sliderFill: {
    height: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
    position: 'absolute',
    left: 0,
    top: 8,
  },
  scrubber: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.white,
    marginLeft: -6,
    top: 4,
  },
  time: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    minWidth: 40,
    textAlign: 'right',
  },
});
