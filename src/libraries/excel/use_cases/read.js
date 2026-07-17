import { getHeaderMeta, getNumericRows, getStringRows } from "../helpers/read_steps";

const logIgnoredRows = (ignored) => {
  ignored.forEach((i) => console.log(`Row ${i + 1} was ignored (contains text or missing data).`));
};

/**
 * Reads a range from the active sheet and transforms it into numeric columns, with
 * optional headers in the form "Name <unit>".
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
        console.warn("Selection is empty.");
        return { data: [], meta: [] };
      }

      // 1. Detect and remove an optional header row
      const { meta, rows } = getHeaderMeta(values);

      // 2. Keep only purely numeric rows
      const { data, ignored } = getNumericRows(rows);
      logIgnoredRows(ignored);

      return { data, meta };
    });
  } catch (error) {
    console.error("An error occurred while extracting the data:", error);
    return { data: [], meta: [] };
  }
};

/**
 * Reads a range from the active sheet and transforms it into text columns, with
 * optional headers in the form "Name <unit>".
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
        console.warn("Selection is empty.");
        return { data: [], meta: [] };
      }

      // 1. Detect and remove an optional header row
      const { meta, rows } = getHeaderMeta(values);

      // 2. Keep only purely text rows
      const { data, ignored } = getStringRows(rows);
      logIgnoredRows(ignored);

      return { data, meta };
    });
  } catch (error) {
    console.error("An error occurred while extracting the data:", error);
    return { data: [], meta: [] };
  }
};
