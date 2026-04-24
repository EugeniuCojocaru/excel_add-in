import Decimal from "decimal.js";
import math from "./mathConfig"; // Instanța configurată de mathjs
import { jStat } from "jstat";
import { OPERATIONS } from "./basicMath"; // Presupunând că le-ai exportat de aici
import { interpretationSimpleRegression } from "./econometrics"; // Funcția de interpretare pentru regresia simplă
/**
 * Calculează indicatorii statistici de bază și intervalul de încredere.
 * @param {number[]} data - Array cu valorile eșantionului (ex: Număr angajați).
 * @param {number} alpha - Nivelul de semnificație (implicit 0.05 pentru 95% încredere).
 */
export const calculateDescriptiveStats = (data, alpha = 0.05) => {
  console.log("Calculating stats for data:", data);
  // Conversia array-ului primitiv în array de Decimal pentru precizie
  const decimalData = data.map((val) => new Decimal(val));
  console.log("Decimal data:", decimalData);
  // 1. Determinăm volumul eșantionului (n) [cite: 12]
  const n = new Decimal(decimalData.length);
  console.log("Sample size (n):", n.toString());

  // 2. Calculăm gradele de libertate (n-1) folosite pentru distribuția Student t [cite: 134]
  const df = decimalData.length - 1;
  console.log("Degrees of freedom (df):", df);

  // 3. Calculăm media eșantionului: x_bar = Σx / n [cite: 70]
  const mean = OPERATIONS.getMean(decimalData);
  console.log("Sample mean:", mean.toString());

  // 4. Calculăm abaterea medie pătratică de eșantion (s_x) [cite: 73, 78]
  const stdDev = OPERATIONS.getStandardDeviation(decimalData);
  console.log("Sample standard deviation:", stdDev.toString());
  // 5. Calculăm eroarea standard a mediei: s_x_bar = s_x / sqrt(n) [cite: 111, 123]
  const standardError = OPERATIONS.getStandardError(stdDev, n);
  console.log("Standard error of the mean:", standardError.toString());
  // 6. Determinăm valoarea critică t (bilaterală) pentru pragul alfa ales [cite: 140, 141]
  // jStat necesită valori primitive
  const tCriticalPrimitive = Math.abs(jStat.studentt.inv(alpha / 2, df));
  const tCritical = new Decimal(tCriticalPrimitive);
  console.log("Critical t-value:", tCritical.toString());

  // 7. Calculăm marja de eroare (Confidence Level): t * standardError [cite: 141, 146]
  const confidenceLevel = tCritical.mul(standardError);
  console.log("Confidence level (margin of error):", confidenceLevel.toString());
  // Returnăm ca primitive JS pentru a le afișa ușor în UI / Excel
  return {
    n: n.toNumber(),
    mean: mean.toNumber(),
    stdDev: stdDev.toNumber(),
    standardError: standardError.toNumber(),
    confidenceLevel: confidenceLevel.toNumber(),
    lowerBound: mean.sub(confidenceLevel).toNumber(), // Limita inferioară a intervalului de încredere [cite: 141]
    upperBound: mean.add(confidenceLevel).toNumber(), // Limita superioară a intervalului de încredere [cite: 141]
  };
};

/**
 * Execută regresia liniară simplă prin metoda celor mai mici pătrate.
 * @param {number[]} xData - Variabila independentă (ex: Venit)[cite: 262].
 * @param {number[]} yData - Variabila dependentă (ex: Cheltuieli)[cite: 262].
 */
export const calculateSimpleRegression = (xData, yData, alpha = 0.05, onlyValues = false) => {
  // Convertim seturile de date în Decimal
  const xDec = xData.map((val) => new Decimal(val));
  const yDec = yData.map((val) => new Decimal(val));

  const nDec = new Decimal(xData.length);
  const df = xData.length - 2; // Grade de libertate pentru regresia simplă (n - k - 1) [cite: 352, 359]

  // Folosim noile funcții pentru a calcula mediile
  const meanX = OPERATIONS.getMean(xDec);
  const meanY = OPERATIONS.getMean(yDec);

  // 1. Calculăm sumele necesare pentru panta (b1) folosind formula: (nΣxy - ΣxΣy) / (nΣx² - (Σx)²) [cite: 318]
  let sumX = new Decimal(0);
  let sumY = new Decimal(0);
  let sumXY = new Decimal(0);
  let sumX2 = new Decimal(0);

  for (let i = 0; i < xDec.length; i++) {
    sumX = sumX.add(xDec[i]);
    sumY = sumY.add(yDec[i]);
    sumXY = sumXY.add(xDec[i].mul(yDec[i]));
    sumX2 = sumX2.add(xDec[i].pow(2));
  }

  const numerator = nDec.mul(sumXY).sub(sumX.mul(sumY));
  const denominatorX = nDec.mul(sumX2).sub(sumX.pow(2));
  const b1 = numerator.div(denominatorX);

  // 2. Calculăm interceptul (b0): medie_y - b1 * medie_x [cite: 318]
  const b0 = meanY.sub(b1.mul(meanX));

  // 3. Calculăm reziduurile (epsilon) și Suma Pătratelor Reziduurilor (SSR) [cite: 326, 327]
  let ssRes = new Decimal(0); // s-ar putea sa am nevoie de el
  let ssTotal = new Decimal(0);
  let sumSqDevX = new Decimal(0);

  for (let i = 0; i < xDec.length; i++) {
    const yPred = b0.add(b1.mul(xDec[i])); // Valoarea calculată prin model [cite: 325]
    const resid = yDec[i].sub(yPred);
    ssRes = ssRes.add(resid.pow(2));

    const devY = yDec[i].sub(meanY);
    ssTotal = ssTotal.add(devY.pow(2));

    const devX = xDec[i].sub(meanX);
    sumSqDevX = sumSqDevX.add(devX.pow(2));
  }

  // 4. Calculăm Eroarea Standard a Estimării (ESE) [cite: 352]
  const ese = math.sqrt(ssRes.div(new Decimal(df)));

  // 5. Calculăm eroarea standard a parametrului b1 (sb1) [cite: 350]
  const sb1 = ese.div(math.sqrt(sumSqDevX));

  // 6. Calculăm statistica test t: t = b1 / sb1 [cite: 349]
  const tStat = b1.div(sb1);

  // 7. Calculăm p-value (bilateral): Probabilitatea de a comite eroarea de speța I [cite: 379, 394]
  // jStat necesită valoare primitivă absolută
  const tStatPrimitive = Math.abs(tStat.toNumber());
  const pValue = 2 * (1 - jStat.studentt.cdf(tStatPrimitive, df));

  // 8. Calculăm Coeficientul de determinație (R-squared) [cite: 401, 403]
  // Arată în ce măsură variația lui X explică variația lui Y
  const rSquared = new Decimal(1).sub(ssRes.div(ssTotal));

  return {
    intercept: b0.toNumber(),
    slope: b1.toNumber(),
    rSquared: rSquared.toNumber(),
    ese: ese.toNumber(),
    sb1: sb1.toNumber(),
    tStat: tStat.toNumber(),
    pValue,
    isSignificant: pValue < alpha, // Decizia de respingere a ipotezei nule H0: B1=0 [cite: 335, 394]
    interpretation: onlyValues
      ? null
      : interpretationSimpleRegression({
          b0: b0.toNumber(),
          b1: b1.toNumber(),
          pValue,
          alpha,
          rSquared,
        }), // Dacă utilizatorul a ales să vadă doar valorile, nu returnăm interpretarea detaliată
  };
};
