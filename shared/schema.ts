import { pgTable, text, serial, timestamp, varchar, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

export * from "./models/auth";

// === TABLE DEFINITIONS ===
export const donors = pgTable("donors", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id), // Link to auth user
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  bloodGroup: varchar("blood_group", { length: 5 }).notNull(),
  contactNumber: varchar("contact_number", { length: 20 }).notNull(),
  lastDonationDate: varchar("last_donation_date", { length: 100 }).notNull(), // PostgreSQL DATE or varchar
  userType: varchar("user_type", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// === BASE SCHEMAS ===
export const insertDonorSchema = createInsertSchema(donors).pick({
  name: true,
  address: true,
  city: true,
  bloodGroup: true,
  contactNumber: true,
  lastDonationDate: true,
  userType: true,
});

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
