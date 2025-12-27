import { NextFunction, Request, Response } from "express";
import { validateToken } from "../../../common/jwt";
import { prisma } from "../../../config/db/db";
import { RequestMetadata } from "../../../types/auth";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { authorization } = req.headers;

    if (!authorization) {
      res.statusCode = 403;
      res.json({ error: { message: "Forbidden" } });
      return;
    }
    let splitKey: string;
    if (authorization.includes("Bearer")) {
      splitKey = "Bearer ";
    } else if (authorization.includes("bearer")) {
      splitKey = "bearer ";
    } else {
      throw new Error("wrong authorization token");
    }
    const tokenArray = authorization.split("Bearer ");

    if (tokenArray.length == 2) {
      const token = tokenArray[1];

      const tokenPayload = validateToken(token) as {
        sub: string;
      } | null;

      if (!tokenPayload) {
        res.statusCode = 403;
        res.json({ error: { message: "Forbidden" } });
        return;
      }

      const userData = await prisma.user.findUnique({
        where: {
          id: tokenPayload.sub,
        },
      });

      if (userData == null) {
        res.statusCode = 401;
        res.json({ error: { message: "Unauthorized" } });
        return;
      }
      const requestMetadata: RequestMetadata = {
        userData: userData,
      };
      req.metadata = requestMetadata;
      next();
    } else {
      res.statusCode = 403;
      res.json({ error: { message: "Forbidden" } });
      return;
    }
  } catch (error: any) {
    res.statusCode = 401;
    res.json({ error: { message: error.toString() } });
    return;
  }
}
