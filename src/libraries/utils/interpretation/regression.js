const getEquation = (k, b0, b, yMeta, xMeta, modelType) => {
  const getYName = () => {
    const isLog = modelType === "log-linear" || modelType === "semi-log";
    const baseName = yMeta[0]?.name || "Y";
    return isLog ? `ln(${baseName})` : baseName;
  };

  const getXName = () => {
    const isLog = modelType === "log-linear" || modelType === "lin-log";
    const baseName = xMeta[0]?.name || "X";
    return isLog ? `ln(${baseName})` : baseName;
  };

  let equation = `${getYName()} = ${b0}`;

  if (k === 1) equation += ` ${b[0] >= 0 && "+"} ${b[0]} * ${getXName()}`;
  else {
    for (let i = 0; i < k; i++) {
      const slope = b[i];
      const sign = slope >= 0 ? "+" : "-";
      const absoluteValue = Math.abs(slope);
      const variableName = xMeta[i]?.name || `X${i + 1}`;
      equation += ` ${sign} ${absoluteValue} * ${variableName}`;
    }
  }
  return equation;
};

const getModel = (k, pValues, fSignificance, rSquared, adjustedRSquared) => {
  const model = [["pValue = ", k === 1 ? pValues[1] : fSignificance]];

  if (k > 1) {
    for (let i = 0; i < k; i++) {
      model.push([`p${i + 1} = `, pValues[i + 1]]);
    }
  }
  model.push(["R² = ", rSquared]);
  if (k > 1) model.push(["R² adj = ", adjustedRSquared]);

  return model;
};

const DEFAULT_ALPHA_LEVELS = [0.01, 0.05, 0.1];

const buildAlphaSet = (userAlpha) => {
  const levels = DEFAULT_ALPHA_LEVELS.includes(userAlpha)
    ? [...DEFAULT_ALPHA_LEVELS]
    : [...DEFAULT_ALPHA_LEVELS, userAlpha];
  return levels.sort((a, b) => a - b);
};

const getSignificance = (b, pValue, alpha, bNumber, yMeta, xMeta, t) => {
  const xName = xMeta[bNumber - 1]?.name || `X${bNumber}`;
  const pLabel = bNumber === 1 && xMeta.length === 1 ? "pValue" : `p${bNumber}`;
  const significance = [
    [
      t("regression.interpretation.secondStep.significanceBasedOnVariable", { xName }),
      `H0: B${bNumber} = 0 `,
    ],
  ];

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
  //TODO: add info as checkbox in UI and uncomment this!
  // significance.push([
  //   t("regression.interpretation.secondStep.info"),
  //   t("regression.interpretation.secondStep.infoText"),
  // ]);

  buildAlphaSet(alpha).forEach((level) => {
    const isSig = pValue < level;
    significance.push([
      `${t("regression.interpretation.secondStep.pValueText")}${level}:`,
      `${pLabel} = ${pValue} ?< α = ${level} => ${isSig ? t("regression.interpretation.secondStep.signicantBasicTrue", { pValue }) : t("regression.interpretation.secondStep.signicantBasicFalse", { pValue })}`,
    ]);
  });

  const isSignificant = pValue < alpha;
  significance.push([
    "",
    `${isSignificant ? t("regression.interpretation.secondStep.significantTrue", { bNumber }) : t("regression.interpretation.secondStep.significantFalse")}`,
  ]);
  significance.push(getConclusion(isSignificant, bNumber, alpha, yMeta, xMeta, t));

  return significance;
};

const getMultipleRegressionSignificance = (
  slopes,
  pValues,
  fSignificance,
  alpha,
  yMeta,
  xMeta,
  t
) => {
  const significance = [["", ""]];

  slopes.forEach((b, index) => {
    const bNumber = index + 1;
    const pValue = pValues[bNumber];
    const bSignificance = getSignificance(b, pValue, alpha, bNumber, yMeta, xMeta, t);
    bSignificance.forEach((row) => significance.push(row));
    significance.push(["", ""]);
  });

  if (slopes.length > 1) {
    let nullHypothesis = "H0: ";
    for (let i = 0; i < slopes.length; i++) {
      nullHypothesis += `B${i + 1} = `;
    }
    nullHypothesis += "0";
    significance.push([
      t("regression.interpretation.secondStep.multipleVariableSignificance"),
      nullHypothesis,
    ]);
    significance.push(["", t("regression.interpretation.secondStep.notAllZeroHypothesis")]);

    buildAlphaSet(alpha).forEach((level) => {
      const isSig = fSignificance < level;
      significance.push([
        `${t("regression.interpretation.secondStep.pValueText")}${level}:`,
        `pValue = ${fSignificance} ?< α = ${level} => ${isSig ? t("regression.interpretation.secondStep.signicantBasicTrue", { pValue: fSignificance }) : t("regression.interpretation.secondStep.signicantBasicFalse", { pValue: fSignificance })}`,
      ]);
    });
    const isSignificant = fSignificance < alpha;

    const variableNames = xMeta.map((meta, index) => meta.name || `X${index + 1}`).join(", ");
    const yName = yMeta[0]?.name || "Y";
    significance.push([
      "",
      `${isSignificant ? t("regression.interpretation.secondStep.significantMultipleTrue", { variablesNumber: slopes.length, variableNames, yName }) : t("regression.interpretation.secondStep.significantMultipleFalse")}`,
    ]);
    significance.push(["", ""]);
  }
  return significance;
};

const getConclusion = (isSignificant, bNumber, alpha, yMeta, xMeta, t) => {
  const percentage = (1 - alpha) * 100;
  const yName = yMeta[0]?.name || "Y";
  const xName = xMeta[bNumber - 1]?.name || `X${bNumber}`;
  if (isSignificant) {
    return [
      t("regression.interpretation.secondStep.conclusion"),
      t("regression.interpretation.secondStep.conclusionSignificant", { percentage, yName, xName }),
    ];
  }
  return [
    t("regression.interpretation.secondStep.conclusion"),
    t("regression.interpretation.secondStep.conclusionNotSignificant", { yName, xName }),
  ];
};

const getInterpretation = (
  slopes,
  adjustedRSquared,
  yMeta,
  xMeta,
  modelType,
  t,
  confidenceIntervals,
  alpha
) => {
  const interpretation = [];
  const yName = yMeta[0]?.name || "Y";

  const unitBasedOnModelType = (index) => {
    const isXVariableLog = modelType === "log-linear" || modelType === "lin-log";
    const xUnit = isXVariableLog
      ? "1%"
      : xMeta[index]?.unit
        ? `1 ${xMeta[index].unit}`
        : t("regression.interpretation.thirdStep.unit");
    const isYVariableLog = modelType === "log-linear" || modelType === "semi-log";
    const yUnit = isYVariableLog
      ? "%"
      : yMeta[0]?.unit
        ? yMeta[0].unit
        : ` ${t("regression.interpretation.thirdStep.units")}`;
    return { xUnit, yUnit };
  };

  const getYValueBasedOnModelType = (index) => {
    switch (modelType) {
      case "semi-log":
        return slopes[index] * 100;
      case "lin-log":
        return slopes[index] / 100;
      default:
        return slopes[index];
    }
  };

  const confidence = confidenceIntervals && alpha !== undefined ? (1 - alpha) * 100 : null;

  for (let i = 0; i < slopes.length; i++) {
    const xName = xMeta[i]?.name || `X${i + 1}`;
    const { xUnit, yUnit } = unitBasedOnModelType(i);
    const yValue = getYValueBasedOnModelType(i);
    const directionKey =
      yValue >= 0
        ? "regression.interpretation.thirdStep.interpretationVariable"
        : "regression.interpretation.thirdStep.interpretationVariableDecrease";
    interpretation.push([
      `b${i + 1} = ${slopes[i]}`,
      `${t(directionKey, { xName, xUnit, yName })}${Math.abs(yValue)}${yUnit}`,
    ]);
    if (confidence !== null) {
      const ci = confidenceIntervals[i + 1]; // [0] is intercept
      interpretation.push([
        "",
        t("regression.interpretation.thirdStep.ciSentence", {
          confidence,
          lower: ci[0],
          upper: ci[1],
          yUnit: yUnit.trim(),
        }),
      ]);
    }
  }
  const variableNames = xMeta.map((meta, index) => meta.name || `X${index + 1}`).join(", ");

  interpretation.push([
    `R^2 ${t("regression.interpretation.thirdStep.r2Adjusted")} = ${adjustedRSquared}`,
    `${(adjustedRSquared * 100).toFixed(2)}% ${t("regression.interpretation.thirdStep.interpretationR2Adjusted", { yName, variableNames })}`,
  ]);

  return interpretation;
};

const REGRESSION_INTEPRETATION = {
  getEquation,
  getModel,
  getMultipleRegressionSignificance,
  getInterpretation,
};

export default REGRESSION_INTEPRETATION;
