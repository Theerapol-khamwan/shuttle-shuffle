import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { initDatabase } from '../src/database/db';

export default function RootLayout() {
  useEffect(() => {
    // อุ่นเครื่อง database ตั้งแต่เปิดแอป
    const setup = async () => {
      try {
        await initDatabase();
        console.log("Database ready");
      } catch (err) {
        console.error("Layout DB Init Error:", err);
      }
    };
    setup();
  }, []);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'ShuttleShuffle' }} />
      <Stack.Screen name="player-setup" options={{ title: 'จัดการผู้เล่น' }} />
      <Stack.Screen name="dashboard" options={{ title: 'แดชบอร์ด' }} />
      <Stack.Screen name="scoreboard/[id]" options={{ title: 'กระดานคะแนน', headerShown: false }} />
      <Stack.Screen name="summary" options={{ title: 'สรุปผลประจำวัน' }} />
    </Stack>
  );
}
