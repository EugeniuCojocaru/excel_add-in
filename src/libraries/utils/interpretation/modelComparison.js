const comparisonInterpretation = (modelsStats, t) => {
  const interpretation = [];

  interpretation.push([t("modelComparison.interpretation.title")]);
  interpretation.push([""]);
  let maxRSquared = { modelKey: "", value: Number.NEGATIVE_INFINITY };
  let minRSS = { modelKey: "", value: Number.POSITIVE_INFINITY };
  modelsStats.forEach((model) => {
    const { modelKey, rSquared, ssRes } = model;
    interpretation.push([`R²(${modelKey}) = `, `${rSquared}`, `RSS(${modelKey}) = `, `${ssRes}`]);

    if (rSquared > maxRSquared.value) {
      maxRSquared = { modelKey, value: rSquared };
    }

    if (ssRes < minRSS.value) {
      minRSS = { modelKey, value: ssRes };
    }
  });

  interpretation.push([
    `Modelul cu cel mai mare R² este ${maxRSquared.modelKey} (${maxRSquared.value})`,
  ]);
  interpretation.push([`Modelul cu cel mai mic RSS este ${minRSS.modelKey} (${minRSS.value})`]);
  interpretation.push([
    `Pe baza algoritmului studiat, daca valorile sunt comparabile, cel mai bun model se alege in functie de cel mai mic RSS. Acest model este: ${minRSS.modelKey}.`,
  ]);

  return interpretation;
};

const COMPARISSON_INTERPRETATION = {
  comparisonInterpretation,
};

export default COMPARISSON_INTERPRETATION;
