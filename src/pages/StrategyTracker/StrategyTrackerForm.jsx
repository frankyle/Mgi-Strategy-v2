// StrategyTrackerForm.jsx
import React, { useState } from "react";
import { Upload, X, Save } from "lucide-react";
import toast from "react-hot-toast";
import { addEntry, compressImage, todayStr } from "./strategyTrackerStorage";

const WEEKLY_BIAS = ["Bullish", "Bearish", "Neutral"];
const DAILY_SWEEP = [
  "PDL Swept (Buy Bias)",
  "PDH Swept (Sell Bias)",
  "Both Swept (Chop)",
  "No Sweep",
];
const FOUR_H_TREND = ["Bullish", "Bearish", "Mixed"];
const OUTCOMES = ["Pending", "Win", "Loss", "Skipped"];

const initialForm = {
  pair: "",
  date: todayStr(),
  weeklyBias: "Neutral",
  dailySweep: "No Sweep",
  fvgTap: "No",
  fourHTrend: "Mixed",
  outcome: "Pending",
  notes: "",
  screenshot: null,
};

function SegButton({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
            value === opt
              ? "bg-indigo-600 text-white border-indigo-600"
              : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function StrategyTrackerForm({ pairs, onSaved }) {
  const [form, setForm] = useState(initialForm);
  const [imgPreview, setImgPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      set("screenshot", compressed);
      setImgPreview(compressed);
    } catch (err) {
      toast.error("Couldn't process that image.");
    }
  };

  const removeImage = () => {
    set("screenshot", null);
    setImgPreview(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.pair) {
      toast.error("Pick a pair first.");
      return;
    }
    setSaving(true);
    const result = addEntry(form);
    setSaving(false);
    if (!result.success) {
      toast.error(result.error || "Failed to save entry.");
      return;
    }
    toast.success(`Logged ${form.pair} for ${form.date}`);
    setForm({ ...initialForm, date: form.date }); // keep the date, reset the rest
    setImgPreview(null);
    onSaved && onSaved();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6 space-y-5"
    >
      <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
        📋 Log Today's Setup
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Pair
          </label>
          <select
            value={form.pair}
            onChange={(e) => set("pair", e.target.value)}
            className="mt-1 w-full border border-gray-300 rounded-xl p-2.5 text-sm font-medium bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select a pair…</option>
            {pairs.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Date
          </label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => set("date", e.target.value)}
            className="mt-1 w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Weekly Bias (locked, prior week close vs open)
        </label>
        <div className="mt-1.5">
          <SegButton options={WEEKLY_BIAS} value={form.weeklyBias} onChange={(v) => set("weeklyBias", v)} />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Daily Sweep
        </label>
        <div className="mt-1.5">
          <SegButton options={DAILY_SWEEP} value={form.dailySweep} onChange={(v) => set("dailySweep", v)} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            15m FVG Tap + Confirmation
          </label>
          <div className="mt-1.5">
            <SegButton options={["Yes", "No"]} value={form.fvgTap} onChange={(v) => set("fvgTap", v)} />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            4H Trend
          </label>
          <div className="mt-1.5">
            <SegButton options={FOUR_H_TREND} value={form.fourHTrend} onChange={(v) => set("fourHTrend", v)} />
          </div>
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Outcome
        </label>
        <div className="mt-1.5">
          <SegButton options={OUTCOMES} value={form.outcome} onChange={(v) => set("outcome", v)} />
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Leave as "Pending" until the trade resolves, or mark "Skipped" if you passed on it —
          skipped setups still count toward what you're learning.
        </p>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Notes
        </label>
        <textarea
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          rows={3}
          placeholder="What you saw, what you did (or didn't do), and why."
          className="mt-1 w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Screenshot
        </label>
        {!imgPreview ? (
          <label className="mt-1 flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/40 transition-colors">
            <Upload size={20} className="text-gray-400" />
            <span className="text-sm text-gray-500">Tap to upload a chart screenshot</span>
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
        ) : (
          <div className="mt-1 relative inline-block">
            <img
              src={imgPreview}
              alt="Chart screenshot preview"
              className="rounded-xl max-h-48 border border-gray-200"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
      >
        <Save size={18} />
        {saving ? "Saving…" : "Save Entry"}
      </button>
    </form>
  );
}

export default StrategyTrackerForm;
