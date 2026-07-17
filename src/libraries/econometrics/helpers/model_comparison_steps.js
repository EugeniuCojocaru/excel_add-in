import { EXCEL_FORMATS } from "@excel/formats";
import { toUIData } from "@excel/helpers/morph_steps";

/**
 * @param {{ modelType: string, rSquared: number, ssRes: number }[]} modelsStats
 * @returns {{ maxRSquared: { modelType: string, value: number }, minRSS: { modelType: string, value: number } }}
 */
export const getBestModels = (modelsStats) => {
  let maxRSquared = { modelType: "", value: Number.NEGATIVE_INFINITY };
  let minRSS = { modelType: "", value: Number.POSITIVE_INFINITY };

  modelsStats.forEach(({ modelType, rSquared, ssRes }) => {
    if (rSquared > maxRSquared.value) maxRSquared = { modelType, value: rSquared };
    if (ssRes < minRSS.value) minRSS = { modelType, value: ssRes };
  });

  return { maxRSquared, minRSS };
};

/**
 * @param {{ modelType: string, rSquared: number, ssRes: number }[]} modelsStats
 * @param {(key: string, params?: object) => string} t
 * @returns {{ row: any[], format: (object|null)[] }[]}
 */
export const buildComparisonTable = (modelsStats, t) => {
  const rows = [
    toUIData(
      [t("modelComparison.interpretation.title")],
      [{ ...EXCEL_FORMATS.h1Title, fullWidth: true }]
    ),
    toUIData([""]),
    toUIData(
      ["", "R²", "RSS"],
      [null, EXCEL_FORMATS.tableColHeader, EXCEL_FORMATS.tableColHeader]
    ),
  ];

  modelsStats.forEach(({ modelType, rSquared, ssRes }) => {
    rows.push(
      toUIData([modelType, rSquared, ssRes], [EXCEL_FORMATS.tableRowHeader, null, null])
    );
  });

  return rows;
};

/**
 * @param {{ modelType: string, value: number }} maxRSquared
 * @param {{ modelType: string, value: number }} minRSS
 * @param {(key: string, params?: object) => string} t
 * @param {{ mode?: string }} [options]
 * @returns {{ row: any[], format: (object|null)[] }[]}
 */
export const buildComparisonConclusion = (maxRSquared, minRSS, t, { mode = "STUDENT" } = {}) => {
  const rows = [];

  if (mode !== "COMPACT") {
    rows.push(
      toUIData(
        [t("modelComparison.interpretation.bestRSquared"), `${maxRSquared.modelType} (${maxRSquared.value})`],
        [EXCEL_FORMATS.tableRowHeader, null]
      )
    );
    rows.push(
      toUIData(
        [t("modelComparison.interpretation.bestRSS"), `${minRSS.modelType} (${minRSS.value})`],
        [EXCEL_FORMATS.tableRowHeader, null]
      )
    );
    rows.push(toUIData([""]));
    rows.push(
      toUIData(
        [t("modelComparison.interpretation.conclusion", { modelType: minRSS.modelType })],
        [{ ...EXCEL_FORMATS.h3Subtitle, fullWidth: true }]
      )
    );
  } else {
    rows.push(
      toUIData(
        [t("modelComparison.interpretation.conclusionCompact", { modelType: minRSS.modelType })],
        [{ ...EXCEL_FORMATS.h3Subtitle, fullWidth: true }]
      )
    );
  }

  return rows;
};
