import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Alert,
  Switch,
  TouchableOpacity
} from 'react-native';
import { usePlayerStore, Match } from '../src/store/usePlayerStore';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getDb } from '../src/database/db';
import { calculateSplits } from '../src/logic/costCalculator';
import { colors } from '../src/ui/tokens/colors';
import { spacing, borderRadius } from '../src/ui/tokens/spacing';
import { NeoText, NeoButton, NeoDivider } from '../src/ui/atoms';
import { PlayerRankingList, CostSummaryCard, AppBar } from '../src/ui/organisms';
import { CostInputRow } from '../src/ui/molecules';
import { ScreenTemplate } from '../src/ui/templates';

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
    Alert.alert(
      'ปิดรอบวัน',
      'คุณแน่ใจว่าต้องการจบเซสชันวันนี้แล้วใช่หรือไม่? ข้อมูลทั้งหมดจะถูกบันทึกและระบบจะเริ่มรอบใหม่',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { text: 'ตกลง', style: 'default', onPress: async () => {
          await endSession();
          router.replace('/');
        }}
      ]
    );
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

  const appBarHeader = (
    <AppBar
      title="สรุปผลประจำวัน"
      leftIcon="arrow-back"
      onLeftPress={() => router.replace('/dashboard')}
    />
  );

  return (
    <ScreenTemplate scrollable={true} header={appBarHeader} style={styles.screenContainer}>

      {/* Tabs Switcher Row */}
      <View style={styles.tabBar}>
        <View style={styles.flexHalf}>
          <NeoButton
            variant={activeTab === 'stats' ? 'primary' : 'ghost'}
            title="📊 ผลการแข่งขัน"
            onPress={() => setActiveTab('stats')}
            fullWidth
          />
        </View>
        <View style={styles.flexHalf}>
          <NeoButton
            variant={activeTab === 'cost' ? 'primary' : 'ghost'}
            title="💰 ค่าใช้จ่ายก๊วน"
            onPress={() => setActiveTab('cost')}
            fullWidth
          />
        </View>
      </View>

      {activeTab === 'stats' ? (
        <View style={styles.tabContent}>
          {/* Rank Roster Organism */}
          <PlayerRankingList stats={stats} />
        </View>
      ) : (
        <View style={styles.tabContent}>
          {/* Cost Inputs Panel Card */}
          <View style={styles.card}>
            <NeoText variant="headlineMd" style={styles.cardTitle}>
              ⚙️ ตั้งค่าใช้จ่าย
            </NeoText>
            
            <CostInputRow
              label="ค่าสนาม / ชม. (฿)"
              unit="บาท"
              value={courtHourlyRate}
              onChangeText={(val) => {
                setCourtHourlyRate(val);
                handleCostFieldChange(val, hoursPlayed, totalCourts, shuttleUnitPrice, shuttlesUsed, splitMethod);
              }}
            />
            
            <CostInputRow
              label="จำนวนชั่วโมง (ชม.)"
              unit="ชั่วโมง"
              value={hoursPlayed}
              onChangeText={(val) => {
                setHoursPlayed(val);
                handleCostFieldChange(courtHourlyRate, val, totalCourts, shuttleUnitPrice, shuttlesUsed, splitMethod);
              }}
            />

            <CostInputRow
              label="จำนวนสนาม (สนาม)"
              unit="สนาม"
              value={totalCourts}
              onChangeText={(val) => {
                setTotalCourts(val);
                handleCostFieldChange(courtHourlyRate, hoursPlayed, val, shuttleUnitPrice, shuttlesUsed, splitMethod);
              }}
            />

            <CostInputRow
              label="ราคาลูกแบด / ลูก (฿)"
              unit="บาท"
              value={shuttleUnitPrice}
              onChangeText={(val) => {
                setShuttleUnitPrice(val);
                handleCostFieldChange(courtHourlyRate, hoursPlayed, totalCourts, val, shuttlesUsed, splitMethod);
              }}
            />

            <CostInputRow
              label="จำนวนลูกแบด (ลูก)"
              unit="ลูก"
              value={shuttlesUsed}
              onChangeText={(val) => {
                setShuttlesUsed(val);
                handleCostFieldChange(courtHourlyRate, hoursPlayed, totalCourts, shuttleUnitPrice, val, splitMethod);
              }}
            />

            {/* Split Method Selector */}
            <NeoText variant="bodyBold" style={styles.splitLabel}>
              วิธีหารเงิน
            </NeoText>
            <View style={styles.splitMethodContainer}>
              <View style={styles.flexHalf}>
                <NeoButton
                  variant={splitMethod === 'equal' ? 'primary' : 'ghost'}
                  title="หารเท่ากัน"
                  onPress={() => {
                    setSplitMethod('equal');
                    handleCostFieldChange(courtHourlyRate, hoursPlayed, totalCourts, shuttleUnitPrice, shuttlesUsed, 'equal');
                  }}
                  fullWidth
                />
              </View>
              <View style={styles.flexHalf}>
                <NeoButton
                  variant={splitMethod === 'pro_rata' ? 'primary' : 'ghost'}
                  title="หารตามรอบ"
                  onPress={() => {
                    setSplitMethod('pro_rata');
                    handleCostFieldChange(courtHourlyRate, hoursPlayed, totalCourts, shuttleUnitPrice, shuttlesUsed, 'pro_rata');
                  }}
                  fullWidth
                />
              </View>
            </View>
          </View>

          {/* Grand Total Cost Highlight Card */}
          <CostSummaryCard totalCost={grandTotalCost} />

          {/* Breakdown Card */}
          <View style={styles.card}>
            <View style={styles.breakdownRow}>
              <NeoText variant="body" color={colors.outline}>
                ค่าสนาม ({courtsVal} สนาม):
              </NeoText>
              <NeoText variant="bodyBold">
                ฿{totalCourtCost.toFixed(2)}
              </NeoText>
            </View>
            <View style={styles.breakdownRow}>
              <NeoText variant="body" color={colors.outline}>
                ค่าลูกแบด ({shuttlesVal} ลูก):
              </NeoText>
              <NeoText variant="bodyBold">
                ฿{totalShuttleCost.toFixed(2)}
              </NeoText>
            </View>
          </View>

          {/* Player Cost Split Table Card */}
          <View style={styles.card}>
            <NeoText variant="headlineMd" style={styles.cardTitle}>
              👥 สัดส่วนผู้เล่น & การจ่ายเงิน
            </NeoText>
            {players.map((item) => {
              const playerShare = costShares[item.id] || 0;
              const isExcluded = item.exclude_from_split;

              return (
                <View key={item.id} style={[styles.playerCostRow, isExcluded && styles.playerExcluded]}>
                  <View style={styles.playerInfo}>
                    <NeoText variant="bodyBold" style={[styles.playerNameText, isExcluded && styles.textMuted]}>
                      {item.name}
                    </NeoText>
                    <NeoText variant="bodySm" color={colors.outline}>
                      เล่น {item.games_played} เกม • <NeoText variant="bodySm" color={colors.secondary} style={styles.shareText}>฿{playerShare.toFixed(2)}</NeoText>
                    </NeoText>
                  </View>

                  <View style={styles.actionsContainer}>
                    {/* Exclude Toggle */}
                    <View style={styles.toggleGroup}>
                      <NeoText variant="labelSm" color={colors.outline} style={styles.toggleLabel}>
                        หาร
                      </NeoText>
                      <Switch
                        value={!isExcluded}
                        onValueChange={() => togglePlayerExclude(item.id)}
                        trackColor={{ false: colors.surfaceContainerHighest, true: colors.primaryContainer }}
                        thumbColor={!isExcluded ? colors.primary : colors.outline}
                        style={styles.switchSize}
                      />
                    </View>

                    {/* Paid Toggle Button */}
                    <NeoButton
                      size="sm"
                      variant={isExcluded ? 'ghost' : 'primary'}
                      title={item.is_paid ? 'จ่ายแล้ว ✓' : 'ยังไม่จ่าย'}
                      onPress={() => togglePlayerPaid(item.id)}
                      disabled={isExcluded}
                      backgroundColor={item.is_paid ? '#4caf50' : colors.tertiaryContainer} // green vs soft pink
                      style={styles.paidBtn}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Footer Controls */}
      <View style={styles.footerPanel}>
        <View style={styles.navRow}>
          <View style={styles.flexHalf}>
            <NeoButton
              variant="ghost"
              title="🔙 แดชบอร์ด"
              onPress={() => router.canGoBack() ? router.back() : router.replace('/dashboard')}
              fullWidth
            />
          </View>
          <View style={styles.flexHalf}>
            <NeoButton
              variant="primary"
              title="🏁 ปิดรอบวัน"
              onPress={handleFinishDay}
              backgroundColor={colors.primaryContainer}
              fullWidth
            />
          </View>
        </View>
      </View>
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
  },
  header: {
    fontSize: 26,
    textAlign: 'center',
    fontWeight: '900',
    marginVertical: spacing.md,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    width: '100%',
  },
  flexHalf: {
    flex: 1,
    marginHorizontal: 4,
  },
  tabContent: {
    width: '100%',
  },
  card: {
    backgroundColor: '#ffffff',
    borderWidth: spacing.strokeThick,
    borderColor: colors.onBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    // Solid Shadow
    shadowColor: colors.onBackground,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: spacing.md,
  },
  splitLabel: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  splitMethodContainer: {
    flexDirection: 'row',
    width: '100%',
    marginTop: spacing.xs,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  playerCostRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.outlineVariant,
  },
  playerExcluded: {
    backgroundColor: colors.surfaceContainerLow,
    opacity: 0.6,
  },
  playerInfo: {
    flex: 1.3,
  },
  playerNameText: {
    fontSize: 16,
    marginBottom: 2,
  },
  shareText: {
    fontWeight: '800',
  },
  textMuted: {
    textDecorationLine: 'line-through',
    color: colors.outline,
  },
  actionsContainer: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  toggleGroup: {
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  toggleLabel: {
    fontSize: 9,
    fontWeight: '700',
    marginBottom: 2,
  },
  switchSize: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  paidBtn: {
    minHeight: 36,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  footerPanel: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1.5,
    borderColor: colors.outlineVariant,
    width: '100%',
    marginBottom: spacing.xl,
  },
  navRow: {
    flexDirection: 'row',
    width: '100%',
  },
});

