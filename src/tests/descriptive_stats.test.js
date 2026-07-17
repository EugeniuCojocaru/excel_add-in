import { descriptiveStats } from "@math/use_cases/descriptive_stats";

const toUINumber = (v) => Number(v);
const opts = { toUINumber };

// Dataset: [2, 4, 4, 4, 5, 5, 7, 9]
// mean=5, Σ(x-mean)²=32, stdDev=sqrt(32/7)≈2.138, SE=sqrt(32/7)/sqrt(8)=2/sqrt(7)≈0.756

describe("descriptiveStats", () => {
  const data = [2, 4, 4, 4, 5, 5, 7, 9];

  test("n equals array length", () => {
    expect(descriptiveStats(data, 0.05, opts).n).toBe(8);
  });

  test("mean is correct", () => {
    expect(descriptiveStats(data, 0.05, opts).mean).toBeCloseTo(5, 10);
  });

  test("stdDev uses Bessel correction (n-1)", () => {
    expect(descriptiveStats(data, 0.05, opts).stdDev).toBeCloseTo(Math.sqrt(32 / 7), 8);
  });

  test("standardError = stdDev / sqrt(n)", () => {
    expect(descriptiveStats(data, 0.05, opts).standardError).toBeCloseTo(2 / Math.sqrt(7), 8);
  });

  test("lowerBound is below mean", () => {
    const { mean, lowerBound } = descriptiveStats(data, 0.05, opts);
    expect(lowerBound).toBeLessThan(mean);
  });

  test("upperBound is above mean", () => {
    const { mean, upperBound } = descriptiveStats(data, 0.05, opts);
    expect(upperBound).toBeGreaterThan(mean);
  });

  test("confidence interval is symmetric around the mean", () => {
    const { mean, lowerBound, upperBound } = descriptiveStats(data, 0.05, opts);
    expect(mean - lowerBound).toBeCloseTo(upperBound - mean, 10);
  });

  test("confidenceLevel equals half the interval width", () => {
    const { confidenceLevel, lowerBound, upperBound } = descriptiveStats(data, 0.05, opts);
    expect(confidenceLevel).toBeCloseTo((upperBound - lowerBound) / 2, 8);
  });

  test("wider CI at alpha=0.01 than at alpha=0.10", () => {
    const r01 = descriptiveStats(data, 0.01, opts);
    const r10 = descriptiveStats(data, 0.10, opts);
    expect(r01.upperBound - r01.lowerBound).toBeGreaterThan(r10.upperBound - r10.lowerBound);
  });

  test("alpha defaults to 0.05", () => {
    const withDefault = descriptiveStats(data, undefined, opts);
    const explicit = descriptiveStats(data, 0.05, opts);
    expect(withDefault.confidenceLevel).toBeCloseTo(explicit.confidenceLevel, 10);
  });

  test("single-element array: mean equals the value", () => {
    expect(descriptiveStats([42], 0.05, opts).mean).toBe(42);
  });

  test("single-element array: stdDev is 0", () => {
    expect(descriptiveStats([42], 0.05, opts).stdDev).toBe(0);
  });

  test("single-element array: standardError is 0", () => {
    expect(descriptiveStats([42], 0.05, opts).standardError).toBe(0);
  });

  test("uniform array: stdDev is 0", () => {
    expect(descriptiveStats([3, 3, 3, 3], 0.05, opts).stdDev).toBe(0);
  });
});
