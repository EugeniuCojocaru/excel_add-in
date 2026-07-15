import { EXCEL_FORMATS } from "@utils/excelFormats";
import { toUIData } from "@utils/ui";
import {
  getEquation,
  getMultipleRegressionSignificance,
  getInterpretation,
  buildModelStats,
} from "../helpers/regression_interpretation_steps";

/**
 * Construiește interpretarea narativă completă a unei regresii (model, semnificație, interpretare).
 * @param {object} uiStats - Pre-wrapped uiStats (from toUIStats)
 * @param {number} alpha
 * @param {{name:string,unit:string}[]} yMeta
 * @param {{name:string,unit:string,isDummy?:boolean}[]} xMeta
 * @param {(key: string, params?: object) => string} t
 * @param {{ mode?: string, fillFor?: (stat: {value:number,color?:string}|null) => object|null }} [options]
 * @returns {{ row: any[], format: (object|null)[] }[]}
 */
export const interpretationRegression = (
  uiStats,
  alpha,
  yMeta,
  xMeta,
  t,
  { mode = "STUDENT", fillFor = () => null } = {}
) => {
  const {
    k,
    b0,
    slopes,
    pValues,
    fSignificance,
    rSquared,
    adjustedRSquared,
    modelType,
    confidenceIntervals,
  } = uiStats;
  const interpretation = [toUIData([""])];

  // 1. Model
  interpretation.push(
    toUIData(
      [t("regression.interpretation.firstStep.model")],
      [{ ...EXCEL_FORMATS.h1Title, fullWidth: true }]
    )
  );
  interpretation.push(toUIData([""]));
  const equation = getEquation(
    k.value,
    b0.value,
    slopes.map((s) => s.value),
    yMeta,
    xMeta,
    modelType
  );
  interpretation.push(
    toUIData(
      [t("regression.interpretation.firstStep.equation"), equation],
      [{ ...EXCEL_FORMATS.h3Subtitle, fullWidth: true }]
    )
  );
  interpretation.push(toUIData([""]));
  buildModelStats({ k, pValues, fSignificance, rSquared, adjustedRSquared }, { mode, fillFor }).forEach(
    (row) => interpretation.push(row)
  );

  // 2. Significance
  interpretation.push(
    toUIData(
      [t("regression.interpretation.secondStep.significance")],
      [{ ...EXCEL_FORMATS.h1Title, fullWidth: true }]
    )
  );
  const significance = getMultipleRegressionSignificance(
    slopes.map((s) => s.value),
    pValues.map((p) => p.value),
    fSignificance.value,
    alpha,
    yMeta,
    xMeta,
    t,
    { mode, fillFor, slopeStats: slopes, pValueStats: pValues, fSigStat: fSignificance }
  );
  significance.forEach((row) => interpretation.push(row));

  // 3. Interpretation
  interpretation.push(
    toUIData(
      [t("regression.interpretation.thirdStep.interpretation")],
      [{ ...EXCEL_FORMATS.h1Title, fullWidth: true }]
    )
  );
  const interpretationSlopes = getInterpretation(
    slopes.map((s) => s.value),
    adjustedRSquared.value,
    yMeta,
    xMeta,
    modelType,
    t,
    confidenceIntervals,
    alpha,
    { fillFor, slopeStats: slopes, adjRSqStat: adjustedRSquared }
  );
  interpretationSlopes.forEach((row) => interpretation.push(row));

  return interpretation;
};
