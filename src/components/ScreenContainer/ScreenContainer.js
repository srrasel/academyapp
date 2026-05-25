import { View, ImageBackground } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing } from '../../theme/spacing';
import { styles } from './ScreenContainer.styles';

export default function ScreenContainer({
  children,
  footer,
  backgroundImage,
  useGradientOverlay = false,
}) {
  const insets = useSafeAreaInsets();
  const bottomPad = spacing.lg + insets.bottom;

  if (backgroundImage) {
    return (
      <View style={styles.imageRoot}>
        <ImageBackground source={{ uri: backgroundImage }} style={styles.imageRoot} resizeMode="cover">
          {useGradientOverlay ? (
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.75)']}
              style={styles.imageOverlay}
            />
          ) : (
            <View style={styles.imageOverlay} />
          )}
          <SafeAreaView style={[styles.imageContent, { paddingBottom: bottomPad }]} edges={['top']}>
            {children}
            {footer}
          </SafeAreaView>
        </ImageBackground>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.content}>{children}</View>
        {footer ? (
          <View style={[styles.footer, { paddingBottom: bottomPad }]}>{footer}</View>
        ) : null}
      </SafeAreaView>
    </View>
  );
}
