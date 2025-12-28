export enum FeatureFlag {
  PROJECT_INVITES = "project_invites",
}

interface FeatureFlagConfig {
  [key: string]: boolean;
}

class FeatureFlagService {
  private flags: FeatureFlagConfig = {
    [FeatureFlag.PROJECT_INVITES]: true,
  };

  constructor() {
    this.loadFromEnvironment();
  }

  // Load from environment variables
  private loadFromEnvironment(): void {
    Object.values(FeatureFlag).forEach((flag) => {
      const envKey = `FEATURE_FLAG_${flag.toUpperCase()}`;
      const envValue = process.env[envKey];

      if (envValue !== undefined) {
        this.flags[flag] = envValue === "true" || envValue === "1";
      }
    });
  }

  // Check if a feature is enabled
  isEnabled(flag: FeatureFlag): boolean {
    return this.flags[flag] ?? false;
  }

  // Enable feature at runtime
  enable(flag: FeatureFlag): void {
    this.flags[flag] = true;
  }

  // Disable feature at runtime
  disable(flag: FeatureFlag): void {
    this.flags[flag] = false;
  }

  // Get all flags
  getAllFlags(): FeatureFlagConfig {
    return { ...this.flags };
  }
}

export const featureFlags = new FeatureFlagService();
