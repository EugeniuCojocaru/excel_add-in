import { EXCEL_FORMATS } from "../excelFormats";
import { toUIData } from "../ui";

const comparisonInterpretation = (modelsStats, t, mode = "STUDENT") => {
  const rawData = { dataToWrite: [], maxColumns: 0 };

  const addRow = (row) => {
    if (row.row.length > rawData.maxColumns) rawData.maxColumns = row.row.length;
    rawData.dataToWrite.push(row);
  };

  addRow(
    toUIData(
      [t("modelComparison.interpretation.title")],
      [{ ...EXCEL_FORMATS.h1Title, fullWidth: true }]
    )
  );
  addRow(toUIData([""]));

  addRow(
    toUIData(
      ["", "R²", "RSS"],
      [null, EXCEL_FORMATS.tableColHeader, EXCEL_FORMATS.tableColHeader]
    )
  );

  let maxRSquared = { modelType: "", value: Number.NEGATIVE_INFINITY };
  let minRSS = { modelType: "", value: Number.POSITIVE_INFINITY };

  modelsStats.forEach((model) => {
    const { modelType, rSquared, ssRes } = model;

    addRow(
      toUIData(
        [modelType, rSquared, ssRes],
        [EXCEL_FORMATS.tableRowHeader, null, null]
      )
    );

    if (rSquared > maxRSquared.value) maxRSquared = { modelType, value: rSquared };
    if (ssRes < minRSS.value) minRSS = { modelType, value: ssRes };
  });

  addRow(toUIData([""]));

  if (mode !== "COMPACT") {
    addRow(
      toUIData(
        [t("modelComparison.interpretation.bestRSquared"), `${maxRSquared.modelType} (${maxRSquared.value})`],
        [EXCEL_FORMATS.tableRowHeader, null]
      )
    );
    addRow(
      toUIData(
        [t("modelComparison.interpretation.bestRSS"), `${minRSS.modelType} (${minRSS.value})`],
        [EXCEL_FORMATS.tableRowHeader, null]
      )
    );
    addRow(toUIData([""]));
    addRow(
      toUIData(
        [t("modelComparison.interpretation.conclusion", { modelType: minRSS.modelType })],
        [{ ...EXCEL_FORMATS.h3Subtitle, fullWidth: true }]
      )
    );
  } else {
    addRow(
      toUIData(
        [t("modelComparison.interpretation.conclusionCompact", { modelType: minRSS.modelType })],
        [{ ...EXCEL_FORMATS.h3Subtitle, fullWidth: true }]
      )
    );
  }

  return rawData;
};

const COMPARISSON_INTERPRETATION = {
  comparisonInterpretation,
};

export default COMPARISSON_INTERPRETATION;
