import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { initDatabase } from '../src/database/db';
import ThemeProvider from '../src/ui/theme/ThemeProvider';
import { colors } from '../src/ui/tokens/colors';
import { FONT_HEADLINE } from '../src/ui/tokens/typography';

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
    <ThemeProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTitleStyle: {
            fontFamily: FONT_HEADLINE,
            fontSize: 18,
            color: colors.onBackground,
          },

          headerTintColor: colors.onBackground,
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'SHUTTLESHUFFLE' }} />
        <Stack.Screen name="player-setup" options={{ title: 'จัดการผู้เล่น', headerShown: false }} />
        <Stack.Screen name="dashboard" options={{ title: 'แดชบอร์ด', headerShown: false }} />
        <Stack.Screen name="scoreboard/[id]" options={{ title: 'กระดานคะแนน', headerShown: false }} />
        <Stack.Screen name="summary" options={{ title: 'สรุปผลประจำวัน', headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}

