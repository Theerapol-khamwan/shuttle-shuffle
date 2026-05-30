import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Alert
} from 'react-native';
import { usePlayerStore } from '../src/store/usePlayerStore';
import { useRouter } from 'expo-router';
import { colors } from '../src/ui/tokens/colors';
import { spacing } from '../src/ui/tokens/spacing';
import { NeoText, NeoButton } from '../src/ui/atoms';
import { AppBar, CourtCard, WaitingListSection, SettingsModal } from '../src/ui/organisms';
import { ScreenTemplate } from '../src/ui/templates';

export default function Dashboard() {
  const { 
    players, 
    activeMatches, 
    currentSession,
    createMatch, 
    bulkMatchGeneration,
    loadCurrentSession,
    updateSessionSettings
  } = usePlayerStore();
  const router = useRouter();
  const [mode, setMode] = useState<'singles' | 'doubles'>('doubles');
  const [settingsVisible, setSettingsVisible] = useState(false);
  
  // Settings local state
  const [tempScore, setTempScore] = useState('21');
  const [tempDeuce, setTempDeuce] = useState(true);
  const [tempCourts, setTempCourts] = useState('1');

  useEffect(() => {
    loadCurrentSession();
  }, []);

  useEffect(() => {
    if (currentSession) {
      setTempScore(currentSession.winning_score.toString());
      setTempDeuce(currentSession.enable_deuce);
      setTempCourts((currentSession.total_courts || 1).toString());
    }
  }, [currentSession?.id]);

  const handleGenerateMatch = async () => {
    await createMatch(undefined, mode);
  };

  const handleMatchForCourt = async (courtNumber: number) => {
    await createMatch(courtNumber, mode);
  };

  const handleBulkGenerate = async () => {
    Alert.alert(
      'สุ่มล่วงหน้า',
      `คุณต้องการสุ่มประเภท ${mode === 'doubles' ? 'คู่' : 'เดี่ยว'} ล่วงหน้า 3 รอบใช่หรือไม่?`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { text: 'ตกลง', onPress: () => bulkMatchGeneration(3, mode) }
      ]
    );
  };

  const handleSaveSettings = async (scoreStr: string, deuceVal: boolean, courtsStr: string) => {
    const score = parseInt(scoreStr);
    if (isNaN(score) || score <= 0) {
      Alert.alert('ผิดพลาด', 'กรุณาระบุแต้มที่ชนะให้ถูกต้อง');
      return;
    }
    const courts = parseInt(courtsStr);
    if (isNaN(courts) || courts <= 0) {
      Alert.alert('ผิดพลาด', 'กรุณาระบุจำนวนสนามให้ถูกต้อง');
      return;
    }
    await updateSessionSettings(score, deuceVal, courts);
    setSettingsVisible(false);
  };

  const getPlayerName = (id: string) => {
    return players.find(p => p.id === id)?.name || 'Unknown';
  };

  // คำนวณรายชื่อคนรอคิว (Waiting List)
  const activePlayerIds = new Set();
  activeMatches.forEach(m => {
    activePlayerIds.add(m.team_a_p1);
    if (m.team_a_p2) activePlayerIds.add(m.team_a_p2);
    activePlayerIds.add(m.team_b_p1);
    if (m.team_b_p2) activePlayerIds.add(m.team_b_p2);
  });

  const waitingPlayers = players
    .filter(p => !activePlayerIds.has(p.id))
    .sort((a, b) => a.games_played - b.games_played);

  // ป้องกันค่า total_courts มากเกินไปจน Array.from() พัง (จำกัดสูงสุด 20 สนาม)
  const safeTotalCourts = Math.min(20, Math.max(1, Math.floor(Number(currentSession?.total_courts) || 1)));

  // Setup Custom App Bar header
  const appBarHeader = (
    <AppBar
      title="SHUTTLE SHUFFLE"
      leftIcon="arrow-back"
      onLeftPress={() => router.push('/player-setup')}
      rightIcon="settings"
      onRightPress={() => setSettingsVisible(true)}
    />
  );

  const isBtnDisabled = players.length < (mode === 'doubles' ? 4 : 2);

  return (
    <ScreenTemplate scrollable={true} header={appBarHeader} style={styles.screenContainer}>
      
      {/* Mode Selector Row */}
      <View style={styles.modeRow}>
        <View style={styles.flexHalf}>
          <NeoButton
            variant={mode === 'doubles' ? 'primary' : 'ghost'}
            title="ประเภทคู่"
            onPress={() => setMode('doubles')}
            fullWidth
          />
        </View>
        <View style={styles.flexHalf}>
          <NeoButton
            variant={mode === 'singles' ? 'primary' : 'ghost'}
            title="ประเภทเดี่ยว"
            onPress={() => setMode('singles')}
            fullWidth
          />
        </View>
      </View>

      {/* Generator Actions Row */}
      <View style={styles.actionRow}>
        <View style={styles.flexHalf}>
          <NeoButton
            variant="primary"
            title="เพิ่ม 1 แมตช์"
            disabled={isBtnDisabled}
            onPress={handleGenerateMatch}
            fullWidth
          />
        </View>
        <View style={styles.flexHalf}>
          <NeoButton
            variant="primary"
            title="สุ่มล่วงหน้า"
            disabled={isBtnDisabled}
            onPress={handleBulkGenerate}
            backgroundColor={colors.secondaryContainer} // sky blue
            fullWidth
          />
        </View>
      </View>

      {/* Waiting List Section */}
      <WaitingListSection waitingPlayers={waitingPlayers} />

      {/* Active Courts Section */}
      <View style={styles.courtsSection}>
        <NeoText variant="headlineMd" style={styles.sectionTitle}>
          🏸 สนามแข่งขัน ({safeTotalCourts} สนาม)
        </NeoText>
        
        {Array.from({ length: safeTotalCourts }, (_, i) => i + 1).map((courtNum) => {
          const courtMatches = activeMatches.filter(m => m.court_number === courtNum);
          const activeMatch = courtMatches[0]; // Take current match

          return (
            <CourtCard
              key={courtNum}
              courtNumber={courtNum}
              match={activeMatch}
              getPlayerName={getPlayerName}
              onRandomize={() => handleMatchForCourt(courtNum)}
              onEnterScore={(matchId) => router.push(`/scoreboard/${matchId}`)}
              disabledRandomize={isBtnDisabled}
            />
          );
        })}
      </View>

      {/* Dashboard Footer Navigation */}
      <View style={styles.footerPanel}>
        <View style={styles.navRow}>
          <View style={styles.flexHalf}>
            <NeoButton
              variant="ghost"
              title={`จัดการผู้เล่น (${players.length})`}
              onPress={() => router.push('/player-setup')}
              fullWidth
            />
          </View>
          <View style={styles.flexHalf}>
            <NeoButton
              variant="primary"
              title="💰 หารค่าใช้จ่าย"
              onPress={() => router.push({ pathname: '/summary', params: { tab: 'cost' } })}
              backgroundColor={colors.secondaryContainer}
              fullWidth
            />
          </View>
        </View>
        
        <View style={styles.endSessionWrapper}>
          <NeoButton
            variant="primary"
            title="สรุปผลและปิดรอบวัน"
            onPress={() => router.push({ pathname: '/summary', params: { tab: 'stats' } })}
            backgroundColor={colors.tertiaryContainer} // soft pink
            fullWidth
          />
        </View>
      </View>

      {/* Settings Modal (Self Contained Organism) */}
      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        onSave={handleSaveSettings}
        initialScore={tempScore}
        initialDeuce={tempDeuce}
        initialCourts={tempCourts}
      />
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
  },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
    width: '100%',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    width: '100%',
  },
  flexHalf: {
    flex: 1,
    marginHorizontal: 4,
  },
  courtsSection: {
    marginVertical: spacing.md,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  footerPanel: {
    marginTop: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1.5,
    borderColor: colors.outlineVariant,
    width: '100%',
  },
  navRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: spacing.md,
  },
  endSessionWrapper: {
    width: '100%',
    marginBottom: spacing.xl,
  },
});

