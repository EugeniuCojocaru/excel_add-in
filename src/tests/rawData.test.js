import { toRawData } from "@utils/rawData";

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
