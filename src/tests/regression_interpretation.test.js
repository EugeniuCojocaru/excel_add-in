import { interpretationRegression } from "@econometrics/use_cases/regression_interpretation";

// Minimal translation stub — returns the key so assertions don't depend on locale strings
const t = (key, params = {}) => {
  if (!params || Object.keys(params).length === 0) return key;
  const interpolated = Object.entries(params).reduce(
    (acc, [k, v]) => acc.replace(new RegExp(`{{${k}}}`, "g"), v),
    key
  );
  return interpolated;
};

// Pre-built uiStats matching the shape produced by toUIStats() for a simple
// single-predictor regression: Y = 2X + 1 (R² = 1, all p-values tiny)
const makeSimpleUiStats = () => ({
  alpha: 0.05,
  modelType: "linear",
  k: { value: 1 },
  df: { value: 3 },
  ssRes: { value: 0 },
  b0: { value: 1 },
  slopes: [{ value: 2 }],
  rSquared: { value: 1 },
  adjustedRSquared: { value: 1 },
  ese: { value: 0 },
  standardErrors: [{ value: 0.001 }, { value: 0.001 }],
  confidenceIntervals: [
    [{ value: 0.9 }, { value: 1.1 }],
    [{ value: 1.8 }, { value: 2.2 }],
  ],
  tStats: [{ value: 1000 }, { value: 2000 }],
  pValues: [{ value: 0 }, { value: 0.0001 }],
  isSignificant: [true],
  fStat: { value: 999999 },
  fSignificance: { value: 0.0001 },
  fIsSignificant: true,
  betaWeights: [{ value: 1 }],
  correlationMatrix: [[{ value: 1 }]],
  vifValues: [{ value: 1 }],
  hasMulticollinearity: false,
});

const yMeta = [{ name: "Sales", unit: "units" }];
const xMeta = [{ name: "Price", unit: "USD" }];

// ─── interpretationRegression ────────────────────────────────────────────────

describe("interpretationRegression", () => {
  test("returns an array", () => {
    const result = interpretationRegression(makeSimpleUiStats(), 0.05, yMeta, xMeta, t);
    expect(Array.isArray(result)).toBe(true);
  });

  test("returns a non-empty array", () => {
    const result = interpretationRegression(makeSimpleUiStats(), 0.05, yMeta, xMeta, t);
    expect(result.length).toBeGreaterThan(0);
  });

  test("every row has a row and format property", () => {
    const result = interpretationRegression(makeSimpleUiStats(), 0.05, yMeta, xMeta, t);
    result.forEach((row) => {
      expect(row).toHaveProperty("row");
      expect(row).toHaveProperty("format");
    });
  });

  test("every row.row is an array", () => {
    const result = interpretationRegression(makeSimpleUiStats(), 0.05, yMeta, xMeta, t);
    result.forEach((row) => {
      expect(Array.isArray(row.row)).toBe(true);
    });
  });

  test("output contains the regression equation with variable names", () => {
    const result = interpretationRegression(makeSimpleUiStats(), 0.05, yMeta, xMeta, t);
    const flat = result.flatMap((r) => r.row).join(" ");
    expect(flat).toContain("Sales");
    expect(flat).toContain("Price");
  });

  test("output contains b0 value", () => {
    const result = interpretationRegression(makeSimpleUiStats(), 0.05, yMeta, xMeta, t);
    const flat = result.flatMap((r) => r.row).join(" ");
    expect(flat).toContain("1"); // b0 = 1
  });

  test("output contains slope value", () => {
    const result = interpretationRegression(makeSimpleUiStats(), 0.05, yMeta, xMeta, t);
    const flat = result.flatMap((r) => r.row).join(" ");
    expect(flat).toContain("2"); // slope = 2
  });

  test("output references R² value", () => {
    const result = interpretationRegression(makeSimpleUiStats(), 0.05, yMeta, xMeta, t);
    const flat = result.flatMap((r) => r.row).join(" ");
    expect(flat).toContain("1"); // rSquared = 1
  });

  test("COMPACT mode produces fewer rows than STUDENT mode", () => {
    const stats = makeSimpleUiStats();
    const studentResult = interpretationRegression(stats, 0.05, yMeta, xMeta, t, {
      mode: "STUDENT",
    });
    const compactResult = interpretationRegression(stats, 0.05, yMeta, xMeta, t, {
      mode: "COMPACT",
    });
    expect(compactResult.length).toBeLessThan(studentResult.length);
  });

  test("log-linear model wraps Y name in ln()", () => {
    const stats = { ...makeSimpleUiStats(), modelType: "log-linear" };
    const result = interpretationRegression(stats, 0.05, yMeta, xMeta, t);
    const flat = result.flatMap((r) => r.row).join(" ");
    expect(flat).toContain("ln(Sales)");
  });

  test("lin-log model wraps X name in ln()", () => {
    const stats = { ...makeSimpleUiStats(), modelType: "lin-log" };
    const result = interpretationRegression(stats, 0.05, yMeta, xMeta, t);
    const flat = result.flatMap((r) => r.row).join(" ");
    expect(flat).toContain("ln(Price)");
  });

  test("multiple regression includes fSignificance in output", () => {
    const stats = {
      ...makeSimpleUiStats(),
      k: { value: 2 },
      slopes: [{ value: 2 }, { value: 3 }],
      pValues: [{ value: 0 }, { value: 0.0001 }, { value: 0.0002 }],
      standardErrors: [{ value: 0.001 }, { value: 0.001 }, { value: 0.001 }],
      confidenceIntervals: [
        [{ value: 0.9 }, { value: 1.1 }],
        [{ value: 1.8 }, { value: 2.2 }],
        [{ value: 2.7 }, { value: 3.3 }],
      ],
      betaWeights: [{ value: 0.5 }, { value: 0.5 }],
      isSignificant: [true, true],
      correlationMatrix: [
        [{ value: 1 }, { value: 0.1 }],
        [{ value: 0.1 }, { value: 1 }],
      ],
      vifValues: [{ value: 1 }, { value: 1 }],
    };
    const xMeta2 = [
      { name: "Price", unit: "USD" },
      { name: "Quantity", unit: "pcs" },
    ];
    const result = interpretationRegression(stats, 0.05, yMeta, xMeta2, t);
    const flat = result.flatMap((r) => r.row).join(" ");
    expect(flat).toContain("0.0001"); // fSignificance value
  });
});
