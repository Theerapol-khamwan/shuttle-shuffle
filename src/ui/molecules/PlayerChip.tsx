import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../tokens/colors';
import { spacing, borderRadius } from '../tokens/spacing';
import { NeoText } from '../atoms';

export interface PlayerChipProps {
  name: string;
  status?: 'playing' | 'waiting' | 'resting';
  gamesPlayed?: number;
  style?: ViewStyle;
}

export default function PlayerChip({
  name,
  status = 'waiting',
  gamesPlayed,
  style,
}: PlayerChipProps) {
  // Get initials
  const initials = name ? name.trim().slice(0, 2).toUpperCase() : '??';

  // Determine status dot color
  let statusColor = '#9e9e9e'; // default gray (resting)
  if (status === 'playing') {
    statusColor = '#4caf50'; // green
  } else if (status === 'waiting') {
    statusColor = '#2196f3'; // blue
  }

  // Generate avatar background color based on name hash for playful variance
  const getAvatarBg = (str: string) => {
    const hash = str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const variants = [
      colors.primaryContainer, // yellow
      colors.secondaryContainer, // blue
      colors.tertiaryContainer, // pink
    ];
    return variants[hash % variants.length];
  };

  const avatarBg = getAvatarBg(name);

  return (
    <View style={[styles.container, style]}>
      {/* Avatar with Initials */}
      <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
        <NeoText variant="label" color={colors.onBackground} style={styles.avatarText}>
          {initials}
        </NeoText>
      </View>

      {/* Name and Optional Games */}
      <View style={styles.textContainer}>
        <NeoText variant="bodyBold" numberOfLines={1} style={styles.nameText}>
          {name}
        </NeoText>
        {gamesPlayed !== undefined && (
          <NeoText variant="bodySm" color={colors.outline}>
            {gamesPlayed} เกม
          </NeoText>
        )}
      </View>

      {/* Status Dot */}
      <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: spacing.strokeThin,
    borderColor: colors.onBackground,
    backgroundColor: '#ffffff',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    minWidth: 140,
    maxWidth: 200,
    margin: spacing.xs,
    // Small solid shadow
    shadowColor: colors.onBackground,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.onBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '700',
  },
  textContainer: {
    flex: 1,
    marginRight: spacing.xs,
  },
  nameText: {
    fontSize: 14,
    lineHeight: 18,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.onBackground,
  },
});
