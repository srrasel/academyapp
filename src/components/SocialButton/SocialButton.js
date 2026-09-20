import { View, Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import GoogleIcon from './GoogleIcon';
import { styles } from './SocialButton.styles';

const PROVIDERS = {
  google: {
    label: 'Continue with Google',
    badgeStyle: styles.iconBadgeGoogle,
    Icon: () => <GoogleIcon size={22} />,
  },
  apple: {
    label: 'Continue with Apple',
    badgeStyle: styles.iconBadgeApple,
    Icon: () => <Ionicons name="logo-apple" size={22} color={colors.white} />,
  },
  facebook: {
    label: 'Continue with Facebook',
    badgeStyle: styles.iconBadgeFacebook,
    Icon: () => <Ionicons name="logo-facebook" size={22} color={colors.white} />,
  },
};

export default function SocialButton({ provider, onPress, showChevron = true, disabled = false }) {
  const config = PROVIDERS[provider];
  const { Icon, badgeStyle, label } = config;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        disabled && { opacity: 0.5 },
        pressed && !disabled && { opacity: 0.92 },
      ]}
    >
      <View style={[styles.iconBadge, badgeStyle]}>
        <Icon />
      </View>
      <Text style={styles.label}>{label}</Text>
      {showChevron ? (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={colors.textMuted}
          style={styles.chevron}
        />
      ) : null}
    </Pressable>
  );
}
