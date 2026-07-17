import {
  getXNames,
  buildRegressionStats,
  buildAnova,
  buildCoefficients,
  buildVifSection,
  buildCorrelationMatrixSection,
  buildExecutiveSummary,
} from "../helpers/summary_output_steps";
import { toRawData } from "@excel/helpers/raw_data_steps";

/**
 * Generates the complete "Excel Summary Output" style report for a regression.
 * @param {object} stats - Wrapped uiStats (from toUIStats), spread with `interpretation` when extended
 * @param {{name:string,unit:string}[]} _yMeta - unused, kept for call-site parity
 * @param {{name:string,unit:string}[]} xMeta
 * @param {(key: string, params?: object) => string} t
 * @param {{ mode?: string, fillFor?: (stat: {value:number,color?:string}|null) => object|null, extended?: boolean }} [options]
 * @returns {{ dataToWrite: { row: any[], format: (object|null)[] }[], maxColumns: number }}
 */
export const generateSummaryOutput = (
  stats,
  _yMeta,
  xMeta,
  t,
  { mode = "STUDENT", fillFor = () => null, extended = false } = {}
) => {
  const xNames = getXNames(stats.k.value, xMeta, t);
  const rows = [];

  // 1. Regression Statistics
  buildRegressionStats(stats, t, { fillFor }).forEach((row) => rows.push(row));

  // 2. ANOVA
  buildAnova(stats, t, { fillFor }).forEach((row) => rows.push(row));

  // 3. Coefficients
  buildCoefficients(stats, xNames, t, { fillFor }).forEach((row) => rows.push(row));

  // 4. Interpretation — only in extended output
  if (extended) {
    stats.interpretation.forEach((row) => rows.push(row));

    // 5. VIF & Correlation Matrix + 6. Executive Summary — multiple regression only
    if (stats.k.value > 1) {
      buildVifSection(stats, xNames, t).forEach((row) => rows.push(row));
      buildCorrelationMatrixSection(stats, xNames, t).forEach((row) => rows.push(row));
      buildExecutiveSummary(stats, xNames, t).forEach((row) => rows.push(row));
    }
  }

  return toRawData(rows);
};
