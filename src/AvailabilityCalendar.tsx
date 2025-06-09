import { useState } from "react";
import { GuestListModal } from "./GuestListModal";

interface Guest {
  firstName: string;
  lastName: string;
  selectionMode: "unavailable" | "available";
}

interface AvailabilityCalendarProps {
  monthName: string;
  year: number;
  month: number; // 0-based month
  unavailabilityStats: Record<string, { count: number; guests: Guest[] }>;
  disabledDates: string[];
}

export function AvailabilityCalendar({ 
  monthName, 
  year, 
  month, 
  unavailabilityStats, 
  disabledDates 
}: AvailabilityCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const isWeekend = (year: number, month: number, day: number) => {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6; // Sunday, Friday, Saturday
  };

  const formatDate = (year: number, month: number, day: number) => {
    const monthStr = (month + 1).toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    return `${year}-${monthStr}-${dayStr}`;
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const days = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  const handleDayClick = (day: number) => {
    if (!isWeekend(year, month, day)) return;
    
    const dateString = formatDate(year, month, day);
    const stats = unavailabilityStats[dateString];
    
    // Show modal if there are any guests (either unavailable or available responses)
    if (stats && stats.guests.length > 0) {
      setSelectedDate(dateString);
    }
  };

  const getDateDisplayInfo = (dateString: string) => {
    const stats = unavailabilityStats[dateString];
    if (!stats) {
      return { count: 0, unavailableCount: 0, availableCount: 0, hasResponses: false };
    }

    const unavailableCount = stats.guests.filter(g => g.selectionMode === "unavailable").length;
    const availableCount = stats.guests.filter(g => g.selectionMode === "available").length;
    const hasResponses = stats.guests.length > 0;
    
    return { 
      count: stats.count, // This is the count of people who can't make it (unavailable)
      unavailableCount, 
      availableCount,
      hasResponses
    };
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-center mb-4 text-blue-800">
          {monthName}
        </h3>
        
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            if (day === null) {
              return <div key={index} className="h-12"></div>;
            }
            
            const isWeekendDay = isWeekend(year, month, day);
            const dateString = formatDate(year, month, day);
            const { count, unavailableCount, availableCount, hasResponses } = getDateDisplayInfo(dateString);
            const isAdminDisabled = disabledDates.includes(dateString);
            
            let buttonClasses = "h-12 w-full rounded text-xs font-medium transition-colors relative ";
            
            if (!isWeekendDay) {
              buttonClasses += "cursor-not-allowed text-gray-300 bg-gray-50";
            } else if (isAdminDisabled) {
              buttonClasses += "cursor-not-allowed text-gray-400 bg-gray-200 opacity-50 line-through";
            } else {
              if (count > 0) {
                // Red for days with people who can't make it
                buttonClasses += "cursor-pointer bg-red-100 text-red-800 hover:bg-red-200 border border-red-300";
              } else if (hasResponses) {
                // Green for days with responses but no unavailable people
                buttonClasses += "cursor-pointer bg-green-100 text-green-800 hover:bg-green-200 border border-green-300";
              } else {
                // Gray for days with no responses yet
                buttonClasses += "cursor-pointer bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300";
              }
            }
            
            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                disabled={!isWeekendDay || isAdminDisabled}
                className={buttonClasses}
                title={
                  isAdminDisabled 
                    ? "This date has been disabled" 
                    : count > 0
                      ? `${count} can't make it${availableCount > 0 ? `, ${availableCount} available` : ''} - click to see details`
                      : hasResponses
                        ? `${availableCount} available - click to see details`
                        : "No responses yet"
                }
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <span className="text-sm">{day}</span>
                  {isWeekendDay && !isAdminDisabled && (
                    <div className="text-xs font-bold">
                      {count > 0 ? (
                        <span className="text-red-600">-{count}</span>
                      ) : hasResponses ? (
                        <span className="text-green-600">✓</span>
                      ) : (
                        <span className="text-gray-400">?</span>
                      )}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Guest List Modal */}
      {selectedDate && unavailabilityStats[selectedDate] && (
        <GuestListModal
          date={selectedDate}
          guests={unavailabilityStats[selectedDate].guests}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </>
  );
}
