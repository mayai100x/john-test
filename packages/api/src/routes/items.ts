import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { getDb } from '../db/database';

export const itemsRouter = Router();

// Row shape from SQLite (snake_case columns)
interface ItemRow {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

// Response shape (camelCase — matched by SQL alias)
interface Item {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

// GET /api/items
itemsRouter.get('/', (_req: Request, res: Response) => {
  const db = getDb();
  const rows = db
    .prepare('SELECT id, name, description, created_at AS createdAt FROM items ORDER BY created_at DESC')
    .all() as Item[];
  res.json({ data: rows, total: rows.length });
});

// GET /api/items/:id
itemsRouter.get('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const item = db
    .prepare('SELECT id, name, description, created_at AS createdAt FROM items WHERE id = ?')
    .get(req.params.id) as Item | undefined;
  if (!item) {
    res.status(404).json({ error: 'Item not found' });
    return;
  }
  res.json({ data: item });
});

// POST /api/items
itemsRouter.post('/', (req: Request, res: Response) => {
  const { name, description } = req.body;
  if (!name || !description) {
    res.status(400).json({ error: 'name and description are required' });
    return;
  }

  const db = getDb();
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  db.prepare('INSERT INTO items (id, name, description, created_at) VALUES (?, ?, ?, ?)').run(
    id,
    name,
    description,
    createdAt
  );

  const item: Item = { id, name, description, createdAt };
  res.status(201).json({ data: item });
});

// PUT /api/items/:id
itemsRouter.put('/:id', (req: Request, res: Response) => {
  const { name, description } = req.body as { name?: string; description?: string };

  if (name === undefined && description === undefined) {
    res.status(400).json({ error: 'At least one of name or description is required' });
    return;
  }

  const db = getDb();
  const existing = db
    .prepare('SELECT id, name, description, created_at AS createdAt FROM items WHERE id = ?')
    .get(req.params.id) as Item | undefined;

  if (!existing) {
    res.status(404).json({ error: 'Item not found' });
    return;
  }

  const updatedName = name !== undefined ? name : existing.name;
  const updatedDesc = description !== undefined ? description : existing.description;

  db.prepare('UPDATE items SET name = ?, description = ? WHERE id = ?').run(
    updatedName,
    updatedDesc,
    req.params.id
  );

  const item: Item = {
    id: existing.id,
    name: updatedName,
    description: updatedDesc,
    createdAt: existing.createdAt,
  };
  res.json({ data: item });
});

// DELETE /api/items/:id
itemsRouter.delete('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM items WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    res.status(404).json({ error: 'Item not found' });
    return;
  }
  res.json({ message: 'Item deleted' });
});
