import { generateMatch } from '../matchmaking';
import { Player } from '../../store/usePlayerStore';

describe('Matchmaking Logic', () => {
  const mockPlayers: Player[] = [
    { id: 'p1', name: 'A', games_played: 2, session_id: 's1', exclude_from_split: false, is_paid: false },
    { id: 'p2', name: 'B', games_played: 0, session_id: 's1', exclude_from_split: false, is_paid: false },
    { id: 'p3', name: 'C', games_played: 1, session_id: 's1', exclude_from_split: false, is_paid: false },
    { id: 'p4', name: 'D', games_played: 0, session_id: 's1', exclude_from_split: false, is_paid: false },
    { id: 'p5', name: 'E', games_played: 0, session_id: 's1', exclude_from_split: false, is_paid: false },
    { id: 'p6', name: 'F', games_played: 1, session_id: 's1', exclude_from_split: false, is_paid: false },
  ];

  describe('Rule of Fairness (Least Games)', () => {
    it('ควรเลือกผู้เล่นที่มีจำนวนเกมน้อยที่สุด (0 เกม) มาลงสนามก่อน', () => {
      const match = generateMatch(mockPlayers, [], 'doubles');
      const selectedIds = [...match!.team_a, ...match!.team_b];
      
      // p2, p4, p5 มี 0 เกม ต้องถูกเลือกแน่นอน
      expect(selectedIds).toContain('p2');
      expect(selectedIds).toContain('p4');
      expect(selectedIds).toContain('p5');
      // คนที่ 4 ควรเป็นคนที่มี 1 เกม (p3 หรือ p6)
      expect(selectedIds.some(id => id === 'p3' || id === 'p6')).toBe(true);
    });
  });

  describe('Consecutive Rest Logic', () => {
    it('ไม่ควรเลือกคนที่เพิ่งเล่นจบในแมตช์ล่าสุด หากมีคนอื่นที่มีจำนวนเกมเท่ากันรออยู่', () => {
      // สมมติ p2, p4, p5, p3 เพิ่งเล่นแมตช์ล่าสุด (ทุกคนมี 1 เกมเท่ากันยกเว้น p1 มี 2 เกม)
      const players: Player[] = [
        { id: 'p1', name: 'A', games_played: 2, session_id: 's1', exclude_from_split: false, is_paid: false },
        { id: 'p2', name: 'B', games_played: 1, session_id: 's1', exclude_from_split: false, is_paid: false },
        { id: 'p3', name: 'C', games_played: 1, session_id: 's1', exclude_from_split: false, is_paid: false },
        { id: 'p4', name: 'D', games_played: 1, session_id: 's1', exclude_from_split: false, is_paid: false },
        { id: 'p5', name: 'E', games_played: 1, session_id: 's1', exclude_from_split: false, is_paid: false },
        { id: 'p6', name: 'F', games_played: 1, session_id: 's1', exclude_from_split: false, is_paid: false },
      ];


      const pastMatches = [
        { team_a_p1: 'p2', team_a_p2: 'p4', team_b_p1: 'p5', team_b_p2: 'p3' }
      ];

      const match = generateMatch(players, pastMatches, 'doubles');
      const selectedIds = [...match!.team_a, ...match!.team_b];

      // p6 ยังไม่ได้เล่น (1 เกม) และ p1 (2 เกม) 
      // แต่ในบรรดาคนที่มี 1 เกม: p6 คือคนเดียวที่พักอยู่
      // ดังนั้น p6 ต้องถูกเลือกแน่นอน
      expect(selectedIds).toContain('p6');
    });
  });

  describe('Match Modes', () => {
    it('ควรสุ่มผู้เล่น 2 คนสำหรับโหมด Singles', () => {
      const match = generateMatch(mockPlayers, [], 'singles');
      expect(match!.team_a[0]).toBeDefined();
      expect(match!.team_a[1]).toBeNull();
      expect(match!.team_b[0]).toBeDefined();
      expect(match!.team_b[1]).toBeNull();
    });

    it('ควรสุ่มผู้เล่น 4 คนสำหรับโหมด Doubles', () => {
      const match = generateMatch(mockPlayers, [], 'doubles');
      expect(match!.team_a[1]).not.toBeNull();
      expect(match!.team_b[1]).not.toBeNull();
    });
  });
});
