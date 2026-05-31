import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('birdify.db');

export async function initDatabase() {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT,
      username TEXT,
      fullname TEXT,
      bio TEXT,
      profile_pic_url TEXT,
      is_private INTEGER DEFAULT 0,
      is_verified INTEGER DEFAULT 0,
      user_level TEXT DEFAULT 'general',
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS birds (
      id TEXT PRIMARY KEY,
      common_name TEXT,
      scientific_name TEXT,
      description TEXT,
      season TEXT,
      habitat_info TEXT,
      ideal_zones TEXT
    );

    CREATE TABLE IF NOT EXISTS sightings (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      bird_id TEXT,
      description TEXT,
      latitude REAL,
      longitude REAL,
      is_location_private INTEGER DEFAULT 0,
      photo_url TEXT,
      sighting_date TEXT,
      created_at TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      sighting_id TEXT,
      user_id TEXT,
      parent_comment_id TEXT,
      content TEXT,
      is_subcomment INTEGER DEFAULT 0,
      created_at TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS reactions (
      user_id TEXT,
      sighting_id TEXT,
      created_at TEXT,
      PRIMARY KEY (user_id, sighting_id)
    );

    CREATE TABLE IF NOT EXISTS follows (
      follower_id TEXT,
      following_id TEXT,
      created_at TEXT,
      PRIMARY KEY (follower_id, following_id)
    );

    CREATE TABLE IF NOT EXISTS sync_queue (
      id TEXT PRIMARY KEY,
      table_name TEXT NOT NULL,
      operation TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      attempts INTEGER DEFAULT 0
    );
  `);

  // Migracion: agregar sync_status si no existe
  await db.execAsync(
    `ALTER TABLE sightings ADD COLUMN sync_status TEXT DEFAULT 'synced'`
  ).catch(() => {});
}

export default db;
