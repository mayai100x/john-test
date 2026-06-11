export interface ActivityEntry {
  id: string;
  action: 'created' | 'deleted';
  itemName: string;
  timestamp: string;
}

const STORAGE_KEY = 'activity-log';

function readLog(): ActivityEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLog(entries: ActivityEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function getActivityLog(): ActivityEntry[] {
  return readLog();
}

export function addActivityEntry(action: 'created' | 'deleted', itemName: string): void {
  const entries = readLog();
  entries.unshift({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    action,
    itemName,
    timestamp: new Date().toISOString(),
  });
  writeLog(entries);
}
