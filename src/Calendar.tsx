import { useState } from "react";

type SelectionMode = "unavailable" | "available";

interface CalendarProps {
  monthName: string;
  year: number;
  month: number; // 0-based month
  unavailableDates: string[];
  disabledDates: string[];
  selectionMode: SelectionMode;
  onDateToggle: (date: string) => void;
}

export function Calendar({ monthName, year, month, unavailableDates, disabledDates, selectionMode, onDateToggle }: CalendarProps) {
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
    const dateString = formatDate(year, month, day);
    
    // Don't allow clicking on non-weekend days or admin-disabled dates
    if (!isWeekend(year, month, day) || disabledDates.includes(dateString)) return;
    
    onDateToggle(dateString);
  };

  const getDateStatus = (dateString: string) => {
    const isSelected = unavailableDates.includes(dateString);
    
    if (selectionMode === "unavailable") {
      return isSelected ? "unavailable" : "neutral";
    } else {
      return isSelected ? "available" : "neutral";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-center mb-4 text-purple-800">
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
            return <div key={index} className="h-10"></div>;
          }
          
          const isWeekendDay = isWeekend(year, month, day);
          const dateString = formatDate(year, month, day);
          const dateStatus = getDateStatus(dateString);
          const isAdminDisabled = disabledDates.includes(dateString);
          
          let buttonClasses = "h-10 w-10 rounded text-sm font-medium transition-colors ";
          
          if (!isWeekendDay) {
            buttonClasses += "cursor-not-allowed text-gray-300 bg-gray-50";
          } else if (isAdminDisabled) {
            buttonClasses += "cursor-not-allowed text-gray-400 bg-gray-200 opacity-50 line-through";
          } else {
            buttonClasses += "cursor-pointer ";
            
            if (dateStatus === "unavailable") {
              buttonClasses += "bg-red-200 text-red-800";
            } else if (dateStatus === "available") {
              buttonClasses += "bg-green-200 text-green-800";
            } else {
              buttonClasses += "bg-gray-100 text-gray-700";
            }
          }
          
          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              disabled={!isWeekendDay || isAdminDisabled}
              className={buttonClasses}
              title={isAdminDisabled ? "This date has been disabled by the happy couple" : undefined}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
