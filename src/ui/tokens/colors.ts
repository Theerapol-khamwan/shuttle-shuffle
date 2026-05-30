/**
 * ShuttleShuffle Design System – Color Tokens
 *
 * Neo-Brutalist palette derived from Material 3 tonal palette
 * with Electric Yellow (#d6ff00) as the signature primary container.
 */

export const colors = {
  // ── Primary ──────────────────────────────────────────────
  primary: '#546500',
  onPrimary: '#ffffff',
  primaryContainer: '#d6ff00',
  onPrimaryContainer: '#607400',

  inversePrimary: '#b2d400',

  // ── Secondary ────────────────────────────────────────────
  secondary: '#2e6385',
  onSecondary: '#ffffff',
  secondaryContainer: '#a5d8ff',
  onSecondaryContainer: '#285f80',

  // ── Tertiary ─────────────────────────────────────────────
  tertiary: '#81515a',
  onTertiary: '#ffffff',
  tertiaryContainer: '#ffe9eb',
  onTertiaryContainer: '#905e67',

  // ── Error ────────────────────────────────────────────────
  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',

  // ── Background ───────────────────────────────────────────
  background: '#fcf9f8',
  onBackground: '#1c1b1b',

  // ── Surface ──────────────────────────────────────────────
  surface: '#fcf9f8',
  surfaceDim: '#dcd9d9',
  surfaceBright: '#fcf9f8',

  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f6f3f2',
  surfaceContainer: '#f0edec',
  surfaceContainerHigh: '#ebe7e7',
  surfaceContainerHighest: '#e5e2e1',

  surfaceVariant: '#e5e2e1',

  onSurface: '#1c1b1b',
  onSurfaceVariant: '#454932',

  inverseSurface: '#313030',
  inverseOnSurface: '#f3f0ef',

  // ── Outline ──────────────────────────────────────────────
  outline: '#757960',
  outlineVariant: '#c5c9ac',

  // ── Tint ─────────────────────────────────────────────────
  surfaceTint: '#546500',

  // ── Primary Fixed ────────────────────────────────────────
  primaryFixed: '#cbf200',
  primaryFixedDim: '#b2d400',
  onPrimaryFixed: '#181e00',
  onPrimaryFixedVariant: '#3f4c00',

  // ── Secondary Fixed ──────────────────────────────────────
  secondaryFixed: '#c9e6ff',
  secondaryFixedDim: '#9accf3',
  onSecondaryFixed: '#001e2f',
  onSecondaryFixedVariant: '#0c4b6c',

  // ── Tertiary Fixed ───────────────────────────────────────
  tertiaryFixed: '#ffd9df',
  tertiaryFixedDim: '#f4b6c1',
  onTertiaryFixed: '#330f19',
  onTertiaryFixedVariant: '#663a43',
} as const;

/** Union type of every color token key. */
export type ColorToken = keyof typeof colors;

/** The resolved color values type. */
export type Colors = typeof colors;
