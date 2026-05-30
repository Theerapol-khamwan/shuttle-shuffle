import { usePlayerStore } from '../usePlayerStore';
import { getDb } from '../../database/db';

// Mock Dependencies
jest.mock('../../database/db', () => ({
  getDb: jest.fn(),
  initDatabase: jest.fn(),
}));

jest.mock('uuid', () => ({
  v4: () => 'mock-uuid',
}));

jest.mock('react-native-get-random-values', () => ({}));

describe('PlayerStore (Zustand)', () => {
  let mockDb: any;

  beforeEach(() => {
    // Reset Zustand State
    usePlayerStore.setState({
      currentSession: null,
      players: [],
      activeMatches: [],
      loading: false,
    });

    mockDb = {
      runAsync: jest.fn().mockResolvedValue({}),
      getFirstAsync: jest.fn(),
      getAllAsync: jest.fn().mockResolvedValue([]),
    };
    (getDb as any).mockResolvedValue(mockDb);
  });

  it('ควรเริ่มต้น Session ใหม่ได้ถูกต้อง', async () => {
    await usePlayerStore.getState().startNewSession();
    
    const state = usePlayerStore.getState();
    expect(state.currentSession).toBeDefined();
    expect(state.currentSession?.id).toBe('mock-uuid');
    expect(state.currentSession?.winning_score).toBe(21);
    expect(mockDb.runAsync).toHaveBeenCalled();
  });

  it('ควรอัปเดต Settings ของ Session ได้', async () => {
    // Setup initial state
    usePlayerStore.setState({
      currentSession: { 
        id: 's1', date: '', total_courts: 1, status: 'active', 
        winning_score: 21, enable_deuce: true,
        court_hourly_rate: 0, hours_played: 0, shuttle_unit_price: 0,
        shuttles_used: 0, cost_split_method: 'equal'
      }
    });

    await usePlayerStore.getState().updateSessionSettings(15, false, 1);
    
    const state = usePlayerStore.getState();
    expect(state.currentSession?.winning_score).toBe(15);
    expect(state.currentSession?.enable_deuce).toBe(false);
    expect(state.currentSession?.total_courts).toBe(1);
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE sessions'),
      [15, 0, 1, 's1']
    );
  });

  it('ควรลบผู้เล่นและล้างข้อมูลที่เกี่ยวข้องได้', async () => {
    usePlayerStore.setState({
      currentSession: { 
        id: 's1', date: '', total_courts: 1, status: 'active', 
        winning_score: 21, enable_deuce: true,
        court_hourly_rate: 0, hours_played: 0, shuttle_unit_price: 0,
        shuttles_used: 0, cost_split_method: 'equal'
      },
      players: [{ id: 'p1', name: 'A', games_played: 0, session_id: 's1', exclude_from_split: false, is_paid: false }]
    });

    await usePlayerStore.getState().removePlayer('p1');
    
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM matches'),
      ['p1', 'p1', 'p1', 'p1']
    );
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM players'),
      ['p1']
    );
  });

  it('ควรสุ่มแมตช์แยกหลายสนามได้เมื่อมี total_courts มากกว่า 1', async () => {
    // กำหนดสนามเป็น 2 สนาม มีผู้เล่น 8 คน (พอดีสำหรับคู่ 2 แมตช์)
    usePlayerStore.setState({
      currentSession: { 
        id: 's1', date: '', total_courts: 2, status: 'active', 
        winning_score: 21, enable_deuce: true,
        court_hourly_rate: 0, hours_played: 0, shuttle_unit_price: 0,
        shuttles_used: 0, cost_split_method: 'equal'
      },
      players: [
        { id: 'p1', name: 'P1', games_played: 0, session_id: 's1', exclude_from_split: false, is_paid: false },
        { id: 'p2', name: 'P2', games_played: 0, session_id: 's1', exclude_from_split: false, is_paid: false },
        { id: 'p3', name: 'P3', games_played: 0, session_id: 's1', exclude_from_split: false, is_paid: false },
        { id: 'p4', name: 'P4', games_played: 0, session_id: 's1', exclude_from_split: false, is_paid: false },
        { id: 'p5', name: 'P5', games_played: 0, session_id: 's1', exclude_from_split: false, is_paid: false },
        { id: 'p6', name: 'P6', games_played: 0, session_id: 's1', exclude_from_split: false, is_paid: false },
        { id: 'p7', name: 'P7', games_played: 0, session_id: 's1', exclude_from_split: false, is_paid: false },
        { id: 'p8', name: 'P8', games_played: 0, session_id: 's1', exclude_from_split: false, is_paid: false },
      ]
    });

    // สุ่มล่วงหน้า 1 รอบ
    await usePlayerStore.getState().bulkMatchGeneration(1, 'doubles');

    // ตรวจสอบว่า mockDb.runAsync ถูกเรียกบันทึกแมตช์ลงคอร์ต 1 และ คอร์ต 2
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO matches'),
      expect.arrayContaining([expect.any(String), 's1', 1, expect.any(String), expect.any(String), expect.any(String), expect.any(String), expect.any(String)])
    );
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO matches'),
      expect.arrayContaining([expect.any(String), 's1', 2, expect.any(String), expect.any(String), expect.any(String), expect.any(String), expect.any(String)])
    );
  });
});
