// MgiStrategyTable.jsx (Updated for Chart Keys)
import React, { useState } from "react";
import { Pencil, Trash2, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import ImageGalleryModal from "./ImageGalleryModal";
import ImagePreviewOnHover from "./ImagePreviewOnHover"; 

// --- UPDATED: CHART_FIELDS DEFINITION ---
const CHART_FIELDS = [
  { key: "daily_chart", label: "Daily" },
  { key: "two_hr_chart", label: "2hr Chart" },
  { key: "one_hr_chart", label: "1hr Chart" },
  { key: "fifteen_min_chart", label: "15min Chart" },
  { key: "mt5_chart", label: "MT5 Chart" },
  { key: "profit_chart", label: "Profit Chart" },
  { key: "pnl_chart", label: "PnL Chart" }, 
];
// ------------------------------------------

function MgiStrategyTable({ ideas = [], onEdit, onDelete }) {
  // New state for image gallery modal
  const [galleryState, setGalleryState] = useState({
    isOpen: false,
    images: [],
    initialIndex: 0,
  });

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    // Use MM/DD/YY for a single-line date (changed to match standard US month/day order for clarity)
    return date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "2-digit" });
  };

  const getSignalIcon = (signal) => {
    if (!signal) return null;
    return signal.toLowerCase() === "buy" ? <TrendingUp className="w-5 h-5 text-green-600" /> : <TrendingDown className="w-5 h-5 text-red-600" />;
  };

  // --- UPDATED: Use CHART_FIELDS for image mapping ---
  const handleImageClick = (item, clickedKey) => {
    const imagesList = CHART_FIELDS
      .map(({ key, label }) => ({
        day: label, // Using the label (e.g., "Daily", "PnL Chart") for display in the gallery
        url: item[key], // Accessing the image URL using the new key
      }))
      .filter((img) => img.url); // Filter to include only charts with images

    const initialIndex = imagesList.findIndex(img => img.url === item[clickedKey]);

    setGalleryState({
      isOpen: true,
      images: imagesList,
      initialIndex: initialIndex > -1 ? initialIndex : 0,
    });
  };

  const renderImageCell = (src, alt, dayKey, item) => {
    if (!src) return <span className="text-gray-400 text-xl">–</span>;
    
    // Use the new ImagePreviewOnHover component
    return (
        <ImagePreviewOnHover
            src={src}
            alt={alt}
            onImageClick={() => handleImageClick(item, dayKey)}
        />
    );
  };
  
  const closeModal = () => {
    setGalleryState({ isOpen: false, images: [], initialIndex: 0 });
  };


  return (
    <div className="w-full">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-2xl shadow-lg border border-gray-100">
        <table className="min-w-full bg-white">
          <thead>
            {/* --- UPDATED: Column Headers using CHART_FIELDS --- */}
            <tr className="bg-gray-100 text-gray-700 border-b border-gray-200">
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider w-[100px] whitespace-nowrap">Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap">Pair</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider w-[100px] whitespace-nowrap">Signal</th>
              {CHART_FIELDS.map(({ key, label }) => (
                // Display the label, shortening it if necessary for column width
                <th key={key} className="px-1 py-3 text-center text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap">
                    {/* Shortening labels for compact column display */}
                    {label.replace(' Chart', '').replace('15min', '15m').replace('2hr', '2H').replace('1hr', '1H').replace('Profit', 'PFIT')}
                </th>
              ))}
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider w-[80px] whitespace-nowrap">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {ideas.length === 0 ? (
              <tr>
                {/* Updated colspan to 3 (standard cols) + 7 (chart cols) + 1 (actions) = 11 */}
                <td colSpan={11} className="text-center py-12 text-gray-500 italic">No trader ideas yet. Start adding your ideas!</td>
              </tr>
            ) : (
              ideas.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-all duration-200">
                  <td className="px-3 py-3 text-gray-700 text-sm whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {formatDate(item.date)} 
                    </div>
                  </td>

                  <td className="px-4 py-3 font-medium text-gray-900 text-sm">{item.pair}</td>

                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap ${(item.signal || "").toLowerCase() === "buy" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {getSignalIcon(item.signal)}
                      {item.signal?.toUpperCase()}
                    </span>
                  </td>

                  {/* --- UPDATED: Cell Rendering using CHART_FIELDS --- */}
                  {CHART_FIELDS.map(({ key, label }) => (
                    <td key={key} className="px-1 py-3 text-center">
                      {renderImageCell(item[key], label, key, item)} {/* Note: item[key] uses the new key, label used for alt text */}
                    </td>
                  ))}

                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-1">
                      <button 
                        onClick={() => onEdit(item)} 
                        className="p-2 text-amber-600 hover:bg-amber-100 rounded-full transition"
                        title="Edit Idea"
                      >
                        <Pencil size={18} />
                      </button>

                      <button 
                        onClick={() => onDelete(item)} 
                        className="p-2 text-red-600 hover:bg-red-100 rounded-full transition"
                        title="Delete Idea"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View (Updated for Chart Fields) */}
      <div className="block md:hidden space-y-4">
        {ideas.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl text-gray-500 italic">No trader ideas yet. Start adding your ideas!</div>
        ) : (
          ideas.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-start mb-3 border-b pb-3">
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1 font-medium">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    {formatDate(item.date)}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{item.pair}</h3>
                </div>

                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${(item.signal || "").toLowerCase() === "buy" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {getSignalIcon(item.signal)}
                  {item.signal?.toUpperCase()}
                </span>
              </div>

              {/* Updated grid layout to accommodate 7 fields on mobile */}
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3 my-4">
                {CHART_FIELDS.map(({ key, label }) => (
                  <div key={key} className="text-center">
                    <p className="text-xs text-gray-500 font-medium mb-1">{label.replace(' Chart', '').replace(' Profit', ' PnL').slice(0, 4)}</p>
                    {item[key] ? (
                        <ImagePreviewOnHover
                            src={item[key]}
                            alt={label}
                            onImageClick={() => handleImageClick(item, key)}
                        />
                    ) : (
                      <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg h-16 w-16 mx-auto flex items-center justify-center">
                        <span className="text-gray-400 text-xl">–</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 mt-3 pt-3 border-t">
                <button 
                    onClick={() => onEdit(item)} 
                    className="p-3 text-amber-600 hover:bg-amber-100 rounded-xl transition shadow"
                    title="Edit Idea"
                >
                  <Pencil size={20} />
                </button>
                <button 
                    onClick={() => onDelete(item)} 
                    className="p-3 text-red-600 hover:bg-red-100 rounded-xl transition shadow"
                    title="Delete Idea"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Image Gallery Modal Render */}
      {galleryState.isOpen && (
        <ImageGalleryModal
          images={galleryState.images}
          initialIndex={galleryState.initialIndex}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

export default MgiStrategyTable;
