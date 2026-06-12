const API_BASE = '/api';

interface Item {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

interface ItemsResponse {
  data: Item[];
  total: number;
}

export async function fetchItems(): Promise<ItemsResponse> {
  const res = await fetch(`${API_BASE}/items`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function createItem(
  name: string,
  description: string
): Promise<{ data: Item }> {
  const res = await fetch(`${API_BASE}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function updateItem(
  id: string,
  fields: { name?: string; description?: string }
): Promise<{ data: Item }> {
  const res = await fetch(`${API_BASE}/items/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fields),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function deleteItem(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/items/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

export async function checkHealth(): Promise<{ status: string }> {
  const res = await fetch('/health');
  return res.json();
}
