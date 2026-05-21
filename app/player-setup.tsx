import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Alert 
} from 'react-native';
import { usePlayerStore } from '../src/store/usePlayerStore';
import { useRouter } from 'expo-router';

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

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>👥 ผู้เล่น ({players.length})</Text>
        {players.length > 0 && (
          <TouchableOpacity onPress={handleClearAll}>
            <Text style={styles.clearText}>ล้างทั้งหมด</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="ระบุชื่อผู้เล่น"
          value={name}
          onChangeText={setName}
          onSubmitEditing={handleAddPlayer}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddPlayer}>
          <Text style={styles.addButtonText}>เพิ่ม</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={players}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.playerItem}>
            <View>
              <Text style={styles.playerName}>{item.name}</Text>
              <Text style={styles.playerStats}>เล่นไปแล้ว: {item.games_played} เกม</Text>
            </View>
            <TouchableOpacity 
              onPress={() => handleRemovePlayer(item.id, item.name)}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteButtonText}>ลบ</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>ยังไม่มีรายชื่อผู้เล่น เพิ่มชื่อด้านบนได้เลย</Text>
        }
        contentContainerStyle={styles.listContent}
      />

      <TouchableOpacity 
        style={[styles.nextButton, players.length < 2 && styles.nextButtonDisabled]}
        disabled={players.length < 2}
        onPress={() => router.push('/dashboard')}
      >
        <Text style={styles.nextButtonText}>
          {players.length < 2 ? 'ต้องมีอย่างน้อย 2 คน' : 'ดำเนินการต่อ'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  clearText: {
    color: '#FF5252',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    justifyContent: 'center',
    borderRadius: 8,
    marginLeft: 10,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 80,
  },
  playerItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 1,
  },
  playerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  playerStats: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    color: '#FF5252',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#999',
    fontSize: 16,
  },
  nextButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#2196F3',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 3,
  },
  nextButtonDisabled: {
    backgroundColor: '#bdbdbd',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
