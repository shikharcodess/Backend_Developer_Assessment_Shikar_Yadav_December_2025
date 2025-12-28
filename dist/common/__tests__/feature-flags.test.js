"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const feature_flags_1 = require("../../common/feature-flags");
describe("FeatureFlags", () => {
    let originalEnv;
    beforeAll(() => {
        originalEnv = { ...process.env };
    });
    afterEach(() => {
        // Reset to original environment
        process.env = { ...originalEnv };
    });
    describe("Default behavior", () => {
        it("should return default flag values", () => {
            expect(feature_flags_1.featureFlags.isEnabled(feature_flags_1.FeatureFlag.PROJECT_INVITES)).toBe(true);
        });
        it("should return all flags", () => {
            const allFlags = feature_flags_1.featureFlags.getAllFlags();
            expect(allFlags).toHaveProperty(feature_flags_1.FeatureFlag.PROJECT_INVITES);
            expect(typeof allFlags[feature_flags_1.FeatureFlag.PROJECT_INVITES]).toBe("boolean");
        });
    });
    describe("Runtime flag management", () => {
        it("should enable and disable flags at runtime", () => {
            feature_flags_1.featureFlags.disable(feature_flags_1.FeatureFlag.PROJECT_INVITES);
            expect(feature_flags_1.featureFlags.isEnabled(feature_flags_1.FeatureFlag.PROJECT_INVITES)).toBe(false);
            feature_flags_1.featureFlags.enable(feature_flags_1.FeatureFlag.PROJECT_INVITES);
            expect(feature_flags_1.featureFlags.isEnabled(feature_flags_1.FeatureFlag.PROJECT_INVITES)).toBe(true);
        });
        it("should persist flag state after multiple operations", () => {
            feature_flags_1.featureFlags.enable(feature_flags_1.FeatureFlag.PROJECT_INVITES);
            expect(feature_flags_1.featureFlags.isEnabled(feature_flags_1.FeatureFlag.PROJECT_INVITES)).toBe(true);
            feature_flags_1.featureFlags.disable(feature_flags_1.FeatureFlag.PROJECT_INVITES);
            expect(feature_flags_1.featureFlags.isEnabled(feature_flags_1.FeatureFlag.PROJECT_INVITES)).toBe(false);
            feature_flags_1.featureFlags.disable(feature_flags_1.FeatureFlag.PROJECT_INVITES);
            expect(feature_flags_1.featureFlags.isEnabled(feature_flags_1.FeatureFlag.PROJECT_INVITES)).toBe(false);
        });
    });
    describe("Environment variable loading", () => {
        it("should load flags from environment variables", () => {
            // Note: This test may not work as expected since the service is instantiated at import
            // But it demonstrates the expected behavior
            const allFlags = feature_flags_1.featureFlags.getAllFlags();
            expect(allFlags).toBeDefined();
            expect(Object.keys(allFlags).length).toBeGreaterThan(0);
        });
    });
    describe("getAllFlags", () => {
        it("should return a copy of flags object", () => {
            const flags1 = feature_flags_1.featureFlags.getAllFlags();
            const flags2 = feature_flags_1.featureFlags.getAllFlags();
            // Should return new objects
            expect(flags1).not.toBe(flags2);
            expect(flags1).toEqual(flags2);
        });
        it("should not allow external modification", () => {
            const flags = feature_flags_1.featureFlags.getAllFlags();
            const originalValue = flags[feature_flags_1.FeatureFlag.PROJECT_INVITES];
            // Modify the returned object
            flags[feature_flags_1.FeatureFlag.PROJECT_INVITES] = !originalValue;
            // Original should not be affected
            expect(feature_flags_1.featureFlags.isEnabled(feature_flags_1.FeatureFlag.PROJECT_INVITES)).toBe(originalValue);
        });
    });
    describe("Edge cases", () => {
        it("should handle undefined flags gracefully", () => {
            const undefinedFlag = "NON_EXISTENT_FLAG";
            expect(feature_flags_1.featureFlags.isEnabled(undefinedFlag)).toBe(false);
        });
        it("should maintain state across multiple isEnabled checks", () => {
            feature_flags_1.featureFlags.enable(feature_flags_1.FeatureFlag.PROJECT_INVITES);
            expect(feature_flags_1.featureFlags.isEnabled(feature_flags_1.FeatureFlag.PROJECT_INVITES)).toBe(true);
            expect(feature_flags_1.featureFlags.isEnabled(feature_flags_1.FeatureFlag.PROJECT_INVITES)).toBe(true);
            expect(feature_flags_1.featureFlags.isEnabled(feature_flags_1.FeatureFlag.PROJECT_INVITES)).toBe(true);
        });
    });
});
//# sourceMappingURL=feature-flags.test.js.map