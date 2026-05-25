import { useState } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OnboardingLayout from '../../components/OnboardingLayout/OnboardingLayout';
import OnboardingHeader from '../../components/OnboardingHeader/OnboardingHeader';
import LanguageListItem from '../../components/LanguageListItem/LanguageListItem';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import { styles as headerStyles } from '../../components/OnboardingHeader/OnboardingHeader.styles';
import { languages } from '../../data/languages';
import { colors } from '../../theme/colors';
import { styles } from './LanguageScreen.styles';

export default function LanguageScreen({ navigation }) {
  const [selected, setSelected] = useState('en');

  return (
    <OnboardingLayout
      footer={
        <PrimaryButton
          label="Continue"
          onPress={() => navigation.navigate('CreateAccount')}
        />
      }
    >
      <OnboardingHeader
        title="Choose Your Language"
        subtitle="Please select your preferred language"
        onBack={() => navigation.goBack()}
        topIcon={
          <View style={headerStyles.iconCircle}>
            <Ionicons name="globe-outline" size={30} color={colors.primary} />
          </View>
        }
      />

      <View style={styles.listCard}>
        {languages.map((lang) => (
          <LanguageListItem
            key={lang.id}
            label={lang.name}
            flag={lang.flag}
            selected={selected === lang.id}
            onPress={() => setSelected(lang.id)}
          />
        ))}
      </View>
      <Text style={styles.hint}>You can change this later in settings</Text>
    </OnboardingLayout>
  );
}
