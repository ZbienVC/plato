export type LogEntry = {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  type?: string;
  slot?: string;
  loggedAt?: string;
  source?: string;
  notes?: string;
};

const API_PATH = '/api/log';
const OFFLINE_QUEUE_KEY = 'plato_offline_log_queue';

function enqueueOffline(entry: LogEntry) {
  if (typeof window === 'undefined') return;
  try {
    const existing = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
    const queue = Array.isArray(existing) ? existing : [];
    queue.push(entry);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch {
    /* ignore storage errors */
  }
}

async function flushOfflineQueue() {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!raw) return;
    const queue: LogEntry[] = JSON.parse(raw);
    if (!Array.isArray(queue) || queue.length === 0) return;

    const remaining: LogEntry[] = [];
    // Attempt to replay queued entries sequentially
    for (const entry of queue) {
      try {
        const res = await fetch(API_PATH, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry),
        });
        if (!res.ok) throw new Error('failed');
      } catch {
        remaining.push(entry);
      }
    }

    if (remaining.length === 0) {
      localStorage.removeItem(OFFLINE_QUEUE_KEY);
    } else {
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
    }
  } catch {
    /* ignore */
  }
}

export async function saveLogEntry(entry: LogEntry) {
  const payload: LogEntry = {
    ...entry,
    loggedAt: entry.loggedAt || new Date().toISOString(),
  };

  try {
    const response = await fetch(API_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    await flushOfflineQueue();
    return { ok: true };
  } catch (error) {
    enqueueOffline(payload);
    return { ok: false, offline: true, error: (error as Error)?.message };
  }
}
