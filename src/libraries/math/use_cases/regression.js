import math from "../config";
import { buildDesignMatrices } from "../helpers/morph";
import {
  setDummyColumns,
  solveCoefficients,
  computeSumOfSquares,
  computeStandardErrors,
  computeConfidenceIntervals,
  computeTStats,
  computePredictorStats,
  computeBetaWeights,
  computeRSquared,
  computeFStat,
  computeCorrelationMatrix,
  computeVIF,
} from "../helpers/regression_steps";

/**
 * Performs linear regression (Simple or Multiple) via OLS using matrix algebra.
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

  // 1. Solve for the coefficients directly (Beta = X_T_X \ X_T_Y)
  // X_T_Y is a column vector, so lusolve works perfectly
  const { Beta, coefficients, b0, slopes } = solveCoefficients(X_T_X, X_T_Y);

  // 2. Predicted Values and Residuals
  const { ssRes, ssTotal } = computeSumOfSquares(X, Y, Beta, n);

  // 3. Standard Error of the Estimate (ESE)
  const ese = math.sqrt(math.divide(ssRes, math.bignumber(df)));
  const eseSq = math.square(ese);

  // 4. Compute only the diagonal elements of the inverse
  const standardErrors = computeStandardErrors(X_T_X, eseSq, k);

  // 5. Confidence Intervals (two-tailed, user alpha)
  const confidenceIntervals = computeConfidenceIntervals(
    alpha,
    df,
    coefficients,
    standardErrors,
    toUINumber
  );

  // 6. t-Statistic and p-value (two-tailed)
  // Significance is evaluated strictly against alpha using two-tailed p-values.
  // Pre-computing here prevents downstream code from accidentally halving pValues.
  const { tStats, pValues, isSignificant } = computeTStats(coefficients, standardErrors, df, alpha);

  // 7. Standardized Coefficients (Beta weights): β*_i = b_i × (SD_Xi / SD_Y)
  const { predictorCols, predictorMeans, predictorSS } = computePredictorStats(X, k);
  const betaWeights = computeBetaWeights(slopes, predictorSS, ssTotal, n, toUINumber);

  // 8. Coefficient of Determination (R-squared)
  const { rSquared, adjustedRSquared } = computeRSquared(ssRes, ssTotal, n, df);

  // 9. ANOVA Test (F-Statistic)
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
