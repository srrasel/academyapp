import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabNavigator from './MainTabNavigator';
import CourseOverviewScreen from '../screens/CourseOverviewScreen/CourseOverviewScreen';
import UnitListScreen from '../screens/UnitListScreen/UnitListScreen';
import UnitDetailScreen from '../screens/UnitDetailScreen/UnitDetailScreen';
import LessonVideoScreen from '../screens/LessonVideoScreen/LessonVideoScreen';
import LessonAudioScreen from '../screens/LessonAudioScreen/LessonAudioScreen';
import QuizScreen from '../screens/QuizScreen/QuizScreen';
import LessonTextScreen from '../screens/LessonTextScreen/LessonTextScreen';
import SettingsScreen from '../screens/SettingsScreen/SettingsScreen';
import MembershipScreen from '../screens/MembershipScreen/MembershipScreen';
import ToolkitScreen from '../screens/ToolkitScreen/ToolkitScreen';
import AboutScreen from '../screens/AboutScreen/AboutScreen';

const Stack = createNativeStackNavigator();

export default function MainAppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="MainTabs">
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="CourseOverview" component={CourseOverviewScreen} />
      <Stack.Screen name="UnitList" component={UnitListScreen} />
      <Stack.Screen name="UnitDetail" component={UnitDetailScreen} />
      <Stack.Screen name="LessonVideo" component={LessonVideoScreen} />
      <Stack.Screen name="LessonAudio" component={LessonAudioScreen} />
      <Stack.Screen name="Quiz" component={QuizScreen} />
      <Stack.Screen name="LessonText" component={LessonTextScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Membership" component={MembershipScreen} />
      <Stack.Screen name="Toolkit" component={ToolkitScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
    </Stack.Navigator>
  );
}
