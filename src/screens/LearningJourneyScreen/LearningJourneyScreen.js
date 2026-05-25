import { View } from 'react-native';
import { ImageBackground } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import OnboardingHeader from '../../components/OnboardingHeader/OnboardingHeader';
import JourneyPath from '../../components/JourneyPath/JourneyPath';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import { images } from '../../data/images';
import { styles } from './LearningJourneyScreen.styles';

export default function LearningJourneyScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <ImageBackground
        source={{ uri: images.journey }}
        style={styles.background}
        resizeMode="cover"
      >
        <LinearGradient
          colors={[
            'rgba(0,0,0,0.45)',
            'rgba(0,0,0,0.2)',
            'rgba(0,0,0,0.35)',
            'rgba(0,0,0,0.7)',
          ]}
          locations={[0, 0.3, 0.65, 1]}
          style={styles.gradient}
        />

        <SafeAreaView style={styles.content} edges={['top', 'bottom']}>
          <View style={styles.header}>
            <OnboardingHeader
              variant="dark"
              title="Your Learning Journey"
              statsBar="20 Units • Certification • Advanced Courses"
              onBack={() => navigation.goBack()}
            />
          </View>

          <View style={styles.pathArea}>
            <JourneyPath />
          </View>

          <View style={[styles.footer, { paddingBottom: 16 + insets.bottom }]}>
            <PrimaryButton
              label="Start Learning"
              onPress={() =>
                navigation.getParent()?.reset({
                  index: 0,
                  routes: [{ name: 'MainTabs' }],
                })
              }
            />
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
