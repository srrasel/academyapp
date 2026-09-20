import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenFooter from '../ScreenFooter/ScreenFooter';
import { colors } from '../../theme/colors';
import { styles } from './OnboardingLayout.styles';

export default function OnboardingLayout({
  children,
  footer,
  scrollable = true,
  contentStyle,
  tone = 'default',
}) {
  const isWarm = tone === 'warm';
  const content = scrollable ? (
    <ScrollView
      style={styles.body}
      contentContainerStyle={[styles.scrollContent, contentStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.body, styles.scrollContent, contentStyle]}>{children}</View>
  );

  return (
    <View style={[styles.root, isWarm && { backgroundColor: colors.backgroundWarm }]}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {content}
        {footer ? (
          <ScreenFooter
            absolute={false}
            style={isWarm ? { backgroundColor: colors.backgroundWarm, borderTopColor: colors.accentWarmBorder } : undefined}
          >
            {footer}
          </ScreenFooter>
        ) : null}
      </SafeAreaView>
    </View>
  );
}
