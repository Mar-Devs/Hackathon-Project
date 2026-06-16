// ─────────────────────────────────────────────────────────────────────────────
// Persistence layer — save/resume (AC-02) and longitudinal tracking (G5/US-05).
//
// Primary store is the browser's localStorage, so save/resume and history work
// the moment the app loads, with zero setup. If Supabase credentials are
// provided (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY), the same interface can
// be backed by Postgres instead — see supabase/schema.sql and README. The app
// is fully operational on localStorage alone; Supabase is an optional upgrade
// for multi-device and team use.
// ─────────────────────────────────────────────────────────────────────────────

const DRAFT_KEY = 'carb.draft.v1';
const HISTORY_KEY = 'carb.history.v1';

const hasLS = (() => {
  try {
    const k = '__carb_test__';
    window.localStorage.setItem(k, '1');
    window.localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
})();

// In-memory fallback if localStorage is unavailable (private mode, etc.)
const mem = new Map();
const get = (k) => (hasLS ? window.localStorage.getItem(k) : mem.get(k) ?? null);
const set = (k, v) => (hasLS ? window.localStorage.setItem(k, v) : mem.set(k, v));
const del = (k) => (hasLS ? window.localStorage.removeItem(k) : mem.delete(k));

// ── Draft (in-progress assessment) ──────────────────────────────────────────
export function saveDraft(draft) {
  try {
    set(DRAFT_KEY, JSON.stringify({ ...draft, savedAt: new Date().toISOString() }));
    return true;
  } catch {
    return false;
  }
}

export function loadDraft() {
  try {
    const raw = get(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearDraft() {
  del(DRAFT_KEY);
}

// ── Completed assessments (longitudinal history) ────────────────────────────
export function saveAssessment(record) {
  try {
    const all = listAssessments();
    const entry = {
      id: record.id || `carb_${Date.now()}`,
      communityName: record.context?.communityName || 'Untitled community',
      overall: record.overall,
      tier: record.overallTier?.name,
      generatedAt: record.generatedAt || new Date().toISOString(),
      sectors: record.sectors?.map((s) => ({ id: s.id, name: s.name, score: s.score })) || [],
    };
    all.unshift(entry);
    set(HISTORY_KEY, JSON.stringify(all.slice(0, 50)));
    return entry;
  } catch {
    return null;
  }
}

export function listAssessments() {
  try {
    const raw = get(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Prior assessments for the same community name, oldest → newest, for trend.
export function historyFor(communityName) {
  return listAssessments()
    .filter((a) => a.communityName === communityName)
    .sort((a, b) => new Date(a.generatedAt) - new Date(b.generatedAt));
}

export function clearHistory() {
  del(HISTORY_KEY);
}
