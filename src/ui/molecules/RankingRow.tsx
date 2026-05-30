import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../tokens/colors';
import { spacing, borderRadius } from '../tokens/spacing';
import { NeoText, NeoBadge } from '../atoms';

export interface RankingRowProps {
  rank: number;
  name: string;
  games: number;
  wins: number;
  losses: number;
  style?: ViewStyle;
}

export default function RankingRow({
  rank,
  name,
  games,
  wins,
  losses,
  style,
}: RankingRowProps) {
  // Determine left accent color and styles based on rank
  let rankColor: string = colors.onBackground;
  let rankBg = '#ffffff';


  if (rank === 1) {
    rankColor = colors.primaryContainer; // Gold/Electric Yellow
    rankBg = colors.primaryFixed;
  } else if (rank === 2) {
    rankColor = colors.secondaryContainer; // Sky Blue
    rankBg = colors.secondaryFixed;
  } else if (rank === 3) {
    rankColor = colors.tertiaryContainer; // Soft Pink
    rankBg = colors.tertiaryFixed;
  }

  // Dynamic cosmetic level badge based on win rate / wins
  let skillLevel = 'Beg';
  if (wins >= 5) {
    skillLevel = 'Pro';
  } else if (wins >= 2) {
    skillLevel = 'Inter';
  }

  const initials = name ? name.trim().slice(0, 2).toUpperCase() : '??';

  return (
    <View style={[styles.container, { borderLeftColor: rankColor }, style]}>
      {/* Rank Number */}
      <View style={[styles.rankBox, { backgroundColor: rankBg }]}>
        <NeoText variant="headlineMobile" style={styles.rankText}>
          #{rank}
        </NeoText>
      </View>

      {/* Initials Avatar */}
      <View style={[styles.avatar, { backgroundColor: rankColor }]}>
        <NeoText variant="label" style={styles.avatarText}>
          {initials}
        </NeoText>
      </View>

      {/* Name and Level Badge */}
      <View style={styles.playerInfo}>
        <NeoText variant="bodyBold" numberOfLines={1}>
          {name}
        </NeoText>
        <View style={styles.badgeRow}>
          <NeoBadge variant="level" label={skillLevel} />
          <NeoText variant="bodySm" color={colors.outline} style={styles.gamesPlayedText}>
            เล่น {games} เกม
          </NeoText>
        </View>
      </View>

      {/* W-L Record */}
      <View style={styles.recordContainer}>
        <NeoText variant="headlineMobile" color={colors.primary}>
          {wins}
        </NeoText>
        <NeoText variant="bodySm" color={colors.outline} style={styles.recordSeparator}>
          W
        </NeoText>
        <NeoText variant="headlineMobile" color={colors.error}>
          {losses}
        </NeoText>
        <NeoText variant="bodySm" color={colors.outline} style={styles.recordSeparator}>
          L
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
    borderLeftWidth: 6, // Thick accent border on the left
    borderRadius: borderRadius.DEFAULT,
    backgroundColor: '#ffffff',
    padding: spacing.md,
    marginVertical: spacing.sm,
    // Subtle shadow
    shadowColor: colors.onBackground,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  rankBox: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.sm,
    borderWidth: 1.5,
    borderColor: colors.onBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  rankText: {
    fontSize: 16,
    fontWeight: '800',
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
    fontSize: 11,
  },
  playerInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  gamesPlayedText: {
    marginLeft: spacing.sm,
    fontSize: 12,
  },
  recordContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'flex-end',
    minWidth: 70,
  },
  recordSeparator: {
    fontSize: 10,
    marginLeft: 2,
    marginRight: 4,
    fontWeight: '700',
  },
});
