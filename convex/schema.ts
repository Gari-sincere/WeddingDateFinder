import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  unavailableDates: defineTable({
    guestFirstName: v.string(),
    guestLastName: v.string(),
    date: v.string(), // YYYY-MM-DD format
    month: v.string(), // YYYY-MM format for easier querying
  }).index("by_guest", ["guestFirstName", "guestLastName"])
    .index("by_date", ["date"])
    .index("by_month", ["month"]),
  
  disabledDates: defineTable({
    date: v.string(), // YYYY-MM-DD format
    month: v.string(), // YYYY-MM format for easier querying
    reason: v.optional(v.string()), // Optional reason for disabling
  }).index("by_date", ["date"])
    .index("by_month", ["month"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
