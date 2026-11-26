/**
 * Tests for ParsedDataProvider caching and configuration handling
 */

let mockAlternativePatterns: unknown = {};

jest.mock("vscode", () => ({
  ...jest.requireActual("../__mocks__/vscode"),
  window: {
    createOutputChannel: () => ({ appendLine: () => {} }),
  },
  workspace: {
    getConfiguration: () => ({
      get: (key: string, defaultValue?: unknown) =>
        key === "alternativeDeclarationPatterns"
          ? mockAlternativePatterns
          : defaultValue,
    }),
  },
}));

import type * as vscode from "vscode";
import { ParsedDataProvider } from "../../src/parsedDataProvider";

const source = `defmodule App.Music.Album do
  use App.Resource

  attributes do
    attribute :name, :string
  end
end
`;

const makeDocument = (version = 1): vscode.TextDocument =>
  ({
    languageId: "elixir",
    fileName: "/project/lib/album.ex",
    version,
    uri: {
      toString: () => "file:///project/lib/album.ex",
      fsPath: "/project/lib/album.ex",
    },
    getText: () => source,
  }) as unknown as vscode.TextDocument;

describe("ParsedDataProvider", () => {
  const provider = ParsedDataProvider.getInstance();

  beforeEach(() => {
    mockAlternativePatterns = {};
    provider.clearAllCaches();
  });

  it("passes the alternativeDeclarationPatterns setting to the parser", () => {
    mockAlternativePatterns = { "App.Resource": ["Ash.Resource"] };
    const result = provider.getParseResult(makeDocument());
    expect(result.sections.map(s => s.name)).toEqual(["attributes"]);
  });

  it("returns an empty result instead of failing for a null setting", () => {
    mockAlternativePatterns = null;
    const result = provider.getParseResult(makeDocument());
    expect(result.sections).toEqual([]);
  });

  it("re-parses with the new setting after clearAllCaches", () => {
    const document = makeDocument();
    expect(provider.getParseResult(document).sections).toEqual([]);

    // Setting changes, but the cached result for this version is still used
    mockAlternativePatterns = { "App.Resource": "Ash.Resource" };
    expect(provider.getParseResult(document).sections).toEqual([]);

    provider.clearAllCaches();
    expect(provider.getParseResult(document).sections.map(s => s.name)).toEqual(
      ["attributes"]
    );
  });
});
