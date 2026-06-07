# 🏸 ShuttleShuffle 

**ShuttleShuffle** คือแอปพลิเคชันจัดการก๊วนแบดมินตันแบบ **Offline-First** ที่สมบูรณ์แบบ ออกแบบมาเพื่อแก้ปัญหาการจัดคิวเล่นที่ไม่เป็นธรรม การจับคู่ซ้ำซาก และความสับสนเรื่องการนับคะแนน โดยตัวแอปทำหน้าที่เป็นทั้ง "ผู้จัดการคิว" และ "กรรมการบนคอร์ต" จบครบในมือถือเครื่องเดียวโดยไม่ต้องใช้อินเทอร์เน็ต

---

## 🌟 Core Features (ฟีเจอร์เด่น)

### 1. Smart Fair Matchmaking (ระบบสุ่มคิวอัจฉริยะ)
*   **The Rule of Fairness (Enhanced):** ระบบจะให้สิทธิ์ผู้เล่นที่มีจำนวนเกมสะสมน้อยที่สุดได้ลงสนามก่อนเสมอ
*   **Queue Simulation:** เมื่อกด "สุ่มล่วงหน้า" ระบบจะจำลองคิวเพื่อให้ทุกคนได้เล่นในจำนวนรอบที่เท่ากันที่สุด
*   **Singles & Doubles Support:** เลือกสุ่มได้ทั้งประเภทเดี่ยว (2 คน) และคู่ (4 คน) โดยระบบจะคำนวณคิวให้อัตโนมัติ
*   **Consecutive Rest Logic:** ระบบจะป้องกันไม่ให้คนเดิมลงสนามติดกันหลายรอบ (ถ้ามีคนรออยู่) เพื่อให้ทุกคนได้พักเหนื่อยอย่างยุติธรรม
*   **Partner/Opponent Variation:** อัลกอริทึมพยายามจับคู่พาร์ทเนอร์และคู่แข่งให้หลากหลายที่สุด ไม่ให้เจอคนเดิมซ้ำๆ

### 2. Smart Scoreboard & Responsive UI (กระดานคะแนนอัจฉริยะ)
*   **Multi-Orientation Support:** รองรับทั้งแนวตั้ง (Portrait) และแนวนอน (Landscape - แนะนำสำหรับการวางข้างสนาม)
*   **High-Visibility Score:** ตัวเลขคะแนนขนาดใหญ่พิเศษ เห็นชัดแม้ยืนอยู่ไกล
*   **Service Indicator:** บอกฝั่งเสิร์ฟ (ซ้าย/ขวา) อัตโนมัติตามกติกาสากล (คู่-ขวา / คี่-ซ้าย)
*   **Deuce & Game Point:** มีระบบแจ้งเตือน Game Point และระบบ Deuce (ดิวส์) ที่รองรับการชนะห่าง 2 แต้ม พร้อมเพดานคะแนนสูงสุด

### 3. Session Management (การจัดการรอบการเล่น)
*   **Player Setup:** เพิ่ม/ลบ รายชื่อเพื่อนในก๊วนได้รวดเร็ว พร้อมปุ่มล้างข้อมูลทั้งหมด (Clear All)
*   **Waiting List:** แสดงรายชื่อผู้เล่นที่กำลังรอคิว (เศษ) พร้อมบอกลำดับคิวที่จะได้ลงสนามถัดไป
*   **Match Settings:** ปรับเปลี่ยนแต้มที่ชนะ (Winning Score) และเปิด/ปิดระบบ Deuce ได้แบบ Dynamic
*   **Session Summary:** สรุปสถิติหลังจบวัน (ใครเล่นกี่เกม ชนะเท่าไหร่ แพ้เท่าไหร่)
*   **Cost Calculator (ระบบคำนวณและหารค่าใช้จ่าย):** คำนวณค่าคอร์ทและค่าลูกแบดมินตันตามจำนวนชั่วโมงและจำนวนลูกที่ใช้จริง พร้อมระบบหารเฉลี่ยเท่ากัน (Equal) หรือหารตามสัดส่วนจำนวนเกมที่ลงเล่น (Pro-rata)

### 4. Technical Excellence (ความเสถียรของระบบ)
*   **100% Offline-First:** ข้อมูลทุกอย่างเก็บใน Local Database (SQLite) บนเครื่อง ไม่ต้องใช้เน็ต และไม่มีค่าใช้จ่ายเซิร์ฟเวอร์
*   **Auto-Save Resilience:** ทุกครั้งที่แต้มเปลี่ยน หรือมีการสร้างแมตช์ ระบบจะเซฟลงฐานข้อมูลทันที หากแอปปิดไปแล้วเปิดใหม่ ข้อมูลจะยังอยู่ครบถ้วน

---

## 🧪 Testing Strategy (แผนการทดสอบ)

เพื่อให้แอปทำงานได้อย่างถูกต้องและป้องกันบัคเมื่อมีการแก้ไขโค้ด จะมีการใช้ Unit Test สำหรับตรวจสอบส่วนสำคัญดังนี้:

### 1. Matchmaking Logic (`src/logic/matchmaking.ts`) ✅
*   **Rule of Fairness:** ตรวจสอบว่าระบบเลือกคนที่เล่นเกมน้อยที่สุดลงสนามก่อน 100% ✅
*   **Consecutive Rest:** ตรวจสอบว่าคนที่เพิ่งเล่นจบไปต้องถูกพัก (Priority ต่ำลง) หากมีคนอื่นรออยู่ในคิว ✅
*   **Singles/Doubles Mode:** ตรวจสอบความถูกต้องของการสุ่มผู้เล่นตามจำนวนที่โหมดกำหนด ✅
*   **No Repeats:** ตรวจสอบว่าระบบพยายามเลือกพาร์ทเนอร์ที่เจอกันน้อยที่สุด ✅

### 2. Scoreboard & Game Rules (`src/logic/scoreboard.ts`) ✅
*   **Standard Win:** ตรวจสอบว่าผู้เล่นที่ถึงคะแนนเป้าหมายเป็นฝ่ายชนะ (เมื่อปิดระบบ Deuce) ✅
*   **Deuce Logic:** ตรวจสอบว่าต้องชนะห่าง 2 แต้มเมื่อคะแนนเสมอกันที่จุด Deuce ✅
*   **Score Ceiling:** ตรวจสอบว่าคะแนนจะไม่เกินเพดานสูงสุด (เช่น 30 แต้ม) ✅
*   **Service Side:** ตรวจสอบความถูกต้องของฝั่งเสิร์ฟ (ซ้าย/ขวา) อิงตามคะแนนปัจจุบัน ✅

### 3. State Management (`src/store/usePlayerStore.ts`) ✅
*   **Data Integrity:** ตรวจสอบว่าเมื่อลบผู้เล่น แมตช์ที่เกี่ยวข้องจะถูกลบออกด้วยเพื่อป้องกันบัค Unknown ✅
*   **Settings Persistence:** ตรวจสอบว่าการแก้ไข Settings (Winning Score/Deuce) ถูกบันทึกลง State อย่างถูกต้อง ✅

### 4. Cost Calculation Logic (`src/logic/costCalculator.ts`) ✅
*   **Split Fairness:** ตรวจสอบความถูกต้องของการหารค่าใช้จ่าย ทั้งแบบหารเท่ากันทุกคน และแบบคำนวณตามสัดส่วนเกมที่เล่น (Pro-rata) ✅
*   **Decimal Rounding:** ตรวจสอบความถูกต้องในการปัดเศษสตางค์ ไม่ให้มีเศษเงินเหลือหรือขาดหายไปจากระบบ ✅
*   **Data Validation:** ตรวจสอบค่าป้อนเข้า (จำนวนชั่วโมง, ราคาคอร์ท, จำนวนลูก, ราคายูนิต) ให้คำนวณถูกต้องและไม่เกิด Division by Zero ✅


---

## 🏗 System Architecture (สถาปัตยกรรมระบบ)

โปรเจกต์นี้ใช้เทคโนโลยีที่ทันสมัยและมีประสิทธิภาพสูง:

*   **Frontend Framework:** React Native (Expo SDK 54) + TypeScript
*   **Local Database:** `expo-sqlite` (Relational storage)
*   **State Management:** `Zustand` (Real-time UI updates)
*   **Navigation:** `expo-router` (File-based routing)

---

## 🚀 Getting Started (วิธีเริ่มต้นใช้งาน)

### การติดตั้ง (Installation)
1. Clone โปรเจกต์ลงเครื่อง
2. รันคำสั่งติดตั้ง dependencies:
   ```bash
   bun install
   ```

### การรันแอป (Usage)

เนื่องจากแอปมีการใช้ **Native Module** (`expo-http-server`) สำหรับฟีเจอร์แชร์จอคะแนน (Phase 9.2) การรันแอปจึงแบ่งออกเป็น 2 โหมด:

#### ตัวเลือกที่ 1: รันผ่าน Expo Go (รวดเร็ว แต่ฟีเจอร์แชร์จอจะใช้ไม่ได้)
หากต้องการแก้ไขและทดสอบ UI ทั่วไป สามารถใช้ Expo Go ได้ตามปกติ (ระบบจะทำการปิดฟีเจอร์แชร์หน้าจอให้อัตโนมัติ เพื่อป้องกันแอปแครช)
```bash
bunx expo start
```
*   จากนั้นใช้แอป **Expo Go** สแกน QR Code เพื่อทดสอบ

#### ตัวเลือกที่ 2: รันผ่าน Development Build (ทดสอบฟีเจอร์ครบ 100%)
หากต้องการทดสอบฟีเจอร์ "แชร์จอคะแนน (LAN Server)" จะต้องรันผ่าน Development Build ซึ่งต้องคอมไพล์โค้ด Native ใหม่:
```bash
# สำหรับ Android
bunx expo run:android

# สำหรับ iOS
bunx expo run:ios
```
*   **ข้อควรระวัง:** คุณต้องติดตั้ง Android Studio หรือ Xcode ในเครื่องก่อนจึงจะสามารถ Build ได้

---

## 📦 Building APK (วิธี Build ไฟล์ .apk ที่เครื่อง)

### สิ่งที่ต้องติดตั้งก่อน (Prerequisites)

| เครื่องมือ | เวอร์ชันขั้นต่ำ | หมายเหตุ |
|---|---|---|
| **Node.js** | 18+ | แนะนำ LTS |
| **Bun** | 1.x | ใช้แทน npm/yarn |
| **Java JDK** | 17 | ตรวจสอบด้วย `java -version` |
| **Android Studio** | Latest | ต้องติดตั้ง Android SDK, Build-Tools และ NDK |
| **Android SDK** | API 35 (compileSdk) | ตั้งค่า `ANDROID_HOME` ให้ถูกต้อง |

#### ตั้งค่า Environment Variables (macOS/Linux)
เพิ่มบรรทัดเหล่านี้ใน `~/.zshrc` หรือ `~/.bashrc`:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```
จากนั้นรัน `source ~/.zshrc` เพื่อให้มีผล

---

### วิธีที่ 1: Build ผ่าน Gradle โดยตรง (แนะนำ ✅)

วิธีนี้ใช้โฟลเดอร์ `android/` ที่ถูก prebuild ไว้แล้ว เหมาะสำหรับ **Debug APK** ที่ต้องการทดสอบบนเครื่องจริง

#### 1.1 ติดตั้ง Dependencies
```bash
bun install
```

#### 1.2 Build Debug APK
```bash
cd android && ./gradlew assembleDebug
```

#### 1.3 ไฟล์ APK จะอยู่ที่
```
android/app/build/outputs/apk/debug/app-debug.apk
```

#### 1.4 ติดตั้งลงมือถือ (เสียบสาย USB + เปิด USB Debugging)
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

> **💡 Tip:** หากต้องการ Build แบบ **Release APK** (ขนาดเล็กกว่า, เร็วกว่า) ให้ใช้:
> ```bash
> cd android && ./gradlew assembleRelease
> ```
> ไฟล์จะอยู่ที่ `android/app/build/outputs/apk/release/app-release.apk`
> ⚠️ Release build ปัจจุบันใช้ `debug.keystore` ในการ Sign หากจะนำขึ้น Play Store ต้องสร้าง Keystore ของตัวเองก่อน

---

### วิธีที่ 2: Build ผ่าน EAS Build (Local)

วิธีนี้ใช้ระบบ EAS ของ Expo แต่ Build ที่เครื่องตัวเอง (ไม่ต้องส่งไป Cloud)

#### 2.1 ติดตั้ง EAS CLI และล็อกอิน
```bash
bun add -g eas-cli
eas login
```
*(ถ้ามีเพื่อนในทีมที่จะช่วย Build ต้องให้พวกเขาล็อกอินด้วยบัญชี Expo ของตัวเอง และคุณต้องเชิญเขาเข้า Organization `starmolice` ก่อน)*

#### 2.2 Build APK ที่เครื่อง
```bash
eas build --platform android --profile preview --local
```
*   Profile `preview` ถูกตั้งค่าให้ Output เป็นไฟล์ `.apk` (ตามที่กำหนดใน `eas.json`)
*   Flag `--local` หมายถึง Build ที่เครื่องตัวเอง ไม่ต้องส่งไป EAS Cloud
*   โปรเจกต์นี้ผูกอยู่กับ Organization ชื่อ **starmolice** ทุกคนที่อยู่ในทีมจะสามารถรันคำสั่งนี้และช่วยกันพัฒนาได้

#### 2.3 ไฟล์ APK จะถูกสร้างไว้ที่ Root ของโปรเจกต์
```
./build-*.apk
```

---

### วิธีที่ 3: Build ผ่าน expo run:android

วิธีนี้เป็นการ Build พร้อมรันลงเครื่อง/Emulator โดยตรง (Development Build)

```bash
bunx expo run:android --variant release
```
*   ถ้าไม่ใส่ `--variant release` จะเป็น Debug build (Default)
*   APK จะถูกติดตั้งลง Emulator/เครื่องจริงที่เชื่อมต่ออยู่โดยอัตโนมัติ
*   ไฟล์ APK จะอยู่ใน `android/app/build/outputs/apk/` เช่นเดียวกับวิธีที่ 1

---

### วิธีที่ 4: Build ผ่าน EAS Cloud (Team Build) ☁️

วิธีนี้เหมาะสำหรับให้ทีมช่วยกัน Build โดยไม่ต้องใช้เครื่องคอมพิวเตอร์ตัวเองประมวลผล (ระบบจะส่งโค้ดไป Build บน Cloud ของ Expo แทน) ทุกคนใน Organization สามารถเข้ามาช่วยกด Build หรือดาวน์โหลด APK จากเว็บได้เลย

#### 4.1 ล็อกอินด้วยบัญชี Expo
```bash
eas login
```
*(ต้องเป็นสมาชิกของ Organization `starmolice`)*

#### 4.2 สั่ง Build ขึ้น Cloud
```bash
eas build --platform android --profile preview
```
*   ไม่ต้องใส่ `--local`
*   รอระบบทำงาน (ประมาณ 5-10 นาที) เมื่อเสร็จแล้วจะได้ Link สำหรับดาวน์โหลดไฟล์ `.apk` โดยตรง
*   ทีมงานทุกคนสามารถเข้าไปดูสถานะการ Build และโหลด APK ย้อนหลังได้ที่ [expo.dev](https://expo.dev)

---

### ❓ Troubleshooting (แก้ปัญหาที่พบบ่อย)

| ปัญหา | วิธีแก้ |
|---|---|
| `SDK location not found` | ตั้งค่า `ANDROID_HOME` ให้ถูกต้อง หรือสร้างไฟล์ `android/local.properties` พร้อมเนื้อหา `sdk.dir=/Users/<username>/Library/Android/sdk` |
| `Could not determine java version` | ติดตั้ง JDK 17 และตรวจสอบด้วย `java -version` |
| `Execution failed for task ':app:...'` | ลองล้าง Cache ด้วย `cd android && ./gradlew clean` แล้ว Build ใหม่ |
| Build ช้ามาก | เพิ่ม RAM ให้ Gradle ใน `android/gradle.properties`: `org.gradle.jvmargs=-Xmx4096m` |
| `adb: command not found` | เพิ่ม `$ANDROID_HOME/platform-tools` ใน PATH |

---

## 📜 Development Roadmap (ประวัติการพัฒนา)

### ✅ Phase 1: Setup & Data Layer
*   กำหนดโครงสร้างโปรเจกต์ (React Native + Expo + TypeScript)
*   ออกแบบและสร้าง Schema ใน SQLite (`sessions`, `players`, `matches`)
*   สร้างหน้า UI สำหรับจัดการก๊วน (เพิ่ม/ลบ ผู้เล่น) และปุ่มล้างข้อมูล

### ✅ Phase 2: The Matchmaking Engine
*   พัฒนาระบบสุ่มคิวตามจำนวนเกมที่เล่น (Strict Fair Rotation)
*   เขียนลอจิกจับคู่แบบทีม 2 คน และรองรับประเภทเดี่ยว
*   สร้าง Dashboard แสดงรายการแมตช์ที่กำลังเล่นอยู่

### ✅ Phase 3: The Smart Scoreboard
*   สร้างหน้า Scoreboard แบบ High-Contrast รองรับแนวตั้งและแนวนอน
*   ระบบปุ่มปรับแต้ม (+/-) และการแตะที่ตัวเลขเพื่อเพิ่มแต้ม
*   ลอจิกตำแหน่งเสิร์ฟ และระบบ Auto-save คะแนนลง DB

### ✅ Phase 4: Polish & Summary
*   เพิ่มหน้า Session Summary สรุปผลชนะ/แพ้ประจำวัน
*   ทดสอบ Edge Cases และระบบออฟไลน์สมบูรณ์แบบ

### ✅ Phase 5: Advanced Settings & Waiting List
*   ระบบ Match Settings (ตั้งค่าแต้มชนะแบบ Dynamic และระบบ Deuce)
*   เพิ่มส่วน Waiting List แสดงรายชื่อผู้เล่นที่รอคิว (เศษ) เรียงตามลำดับความสำคัญ
*   เพิ่มกฎ Consecutive Rest (กฎการพัก) เพื่อป้องกันคนเดิมลงเล่นติดกัน

### ✅ Phase 6: Cost Splitting & Calculator (การจัดการค่าใช้จ่าย)
*   **Cost Input Form:** สร้าง UI สำหรับกรอกค่าสนาม (จำนวนชั่วโมง * อัตราต่อชั่วโมง * จำนวนสนาม) และค่าลูกแบด (จำนวนลูก * ราคาต่อลูก)
*   **Split Algorithms:** พัฒนาระบบคำนวณการหารเงิน 2 แบบ:
    1. *Equal Split:* หารเท่ากันทุกคนที่เข้าร่วมเซสชัน
    2. *Pro-rata Split:* หารตามสัดส่วนจำนวนเกมที่ลงเล่นจริง (เล่นเยอะหารเยอะ)
*   **Exclusion & Adjustments:** รองรับการเลือกติ๊กถูก/ติ๊กออก เพื่อไม่นำบางคนมาร่วมหาร หรือเว้นค่าใช้จ่ายบางส่วน
*   **Payment Tracking:** เพิ่มสถานะการชำระเงินของแต่ละคนในหน้า Session Summary (Paid / Unpaid)
*   **Database Integration:** ออกแบบฟิลด์เพิ่มในตาราง `sessions` ใน SQLite และเพิ่ม State ใน Zustand เพื่อเก็บข้อมูลค่าใช้จ่าย
*   **Multi-Court Pricing:** ค่าสนามคำนวณโดยคูณด้วยจำนวนสนาม (`total_courts`) ทำให้รองรับก๊วนที่เช่าหลายสนามพร้อมกัน

### ✅ Phase 7: Multi-Court Matchmaking (ระบบจัดสรรผู้เล่นแบบหลายสนาม)
*   **Court Count Setting:** เพิ่มการตั้งค่า "จำนวนสนาม (Total Courts)" ในหน้าแดชบอร์ด (⚙️ ตั้งค่า) และหน้าหารค่าใช้จ่าย บันทึกลง SQLite และ Zustand State ทันที
*   **Court-Grouped Dashboard:** หน้าแดชบอร์ดแสดงแมตช์แบ่งกลุ่มตามหมายเลขคอร์ต (คอร์ต 1, คอร์ต 2, ...) โดยอัตโนมัติตามจำนวนสนามที่ตั้งไว้
*   **Vacant Court Cards:** คอร์ตที่ยังว่างอยู่จะแสดงการ์ด "ว่าง" พร้อมปุ่ม **"+ สุ่มลงคอร์ตนี้"** ให้กดสุ่มผู้เล่นลงสนามนั้นๆ โดยตรง
*   **Auto-Detect Court:** ปุ่ม "เพิ่ม 1 แมตช์" จะหาคอร์ตที่ว่างอยู่อัตโนมัติ (คอร์ต 1 → 2 → ...) โดยไม่ต้องระบุเอง
*   **Round-Based Bulk Generation:** ระบบสุ่มล่วงหน้า (`bulkMatchGeneration`) สุ่มเป็นรอบ โดยใน 1 รอบจะกระจายแมตช์ไปยังทุกคอร์ตที่เปิดใช้งาน พร้อมกลไกป้องกันผู้เล่นคนเดิมลงเล่นหลายสนามในเวลาเดียวกัน (Overlap Prevention)
*   **Unit Tests:** เขียน Unit Test ครอบคลุมกลไกสำคัญทั้งหมด รวมถึงการคำนวณราคาแบบหลายสนาม และการสุ่มแมตช์แยกคอร์ตใน `usePlayerStore`

### ✅ Phase 8: UI Migration to Playful Neo-Brutalist Design (Atomic Design)
*   **Design Tokens System:** สร้าง Design Token แบบเต็มรูปแบบ (colors, typography, spacing, shadows) ตามข้อกำหนดดีไซน์ Stitch
*   **Atomic Design Architecture:** จัดโครงสร้าง component แยกตามสถาปัตยกรรมอะตอม (Atoms, Molecules, Organisms, Templates)
*   **Typography Loading:** เพิ่มการโหลดฟอนต์ Google Fonts 4 ตัว (Bricolage Grotesque, Plus Jakarta Sans, Space Grotesk, Sarabun) ผ่าน expo-font พร้อมระบบจัดการ Splash Screen
*   **Neo-Brutalist Visual Styles:** ปรับแต่งองค์ประกอบดีไซน์ให้ใช้ขอบหนา 3px, เงาทึบไม่มีเบลอ 4px/8px, พื้นหลัง Dot Grid, และโทนสีหลักเป็น Electric Yellow (#d6ff00)
*   **Complete Screen Refresh:** อัปเดตและทำความสะอาด UI หน้าหลักทั้งหมด (หน้าแรก, จัดการผู้เล่น, แดชบอร์ดคอร์ต, กระดานคะแนนเสมือนจริง, สรุปผลลัพธ์ประจำวัน) ให้สวยงามมีชีวิตชีวาด้วย micro-animations แบบ spring
*   **Edge-to-Edge Gestural Scoreboard:** พัฒนากระดานคะแนน Match Live แบบ Colossal (ตัวเลขขนาดใหญ่พิเศษ 150/180px) ไร้ส่วนขยับเขยื้อนด้วย monospaced tabular numerals และตัด AppBar ออกเพื่อเพิ่มพื้นที่การแสดงผลสูงสุด พร้อมอัปเกรดระบบสัมผัสขยายคลุมทั่วแผ่นการ์ดคะแนนแบ่งสัดส่วน 50/50 (กดฝั่งซ้ายของกรอบเพื่อลดแต้ม -1, กดฝั่งขวาของกรอบเพื่อเพิ่มแต้ม +1 ได้อย่างลื่นไหลแม้อยู่ข้างสนาม)
*   **Neo-Brutalist Hamburger AppBar:** ใช้แถบคาดด้านบน (AppBar) สไตล์ Neo-Brutalist พร้อมปุ่ม Hamburger Menu เปิดหน้าต่างควบคุมแบบ Modal กลางจอ ภายในมีคำสั่ง สลับผู้เสิร์ฟ, **สลับฝั่งคอร์ตซ้าย-ขวา (Swap Sides)**, จบการแข่งขัน และกลับหน้าหลัก โดยแถบ AppBar จะย่อขนาดเล็กลงอัตโนมัติในโหมดแนวนอน (Landscape) เพื่อคืนพื้นที่แสดงคะแนนให้มากที่สุด

### ✅ Phase 9: Level-Based Matchmaking (ระบบสุ่มตามระดับฝีมือ)
*   **Skill Level Tagging:** เพิ่มระดับฝีมือให้ผู้เล่น (เช่น Beginner, Intermediate, Advanced) 
*   **Fair + Balanced Algorithm:** ปรับปรุงอัลกอริทึมให้คัดเลือกคนที่ "เกมน้อยที่สุด" ออกมากลุ่มหนึ่งก่อน จากนั้นทำการไขว้ทีมให้ค่าเฉลี่ยฝีมือ (Average Skill) ของทั้งสองฝั่งใกล้เคียงกันที่สุด เพื่อความสูสีและสนุกของเกม

### ✅ Phase 9.2: Offline Remote Scoreboard (Local LAN Web Server)
*   **Local LAN Server:** เครื่องของแอดมินจำลองตัวเองเป็น Web Server ขนาดย่อมๆ (ด้วย `expo-http-server`) เปิดแชร์จอคะแนนผ่านวง LAN/Wi-Fi เดียวกันโดยไม่ต้องใช้อินเทอร์เน็ต
*   **QR Code Sharing:** สร้าง QR Code พร้อม URL ทันที เพื่อให้เพื่อนในก๊วนเอามือถือสแกนดูคะแนนแบบสดๆ จากเบราว์เซอร์
*   **Bi-directional Sync (Polling):** ฝั่งเว็บใช้ระบบ Polling เพื่อซิงค์คะแนนให้ตรงกับแอปหลักแบบเกือบ Real-time และอนุญาตให้แตะที่หน้าเว็บเพื่อบวก/ลบคะแนนส่งกลับมาที่เครื่องแอดมินได้
*   **Expo Go Fallback Protection:** ป้องกันแอปแครชด้วยการโหลด Native Module แบบเงื่อนไข ให้แอปส่วนใหญ่ยังสามารถเทสและรันด้วย Expo Go ได้ตามปกติ

---

## ⚖️ Engineering Standards (มาตรฐานการพัฒนา)
1.  **The Rule of Fairness:** ห้ามสุ่มแบบ 100% ต้องใช้ Priority Weighting เพื่อความยุติธรรมสูงสุด
2.  **The Rule of Service:** ลอจิกซ้าย/ขวาต้องแม่นยำตามกติกาสากล
3.  **Zero-Network Policy:** โค้ดหลักต้องไม่พึ่งพา API ภายนอก
4.  **Auto-Save Resilience:** สถานะของแมตช์ต้องถูกบันทึกตลอดเวลา ป้องกันกรณีแบตเตอรี่หมดหรือแอปแครช
5.  **The Rule of Cost Transparency:** ระบบการหารค่าใช้จ่ายต้องชัดเจน ตรวจสอบทศนิยมการปัดเศษสตางค์อย่างรัดกุม (Rounding Error Handling) และห้ามให้เกิดการหารด้วยศูนย์ (Division by Zero Protection)
6.  **Mandatory Feature Testing Rule:** ทุกครั้งที่มีการแก้ไขฟีเจอร์เดิม หรือเพิ่มฟีเจอร์ใหม่เข้ามาในระบบ **ต้องทำการเขียนหรืออัปเดต Unit Test คู่กันเสมอ** เพื่อยืนยันความถูกต้องและป้องกันไม่ให้โค้ดใหม่ทำให้ระบบหลุดจากความคาดหมายเดิม (Regression prevention)