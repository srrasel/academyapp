import { View, Text, Pressable } from 'react-native';
import ProgressRing from '../ProgressRing/ProgressRing';
import { styles } from './NavyCard.styles';

export default function NavyCard({
  layout = 'horizontal',
  label,
  title,
  subtitle,
  meta,
  percent = 0,
  buttonLabel,
  onButtonPress,
  onPress,
}) {
  const content =
    layout === 'stacked' ? (
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.stackedRow}>
          <Text style={styles.meta}>{meta}</Text>
          <ProgressRing percent={percent} />
        </View>
      </View>
    ) : (
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

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }

  return content;
}
