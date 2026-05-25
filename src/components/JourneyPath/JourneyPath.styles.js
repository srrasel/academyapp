import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  pathLine: {
    position: 'absolute',
    left: '50%',
    marginLeft: -2,
    top: '8%',
    bottom: '12%',
    width: 4,
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 2,
  },
  milestones: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  milestoneRowRight: {
    flexDirection: 'row-reverse',
  },
  node: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  nodeBlue: {
    backgroundColor: colors.primary,
  },
  nodeGold: {
    backgroundColor: colors.gold,
  },
  nodeText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  labelBox: {
    flex: 1,
    marginHorizontal: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
});
