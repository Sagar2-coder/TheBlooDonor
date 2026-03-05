import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

export * from "./models/auth";

// === TABLE DEFINITIONS ===
export const donors = sqliteTable("donors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().references(() => users.id), // Link to auth user
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  bloodGroup: text("blood_group").notNull(),
  contactNumber: text("contact_number").notNull(),
  lastDonationDate: text("last_donation_date").notNull(), // SQLite doesn't have native DATE, use ISO string
  userType: text("user_type", { enum: ["donor", "receiver"] }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(new Date()),
});

// === BASE SCHEMAS ===
export const insertDonorSchema = createInsertSchema(donors).omit({ id: true, createdAt: true, userId: true });

// === EXPLICIT API CONTRACT TYPES ===
export type Donor = typeof donors.$inferSelect;
export type InsertDonor = z.infer<typeof insertDonorSchema>;

// Request types
export type CreateDonorRequest = InsertDonor;
export type UpdateDonorRequest = Partial<InsertDonor>;

// Response types
// Public donor info excludes contact number
export type PublicDonorInfo = Omit<Donor, "contactNumber">;

export type DonorResponse = Donor;
export type DonorsListResponse = PublicDonorInfo[];

// Query params
export interface DonorsQueryParams {
  bloodGroup?: string;
  userType?: "donor" | "receiver";
}
