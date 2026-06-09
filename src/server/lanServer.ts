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
let routesRegistered = false; // ป้องกันการลงทะเบียน route ซ้ำ
let serverUrl: string | null = null;
let deviceIp: string | null = null;

let onScoreAction: ScoreActionHandler | null = null;
let getMatches: GetMatchesHandler | null = null;
let getMatchScore: GetMatchScoreHandler | null = null;

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

const extractPathSegment = (path: string, index: number): string => {
  const segments = path.split('/').filter(s => s.length > 0);
  return segments[index] || '';
};

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

import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';

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
  if (!HttpServer || routesRegistered) return;
  routesRegistered = true;

  // ── Serve Assets ──
  HttpServer.route('/assets/exchange.png', 'GET', async () => {
    try {
      // โหลดไฟล์จาก local assets
      const asset = Asset.fromModule(require('../../assets/exchange.png'));
      await asset.downloadAsync();
      const base64 = await FileSystem.readAsStringAsync(asset.localUri!, {
        encoding: FileSystem.EncodingType.Base64,
      });

      return {
        statusCode: 200,
        contentType: 'image/png',
        headers: CORS_HEADERS,
        body: base64,
        isBase64: true, // บอก library ว่าเป็น binary
      };
    } catch (err) {
      return { statusCode: 404, body: 'Not Found' };
    }
  });

  const handleScoreboardRequest = async (req: RequestEvent) => {
    let matchId = '';
    const fullUrl = (req.url || '') + (req.path || '');
    
    // 1. พยายามแกะจาก Query Parameter (?id=...)
    const idMatch = fullUrl.match(/[?&]id=([^&?#]+)/);
    if (idMatch) {
      matchId = idMatch[1];
    }
    
    // 2. ถ้ายังไม่มี ให้ลองแกะจาก Path Segment (กรณี /UUID หรือ /scoreboard/UUID)
    if (!matchId) {
      const segments = (req.path || '').split('?')[0].split('/').filter(s => s.length > 0);
      // หา segment ที่ดูเหมือน UUID (ยาว > 20 ตัวอักษร และไม่ใช่คำว่า scoreboard)
      const possibleId = segments.find(s => s.length > 20 && s !== 'scoreboard');
      if (possibleId) {
        matchId = possibleId;
      }
    }

    console.log(`[LanServer] Request Scoreboard: path=${req.path}, extractedId=${matchId}`);

    // ถ้าไม่มี ID ให้ลองหาแมตช์ที่กำลังเล่นอยู่จาก Store อัตโนมัติ (UX: เข้า / เฉยๆ ก็เห็นแมตช์ที่รันอยู่)
    if (!matchId) {
      const matches = getMatches ? getMatches() : [];
      if (matches.length > 0) {
        matchId = matches[0].id;
      }
    }

    // ถ้ายังไม่มีแมตช์จริงๆ ให้ไปหน้า List
    if (!matchId) {
      const matches = getMatches ? getMatches() : [];
      return {
        statusCode: 200,
        contentType: 'text/html; charset=utf-8',
        headers: { 
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: getMatchListPageHTML(matches),
      };
    }

    const initialScore = getMatchScore ? getMatchScore(matchId) : null;
    return {
      statusCode: 200,
      contentType: 'text/html; charset=utf-8',
      headers: { 
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      body: getScoreboardPageHTML(matchId, initialScore),
    };
  };

  // ลงทะเบียนเส้นทางหลัก
  HttpServer.route('/', 'GET', handleScoreboardRequest);
  HttpServer.route('/scoreboard', 'GET', handleScoreboardRequest);

  // ── API: Poll (ใช้ POST เพื่อเลี่ยงปัญหา query string ใน library) ──
  HttpServer.route('/api/poll', 'POST', async (req: RequestEvent) => {
    try {
      let body: any = {};
      if (typeof req.body === 'string' && req.body.trim().length > 0) {
        try {
          body = JSON.parse(req.body);
        } catch (e) {
          console.warn('[LanServer] Invalid JSON body:', req.body);
        }
      } else if (req.body && typeof req.body === 'object') {
        body = req.body;
      }

      const { matchId, since } = body;
      const sinceNum = Number(since || 0);

      if (!matchId) {
        return {
          statusCode: 400,
          contentType: 'application/json',
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'matchId required' }),
        };
      }

      let cached = scoreCache.get(matchId);
      const liveScore = getMatchScore ? getMatchScore(matchId) : null;

      // Self-healing: ถ้าข้อมูลใน cache ไม่ตรงกับ liveScore (store) -> ถือว่ามี update
      if (liveScore && (!cached || 
          cached.scoreA !== liveScore.scoreA || 
          cached.scoreB !== liveScore.scoreB || 
          cached.servingTeam !== liveScore.servingTeam)) {
        
        // อัพเดท cache ทันทีเพื่อให้ poll ถัดไปเสถียร
        broadcastScoreUpdate(liveScore);
        cached = scoreCache.get(matchId);
      }
      
      // ถ้ามีข้อมูลใน cache และใหม่กว่าที่ client มี -> ส่งกลับทันที
      if (cached && cached.updatedAt > sinceNum) {
        return {
          statusCode: 200,
          contentType: 'application/json; charset=utf-8',
          headers: CORS_HEADERS,
          body: JSON.stringify({ ...cached, hasUpdate: true }),
        };
      }

      // ถ้าไม่พบแมตช์ที่กำลังเล่นอยู่ (เช่น จบแมตช์แล้ว) ให้แจ้ง client
      if (!liveScore) {
        return {
          statusCode: 200,
          contentType: 'application/json; charset=utf-8',
          headers: CORS_HEADERS,
          body: JSON.stringify({ 
            matchId,
            status: 'completed',
            hasUpdate: true 
          }),
        };
      }

      // ถ้าไม่มี update ให้ส่งสถานะ hasUpdate: false
      // สำคัญ: ต้องส่ง updatedAt เป็นค่าเดิม (since) เพื่อไม่ให้ client ข้าม update ที่อาจเกิดขึ้นระหว่างรอยต่อ
      return {
        statusCode: 200,
        contentType: 'application/json; charset=utf-8',
        headers: CORS_HEADERS,
        body: JSON.stringify({ 
          ...liveScore, 
          updatedAt: sinceNum, 
          hasUpdate: false 
        }),
      };
    } catch (err) {
      console.error('[LanServer] /api/poll error:', err);
      return { 
        statusCode: 500, 
        contentType: 'application/json',
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Server error' }) 
      };
    }
  });

  // ── POST /api/score ──────────────────────────────────────
  HttpServer.route('/api/score', 'POST', async (req: RequestEvent) => {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
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

  // ── GET /api/matches (เพื่อความเข้ากันได้ย้อนหลัง) ──
  HttpServer.route('/api/matches', 'GET', async () => {
    const matches = getMatches ? getMatches() : [];
    return {
      statusCode: 200,
      contentType: 'application/json',
      headers: CORS_HEADERS,
      body: JSON.stringify(matches),
    };
  });

  // ── OPTIONS (CORS preflight) ─────────────────────────────
  HttpServer.route('/api/poll', 'OPTIONS', async () => ({
    statusCode: 204,
    headers: CORS_HEADERS,
    body: '',
  }));

  HttpServer.route('/api/score', 'OPTIONS', async () => ({
    statusCode: 204,
    headers: CORS_HEADERS,
    body: '',
  }));
};
