import { toUIData } from "@excel/helpers/morph_steps";
import { toRawData } from "@excel/helpers/raw_data_steps";
import { getBestModels, buildComparisonTable, buildComparisonConclusion } from "../helpers/model_comparison_steps";

/**
 * Compares regression models based on R² and RSS, indicating the model with the best fit.
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
