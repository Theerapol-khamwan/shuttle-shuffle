---
name: ShuttleShuffle
description: Offline-first queue manager and scoreboard for badminton courts
colors:
  primary: "#546500"
  primary-container: "#d6ff00"
  neutral-bg: "#fcf9f8"
  neutral-text: "#1c1b1b"
  error: "#ba1a1a"
typography:
  display:
    fontFamily: "BricolageGrotesque_800ExtraBold"
  headline:
    fontFamily: "BricolageGrotesque_700Bold"
  body:
    fontFamily: "PlusJakartaSans_500Medium"
  label:
    fontFamily: "SpaceGrotesk_700Bold"
rounded:
  sm: "4px"
  md: "8px"
  lg: "16px"
  full: "9999px"
spacing:
  sm: "8px"
  md: "12px"
  gutter: "16px"
components:
  card:
    backgroundColor: "{colors.neutral-bg}"
    textColor: "{colors.neutral-text}"
    rounded: "{rounded.md}"
    padding: "{spacing.gutter}"
  button-primary:
    backgroundColor: "{colors.primary-container}"
    textColor: "{colors.neutral-text}"
    rounded: "{rounded.md}"
    padding: "16px 24px"
---

# Design System: ShuttleShuffle

## 1. Overview

**Creative North Star: "The Bold Referee"**

ShuttleShuffle is designed to be unapologetically bold, highly legible, and deeply tactile. Drawing from the brand personality of a "Playful Neo-Brutalist", the system relies on stark contrasts, thick strokes, and solid, un-blurred shadows to create a UI that acts as both an organizer and a referee. The aesthetic is energetic but unpretentious, prioritizing extreme clarity from a distance—as it often acts as a physical scoreboard placed at the back of a badminton court. It explicitly rejects fragile glassmorphism, low-contrast SaaS clichés, and over-designed decoration that doesn't serve the game.

**Key Characteristics:**
- High-visibility colors and monumental typography.
- Physical, tactile interactions driven by solid neo-brutalist shadows.
- Distinct boundaries built with thick, deliberate strokes.
- Function over decoration; everything serves to clarify the match state.

## 2. Colors

The palette is committed to maximum contrast, using a high-visibility accent against a chalky, subdued background.

### Primary
- **High-Visibility Volt** (`#d6ff00`): The signature container color used for primary actions, active players, and critical states. Its rarity commands attention.
- **Deep Volt** (`#546500`): Used for primary text on light backgrounds or as a darker brand accent.

### Neutral
- **Court Chalk** (`#fcf9f8`): The warm, stark background that serves as the canvas.
- **Grip Tape Black** (`#1c1b1b`): Used for primary text, thick component borders, and solid shadows.

### Error
- **Foul Red** (`#ba1a1a`): Used strictly for destructive actions and error states.

### Named Rules
**The One Voice Rule.** The High-Visibility Volt (`#d6ff00`) is the loudest voice on the court. It must be reserved for the most important action or state on the screen (e.g., the primary CTA or the winning score).

## 3. Typography

**Display Font:** Bricolage Grotesque
**Body Font:** Plus Jakarta Sans
**Label Font:** Space Grotesk
**Thai Font:** Sarabun

**Character:** A pairing that is loud and undeniable for numbers and headlines, while remaining legible and neutral for player names and body copy.

### Hierarchy
- **Display** (800 ExtraBold, 48px to 120px): Reserved exclusively for monumental scoreboard digits and hero moments.
- **Headline** (700 Bold, 22px to 32px): Section headers and primary structural text.
- **Body** (500 Medium, 14px to 18px): Standard UI text, player names in lists.
- **Label** (700 Bold, 10px to 14px, uppercase): Buttons, badges, and chips.

### Named Rules
**The Monumental Score Rule.** Score numbers must be rendered in `Bricolage Grotesque ExtraBold` at sizes ranging from 80px to 120px. They are not just text; they are graphic elements.

## 4. Elevation

The system uses physical, layered depth built from solid geometry rather than optical blur. Shadows act as physical blocks lifting the surface.

### Shadow Vocabulary
- **Level 1** (`offset: 4px 4px`): Default elevation for cards and buttons.
- **Level 2** (`offset: 8px 8px`): Floating action buttons and elevated modals.
- **Small** (`offset: 2px 2px`): Subtle lift for chips and badges.
- **Pressed** (`offset: 0 0`): The shadow disappears as the element translates down and right by the exact shadow offset.

### Named Rules
**The Flat-Blur Rule.** All shadows are solid blocks. Blur is explicitly set to `0`. A surface is either flush with the background or physically hoisted above it by a solid shape.

## 5. Components

Components are "tactile, chunky, and undeniable." They are large, easy to hit with sweaty hands, and provide satisfying physical feedback.

### Buttons
- **Shape:** 8px radius.
- **Primary:** High-Visibility Volt (`#d6ff00`) background, Grip Tape Black text and border (3px).
- **Hover / Focus / Press:** On press, the button translates down and right (e.g., `translateX: 4px, translateY: 4px`) while the shadow disappears, simulating a physical keypress.

### Cards / Containers
- **Corner Style:** 8px to 12px radius.
- **Background:** Court Chalk or Surface variations.
- **Shadow Strategy:** Level 1 solid shadow with a 1.5px or 3px border.
- **Internal Padding:** Generous (16px+).

### Chips
- **Style:** Small radius or pill (24px), often with a 1.5px stroke and `Small` (2px) solid shadow.

## 6. Do's and Don'ts

Guardrails to ensure the system remains true to its "Bold Referee" North Star.

### Do:
- **Do** use thick (3px) and thin (1.5px) borders to define component boundaries clearly.
- **Do** ensure interactive elements translate physically when pressed, matching their shadow offset.
- **Do** use uppercase `Space Grotesk` for utility labels and buttons to maintain a technical, scoreboard-like feel.

### Don't:
- **Don't** use corporate, overly formal, or bland SaaS designs.
- **Don't** use over-designed complex UI that is hard to read from a distance.
- **Don't** use fragile glassmorphism, semi-transparent layers, or blurred shadows that reduce legibility.
- **Don't** make touch targets smaller than 48px; users will be interacting with the app during active games.
