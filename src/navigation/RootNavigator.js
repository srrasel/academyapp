import { NavigationContainer } from '@react-navigation/native';
import LoadingScreen from '../components/LoadingScreen/LoadingScreen';
import { useAuth } from '../context/AuthContext';
import { MenuProvider } from '../context/MenuContext';
import AuthStack from './AuthStack';
import OnboardingResumeStack from './OnboardingResumeStack';
import MainAppStack from './MainAppStack';

function getResumeInitialRoute(profile) {
  // Language is chosen once after signup; skip if already saved.
  return profile?.language ? 'Goal' : 'Language';
}

export default function RootNavigator() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  const onboardingComplete = Boolean(profile?.onboardingComplete);

  return (
    <NavigationContainer>
      <MenuProvider>
        {!user ? (
          <AuthStack />
        ) : !onboardingComplete ? (
          <OnboardingResumeStack
            key={user.uid}
            initialRouteName={getResumeInitialRoute(profile)}
          />
        ) : (
          <MainAppStack />
        )}
      </MenuProvider>
    </NavigationContainer>
  );
}
