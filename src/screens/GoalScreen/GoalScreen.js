import { useState } from 'react';
import { View } from 'react-native';
import OnboardingLayout from '../../components/OnboardingLayout/OnboardingLayout';
import OnboardingHeader from '../../components/OnboardingHeader/OnboardingHeader';
import SelectionItem from '../../components/SelectionItem/SelectionItem';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import { goals } from '../../data/goals';
import { styles } from './GoalScreen.styles';

export default function GoalScreen({ navigation }) {
  const [selected, setSelected] = useState('coach');

  return (
    <OnboardingLayout
      footer={
        <PrimaryButton
          label="Next"
          onPress={() => navigation.navigate('LearningJourney')}
        />
      }
    >
      <OnboardingHeader
        title="What is your goal?"
        subtitle="This helps us customize your learning experience"
        onBack={() => navigation.goBack()}
      />
      <View style={styles.list}>
        {goals.map((goal) => (
          <SelectionItem
            key={goal.id}
            label={goal.label}
            icon={goal.icon}
            selected={selected === goal.id}
            onPress={() => setSelected(goal.id)}
          />
        ))}
      </View>
    </OnboardingLayout>
  );
}
