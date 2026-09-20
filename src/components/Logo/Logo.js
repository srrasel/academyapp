import { View, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocale } from '../../context/LocaleContext';
import { colors } from '../../theme/colors';
import { styles } from './Logo.styles';

const logoImage = require('../../../assets/logo.png');

export default function Logo({ variant = 'dark', imageOnly = false }) {
  const { t } = useLocale();
  const isLight = variant === 'light';

  if (imageOnly) {
    return (
      <Image
        source={logoImage}
        style={styles.logoImage}
        resizeMode="contain"
      />
    );
  }

  const iconColor = isLight ? colors.white : colors.primary;

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name="business-outline" size={40} color={iconColor} />
      </View>
      <Text style={[styles.title, isLight && styles.titleLight]}>BRIDGE ACADEMY</Text>
      <Text style={[styles.tagline, isLight && styles.taglineLight]}>
        {t('logo.tagline')}
      </Text>
    </View>
  );
}
