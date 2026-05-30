import React, { useRef } from 'react';
import {
  Pressable,
  Animated,
  StyleSheet,
  ViewStyle,
  View,
} from 'react-native';
import { colors } from '../tokens/colors';
import { spacing, borderRadius } from '../tokens/spacing';
import NeoText from './NeoText';

export type NeoButtonVariant = 'primary' | 'ghost' | 'icon';

export interface NeoButtonProps {
  variant?: NeoButtonVariant;
  size?: 'sm' | 'md';
  title?: string;
  onPress?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  fullWidth?: boolean;
  backgroundColor?: string;
}

export default function NeoButton({
  variant = 'primary',
  size = 'md',
  title,
  onPress,
  disabled = false,
  icon,
  style,
  fullWidth = false,
  backgroundColor,
}: NeoButtonProps) {
  // Animation values for translation
  const translateAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(translateAnim, {
      toValue: { x: 4, y: 4 },
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    Animated.spring(translateAnim, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  };

  const isIcon = variant === 'icon';
  const isGhost = variant === 'ghost';
  const isSm = size === 'sm';

  const containerStyle: ViewStyle = {
    opacity: disabled ? 0.5 : 1,
    alignSelf: fullWidth ? 'stretch' : 'flex-start',
    width: fullWidth ? '100%' : undefined,
    ...style,
  };

  // Determine solid background color override
  const solidBgStyle = !isGhost && backgroundColor ? { backgroundColor } : null;

  return (
    <View style={[styles.container, containerStyle]}>
      {/* 1. Shadow Layer (only for primary and icon) */}
      {!isGhost && !disabled && (
        <View style={styles.shadowLayer} />
      )}

      {/* 2. Main Button Layer (Animated) */}
      <Animated.View
        style={[
          styles.buttonBase,
          isGhost ? styles.buttonGhost : styles.buttonSolid,
          solidBgStyle,
          {
            width: fullWidth && !isIcon ? '100%' : undefined,
            transform: [
              { translateX: translateAnim.x },
              { translateY: translateAnim.y },
            ],
          },
        ]}
      >
        <Pressable
          onPress={disabled ? undefined : onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={({ pressed }) => [
            styles.pressable,
            isIcon ? styles.pressableIcon : (isSm ? styles.pressableTextSm : styles.pressableText),
            {
              width: fullWidth && !isIcon ? '100%' : undefined,
            }
          ]}
        >
          {icon && <View style={title ? styles.iconMargin : null}>{icon}</View>}
          {title && !isIcon && (
            <NeoText variant={isSm ? 'labelSm' : 'label'} color={colors.onBackground}>
              {title}
            </NeoText>
          )}
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  shadowLayer: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 0,
    bottom: 0,
    backgroundColor: colors.onBackground,
    borderRadius: borderRadius.DEFAULT,
  },
  buttonBase: {
    borderRadius: borderRadius.DEFAULT,
    borderColor: colors.onBackground,
    overflow: 'hidden',
  },
  buttonSolid: {
    backgroundColor: colors.primaryContainer, // Signature Electric Yellow
    borderWidth: spacing.strokeThick,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  pressable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressableText: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    minHeight: 48,
  },
  pressableTextSm: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    minHeight: 36,
  },
  pressableIcon: {
    width: 48 - (spacing.strokeThick * 2), // Adjust according to border size
    height: 48 - (spacing.strokeThick * 2),
  },
  iconMargin: {
    marginRight: spacing.sm,
  },
});
