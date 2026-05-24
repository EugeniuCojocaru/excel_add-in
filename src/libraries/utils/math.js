import { jStat } from "jstat";
import Decimal from "decimal.js";
import math from "./mathConfig";
import OPERATIONS from "./basicMath";

/**
 * Transformă datele brute în matricele X și Y necesare pentru regresie,
 * aplicând logaritmul natural (ln) în funcție de modelul ales.
 * @param {{data: number[][], meta: { name: string, unit: string }[]}} yData
 * @param {{data: number[][], meta: { name: string, unit: string }[]}} xData
 * @param {string} modelType - 'linear', 'log-linear', 'semi-log', 'lin-log'
 * @returns {{ Y: any[], X: any[] }} Matricele gata pentru algebra mathjs
 */
const transformDataForModel = (yData, xData, modelType) => {
  const transformY = modelType === "log-linear" || modelType === "semi-log";
  const transformX = modelType === "log-linear" || modelType === "lin-log";

  const Y = yData.data.map((val) => {
    let v = math.bignumber(val[0]);
    if (transformY) {
      if (v <= 0) throw new Error("Logaritmul necesită valori strict pozitive pentru Y.");
      v = math.log(v);
    }
    return [math.bignumber(v)];
  });

  const X = xData.data.map((row) => {
    const processedRow = row.map((val) => {
      let v = math.bignumber(val);
      if (transformX) {
        if (v <= 0)
          throw new Error("Logaritmul necesită valori strict pozitive pentru variabilele X.");
        v = math.log(v);
      }
      return v;
    });
    return [1, ...processedRow].map((val) => math.bignumber(val));
  });

  return { Y, X };
};

/**
 * Calculează indicatorii statistici de bază și intervalul de încredere.
 * @param {number[]} data - Array cu valorile eșantionului
 * @param {number} alpha - Nivelul de semnificație (implicit 0.05 pentru 95% încredere).
 */
export const calculateDescriptiveStats = (data, alpha = 0.05) => {
  console.log("Calculating stats for data:", data);

  const decimalData = data.map((val) => new Decimal(val));
  console.log("Decimal data:", decimalData);
  // 1. Determinăm volumul eșantionului (n)
  const n = new Decimal(decimalData.length);
  console.log("Sample size (n):", n.toString());

  // 2. Calculăm gradele de libertate (n-1) folosite pentru distribuția Student t
  const df = decimalData.length - 1;
  console.log("Degrees of freedom (df):", df);

  // 3. Calculăm media eșantionului: x_bar = Σx / n
  const mean = OPERATIONS.getMean(decimalData);
  console.log("Sample mean:", mean.toString());

  // 4. Calculăm abaterea medie pătratică de eșantion (s_x)
  const stdDev = OPERATIONS.getStandardDeviation(decimalData);
  console.log("Sample standard deviation:", stdDev.toString());
  // 5. Calculăm eroarea standard a mediei: s_x_bar = s_x / sqrt(n)
  const standardError = OPERATIONS.getStandardError(stdDev, n);
  console.log("Standard error of the mean:", standardError.toString());
  // 6. Determinăm valoarea critică t (bilaterală) pentru pragul alfa ales
  const tCriticalPrimitive = Math.abs(jStat.studentt.inv(alpha / 2, df));
  const tCritical = new Decimal(tCriticalPrimitive);
  console.log("Critical t-value:", tCritical.toString());

  // 7. Calculăm marja de eroare (Confidence Level): t * standardError
  const confidenceLevel = tCritical.mul(standardError);
  console.log("Confidence level (margin of error):", confidenceLevel.toString());

  return {
    n: n.toNumber(),
    mean: mean.toNumber(),
    stdDev: stdDev.toNumber(),
    standardError: standardError.toNumber(),
    confidenceLevel: confidenceLevel.toNumber(),
    lowerBound: mean.sub(confidenceLevel).toNumber(),
    upperBound: mean.add(confidenceLevel).toNumber(),
  };
};

/**
 * Execută regresia liniară (Simplă sau Multiplă) prin OLS folosind algebră matriceală.
 * @param {{data: number[][], meta: { name: string, unit: string }[]}} yData - Variabila dependentă
 * @param {{data: number[][], meta: { name: string, unit: string }[]}} xData - Variabilele independente
 * @param {string} modelType - Tipul modelului de regresie dorit
 */
export const calculateRegression = (yData, xData, modelType, toUINumber, alpha = 0.05) => {
  const n = yData.data.length;
  const k = xData.data[0].length;
  const df = n - k - 1;

  for (let i = 0; i < k; i++) {
    const isDummy = xData.data.every((row) => row[i] === 0 || row[i] === 1);
    if (xData.meta[i]) xData.meta[i].isDummy = isDummy;
  }

  const { Y, X } = transformDataForModel(yData, xData, modelType);

  const X_T = math.transpose(X);
  const X_T_X = math.multiply(X_T, X);
  const X_T_Y = math.multiply(X_T, Y);

  // 1. Aflăm coeficienții direct (Beta = X_T_X \ X_T_Y)
  // X_T_Y este un vector coloană, deci lusolve funcționează perfect
  const BetaRaw = math.lusolve(X_T_X, X_T_Y);
  const Beta = BetaRaw.toArray ? BetaRaw.toArray() : BetaRaw;

  const coefficients = Beta.map((row) => (Array.isArray(row) ? row[0] : row));
  const b0 = coefficients[0];
  const slopes = coefficients.slice(1);

  // 2. Valorile Prezise și Reziduurile
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

  // 3. Eroarea Standard a Estimării (ESE)
  const ese = math.sqrt(math.divide(ssRes, math.bignumber(df)));
  const eseSq = math.square(ese);

  // 4. FIX CRITIC: Calculăm doar elementele de pe diagonală ale inversei
  const standardErrors = [];
  for (let i = 0; i < k + 1; i++) {
    // Creăm vectorul coloană e_i (plin cu 0, și 1 la poziția i)
    const e_i = [];
    for (let j = 0; j < k + 1; j++) {
      e_i.push([math.bignumber(i === j ? 1 : 0)]);
    }

    // Rezolvăm X_T_X * v_i = e_i (acum trimitem strict un vector, eroarea dispare)
    const v_i_raw = math.lusolve(X_T_X, e_i);
    const v_i = v_i_raw.toArray ? v_i_raw.toArray() : v_i_raw;

    // Elementul de pe diagonală este elementul "i" din vectorul calculat
    const diagElement = Array.isArray(v_i[i]) ? v_i[i][0] : v_i[i];

    // sb = sqrt( ESE^2 * element_diagonală )
    const variance_i = math.multiply(eseSq, diagElement);
    standardErrors.push(math.sqrt(variance_i));
  }

  // 5. Confidence Intervals (two-tailed, user alpha)
  const tCritical = math.bignumber(Math.abs(jStat.studentt.inv(alpha / 2, df)));
  const confidenceIntervals = coefficients.map((b, i) => {
    const margin = math.multiply(tCritical, standardErrors[i]);
    return [toUINumber(math.subtract(b, margin)), toUINumber(math.add(b, margin))];
  });

  // 6. Statistica t și p-value (two-tailed)
  const tStats = coefficients.map((b, i) => math.divide(b, standardErrors[i]));
  const pValues = tStats.map((t) => {
    const tPrimitive = Math.abs(Number(t));
    return 2 * (1 - jStat.studentt.cdf(tPrimitive, df));
  });
  // Significance is evaluated strictly against alpha using two-tailed p-values.
  // Pre-computing here prevents downstream code from accidentally halving pValues.
  const isSignificant = pValues.map((p) => p < alpha);

  // 7. Standardized Coefficients (Beta weights): β*_i = b_i × (SD_Xi / SD_Y)
  const predictorCols = Array.from({ length: k }, (_, i) => X.map((row) => row[i + 1]));
  const predictorMeans = predictorCols.map((col) => math.mean(col));
  const predictorSS = predictorCols.map((col, i) =>
    col.reduce(
      (sum, val) => math.add(sum, math.square(math.subtract(val, predictorMeans[i]))),
      math.bignumber(0)
    )
  );

  const sdY = math.sqrt(math.divide(ssTotal, math.bignumber(n - 1)));
  const betaWeights = slopes.map((b, i) => {
    const sdXi = math.sqrt(math.divide(predictorSS[i], math.bignumber(n - 1)));
    return toUINumber(math.divide(math.multiply(b, sdXi), sdY));
  });

  // 10. Correlation Matrix for predictors (k × k)
  const correlationMatrix = Array.from({ length: k }, (_, i) =>
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

  // 11. Variance Inflation Factor (VIF): regress each Xi on all other predictors
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
      let ssTot_i = predictorSS[i];
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

  // 8. Coeficientul de Determinație (R-squared)
  const rSquared = math.subtract(math.bignumber(1), math.divide(ssRes, ssTotal));

  const rSqAdjPart1 = math.subtract(math.bignumber(1), rSquared);
  const rSqAdjPart2 = math.divide(math.bignumber(n - 1), math.bignumber(df));
  const adjustedRSquared = math.subtract(
    math.bignumber(1),
    math.multiply(rSqAdjPart1, rSqAdjPart2)
  );

  // 9. Testul ANOVA (F-Statistic)
  const fNumerator = math.divide(rSquared, math.bignumber(k));
  const fDenominator = math.divide(math.subtract(math.bignumber(1), rSquared), math.bignumber(df));
  const fStat = math.divide(fNumerator, fDenominator);
  // F-test significance is inherently one-tailed (upper tail), correct as-is.
  const fSignificance = 1 - jStat.centralF.cdf(Number(fStat), k, df);
  const fIsSignificant = fSignificance < alpha;

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
