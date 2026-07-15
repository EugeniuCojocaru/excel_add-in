import { randColor, toUIStats } from "@econometrics/helpers/stat_color_steps";

describe("randColor", () => {
  test("is deterministic for the same inputs", () => {
    expect(randColor(2, "slopes1")).toBe(randColor(2, "slopes1"));
  });

  test("returns a valid 6-digit hex color", () => {
    expect(randColor(0.123, "rSquared")).toMatch(/^#[0-9a-f]{6}$/i);
  });

  test("differs when the key differs, even for the same value", () => {
    expect(randColor(1, "a")).not.toBe(randColor(1, "b"));
  });
});

describe("toUIStats", () => {
  const stats = {
    alpha: 0.05,
    modelType: "linear",
    k: 1,
    df: 3,
    ssRes: 2,
    b0: 1,
    slopes: [2],
    rSquared: 0.9,
    adjustedRSquared: 0.85,
    ese: 1.1,
    standardErrors: [0.1, 0.2],
    confidenceIntervals: [
      [0.8, 1.2],
      [1.8, 2.2],
    ],
    tStats: [10, 15],
    pValues: [0.01, 0.02],
    isSignificant: [true],
    fStat: 50,
    fSignificance: 0.001,
    fIsSignificant: true,
    betaWeights: [0.5],
    correlationMatrix: [[1]],
    vifValues: [1],
    hasMulticollinearity: false,
  };

  test("passes non-numeric fields through unchanged", () => {
    const result = toUIStats(stats);
    expect(result.alpha).toBe(0.05);
    expect(result.modelType).toBe("linear");
    expect(result.isSignificant).toBe(stats.isSignificant);
    expect(result.fIsSignificant).toBe(true);
    expect(result.hasMulticollinearity).toBe(false);
  });

  test("wraps a scalar field as { value, color }", () => {
    const result = toUIStats(stats);
    expect(result.rSquared).toEqual({ value: 0.9, color: randColor(0.9, "rSquared") });
  });

  test("wraps an array field element-wise", () => {
    const result = toUIStats(stats);
    expect(result.slopes).toEqual([{ value: 2, color: randColor(2, "slopes1") }]);
  });

  test("wraps each confidence interval as a [lower, upper] pair of { value, color }", () => {
    const result = toUIStats(stats);
    expect(result.confidenceIntervals).toEqual([
      [
        { value: 0.8, color: randColor(0.8, "ci0Lower") },
        { value: 1.2, color: randColor(1.2, "ci0Upper") },
      ],
      [
        { value: 1.8, color: randColor(1.8, "ci1Lower") },
        { value: 2.2, color: randColor(2.2, "ci1Upper") },
      ],
    ]);
  });

  test("wraps the correlation matrix element-wise", () => {
    const result = toUIStats(stats);
    expect(result.correlationMatrix).toEqual([[{ value: 1, color: randColor(1, "corr00") }]]);
  });
});
