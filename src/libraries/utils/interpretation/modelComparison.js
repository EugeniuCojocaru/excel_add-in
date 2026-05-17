const comparisonInterpretation = (modelsStats, t) => {
  const interpretation = [];

  interpretation.push([t("modelComparison.interpretation.title")]);
  interpretation.push([""]);
  let maxRSquared = { modelType: "", value: Number.NEGATIVE_INFINITY };
  let minRSS = { modelType: "", value: Number.POSITIVE_INFINITY };
  modelsStats.forEach((model) => {
    const { modelType, rSquared, ssRes } = model;
    interpretation.push([`R²(${modelType}) = `, `${rSquared}`, `RSS(${modelType}) = `, `${ssRes}`]);

    if (rSquared > maxRSquared.value) {
      maxRSquared = { modelType, value: rSquared };
    }

    if (ssRes < minRSS.value) {
      minRSS = { modelType, value: ssRes };
    }
  });

  interpretation.push([
    `Modelul cu cel mai mare R² este ${maxRSquared.modelType} (${maxRSquared.value})`,
  ]);
  interpretation.push([`Modelul cu cel mai mic RSS este ${minRSS.modelType} (${minRSS.value})`]);
  interpretation.push([
    `Pe baza algoritmului studiat, daca valorile sunt comparabile, cel mai bun model se alege in functie de cel mai mic RSS. Acest model este: ${minRSS.modelType}.`,
  ]);

  return interpretation;
};

const COMPARISSON_INTERPRETATION = {
  comparisonInterpretation,
};

export default COMPARISSON_INTERPRETATION;
