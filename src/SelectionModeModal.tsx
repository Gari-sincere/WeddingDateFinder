import { useState } from "react";

type SelectionMode = "unavailable" | "available";

interface SelectionModeModalProps {
  onSubmit: (mode: SelectionMode) => void;
  onClose: () => void;
  onBack?: () => void;
}

export function SelectionModeModal({ onSubmit, onClose, onBack }: SelectionModeModalProps) {
  const [selectedMode, setSelectedMode] = useState<SelectionMode | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMode) {
      onSubmit(selectedMode);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-lg w-full mx-4">
        <h2 className="text-2xl font-bold text-purple-800 mb-6 text-center">
          How would you like to select dates?
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-8">
            <button
              type="button"
              onClick={() => setSelectedMode("unavailable")}
              className={`w-full p-6 rounded-lg border-2 text-left transition-all ${
                selectedMode === "unavailable"
                  ? "border-red-400 bg-red-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    ❌ Select dates that DON'T work
                  </h3>
                  <p className="text-gray-600">
                    Choose the dates when you are NOT available
                  </p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 ${
                  selectedMode === "unavailable"
                    ? "border-red-400 bg-red-400"
                    : "border-gray-300"
                }`}>
                  {selectedMode === "unavailable" && (
                    <div className="w-full h-full rounded-full bg-red-400 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMode("available")}
              className={`w-full p-6 rounded-lg border-2 text-left transition-all ${
                selectedMode === "available"
                  ? "border-green-400 bg-green-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    ✅ Select dates that DO work
                  </h3>
                  <p className="text-gray-600">
                    Choose the dates when you ARE available
                  </p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 ${
                  selectedMode === "available"
                    ? "border-green-400 bg-green-400"
                    : "border-gray-300"
                }`}>
                  {selectedMode === "available" && (
                    <div className="w-full h-full rounded-full bg-green-400 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            </button>
          </div>
          
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onBack || onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={!selectedMode}
              className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Next
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
