export const generateSummaryOutput = (stats) => {
  const n = stats.df + stats.k + 1;

  let dataToWrite = [
    ["SUMMARY OUTPUT", "", "", "", ""],
    ["", "", "", "", ""],

    ["Regression Statistics", "", "", "", ""],
    ["R Square", stats.rSquared, "", "", ""],
    ["Adjusted R Square", stats.adjustedRSquared, "", "", ""],
    ["Standard Error", stats.ese, "", "", ""],
    ["Observations", n, "", "", ""],
    ["", "", "", "", ""],

    ["ANOVA", "", "", "", ""],
    ["", "df", "F", "Significance F", ""],
    ["Regression", stats.k, stats.fStat, stats.fSignificance, ""],
    ["Residual", stats.df, "", "", ""],
    ["Total", stats.df + stats.k, "", "", ""],
    ["", "", "", "", ""],

    ["", "Coefficients", "Standard Error", "t Stat", "P-value"],
    ["Intercept (b0)", stats.intercept, stats.standardErrors[0], stats.tStats[0], stats.pValues[0]],
  ];

  for (let i = 0; i < stats.k; i++) {
    const index = i + 1;
    dataToWrite.push([
      `Variabila X${index} (b${index})`, // Numele pe coloana 1
      stats.slopes[i], // Coeficientul pe coloana 2
      stats.standardErrors[index], // Eroarea standard pe coloana 3
      stats.tStats[index], // t Stat pe coloana 4
      stats.pValues[index], // P-value pe coloana 5
    ]);
  }

  if (stats.interpretation) {
    dataToWrite.push(["", "", "", "", ""]);
    dataToWrite.push(["Interpretare:", "", "", "", ""]);

    stats.interpretation.forEach((rand) => {
      dataToWrite.push([rand[0] || "", rand[1] || "", "", "", ""]);
    });
  }
  return dataToWrite;
};
