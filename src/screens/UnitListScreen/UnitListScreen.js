import { ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader/AppHeader';
import UnitRow from '../../components/UnitRow/UnitRow';
import { useCourse } from '../../context/CourseContext';
import { useLocale } from '../../context/LocaleContext';
import { getLearnableUnitCount } from '../../utils/courseUnits';
import { styles } from './UnitListScreen.styles';

export default function UnitListScreen({ navigation }) {
  const { course, units, currentUnit } = useCourse();
  const { t } = useLocale();
  const unitCount = getLearnableUnitCount(units, course);

  const openUnit = (unit) => {
    if (unit.status === 'locked') return;
    navigation.navigate('UnitDetail', { unitId: unit.id });
  };

  return (
    <SafeAreaView style={styles.scroll} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader variant="back" onBack={() => navigation.goBack()} />
        <Text style={styles.title}>{t('course.allUnits')}</Text>
        <Text style={styles.subtitle}>
          {t('course.unitsInCourse', { count: unitCount })}
        </Text>

        <View style={styles.listCard}>
          {units.map((unit, index) => (
            <UnitRow
              key={unit.id}
              unit={unit}
              isActive={String(unit.id) === String(currentUnit?.id)}
              onPress={() => openUnit(unit)}
              showDivider={index < units.length - 1}
            />
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
