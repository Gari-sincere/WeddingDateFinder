import React from "react";

interface Guest {
  firstName: string;
  lastName: string;
  selectionMode: "unavailable" | "available";
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

  // Group guests by name to handle duplicates
  const guestMap = new Map<string, Guest[]>();
  
  for (const guest of guests) {
    const key = `${guest.firstName}-${guest.lastName}`;
    if (!guestMap.has(key)) {
      guestMap.set(key, []);
    }
    guestMap.get(key)!.push(guest);
  }

  // Process each unique guest to determine their actual status for this date
  const processedGuests: Array<{ firstName: string; lastName: string; status: "available" | "unavailable" }> = [];

  for (const [guestKey, guestEntries] of guestMap.entries()) {
    const [firstName, lastName] = guestKey.split('-');
    
    // Check if this guest has any entries for this date
    if (guestEntries.length === 0) continue;

    // Get the guest's selection mode (should be consistent across all entries)
    const selectionMode = guestEntries[0].selectionMode;
    
    if (selectionMode === "unavailable") {
      // If they used "unavailable" mode and have an entry for this date, they're unavailable
      processedGuests.push({ firstName, lastName, status: "unavailable" });
    } else {
      // If they used "available" mode:
      // We need to check if they explicitly selected this date or if it's inferred
      // If there are multiple entries for the same guest on the same date, 
      // one is explicit (they selected it) and one is inferred (for tracking)
      // But actually, let's look at the backend logic more carefully...
      
      // From the backend: for "available" mode guests, we add them to the guests array twice:
      // 1. Once as "unavailable" for dates they DIDN'T select (inferred unavailability)
      // 2. Once as "available" for dates they DID select (explicit availability)
      
      // So if we see this guest in the modal, we need to determine which case this is
      // The backend adds guests with selectionMode "available" to dates they explicitly selected
      // And the count only includes people who can't make it (unavailable)
      
      // Since this guest appears in the modal with selectionMode "available",
      // it means they explicitly selected this date as available
      processedGuests.push({ firstName, lastName, status: "available" });
    }
  }

  // Sort guests by status (unavailable first) then by name
  processedGuests.sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === "unavailable" ? -1 : 1;
    }
    const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
    const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
    return nameA.localeCompare(nameB);
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
        <h2 className="text-2xl font-bold text-blue-800 mb-4">
          Guest Responses
        </h2>
        <p className="text-gray-600 mb-6">
          <strong>{formatDate(date)}</strong>
        </p>
        
        {processedGuests.length === 0 ? (
          <p className="text-gray-500 italic mb-6">No responses for this date yet.</p>
        ) : (
          <div className="space-y-2 mb-6">
            {processedGuests.map((guest, index) => (
              <div key={index} className={`flex items-center p-3 rounded-lg ${
                guest.status === "unavailable" 
                  ? "bg-red-50 border border-red-200" 
                  : "bg-green-50 border border-green-200"
              }`}>
                <div className={`w-2 h-2 rounded-full mr-3 ${
                  guest.status === "unavailable" ? "bg-red-500" : "bg-green-500"
                }`}></div>
                <div className="flex-1">
                  <span className="text-gray-800">
                    {guest.firstName} {guest.lastName}
                  </span>
                  <span className={`ml-2 text-xs font-medium px-2 py-1 rounded ${
                    guest.status === "unavailable" 
                      ? "bg-red-100 text-red-700" 
                      : "bg-green-100 text-green-700"
                  }`}>
                    {guest.status === "unavailable" ? "Not Available" : "Available"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        
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
