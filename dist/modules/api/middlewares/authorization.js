"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jwt_1 = require("../../../common/jwt");
const db_1 = require("../../../config/db/db");
async function authMiddleware(req, res, next) {
    try {
        const { authorization } = req.headers;
        if (!authorization) {
            res.statusCode = 403;
            res.json({ error: { message: "Forbidden" } });
            return;
        }
        let splitKey;
        if (authorization.includes("Bearer")) {
            splitKey = "Bearer ";
        }
        else if (authorization.includes("bearer")) {
            splitKey = "bearer ";
        }
        else {
            throw new Error("wrong authorization token");
        }
        const tokenArray = authorization.split("Bearer ");
        if (tokenArray.length == 2) {
            const token = tokenArray[1];
            const tokenPayload = (0, jwt_1.validateToken)(token);
            if (!tokenPayload) {
                res.statusCode = 403;
                res.json({ error: { message: "Forbidden" } });
                return;
            }
            const userData = await db_1.prisma.user.findUnique({
                where: {
                    id: tokenPayload.sub,
                },
            });
            if (userData == null) {
                res.statusCode = 401;
                res.json({ error: { message: "Unauthorized" } });
                return;
            }
            const requestMetadata = {
                userData: userData,
            };
            req.metadata = requestMetadata;
            next();
        }
        else {
            res.statusCode = 403;
            res.json({ error: { message: "Forbidden" } });
            return;
        }
    }
    catch (error) {
        res.statusCode = 401;
        res.json({ error: { message: error.toString() } });
        return;
    }
}
//# sourceMappingURL=authorization.js.map