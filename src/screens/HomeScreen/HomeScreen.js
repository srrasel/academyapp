import { ScrollView, View, Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTabBarPadding } from '../../hooks/useTabBarPadding';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader/AppHeader';
import NavyCard from '../../components/NavyCard/NavyCard';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import AdBanner from '../../components/AdBanner/AdBanner';
import { useLocale } from '../../context/LocaleContext';
import { useCourse } from '../../context/CourseContext';
import { useMenu } from '../../context/MenuContext';
import { useAuth } from '../../context/AuthContext';
import { useMembership } from '../../hooks/useMembership';
import { showNotifications } from '../../utils/notifications';
import { buildProgressStats } from '../../services/progressService';
import { getUnitDisplayNumber, getUnitDisplayTitle } from '../../utils/courseUnits';
import { getQuoteOfDay } from '../../data/quotes';
import { images } from '../../data/images';
import { colors } from '../../theme/colors';
import { styles } from './HomeScreen.styles';

export default function HomeScreen({ navigation }) {
  const { t, locale } = useLocale();
  const { profile } = useAuth();
  const { openMenu } = useMenu();
  const { features } = useMembership();
  const { course, currentUnit, progress, units } = useCourse();
  const stats = buildProgressStats(course, units, progress);
  const safeUnit = currentUnit ?? { id: '2', displayNumber: 1, completed: 0, total: 1 };
  const unitDisplayNumber = getUnitDisplayNumber(safeUnit);
  const unitProgress = safeUnit.total
    ? Math.round((safeUnit.completed / safeUnit.total) * 100)
    : 0;
  const bottomPad = useTabBarPadding();
  const name = profile?.displayName?.split(' ')[0] || 'Sarah';
  const quote = getQuoteOfDay(locale);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}>
        <AppHeader onMenuPress={openMenu} onNotificationsPress={showNotifications} />
        <Text style={styles.greeting}>{t('home.greeting', { name })}</Text>
        <Text style={styles.subGreeting}>
          {stats.percent > 0
            ? t('home.subGreeting')
            : t('home.subGreetingStart')}
        </Text>

        <NavyCard
          label={t('home.mainProgress')}
          subtitle={t('home.unitsCompleted', {
            completed: stats.unitsCompleted,
            total: stats.totalUnits,
          })}
          percent={stats.percent}
          buttonLabel={t('home.continueUnit', { id: unitDisplayNumber })}
          onButtonPress={() =>
            navigation.navigate('UnitDetail', { unitId: safeUnit.id })
          }
        />

        <SectionHeader title={t('home.currentUnit')} />
        <View style={styles.unitCard}>
          <View style={styles.unitRow}>
            <Image source={images.welcome} style={styles.thumb} />
            <View style={styles.unitInfo}>
              <Text style={styles.unitTitle}>
                {t('course.unitLabel', { id: unitDisplayNumber })}: {getUnitDisplayTitle(safeUnit)}
              </Text>
              <ProgressBar progress={unitProgress} />
              <Text style={styles.unitMeta}>
                {t('home.subunitsCompleted', {
                  completed: safeUnit.completed,
                  total: safeUnit.total,
                })}
              </Text>
            </View>
          </View>
          <PrimaryButton
            label={t('home.continueLearning')}
            onPress={() =>
              navigation.navigate('UnitDetail', { unitId: safeUnit.id })
            }
            style={styles.continueBtn}
          />
        </View>

        <SectionHeader title={t('home.quoteOfDay')} />
        <View style={styles.quoteCard}>
          <Ionicons name="chatbox-ellipses-outline" size={28} color={colors.primary} />
          <View style={styles.quoteBody}>
            <Text style={styles.quoteText}>"{quote.text}"</Text>
            <Text style={styles.quoteAuthor}>— {quote.author}</Text>
          </View>
        </View>

        {features.hasAds ? (
          <View style={{ marginTop: 16 }}>
            <AdBanner
              compact
              onContinue={() => navigation.navigate('Membership')}
              onNavigate={(screen) => navigation.navigate(screen)}
            />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
