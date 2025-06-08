import React from "react";

interface Guest {
  firstName: string;
  lastName: string;
}

interface GuestListModalProps {
  date: string;
  guests: Guest[];
  onClose: () => void;
}

export function GuestListModal({ date, guests, onClose }: GuestListModalProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
        <h2 className="text-2xl font-bold text-red-800 mb-4">
          Unavailable Guests
        </h2>
        <p className="text-gray-600 mb-6">
          <strong>{formatDate(date)}</strong>
        </p>
        
        <div className="space-y-2 mb-6">
          {guests.map((guest, index) => (
            <div key={index} className="flex items-center p-3 bg-red-50 rounded-lg">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
              <span className="text-gray-800">
                {guest.firstName} {guest.lastName}
              </span>
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
