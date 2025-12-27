import jwt from "jsonwebtoken";
import { ENV } from "../config/env/env";

// Function to generate a JWT token
export function generateToken(
  payload: object,
  expiresIn: string | number = "1h"
): string {
  const key = (process.env.JWT_SECRET_KEY ?? "wjwieud292ud") as string;
  return jwt.sign(payload, key, { expiresIn: expiresIn as any });
}

// Function to validate a JWT token
export function validateToken(token: string): any {
  try {
    const key = process.env.JWT_SECRET_KEY ?? "wjwieud292ud";
    const decoded = jwt.verify(token, key);
    return decoded;
  } catch (err) {
    console.error("Invalid token:", err);
    return null;
  }
}
