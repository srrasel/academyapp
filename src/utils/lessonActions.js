import { Alert, Share } from 'react-native';

export function handleLessonAction(key, { lesson, onAddNote, onDownload, onBookmark }) {
  switch (key) {
    case 'note':
      onAddNote?.();
      break;
    case 'download':
      if (onDownload) {
        onDownload();
      } else {
        Alert.alert(
          'Download',
          lesson?.videoUrl || lesson?.audioUrl
            ? 'Lesson media is ready. Use your device browser to save the file from the shared link.'
            : 'No downloadable media for this lesson yet.'
        );
      }
      break;
    case 'share':
      Share.share({
        message: `Check out "${lesson?.title || 'this lesson'}" on Bridge Academy!`,
        url: lesson?.videoUrl || lesson?.audioUrl || undefined,
      });
      break;
    case 'more':
      Alert.alert('Lesson options', 'Choose an action', [
        { text: 'Add Bookmark', onPress: () => onBookmark?.() },
        { text: 'Cancel', style: 'cancel' },
      ]);
      break;
    default:
      break;
  }
}
