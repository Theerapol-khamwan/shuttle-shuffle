/**
 * useLanServer — React hook สำหรับ UI layer
 *
 * Wrap LAN Server functions:
 * - จัดการ server state (running/stopped/error)
 * - auto-get LAN IP via expo-network
 * - auto-broadcast score updates
 * - cleanup on unmount
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  startLanServer,
  stopLanServer,
  isServerRunning,
  getServerUrl,
  registerHandlers,
  broadcastScoreUpdate,
} from '../server/lanServer';
import { usePlayerStore } from '../store/usePlayerStore';
import { isGamePoint, getServiceSide } from '../logic/scoreboard';
import type { ActiveMatchInfo } from '../server/matchListPage';
import type { ScoreUpdate } from '../server/sseManager';

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

export interface LanServerState {
  running: boolean;
  url: string | null;
  baseUrl: string | null;   // root URL for QR Code (match list)
  error: string | null;
  starting: boolean;
}

// ────────────────────────────────────────────────────────────
// Hook
// ────────────────────────────────────────────────────────────

const PORT = 8080;

export const useLanServer = () => {
  const [state, setState] = useState<LanServerState>({
    running: isServerRunning(),
    url: getServerUrl(),
    baseUrl: getServerUrl(),
    error: null,
    starting: false,
  });

  const { players, activeMatches, currentSession, updateScore } = usePlayerStore();
  const playersRef = useRef(players);
  const matchesRef = useRef(activeMatches);
  const sessionRef = useRef(currentSession);

  // Keep refs up-to-date เพื่อให้ server handlers เข้าถึง latest state
  useEffect(() => { playersRef.current = players; }, [players]);
  useEffect(() => { matchesRef.current = activeMatches; }, [activeMatches]);
  useEffect(() => { sessionRef.current = currentSession; }, [currentSession]);

  // ────── Handler Helpers ──────

  const getPlayerName = useCallback((pid: string) => {
    return playersRef.current.find(p => p.id === pid)?.name || '???';
  }, []);

  const buildTeamLabel = useCallback((p1: string, p2?: string | null) => {
    const n1 = getPlayerName(p1);
    return p2 ? `${n1} & ${getPlayerName(p2)}` : n1;
  }, [getPlayerName]);

  const buildScoreUpdate = useCallback((matchId: string): ScoreUpdate | null => {
    // ใช้ getState() แทน matchesRef.current เพื่อให้ได้ข้อมูลล่าสุดทันที 
    // โดยไม่ต้องรอ useEffect อัพเดท ref (แก้ปัญหา race condition เมื่อกดแต้ม)
    const { activeMatches, currentSession } = usePlayerStore.getState();
    const match = activeMatches.find(m => m.id === matchId);
    if (!match) return null;

    const rules = { 
      winningScore: currentSession?.winning_score ?? 21, 
      deuceEnabled: currentSession?.enable_deuce ?? true 
    };

    const scoreA = match.team_a_score;
    const scoreB = match.team_b_score;

    // Use persisted serving team if available, otherwise fallback
    const servingTeam: 'A' | 'B' = match.serving_team || (scoreA >= scoreB ? 'A' : 'B');
    const serviceSide = getServiceSide(servingTeam === 'A' ? scoreA : scoreB);

    return {
      matchId: match.id,
      scoreA,
      scoreB,
      teamALabel: buildTeamLabel(match.team_a_p1, match.team_a_p2),
      teamBLabel: buildTeamLabel(match.team_b_p1, match.team_b_p2),
      servingTeam,
      serviceSide,
      isGamePointA: isGamePoint(scoreA, scoreB, rules),
      isGamePointB: isGamePoint(scoreB, scoreA, rules),
      timestamp: Date.now(),
      courtNumber: match.court_number,
    } as ScoreUpdate & { courtNumber: number };
  }, [buildTeamLabel]);

  // ────── Register handlers ──────

  useEffect(() => {
    registerHandlers({
      // Handler สำหรับ reverse control (เว็บกดแต้ม → แอป)
      onScoreAction: async (matchId, team, delta) => {
        const { activeMatches, players } = usePlayerStore.getState();
        const match = activeMatches.find(m => m.id === matchId);
        if (!match) return;

        const newA = team === 'A'
          ? Math.max(0, match.team_a_score + delta)
          : match.team_a_score;
        const newB = team === 'B'
          ? Math.max(0, match.team_b_score + delta)
          : match.team_b_score;
        
        // Determine serving team
        let servingTeam: 'A' | 'B' = match.serving_team;
        if (delta > 0) {
          servingTeam = team;
        }
        
        const serviceSide = getServiceSide(servingTeam === 'A' ? newA : newB);

        // อัพเดท store (จะ trigger broadcast จาก Scoreboard screen)
        await updateScore(matchId, newA, newB, servingTeam);

        // Broadcast ทันทีโดยไม่ต้องรอ store
        const update: ScoreUpdate = {
          matchId,
          scoreA: newA,
          scoreB: newB,
          teamALabel: buildTeamLabel(match.team_a_p1, match.team_a_p2),
          teamBLabel: buildTeamLabel(match.team_b_p1, match.team_b_p2),
          servingTeam,
          serviceSide,
          isGamePointA: false,
          isGamePointB: false,
          timestamp: Date.now(),
        };
        broadcastScoreUpdate(update);
      },

      // Handler สำหรับ match list page
      getMatches: (): ActiveMatchInfo[] => {
        const { activeMatches } = usePlayerStore.getState();
        return activeMatches.map(m => ({
          id: m.id,
          courtNumber: m.court_number,
          teamALabel: buildTeamLabel(m.team_a_p1, m.team_a_p2),
          teamBLabel: buildTeamLabel(m.team_b_p1, m.team_b_p2),
          scoreA: m.team_a_score,
          scoreB: m.team_b_score,
        }));
      },

      // Handler สำหรับ initial SSE state
      getMatchScore: (matchId: string) => {
        // Use getState() to ensure we always have the latest matches even if unmounted
        const { activeMatches, currentSession } = usePlayerStore.getState();
        const match = activeMatches.find(m => m.id === matchId);
        if (!match) return null;

        const winningScore = currentSession?.winning_score ?? 21;
        const deuceEnabled = currentSession?.enable_deuce ?? true;
        const rules = { winningScore, deuceEnabled };

        const scoreA = match.team_a_score;
        const scoreB = match.team_b_score;

        const servingTeam: 'A' | 'B' = match.serving_team || (scoreA >= scoreB ? 'A' : 'B');
        const serviceSide = getServiceSide(servingTeam === 'A' ? scoreA : scoreB);

        return {
          matchId: match.id,
          scoreA,
          scoreB,
          teamALabel: buildTeamLabel(match.team_a_p1, match.team_a_p2),
          teamBLabel: buildTeamLabel(match.team_b_p1, match.team_b_p2),
          servingTeam,
          serviceSide,
          isGamePointA: isGamePoint(scoreA, scoreB, rules),
          isGamePointB: isGamePoint(scoreB, scoreA, rules),
          timestamp: Date.now(),
          courtNumber: match.court_number,
        } as ScoreUpdate & { courtNumber: number };
      },
    });
  }, [updateScore, buildTeamLabel]);

  // ────── Broadcast เมื่อคะแนนเปลี่ยน ──────

  const broadcastMatch = useCallback((matchId: string) => {
    if (!isServerRunning()) return;
    const update = buildScoreUpdate(matchId);
    if (update) {
      broadcastScoreUpdate(update);
    }
  }, [buildScoreUpdate]);

  // ────── Server Control ──────

  const startServer = useCallback(async () => {
    if (state.running || state.starting) return;

    setState(prev => ({ ...prev, starting: true, error: null }));

    try {
      const { url } = await startLanServer(PORT);
      setState({
        running: true,
        url,
        baseUrl: url,
        error: null,
        starting: false,
      });
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        running: false,
        url: null,
        baseUrl: null,
        error: err?.message ?? 'ไม่สามารถเริ่ม server ได้',
        starting: false,
      }));
    }
  }, [state.running, state.starting]);

  const stopServer = useCallback(async () => {
    if (!state.running) return;
    await stopLanServer();
    setState({
      running: false,
      url: null,
      baseUrl: null,
      error: null,
      starting: false,
    });
  }, [state.running]);

  // ────── Cleanup on unmount ──────

  useEffect(() => {
    return () => {
      // ไม่ stop server เมื่อ component unmount
      // เพื่อให้ server ยังรันอยู่เมื่อกลับมาที่หน้า dashboard
    };
  }, []);

  // ────── URL สำหรับ match นั้นๆ ──────

  const getMatchUrl = useCallback((matchId: string): string | null => {
    const base = getServerUrl();
    if (!base) return null;
    // ใช้ format มาตรฐานที่สุดที่เบราว์เซอร์และ server library เข้าใจตรงกัน
    return `${base}/?id=${matchId}`;
  }, []);

  const getBaseUrl = useCallback((): string | null => {
    return getServerUrl();
  }, []);

  return {
    ...state,
    startServer,
    stopServer,
    broadcastMatch,
    getMatchUrl,
    getBaseUrl,
  };
};
