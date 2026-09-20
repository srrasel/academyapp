import { Alert, Linking, Share } from 'react-native';

const RESOURCE_LINKS = {
  'Coaching workbook PDF': 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  'Reflection worksheet': 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  'Lesson summary': 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  'Practice worksheet': 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  'Practice exercises': 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
};

export async function openResource(label, lesson) {
  const url =
    (typeof label === 'object' ? label.url : null) ||
    RESOURCE_LINKS[label] ||
    lesson?.videoUrl ||
    lesson?.audioUrl;

  if (!url) {
    Alert.alert('Resource', `${label}\n\nThis resource will be available when content is uploaded.`);
    return;
  }

  Alert.alert(label, 'What would you like to do?', [
    {
      text: 'Open',
      onPress: async () => {
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        } else {
          Alert.alert('Unable to open', 'This resource link is not supported on your device.');
        }
      },
    },
    {
      text: 'Share',
      onPress: () =>
        Share.share({
          message: `${label} — Bridge Academy\n${url}`,
          url,
        }),
    },
    { text: 'Cancel', style: 'cancel' },
  ]);
}
