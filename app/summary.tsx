import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch
} from 'react-native';
import { usePlayerStore, Match } from '../src/store/usePlayerStore';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getDb } from '../src/database/db';
import { calculateSplits } from '../src/logic/costCalculator';

interface PlayerStat {
  id: string;
  name: string;
  games: number;
  wins: number;
  losses: number;
}

export default function Summary() {
  const { 
    players, 
    currentSession, 
    endSession,
    updateSessionCosts,
    togglePlayerExclude,
    togglePlayerPaid
  } = usePlayerStore();
  const { tab } = useLocalSearchParams<{ tab?: 'stats' | 'cost' }>();
  const [stats, setStats] = useState<PlayerStat[]>([]);
  const [activeTab, setActiveTab] = useState<'stats' | 'cost'>('stats');
  const router = useRouter();

  useEffect(() => {
    if (tab === 'stats' || tab === 'cost') {
      setActiveTab(tab);
    }
  }, [tab]);

  // Cost local states
  const [courtHourlyRate, setCourtHourlyRate] = useState('0');
  const [hoursPlayed, setHoursPlayed] = useState('0');
  const [totalCourts, setTotalCourts] = useState('1');
  const [shuttleUnitPrice, setShuttleUnitPrice] = useState('0');
  const [shuttlesUsed, setShuttlesUsed] = useState('0');
  const [splitMethod, setSplitMethod] = useState<'equal' | 'pro_rata'>('equal');

  useEffect(() => {
    const calculateStats = async () => {
      if (!currentSession) return;
      
      const db = await getDb();
      const allMatches = await db.getAllAsync<Match>(
        'SELECT * FROM matches WHERE session_id = ?',
        [currentSession.id]
      );

      const playerStats: Record<string, PlayerStat> = {};
      players.forEach(p => {
        playerStats[p.id] = { id: p.id, name: p.name, games: 0, wins: 0, losses: 0 };
      });

      allMatches.forEach(m => {
        const pids = [m.team_a_p1, m.team_a_p2, m.team_b_p1, m.team_b_p2].filter(Boolean) as string[];
        pids.forEach(pid => {
          if (playerStats[pid]) playerStats[pid].games++;
        });

        if (m.status === 'completed') {
          const teamAWon = m.team_a_score > m.team_b_score;
          const teamBWon = m.team_b_score > m.team_a_score;

          [m.team_a_p1, m.team_a_p2].filter(Boolean).forEach(pid => {
            if (playerStats[pid!]) {
              if (teamAWon) playerStats[pid!].wins++;
              else if (teamBWon) playerStats[pid!].losses++;
            }
          });

          [m.team_b_p1, m.team_b_p2].filter(Boolean).forEach(pid => {
            if (playerStats[pid!]) {
              if (teamBWon) playerStats[pid!].wins++;
              else if (teamAWon) playerStats[pid!].losses++;
            }
          });
        }
      });

      setStats(Object.values(playerStats).sort((a, b) => b.wins - a.wins));
    };

    calculateStats();
  }, [currentSession, players]);

  useEffect(() => {
    if (currentSession) {
      setCourtHourlyRate(currentSession.court_hourly_rate?.toString() || '0');
      setHoursPlayed(currentSession.hours_played?.toString() || '0');
      setTotalCourts((currentSession.total_courts || 1).toString());
      setShuttleUnitPrice(currentSession.shuttle_unit_price?.toString() || '0');
      setShuttlesUsed(currentSession.shuttles_used?.toString() || '0');
      setSplitMethod(currentSession.cost_split_method || 'equal');
    }
  }, [currentSession?.id]);

  const handleCostFieldChange = (
    rate: string,
    hours: string,
    courts: string,
    shuttlePrice: string,
    shuttlesCount: string,
    method: 'equal' | 'pro_rata'
  ) => {
    const rateNum = parseFloat(rate) || 0;
    const hoursNum = parseFloat(hours) || 0;
    const courtsNum = parseInt(courts) || 1;
    const priceNum = parseFloat(shuttlePrice) || 0;
    const shuttlesNum = parseInt(shuttlesCount) || 0;

    updateSessionCosts(rateNum, hoursNum, priceNum, shuttlesNum, method, courtsNum);
  };

  const handleFinishDay = async () => {
    await endSession();
    router.replace('/');
  };

  const rateVal = parseFloat(courtHourlyRate) || 0;
  const hoursVal = parseFloat(hoursPlayed) || 0;
  const courtsVal = parseInt(totalCourts) || 1;
  const priceVal = parseFloat(shuttleUnitPrice) || 0;
  const shuttlesVal = parseInt(shuttlesUsed) || 0;

  const totalCourtCost = rateVal * hoursVal * courtsVal;
  const totalShuttleCost = priceVal * shuttlesVal;
  const grandTotalCost = totalCourtCost + totalShuttleCost;

  // Calculate split costs dynamically
  const costShares = currentSession ? calculateSplits(players, currentSession) : {};

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🏆 สรุปผลประจำวัน</Text>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'stats' && styles.tabButtonActive]}
          onPress={() => setActiveTab('stats')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'stats' && styles.tabButtonTextActive]}>📊 ผลการแข่งขัน</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'cost' && styles.tabButtonActive]}
          onPress={() => setActiveTab('cost')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'cost' && styles.tabButtonTextActive]}>💰 ค่าสนามและค่าลูก</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'stats' ? (
        <View style={styles.tabContent}>
          <View style={styles.tableHeader}>
            <Text style={[styles.col, styles.nameCol]}>ชื่อ</Text>
            <Text style={styles.col}>เล่น</Text>
            <Text style={styles.col}>ชนะ</Text>
            <Text style={styles.col}>แพ้</Text>
          </View>

          <FlatList
            data={stats}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <Text style={[styles.col, styles.nameCol, styles.playerName]}>{item.name}</Text>
                <Text style={styles.col}>{item.games}</Text>
                <Text style={[styles.col, styles.winText]}>{item.wins}</Text>
                <Text style={[styles.col, styles.lossText]}>{item.losses}</Text>
              </View>
            )}
            contentContainerStyle={styles.listContainer}
          />
        </View>
      ) : (
        <ScrollView style={styles.scrollViewContent}>
          {/* Cost Inputs Panel */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>⚙️ ตั้งค่าใช้จ่าย</Text>
            
            <View style={styles.inputGrid}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>ค่าสนาม / ชม. (฿)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={courtHourlyRate}
                  onChangeText={(val) => {
                    setCourtHourlyRate(val);
                    handleCostFieldChange(val, hoursPlayed, shuttleUnitPrice, shuttlesUsed, splitMethod);
                  }}
                  placeholder="0"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>จำนวนชั่วโมง (ชม.)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={hoursPlayed}
                  onChangeText={(val) => {
                    setHoursPlayed(val);
                    handleCostFieldChange(courtHourlyRate, val, totalCourts, shuttleUnitPrice, shuttlesUsed, splitMethod);
                  }}
                  placeholder="0"
                />
              </View>
            </View>

            <View style={styles.inputGrid}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>จำนวนสนาม (สนาม)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={totalCourts}
                  onChangeText={(val) => {
                    setTotalCourts(val);
                    handleCostFieldChange(courtHourlyRate, hoursPlayed, val, shuttleUnitPrice, shuttlesUsed, splitMethod);
                  }}
                  placeholder="1"
                />
              </View>
            </View>

            <View style={styles.inputGrid}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>ราคาลูกแบด / ลูก (฿)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={shuttleUnitPrice}
                  onChangeText={(val) => {
                    setShuttleUnitPrice(val);
                    handleCostFieldChange(courtHourlyRate, hoursPlayed, totalCourts, val, shuttlesUsed, splitMethod);
                  }}
                  placeholder="0"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>จำนวนลูกแบด (ลูก)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={shuttlesUsed}
                  onChangeText={(val) => {
                    setShuttlesUsed(val);
                    handleCostFieldChange(courtHourlyRate, hoursPlayed, totalCourts, shuttleUnitPrice, val, splitMethod);
                  }}
                  placeholder="0"
                />
              </View>
            </View>

            {/* Split Method */}
            <Text style={styles.inputLabel}>วิธีหารเงิน</Text>
            <View style={styles.splitMethodContainer}>
              <TouchableOpacity 
                style={[styles.splitMethodButton, splitMethod === 'equal' && styles.splitMethodActive]}
                onPress={() => {
                  setSplitMethod('equal');
                  handleCostFieldChange(courtHourlyRate, hoursPlayed, totalCourts, shuttleUnitPrice, shuttlesUsed, 'equal');
                }}
              >
                <Text style={[styles.splitMethodText, splitMethod === 'equal' && styles.splitMethodTextActive]}>หารเท่ากันทุกคน (Equal)</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.splitMethodButton, splitMethod === 'pro_rata' && styles.splitMethodActive]}
                onPress={() => {
                  setSplitMethod('pro_rata');
                  handleCostFieldChange(courtHourlyRate, hoursPlayed, totalCourts, shuttleUnitPrice, shuttlesUsed, 'pro_rata');
                }}
              >
                <Text style={[styles.splitMethodText, splitMethod === 'pro_rata' && styles.splitMethodTextActive]}>หารตามรอบที่เล่น (Pro-rata)</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Cost Summary Info */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>ค่าคอร์ททั้งหมด: ({courtsVal} สนาม)</Text>
              <Text style={styles.summaryValue}>฿{totalCourtCost.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>ค่าลูกแบดทั้งหมด:</Text>
              <Text style={styles.summaryValue}>฿{totalShuttleCost.toFixed(2)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.grandTotalRow]}>
              <Text style={styles.grandTotalText}>ยอดรวมค่าใช้จ่าย:</Text>
              <Text style={styles.grandTotalValue}>฿{grandTotalCost.toFixed(2)}</Text>
            </View>
          </View>

          {/* Player Cost Split Table */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>👥 สัดส่วนผู้เล่น & การจ่ายเงิน</Text>
            {players.map((item) => {
              const playerShare = costShares[item.id] || 0;
              return (
                <View key={item.id} style={[styles.playerCostRow, item.exclude_from_split && styles.playerExcluded]}>
                  <View style={styles.playerInfo}>
                    <Text style={[styles.playerNameText, item.exclude_from_split && styles.textMuted]}>
                      {item.name}
                    </Text>
                    <Text style={styles.playerSubText}>
                      เล่น {item.games_played} เกม • <Text style={styles.shareText}>฿{playerShare.toFixed(2)}</Text>
                    </Text>
                  </View>

                  <View style={styles.actionsContainer}>
                    {/* Exclude Toggle */}
                    <View style={styles.toggleGroup}>
                      <Text style={styles.toggleLabel}>หาร</Text>
                      <Switch
                        value={!item.exclude_from_split}
                        onValueChange={() => togglePlayerExclude(item.id)}
                        trackColor={{ false: "#ccc", true: "#81b0ff" }}
                        thumbColor={!item.exclude_from_split ? "#2196F3" : "#f4f3f4"}
                        style={styles.switchSize}
                      />
                    </View>

                    {/* Paid Toggle */}
                    <TouchableOpacity 
                      disabled={item.exclude_from_split}
                      style={[
                        styles.paidButton, 
                        item.is_paid ? styles.paidButtonSuccess : styles.paidButtonPending,
                        item.exclude_from_split && styles.paidButtonDisabled
                      ]}
                      onPress={() => togglePlayerPaid(item.id)}
                    >
                      <Text style={styles.paidButtonText}>
                        {item.is_paid ? 'จ่ายแล้ว ✓' : 'ยังไม่จ่าย'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}

      <View style={styles.bottomButtonsRow}>
        <TouchableOpacity 
          style={styles.backToDashboardButton} 
          onPress={() => router.canGoBack() ? router.back() : router.replace('/dashboard')}
        >
          <Text style={styles.backToDashboardText}>🔙 กลับแดชบอร์ด</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.finishButton} onPress={handleFinishDay}>
          <Text style={styles.finishButtonText}>🏁 ปิดรอบวัน</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#0f172a',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButtonText: {
    color: '#64748b',
    fontWeight: '600',
    fontSize: 14,
  },
  tabButtonTextActive: {
    color: '#0f172a',
  },
  tabContent: {
    flex: 1,
  },
  listContainer: {
    paddingBottom: 10,
  },
  scrollViewContent: {
    flex: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 12,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingVertical: 14,
    alignItems: 'center',
  },
  col: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    color: '#475569',
  },
  nameCol: {
    flex: 2,
    textAlign: 'left',
  },
  playerName: {
    fontWeight: 'bold',
    color: '#1e293b',
  },
  winText: {
    color: '#10b981',
    fontWeight: 'bold',
  },
  lossText: {
    color: '#ef4444',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 8,
  },
  inputGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  inputGroup: {
    flex: 1,
    marginRight: 10,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    color: '#1e293b',
    backgroundColor: '#fff',
  },
  splitMethodContainer: {
    flexDirection: 'row',
    marginTop: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    padding: 3,
  },
  splitMethodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  splitMethodActive: {
    backgroundColor: '#2196F3',
  },
  splitMethodText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  splitMethodTextActive: {
    color: '#fff',
  },
  summaryCard: {
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#cbd5e1',
    paddingTop: 8,
    marginTop: 8,
    marginBottom: 0,
  },
  grandTotalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
  },
  playerCostRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  playerExcluded: {
    backgroundColor: '#f8fafc',
    opacity: 0.6,
  },
  playerInfo: {
    flex: 1.5,
  },
  playerNameText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  playerSubText: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  shareText: {
    fontWeight: '700',
    color: '#3b82f6',
  },
  textMuted: {
    color: '#94a3b8',
    textDecorationLine: 'line-through',
  },
  actionsContainer: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  toggleGroup: {
    alignItems: 'center',
    marginRight: 10,
  },
  toggleLabel: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 2,
    fontWeight: '500',
  },
  switchSize: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  paidButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  paidButtonSuccess: {
    backgroundColor: '#10b981',
  },
  paidButtonPending: {
    backgroundColor: '#f97316',
  },
  paidButtonDisabled: {
    backgroundColor: '#e2e8f0',
  },
  paidButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bottomButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  backToDashboardButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#64748b',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: '#fff',
  },
  backToDashboardText: {
    color: '#64748b',
    fontSize: 15,
    fontWeight: 'bold',
  },
  finishButton: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
