import { Alert } from 'react-native';

export function showNotifications() {
  Alert.alert(
    'Notifications',
    'You are up to date! New lesson reminders and community replies will appear here.'
  );
}
