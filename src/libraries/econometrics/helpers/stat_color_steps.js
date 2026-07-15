const hslToHex = (h, s, l) => {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const value = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * value).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

/**
 * Generates a consistent, pseudo-random hex color based on the inputs. Uses full
 * hue rotation at fixed high lightness so colors are visually distinct while
 * remaining light enough for black text.
 * @param {number} num
 * @param {string} str
 * @returns {string} a hex color code
 */
export const randColor = (num, str) => {
  const combined = `${str}-${num}`;

  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = combined.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Spread hue across the full 360° spectrum for maximum distinction.
  // Saturation 60% keeps colors rich; lightness 83% keeps black text readable.
  const hue = (((hash & 0xffff) % 360) + 360) % 360;
  return hslToHex(hue, 60, 83);
};

/**
 * Wraps every numeric field of a raw regression() result in { value, color }, the
 * internal representation the econometrics interpretation/summary steps consume —
 * the color feeds the injected `fillFor` collaborator for Excel cell highlighting.
 * @param {object} stats - raw output of @math's regression()
 * @returns {object} the same shape with every numeric leaf wrapped as { value, color }
 */
export const toUIStats = (stats) => {
  return {
    alpha: stats.alpha,
    modelType: stats.modelType,
    k: { value: stats.k, color: randColor(stats.k, "k") },
    df: { value: stats.df, color: randColor(stats.df, "df") },
    ssRes: { value: stats.ssRes, color: randColor(stats.ssRes, "ssRes") },
    b0: { value: stats.b0, color: randColor(stats.b0, "b0") },
    slopes: stats.slopes.map((b, index) => ({
      value: b,
      color: randColor(b, `slopes${index + 1}`),
    })),
    rSquared: { value: stats.rSquared, color: randColor(stats.rSquared, "rSquared") },
    adjustedRSquared: {
      value: stats.adjustedRSquared,
      color: randColor(stats.adjustedRSquared, "adjustedRSquared"),
    },
    ese: { value: stats.ese, color: randColor(stats.ese, "ese") },
    standardErrors: stats.standardErrors.map((se, index) => ({
      value: se,
      color: randColor(se, `standardErrors${index}`),
    })),
    confidenceIntervals: stats.confidenceIntervals.map((interval, index) => [
      { value: interval[0], color: randColor(interval[0], `ci${index}Lower`) },
      { value: interval[1], color: randColor(interval[1], `ci${index}Upper`) },
    ]),
    tStats: stats.tStats.map((t, index) => ({ value: t, color: randColor(t, `tStats${index}`) })),
    pValues: stats.pValues.map((pValue, index) => ({
      value: pValue,
      color: randColor(pValue, `pValues${index}`),
    })),
    isSignificant: stats.isSignificant,
    fStat: { value: stats.fStat, color: randColor(stats.fStat, "fStat") },
    fSignificance: {
      value: stats.fSignificance,
      color: randColor(stats.fSignificance, "fSignificance"),
    },
    fIsSignificant: stats.fIsSignificant,
    betaWeights: stats.betaWeights.map((b, index) => ({
      value: b,
      color: randColor(b, `betaWeights${index}`),
    })),
    correlationMatrix: stats.correlationMatrix.map((row, i) =>
      row.map((val, j) => ({ value: val, color: randColor(val, `corr${i}${j}`) }))
    ),
    vifValues: stats.vifValues.map((vif, index) => ({
      value: vif,
      color: randColor(vif, `vif${index}`),
    })),
    hasMulticollinearity: stats.hasMulticollinearity,
  };
};
