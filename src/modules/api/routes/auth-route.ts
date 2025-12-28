import { Router } from "express";
import { login, logout, refreshToken, registerUser } from "../controllers/auth";
import { authMiddleware } from "../middlewares/authorization";

const authRoutes = Router();

authRoutes.post("/signup", registerUser);
authRoutes.post("/login", login);
authRoutes.delete("/logout", authMiddleware, logout);
authRoutes.post("/refresh-token", refreshToken);

export default authRoutes;
