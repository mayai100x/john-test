import { useState, useEffect, useRef } from 'react';
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

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [totalItems, setTotalItems] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search input
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  const load = async (query?: string) => {
    try {
      const [itemsRes, health] = await Promise.all([fetchItems(query), checkHealth()]);
      setItems(itemsRes.data);
      setTotalItems(itemsRes.total);
      setStatus(health.status);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  // Reload when debounced query changes
  useEffect(() => {
    load(debouncedQuery || undefined);
    setActivityCount(getActivityLog().length);
  }, [debouncedQuery]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !desc.trim()) return;

    setLoading(true);
    try {
      await createItem(name, desc);
      addActivityEntry('created', name);
      setName('');
      setDesc('');
      await load(debouncedQuery || undefined);
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
      await load(debouncedQuery || undefined);
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

        {/* Search */}
        <div className="search-bar">
          <input
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>

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
          {debouncedQuery && (
            <p className="results-count">
              Showing {items.length} of {totalItems} items
            </p>
          )}
          {items.length === 0 && !debouncedQuery && (
            <p className="empty">No items yet. Create one above!</p>
          )}
          {items.length === 0 && debouncedQuery && (
            <p className="empty">No items match "{debouncedQuery}"</p>
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
