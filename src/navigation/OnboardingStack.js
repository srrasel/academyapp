import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/WelcomeScreen/WelcomeScreen';
import LanguageScreen from '../screens/LanguageScreen/LanguageScreen';
import CreateAccountScreen from '../screens/CreateAccountScreen/CreateAccountScreen';
import GoalScreen from '../screens/GoalScreen/GoalScreen';
import LearningJourneyScreen from '../screens/LearningJourneyScreen/LearningJourneyScreen';

const Stack = createNativeStackNavigator();

export default function OnboardingStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Language" component={LanguageScreen} />
      <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
      <Stack.Screen name="Goal" component={GoalScreen} />
      <Stack.Screen name="LearningJourney" component={LearningJourneyScreen} />
    </Stack.Navigator>
  );
}
