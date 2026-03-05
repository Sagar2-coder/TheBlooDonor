import { donors, type Donor, type InsertDonor } from "@shared/schema";
import { users, type User } from "@shared/models/auth";
import { db } from "./db";
import { eq, lte, and, sql } from "drizzle-orm";
import { subMonths } from "date-fns";

export interface IStorage {
  createDonor(donor: InsertDonor & { userId: string }): Promise<Donor>;
  getDonors(filters?: { bloodGroup?: string; userType?: "donor" | "receiver"; city?: string }): Promise<Donor[]>;
  getAllDonorsWithUsers(): Promise<(Donor & { user: User })[]>;
  getDonorByUserId(userId: string): Promise<Donor | undefined>;
  updateDonor(userId: string, donor: Partial<InsertDonor>): Promise<Donor | undefined>;
  updateUserStatus(userId: string, status: "approved" | "rejected"): Promise<User | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createDonor(insertDonor: InsertDonor & { userId: string }): Promise<Donor> {
    const [donor] = await db.insert(donors).values(insertDonor).returning();
    return donor;
  }

  async getDonors(filters?: { bloodGroup?: string; userType?: "donor" | "receiver"; city?: string }): Promise<Donor[]> {
    const threeMonthsAgo = subMonths(new Date(), 3);
    let conditions = [
      eq(users.status, "approved"),
      lte(donors.lastDonationDate, threeMonthsAgo.toISOString().split('T')[0])
    ];

    if (filters?.bloodGroup) {
      conditions.push(eq(donors.bloodGroup, filters.bloodGroup));
    }

    if (filters?.city) {
      // Case insensitive match would be better but let's stick to simple eq or like if supported.
      conditions.push(sql`lower(${donors.city}) = lower(${filters.city})`);
    }

    if (filters?.userType) {
      conditions.push(eq(donors.userType, filters.userType));
    }

    const results = await db.select({ donor: donors })
      .from(donors)
      .innerJoin(users, eq(donors.userId, users.id))
      .where(and(...conditions));

    return results.map(r => r.donor);
  }

  async getAllDonorsWithUsers(): Promise<(Donor & { user: User })[]> {
    const results = await db.select({
      donor: donors,
      user: users
    })
      .from(donors)
      .innerJoin(users, eq(donors.userId, users.id));

    return results.map(r => ({ ...r.donor, user: r.user }));
  }

  async getDonorByUserId(userId: string): Promise<Donor | undefined> {
    const [donor] = await db.select().from(donors).where(eq(donors.userId, userId));
    return donor;
  }

  async updateDonor(userId: string, updateData: Partial<InsertDonor>): Promise<Donor | undefined> {
    const [updated] = await db
      .update(donors)
      .set(updateData)
      .where(eq(donors.userId, userId))
      .returning();
    return updated;
  }

  async updateUserStatus(userId: string, status: "approved" | "rejected"): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({ status })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
