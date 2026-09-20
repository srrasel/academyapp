import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LanguageScreen from '../screens/LanguageScreen/LanguageScreen';
import GoalScreen from '../screens/GoalScreen/GoalScreen';
import LearningJourneyScreen from '../screens/LearningJourneyScreen/LearningJourneyScreen';

const Stack = createNativeStackNavigator();

export default function OnboardingResumeStack({ initialRouteName = 'Language' }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
      initialRouteName={initialRouteName}
    >
      <Stack.Screen name="Language" component={LanguageScreen} />
      <Stack.Screen name="Goal" component={GoalScreen} />
      <Stack.Screen
        name="LearningJourney"
        component={LearningJourneyScreen}
        options={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
}
