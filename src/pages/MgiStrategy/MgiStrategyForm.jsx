// MgiStrategyForm.jsx
import React, { useState, useEffect } from "react";
import { Upload, X, Calendar, DollarSign, BarChart3 } from 'lucide-react'; 

// --- CHART FIELDS (Kept Unchanged as Requested) ---
const CHART_FIELDS = [
  { 
    key: "daily_chart",
    label: "(1) Daily Chart - Daily Candle Price Action", 
    tooltip: "Daily narrative context using macro ICT model", 
    description: "Higher timeframe narrative" 
  },
  { 
    key: "two_hr_chart",
    label: "(2) Trading Setup (2H Chart - DHDL Movement + ICT Killzone)", 
    tooltip: "Show Higher Timeframe Bias • DHDL Structure • ICT Kill Zone", 
    description: "2H Bias + DHDL movement + Kill Zone" 
  },
  { 
    key: "one_hr_chart",
    label: "(3) MGI Strategy (1H Chart - Unbroken NYC Levels + ICT Concept)", 
    tooltip: "NY Session expectation based on unbroken liquidity levels & ICT Kill Zone", 
    description: "NY Session directional thesis" 
  },
  { 
    key: "fifteen_min_chart",
    label: "(4) Entry Execution (15m Chart Entry - ICT concept + ICT killzone)", 
    tooltip: "Liquidity Grab → Displacement → Entry inside Kill Zone using FVG/OB", 
    description: "15m entry using FVG, OB or BB"
  },
  { 
    key: "mt5_chart",
    label: "(5) MT5 Chart of Daily", // Adjusted label for better clarity
    tooltip: "MT5 chart of Daily", 
    description: "MT5 Daily Chart" // Adjusted description
  },
  { 
    key: "profit_chart",
    label: "(6) Profit Result (1H Chart - DHDL Movement + ICT Killzone)", 
    tooltip: "Show how price reached target objective using DHDL draw & Kill Zone timing", 
    description: "1H draw objective achieved" 
  },
  { 
    key: "pnl_chart",
    label: "(7) PnL Chart (Profit/Loss Screenshot)", 
    tooltip: "Final Profit & Loss statement screenshot", 
    description: "FINAL PnL CHART FIELD" 
  }, 
];
// --- END CHART FIELDS ---


function MgiStrategyForm({ initialData, onSubmit, onClose }) {
  const today = new Date().toISOString().split("T")[0];

  // --- State Logic (Unchanged for Data Consistency) ---
  const initialChartState = CHART_FIELDS.reduce((acc, field) => {
    acc[field.key] = initialData?.[field.key] || null;
    return acc;
  }, {});

  const [form, setForm] = useState({
    date: initialData?.date || today,
    pair: initialData?.pair || "",
    signal: initialData?.signal || "Buy",
    ...initialChartState,
  });

  const [previews, setPreviews] = useState({
    ...initialChartState,
  });

  useEffect(() => {
    if (initialData) {
      const newFormState = {
        date: initialData.date || today,
        pair: initialData.pair || "",
        signal: initialData.signal || "Buy",
      };
      const newPreviewState = {};

      CHART_FIELDS.forEach(({ key }) => {
        newFormState[key] = initialData[key] || null;
        newPreviewState[key] = initialData[key] || null;
      });

      setForm((f) => ({ ...f, ...newFormState }));
      setPreviews(newPreviewState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImage = (e) => {
    const { name, files } = e.target;
    const file = files?.[0] || null;
    
    setForm((prev) => ({ ...prev, [name]: file })); 

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prevState) => ({ ...prevState, [name]: reader.result }));
      };
      reader.readAsDataURL(file);
    } else {
      setPreviews((prevState) => ({ ...prevState, [name]: null }));
    }
  };

  const clearImage = (name) => {
    setPreviews((prevState) => ({ ...prevState, [name]: null }));
    setForm((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = () => {
    if (!form.pair?.trim()) { 
      alert("Please enter a valid currency pair (e.g. XAUUSD).");
      return;
    }
    if (!form.date) {
      alert("Please select a date.");
      return;
    }

    onSubmit(form);
  };
  // --- End State Logic ---

  // --- ImageInput Component with Enhanced Design ---
  const ImageInput = ({ label, name, tooltip, description }) => (
    <div 
        className="flex flex-col items-center gap-2 group p-2 rounded-lg transition-all duration-200 hover:bg-indigo-50/50" 
        title={tooltip}
    > 
      <p className="text-sm font-semibold text-gray-700 text-center leading-tight h-10 flex items-center justify-center">
        {label.replace(/ \(.+\)/, '')} {/* Use simplified label for title space */}
      </p>

      <div className="w-full max-w-[120px] h-[120px] border-2 border-dashed border-gray-300 rounded-xl overflow-hidden flex items-center justify-center bg-white relative shadow-inner transition-all group-hover:border-indigo-500">
        {previews[name] ? (
          <>
            <img 
              src={previews[name]} 
              alt={`${label} Preview`} 
              className="w-full h-full object-cover" 
            />
            {/* Clear Button - Top right for visibility */}
            <button
              type="button"
              onClick={() => clearImage(name)}
              className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-90 hover:opacity-100 transition shadow-lg z-10"
              aria-label={`Clear ${label} image`}
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center text-center text-gray-400 p-2">
            <Upload size={24} className="mb-1 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
            <span className="text-xs font-medium">{description}</span>
          </div>
        )}
      </div>

      <input 
        type="file" 
        accept="image/*" 
        name={name} 
        onChange={handleImage} 
        // Hide default file input button, use custom styling for better look
        className="text-xs w-full mt-1 cursor-pointer 
                   file:mr-4 file:py-1 file:px-2 file:rounded-md 
                   file:border-0 file:text-xs file:font-medium 
                   file:bg-indigo-100 file:text-indigo-700 
                   hover:file:bg-indigo-200" 
      />
    </div>
  );
  // --- End ImageInput Component ---


  return (
    <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl shadow-2xl w-full max-w-6xl mx-auto space-y-8 border border-gray-100">
      
      {/* Header */}
      <h2 className="text-3xl font-extrabold text-gray-900 text-center pb-4 border-b-4 border-indigo-600/10">
        <BarChart3 className="inline-block mr-3 text-indigo-600" size={28} />
        {initialData ? "Edit Trade Journal Entry" : "New Trade Journal Entry"}
      </h2>

      {/* Primary Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Date Input */}
        <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="date" 
              name="date" 
              value={form.date} 
              onChange={handleChange} 
              className="w-full border border-gray-300 rounded-xl p-3 pl-10 bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-sm text-gray-700" 
              aria-label="Trade Date"
            />
        </div>

        {/* Pair Input */}
        <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              name="pair" 
              value={form.pair} 
              onChange={handleChange} 
              placeholder="Pair (e.g. XAUUSD)" 
              className="w-full border border-gray-300 rounded-xl p-3 pl-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-sm" 
              aria-label="Currency Pair"
            />
        </div>

        {/* Signal Select */}
        <div className="relative">
            <select 
              name="signal" 
              value={form.signal} 
              onChange={handleChange} 
              className={`w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white shadow-sm font-semibold transition-colors 
                ${form.signal === 'Buy' ? 'text-green-600 border-green-300' : 'text-red-600 border-red-300'}`}
              aria-label="Trade Signal"
            >
              <option value="Buy">BUY Signal (Long) ↑</option>
              <option value="Sell">SELL Signal (Short) ↓</option>
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                {/* Custom chevron or arrow */}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
        </div>
      </div>

      {/* Chart Image Inputs: Mobile-friendly grid changes at breakpoints */}
      <div className="space-y-6">
        <p className="text-xl font-bold text-gray-800 border-t pt-6">📸 Technical Charts & Execution Steps</p>
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4 justify-center">
          {CHART_FIELDS.map(({ key, label, tooltip, description }) => ( 
            <ImageInput 
              key={key} 
              label={label} 
              name={key}
              tooltip={tooltip} 
              description={description} 
            />
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
        <button 
          onClick={onClose} 
          className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium transition-colors border border-gray-300 w-full sm:w-auto order-2 sm:order-1"
        >
          Cancel
        </button>

        <button 
          onClick={handleSubmit} 
          className="px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-bold transition-colors shadow-md hover:shadow-lg w-full sm:w-auto order-1 sm:order-2"
        >
          Save Idea
        </button>
      </div>
    </div>
  );
}

export default MgiStrategyForm;