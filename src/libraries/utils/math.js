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
export const calculateRegression = (yData, xData, modelType, toUINumber) => {
  const n = yData.data.length;
  const k = xData.data[0].length;
  const df = n - k - 1;

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

  // 5. Statistica t și p-value
  const tStats = coefficients.map((b, i) => math.divide(b, standardErrors[i]));
  const pValues = tStats.map((t) => {
    const tPrimitive = Math.abs(Number(t));
    return 2 * (1 - jStat.studentt.cdf(tPrimitive, df));
  });

  // 6. Coeficientul de Determinație (R-squared)
  const rSquared = math.subtract(math.bignumber(1), math.divide(ssRes, ssTotal));

  const rSqAdjPart1 = math.subtract(math.bignumber(1), rSquared);
  const rSqAdjPart2 = math.divide(math.bignumber(n - 1), math.bignumber(df));
  const adjustedRSquared = math.subtract(
    math.bignumber(1),
    math.multiply(rSqAdjPart1, rSqAdjPart2)
  );

  // 7. Testul ANOVA (F-Statistic)
  const fNumerator = math.divide(rSquared, math.bignumber(k));
  const fDenominator = math.divide(math.subtract(math.bignumber(1), rSquared), math.bignumber(df));
  const fStat = math.divide(fNumerator, fDenominator);
  const fSignificance = 1 - jStat.centralF.cdf(Number(fStat), k, df);

  return {
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
    tStats: tStats.map((t) => toUINumber(t)),
    pValues,
    fStat: toUINumber(fStat),
    fSignificance,
  };
};

/** OBSOLETE
 * Execută regresia liniară simplă prin metoda celor mai mici pătrate.
 * @param {number[]} xData - Variabila independentă
 * @param {number[]} yData - Variabila dependentă
 */
// export const calculateSimpleRegression = (xData, yData, alpha = 0.05, onlyValues = false) => {
//   // Convertim seturile de date în Decimal
//   const xDec = xData.map((val) => new Decimal(val));
//   const yDec = yData.map((val) => new Decimal(val));

//   const nDec = new Decimal(xData.length);
//   const df = xData.length - 2; // Grade de libertate pentru regresia simplă (n - k - 1)

//   const meanX = OPERATIONS.getMean(xDec);
//   const meanY = OPERATIONS.getMean(yDec);

//   // 1. Calculăm sumele necesare pentru panta (b1) folosind formula: (nΣxy - ΣxΣy) / (nΣx² - (Σx)²)
//   let sumX = new Decimal(0);
//   let sumY = new Decimal(0);
//   let sumXY = new Decimal(0);
//   let sumX2 = new Decimal(0);

//   for (let i = 0; i < xDec.length; i++) {
//     sumX = sumX.add(xDec[i]);
//     sumY = sumY.add(yDec[i]);
//     sumXY = sumXY.add(xDec[i].mul(yDec[i]));
//     sumX2 = sumX2.add(xDec[i].pow(2));
//   }

//   const numerator = nDec.mul(sumXY).sub(sumX.mul(sumY));
//   const denominatorX = nDec.mul(sumX2).sub(sumX.pow(2));
//   const b1 = numerator.div(denominatorX);

//   // 2. Calculăm interceptul (b0): medie_y - b1 * medie_x
//   const b0 = meanY.sub(b1.mul(meanX));

//   // 3. Calculăm reziduurile (epsilon) și Suma Pătratelor Reziduurilor (SSR)
//   let ssRes = new Decimal(0);
//   let ssTotal = new Decimal(0);
//   let sumSqDevX = new Decimal(0);

//   for (let i = 0; i < xDec.length; i++) {
//     const yPred = b0.add(b1.mul(xDec[i])); // Valoarea calculată prin model
//     const resid = yDec[i].sub(yPred);
//     ssRes = ssRes.add(resid.pow(2));

//     const devY = yDec[i].sub(meanY);
//     ssTotal = ssTotal.add(devY.pow(2));

//     const devX = xDec[i].sub(meanX);
//     sumSqDevX = sumSqDevX.add(devX.pow(2));
//   }

//   // 4. Calculăm Eroarea Standard a Estimării (ESE)
//   const ese = math.sqrt(ssRes.div(new Decimal(df)));

//   // 5. Calculăm eroarea standard a parametrului b1 (sb1)
//   const sb1 = ese.div(math.sqrt(sumSqDevX));

//   // 6. Calculăm statistica test t: t = b1 / sb1
//   const tStat = b1.div(sb1);

//   // 7. Calculăm p-value (bilateral): Probabilitatea de a comite eroarea de speța I
//   // jStat necesită valoare primitivă absolută
//   const tStatPrimitive = Math.abs(tStat.toNumber());
//   const pValue = 2 * (1 - jStat.studentt.cdf(tStatPrimitive, df));

//   // 8. Calculăm Coeficientul de determinație (R-squared)
//   // Arată în ce măsură variația lui X explică variația lui Y
//   const rSquared = new Decimal(1).sub(ssRes.div(ssTotal));

//   return {
//     intercept: b0.toNumber(),
//     slope: b1.toNumber(),
//     rSquared: rSquared.toNumber(),
//     ese: ese.toNumber(),
//     sb1: sb1.toNumber(),
//     tStat: tStat.toNumber(),
//     pValue,
//     isSignificant: pValue < alpha,
//     interpretation: onlyValues
//       ? null
//       : interpretationSimpleRegression({
//           b0: b0.toNumber(),
//           b1: b1.toNumber(),
//           pValue,
//           alpha,
//           rSquared,
//         }),
//   };
// };
