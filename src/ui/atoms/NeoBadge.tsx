import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { colors } from '../tokens/colors';
import { spacing, borderRadius } from '../tokens/spacing';
import NeoText from './NeoText';

export type NeoBadgeVariant = 'active' | 'level' | 'status' | 'count';

export interface NeoBadgeProps {
  variant?: NeoBadgeVariant;
  label: string;
  color?: string; // Color override for text/dot
  backgroundColor?: string; // Background color override
  style?: ViewStyle;
}

export default function NeoBadge({
  variant = 'status',
  label,
  color,
  backgroundColor,
  style,
}: NeoBadgeProps) {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (variant === 'active') {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [variant]);

  // Determine styles based on variant
  let badgeStyle: ViewStyle = {};
  let textVariant: any = 'labelSm';
  let textColor: string = colors.onSurface;
  let bg: string = colors.surfaceContainerHigh;


  switch (variant) {
    case 'active':
      bg = colors.errorContainer;
      textColor = color || colors.onErrorContainer;
      badgeStyle = {
        paddingLeft: spacing.xs, // make room for dot
        paddingRight: spacing.sm,
        paddingVertical: 4,
        borderRadius: borderRadius.sm,
        borderWidth: spacing.strokeThin,
      };
      break;

    case 'level':
      bg = colors.surfaceVariant;
      textColor = color || colors.onSurface;
      badgeStyle = {
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.full,
        borderWidth: spacing.strokeThin,
      };
      break;

    case 'status':
      bg = colors.surfaceContainerHigh;
      textColor = color || colors.onSurface;
      badgeStyle = {
        paddingHorizontal: spacing.md,
        paddingVertical: 4,
        borderRadius: borderRadius.full,
        borderWidth: spacing.strokeThin,
      };
      break;

    case 'count':
      bg = colors.tertiaryContainer;
      textColor = color || colors.onTertiaryContainer;
      badgeStyle = {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.md,
        borderWidth: spacing.strokeThick,
        transform: [{ rotate: '2deg' }],
        // 2px solid shadow
        shadowColor: colors.onBackground,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 2,
      };
      textVariant = 'label';
      break;
  }

  // Allow style overrides
  const finalBadgeStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.onBackground,
    backgroundColor: backgroundColor || bg,
    alignSelf: 'flex-start',
    ...badgeStyle,
    ...style,
  };

  return (
    <View style={finalBadgeStyle}>
      {variant === 'active' && (
        <Animated.View
          style={[
            styles.dot,
            {
              backgroundColor: color || colors.error,
              opacity: pulseAnim,
            },
          ]}
        />
      )}
      <NeoText variant={textVariant} color={textColor}>
        {label}
      </NeoText>
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
});
