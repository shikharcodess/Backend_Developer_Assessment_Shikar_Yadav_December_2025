"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.validateToken = validateToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Function to generate a JWT token
function generateToken(payload, expiresIn = "1h") {
    const key = (process.env.JWT_SECRET_KEY ?? "wjwieud292ud");
    return jsonwebtoken_1.default.sign(payload, key, { expiresIn: expiresIn });
}
// Function to validate a JWT token
function validateToken(token) {
    try {
        const key = process.env.JWT_SECRET_KEY ?? "wjwieud292ud";
        const decoded = jsonwebtoken_1.default.verify(token, key);
        return decoded;
    }
    catch (err) {
        console.error("Invalid token:", err);
        return null;
    }
}
//# sourceMappingURL=jwt.js.map