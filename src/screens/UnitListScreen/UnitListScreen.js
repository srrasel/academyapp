import { ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader/AppHeader';
import UnitRow from '../../components/UnitRow/UnitRow';
import OutlineButton from '../../components/OutlineButton/OutlineButton';
import { units, course } from '../../data/course';
import { styles } from './UnitListScreen.styles';

export default function UnitListScreen({ navigation }) {
  const openUnit = (unit) => {
    if (unit.status === 'locked') return;
    navigation.navigate('UnitDetail', { unitId: unit.id });
  };

  return (
    <SafeAreaView style={styles.scroll} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader variant="back" onBack={() => navigation.goBack()} />
        <Text style={styles.title}>All Units</Text>
        <Text style={styles.subtitle}>{course.totalUnits} Units in this course</Text>

        {units.map((unit) => (
          <UnitRow key={unit.id} unit={unit} onPress={() => openUnit(unit)} />
        ))}

        <OutlineButton label="View All Units" onPress={() => {}} />
      </ScrollView>
    </SafeAreaView>
  );
}
