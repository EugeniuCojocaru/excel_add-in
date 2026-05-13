export const getEquation = (k, b0, b) => {
  let equation = `Y = ${b0}`;

  for (let i = 0; i < k; i++) {
    const slope = b[i];
    const sign = slope >= 0 ? "+" : "-";
    const absoluteValue = Math.abs(slope);
    const variableName = k === 1 ? "X" : `X${i + 1}`;
    equation += ` ${sign} ${absoluteValue} * ${variableName}`;
  }
  return equation;
};

export const getModel = (k, pValues, fSignificance, rSquared, adjustedRSquared) => {
  const model = [["pValue = ", k === 1 ? pValues[1] : fSignificance]];

  if (k > 1) {
    for (let i = 1; i < k; i++) {
      model.push([`p${i} = `, pValues[i]]);
    }
  }
  model.push(["R^2 = ", rSquared]);
  if (k > 1) model.push(["R^2 ajustat = ", adjustedRSquared]);

  return model;
};

const getSignificance = (b, pValue, alpha, bNumber, t) => {
  const significance = [["", `H0: B${bNumber} = 0 `]];

  if (b > 0) {
    significance.push([
      "",
      t("regression.interpretation.secondStep.notZeroHypothesisRight", { bNumber, b }),
    ]);
  }
  if (b < 0) {
    significance.push([
      "",
      t("regression.interpretation.secondStep.notZeroHypothesisLeft", { bNumber, b }),
    ]);
  }
  significance.push([
    t("regression.interpretation.secondStep.info"),
    t("regression.interpretation.secondStep.infoText"),
  ]);
  const pValueHalf = pValue / 2;

  significance.push([
    `${t("regression.interpretation.secondStep.pValueText")}${alpha}:`,
    `pValue/2 = ${pValueHalf} ?< α = ${alpha}`,
  ]);
  const isSignificant = pValueHalf < alpha;

  significance.push([
    "",
    `${isSignificant ? t("regression.interpretation.secondStep.significantTrue", { bNumber }) : t("regression.interpretation.secondStep.significantFalse")}`,
  ]);
  significance.push(getConclusion(isSignificant, bNumber, alpha, t));

  return significance;
};

export const getMultipleRegressionSignificance = (slopes, pValues, fSignificance, alpha, t) => {
  const significance = [["", ""]];

  slopes.forEach((b, index) => {
    const bNumber = index + 1;
    const pValue = pValues[bNumber];
    const bSignificance = getSignificance(b, pValue, alpha, bNumber, t);
    bSignificance.forEach((row) => significance.push(row));
    significance.push(["", ""]);
  });

  significance.push([t("regression.interpretation.secondStep.multipleVariableSignificance"), ""]);
  let nullHypothesis = "H0: ";
  for (let i = 0; i < slopes.length; i++) {
    nullHypothesis += `B${i + 1} = `;
  }
  nullHypothesis += "0";
  significance.push(["", nullHypothesis]);
  significance.push(["", t("regression.interpretation.secondStep.notAllZeroHypothesis")]);

  significance.push([
    `${t("regression.interpretation.secondStep.pValueText")}${alpha}:`,
    `pValue = ${fSignificance} ?< α = ${alpha}`,
  ]);

  const isSignificant = fSignificance < alpha;

  significance.push([
    "",
    `${isSignificant ? t("regression.interpretation.secondStep.significantMultipleTrue", { variablesNumber: slopes.length }) : t("regression.interpretation.secondStep.significantMultipleFalse")}`,
  ]);

  return significance;
};

export const getInterpretation = (slopes, adjustedRSquared, t) => {
  const interpretation = [["", ""]];
  for (let i = 0; i < slopes.length; i++) {
    interpretation.push([
      `b${i + 1} = ${slopes[i]}`,
      `${t("regression.interpretation.thirdStep.interpretationVariable", { bNumber: i + 1 })}${slopes[i]}`,
    ]);
  }
  interpretation.push([
    `R^2 ${t("regression.interpretation.thirdStep.r2Adjusted")} = ${adjustedRSquared}`,
    `${(adjustedRSquared * 100).toFixed(2)}% ${t("regression.interpretation.thirdStep.interpretationR2Adjusted")}`,
  ]);
  return interpretation;
};

const getConclusion = (isSignificant, bNumber, alpha, t) => {
  const percentage = (1 - alpha) * 100;
  if (isSignificant) {
    return [
      t("regression.interpretation.secondStep.conclusion"),
      t("regression.interpretation.secondStep.conclusionSignificant", { percentage, bNumber }),
    ];
  }
  return [
    t("regression.interpretation.secondStep.conclusion"),
    t("regression.interpretation.secondStep.conclusionNotSignificant", { bNumber }),
  ];
};
