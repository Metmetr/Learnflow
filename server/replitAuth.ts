import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler, Request, Response, NextFunction } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  const isProduction = process.env.NODE_ENV === "production";
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  console.log("[AUTH] Received OIDC claims:", JSON.stringify(claims, null, 2));
  
  const firstName = claims["given_name"] || claims["first_name"];
  const lastName = claims["family_name"] || claims["last_name"];
  const profileImageUrl = claims["picture"] || claims["profile_image_url"];
  const fullName = [firstName, lastName]
    .filter(Boolean)
    .join(" ");
  
  const userData = {
    id: claims["sub"],
    email: claims["email"],
    firstName,
    lastName,
    name: fullName || claims["email"]?.split("@")[0] || "User",
    profileImageUrl,
    avatar: profileImageUrl,
  };
  
  console.log("[AUTH] Upserting user with data:", JSON.stringify(userData, null, 2));
  
  await storage.upsertUser(userData);
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  const registeredStrategies = new Set<string>();

  const ensureStrategy = (req: any) => {
    const protocol = req.protocol;
    const host = req.get("host");
    const domain = `${protocol}://${host}`;
    const strategyName = `replitauth:${host}`;
    if (!registeredStrategies.has(strategyName)) {
      const strategy = new Strategy(
        {
          name: strategyName,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `${domain}/api/callback`,
        },
        verify,
      );
      passport.use(strategy);
      registeredStrategies.add(strategyName);
    }
    return strategyName;
  };

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser(async (sessionUser: any, cb) => {
    try {
      // Safety check for legacy sessions or missing claims
      // Return null (not error) to gracefully handle invalid sessions
      if (!sessionUser?.claims?.sub) {
        console.warn("[AUTH] Invalid session data - clearing session");
        return cb(null, false);
      }

      // Fetch the full user record from database
      const userId = sessionUser.claims.sub;
      const dbUser = await storage.getUser(userId);
      
      if (!dbUser) {
        console.warn("[AUTH] User not found in database - clearing session");
        return cb(null, false);
      }

      // Merge session data with database user
      // This makes req.user have all expected fields (id, role, verified, etc.)
      // req.user shape: { ...sessionData (claims, tokens), ...dbUser (id, role, verified, etc.) }
      const user = {
        ...sessionUser,
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
        verified: dbUser.verified,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        profileImageUrl: dbUser.profileImageUrl,
        avatar: dbUser.avatar,
        specialty: dbUser.specialty,
        bio: dbUser.bio,
      };
      
      cb(null, user);
    } catch (error) {
      console.error("[AUTH] Error in deserializeUser:", error);
      cb(null, false);
    }
  });

  app.get("/api/login", (req, res, next) => {
    const strategyName = ensureStrategy(req);
    passport.authenticate(strategyName, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    const strategyName = ensureStrategy(req);
    passport.authenticate(strategyName, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    const protocol = req.protocol;
    const host = req.get("host");
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${protocol}://${host}`,
        }).href
      );
    });
  });
}

export interface AuthRequest extends Request {
  user?: any;
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};

export const optionalAuth: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user?.expires_at) {
    return next();
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    return next();
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
  } catch {
    // Ignore refresh errors for optional auth
  }

  return next();
};

export function requireRole(...roles: Array<"user" | "educator" | "admin">) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // req.user already has role from deserializeUser
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
}
