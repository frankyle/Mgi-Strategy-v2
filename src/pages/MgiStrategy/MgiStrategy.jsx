import React, { useEffect, useState } from "react";
import {
  getMgiStrategies, // Renamed service function
  addMgiStrategy,    // Renamed service function
  updateMgiStrategy, // Renamed service function
  deleteMgiStrategyById, // Renamed service function
} from "./MgiStrategyService";

// Assuming you named your modal and table components correctly
import MgiStrategyModal from "./MgiStrategyModal"; 
import MgiStrategyTable from "./MgiStrategyTable"; 
import toast, { Toaster } from "react-hot-toast";

function MgiStrategy() { // Component name remains MgiStrategy
  const [ideas, setIdeas] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editIdea, setEditIdea] = useState(null);

  // Load ideas on mount
  useEffect(() => {
    loadIdeas();
  }, []);

  const loadIdeas = async () => {
    // --- UPDATED: Use new service function name ---
    const response = await getMgiStrategies(); 

    if (!response.success) {
      toast.error(`Failed to load strategies: ${response.error.message}`); // Updated message
      return;
    }

    setIdeas(response.data || []);
  };

  // ADD NEW IDEA
  const handleAdd = async (idea) => {
    // --- UPDATED: Use new service function name ---
    const response = await addMgiStrategy(idea); 

    if (!response.success) {
      toast.error(`Failed to add strategy: ${response.error.message}`); // Updated message
      return;
    }

    toast.success("Strategy added successfully!"); // Updated message
    setModalOpen(false);
    loadIdeas();
  };

  // UPDATE EXISTING IDEA
  const handleUpdate = async (idea) => {
    // --- UPDATED: Use new service function name ---
    // Pass the existing idea to the service for proper image deletion logic
    const response = await updateMgiStrategy(editIdea.id, idea, editIdea); 

    if (!response.success) {
      toast.error(`Failed to update strategy: ${response.error.message}`); // Updated message
      return;
    }

    toast.success("Strategy updated successfully!"); // Updated message
    setEditIdea(null);
    setModalOpen(false);
    loadIdeas();
  };

  // DELETE IDEA
  const handleDelete = async (idea) => {
    // --- UPDATED: Use new service function name ---
    // Pass the whole idea object to the service to help with image path deletion
    const response = await deleteMgiStrategyById(idea); 

    if (!response.success) {
      toast.error(`Failed to delete strategy: ${response.error.message}`); // Updated message
      return;
    }

    toast.success("Strategy deleted successfully!"); // Updated message
    loadIdeas();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-fadeIn">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex justify-between items-center">
        {/* --- UPDATED: Header Text --- */}
        <h1 className="text-2xl font-bold text-gray-800">
          MGI Trading Strategies
        </h1>

        <button
          onClick={() => {
            setEditIdea(null);
            setModalOpen(true);
          }}
          // --- UPDATED: Button Text ---
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl shadow-md transition"
        >
          + Add New Strategy
        </button>
      </div>

      {/* Table */}
        <MgiStrategyTable
          ideas={ideas}
          onEdit={(idea) => {
            setEditIdea(idea);
            setModalOpen(true);
          }}
          onDelete={handleDelete}
        />
      

      {/* Modal */}
      {modalOpen && (
        <MgiStrategyModal
          initialData={editIdea}
          onSave={editIdea ? handleUpdate : handleAdd}
          onClose={() => {
            setModalOpen(false);
            setEditIdea(null);
          }}
        />
      )}
    </div>
  );
}

export default MgiStrategy;