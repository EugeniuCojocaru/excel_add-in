export const getEquation = (k, b0, b) => {
  let equation = `Y = ${b0}`;

  for (let i = 0; i < k; i++) {
    const slope = b[i];
    const sign = slope >= 0 ? "+" : "-";
    const absoluteValue = Math.abs(slope);
    const variableName = k === 1 ? "X" : `X${i + 1}`;
    equation += ` ${sign} ${absoluteValue} * ${variableName}`;
  }
  return equation;
};

export const getModel = (k, pValues, fSignificance, rSquared, adjustedRSquared) => {
  const model = [["pValue = ", k === 1 ? pValues[1] : fSignificance]];

  if (k > 1) {
    for (let i = 1; i < k; i++) {
      model.push([`p${i} = `, pValues[i]]);
    }
  }
  model.push(["R^2 = ", rSquared]);
  if (k > 1) model.push(["R^2 ajustat = ", adjustedRSquared]);

  return model;
};

const getSignificance = (b, pValue, alpha, bNumber) => {
  const significance = [["", `H0: B${bNumber} = 0 `]];

  if (b > 0) {
    significance.push([
      ``,
      `H1: B${bNumber} > 0 (deoarece b${bNumber} = ${b} > 0 deci rezulta un test unilateral la dreapta`,
    ]);
  }
  if (b < 0) {
    significance.push([
      ``,
      `H1: B${bNumber} < 0 (deoarece b${bNumber} = ${b} < 0 deci rezulta un test unilateral la stanga`,
    ]);
  }
  significance.push([
    `! Info:`,
    `deoarece am calculat p-value bilateral, pentru a testa semnificatia lui b, trebuie sa impartim p-value la 2`,
  ]);
  const pValueHalf = pValue / 2;
  significance.push([
    `Comparam pValue cu nivelul de semnificatie α = ${alpha}:`,
    `pValue/2 = ${pValueHalf} ?< α = ${alpha}`,
  ]);
  const isSignificant = pValueHalf < alpha;

  significance.push([
    "",
    `${isSignificant ? `Respingem H0, b${bNumber} nu este semnificativ diferit de 0` : "H0 nu poate fi respinsa"}`,
  ]);
  significance.push(getConclusion(isSignificant, bNumber, alpha));

  return significance;
};

const getConclusion = (isSignificant, bNumber, alpha) => {
  const percentage = (1 - alpha) * 100;
  if (isSignificant) {
    return [
      "Concluzie:",
      `Cu o probabiliate de ${percentage}%, X${bNumber} influenteaza in mod direct Y`,
    ];
  }
  return [
    "Concluzie:",
    `Nu avem suficiente dovezi pentru a concluziona ca X${bNumber} influenteaza in mod semnificativ Y`,
  ];
};

export const getMultipleRegressionSignificance = (slopes, pValues, fSignificance, alpha) => {
  const significance = [["", ""]];

  slopes.forEach((b, index) => {
    const bNumber = index + 1;
    const pValue = pValues[bNumber];
    const bSignificance = getSignificance(b, pValue, alpha, bNumber);
    bSignificance.forEach((row) => significance.push(row));
    significance.push(["", ""]);
  });

  significance.push(["Semnificatia in raport cu ansamblul variabilelor:", ""]);
  let nullHypothesis = "H0: ";
  for (let i = 0; i < slopes.length; i++) {
    nullHypothesis += `B${i + 1} = `;
  }
  nullHypothesis += "0";
  significance.push(["", nullHypothesis]);
  significance.push(["", "H1: nu toti parametrii sunt 0"]);

  significance.push([
    `Comparam pValue cu nivelul de semnificatie α = ${alpha}:`,
    `pValue = ${fSignificance} ?< α = ${alpha}`,
  ]);

  const isSignificant = fSignificance < alpha;

  significance.push([
    "",
    `${isSignificant ? `Respingem H0, cele ${slopes.length} variabile, impreuna, influenteaza in mod semnificativ modelul` : "H0 nu poate fi respinsa"}`,
  ]);

  return significance;
};

export const getInterpretation = (slopes, adjustedRSquared) => {
  const interpretation = [["", ""]];
  for (let i = 0; i < slopes.length; i++) {
    interpretation.push([
      `b${i + 1} = ${slopes[i]}`,
      `Daca X${i + 1} creste cu o unitate, Y creste, in medie, cu ${slopes[i]}`,
    ]);
  }
  interpretation.push([
    `R^2 ajustat = ${adjustedRSquared}`,
    `${(adjustedRSquared * 100).toFixed(2)}% din variatia lui Y este explicata de variatia lui X`,
  ]);
  return interpretation;
};
