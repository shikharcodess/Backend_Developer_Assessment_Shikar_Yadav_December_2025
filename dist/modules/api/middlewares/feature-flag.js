"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireFeature = void 0;
const feature_flags_1 = require("../../../common/feature-flags");
const requireFeature = (flag) => {
    return (req, res, next) => {
        if (!feature_flags_1.featureFlags.isEnabled(flag)) {
            res.status(403).json({
                message: "Feature not available",
                error: `The feature '${flag}' is currently disabled`,
            });
            return;
        }
        next();
    };
};
exports.requireFeature = requireFeature;
//# sourceMappingURL=feature-flag.js.map