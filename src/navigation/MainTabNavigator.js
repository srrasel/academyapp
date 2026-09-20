import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeScreen from '../screens/HomeScreen/HomeScreen';
import MyLearningScreen from '../screens/MyLearningScreen/MyLearningScreen';
import ProgressScreen from '../screens/ProgressScreen/ProgressScreen';
import ProfileScreen from '../screens/ProfileScreen/ProfileScreen';
import CommunityScreen from '../screens/CommunityScreen/CommunityScreen';
import { useLocale } from '../context/LocaleContext';
import { TAB_BAR_HEIGHT } from '../constants/layout';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Home: {
    active: 'home',
    inactive: 'home-outline',
    color: '#F59E0B',
    bg: '#FEF3C7',
  },
  MyLearning: {
    active: 'book',
    inactive: 'book-outline',
    color: '#16A34A',
    bg: '#DCFCE7',
  },
  Progress: {
    active: 'stats-chart',
    inactive: 'stats-chart-outline',
    color: '#2563EB',
    bg: '#DBEAFE',
  },
  Community: {
    active: 'people',
    inactive: 'people-outline',
    color: '#7C3AED',
    bg: '#EDE9FE',
  },
  Profile: {
    active: 'person',
    inactive: 'person-outline',
    color: colors.primary,
    bg: '#E0E7FF',
  },
};

export default function MainTabNavigator() {
  const insets = useSafeAreaInsets();
  const { t } = useLocale();
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
          backgroundColor: colors.background,
          borderTopColor: 'rgba(15, 42, 110, 0.08)',
        },
        tabBarIcon: ({ focused, size }) => {
          const config = TAB_ICONS[route.name] || {
            active: 'ellipse',
            inactive: 'ellipse-outline',
            color: colors.primary,
            bg: colors.quoteBg,
          };
          const iconColor = focused ? config.color : colors.textMuted;
          return (
            <View
              style={{
                width: size + 14,
                height: size + 14,
                borderRadius: (size + 14) / 2,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: focused ? config.bg : 'transparent',
              }}
            >
              <Ionicons
                name={focused ? config.active : config.inactive}
                size={size}
                color={iconColor}
              />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: t('tabs.home') }} />
      <Tab.Screen
        name="MyLearning"
        component={MyLearningScreen}
        options={{ title: t('tabs.myLearning') }}
      />
      <Tab.Screen name="Progress" component={ProgressScreen} options={{ title: t('tabs.progress') }} />
      <Tab.Screen
        name="Community"
        component={CommunityScreen}
        options={{ title: t('tabs.community') }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: t('tabs.profile') }}
      />
    </Tab.Navigator>
  );
}
