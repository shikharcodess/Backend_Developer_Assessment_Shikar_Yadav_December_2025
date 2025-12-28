"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../controllers/auth");
const authorization_1 = require("../middlewares/authorization");
const authRoutes = (0, express_1.Router)();
authRoutes.post("/signup", auth_1.registerUser);
authRoutes.post("/login", auth_1.login);
authRoutes.delete("/logout", authorization_1.authMiddleware, auth_1.logout);
authRoutes.post("/refresh-token", auth_1.refreshToken);
exports.default = authRoutes;
//# sourceMappingURL=auth-route.js.map