import { EXCEL_FORMATS } from "@excel/formats";
import { toUIData } from "@excel/helpers/morph_steps";

// TODO: bug — `b[0] >= 0 && "+"` evaluates to `false` (not `"-"`) when b[0] is
// negative, so a negative single-predictor slope renders the literal string
// "false" in the equation instead of a minus sign. Preserved as-is from the
// pre-refactor implementation; fixing it is out of scope for this refactor.
/**
 * @param {number} k
 * @param {number} b0
 * @param {number[]} b
 * @param {{ name: string, unit: string }[]} yMeta
 * @param {{ name: string, unit: string }[]} xMeta
 * @param {string} modelType
 * @returns {string}
 */
export const getEquation = (k, b0, b, yMeta, xMeta, modelType) => {
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

const DEFAULT_ALPHA_LEVELS = [0.01, 0.05, 0.1];

/**
 * @param {number} userAlpha
 * @returns {number[]}
 */
export const buildAlphaSet = (userAlpha) => {
  const levels = DEFAULT_ALPHA_LEVELS.includes(userAlpha)
    ? [...DEFAULT_ALPHA_LEVELS]
    : [...DEFAULT_ALPHA_LEVELS, userAlpha];
  return levels.sort((a, b) => a - b);
};

/**
 * @param {number} pValue
 * @param {number} alpha
 * @param {string} subject
 * @param {(key: string, params?: object) => string} t
 * @param {(stat: {value:number,color?:string}|null) => object|null} fillFor
 * @param {{value:number,color?:string}|null} pValueStat
 * @returns {{ row: any[], format: (object|null)[] }|null}
 */
export const buildAlphaInsight = (pValue, alpha, subject, t, fillFor, pValueStat) => {
  const isSig = pValue < alpha;
  const bestDefaultAlpha = DEFAULT_ALPHA_LEVELS.find((level) => pValue < level) ?? null;

  let preciseBestAlpha = null;
  for (let a = 1; a <= 10; a++) {
    if (pValue < a / 100) {
      preciseBestAlpha = a / 100;
      break;
    }
  }

  // No insight when model is significant and user alpha is at least as strict as any passing standard
  if (isSig && (bestDefaultAlpha === null || bestDefaultAlpha >= alpha)) return null;

  let preciseSuffix = "";
  if (preciseBestAlpha !== null && bestDefaultAlpha !== null && preciseBestAlpha < bestDefaultAlpha) {
    preciseSuffix = t("regression.interpretation.secondStep.conclusionAlphaInsightPrecise", {
      preciseBest: preciseBestAlpha,
    });
  }

  let insightText;
  if (isSig) {
    insightText =
      t("regression.interpretation.secondStep.conclusionAlphaInsightSignificant", {
        subject,
        alpha,
        bestDefault: bestDefaultAlpha,
      }) + preciseSuffix;
  } else if (bestDefaultAlpha !== null) {
    insightText =
      t("regression.interpretation.secondStep.conclusionAlphaInsightNotSignificant", {
        subject,
        alpha,
        bestDefault: bestDefaultAlpha,
      }) + preciseSuffix;
  } else {
    insightText = t("regression.interpretation.secondStep.conclusionAlphaInsightNoStandard", { subject });
  }

  return toUIData(["", insightText], [null, fillFor(pValueStat)]);
};

/**
 * Merges a fill color into an existing format object without mutating it.
 * @param {object|null} baseFormat
 * @param {{value:number,color?:string}|null} stat
 * @param {(stat: {value:number,color?:string}|null) => object|null} fillFor
 * @returns {object|null}
 */
export const withFill = (baseFormat, stat, fillFor) => {
  const fill = fillFor(stat);
  if (!fill || !baseFormat) return baseFormat;
  return { ...baseFormat, ...fill };
};

/**
 * @param {{
 *   pValue: number, alpha: number, bNumber?: number|null, slopes?: number[]|null,
 *   yMeta: {name:string,unit:string}[], xMeta: {name:string,unit:string}[],
 *   t: (key: string, params?: object) => string,
 *   fillFor?: (stat: {value:number,color?:string}|null) => object|null,
 *   pValueStat?: {value:number,color?:string}|null
 * }} params
 * @returns {{ row: any[], format: (object|null)[] }}
 */
export const getConclusion = ({
  pValue,
  alpha,
  bNumber = null,
  slopes = null,
  yMeta,
  xMeta,
  t,
  fillFor = () => null,
  pValueStat = null,
}) => {
  const isMultiple = slopes !== null;
  const isSignificant = pValue < alpha;
  const isMarginal = !isSignificant && pValue - alpha < 0.02;
  const yName = yMeta[0]?.name || "Y";

  let verdictKey;
  if (isMultiple) {
    if (isSignificant) verdictKey = "conclusionMultipleSignificant";
    else if (isMarginal) verdictKey = "conclusionMultipleMarginal";
    else verdictKey = "conclusionMultipleNotSignificant";
  } else {
    if (isSignificant) verdictKey = "conclusionSignificant";
    else if (isMarginal) verdictKey = "conclusionMarginal";
    else verdictKey = "conclusionNotSignificant";
  }

  let conventionalKey;
  if (pValue < 0.01) conventionalKey = "conclusionConventionalHigh";
  else if (pValue < 0.05) conventionalKey = "conclusionConventionalMod";
  else if (pValue < 0.1) conventionalKey = "conclusionConventionalMarg";
  else conventionalKey = "conclusionConventionalNone";

  const interpolation = isMultiple
    ? {
        pValue,
        alpha,
        yName,
        variableNames: xMeta.map((m, i) => m.name || `X${i + 1}`).join(", "),
        variablesNumber: slopes.length,
      }
    : {
        pValue,
        alpha,
        bNumber,
        yName,
        xName: xMeta[bNumber - 1]?.name || `X${bNumber}`,
        percentage: (1 - alpha) * 100,
      };

  const verdict = t(`regression.interpretation.secondStep.${verdictKey}`, interpolation);
  const conventional = t(`regression.interpretation.secondStep.${conventionalKey}`);

  return toUIData(
    [t("regression.interpretation.secondStep.conclusion"), `${verdict} ${conventional}`],
    [EXCEL_FORMATS.tableRowHeader, fillFor(pValueStat)]
  );
};

/**
 * @param {number} b
 * @param {number} pValue
 * @param {number} alpha
 * @param {number} bNumber
 * @param {{name:string,unit:string}[]} yMeta
 * @param {{name:string,unit:string}[]} xMeta
 * @param {(key: string, params?: object) => string} t
 * @param {{
 *   mode?: string,
 *   fillFor?: (stat: {value:number,color?:string}|null) => object|null,
 *   bStat?: {value:number,color?:string}|null,
 *   pValueStat?: {value:number,color?:string}|null
 * }} [options]
 * @returns {{ row: any[], format: (object|null)[] }[]}
 */
export const getSignificance = (
  b,
  pValue,
  alpha,
  bNumber,
  yMeta,
  xMeta,
  t,
  { mode = "STUDENT", fillFor = () => null, bStat = null, pValueStat = null } = {}
) => {
  const xName = xMeta[bNumber - 1]?.name || `X${bNumber}`;
  const pLabel = bNumber === 1 && xMeta.length === 1 ? "pValue" : `p${bNumber}`;
  const significance = [
    toUIData(
      [
        t("regression.interpretation.secondStep.significanceBasedOnVariable", { xName }),
        `H0: B${bNumber} = 0`,
      ],
      [EXCEL_FORMATS.h3Subtitle, null]
    ),
  ];

  if (mode !== "COMPACT") {
    if (b > 0) {
      significance.push(
        toUIData(
          ["", t("regression.interpretation.secondStep.notZeroHypothesisRight", { bNumber, b })],
          [null, fillFor(bStat)]
        )
      );
    }
    if (b < 0) {
      significance.push(
        toUIData(
          ["", t("regression.interpretation.secondStep.notZeroHypothesisLeft", { bNumber, b })],
          [null, fillFor(bStat)]
        )
      );
    }

    buildAlphaSet(alpha).forEach((level) => {
      const isSig = pValue < level;
      significance.push(
        toUIData(
          [
            `${t("regression.interpretation.secondStep.pValueText")}${level}:`,
            `${pLabel} = ${pValue} ?< α = ${level} => ${isSig ? t("regression.interpretation.secondStep.significantBasicTrue", { pValue }) : t("regression.interpretation.secondStep.significantBasicFalse", { pValue })}`,
          ],
          [null, fillFor(pValueStat)]
        )
      );
      significance.push(
        toUIData([
          "",
          `${isSig ? t("regression.interpretation.secondStep.significantTrue", { bNumber, level }) : t("regression.interpretation.secondStep.significantFalse", { bNumber, level })}`,
        ])
      );
    });
  }

  significance.push(
    getConclusion({ pValue, alpha, bNumber, yMeta, xMeta, t, fillFor, pValueStat })
  );

  const insight = buildAlphaInsight(pValue, alpha, `B${bNumber}`, t, fillFor, pValueStat);
  if (insight) significance.push(insight);

  return significance;
};

/**
 * @param {number[]} slopes
 * @param {number[]} pValues
 * @param {number} fSignificance
 * @param {number} alpha
 * @param {{name:string,unit:string}[]} yMeta
 * @param {{name:string,unit:string}[]} xMeta
 * @param {(key: string, params?: object) => string} t
 * @param {{
 *   mode?: string,
 *   fillFor?: (stat: {value:number,color?:string}|null) => object|null,
 *   slopeStats?: {value:number,color?:string}[],
 *   pValueStats?: {value:number,color?:string}[],
 *   fSigStat?: {value:number,color?:string}|null
 * }} [options]
 * @returns {{ row: any[], format: (object|null)[] }[]}
 */
export const getMultipleRegressionSignificance = (
  slopes,
  pValues,
  fSignificance,
  alpha,
  yMeta,
  xMeta,
  t,
  {
    mode = "STUDENT",
    fillFor = () => null,
    slopeStats = [],
    pValueStats = [],
    fSigStat = null,
  } = {}
) => {
  const significance = [toUIData([""])];

  slopes.forEach((b, index) => {
    const bNumber = index + 1;
    const pValue = pValues[bNumber];
    const bSignificance = getSignificance(b, pValue, alpha, bNumber, yMeta, xMeta, t, {
      mode,
      fillFor,
      bStat: slopeStats[index] ?? null,
      pValueStat: pValueStats[bNumber] ?? null,
    });
    bSignificance.forEach((row) => significance.push(row));
    significance.push(toUIData([""]));
  });

  if (slopes.length > 1) {
    let nullHypothesis = "H0: ";
    for (let i = 0; i < slopes.length; i++) {
      nullHypothesis += `B${i + 1} = `;
    }
    nullHypothesis += "0";
    significance.push(
      toUIData(
        [t("regression.interpretation.secondStep.multipleVariableSignificance"), nullHypothesis],
        [EXCEL_FORMATS.h3Subtitle, null]
      )
    );
    const variableNames = xMeta.map((meta, index) => meta.name || `X${index + 1}`).join(", ");
    const yName = yMeta[0]?.name || "Y";

    if (mode !== "COMPACT") {
      significance.push(
        toUIData(["", t("regression.interpretation.secondStep.notAllZeroHypothesis")], [null, null])
      );

      buildAlphaSet(alpha).forEach((level) => {
        const isSig = fSignificance < level;
        significance.push(
          toUIData(
            [
              `${t("regression.interpretation.secondStep.pValueText")}${level}:`,
              `pValue = ${fSignificance} ?< α = ${level} => ${isSig ? t("regression.interpretation.secondStep.significantBasicTrue", { pValue: fSignificance }) : t("regression.interpretation.secondStep.significantBasicFalse", { pValue: fSignificance })}`,
            ],
            [null, fillFor(fSigStat)]
          )
        );
        significance.push(
          toUIData([
            "",
            `${isSig ? t("regression.interpretation.secondStep.significantMultipleTrue", { variablesNumber: slopes.length, variableNames, yName, level }) : t("regression.interpretation.secondStep.significantMultipleFalse", { variablesNumber: slopes.length, variableNames, yName, level })}`,
          ])
        );
      });
    }

    significance.push(
      getConclusion({
        pValue: fSignificance,
        alpha,
        slopes,
        yMeta,
        xMeta,
        t,
        fillFor,
        pValueStat: fSigStat,
      })
    );

    const modelInsight = buildAlphaInsight(
      fSignificance,
      alpha,
      t("regression.interpretation.secondStep.theModel"),
      t,
      fillFor,
      fSigStat
    );
    if (modelInsight) significance.push(modelInsight);
    significance.push(toUIData([""]));
  }
  return significance;
};

/**
 * @param {number[]} slopes
 * @param {number} adjustedRSquared
 * @param {{name:string,unit:string}[]} yMeta
 * @param {{name:string,unit:string,isDummy?:boolean}[]} xMeta
 * @param {string} modelType
 * @param {(key: string, params?: object) => string} t
 * @param {[{value:number,color?:string}, {value:number,color?:string}][]} confidenceIntervals
 * @param {number} alpha
 * @param {{
 *   fillFor?: (stat: {value:number,color?:string}|null) => object|null,
 *   slopeStats?: {value:number,color?:string}[],
 *   adjRSqStat?: {value:number,color?:string}|null
 * }} [options]
 * @returns {{ row: any[], format: (object|null)[] }[]}
 */
export const getInterpretation = (
  slopes,
  adjustedRSquared,
  yMeta,
  xMeta,
  modelType,
  t,
  confidenceIntervals,
  alpha,
  { fillFor = () => null, slopeStats = [], adjRSqStat = null } = {}
) => {
  const interpretation = [toUIData([""])];
  const yName = yMeta[0]?.name || "Y";

  const unitBasedOnModelType = (index) => {
    const isXVariableLog = modelType === "log-linear" || modelType === "lin-log";
    let xUnit;
    if (isXVariableLog) xUnit = "1%";
    else if (xMeta[index]?.unit) xUnit = `1 ${xMeta[index].unit}`;
    else xUnit = t("regression.interpretation.thirdStep.unit");

    const isYVariableLog = modelType === "log-linear" || modelType === "semi-log";
    let yUnit;
    if (isYVariableLog) yUnit = "%";
    else if (yMeta[0]?.unit) yUnit = yMeta[0].unit;
    else yUnit = ` ${t("regression.interpretation.thirdStep.units")}`;

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
    const isDummy = xMeta[i]?.isDummy === true;
    const { xUnit, yUnit } = unitBasedOnModelType(i);
    const yValue = getYValueBasedOnModelType(i);

    let directionKey;
    if (isDummy && yValue >= 0) directionKey = "regression.interpretation.thirdStep.interpretationVariableDummy";
    else if (isDummy) directionKey = "regression.interpretation.thirdStep.interpretationVariableDummyDecrease";
    else if (yValue >= 0) directionKey = "regression.interpretation.thirdStep.interpretationVariable";
    else directionKey = "regression.interpretation.thirdStep.interpretationVariableDecrease";

    interpretation.push(
      toUIData(
        [
          `b${i + 1} = ${slopes[i]}`,
          `${t(directionKey, { xName, xUnit, yName })}${Math.abs(yValue)}${yUnit}`,
        ],
        [withFill(EXCEL_FORMATS.tableRowHeader, slopeStats[i] ?? null, fillFor), null]
      )
    );
    if (confidence !== null && confidenceIntervals) {
      const ci = confidenceIntervals[i + 1]; // [0] is intercept
      interpretation.push(
        toUIData(
          [
            "",
            t("regression.interpretation.thirdStep.ciSentence", {
              confidence,
              lower: ci[0].value,
              upper: ci[1].value,
              yUnit: yUnit.trim(),
            }),
          ],
          [null, fillFor(ci[0])]
        )
      );
    }
  }
  const variableNames = xMeta.map((meta, index) => meta.name || `X${index + 1}`).join(", ");

  interpretation.push(
    toUIData(
      [
        `R² ${t("regression.interpretation.thirdStep.r2Adjusted")} = ${adjustedRSquared}`,
        `${(adjustedRSquared * 100).toFixed(2)}% ${t("regression.interpretation.thirdStep.interpretationR2Adjusted", { yName, variableNames })}`,
      ],
      [withFill(EXCEL_FORMATS.tableRowHeader, adjRSqStat, fillFor), null]
    )
  );

  return interpretation;
};

/**
 * Builds the mode-gated model-stats block (pValue(s), R², R² adj) shown right
 * under the equation. Returns an empty section in COMPACT mode.
 * @param {{
 *   k: {value:number}, pValues: {value:number,color?:string}[],
 *   fSignificance: {value:number,color?:string}, rSquared: {value:number,color?:string},
 *   adjustedRSquared: {value:number,color?:string}
 * }} uiStats
 * @param {{ mode?: string, fillFor?: (stat: {value:number,color?:string}|null) => object|null }} [options]
 * @returns {{ row: any[], format: (object|null)[] }[]}
 */
export const buildModelStats = (
  { k, pValues, fSignificance, rSquared, adjustedRSquared },
  { mode = "STUDENT", fillFor = () => null } = {}
) => {
  if (mode === "COMPACT") return [];

  const rows = [];

  // Model stats inline so we can apply per-cell fills
  if (k.value === 1) {
    rows.push(
      toUIData(["pValue = ", pValues[1].value], [EXCEL_FORMATS.tableRowHeader, fillFor(pValues[1])])
    );
  } else {
    rows.push(
      toUIData(
        ["pValue = ", fSignificance.value],
        [EXCEL_FORMATS.tableRowHeader, fillFor(fSignificance)]
      )
    );
    for (let i = 0; i < k.value; i++) {
      rows.push(
        toUIData(
          [`p${i + 1} = `, pValues[i + 1].value],
          [EXCEL_FORMATS.tableRowHeader, fillFor(pValues[i + 1])]
        )
      );
    }
  }
  rows.push(
    toUIData(["R² = ", rSquared.value], [EXCEL_FORMATS.tableRowHeader, fillFor(rSquared)])
  );
  if (k.value > 1) {
    rows.push(
      toUIData(
        ["R² adj = ", adjustedRSquared.value],
        [EXCEL_FORMATS.tableRowHeader, fillFor(adjustedRSquared)]
      )
    );
  }
  rows.push(toUIData([""]));

  return rows;
};
