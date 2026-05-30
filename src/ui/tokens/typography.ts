/**
 * ShuttleShuffle Design System – Typography Tokens
 *
 * Font families
 *   Headlines : Bricolage Grotesque  (@expo-google-fonts/bricolage-grotesque)
 *   Body      : Plus Jakarta Sans    (@expo-google-fonts/plus-jakarta-sans)
 *   Labels    : Space Grotesk        (@expo-google-fonts/space-grotesk)
 *   Thai      : Sarabun              (@expo-google-fonts/sarabun)
 *
 * The constant names match the exact PostScript-style names that
 * expo-google-fonts registers so they can be used directly in fontFamily.
 */

import { StyleSheet } from 'react-native';

// ── Font Family Constants ──────────────────────────────────

export const FONT_DISPLAY = 'BricolageGrotesque_800ExtraBold' as const;
export const FONT_HEADLINE = 'BricolageGrotesque_700Bold' as const;
export const FONT_HEADLINE_MEDIUM = 'BricolageGrotesque_600SemiBold' as const;

export const FONT_BODY = 'PlusJakartaSans_500Medium' as const;
export const FONT_BODY_BOLD = 'PlusJakartaSans_700Bold' as const;

export const FONT_LABEL = 'SpaceGrotesk_700Bold' as const;
export const FONT_LABEL_MEDIUM = 'SpaceGrotesk_500Medium' as const;

export const FONT_THAI = 'Sarabun_400Regular' as const;
export const FONT_THAI_BOLD = 'Sarabun_700Bold' as const;

// ── Text Style Presets ─────────────────────────────────────

export const textStyles = StyleSheet.create({
  /** Hero / splash headlines – 48 px */
  displayLg: {
    fontFamily: FONT_DISPLAY,
    fontSize: 48,
    fontWeight: '800',
    lineHeight: 52,
    letterSpacing: -0.32,
  },

  /** Section headlines – 32 px */
  headlineLg: {
    fontFamily: FONT_HEADLINE,
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
  },

  /** Mobile-optimised section headline – 28 px */
  headlineLgMobile: {
    fontFamily: FONT_HEADLINE,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
  },

  /** Sub-section headlines – 22 px */
  headlineMd: {
    fontFamily: FONT_HEADLINE_MEDIUM,
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 28,
  },

  /** Large body copy – 18 px */
  bodyLg: {
    fontFamily: FONT_BODY,
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 26,
  },

  /** Default body copy – 16 px */
  bodyMd: {
    fontFamily: FONT_BODY,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  },

  /** Small body / captions – 14 px */
  bodySm: {
    fontFamily: FONT_BODY,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },

  /** Emphasised body – 16 px bold */
  bodyBold: {
    fontFamily: FONT_BODY_BOLD,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
  },

  /** Large label / button text – 14 px uppercase */
  labelLg: {
    fontFamily: FONT_LABEL,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  /** Medium label – 12 px */
  labelMd: {
    fontFamily: FONT_LABEL_MEDIUM,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },

  /** Small label / chip text – 10 px uppercase */
  labelSm: {
    fontFamily: FONT_LABEL,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 14,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },

  /** Large scoreboard digit – 80 px */
  scoreLg: {
    fontFamily: FONT_DISPLAY,
    fontSize: 80,
    fontWeight: '800',
    lineHeight: 84,
  },

  /** Extra-large scoreboard digit – 120 px */
  scoreXl: {
    fontFamily: FONT_DISPLAY,
    fontSize: 120,
    fontWeight: '800',
    lineHeight: 124,
  },
});

/** Union of every text-style key. */
export type TextStyleToken = keyof typeof textStyles;
