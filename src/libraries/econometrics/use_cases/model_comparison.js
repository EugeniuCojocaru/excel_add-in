import { toUIData } from "@utils/ui";
import { toRawData } from "@utils/rawData";
import { getBestModels, buildComparisonTable, buildComparisonConclusion } from "../helpers/model_comparison_steps";

/**
 * Compară modelele de regresie pe baza R² și RSS, indicând modelul cu cea mai bună potrivire.
 * @param {{ modelType: string, rSquared: number, ssRes: number }[]} modelsStats
 * @param {(key: string, params?: object) => string} t
 * @param {string} [mode]
 * @returns {{ dataToWrite: { row: any[], format: (object|null)[] }[], maxColumns: number }}
 */
export const comparisonInterpretation = (modelsStats, t, mode = "STUDENT") => {
  // 1. Comparison table
  const rows = buildComparisonTable(modelsStats, t);
  rows.push(toUIData([""]));

  // 2. Best model conclusion
  const { maxRSquared, minRSS } = getBestModels(modelsStats);
  buildComparisonConclusion(maxRSquared, minRSS, t, { mode }).forEach((row) => rows.push(row));

  return toRawData(rows);
};
