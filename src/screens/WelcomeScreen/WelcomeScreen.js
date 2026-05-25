import { View, Text, ImageBackground } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Logo from '../../components/Logo/Logo';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../../components/SecondaryButton/SecondaryButton';
import { images } from '../../data/images';
import { styles } from './WelcomeScreen.styles';

export default function WelcomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <ImageBackground
        source={{ uri: images.welcome }}
        style={styles.root}
        resizeMode="cover"
      >
        <LinearGradient
          colors={[
            'rgba(0,0,0,0.35)',
            'rgba(0,0,0,0.15)',
            'rgba(0,0,0,0.55)',
            'rgba(0,0,0,0.75)',
          ]}
          locations={[0, 0.35, 0.7, 1]}
          style={styles.gradient}
        />
        <SafeAreaView style={styles.background} edges={['top', 'bottom']}>
          <View style={styles.topSection}>
            <Logo variant="light" imageOnly />
          </View>

          <View style={[styles.bottomContent, { paddingBottom: 20 + insets.bottom }]}>
            <Text style={styles.headline}>
              Start your journey to become a life coach
            </Text>
            <PrimaryButton
              label="Get Started"
              onPress={() => navigation.navigate('Language')}
              style={styles.button}
            />
            <SecondaryButton
              label="Login"
              onPress={() => navigation.navigate('CreateAccount')}
              style={styles.button}
            />
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
