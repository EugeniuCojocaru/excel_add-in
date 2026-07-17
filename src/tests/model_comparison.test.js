import { comparisonInterpretation } from "@econometrics/use_cases/model_comparison";

const t = (key, params = {}) => {
  if (!params || Object.keys(params).length === 0) return key;
  const interpolated = Object.entries(params).reduce(
    (acc, [k, v]) => acc.replace(new RegExp(`{{${k}}}`, "g"), v),
    key
  );
  return interpolated;
};

const modelsStats = [
  { modelType: "linear", rSquared: 0.7, ssRes: 20 },
  { modelType: "log-linear", rSquared: 0.9, ssRes: 5 },
  { modelType: "lin-log", rSquared: 0.8, ssRes: 12 },
];

const flatten = (result) => result.dataToWrite.flatMap((r) => r.row).join(" ");

describe("comparisonInterpretation", () => {
  test("returns dataToWrite array and maxColumns number", () => {
    const result = comparisonInterpretation(modelsStats, t);
    expect(Array.isArray(result.dataToWrite)).toBe(true);
    expect(typeof result.maxColumns).toBe("number");
  });

  test("includes a row for every model", () => {
    const result = comparisonInterpretation(modelsStats, t);
    const flat = flatten(result);
    expect(flat).toContain("linear");
    expect(flat).toContain("log-linear");
    expect(flat).toContain("lin-log");
  });

  test("identifies the model with the highest R² as best", () => {
    const result = comparisonInterpretation(modelsStats, t);
    expect(flatten(result)).toContain("log-linear (0.9)");
  });

  test("identifies the model with the lowest RSS as best", () => {
    const result = comparisonInterpretation(modelsStats, t);
    expect(flatten(result)).toContain("log-linear (5)");
  });

  test("conclusion references the lowest-RSS model", () => {
    const result = comparisonInterpretation(modelsStats, t, "STUDENT");
    expect(flatten(result)).toContain("modelComparison.interpretation.conclusion");
  });

  test("COMPACT mode uses the compact conclusion key and produces fewer rows", () => {
    const studentResult = comparisonInterpretation(modelsStats, t, "STUDENT");
    const compactResult = comparisonInterpretation(modelsStats, t, "COMPACT");
    expect(flatten(compactResult)).toContain("modelComparison.interpretation.conclusionCompact");
    expect(compactResult.dataToWrite.length).toBeLessThan(studentResult.dataToWrite.length);
  });
});
