import { toRawData, buildRawDataGrid } from "@excel/helpers/raw_data_steps";
import { EXCEL_FORMATS } from "@excel/formats";

describe("toRawData", () => {
  test("wraps rows and computes maxColumns as the widest row", () => {
    const rows = [{ row: ["a"], format: [null] }, { row: ["a", "b", "c"], format: [null, null, null] }];
    const result = toRawData(rows);
    expect(result.dataToWrite).toBe(rows);
    expect(result.maxColumns).toBe(3);
  });

  test("returns maxColumns 0 for an empty row set", () => {
    expect(toRawData([]).maxColumns).toBe(0);
  });
});

// ─── buildRawDataGrid ──────────────────────────────────────────────────────────

const block = (label) => toRawData([{ row: [label], format: [null] }]);
const blank = (n) => Array(n).fill("");
const blankFmt = (n) => Array(n).fill(null);

describe("buildRawDataGrid", () => {
  test("returns an empty grid for no blocks", () => {
    expect(buildRawDataGrid([])).toEqual({ dataToWrite: [], maxColumns: 0 });
  });

  test("frames each 1-wide block in a blank border, joined by one grey divider column", () => {
    const result = buildRawDataGrid([block("A"), block("B")]);
    // width=1 -> framed width=3 per block -> 3 + 1(divider) + 3 = 7 total columns
    expect(result.dataToWrite).toEqual([
      { row: blank(7), format: [...blankFmt(3), EXCEL_FORMATS.sectionDivider, ...blankFmt(3)] },
      {
        row: ["", "A", "", "", "", "B", ""],
        format: [null, null, null, EXCEL_FORMATS.sectionDivider, null, null, null],
      },
      { row: blank(7), format: [...blankFmt(3), EXCEL_FORMATS.sectionDivider, ...blankFmt(3)] },
    ]);
    expect(result.maxColumns).toBe(7);
  });

  test("pads a narrower block's content columns to the widest block before framing", () => {
    const wide = toRawData([{ row: ["A", "AA"], format: [null, null] }]);
    const narrow = block("B");
    const result = buildRawDataGrid([wide, narrow]);
    // width=2 -> framed width=4 per block, +1 divider = 9 total columns
    expect(result.dataToWrite[1]).toEqual({
      row: ["", "A", "AA", "", "", "", "B", "", ""],
      format: [null, null, null, null, EXCEL_FORMATS.sectionDivider, null, null, null, null],
    });
  });

  test("pads a shorter block's row count with blank framed rows so columns stay aligned", () => {
    const twoRows = toRawData([
      { row: ["A1"], format: [null] },
      { row: ["A2"], format: [null] },
    ]);
    const result = buildRawDataGrid([twoRows, block("B")]);
    // A: border, A1, A2, border (4 rows) — B: border, B, border (3 rows), padded to 4
    expect(result.dataToWrite).toHaveLength(4);
    expect(result.dataToWrite[1].row).toEqual(["", "A1", "", "", "", "B", ""]);
    expect(result.dataToWrite[2].row).toEqual(["", "A2", "", "", "", "", ""]);
  });

  test("inserts one full-width grey divider row between grid rows", () => {
    const result = buildRawDataGrid([block("1"), block("2"), block("3"), block("4")]);
    // 3 rows per grid-row (border, content, border) + 1 divider row = 7 rows
    expect(result.dataToWrite).toHaveLength(7);
    expect(result.dataToWrite[3]).toEqual({
      row: [""],
      format: [{ ...EXCEL_FORMATS.sectionDivider, fullWidth: true }],
    });
    expect(result.dataToWrite[1].row).toEqual(["", "1", "", "", "", "2", ""]);
    expect(result.dataToWrite[5].row).toEqual(["", "3", "", "", "", "4", ""]);
  });

  test("leaves an odd block out on its own without a second column or divider", () => {
    const result = buildRawDataGrid([block("1"), block("2"), block("3")]);
    expect(result.dataToWrite).toHaveLength(7);
    expect(result.dataToWrite[5]).toEqual({ row: ["", "3", ""], format: [null, null, null] });
  });

  test("scopes a block's fullWidth banner to its own columns instead of the whole row", () => {
    const banner = { fill: { color: "#000" }, fullWidth: true };
    const titled = toRawData([{ row: ["Title"], format: [banner] }]);
    const result = buildRawDataGrid([titled, block("B")]);
    // banner format must only land on the title block's own content column (index 1),
    // never bleed into its border, the divider, or block B's territory.
    const { fullWidth: _fw, ...bannerStyle } = banner;
    expect(result.dataToWrite[1]).toEqual({
      row: ["", "Title", "", "", "", "B", ""],
      format: [null, bannerStyle, null, EXCEL_FORMATS.sectionDivider, null, null, null],
    });
  });

  test("merges an explicit cell format on top of a fullWidth banner in the same row", () => {
    const banner = { fill: { color: "#000" }, fullWidth: true };
    const accent = { font: { bold: true } };
    const titled = toRawData([{ row: ["Title", "Accent", "X"], format: [banner, null, accent] }]);
    const result = buildRawDataGrid([titled]);
    expect(result.dataToWrite[1]).toEqual({
      row: ["", "Title", "Accent", "X", ""],
      format: [null, { fill: { color: "#000" } }, { fill: { color: "#000" } }, { fill: { color: "#000" }, font: { bold: true } }, null],
    });
  });

  test("respects a custom column count", () => {
    const result = buildRawDataGrid([block("1"), block("2"), block("3")], { columns: 3 });
    expect(result.dataToWrite).toHaveLength(3);
    expect(result.dataToWrite[1].row).toEqual(["", "1", "", "", "", "2", "", "", "", "3", ""]);
  });
});
