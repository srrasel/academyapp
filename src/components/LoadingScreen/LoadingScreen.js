import { View, ActivityIndicator, Image, Text } from 'react-native';
import { colors } from '../../theme/colors';

const logoImage = require('../../../assets/logo.png');

export default function LoadingScreen() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
        gap: 16,
      }}
    >
      <Image source={logoImage} style={{ width: 120, height: 120 }} resizeMode="contain" />
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={{ color: colors.textMuted, fontSize: 14 }}>Loading...</Text>
    </View>
  );
}
