import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  Alert,
  Modal,
  TextInput,
  Switch,
  ScrollView
} from 'react-native';
import { usePlayerStore } from '../src/store/usePlayerStore';
import { useRouter } from 'expo-router';

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

  const handleSaveSettings = async () => {
    const score = parseInt(tempScore);
    if (isNaN(score) || score <= 0) {
      Alert.alert('ผิดพลาด', 'กรุณาระบุแต้มที่ชนะให้ถูกต้อง');
      return;
    }
    const courts = parseInt(tempCourts);
    if (isNaN(courts) || courts <= 0) {
      Alert.alert('ผิดพลาด', 'กรุณาระบุจำนวนสนามให้ถูกต้อง');
      return;
    }
    await updateSessionSettings(score, tempDeuce, courts);
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

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>🏟 Match List</Text>
          <TouchableOpacity onPress={() => setSettingsVisible(true)} style={styles.settingsIcon}>
            <Text style={styles.settingsIconText}>⚙️ ตั้งค่า</Text>
          </TouchableOpacity>
        </View>
        
        {/* Mode Selector */}
        <View style={styles.modeSelector}>
          <TouchableOpacity 
            style={[styles.modeButton, mode === 'doubles' && styles.modeButtonActive]}
            onPress={() => setMode('doubles')}
          >
            <Text style={[styles.modeButtonText, mode === 'doubles' && styles.modeButtonTextActive]}>ประเภทคู่</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.modeButton, mode === 'singles' && styles.modeButtonActive]}
            onPress={() => setMode('singles')}
          >
            <Text style={[styles.modeButtonText, mode === 'singles' && styles.modeButtonTextActive]}>ประเภทเดี่ยว</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.generateButton, players.length < (mode === 'doubles' ? 4 : 2) && styles.disabledButton]} 
            onPress={handleGenerateMatch}
            disabled={players.length < (mode === 'doubles' ? 4 : 2)}
          >
            <Text style={styles.generateButtonText}>เพิ่ม 1 แมตช์</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.bulkButton, players.length < (mode === 'doubles' ? 4 : 2) && styles.disabledButton]} 
            onPress={handleBulkGenerate}
            disabled={players.length < (mode === 'doubles' ? 4 : 2)}
          >
            <Text style={styles.bulkButtonText}>สุ่มล่วงหน้า</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollBody}>
        {/* Waiting List Section */}
        {waitingPlayers.length > 0 && (
          <View style={styles.waitingSection}>
            <Text style={styles.sectionTitle}>⏳ รอคิว ({waitingPlayers.length})</Text>
            <View style={styles.waitingList}>
              {waitingPlayers.map((p, index) => (
                <View key={p.id} style={styles.waitingBadge}>
                  <Text style={styles.waitingName}>{index + 1}. {p.name}</Text>
                  <Text style={styles.waitingGames}>{p.games_played} เกม</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Active Matches - Grouped by Court */}
        <View style={styles.matchesSection}>
          <Text style={styles.sectionTitle}>🏸 สนามแข่งขัน ({safeTotalCourts} สนาม)</Text>
          {Array.from({ length: safeTotalCourts }, (_, i) => i + 1).map((courtNum) => {
            const courtMatches = activeMatches.filter(m => m.court_number === courtNum);
            const isVacant = courtMatches.length === 0;

            return (
              <View key={courtNum}>
                <Text style={styles.courtGroupLabel}>🏟 คอร์ต {courtNum}</Text>
                {isVacant ? (
                  <View style={styles.vacantCourtCard}>
                    <Text style={styles.vacantCourtText}>ว่าง – ยังไม่มีแมตช์</Text>
                    <TouchableOpacity
                      style={[styles.vacantMatchButton, players.length < (mode === 'doubles' ? 4 : 2) && styles.disabledButton]}
                      onPress={() => handleMatchForCourt(courtNum)}
                      disabled={players.length < (mode === 'doubles' ? 4 : 2)}
                    >
                      <Text style={styles.vacantMatchButtonText}>+ สุ่มลงคอร์ตนี้</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  courtMatches.map((item) => (
                    <View key={item.id} style={styles.matchCard}>
                      <Text style={styles.courtLabel}>คอร์ต {item.court_number} • {item.team_a_p2 ? 'คู่' : 'เดี่ยว'}</Text>
                      <View style={styles.teamsContainer}>
                        <View style={styles.team}>
                          <Text style={styles.playerName}>{getPlayerName(item.team_a_p1)}</Text>
                          {item.team_a_p2 && <Text style={styles.playerName}>{getPlayerName(item.team_a_p2)}</Text>}
                        </View>
                        <Text style={styles.vs}>VS</Text>
                        <View style={styles.team}>
                          <Text style={styles.playerName}>{getPlayerName(item.team_b_p1)}</Text>
                          {item.team_b_p2 && <Text style={styles.playerName}>{getPlayerName(item.team_b_p2)}</Text>}
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.scoreButton}
                        onPress={() => router.push(`/scoreboard/${item.id}`)}
                      >
                        <Text style={styles.scoreButtonText}>เปิด Scoreboard ({item.team_a_score} - {item.team_b_score})</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <TouchableOpacity 
            style={[styles.manageButton, { flex: 1, marginRight: 8 }]}
            onPress={() => router.push('/player-setup')}
          >
            <Text style={styles.manageButtonText}>จัดการผู้เล่น ({players.length})</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.costCalcButton}
            onPress={() => router.push({ pathname: '/summary', params: { tab: 'cost' } })}
          >
            <Text style={styles.costCalcButtonText}>💰 หารค่าใช้จ่าย</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={styles.endSessionButton}
          onPress={() => router.push({ pathname: '/summary', params: { tab: 'stats' } })}
        >
          <Text style={styles.endSessionButtonText}>สรุปผลและปิดรอบวัน</Text>
        </TouchableOpacity>
      </View>

      {/* Settings Modal */}
      <Modal
        visible={settingsVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSettingsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>⚙️ ตั้งค่าเกม (Match Settings)</Text>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>แต้มที่ชนะ (Winning Score):</Text>
              <TextInput
                style={styles.settingInput}
                keyboardType="numeric"
                value={tempScore}
                onChangeText={setTempScore}
                placeholder="เช่น 21"
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>จำนวนสนาม (Courts):</Text>
              <TextInput
                style={styles.settingInput}
                keyboardType="numeric"
                value={tempCourts}
                onChangeText={setTempCourts}
                placeholder="เช่น 1"
              />
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>ระบบ Deuce (ดิวส์):</Text>
              <Switch
                value={tempDeuce}
                onValueChange={setTempDeuce}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={tempDeuce ? "#2196F3" : "#f4f3f4"}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setSettingsVisible(false)}
              >
                <Text style={styles.cancelButtonText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={handleSaveSettings}
              >
                <Text style={styles.saveButtonText}>บันทึก</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  headerSection: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  settingsIcon: {
    padding: 5,
  },
  settingsIconText: {
    color: '#6200EE',
    fontWeight: 'bold',
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: '#eee',
    borderRadius: 8,
    padding: 4,
    marginBottom: 15,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  modeButtonActive: {
    backgroundColor: '#fff',
    elevation: 2,
  },
  modeButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },
  modeButtonTextActive: {
    color: '#6200EE',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  generateButton: {
    backgroundColor: '#6200EE',
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  bulkButton: {
    backgroundColor: '#03DAC6',
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#b0bec5',
  },
  generateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  bulkButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  scrollBody: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  waitingSection: {
    marginBottom: 10,
  },
  waitingList: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  waitingBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    margin: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  waitingName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  waitingGames: {
    fontSize: 10,
    color: '#888',
    marginLeft: 5,
  },
  matchesSection: {
    paddingBottom: 20,
  },
  matchCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    elevation: 2,
  },
  courtLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#999',
    marginBottom: 10,
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  team: {
    flex: 1,
    alignItems: 'center',
  },
  vs: {
    paddingHorizontal: 10,
    fontWeight: 'bold',
    color: '#999',
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  scoreButton: {
    backgroundColor: '#eee',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  scoreButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#999',
    fontSize: 14,
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  manageButton: {
    borderWidth: 1,
    borderColor: '#6200EE',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  manageButtonText: {
    color: '#6200EE',
    fontWeight: 'bold',
  },
  endSessionButton: {
    backgroundColor: '#333',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  endSessionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    width: '85%',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  settingInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    width: 80,
    textAlign: 'center',
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    marginRight: 10,
    backgroundColor: '#f5f5f5',
  },
  saveButton: {
    backgroundColor: '#6200EE',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  courtGroupLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#444',
    marginTop: 14,
    marginBottom: 6,
    paddingLeft: 2,
  },
  vacantCourtCard: {
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  vacantCourtText: {
    color: '#999',
    fontSize: 14,
    fontStyle: 'italic',
  },
  vacantMatchButton: {
    backgroundColor: '#6200EE',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  vacantMatchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  costCalcButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  costCalcButtonText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
});
