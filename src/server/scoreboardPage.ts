/**
 * Embedded HTML Scoreboard Page
 *
 * ออกแบบตาม ShuttleShuffle Design System (Neo-Brutalist)
 * ใช้ short-polling (fetch every 800ms) แทน SSE
 * เพราะ expo-http-server ไม่รองรับ streaming responses
 */

export const getScoreboardPageHTML = (matchId: string): string => `<!DOCTYPE html>
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
      z-index: 10;
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
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

    /* Score Body */
    #score-body {
      display: flex;
      flex: 1;
      flex-direction: column;
      padding: 8px;
      gap: 8px;
      overflow: hidden;
    }
    @media (orientation: landscape) { #score-body { flex-direction: row; } }

    /* Panel */
    .panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-around;
      border: var(--border-thick);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-solid);
      padding: 12px;
      position: relative;
      overflow: hidden;
      -webkit-user-select: none;
      user-select: none;
    }
    .panel-a { background: var(--error-container); }
    .panel-b { background: var(--secondary-container); }

    .panel-header { display: flex; flex-direction: column; align-items: center; width: 100%; gap: 4px; }
    .team-label {
      font-family: var(--font-display);
      font-size: clamp(13px, 3vw, 20px);
      font-weight: 800;
      text-align: center;
      max-width: 90%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .team-badge {
      font-family: var(--font-label);
      font-size: 10px; font-weight: 700;
      letter-spacing: 0.8px; text-transform: uppercase;
      padding: 2px 8px; border-radius: 99px;
      border: 1.5px solid var(--on-background);
      box-shadow: 2px 2px 0 var(--on-background);
      color: #fff;
    }
    .panel-a .team-badge { background: var(--error); }
    .panel-b .team-badge { background: var(--secondary); }

    .game-point-banner {
      display: none;
      font-family: var(--font-label);
      font-size: 11px; font-weight: 700;
      letter-spacing: 0.5px; text-transform: uppercase;
      padding: 3px 12px; border-radius: var(--radius-md);
      border: 1.5px solid var(--on-background);
      box-shadow: 2px 2px 0 var(--on-background);
      background: var(--primary-container);
      color: var(--on-background);
      transform: rotate(-4deg);
    }
    .game-point-banner.show { display: block; }

    .score-number {
      font-family: var(--font-display);
      font-size: clamp(80px, 25vw, 180px);
      font-weight: 800;
      line-height: 1;
      text-align: center;
      font-variant-numeric: tabular-nums;
      color: var(--on-background);
    }
    @media (orientation: landscape) { .score-number { font-size: clamp(60px, 18vw, 160px); } }

    .serving-badge {
      display: none;
      font-family: var(--font-label);
      font-size: 11px; font-weight: 700;
      letter-spacing: 0.5px; text-transform: uppercase;
      padding: 4px 12px; border-radius: 99px;
      border: 1.5px solid var(--on-background);
      background: var(--primary-container);
      color: var(--on-background);
    }
    .serving-badge.show { display: block; }

    /* Touch Overlay */
    .touch-overlay {
      position: absolute; inset: 0;
      display: flex;
      border-radius: var(--radius-lg);
      overflow: hidden;
    }
    .touch-half {
      flex: 1; height: 100%;
      background: transparent; border: none;
      cursor: pointer; outline: none;
      -webkit-tap-highlight-color: transparent;
    }
    .touch-half:active { background: rgba(0,0,0,0.06); }

    /* Connection Lost */
    #connection-lost {
      display: none;
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.85);
      z-index: 999;
      flex-direction: column;
      align-items: center; justify-content: center;
      gap: 16px; padding: 24px;
    }
    #connection-lost.show { display: flex; }
    #connection-lost h2 {
      font-family: var(--font-display);
      font-size: 24px; font-weight: 800;
      color: #fff; text-align: center;
    }
    #connection-lost p { font-size: 16px; color: #ccc; text-align: center; }
    .reconnect-btn {
      font-family: var(--font-label);
      font-size: 14px; font-weight: 700;
      letter-spacing: 0.5px; text-transform: uppercase;
      padding: 14px 28px;
      background: var(--primary-container);
      color: var(--on-background);
      border: var(--border-thick);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-solid);
      cursor: pointer;
      transition: transform 0.08s, box-shadow 0.08s;
    }
    .reconnect-btn:active { transform: translate(4px,4px); box-shadow: none; }

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

    @keyframes scoreFlash {
      0%   { transform: scale(1); }
      30%  { transform: scale(1.08); }
      100% { transform: scale(1); }
    }
    .score-flash { animation: scoreFlash 0.25s ease-out; }
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
    <!-- Team A -->
    <div class="panel panel-a" id="panel-a">
      <div class="panel-header">
        <div class="team-label" id="label-a">ทีม A</div>
        <span class="team-badge">RED</span>
      </div>
      <div class="game-point-banner" id="gp-a">GAME POINT</div>
      <div class="score-number" id="score-a">0</div>
      <div class="serving-badge" id="serving-a">🏸 SERVING</div>
      <div class="touch-overlay">
        <button class="touch-half" onclick="sendScore('A', -1)" aria-label="ลดคะแนนทีม A"></button>
        <button class="touch-half" onclick="sendScore('A', 1)" aria-label="เพิ่มคะแนนทีม A"></button>
      </div>
    </div>

    <!-- Team B -->
    <div class="panel panel-b" id="panel-b">
      <div class="panel-header">
        <div class="team-label" id="label-b">ทีม B</div>
        <span class="team-badge">BLUE</span>
      </div>
      <div class="game-point-banner" id="gp-b">GAME POINT</div>
      <div class="score-number" id="score-b">0</div>
      <div class="serving-badge" id="serving-b">🏸 SERVING</div>
      <div class="touch-overlay">
        <button class="touch-half" onclick="sendScore('B', -1)" aria-label="ลดคะแนนทีม B"></button>
        <button class="touch-half" onclick="sendScore('B', 1)" aria-label="เพิ่มคะแนนทีม B"></button>
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
  const MATCH_ID = '${matchId}';
  const POLL_INTERVAL = 800; // ms
  let lastTimestamp = 0;
  let failCount = 0;
  let pollTimer = null;
  let prevScoreA = -1;
  let prevScoreB = -1;

  async function poll() {
    try {
      const res = await fetch('/api/poll?matchId=' + MATCH_ID + '&since=' + lastTimestamp, {
        signal: AbortSignal.timeout ? AbortSignal.timeout(2000) : undefined
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);

      const data = await res.json();
      failCount = 0;
      setStatus('connected');
      hideConnectionLost();

      if (data.hasUpdate !== false) {
        updateUI(data);
        if (data.updatedAt) lastTimestamp = data.updatedAt;
      }
    } catch (e) {
      failCount++;
      if (failCount >= 3) {
        setStatus('disconnected');
        showConnectionLost();
      }
    }
    pollTimer = setTimeout(poll, POLL_INTERVAL);
  }

  function updateUI(data) {
    document.getElementById('label-a').textContent = data.teamALabel || 'ทีม A';
    document.getElementById('label-b').textContent = data.teamBLabel || 'ทีม B';
    if (data.courtNumber) {
      document.getElementById('court-info').textContent = 'สนาม ' + data.courtNumber;
    }

    const scoreAEl = document.getElementById('score-a');
    const scoreBEl = document.getElementById('score-b');

    if (data.scoreA !== prevScoreA) {
      scoreAEl.classList.remove('score-flash');
      void scoreAEl.offsetWidth;
      scoreAEl.classList.add('score-flash');
      prevScoreA = data.scoreA;
    }
    scoreAEl.textContent = data.scoreA ?? 0;

    if (data.scoreB !== prevScoreB) {
      scoreBEl.classList.remove('score-flash');
      void scoreBEl.offsetWidth;
      scoreBEl.classList.add('score-flash');
      prevScoreB = data.scoreB;
    }
    scoreBEl.textContent = data.scoreB ?? 0;

    document.getElementById('gp-a').classList.toggle('show', !!data.isGamePointA);
    document.getElementById('gp-b').classList.toggle('show', !!data.isGamePointB);
    document.getElementById('serving-a').classList.toggle('show', data.servingTeam === 'A');
    document.getElementById('serving-b').classList.toggle('show', data.servingTeam === 'B');
  }

  async function sendScore(team, delta) {
    try {
      await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId: MATCH_ID, team, delta })
      });
    } catch (e) {}
  }

  function setStatus(state) {
    const dot = document.getElementById('status-dot');
    const text = document.getElementById('status-text');
    dot.className = '';
    if (state === 'connected') {
      dot.classList.add('connected');
      text.textContent = 'เชื่อมต่อแล้ว';
    } else if (state === 'disconnected') {
      dot.classList.add('disconnected');
      text.textContent = 'ขาดการเชื่อมต่อ';
    } else {
      text.textContent = 'กำลังโหลด...';
    }
  }

  function showConnectionLost() { document.getElementById('connection-lost').classList.add('show'); }
  function hideConnectionLost() { document.getElementById('connection-lost').classList.remove('show'); }

  // เริ่ม polling
  poll();

  // Screen Wake Lock
  if ('wakeLock' in navigator) {
    navigator.wakeLock.request('screen').catch(() => {});
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        navigator.wakeLock.request('screen').catch(() => {});
      }
    });
  }
</script>
</body>
</html>`;

export default getScoreboardPageHTML;
