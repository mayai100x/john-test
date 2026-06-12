import { Router, Request, Response } from 'express';
import { getAllItems, getItemById, createItem, deleteItem } from '../db/database';

export const itemsRouter = Router();

// GET /api/items
itemsRouter.get('/', (_req: Request, res: Response) => {
  const result = getAllItems();
  res.json({ data: result.data, total: result.total });
});

// GET /api/items/:id
itemsRouter.get('/:id', (req: Request, res: Response) => {
  const item = getItemById(req.params.id);
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

  const item = createItem(name, description);
  res.status(201).json({ data: item });
});

// DELETE /api/items/:id
itemsRouter.delete('/:id', (req: Request, res: Response) => {
  const deleted = deleteItem(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: 'Item not found' });
    return;
  }
  res.json({ message: 'Item deleted' });
});
