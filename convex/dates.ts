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
    
    // Group by date and count guests
    const dateStats: Record<string, { count: number; guests: Array<{ firstName: string; lastName: string }> }> = {};
    
    for (const entry of unavailableDates) {
      if (!dateStats[entry.date]) {
        dateStats[entry.date] = { count: 0, guests: [] };
      }
      dateStats[entry.date].count++;
      dateStats[entry.date].guests.push({
        firstName: entry.guestFirstName,
        lastName: entry.guestLastName
      });
    }
    
    return dateStats;
  },
});

export const toggleUnavailableDate = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    date: v.string(),
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
