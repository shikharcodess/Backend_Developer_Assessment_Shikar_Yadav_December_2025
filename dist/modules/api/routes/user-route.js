"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authorization_1 = require("../middlewares/authorization");
const user_1 = require("../controllers/user");
const userRoutes = (0, express_1.Router)();
userRoutes.get("/me", authorization_1.authMiddleware, user_1.GetCurrentLoggedInUser);
exports.default = userRoutes;
//# sourceMappingURL=user-route.js.map