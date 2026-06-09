/**
 * Embedded HTML Scoreboard Page
 *
 * ออกแบบตาม ShuttleShuffle Design System (Neo-Brutalist)
 * ใช้ short-polling (fetch every 800ms) แทน SSE
 * เพราะ expo-http-server ไม่รองรับ streaming responses
 */

export const getScoreboardPageHTML = (matchId: string, initialData?: any): string =>`<!DOCTYPE html>
 <html lang="th">
 <head>
   <meta charset="UTF-8">
   <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
   <meta name="mobile-web-app-capable" content="yes">
   <meta name="apple-mobile-web-app-capable" content="yes">
   <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
   <title>ShuttleShuffle – จอคะแนน</title>
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@800;700;600&family=Plus+Jakarta+Sans:wght@700;500&family=Space+Grotesk:wght@700;500&display=swap" rel="stylesheet">
   <style>
     :root {
       --primary:            #546500;
       --primary-container:  #d6ff00;
       --secondary:          #2e6385;
       --secondary-container: #a5d8ff;
       --error:              #ba1a1a;
       --error-container:    #ffdad6;
       --background:         #fcf9f8;
       --on-background:      #1c1b1b;
       --surface-container:  #f0edec;
       --outline-variant:    #c5c9ac;
       --dimmed-bg:          #e5e7eb;
       --dimmed-red:         #fca5a580;
       --dimmed-blue:        #93c5fd80;
       --font-display: 'Bricolage Grotesque', system-ui, sans-serif;
       --font-body:    'Plus Jakarta Sans', system-ui, sans-serif;
       --font-label:   'Space Grotesk', system-ui, sans-serif;
       --shadow-solid: 4px 4px 0px var(--on-background);
       --border-thick: 3px solid var(--on-background);
       --radius-lg:    16px;
       --radius-md:    8px;
     }
     *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
     html, body {
       height: 100%;
       overflow: hidden;
       background: var(--background);
       color: var(--on-background);
       font-family: var(--font-body);
       -webkit-tap-highlight-color: transparent;
       touch-action: manipulation;
     }
     #app { display: flex; flex-direction: column; height: 100dvh; height: 100vh; }

     /* AppBar */
     #appbar {
       display: flex;
       align-items: center;
       justify-content: space-between;
       padding: 10px 16px;
       height: 56px;
       background: var(--background);
       border-bottom: var(--border-thick);
       box-shadow: 0 4px 0 var(--on-background);
       flex-shrink: 0;
       z-index: 100;
     }
     #appbar-title {
       font-family: var(--font-display);
       font-size: 14px;
       font-weight: 800;
       letter-spacing: 2px;
       text-transform: uppercase;
     }
     #connection-status {
       display: flex;
       align-items: center;
       gap: 6px;
       font-family: var(--font-label);
       font-size: 11px;
       font-weight: 700;
       letter-spacing: 0.5px;
       text-transform: uppercase;
     }
     #status-dot {
       width: 8px; height: 8px;
       border-radius: 50%;
       background: #aaa;
       transition: background 0.3s;
     }
     #status-dot.connected   { background: #22c55e; }
     #status-dot.disconnected { background: var(--error); animation: blink 1s infinite; }

     /* Score Body */
     #score-body {
       display: flex;
       flex: 1;
       overflow: hidden;
     }
     /* แนวนอน: แบ่งทีม A | B (ซ้าย | ขวา) */
     @media (orientation: landscape) { #score-body { flex-direction: row; } }
     /* แนวตั้ง: แบ่งทีม A / B (บน / ล่าง) */
     @media (orientation: portrait) { #score-body { flex-direction: column; } }

     /* Panel */
     .panel {
       flex: 1;
       display: flex;
       flex-direction: column;
       position: relative;
       overflow: hidden;
       border: 2px solid var(--on-background);
       transition: background-color 0.4s;
     }
     .panel-a { background-color: var(--error-container); }
     .panel-b { background-color: var(--secondary-container); }

     /* Side Overlays */
     .side {
       position: absolute;
       z-index: 1;
       transition: opacity 0.4s, background-color 0.4s;
       pointer-events: none;
     }

     @media (orientation: landscape) {
       /* แนวนอน: ในหนึ่งทีม ให้แบ่ง บน/ล่าง สำหรับการเสิร์ฟ */
       .side { width: 100%; height: 50%; left: 0; }
       .side-1 { top: 0; }
       .side-2 { bottom: 0; }
     }
     @media (orientation: portrait) {
       /* แนวตั้ง: ในหนึ่งทีม ให้แบ่ง ซ้าย/ขวา สำหรับการเสิร์ฟ */
       .side { width: 50%; height: 100%; top: 0; }
       .side-1 { left: 0; }
       .side-2 { right: 0; }
     }

     /* Background States */
     .bg-active { 
       background-color: rgba(0, 0, 0, 0.1) !important; 
       opacity: 1 !important; 
       border: 8px solid #ffcc00 !important; /* Yellow Border for Server */
       z-index: 5;
     }
     .bg-dim { background-color: #4b5563 !important; opacity: 0.4 !important; } /* Greyer/Dimmed state */

 /* Content Overlay */
       .panel-content {
       position: relative;
       z-index: 10;
       flex: 1;
            display: flex;
           flex-direction: column;
            align-items: center;
            justify-content: center;
           padding: 12px;
            pointer-events: none;
          }

         .panel-header {
            position: absolute;
            top: 15px;
            display: flex;
           flex-direction: column;
            align-items: center;
            width: 100%;
            gap: 4px;
          }
          .team-label {
            font-family: var(--font-display);
            font-size: clamp(18px, 5vmin, 42px);
           font-weight: 800;
            text-align: center;
            max-width: 90%;
            overflow: hidden;
            text-overflow: ellipsis;
           white-space: nowrap;
            background: rgba(255,255,255,0.85);
           padding: 8px 16px;
           border-radius: 4px;
            border: 3px solid var(--on-background);
            box-shadow: 3px 3px 0 var(--on-background);
          }

         .score-number {
           font-family: var(--font-display);
           font-size: clamp(180px, 65vmin, 600px);
            font-weight: 800;
            line-height: 0.8;
            text-align: center;
            font-variant-numeric: tabular-nums;
            color: var(--on-background);
            text-shadow: 4px 4px 0 rgba(255,255,255,0.5);
          }

          .serving-container {
            position: absolute;
            bottom: 30px;
            height: 60px;
            display: flex;
           align-items: center;
            justify-content: center;
           width: 100%;
          }
          .serving-badge {
            visibility: hidden;
            display: flex;
            align-items: center;
            gap: 12px;
            font-family: var(--font-label);
            font-size: clamp(14px, 3vmin, 28px); font-weight: 700;
            letter-spacing: 1.5px; text-transform: uppercase;
            padding: 8px 24px; border-radius: 99px;
            border: 4px solid var(--on-background);
            background: var(--primary-container);
            color: var(--on-background);
            box-shadow: 4px 4px 0 var(--on-background);
          }
          .serving-badge.show { visibility: visible; }
          .streak-icon {
            display: none;
            width: clamp(24px, 5vmin, 48px);
            height: clamp(24px, 5vmin, 48px);
            object-fit: contain;
          }
          .streak-icon.show { display: block; }

          .game-point-banner {
            display: none;
            font-family: var(--font-label);
            font-size: 12px; font-weight: 800;
            letter-spacing: 0.5px; text-transform: uppercase;
            padding: 4px 16px; border-radius: var(--radius-md);
            border: 2px solid var(--on-background);
            box-shadow: 3px 3px 0 var(--on-background);
            background: #fff;
            color: var(--on-background);
            margin-top: 8px;
            transform: rotate(-2deg);
         }
          .game-point-banner.show { display: block; }

          /* Background Colors & Dimming */
         .bg-red-full { background: var(--error-container) !important; opacity: 1 !important; }
          .bg-blue-full { background: var(--secondary-container) !important; opacity: 1 !important; }
          .bg-dim { background: #e5e7eb !important; opacity: 0.4 !important; }


     #court-info {
       font-family: var(--font-label);
       font-size: 11px; font-weight: 700;
       text-transform: uppercase;
       padding: 3px 10px;
       border: 1.5px solid var(--on-background);
       border-radius: 99px;
       background: var(--surface-container);
       box-shadow: 2px 2px 0 var(--on-background);
     }

     .score-flash { animation: scoreFlash 0.25s ease-out; }
     @keyframes scoreFlash { 0% {transform:scale(1)} 30% {transform:scale(1.15)} 100% {transform:scale(1)} }
   </style>
 </head>
 <body>
 <div id="app">
   <div id="appbar">
     <div id="appbar-title">🏸 ShuttleShuffle</div>
     <div id="court-info">—</div>
     <div id="connection-status">
       <div id="status-dot"></div>
       <span id="status-text">กำลังโหลด...</span>
     </div>
   </div>

   <div id="score-body">
       <!-- Team A (Red) -->
     <div class="panel panel-a" id="panel-a">
       <div class="side side-a" id="side-a-1"></div>
       <div class="side side-b" id="side-a-2"></div>
       <div class="panel-content">
         <div class="panel-header">
           <div class="team-label" id="label-a">ทีม A</div>
           <div class="game-point-banner" id="gp-a">GAME POINT</div>
         </div>
         <div class="score-number" id="score-a">0</div>
         <div class="serving-container">
           <div class="serving-badge" id="serving-a">
             <img src="/assets/exchange.png" class="streak-icon" id="streak-a" alt="streak" />
             <span>🏸 SERVING</span>
           </div>
         </div>
       </div>
     </div>

     <!-- Team B (Blue) -->
     <div class="panel panel-b" id="panel-b">
       <div class="side side-a" id="side-b-1"></div>
       <div class="side side-b" id="side-b-2"></div>
       <div class="panel-content">
         <div class="panel-header">
           <div class="team-label" id="label-b">ทีม B</div>
           <div class="game-point-banner" id="gp-b">GAME POINT</div>
         </div>
         <div class="score-number" id="score-b">0</div>
         <div class="serving-container">
           <div class="serving-badge" id="serving-b">
             <img src="/assets/exchange.png" class="streak-icon" id="streak-b" alt="streak" />
             <span>🏸 SERVING</span>
           </div>
         </div>
       </div>
     </div>
   </div>
 </div>

 <div id="connection-lost">
   <h2>📡 การเชื่อมต่อขาดหาย</h2>
   <p>กำลังพยายามเชื่อมต่อใหม่...<br>ตรวจสอบว่าอยู่ใน Wi-Fi วงเดียวกัน</p>
   <button class="reconnect-btn" onclick="location.reload()">🔄 รีเฟรชหน้า</button>
 </div>

 <script>
   const urlParams = new URLSearchParams(window.location.search);
   const MATCH_ID = urlParams.get('id') || urlParams.get('matchId') || '${matchId}';
   const INITIAL_DATA = ${initialData ? JSON.stringify(initialData) : 'null'};

   const POLL_INTERVAL = 1000;
   let lastTimestamp = INITIAL_DATA ? (INITIAL_DATA.updatedAt || INITIAL_DATA.timestamp || Date.now()) : Date.now();
   let failCount = 0;
   let pollTimer = null;
   let isPolling = false;
   let prevScoreA = -1;
   let prevScoreB = -1;
   let prevServingTeam = '';
   let lastData = INITIAL_DATA;

   async function poll() {
     if (isPolling) return;
     if (!MATCH_ID || MATCH_ID === 'undefined') {
       setStatus('disconnected');
       return;
     }

     isPolling = true;
     try {
       const controller = new AbortController();
       const timeoutId = setTimeout(() => controller.abort(), 3500);

       const res = await fetch('/api/poll', {
         method: 'POST',
         headers: { 
           'Content-Type': 'application/json',
           'Cache-Control': 'no-cache',
           'Pragma': 'no-cache'
         },
         body: JSON.stringify({ matchId: MATCH_ID, since: lastTimestamp }),
         signal: controller.signal,
         cache: 'no-store',
         mode: 'cors'
       });

       clearTimeout(timeoutId);

       if (!res.ok) throw new Error('HTTP ' + res.status);

       const data = await res.json();
       failCount = 0;
       setStatus('connected');
       hideConnectionLost();

       if (data && (data.status === 'completed' || (!data.matchId && data.hasUpdate === false))) {
         console.log('Match ended, redirecting...');
         setTimeout(() => { window.location.href = '/'; }, 1000);
         return;
       }

       // Robust update: อัพเดท UI ถ้ามีข้อมูลใหม่
       if (data) {
         lastData = data;
         const scoreChanged = (data.scoreA !== undefined && data.scoreA !== prevScoreA) || 
                            (data.scoreB !== undefined && data.scoreB !== prevScoreB) ||
                            (data.servingTeam !== undefined && data.servingTeam !== prevServingTeam);

         if (data.hasUpdate === true || scoreChanged) {
           updateUI(data);
         }
         
         if (data.updatedAt) lastTimestamp = data.updatedAt;
       }
     } catch (e) {
       console.warn('Poll error:', e.name === 'AbortError' ? 'Timeout' : e.message);
       failCount++;
       if (failCount >= 3) {
         setStatus('disconnected');
         showConnectionLost();
       }
     } finally {
       isPolling = false;
       const nextDelay = failCount > 0 ? Math.min(3000, POLL_INTERVAL + (failCount * 500)) : POLL_INTERVAL;
       pollTimer = setTimeout(poll, nextDelay);
     }
   }

   function updateUI(data) {
     if (!data) return;
     if (data.teamALabel) document.getElementById('label-a').textContent = data.teamALabel;
     if (data.teamBLabel) document.getElementById('label-b').textContent = data.teamBLabel;

     if (data.courtNumber) {
       document.getElementById('court-info').textContent = 'สนาม ' + data.courtNumber;
     }

     const scoreAEl = document.getElementById('score-a');
     const scoreBEl = document.getElementById('score-b');

     if (data.scoreA !== undefined && data.scoreA !== prevScoreA) {
       if (prevScoreA !== -1) {
         scoreAEl.classList.remove('score-flash');
         void scoreAEl.offsetWidth;
         scoreAEl.classList.add('score-flash');
       }
       scoreAEl.textContent = data.scoreA;
       prevScoreA = data.scoreA;
     }

     if (data.scoreB !== undefined && data.scoreB !== prevScoreB) {
       if (prevScoreB !== -1) {
         scoreBEl.classList.remove('score-flash');
         void scoreBEl.offsetWidth;
         scoreBEl.classList.add('score-flash');
       }
       scoreBEl.textContent = data.scoreB;
       prevScoreB = data.scoreB;
     }

     document.getElementById('gp-a').classList.toggle('show', !!data.isGamePointA);
     document.getElementById('gp-b').classList.toggle('show', !!data.isGamePointB);
     document.getElementById('serving-a').classList.toggle('show', data.servingTeam === 'A');
     document.getElementById('serving-b').classList.toggle('show', data.servingTeam === 'B');

     updateBackgrounds(data);
   }

   function updateBackgrounds(data) {
     const isLandscape = window.innerWidth > window.innerHeight;
     const servingTeam = data.servingTeam;
     const serviceSide = data.serviceSide; // 'LEFT' or 'RIGHT'

     // Elements for Team A
     const a1 = document.getElementById('side-a-1'); // side-1: Top (Land) / Left (Port)
     const a2 = document.getElementById('side-a-2'); // side-2: Bottom (Land) / Right (Port)
     // Elements for Team B
     const b1 = document.getElementById('side-b-1'); // side-1: Top (Land) / Left (Port)
     const b2 = document.getElementById('side-b-2'); // side-2: Bottom (Land) / Right (Port)

     // Reset everything to dimmed grey
     [a1, a2, b1, b2].forEach(el => {
       el.className = 'side';
       if (el.id.includes('-1')) el.classList.add('side-1');
       if (el.id.includes('-2')) el.classList.add('side-2');
       el.classList.add('bg-dim');
     });

     if (servingTeam === 'A') {
       if (isLandscape) {
         // Team A Landscape: Left = Top (1), Right = Bottom (2)
         if (serviceSide === 'LEFT') a1.classList.replace('bg-dim', 'bg-active');
         else a2.classList.replace('bg-dim', 'bg-active');
       } else {
         // Team A Portrait: Left = Right (2), Right = Left (1)
         if (serviceSide === 'LEFT') a2.classList.replace('bg-dim', 'bg-active');
         else a1.classList.replace('bg-dim', 'bg-active');
       }
     } else if (servingTeam === 'B') {
       if (isLandscape) {
         // Team B Landscape: Left = Bottom (2), Right = Top (1)
         if (serviceSide === 'LEFT') b2.classList.replace('bg-dim', 'bg-active');
         else b1.classList.replace('bg-dim', 'bg-active');
       } else {
         // Team B Portrait: Left = Left (1), Right = Right (2)
         if (serviceSide === 'LEFT') b1.classList.replace('bg-dim', 'bg-active');
         else b2.classList.replace('bg-dim', 'bg-active');
       }
     }
   }

   function setStatus(state) {
     const dot = document.getElementById('status-dot');
     const text = document.getElementById('status-text');
     if (!dot || !text) return;
     dot.className = '';
     if (state === 'connected') { dot.classList.add('connected'); text.textContent = 'เชื่อมต่อแล้ว'; }
     else if (state === 'disconnected') { dot.classList.add('disconnected'); text.textContent = 'ขาดการเชื่อมต่อ'; }
     else { text.textContent = 'กำลังโหลด...'; }
   }

   function showConnectionLost() { document.getElementById('connection-lost').classList.add('show'); }
   function hideConnectionLost() { document.getElementById('connection-lost').classList.remove('show'); }

   if (INITIAL_DATA) { updateUI(INITIAL_DATA); setStatus('connected'); }
   poll();

   window.addEventListener('resize', () => {
     // ใช้ข้อมูลล่าสุดที่แคชไว้เพื่อวาดพื้นหลังใหม่ทันทีเมื่อหมุนจอ โดยไม่ต้องต่อเน็ต
     if (lastData) updateUI(lastData);
   });

   if ('wakeLock' in navigator) { navigator.wakeLock.request('screen').catch(()=>{}); }
 </script>
 </body>
 </html>`;


export default getScoreboardPageHTML;
