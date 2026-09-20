import { Modal, View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ProfileAvatar from '../ProfileAvatar/ProfileAvatar';
import { useAuth } from '../../context/AuthContext';
import { useLocale } from '../../context/LocaleContext';
import { colors } from '../../theme/colors';
import { styles } from './SideMenu.styles';

const APP_LINKS = [
  {
    key: 'MyLearning',
    labelKey: 'tabs.myLearning',
    icon: 'book-outline',
    tab: 'MyLearning',
    iconColor: '#7C3AED',
    iconBg: '#EDE9FE',
  },
  {
    key: 'Progress',
    labelKey: 'menu.myProgress',
    icon: 'stats-chart-outline',
    tab: 'Progress',
    iconColor: '#2563EB',
    iconBg: '#DBEAFE',
  },
  {
    key: 'Community',
    labelKey: 'tabs.community',
    icon: 'people-outline',
    tab: 'Community',
    iconColor: '#059669',
    iconBg: '#D1FAE5',
  },
];

const COURSE_LINKS = [
  {
    key: 'CourseOverview',
    labelKey: 'course.overview',
    icon: 'school-outline',
    screen: 'CourseOverview',
    iconColor: '#0284C7',
    iconBg: '#E0F2FE',
  },
  {
    key: 'UnitList',
    labelKey: 'course.allUnits',
    icon: 'list-outline',
    screen: 'UnitList',
    iconColor: '#EA580C',
    iconBg: '#FFEDD5',
  },
  {
    key: 'Toolkit',
    labelKey: 'membership.toolkitTitle',
    icon: 'briefcase-outline',
    screen: 'Toolkit',
    iconColor: '#7C3AED',
    iconBg: '#EDE9FE',
  },
  {
    key: 'Membership',
    labelKey: 'membership.title',
    icon: 'diamond-outline',
    screen: 'Membership',
    iconColor: '#D4A84B',
    iconBg: '#FEF3C7',
  },
];

const ABOUT_LINKS = [
  {
    key: 'About',
    labelKey: 'about.menuTitle',
    icon: 'people-outline',
    screen: 'About',
    iconColor: '#0D9488',
    iconBg: '#CCFBF1',
  },
];

function SectionBar({ label, icon, color }) {
  return (
    <View style={[styles.sectionBar, { backgroundColor: color }]}>
      <Ionicons name={icon} size={16} color={colors.white} />
      <Text style={styles.sectionBarText}>{label}</Text>
    </View>
  );
}

function NavRow({ icon, label, onPress, iconColor, iconBg }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.navItem, pressed && styles.navItemPressed]}
      onPress={onPress}
    >
      <View style={[styles.navIconWrap, { backgroundColor: iconBg || colors.primaryLight }]}>
        <Ionicons name={icon} size={18} color={iconColor || colors.primary} />
      </View>
      <Text style={styles.navLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

export default function SideMenu({ visible, onClose }) {
  const navigation = useNavigation();
  const { profile, signOut, updateProfile } = useAuth();
  const { t } = useLocale();

  const goToTab = (tabName) => {
    onClose();
    navigation.navigate('MainTabs', { screen: tabName });
  };

  const goToScreen = (screenName) => {
    onClose();
    navigation.navigate(screenName);
  };

  const handleSignOut = async () => {
    onClose();
    await signOut();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.panel} edges={['top', 'bottom']}>
          <View style={styles.header}>
            <ProfileAvatar
              name={profile?.displayName}
              photoUri={profile?.photoUri}
              size={64}
              editable
              onPhotoChange={async (photoUri) => {
                await updateProfile({ photoUri });
              }}
              hint={profile?.photoUri ? undefined : t('settings.photoHint')}
            />
            <Text style={styles.headerName}>{profile?.displayName || t('common.learner')}</Text>
          </View>

          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
            <SectionBar label={t('menu.app')} icon="grid-outline" color="#4A86E8" />
            {APP_LINKS.map((item) => (
              <NavRow
                key={item.key}
                icon={item.icon}
                label={t(item.labelKey)}
                iconColor={item.iconColor}
                iconBg={item.iconBg}
                onPress={() => goToTab(item.tab)}
              />
            ))}

            <SectionBar label={t('menu.course')} icon="school-outline" color="#2DAAB8" />
            {COURSE_LINKS.map((item) => (
              <NavRow
                key={item.key}
                icon={item.icon}
                label={t(item.labelKey)}
                iconColor={item.iconColor}
                iconBg={item.iconBg}
                onPress={() => goToScreen(item.screen)}
              />
            ))}

            <SectionBar label={t('menu.about')} icon="information-circle-outline" color="#6A5ACD" />
            {ABOUT_LINKS.map((item) => (
              <NavRow
                key={item.key}
                icon={item.icon}
                label={t(item.labelKey)}
                iconColor={item.iconColor}
                iconBg={item.iconBg}
                onPress={() => goToScreen(item.screen)}
              />
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <Pressable style={styles.signOut} onPress={handleSignOut}>
              <View style={styles.signOutIconWrap}>
                <Ionicons name="log-out-outline" size={18} color="#DC2626" />
              </View>
              <Text style={styles.signOutText}>{t('common.signOut')}</Text>
            </Pressable>
          </View>
        </SafeAreaView>
        <Pressable style={styles.backdrop} onPress={onClose} />
      </View>
    </Modal>
  );
}
