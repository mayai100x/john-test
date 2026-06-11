import { useState, useEffect } from 'react';
import { fetchItems, createItem, deleteItem, checkHealth } from '../api/client';

interface Item {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export function HomePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [status, setStatus] = useState<string>('...');
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const [itemsRes, health] = await Promise.all([fetchItems(), checkHealth()]);
      setItems(itemsRes.data);
      setStatus(health.status);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !desc.trim()) return;

    setLoading(true);
    try {
      await createItem(name, desc);
      setName('');
      setDesc('');
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteItem(id);
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>🧪 John Test</h1>
        <span className={`badge ${status === 'ok' ? 'ok' : 'err'}`}>
          API: {status}
        </span>
      </header>

      {error && (
        <div className="error-banner" onClick={() => setError(null)}>
          ⚠ {error} (click to dismiss)
        </div>
      )}

      <form onSubmit={handleCreate} className="create-form">
        <input
          placeholder="Item name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="Description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Add Item'}
        </button>
      </form>

      <div className="items">
        {items.length === 0 && <p className="empty">No items yet. Create one above!</p>}
        {items.map((item) => (
          <div key={item.id} className="card">
            <div>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <small>{new Date(item.createdAt).toLocaleString()}</small>
            </div>
            <button
              className="delete-btn"
              onClick={() => handleDelete(item.id)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
