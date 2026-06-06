/**
 * LAN Server Engine
 *
 * ใช้ expo-http-server (simonsturge/expo-http-server)
 * API: setup(port) → route(path, method, handler) → start()
 *
 * เนื่องจาก library ไม่รองรับ streaming/SSE
 * จึงใช้ short-polling pattern:
 * - เว็บ GET /api/match/:id/poll?since=<timestamp> ทุก 800ms
 * - Server return delta เฉพาะเมื่อมี update ใหม่กว่า timestamp
 */

import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Network from 'expo-network';
import type { StatusEvent, RequestEvent } from 'expo-http-server';

// ป้องกันแอปแครชใน Expo Go โดยทำการโหลด library แบบเงื่อนไข
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
let HttpServer: any = null;

if (!isExpoGo) {
  try {
    HttpServer = require('expo-http-server');
  } catch (e) {
    console.warn('[LanServer] expo-http-server not found or failed to load');
  }
}
import { getScoreboardPageHTML } from './scoreboardPage';
import { getMatchListPageHTML, type ActiveMatchInfo } from './matchListPage';
import type { ScoreUpdate } from './sseManager';

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

export type ScoreActionHandler = (
  matchId: string,
  team: 'A' | 'B',
  delta: number
) => Promise<void>;

export type GetMatchesHandler = () => ActiveMatchInfo[];
export type GetMatchScoreHandler = (matchId: string) => (ScoreUpdate & { courtNumber?: number }) | null;

// ────────────────────────────────────────────────────────────
// In-memory State Store (เก็บ score updates ไว้ให้ polling)
// ────────────────────────────────────────────────────────────

// เก็บ update ล่าสุดต่อ matchId
const scoreCache = new Map<string, ScoreUpdate & { courtNumber?: number; updatedAt: number }>();

// ────────────────────────────────────────────────────────────
// Server State
// ────────────────────────────────────────────────────────────

const DEFAULT_PORT = 8080;
let isRunning = false;
let serverUrl: string | null = null;
let deviceIp: string | null = null;

let onScoreAction: ScoreActionHandler | null = null;
let getMatches: GetMatchesHandler | null = null;
let getMatchScore: GetMatchScoreHandler | null = null;

// ────────────────────────────────────────────────────────────
// Server Control
// ────────────────────────────────────────────────────────────

/**
 * เริ่มต้น HTTP Server
 */
export const startLanServer = async (
  port: number = DEFAULT_PORT
): Promise<{ url: string; ip: string }> => {
  if (isRunning) {
    return { url: serverUrl!, ip: deviceIp! };
  }

  if (isExpoGo || !HttpServer) {
    throw new Error('ไม่สามารถเปิด Local Server ในโหมด Expo Go ได้ กรุณาใช้ Development Build');
  }

  try {
    const ipAddress = await Network.getIpAddressAsync();

    if (!ipAddress || ipAddress === '0.0.0.0') {
      throw new Error('ไม่พบ Wi-Fi — กรุณาเชื่อมต่อ Wi-Fi ก่อน');
    }

    deviceIp = ipAddress;

    // Setup server
    HttpServer.setup(port, (event: StatusEvent) => {
      console.log(`[LanServer] Status: ${event.status} — ${event.message}`);
    });

    // Register all routes
    registerAllRoutes();

    // Start
    HttpServer.start();

    isRunning = true;
    serverUrl = `http://${deviceIp}:${port}`;

    console.log(`[LanServer] ✅ Started at ${serverUrl}`);

    return { url: serverUrl, ip: deviceIp };
  } catch (error) {
    isRunning = false;
    serverUrl = null;
    console.error('[LanServer] ❌ Failed to start:', error);
    throw error;
  }
};

/**
 * หยุด HTTP Server
 */
export const stopLanServer = async (): Promise<void> => {
  if (!isRunning || !HttpServer) return;

  try {
    scoreCache.clear();
    HttpServer.stop();
    isRunning = false;
    serverUrl = null;
    deviceIp = null;
    console.log('[LanServer] 🛑 Stopped');
  } catch (error) {
    console.error('[LanServer] Error stopping:', error);
  }
};

export const isServerRunning = (): boolean => isRunning;
export const getServerUrl = (): string | null => serverUrl;

/**
 * ลงทะเบียน handler callbacks จาก React layer
 */
export const registerHandlers = (handlers: {
  onScoreAction?: ScoreActionHandler;
  getMatches?: GetMatchesHandler;
  getMatchScore?: GetMatchScoreHandler;
}) => {
  if (handlers.onScoreAction) onScoreAction = handlers.onScoreAction;
  if (handlers.getMatches) getMatches = handlers.getMatches;
  if (handlers.getMatchScore) getMatchScore = handlers.getMatchScore;
};

// ────────────────────────────────────────────────────────────
// Update broadcast (push to cache)
// ────────────────────────────────────────────────────────────

/**
 * เรียกจาก React เมื่อคะแนนเปลี่ยน
 * Web clients จะได้รับผ่าน polling ภายใน ~800ms
 */
export const broadcastScoreUpdate = (update: ScoreUpdate & { courtNumber?: number }): void => {
  scoreCache.set(update.matchId, {
    ...update,
    updatedAt: Date.now(),
  });
};

// ────────────────────────────────────────────────────────────
// Route Registration
// ────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'no-cache',
};

const registerAllRoutes = () => {
  if (!HttpServer) return;
  // ── GET / → Match List ──────────────────────────────────
  HttpServer.route('/', 'GET', async (_req: RequestEvent) => {
    const matches = getMatches ? getMatches() : [];
    return {
      statusCode: 200,
      contentType: 'text/html; charset=utf-8',
      headers: { 'Cache-Control': 'no-cache' },
      body: getMatchListPageHTML(matches),
    };
  });

  // ── GET /scoreboard/:matchId ─────────────────────────────
  // expo-http-server ไม่รองรับ wildcard path, ต้องใช้ glob
  // จึงใช้ trick: register generic path ด้วย pattern
  // Note: library อาจต้องการ exact path — ดังนั้น register ด้วย prefix แทน
  HttpServer.route('/scoreboard', 'GET', async (req: RequestEvent) => {
    // ดึง matchId จาก query param หรือ path
    const params = req.paramsJson ? JSON.parse(req.paramsJson) : {};
    const matchId = params.id || extractPathSegment(req.path, 2);
    if (!matchId) {
      return { statusCode: 400, contentType: 'text/plain', body: 'matchId required' };
    }
    return {
      statusCode: 200,
      contentType: 'text/html; charset=utf-8',
      headers: { 'Cache-Control': 'no-cache' },
      body: getScoreboardPageHTML(matchId),
    };
  });

  // ── GET /api/matches ─────────────────────────────────────
  HttpServer.route('/api/matches', 'GET', async (_req: RequestEvent) => {
    const matches = getMatches ? getMatches() : [];
    return {
      statusCode: 200,
      contentType: 'application/json; charset=utf-8',
      headers: CORS_HEADERS,
      body: JSON.stringify(matches),
    };
  });

  // ── GET /api/poll?matchId=X&since=Y ──────────────────────
  // Polling endpoint: client polls ทุก ~800ms
  // Returns latest score if newer than `since` timestamp
  HttpServer.route('/api/poll', 'GET', async (req: RequestEvent) => {
    const params = req.paramsJson ? JSON.parse(req.paramsJson) : {};
    const matchId = params.matchId as string;
    const since = parseInt(params.since ?? '0', 10) || 0;

    if (!matchId) {
      return {
        statusCode: 400,
        contentType: 'application/json',
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'matchId required' }),
      };
    }

    const cached = scoreCache.get(matchId);
    const hasUpdate = cached && cached.updatedAt > since;

    if (hasUpdate) {
      return {
        statusCode: 200,
        contentType: 'application/json; charset=utf-8',
        headers: CORS_HEADERS,
        body: JSON.stringify({ ...cached, hasUpdate: true }),
      };
    }

    // ไม่มี update ใหม่ — ลองดึงจาก handler
    const liveScore = getMatchScore ? getMatchScore(matchId) : null;
    if (liveScore) {
      const result = { ...liveScore, updatedAt: since, hasUpdate: false };
      return {
        statusCode: 200,
        contentType: 'application/json; charset=utf-8',
        headers: CORS_HEADERS,
        body: JSON.stringify(result),
      };
    }

    return {
      statusCode: 200,
      contentType: 'application/json',
      headers: CORS_HEADERS,
      body: JSON.stringify({ hasUpdate: false }),
    };
  });

  // ── POST /api/score ──────────────────────────────────────
  // Web กดแต้ม → ส่งกลับมาที่นี่
  HttpServer.route('/api/score', 'POST', async (req: RequestEvent) => {
    try {
      const body = req.body ? JSON.parse(req.body) : {};
      const { matchId, team, delta } = body;

      if (!matchId || !team || typeof delta !== 'number' || !['A', 'B'].includes(team)) {
        return {
          statusCode: 400,
          contentType: 'application/json',
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'matchId, team (A|B), delta required' }),
        };
      }

      if (onScoreAction) {
        await onScoreAction(matchId, team as 'A' | 'B', delta);
      }

      return {
        statusCode: 200,
        contentType: 'application/json',
        headers: CORS_HEADERS,
        body: JSON.stringify({ ok: true }),
      };
    } catch (err) {
      console.error('[LanServer] POST /api/score error:', err);
      return {
        statusCode: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal error' }),
      };
    }
  });

  // ── OPTIONS (CORS preflight) ─────────────────────────────
  HttpServer.route('/api/poll', 'OPTIONS', async (_req: RequestEvent) => ({
    statusCode: 204,
    headers: CORS_HEADERS,
    body: '',
  }));

  HttpServer.route('/api/score', 'OPTIONS', async (_req: RequestEvent) => ({
    statusCode: 204,
    headers: CORS_HEADERS,
    body: '',
  }));
};

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

const extractPathSegment = (path: string, index: number): string => {
  const parts = path.split('/').filter(Boolean);
  return parts[index] ?? '';
};

export default {
  startLanServer,
  stopLanServer,
  isServerRunning,
  getServerUrl,
  registerHandlers,
  broadcastScoreUpdate,
};
