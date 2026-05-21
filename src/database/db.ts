import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'shuttleshuffle.db';
let dbInstance: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export const initDatabase = async () => {
  if (dbInstance) return dbInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
      
      // การใช้ execAsync ทีเดียวหลายคำสั่งอาจเสี่ยงต่อการเกิด error ในบาง version 
      // แยกเป็นคำสั่งๆ เพื่อความชัวร์
      await db.execAsync('PRAGMA foreign_keys = ON;');

      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS sessions (
          id TEXT PRIMARY KEY NOT NULL,
          date TEXT NOT NULL,
          total_courts INTEGER DEFAULT 1,
          status TEXT DEFAULT 'active',
          winning_score INTEGER DEFAULT 21,
          enable_deuce INTEGER DEFAULT 1,
          court_hourly_rate REAL DEFAULT 0.0,
          hours_played REAL DEFAULT 0.0,
          shuttle_unit_price REAL DEFAULT 0.0,
          shuttles_used INTEGER DEFAULT 0,
          cost_split_method TEXT DEFAULT 'equal'
        );
      `);

      // พยายามเพิ่มคอลัมน์ใหม่สำหรับฐานข้อมูลเดิม (ถ้ามีคอลัมน์อยู่แล้วจะเกิด error ซึ่งเราข้ามไปได้)
      try { await db.execAsync('ALTER TABLE sessions ADD COLUMN winning_score INTEGER DEFAULT 21;'); } catch (e) {}
      try { await db.execAsync('ALTER TABLE sessions ADD COLUMN enable_deuce INTEGER DEFAULT 1;'); } catch (e) {}
      try { await db.execAsync('ALTER TABLE sessions ADD COLUMN court_hourly_rate REAL DEFAULT 0.0;'); } catch (e) {}
      try { await db.execAsync('ALTER TABLE sessions ADD COLUMN hours_played REAL DEFAULT 0.0;'); } catch (e) {}
      try { await db.execAsync('ALTER TABLE sessions ADD COLUMN shuttle_unit_price REAL DEFAULT 0.0;'); } catch (e) {}
      try { await db.execAsync('ALTER TABLE sessions ADD COLUMN shuttles_used INTEGER DEFAULT 0;'); } catch (e) {}
      try { await db.execAsync("ALTER TABLE sessions ADD COLUMN cost_split_method TEXT DEFAULT 'equal';"); } catch (e) {}

      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS players (
          id TEXT PRIMARY KEY NOT NULL,
          session_id TEXT NOT NULL,
          name TEXT NOT NULL,
          games_played INTEGER DEFAULT 0,
          exclude_from_split INTEGER DEFAULT 0,
          is_paid INTEGER DEFAULT 0,
          FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE
        );
      `);

      try { await db.execAsync('ALTER TABLE players ADD COLUMN exclude_from_split INTEGER DEFAULT 0;'); } catch (e) {}
      try { await db.execAsync('ALTER TABLE players ADD COLUMN is_paid INTEGER DEFAULT 0;'); } catch (e) {}


      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS matches (
          id TEXT PRIMARY KEY NOT NULL,
          session_id TEXT NOT NULL,
          court_number INTEGER NOT NULL,
          team_a_p1 TEXT NOT NULL,
          team_a_p2 TEXT,
          team_b_p1 TEXT NOT NULL,
          team_b_p2 TEXT,
          team_a_score INTEGER DEFAULT 0,
          team_b_score INTEGER DEFAULT 0,
          status TEXT DEFAULT 'active',
          created_at TEXT NOT NULL,
          FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE
        );
      `);

      dbInstance = db;
      return db;
    } catch (error) {
      initPromise = null;
      console.error("Database initialization failed:", error);
      throw error;
    }
  })();

  return initPromise;
};

export const getDb = async () => {
  if (dbInstance) return dbInstance;
  return await initDatabase();
};
