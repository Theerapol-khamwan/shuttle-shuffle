import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Alert,
  useWindowDimensions
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePlayerStore } from '../../src/store/usePlayerStore';
import { StatusBar } from 'expo-status-bar';
import { checkWinner, isGamePoint, getServiceSide } from '../../src/logic/scoreboard';

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
        <Text style={{ color: '#fff' }}>ไม่พบข้อมูลแมตช์</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: '#2196F3' }}>กลับไปที่แดชบอร์ด</Text>
        </TouchableOpacity>
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

  const TeamSection = ({ team, score, label, isGamePoint }: { team: 'A' | 'B', score: number, label: string, isGamePoint: boolean }) => (
    <View style={[styles.teamSection, team === 'A' ? styles.teamA : styles.teamB]}>
      <Text style={styles.teamName} numberOfLines={1}>{label}</Text>
      
      {isGamePoint && (
        <View style={styles.gamePointBadge}>
          <Text style={styles.gamePointText}>GAME POINT</Text>
        </View>
      )}

      <View style={styles.scoreControlRow}>
        <TouchableOpacity 
          style={styles.adjustButton} 
          onPress={() => handleScoreChange(team, -1)}
        >
          <Text style={styles.adjustButtonText}>-</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.scoreTapArea} 
          onPress={() => handleScoreChange(team, 1)}
        >
          <Text style={[styles.scoreText, { fontSize: isLandscape ? height * 0.5 : width * 0.4 }]}>
            {score}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.adjustButton} 
          onPress={() => handleScoreChange(team, 1)}
        >
          <Text style={styles.adjustButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {servingTeam === team && (
        <View style={[styles.serviceIndicator, serviceSide === 'LEFT' ? styles.serviceLeft : styles.serviceRight]}>
          <Text style={styles.serviceText}>SERVING {serviceSide}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      <View style={[styles.scoreboardBody, { flexDirection: isLandscape ? 'row' : 'column' }]}>
        <TeamSection 
          team="A" 
          score={scoreA} 
          isGamePoint={isGamePointA}
          label={`${getPlayerName(match.team_a_p1)}${match.team_a_p2 ? ` & ${getPlayerName(match.team_a_p2)}` : ''}`}
        />
        <TeamSection 
          team="B" 
          score={scoreB} 
          isGamePoint={isGamePointB}
          label={`${getPlayerName(match.team_b_p1)}${match.team_b_p2 ? ` & ${getPlayerName(match.team_b_p2)}` : ''}`}
        />
      </View>

      {/* Floating Menu Button */}
      <TouchableOpacity 
        style={styles.menuToggleBtn} 
        onPress={() => setShowControls(!showControls)}
      >
        <Text style={styles.menuToggleText}>{showControls ? 'ซ่อนเมนู' : '☰ เมนู'}</Text>
      </TouchableOpacity>

      {showControls && (
        <View style={styles.controlsOverlay}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.controlText}>กลับ</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.finishButton} onPress={handleFinishMatch}>
            <Text style={styles.finishText}>จบแมตช์</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.swapButton} onPress={() => setServingTeam(servingTeam === 'A' ? 'B' : 'A')}>
            <Text style={styles.controlText}>สลับฝั่งเสิร์ฟ</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  scoreboardBody: {
    flex: 1,
  },
  teamSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    position: 'relative',
  },
  teamA: {
    backgroundColor: '#1a237e',
  },
  teamB: {
    backgroundColor: '#b71c1c',
  },
  teamName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    position: 'absolute',
    top: 20,
    zIndex: 10,
    paddingHorizontal: 10,
  },
  gamePointBadge: {
    backgroundColor: '#ffd600',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 4,
    position: 'absolute',
    top: 50,
    zIndex: 11,
  },
  gamePointText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  scoreControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  scoreTapArea: {
    paddingHorizontal: 20,
  },
  scoreText: {
    color: '#fff',
    fontWeight: '900',
    textAlign: 'center',
  },
  adjustButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adjustButtonText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  serviceIndicator: {
    position: 'absolute',
    bottom: 30,
    backgroundColor: '#ffd600',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  serviceLeft: {
    left: 20,
  },
  serviceRight: {
    right: 20,
  },
  serviceText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 14,
  },
  menuToggleBtn: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    zIndex: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  menuToggleText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  controlsOverlay: {
    position: 'absolute',
    bottom: 20,
    left: '10%',
    width: '80%',
    backgroundColor: 'rgba(34,34,34,0.95)',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 15,
    zIndex: 90,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  controlText: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: '600',
  },
  finishButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 8,
  },
  finishText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backButton: {
    padding: 10,
  },
  swapButton: {
    padding: 10,
  },
});
