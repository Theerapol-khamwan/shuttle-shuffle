import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  BricolageGrotesque_400Regular,
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_700Bold,
  BricolageGrotesque_800ExtraBold,
} from '@expo-google-fonts/bricolage-grotesque';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import {
  Sarabun_400Regular,
  Sarabun_700Bold,
} from '@expo-google-fonts/sarabun';
import { colors } from '../tokens/colors';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch((err) => {
  console.warn('SplashScreen.preventAutoHideAsync() failed:', err);
});

interface ThemeProviderProps {
  children: React.ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const [fontsLoaded, fontError] = useFonts({
    BricolageGrotesque_400Regular,
    BricolageGrotesque_600SemiBold,
    BricolageGrotesque_700Bold,
    BricolageGrotesque_800ExtraBold,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
    Sarabun_400Regular,
    Sarabun_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch((err) => {
        console.warn('SplashScreen.hideAsync() failed:', err);
      });
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <View style={styles.container}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
