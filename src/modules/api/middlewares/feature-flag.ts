import { Request, Response, NextFunction } from "express";
import { featureFlags, FeatureFlag } from "../../../common/feature-flags";

export const requireFeature = (flag: FeatureFlag) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!featureFlags.isEnabled(flag)) {
      res.status(403).json({
        message: "Feature not available",
        error: `The feature '${flag}' is currently disabled`,
      });
      return;
    }

    next();
  };
};
