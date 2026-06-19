import math from "@math/config";
import { solveCoefficients, setDummyColumns, computeSumOfSquares, computeStandardErrors, computeConfidenceIntervals } from "@math/use_cases/regression";

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
  const X = [[1, 1], [1, 2], [1, 3]];
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
    const ci = computeConfidenceIntervals(0.05, 30, [1, 2], [math.bignumber(0), math.bignumber(0)], toUINumber);
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
    const ci90 = computeConfidenceIntervals(0.10, 30, [0], [math.bignumber(1)], toUINumber);
    expect(ci90[0][1]).toBeLessThan(ci95[0][1]);
  });

  test("lower bound is always less than upper bound", () => {
    const ci = computeConfidenceIntervals(0.05, 10, [3, -1], [math.bignumber(0.5), math.bignumber(0.2)], toUINumber);
    ci.forEach(([lo, hi]) => expect(lo).toBeLessThan(hi));
  });
});
