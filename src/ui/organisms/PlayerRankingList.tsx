import React from 'react';
import { View, StyleSheet, FlatList, ViewStyle } from 'react-native';
import { colors } from '../tokens/colors';
import { spacing } from '../tokens/spacing';
import { NeoText } from '../atoms';
import { RankingRow } from '../molecules';

export interface PlayerStat {
  id: string;
  name: string;
  games: number;
  wins: number;
  losses: number;
}

export interface PlayerRankingListProps {
  stats: PlayerStat[];
  style?: ViewStyle;
}

export default function PlayerRankingList({
  stats,
  style,
}: PlayerRankingListProps) {
  if (stats.length === 0) {
    return (
      <View style={[styles.emptyContainer, style]}>
        <NeoText variant="body" color={colors.outline}>
          ยังไม่มีสถิติผู้เล่น สถิติจะปรากฏขึ้นหลังแข่งจบแมตช์
        </NeoText>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {/* Table Header */}
      <View style={styles.tableHeader}>
        <NeoText variant="labelSm" color={colors.outline} style={styles.headerLabelLeft}>
          อันดับ & ผู้เล่น (RANK & PLAYER)
        </NeoText>
        <NeoText variant="labelSm" color={colors.outline} style={styles.headerLabelRight}>
          สถิติ ชนะ-แพ้ (W-L)
        </NeoText>
      </View>

      {/* List */}
      <FlatList
        data={stats}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <RankingRow
            rank={index + 1}
            name={item.name}
            games={item.games}
            wins={item.wins}
            losses={item.losses}
          />
        )}
        scrollEnabled={false} // since it is inside summary ScrollView
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.xs,
  },
  headerLabelLeft: {
    fontSize: 10,
  },
  headerLabelRight: {
    fontSize: 10,
    textAlign: 'right',
  },
  listContent: {
    paddingBottom: spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
});
