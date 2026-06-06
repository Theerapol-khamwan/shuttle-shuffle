import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Alert,
  useWindowDimensions,
  Modal,
  Pressable
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();
  const { activeMatches, players, currentSession, updateScore, completeMatch } = usePlayerStore();
  const { width, height } = useWindowDimensions();
  
  const match = activeMatches.find(m => m.id === id);
  
  const [scoreA, setScoreA] = useState(match?.team_a_score || 0);
  const [scoreB, setScoreB] = useState(match?.team_b_score || 0);
  const [servingTeam, setServingTeam] = useState<'A' | 'B'>('A');
  const [showControls, setShowControls] = useState(false);
  const [isSwapped, setIsSwapped] = useState(false);

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

  const panelA = (
    <ScorePanel 
      key="teamA"
      team="A" 
      score={scoreA} 
      isGamePoint={isGamePointA}
      label={`${getPlayerName(match.team_a_p1)}${match.team_a_p2 ? ` & ${getPlayerName(match.team_a_p2)}` : ''}`}
      isServing={servingTeam === 'A'}
      serviceSide={serviceSide}
      onScoreChange={handleScoreChange}
      isLandscape={isLandscape}
    />
  );

  const panelB = (
    <ScorePanel 
      key="teamB"
      team="B" 
      score={scoreB} 
      isGamePoint={isGamePointB}
      label={`${getPlayerName(match.team_b_p1)}${match.team_b_p2 ? ` & ${getPlayerName(match.team_b_p2)}` : ''}`}
      isServing={servingTeam === 'B'}
      serviceSide={serviceSide}
      onScoreChange={handleScoreChange}
      isLandscape={isLandscape}
    />
  );

  return (
    <ScoreboardTemplate
      header={
        <AppBar 
          title="SCOREBOARD" 
          leftIcon="menu" 
          onLeftPress={() => setShowControls(true)} 
          style={[styles.appBar, isLandscape && styles.appBarLandscape]}
        />
      }
    >
      {/* Score Panels (Side by Side or Stacked) */}
      <View style={[styles.scoreboardBody, { flexDirection: isLandscape ? 'row' : 'column' }]}>
        {isSwapped ? [panelB, panelA] : [panelA, panelB]}
      </View>

      {/* Full-Screen Menu Modal */}
      <Modal
        visible={showControls}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={() => setShowControls(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowControls(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <NeoText variant="headlineMd">การจัดการแมตช์</NeoText>
              <NeoButton
                variant="icon"
                icon={<NeoIcon name="close" size={24} color={colors.onBackground} />}
                onPress={() => setShowControls(false)}
                style={styles.closeBtn}
              />
            </View>

            <View style={styles.modalBody}>
              <NeoButton
                variant="secondary"
                title="🔄 สลับผู้เสิร์ฟ"
                onPress={() => {
                  setServingTeam(servingTeam === 'A' ? 'B' : 'A');
                  setShowControls(false);
                }}
                fullWidth
                style={styles.modalBtn}
              />
              <NeoButton
                variant="secondary"
                title="🔁 สลับฝั่งคอร์ต"
                onPress={() => {
                  setIsSwapped(!isSwapped);
                  setShowControls(false);
                }}
                fullWidth
                style={styles.modalBtn}
              />
              <NeoButton
                variant="primary"
                title="จบการแข่งขัน 🏁"
                backgroundColor={colors.errorContainer}
                onPress={() => {
                  setShowControls(false);
                  handleFinishMatch();
                }}
                fullWidth
                style={styles.modalBtn}
              />
              <View style={styles.modalDivider} />
              <NeoButton
                variant="ghost"
                title="กลับหน้าหลัก"
                onPress={() => {
                  setShowControls(false);
                  router.back();
                }}
                fullWidth
                style={styles.modalBtn}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
  appBar: {
    paddingTop: spacing.md, // Give space for status bar
    height: 70, // Slightly taller for the padding
    shadowColor: colors.onBackground,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    zIndex: 10,
  },
  appBarLandscape: {
    paddingTop: spacing.xs,
    height: 48,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.background,
    borderWidth: spacing.strokeThick,
    borderColor: colors.onBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    shadowColor: colors.onBackground,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  closeBtn: {
    minWidth: 40,
    minHeight: 40,
  },
  modalBody: {
    gap: spacing.md,
  },
  modalBtn: {
    minHeight: 52,
  },
  modalDivider: {
    height: 1.5,
    backgroundColor: colors.outlineVariant,
    borderStyle: 'dashed',
    marginVertical: spacing.xs,
  },
});

