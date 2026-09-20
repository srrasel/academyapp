import { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PrimaryButton from '../PrimaryButton/PrimaryButton';
import { colors } from '../../theme/colors';
import { styles } from './NoteEditorModal.styles';

export default function NoteEditorModal({
  visible,
  title = 'Lesson Notes',
  value,
  onChangeText,
  onSave,
  onClose,
  savingLabel = 'Save Note',
}) {
  const insets = useSafeAreaInsets();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (!visible) {
      setKeyboardHeight(0);
      return undefined;
    }

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates?.height || 0);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [visible]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
          <View
            style={[
              styles.card,
              {
                paddingBottom: Math.max(insets.bottom, 16),
                marginBottom: Platform.OS === 'android' ? keyboardHeight : 0,
              },
            ]}
          >
            <View style={styles.handle} />
            <Text style={styles.title}>{title}</Text>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <TextInput
                style={styles.input}
                multiline
                autoFocus
                value={value}
                onChangeText={onChangeText}
                placeholder="Write your notes..."
                placeholderTextColor={colors.textMuted}
                textAlignVertical="top"
              />
              <PrimaryButton label={savingLabel} onPress={onSave} />
              <Pressable onPress={onClose} style={styles.cancelBtn} hitSlop={8}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
