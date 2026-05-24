import { EXCEL_FORMATS } from "./excelFormats";
import { REGRESSION_INTEPRETATION } from "./interpretation";
import { toUIData, toUIStats } from "./ui";

const { getEquation, getModel, getMultipleRegressionSignificance, getInterpretation } =
  REGRESSION_INTEPRETATION;

export const interpretationRegression = (stats, alpha, yMeta, xMeta, t) => {
  const uiStats = toUIStats(stats);
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

  const model = getModel(
    k.value,
    pValues.map((p) => p.value),
    fSignificance.value,
    rSquared.value,
    adjustedRSquared.value
  );
  model.forEach((row) => interpretation.push(toUIData(row, [EXCEL_FORMATS.tableRowHeader, null])));
  interpretation.push(toUIData([""]));

  // 2. Semnificatie
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
    t
  );
  significance.forEach((row) => interpretation.push(row));
  interpretation.push(toUIData([""]));

  // 3. Interpretare
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
    alpha
  );
  interpretationSlopes.forEach((row) => interpretation.push(row));

  return interpretation;
};
