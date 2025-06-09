import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState, useEffect } from "react";
import { Calendar } from "./Calendar";
import { NameModal } from "./NameModal";
import { SelectionModeModal } from "./SelectionModeModal";
import { AdminPage } from "./AdminPage";
import { Toaster, toast } from "sonner";

type SelectionMode = "unavailable" | "available";

export default function App() {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [showNameModal, setShowNameModal] = useState(false);
  const [showSelectionModeModal, setShowSelectionModeModal] = useState(false);
  const [selectionMode, setSelectionMode] = useState<SelectionMode | null>(null);
  const [showCalendars, setShowCalendars] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const firstNameParam = urlParams.get('firstName');
    const lastNameParam = urlParams.get('lastName');
    const modeParam = urlParams.get('mode');
    
    if (firstNameParam && lastNameParam) {
      setFirstName(firstNameParam);
      setLastName(lastNameParam);
    }

    if (modeParam === 'admin') {
      setIsAdminMode(true);
    }
  }, []);

  const unavailableDates = useQuery(
    api.dates.getUnavailableDates,
    firstName && lastName ? { firstName, lastName } : "skip"
  ) || [];

  const disabledDates = useQuery(api.dates.getDisabledDates) || [];

  const toggleDate = useMutation(api.dates.toggleUnavailableDate);
  const submitResponse = useMutation(api.dates.submitResponse);

  // Show admin page if in admin mode
  if (isAdminMode) {
    return <AdminPage />;
  }

  const handleDateToggle = async (date: string) => {
    if (!firstName || !lastName) {
      setShowNameModal(true);
      return;
    }

    if (!selectionMode) {
      setShowSelectionModeModal(true);
      return;
    }

    try {
      await toggleDate({
        firstName,
        lastName,
        date,
        selectionMode,
      });
    } catch (error) {
      toast.error("Failed to update date");
    }
  };

  const handleSubmit = async () => {
    if (!firstName || !lastName) {
      setShowNameModal(true);
      return;
    }

    try {
      await submitResponse({ firstName, lastName });
      toast.success("Submitted 😊 Thank you");
    } catch (error) {
      toast.error("Failed to submit response");
    }
  };

  const handleNameSubmit = (first: string, last: string) => {
    setFirstName(first);
    setLastName(last);
    setShowNameModal(false);
    
    // Update URL with names
    const url = new URL(window.location.href);
    url.searchParams.set('firstName', first);
    url.searchParams.set('lastName', last);
    window.history.replaceState({}, '', url.toString());
    
    // Show selection mode modal after name is entered
    setShowSelectionModeModal(true);
  };

  const handleGetStarted = () => {
    if (!firstName || !lastName) {
      setShowNameModal(true);
    } else {
      setShowSelectionModeModal(true);
    }
  };

  const handleSelectionModeSubmit = (mode: SelectionMode) => {
    setSelectionMode(mode);
    setShowSelectionModeModal(false);
    setShowCalendars(true);
  };

  const handleChangeSelectionMode = () => {
    const newMode = selectionMode === "unavailable" ? "available" : "unavailable";
    
    if (unavailableDates.length > 0) {
      if (confirm("Changing selection mode will clear all your current selections. Are you sure you want to continue?")) {
        // Clear all selections by toggling each selected date
        unavailableDates.forEach(async (date) => {
          await toggleDate({ firstName, lastName, date, selectionMode });
        });
        setSelectionMode(newMode);
      }
    } else {
      setSelectionMode(newMode);
    }
  };

  const handleEditName = () => {
    setShowNameModal(true);
  };

  const handleBackToWelcome = () => {
    setShowCalendars(false);
    setSelectionMode(null);
  };

  const months = [
    { name: "September 2025", year: 2025, month: 8 },
    { name: "October 2025", year: 2025, month: 9 },
    { name: "November 2025", year: 2025, month: 10 },
    { name: "December 2025", year: 2025, month: 11 },
    { name: "January 2026", year: 2026, month: 0 },
  ];

  if (!showCalendars) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Welcome Page */}
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-purple-800 mb-6">
              💕 Wedding Date Finder 💕
            </h1>
            
            <div className="bg-white rounded-lg shadow-lg p-8 text-left mb-8">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <img 
                  src="https://utfs.io/f/rd0D2eyhq7vaQbTceEnZrcVtgL21HQY6dCGfm7kBubnSlDse"
                  alt="Wedding celebration"
                  className="max-w-xs w-full h-auto rounded-lg flex-shrink-0"
                />
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                Welcome to our wedding page 👰‍♀️🤵‍♂️💍<br/><br/>
                We couldn't be more excited to celebrate our big day with you 😁🎉<br/><br/>
                Since we're hoping to tie the knot soon-ish 🤞 Garison made this little tool to help us pick a day with confidence: knowing all our loved ones will be able to be there.<br/><br/>
                But we need your help to make that happen! Thanks for taking a few minutes to let us know what works for you 💕
                </p>
              </div>
            </div>

            <button
              onClick={handleGetStarted}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-lg text-xl shadow-lg transition-colors"
            >
              Get Started 🚀
            </button>
          </div>

          {/* Name Modal */}
          {showNameModal && (
            <NameModal
              initialFirstName={firstName}
              initialLastName={lastName}
              onSubmit={handleNameSubmit}
              onClose={() => setShowNameModal(false)}
            />
          )}

          {/* Selection Mode Modal */}
          {showSelectionModeModal && (
            <SelectionModeModal
              onSubmit={handleSelectionModeSubmit}
              onClose={() => setShowSelectionModeModal(false)}
              onBack={firstName && lastName ? handleEditName : undefined}
            />
          )}
        </div>
        
        <Toaster />
      </div>
    );
  }

  const selectionModeTheme = selectionMode === "unavailable" 
    ? {
        bgColor: "bg-red-50",
        borderColor: "border-red-400",
        textColor: "text-red-800",
        buttonColor: "bg-red-600 hover:bg-red-700"
      }
    : {
        bgColor: "bg-green-50",
        borderColor: "border-green-400", 
        textColor: "text-green-800",
        buttonColor: "bg-green-600 hover:bg-green-700"
      };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-purple-800 mb-6">
            💕 Wedding Date Finder 💕
          </h1>
          
          <div className="bg-white rounded-lg shadow-lg p-8 text-left max-w-4xl mx-auto">
            <div className={`${selectionModeTheme.bgColor} border-l-4 ${selectionModeTheme.borderColor} p-4 rounded mb-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-lg font-bold ${selectionModeTheme.textColor} mb-2`}>
                    📅 Selection Mode
                  </p>
                  <p className={selectionModeTheme.textColor}>
                    {selectionMode === "unavailable" 
                      ? "You are selecting dates that would NOT work for you." 
                      : "You are selecting dates that WOULD work for you."
                    }
                  </p>
                </div>
                <button
                  onClick={handleChangeSelectionMode}
                  className={`px-4 py-2 ${selectionModeTheme.buttonColor} text-white rounded-md text-sm font-medium transition-colors`}
                >
                  Switch Mode
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Calendars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {months.map((monthData) => (
            <Calendar
              key={`${monthData.year}-${monthData.month}`}
              monthName={monthData.name}
              year={monthData.year}
              month={monthData.month}
              unavailableDates={unavailableDates}
              disabledDates={disabledDates}
              selectionMode={selectionMode!}
              onDateToggle={handleDateToggle}
            />
          ))}
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            onClick={handleSubmit}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-lg text-xl shadow-lg transition-colors"
          >
            Submit My Response 💌
          </button>
        </div>

        {/* Name Modal */}
        {showNameModal && (
          <NameModal
            initialFirstName={firstName}
            initialLastName={lastName}
            onSubmit={handleNameSubmit}
            onClose={() => setShowNameModal(false)}
          />
        )}

        {/* Selection Mode Modal */}
        {showSelectionModeModal && (
          <SelectionModeModal
            onSubmit={handleSelectionModeSubmit}
            onClose={() => setShowSelectionModeModal(false)}
            onBack={firstName && lastName ? handleEditName : undefined}
          />
        )}
      </div>
      
      <Toaster />
    </div>
  );
}
