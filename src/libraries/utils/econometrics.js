import { REGRESSION_INTEPRETATION } from "./interpretation";

const { getEquation, getModel, getMultipleRegressionSignificance, getInterpretation } =
  REGRESSION_INTEPRETATION;

export const interpretationRegression = (stats, alpha, yMeta, xMeta, modelType, t) => {
  const { k, b0, slopes, pValues, fSignificance, rSquared, adjustedRSquared } = stats;
  const interpretation = [["", ""]];

  interpretation.push([t("regression.interpretation.firstStep.model"), ""]); // 1. Model
  const equation = getEquation(k, b0, slopes, yMeta, xMeta);
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
    t
  );
  interpretationSlopes.forEach((value) => interpretation.push(value));

  return interpretation;
};

//OBSOLETE, se pastreaza pentru a nu strica interpretarea regresiei simple, care este diferita de cea a regresiei multiple
// export const interpretationSimpleRegression = (stats) => {
//   const { b0, b1, pValue, alpha, rSquared, k } = stats;
//   const interpretation = [["", ""]];

//   interpretation.push([`1. Ecuația regresiei:`, `Y = ${b0.toFixed(4)} + ${b1.toFixed(4)} * X`]);
//   interpretation.push([`2. Semnificatia modelului:`, `H0: B1 = 0`]);

//   if (b1 > 0) {
//     interpretation.push([``, `H0: B1 > 0 -> b1 > 0 deci rezulta un test unilateral la dreapta`]);
//   }
//   if (b1 < 0) {
//     interpretation.push([``, `H0: B1 < 0 -> b1 < 0 deci rezulta un test unilateral la stanga`]);
//   }
//   interpretation.push([
//     `! Info:`,
//     `deoarece am calculat p-value bilateral, pentru a testa semnificatia lui b1, trebuie sa impartim p-value la 2`,
//   ]);
//   interpretation.push([
//     `3. Compararea pValue cu nivelul de semnificatie:`,
//     `pValue/2 = ${pValue / 2} < alpha = ${alpha}`,
//   ]);
//   const isSignificant = pValue / 2 < alpha;
//   interpretation.push([
//     ``,
//     `${isSignificant ? "Respingem H0, b1 este semnificativ diferit de 0" : "H0 nu poate fi respinsa"}`,
//   ]);
//   if (isSignificant) {
//     interpretation.push([
//       `4. Concluzie:`,
//       `Cu o probabiliate de 95%, X influenteaza in mod direct Y`,
//     ]);
//     interpretation.push([
//       "5. Interpretare",
//       `Daca X creste cu o unitate, Y creste, in medie, cu ${b1.toFixed(4)}`,
//     ]);
//     interpretation.push([
//       "",
//       `${(rSquared * 100).toFixed(2)}% din variatia lui Y este explicata de variatia lui X`,
//     ]);
//   } else {
//     interpretation.push([
//       `4. Concluzie:`,
//       `Nu avem suficiente dovezi pentru a concluziona ca X influenteaza in mod semnificativ Y`,
//     ]);
//   }

//   return interpretation;
// };
