import { useState } from "react";
import { GuestListModal } from "./GuestListModal";

interface Guest {
  firstName: string;
  lastName: string;
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
    
    if (stats && stats.count > 0) {
      setSelectedDate(dateString);
    }
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
            const stats = unavailabilityStats[dateString];
            const isAdminDisabled = disabledDates.includes(dateString);
            const unavailableCount = stats?.count || 0;
            
            let buttonClasses = "h-12 w-full rounded text-xs font-medium transition-colors relative ";
            
            if (!isWeekendDay) {
              buttonClasses += "cursor-not-allowed text-gray-300 bg-gray-50";
            } else if (isAdminDisabled) {
              buttonClasses += "cursor-not-allowed text-gray-400 bg-gray-200 opacity-50 line-through";
            } else {
              if (unavailableCount > 0) {
                buttonClasses += "cursor-pointer bg-red-100 text-red-800 hover:bg-red-200 border border-red-300";
              } else {
                buttonClasses += "bg-green-100 text-green-800 border border-green-300";
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
                    : unavailableCount > 0 
                      ? `${unavailableCount} guest${unavailableCount > 1 ? 's' : ''} unavailable - click to see details`
                      : "All guests available"
                }
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <span className="text-sm">{day}</span>
                  {unavailableCount > 0 && (
                    <span className="text-xs font-bold text-red-600">
                      -{unavailableCount}
                    </span>
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
