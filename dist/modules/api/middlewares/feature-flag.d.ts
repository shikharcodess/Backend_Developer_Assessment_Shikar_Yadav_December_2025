import { Request, Response, NextFunction } from "express";
import { FeatureFlag } from "../../../common/feature-flags";
export declare const requireFeature: (flag: FeatureFlag) => (req: Request, res: Response, next: NextFunction) => void;
