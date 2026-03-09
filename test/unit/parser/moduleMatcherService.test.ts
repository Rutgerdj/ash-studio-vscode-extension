/**
 * Test suite for ModuleMatcherService
 */

import { ModuleMatcherService } from "../../../src/parser/moduleMatcherService";
import { ModuleConfiguration } from "../../../src/types/configurationRegistry";

describe("ModuleMatcherService", () => {
  const mockConfigs: ModuleConfiguration[] = [
    {
      displayName: "Ash.Resource",
      declarationPattern: "Ash.Resource",
      dslSections: [],
    },
    {
      displayName: "Ash.Domain",
      declarationPattern: "Ash.Domain",
      dslSections: [],
    },
    {
      displayName: "AshGraphql",
      declarationPattern: "AshGraphql.Resource",
      dslSections: [],
    },
  ];

  describe("identifyConfiguredModules", () => {
    it("should match standard Ash.Resource declaration", () => {
      const service = new ModuleMatcherService();
      const useDeclarations = ["use Ash.Resource"];
      const result = service.identifyConfiguredModules(
        useDeclarations,
        mockConfigs
      );

      expect(result).toHaveLength(1);
      expect(result[0].declarationPattern).toBe("Ash.Resource");
    });

    it("should match standard Ash.Domain declaration", () => {
      const service = new ModuleMatcherService();
      const useDeclarations = ["use Ash.Domain"];
      const result = service.identifyConfiguredModules(
        useDeclarations,
        mockConfigs
      );

      expect(result).toHaveLength(1);
      expect(result[0].declarationPattern).toBe("Ash.Domain");
    });

    it("should match multiple standard declarations", () => {
      const service = new ModuleMatcherService();
      const useDeclarations = [
        "use Ash.Resource",
        "use Ash.Domain",
        "use AshGraphql.Resource",
      ];
      const result = service.identifyConfiguredModules(
        useDeclarations,
        mockConfigs
      );

      expect(result).toHaveLength(3);
      expect(result.map(r => r.declarationPattern)).toEqual([
        "Ash.Resource",
        "Ash.Domain",
        "AshGraphql.Resource",
      ]);
    });

    it("should not match when no declarations present", () => {
      const service = new ModuleMatcherService();
      const useDeclarations = ["use SomeOtherModule"];
      const result = service.identifyConfiguredModules(
        useDeclarations,
        mockConfigs
      );

      expect(result).toHaveLength(0);
    });

    it("should match alternative declaration pattern App.Resource to Ash.Resource", () => {
      const service = new ModuleMatcherService();
      const useDeclarations = ["use App.Resource"];
      const alternativePatterns = {
        "App.Resource": "Ash.Resource",
      };
      const result = service.identifyConfiguredModules(
        useDeclarations,
        mockConfigs,
        alternativePatterns
      );

      expect(result).toHaveLength(1);
      expect(result[0].declarationPattern).toBe("Ash.Resource");
      expect(result[0].displayName).toBe("Ash.Resource");
    });

    it("should match alternative declaration pattern App.Domain to Ash.Domain", () => {
      const service = new ModuleMatcherService();
      const useDeclarations = ["use App.Domain"];
      const alternativePatterns = {
        "App.Domain": "Ash.Domain",
      };
      const result = service.identifyConfiguredModules(
        useDeclarations,
        mockConfigs,
        alternativePatterns
      );

      expect(result).toHaveLength(1);
      expect(result[0].declarationPattern).toBe("Ash.Domain");
      expect(result[0].displayName).toBe("Ash.Domain");
    });

    it("should match multiple alternative patterns", () => {
      const service = new ModuleMatcherService();
      const useDeclarations = ["use App.Resource", "use App.Domain"];
      const alternativePatterns = {
        "App.Resource": "Ash.Resource",
        "App.Domain": "Ash.Domain",
      };
      const result = service.identifyConfiguredModules(
        useDeclarations,
        mockConfigs,
        alternativePatterns
      );

      expect(result).toHaveLength(2);
      expect(result.map(r => r.declarationPattern)).toEqual([
        "Ash.Resource",
        "Ash.Domain",
      ]);
    });

    it("should match both standard and alternative patterns in same file", () => {
      const service = new ModuleMatcherService();
      const useDeclarations = ["use Ash.Resource", "use App.Domain"];
      const alternativePatterns = {
        "App.Domain": "Ash.Domain",
      };
      const result = service.identifyConfiguredModules(
        useDeclarations,
        mockConfigs,
        alternativePatterns
      );

      expect(result).toHaveLength(2);
      expect(result.map(r => r.declarationPattern)).toEqual([
        "Ash.Resource",
        "Ash.Domain",
      ]);
    });

    it("should not add duplicate matches when both standard and alternative patterns match", () => {
      const service = new ModuleMatcherService();
      const useDeclarations = ["use Ash.Resource", "use App.Resource"];
      const alternativePatterns = {
        "App.Resource": "Ash.Resource",
      };
      const result = service.identifyConfiguredModules(
        useDeclarations,
        mockConfigs,
        alternativePatterns
      );

      // Should only have one match even though both declarations matched
      expect(result).toHaveLength(1);
      expect(result[0].declarationPattern).toBe("Ash.Resource");
    });

    it("should work with empty alternative patterns object", () => {
      const service = new ModuleMatcherService();
      const useDeclarations = ["use Ash.Resource"];
      const result = service.identifyConfiguredModules(
        useDeclarations,
        mockConfigs,
        {}
      );

      expect(result).toHaveLength(1);
      expect(result[0].declarationPattern).toBe("Ash.Resource");
    });

    it("should ignore alternative patterns that don't match any use declaration", () => {
      const service = new ModuleMatcherService();
      const useDeclarations = ["use Ash.Resource"];
      const alternativePatterns = {
        "CustomMacro.Resource": "Ash.Resource",
      };
      const result = service.identifyConfiguredModules(
        useDeclarations,
        mockConfigs,
        alternativePatterns
      );

      // Should still match the standard Ash.Resource
      expect(result).toHaveLength(1);
      expect(result[0].declarationPattern).toBe("Ash.Resource");
    });
  });
});
