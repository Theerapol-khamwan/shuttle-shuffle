# Engineering Standards & Core Principles

## 1. Zero-Network Policy
- **Offline-First**: The application must be 100% offline-first.
- **No External APIs**: Core logic and UI must not rely on external networks or APIs.
- **Storage**: All data is persisted locally via `expo-sqlite`.

## 2. Auto-Save Resilience
- **Persistent State**: The status of every match, player score, and settings must be saved immediately to the SQLite database on change.
- **Crash Recovery**: If the application crashes, closes, or restarts, it must be able to restore the active session state fully.

## 3. The Rule of Fairness (Matchmaking Engine)
- **Strict Fair Rotation**: Avoid 100% random matchmaking. Use a priority weighting system.
- **Fewest Games First**: Players who have played the fewest games in the current session must be given priority to play next.
- **Consecutive Rest**: Ensure players who just completed a game are rested/given lower priority if there are other waiting players.
- **Partner/Opponent Variety**: The algorithm should maximize diversity in partner and opponent combinations.

## 4. The Rule of Service (Scoreboard Logic)
- **Service Side Indicator**: Service side (left/right court) must be calculated dynamically based on current game score:
  - **Even Score**: Right side.
  - **Odd Score**: Left side.
- **Deuce & Game Point Rules**:
  - Support setting a dynamic winning score (e.g., 21 points).
  - Deuce mode (when enabled) requires winning by 2 points.
  - Apply a score ceiling (e.g., 30 points) where the first player/team to reach it wins regardless of the margin.

## 5. The Rule of Cost Transparency (Cost Splitting Logic)
- **Transparent Calculations**: Calculations must show how fees are divided clearly (e.g., displaying individual item prices, formulas, and weights).
- **Decimal Precision / Rounding Error Protection**: Must handle rounding errors properly so that the sum of individual split shares equals the total cost exactly.
- **Zero Division Protection**: Avoid division-by-zero errors when there are 0 players, 0 hours, or 0 shuttles.
- **Auto-Save Cost Configuration**: Cost configurations (hourly rate, hours, shuttle price, shuttle count, split method) must be saved dynamically in SQLite to prevent loss of settings.

## 6. Mandatory Feature Testing Rule
- **Mandatory Tests**: Every time an existing feature is modified or a new feature is added, developers (including AI agents) **must write or update corresponding unit tests**.
- **Regression Prevention**: This is required to ensure that new code does not introduce bugs and maintains the expected behavior of the system.

