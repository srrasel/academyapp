import { Component } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { colors } from '../../theme/colors';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    console.error('App error:', error);
  }

  render() {
    if (this.state.error) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            padding: 24,
            backgroundColor: colors.background,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 12 }}>
            Something went wrong
          </Text>
          <ScrollView style={{ maxHeight: 200, marginBottom: 20 }}>
            <Text style={{ color: colors.textMuted, fontSize: 14 }}>
              {this.state.error?.message || 'Unknown error'}
            </Text>
          </ScrollView>
          <Pressable
            onPress={() => this.setState({ error: null })}
            style={{
              backgroundColor: colors.primary,
              padding: 14,
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: colors.white, fontWeight: '600' }}>Try again</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}
