import math from "../config";

/**
 * Transformă datele brute în matricele X și Y necesare pentru regresie,
 * aplicând logaritmul natural (ln) în funcție de modelul ales.
 * @param {{data: number[][], meta: { name: string, unit: string }[]}} yData
 * @param {{data: number[][], meta: { name: string, unit: string }[]}} xData
 * @param {string} modelType - 'linear', 'log-linear', 'semi-log', 'lin-log'
 * @returns {{ Y: any[], X: any[] }} Matricele gata pentru algebra mathjs
 */
export const buildDesignMatrices = (yData, xData, modelType) => {
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
