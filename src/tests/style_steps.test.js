import { setRangeStyle, setRangeFormats } from "@excel/helpers/style_steps";

// Minimal fake standing in for an Office.js Range — enough surface for setRangeStyle's
// property assignments, no Excel.run/context involved.
const makeFakeTarget = () => {
  const borderItems = {};
  return {
    format: {
      font: {},
      fill: {},
      borders: {
        getItem: (edge) => {
          if (!borderItems[edge]) borderItems[edge] = {};
          return borderItems[edge];
        },
      },
    },
  };
};

const makeFakeRange = () => {
  const whole = makeFakeTarget();
  const rowTarget = makeFakeTarget();
  const cellTarget = makeFakeTarget();
  return { ...whole, getRow: () => rowTarget, getCell: () => cellTarget, rowTarget, cellTarget };
};

describe("setRangeStyle", () => {
  test("applies directly to the range when no row/col is given", () => {
    const range = makeFakeRange();
    setRangeStyle(range, { fill: { color: "#fff" } });
    expect(range.format.fill).toEqual({ color: "#fff" });
  });

  test("targets a whole row when only row is given", () => {
    const range = makeFakeRange();
    setRangeStyle(range, { rowHeight: 40 }, 2);
    expect(range.rowTarget.format.rowHeight).toBe(40);
  });

  test("targets a specific cell when both row and col are given", () => {
    const range = makeFakeRange();
    setRangeStyle(range, { horizontalAlignment: "Left" }, 2, 3);
    expect(range.cellTarget.format.horizontalAlignment).toBe("Left");
  });

  test("merges font properties onto the existing font rather than replacing it", () => {
    const range = makeFakeRange();
    range.format.font.size = 20;
    setRangeStyle(range, { font: { bold: true } });
    expect(range.format.font).toEqual({ size: 20, bold: true });
  });

  test("sets each border edge via borders.getItem", () => {
    const range = makeFakeRange();
    setRangeStyle(range, {
      border: { EdgeBottom: { color: "#217346", style: "Continuous", weight: "Medium" } },
    });
    expect(range.format.borders.getItem("EdgeBottom")).toEqual({
      color: "#217346",
      style: "Continuous",
      weight: "Medium",
    });
  });

  test("leaves properties untouched when the style omits them", () => {
    const range = makeFakeRange();
    setRangeStyle(range, {});
    expect(range.format.fill).toEqual({});
  });
});

describe("setRangeFormats", () => {
  test("applies a fullWidth entry to the whole row, not a specific cell", () => {
    const range = makeFakeRange();
    setRangeFormats(range, [{ row: 1, column: 0, format: { fullWidth: true, fill: { color: "#000" } } }]);
    expect(range.rowTarget.format.fill).toEqual({ color: "#000" });
  });

  test("applies a non-fullWidth entry to its specific cell", () => {
    const range = makeFakeRange();
    setRangeFormats(range, [{ row: 1, column: 2, format: { fill: { color: "#000" } } }]);
    expect(range.cellTarget.format.fill).toEqual({ color: "#000" });
  });

  test("strips the fullWidth flag before applying the style", () => {
    const range = makeFakeRange();
    setRangeFormats(range, [{ row: 0, column: 0, format: { fullWidth: true, rowHeight: 30 } }]);
    expect(range.rowTarget.format.rowHeight).toBe(30);
  });
});
