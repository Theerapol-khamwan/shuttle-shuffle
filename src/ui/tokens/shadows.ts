/**
 * ShuttleShuffle Design System – Neo-Brutalist Shadow Tokens
 *
 * All shadows are SOLID (shadowRadius: 0, no blur).
 * Press/active state: element translates by the shadow offset so the
 * shadow "disappears" and the component appears to sink into the surface.
 *
 * iOS  → shadowColor / shadowOffset / shadowOpacity / shadowRadius
 * Android → elevation (approximation; true solid shadows need an
 *           additional View wrapper on Android if pixel-perfection is required)
 */

import { StyleSheet, Platform } from 'react-native';
import type { ViewStyle } from 'react-native';

import { colors } from './colors';

// ── Shadow colour ──────────────────────────────────────────

const SHADOW_COLOR = colors.onBackground; // '#1c1b1b'

// ── Shadow Style Objects ───────────────────────────────────

/**
 * Level 1 – default card / button shadow (4 px offset).
 */
export const neo1: ViewStyle = {
  shadowColor: SHADOW_COLOR,
  shadowOffset: { width: 4, height: 4 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: 4,
};

/**
 * Level 2 – elevated modal / floating action shadow (8 px offset).
 */
export const neo2: ViewStyle = {
  shadowColor: SHADOW_COLOR,
  shadowOffset: { width: 8, height: 8 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: 8,
};

/**
 * Small – subtle accent shadow for chips, tags, badges (2 px offset).
 */
export const neoSmall: ViewStyle = {
  shadowColor: SHADOW_COLOR,
  shadowOffset: { width: 2, height: 2 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: 2,
};

/**
 * None – explicitly reset shadow (used on pressed state).
 */
export const none: ViewStyle = {
  shadowColor: 'transparent',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0,
  shadowRadius: 0,
  elevation: 0,
};

// ── Pressed / Active Transforms ────────────────────────────

/**
 * Default press transform – matches neo1 offset so the element
 * "sinks" flush with its shadow position.
 */
export const pressedTransform: ViewStyle['transform'] = [
  { translateX: 4 },
  { translateY: 4 },
];

/**
 * Small press transform – matches neoSmall offset.
 */
export const pressedTransformSmall: ViewStyle['transform'] = [
  { translateX: 2 },
  { translateY: 2 },
];

// ── Convenience lookup ─────────────────────────────────────

export const shadows = {
  neo1,
  neo2,
  neoSmall,
  none,
} as const;

export type ShadowToken = keyof typeof shadows;
