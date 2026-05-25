import { View, Text, Pressable } from 'react-native';
import { styles } from './ContentTabs.styles';

export default function ContentTabs({ tabs, active, onChange }) {
  return (
    <View style={styles.row}>
      {tabs.map((tab) => {
        const isActive = active === tab;
        return (
          <Pressable
            key={tab}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onChange(tab)}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
