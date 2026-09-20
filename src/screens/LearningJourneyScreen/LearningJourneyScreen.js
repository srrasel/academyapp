import { useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocale } from '../../context/LocaleContext';
import { useAuth } from '../../context/AuthContext';
import { goBackOr } from '../../utils/navigationHelpers';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import { getLearningJourney } from '../../data/learningJourneys';
import { images } from '../../data/images';
import { colors } from '../../theme/colors';
import { styles } from './LearningJourneyScreen.styles';

export default function LearningJourneyScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { finishOnboarding, onboardingDraft } = useAuth();
  const { t } = useLocale();
  const journey = getLearningJourney(onboardingDraft?.goal || 'coach');
  const backgroundSource = images[journey.background] || images.journeyPath;

  const androidStatus =
    Platform.OS === 'android' ? RNStatusBar.currentHeight || 28 : 0;
  const headerTopPad = Math.max(insets.top, androidStatus) + 8;
  // Keep button above system nav, but don't invent a huge empty strip
  const footerBottomPad = Math.max(insets.bottom, 12) + 10;
  const topScrimHeight = headerTopPad + 48;
  const bottomScrimHeight = footerBottomPad + 92;

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        headerShown: false,
        contentStyle: { backgroundColor: '#000000' },
      });
      if (Platform.OS === 'android') {
        RNStatusBar.setTranslucent(true);
        RNStatusBar.setBackgroundColor('transparent');
      }
    }, [navigation])
  );

  return (
    <View style={styles.root}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <Image
        source={backgroundSource}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      <LinearGradient
        pointerEvents="none"
        colors={['rgba(0,0,0,0.45)', 'transparent']}
        locations={[0, 1]}
        style={[styles.topScrim, { height: topScrimHeight }]}
      />

      <LinearGradient
        pointerEvents="none"
        colors={['transparent', 'rgba(0,0,0,0.75)']}
        locations={[0, 1]}
        style={[styles.bottomScrim, { height: bottomScrimHeight }]}
      />

      <View style={styles.overlay} pointerEvents="box-none">
        <View
          style={[styles.header, { paddingTop: headerTopPad }]}
          pointerEvents="box-none"
        >
          <Pressable
            onPress={() => goBackOr(navigation, 'Goal')}
            style={styles.backButton}
            hitSlop={8}
          >
            <Ionicons name="chevron-back" size={26} color={colors.white} />
          </Pressable>

          <Text style={styles.title} numberOfLines={1}>
            {t('journey.title')}
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.spacer} pointerEvents="none" />

        <View style={[styles.footer, { paddingBottom: footerBottomPad }]}>
          <PrimaryButton
            label={t('journey.beginJourney')}
            onPress={async () => {
              await finishOnboarding();
            }}
            style={styles.startButton}
          />
        </View>
      </View>
    </View>
  );
}
