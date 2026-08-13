// strategyTrackerStorage.js
// Pure localStorage data layer for the Strategy Tracker feature.
// No Supabase / network calls — everything lives in this browser only.

const PAIRS_KEY = "mgi_strategy_tracker_pairs";
const ENTRIES_KEY = "mgi_strategy_tracker_entries";

const DEFAULT_PAIRS = ["XAUUSD", "BTCUSD", "EURUSD"];

// ---------- Pairs (watchlist) ----------

export function getPairs() {
  try {
    const raw = localStorage.getItem(PAIRS_KEY);
    if (!raw) {
      localStorage.setItem(PAIRS_KEY, JSON.stringify(DEFAULT_PAIRS));
      return [...DEFAULT_PAIRS];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_PAIRS;
  } catch {
    return [...DEFAULT_PAIRS];
  }
}

export function addPair(pair) {
  const clean = pair.trim().toUpperCase();
  if (!clean) return getPairs();
  const pairs = getPairs();
  if (!pairs.includes(clean)) {
    pairs.push(clean);
    localStorage.setItem(PAIRS_KEY, JSON.stringify(pairs));
  }
  return pairs;
}

export function removePair(pair) {
  const pairs = getPairs().filter((p) => p !== pair);
  localStorage.setItem(PAIRS_KEY, JSON.stringify(pairs));
  return pairs;
}

// ---------- Entries (daily checklist logs) ----------

export function getEntries() {
  try {
    const raw = localStorage.getItem(ENTRIES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveEntries(entries) {
  try {
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
    return { success: true };
  } catch (err) {
    // Most likely QuotaExceededError from a large screenshot payload.
    return {
      success: false,
      error:
        err && err.name === "QuotaExceededError"
          ? "Local storage is full. Try removing the screenshot from this entry, or delete some older entries."
          : "Failed to save. " + (err?.message || ""),
    };
  }
}

export function addEntry(entry) {
  const entries = getEntries();
  const withId = {
    ...entry,
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    createdAt: new Date().toISOString(),
    weekLabel: getWeekLabel(entry.date),
  };
  const updated = [withId, ...entries];
  const result = saveEntries(updated);
  return result.success ? { success: true, entry: withId } : result;
}

export function updateEntry(id, changes) {
  const entries = getEntries();
  const idx = entries.findIndex((e) => e.id === id);
  if (idx === -1) return { success: false, error: "Entry not found." };
  const updatedEntry = {
    ...entries[idx],
    ...changes,
    weekLabel: getWeekLabel(changes.date || entries[idx].date),
  };
  const updated = [...entries];
  updated[idx] = updatedEntry;
  const result = saveEntries(updated);
  return result.success ? { success: true, entry: updatedEntry } : result;
}

export function deleteEntry(id) {
  const entries = getEntries().filter((e) => e.id !== id);
  const result = saveEntries(entries);
  return result;
}

// ---------- Helpers ----------

// ISO-ish week label, e.g. "2026-W33" — used to group entries for the weekly rollup.
export function getWeekLabel(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return "unknown";
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7; // Monday = 0
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const diff = target - firstThursday;
  const week = 1 + Math.round(diff / (7 * 24 * 60 * 60 * 1000));
  return `${target.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// Resize + compress an image file client-side before it goes into localStorage.
// Keeps entries small enough that a season of screenshots won't blow the quota.
export function compressImage(file, maxWidth = 900, quality = 0.6) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not load image."));
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// Rough estimate of how full localStorage is (not exact, but good enough for a warning).
export function getStorageUsageEstimate() {
  try {
    let total = 0;
    for (const key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        total += (localStorage[key]?.length || 0) * 2; // UTF-16 ~2 bytes/char
      }
    }
    const mb = total / (1024 * 1024);
    return { bytes: total, mb: Number(mb.toFixed(2)) };
  } catch {
    return { bytes: 0, mb: 0 };
  }
}

// ---------- Auto-updating stats ----------

const CHECKLIST_KEYS = ["weeklyBias", "dailySweep", "fvgTap", "fourHTrend"];

export function isFullyAligned(entry) {
  // "Aligned" means every checklist factor pointed the same direction as the trade taken,
  // not just that a value was filled in. Neutral/Mixed/No-sweep readings never count as aligned.
  if (entry.dailySweep === "No Sweep" || entry.dailySweep === "Both Swept (Chop)") return false;
  const wantsBuy = entry.dailySweep === "PDL Swept (Buy Bias)";
  const wantsSell = entry.dailySweep === "PDH Swept (Sell Bias)";
  if (!wantsBuy && !wantsSell) return false;

  const biasOk = wantsBuy ? entry.weeklyBias === "Bullish" : entry.weeklyBias === "Bearish";
  const trendOk = wantsBuy ? entry.fourHTrend === "Bullish" : entry.fourHTrend === "Bearish";
  const fvgOk = entry.fvgTap === "Yes";

  return biasOk && trendOk && fvgOk;
}

export function computeStats(entries) {
  const graded = entries.filter((e) => e.outcome === "Win" || e.outcome === "Loss");
  const wins = graded.filter((e) => e.outcome === "Win").length;
  const losses = graded.filter((e) => e.outcome === "Loss").length;
  const winRate = graded.length > 0 ? (wins / graded.length) * 100 : null;

  const aligned = graded.filter(isFullyAligned);
  const alignedWins = aligned.filter((e) => e.outcome === "Win").length;
  const alignedWinRate = aligned.length > 0 ? (alignedWins / aligned.length) * 100 : null;

  const partial = graded.filter((e) => !isFullyAligned(e));
  const partialWins = partial.filter((e) => e.outcome === "Win").length;
  const partialWinRate = partial.length > 0 ? (partialWins / partial.length) * 100 : null;

  const byPairMap = {};
  graded.forEach((e) => {
    if (!byPairMap[e.pair]) byPairMap[e.pair] = { wins: 0, losses: 0 };
    if (e.outcome === "Win") byPairMap[e.pair].wins += 1;
    else byPairMap[e.pair].losses += 1;
  });
  const byPair = Object.entries(byPairMap)
    .map(([pair, v]) => ({
      pair,
      wins: v.wins,
      losses: v.losses,
      total: v.wins + v.losses,
      winRate: ((v.wins / (v.wins + v.losses)) * 100).toFixed(0),
    }))
    .sort((a, b) => b.total - a.total);

  const skipped = entries.filter((e) => e.outcome === "Skipped").length;
  const pending = entries.filter((e) => e.outcome === "Pending").length;

  return {
    totalGraded: graded.length,
    wins,
    losses,
    winRate,
    aligned: aligned.length,
    alignedWinRate,
    partial: partial.length,
    partialWinRate,
    byPair,
    skipped,
    pending,
  };
}
