import { EXCEL_FORMATS } from "@utils/excelFormats";
import { toUIData } from "@utils/ui";

/**
 * @param {number} k
 * @param {{ name: string, unit: string }[]} xMeta
 * @param {(key: string, params?: object) => string} t
 * @returns {string[]}
 */
export const getXNames = (k, xMeta, t) =>
  Array.from(
    { length: k },
    (_, i) => xMeta[i]?.name || t("regression.summaryOutput.variableX", { index: i + 1 })
  );

/**
 * Stage 1 — n, R², adjusted R², standard error, SSres.
 * @param {object} stats
 * @param {(key: string, params?: object) => string} t
 * @param {{ fillFor?: (stat: {value:number,color?:string}|null) => object|null }} [options]
 * @returns {{ row: any[], format: (object|null)[] }[]}
 */
export const buildRegressionStats = (stats, t, { fillFor = () => null } = {}) => {
  const n = stats.df.value + stats.k.value + 1;

  return [
    toUIData(
      [
        t("regression.summaryOutput.summary"),
        "",
        t("regression.summaryOutput.modelType", { modelType: stats.modelType }),
      ],
      [{ ...EXCEL_FORMATS.h1Title, fullWidth: true }, null, EXCEL_FORMATS.h1Subtitle]
    ),
    toUIData([""]),
    toUIData([t("regression.summaryOutput.n"), n], [EXCEL_FORMATS.tableRowHeader, null]),
    toUIData(
      [t("regression.summaryOutput.rSquared"), stats.rSquared.value],
      [EXCEL_FORMATS.tableRowHeader, fillFor(stats.rSquared)]
    ),
    toUIData(
      [t("regression.summaryOutput.adjustedRSquared"), stats.adjustedRSquared.value],
      [EXCEL_FORMATS.tableRowHeader, fillFor(stats.adjustedRSquared)]
    ),
    toUIData(
      [t("regression.summaryOutput.standardError"), stats.ese.value],
      [EXCEL_FORMATS.tableRowHeader, null]
    ),
    toUIData(
      [t("regression.summaryOutput.ssRes"), stats.ssRes.value],
      [EXCEL_FORMATS.tableRowHeader, null]
    ),
    toUIData([""]),
  ];
};

/**
 * Stage 2 — ANOVA table (regression / residual / total).
 * @param {object} stats
 * @param {(key: string, params?: object) => string} t
 * @param {{ fillFor?: (stat: {value:number,color?:string}|null) => object|null }} [options]
 * @returns {{ row: any[], format: (object|null)[] }[]}
 */
export const buildAnova = (stats, t, { fillFor = () => null } = {}) => [
  toUIData([t("regression.summaryOutput.anova")], [{ ...EXCEL_FORMATS.h1Title, fullWidth: true }]),
  toUIData([""]),
  toUIData(
    [
      "",
      t("regression.summaryOutput.df"),
      t("regression.summaryOutput.f"),
      t("regression.summaryOutput.significanceF"),
    ],
    [null, EXCEL_FORMATS.tableColHeader, EXCEL_FORMATS.tableColHeader, EXCEL_FORMATS.tableColHeader]
  ),
  toUIData(
    [t("regression.summaryOutput.regression"), stats.k.value, stats.fStat.value, stats.fSignificance.value],
    [EXCEL_FORMATS.tableRowHeader, null, null, fillFor(stats.fSignificance)]
  ),
  toUIData(
    [t("regression.summaryOutput.residual"), stats.df.value, "", ""],
    [EXCEL_FORMATS.tableRowHeader, null, null, null]
  ),
  toUIData(
    [t("regression.summaryOutput.total"), stats.df.value + stats.k.value, "", ""],
    [EXCEL_FORMATS.tableRowHeader, null, null, null]
  ),
  toUIData([""]),
];

/**
 * Stage 3 — intercept + per-predictor coefficient rows.
 * @param {object} stats
 * @param {string[]} xNames
 * @param {(key: string, params?: object) => string} t
 * @param {{ fillFor?: (stat: {value:number,color?:string}|null) => object|null }} [options]
 * @returns {{ row: any[], format: (object|null)[] }[]}
 */
export const buildCoefficients = (stats, xNames, t, { fillFor = () => null } = {}) => {
  const confidence = (1 - stats.alpha) * 100;

  const rows = [
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
    ),
    toUIData(
      [
        t("regression.summaryOutput.intercept"),
        stats.b0.value,
        stats.standardErrors[0].value,
        stats.tStats[0].value,
        stats.pValues[0].value,
        stats.confidenceIntervals[0][0].value,
        stats.confidenceIntervals[0][1].value,
        "",
      ],
      [EXCEL_FORMATS.tableRowHeader, fillFor(stats.b0), null, null, null, null, null, null]
    ),
  ];

  for (let i = 0; i < stats.k.value; i++) {
    rows.push(
      toUIData(
        [
          `${xNames[i]} (b${i + 1})`,
          stats.slopes[i].value,
          stats.standardErrors[i + 1].value,
          stats.tStats[i + 1].value,
          stats.pValues[i + 1].value,
          stats.confidenceIntervals[i + 1][0].value,
          stats.confidenceIntervals[i + 1][1].value,
          stats.betaWeights[i].value,
        ],
        [
          EXCEL_FORMATS.tableRowHeader,
          fillFor(stats.slopes[i]),
          null,
          null,
          fillFor(stats.pValues[i + 1]),
          fillFor(stats.confidenceIntervals[i + 1][0]),
          fillFor(stats.confidenceIntervals[i + 1][1]),
          null,
        ]
      )
    );
  }

  return rows;
};

/**
 * @param {{ value: number }[][]} correlationMatrix
 * @param {string[]} xNames
 * @returns {{ nameI: string, nameJ: string, r: number }[]}
 */
export const getHighCorrelationPairs = (correlationMatrix, xNames) => {
  const highPairs = [];
  for (let i = 0; i < xNames.length; i++) {
    for (let j = i + 1; j < xNames.length; j++) {
      const r = correlationMatrix[i][j].value;
      if (Math.abs(r) > 0.8) highPairs.push({ nameI: xNames[i], nameJ: xNames[j], r });
    }
  }
  return highPairs;
};

/**
 * @param {{ value: number }[]} betaWeights
 * @returns {number}
 */
export const getStrongestPredictorIndex = (betaWeights) =>
  betaWeights.reduce(
    (maxIdx, val, i) => (Math.abs(val.value) > Math.abs(betaWeights[maxIdx].value) ? i : maxIdx),
    0
  );

/**
 * Stage 5a — VIF table, gated to k > 1 by the orchestrator.
 * @param {object} stats
 * @param {string[]} xNames
 * @param {(key: string, params?: object) => string} t
 * @returns {{ row: any[], format: (object|null)[] }[]}
 */
export const buildVifSection = (stats, xNames, t) => {
  const rows = [
    toUIData([""]),
    toUIData([t("regression.summaryOutput.vifTitle")], [{ ...EXCEL_FORMATS.h1Title, fullWidth: true }]),
    toUIData([""]),
    toUIData(["", t("regression.summaryOutput.vifValue")], [null, EXCEL_FORMATS.tableColHeader]),
  ];

  for (let i = 0; i < stats.k.value; i++) {
    rows.push(toUIData([xNames[i], stats.vifValues[i].value], [EXCEL_FORMATS.tableRowHeader, null]));
  }

  if (stats.hasMulticollinearity) {
    rows.push(toUIData([""]));
    rows.push(
      toUIData(
        [t("regression.summaryOutput.multicollinearityWarning")],
        [{ ...EXCEL_FORMATS.h3Subtitle, fullWidth: true }]
      )
    );
    rows.push(toUIData([t("regression.summaryOutput.multicollinearityEffect")]));
  }

  return rows;
};

/**
 * Stage 5b — correlation matrix + high-correlation-pair observations, gated to k > 1.
 * @param {object} stats
 * @param {string[]} xNames
 * @param {(key: string, params?: object) => string} t
 * @returns {{ row: any[], format: (object|null)[] }[]}
 */
export const buildCorrelationMatrixSection = (stats, xNames, t) => {
  const rows = [
    toUIData([""]),
    toUIData(
      [t("regression.summaryOutput.correlationMatrixTitle")],
      [{ ...EXCEL_FORMATS.h1Title, fullWidth: true }]
    ),
    toUIData([""]),
    toUIData(["", ...xNames], [null, ...xNames.map(() => EXCEL_FORMATS.tableColHeader)]),
  ];

  for (let i = 0; i < stats.k.value; i++) {
    rows.push(
      toUIData(
        [xNames[i], ...stats.correlationMatrix[i].map((c) => c.value)],
        [EXCEL_FORMATS.tableRowHeader, null]
      )
    );
  }

  const highPairs = getHighCorrelationPairs(stats.correlationMatrix, xNames);
  if (highPairs.length > 0) {
    rows.push(toUIData([""]));
    rows.push(toUIData([t("regression.summaryOutput.observation")], [EXCEL_FORMATS.h3Subtitle]));
    highPairs.forEach(({ nameI, nameJ, r }) => {
      const label =
        Math.abs(r) > 0.9
          ? t("regression.summaryOutput.veryStrongCorrelation")
          : t("regression.summaryOutput.strongCorrelation");
      rows.push(toUIData([`r(${nameI},${nameJ}) = ${r} → ${label}.`]));
    });
    rows.push(toUIData([t("regression.summaryOutput.multicollinearityEffect")]));
  }

  return rows;
};

/**
 * Stage 6 — executive summary, gated to k > 1.
 * @param {object} stats
 * @param {string[]} xNames
 * @param {(key: string, params?: object) => string} t
 * @returns {{ row: any[], format: (object|null)[] }[]}
 */
export const buildExecutiveSummary = (stats, xNames, t) => {
  const adjRSqNum = Number(stats.adjustedRSquared.value);
  const adjRSqPct = Math.round(adjRSqNum * 100);

  let powerLabel;
  if (adjRSqNum < 0.3) powerLabel = t("regression.summaryOutput.powerWeak");
  else if (adjRSqNum < 0.7) powerLabel = t("regression.summaryOutput.powerModerate");
  else powerLabel = t("regression.summaryOutput.powerStrong");

  const strongestIdx = getStrongestPredictorIndex(stats.betaWeights);

  const rows = [
    toUIData([""]),
    toUIData(
      [t("regression.summaryOutput.executiveSummaryTitle")],
      [{ ...EXCEL_FORMATS.h1Title, fullWidth: true }]
    ),
    toUIData([""]),
  ];

  if (!stats.fIsSignificant) {
    rows.push(
      toUIData(
        [
          t("regression.summaryOutput.executiveSummaryNotSignificant", {
            pValue: stats.fSignificance.value,
          }),
        ],
        [{ ...EXCEL_FORMATS.h3Subtitle, fullWidth: true }]
      )
    );
  } else {
    rows.push(
      toUIData(
        [
          t("regression.summaryOutput.executiveSummarySignificant", {
            power: powerLabel,
            pct: adjRSqPct,
          }),
        ],
        [{ ...EXCEL_FORMATS.h3Subtitle, fullWidth: true }]
      )
    );
  }

  rows.push(
    toUIData(
      [
        t("regression.summaryOutput.executiveSummaryStrongestPredictor", {
          name: xNames[strongestIdx],
        }),
      ],
      [{ ...EXCEL_FORMATS.h3Subtitle, fullWidth: true }]
    )
  );

  if (stats.hasMulticollinearity) {
    rows.push(
      toUIData(
        [t("regression.summaryOutput.executiveSummaryMulticollinearity")],
        [{ ...EXCEL_FORMATS.h3Subtitle, fullWidth: true }]
      )
    );
  }

  return rows;
};
