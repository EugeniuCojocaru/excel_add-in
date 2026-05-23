import { REGRESSION_INTEPRETATION } from "./interpretation";

const { getEquation, getModel, getMultipleRegressionSignificance, getInterpretation } =
  REGRESSION_INTEPRETATION;

export const interpretationRegression = (stats, alpha, yMeta, xMeta, t) => {
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
  } = stats;
  const interpretation = [["", ""]];

  interpretation.push([t("regression.interpretation.firstStep.model"), ""]); // 1. Model
  const equation = getEquation(k, b0, slopes, yMeta, xMeta, modelType);
  interpretation.push([t("regression.interpretation.firstStep.equation"), equation]);
  const model = getModel(k, pValues, fSignificance, rSquared, adjustedRSquared);
  model.forEach((value) => interpretation.push(value));
  interpretation.push(["", ""]);

  interpretation.push([t("regression.interpretation.secondStep.significance"), ""]); // 2. Semnificatie
  const significance = getMultipleRegressionSignificance(
    slopes,
    pValues,
    fSignificance,
    alpha,
    yMeta,
    xMeta,
    t
  );
  significance.forEach((value) => interpretation.push(value));

  interpretation.push([t("regression.interpretation.thirdStep.interpretation"), ""]); // 3. Interpretare
  const interpretationSlopes = getInterpretation(
    slopes,
    adjustedRSquared,
    yMeta,
    xMeta,
    modelType,
    t,
    confidenceIntervals,
    alpha
  );
  interpretationSlopes.forEach((value) => interpretation.push(value));

  return interpretation;
};
