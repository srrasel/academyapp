import { useState } from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getMembershipFeatures } from '../../constants/membership';
import { colors } from '../../theme/colors';
import { styles } from './CertificatePreview.styles';

const logoImage = require('../../../assets/logo.png');

function buildCertificateId(recipient = '') {
  const year = new Date().getFullYear();
  const initials =
    recipient
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 3) || 'BA';
  return `BA-${year}-${initials}`;
}

export default function CertificatePreview({
  certificate,
  progressPercent = 0,
  defaultExpanded = false,
}) {
  const { recipient, course, academy, date, unlocked } = certificate;
  const [expanded, setExpanded] = useState(defaultExpanded || unlocked);

  const certificateId = buildCertificateId(recipient);
  const tierFeatures = getMembershipFeatures(certificate.membershipTier || 'free');

  return (
    <View style={styles.wrap}>
      <Pressable
        style={styles.summaryRow}
        onPress={() => setExpanded((prev) => !prev)}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
      >
        <View style={[styles.summaryIcon, !unlocked && styles.summaryIconLocked]}>
          <Ionicons
            name={unlocked ? 'ribbon' : 'lock-closed'}
            size={18}
            color={unlocked ? colors.gold : colors.primary}
          />
        </View>
        <View style={styles.summaryTextCol}>
          <Text style={styles.summaryTitle} numberOfLines={1}>
            {course || 'Certificate of Completion'}
          </Text>
          <Text style={styles.summaryMeta} numberOfLines={1}>
            {unlocked
              ? `Unlocked · ${date}`
              : `Locked · ${progressPercent}% complete`}
          </Text>
        </View>
        {!unlocked ? (
          <View style={styles.summaryLockPill}>
            <Ionicons name="lock-closed" size={12} color={colors.primary} />
          </View>
        ) : null}
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.textMuted}
        />
      </Pressable>

      {expanded ? (
        <View style={styles.outer}>
          <LinearGradient
            colors={[colors.primary, colors.navy]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerBand}
          >
            <View style={styles.logoWrap}>
              <Image source={logoImage} style={styles.logo} resizeMode="contain" />
            </View>
            <Text style={styles.headerTagline}>{academy}</Text>
          </LinearGradient>

          <View style={styles.body}>
            {!unlocked ? (
              <View style={styles.lockedBanner}>
                <Ionicons name="lock-closed" size={14} color={colors.primary} />
                <Text style={styles.lockedBannerText}>
                  Complete all units to unlock · {progressPercent}%
                </Text>
              </View>
            ) : null}

            <View style={styles.ornamentRow}>
              <View style={styles.ornamentLine} />
              <View style={styles.ornamentDot} />
              <View style={styles.ornamentLine} />
            </View>

            <Text style={styles.certLabel}>CERTIFICATE OF COMPLETION</Text>
            {tierFeatures.certificateSigned ? (
              <Text style={styles.certType}>Official signed & stamped PDF</Text>
            ) : (
              <Text style={styles.certType}>PDF Certificate Standard</Text>
            )}
            <Text style={styles.presentedTo}>This certificate is proudly presented to</Text>
            <Text style={styles.recipient}>{recipient}</Text>
            <Text style={styles.completedText}>for successfully completing</Text>
            <Text style={styles.courseTitle}>{course}</Text>

            <View style={styles.footerRow}>
              <View style={styles.footerMeta}>
                <Text style={styles.footerLabel}>Date issued</Text>
                <Text style={styles.footerValue}>{unlocked ? date : 'Pending'}</Text>
                <Text style={styles.footerId}>ID: {certificateId}</Text>
              </View>
              <View style={styles.sealWrap}>
                <View style={styles.sealOuter}>
                  <View style={styles.sealInner}>
                    <Ionicons name="ribbon" size={22} color={colors.gold} />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}
