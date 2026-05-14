import Decimal from "decimal.js";
import math from "./mathConfig";

const NaND = new Decimal(Number.NaN);

const getMin = (array) => {
  if (!array || array.length === 0) return NaND;
  let min = array[0];
  array.forEach((value) => {
    if (value.lessThan(min)) min = value;
  });
  return min;
};

const getMax = (array) => {
  if (!array || array.length === 0) return NaND;
  let max = array[0];
  array.forEach((value) => {
    if (value.greaterThan(max)) max = value;
  });
  return max;
};

const getMean = (array) => {
  if (!array || array.length === 0) return NaND;
  return math.mean(array); // math.mean lucrează direct cu BigNumber
};

/**
 * dispersia (variance)
 * se aplica corecția Bessel (n-1)
 */
const getVariance = (array) => {
  if (!array || array.length === 0) return NaND;
  return math.variance(array);
};

/**
 * abaterea medie pătratică (standard deviation)
 */
const getStandardDeviation = (array) => {
  if (!array || array.length === 0) return NaND;
  return math.std(array);
};

/**
 * coeficientul de variație (%)
 * Formula: (Sx / x_bar) * 100
 * unde Sx = abaterea standard, x_bar = media
 */
const getCoeficientOfVariation = (standardDeviation, average) => {
  if (standardDeviation.isNaN() || average.isNaN() || average.isZero()) return NaND;
  return standardDeviation.div(average).mul(100);
};

/**
 * eroarea standard a mediei (standard error of the mean)
 * Formula: Sx / sqrt(n)
 * unde Sx = abaterea standard, n = numărul de intrări
 */
const getStandardError = (standardDeviation, numberOfEntries) => {
  if (standardDeviation.isNaN() || numberOfEntries.isNaN() || numberOfEntries.isZero()) return NaND;
  return standardDeviation.div(math.sqrt(numberOfEntries));
};

const OPERATIONS = {
  getMin,
  getMax,
  getMean,
  getVariance,
  getStandardDeviation,
  getCoeficientOfVariation,
  getStandardError,
};

export default OPERATIONS;
