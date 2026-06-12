import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'john-test.db');

// Ensure data directory exists
import fs from 'fs';
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');

export interface ItemRow {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

// Create table on first run
db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`);

// Seed with sample item on first run
const count = db.prepare('SELECT COUNT(*) as count FROM items').get() as { count: number };
if (count.count === 0) {
  db.prepare(
    'INSERT INTO items (id, name, description, created_at) VALUES (?, ?, ?, ?)'
  ).run('1', 'Sample Item', 'This is a test item from the API', new Date().toISOString());
}

// CRUD functions

export function getAllItems(): { data: ItemRow[]; total: number } {
  const items = db.prepare('SELECT id, name, description, created_at AS createdAt FROM items ORDER BY created_at ASC').all() as ItemRow[];
  return { data: items, total: items.length };
}

export function getItemById(id: string): ItemRow | null {
  const item = db.prepare('SELECT id, name, description, created_at AS createdAt FROM items WHERE id = ?').get(id) as ItemRow | undefined;
  return item || null;
}

export function createItem(name: string, description: string): ItemRow {
  // Use a simple counter-based ID (matching the original incremental behavior)
  const maxId = db.prepare('SELECT MAX(CAST(id AS INTEGER)) as max_id FROM items').get() as { max_id: number | null };
  const nextId = String((maxId?.max_id ?? 0) + 1);
  const createdAt = new Date().toISOString();

  db.prepare(
    'INSERT INTO items (id, name, description, created_at) VALUES (?, ?, ?, ?)'
  ).run(nextId, name, description, createdAt);

  return { id: nextId, name, description, createdAt };
}

export function deleteItem(id: string): boolean {
  const result = db.prepare('DELETE FROM items WHERE id = ?').run(id);
  return result.changes > 0;
}

export function updateItem(id: string, fields: { name?: string; description?: string }): ItemRow | null {
  const existing = getItemById(id);
  if (!existing) return null;

  const name = fields.name ?? existing.name;
  const description = fields.description ?? existing.description;

  db.prepare(
    'UPDATE items SET name = ?, description = ? WHERE id = ?'
  ).run(name, description, id);

  return { id, name, description, createdAt: existing.createdAt };
}

