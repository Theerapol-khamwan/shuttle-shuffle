/**
 * Score Cache Manager — เก็บสถานะคะแนนล่าสุดสำหรับ polling clients
 *
 * เดิมออกแบบเป็น SSE Manager แต่เปลี่ยนเป็น polling
 * เนื่องจาก expo-http-server ไม่รองรับ streaming responses
 * State จริงๆ ถูกจัดการใน lanServer.ts แล้ว
 * ไฟล์นี้ export types ที่ใช้ร่วมกัน
 */

export interface ScoreUpdate {
  matchId: string;
  scoreA: number;
  scoreB: number;
  teamALabel: string;
  teamBLabel: string;
  servingTeam: 'A' | 'B';
  isGamePointA: boolean;
  isGamePointB: boolean;
  timestamp: number;
}

export interface MatchInfo {
  id: string;
  courtNumber: number;
  teamAP1: string;
  teamAP2?: string;
  teamBP1: string;
  teamBP2?: string;
  scoreA: number;
  scoreB: number;
  winningScore: number;
  deuceEnabled: boolean;
  status: string;
}

// ฟังก์ชัน callback สำหรับส่ง SSE data
type SSESender = (data: string) => void;

// เก็บ connections แยกตาม matchId
const connections = new Map<string, Set<SSESender>>();

// เก็บ match info ล่าสุดสำหรับ initial state
const matchCache = new Map<string, ScoreUpdate>();

/**
 * ลงทะเบียน SSE client ใหม่
 * @returns cleanup function สำหรับเรียกเมื่อ client disconnect
 */
export const addSSEClient = (matchId: string, sender: SSESender): (() => void) => {
  if (!connections.has(matchId)) {
    connections.set(matchId, new Set());
  }
  connections.get(matchId)!.add(sender);

  // ส่ง initial state ถ้ามี cached data
  const cached = matchCache.get(matchId);
  if (cached) {
    try {
      sender(`data: ${JSON.stringify(cached)}\n\n`);
    } catch {}
  }

  return () => {
    const senders = connections.get(matchId);
    if (senders) {
      senders.delete(sender);
      if (senders.size === 0) {
        connections.delete(matchId);
      }
    }
  };
};

/**
 * Broadcast score update ไปทุก client ที่ subscribe matchId นั้น
 */
export const broadcastScoreUpdate = (update: ScoreUpdate): void => {
  // อัพเดท cache
  matchCache.set(update.matchId, update);

  const senders = connections.get(update.matchId);
  if (!senders || senders.size === 0) return;

  const payload = `data: ${JSON.stringify(update)}\n\n`;
  const deadSenders: SSESender[] = [];

  for (const sender of senders) {
    try {
      sender(payload);
    } catch {
      deadSenders.push(sender);
    }
  }

  // cleanup dead connections
  for (const dead of deadSenders) {
    senders.delete(dead);
  }
};

/**
 * Broadcast keepalive ป้องกัน connection timeout
 */
export const broadcastKeepalive = (matchId: string): void => {
  const senders = connections.get(matchId);
  if (!senders || senders.size === 0) return;

  const payload = ': keepalive\n\n';
  for (const sender of senders) {
    try {
      sender(payload);
    } catch {}
  }
};

/**
 * ล้าง cache ของ match (เช่น เมื่อ match จบ)
 */
export const clearMatchCache = (matchId: string): void => {
  matchCache.delete(matchId);
  connections.delete(matchId);
};

/**
 * จำนวน active clients ทั้งหมด
 */
export const getTotalClientCount = (): number => {
  let total = 0;
  for (const senders of connections.values()) {
    total += senders.size;
  }
  return total;
};

/**
 * จำนวน clients สำหรับ match นั้น
 */
export const getClientCount = (matchId: string): number => {
  return connections.get(matchId)?.size ?? 0;
};

/**
 * ล้าง connections ทั้งหมด (เมื่อ server หยุด)
 */
export const clearAllConnections = (): void => {
  connections.clear();
  matchCache.clear();
};
