import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../tokens/colors';
import { spacing, borderRadius } from '../tokens/spacing';
import { NeoText, NeoButton } from '../atoms';
import { CourtHeader } from '../molecules';
import { Match } from '../../store/usePlayerStore';

export interface CourtCardProps {
  courtNumber: number;
  match?: Match;
  getPlayerName: (id: string) => string;
  onRandomize: () => void;
  onEnterScore: (matchId: string) => void;
  disabledRandomize?: boolean;
  style?: ViewStyle;
}

export default function CourtCard({
  courtNumber,
  match,
  getPlayerName,
  onRandomize,
  onEnterScore,
  disabledRandomize = false,
  style,
}: CourtCardProps) {
  const isActive = !!match;

  if (!isActive) {
    return (
      <View style={[styles.container, styles.vacantContainer, style]}>
        <CourtHeader courtNumber={courtNumber} isActive={false} />
        
        <View style={styles.vacantBody}>
          <NeoText variant="bodySm" color={colors.outline} style={styles.vacantText}>
            คอร์ตว่าง — ไม่มีผู้เล่นแข่งขันขณะนี้
          </NeoText>
          <NeoButton
            variant="primary"
            title="＋ สุ่มลงคอร์ตนี้"
            onPress={onRandomize}
            disabled={disabledRandomize}
            fullWidth
          />
        </View>
      </View>
    );
  }

  // Active state match details
  const teamAPlayer1 = getPlayerName(match.team_a_p1);
  const teamAPlayer2 = match.team_a_p2 ? getPlayerName(match.team_a_p2) : null;
  const teamBPlayer1 = getPlayerName(match.team_b_p1);
  const teamBPlayer2 = match.team_b_p2 ? getPlayerName(match.team_b_p2) : null;

  return (
    <View style={[styles.container, styles.activeContainer, style]}>
      <CourtHeader courtNumber={courtNumber} isActive={true} />

      {/* Versus section */}
      <View style={styles.vsContainer}>
        {/* Team A (Red Side - errorContainer bg) */}
        <View style={[styles.teamBox, styles.teamA]}>
          <NeoText variant="bodyBold" numberOfLines={1} style={styles.playerText}>
            {teamAPlayer1}
          </NeoText>
          {teamAPlayer2 && (
            <NeoText variant="bodyBold" numberOfLines={1} style={styles.playerText}>
              {teamAPlayer2}
            </NeoText>
          )}
          <View style={styles.scoreBadgeA}>
            <NeoText variant="headlineMobile" color={colors.error}>
              {match.team_a_score}
            </NeoText>
          </View>
        </View>

        {/* VS circle */}
        <View style={styles.vsCircle}>
          <NeoText variant="labelSm" color={colors.onBackground}>
            VS
          </NeoText>
        </View>

        {/* Team B (Blue Side - secondaryContainer bg) */}
        <View style={[styles.teamBox, styles.teamB]}>
          <NeoText variant="bodyBold" numberOfLines={1} style={styles.playerText}>
            {teamBPlayer1}
          </NeoText>
          {teamBPlayer2 && (
            <NeoText variant="bodyBold" numberOfLines={1} style={styles.playerText}>
              {teamBPlayer2}
            </NeoText>
          )}
          <View style={styles.scoreBadgeB}>
            <NeoText variant="headlineMobile" color={colors.secondary}>
              {match.team_b_score}
            </NeoText>
          </View>
        </View>
      </View>

      {/* Footer CTA */}
      <View style={styles.footer}>
        <NeoButton
          variant="primary"
          title="บันทึกคะแนน (SCORE)"
          onPress={() => onEnterScore(match.id)}
          fullWidth
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: spacing.strokeThick,
    borderColor: colors.onBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    backgroundColor: '#ffffff',
    marginVertical: spacing.sm,
    // Subtle shadow
    shadowColor: colors.onBackground,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  activeContainer: {
    transform: [{ rotate: '0.5deg' }],
  },
  vacantContainer: {
    borderStyle: 'dashed',
    backgroundColor: colors.surfaceContainerLow,
    shadowOffset: { width: 2, height: 2 },
    elevation: 2,
  },
  vacantBody: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  vacantText: {
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  vsContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginVertical: spacing.md,
    minHeight: 100,
    position: 'relative',
  },
  teamBox: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.onBackground,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    justifyContent: 'center',
  },
  teamA: {
    backgroundColor: colors.errorContainer, // Pink tint
    marginRight: spacing.sm,
  },
  teamB: {
    backgroundColor: colors.secondaryContainer, // Blue tint
    marginLeft: spacing.sm,
  },
  playerText: {
    fontSize: 14,
    marginBottom: 4,
  },
  vsCircle: {
    position: 'absolute',
    alignSelf: 'center',
    left: '50%',
    marginLeft: -18,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.onBackground,
    backgroundColor: colors.primaryContainer, // yellow
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: colors.onBackground,
    shadowOffset: { width: 1.5, height: 1.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 1,
  },
  scoreBadgeA: {
    position: 'absolute',
    bottom: -10,
    right: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: colors.onBackground,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
  },
  scoreBadgeB: {
    position: 'absolute',
    bottom: -10,
    left: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: colors.onBackground,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
  },
  footer: {
    marginTop: spacing.sm,
  },
});
