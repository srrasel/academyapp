import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/spacing';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  svg: {
    ...StyleSheet.absoluteFillObject,
  },
  milestone: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  milestoneFlip: {
    flexDirection: 'row',
  },
  pinOuter: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  pin: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  pinBlue: {
    backgroundColor: colors.primary,
  },
  pinGold: {
    backgroundColor: colors.navy,
  },
  pinText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '700',
  },
  labelPill: {
    marginLeft: 8,
    marginRight: 0,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  labelPillFlip: {
    marginLeft: 0,
    marginRight: 8,
  },
  labelPillDark: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderColor: 'rgba(0,0,0,0.05)',
  },
  labelText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 16,
    textAlign: 'left',
  },
  labelTextSecond: {
    marginTop: 1,
    fontWeight: '600',
    color: colors.textMuted,
  },
  labelTextDark: {
    color: colors.navy,
  },
});
