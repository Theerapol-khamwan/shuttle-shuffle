import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function Home() {
  const router = useRouter();

  const handleStartSession = () => {
    router.push('/player-setup');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏸 ShuttleShuffle</Text>
      <Text style={styles.subtitle}>ระบบจัดการก๊วนแบดมินตันอัจฉริยะ</Text>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleStartSession}
      >
        <Text style={styles.buttonText}>เริ่มรอบใหม่ (New Session)</Text>
      </TouchableOpacity>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
