import { getHeaderMeta, getNumericRows, getStringRows } from "../helpers/read_steps";

const logIgnoredRows = (ignored) => {
  ignored.forEach((i) => console.log(`Rândul ${i + 1} a fost ignorat (conține text sau date lipsă).`));
};

/**
 * Citește un interval din foaia activă și îl transformă în coloane numerice, cu
 * anteturi opționale de forma "Nume <unitate>".
 * @param {string} addressRange
 * @returns {Promise<{ data: number[][], meta: { name: string, unit: string|null }[] }>}
 */
export const getColumnMatrix = async (addressRange) => {
  try {
    return await Excel.run(async (context) => {
      const sheet = context.workbook.worksheets.getActiveWorksheet();
      const range = sheet.getRange(addressRange);

      range.load("values");
      await context.sync();

      const values = range.values;
      if (!values || values.length === 0) {
        console.warn("Selecția este goală.");
        return { data: [], meta: [] };
      }

      // 1. Detectăm și eliminăm un eventual rând de antet
      const { meta, rows } = getHeaderMeta(values);

      // 2. Păstrăm doar rândurile pur numerice
      const { data, ignored } = getNumericRows(rows);
      logIgnoredRows(ignored);

      return { data, meta };
    });
  } catch (error) {
    console.error("A apărut o eroare la extragerea datelor:", error);
    return { data: [], meta: [] };
  }
};

/**
 * Citește un interval din foaia activă și îl transformă în coloane text, cu
 * anteturi opționale de forma "Nume <unitate>".
 * @param {string} addressRange
 * @returns {Promise<{ data: string[][], meta: { name: string, unit: string|null }[] }>}
 */
export const getColumnStringMatrix = async (addressRange) => {
  try {
    return await Excel.run(async (context) => {
      const sheet = context.workbook.worksheets.getActiveWorksheet();
      const range = sheet.getRange(addressRange);

      range.load("values");
      await context.sync();

      const values = range.values;
      if (!values || values.length === 0) {
        console.warn("Selecția este goală.");
        return { data: [], meta: [] };
      }

      // 1. Detectăm și eliminăm un eventual rând de antet
      const { meta, rows } = getHeaderMeta(values);

      // 2. Păstrăm doar rândurile pur text
      const { data, ignored } = getStringRows(rows);
      logIgnoredRows(ignored);

      return { data, meta };
    });
  } catch (error) {
    console.error("A apărut o eroare la extragerea datelor:", error);
    return { data: [], meta: [] };
  }
};
