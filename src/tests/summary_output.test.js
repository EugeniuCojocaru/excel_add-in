import { generateSummaryOutput } from "@econometrics/use_cases/summary_output";

// Minimal translation stub — returns the key so assertions don't depend on locale strings
const t = (key, params = {}) => {
  if (!params || Object.keys(params).length === 0) return key;
  const interpolated = Object.entries(params).reduce(
    (acc, [k, v]) => acc.replace(new RegExp(`{{${k}}}`, "g"), v),
    key
  );
  return interpolated;
};

const xMeta = [
  { name: "Price", unit: "USD" },
  { name: "Quantity", unit: "pcs" },
];

// Simple two-predictor fixture: R²=0.9, significant, one highly-correlated pair, no multicollinearity flag
const makeStats = (overrides = {}) => ({
  alpha: 0.05,
  modelType: "linear",
  k: { value: 2 },
  df: { value: 7 },
  ssRes: { value: 10 },
  b0: { value: 1 },
  slopes: [{ value: 2 }, { value: 3 }],
  rSquared: { value: 0.9 },
  adjustedRSquared: { value: 0.85 },
  ese: { value: 1.2 },
  standardErrors: [{ value: 0.1 }, { value: 0.2 }, { value: 0.3 }],
  confidenceIntervals: [
    [{ value: 0.8 }, { value: 1.2 }],
    [{ value: 1.8 }, { value: 2.2 }],
    [{ value: 2.7 }, { value: 3.3 }],
  ],
  tStats: [{ value: 10 }, { value: 15 }, { value: 20 }],
  pValues: [{ value: 0.001 }, { value: 0.0001 }, { value: 0.00001 }],
  fStat: { value: 50 },
  fSignificance: { value: 0.0001 },
  fIsSignificant: true,
  betaWeights: [{ value: 0.4 }, { value: 0.6 }],
  correlationMatrix: [
    [{ value: 1 }, { value: 0.85 }],
    [{ value: 0.85 }, { value: 1 }],
  ],
  vifValues: [{ value: 1.5 }, { value: 1.5 }],
  hasMulticollinearity: false,
  interpretation: [{ row: ["dummy interpretation row"], format: [null] }],
  ...overrides,
});

const flatten = (result) => result.dataToWrite.flatMap((r) => r.row).join(" ");

describe("generateSummaryOutput", () => {
  test("returns dataToWrite array and maxColumns number", () => {
    const result = generateSummaryOutput(makeStats(), null, xMeta, t);
    expect(Array.isArray(result.dataToWrite)).toBe(true);
    expect(typeof result.maxColumns).toBe("number");
  });

  test("maxColumns covers the 8-column coefficients table", () => {
    const result = generateSummaryOutput(makeStats(), null, xMeta, t);
    expect(result.maxColumns).toBeGreaterThanOrEqual(8);
  });

  test("n is computed as df + k + 1", () => {
    const result = generateSummaryOutput(makeStats(), null, xMeta, t);
    expect(flatten(result)).toContain("10"); // df(7) + k(2) + 1 = 10
  });

  test("includes rSquared value", () => {
    const result = generateSummaryOutput(makeStats(), null, xMeta, t);
    expect(flatten(result)).toContain("0.9");
  });

  test("includes intercept row", () => {
    const result = generateSummaryOutput(makeStats(), null, xMeta, t);
    expect(flatten(result)).toContain("regression.summaryOutput.intercept");
  });

  test("includes a coefficient row per predictor", () => {
    const result = generateSummaryOutput(makeStats(), null, xMeta, t);
    expect(flatten(result)).toContain("Price (b1)");
    expect(flatten(result)).toContain("Quantity (b2)");
  });

  test("extended: false omits the interpretation section", () => {
    const result = generateSummaryOutput(makeStats(), null, xMeta, t, { extended: false });
    expect(flatten(result)).not.toContain("dummy interpretation row");
  });

  test("extended: true includes the interpretation section", () => {
    const result = generateSummaryOutput(makeStats(), null, xMeta, t, { extended: true });
    expect(flatten(result)).toContain("dummy interpretation row");
  });

  test("extended: true with k=1 omits VIF/correlation sections", () => {
    const stats = makeStats({
      k: { value: 1 },
      slopes: [{ value: 2 }],
      standardErrors: [{ value: 0.1 }, { value: 0.2 }],
      confidenceIntervals: [
        [{ value: 0.8 }, { value: 1.2 }],
        [{ value: 1.8 }, { value: 2.2 }],
      ],
      tStats: [{ value: 10 }, { value: 15 }],
      pValues: [{ value: 0.001 }, { value: 0.0001 }],
      betaWeights: [{ value: 1 }],
      vifValues: [{ value: 1 }],
      correlationMatrix: [[{ value: 1 }]],
    });
    const result = generateSummaryOutput(stats, null, [xMeta[0]], t, { extended: true });
    expect(flatten(result)).not.toContain("regression.summaryOutput.vifTitle");
  });

  test("extended: true with k>1 includes VIF section", () => {
    const result = generateSummaryOutput(makeStats(), null, xMeta, t, { extended: true });
    expect(flatten(result)).toContain("regression.summaryOutput.vifTitle");
  });

  test("flags high-correlation pairs above 0.8", () => {
    const result = generateSummaryOutput(makeStats(), null, xMeta, t, { extended: true });
    expect(flatten(result)).toContain("r(Price,Quantity)");
  });

  test("does not flag correlation pairs at or below 0.8", () => {
    const stats = makeStats({
      correlationMatrix: [
        [{ value: 1 }, { value: 0.5 }],
        [{ value: 0.5 }, { value: 1 }],
      ],
    });
    const result = generateSummaryOutput(stats, null, xMeta, t, { extended: true });
    expect(flatten(result)).not.toContain("r(Price,Quantity)");
  });

  test("executive summary shows not-significant branch when fIsSignificant is false", () => {
    const stats = makeStats({ fIsSignificant: false });
    const result = generateSummaryOutput(stats, null, xMeta, t, { extended: true });
    expect(flatten(result)).toContain("regression.summaryOutput.executiveSummaryNotSignificant");
  });

  test("executive summary shows significant branch when fIsSignificant is true", () => {
    const result = generateSummaryOutput(makeStats(), null, xMeta, t, { extended: true });
    expect(flatten(result)).toContain("regression.summaryOutput.executiveSummarySignificant");
  });

  test("executive summary flags multicollinearity when present", () => {
    const stats = makeStats({ hasMulticollinearity: true });
    const result = generateSummaryOutput(stats, null, xMeta, t, { extended: true });
    expect(flatten(result)).toContain("regression.summaryOutput.executiveSummaryMulticollinearity");
  });
});
