import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OnboardingLayout from '../../components/OnboardingLayout/OnboardingLayout';
import OnboardingHeader from '../../components/OnboardingHeader/OnboardingHeader';
import SocialButton from '../../components/SocialButton/SocialButton';
import Divider from '../../components/Divider/Divider';
import { colors } from '../../theme/colors';
import { styles } from './CreateAccountScreen.styles';

export default function CreateAccountScreen({ navigation }) {
  const goToGoals = () => navigation.navigate('Goal');

  return (
    <OnboardingLayout>
      <OnboardingHeader
        title="Create Your Account"
        subtitle="Join Bridge Academy and start your journey"
        onBack={() => navigation.goBack()}
      />

      <View style={styles.actions}>
        <SocialButton provider="google" onPress={goToGoals} showChevron={false} />
        <SocialButton provider="apple" onPress={goToGoals} showChevron={false} />
        <SocialButton provider="facebook" onPress={goToGoals} showChevron={false} />

        <View style={styles.dividerWrap}>
          <Divider />
        </View>

        <Pressable
          style={({ pressed }) => [styles.emailButton, pressed && { opacity: 0.9 }]}
          onPress={goToGoals}
        >
          <Ionicons name="mail-outline" size={20} color={colors.white} />
          <Text style={styles.emailLabel}>Sign up with Email</Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Already have an account?{' '}
          <Text style={styles.footerLink} onPress={() => navigation.goBack()}>
            Login
          </Text>
        </Text>
      </View>
    </OnboardingLayout>
  );
}
