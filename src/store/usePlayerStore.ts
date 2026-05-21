import { create } from 'zustand';
import { getDb } from '../database/db';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { generateMatch, generateSessionSchedule, MatchMode } from '../logic/matchmaking';

export interface Player {
  id: string;
  session_id: string;
  name: string;
  games_played: number;
  exclude_from_split: boolean;
  is_paid: boolean;
}

export interface Session {
  id: string;
  date: string;
  total_courts: number;
  status: 'active' | 'completed';
  winning_score: number;
  enable_deuce: boolean;
  court_hourly_rate: number;
  hours_played: number;
  shuttle_unit_price: number;
  shuttles_used: number;
  cost_split_method: 'equal' | 'pro_rata';
}

export interface Match {
  id: string;
  session_id: string;
  court_number: number;
  team_a_p1: string;
  team_a_p2?: string;
  team_b_p1: string;
  team_b_p2?: string;
  team_a_score: number;
  team_b_score: number;
  status: 'active' | 'completed';
  created_at: string;
}

interface PlayerStore {
  currentSession: Session | null;
  players: Player[];
  activeMatches: Match[];
  loading: boolean;
  
  startNewSession: () => Promise<void>;
  loadCurrentSession: () => Promise<void>;
  updateSessionSettings: (winningScore: number, enableDeuce: boolean, totalCourts: number) => Promise<void>;
  addPlayer: (name: string) => Promise<void>;
  removePlayer: (id: string) => Promise<void>;
  clearAllPlayers: () => Promise<void>;
  loadPlayers: (sessionId: string) => Promise<void>;
  
  createMatch: (courtNumber?: number, mode?: MatchMode) => Promise<void>;
  loadActiveMatches: () => Promise<void>;
  bulkMatchGeneration: (rounds: number, mode?: MatchMode) => Promise<void>;
  updateScore: (id: string, scoreA: number, scoreB: number) => Promise<void>;
  completeMatch: (id: string, scoreA: number, scoreB: number) => Promise<void>;
  endSession: () => Promise<void>;

  updateSessionCosts: (
    courtHourlyRate: number, 
    hoursPlayed: number, 
    shuttleUnitPrice: number, 
    shuttlesUsed: number, 
    costSplitMethod: 'equal' | 'pro_rata',
    totalCourts: number
  ) => Promise<void>;
  togglePlayerExclude: (id: string) => Promise<void>;
  togglePlayerPaid: (id: string) => Promise<void>;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentSession: null,
  players: [],
  activeMatches: [],
  loading: false,

  startNewSession: async () => {
    set({ loading: true });
    const db = await getDb();
    const sessionId = uuidv4();
    const date = new Date().toISOString();
    
    await db.runAsync(
      'INSERT INTO sessions (id, date, total_courts, status, winning_score, enable_deuce, court_hourly_rate, hours_played, shuttle_unit_price, shuttles_used, cost_split_method) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [sessionId, date, 1, 'active', 21, 1, 0.0, 0.0, 0.0, 0, 'equal']
    );
    
    set({ 
      currentSession: { 
        id: sessionId, 
        date, 
        total_courts: 1, 
        status: 'active', 
        winning_score: 21, 
        enable_deuce: true,
        court_hourly_rate: 0.0,
        hours_played: 0.0,
        shuttle_unit_price: 0.0,
        shuttles_used: 0,
        cost_split_method: 'equal'
      },
      players: [],
      activeMatches: [],
      loading: false 
    });
  },

  loadCurrentSession: async () => {
    set({ loading: true });
    const db = await getDb();
    const result = await db.getFirstAsync<any>(
      "SELECT * FROM sessions WHERE status = 'active' ORDER BY date DESC LIMIT 1"
    );
    
    if (result) {
      const session: Session = {
        ...result,
        enable_deuce: result.enable_deuce === 1
      };
      set({ currentSession: session });
      
      const results = await db.getAllAsync<any>(
        'SELECT * FROM players WHERE session_id = ?',
        [result.id]
      );
      const mappedPlayers: Player[] = results.map(r => ({
        ...r,
        exclude_from_split: r.exclude_from_split === 1,
        is_paid: r.is_paid === 1
      }));
      const matches = await db.getAllAsync<Match>(
        "SELECT * FROM matches WHERE session_id = ? AND status = 'active' ORDER BY created_at ASC",
        [result.id]
      );
      set({ players: mappedPlayers, activeMatches: matches, loading: false });
    } else {
      set({ loading: false });
    }
  },

  updateSessionSettings: async (winningScore: number, enableDeuce: boolean, totalCourts: number) => {
    const { currentSession } = get();
    if (!currentSession) return;

    const db = await getDb();
    await db.runAsync(
      'UPDATE sessions SET winning_score = ?, enable_deuce = ?, total_courts = ? WHERE id = ?',
      [winningScore, enableDeuce ? 1 : 0, totalCourts, currentSession.id]
    );
    set({ 
      currentSession: { ...currentSession, winning_score: winningScore, enable_deuce: enableDeuce, total_courts: totalCourts } 
    });
  },

  loadPlayers: async (sessionId: string) => {
    const db = await getDb();
    const results = await db.getAllAsync<any>(
      'SELECT * FROM players WHERE session_id = ?',
      [sessionId]
    );
    const mappedPlayers: Player[] = results.map(r => ({
      ...r,
      exclude_from_split: r.exclude_from_split === 1,
      is_paid: r.is_paid === 1
    }));
    set({ players: mappedPlayers });
  },

  addPlayer: async (name: string) => {
    const { currentSession } = get();
    if (!currentSession) return;

    const db = await getDb();
    const id = uuidv4();
    await db.runAsync(
      'INSERT INTO players (id, session_id, name, games_played, exclude_from_split, is_paid) VALUES (?, ?, ?, ?, ?, ?)',
      [id, currentSession.id, name, 0, 0, 0]
    );
    await get().loadPlayers(currentSession.id);
  },

  removePlayer: async (id: string) => {
    const { currentSession } = get();
    if (!currentSession) return;

    const db = await getDb();
    await db.runAsync('DELETE FROM matches WHERE team_a_p1 = ? OR team_a_p2 = ? OR team_b_p1 = ? OR team_b_p2 = ?', [id, id, id, id]);
    await db.runAsync('DELETE FROM players WHERE id = ?', [id]);
    await get().loadPlayers(currentSession.id);
    await get().loadActiveMatches();
  },

  clearAllPlayers: async () => {
    const { currentSession } = get();
    if (!currentSession) return;

    const db = await getDb();
    await db.runAsync('DELETE FROM matches WHERE session_id = ?', [currentSession.id]);
    await db.runAsync('DELETE FROM players WHERE session_id = ?', [currentSession.id]);
    await get().loadPlayers(currentSession.id);
    await get().loadActiveMatches();
  },

  createMatch: async (courtNumber?: number, mode: MatchMode = 'doubles') => {
    const { currentSession, players, activeMatches } = get();
    if (!currentSession) return;

    const db = await getDb();
    
    // Auto-detect vacant court number if not provided
    const totalCourts = currentSession.total_courts || 1;
    let finalCourtNumber = courtNumber;
    if (!finalCourtNumber) {
      // Find first vacant court
      for (let c = 1; c <= totalCourts; c++) {
        if (!activeMatches.some(m => m.court_number === c)) {
          finalCourtNumber = c;
          break;
        }
      }
      // If all courts occupied, assign to court with fewest active matches or wrap around
      if (!finalCourtNumber) {
        finalCourtNumber = (activeMatches.length % totalCourts) + 1;
      }
    }

    const pastMatches = await db.getAllAsync<{ 
      team_a_p1: string; team_a_p2?: string; team_b_p1: string; team_b_p2?: string; 
    }>(
      'SELECT team_a_p1, team_a_p2, team_b_p1, team_b_p2 FROM matches WHERE session_id = ?',
      [currentSession.id]
    );

    const matchCandidate = generateMatch(players, pastMatches, mode);
    if (!matchCandidate) return;

    const id = uuidv4();
    const createdAt = new Date().toISOString();

    await db.runAsync(
      `INSERT INTO matches (
        id, session_id, court_number, team_a_p1, team_a_p2, team_b_p1, team_b_p2, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, 
        currentSession.id, 
        finalCourtNumber, 
        matchCandidate.team_a[0], 
        matchCandidate.team_a[1],
        matchCandidate.team_b[0],
        matchCandidate.team_b[1],
        createdAt
      ]
    );

    const playerIds = [
      matchCandidate.team_a[0], 
      matchCandidate.team_a[1], 
      matchCandidate.team_b[0], 
      matchCandidate.team_b[1]
    ].filter(Boolean) as string[];

    for (const pid of playerIds) {
      await db.runAsync(
        'UPDATE players SET games_played = games_played + 1 WHERE id = ?',
        [pid]
      );
    }

    await get().loadPlayers(currentSession.id);
    await get().loadActiveMatches();
  },

  bulkMatchGeneration: async (rounds: number, mode: MatchMode = 'doubles') => {
    const { currentSession, players } = get();
    if (!currentSession) return;

    const db = await getDb();
    
    // Fetch all existing past matches to feed into the variety algorithm
    const pastMatches = await db.getAllAsync<{ 
      team_a_p1: string; team_a_p2?: string; team_b_p1: string; team_b_p2?: string; 
    }>(
      'SELECT team_a_p1, team_a_p2, team_b_p1, team_b_p2 FROM matches WHERE session_id = ?',
      [currentSession.id]
    );

    const totalCourts = currentSession.total_courts || 1;
    const playersNeeded = mode === 'doubles' ? 4 : 2;

    // Create a temporary deep copy of players with their games_played count
    const tempPlayers = players.map(p => ({ ...p }));
    const tempMatches = [...pastMatches];

    for (let r = 1; r <= rounds; r++) {
      const roundPlayerIds = new Set<string>();

      for (let c = 1; c <= totalCourts; c++) {
        // Filter out players who are already playing in this round
        const availablePlayers = tempPlayers.filter(p => !roundPlayerIds.has(p.id));
        
        if (availablePlayers.length < playersNeeded) {
          // Not enough players left to form a match on this court in this round
          break;
        }

        const matchCandidate = generateMatch(availablePlayers, tempMatches, mode);
        if (matchCandidate) {
          const id = uuidv4();
          const createdAt = new Date().toISOString();

          await db.runAsync(
            `INSERT INTO matches (
              id, session_id, court_number, team_a_p1, team_a_p2, team_b_p1, team_b_p2, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              id, 
              currentSession.id, 
              c, 
              matchCandidate.team_a[0], 
              matchCandidate.team_a[1],
              matchCandidate.team_b[0],
              matchCandidate.team_b[1],
              createdAt
            ]
          );

          // Add to round players so they aren't scheduled for other courts in this same round
          const matchPlayerIds = [...matchCandidate.team_a, ...matchCandidate.team_b].filter(Boolean) as string[];
          matchPlayerIds.forEach(pid => {
            roundPlayerIds.add(pid);
            // Update temp player game counts
            const p = tempPlayers.find(tp => tp.id === pid);
            if (p) p.games_played++;
          });

          // Add to temp matches for variety calculations
          tempMatches.push({
            team_a_p1: matchCandidate.team_a[0],
            team_a_p2: matchCandidate.team_a[1] || undefined,
            team_b_p1: matchCandidate.team_b[0],
            team_b_p2: matchCandidate.team_b[1] || undefined,
          });

          // Update database game counts
          for (const pid of matchPlayerIds) {
            await db.runAsync(
              'UPDATE players SET games_played = games_played + 1 WHERE id = ?',
              [pid]
            );
          }
        }
      }
    }

    await get().loadPlayers(currentSession.id);
    await get().loadActiveMatches();
  },

  loadActiveMatches: async () => {
    const { currentSession } = get();
    if (!currentSession) return;

    const db = await getDb();
    const results = await db.getAllAsync<Match>(
      "SELECT * FROM matches WHERE session_id = ? AND status = 'active' ORDER BY created_at ASC",
      [currentSession.id]
    );
    set({ activeMatches: results });
  },

  updateScore: async (id: string, scoreA: number, scoreB: number) => {
    const db = await getDb();
    await db.runAsync(
      'UPDATE matches SET team_a_score = ?, team_b_score = ? WHERE id = ?',
      [scoreA, scoreB, id]
    );
    await get().loadActiveMatches();
  },

  completeMatch: async (id: string, scoreA: number, scoreB: number) => {
    const db = await getDb();
    await db.runAsync(
      "UPDATE matches SET team_a_score = ?, team_b_score = ?, status = 'completed' WHERE id = ?",
      [scoreA, scoreB, id]
    );
    await get().loadActiveMatches();
  },

  endSession: async () => {
    const { currentSession } = get();
    if (!currentSession) return;

    const db = await getDb();
    await db.runAsync(
      "UPDATE sessions SET status = 'completed' WHERE id = ?",
      [currentSession.id]
    );
    set({ currentSession: null, players: [], activeMatches: [] });
  },

  updateSessionCosts: async (
    courtHourlyRate: number, 
    hoursPlayed: number, 
    shuttleUnitPrice: number, 
    shuttlesUsed: number, 
    costSplitMethod: 'equal' | 'pro_rata',
    totalCourts: number
  ) => {
    const { currentSession } = get();
    if (!currentSession) return;

    const db = await getDb();
    await db.runAsync(
      `UPDATE sessions SET 
        court_hourly_rate = ?, 
        hours_played = ?, 
        shuttle_unit_price = ?, 
        shuttles_used = ?, 
        cost_split_method = ?,
        total_courts = ? 
      WHERE id = ?`,
      [courtHourlyRate, hoursPlayed, shuttleUnitPrice, shuttlesUsed, costSplitMethod, totalCourts, currentSession.id]
    );
    
    set({
      currentSession: {
        ...currentSession,
        court_hourly_rate: courtHourlyRate,
        hours_played: hoursPlayed,
        shuttle_unit_price: shuttleUnitPrice,
        shuttles_used: shuttlesUsed,
        cost_split_method: costSplitMethod,
        total_courts: totalCourts
      }
    });
  },

  togglePlayerExclude: async (id: string) => {
    const { currentSession, players } = get();
    if (!currentSession) return;

    const player = players.find(p => p.id === id);
    if (!player) return;

    const newValue = !player.exclude_from_split;
    const db = await getDb();
    await db.runAsync(
      'UPDATE players SET exclude_from_split = ? WHERE id = ?',
      [newValue ? 1 : 0, id]
    );

    await get().loadPlayers(currentSession.id);
  },

  togglePlayerPaid: async (id: string) => {
    const { currentSession, players } = get();
    if (!currentSession) return;

    const player = players.find(p => p.id === id);
    if (!player) return;

    const newValue = !player.is_paid;
    const db = await getDb();
    await db.runAsync(
      'UPDATE players SET is_paid = ? WHERE id = ?',
      [newValue ? 1 : 0, id]
    );

    await get().loadPlayers(currentSession.id);
  },
}));
