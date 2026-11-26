/**
 * End-to-end tests for ModuleParser with alternative declaration patterns
 */

import { moduleParser } from "../../../src/parser/moduleParser";

const source = `defmodule App.Music.Album do
  use App.Resource,
    domain: App.Music

  attributes do
    uuid_primary_key :id
    attribute :name, :string
  end

  postgres do
    table "albums"
  end
end
`;

describe("ModuleParser.parse with alternative declaration patterns", () => {
  it("finds no sections for a custom base resource without alternative patterns", () => {
    const result = moduleParser.parse(source);
    expect(result.sections).toEqual([]);
  });

  it("finds sections when the custom base resource maps to Ash.Resource", () => {
    const result = moduleParser.parse(source, undefined, {
      alternativeDeclarationPatterns: { "App.Resource": "Ash.Resource" },
    });
    const attributes = result.sections.find(s => s.name === "attributes");
    expect(attributes).toBeDefined();
    expect(attributes?.startingLocation.line).toBe(5);
    expect(attributes?.children.map(c => c.name)).toEqual([":name"]);
    // AshPostgres is not configured, so its section is not recognised
    expect(result.sections.map(s => s.name)).not.toContain("postgres");
  });

  it("recognises sections of every module an alternative pattern maps to", () => {
    const result = moduleParser.parse(source, undefined, {
      alternativeDeclarationPatterns: {
        "App.Resource": ["Ash.Resource", "AshPostgres.DataLayer"],
      },
    });
    expect(result.sections.map(s => s.name)).toEqual([
      "attributes",
      "postgres",
    ]);
  });

  it("ignores invalid alternative patterns instead of throwing", () => {
    const result = moduleParser.parse(source, undefined, {
      alternativeDeclarationPatterns: null as unknown as Record<string, string>,
    });
    expect(result.sections).toEqual([]);
  });
});
