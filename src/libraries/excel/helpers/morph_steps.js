/**
 * Wraps a row of values with a per-cell format array, defaulting every cell to no
 * format. This is the core row-builder of the { row, format } dialect used
 * throughout the write pipeline.
 * @param {any[]} data
 * @param {(object|null)[]|null} [format]
 * @returns {{ row: any[], format: (object|null)[] }}
 */
export const toUIData = (data, format = null) => {
  if ((data === null || data === undefined) && Boolean(format)) return { row: [""], format: [...format] };
  let formatData = [];
  if (format === null) formatData = data.map(() => null);
  return { row: data, format: format || formatData };
};

/**
 * Pads every row of `dataToWrite` to `maxColumns` (mutating each row in place) and
 * collects every non-null cell format into a flat, absolute-coordinate list — the
 * final boundary shape the Excel write pipeline needs.
 * @param {{ maxColumns: number, dataToWrite: { row: any[], format: (object|null)[] }[] }} rawData
 * @returns {{ excelData: any[][], formats: { row: number, column: number, format: object }[] }}
 */
export const splitAndCompleteRawData = (rawData) => {
  const { maxColumns, dataToWrite } = rawData;
  const formats = [];

  const excelData = dataToWrite.map((data, rowIndex) => {
    const { row, format } = data;
    format.forEach((cellFormat, columnIndex) => {
      if (cellFormat !== null && cellFormat !== "") {
        formats.push({
          row: rowIndex,
          column: columnIndex,
          format: cellFormat,
        });
      }
    });
    const diff = maxColumns - row.length;
    if (diff !== 0) row.push(...Array(diff).fill(""));

    return row;
  });

  return { excelData, formats };
};
