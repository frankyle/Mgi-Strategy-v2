// MgiStrategyModal.jsx (Revised for Mobile Responsiveness)
import MgiStrategyForm from "./MgiStrategyForm";
import { X } from 'lucide-react'; // Import the 'X' icon for a modern close button

function MgiStrategyModal({ initialData, onSave, onClose }) {
  return (
    // REVISION 1: Full-screen background with improved backdrop, starts at the top of the screen
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-0 sm:p-4 overflow-y-auto animate-fadeIn">
      
      {/* REVISION 2: Modal Container Changes: 
        - w-full max-w-6xl for maximum size
        - h-full sm:h-auto (Full height on mobile, auto height on desktop)
        - mt-0 sm:mt-8 (No top margin on mobile)
        - rounded-none sm:rounded-2xl (Sharp corners on mobile, rounded on desktop)
        - p-4 sm:p-6 (Consistent padding)
      */}
      <div className="bg-white w-full max-w-6xl h-full sm:h-auto sm:max-h-[95vh] mt-0 sm:mt-8 rounded-none sm:rounded-2xl shadow-xl p-4 sm:p-6 animate-scaleIn relative overflow-y-auto">

        {/* REVISION 3: Close Button (Uses Lucide-React 'X' icon for professional look) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 transition-colors z-10 p-2 rounded-full bg-white/70 hover:bg-white border border-gray-200 shadow-md"
          aria-label="Close Modal"
        >
          <X size={20} />
        </button>

        {/* REVISION 4: Removed the redundant Title, as the Form component typically handles a more detailed header */}
        {/* <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          {initialData ? "Edit Idea" : "Add Idea"}
        </h2> */}

        {/* Form */}
        {/* The MgiStrategyForm would contain its own internal header */}
        <MgiStrategyForm
          initialData={initialData}
          onSubmit={onSave}
          onClose={onClose}
        />

      </div>
    </div>
  );
}

export default MgiStrategyModal;