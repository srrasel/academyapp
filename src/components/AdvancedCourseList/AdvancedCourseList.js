import { useState } from 'react';
import { View, Text, Pressable, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocale } from '../../context/LocaleContext';
import { openWebUrl } from '../../utils/openWebUrl';
import { colors } from '../../theme/colors';
import { styles } from './AdvancedCourseList.styles';

function AdvancedCourseRow({ course, unlocked, expanded, onToggle, progressPercent }) {
  const { t } = useLocale();

  const openCourse = () => {
    if (!unlocked) {
      Alert.alert(
        t('myLearning.courseLockedTitle'),
        t('myLearning.advancedLocked', { percent: progressPercent })
      );
      return;
    }
    openWebUrl(course.url);
  };

  return (
    <View style={styles.row}>
      <Pressable style={styles.header} onPress={onToggle}>
        {course.imageUrl ? (
          <View style={[styles.thumbWrap, !unlocked && styles.thumbWrapLocked]}>
            <Image source={{ uri: course.imageUrl }} style={styles.thumb} />
            {!unlocked ? (
              <View style={styles.lockBadge}>
                <Ionicons name="lock-closed" size={12} color={colors.white} />
              </View>
            ) : null}
          </View>
        ) : (
          <View style={[styles.iconWrap, !unlocked && styles.iconWrapLocked]}>
            <Ionicons
              name={unlocked ? 'school-outline' : 'lock-closed'}
              size={18}
              color={unlocked ? colors.primary : colors.textMuted}
            />
          </View>
        )}
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={expanded ? 3 : 2}>
            {course.title}
          </Text>
          <Text style={styles.short} numberOfLines={1}>
            {course.short}
          </Text>
          {course.price ? <Text style={styles.priceInline}>{course.price}</Text> : null}
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textMuted}
        />
      </Pressable>

      {expanded ? (
        <View style={styles.details}>
          {course.imageUrl ? (
            <Image source={{ uri: course.imageUrl }} style={styles.detailImage} />
          ) : null}
          {course.duration ? <Text style={styles.meta}>{course.duration}</Text> : null}
          {course.price ? <Text style={styles.price}>{course.price}</Text> : null}
          <Pressable
            style={[styles.linkBtn, !unlocked && styles.linkBtnLocked]}
            onPress={openCourse}
          >
            <Text style={[styles.linkText, !unlocked && styles.linkTextLocked]}>
              {unlocked ? t('myLearning.openCourse') : t('myLearning.lockedUntilComplete')}
            </Text>
            <Ionicons
              name={unlocked ? 'open-outline' : 'lock-closed'}
              size={16}
              color={unlocked ? colors.white : colors.textMuted}
            />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

export default function AdvancedCourseList({
  courses,
  unlocked,
  progressPercent = 0,
  style,
}) {
  const [expandedId, setExpandedId] = useState(null);
  const { t } = useLocale();

  return (
    <View style={[styles.list, style]}>
      <Text style={styles.hint}>
        {unlocked
          ? t('myLearning.advancedUnlockedHint')
          : t('myLearning.advancedLocked', { percent: progressPercent })}
      </Text>
      {courses.map((course) => (
        <AdvancedCourseRow
          key={course.id}
          course={course}
          unlocked={unlocked}
          progressPercent={progressPercent}
          expanded={expandedId === course.id}
          onToggle={() =>
            setExpandedId((current) => (current === course.id ? null : course.id))
          }
        />
      ))}
    </View>
  );
}
