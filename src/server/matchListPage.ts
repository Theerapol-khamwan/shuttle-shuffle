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
        <div class="empty-icon">🏸</div>
        <h2>ยังไม่มีแมตช์ที่กำลังเล่น</h2>
        <p>รอให้แอดมินเพิ่มแมตช์ก่อนครับ</p>
      </div>`
    : matches.map(m => `
      <a href="/scoreboard/${m.id}" class="match-card">
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
      padding-bottom: 40px;
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
      margin-bottom: 12px;
      box-shadow: 4px 4px 0 var(--on-background);
      transition: transform 0.08s, box-shadow 0.08s;
    }
    .match-card:active {
      transform: translate(4px, 4px);
      box-shadow: 0 0 0 var(--on-background);
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
      font-size: 13px;
      font-weight: 700;
      max-width: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .team-score {
      font-family: var(--font-display);
      font-size: 40px;
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
    }
    .empty-state {
      text-align: center;
      padding: 60px 20px;
    }
    .empty-icon { font-size: 48px; margin-bottom: 16px; }
    .empty-state h2 {
      font-family: var(--font-display);
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .empty-state p {
      font-size: 14px;
      color: #666;
    }
    .refresh-btn {
      margin-top: 24px;
      display: inline-block;
      font-family: var(--font-label);
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 12px 24px;
      background: var(--primary-container);
      color: var(--on-background);
      border: 3px solid var(--on-background);
      border-radius: 8px;
      box-shadow: 4px 4px 0 var(--on-background);
      cursor: pointer;
      transition: transform 0.08s, box-shadow 0.08s;
    }
    .refresh-btn:active {
      transform: translate(4px, 4px);
      box-shadow: 0 0 0 var(--on-background);
    }
  </style>
</head>
<body>
  <header>
    <h1>🏸 ShuttleShuffle</h1>
    <p>เลือกแมตช์ที่ต้องการดูจอคะแนน</p>
  </header>
  <main>
    <div class="section-title">แมตช์ที่กำลังเล่นอยู่ (${matches.length})</div>
    ${matchCardsHTML}
    <div style="text-align:center; margin-top: 12px;">
      <button class="refresh-btn" onclick="location.reload()">🔄 รีเฟรช</button>
    </div>
  </main>
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
