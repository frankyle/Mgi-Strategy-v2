// StrategyTracker.jsx
import React, { useEffect, useState } from "react";
import { Plus, X, HardDrive } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import {
  getPairs,
  addPair,
  removePair,
  getEntries,
  getStorageUsageEstimate,
} from "./strategyTrackerStorage";
import StrategyTrackerForm from "./StrategyTrackerForm";
import StrategyTrackerTable from "./StrategyTrackerTable";
import StrategyTrackerStats from "./StrategyTrackerStats";

function StrategyTracker() {
  const [pairs, setPairs] = useState([]);
  const [entries, setEntries] = useState([]);
  const [newPair, setNewPair] = useState("");
  const [usage, setUsage] = useState({ mb: 0 });

  const refresh = () => {
    setPairs(getPairs());
    setEntries(getEntries());
    setUsage(getStorageUsageEstimate());
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleAddPair = (e) => {
    e.preventDefault();
    if (!newPair.trim()) return;
    const updated = addPair(newPair);
    setPairs(updated);
    setNewPair("");
  };

  const handleRemovePair = (pair) => {
    if (!window.confirm(`Remove ${pair} from your watchlist? Existing logged entries stay intact.`))
      return;
    setPairs(removePair(pair));
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      <Toaster position="top-right" />

      <div>
        <h1 className="text-2xl font-bold text-gray-900">📊 Strategy Tracker</h1>
        <p className="text-sm text-gray-500 mt-1">
          Log the confluence checklist for each pair, week over week. Everything here is stored
          locally in this browser only.
        </p>
        {usage.mb > 4 && (
          <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
            <HardDrive size={12} />
            Local storage is at ~{usage.mb} MB — consider trimming old entries if you hit issues
            saving.
          </div>
        )}
      </div>

      {/* Pair Watchlist */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">
          Pairs You're Watching This Week
        </h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {pairs.map((p) => (
            <span
              key={p}
              className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-sm font-semibold px-3 py-1.5 rounded-full"
            >
              {p}
              <button onClick={() => handleRemovePair(p)} aria-label={`Remove ${p}`}>
                <X size={13} className="text-indigo-400 hover:text-indigo-700" />
              </button>
            </span>
          ))}
        </div>
        <form onSubmit={handleAddPair} className="flex gap-2">
          <input
            type="text"
            value={newPair}
            onChange={(e) => setNewPair(e.target.value)}
            placeholder="Add a pair, e.g. GBPUSD"
            className="flex-1 border border-gray-300 rounded-xl p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            type="submit"
            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-3 py-2 rounded-xl transition-colors"
          >
            <Plus size={16} /> Add
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <StrategyTrackerForm pairs={pairs} onSaved={refresh} />
        <StrategyTrackerStats entries={entries} />
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3">This Week's Log</h2>
        <StrategyTrackerTable entries={entries} onChange={refresh} />
      </div>
    </div>
  );
}

export default StrategyTracker;
