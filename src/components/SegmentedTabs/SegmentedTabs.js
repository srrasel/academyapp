import { View, Text, Pressable } from 'react-native';
import { styles } from './SegmentedTabs.styles';

export default function SegmentedTabs({ tabs, active, onChange }) {
  return (
    <View style={styles.row}>
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        return (
          <Pressable
            key={tab.key}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onChange(tab.key)}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
