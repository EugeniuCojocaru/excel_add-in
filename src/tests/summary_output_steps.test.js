import {
  getXNames,
  getHighCorrelationPairs,
  getStrongestPredictorIndex,
  buildRegressionStats,
  buildAnova,
  buildCoefficients,
} from "@econometrics/helpers/summary_output_steps";

const t = (key, params = {}) => {
  if (!params || Object.keys(params).length === 0) return key;
  const interpolated = Object.entries(params).reduce(
    (acc, [k, v]) => acc.replace(new RegExp(`{{${k}}}`, "g"), v),
    key
  );
  return interpolated;
};

// ─── getXNames ────────────────────────────────────────────────────────────────

describe("getXNames", () => {
  test("uses the meta name when present", () => {
    expect(getXNames(1, [{ name: "Price" }], t)).toEqual(["Price"]);
  });

  test("falls back to a translated placeholder when meta name is missing", () => {
    expect(getXNames(1, [{}], t)).toEqual(["regression.summaryOutput.variableX"]);
  });
});

// ─── getHighCorrelationPairs ────────────────────────────────────────────────────

describe("getHighCorrelationPairs", () => {
  const xNames = ["Price", "Ads", "Stock"];

  test("flags a pair strictly above 0.8", () => {
    const matrix = [
      [{ value: 1 }, { value: 0.85 }, { value: 0.1 }],
      [{ value: 0.85 }, { value: 1 }, { value: 0.2 }],
      [{ value: 0.1 }, { value: 0.2 }, { value: 1 }],
    ];
    expect(getHighCorrelationPairs(matrix, xNames)).toEqual([{ nameI: "Price", nameJ: "Ads", r: 0.85 }]);
  });

  test("does not flag a pair at exactly 0.8", () => {
    const matrix = [
      [{ value: 1 }, { value: 0.8 }],
      [{ value: 0.8 }, { value: 1 }],
    ];
    expect(getHighCorrelationPairs(matrix, ["Price", "Ads"])).toEqual([]);
  });

  test("only considers the upper triangle (no duplicate pairs)", () => {
    const matrix = [
      [{ value: 1 }, { value: 0.9 }],
      [{ value: 0.9 }, { value: 1 }],
    ];
    expect(getHighCorrelationPairs(matrix, ["Price", "Ads"])).toHaveLength(1);
  });
});

// ─── getStrongestPredictorIndex ─────────────────────────────────────────────────

describe("getStrongestPredictorIndex", () => {
  test("picks the index with the largest absolute value", () => {
    const betaWeights = [{ value: 0.2 }, { value: -0.9 }, { value: 0.5 }];
    expect(getStrongestPredictorIndex(betaWeights)).toBe(1);
  });

  test("returns 0 for a single predictor", () => {
    expect(getStrongestPredictorIndex([{ value: 0.5 }])).toBe(0);
  });
});

// ─── build* section shape ───────────────────────────────────────────────────────

const baseStats = {
  alpha: 0.05,
  modelType: "linear",
  k: { value: 1 },
  df: { value: 8 },
  ssRes: { value: 10 },
  b0: { value: 1 },
  slopes: [{ value: 2 }],
  rSquared: { value: 0.9 },
  adjustedRSquared: { value: 0.88 },
  ese: { value: 1.1 },
  standardErrors: [{ value: 0.1 }, { value: 0.2 }],
  confidenceIntervals: [
    [{ value: 0.8 }, { value: 1.2 }],
    [{ value: 1.8 }, { value: 2.2 }],
  ],
  tStats: [{ value: 10 }, { value: 15 }],
  pValues: [{ value: 0.001 }, { value: 0.0001 }],
  fStat: { value: 50 },
  fSignificance: { value: 0.0001 },
  betaWeights: [{ value: 1 }],
};

describe("buildRegressionStats", () => {
  test("returns a non-empty row array whose first row is the summary title", () => {
    const rows = buildRegressionStats(baseStats, t);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0].row[0]).toBe("regression.summaryOutput.summary");
  });
});

describe("buildAnova", () => {
  test("returns a non-empty row array whose first row is the anova title", () => {
    const rows = buildAnova(baseStats, t);
    expect(rows[0].row[0]).toBe("regression.summaryOutput.anova");
  });
});

describe("buildCoefficients", () => {
  test("returns a header row plus intercept plus one row per predictor", () => {
    const rows = buildCoefficients(baseStats, ["Price"], t);
    expect(rows).toHaveLength(3); // header + intercept + 1 predictor
    expect(rows[1].row[0]).toBe("regression.summaryOutput.intercept");
    expect(rows[2].row[0]).toBe("Price (b1)");
  });
});
