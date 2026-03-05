
import type { Express, Request, Response, NextFunction } from "express";

export function setupAuth(app: Express) {
    // Add a mock user to the request if not already present
    app.use((req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            req.user = {
                id: "mock-user-id",
                email: "mock@example.com",
                claims: {
                    sub: "mock-user-id",
                    email: "mock@example.com",
                    first_name: "Mock",
                    last_name: "User",
                    profile_image_url: "https://via.placeholder.com/150",
                    exp: Math.floor(Date.now() / 1000) + 3600 * 24, // Expires in 24 hours
                },
                expires_at: Math.floor(Date.now() / 1000) + 3600 * 24,
            };
        }

        // Mock isAuthenticated function
        req.isAuthenticated = (() => true) as any;

        // Mock logout
        req.logout = (cb: any) => {
            if (cb) cb();
        };

        next();
    });

    // Mock login route
    app.get("/api/login", (req, res) => {
        res.redirect("/");
    });

    // Mock callback route (not really needed but for compatibility)
    app.get("/api/callback", (req, res) => {
        res.redirect("/");
    });

    // Mock logout route
    app.get("/api/logout", (req, res) => {
        res.redirect("/");
    });

    console.log("Mock Auth initialized");
}
