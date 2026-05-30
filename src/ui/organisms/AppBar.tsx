import React from 'react';
import { View, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { colors } from '../tokens/colors';
import { spacing } from '../tokens/spacing';
import { NeoText, NeoIcon } from '../atoms';

export interface AppBarProps {
  title: string;
  onLeftPress?: () => void;
  leftIcon?: string;
  onRightPress?: () => void;
  rightIcon?: string;
  style?: ViewStyle;
}

export default function AppBar({
  title,
  onLeftPress,
  leftIcon = 'hamburger',
  onRightPress,
  rightIcon,
  style,
}: AppBarProps) {
  return (
    <View style={[styles.container, style]}>
      {/* Left Icon */}
      <View style={styles.actionContainer}>
        {onLeftPress && (
          <Pressable onPress={onLeftPress} style={styles.iconButton}>
            <NeoIcon name={leftIcon} size={24} color={colors.onBackground} />
          </Pressable>
        )}
      </View>

      {/* Center Title */}
      <View style={styles.titleContainer}>
        <NeoText variant="label" style={styles.titleText}>
          {title}
        </NeoText>
      </View>

      {/* Right Icon */}
      <View style={styles.actionContainer}>
        {onRightPress && rightIcon && (
          <Pressable onPress={onRightPress} style={styles.iconButton}>
            <NeoIcon name={rightIcon} size={24} color={colors.onBackground} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderBottomWidth: spacing.strokeThick,
    borderBottomColor: colors.onBackground,
    paddingHorizontal: spacing.md,
  },
  actionContainer: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButton: {
    padding: spacing.xs,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
});
