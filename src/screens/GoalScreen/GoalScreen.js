import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OnboardingLayout from '../../components/OnboardingLayout/OnboardingLayout';
import SelectionItem from '../../components/SelectionItem/SelectionItem';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import { useAuth } from '../../context/AuthContext';
import { useLocale } from '../../context/LocaleContext';
import { goBackOr } from '../../utils/navigationHelpers';
import { goals } from '../../data/goals';
import { colors } from '../../theme/colors';
import { styles } from './GoalScreen.styles';

export default function GoalScreen({ navigation }) {
  const { user, setOnboardingDraft } = useAuth();
  const { t } = useLocale();
  const [selected, setSelected] = useState('coach');

  return (
    <OnboardingLayout
      footer={
        <PrimaryButton
          label={t('common.next') || 'Next'}
          onPress={() => {
            setOnboardingDraft((prev) => ({ ...prev, goal: selected }));
            navigation.navigate('LearningJourney');
          }}
        />
      }
    >
      <View style={styles.navRow}>
        <Pressable
          onPress={() => goBackOr(navigation, 'Language')}
          style={styles.backButton}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.list}>
        <Text style={styles.title}>{t('goal.title') || 'What is your goal?'}</Text>
        <Text style={styles.subtitle}>
          {t('goal.subtitle') || 'This helps us customize your learning experience'}
        </Text>

        {goals.map((goal) => (
          <SelectionItem
            key={goal.id}
            label={goal.label}
            icon={goal.icon}
            iconColor={goal.iconColor}
            iconBg={goal.iconBg}
            showChevron
            selected={selected === goal.id}
            onPress={() => setSelected(goal.id)}
          />
        ))}
      </View>
    </OnboardingLayout>
  );
}
