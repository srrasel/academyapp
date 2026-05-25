import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingStack from './OnboardingStack';
import MainTabNavigator from './MainTabNavigator';
import CourseOverviewScreen from '../screens/CourseOverviewScreen/CourseOverviewScreen';
import UnitListScreen from '../screens/UnitListScreen/UnitListScreen';
import UnitDetailScreen from '../screens/UnitDetailScreen/UnitDetailScreen';
import LessonVideoScreen from '../screens/LessonVideoScreen/LessonVideoScreen';
import LessonAudioScreen from '../screens/LessonAudioScreen/LessonAudioScreen';
import QuizScreen from '../screens/QuizScreen/QuizScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding" component={OnboardingStack} />
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        <Stack.Screen name="CourseOverview" component={CourseOverviewScreen} />
        <Stack.Screen name="UnitList" component={UnitListScreen} />
        <Stack.Screen name="UnitDetail" component={UnitDetailScreen} />
        <Stack.Screen name="LessonVideo" component={LessonVideoScreen} />
        <Stack.Screen name="LessonAudio" component={LessonAudioScreen} />
        <Stack.Screen name="Quiz" component={QuizScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
