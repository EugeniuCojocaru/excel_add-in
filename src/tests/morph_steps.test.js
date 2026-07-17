import { toUIData, splitAndCompleteRawData } from "@excel/helpers/morph_steps";

describe("toUIData", () => {
  test("defaults every cell's format to null when no format is given", () => {
    expect(toUIData(["a", "b"])).toEqual({ row: ["a", "b"], format: [null, null] });
  });

  test("uses the given format array as-is", () => {
    const format = [{ fill: { color: "#fff" } }, null];
    expect(toUIData(["a", "b"], format)).toEqual({ row: ["a", "b"], format });
  });

  test("returns a blank row under the `row` key when data is missing but a format is given", () => {
    const format = [{ fill: { color: "#fff" } }];
    expect(toUIData(null, format)).toEqual({ row: [""], format });
    expect(toUIData(undefined, format)).toEqual({ row: [""], format });
  });
});

describe("splitAndCompleteRawData", () => {
  test("pads every row to maxColumns", () => {
    const rawData = {
      maxColumns: 3,
      dataToWrite: [
        { row: ["a"], format: [null] },
        { row: ["a", "b", "c"], format: [null, null, null] },
      ],
    };
    const { excelData } = splitAndCompleteRawData(rawData);
    expect(excelData).toEqual([
      ["a", "", ""],
      ["a", "b", "c"],
    ]);
  });

  test("collects every non-null, non-empty-string format at its absolute row/column", () => {
    const style = { fill: { color: "#000" } };
    const rawData = {
      maxColumns: 2,
      dataToWrite: [
        { row: ["a", "b"], format: [style, null] },
        { row: ["c", "d"], format: ["", style] },
      ],
    };
    const { formats } = splitAndCompleteRawData(rawData);
    expect(formats).toEqual([
      { row: 0, column: 0, format: style },
      { row: 1, column: 1, format: style },
    ]);
  });

  test("returns as many excelData rows as dataToWrite entries", () => {
    const rawData = {
      maxColumns: 1,
      dataToWrite: [
        { row: ["a"], format: [null] },
        { row: ["b"], format: [null] },
      ],
    };
    expect(splitAndCompleteRawData(rawData).excelData).toHaveLength(2);
  });
});
