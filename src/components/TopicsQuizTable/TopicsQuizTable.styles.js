import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';

export const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginVertical: spacing.md,
    backgroundColor: colors.white,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  headerRow: {
    backgroundColor: '#f7cfad',
  },
  dataRowEven: {
    backgroundColor: '#edf0f2',
  },
  cell: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  colNo: {
    width: 52,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: colors.border,
    backgroundColor: '#E8EEF5',
  },
  colTopic: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingHorizontal: 10,
  },
  colQuiz: {
    width: 64,
    alignItems: 'center',
    backgroundColor: '#E8EEF5',
  },
  headerText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.navy,
    textAlign: 'center',
  },
  numText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
  },
  topicText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.navy,
    lineHeight: 20,
  },
  quizText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
  },
});
