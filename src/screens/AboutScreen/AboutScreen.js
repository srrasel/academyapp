import { Image, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader/AppHeader';
import { useLocale } from '../../context/LocaleContext';
import { images } from '../../data/images';
import { styles } from './AboutScreen.styles';

const LEARN_POINTS = [
  'about.learnInteractive',
  'about.learnPractical',
  'about.learnExamples',
  'about.learnInsights',
];

export default function AboutScreen({ navigation }) {
  const { t } = useLocale();

  return (
    <SafeAreaView style={styles.scroll} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader variant="back" onBack={() => navigation.goBack()} />

        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>{t('about.welcomeTitle')}</Text>
          <Text style={styles.welcomeBody}>{t('about.welcomeP1')}</Text>
          <Text style={styles.welcomeBody}>{t('about.welcomeP2')}</Text>

          <Text style={styles.welcomeListIntro}>{t('about.learnIntro')}</Text>
          {LEARN_POINTS.map((key) => (
            <View key={key} style={styles.welcomeBulletRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.welcomeBulletText}>{t(key)}</Text>
            </View>
          ))}

          <Text style={styles.welcomeBody}>{t('about.welcomeP4')}</Text>
          <Text style={styles.welcomeBody}>{t('about.welcomeP5')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('about.creatorTitle')}</Text>
          <View style={styles.creatorBlock}>
            <Image source={images.drMerijn} style={styles.creatorPhoto} />
            <View style={styles.creatorMeta}>
              <Text style={styles.creatorName}>{t('about.creatorName')}</Text>
              <Text style={styles.creatorRole}>{t('about.creatorRole')}</Text>
            </View>
          </View>
          <Text style={styles.body}>{t('about.creatorBio1')}</Text>
          <Text style={styles.body}>{t('about.creatorBio2')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('about.feedbackTitle')}</Text>
          <Text style={styles.body}>{t('about.feedbackP1')}</Text>
          <Text style={styles.body}>{t('about.feedbackP2')}</Text>
          <Text style={styles.body}>{t('about.feedbackP3')}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('about.thanksTitle')}</Text>
          <Text style={styles.body}>{t('about.thanksP1')}</Text>
          <Text style={styles.body}>{t('about.thanksP2')}</Text>
          <Text style={styles.closing}>{t('about.thanksClosing')}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
