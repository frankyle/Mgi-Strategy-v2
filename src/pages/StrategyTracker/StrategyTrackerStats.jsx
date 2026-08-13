// StrategyTrackerStats.jsx
import React from "react";
import { TrendingUp, Target, Layers } from "lucide-react";
import { computeStats } from "./strategyTrackerStorage";

function StatBlock({ label, value, sub, accent }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-center">
      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-extrabold mt-1 ${accent || "text-gray-800"}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function StrategyTrackerStats({ entries }) {
  const stats = computeStats(entries);

  const fmtPct = (n) => (n === null ? "—" : `${n.toFixed(0)}%`);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6 space-y-5">
      <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
        <TrendingUp className="text-indigo-600" size={22} />
        <h3 className="text-lg font-bold text-gray-900">Auto-Updating Stats</h3>
      </div>

      {stats.totalGraded === 0 ? (
        <p className="text-sm text-gray-400 italic">
          No graded trades yet. Log a setup and mark it Win or Loss once it resolves — this panel
          fills in automatically as you go.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatBlock
              label="Overall Win Rate"
              value={fmtPct(stats.winRate)}
              sub={`${stats.wins}W / ${stats.losses}L`}
            />
            <StatBlock
              label="Fully Aligned"
              value={fmtPct(stats.alignedWinRate)}
              sub={`${stats.aligned} graded trades`}
              accent="text-emerald-600"
            />
            <StatBlock
              label="Partial Match"
              value={fmtPct(stats.partialWinRate)}
              sub={`${stats.partial} graded trades`}
              accent="text-amber-600"
            />
            <StatBlock label="Skipped" value={stats.skipped} sub={`${stats.pending} pending`} />
          </div>

          {stats.alignedWinRate !== null && stats.partialWinRate !== null && (
            <div
              className={`flex items-start gap-2 rounded-xl p-3 text-sm border ${
                stats.alignedWinRate >= stats.partialWinRate
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-amber-50 border-amber-200 text-amber-700"
              }`}
            >
              <Target size={18} className="shrink-0 mt-0.5" />
              <span>
                {stats.alignedWinRate >= stats.partialWinRate
                  ? "Fully aligned setups are outperforming partial ones — the checklist is doing its job. Keep requiring all four factors."
                  : "Partial setups are currently winning as much or more than fully aligned ones. Worth watching — either the checklist needs revisiting, or you don't have enough graded trades yet to trust this."}
              </span>
            </div>
          )}

          {stats.byPair.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Layers size={16} className="text-gray-400" />
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  By Pair
                </p>
              </div>
              <div className="space-y-1.5">
                {stats.byPair.map((p) => (
                  <div
                    key={p.pair}
                    className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 border border-gray-100"
                  >
                    <span className="text-sm font-semibold text-gray-700">{p.pair}</span>
                    <span className="text-sm text-gray-500">
                      {p.wins}W / {p.losses}L —{" "}
                      <span className="font-bold text-gray-800">{p.winRate}%</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default StrategyTrackerStats;
