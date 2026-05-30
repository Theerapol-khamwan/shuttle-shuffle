import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../tokens/colors';
import { spacing, borderRadius } from '../tokens/spacing';
import { NeoText, DoodleStar } from '../atoms';

export interface CostSummaryCardProps {
  totalCost: number;
  style?: ViewStyle;
}

export default function CostSummaryCard({
  totalCost,
  style,
}: CostSummaryCardProps) {
  return (
    <View style={[styles.container, style]}>
      {/* Decorative stars */}
      <DoodleStar size={16} rotation={15} style={styles.starLeft} />
      <DoodleStar size={20} rotation={45} style={styles.starRight} />

      <NeoText variant="label" color={colors.onPrimaryContainer} style={styles.label}>
        TOTAL SESSION COST / ยอดรวมทั้งหมด
      </NeoText>
      
      <View style={styles.amountRow}>
        <NeoText variant="display" color={colors.onPrimaryContainer} style={styles.currency}>
          ฿
        </NeoText>
        <NeoText variant="score" color={colors.onPrimaryContainer} style={styles.amount}>
          {totalCost.toFixed(2)}
        </NeoText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primaryContainer, // Signature Electric Yellow
    borderWidth: spacing.strokeThick,
    borderColor: colors.onBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.md,
    position: 'relative',
    transform: [{ rotate: '-1deg' }],
    // Thick shadow
    shadowColor: colors.onBackground,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currency: {
    fontSize: 32,
    fontWeight: '800',
    marginRight: 4,
    top: -5,
  },
  amount: {
    fontSize: 48,
    fontWeight: '900',
    lineHeight: 56,
  },
  starLeft: {
    position: 'absolute',
    left: 15,
    top: 15,
  },
  starRight: {
    position: 'absolute',
    right: 20,
    bottom: 15,
  },
});
