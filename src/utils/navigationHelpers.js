export function goBackOr(navigation, fallbackRoute = 'Welcome') {
  if (navigation.canGoBack()) {
    navigation.goBack();
    return;
  }

  navigation.navigate(fallbackRoute);
}
