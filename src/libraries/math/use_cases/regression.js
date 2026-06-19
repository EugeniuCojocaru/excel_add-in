import { jStat } from "jstat";
import math from "../config";
import { buildDesignMatrices } from "../helpers/morph";

/**
 * @param {DenseMatrix} X_T_X
 * @param {DenseMatrix} X_T_Y
 * @returns {{ Beta: BigNumber[][], coefficients: BigNumber[], b0: BigNumber, slopes: BigNumber[] }}
 */
export const solveCoefficients = (X_T_X, X_T_Y) => {
  const BetaRaw = math.lusolve(X_T_X, X_T_Y);
  const Beta = BetaRaw.toArray ? BetaRaw.toArray() : BetaRaw;
  const coefficients = Beta.map((row) => (Array.isArray(row) ? row[0] : row));
  const b0 = coefficients[0];
  const slopes = coefficients.slice(1);
  return { Beta, coefficients, b0, slopes };
};

/**
 * @param {DenseMatrix} X_T_X
 * @param {BigNumber} eseSq
 * @param {number} k
 * @returns {BigNumber[]}
 */
export const computeStandardErrors = (X_T_X, eseSq, k) => {
  const standardErrors = [];
  for (let i = 0; i < k + 1; i++) {
    const e_i = [];
    for (let j = 0; j < k + 1; j++) {
      e_i.push([math.bignumber(i === j ? 1 : 0)]);
    }
    const v_i_raw = math.lusolve(X_T_X, e_i);
    const v_i = v_i_raw.toArray ? v_i_raw.toArray() : v_i_raw;
    const diagElement = Array.isArray(v_i[i]) ? v_i[i][0] : v_i[i];
    const variance_i = math.multiply(eseSq, diagElement);
    standardErrors.push(math.sqrt(variance_i));
  }
  return standardErrors;
};

/**
 * @param {number} alpha
 * @param {number} df
 * @param {BigNumber[]} coefficients
 * @param {BigNumber[]} standardErrors
 * @param {(v: BigNumber) => number} toUINumber
 * @returns {[number, number][]}
 */
export const computeConfidenceIntervals = (alpha, df, coefficients, standardErrors, toUINumber) => {
  const tCritical = math.bignumber(Math.abs(jStat.studentt.inv(alpha / 2, df)));
  return coefficients.map((b, i) => {
    const margin = math.multiply(tCritical, standardErrors[i]);
    return [toUINumber(math.subtract(b, margin)), toUINumber(math.add(b, margin))];
  });
};

/**
 * @param {BigNumber[][]} X
 * @param {BigNumber[][]} Y
 * @param {BigNumber[][]} Beta
 * @param {number} n
 * @returns {{ ssRes: BigNumber, ssTotal: BigNumber }}
 */
export const computeSumOfSquares = (X, Y, Beta, n) => {
  const Y_predRaw = math.multiply(X, Beta);
  const Y_pred = Y_predRaw.toArray ? Y_predRaw.toArray() : Y_predRaw;

  let ssRes = math.bignumber(0);
  let ssTotal = math.bignumber(0);
  const meanY = math.mean(Y.map((row) => row[0]));

  for (let i = 0; i < n; i++) {
    const resid = math.subtract(Y[i][0], Y_pred[i][0]);
    ssRes = math.add(ssRes, math.square(resid));

    const devY = math.subtract(Y[i][0], meanY);
    ssTotal = math.add(ssTotal, math.square(devY));
  }

  return { ssRes, ssTotal };
};

/**
 * @param {BigNumber[]} coefficients
 * @param {BigNumber[]} standardErrors
 * @param {number} df
 * @param {number} alpha
 * @returns {{ tStats: BigNumber[], pValues: number[], isSignificant: boolean[] }}
 */
export const computeTStats = (coefficients, standardErrors, df, alpha) => {
  const tStats = coefficients.map((b, i) => math.divide(b, standardErrors[i]));
  const pValues = tStats.map((t) => {
    const tPrimitive = Math.abs(Number(t));
    return 2 * (1 - jStat.studentt.cdf(tPrimitive, df));
  });
  const isSignificant = pValues.map((p) => p < alpha);
  return { tStats, pValues, isSignificant };
};

/**
 * @param {BigNumber[][]} X
 * @param {number} k
 * @returns {{ predictorCols: BigNumber[][], predictorMeans: BigNumber[], predictorSS: BigNumber[] }}
 */
export const computePredictorStats = (X, k) => {
  const predictorCols = Array.from({ length: k }, (_, i) => X.map((row) => row[i + 1]));
  const predictorMeans = predictorCols.map((col) => math.mean(col));
  const predictorSS = predictorCols.map((col, i) =>
    col.reduce(
      (sum, val) => math.add(sum, math.square(math.subtract(val, predictorMeans[i]))),
      math.bignumber(0)
    )
  );
  return { predictorCols, predictorMeans, predictorSS };
};

/**
 * @param {BigNumber[]} slopes
 * @param {BigNumber[]} predictorSS
 * @param {BigNumber} ssTotal
 * @param {number} n
 * @param {(v: BigNumber) => number} toUINumber
 * @returns {number[]}
 */
export const computeBetaWeights = (slopes, predictorSS, ssTotal, n, toUINumber) => {
  const sdY = math.sqrt(math.divide(ssTotal, math.bignumber(n - 1)));
  return slopes.map((b, i) => {
    const sdXi = math.sqrt(math.divide(predictorSS[i], math.bignumber(n - 1)));
    return toUINumber(math.divide(math.multiply(b, sdXi), sdY));
  });
};

/**
 * @param {BigNumber[][]} predictorCols
 * @param {BigNumber[]} predictorMeans
 * @param {BigNumber[]} predictorSS
 * @param {number} n
 * @param {(v: BigNumber) => number} toUINumber
 * @returns {number[][]}
 */
export const computeCorrelationMatrix = (
  predictorCols,
  predictorMeans,
  predictorSS,
  n,
  toUINumber
) => {
  const k = predictorCols.length;
  return Array.from({ length: k }, (_, i) =>
    Array.from({ length: k }, (_, j) => {
      if (i === j) return toUINumber(math.bignumber(1));
      let cov = math.bignumber(0);
      for (let obs = 0; obs < n; obs++) {
        cov = math.add(
          cov,
          math.multiply(
            math.subtract(predictorCols[i][obs], predictorMeans[i]),
            math.subtract(predictorCols[j][obs], predictorMeans[j])
          )
        );
      }
      return toUINumber(math.divide(cov, math.sqrt(math.multiply(predictorSS[i], predictorSS[j]))));
    })
  );
};

/**
 * @param {BigNumber[][]} X
 * @param {BigNumber[][]} predictorCols
 * @param {BigNumber[]} predictorSS
 * @param {number} n
 * @param {number} k
 * @param {(v: BigNumber) => number} toUINumber
 * @returns {{ vifValues: number[], hasMulticollinearity: boolean }}
 */
export const computeVIF = (X, predictorCols, predictorSS, n, k, toUINumber) => {
  const vifValues = [];
  let hasMulticollinearity = false;

  if (k === 1) {
    vifValues.push(toUINumber(math.bignumber(1)));
  } else {
    for (let i = 0; i < k; i++) {
      const Yi_vif = predictorCols[i].map((val) => [val]);
      const Xi_vif = X.map((row) => [row[0], ...row.slice(1).filter((_, j) => j !== i)]);

      const Xt = math.transpose(Xi_vif);
      const XtX = math.multiply(Xt, Xi_vif);
      const XtY = math.multiply(Xt, Yi_vif);
      const bVifRaw = math.lusolve(XtX, XtY);
      const bVif = bVifRaw.toArray ? bVifRaw.toArray() : bVifRaw;

      const yHatRaw = math.multiply(Xi_vif, bVif);
      const yHat = yHatRaw.toArray ? yHatRaw.toArray() : yHatRaw;

      let ssRes_i = math.bignumber(0);
      const ssTot_i = predictorSS[i];
      for (let j = 0; j < n; j++) {
        const resid = math.subtract(Yi_vif[j][0], yHat[j][0]);
        ssRes_i = math.add(ssRes_i, math.square(resid));
      }

      const r2_i = math.subtract(math.bignumber(1), math.divide(ssRes_i, ssTot_i));
      const vif_raw = math.divide(math.bignumber(1), math.subtract(math.bignumber(1), r2_i));

      if (Number(vif_raw) > 5) hasMulticollinearity = true;
      vifValues.push(toUINumber(vif_raw));
    }
  }

  return { vifValues, hasMulticollinearity };
};

/**
 * @param {BigNumber} ssRes
 * @param {BigNumber} ssTotal
 * @param {number} n
 * @param {number} df
 * @returns {{ rSquared: BigNumber, adjustedRSquared: BigNumber }}
 */
export const computeRSquared = (ssRes, ssTotal, n, df) => {
  const rSquared = math.subtract(math.bignumber(1), math.divide(ssRes, ssTotal));
  const rSqAdjPart1 = math.subtract(math.bignumber(1), rSquared);
  const rSqAdjPart2 = math.divide(math.bignumber(n - 1), math.bignumber(df));
  const adjustedRSquared = math.subtract(
    math.bignumber(1),
    math.multiply(rSqAdjPart1, rSqAdjPart2)
  );
  return { rSquared, adjustedRSquared };
};

/**
 * @param {BigNumber} rSquared
 * @param {number} k
 * @param {number} df
 * @param {number} alpha
 * @returns {{ fStat: BigNumber, fSignificance: number, fIsSignificant: boolean }}
 */
export const computeFStat = (rSquared, k, df, alpha) => {
  const fNumerator = math.divide(rSquared, math.bignumber(k));
  const fDenominator = math.divide(math.subtract(math.bignumber(1), rSquared), math.bignumber(df));
  const fStat = math.divide(fNumerator, fDenominator);
  const fSignificance = 1 - jStat.centralF.cdf(Number(fStat), k, df);
  const fIsSignificant = fSignificance < alpha;
  return { fStat, fSignificance, fIsSignificant };
};

/**
 * @param {{ data: number[][], meta: { name: string, unit: string, isDummy?: boolean }[] }} xColumns
 * @returns {void}
 */
export const setDummyColumns = (xColumns) => {
  const k = xColumns.data[0].length;
  for (let i = 0; i < k; i++) {
    const isDummy = xColumns.data.every((row) => row[i] === 0 || row[i] === 1);
    if (xColumns.meta[i]) xColumns.meta[i].isDummy = isDummy;
  }
};

/**
 * Execută regresia liniară (Simplă sau Multiplă) prin OLS folosind algebră matriceală.
 * @param {{ data: number[][], meta: { name: string, unit: string }[] }} yData
 * @param {{ data: number[][], meta: { name: string, unit: string }[] }} xData
 * @param {number} alpha
 * @param {string} modelType
 * @param {{ toUINumber: (v: BigNumber) => number }} options
 * @returns {{
 *   alpha: number,
 *   modelType: string,
 *   k: number,
 *   df: number,
 *   ssRes: number,
 *   b0: number,
 *   slopes: number[],
 *   rSquared: number,
 *   adjustedRSquared: number,
 *   ese: number,
 *   standardErrors: number[],
 *   confidenceIntervals: [number, number][],
 *   tStats: number[],
 *   pValues: number[],
 *   isSignificant: boolean[],
 *   fStat: number,
 *   fSignificance: number,
 *   fIsSignificant: boolean,
 *   betaWeights: number[],
 *   correlationMatrix: number[][],
 *   vifValues: number[],
 *   hasMulticollinearity: boolean
 * }}
 */
export const regression = (yData, xData, alpha = 0.05, modelType, { toUINumber }) => {
  const n = yData.data.length;
  const k = xData.data[0].length;
  const df = n - k - 1;

  setDummyColumns(xData);

  const { Y, X } = buildDesignMatrices(yData, xData, modelType);

  const X_T = math.transpose(X);
  const X_T_X = math.multiply(X_T, X);
  const X_T_Y = math.multiply(X_T, Y);

  // 1. Aflăm coeficienții direct (Beta = X_T_X \ X_T_Y)
  // X_T_Y este un vector coloană, deci lusolve funcționează perfect
  const { Beta, coefficients, b0, slopes } = solveCoefficients(X_T_X, X_T_Y);

  // 2. Valorile Prezise și Reziduurile
  const { ssRes, ssTotal } = computeSumOfSquares(X, Y, Beta, n);

  // 3. Eroarea Standard a Estimării (ESE)
  const ese = math.sqrt(math.divide(ssRes, math.bignumber(df)));
  const eseSq = math.square(ese);

  // 4. Calculăm doar elementele de pe diagonală ale inversei
  const standardErrors = computeStandardErrors(X_T_X, eseSq, k);

  // 5. Confidence Intervals (two-tailed, user alpha)
  const confidenceIntervals = computeConfidenceIntervals(
    alpha,
    df,
    coefficients,
    standardErrors,
    toUINumber
  );

  // 6. Statistica t și p-value (two-tailed)
  // Significance is evaluated strictly against alpha using two-tailed p-values.
  // Pre-computing here prevents downstream code from accidentally halving pValues.
  const { tStats, pValues, isSignificant } = computeTStats(coefficients, standardErrors, df, alpha);

  // 7. Standardized Coefficients (Beta weights): β*_i = b_i × (SD_Xi / SD_Y)
  const { predictorCols, predictorMeans, predictorSS } = computePredictorStats(X, k);
  const betaWeights = computeBetaWeights(slopes, predictorSS, ssTotal, n, toUINumber);

  // 8. Coeficientul de Determinație (R-squared)
  const { rSquared, adjustedRSquared } = computeRSquared(ssRes, ssTotal, n, df);

  // 9. Testul ANOVA (F-Statistic)
  // F-test significance is inherently one-tailed (upper tail), correct as-is.
  const { fStat, fSignificance, fIsSignificant } = computeFStat(rSquared, k, df, alpha);

  // 10. Correlation Matrix for predictors (k × k)
  const correlationMatrix = computeCorrelationMatrix(
    predictorCols,
    predictorMeans,
    predictorSS,
    n,
    toUINumber
  );

  // 11. Variance Inflation Factor (VIF): regress each Xi on all other predictors
  const { vifValues, hasMulticollinearity } = computeVIF(
    X,
    predictorCols,
    predictorSS,
    n,
    k,
    toUINumber
  );

  return {
    alpha,
    modelType,
    k,
    df,
    ssRes: toUINumber(ssRes),
    b0: toUINumber(b0),
    slopes: slopes.map((b) => toUINumber(b)),
    rSquared: toUINumber(rSquared),
    adjustedRSquared: toUINumber(adjustedRSquared),
    ese: toUINumber(ese),
    standardErrors: standardErrors.map((se) => toUINumber(se)),
    confidenceIntervals,
    tStats: tStats.map((t) => toUINumber(t)),
    pValues: pValues.map((p) => toUINumber(p)),
    isSignificant,
    fStat: toUINumber(fStat),
    fSignificance: toUINumber(fSignificance),
    fIsSignificant,
    betaWeights,
    correlationMatrix,
    vifValues,
    hasMulticollinearity,
  };
};
