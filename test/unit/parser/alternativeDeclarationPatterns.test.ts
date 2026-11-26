/**
 * Test suite for normalizeAlternativeDeclarationPatterns
 */

import { normalizeAlternativeDeclarationPatterns } from "../../../src/parser/alternativeDeclarationPatterns";

describe("normalizeAlternativeDeclarationPatterns", () => {
  it.each([
    ["undefined", undefined],
    ["null", null],
    ["an array", ["App.Resource", "Ash.Resource"]],
    ["a number", 42],
    ["a string", "App.Resource"],
    ["a boolean", true],
  ])("returns an empty map for %s", (_label, raw) => {
    expect(normalizeAlternativeDeclarationPatterns(raw)).toEqual({});
  });

  it("wraps string values in an array", () => {
    expect(
      normalizeAlternativeDeclarationPatterns({
        "App.Resource": "Ash.Resource",
        "App.Domain": "Ash.Domain",
      })
    ).toEqual({
      "App.Resource": ["Ash.Resource"],
      "App.Domain": ["Ash.Domain"],
    });
  });

  it("keeps string array values", () => {
    expect(
      normalizeAlternativeDeclarationPatterns({
        "App.Resource": ["Ash.Resource", "AshPostgres.DataLayer"],
      })
    ).toEqual({
      "App.Resource": ["Ash.Resource", "AshPostgres.DataLayer"],
    });
  });

  it("drops entries with an empty key", () => {
    expect(
      normalizeAlternativeDeclarationPatterns({
        "": "Ash.Resource",
        "App.Resource": "Ash.Resource",
      })
    ).toEqual({ "App.Resource": ["Ash.Resource"] });
  });

  it("drops entries with non-string values", () => {
    expect(
      normalizeAlternativeDeclarationPatterns({
        "App.Null": null,
        "App.Number": 1,
        "App.Object": { pattern: "Ash.Resource" },
        "App.Bool": false,
        "App.Empty": "",
        "App.EmptyArray": [],
        "App.Resource": "Ash.Resource",
      })
    ).toEqual({ "App.Resource": ["Ash.Resource"] });
  });

  it("keeps only non-empty strings from mixed arrays and removes duplicates", () => {
    expect(
      normalizeAlternativeDeclarationPatterns({
        "App.Resource": [
          "Ash.Resource",
          null,
          3,
          "",
          ["AshGraphql.Resource"],
          { a: "b" },
          "AshPostgres.DataLayer",
          "Ash.Resource",
        ],
        "App.Junk": [null, 1, ""],
      })
    ).toEqual({
      "App.Resource": ["Ash.Resource", "AshPostgres.DataLayer"],
    });
  });
});
