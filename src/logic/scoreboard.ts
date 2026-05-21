/**
 * ลอจิกสำหรับคำนวณผลการแข่งขัน
 */

export interface GameRules {
  winningScore: number;
  deuceEnabled: boolean;
}

/**
 * ตรวจสอบผู้ชนะอิงตามกฎ Deuce และเพดานคะแนน
 */
export const checkWinner = (scoreA: number, scoreB: number, rules: GameRules): 'A' | 'B' | null => {
  const { winningScore, deuceEnabled } = rules;
  
  if (deuceEnabled) {
    const cap = winningScore + 9; // กติกาสากลแบดมินตัน (เช่น 21 จบที่ 30)
    
    if (scoreA >= winningScore && scoreA - scoreB >= 2) return 'A';
    if (scoreB >= winningScore && scoreB - scoreA >= 2) return 'B';
    
    // ชนเพดาน
    if (scoreA === cap) return 'A';
    if (scoreB === cap) return 'B';
  } else {
    if (scoreA >= winningScore) return 'A';
    if (scoreB >= winningScore) return 'B';
  }
  
  return null;
};

/**
 * คำนวณสถานะ Game Point
 */
export const isGamePoint = (currentScore: number, opponentScore: number, rules: GameRules): boolean => {
  const { winningScore, deuceEnabled } = rules;
  
  if (deuceEnabled) {
    // ในจังหวะดิวส์ Game point คือคนที่นำอยู่ 1 แต้มและถึงแต้มเป้าหมายแล้ว
    return currentScore >= winningScore - 1 && currentScore > opponentScore;
  } else {
    return currentScore === winningScore - 1;
  }
};

/**
 * คำนวณฝั่งเสิร์ฟ (ซ้าย/ขวา) อิงตามคะแนน
 */
export const getServiceSide = (score: number): 'LEFT' | 'RIGHT' => {
  return score % 2 === 0 ? 'RIGHT' : 'LEFT';
};
