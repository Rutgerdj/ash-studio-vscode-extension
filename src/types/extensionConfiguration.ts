import { LogLevel } from "../utils/logger";

export interface AshStudioConfig {
  logLevel: LogLevel;
  enableCodeLens: boolean;
  alternativeDeclarationPatterns: Record<string, string>;
}
