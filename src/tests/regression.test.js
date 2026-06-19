import math from "@math/config";
import {
  solveCoefficients,
  setDummyColumns,
  computeSumOfSquares,
  computeStandardErrors,
  computeConfidenceIntervals,
  computeTStats,
  computePredictorStats,
  computeBetaWeights,
  computeCorrelationMatrix,
  computeVIF,
  computeRSquared,
  computeFStat,
  regression,
} from "@math/use_cases/regression";

const toNum = (v) => Number(v);

// ─── solveCoefficients ───────────────────────────────────────────────────────
// Dataset: Y = 1 + 2X  →  b0=1, b1=2
// X = [[1,1],[1,2],[1,3]], Y = [[3],[5],[7]]
// XᵀX = [[3,6],[6,14]]   XᵀY = [[15],[34]]

describe("solveCoefficients", () => {
  const X_T_X = math.matrix([
    [3, 6],
    [6, 14],
  ]);
  const X_T_Y = math.matrix([[15], [34]]);
  const result = solveCoefficients(X_T_X, X_T_Y);

  test("b0 is correct", () => {
    expect(toNum(result.b0)).toBeCloseTo(1, 10);
  });

  test("slope b1 is correct", () => {
    expect(toNum(result.slopes[0])).toBeCloseTo(2, 10);
  });

  test("coefficients contains both b0 and b1", () => {
    expect(result.coefficients.length).toBe(2);
  });

  test("slopes contains only predictors (no intercept)", () => {
    expect(result.slopes.length).toBe(1);
  });

  test("Beta is a 2D array (column vector)", () => {
    expect(Array.isArray(result.Beta)).toBe(true);
    expect(Array.isArray(result.Beta[0])).toBe(true);
  });

  describe("two predictors — Y = 2 + 1·X1 + 3·X2", () => {
    // X1=[1,2,3,4], X2=[2,1,4,3] → Y=[9,7,17,15]
    const X2 = math.matrix([
      [1, 1, 2],
      [1, 2, 1],
      [1, 3, 4],
      [1, 4, 3],
    ]);
    const Y2 = math.matrix([[9], [7], [17], [15]]);
    const X2_T = math.transpose(X2);
    const r2 = solveCoefficients(math.multiply(X2_T, X2), math.multiply(X2_T, Y2));

    test("b0 is correct", () => {
      expect(toNum(r2.b0)).toBeCloseTo(2, 8);
    });

    test("b1 is correct", () => {
      expect(toNum(r2.slopes[0])).toBeCloseTo(1, 8);
    });

    test("b2 is correct", () => {
      expect(toNum(r2.slopes[1])).toBeCloseTo(3, 8);
    });
  });
});

// ─── setDummyColumns ─────────────────────────────────────────────────────────

describe("setDummyColumns", () => {
  test("marks a binary column as dummy", () => {
    const xColumns = {
      data: [[0], [1], [0], [1]],
      meta: [{ name: "gender" }],
    };
    setDummyColumns(xColumns);
    expect(xColumns.meta[0].isDummy).toBe(true);
  });

  test("does not mark a continuous column as dummy", () => {
    const xColumns = {
      data: [[1], [2], [3], [4]],
      meta: [{ name: "income" }],
    };
    setDummyColumns(xColumns);
    expect(xColumns.meta[0].isDummy).toBe(false);
  });

  test("handles multiple columns — mixed dummy and continuous", () => {
    const xColumns = {
      data: [
        [0, 5],
        [1, 8],
        [1, 3],
      ],
      meta: [{ name: "employed" }, { name: "age" }],
    };
    setDummyColumns(xColumns);
    expect(xColumns.meta[0].isDummy).toBe(true);
    expect(xColumns.meta[1].isDummy).toBe(false);
  });

  test("skips column when meta entry is missing", () => {
    const xColumns = {
      data: [[0], [1], [0]],
      meta: [],
    };
    expect(() => setDummyColumns(xColumns)).not.toThrow();
  });
});

// ─── computeSumOfSquares ─────────────────────────────────────────────────────
// Perfect fit: Y = 1 + 2X, data [[1,3],[1,2,5],[1,3,7]]
// ssRes should be 0, ssTotal = Σ(Yi - meanY)²

describe("computeSumOfSquares", () => {
  // Y = 1 + 2X  →  perfect fit, ssRes = 0
  // X (design): [[1,1],[1,2],[1,3]], Y: [[3],[5],[7]], Beta: [[1],[2]]
  const X = [
    [1, 1],
    [1, 2],
    [1, 3],
  ];
  const Y = [[3], [5], [7]];
  const Beta = [[1], [2]];
  const n = 3;
  const { ssRes, ssTotal } = computeSumOfSquares(X, Y, Beta, n);

  test("ssRes is 0 for a perfect fit", () => {
    expect(toNum(ssRes)).toBeCloseTo(0, 10);
  });

  test("ssTotal equals Σ(Yi - meanY)²", () => {
    // meanY = 5, deviations: [-2, 0, 2] → ssTotal = 4+0+4 = 8
    expect(toNum(ssTotal)).toBeCloseTo(8, 10);
  });

  describe("imperfect fit", () => {
    // Y = [3, 5, 7], Beta = [[2],[2]] → Y_pred = [4, 6, 8]
    // residuals: [-1, -1, -1] → ssRes = 3
    const BetaOff = [[2], [2]];
    const { ssRes: ssR, ssTotal: ssT } = computeSumOfSquares(X, Y, BetaOff, n);

    test("ssRes accumulates squared residuals", () => {
      expect(toNum(ssR)).toBeCloseTo(3, 10);
    });

    test("ssTotal is unchanged regardless of Beta", () => {
      expect(toNum(ssT)).toBeCloseTo(8, 10);
    });
  });
});

// ─── computeStandardErrors ───────────────────────────────────────────────────
// Y = 1 + 2X, n=3, df=1
// X = [[1,1],[1,2],[1,3]]  →  XᵀX = [[3,6],[6,14]]
// ssRes = 0 (perfect fit)  →  ese = 0  →  all SE = 0
//
// Imperfect case: manually set eseSq=1 and verify SE = sqrt(diag of (XᵀX)⁻¹)
// (XᵀX)⁻¹ = (1/6) * [[14,-6],[-6,3]]  →  diag = [14/6, 3/6]
// SE[0] = sqrt(14/6) ≈ 1.5275, SE[1] = sqrt(3/6) = sqrt(0.5) ≈ 0.7071

describe("computeStandardErrors", () => {
  const X_T_X = math.matrix([
    [3, 6],
    [6, 14],
  ]);

  test("returns array of length k+1", () => {
    const se = computeStandardErrors(X_T_X, math.bignumber(1), 1);
    expect(se.length).toBe(2);
  });

  test("all SEs are 0 when eseSq is 0 (perfect fit)", () => {
    const se = computeStandardErrors(X_T_X, math.bignumber(0), 1);
    se.forEach((s) => expect(toNum(s)).toBeCloseTo(0, 10));
  });

  test("SE[0] equals sqrt(diag[0] of (XᵀX)⁻¹) when eseSq=1", () => {
    const se = computeStandardErrors(X_T_X, math.bignumber(1), 1);
    expect(toNum(se[0])).toBeCloseTo(Math.sqrt(14 / 6), 8);
  });

  test("SE[1] equals sqrt(diag[1] of (XᵀX)⁻¹) when eseSq=1", () => {
    const se = computeStandardErrors(X_T_X, math.bignumber(1), 1);
    expect(toNum(se[1])).toBeCloseTo(Math.sqrt(3 / 6), 8);
  });

  test("SEs scale with eseSq", () => {
    const se1 = computeStandardErrors(X_T_X, math.bignumber(1), 1);
    const se4 = computeStandardErrors(X_T_X, math.bignumber(4), 1);
    expect(toNum(se4[0])).toBeCloseTo(toNum(se1[0]) * 2, 8);
    expect(toNum(se4[1])).toBeCloseTo(toNum(se1[1]) * 2, 8);
  });
});

// ─── computeConfidenceIntervals ──────────────────────────────────────────────
// coefficients = [1, 2], standardErrors = [0, 0]  →  CI = [[1,1], [2,2]]
// coefficients = [0],    standardErrors = [1],  alpha=0.05, df=30
//   tCritical ≈ 2.042  →  CI ≈ [-2.042, 2.042]

describe("computeConfidenceIntervals", () => {
  const toUINumber = (v) => Number(v);

  test("returns one interval per coefficient", () => {
    const ci = computeConfidenceIntervals(
      0.05,
      30,
      [1, 2],
      [math.bignumber(0), math.bignumber(0)],
      toUINumber
    );
    expect(ci.length).toBe(2);
  });

  test("each interval is [lower, upper] pair", () => {
    const ci = computeConfidenceIntervals(0.05, 30, [1], [math.bignumber(0)], toUINumber);
    expect(ci[0].length).toBe(2);
  });

  test("interval collapses to point when SE is 0", () => {
    const ci = computeConfidenceIntervals(0.05, 30, [5], [math.bignumber(0)], toUINumber);
    expect(ci[0][0]).toBeCloseTo(5, 8);
    expect(ci[0][1]).toBeCloseTo(5, 8);
  });

  test("interval is symmetric around the coefficient", () => {
    const ci = computeConfidenceIntervals(0.05, 30, [0], [math.bignumber(1)], toUINumber);
    expect(ci[0][0]).toBeCloseTo(-ci[0][1], 8);
  });

  test("wider interval with larger alpha (less confidence)", () => {
    const ci95 = computeConfidenceIntervals(0.05, 30, [0], [math.bignumber(1)], toUINumber);
    const ci90 = computeConfidenceIntervals(0.1, 30, [0], [math.bignumber(1)], toUINumber);
    expect(ci90[0][1]).toBeLessThan(ci95[0][1]);
  });

  test("lower bound is always less than upper bound", () => {
    const ci = computeConfidenceIntervals(
      0.05,
      10,
      [3, -1],
      [math.bignumber(0.5), math.bignumber(0.2)],
      toUINumber
    );
    ci.forEach(([lo, hi]) => expect(lo).toBeLessThan(hi));
  });
});

// ─── computeTStats ───────────────────────────────────────────────────────────
// coefficients=[4], standardErrors=[2], df=100, alpha=0.05
//   tStat = 2, pValue = 2*(1 - cdf(2,100)) ≈ 0.048 → significant
// coefficients=[0], standardErrors=[1]
//   tStat = 0, pValue = 1 → not significant

describe("computeTStats", () => {
  test("tStats = coefficients / standardErrors", () => {
    const { tStats } = computeTStats(
      [math.bignumber(4), math.bignumber(6)],
      [math.bignumber(2), math.bignumber(3)],
      100,
      0.05
    );
    expect(toNum(tStats[0])).toBeCloseTo(2, 8);
    expect(toNum(tStats[1])).toBeCloseTo(2, 8);
  });

  test("pValue is 1 when coefficient is 0", () => {
    const { pValues } = computeTStats([math.bignumber(0)], [math.bignumber(1)], 30, 0.05);
    expect(pValues[0]).toBeCloseTo(1, 8);
  });

  test("isSignificant true when p < alpha", () => {
    const { isSignificant } = computeTStats([math.bignumber(4)], [math.bignumber(2)], 100, 0.05);
    expect(isSignificant[0]).toBe(true);
  });

  test("isSignificant false when p >= alpha", () => {
    const { isSignificant } = computeTStats([math.bignumber(0)], [math.bignumber(1)], 30, 0.05);
    expect(isSignificant[0]).toBe(false);
  });

  test("returns one entry per coefficient", () => {
    const { tStats, pValues, isSignificant } = computeTStats(
      [math.bignumber(1), math.bignumber(2), math.bignumber(3)],
      [math.bignumber(1), math.bignumber(1), math.bignumber(1)],
      50,
      0.05
    );
    expect(tStats.length).toBe(3);
    expect(pValues.length).toBe(3);
    expect(isSignificant.length).toBe(3);
  });
});

// ─── computePredictorStats ───────────────────────────────────────────────────
// X = [[1,1,2],[1,2,1],[1,3,4],[1,4,3]], k=2
// predictorCols[0]=[1,2,3,4], predictorCols[1]=[2,1,4,3]
// predictorMeans = [2.5, 2.5], predictorSS = [5, 5]

describe("computePredictorStats", () => {
  const X = [
    [math.bignumber(1), math.bignumber(1), math.bignumber(2)],
    [math.bignumber(1), math.bignumber(2), math.bignumber(1)],
    [math.bignumber(1), math.bignumber(3), math.bignumber(4)],
    [math.bignumber(1), math.bignumber(4), math.bignumber(3)],
  ];
  const { predictorCols, predictorMeans, predictorSS } = computePredictorStats(X, 2);

  test("predictorCols extracts columns after intercept", () => {
    expect(predictorCols[0].map(toNum)).toEqual([1, 2, 3, 4]);
    expect(predictorCols[1].map(toNum)).toEqual([2, 1, 4, 3]);
  });

  test("predictorMeans are correct", () => {
    expect(toNum(predictorMeans[0])).toBeCloseTo(2.5, 8);
    expect(toNum(predictorMeans[1])).toBeCloseTo(2.5, 8);
  });

  test("predictorSS are correct", () => {
    expect(toNum(predictorSS[0])).toBeCloseTo(5, 8);
    expect(toNum(predictorSS[1])).toBeCloseTo(5, 8);
  });
});

// ─── computeBetaWeights ──────────────────────────────────────────────────────
// slopes=[2], predictorSS=[4], ssTotal=16, n=3
// sdXi = sqrt(4/2) = sqrt(2), sdY = sqrt(16/2) = 2√2
// betaWeight = 2 * sqrt(2) / (2√2) = 1

describe("computeBetaWeights", () => {
  const toUINumber = (v) => Number(v);

  test("betaWeight = 1 when b·sdX = sdY", () => {
    const weights = computeBetaWeights(
      [math.bignumber(2)],
      [math.bignumber(4)],
      math.bignumber(16),
      3,
      toUINumber
    );
    expect(weights[0]).toBeCloseTo(1, 8);
  });

  test("betaWeight = 0 when slope is 0", () => {
    const weights = computeBetaWeights(
      [math.bignumber(0)],
      [math.bignumber(4)],
      math.bignumber(16),
      3,
      toUINumber
    );
    expect(weights[0]).toBeCloseTo(0, 8);
  });

  test("returns one weight per slope", () => {
    const weights = computeBetaWeights(
      [math.bignumber(1), math.bignumber(2)],
      [math.bignumber(4), math.bignumber(4)],
      math.bignumber(16),
      3,
      toUINumber
    );
    expect(weights.length).toBe(2);
  });
});

// ─── computeRSquared ─────────────────────────────────────────────────────────

describe("computeRSquared", () => {
  test("rSquared = 1 for perfect fit (ssRes=0)", () => {
    const { rSquared } = computeRSquared(math.bignumber(0), math.bignumber(8), 3, 1);
    expect(toNum(rSquared)).toBeCloseTo(1, 10);
  });

  test("rSquared = 0 when model explains nothing (ssRes=ssTotal)", () => {
    const { rSquared } = computeRSquared(math.bignumber(8), math.bignumber(8), 5, 3);
    expect(toNum(rSquared)).toBeCloseTo(0, 10);
  });

  test("rSquared = 0.5 when ssRes is half of ssTotal", () => {
    const { rSquared } = computeRSquared(math.bignumber(4), math.bignumber(8), 5, 3);
    expect(toNum(rSquared)).toBeCloseTo(0.5, 8);
  });

  test("adjustedRSquared = 1 for perfect fit", () => {
    const { adjustedRSquared } = computeRSquared(math.bignumber(0), math.bignumber(8), 3, 1);
    expect(toNum(adjustedRSquared)).toBeCloseTo(1, 10);
  });

  test("adjustedRSquared < rSquared when fit is imperfect", () => {
    const { rSquared, adjustedRSquared } = computeRSquared(
      math.bignumber(4),
      math.bignumber(8),
      5,
      3
    );
    expect(toNum(adjustedRSquared)).toBeLessThan(toNum(rSquared));
  });
});

// ─── computeFStat ────────────────────────────────────────────────────────────
// rSquared=0.9, k=1, df=10, alpha=0.05
// fStat = (0.9/1) / (0.1/10) = 90 → very significant

describe("computeFStat", () => {
  test("fStat is correct", () => {
    const { fStat } = computeFStat(math.bignumber(0.9), 1, 10, 0.05);
    expect(toNum(fStat)).toBeCloseTo(90, 6);
  });

  test("fIsSignificant true for large fStat", () => {
    const { fIsSignificant } = computeFStat(math.bignumber(0.9), 1, 10, 0.05);
    expect(fIsSignificant).toBe(true);
  });

  test("fIsSignificant false when rSquared is near 0", () => {
    const { fIsSignificant } = computeFStat(math.bignumber(0.01), 1, 5, 0.05);
    expect(fIsSignificant).toBe(false);
  });

  test("fSignificance is between 0 and 1", () => {
    const { fSignificance } = computeFStat(math.bignumber(0.5), 2, 10, 0.05);
    expect(fSignificance).toBeGreaterThanOrEqual(0);
    expect(fSignificance).toBeLessThanOrEqual(1);
  });
});

// ─── computeCorrelationMatrix ────────────────────────────────────────────────
// Single predictor → [[1]]
// Two predictors: X1=[1,2,3,4], X2=[4,3,2,1] → perfectly negatively correlated → r=-1

describe("computeCorrelationMatrix", () => {
  const toUINumber = (v) => Number(v);
  const n = 4;

  test("single predictor returns 1×1 matrix with value 1", () => {
    const cols = [[math.bignumber(1), math.bignumber(2), math.bignumber(3), math.bignumber(4)]];
    const means = [math.bignumber(2.5)];
    const ss = [math.bignumber(5)];
    const m = computeCorrelationMatrix(cols, means, ss, n, toUINumber);
    expect(m).toEqual([[1]]);
  });

  test("diagonal is always 1", () => {
    const cols = [
      [math.bignumber(1), math.bignumber(2), math.bignumber(3), math.bignumber(4)],
      [math.bignumber(4), math.bignumber(3), math.bignumber(2), math.bignumber(1)],
    ];
    const means = [math.bignumber(2.5), math.bignumber(2.5)];
    const ss = [math.bignumber(5), math.bignumber(5)];
    const m = computeCorrelationMatrix(cols, means, ss, n, toUINumber);
    expect(m[0][0]).toBe(1);
    expect(m[1][1]).toBe(1);
  });

  test("perfectly negatively correlated predictors give r=-1", () => {
    const cols = [
      [math.bignumber(1), math.bignumber(2), math.bignumber(3), math.bignumber(4)],
      [math.bignumber(4), math.bignumber(3), math.bignumber(2), math.bignumber(1)],
    ];
    const means = [math.bignumber(2.5), math.bignumber(2.5)];
    const ss = [math.bignumber(5), math.bignumber(5)];
    const m = computeCorrelationMatrix(cols, means, ss, n, toUINumber);
    expect(m[0][1]).toBeCloseTo(-1, 8);
    expect(m[1][0]).toBeCloseTo(-1, 8);
  });
});

// ─── computeVIF ──────────────────────────────────────────────────────────────
// k=1 → VIF=[1], hasMulticollinearity=false
// k=2, orthogonal predictors → VIF≈1

describe("computeVIF", () => {
  const toUINumber = (v) => Number(v);

  test("k=1 always returns VIF=1 without regression", () => {
    const { vifValues, hasMulticollinearity } = computeVIF(
      [],
      [[]],
      [math.bignumber(1)],
      3,
      1,
      toUINumber
    );
    expect(vifValues[0]).toBe(1);
    expect(hasMulticollinearity).toBe(false);
  });

  test("k=2 uncorrelated predictors → VIF≈1, no multicollinearity", () => {
    // X1=[1,2,3,4], X2=[2,1,4,3] — low correlation
    const X = [
      [math.bignumber(1), math.bignumber(1), math.bignumber(2)],
      [math.bignumber(1), math.bignumber(2), math.bignumber(1)],
      [math.bignumber(1), math.bignumber(3), math.bignumber(4)],
      [math.bignumber(1), math.bignumber(4), math.bignumber(3)],
    ];
    const predictorCols = [
      [math.bignumber(1), math.bignumber(2), math.bignumber(3), math.bignumber(4)],
      [math.bignumber(2), math.bignumber(1), math.bignumber(4), math.bignumber(3)],
    ];
    const predictorSS = [math.bignumber(5), math.bignumber(5)];
    const { vifValues, hasMulticollinearity } = computeVIF(
      X,
      predictorCols,
      predictorSS,
      4,
      2,
      toUINumber
    );
    expect(vifValues.length).toBe(2);
    vifValues.forEach((v) => expect(v).toBeLessThan(5));
    expect(hasMulticollinearity).toBe(false);
  });
});

// ─── regression (end-to-end) ─────────────────────────────────────────────────

describe("regression", () => {
  const toUINumber = (v) => Number(v);

  // Perfect linear relationship: Y = 2X + 1
  const makeLinear = () => ({
    yData: { data: [[3], [5], [7], [9], [11]], meta: [{ name: "Y", unit: "" }] },
    xData: { data: [[1], [2], [3], [4], [5]], meta: [{ name: "X", unit: "" }] },
  });

  // Near-linear with small noise: Y ≈ 2X, n=8, df=6 → non-zero SE, valid p-values
  const makeNoisy = () => ({
    yData: {
      data: [[2.1], [4.0], [6.1], [8.0], [10.1], [12.0], [14.0], [16.1]],
      meta: [{ name: "Y", unit: "" }],
    },
    xData: {
      data: [[1], [2], [3], [4], [5], [6], [7], [8]],
      meta: [{ name: "X", unit: "" }],
    },
  });

  test("recovers intercept b0 ≈ 1 for Y = 2X + 1", () => {
    const { yData, xData } = makeLinear();
    const result = regression(yData, xData, 0.05, "linear", { toUINumber });
    expect(result.b0).toBeCloseTo(1, 6);
  });

  test("recovers slope ≈ 2 for Y = 2X + 1", () => {
    const { yData, xData } = makeLinear();
    const result = regression(yData, xData, 0.05, "linear", { toUINumber });
    expect(result.slopes[0]).toBeCloseTo(2, 6);
  });

  test("R² ≈ 1 for a perfect linear fit", () => {
    const { yData, xData } = makeLinear();
    const result = regression(yData, xData, 0.05, "linear", { toUINumber });
    expect(result.rSquared).toBeCloseTo(1, 6);
  });

  test("adjusted R² ≈ 1 for a perfect linear fit", () => {
    const { yData, xData } = makeLinear();
    const result = regression(yData, xData, 0.05, "linear", { toUINumber });
    expect(result.adjustedRSquared).toBeCloseTo(1, 6);
  });

  test("ssRes ≈ 0 for a perfect linear fit", () => {
    const { yData, xData } = makeLinear();
    const result = regression(yData, xData, 0.05, "linear", { toUINumber });
    expect(Math.abs(result.ssRes)).toBeLessThan(1e-8);
  });

  test("returns correct k and df", () => {
    const { yData, xData } = makeLinear();
    const result = regression(yData, xData, 0.05, "linear", { toUINumber });
    expect(result.k).toBe(1);
    expect(result.df).toBe(3);
  });

  test("VIF = 1 for a single predictor", () => {
    const { yData, xData } = makeLinear();
    const result = regression(yData, xData, 0.05, "linear", { toUINumber });
    expect(result.vifValues[0]).toBeCloseTo(1, 6);
  });

  test("hasMulticollinearity is false for a single predictor", () => {
    const { yData, xData } = makeLinear();
    const result = regression(yData, xData, 0.05, "linear", { toUINumber });
    expect(result.hasMulticollinearity).toBe(false);
  });

  test("pValue for the slope is very small for a strongly linear dataset", () => {
    const { yData, xData } = makeNoisy();
    const result = regression(yData, xData, 0.05, "linear", { toUINumber });
    expect(result.pValues[1]).toBeLessThan(0.001);
  });

  test("slope is flagged as significant at alpha=0.05 for a strongly linear dataset", () => {
    const { yData, xData } = makeNoisy();
    const result = regression(yData, xData, 0.05, "linear", { toUINumber });
    expect(result.isSignificant[1]).toBe(true);
  });

  test("confidence interval for slope contains the true value 2", () => {
    const { yData, xData } = makeNoisy();
    const result = regression(yData, xData, 0.05, "linear", { toUINumber });
    const [lower, upper] = result.confidenceIntervals[1];
    expect(lower).toBeLessThanOrEqual(2);
    expect(upper).toBeGreaterThanOrEqual(2);
  });

  test("multiple regression: near-perfect fit with independent predictors", () => {
    const yData = {
      data: [[6.1], [9.0], [7.9], [11.1], [13.0], [6.0], [11.1], [15.9]],
      meta: [{ name: "Y", unit: "" }],
    };
    const xData = {
      data: [
        [1, 1],
        [1, 2],
        [2, 1],
        [2, 2],
        [3, 2],
        [1, 1],
        [2, 2],
        [3, 3],
      ],
      meta: [
        { name: "X1", unit: "" },
        { name: "X2", unit: "" },
      ],
    };
    const result = regression(yData, xData, 0.05, "linear", { toUINumber });
    expect(result.rSquared).toBeGreaterThan(0.99);
    expect(result.k).toBe(2);
    expect(result.slopes.length).toBe(2);
  });

  test("log-linear model achieves near-perfect fit for power-law data", () => {
    const xs = [1, 2, 3, 4, 5];
    const yData = { data: xs.map((x) => [Math.E * x * x]), meta: [{ name: "Y", unit: "" }] };
    const xData = { data: xs.map((x) => [x]), meta: [{ name: "X", unit: "" }] };
    const result = regression(yData, xData, 0.05, "log-linear", { toUINumber });
    expect(result.rSquared).toBeCloseTo(1, 4);
    expect(result.b0).toBeCloseTo(1, 4);
    expect(result.slopes[0]).toBeCloseTo(2, 4);
  });

  test("throws when log-linear model receives non-positive Y values", () => {
    const yData = { data: [[-1], [2], [3]], meta: [{ name: "Y", unit: "" }] };
    const xData = { data: [[1], [2], [3]], meta: [{ name: "X", unit: "" }] };
    expect(() => regression(yData, xData, 0.05, "log-linear", { toUINumber })).toThrow();
  });
});
