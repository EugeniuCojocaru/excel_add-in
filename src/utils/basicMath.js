import Decimal from "decimal.js";
import math from "./mathConfig";
import { jStat } from "jstat";

// Inițializăm constantele de bază
const NaND = new Decimal(Number.NaN);
// Dacă alpha nu este primit ca parametru, setăm 0.05 implicit (95% nivel de încredere)
const DEFAULT_ALPHA = new Decimal(0.05);

/**
 * Găsește valoarea minimă [cite: 88]
 */
const getMin = (array) => {
  if (!array || array.length === 0) return NaND;
  let min = array[0];
  array.forEach((value) => {
    if (value.lessThan(min)) min = value;
  });
  return min;
};

/**
 * Găsește valoarea maximă [cite: 88]
 */
const getMax = (array) => {
  if (!array || array.length === 0) return NaND;
  let max = array[0];
  array.forEach((value) => {
    if (value.greaterThan(max)) max = value;
  });
  return max;
};

/**
 * Calculează media eșantionului (Mean) [cite: 88]
 */
const getMean = (array) => {
  if (!array || array.length === 0) return NaND;
  return math.mean(array); // math.mean lucrează direct cu BigNumber
};

/**
 * Calculează dispersia (Variance)
 * ATENȚIE: În econometrie (și conform cursului tău pentru eșantioane),
 * dispersia de eșantion se împarte la n-1.
 * În funcția ta originală era "uncorrected" (care împarte la N populației ).
 * Am scos parametrul "uncorrected" pentru a aplica corecția Bessel (n-1).
 */
const getVariance = (array) => {
  if (!array || array.length === 0) return NaND;
  // math.variance(array) fără al doilea parametru calculează dispersia pentru eșantion (n-1)
  return math.variance(array);
};

/**
 * Calculează abaterea medie pătratică (Standard Deviation) [cite: 78, 86]
 */
const getStandardDeviation = (array) => {
  if (!array || array.length === 0) return NaND;
  return math.std(array);
};

/**
 * Calculează Coeficientul de Variație (%) [cite: 79, 83]
 */
const getCoeficientOfVariation = (standardDeviation, average) => {
  if (standardDeviation.isNaN() || average.isNaN() || average.isZero()) return NaND;
  // Formula: (Sx / x_bar) * 100 [cite: 83, 92]
  return standardDeviation.div(average).mul(100);
};

/**
 * Calculează Eroarea Standard a Mediei [cite: 104, 111, 123]
 */
const getStandardError = (standardDeviation, numberOfEntries) => {
  if (standardDeviation.isNaN() || numberOfEntries.isNaN() || numberOfEntries.isZero()) return NaND;
  // Formula: Sx / sqrt(n) [cite: 111, 123]
  return standardDeviation.div(math.sqrt(numberOfEntries));
};

/**
 * NOU: Calculează nivelul de încredere (Confidence Level) și marginile
 * Aceasta este puntea unde combinăm mathjs (Decimal) cu jStat [cite: 105, 111, 112]
 */
const getConfidenceInterval = (array, alphaValue = DEFAULT_ALPHA) => {
  if (!array || array.length === 0) return { marginOfError: NaND, lower: NaND, upper: NaND };

  const n = new Decimal(array.length); // Volumul eșantionului [cite: 12]
  const mean = getMean(array); // Media
  const stdDev = getStandardDeviation(array); // Abaterea standard [cite: 88, 90]
  const stdError = getStandardError(stdDev, n); // Eroarea standard [cite: 104, 123]

  // Aici intervine jStat.
  // df = n - 1 (grade de libertate) [cite: 128, 129]
  const df = array.length - 1;
  // alpha trebuie să fie număr primitiv pentru jStat [cite: 130, 131]
  const alphaPrimitive = alphaValue.toNumber();

  // t_critic = inversa distribuției student (test bilateral)
  // Ne folosim de valoarea absolută pentru siguranță
  const tCriticalPrimitive = Math.abs(jStat.studentt.inv(alphaPrimitive / 2, df));

  // Convertim înapoi valoarea t în Decimal pentru a continua calculele precise
  const tCritical = new Decimal(tCriticalPrimitive);

  // Marja de eroare (Confidence Level): t * Eroarea Standard
  const marginOfError = tCritical.mul(stdError);

  return {
    marginOfError: marginOfError,
    // Limita inferioară: mean - t*s_x_bar [cite: 111, 121]
    lowerBound: mean.sub(marginOfError),
    // Limita superioară: mean + t*s_x_bar [cite: 111, 121]
    upperBound: mean.add(marginOfError),
    // Păstrăm și valoarea t pentru referință dacă vrei să o afișezi [cite: 138, 139]
    tCritical: tCritical,
  };
};

export const OPERATIONS = {
  getMin,
  getMax,
  getMean,
  getVariance,
  getStandardDeviation,
  getCoeficientOfVariation,
  getStandardError,
  getConfidenceInterval, // Adăugată noua funcție
};
