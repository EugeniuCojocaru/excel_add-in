export const generateSummaryOutput = (stats, yMeta, xMeta, t) => {
  const n = stats.df + stats.k + 1;

  let dataToWrite = [
    // 1. Tabelul "Regression Statistics"
    [
      t("regression.summaryOutput.summary"),
      t("regression.summaryOutput.modelType", { modelType: stats.modelType }),
      "",
      "",
      "",
    ],
    ["", "", "", "", ""],
    [t("regression.summaryOutput.n"), n, "", "", ""],
    [t("regression.summaryOutput.rSquared"), stats.rSquared, "", "", ""],
    [t("regression.summaryOutput.adjustedRSquared"), stats.adjustedRSquared, "", "", ""],
    [t("regression.summaryOutput.standardError"), stats.ese, "", "", ""],
    [t("regression.summaryOutput.ssRes"), stats.ssRes, "", "", ""],
    ["", "", "", "", ""],

    // 2. Tabelul "ANOVA"
    [t("regression.summaryOutput.anova"), "", "", "", ""],
    [
      "",
      t("regression.summaryOutput.df"),
      t("regression.summaryOutput.f"),
      t("regression.summaryOutput.significanceF"),
      "",
    ],
    [t("regression.summaryOutput.regression"), stats.k, stats.fStat, stats.fSignificance, ""],
    [t("regression.summaryOutput.residual"), stats.df, "", "", ""],
    [t("regression.summaryOutput.total"), stats.df + stats.k, "", "", ""],
    ["", "", "", "", ""],

    // 3. Tabelul "Coefficients"
    [
      "",
      t("regression.summaryOutput.coefficients"),
      t("regression.summaryOutput.standardErrorCoef"),
      t("regression.summaryOutput.tStat"),
      t("regression.summaryOutput.pValue"),
      t("regression.summaryOutput.lowerCI", { confidence: (1 - stats.alpha) * 100 }),
      t("regression.summaryOutput.upperCI", { confidence: (1 - stats.alpha) * 100 }),
      t("regression.summaryOutput.betaWeight"),
    ],
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
  ];

  // Adăugăm rândurile pentru variabilele X1, X2...
  for (let i = 0; i < stats.k; i++) {
    const index = i + 1;
    const xName = xMeta[i]?.name || t("regression.summaryOutput.variableX", { index: index });
    dataToWrite.push([
      `${xName} (b${index})`,
      stats.slopes[i],
      stats.standardErrors[index],
      stats.tStats[index],
      stats.pValues[index],
      stats.confidenceIntervals[index][0],
      stats.confidenceIntervals[index][1],
      stats.betaWeights[i],
    ]);
  }

  // 4. Adăugăm interpretarea, dacă există
  if (stats.interpretation) {
    dataToWrite.push(["", "", "", "", ""]);
    dataToWrite.push([t("regression.summaryOutput.interpretation"), "", "", "", ""]);

    stats.interpretation.forEach((row) => {
      dataToWrite.push([row[0] || "", row[1] || "", "", "", ""]);
    });
  }

  // 5. VIF & Correlation Matrix (only meaningful for multiple regression)
  if (stats.k > 1) {
    const xNames = Array.from({ length: stats.k }, (_, i) =>
      xMeta[i]?.name || t("regression.summaryOutput.variableX", { index: i + 1 })
    );

    // VIF table
    dataToWrite.push(["", "", "", "", ""]);
    dataToWrite.push([t("regression.summaryOutput.vifTitle"), "", "", "", ""]);
    dataToWrite.push(["", t("regression.summaryOutput.vifValue"), "", "", ""]);
    for (let i = 0; i < stats.k; i++) {
      dataToWrite.push([xNames[i], stats.vifValues[i], "", "", ""]);
    }
    if (stats.hasMulticollinearity) {
      dataToWrite.push(["", "", "", "", ""]);
      dataToWrite.push([t("regression.summaryOutput.multicollinearityWarning"), "", "", "", ""]);
      dataToWrite.push([t("regression.summaryOutput.multicollinearityEffect"), "", "", "", ""]);
    }

    // Correlation matrix
    dataToWrite.push(["", "", "", "", ""]);
    dataToWrite.push([t("regression.summaryOutput.correlationMatrixTitle"), "", "", "", ""]);
    dataToWrite.push(["", ...xNames]);
    for (let i = 0; i < stats.k; i++) {
      dataToWrite.push([xNames[i], ...stats.correlationMatrix[i]]);
    }

    // Interpretation for high correlations
    const highPairs = [];
    for (let i = 0; i < stats.k; i++) {
      for (let j = i + 1; j < stats.k; j++) {
        const r = stats.correlationMatrix[i][j];
        if (Math.abs(r) > 0.8) {
          highPairs.push({ nameI: xNames[i], nameJ: xNames[j], r });
        }
      }
    }

    if (highPairs.length > 0) {
      dataToWrite.push(["", "", "", "", ""]);
      dataToWrite.push([t("regression.summaryOutput.observation"), "", "", "", ""]);
      highPairs.forEach(({ nameI, nameJ, r }) => {
        const label =
          Math.abs(r) > 0.9
            ? t("regression.summaryOutput.veryStrongCorrelation")
            : t("regression.summaryOutput.strongCorrelation");
        dataToWrite.push([`r(${nameI},${nameJ}) = ${r} → ${label}.`, "", "", "", ""]);
      });
      dataToWrite.push([t("regression.summaryOutput.multicollinearityEffect"), "", "", "", ""]);
    }
  }

  return dataToWrite;
};
