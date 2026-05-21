import { Player } from '../store/usePlayerStore';

export interface MatchCandidate {
  team_a: [string, string | null];
  team_b: [string, string | null];
}

export type MatchMode = 'singles' | 'doubles';

/**
 * กฎแห่งความเท่าเทียมขั้นสูงสุด (Strict Fair Rotation):
 * 1. Priority 1 (Games Played): เลือกคนที่เล่นน้อยที่สุด
 * 2. Priority 2 (Consecutive Rest): หากจำนวนเกมเท่ากัน ให้คนที่เพิ่งพักมาได้สิทธิ์ก่อนคนทื่เพิ่งเล่นเสร็จ
 * 3. Priority 3 (Partner Variation): สำหรับประเภทคู่ หาคนที่เคยคู่กันน้อยที่สุด
 */
export const generateMatch = (
  players: Player[], 
  pastMatches: { team_a_p1: string; team_a_p2?: string; team_b_p1: string; team_b_p2?: string; }[] = [],
  mode: MatchMode = 'doubles'
): MatchCandidate | null => {
  const playersNeeded = mode === 'doubles' ? 4 : 2;
  if (players.length < playersNeeded) return null;

  // หาผู้เล่นในแมตช์ล่าสุด (ถ้ามี) เพื่อเอามาทำ Rest Logic
  const lastMatch = pastMatches.length > 0 ? pastMatches[pastMatches.length - 1] : null;
  const lastPlayedIds = lastMatch ? [
    lastMatch.team_a_p1, lastMatch.team_a_p2, 
    lastMatch.team_b_p1, lastMatch.team_b_p2
  ].filter(Boolean) as string[] : [];

  // 1. จัดลำดับผู้เล่น (Priority Sorting)
  const sortedPlayers = [...players].sort((a, b) => {
    // กฎข้อที่ 1: ใครเล่นเกมน้อยกว่าต้องได้ลงก่อน
    if (a.games_played !== b.games_played) {
      return a.games_played - b.games_played;
    }
    
    // กฎข้อที่ 2: ถ้าจำนวนเกมเท่ากัน คนที่ไม่ได้เล่นในแมตช์ล่าสุด (พักอยู่) ต้องได้ลงก่อน
    const aWasLast = lastPlayedIds.includes(a.id);
    const bWasLast = lastPlayedIds.includes(b.id);
    if (aWasLast !== bWasLast) {
      return aWasLast ? 1 : -1; // คนที่เพิ่งเล่นไป (true) จะถูกดันไปข้างหลัง (1)
    }

    // กฎข้อที่ 3: ถ้าทุกอย่างเท่ากัน ให้สุ่ม
    return Math.random() - 0.5;
  });

  const selected = sortedPlayers.slice(0, playersNeeded);

  if (mode === 'singles') {
    return {
      team_a: [selected[0].id, null],
      team_b: [selected[1].id, null],
    };
  }

  // ประเภทคู่ (Doubles) - วิเคราะห์การจับคู่ที่ดีที่สุด
  const p = selected;
  const combinations = [
    { team_a: [p[0], p[1]], team_b: [p[2], p[3]] },
    { team_a: [p[0], p[2]], team_b: [p[1], p[3]] },
    { team_a: [p[0], p[3]], team_b: [p[1], p[2]] },
  ];

  const getPartnerCount = (p1: string, p2: string) => {
    return pastMatches.filter(m => 
      (m.team_a_p1 === p1 && m.team_a_p2 === p2) ||
      (m.team_a_p1 === p2 && m.team_a_p2 === p1) ||
      (m.team_b_p1 === p1 && m.team_b_p2 === p2) ||
      (m.team_b_p1 === p2 && m.team_b_p2 === p1)
    ).length;
  };

  const scoredCombos = combinations.map(combo => {
    const pScore = getPartnerCount(combo.team_a[0].id, combo.team_a[1]!.id) +
                   getPartnerCount(combo.team_b[0].id, combo.team_b[1]!.id);
    return { ...combo, pScore };
  });

  scoredCombos.sort((a, b) => a.pScore - b.pScore);
  const best = scoredCombos[0];

  return {
    team_a: [best.team_a[0].id, best.team_a[1]!.id],
    team_b: [best.team_b[0].id, best.team_b[1]!.id],
  };
};

export const generateSessionSchedule = (
  players: Player[],
  rounds: number = 3,
  mode: MatchMode = 'doubles',
  existingPastMatches: { team_a_p1: string; team_a_p2?: string; team_b_p1: string; team_b_p2?: string; }[] = []
): MatchCandidate[] => {
  const schedule: MatchCandidate[] = [];
  const tempPlayers = players.map(p => ({ ...p }));
  const tempMatches = [...existingPastMatches];

  const playersPerMatch = mode === 'doubles' ? 4 : 2;
  const matchCount = Math.ceil((players.length * rounds) / playersPerMatch);

  for (let i = 0; i < matchCount; i++) {
    const match = generateMatch(tempPlayers as Player[], tempMatches, mode);
    if (match) {
      schedule.push(match);
      tempMatches.push({
        team_a_p1: match.team_a[0],
        team_a_p2: match.team_a[1] || undefined,
        team_b_p1: match.team_b[0],
        team_b_p2: match.team_b[1] || undefined,
      });

      const ids = [...match.team_a, ...match.team_b].filter(Boolean) as string[];
      ids.forEach(id => {
        const player = tempPlayers.find(p => p.id === id);
        if (player) player.games_played++;
      });
    }
  }

  return schedule;
};
