import { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import PrimaryButton from '../PrimaryButton/PrimaryButton';
import { useLocale } from '../../context/LocaleContext';
import { SPONSORED_ADS, pickSponsoredAd } from '../../data/ads';
import { nextAdRotationIndex } from '../../services/adFrequencyService';
import { openWebUrl } from '../../utils/openWebUrl';
import { styles } from './AdBanner.styles';

export default function AdBanner({
  onContinue,
  compact = false,
  onNavigate,
}) {
  const { t } = useLocale();
  const [ad, setAd] = useState(() => pickSponsoredAd(0));

  useEffect(() => {
    let active = true;
    nextAdRotationIndex(SPONSORED_ADS.length).then((index) => {
      if (active) setAd(SPONSORED_ADS[index] || pickSponsoredAd(index));
    });
    return () => {
      active = false;
    };
  }, []);

  const handleCta = async () => {
    if (ad.navigateTo && onNavigate) {
      onNavigate(ad.navigateTo);
      return;
    }
    if (ad.url) {
      await openWebUrl(ad.url);
    }
  };

  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <Text style={styles.label}>{t('membership.adLabel')}</Text>
      <Text style={styles.title}>{ad.title}</Text>
      <Text style={styles.body}>{ad.body}</Text>
      <Text style={styles.sponsor}>{ad.sponsor}</Text>

      {compact ? (
        <Pressable onPress={handleCta} hitSlop={6}>
          <Text style={styles.linkCta}>{ad.cta}</Text>
        </Pressable>
      ) : (
        <View style={styles.actions}>
          {(ad.url || ad.navigateTo) && (
            <PrimaryButton label={ad.cta} onPress={handleCta} style={styles.secondaryCta} />
          )}
          <PrimaryButton
            label={t('membership.continueLearning')}
            onPress={onContinue}
          />
        </View>
      )}
    </View>
  );
}
