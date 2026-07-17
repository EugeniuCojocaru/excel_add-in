/**
 * @param {any[][]} rows
 * @param {number} colIndex
 * @returns {any[]}
 */
export const getUniqueCategories = (rows, colIndex) =>
  [...new Set(rows.map((row) => row[colIndex]))].sort();

/**
 * @param {any[]} uniqueCategories
 * @param {any[]} referenceCategories - user overrides, one per original column
 * @param {number} colIndex
 * @returns {any}
 */
export const getReferenceCategory = (uniqueCategories, referenceCategories, colIndex) =>
  referenceCategories[colIndex] ?? uniqueCategories[0];

/**
 * @param {{ name: string, unit?: string }} originalMeta
 * @param {any[]} dummyCategories
 * @param {any} referenceCategory
 * @returns {{ name: string, isDummy: true, unit?: string, reference: any }[]}
 */
export const buildDummyMeta = (originalMeta, dummyCategories, referenceCategory) =>
  dummyCategories.map((category) => ({
    name: `${originalMeta.name}_${category}`, // e.g. "Studii_master" or "Gen_B"
    isDummy: true, // protects the column from later log transforms
    unit: originalMeta.unit,
    reference: referenceCategory,
  }));

/**
 * @param {any[][]} rows
 * @param {number} colIndex
 * @param {any[]} dummyCategories
 * @returns {number[][]} one 0/1 row per input row, one column per dummy category
 */
export const buildDummyColumns = (rows, colIndex, dummyCategories) =>
  rows.map((row) => dummyCategories.map((category) => (row[colIndex] === category ? 1 : 0)));
