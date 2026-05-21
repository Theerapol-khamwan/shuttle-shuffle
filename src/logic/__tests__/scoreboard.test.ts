import { checkWinner, isGamePoint, getServiceSide, GameRules } from '../scoreboard';

describe('Scoreboard Logic', () => {
  const rules21: GameRules = { winningScore: 21, deuceEnabled: true };
  const rules15NoDeuce: GameRules = { winningScore: 15, deuceEnabled: false };

  describe('checkWinner', () => {
    it('ควรตัดสินผู้ชนะเมื่อคะแนนถึงเป้าหมาย (No Deuce)', () => {
      expect(checkWinner(15, 10, rules15NoDeuce)).toBe('A');
      expect(checkWinner(5, 15, rules15NoDeuce)).toBe('B');
      expect(checkWinner(14, 14, rules15NoDeuce)).toBeNull();
    });

    it('ควรใช้กฎ Deuce เมื่อเปิดใช้งาน (ชนะห่าง 2 แต้ม)', () => {
      expect(checkWinner(21, 20, rules21)).toBeNull();
      expect(checkWinner(22, 20, rules21)).toBe('A');
      expect(checkWinner(29, 30, rules21)).toBe('B');
    });

    it('ควรชนเพดานที่ Normal + 9 แต้ม (เช่น 30 แต้ม)', () => {
      expect(checkWinner(30, 29, rules21)).toBe('A');
    });
  });

  describe('isGamePoint', () => {
    it('ควรแจ้งสถานะ Game Point เมื่อเหลืออีก 1 แต้มจะชนะ (No Deuce)', () => {
      expect(isGamePoint(14, 10, rules15NoDeuce)).toBe(true);
      expect(isGamePoint(13, 10, rules15NoDeuce)).toBe(false);
    });

    it('ควรแจ้งสถานะ Game Point ในช่วง Deuce', () => {
      expect(isGamePoint(20, 20, rules21)).toBe(false);
      expect(isGamePoint(21, 20, rules21)).toBe(true);
    });
  });

  describe('getServiceSide', () => {
    it('ควรบอกฝั่งขวา (RIGHT) เมื่อคะแนนเป็นเลขคู่', () => {
      expect(getServiceSide(0)).toBe('RIGHT');
      expect(getServiceSide(2)).toBe('RIGHT');
      expect(getServiceSide(20)).toBe('RIGHT');
    });

    it('ควรบอกฝั่งซ้าย (LEFT) เมื่อคะแนนเป็นเลขคี่', () => {
      expect(getServiceSide(1)).toBe('LEFT');
      expect(getServiceSide(3)).toBe('LEFT');
      expect(getServiceSide(21)).toBe('LEFT');
    });
  });
});
