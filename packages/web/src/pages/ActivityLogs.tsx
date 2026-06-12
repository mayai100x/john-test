import { useEffect, useState } from 'react';
import { getActivityLog, type ActivityEntry } from '../lib/activityLog';

export function ActivityLogsPage() {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);

  useEffect(() => {
    setEntries(getActivityLog());
  }, []);

  return (
    <div className="container">
      <header>
        <h1>📋 Activity Logs</h1>
      </header>

      {entries.length === 0 ? (
        <p className="empty">
          No activity yet. Create or delete items from the Home page to see logs here.
        </p>
      ) : (
        <div className="items">
          {entries.map((entry) => (
            <div key={entry.id} className="card activity-entry">
              <div className="activity-icon">
                {entry.action === 'created' ? '➕' : entry.action === 'deleted' ? '🗑️' : '📝'}
              </div>
              <div>
                <p>
                  <strong>{entry.itemName}</strong>{' '}
                  <span className="activity-action">
                    {entry.action === 'created' ? 'created' : 'deleted'}
                  </span>
                </p>
                <small>{new Date(entry.timestamp).toLocaleString()}</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
