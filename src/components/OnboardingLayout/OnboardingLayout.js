import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenFooter from '../ScreenFooter/ScreenFooter';
import { styles } from './OnboardingLayout.styles';

export default function OnboardingLayout({
  children,
  footer,
  scrollable = true,
}) {
  const content = scrollable ? (
    <ScrollView
      style={styles.body}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.body, styles.scrollContent]}>{children}</View>
  );

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {content}
        {footer ? <ScreenFooter absolute={false}>{footer}</ScreenFooter> : null}
      </SafeAreaView>
    </View>
  );
}
