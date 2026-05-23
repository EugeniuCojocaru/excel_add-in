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
    ],
    [
      t("regression.summaryOutput.intercept"),
      stats.b0,
      stats.standardErrors[0],
      stats.tStats[0],
      stats.pValues[0],
      stats.confidenceIntervals[0][0],
      stats.confidenceIntervals[0][1],
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

  return dataToWrite;
};
