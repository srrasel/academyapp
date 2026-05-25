import { View, Image, Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { images } from '../../data/images';
import { styles } from './VideoPlayer.styles';

export default function VideoPlayer({ currentTime, duration, progress = 12 }) {
  return (
    <View style={styles.container}>
      <Image source={{ uri: images.welcome }} style={styles.video} resizeMode="cover" />
      <View style={styles.overlay}>
        <Ionicons name="play-circle" size={56} color={colors.white} />
      </View>
      <View style={styles.controls}>
        <Pressable style={styles.playBtn}>
          <Ionicons name="play" size={18} color={colors.white} />
        </Pressable>
        <View style={styles.sliderTrack}>
          <View style={[styles.sliderFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.time}>
          {currentTime} / {duration}
        </Text>
        <Ionicons name="expand-outline" size={20} color={colors.white} />
      </View>
    </View>
  );
}
