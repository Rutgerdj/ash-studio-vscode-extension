import { LogLevel } from "../utils/logger";
import { AlternativeDeclarationPatterns } from "./parser";

export interface AshStudioConfig {
  logLevel: LogLevel;
  enableCodeLens: boolean;
  alternativeDeclarationPatterns: AlternativeDeclarationPatterns;
}
