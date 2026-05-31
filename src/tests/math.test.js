import { calculateDescriptiveStats, calculateRegression } from "../libraries/utils/math";

const toUINumber = (x) => Number(x);

// ─── calculateDescriptiveStats ───────────────────────────────────────────────

describe("calculateDescriptiveStats", () => {
  // Dataset: [2, 4, 4, 4, 5, 5, 7, 9]
  // mean=5, Σ(x-mean)²=32, Bessel stdDev=sqrt(32/7)≈2.138, SE=sqrt(4/7)≈0.756
  const data = [2, 4, 4, 4, 5, 5, 7, 9];

  test("returns correct sample size", () => {
    const result = calculateDescriptiveStats(data);
    expect(result.n).toBe(8);
  });

  test("returns correct mean", () => {
    const result = calculateDescriptiveStats(data);
    expect(result.mean).toBeCloseTo(5, 10);
  });

  test("returns correct Bessel-corrected standard deviation", () => {
    // stdDev = sqrt(32/7) — Bessel correction divides by n-1=7
    const result = calculateDescriptiveStats(data);
    expect(result.stdDev).toBeCloseTo(Math.sqrt(32 / 7), 8);
  });

  test("returns correct standard error of the mean", () => {
    // SE = stdDev / sqrt(n) = sqrt(32/7) / sqrt(8) = sqrt(4/7) = 2/sqrt(7)
    const result = calculateDescriptiveStats(data);
    expect(result.standardError).toBeCloseTo(2 / Math.sqrt(7), 8);
  });

  test("lower bound is below mean and upper bound is above mean", () => {
    const result = calculateDescriptiveStats(data);
    expect(result.lowerBound).toBeLessThan(result.mean);
    expect(result.upperBound).toBeGreaterThan(result.mean);
  });

  test("confidence interval is symmetric around the mean", () => {
    const result = calculateDescriptiveStats(data);
    const marginLower = result.mean - result.lowerBound;
    const marginUpper = result.upperBound - result.mean;
    expect(marginLower).toBeCloseTo(marginUpper, 10);
  });

  test("wider CI at alpha=0.01 than at alpha=0.10", () => {
    const r01 = calculateDescriptiveStats(data, 0.01);
    const r10 = calculateDescriptiveStats(data, 0.1);
    expect(r01.upperBound - r01.lowerBound).toBeGreaterThan(r10.upperBound - r10.lowerBound);
  });

  test("single-element array: mean is correct", () => {
    const result = calculateDescriptiveStats([42]);
    expect(result.mean).toBe(42);
  });
});

// ─── calculateRegression ────────────────────────────────────────────────────

describe("calculateRegression", () => {
  // Perfect linear relationship: Y = 2X + 1
  const makeLinear = () => ({
    yData: {
      data: [[3], [5], [7], [9], [11]],
      meta: [{ name: "Y", unit: "" }],
    },
    xData: {
      data: [[1], [2], [3], [4], [5]],
      meta: [{ name: "X", unit: "" }],
    },
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
    const result = calculateRegression(yData, xData, "linear", toUINumber);
    expect(result.b0).toBeCloseTo(1, 6);
  });

  test("recovers slope ≈ 2 for Y = 2X + 1", () => {
    const { yData, xData } = makeLinear();
    const result = calculateRegression(yData, xData, "linear", toUINumber);
    expect(result.slopes[0]).toBeCloseTo(2, 6);
  });

  test("R² ≈ 1 for a perfect linear fit", () => {
    const { yData, xData } = makeLinear();
    const result = calculateRegression(yData, xData, "linear", toUINumber);
    expect(result.rSquared).toBeCloseTo(1, 6);
  });

  test("adjusted R² ≈ 1 for a perfect linear fit", () => {
    const { yData, xData } = makeLinear();
    const result = calculateRegression(yData, xData, "linear", toUINumber);
    expect(result.adjustedRSquared).toBeCloseTo(1, 6);
  });

  test("ssRes ≈ 0 for a perfect linear fit", () => {
    const { yData, xData } = makeLinear();
    const result = calculateRegression(yData, xData, "linear", toUINumber);
    expect(Math.abs(result.ssRes)).toBeLessThan(1e-8);
  });

  test("returns correct k and df", () => {
    const { yData, xData } = makeLinear();
    const result = calculateRegression(yData, xData, "linear", toUINumber);
    // k=1 predictor, df = n - k - 1 = 5 - 1 - 1 = 3
    expect(result.k).toBe(1);
    expect(result.df).toBe(3);
  });

  test("VIF = 1 for a single predictor", () => {
    const { yData, xData } = makeLinear();
    const result = calculateRegression(yData, xData, "linear", toUINumber);
    expect(result.vifValues[0]).toBeCloseTo(1, 6);
  });

  test("hasMulticollinearity is false for a single predictor", () => {
    const { yData, xData } = makeLinear();
    const result = calculateRegression(yData, xData, "linear", toUINumber);
    expect(result.hasMulticollinearity).toBe(false);
  });

  test("pValue for the slope is very small for a strongly linear dataset", () => {
    // Non-zero residuals keep SE > 0, giving valid (non-NaN) p-values
    const { yData, xData } = makeNoisy();
    const result = calculateRegression(yData, xData, "linear", toUINumber);
    expect(result.pValues[1]).toBeLessThan(0.001);
  });

  test("slope is flagged as significant at alpha=0.05 for a strongly linear dataset", () => {
    // isSignificant[0] = intercept, isSignificant[1] = first slope
    const { yData, xData } = makeNoisy();
    const result = calculateRegression(yData, xData, "linear", toUINumber, 0.05);
    expect(result.isSignificant[1]).toBe(true);
  });

  test("confidence interval for slope contains the true value 2", () => {
    const { yData, xData } = makeNoisy();
    const result = calculateRegression(yData, xData, "linear", toUINumber, 0.05);
    const [lower, upper] = result.confidenceIntervals[1];
    expect(lower).toBeLessThanOrEqual(2);
    expect(upper).toBeGreaterThanOrEqual(2);
  });

  test("multiple regression: near-perfect fit with independent predictors", () => {
    // Y ≈ 1 + 2*X1 + 3*X2 with small noise; X1 and X2 are not collinear
    const yData = {
      data: [[6.1], [9.0], [7.9], [11.1], [13.0], [6.0], [11.1], [15.9]],
      meta: [{ name: "Y", unit: "" }],
    };
    const xData = {
      // X1=[1,1,2,2,3,1,2,3], X2=[1,2,1,2,2,1,2,3] — no perfect collinearity
      data: [[1, 1], [1, 2], [2, 1], [2, 2], [3, 2], [1, 1], [2, 2], [3, 3]],
      meta: [
        { name: "X1", unit: "" },
        { name: "X2", unit: "" },
      ],
    };
    const result = calculateRegression(yData, xData, "linear", toUINumber);
    expect(result.rSquared).toBeGreaterThan(0.99);
    expect(result.k).toBe(2);
    expect(result.slopes.length).toBe(2);
  });

  test("log-linear model achieves near-perfect fit for power-law data", () => {
    // Y = e * X²  →  ln(Y) = 1 + 2·ln(X), so b0=1 and b1=2 in the log-log space
    // log-linear transforms BOTH X and Y with ln before fitting
    const xs = [1, 2, 3, 4, 5];
    const yData = {
      data: xs.map((x) => [Math.E * x * x]),
      meta: [{ name: "Y", unit: "" }],
    };
    const xData = {
      data: xs.map((x) => [x]),
      meta: [{ name: "X", unit: "" }],
    };
    const result = calculateRegression(yData, xData, "log-linear", toUINumber);
    expect(result.rSquared).toBeCloseTo(1, 4);
    expect(result.b0).toBeCloseTo(1, 4);
    expect(result.slopes[0]).toBeCloseTo(2, 4);
  });

  test("throws when log-linear model receives non-positive Y values", () => {
    const yData = { data: [[-1], [2], [3]], meta: [{ name: "Y", unit: "" }] };
    const xData = { data: [[1], [2], [3]], meta: [{ name: "X", unit: "" }] };
    expect(() => calculateRegression(yData, xData, "log-linear", toUINumber)).toThrow();
  });
});
