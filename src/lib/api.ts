/**
 * Plato frontend API client
 * Replaces the stub api.ts â€” wires to the real backend
 */

const BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('plato_token');
}

function setToken(token: string) {
  localStorage.setItem('plato_token', token);
}

function clearToken() {
  localStorage.removeItem('plato_token');
}

function authHeaders() {
  const token = getToken();
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };
}

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

export type FoodResult = {
  fdcId: number;
  name: string;
  brand: string | null;
  category: string;
  serving: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
};

export type DayLog = {
  date: string;
  entries: LogEntry[];
  totals: { calories: number; protein: number; carbs: number; fat: number };
};

// â”€â”€â”€ Auth â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const auth = {
  isLoggedIn: () => !!getToken(),

  async signup(email: string, password: string, username?: string) {
    const res = await fetch(`${BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Signup failed');
    setToken(data.token);
    return data;
  },

  async login(email: string, password: string) {
    const res = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    setToken(data.token);
    return data;
  },

  logout() {
    clearToken();
  },
};

// â”€â”€â”€ Food Search (USDA) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function searchFood(query: string): Promise<FoodResult[]> {
  if (!query || query.length < 2) return [];
  const res = await fetch(
    `${BASE}/food/search?q=${encodeURIComponent(query)}`,
    { headers: authHeaders() }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.results || [];
}

// â”€â”€â”€ Meal Log â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const OFFLINE_QUEUE_KEY = 'plato_offline_log_queue';

function enqueueOffline(entry: LogEntry) {
  try {
    const existing = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
    const queue = Array.isArray(existing) ? existing : [];
    queue.push(entry);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch { /* ignore */ }
}

async function flushOfflineQueue() {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!raw) return;
    const queue: LogEntry[] = JSON.parse(raw);
    if (!Array.isArray(queue) || queue.length === 0) return;
    const remaining: LogEntry[] = [];
    for (const entry of queue) {
      try {
        const res = await fetch(`${BASE}/log`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(entry),
        });
        if (!res.ok) remaining.push(entry);
      } catch {
        remaining.push(entry);
      }
    }
    if (remaining.length === 0) localStorage.removeItem(OFFLINE_QUEUE_KEY);
    else localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
  } catch { /* ignore */ }
}

export async function saveLogEntry(entry: LogEntry): Promise<{ ok: boolean; offline?: boolean }> {
  const payload = { ...entry, loggedAt: entry.loggedAt || new Date().toISOString() };

  // If not logged in, save to localStorage only (legacy behavior)
  if (!auth.isLoggedIn()) {
    try {
      const dateKey = `plato_log_${payload.loggedAt!.split('T')[0]}`;
      const existing = JSON.parse(localStorage.getItem(dateKey) || '[]');
      existing.push(payload);
      localStorage.setItem(dateKey, JSON.stringify(existing));
    } catch { /* ignore */ }
    return { ok: true };
  }

  try {
    const res = await fetch(`${BASE}/log`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Request failed');
    await flushOfflineQueue();
    return { ok: true };
  } catch {
    enqueueOffline(payload);
    return { ok: false, offline: true };
  }
}

export async function getDayLog(date?: string): Promise<DayLog | null> {
  if (!auth.isLoggedIn()) return null;
  const d = date || new Date().toISOString().split('T')[0];
  try {
    const res = await fetch(`${BASE}/log?date=${d}`, { headers: authHeaders() });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function deleteLogEntry(id: string): Promise<boolean> {
  if (!auth.isLoggedIn()) return false;
  try {
    const res = await fetch(`${BASE}/log/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getLogHistory(days = 30) {
  if (!auth.isLoggedIn()) return [];
  try {
    const res = await fetch(`${BASE}/log/history?days=${days}`, { headers: authHeaders() });
    if (!res.ok) return [];
    const data = await res.json();
    return data.history || [];
  } catch {
    return [];
  }
}

// â”€â”€â”€ Profile â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function getProfile() {
  if (!auth.isLoggedIn()) return null;
  try {
    const res = await fetch(`${BASE}/profile`, { headers: authHeaders() });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function updateProfile(data: Record<string, unknown>) {
  if (!auth.isLoggedIn()) return null;
  try {
    const res = await fetch(`${BASE}/profile`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// â”€â”€â”€ Streak â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function getStreak(): Promise<{ streak: number; longestStreak: number; lastLogDate?: string }> {
  if (!auth.isLoggedIn()) return { streak: 0, longestStreak: 0 };
  try {
    const res = await fetch(`${BASE}/streak`, { headers: authHeaders() });
    if (!res.ok) return { streak: 0, longestStreak: 0 };
    return res.json();
  } catch {
    return { streak: 0, longestStreak: 0 };
  }
}
