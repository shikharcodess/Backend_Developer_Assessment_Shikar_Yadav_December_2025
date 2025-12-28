import {
  uuidSchema,
  emailSchema,
  createUserSchema,
  userLoginSchema,
  userLogoutSchema,
  userRefreshTokenSchema,
  updateUserSchema,
} from "../auth";

describe("Auth Validators", () => {
  describe("uuidSchema", () => {
    it("should validate a valid UUID", () => {
      const validUuid = "123e4567-e89b-12d3-a456-426614174000";
      const result = uuidSchema.safeParse(validUuid);

      expect(result.success).toBe(true);
    });

    it("should reject invalid UUID", () => {
      const invalidUuid = "not-a-uuid";
      const result = uuidSchema.safeParse(invalidUuid);

      expect(result.success).toBe(false);
    });

    it("should reject empty string", () => {
      const result = uuidSchema.safeParse("");
      expect(result.success).toBe(false);
    });
  });

  describe("emailSchema", () => {
    it("should validate a valid email", () => {
      const validEmail = "test@example.com";
      const result = emailSchema.safeParse(validEmail);

      expect(result.success).toBe(true);
    });

    it("should reject invalid email format", () => {
      const invalidEmails = [
        "not-an-email",
        "@example.com",
        "test@",
        "test.example.com",
        "",
      ];

      invalidEmails.forEach((email) => {
        const result = emailSchema.safeParse(email);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("createUserSchema", () => {
    it("should validate valid user data", () => {
      const validUser = {
        email: "test@example.com",
        name: "John Doe",
        password: "password123",
      };

      const result = createUserSchema.safeParse(validUser);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validUser);
      }
    });

    it("should reject invalid email", () => {
      const invalidUser = {
        email: "invalid-email",
        name: "John Doe",
        password: "password123",
      };

      const result = createUserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });

    it("should reject name shorter than 2 characters", () => {
      const invalidUser = {
        email: "test@example.com",
        name: "J",
        password: "password123",
      };

      const result = createUserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });

    it("should reject name longer than 100 characters", () => {
      const invalidUser = {
        email: "test@example.com",
        name: "a".repeat(101),
        password: "password123",
      };

      const result = createUserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });

    it("should reject password shorter than 8 characters", () => {
      const invalidUser = {
        email: "test@example.com",
        name: "John Doe",
        password: "pass",
      };

      const result = createUserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });

    it("should reject missing fields", () => {
      const incompleteUser = {
        email: "test@example.com",
        name: "John Doe",
      };

      const result = createUserSchema.safeParse(incompleteUser);
      expect(result.success).toBe(false);
    });
  });

  describe("userLoginSchema", () => {
    it("should validate valid login data", () => {
      const validLogin = {
        email: "test@example.com",
        password: "password123",
      };

      const result = userLoginSchema.safeParse(validLogin);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validLogin);
      }
    });

    it("should reject invalid email", () => {
      const invalidLogin = {
        email: "not-an-email",
        password: "password123",
      };

      const result = userLoginSchema.safeParse(invalidLogin);
      expect(result.success).toBe(false);
    });

    it("should reject short password", () => {
      const invalidLogin = {
        email: "test@example.com",
        password: "short",
      };

      const result = userLoginSchema.safeParse(invalidLogin);
      expect(result.success).toBe(false);
    });

    it("should reject missing fields", () => {
      const result = userLoginSchema.safeParse({ email: "test@example.com" });
      expect(result.success).toBe(false);
    });
  });

  describe("userLogoutSchema", () => {
    it("should validate valid logout data", () => {
      const validLogout = {
        refresh_token: "valid-token-string",
      };

      const result = userLogoutSchema.safeParse(validLogout);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validLogout);
      }
    });

    it("should reject token shorter than 2 characters", () => {
      const invalidLogout = {
        refresh_token: "a",
      };

      const result = userLogoutSchema.safeParse(invalidLogout);
      expect(result.success).toBe(false);
    });

    it("should reject missing refresh_token", () => {
      const result = userLogoutSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe("userRefreshTokenSchema", () => {
    it("should validate valid refresh token data", () => {
      const validData = {
        refresh_token: "valid-refresh-token",
      };

      const result = userRefreshTokenSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it("should reject short token", () => {
      const invalidData = {
        refresh_token: "x",
      };

      const result = userRefreshTokenSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("updateUserSchema", () => {
    it("should validate valid update data with name", () => {
      const validUpdate = {
        name: "Updated Name",
      };

      const result = updateUserSchema.safeParse(validUpdate);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validUpdate);
      }
    });

    it("should validate valid update data with isActive", () => {
      const validUpdate = {
        isActive: false,
      };

      const result = updateUserSchema.safeParse(validUpdate);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validUpdate);
      }
    });

    it("should validate update with both fields", () => {
      const validUpdate = {
        name: "Updated Name",
        isActive: true,
      };

      const result = updateUserSchema.safeParse(validUpdate);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validUpdate);
      }
    });

    it("should validate empty object (all fields optional)", () => {
      const result = updateUserSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("should reject name shorter than 2 characters", () => {
      const invalidUpdate = {
        name: "J",
      };

      const result = updateUserSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
    });

    it("should reject name longer than 100 characters", () => {
      const invalidUpdate = {
        name: "a".repeat(101),
      };

      const result = updateUserSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
    });

    it("should reject non-boolean isActive", () => {
      const invalidUpdate = {
        isActive: "true" as any,
      };

      const result = updateUserSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
    });
  });
});
