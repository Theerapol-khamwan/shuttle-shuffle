import React from 'react';
import { StyleSheet, View, ScrollView, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../tokens/colors';
import { spacing } from '../tokens/spacing';
import { DotGridBackground } from '../atoms';

export interface ScreenTemplateProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}

export default function ScreenTemplate({
  children,
  header,
  scrollable = false,
  style,
  contentContainerStyle,
}: ScreenTemplateProps) {
  return (
    <DotGridBackground>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <StatusBar style="dark" backgroundColor={colors.background} />        
        {/* Header */}
        {header}

        {/* Content Area */}
        {scrollable ? (
          <ScrollView
            style={[styles.scroll, style]}
            contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.content, style]}>
            {children}
          </View>
        )}
      </SafeAreaView>
    </DotGridBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl * 2, // extra padding for bottom buttons
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.md,
  },
});
