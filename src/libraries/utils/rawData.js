/**
 * Concatenates row sections into the { dataToWrite, maxColumns } shape consumed
 * by @utils/ui's splitAndCompleteRawData and by the Excel write pipeline.
 * @param {{ row: any[], format: (object|null)[] }[]} rows
 * @returns {{ dataToWrite: { row: any[], format: (object|null)[] }[], maxColumns: number }}
 */
export const toRawData = (rows) => {
  let maxColumns = 0;
  rows.forEach((row) => {
    if (row.row.length > maxColumns) maxColumns = row.row.length;
  });
  return { dataToWrite: rows, maxColumns };
};
