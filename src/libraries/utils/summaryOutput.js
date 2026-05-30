import { EXCEL_FORMATS } from "./excelFormats";
import { toUIData } from "./ui";

const addRowData = (rowData, newRow) => {
  const newRowColumns = newRow.row.length;
  if (newRowColumns > rowData.maxColumns) rowData.maxColumns = newRowColumns;
  rowData.dataToWrite.push(newRow);
};

// Accepts wrapped uiStats (from toUIStats spread with interpretation) and { mode, fillFor }.
export const generateSummaryOutput = (
  stats,
  _yMeta,
  xMeta,
  t,
  { mode = "STUDENT", fillFor = () => null, extended = false } = {}
) => {
  const rawData = { dataToWrite: [], maxColumns: 0 };
  const n = stats.df.value + stats.k.value + 1;
  const confidence = (1 - stats.alpha) * 100;
  const xNames = Array.from(
    { length: stats.k.value },
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
      [t("regression.summaryOutput.rSquared"), stats.rSquared.value],
      [EXCEL_FORMATS.tableRowHeader, fillFor(stats.rSquared)]
    )
  );
  addRowData(
    rawData,
    toUIData(
      [t("regression.summaryOutput.adjustedRSquared"), stats.adjustedRSquared.value],
      [EXCEL_FORMATS.tableRowHeader, fillFor(stats.adjustedRSquared)]
    )
  );
  addRowData(
    rawData,
    toUIData(
      [t("regression.summaryOutput.standardError"), stats.ese.value],
      [EXCEL_FORMATS.tableRowHeader, null]
    )
  );
  addRowData(
    rawData,
    toUIData(
      [t("regression.summaryOutput.ssRes"), stats.ssRes.value],
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
      [
        t("regression.summaryOutput.regression"),
        stats.k.value,
        stats.fStat.value,
        stats.fSignificance.value,
      ],
      [EXCEL_FORMATS.tableRowHeader, null, null, fillFor(stats.fSignificance)]
    )
  );
  addRowData(
    rawData,
    toUIData(
      [t("regression.summaryOutput.residual"), stats.df.value, "", ""],
      [EXCEL_FORMATS.tableRowHeader, null, null, null]
    )
  );
  addRowData(
    rawData,
    toUIData(
      [t("regression.summaryOutput.total"), stats.df.value + stats.k.value, "", ""],
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
        stats.b0.value,
        stats.standardErrors[0].value,
        stats.tStats[0].value,
        stats.pValues[0].value,
        stats.confidenceIntervals[0][0].value,
        stats.confidenceIntervals[0][1].value,
        "",
      ],
      [EXCEL_FORMATS.tableRowHeader, fillFor(stats.b0), null, null, null, null, null, null]
    )
  );
  for (let i = 0; i < stats.k.value; i++) {
    addRowData(
      rawData,
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

  // 4. Interpretation
  if (extended) {
    stats.interpretation.forEach((row) => {
      addRowData(rawData, row);
    });

    // 5. VIF & Correlation Matrix (only meaningful for multiple regression)
    if (stats.k.value > 1) {
      addRowData(rawData, toUIData([""]));

      addRowData(
        rawData,
        toUIData(
          [t("regression.summaryOutput.vifTitle")],
          [{ ...EXCEL_FORMATS.h1Title, fullWidth: true }]
        )
      );
      addRowData(rawData, toUIData([""]));
      addRowData(
        rawData,
        toUIData(["", t("regression.summaryOutput.vifValue")], [null, EXCEL_FORMATS.tableColHeader])
      );
      for (let i = 0; i < stats.k.value; i++) {
        addRowData(
          rawData,
          toUIData([xNames[i], stats.vifValues[i].value], [EXCEL_FORMATS.tableRowHeader, null])
        );
      }
      if (stats.hasMulticollinearity) {
        addRowData(rawData, toUIData([""]));
        addRowData(
          rawData,
          toUIData(
            [t("regression.summaryOutput.multicollinearityWarning")],
            [{ ...EXCEL_FORMATS.h3Subtitle, fullWidth: true }]
          )
        );
        addRowData(rawData, toUIData([t("regression.summaryOutput.multicollinearityEffect")]));
      }

      // Correlation matrix — always shown
      addRowData(rawData, toUIData([""]));
      addRowData(
        rawData,
        toUIData(
          [t("regression.summaryOutput.correlationMatrixTitle")],
          [{ ...EXCEL_FORMATS.h1Title, fullWidth: true }]
        )
      );
      addRowData(rawData, toUIData([""]));
      addRowData(
        rawData,
        toUIData(["", ...xNames], [null, ...xNames.map(() => EXCEL_FORMATS.tableColHeader)])
      );
      for (let i = 0; i < stats.k.value; i++) {
        addRowData(
          rawData,
          toUIData(
            [xNames[i], ...stats.correlationMatrix[i].map((c) => c.value)],
            [EXCEL_FORMATS.tableRowHeader, null]
          )
        );
      }

      // High-correlation pairs observation
      const highPairs = [];
      for (let i = 0; i < stats.k.value; i++) {
        for (let j = i + 1; j < stats.k.value; j++) {
          const r = stats.correlationMatrix[i][j].value;
          if (Math.abs(r) > 0.8) highPairs.push({ nameI: xNames[i], nameJ: xNames[j], r });
        }
      }
      if (highPairs.length > 0) {
        addRowData(rawData, toUIData([""]));
        addRowData(
          rawData,
          toUIData([t("regression.summaryOutput.observation")], [EXCEL_FORMATS.h3Subtitle])
        );
        highPairs.forEach(({ nameI, nameJ, r }) => {
          const label =
            Math.abs(r) > 0.9
              ? t("regression.summaryOutput.veryStrongCorrelation")
              : t("regression.summaryOutput.strongCorrelation");
          addRowData(rawData, toUIData([`r(${nameI},${nameJ}) = ${r} → ${label}.`]));
        });
        addRowData(rawData, toUIData([t("regression.summaryOutput.multicollinearityEffect")]));
      }

      // 6. Executive Summary — always shown
      const adjRSqNum = Number(stats.adjustedRSquared.value);
      const adjRSqPct = Math.round(adjRSqNum * 100);
      const powerLabel =
        adjRSqNum < 0.3
          ? t("regression.summaryOutput.powerWeak")
          : adjRSqNum < 0.7
            ? t("regression.summaryOutput.powerModerate")
            : t("regression.summaryOutput.powerStrong");

      const strongestIdx = stats.betaWeights.reduce(
        (maxIdx, val, i) =>
          Math.abs(val.value) > Math.abs(stats.betaWeights[maxIdx].value) ? i : maxIdx,
        0
      );

      addRowData(rawData, toUIData([""]));
      addRowData(
        rawData,
        toUIData(
          [t("regression.summaryOutput.executiveSummaryTitle")],
          [{ ...EXCEL_FORMATS.h1Title, fullWidth: true }]
        )
      );
      addRowData(rawData, toUIData([""]));
      if (!stats.fIsSignificant) {
        addRowData(
          rawData,
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
        addRowData(
          rawData,
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
      addRowData(
        rawData,
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
        addRowData(
          rawData,
          toUIData(
            [t("regression.summaryOutput.executiveSummaryMulticollinearity")],
            [{ ...EXCEL_FORMATS.h3Subtitle, fullWidth: true }]
          )
        );
      }
    }
  }

  return rawData;
};
