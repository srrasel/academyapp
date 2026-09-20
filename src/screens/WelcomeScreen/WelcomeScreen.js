import { View, Text, ImageBackground } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Logo from '../../components/Logo/Logo';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../../components/SecondaryButton/SecondaryButton';
import { useLocale } from '../../context/LocaleContext';
import { images } from '../../data/images';
import { styles } from './WelcomeScreen.styles';

export default function WelcomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { t } = useLocale();

  return (
    <View style={styles.root}>
      <ImageBackground
        source={images.welcome}
        style={styles.root}
        imageStyle={styles.backgroundImage}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.background} edges={['top', 'bottom']}>
          <View style={styles.topSection}>
            <Logo variant="light" imageOnly />
          </View>

          <View style={styles.spacer} />

          <View style={[styles.bottomContent, { paddingBottom: 12 + insets.bottom }]}>
            <Text style={styles.headline}>{t('welcome.headline')}</Text>
            <PrimaryButton
              label={t('welcome.getStarted')}
              onPress={() => navigation.navigate('CreateAccount')}
              style={styles.button}
            />
            <SecondaryButton
              label={t('welcome.login')}
              onPress={() => navigation.navigate('EmailAuth', { mode: 'login' })}
              style={styles.button}
            />
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
