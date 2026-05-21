# Testing Strategy & Verification

## Overview
All core business logic must be fully unit tested using Jest to prevent regressions.

> [!IMPORTANT]
> **กฎเหล็กการพัฒนาฟีเจอร์ (Mandatory Testing Rule)**: 
> เมื่อมีการแก้ไขฟีเจอร์เดิม หรือเพิ่มฟีเจอร์ใหม่เข้ามาในโปรเจกต์ **ต้องมีการเขียน Unit Test เพิ่มเติมหรือปรับปรุงคู่กันไปด้วยเสมอ** เพื่อป้องกันไม่ให้ระบบหลุดจากความคาดหมาย (Regression) และรักษาคุณภาพของโค้ดให้ทำงานได้ถูกต้องตามที่ตั้งเป้าหมายไว้


## Key Target Areas & Test Suites
1. **Matchmaking Logic (`src/logic/matchmaking.ts`)**
   - Verify the Rule of Fairness (players with fewest games play first).
   - Verify Consecutive Rest (recently played players are rested).
   - Verify Singles vs. Doubles mode behavior.
   - Verify Partner/Opponent Variety (minimize repeat pairings).

2. **Scoreboard & Game Rules (`src/logic/scoreboard.ts`)**
   - Verify Standard Win conditions (without deuce).
   - Verify Deuce logic (must win by 2 points).
   - Verify Score Ceiling limits (e.g., maximum 30 points).
   - Verify Service Side (even score -> right, odd score -> left).

3. **State Management (`src/store/usePlayerStore.ts`)**
   - Verify Data Integrity (e.g., deleting a player cleans up their active/past matches).
   - Verify settings persistence (winning score, deuce toggle).

4. **Cost Calculation Logic (`src/logic/costCalculator.ts`)**
   - Verify Split Fairness (equal vs pro-rata calculations).
   - Verify Decimal Rounding (no lost/extra fraction of a unit).
   - Verify Data Validation & Edge Cases (handling zero values, negative numbers, or empty lists).


## Running Tests
- **Command**: Run `npm test` or `npx jest` to execute unit tests.
- Always run the test suite before finalizing code changes.
