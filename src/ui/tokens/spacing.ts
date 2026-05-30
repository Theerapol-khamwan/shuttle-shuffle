/**
 * ShuttleShuffle Design System – Spacing & Border-Radius Tokens
 *
 * Base unit: 8 px.
 * Stroke widths follow neo-brutalist convention (thick 3 px / thin 1.5 px).
 */

// ── Spacing ────────────────────────────────────────────────

export const spacing = {
  /** Base grid unit */
  base: 8,

  /** 4 px – tight inner padding */
  xs: 4,
  /** 8 px – default inner padding */
  sm: 8,
  /** 12 px – medium gap */
  md: 12,
  /** 16 px – standard gutter */
  gutter: 16,
  /** 20 px – large gap */
  lg: 20,
  /** 24 px – section padding */
  xl: 24,
  /** 32 px – large section spacing */
  xxl: 32,
  /** 40 px – max section spacing */
  xxxl: 40,

  /** 20 px – safe-area horizontal margin on mobile */
  marginMobile: 20,
  /** 40 px – horizontal margin on wider screens */
  marginDesktop: 40,

  /** 3 px – thick neo-brutalist border */
  strokeThick: 3,
  /** 1.5 px – thin neo-brutalist border */
  strokeThin: 1.5,
} as const;

// ── Border Radius ──────────────────────────────────────────

export const borderRadius = {
  /** 4 px */
  sm: 4,
  /** 8 px – default card / button radius */
  DEFAULT: 8,
  /** 12 px */
  md: 12,
  /** 16 px */
  lg: 16,
  /** 24 px – pill-ish */
  xl: 24,
  /** 9999 px – full circle / capsule */
  full: 9999,
} as const;

/** Union of every spacing token key. */
export type SpacingToken = keyof typeof spacing;

/** Union of every border-radius token key. */
export type BorderRadiusToken = keyof typeof borderRadius;
