import math from "../config";
import {
  MODEL_TYPE_LOG_LINEAR,
  MODEL_TYPE_SEMI_LOG,
  MODEL_TYPE_LIN_LOG,
} from "@constants/model_types";

/**
 * Transforms the raw data into the X and Y matrices needed for regression,
 * applying the natural logarithm (ln) depending on the chosen model.
 * @param {{data: number[][], meta: { name: string, unit: string }[]}} yData
 * @param {{data: number[][], meta: { name: string, unit: string }[]}} xData
 * @param {string} modelType - 'linear', 'log-linear', 'semi-log', 'lin-log'
 * @returns {{ Y: any[], X: any[] }} Matrices ready for mathjs algebra
 */
export const buildDesignMatrices = (yData, xData, modelType) => {
  const transformY = modelType === MODEL_TYPE_LOG_LINEAR || modelType === MODEL_TYPE_SEMI_LOG;
  const transformX = modelType === MODEL_TYPE_LOG_LINEAR || modelType === MODEL_TYPE_LIN_LOG;

  const Y = yData.data.map((val) => {
    let v = math.bignumber(val[0]);
    if (transformY) {
      if (v <= 0) throw new Error("The logarithm requires strictly positive values for Y.");
      v = math.log(v);
    }
    return [math.bignumber(v)];
  });

  const X = xData.data.map((row) => {
    const processedRow = row.map((val) => {
      let v = math.bignumber(val);
      if (transformX) {
        if (v <= 0)
          throw new Error("The logarithm requires strictly positive values for the X variables.");
        v = math.log(v);
      }
      return v;
    });
    return [1, ...processedRow].map((val) => math.bignumber(val));
  });

  return { Y, X };
};
