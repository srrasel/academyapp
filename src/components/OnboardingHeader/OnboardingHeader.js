import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { styles } from './OnboardingHeader.styles';

export default function OnboardingHeader({
  title,
  subtitle,
  statsBar,
  onBack,
  topIcon,
  variant = 'light',
  align = 'center',
}) {
  const isLight = variant === 'light';
  const isOverlay = variant === 'dark';
  const isLeft = align === 'left';

  return (
    <View style={[styles.wrap, isLeft && styles.wrapLeft]}>
      <View style={styles.navRow}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            style={[styles.backButton, isOverlay && styles.backButtonOverlay]}
            hitSlop={8}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={isLight ? colors.text : colors.white}
            />
          </Pressable>
        ) : (
          <View style={styles.navSpacer} />
        )}
        <View style={{ flex: 1 }} />
        <View style={styles.navSpacer} />
      </View>

      {topIcon ? <View style={styles.iconWrap}>{topIcon}</View> : null}

      {title ? (
        <Text
          style={[
            styles.title,
            isLeft && styles.titleLeft,
            !isLight && styles.titleLight,
          ]}
        >
          {title}
        </Text>
      ) : null}
      {subtitle ? (
        <Text
          style={[
            styles.subtitle,
            isLeft && styles.subtitleLeft,
            !isLight && styles.subtitleLight,
          ]}
        >
          {subtitle}
        </Text>
      ) : null}
      {statsBar ? (
        <Text style={[styles.statsBar, !isLight && styles.statsBarLight]}>{statsBar}</Text>
      ) : null}
    </View>
  );
}
