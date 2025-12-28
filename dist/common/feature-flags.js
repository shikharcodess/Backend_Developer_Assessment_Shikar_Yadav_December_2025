"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.featureFlags = exports.FeatureFlag = void 0;
var FeatureFlag;
(function (FeatureFlag) {
    FeatureFlag["PROJECT_INVITES"] = "project_invites";
})(FeatureFlag || (exports.FeatureFlag = FeatureFlag = {}));
class FeatureFlagService {
    constructor() {
        this.flags = {
            [FeatureFlag.PROJECT_INVITES]: true,
        };
        this.loadFromEnvironment();
    }
    // Load from environment variables
    loadFromEnvironment() {
        Object.values(FeatureFlag).forEach((flag) => {
            const envKey = `FEATURE_FLAG_${flag.toUpperCase()}`;
            const envValue = process.env[envKey];
            if (envValue !== undefined) {
                this.flags[flag] = envValue === "true" || envValue === "1";
            }
        });
    }
    // Check if a feature is enabled
    isEnabled(flag) {
        return this.flags[flag] ?? false;
    }
    // Enable feature at runtime
    enable(flag) {
        this.flags[flag] = true;
    }
    // Disable feature at runtime
    disable(flag) {
        this.flags[flag] = false;
    }
    // Get all flags
    getAllFlags() {
        return { ...this.flags };
    }
}
exports.featureFlags = new FeatureFlagService();
//# sourceMappingURL=feature-flags.js.map