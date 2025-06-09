import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getUnavailableDates = query({
  args: {
    firstName: v.string(),
    lastName: v.string(),
  },
  handler: async (ctx, args) => {
    const dates = await ctx.db
      .query("unavailableDates")
      .withIndex("by_guest", (q) => 
        q.eq("guestFirstName", args.firstName).eq("guestLastName", args.lastName)
      )
      .collect();
    
    return dates.map(date => date.date);
  },
});

export const getDisabledDates = query({
  args: {},
  handler: async (ctx) => {
    const dates = await ctx.db
      .query("disabledDates")
      .collect();
    
    return dates.map(date => date.date);
  },
});

export const getUnavailabilityStats = query({
  args: {},
  handler: async (ctx) => {
    const unavailableDates = await ctx.db
      .query("unavailableDates")
      .collect();
    
    // Get all unique guests and their selection modes
    const guestModes = new Map<string, "unavailable" | "available">();
    const guestSelectedDates = new Map<string, Set<string>>();
    
    for (const entry of unavailableDates) {
      const guestKey = `${entry.guestFirstName}-${entry.guestLastName}`;
      const selectionMode = entry.selectionMode || "unavailable";
      
      guestModes.set(guestKey, selectionMode);
      
      if (!guestSelectedDates.has(guestKey)) {
        guestSelectedDates.set(guestKey, new Set());
      }
      guestSelectedDates.get(guestKey)!.add(entry.date);
    }
    
    // Define all possible weekend dates in our range
    const allWeekendDates = new Set<string>();
    const months = [
      { year: 2025, month: 8 },  // September 2025
      { year: 2025, month: 9 },  // October 2025
      { year: 2025, month: 10 }, // November 2025
      { year: 2025, month: 11 }, // December 2025
      { year: 2026, month: 0 },  // January 2026
    ];
    
    for (const { year, month } of months) {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay();
        // Weekend: Sunday (0), Friday (5), Saturday (6)
        if (dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6) {
          const monthStr = (month + 1).toString().padStart(2, '0');
          const dayStr = day.toString().padStart(2, '0');
          const dateString = `${year}-${monthStr}-${dayStr}`;
          allWeekendDates.add(dateString);
        }
      }
    }
    
    // Group by date and count guests
    const dateStats: Record<string, { count: number; guests: Array<{ firstName: string; lastName: string; selectionMode: "unavailable" | "available" }> }> = {};
    
    // Initialize all weekend dates
    for (const dateString of allWeekendDates) {
      dateStats[dateString] = { count: 0, guests: [] };
    }
    
    // Process each guest
    for (const [guestKey, selectionMode] of guestModes.entries()) {
      const [firstName, lastName] = guestKey.split('-');
      const selectedDates = guestSelectedDates.get(guestKey) || new Set();
      
      if (selectionMode === "unavailable") {
        // For unavailable mode: only count explicitly selected dates as unavailable
        for (const dateString of selectedDates) {
          if (dateStats[dateString]) {
            dateStats[dateString].count++;
            dateStats[dateString].guests.push({
              firstName,
              lastName,
              selectionMode: "unavailable"
            });
          }
        }
      } else {
        // For available mode: count unselected weekend dates as unavailable
        for (const dateString of allWeekendDates) {
          if (!selectedDates.has(dateString)) {
            dateStats[dateString].count++;
            dateStats[dateString].guests.push({
              firstName,
              lastName,
              selectionMode: "unavailable" // These guests are unavailable for this date
            });
          }
        }
        
        // Also add the explicitly selected dates as available (for modal display)
        for (const dateString of selectedDates) {
          if (dateStats[dateString]) {
            // Don't increment count for available dates, just track for modal
            dateStats[dateString].guests.push({
              firstName,
              lastName,
              selectionMode: "available"
            });
          }
        }
      }
    }
    
    return dateStats;
  },
});

export const getRespondedGuests = query({
  args: {},
  handler: async (ctx) => {
    const unavailableDates = await ctx.db
      .query("unavailableDates")
      .collect();
    
    // Get unique guests who have responded
    const guestMap = new Map<string, { firstName: string; lastName: string; responseCount: number }>();
    
    for (const entry of unavailableDates) {
      const guestKey = `${entry.guestFirstName}-${entry.guestLastName}`;
      if (guestMap.has(guestKey)) {
        guestMap.get(guestKey)!.responseCount++;
      } else {
        guestMap.set(guestKey, {
          firstName: entry.guestFirstName,
          lastName: entry.guestLastName,
          responseCount: 1
        });
      }
    }
    
    // Convert to array and sort by name
    return Array.from(guestMap.values()).sort((a, b) => {
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });
  },
});

export const toggleUnavailableDate = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    date: v.string(),
    selectionMode: v.union(v.literal("unavailable"), v.literal("available")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("unavailableDates")
      .withIndex("by_guest", (q) => 
        q.eq("guestFirstName", args.firstName).eq("guestLastName", args.lastName)
      )
      .filter((q) => q.eq(q.field("date"), args.date))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return false; // Date is now available
    } else {
      const month = args.date.substring(0, 7); // YYYY-MM
      await ctx.db.insert("unavailableDates", {
        guestFirstName: args.firstName,
        guestLastName: args.lastName,
        date: args.date,
        month,
        selectionMode: args.selectionMode,
      });
      return true; // Date is now unavailable
    }
  },
});

export const toggleDisabledDate = mutation({
  args: {
    date: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("disabledDates")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return false; // Date is now enabled
    } else {
      const month = args.date.substring(0, 7); // YYYY-MM
      await ctx.db.insert("disabledDates", {
        date: args.date,
        month,
        reason: args.reason,
      });
      return true; // Date is now disabled
    }
  },
});

export const submitResponse = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
  },
  handler: async (ctx, args) => {
    // This mutation doesn't do anything special, but could be used
    // to mark a response as "submitted" if needed in the future
    return { success: true };
  },
});
