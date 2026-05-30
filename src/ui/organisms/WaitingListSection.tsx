import React from 'react';
import { View, StyleSheet, ScrollView, ViewStyle } from 'react-native';
import { colors } from '../tokens/colors';
import { spacing, borderRadius } from '../tokens/spacing';
import { NeoText, NeoBadge } from '../atoms';
import { WaitingListChip } from '../molecules';
import { Player } from '../../store/usePlayerStore';

export interface WaitingListSectionProps {
  waitingPlayers: Player[];
  style?: ViewStyle;
}

export default function WaitingListSection({
  waitingPlayers,
  style,
}: WaitingListSectionProps) {
  if (waitingPlayers.length === 0) return null;

  return (
    <View style={[styles.container, style]}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <NeoText variant="headlineMd" style={styles.headerText}>
          ⏳ รายการรอคิว
        </NeoText>
        <NeoBadge
          variant="count"
          label={`${waitingPlayers.length} คน`}
          style={styles.badge}
        />
      </View>

      {/* Horizontally scrolling list of chips for dashboard compact layout */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {waitingPlayers.map((p, index) => (
          <WaitingListChip
            key={p.id}
            queueNumber={index + 1}
            name={p.name}
            gamesPlayed={p.games_played}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerText: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  badge: {
    alignSelf: 'center',
  },
  scrollContent: {
    paddingLeft: spacing.xs,
    paddingRight: spacing.lg,
    paddingVertical: spacing.xs,
  },
});
