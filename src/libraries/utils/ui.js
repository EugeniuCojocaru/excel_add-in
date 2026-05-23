import { randColor } from "./colors";

export const standardizeDataToWrite = (array) => {
  let max = array[0].length;

  array.forEach((row) => {
    if (row.length > max) max = row.length;
  });

  const finishedData = array.map((row) => {
    const diff = max - row.length;
    if (diff !== 0) row.push(...Array(diff).fill(""));
    return row;
  });
  console.log(finishedData);
  return finishedData;
};

export const toUIData = (data, format = null) => {
  if ((data === null || data === undefined) && Boolean(format))
    return { data: [""], format: [...format] };
  let formatData = [];
  if (format === null) formatData = data.map(() => null);
  return { row: data, format: format || formatData };
};

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

export const toExcelData = (uiData) => {
  const rows = [];
  const formats = [];
  uiData.forEach((row, index) => {
    const { data, format } = row;
    rows.push(data);

    format.forEach((cellFormat, cellIndex) => {
      if (cellFormat !== null) {
        formats.push({
          row: index,
          column: cellIndex,
          format: cellFormat.richTextSettings,
        });
      }
    });
  });
  return { rows, formats };
};

export const splitAndCompleteRawData = (rawData) => {
  const { maxColumns, dataToWrite } = rawData;
  const formats = [];

  const excelData = dataToWrite.map((data, rowIndex) => {
    const { row, format } = data;
    format.forEach((cellFormat, columnIndex) => {
      if (cellFormat !== null && cellFormat !== "") {
        formats.push({
          row: rowIndex,
          column: columnIndex,
          format: cellFormat,
        });
      }
    });
    const diff = maxColumns - row.length;
    if (diff !== 0) row.push(...Array(diff).fill(""));

    return row;
  });

  return { excelData, formats };
};
