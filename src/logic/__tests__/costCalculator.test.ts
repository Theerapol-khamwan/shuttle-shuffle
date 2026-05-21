import { calculateSplits } from '../costCalculator';
import { Player, Session } from '../../store/usePlayerStore';

describe('Cost Calculator Logic', () => {
  const mockSession: Session = {
    id: 'session-1',
    date: new Date().toISOString(),
    total_courts: 1,
    status: 'active',
    winning_score: 21,
    enable_deuce: true,
    court_hourly_rate: 150,
    hours_played: 2,
    shuttle_unit_price: 30,
    shuttles_used: 4,
    cost_split_method: 'equal'
  };

  const mockPlayers: Player[] = [
    { id: 'p1', session_id: 'session-1', name: 'Player 1', games_played: 4, exclude_from_split: false, is_paid: false },
    { id: 'p2', session_id: 'session-1', name: 'Player 2', games_played: 2, exclude_from_split: false, is_paid: false },
    { id: 'p3', session_id: 'session-1', name: 'Player 3', games_played: 3, exclude_from_split: false, is_paid: false }
  ];

  describe('calculateSplits', () => {
    it('ควรคำนวณราคารวมและหารเท่ากันทุกคนในแบบ Equal Split', () => {
      // ค่าสนาม = 150 * 2 = 300
      // ค่าลูก = 30 * 4 = 120
      // รวม = 420
      // มีคนเล่น 3 คน => คนละ 140
      const session = { ...mockSession, cost_split_method: 'equal' as const };
      const splits = calculateSplits(mockPlayers, session);

      expect(splits['p1']).toBe(140);
      expect(splits['p2']).toBe(140);
      expect(splits['p3']).toBe(140);
    });

    it('ควรหารเงินตามสัดส่วนจำนวนเกมที่ลงเล่นในแบบ Pro-rata Split', () => {
      // รวม = 420
      // เกมทั้งหมด = 4 + 2 + 3 = 9 เกม
      // p1 (4 เกม) = 420 * (4 / 9) = 186.666... => ปัดเศษ = 186.67
      // p2 (2 เกม) = 420 * (2 / 9) = 93.333... => ปัดเศษ = 93.33
      // p3 (3 เกม) = 420 * (3 / 9) = 140.00 => 140
      // ผลรวมเศษ = 186.67 + 93.33 + 140 = 420.00 (พอดีเป๊ะ)
      const session = { ...mockSession, cost_split_method: 'pro_rata' as const };
      const splits = calculateSplits(mockPlayers, session);

      expect(splits['p1']).toBe(186.67);
      expect(splits['p2']).toBe(93.33);
      expect(splits['p3']).toBe(140.00);
    });

    it('ควรปรับเศษเงิน (Rounding adjustment) ให้ไม่เกินยอดรวม', () => {
      // ค่าสนาม = 100 * 1 = 100
      // ค่าลูก = 0
      // รวม = 100
      // มีคนเล่น 3 คน => คนละ 33.33 => รวม 99.99 (ขาดไป 0.01)
      // คนที่เล่นมากที่สุดคือ p1 (4 เกม) จะต้องโดนปัดขึ้นเป็น 33.34
      const session: Session = {
        ...mockSession,
        court_hourly_rate: 100,
        hours_played: 1,
        shuttle_unit_price: 0,
        shuttles_used: 0,
        cost_split_method: 'equal' as const
      };
      const splits = calculateSplits(mockPlayers, session);

      expect(splits['p1']).toBe(33.34);
      expect(splits['p2']).toBe(33.33);
      expect(splits['p3']).toBe(33.33);
    });

    it('ควรคำนวณให้ถูกต้องหากมีการติ๊กเอาผู้เล่นออก (Exclude from split)', () => {
      // รวม = 420
      // p3 ถูกติ๊กออกจากการหารค่าใช้จ่าย
      // เหลือ p1 และ p2 หารเท่ากันในแบบ Equal => คนละ 210
      const players = [
        { ...mockPlayers[0] },
        { ...mockPlayers[1] },
        { ...mockPlayers[2], exclude_from_split: true }
      ];
      const session = { ...mockSession, cost_split_method: 'equal' as const };
      const splits = calculateSplits(players, session);

      expect(splits['p1']).toBe(210);
      expect(splits['p2']).toBe(210);
      expect(splits['p3']).toBe(0);
    });

    it('ควรย้ายยอดไปหาคนอื่นหากเล่นแบบ Pro-rata และมีผู้เล่นที่ถูกคัดออก', () => {
      // รวม = 420
      // p3 ถูกติ๊กออกจากการหาร
      // เหลือ p1 (4 เกม) และ p2 (2 เกม) => รวม 6 เกม
      // p1 = 420 * (4 / 6) = 280
      // p2 = 420 * (2 / 6) = 140
      const players = [
        { ...mockPlayers[0] },
        { ...mockPlayers[1] },
        { ...mockPlayers[2], exclude_from_split: true }
      ];
      const session = { ...mockSession, cost_split_method: 'pro_rata' as const };
      const splits = calculateSplits(players, session);

      expect(splits['p1']).toBe(280);
      expect(splits['p2']).toBe(140);
      expect(splits['p3']).toBe(0);
    });

    it('ควรป้องกัน Division by Zero หากไม่มีใครถูกเลือกให้หารหรือไม่มีใครเล่นเกม', () => {
      // ทุกคนถูกคัดออก
      const players = mockPlayers.map(p => ({ ...p, exclude_from_split: true }));
      const splits = calculateSplits(players, mockSession);

      expect(splits['p1']).toBe(0);
      expect(splits['p2']).toBe(0);
      expect(splits['p3']).toBe(0);
    });

    it('ควรคำนวณเป็น 0 หากราคารวมเป็น 0 หรือชั่วโมงเล่นเป็น 0', () => {
      const session = { ...mockSession, hours_played: 0, shuttles_used: 0 };
      const splits = calculateSplits(mockPlayers, session);

      expect(splits['p1']).toBe(0);
      expect(splits['p2']).toBe(0);
      expect(splits['p3']).toBe(0);
    });

    it('ควรคำนวณราคารวมเพิ่มขึ้นตามจำนวนสนามที่กรอก', () => {
      // ค่าสนาม = 150 * 2 (ชั่วโมง) * 3 (สนาม) = 900
      // ค่าลูก = 30 * 4 = 120
      // รวม = 1020
      // มีคนเล่น 3 คน => คนละ 340
      const session = { ...mockSession, total_courts: 3, cost_split_method: 'equal' as const };
      const splits = calculateSplits(mockPlayers, session);

      expect(splits['p1']).toBe(340);
      expect(splits['p2']).toBe(340);
      expect(splits['p3']).toBe(340);
    });
  });
});
