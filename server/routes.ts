import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth as setupReplitAuth } from "./replit_integrations/auth/replitAuth";
import { setupAuth as setupLocalAuth } from "./localAuth";

const setupAuth = process.env.REPL_ID ? setupReplitAuth : setupLocalAuth;
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth first
  await setupAuth(app);

  // Middleware for Admin access
  const isAdmin = (req: any, res: any, next: any) => {
    if (req.isAuthenticated() && req.user.role === "admin") {
      return next();
    }
    return res.status(403).json({ message: "Forbidden: Admins only" });
  };

  // Donors API
  app.get(api.donors.list.path, async (req, res) => {
    const bloodGroup = req.query.bloodGroup as string | undefined;
    const city = req.query.city as string | undefined;
    const userType = req.query.userType as "donor" | "receiver" | undefined;

    const donors = await storage.getDonors({ bloodGroup, userType, city });

    // Filter sensitive info (contactNumber)
    const publicDonors = donors.map(({ contactNumber, ...rest }) => rest);

    res.json(publicDonors);
  });

  app.post(api.donors.create.path, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const input = api.donors.create.input.parse(req.body);
      // Link to authenticated user
      const userId = (req.user as any).id;

      // Check if profile already exists?
      const existing = await storage.getDonorByUserId(userId);
      if (existing) {
        // Maybe update instead? For now let's just fail or return existing
        // But the requirement implies registration.
        // Let's assume create means create new profile.
        // Ideally we should have an update endpoint too.
      }

      const donor = await storage.createDonor({ ...input, userId });
      res.status(201).json(donor);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  app.get(api.donors.getMine.path, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = (req.user as any).id;
    const donor = await storage.getDonorByUserId(userId);

    if (!donor) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(donor);
  });

  app.put(api.donors.update.path, async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const input = api.donors.update.input.parse(req.body);
      const userId = (req.user as any).id;

      const existing = await storage.getDonorByUserId(userId);
      if (!existing) {
        return res.status(404).json({ message: "Profile not found" });
      }

      const updated = await storage.updateDonor(userId, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  // Admin Routes
  app.get("/api/admin/donors", isAdmin, async (req, res) => {
    const donors = await storage.getAllDonorsWithUsers();
    res.json(donors);
  });

  app.post("/api/admin/users/:id/approve", isAdmin, async (req, res) => {
    const updated = await storage.updateUserStatus(req.params.id, "approved");
    if (!updated) return res.status(404).send("User not found");
    res.json(updated);
  });

  app.post("/api/admin/users/:id/reject", isAdmin, async (req, res) => {
    const updated = await storage.updateUserStatus(req.params.id, "rejected");
    if (!updated) return res.status(404).send("User not found");
    res.json(updated);
  });

  return httpServer;
}
