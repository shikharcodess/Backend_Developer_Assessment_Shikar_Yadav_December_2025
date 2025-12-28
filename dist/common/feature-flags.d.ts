export declare enum FeatureFlag {
    PROJECT_INVITES = "project_invites"
}
interface FeatureFlagConfig {
    [key: string]: boolean;
}
declare class FeatureFlagService {
    private flags;
    constructor();
    private loadFromEnvironment;
    isEnabled(flag: FeatureFlag): boolean;
    enable(flag: FeatureFlag): void;
    disable(flag: FeatureFlag): void;
    getAllFlags(): FeatureFlagConfig;
}
export declare const featureFlags: FeatureFlagService;
export {};
