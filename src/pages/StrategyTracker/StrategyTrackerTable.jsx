// StrategyTrackerTable.jsx
import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { deleteEntry, updateEntry, isFullyAligned } from "./strategyTrackerStorage";

const OUTCOME_STYLES = {
  Win: "bg-emerald-100 text-emerald-700",
  Loss: "bg-red-100 text-red-700",
  Skipped: "bg-gray-200 text-gray-600",
  Pending: "bg-amber-100 text-amber-700",
};

function StrategyTrackerTable({ entries, onChange }) {
  const [zoomImg, setZoomImg] = useState(null);

  // Group by ISO week label, most recent week first.
  const groups = {};
  entries.forEach((e) => {
    if (!groups[e.weekLabel]) groups[e.weekLabel] = [];
    groups[e.weekLabel].push(e);
  });
  const weekKeys = Object.keys(groups).sort().reverse();

  const handleOutcomeChange = (id, outcome) => {
    const result = updateEntry(id, { outcome });
    if (!result.success) {
      toast.error(result.error || "Failed to update.");
      return;
    }
    onChange && onChange();
  };

  const handleDelete = (id, pair) => {
    if (!window.confirm(`Delete the logged entry for ${pair}?`)) return;
    const result = deleteEntry(id);
    if (!result.success) {
      toast.error(result.error || "Failed to delete.");
      return;
    }
    toast.success("Entry deleted.");
    onChange && onChange();
  };

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center text-gray-400 text-sm">
        No entries logged yet this week. Use the form to log your first pair.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {weekKeys.map((week) => (
        <div key={week} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200">
            <span className="text-sm font-bold text-gray-700">Week {week}</span>
          </div>
          <div className="divide-y divide-gray-100">
            {groups[week].map((e) => (
              <div key={e.id} className="p-4 flex flex-col sm:flex-row sm:items-start gap-3">
                {e.screenshot && (
                  <img
                    src={e.screenshot}
                    alt={`${e.pair} setup`}
                    onClick={() => setZoomImg(e.screenshot)}
                    className="w-16 h-16 object-cover rounded-lg border border-gray-200 cursor-pointer shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-gray-900">{e.pair}</span>
                    <span className="text-xs text-gray-400">{e.date}</span>
                    {isFullyAligned(e) && (
                      <span className="text-[10px] font-bold uppercase tracking-wide bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                        Fully Aligned
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500">
                    <span>Weekly: {e.weeklyBias}</span>
                    <span>Sweep: {e.dailySweep}</span>
                    <span>FVG: {e.fvgTap}</span>
                    <span>4H: {e.fourHTrend}</span>
                  </div>
                  {e.notes && <p className="mt-1.5 text-sm text-gray-600">{e.notes}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={e.outcome}
                    onChange={(ev) => handleOutcomeChange(e.id, ev.target.value)}
                    className={`text-xs font-bold rounded-full px-2.5 py-1 border-0 cursor-pointer ${OUTCOME_STYLES[e.outcome]}`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Win">Win</option>
                    <option value="Loss">Loss</option>
                    <option value="Skipped">Skipped</option>
                  </select>
                  <button
                    onClick={() => handleDelete(e.id, e.pair)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                    aria-label="Delete entry"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {zoomImg && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setZoomImg(null)}
        >
          <img src={zoomImg} alt="Zoomed setup" className="max-h-[85vh] max-w-full rounded-xl" />
        </div>
      )}
    </div>
  );
}

export default StrategyTrackerTable;
