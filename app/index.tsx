import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../src/ui/tokens/colors';
import { spacing } from '../src/ui/tokens/spacing';
import { NeoText, NeoButton, DoodleStar } from '../src/ui/atoms';
import { ScreenTemplate } from '../src/ui/templates';

export default function Home() {
  const router = useRouter();

  const handleStartSession = () => {
    router.push('/player-setup');
  };

  return (
    <ScreenTemplate style={styles.container}>
      {/* Decorative Star elements */}
      <DoodleStar size={24} rotation={15} style={styles.starTopLeft} />
      <DoodleStar size={30} rotation={45} style={styles.starTopRight} />

      {/* Kawaii Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../stitch_shuttleshuffle_badminton_manager/shuttleshuffle_doodle_logo/screen.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Title & Subtitle */}
      <View style={styles.titleContainer}>
        <NeoText variant="display" style={styles.title}>
          SHUTTLE
          {"\n"}
          SHUFFLE
        </NeoText>
        <NeoText variant="body" color={colors.outline} style={styles.subtitle}>
          ระบบจัดการก๊วนแบดมินตันอัจฉริยะ
        </NeoText>
      </View>

      {/* Start Button */}
      <View style={styles.buttonContainer}>
        <NeoButton
          variant="primary"
          title="เริ่มรอบใหม่ (NEW SESSION)"
          onPress={handleStartSession}
          fullWidth
        />
      </View>
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    flex: 1,
  },
  logoContainer: {
    height: 180,
    width: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    borderWidth: spacing.strokeThick,
    borderColor: colors.onBackground,
    borderRadius: 90, // Circular border frame for the mascot
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    // 4px solid shadow
    shadowColor: colors.onBackground,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  logo: {
    width: 140,
    height: 140,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    textAlign: 'center',
    fontSize: 42,
    lineHeight: 46,
    fontWeight: '900',
    color: colors.onBackground,
  },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: spacing.md,
  },
  starTopLeft: {
    position: 'absolute',
    left: spacing.marginMobile,
    top: spacing.xl,
  },
  starTopRight: {
    position: 'absolute',
    right: spacing.marginMobile,
    top: spacing.md,
  },
});

