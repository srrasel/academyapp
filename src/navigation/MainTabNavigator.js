import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeScreen from '../screens/HomeScreen/HomeScreen';
import MyLearningScreen from '../screens/MyLearningScreen/MyLearningScreen';
import ProgressScreen from '../screens/ProgressScreen/ProgressScreen';
import AchievementsScreen from '../screens/AchievementsScreen/AchievementsScreen';
import PlaceholderScreen from '../screens/PlaceholderScreen/PlaceholderScreen';
import { TAB_BAR_HEIGHT } from '../constants/layout';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Home: ['home', 'home-outline'],
  MyLearning: ['book', 'book-outline'],
  Progress: ['stats-chart', 'stats-chart-outline'],
  Community: ['people', 'people-outline'],
  Profile: ['person', 'person-outline'],
};

export default function MainTabNavigator() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = TAB_BAR_HEIGHT + insets.bottom;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          height: tabBarHeight,
          paddingTop: 6,
          paddingBottom: insets.bottom,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const [active, inactive] = TAB_ICONS[route.name] || ['ellipse', 'ellipse-outline'];
          return (
            <Ionicons name={focused ? active : inactive} size={size} color={color} />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen
        name="MyLearning"
        component={MyLearningScreen}
        options={{ title: 'My Learning' }}
      />
      <Tab.Screen name="Progress" component={ProgressScreen} options={{ title: 'Progress' }} />
      <Tab.Screen
        name="Community"
        component={PlaceholderScreen}
        initialParams={{ title: 'Community' }}
        options={{ title: 'Community' }}
      />
      <Tab.Screen
        name="Profile"
        component={AchievementsScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}
