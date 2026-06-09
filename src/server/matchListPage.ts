/**
 * Match List Landing Page
 *
 * หน้าแรกที่ผู้ใช้เห็นหลังสแกน QR Code
 * แสดงรายการแมตช์ที่กำลังเล่นอยู่ทั้งหมด
 */

export interface ActiveMatchInfo {
  id: string;
  courtNumber: number;
  teamALabel: string;
  teamBLabel: string;
  scoreA: number;
  scoreB: number;
}

export const getMatchListPageHTML = (matches: ActiveMatchInfo[]): string => {
  const matchCardsHTML = matches.length === 0
  ? `<div class="empty-state">
      <div class="waiting-anim">
        <div class="shuttle">🏸</div>
      </div>
      <h2>กำลังเตรียมสนาม...</h2>
      <p>รอสักครู่ ระบบจะพาคุณไปยังจอคะแนนอัตโนมัติ<br>เมื่อแอดมินเริ่มแมตช์ใหม่</p>
      <div class="loader-dots">
        <span></span><span></span><span></span>
      </div>
    </div>`
  : matches.map(m => `
    <a href="/scoreboard?id=${m.id}" class="match-card">
      <div class="court-badge">สนาม ${m.courtNumber}</div>
      <div class="match-teams">
        <div class="team-a">
          <span class="team-tag red">RED</span>
          <span class="team-name">${escapeHtml(m.teamALabel)}</span>
          <span class="team-score">${m.scoreA}</span>
        </div>
        <div class="vs">VS</div>
        <div class="team-b">
          <span class="team-tag blue">BLUE</span>
          <span class="team-name">${escapeHtml(m.teamBLabel)}</span>
          <span class="team-score">${m.scoreB}</span>
        </div>
      </div>
      <div class="watch-btn">ดูจอคะแนน →</div>
    </a>`).join('');

  return `<!DOCTYPE html>
  <html lang="th">
  <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ShuttleShuffle – จอคะแนน</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@800;700;600&family=Plus+Jakarta+Sans:wght@700;500&family=Space+Grotesk:wght@700;500&display=swap" rel="stylesheet">
  <style>
  :root {
    --primary:           #546500;
    --primary-container: #d6ff00;
    --secondary:         #2e6385;
    --secondary-container: #a5d8ff;
    --error:             #ba1a1a;
    --error-container:   #ffdad6;
    --background:        #fcf9f8;
    --on-background:     #1c1b1b;
    --surface-container: #f0edec;
    --font-display: 'Bricolage Grotesque', system-ui, sans-serif;
    --font-body:    'Plus Jakarta Sans', system-ui, sans-serif;
    --font-label:   'Space Grotesk', system-ui, sans-serif;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: var(--background);
    color: var(--on-background);
    font-family: var(--font-body);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
  header {
    background: var(--background);
    border-bottom: 3px solid var(--on-background);
    box-shadow: 0 4px 0 var(--on-background);
    padding: 16px 20px;
    position: sticky;
    top: 0;
    z-index: 10;
  }
  header h1 {
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 800;
    letter-spacing: 1px;
  }
  header p {
    font-family: var(--font-body);
    font-size: 13px;
    color: #666;
    margin-top: 2px;
  }
  main {
    padding: 20px 16px;
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
    flex: 1;
  }
  .section-title {
    font-family: var(--font-display);
    font-size: 16px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1.5px solid var(--on-background);
  }
  .match-card {
    display: block;
    text-decoration: none;
    color: var(--on-background);
    background: var(--surface-container);
    border: 3px solid var(--on-background);
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 16px;
    box-shadow: 6px 6px 0 var(--on-background);
    transition: transform 0.1s, box-shadow 0.1s;
  }
  .match-card:active {
    transform: translate(4px, 4px);
    box-shadow: 2px 2px 0 var(--on-background);
  }
  .court-badge {
    font-family: var(--font-label);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    background: var(--on-background);
    color: var(--background);
    display: inline-block;
    padding: 3px 10px;
    border-radius: 99px;
    margin-bottom: 12px;
  }
  .match-teams {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }
  .team-a, .team-b {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 6px;
    flex-direction: column;
  }
  .team-a { align-items: flex-start; }
  .team-b { align-items: flex-end; }
  .team-tag {
    font-family: var(--font-label);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.6px;
    text-transform: uppercase;
    padding: 2px 8px;
    border-radius: 99px;
    border: 1.5px solid var(--on-background);
    color: #fff;
  }
  .team-tag.red  { background: var(--error); }
  .team-tag.blue { background: var(--secondary); }
  .team-name {
    font-family: var(--font-body);
    font-size: 15px;
    font-weight: 700;
    max-width: 140px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .team-score {
    font-family: var(--font-display);
    font-size: 48px;
    font-weight: 800;
    line-height: 1;
  }
  .vs {
    font-family: var(--font-label);
    font-size: 14px;
    font-weight: 700;
    color: #888;
    flex-shrink: 0;
  }
  .watch-btn {
    font-family: var(--font-label);
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    text-align: right;
    color: var(--primary);
    margin-top: 4px;
  }

  /* Empty State / Waiting UI */
  .empty-state {
    text-align: center;
    padding: 60px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
  }
  .waiting-anim {
    width: 100px;
    height: 100px;
    background: var(--primary-container);
    border: 3px solid var(--on-background);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
    box-shadow: 6px 6px 0 var(--on-background);
    animation: bounce 2s infinite ease-in-out;
  }
  .shuttle { font-size: 48px; }
  @keyframes bounce {
    0%, 100% { transform: translateY(0) rotate(0); }
    50% { transform: translateY(-20px) rotate(15deg); }
  }

  .empty-state h2 {
    font-family: var(--font-display);
    font-size: 24px;
    font-weight: 800;
    margin-bottom: 12px;
    text-transform: uppercase;
  }
  .empty-state p {
    font-size: 15px;
    color: #555;
    line-height: 1.5;
    margin-bottom: 24px;
  }

  .loader-dots { display: flex; gap: 8px; }
  .loader-dots span {
    width: 12px; height: 12px;
    background: var(--on-background);
    border-radius: 50%;
    animation: dotPulse 1.5s infinite ease-in-out;
  }
  .loader-dots span:nth-child(2) { animation-delay: 0.2s; }
  .loader-dots span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes dotPulse {
    0%, 100% { transform: scale(0.6); opacity: 0.3; }
    50% { transform: scale(1); opacity: 1; }
  }

  .refresh-btn {
    margin-top: 24px;
    display: inline-block;
    font-family: var(--font-label);
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 14px 28px;
    background: var(--primary-container);
    color: var(--on-background);
    border: 3px solid var(--on-background);
    border-radius: 12px;
    box-shadow: 4px 4px 0 var(--on-background);
    cursor: pointer;
    transition: transform 0.1s, box-shadow 0.1s;
  }
  .refresh-btn:active {
    transform: translate(2px, 2px);
    box-shadow: 2px 2px 0 var(--on-background);
  }
  </style>
  </head>
  <body>
  <header>
  <h1>🏸 ShuttleShuffle</h1>
  <p>ระบบจัดการก๊วนแบดมินตัน</p>
  </header>
  <main>
  ${matches.length > 0 ? '<div class="section-title">แมตช์ที่กำลังเล่นอยู่ (' + matches.length + ')</div>' : ''}
  ${matchCardsHTML}
  ${matches.length > 0 ? '<div style="text-align:center; margin-top: 12px;"><button class="refresh-btn" onclick="location.reload()">🔄 รีเฟรช</button></div>' : ''}
  </main>

  <script>
  // Polling เพื่อตรวจสอบว่ามีแมตช์ใหม่เริ่มหรือยัง
  async function checkMatches() {
    try {
      const res = await fetch('/api/matches');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const matches = await res.json();

      // ถ้าไม่มีแมตช์ในหน้าปัจจุบัน แต่ API บอกว่ามี -> รีโหลด
      const currentCount = ${matches.length};
      if (matches && matches.length > 0) {
        if (currentCount === 0) {
          // ถ้าเดิมไม่มีเลย ให้ไปแมตช์แรกทันที
          window.location.href = '/scoreboard?id=' + matches[0].id;
          return;
        } else if (matches.length !== currentCount) {
           // ถ้าจำนวนเปลี่ยน ให้รีโหลดหน้า List
           location.reload();
           return;
        }
      } else if (currentCount > 0) {
        // ถ้าเดิมมี แต่ตอนนี้ไม่มี -> รีโหลด
        location.reload();
        return;
      }
    } catch (e) {
      console.warn('Check matches error:', e);
    }
    setTimeout(checkMatches, 2000);
  }

  checkMatches();
  </script>
  </body>
  </html>`;
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default getMatchListPageHTML;
