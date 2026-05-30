import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../tokens/colors';

export interface DotGridBackgroundProps {
  children?: React.ReactNode;
  style?: ViewStyle;
}

export default function DotGridBackground({
  children,
  style,
}: DotGridBackgroundProps) {
  return (
    <View style={[styles.container, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
