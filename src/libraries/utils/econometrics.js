import { EXCEL_FORMATS } from "./excelFormats";
import { REGRESSION_INTEPRETATION } from "./interpretation";
import { toUIData } from "./ui";

const { getEquation, getMultipleRegressionSignificance, getInterpretation } =
  REGRESSION_INTEPRETATION;

// Accepts pre-wrapped uiStats (from toUIStats) and optional { mode, fillFor } for colored output.
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
  if (mode !== "COMPACT") {
    // Model stats inline so we can apply per-cell fills
    if (k.value === 1) {
      interpretation.push(
        toUIData(
          ["pValue = ", pValues[1].value],
          [EXCEL_FORMATS.tableRowHeader, fillFor(pValues[1])]
        )
      );
    } else {
      interpretation.push(
        toUIData(
          ["pValue = ", fSignificance.value],
          [EXCEL_FORMATS.tableRowHeader, fillFor(fSignificance)]
        )
      );
      for (let i = 0; i < k.value; i++) {
        interpretation.push(
          toUIData(
            [`p${i + 1} = `, pValues[i + 1].value],
            [EXCEL_FORMATS.tableRowHeader, fillFor(pValues[i + 1])]
          )
        );
      }
    }
    interpretation.push(
      toUIData(["R² = ", rSquared.value], [EXCEL_FORMATS.tableRowHeader, fillFor(rSquared)])
    );
    if (k.value > 1) {
      interpretation.push(
        toUIData(
          ["R² adj = ", adjustedRSquared.value],
          [EXCEL_FORMATS.tableRowHeader, fillFor(adjustedRSquared)]
        )
      );
    }
    interpretation.push(toUIData([""]));
  }
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
