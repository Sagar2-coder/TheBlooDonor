import passport from "passport";
import { IVerifyOptions, Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Express } from "express";
import session from "express-session";
import createMemoryStore from "memorystore";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { users } from "@shared/models/auth";
import { db } from "./db";
import { eq, or } from "drizzle-orm";
import type { User } from "@shared/models/auth";

const scryptAsync = promisify(scrypt);
const MemoryStore = createMemoryStore(session);

async function hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
    const [hashed, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
    const sessionSettings: session.SessionOptions = {
        secret: process.env.SESSION_SECRET || "r3pl1t",
        resave: false,
        saveUninitialized: false,
        store: new MemoryStore({
            checkPeriod: 86400000 // prune expired entries every 24h
        }),
        cookie: {
            secure: app.get("env") === "production",
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        },
    };

    if (app.get("env") === "production") {
        app.set("trust proxy", 1); // trust first proxy
    }

    app.use(session(sessionSettings));
    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(
        new LocalStrategy(async (username, password, done) => {
            try {
                const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
                if (!user) {
                    return done(null, false, { message: "Incorrect username." });
                }
                if (!user.password || !(await comparePasswords(password, user.password))) {
                    return done(null, false, { message: "Incorrect password." });
                }
                if (user.status !== "approved") {
                    return done(null, false, { message: "Your account is pending manual approval." });
                }
                return done(null, user);
            } catch (err) {
                return done(err);
            }
        })
    );

    // Google Strategy
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        passport.use(new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/api/auth/google/callback"
        }, async (accessToken, refreshToken, profile, done) => {
            try {
                const googleId = profile.id;
                const email = profile.emails?.[0]?.value;
                const profileImageUrl = profile.photos?.[0]?.value || null;

                if (!email) return done(new Error("No email found from Google provider"));

                // Check if user exists by googleId or email
                const [existingUser] = await db.select().from(users)
                    .where(or(eq(users.googleId, googleId), eq(users.email, email)))
                    .limit(1);

                if (existingUser) {
                    let updateData: any = {};
                    if (!existingUser.googleId) updateData.googleId = googleId;
                    if (!existingUser.profileImageUrl && profileImageUrl) updateData.profileImageUrl = profileImageUrl;

                    if (Object.keys(updateData).length > 0) {
                        const [updated] = await db.update(users)
                            .set(updateData)
                            .where(eq(users.id, existingUser.id))
                            .returning();
                        return done(null, updated);
                    }
                    return done(null, existingUser);
                }

                // Create new user
                const [newUser] = await db.insert(users).values({
                    username: email.split("@")[0] + "_" + randomBytes(4).toString("hex"),
                    email,
                    googleId,
                    firstName: profile.name?.givenName || "",
                    lastName: profile.name?.familyName || "",
                    profileImageUrl, // Save the Google profile picture
                    role: "user",
                    status: "pending"
                }).returning();

                return done(null, newUser);
            } catch (err) {
                return done(err);
            }
        }));
    }

    passport.serializeUser((user, done) => {
        done(null, (user as User).id);
    });

    passport.deserializeUser(async (id: string, done) => {
        try {
            const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
            done(null, user);
        } catch (err) {
            done(err);
        }
    });

    const googleConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

    // Providers endpoint so frontend knows what's available
    app.get("/api/auth/providers", (req, res) => {
        res.json({ google: googleConfigured });
    });

    app.get("/api/auth/google", (req, res, next) => {
        if (!googleConfigured) {
            return res.status(501).json({ message: "Google login is not configured. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file." });
        }
        passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
    });
    app.get("/api/auth/google/callback", (req, res, next) => {
        if (!googleConfigured) return res.redirect("/auth");
        passport.authenticate("google", { failureRedirect: "/auth" })(req, res, () => res.redirect("/"));
    });

    app.post("/api/register", async (req, res, next) => {
        try {
            const { username, password, firstName, lastName, email } = req.body;

            const [existingUser] = await db.select().from(users).where(eq(users.username, username)).limit(1);
            if (existingUser) {
                return res.status(400).send("Username already exists");
            }

            const hashedPassword = await hashPassword(password);

            const [newUser] = await db.insert(users).values({
                username,
                password: hashedPassword,
                firstName,
                lastName,
                email,
                role: "user",
                status: "pending",
                // IDs and dates are defaulted
            }).returning();

            req.login(newUser, (err) => {
                if (err) return next(err);
                res.status(201).json(newUser);
            });
        } catch (err) {
            next(err);
        }
    });

    app.post("/api/login", (req, res, next) => {
        passport.authenticate("local", (err: any, user: User, info: IVerifyOptions) => {
            if (err) return next(err);
            if (!user) return res.status(401).send(info.message);
            req.login(user, (err) => {
                if (err) return next(err);
                res.json(user);
            });
        })(req, res, next);
    });

    app.post("/api/logout", (req, res, next) => {
        req.logout((err) => {
            if (err) return next(err);
            res.sendStatus(200);
        });
    });


    app.get("/api/auth/user", (req, res) => {
        if (req.isAuthenticated()) {
            res.json(req.user);
        } else {
            res.status(401).send("Not logged in");
        }
    });
}
