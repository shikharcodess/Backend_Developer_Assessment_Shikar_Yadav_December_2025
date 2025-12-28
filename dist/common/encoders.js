"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeBase64 = encodeBase64;
exports.decodeBase64 = decodeBase64;
exports.hashPassword = hashPassword;
const bcrypt_1 = __importDefault(require("bcrypt"));
function encodeBase64(input) {
    return Buffer.from(input, "utf-8").toString("base64");
}
function decodeBase64(encoded) {
    return Buffer.from(encoded, "base64").toString("utf-8");
}
async function hashPassword(password, saltRound) {
    const hashedPassword = await bcrypt_1.default.hash(password, saltRound);
    return hashedPassword;
}
//# sourceMappingURL=encoders.js.map