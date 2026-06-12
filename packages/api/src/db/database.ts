import Database from 'better-sqlite3';
import path from 'path';

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  const dbPath = path.join(__dirname, '..', '..', 'data', 'app.db');
  const fs = require('fs');
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Create schema
  db.exec(`
    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

  // Seed with sample item on first run
  const count = db.prepare('SELECT COUNT(*) as cnt FROM items').get() as { cnt: number };
  if (count.cnt === 0) {
    const sampleId = '1';
    db.prepare(
      'INSERT INTO items (id, name, description, created_at) VALUES (?, ?, ?, ?)'
    ).run(sampleId, 'Sample Item', 'This is a test item from the API', new Date().toISOString());
  }

  return db;
}
