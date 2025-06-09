import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { AdminCalendar } from "./AdminCalendar";
import { AvailabilityCalendar } from "./AvailabilityCalendar";
import { Toaster, toast } from "sonner";
import { useState } from "react";

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<"disable" | "availability">("availability");
  const disabledDates = useQuery(api.dates.getDisabledDates) || [];
  const unavailabilityStats = useQuery(api.dates.getUnavailabilityStats) || {};
  const respondedGuests = useQuery(api.dates.getRespondedGuests) || [];
  const toggleDisabledDate = useMutation(api.dates.toggleDisabledDate);

  const handleDateToggle = async (date: string) => {
    try {
      const wasDisabled = await toggleDisabledDate({ date });
      if (wasDisabled) {
        toast.success(`Date ${date} has been disabled for all users`);
      } else {
        toast.success(`Date ${date} has been enabled for all users`);
      }
    } catch (error) {
      toast.error("Failed to update date");
    }
  };

  // Get guest selection mode by checking their responses
  const getGuestSelectionMode = (firstName: string, lastName: string) => {
    // Look for "available" entries first (guests in available mode have both types)
    for (const dateStats of Object.values(unavailabilityStats)) {
      const availableResponse = dateStats.guests.find(
        g => g.firstName === firstName && g.lastName === lastName && g.selectionMode === "available"
      );
      if (availableResponse) {
        return "available";
      }
    }
    return "unavailable"; // Default fallback
  };

  const months = [
    { name: "September 2025", year: 2025, month: 8 },
    { name: "October 2025", year: 2025, month: 9 },
    { name: "November 2025", year: 2025, month: 10 },
    { name: "December 2025", year: 2025, month: 11 },
    { name: "January 2026", year: 2026, month: 0 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-red-800 mb-6">
            🔒 Admin Panel 🔒
          </h1>
          
          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-lg p-2 max-w-md mx-auto mb-8">
            <div className="flex">
              <button
                onClick={() => setActiveTab("availability")}
                className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === "availability"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                📊 Guest Availability
              </button>
              <button
                onClick={() => setActiveTab("disable")}
                className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === "disable"
                    ? "bg-red-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                🚫 Disable Dates
              </button>
            </div>
          </div>

          {/* Tab Content Headers */}
          <div className="bg-white rounded-lg shadow-lg p-8 text-left max-w-4xl mx-auto">
            {activeTab === "availability" ? (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <div>
                  <p className="text-lg font-bold text-blue-800 mb-2">
                    📊 Guest Availability Overview
                  </p>
                  <p className="text-blue-700">
                    View how many guests are unavailable for each date. Red dates show unavailable guests (-X). 
                    Click on red dates to see who can't make it.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                <div>
                  <p className="text-lg font-bold text-red-800 mb-2">
                    🚫 Date Management
                  </p>
                  <p className="text-red-700">
                    Click on weekend dates to disable/enable them for all users. 
                    Disabled dates (shown in red) cannot be selected by guests.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Responses Section - Only show on availability tab */}
          {activeTab === "availability" && (
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto mb-8">
              <h2 className="text-2xl font-bold text-blue-800 mb-4">
                📋 Guest Responses ({respondedGuests.length} responded)
              </h2>
              
              {respondedGuests.length === 0 ? (
                <p className="text-gray-600 italic">No responses yet</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {respondedGuests.map((guest, index) => {
                    const selectionMode = getGuestSelectionMode(guest.firstName, guest.lastName);
                    const isAvailableMode = selectionMode === "available";
                    
                    return (
                      <div 
                        key={index}
                        className={`border rounded-lg p-3 text-left ${
                          isAvailableMode 
                            ? "bg-green-50 border-green-200" 
                            : "bg-red-50 border-red-200"
                        }`}
                      >
                        <div className={`font-medium ${
                          isAvailableMode ? "text-green-800" : "text-red-800"
                        }`}>
                          {guest.firstName} {guest.lastName}
                        </div>
                        <div className={`text-sm ${
                          isAvailableMode ? "text-green-600" : "text-red-600"
                        }`}>
                          {guest.responseCount} date{guest.responseCount !== 1 ? 's' : ''} selected
                        </div>
                        
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
				
				{/* Calendars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {activeTab === "availability" ? (
            months.map((monthData) => (
              <AvailabilityCalendar
                key={`availability-${monthData.year}-${monthData.month}`}
                monthName={monthData.name}
                year={monthData.year}
                month={monthData.month}
                unavailabilityStats={unavailabilityStats}
                disabledDates={disabledDates}
              />
            ))
          ) : (
            months.map((monthData) => (
              <AdminCalendar
                key={`admin-${monthData.year}-${monthData.month}`}
                monthName={monthData.name}
                year={monthData.year}
                month={monthData.month}
                disabledDates={disabledDates}
                onDateToggle={handleDateToggle}
              />
            ))
          )}
        </div>

        {/* Back to Guest View */}
        <div className="text-center">
          <button
            onClick={() => {
              const url = new URL(window.location.href);
              url.searchParams.delete('mode');
              window.location.href = url.toString();
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-lg text-xl shadow-lg transition-colors"
          >
            Back to Guest View 👥
          </button>
        </div>
      </div>
      
      <Toaster />
    </div>
  );
}
