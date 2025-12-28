"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
exports.login = login;
exports.logout = logout;
exports.refreshToken = refreshToken;
const auth_1 = require("../validators/auth");
const zod_1 = require("zod");
const db_1 = require("../../../config/db/db");
const encoders_1 = require("../../../common/encoders");
const crypto_1 = require("crypto");
const jwt_1 = require("../../../common/jwt");
const bcrypt_1 = __importDefault(require("bcrypt"));
const env_1 = require("../../../config/env/env");
/**
 * @openapi
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account with email, name, and password
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               name:
 *                 type: string
 *                 example: John Doe
 *               password:
 *                 type: string
 *                 format: password
 *                 example: securePassword123
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation failed or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errors:
 *                   type: string
 *       500:
 *         description: Internal server error
 */
async function registerUser(req, res) {
    try {
        const parsed = auth_1.createUserSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                message: "Validation failed",
                errors: zod_1.z.treeifyError(parsed.error),
            });
            return;
        }
        const { email, name, password } = parsed.data;
        const userFound = await db_1.prisma.user.findFirst({ where: { email: email } });
        if (userFound) {
            res.status(400).json({
                message: "Constraint failed",
                errors: "email already present",
            });
            return;
        }
        const hashedPassword = await (0, encoders_1.hashPassword)(password, 12);
        await db_1.prisma.user.create({
            data: { name: name, email: email, passwordHash: hashedPassword },
        });
        res.status(201).send();
        return;
    }
    catch (error) {
        res.status(500).json({
            message: "Internal server error",
            errors: "Something went wrong",
        });
    }
}
/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate user and receive access and refresh tokens
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: securePassword123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */
async function login(req, res) {
    try {
        const parsed = auth_1.userLoginSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                message: "Validation failed",
                errors: zod_1.z.treeifyError(parsed.error),
            });
            return;
        }
        const { email, password } = parsed.data;
        const userFound = await db_1.prisma.user.findUnique({
            where: {
                email: email,
            },
        });
        if (!userFound) {
            res.status(401).json({
                message: "Validation failed",
                errors: "Invalid credentials",
            });
            return;
        }
        const isPasswordValid = await bcrypt_1.default.compare(password, userFound.passwordHash);
        if (!isPasswordValid) {
            res.status(401).json({
                message: "Validation failed",
                errors: "Invalid credentials",
            });
            return;
        }
        const refreshTokenId = (0, crypto_1.randomUUID)();
        const accessToken = (0, jwt_1.generateToken)({
            sub: userFound.id,
        }, env_1.ENV.JWT_ACCESS_EXPIRES_IN || "5m");
        const refreshToken = (0, jwt_1.generateToken)({
            sub: userFound.id,
            jti: refreshTokenId,
        }, env_1.ENV.JWT_REFRESH_EXPIRES_IN || "1d");
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + 1);
        await db_1.prisma.refreshToken.create({
            data: {
                id: refreshTokenId,
                userId: userFound.id,
                token: await (0, encoders_1.hashPassword)(refreshToken, 12),
                expiresAt: currentDate,
            },
        });
        res.status(200).json({
            data: {
                access_token: accessToken,
                refresh_token: refreshToken,
            },
        });
        return;
    }
    catch (error) {
        res.status(500).json({
            message: "Internal server error",
            errors: "Something went wrong",
        });
    }
}
/**
 * @openapi
 * /auth/logout:
 *   delete:
 *     summary: User logout
 *     description: Revoke all refresh tokens for the authenticated user
 *     tags:
 *       - Authentication
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
async function logout(req, res) {
    try {
        const userData = req.metadata?.userData;
        if (!userData) {
            res.status(401).json({
                message: "Unauthorized",
                errors: "Request failed because it lacks valid authentication",
            });
            return;
        }
        await db_1.prisma.refreshToken.updateMany({
            where: { userId: userData.id, revoked: false },
            data: { revoked: true, expiresAt: new Date() },
        });
        res.status(200).send();
        return;
    }
    catch (error) {
        res.status(500).json({
            message: "Internal server error",
            errors: "Something went wrong",
        });
    }
}
/**
 * @openapi
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     description: Generate new access token using refresh token
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token:
 *                   type: string
 *       401:
 *         description: Invalid or expired refresh token
 *       500:
 *         description: Internal server error
 */
async function refreshToken(req, res) {
    try {
        const parsed = auth_1.userRefreshTokenSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                message: "Validation failed",
                errors: zod_1.z.treeifyError(parsed.error),
            });
            return;
        }
        const { refresh_token } = parsed.data;
        let payload;
        try {
            payload = (0, jwt_1.validateToken)(refresh_token);
        }
        catch (error) {
            res.status(403).json({
                message: "Forbidden",
            });
            return;
        }
        const userFound = await db_1.prisma.user.findUnique({
            where: { id: payload.sub },
        });
        if (!userFound) {
            res.status(403).json({
                message: "Forbidden",
            });
            return;
        }
        const storedToken = await db_1.prisma.refreshToken.findUnique({
            where: { id: payload.jti },
        });
        if (!storedToken ||
            storedToken.revoked ||
            storedToken.expiresAt < new Date()) {
            res.status(403).json({ message: "Forbidden" });
            return;
        }
        const isTokenValid = await bcrypt_1.default.compare(refresh_token, storedToken.token);
        if (!isTokenValid) {
            res.status(403).json({ message: "Forbidden" });
            return;
        }
        await db_1.prisma.refreshToken.update({
            where: { id: payload.jti },
            data: { revoked: true, expiresAt: new Date() },
        });
        const refreshTokenId = (0, crypto_1.randomUUID)();
        const accessToken = (0, jwt_1.generateToken)({
            sub: userFound.id,
        }, env_1.ENV.JWT_ACCESS_EXPIRES_IN || "5m");
        const refreshToken = (0, jwt_1.generateToken)({
            sub: userFound.id,
            jti: refreshTokenId,
        }, env_1.ENV.JWT_REFRESH_EXPIRES_IN || "1d");
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + 1);
        await db_1.prisma.refreshToken.create({
            data: {
                id: refreshTokenId,
                userId: userFound.id,
                token: await (0, encoders_1.hashPassword)(refreshToken, 12),
                expiresAt: currentDate,
            },
        });
        res.status(200).json({
            data: {
                access_token: accessToken,
                refresh_token: refreshToken,
            },
        });
        return;
    }
    catch (error) {
        res.status(500).json({
            message: "Internal server error",
            errors: "Something went wrong",
        });
    }
}
//# sourceMappingURL=auth.js.map