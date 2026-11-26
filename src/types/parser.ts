// Centralized Ash parser types and interfaces for use across the extension
// Only export public APIs. Document each interface/type clearly.

import { SymbolKind } from "vscode";
import { DiagramSpec } from "./configurationRegistry";

/**
 * ParsedLocation - Represents a single point in source code.
 *
 * This interface is used for all parser output that needs a line/column position.
 * It is editor-agnostic and does not depend on VS Code types.
 */
export interface ParsedLocation {
  /** Line number where the location is (1-based) */
  line: number;
  /** Column where the location is (1-based) */
  column: number;
}

/**
 * ParsedChild - Represents a parsed child keyword within an Ash DSL section.
 *
 * This interface describes a single child element (e.g., attribute, action) found within a parent section.
 * It includes metadata about the child's keyword, name, and starting location.
 */
export interface ParsedChild {
  keyword: string; // keyword type (e.g., "attribute", "action")
  name?: string; // child name if available
  startingLocation: ParsedLocation; // starting location info for this child
}

export interface ParsedSection {
  name: string; // section name (e.g., "attributes", "actions")
  children: ParsedChild[]; // parsed children within this section (renamed from details)
  startingLocation: ParsedLocation; // starting location info for this section
  endingLocation: ParsedLocation; // ending location info for this section
  symbol?: SymbolKind;
}

export interface DiagramCodeLensEntry {
  /** The starting location where this code lens should appear */
  startingLocation: ParsedLocation;
  /** The title/label to display in the code lens */
  title: string;
  /** The command to execute when the code lens is clicked */
  command: string;
  /** The URL or data to pass as an argument to the command */
  target: string;
  /** The source of this code lens (module name, section type, etc.) */
  source: string;
  /**
   * The diagram specification associated with this code lens.
   * This property provides all metadata needed by the showDiagram handler
   * to locate and display the diagram. Required for all DiagramCodeLensEntry objects.
   */
  diagramSpec: DiagramSpec;
}

export interface ParseResult {
  sections: ParsedSection[];
  moduleName?: string; // extracted module name if available
  diagramCodeLenses: DiagramCodeLensEntry[]; // diagram code lens entries to display in the editor
  definitionEntries: DefinitionEntry[]; // definition locations for Go to Definition (default: [])
}

/**
 * Maps an alternative `use` module (e.g. a base resource macro such as
 * "App.Resource") to one or more standard declaration patterns
 * (e.g. "Ash.Resource" or ["Ash.Resource", "AshPostgres.DataLayer"]).
 * This is the shape of the `ashStudio.alternativeDeclarationPatterns` setting.
 */
export type AlternativeDeclarationPatterns = Record<string, string | string[]>;

/**
 * Cleaned-up form of AlternativeDeclarationPatterns: every key is non-empty and
 * maps to a non-empty list of non-empty standard declaration patterns.
 */
export type NormalizedAlternativeDeclarationPatterns = Record<string, string[]>;

export interface ParseOptions {
  /**
   * Alternative declaration patterns to recognise in addition to the standard ones.
   * The value usually comes straight from user settings, so it is normalised
   * before use and invalid entries are ignored.
   */
  alternativeDeclarationPatterns?: AlternativeDeclarationPatterns;
}

export interface Parser {
  /**
   * Parse Ash DSL content from raw text
   * @param source - The source code to parse
   * @param filePath - The file path of the document (required for diagram CodeLenses)
   * @param options - Optional parse options (e.g. alternative declaration patterns)
   * @returns ParseResult with sections, details, and any errors
   */
  parse(source: string, filePath?: string, options?: ParseOptions): ParseResult;
}

export interface CodeLensService {
  getCodeLenses(
    sections: ParsedSection[],
    filePath?: string
  ): DiagramCodeLensEntry[];
}

/**
 * Represents a definition location for Ash DSL symbols.
 * Used for Go to Definition navigation.
 */
export interface DefinitionEntry {
  /** The name of the symbol being defined (e.g., :sign_in_with_password) */
  name: string;
  /** The starting location of the definition in the file */
  startingLocation: ParsedLocation;
  /** Semantics for the definition, e.g. section name ("actions", "attributes") */
  semantics: {
    sectionName: string;
  };
}
