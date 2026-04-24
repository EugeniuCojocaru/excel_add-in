export const generateSummaryOutput = (stats) => {
  // Calculăm numărul total de observații (n) din df și k (n = df + k + 1)
  const n = stats.df + stats.k + 1;

  let dataToWrite = [
    // Titlu general
    ["SUMMARY OUTPUT", "", "", "", ""],
    ["", "", "", "", ""], // Rând liber

    // 1. Tabelul "Regression Statistics"
    ["Regression Statistics", "", "", "", ""],
    ["R Square", stats.rSquared, "", "", ""],
    ["Adjusted R Square", stats.adjustedRSquared, "", "", ""],
    ["Standard Error", stats.ese, "", "", ""],
    ["Observations", n, "", "", ""],
    ["", "", "", "", ""], // Rând liber

    // 2. Tabelul "ANOVA" (adaptat cu datele pe care le returnăm: F și Significance F)
    ["ANOVA", "", "", "", ""],
    ["", "df", "F", "Significance F", ""],
    ["Regression", stats.k, stats.fStat, stats.fSignificance, ""],
    ["Residual", stats.df, "", "", ""],
    ["Total", stats.df + stats.k, "", "", ""],
    ["", "", "", "", ""], // Rând liber

    // 3. Tabelul "Coefficients" (Formatul tabelar pe care l-ai cerut)
    ["", "Coefficients", "Standard Error", "t Stat", "P-value"],
    ["Intercept (b0)", stats.intercept, stats.standardErrors[0], stats.tStats[0], stats.pValues[0]],
  ];

  // Adăugăm dinamic rândurile pentru variabilele independente (Pantele b1, b2... bk)
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

  // 4. Adăugăm interpretarea la final, dacă există
  if (stats.interpretation) {
    dataToWrite.push(["", "", "", "", ""]); // Rând liber
    dataToWrite.push(["Interpretare:", "", "", "", ""]);

    // Dacă interpretarea este tot o matrice, trebuie să o aliniem la 5 coloane
    stats.interpretation.forEach((rand) => {
      // Luăm textul și valoarea (dacă există) și umplem restul cu spații goale
      dataToWrite.push([rand[0] || "", rand[1] || "", "", "", ""]);
    });
  }
  return dataToWrite;
};
