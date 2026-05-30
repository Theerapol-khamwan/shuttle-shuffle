import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../tokens/colors';
import { spacing, borderRadius } from '../tokens/spacing';
import { NeoText, NeoBadge } from '../atoms';

export interface CourtHeaderProps {
  courtNumber: number;
  isActive: boolean;
  style?: ViewStyle;
}

export default function CourtHeader({
  courtNumber,
  isActive,
  style,
}: CourtHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      {/* Court Number Pill */}
      <View style={styles.pill}>
        <NeoText variant="label" color={colors.onBackground} style={styles.pillText}>
          COURT {courtNumber}
        </NeoText>
      </View>

      {/* Status Badge */}
      <NeoBadge
        variant={isActive ? 'active' : 'status'}
        label={isActive ? 'ACTIVE' : 'VACANT'}
        backgroundColor={isActive ? colors.errorContainer : colors.surfaceContainerHigh}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: spacing.sm,
  },
  pill: {
    backgroundColor: colors.primaryContainer, // Electric Yellow
    borderWidth: spacing.strokeThick,
    borderColor: colors.onBackground,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    transform: [{ rotate: '-2deg' }],
    // Subtle shadow
    shadowColor: colors.onBackground,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '800',
  },
});
