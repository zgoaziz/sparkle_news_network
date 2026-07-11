import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "sparkle-news-secret-2024";
const SALT_ROUNDS = 10;

export interface JwtPayload {
  userId: string;
  role: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Extract authenticated user from Next.js request headers.
 * Returns null if no valid token found.
 */
export function getAuthUser(req: NextRequest): JwtPayload | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

/**
 * Require authentication – returns user or throws an error.
 */
export function requireAuth(req: NextRequest): JwtPayload {
  const user = getAuthUser(req);
  if (!user) {
    throw new Error("Unauthorized: No token provided");
  }
  return user;
}

/**
 * Require admin or editor role.
 */
export function requireAdmin(req: NextRequest): JwtPayload {
  const user = requireAuth(req);
  if (user.role !== "admin" && user.role !== "editor") {
    throw new Error("Forbidden: Admin access required");
  }
  return user;
}
