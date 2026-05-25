import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TAB_BAR_HEIGHT } from '../constants/layout';
import { spacing } from '../theme/spacing';

/** Extra bottom padding for scroll content inside bottom-tab screens */
export function useTabBarPadding(extra = spacing.lg) {
  const insets = useSafeAreaInsets();
  return TAB_BAR_HEIGHT + insets.bottom + extra;
}
