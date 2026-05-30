import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../tokens/colors';

export interface ScoreboardTemplateProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  style?: ViewStyle;
}

export default function ScoreboardTemplate({
  children,
  header,
  style,
}: ScoreboardTemplateProps) {
  return (
    <View style={[styles.container, style]}>
      {/* Hide status bar for full immersion */}
      <StatusBar hidden />
      
      {/* Header */}
      {header}

      {/* Main Content Area */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // Off-white matching Stitch design
  },
  content: {
    flex: 1,
  },
});
