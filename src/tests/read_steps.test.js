import {
  toColumnMeta,
  getHeaderMeta,
  getNumericRows,
  getStringRows,
} from "@excel/helpers/read_steps";

describe("toColumnMeta", () => {
  test("parses a name with a unit", () => {
    expect(toColumnMeta("Preț <lei>")).toEqual({ name: "Preț", unit: "lei" });
  });

  test("returns a null unit when there is none", () => {
    expect(toColumnMeta("Nume")).toEqual({ name: "Nume", unit: null });
  });

  test("trims surrounding whitespace on both name and unit", () => {
    expect(toColumnMeta("  Spaced  <  unit  >")).toEqual({ name: "Spaced", unit: "unit" });
  });

  test("trims a name with no unit", () => {
    expect(toColumnMeta("  Trimmed  ")).toEqual({ name: "Trimmed", unit: null });
  });
});

describe("getHeaderMeta", () => {
  test("detects an all-string first row as a header and strips it", () => {
    const values = [
      ["Preț <lei>", "Cantitate"],
      [10, 20],
    ];
    expect(getHeaderMeta(values)).toEqual({
      meta: [
        { name: "Preț", unit: "lei" },
        { name: "Cantitate", unit: null },
      ],
      rows: [[10, 20]],
    });
  });

  test("leaves rows untouched when the first row is not all strings", () => {
    const values = [
      [10, 20],
      [30, 40],
    ];
    expect(getHeaderMeta(values)).toEqual({ meta: [], rows: values });
  });
});

describe("getNumericRows", () => {
  test("keeps only rows where every cell is a valid finite number", () => {
    const rows = [
      [1, 2],
      ["a", 2],
      [3, NaN],
    ];
    expect(getNumericRows(rows)).toEqual({ data: [[1, 2]], ignored: [1, 2] });
  });

  test("returns no ignored rows when everything is numeric", () => {
    const rows = [[1], [2], [3]];
    expect(getNumericRows(rows).ignored).toEqual([]);
  });
});

describe("getStringRows", () => {
  test("keeps only rows where every cell is a non-empty string", () => {
    const rows = [
      ["a", "b"],
      ["", "b"],
      [1, "b"],
    ];
    expect(getStringRows(rows)).toEqual({ data: [["a", "b"]], ignored: [1, 2] });
  });

  test("returns no ignored rows when everything is a non-empty string", () => {
    const rows = [["a"], ["b"]];
    expect(getStringRows(rows).ignored).toEqual([]);
  });
});
