import {
  getUniqueCategories,
  getReferenceCategory,
  buildDummyMeta,
  buildDummyColumns,
} from "@econometrics/helpers/dummy_variable_steps";

describe("getUniqueCategories", () => {
  test("returns the sorted unique values of a column", () => {
    const rows = [["A"], ["B"], ["A"], ["C"]];
    expect(getUniqueCategories(rows, 0)).toEqual(["A", "B", "C"]);
  });

  test("reads the given column index, not just the first", () => {
    const rows = [
      ["A", "X"],
      ["B", "Y"],
      ["A", "X"],
    ];
    expect(getUniqueCategories(rows, 1)).toEqual(["X", "Y"]);
  });
});

describe("getReferenceCategory", () => {
  const uniqueCategories = ["A", "B", "C"];

  test("defaults to the first unique category when no override is given", () => {
    expect(getReferenceCategory(uniqueCategories, [], 0)).toBe("A");
  });

  test("uses the user override for that column when provided", () => {
    expect(getReferenceCategory(uniqueCategories, ["B"], 0)).toBe("B");
  });

  test("falls back to the default when the override for that column is missing", () => {
    expect(getReferenceCategory(uniqueCategories, [undefined, "B"], 0)).toBe("A");
  });
});

describe("buildDummyMeta", () => {
  test("builds one meta entry per dummy category, flagged isDummy and carrying the reference", () => {
    const meta = buildDummyMeta({ name: "Gen", unit: "cat" }, ["B", "C"], "A");
    expect(meta).toEqual([
      { name: "Gen_B", isDummy: true, unit: "cat", reference: "A" },
      { name: "Gen_C", isDummy: true, unit: "cat", reference: "A" },
    ]);
  });

  test("returns an empty array when there are no dummy categories", () => {
    expect(buildDummyMeta({ name: "Gen" }, [], "A")).toEqual([]);
  });
});

describe("buildDummyColumns", () => {
  test("marks 1 for the matching category column and 0 elsewhere, per row", () => {
    const rows = [["A"], ["B"], ["C"], ["A"]];
    expect(buildDummyColumns(rows, 0, ["B", "C"])).toEqual([
      [0, 0],
      [1, 0],
      [0, 1],
      [0, 0],
    ]);
  });

  test("returns an empty row-shaped array when there are no dummy categories", () => {
    expect(buildDummyColumns([["A"], ["B"]], 0, [])).toEqual([[], []]);
  });
});
