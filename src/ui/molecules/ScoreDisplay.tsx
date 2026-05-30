import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../tokens/colors';
import { spacing, borderRadius } from '../tokens/spacing';
import { NeoText, NeoButton } from '../atoms';

export interface ScoreDisplayProps {
  score: number;
  onIncrement: () => void;
  onDecrement: () => void;
  title?: string;
  backgroundColor?: string;
  tiltDirection?: 'left' | 'right' | 'none';
  style?: ViewStyle;
}

export default function ScoreDisplay({
  score,
  onIncrement,
  onDecrement,
  title,
  backgroundColor = '#ffffff',
  tiltDirection = 'none',
  style,
}: ScoreDisplayProps) {
  // Determine rotation style
  let rotation = '0deg';
  if (tiltDirection === 'left') {
    rotation = '-2deg';
  } else if (tiltDirection === 'right') {
    rotation = '2deg';
  }

  const cardStyle: ViewStyle = {
    backgroundColor,
    borderWidth: spacing.strokeThick,
    borderColor: colors.onBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: rotation }],
    // 4px solid shadow
    shadowColor: colors.onBackground,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  };

  return (
    <View style={[styles.container, style]}>
      {title && (
        <NeoText variant="label" style={styles.titleText}>
          {title}
        </NeoText>
      )}

      {/* Score Card */}
      <View style={cardStyle}>
        <NeoText variant="scoreXl" style={styles.scoreText}>
          {score}
        </NeoText>
      </View>

      {/* Control Buttons */}
      <View style={styles.controlsRow}>
        <NeoButton
          variant="primary"
          title="－"
          onPress={onDecrement}
          backgroundColor={colors.surfaceContainerHighest}
          style={styles.controlButtonMinus}
        />
        <NeoButton
          variant="primary"
          title="＋"
          onPress={onIncrement}
          backgroundColor={colors.primaryContainer}
          style={styles.controlButtonPlus}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: spacing.md,
  },
  titleText: {
    marginBottom: spacing.sm,
    letterSpacing: 1,
  },
  scoreText: {
    // Text shadow to make it pop even more
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  controlsRow: {
    flexDirection: 'row',
    marginTop: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  controlButtonMinus: {
    marginRight: spacing.md,
  },
  controlButtonPlus: {
    marginLeft: spacing.md,
  },
});

