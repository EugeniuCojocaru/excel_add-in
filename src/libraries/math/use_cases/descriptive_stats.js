import { jStat } from "jstat";
import math from "../config";

/**
 * Calculează indicatorii statistici de bază și intervalul de încredere.
 * @param {number[]} data - Array cu valorile eșantionului
 * @param {number} alpha - Nivelul de semnificație (implicit 0.05 pentru 95% încredere).
 */
const descriptiveStats = (data, alpha = 0.05, { toUINumber }) => {
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

export default descriptiveStats;
