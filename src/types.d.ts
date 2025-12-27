// types.d.ts
import { Request } from "express";
import { RequestMetadata } from "./types/auth";

declare module "express-serve-static-core" {
  interface Request {
    metadata?: RequestMetadata;
  }
}
