import { useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import PrimaryButton from '../PrimaryButton/PrimaryButton';
import OutlineButton from '../OutlineButton/OutlineButton';
import { useLocale } from '../../context/LocaleContext';
import { colors } from '../../theme/colors';
import { styles } from './ProfileAvatar.styles';

function getInitials(name) {
  return (name || 'L')
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function ProfileAvatar({
  name,
  photoUri,
  size = 96,
  editable = false,
  onPhotoChange,
  hint,
}) {
  const { t } = useLocale();
  const [pendingUri, setPendingUri] = useState(null);
  const [uploading, setUploading] = useState(false);
  const badgeSize = Math.round(size * 0.3);
  const fontSize = Math.round(size * 0.34);
  // Preview matches on-screen avatar size (circular profile).
  const previewSize = Math.max(size, 120);

  const openLibrary = async () => {
    if (!editable || !onPhotoChange) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        t('settings.photoPermissionTitle') || 'Permission needed',
        t('settings.photoPermissionMessage') ||
          'Allow photo library access to set your profile picture.'
      );
      return;
    }

    // Square crop so the result matches the circular profile avatar.
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setPendingUri(result.assets[0].uri);
    }
  };

  const handleUpload = async () => {
    if (!pendingUri || !onPhotoChange) return;
    setUploading(true);
    try {
      await onPhotoChange(pendingUri);
      setPendingUri(null);
    } catch {
      Alert.alert(
        t('common.error') || 'Error',
        t('settings.photoUploadFailed') || 'Could not upload photo. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleCancelPreview = () => {
    if (uploading) return;
    setPendingUri(null);
  };

  const avatar = (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={styles.image} resizeMode="cover" />
      ) : (
        <Text style={[styles.initials, { fontSize }]}>{getInitials(name)}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.wrap}>
      {editable ? (
        <Pressable onPress={openLibrary} style={styles.pressable} accessibilityRole="button">
          {avatar}
          <View
            style={[
              styles.editBadge,
              {
                width: badgeSize,
                height: badgeSize,
                borderRadius: badgeSize / 2,
              },
            ]}
          >
            <Ionicons name="camera" size={badgeSize * 0.5} color={colors.white} />
          </View>
        </Pressable>
      ) : (
        avatar
      )}
      {hint && !photoUri ? <Text style={styles.hint}>{hint}</Text> : null}

      <Modal
        visible={Boolean(pendingUri)}
        transparent
        animationType="fade"
        onRequestClose={handleCancelPreview}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {t('settings.photoPreviewTitle') || 'Upload profile picture'}
            </Text>
            <Text style={styles.modalSubtitle}>
              {t('settings.photoPreviewHint') ||
                'This is how your photo will look on your profile.'}
            </Text>

            <View
              style={[
                styles.previewAvatar,
                {
                  width: previewSize,
                  height: previewSize,
                  borderRadius: previewSize / 2,
                },
              ]}
            >
              {pendingUri ? (
                <Image
                  source={{ uri: pendingUri }}
                  style={styles.image}
                  resizeMode="cover"
                />
              ) : null}
            </View>

            {uploading ? (
              <ActivityIndicator color={colors.primary} style={{ marginVertical: 16 }} />
            ) : null}

            <PrimaryButton
              label={
                uploading
                  ? t('common.saving') || 'Uploading...'
                  : t('settings.uploadPhoto') || 'Upload picture'
              }
              onPress={handleUpload}
              disabled={uploading}
              style={styles.modalPrimaryBtn}
            />
            <OutlineButton
              label={t('settings.chooseDifferentPhoto') || 'Choose different photo'}
              onPress={() => {
                if (uploading) return;
                setPendingUri(null);
                openLibrary();
              }}
              disabled={uploading}
              style={styles.modalSecondaryBtn}
            />
            <Pressable onPress={handleCancelPreview} disabled={uploading} hitSlop={8}>
              <Text style={styles.cancelText}>{t('common.cancel') || 'Cancel'}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
