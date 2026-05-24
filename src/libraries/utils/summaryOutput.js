import { EXCEL_FORMATS } from "./excelFormats";
import { toUIData } from "./ui";

const addRowData = (rowData, newRow) => {
  const newRowColumns = newRow.row.length;
  if (newRowColumns > rowData.maxColumns) rowData.maxColumns = newRowColumns;
  rowData.dataToWrite.push(newRow);
};

export const generateSummaryOutput = (stats, yMeta, xMeta, t) => {
  const rawData = { dataToWrite: [], maxColumns: 0 };
  const n = stats.df + stats.k + 1;
  const confidence = (1 - stats.alpha) * 100;
  const xNames = Array.from(
    { length: stats.k },
    (_, i) => xMeta[i]?.name || t("regression.summaryOutput.variableX", { index: i + 1 })
  );

  // 1. Regression Statistics
  addRowData(
    rawData,
    toUIData(
      [
        t("regression.summaryOutput.summary"),
        "",
        t("regression.summaryOutput.modelType", { modelType: stats.modelType }),
      ],
      [{ ...EXCEL_FORMATS.h1Title, fullWidth: true }, null, EXCEL_FORMATS.h1Subtitle]
    )
  );
  addRowData(rawData, toUIData([""]));
  addRowData(
    rawData,
    toUIData([t("regression.summaryOutput.n"), n], [EXCEL_FORMATS.tableRowHeader, null])
  );
  addRowData(
    rawData,
    toUIData(
      [t("regression.summaryOutput.rSquared"), stats.rSquared],
      [EXCEL_FORMATS.tableRowHeader, null]
    )
  );
  addRowData(
    rawData,
    toUIData(
      [t("regression.summaryOutput.adjustedRSquared"), stats.adjustedRSquared],
      [EXCEL_FORMATS.tableRowHeader, null]
    )
  );
  addRowData(
    rawData,
    toUIData(
      [t("regression.summaryOutput.standardError"), stats.ese],
      [EXCEL_FORMATS.tableRowHeader, null]
    )
  );
  addRowData(
    rawData,
    toUIData(
      [t("regression.summaryOutput.ssRes"), stats.ssRes],
      [EXCEL_FORMATS.tableRowHeader, null]
    )
  );
  addRowData(rawData, toUIData([""]));

  // 2. ANOVA
  addRowData(
    rawData,
    toUIData([t("regression.summaryOutput.anova")], [{ ...EXCEL_FORMATS.h1Title, fullWidth: true }])
  );
  addRowData(rawData, toUIData([""]));
  addRowData(
    rawData,
    toUIData(
      [
        "",
        t("regression.summaryOutput.df"),
        t("regression.summaryOutput.f"),
        t("regression.summaryOutput.significanceF"),
      ],
      [
        null,
        EXCEL_FORMATS.tableColHeader,
        EXCEL_FORMATS.tableColHeader,
        EXCEL_FORMATS.tableColHeader,
      ]
    )
  );
  addRowData(
    rawData,
    toUIData(
      [t("regression.summaryOutput.regression"), stats.k, stats.fStat, stats.fSignificance],
      [EXCEL_FORMATS.tableRowHeader, null, null, null]
    )
  );
  addRowData(
    rawData,
    toUIData(
      [t("regression.summaryOutput.residual"), stats.df, "", ""],
      [EXCEL_FORMATS.tableRowHeader, null, null, null]
    )
  );
  addRowData(
    rawData,
    toUIData(
      [t("regression.summaryOutput.total"), stats.df + stats.k, "", ""],
      [EXCEL_FORMATS.tableRowHeader, null, null, null]
    )
  );
  addRowData(rawData, toUIData([""]));

  // 3. Coefficients
  addRowData(
    rawData,
    toUIData(
      [
        "",
        t("regression.summaryOutput.coefficients"),
        t("regression.summaryOutput.standardErrorCoef"),
        t("regression.summaryOutput.tStat"),
        t("regression.summaryOutput.pValue"),
        t("regression.summaryOutput.lowerCI", { confidence }),
        t("regression.summaryOutput.upperCI", { confidence }),
        t("regression.summaryOutput.betaWeight"),
      ],
      [null, ...Array(7).fill(EXCEL_FORMATS.tableColHeader)]
    )
  );
  addRowData(
    rawData,
    toUIData(
      [
        t("regression.summaryOutput.intercept"),
        stats.b0,
        stats.standardErrors[0],
        stats.tStats[0],
        stats.pValues[0],
        stats.confidenceIntervals[0][0],
        stats.confidenceIntervals[0][1],
        "",
      ],
      [EXCEL_FORMATS.tableRowHeader, ...Array(7).fill(null)]
    )
  );
  for (let i = 0; i < stats.k; i++) {
    addRowData(
      rawData,
      toUIData(
        [
          `${xNames[i]} (b${i + 1})`,
          stats.slopes[i],
          stats.standardErrors[i + 1],
          stats.tStats[i + 1],
          stats.pValues[i + 1],
          stats.confidenceIntervals[i + 1][0],
          stats.confidenceIntervals[i + 1][1],
          stats.betaWeights[i],
        ],
        [EXCEL_FORMATS.tableRowHeader, ...Array(7).fill(null)]
      )
    );
  }

  // 4. Interpretation
  if (stats.interpretation) {
    stats.interpretation.forEach((row) => {
      addRowData(rawData, row);
    });
  }

  // // 5. VIF & Correlation Matrix (only meaningful for multiple regression)
  // if (stats.k > 1) {
  //   // VIF table
  //   dataToWrite.push(["", "", "", "", ""]);
  //   dataToWrite.push([t("regression.summaryOutput.vifTitle"), "", "", "", ""]);
  //   dataToWrite.push(["", t("regression.summaryOutput.vifValue"), "", "", ""]);
  //   for (let i = 0; i < stats.k; i++) {
  //     dataToWrite.push([xNames[i], stats.vifValues[i], "", "", ""]);
  //   }
  //   if (stats.hasMulticollinearity) {
  //     dataToWrite.push(["", "", "", "", ""]);
  //     dataToWrite.push([t("regression.summaryOutput.multicollinearityWarning"), "", "", "", ""]);
  //     dataToWrite.push([t("regression.summaryOutput.multicollinearityEffect"), "", "", "", ""]);
  //   }

  //   // Correlation matrix
  //   dataToWrite.push(["", "", "", "", ""]);
  //   dataToWrite.push([t("regression.summaryOutput.correlationMatrixTitle"), "", "", "", ""]);
  //   dataToWrite.push(["", ...xNames]);
  //   for (let i = 0; i < stats.k; i++) {
  //     dataToWrite.push([xNames[i], ...stats.correlationMatrix[i]]);
  //   }

  //   // Interpretation for high correlations
  //   const highPairs = [];
  //   for (let i = 0; i < stats.k; i++) {
  //     for (let j = i + 1; j < stats.k; j++) {
  //       const r = stats.correlationMatrix[i][j];
  //       if (Math.abs(r) > 0.8) {
  //         highPairs.push({ nameI: xNames[i], nameJ: xNames[j], r });
  //       }
  //     }
  //   }

  //   if (highPairs.length > 0) {
  //     dataToWrite.push(["", "", "", "", ""]);
  //     dataToWrite.push([t("regression.summaryOutput.observation"), "", "", "", ""]);
  //     highPairs.forEach(({ nameI, nameJ, r }) => {
  //       const label =
  //         Math.abs(r) > 0.9
  //           ? t("regression.summaryOutput.veryStrongCorrelation")
  //           : t("regression.summaryOutput.strongCorrelation");
  //       dataToWrite.push([`r(${nameI},${nameJ}) = ${r} → ${label}.`, "", "", "", ""]);
  //     });
  //     dataToWrite.push([t("regression.summaryOutput.multicollinearityEffect"), "", "", "", ""]);
  //   }
  // }

  // // 6. Executive Summary (always shown, bilingual via t())
  // const adjRSqNum = Number(stats.adjustedRSquared);
  // const adjRSqPct = Math.round(adjRSqNum * 100);
  // const powerLabel =
  //   adjRSqNum < 0.3
  //     ? t("regression.summaryOutput.powerWeak")
  //     : adjRSqNum < 0.7
  //       ? t("regression.summaryOutput.powerModerate")
  //       : t("regression.summaryOutput.powerStrong");

  // const strongestIdx = stats.betaWeights.reduce(
  //   (maxIdx, val, i) => (Math.abs(val) > Math.abs(stats.betaWeights[maxIdx]) ? i : maxIdx),
  //   0
  // );

  // dataToWrite.push(["", "", "", "", ""]);
  // dataToWrite.push([t("regression.summaryOutput.executiveSummaryTitle"), "", "", "", ""]);

  // if (!stats.fIsSignificant) {
  //   dataToWrite.push([
  //     t("regression.summaryOutput.executiveSummaryNotSignificant", {
  //       pValue: stats.fSignificance.toFixed(4),
  //     }),
  //     "",
  //     "",
  //     "",
  //     "",
  //   ]);
  // } else {
  //   dataToWrite.push([
  //     t("regression.summaryOutput.executiveSummarySignificant", {
  //       power: powerLabel,
  //       pct: adjRSqPct,
  //     }),
  //     "",
  //     "",
  //     "",
  //     "",
  //   ]);
  // }

  // dataToWrite.push([
  //   t("regression.summaryOutput.executiveSummaryStrongestPredictor", {
  //     name: xNames[strongestIdx],
  //   }),
  //   "",
  //   "",
  //   "",
  //   "",
  // ]);

  // if (stats.hasMulticollinearity) {
  //   dataToWrite.push([
  //     t("regression.summaryOutput.executiveSummaryMulticollinearity"),
  //     "",
  //     "",
  //     "",
  //     "",
  //   ]);
  // }

  return rawData;
};
