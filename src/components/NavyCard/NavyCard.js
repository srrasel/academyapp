import { View, Text, Pressable } from 'react-native';
import ProgressRing from '../ProgressRing/ProgressRing';
import { styles } from './NavyCard.styles';

export default function NavyCard({
  label,
  title,
  subtitle,
  meta,
  percent,
  buttonLabel,
  onButtonPress,
}) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <ProgressRing percent={percent} />
        <View style={styles.content}>
          {label ? <Text style={styles.label}>{label}</Text> : null}
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          {meta ? <Text style={styles.meta}>{meta}</Text> : null}
          {buttonLabel ? (
            <Pressable style={styles.smallBtn} onPress={onButtonPress}>
              <Text style={styles.smallBtnText}>{buttonLabel}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}
