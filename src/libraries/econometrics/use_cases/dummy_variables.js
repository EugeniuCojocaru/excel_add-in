import {
  getUniqueCategories,
  getReferenceCategory,
  buildDummyMeta,
  buildDummyColumns,
} from "../helpers/dummy_variable_steps";

/**
 * Transformă fiecare coloană categorială într-un set de variabile dummy (codificare 0/1),
 * excluzând categoria de referință aleasă pentru a evita capcana variabilei dummy (dummy trap).
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

    // 1. Categoriile unice observate pe această coloană (ex: ["licență", "master"])
    const uniqueCategories = getUniqueCategories(rows, colIndex);

    // 2. Categoria de referință (override din partea utilizatorului sau prima alfabetic)
    const referenceCategory = getReferenceCategory(uniqueCategories, referenceCategories, colIndex);
    const dummyCategories = uniqueCategories.filter((category) => category !== referenceCategory);

    // 3. Metadatele coloanelor dummy nou generate
    buildDummyMeta(originalMeta, dummyCategories, referenceCategory).forEach((entry) =>
      newMeta.push(entry)
    );

    // 4. Matricea 0/1 pentru categoriile acestei coloane, adăugată rând cu rând
    buildDummyColumns(rows, colIndex, dummyCategories).forEach((values, rowIndex) =>
      newData[rowIndex].push(...values)
    );
  }

  return { data: newData, meta: newMeta };
};

/**
 * Construiește tabelul (antet + rânduri) gata de scris în Excel dintr-un rezultat de
 * preprocessDummyVariables.
 * @param {{ data: number[][], meta: { name: string, unit?: string }[] }} dummyData
 * @returns {any[][]}
 */
export const buildDummyTableRows = ({ data, meta }) => {
  const headers = meta.map((column) => `${column.name} ${column.unit ? `<${column.unit}>` : ""}`);
  return [headers, ...data];
};
