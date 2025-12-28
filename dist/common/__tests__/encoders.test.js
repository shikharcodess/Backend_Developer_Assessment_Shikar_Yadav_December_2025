"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const encoders_1 = require("../../common/encoders");
const bcrypt_1 = __importDefault(require("bcrypt"));
describe("Encoder/Decoder Functions", () => {
    describe("encodeBase64", () => {
        it("should encode a string to base64", () => {
            const input = "Hello World";
            const encoded = (0, encoders_1.encodeBase64)(input);
            expect(encoded).toBe("SGVsbG8gV29ybGQ=");
            expect(typeof encoded).toBe("string");
        });
        it("should encode empty string", () => {
            const input = "";
            const encoded = (0, encoders_1.encodeBase64)(input);
            expect(encoded).toBe("");
        });
        it("should encode special characters", () => {
            const input = "Test@123!#$%";
            const encoded = (0, encoders_1.encodeBase64)(input);
            expect(encoded).toBeTruthy();
            expect(typeof encoded).toBe("string");
        });
        it("should encode unicode characters", () => {
            const input = "Hello 世界 🌍";
            const encoded = (0, encoders_1.encodeBase64)(input);
            expect(encoded).toBeTruthy();
            expect(typeof encoded).toBe("string");
        });
        it("should produce different output for different inputs", () => {
            const input1 = "test1";
            const input2 = "test2";
            const encoded1 = (0, encoders_1.encodeBase64)(input1);
            const encoded2 = (0, encoders_1.encodeBase64)(input2);
            expect(encoded1).not.toBe(encoded2);
        });
    });
    describe("decodeBase64", () => {
        it("should decode a base64 string", () => {
            const encoded = "SGVsbG8gV29ybGQ=";
            const decoded = (0, encoders_1.decodeBase64)(encoded);
            expect(decoded).toBe("Hello World");
        });
        it("should decode empty string", () => {
            const encoded = "";
            const decoded = (0, encoders_1.decodeBase64)(encoded);
            expect(decoded).toBe("");
        });
        it("should decode special characters", () => {
            const original = "Test@123!#$%";
            const encoded = (0, encoders_1.encodeBase64)(original);
            const decoded = (0, encoders_1.decodeBase64)(encoded);
            expect(decoded).toBe(original);
        });
        it("should decode unicode characters", () => {
            const original = "Hello 世界 🌍";
            const encoded = (0, encoders_1.encodeBase64)(original);
            const decoded = (0, encoders_1.decodeBase64)(encoded);
            expect(decoded).toBe(original);
        });
    });
    describe("Base64 Round Trip", () => {
        it("should encode and decode back to original string", () => {
            const testCases = [
                "Simple text",
                "Email: test@example.com",
                "Password: P@ssw0rd!123",
                'JSON: {"key":"value"}',
                "Numbers: 1234567890",
                "Mixed: 测试 Test 123 !@#",
            ];
            testCases.forEach((original) => {
                const encoded = (0, encoders_1.encodeBase64)(original);
                const decoded = (0, encoders_1.decodeBase64)(encoded);
                expect(decoded).toBe(original);
            });
        });
        it("should handle long strings", () => {
            const original = "a".repeat(1000);
            const encoded = (0, encoders_1.encodeBase64)(original);
            const decoded = (0, encoders_1.decodeBase64)(encoded);
            expect(decoded).toBe(original);
        });
    });
    describe("hashPassword", () => {
        it("should hash a password", async () => {
            const password = "mySecurePassword123";
            const hashed = await (0, encoders_1.hashPassword)(password, 10);
            expect(hashed).toBeTruthy();
            expect(typeof hashed).toBe("string");
            expect(hashed).not.toBe(password);
            expect(hashed.length).toBeGreaterThan(20);
        });
        it("should create different hashes for same password", async () => {
            const password = "testPassword";
            const hash1 = await (0, encoders_1.hashPassword)(password, 10);
            const hash2 = await (0, encoders_1.hashPassword)(password, 10);
            expect(hash1).not.toBe(hash2); // Bcrypt uses random salt
        });
        it("should verify hashed password with bcrypt.compare", async () => {
            const password = "correctPassword";
            const hashed = await (0, encoders_1.hashPassword)(password, 10);
            const isMatch = await bcrypt_1.default.compare(password, hashed);
            expect(isMatch).toBe(true);
        });
        it("should not match with wrong password", async () => {
            const password = "correctPassword";
            const wrongPassword = "wrongPassword";
            const hashed = await (0, encoders_1.hashPassword)(password, 10);
            const isMatch = await bcrypt_1.default.compare(wrongPassword, hashed);
            expect(isMatch).toBe(false);
        });
        it("should hash empty password", async () => {
            const password = "";
            const hashed = await (0, encoders_1.hashPassword)(password, 10);
            expect(hashed).toBeTruthy();
            const isMatch = await bcrypt_1.default.compare(password, hashed);
            expect(isMatch).toBe(true);
        });
        it("should hash password with special characters", async () => {
            const password = "P@ssw0rd!#$%^&*()";
            const hashed = await (0, encoders_1.hashPassword)(password, 10);
            expect(hashed).toBeTruthy();
            const isMatch = await bcrypt_1.default.compare(password, hashed);
            expect(isMatch).toBe(true);
        });
        it("should respect different salt rounds", async () => {
            const password = "testPassword";
            const hash1 = await (0, encoders_1.hashPassword)(password, 4);
            const hash2 = await (0, encoders_1.hashPassword)(password, 10);
            // Both should be valid hashes
            expect(hash1).toBeTruthy();
            expect(hash2).toBeTruthy();
            // Both should verify correctly
            const isMatch1 = await bcrypt_1.default.compare(password, hash1);
            const isMatch2 = await bcrypt_1.default.compare(password, hash2);
            expect(isMatch1).toBe(true);
            expect(isMatch2).toBe(true);
        });
        it("should handle long passwords", async () => {
            const password = "a".repeat(100);
            const hashed = await (0, encoders_1.hashPassword)(password, 10);
            const isMatch = await bcrypt_1.default.compare(password, hashed);
            expect(isMatch).toBe(true);
        });
    });
});
//# sourceMappingURL=encoders.test.js.map