import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader/AppHeader';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import { getPractitionerToolkit } from '../../data/toolkit';
import { useLocale } from '../../context/LocaleContext';
import { useMembership } from '../../hooks/useMembership';
import { downloadAndSharePdf } from '../../utils/downloadPdf';
import { colors } from '../../theme/colors';
import { styles } from './ToolkitScreen.styles';

function ToolkitItemRow({ item, t, downloading, onPress, locked }) {
  const canDownload = Boolean(item.url) && !locked;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.item,
        pressed && !locked && styles.itemPressed,
        downloading && styles.itemDownloading,
        locked && styles.itemLocked,
      ]}
      onPress={onPress}
      disabled={downloading}
    >
      <View style={styles.itemIcon}>
        <Ionicons name={item.icon} size={22} color={colors.accentWarmDark} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemDesc}>{item.description}</Text>
        {item.relatedUnit ? <Text style={styles.itemMeta}>{item.relatedUnit}</Text> : null}
        <Text style={canDownload ? styles.itemAction : styles.itemSoon}>
          {locked
            ? t('membership.toolkitLockedTitle')
            : downloading
              ? t('membership.toolkitDownloading')
              : canDownload
                ? t('membership.toolkitDownloadAction')
                : t('membership.toolkitComingSoonShort')}
        </Text>
      </View>
      {downloading ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <Ionicons
          name={locked ? 'lock-closed' : canDownload ? 'download-outline' : 'time-outline'}
          size={20}
          color={canDownload ? colors.primary : colors.textMuted}
        />
      )}
    </Pressable>
  );
}

export default function ToolkitScreen({ navigation }) {
  const { t, locale } = useLocale();
  const { features } = useMembership();
  const toolkit = getPractitionerToolkit(locale);
  const trackers = toolkit.filter((item) => item.lessonId);
  const templates = toolkit.filter((item) => !item.lessonId);
  const [downloadingId, setDownloadingId] = useState(null);

  const access = features.toolkitAccess || (features.hasToolkit ? 'full' : 'none');
  const canUseTrackers = access === 'limited' || access === 'full';
  const canUseTemplates = access === 'full';

  const handlePress = async (item, allowed) => {
    if (!allowed) {
      Alert.alert(
        t('membership.toolkitLockedTitle'),
        access === 'limited'
          ? t('membership.toolkitSilverLimited')
          : t('membership.toolkitLockedBody'),
        [
          { text: t('common.cancel') || 'Cancel', style: 'cancel' },
          {
            text: t('membership.upgrade') || 'Upgrade',
            onPress: () => navigation.navigate('Membership'),
          },
        ]
      );
      return;
    }

    if (!item.url) {
      Alert.alert(item.title, t('membership.toolkitComingSoon'));
      return;
    }

    setDownloadingId(item.id);
    try {
      await downloadAndSharePdf(item.url, { title: item.title, folder: 'toolkit-pdfs' });
    } catch (error) {
      Alert.alert(
        item.title,
        error?.message
          ? `${t('membership.toolkitDownloadFailed')}\n\n${error.message}`
          : t('membership.toolkitDownloadFailed')
      );
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <SafeAreaView style={styles.scroll} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader variant="back" onBack={() => navigation.goBack()} />
        <Text style={styles.title}>{t('membership.toolkitTitle')}</Text>
        <Text style={styles.subtitle}>{t('membership.toolkitSubtitle')}</Text>

        {access === 'none' ? (
          <View style={styles.lockBanner}>
            <Ionicons name="lock-closed" size={20} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.lockTitle}>{t('membership.toolkitLockedTitle')}</Text>
              <Text style={styles.lockBody}>{t('membership.toolkitLockedBody')}</Text>
            </View>
          </View>
        ) : null}

        {access === 'limited' ? (
          <View style={styles.lockBanner}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <Text style={[styles.lockBody, { flex: 1 }]}>
              {t('membership.toolkitSilverLimited')}
            </Text>
          </View>
        ) : null}

        {access === 'none' ? (
          <PrimaryButton
            label={t('membership.upgrade')}
            onPress={() => navigation.navigate('Membership')}
            style={{ marginBottom: 16 }}
          />
        ) : null}

        <Text style={styles.sectionLabel}>{t('membership.toolkitTrackers')}</Text>
        {trackers.map((item) => (
          <ToolkitItemRow
            key={item.id}
            item={item}
            t={t}
            locked={!canUseTrackers}
            downloading={downloadingId === item.id}
            onPress={() => handlePress(item, canUseTrackers)}
          />
        ))}

        <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>
          {t('membership.toolkitTemplates')}
        </Text>
        {templates.map((item) => (
          <ToolkitItemRow
            key={item.id}
            item={item}
            t={t}
            locked={!canUseTemplates}
            downloading={downloadingId === item.id}
            onPress={() => handlePress(item, canUseTemplates)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
