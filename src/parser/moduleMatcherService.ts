import { ModuleConfiguration } from "../types/configurationRegistry";

/**
 * Service for identifying which ModuleConfiguration configurations are present in use declarations.
 */
export class ModuleMatcherService {
  /**
   * Takes raw use declaration strings and matches them against available configs.
   *
   * @param useDeclarations Array of use declaration strings found in the file
   * @param availableConfigs Available module configurations to match against
   * @param alternativePatterns Optional mapping of alternative patterns to standard patterns
   *                            e.g., { "App.Resource": "Ash.Resource", "App.Domain": "Ash.Domain" }
   */
  identifyConfiguredModules(
    useDeclarations: string[],
    availableConfigs: ModuleConfiguration[],

    alternativePatterns: Record<string, string> = {}
  ): ModuleConfiguration[] {
    const matchedConfigs: ModuleConfiguration[] = [];

    for (const useDeclaration of useDeclarations) {
      for (const config of availableConfigs) {
        // Check if declaration matches the standard pattern
        const matchesStandard = useDeclaration.includes(
          config.declarationPattern
        );

        // Check if declaration matches any configured alternative pattern
        const matchesAlternative = Object.entries(alternativePatterns).some(
          ([altPattern, standardPattern]) =>
            standardPattern === config.declarationPattern &&
            useDeclaration.includes(altPattern)
        );

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
