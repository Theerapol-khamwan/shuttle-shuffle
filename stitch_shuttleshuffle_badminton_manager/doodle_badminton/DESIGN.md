---
name: Doodle Badminton
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0edec'
  surface-container-high: '#ebe7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#454932'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#757960'
  outline-variant: '#c5c9ac'
  surface-tint: '#546500'
  primary: '#546500'
  on-primary: '#ffffff'
  primary-container: '#d6ff00'
  on-primary-container: '#607400'
  inverse-primary: '#b2d400'
  secondary: '#2e6385'
  on-secondary: '#ffffff'
  secondary-container: '#a5d8ff'
  on-secondary-container: '#285f80'
  tertiary: '#81515a'
  on-tertiary: '#ffffff'
  tertiary-container: '#ffe9eb'
  on-tertiary-container: '#905e67'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cbf200'
  primary-fixed-dim: '#b2d400'
  on-primary-fixed: '#181e00'
  on-primary-fixed-variant: '#3f4c00'
  secondary-fixed: '#c9e6ff'
  secondary-fixed-dim: '#9accf3'
  on-secondary-fixed: '#001e2f'
  on-secondary-fixed-variant: '#0c4b6c'
  tertiary-fixed: '#ffd9df'
  tertiary-fixed-dim: '#f4b6c1'
  on-tertiary-fixed: '#330f19'
  on-tertiary-fixed-variant: '#663a43'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  display-lg:
    fontFamily: Bricolage Grotesque
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 52px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Bricolage Grotesque
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Bricolage Grotesque
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  label-sm:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  gutter: 16px
  margin-mobile: 20px
  margin-desktop: 40px
  stroke-weight-thick: 3px
  stroke-weight-thin: 1.5px
---

## Brand & Style

This design system embraces a **Playful Neo-Brutalist** aesthetic, heavily influenced by hand-drawn doodle art. It is designed to feel high-energy, creative, and intentionally unpolished, capturing the fast-paced and social nature of badminton.

The visual narrative is defined by:
- **Hand-Drawn Imperfection:** Borders are thick, uneven, and "sketchy" to evoke a sketchbook feel.
- **High-Contrast Energy:** Heavy black outlines (strokes) separate vibrant pastel fills, ensuring every element pops against the off-white background.
- **Whimsical Details:** Use of "sticker-like" components and decorative doodle elements (stars, hearts, swooshes) to denote action and achievement.
- **Dynamic Perspective:** UI elements often use slight rotations or "stacked" card effects to create a sense of motion.

## Colors

The palette is anchored by a high-visibility "Shuttlecock Yellow" and supported by soft, youthful pastels.

- **Primary (Electric Yellow):** Used for primary actions, CTA buttons, and highlighted stats. It represents energy and the shuttlecock itself.
- **Secondary (Sky Blue):** Used for secondary actions, informational badges, and decorative accents.
- **Tertiary (Soft Pink):** Reserved for "favorite" actions, social interactions, and victory states.
- **Neutral (Bold Black):** Not a true black, but a deep charcoal (#111111) used for all outlines, heavy shadows, and primary text to maintain high contrast.
- **Background:** An off-white, paper-like tint that reduces eye strain compared to pure white and enhances the "sketchbook" vibe.

## Typography

The typography strategy mixes characterful headlines with highly readable body text.

- **Headlines:** Uses **Bricolage Grotesque** for its quirky, variable-width appearance that mimics hand-lettering while remaining professional.
- **Body:** **Plus Jakarta Sans** provides a friendly, modern contrast that ensures match details and long-form content remain legible.
- **Labels/Data:** **Space Grotesk** is used for technical data (scores, times, rankings) to give a slight "digital-sport" edge to the doodle aesthetic.

## Layout & Spacing

This design system uses a **Fluid Container** model with a hard-grid influence. 

- **The "Sticker" Layout:** Elements do not always need to align to a rigid grid; primary cards can be slightly rotated (1-2 degrees) to look like they were "tossed" onto the screen.
- **Margins:** A generous 20px margin on mobile prevents the thick black borders from feeling cramped.
- **Stroke Alignment:** All containers must have a minimum 2px black border. Inverted "Hard Shadows" (solid black, no blur, offset by 4px or 8px) are used to simulate depth.

## Elevation & Depth

In this design system, depth is not created with light and shadow, but through **Object Stacking and Solid Offsets**.

- **Level 0 (Base):** The off-white paper background.
- **Level 1 (Cards):** Containers with a thick black outline and a solid black shadow offset 4px down and 4px right.
- **Level 2 (Active/Floating):** Elements like "Book Match" buttons use an 8px solid shadow to appear further from the surface.
- **Interaction:** On press/active states, the element "sinks" by moving 4px toward its shadow, making the shadow disappear and creating a tactile, "clicky" feel.

## Shapes

Shapes are "squircle-inspired" but with a manual touch. While the variables define a standard roundedness, the implementation should use **SVG filters or "RoughJS" style paths** where possible to ensure borders are not perfectly straight lines.

- **Primary Containers:** Use `rounded-lg` (1rem) for a friendly, approachable feel.
- **Buttons:** Use a hybrid of `rounded-xl` and pill-shapes to differentiate from informational cards.
- **Icons:** Should always be enclosed in a circular or square "badge" with a thick border.

## Components

### Buttons
- **Primary:** Electric Yellow fill, 3px Black border, 4px solid shadow. All caps Space Grotesk text.
- **Ghost:** Transparent fill, 2px Black dashed border (to look like a cut-out).

### Cards (Match/Player)
- Cards use a white fill with a thick black outline. 
- Headers inside cards should have a "highlight" effect—a horizontal stroke of pastel blue or pink behind the text that looks like a marker swipe.

### Input Fields
- Heavy black borders that turn "Electric Yellow" when focused. 
- Use a hand-drawn asterisk (*) for required fields.

### Chips & Badges
- Used for "Level" (e.g., Intermediate, Pro). These should look like physical stickers with a slightly irregular border.

### Progress Bars
- Instead of a smooth fill, use a "hatched" pattern (diagonal lines) to fill the progress area, maintaining the hand-drawn sketchbook theme.