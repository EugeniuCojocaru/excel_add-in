import {
  getUniqueCategories,
  getReferenceCategory,
  buildDummyMeta,
  buildDummyColumns,
} from "../helpers/dummy_variable_steps";

/**
 * Transforms each categorical column into a set of dummy variables (0/1 encoding),
 * excluding the chosen reference category to avoid the dummy variable trap.
 * @param {{ data: any[][], meta?: { name: string, unit?: string }[] }} xData
 * @param {{ referenceCategories?: any[] }} [options] - one reference category override per original column
 * @returns {{ data: number[][], meta: { name: string, isDummy: true, unit?: string, reference: any }[] }}
 */
export const preprocessDummyVariables = (xData, { referenceCategories = [] } = {}) => {
  const rows = xData.data;
  const meta = xData.meta || [];
  const k = rows[0].length;

  const newMeta = [];
  const newData = rows.map(() => []);

  for (let colIndex = 0; colIndex < k; colIndex++) {
    const originalMeta = meta[colIndex] || { name: `D${colIndex + 1}` };

    // 1. Unique categories observed in this column (e.g., ["bachelor's", "master's"])
    const uniqueCategories = getUniqueCategories(rows, colIndex);

    // 2. Reference category (user override or first alphabetically)
    const referenceCategory = getReferenceCategory(uniqueCategories, referenceCategories, colIndex);
    const dummyCategories = uniqueCategories.filter((category) => category !== referenceCategory);

    // 3. Metadata for the newly generated dummy columns
    buildDummyMeta(originalMeta, dummyCategories, referenceCategory).forEach((entry) =>
      newMeta.push(entry)
    );

    // 4. 0/1 matrix for this column's categories, appended row by row
    buildDummyColumns(rows, colIndex, dummyCategories).forEach((values, rowIndex) =>
      newData[rowIndex].push(...values)
    );
  }

  return { data: newData, meta: newMeta };
};

/**
 * Builds the table (header + rows) ready to write to Excel from a
 * preprocessDummyVariables result.
 * @param {{ data: number[][], meta: { name: string, unit?: string }[] }} dummyData
 * @returns {any[][]}
 */
export const buildDummyTableRows = ({ data, meta }) => {
  const headers = meta.map((column) => `${column.name} ${column.unit ? `<${column.unit}>` : ""}`);
  return [headers, ...data];
};
