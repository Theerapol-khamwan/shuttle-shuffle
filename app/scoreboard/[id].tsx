import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Alert,
  useWindowDimensions
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePlayerStore } from '../../src/store/usePlayerStore';
import { checkWinner, isGamePoint, getServiceSide } from '../../src/logic/scoreboard';
import { colors } from '../../src/ui/tokens/colors';
import { spacing, borderRadius } from '../../src/ui/tokens/spacing';
import { NeoText, NeoButton, NeoIcon } from '../../src/ui/atoms';
import { ScorePanel, AppBar } from '../../src/ui/organisms';
import { ScoreboardTemplate } from '../../src/ui/templates';

export default function Scoreboard() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { activeMatches, players, currentSession, updateScore, completeMatch } = usePlayerStore();
  const { width, height } = useWindowDimensions();
  
  const match = activeMatches.find(m => m.id === id);
  
  const [scoreA, setScoreA] = useState(match?.team_a_score || 0);
  const [scoreB, setScoreB] = useState(match?.team_b_score || 0);
  const [servingTeam, setServingTeam] = useState<'A' | 'B'>('A');
  const [showControls, setShowControls] = useState(false);

  const isLandscape = width > height;
  const winningScore = currentSession?.winning_score || 21;
  const deuceEnabled = currentSession?.enable_deuce ?? true;
  const rules = { winningScore, deuceEnabled };

  useEffect(() => {
    if (match) {
      setScoreA(match.team_a_score);
      setScoreB(match.team_b_score);
    }
  }, [match?.id]);

  if (!match) {
    return (
      <View style={styles.center}>
        <NeoText variant="bodyBold">ไม่พบข้อมูลแมตช์</NeoText>
        <NeoButton
          variant="primary"
          title="กลับไปที่แดชบอร์ด"
          onPress={() => router.back()}
          style={styles.backBtnCenter}
        />
      </View>
    );
  }

  // Check Game Point
  const isGamePointA = isGamePoint(scoreA, scoreB, rules);
  const isGamePointB = isGamePoint(scoreB, scoreA, rules);

  const handleScoreChange = async (team: 'A' | 'B', delta: number) => {
    let newA = scoreA;
    let newB = scoreB;

    if (team === 'A') {
      newA = Math.max(0, scoreA + delta);
      setScoreA(newA);
      if (delta > 0) setServingTeam('A');
    } else {
      newB = Math.max(0, scoreB + delta);
      setScoreB(newB);
      if (delta > 0) setServingTeam('B');
    }

    await updateScore(id, newA, newB);

    const winner = checkWinner(newA, newB, rules);
    if (winner && delta > 0) {
      Alert.alert(
        'จบเกม!',
        `ทีม ${winner === 'A' ? 'A' : 'B'} เป็นฝ่ายชนะด้วยคะแนน ${newA} - ${newB}`,
        [{ text: 'ตกลง' }]
      );
    }
  };

  const handleFinishMatch = () => {
    Alert.alert(
      'จบการแข่งขัน',
      'คุณต้องการบันทึกผลการแข่งขันและจบแมตช์นี้ใช่หรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { text: 'จบแมตช์', style: 'default', onPress: async () => {
          await completeMatch(id, scoreA, scoreB);
          router.replace('/dashboard');
        }}
      ]
    );
  };

  const getPlayerName = (pid: string) => {
    return players.find(p => p.id === pid)?.name || 'Unknown';
  };

  const currentServingScore = servingTeam === 'A' ? scoreA : scoreB;
  const serviceSide = getServiceSide(currentServingScore);

  return (
    <ScoreboardTemplate>
      {/* Score Panels (Side by Side or Stacked) */}
      <View style={[styles.scoreboardBody, { flexDirection: isLandscape ? 'row' : 'column' }]}>
        <ScorePanel 
          team="A" 
          score={scoreA} 
          isGamePoint={isGamePointA}
          label={`${getPlayerName(match.team_a_p1)}${match.team_a_p2 ? ` & ${getPlayerName(match.team_a_p2)}` : ''}`}
          isServing={servingTeam === 'A'}
          serviceSide={serviceSide}
          onScoreChange={handleScoreChange}
          isLandscape={isLandscape}
        />
        <ScorePanel 
          team="B" 
          score={scoreB} 
          isGamePoint={isGamePointB}
          label={`${getPlayerName(match.team_b_p1)}${match.team_b_p2 ? ` & ${getPlayerName(match.team_b_p2)}` : ''}`}
          isServing={servingTeam === 'B'}
          serviceSide={serviceSide}
          onScoreChange={handleScoreChange}
          isLandscape={isLandscape}
        />
      </View>

      {/* Floating Menu Button (Neo Styled Hamburger/Close) */}
      <NeoButton
        variant="icon"
        icon={
          <NeoIcon
            name={showControls ? 'close' : 'menu'}
            size={24}
            color={colors.onBackground}
          />
        }
        onPress={() => setShowControls(!showControls)}
        style={{
          ...styles.menuToggleBtn,
          opacity: showControls ? 1.0 : 0.4
        }}
      />

      {/* Controls Overlay Card (Neo Styled Dropdown) */}
      {showControls && (
        <View style={styles.controlsOverlay}>
          <NeoButton
            size="sm"
            variant="ghost"
            title="กลับหน้าหลัก"
            onPress={() => router.back()}
            fullWidth
            style={styles.overlayBtn}
          />
          <View style={{ height: spacing.xs }} />
          <NeoButton
            size="sm"
            variant="ghost"
            title="สลับผู้เสิร์ฟ"
            onPress={() => setServingTeam(servingTeam === 'A' ? 'B' : 'A')}
            fullWidth
            style={styles.overlayBtn}
          />
          <View style={{ height: spacing.xs }} />
          <NeoButton
            size="sm"
            variant="primary"
            title="จบการแข่งขัน"
            onPress={handleFinishMatch}
            backgroundColor={colors.errorContainer} // soft pink
            fullWidth
            style={styles.overlayBtn}
          />
        </View>
      )}
    </ScoreboardTemplate>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  backBtnCenter: {
    marginTop: spacing.lg,
  },
  scoreboardBody: {
    flex: 1,
    padding: spacing.sm,
  },
  menuToggleBtn: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    zIndex: 100,
  },
  controlsOverlay: {
    position: 'absolute',
    top: 70,
    right: spacing.md,
    width: 200,
    backgroundColor: '#ffffff',
    borderWidth: spacing.strokeThick,
    borderColor: colors.onBackground,
    borderRadius: borderRadius.md,
    flexDirection: 'column',
    padding: spacing.sm,
    zIndex: 90,
    // Solid Shadow
    shadowColor: colors.onBackground,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  overlayBtn: {
    minHeight: 40,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
});

