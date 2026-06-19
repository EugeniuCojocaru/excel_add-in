import { jStat } from "jstat";
import math from "../config";

/**
 * Calculează indicatorii statistici de bază și intervalul de încredere.
 * @param {number[]} data
 * @param {number} alpha
 * @param {{ toUINumber: (v: BigNumber) => number }} options
 * @returns {{
 *   n: number,
 *   mean: number,
 *   stdDev: number,
 *   standardError: number,
 *   confidenceLevel: number,
 *   lowerBound: number,
 *   upperBound: number
 * }}
 */
export const descriptiveStats = (data, alpha = 0.05, { toUINumber }) => {
  const bn = data.map((val) => math.bignumber(val));

  const n = bn.length;
  const df = n - 1;

  const mean = math.mean(bn);
  const stdDev = math.std(bn);
  const standardError = math.divide(stdDev, math.sqrt(math.bignumber(n)));

  const tCritical = math.bignumber(Math.abs(jStat.studentt.inv(alpha / 2, df)));
  const confidenceLevel = math.multiply(tCritical, standardError);

  return {
    n,
    mean: toUINumber(mean),
    stdDev: toUINumber(stdDev),
    standardError: toUINumber(standardError),
    confidenceLevel: toUINumber(confidenceLevel),
    lowerBound: toUINumber(math.subtract(mean, confidenceLevel)),
    upperBound: toUINumber(math.add(mean, confidenceLevel)),
  };
};


