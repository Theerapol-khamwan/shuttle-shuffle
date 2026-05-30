import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { colors } from '../tokens/colors';
import { spacing, borderRadius } from '../tokens/spacing';
import { NeoText, NeoBadge } from '../atoms';

export interface ScorePanelProps {
  team: 'A' | 'B';
  score: number;
  label: string;
  isGamePoint: boolean;
  isServing: boolean;
  serviceSide?: 'LEFT' | 'RIGHT';
  onScoreChange: (team: 'A' | 'B', delta: number) => void;
  isLandscape?: boolean;
  style?: ViewStyle;
}

export default function ScorePanel({
  team,
  score,
  label,
  isGamePoint,
  isServing,
  serviceSide,
  onScoreChange,
  isLandscape = false,
  style,
}: ScorePanelProps) {
  const isTeamA = team === 'A';
  const panelBg = isTeamA ? colors.errorContainer : colors.secondaryContainer;
  const sideColor = isTeamA ? colors.error : colors.secondary;
  const rotation = isTeamA ? '-1.5deg' : '1.5deg';

  return (
    <View style={[styles.container, { backgroundColor: panelBg, padding: isLandscape ? spacing.xs : spacing.md }, style]}>
      {/* Team Info Panel */}
      <View style={styles.header}>
        <NeoText variant={isLandscape ? 'bodyBold' : 'headlineMd'} numberOfLines={1} style={[styles.teamLabel, { fontSize: isLandscape ? 15 : 20 }]}>
          {label}
        </NeoText>
        <NeoBadge
          variant="status"
          label={isTeamA ? 'RED' : 'BLUE'}
          backgroundColor={isTeamA ? colors.error : colors.secondary}
          color="#ffffff"
          style={styles.sideBadge}
        />
      </View>

      {/* Game Point Sticker */}
      {isGamePoint && (
        <NeoBadge
          variant="count"
          label="GAME POINT"
          backgroundColor={colors.primaryContainer}
          style={styles.gamePointBadge}
        />
      )}

      {/* Centered Score Text Container */}
      <View style={styles.scoreTextContainer}>
        <NeoText
          variant="scoreXl"
          color={colors.onBackground}
          style={[
            styles.scoreText,
            {
              fontSize: isLandscape ? 150 : 180,
              lineHeight: isLandscape ? 150 : 180,
              fontVariant: ['tabular-nums'],
            }
          ]}
        >
          {score}
        </NeoText>
      </View>

      {/* Service Indicator */}
      {isServing && serviceSide && (
        <View style={styles.serviceRow}>
          <NeoBadge
            variant="active"
            label={`SERVING ${serviceSide}`}
            backgroundColor={colors.primaryContainer}
            color={colors.onPrimaryContainer}
          />
        </View>
      )}

      {/* 50/50 Split Touch Screen Area covering the ENTIRE container including edges */}
      <View style={styles.absoluteTouchOverlay}>
        {/* Left Side (50% Width) - Decrement Score */}
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => onScoreChange(team, -1)}
          style={styles.halfTouch}
        />

        {/* Right Side (50% Width) - Increment Score */}
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => onScoreChange(team, 1)}
          style={styles.halfTouch}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: spacing.strokeThick,
    borderColor: colors.onBackground,
    margin: spacing.sm,
    borderRadius: borderRadius.lg,
    // Solid Shadow
    shadowColor: colors.onBackground,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  header: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: spacing.sm,
  },
  teamLabel: {
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  sideBadge: {
    alignSelf: 'center',
    borderWidth: 1.5,
  },
  gamePointBadge: {
    alignSelf: 'center',
    transform: [{ rotate: '-4deg' }],
  },
  scoreTextContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  scoreText: {
    fontWeight: '900',
    textAlign: 'center',
  },
  serviceRow: {
    height: 36,
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  absoluteTouchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  halfTouch: {
    flex: 1,
    height: '100%',
  },
});
