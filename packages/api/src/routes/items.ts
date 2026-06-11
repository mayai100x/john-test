import { Router, Request, Response } from 'express';

export const itemsRouter = Router();

// In-memory store (simple for testing)
interface Item {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

let items: Item[] = [
  {
    id: '1',
    name: 'Sample Item',
    description: 'This is a test item from the API',
    createdAt: new Date().toISOString(),
  },
];

// GET /api/items
itemsRouter.get('/', (_req: Request, res: Response) => {
  res.json({ data: items, total: items.length });
});

// GET /api/items/:id
itemsRouter.get('/:id', (req: Request, res: Response) => {
  const item = items.find((i) => i.id === req.params.id);
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

  const item: Item = {
    id: String(items.length + 1),
    name,
    description,
    createdAt: new Date().toISOString(),
  };
  items.push(item);
  res.status(201).json({ data: item });
});

// DELETE /api/items/:id
itemsRouter.delete('/:id', (req: Request, res: Response) => {
  const index = items.findIndex((i) => i.id === req.params.id);
  if (index === -1) {
    res.status(404).json({ error: 'Item not found' });
    return;
  }
  items.splice(index, 1);
  res.json({ message: 'Item deleted' });
});
