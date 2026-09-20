import { Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

export async function openWebUrl(url) {
  if (!url) return;

  try {
    await WebBrowser.openBrowserAsync(url);
    return;
  } catch {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    }
  }
}
