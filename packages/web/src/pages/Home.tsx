import { useState, useEffect } from 'react';
import { fetchItems, createItem, deleteItem, checkHealth } from '../api/client';
import { addActivityEntry, getActivityLog } from '../lib/activityLog';

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
  const [activityCount, setActivityCount] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [allTotal, setAllTotal] = useState(0);

  const load = async (query?: string) => {
    try {
      const trimmedQuery = query?.trim() || undefined;
      const [itemsRes, health] = await Promise.all([
        fetchItems(trimmedQuery),
        checkHealth(),
      ]);
      setItems(itemsRes.data);
      setStatus(health.status);
      setError(null);
      if (!trimmedQuery) {
        setAllTotal(itemsRes.total);
      }
    } catch (e) {
      setError((e as Error).message);
    }
  };

  useEffect(() => {
    setActivityCount(getActivityLog().length);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    load(debouncedSearch);
  }, [debouncedSearch]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !desc.trim()) return;

    setLoading(true);
    try {
      await createItem(name, desc);
      addActivityEntry('created', name);
      setName('');
      setDesc('');
      await load(debouncedSearch);
      setActivityCount(getActivityLog().length);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, itemName: string) => {
    try {
      await deleteItem(id);
      addActivityEntry('deleted', itemName);
      await load(debouncedSearch);
      setActivityCount(getActivityLog().length);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="container">
      <section className="welcome-banner">
        <h1 className="welcome-greeting">Welcome back! 👋</h1>
        <p className="welcome-subtitle">
          Your lightweight dashboard for managing items and tracking activity —
          all in one place.
        </p>
      </section>

      <section className="search-bar">
        <div className="search-input-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="search-clear"
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </section>

      <section className="stats-row">
        <div className="stat-card">
          <span className="stat-icon">📦</span>
          <div>
            <div className="stat-value">{items.length}</div>
            <div className="stat-label">Total Items</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">{status === 'ok' ? '🟢' : '🔴'}</span>
          <div>
            <div className="stat-value">{status === 'ok' ? 'Online' : status}</div>
            <div className="stat-label">API Status</div>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📋</span>
          <div>
            <div className="stat-value">{activityCount}</div>
            <div className="stat-label">Activity Entries</div>
          </div>
        </div>
      </section>

      {error && (
        <div className="error-banner" onClick={() => setError(null)}>
          ⚠ {error} (click to dismiss)
        </div>
      )}

      <section className="items-section">
        <h2>Items</h2>
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
          {debouncedSearch && items.length > 0 && (
            <p className="results-count">
              Showing {items.length} of {allTotal} items
            </p>
          )}
          {items.length === 0 && !debouncedSearch && (
            <p className="empty">No items yet. Create one above!</p>
          )}
          {items.length === 0 && debouncedSearch && (
            <p className="empty">No items match "{debouncedSearch}"</p>
          )}
          {items.map((item) => (
            <div key={item.id} className="card">
              <div>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <small>{new Date(item.createdAt).toLocaleString()}</small>
              </div>
              <button
                className="delete-btn"
                onClick={() => handleDelete(item.id, item.name)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
