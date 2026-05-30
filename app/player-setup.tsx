import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Alert,
  FlatList
} from 'react-native';
import { usePlayerStore } from '../src/store/usePlayerStore';
import { useRouter } from 'expo-router';
import { colors } from '../src/ui/tokens/colors';
import { spacing } from '../src/ui/tokens/spacing';
import { NeoText, NeoButton, NeoInput } from '../src/ui/atoms';
import { PlayerCard, AppBar } from '../src/ui/organisms';
import { ScreenTemplate } from '../src/ui/templates';

export default function PlayerSetup() {
  const [name, setName] = useState('');
  const { 
    players, 
    startNewSession, 
    addPlayer, 
    removePlayer,
    clearAllPlayers,
    loadCurrentSession 
  } = usePlayerStore();
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      await loadCurrentSession();
      if (!usePlayerStore.getState().currentSession) {
        await startNewSession();
      }
    };
    init();
  }, []);

  const handleAddPlayer = async () => {
    if (name.trim().length === 0) return;
    await addPlayer(name.trim());
    setName('');
  };

  const handleRemovePlayer = (id: string, playerName: string) => {
    Alert.alert(
      'ลบผู้เล่น',
      `คุณต้องการลบ ${playerName} ใช่หรือไม่?`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { text: 'ลบ', style: 'destructive', onPress: () => removePlayer(id) }
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'ล้างข้อมูลทั้งหมด',
      'คุณต้องการลบรายชื่อผู้เล่นทั้งหมดในรอบนี้ใช่หรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { text: 'ล้างทั้งหมด', style: 'destructive', onPress: () => clearAllPlayers() }
      ]
    );
  };

  const appBarHeader = (
    <AppBar
      title="จัดการผู้เล่น"
      leftIcon="arrow-back"
      onLeftPress={() => router.replace('/')}
    />
  );

  return (
    <ScreenTemplate scrollable={false} header={appBarHeader} style={styles.screenContainer}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <NeoText variant="headlineMd" style={styles.headerTitle}>
          👥 รายชื่อผู้เล่น ({players.length})
        </NeoText>
        {players.length > 0 && (
          <NeoButton
            variant="ghost"
            size="sm"
            title="ล้างทั้งหมด"
            onPress={handleClearAll}
          />
        )}
      </View>
      
      {/* Input Container */}
      <View style={styles.inputContainer}>
        <NeoInput
          placeholder="ระบุชื่อผู้เล่น"
          value={name}
          onChangeText={setName}
          onSubmitEditing={handleAddPlayer}
          style={styles.input}
        />
        <NeoButton
          variant="primary"
          title="เพิ่ม"
          onPress={handleAddPlayer}
          style={styles.addBtn}
        />
      </View>

      {/* Roster List */}
      <FlatList
        data={players}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PlayerCard
            name={item.name}
            gamesPlayed={item.games_played}
            onDelete={() => handleRemovePlayer(item.id, item.name)}
            status="waiting"
          />
        )}
        ListEmptyComponent={
          <NeoText variant="body" color={colors.outline} style={styles.emptyText}>
            ยังไม่มีรายชื่อผู้เล่น เพิ่มชื่อด้านบนได้เลย 🏸
          </NeoText>
        }
        contentContainerStyle={styles.listContent}
        style={styles.list}
      />

      {/* Next Step CTA */}
      <View style={styles.bottomCta}>
        <NeoButton
          variant="primary"
          title={players.length < 2 ? 'ต้องมีอย่างน้อย 2 คน' : 'ดำเนินการต่อ (NEXT)'}
          disabled={players.length < 2}
          onPress={() => router.push('/dashboard')}
          fullWidth
        />
      </View>
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    paddingBottom: 0,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  clearBtn: {
    minHeight: 36,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    width: '100%',
  },
  input: {
    flex: 1,
    marginRight: spacing.sm,
  },
  addBtn: {
    height: 48,
    minHeight: 48,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 60,
    fontSize: 16,
  },
  bottomCta: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.marginMobile,
    right: spacing.marginMobile,
    backgroundColor: 'transparent',
    paddingVertical: spacing.sm,
  },
});

