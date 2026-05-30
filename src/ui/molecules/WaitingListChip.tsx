import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../tokens/colors';
import { spacing, borderRadius } from '../tokens/spacing';
import { NeoText } from '../atoms';

export interface WaitingListChipProps {
  queueNumber: number;
  name: string;
  gamesPlayed: number;
  style?: ViewStyle;
}

export default function WaitingListChip({
  queueNumber,
  name,
  gamesPlayed,
  style,
}: WaitingListChipProps) {
  return (
    <View style={[styles.container, style]}>
      {/* Queue Number */}
      <View style={styles.queueCircle}>
        <NeoText variant="labelSm" color={colors.onBackground}>
          #{queueNumber}
        </NeoText>
      </View>

      {/* Name */}
      <NeoText variant="bodyBold" numberOfLines={1} style={styles.nameText}>
        {name}
      </NeoText>

      {/* Games Played */}
      <View style={styles.gamesBadge}>
        <NeoText variant="labelSm" color={colors.onSecondaryContainer} style={styles.gamesText}>
          {gamesPlayed}g
        </NeoText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: spacing.strokeThin,
    borderColor: colors.onBackground,
    borderRadius: borderRadius.DEFAULT,
    backgroundColor: '#ffffff',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    // Subtle shadow
    shadowColor: colors.onBackground,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  queueCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.onBackground,
    backgroundColor: colors.primaryContainer, // yellow
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  nameText: {
    fontSize: 14,
    marginRight: spacing.sm,
  },
  gamesBadge: {
    backgroundColor: colors.secondaryContainer, // blue tint
    borderRadius: borderRadius.sm,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: colors.onBackground,
  },
  gamesText: {
    fontSize: 9,
  },
});
