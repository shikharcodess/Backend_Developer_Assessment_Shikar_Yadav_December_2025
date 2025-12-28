import { Router } from "express";
import { authMiddleware } from "../middlewares/authorization";
import { GetCurrentLoggedInUser } from "../controllers/user";

const userRoutes = Router();

userRoutes.get("/me", authMiddleware, GetCurrentLoggedInUser);

export default userRoutes;
