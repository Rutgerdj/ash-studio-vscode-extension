import { ModuleConfiguration } from "../types/configurationRegistry";
import { AlternativeDeclarationPatterns } from "../types/parser";
import { normalizeAlternativeDeclarationPatterns } from "./alternativeDeclarationPatterns";

/**
 * Service for identifying which ModuleConfiguration configurations are present in use declarations.
 */
export class ModuleMatcherService {
  /**
   * Takes raw use declaration strings and matches them against available configs.
   *
   * @param useDeclarations Array of use declaration strings found in the file
   * @param availableConfigs Available module configurations to match against
   * @param alternativePatterns Optional mapping of alternative patterns to one or more standard patterns
   *                            e.g., { "App.Resource": ["Ash.Resource", "AshPostgres.DataLayer"], "App.Domain": "Ash.Domain" }
   *                            Invalid entries are ignored.
   */
  identifyConfiguredModules(
    useDeclarations: string[],
    availableConfigs: ModuleConfiguration[],
    alternativePatterns: AlternativeDeclarationPatterns = {}
  ): ModuleConfiguration[] {
    const matchedConfigs: ModuleConfiguration[] = [];

    // Precompute standard pattern -> alternative patterns that map to it
    const alternativesByStandard = new Map<string, string[]>();
    for (const [altPattern, standardPatterns] of Object.entries(
      normalizeAlternativeDeclarationPatterns(alternativePatterns)
    )) {
      for (const standardPattern of standardPatterns) {
        const alternatives = alternativesByStandard.get(standardPattern) ?? [];
        alternatives.push(altPattern);
        alternativesByStandard.set(standardPattern, alternatives);
      }
    }

    for (const useDeclaration of useDeclarations) {
      for (const config of availableConfigs) {
        // Check if declaration matches the standard pattern
        const matchesStandard = useDeclaration.includes(
          config.declarationPattern
        );

        // Check if declaration matches any configured alternative pattern
        const matchesAlternative = (
          alternativesByStandard.get(config.declarationPattern) ?? []
        ).some(altPattern => useDeclaration.includes(altPattern));

        if (matchesStandard || matchesAlternative) {
          // Only add if not already in the list
          if (
            !matchedConfigs.find(
              c => c.declarationPattern === config.declarationPattern
            )
          ) {
            matchedConfigs.push(config);
          }
        }
      }
    }

    return matchedConfigs;
  }
}
