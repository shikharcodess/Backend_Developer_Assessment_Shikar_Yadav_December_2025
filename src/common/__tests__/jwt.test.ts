import { generateToken, validateToken } from "../../common/jwt";
import jwt from "jsonwebtoken";

describe("JWT Token Functions", () => {
  const testSecret = "test-secret-key";
  const originalSecret = process.env.JWT_SECRET_KEY;

  beforeAll(() => {
    process.env.JWT_SECRET_KEY = testSecret;
  });

  afterAll(() => {
    process.env.JWT_SECRET_KEY = originalSecret;
  });

  describe("generateToken", () => {
    it("should generate a valid JWT token", () => {
      const payload = { sub: "user123", email: "test@example.com" };
      const token = generateToken(payload, "1h");

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".").length).toBe(3); // JWT has 3 parts
    });

    it("should include payload in generated token", () => {
      const payload = { sub: "user123", role: "admin" };
      const token = generateToken(payload, "1h");

      const decoded = jwt.verify(token, testSecret) as any;
      expect(decoded.sub).toBe("user123");
      expect(decoded.role).toBe("admin");
    });

    it("should respect custom expiry time", () => {
      const payload = { sub: "user123" };
      const token = generateToken(payload, "2h");

      const decoded = jwt.verify(token, testSecret) as any;
      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp - decoded.iat).toBe(7200); // 2 hours in seconds
    });

    it("should accept numeric expiry time", () => {
      const payload = { sub: "user123" };
      const token = generateToken(payload, 3600); // 1 hour in seconds

      const decoded = jwt.verify(token, testSecret) as any;
      expect(decoded.exp - decoded.iat).toBe(3600);
    });
  });

  describe("validateToken", () => {
    it("should validate a valid token", () => {
      const payload = { sub: "user123", email: "test@example.com" };
      const token = generateToken(payload, "1h");

      const decoded = validateToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.sub).toBe("user123");
      expect(decoded.email).toBe("test@example.com");
    });

    it("should return null for invalid token", () => {
      const invalidToken = "invalid.token.here";
      const decoded = validateToken(invalidToken);

      expect(decoded).toBeNull();
    });

    it("should return null for expired token", () => {
      const payload = { sub: "user123" };
      const token = jwt.sign(payload, testSecret, { expiresIn: "-1h" }); // Expired 1 hour ago

      const decoded = validateToken(token);

      expect(decoded).toBeNull();
    });

    it("should return null for token with wrong signature", () => {
      const payload = { sub: "user123" };
      const token = jwt.sign(payload, "wrong-secret", { expiresIn: "1h" });

      const decoded = validateToken(token);

      expect(decoded).toBeNull();
    });

    it("should return null for malformed token", () => {
      const malformedToken = "not-a-jwt-token";
      const decoded = validateToken(malformedToken);

      expect(decoded).toBeNull();
    });

    it("should preserve all payload fields", () => {
      const payload = {
        sub: "user123",
        email: "test@example.com",
        role: "admin",
        jti: "token-id-123",
      };
      const token = generateToken(payload, "1h");

      const decoded = validateToken(token);

      expect(decoded.sub).toBe("user123");
      expect(decoded.email).toBe("test@example.com");
      expect(decoded.role).toBe("admin");
      expect(decoded.jti).toBe("token-id-123");
    });
  });

  describe("Token Round Trip", () => {
    it("should generate and validate token successfully", () => {
      const originalPayload = {
        sub: "user456",
        email: "roundtrip@example.com",
        name: "Test User",
      };

      const token = generateToken(originalPayload, "30m");
      const decodedPayload = validateToken(token);

      expect(decodedPayload).toBeDefined();
      expect(decodedPayload.sub).toBe(originalPayload.sub);
      expect(decodedPayload.email).toBe(originalPayload.email);
      expect(decodedPayload.name).toBe(originalPayload.name);
    });
  });
});
