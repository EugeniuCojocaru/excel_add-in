import { splitAndCompleteRawData } from "../helpers/morph_steps";
import { setRangeFormats } from "../helpers/style_steps";

/**
 * @param {Excel.RequestContext} context
 * @param {Excel.Worksheet} sheet
 * @param {{ maxColumns: number, dataToWrite: { row: any[], format: (object|null)[] }[] }} array
 * @param {string} positions - top-left cell address to start writing from
 * @returns {Promise<void>}
 */
const writeRawData = async (context, sheet, array, positions) => {
  // 1. Flatten to Excel's { excelData, formats } dialect
  const { excelData, formats } = splitAndCompleteRawData(array);

  // 2. Resize and clear the target range
  const numRows = excelData.length;
  const numCols = excelData[0].length;
  const startCell = sheet.getRange(positions).getCell(0, 0);
  const targetRange = startCell.getResizedRange(numRows - 1, numCols - 1);

  targetRange.clear();
  await context.sync();

  // 3. Write values
  targetRange.values = excelData;
  targetRange.format.autofitColumns();

  // 4. Apply per-cell/row formats
  setRangeFormats(targetRange, formats);

  await context.sync();
};

/**
 * Scrie datele într-o foaie cu un anumit nume, creând foaia dacă nu există deja, și
 * o activează.
 * @param {{ maxColumns: number, dataToWrite: { row: any[], format: (object|null)[] }[] }} array
 * @param {string} sheetName
 * @param {string} positions - top-left cell address to start writing from
 * @returns {Promise<void>}
 */
export const insertColumnTo = async (array, sheetName, positions) => {
  try {
    await Excel.run(async (context) => {
      let sheet = context.workbook.worksheets.getItemOrNullObject(sheetName);
      sheet.load("name");
      await context.sync();
      if (sheet.isNullObject) {
        sheet = context.workbook.worksheets.add(sheetName);
      }
      sheet.activate();

      await writeRawData(context, sheet, array, positions);
    });
  } catch (error) {
    console.error("Eroare la inserarea datelor în Excel:", error);
  }
};

/**
 * Scrie datele în foaia activă.
 * @param {{ maxColumns: number, dataToWrite: { row: any[], format: (object|null)[] }[] }} array
 * @param {string} positions - top-left cell address to start writing from
 * @returns {Promise<void>}
 */
export const insertColumn = async (array, positions) => {
  try {
    await Excel.run(async (context) => {
      const sheet = context.workbook.worksheets.getActiveWorksheet();
      await writeRawData(context, sheet, array, positions);
      console.log("Datele au fost inserate cu succes în tabel.");
    });
  } catch (error) {
    console.error("Eroare la inserarea datelor în Excel:", error);
  }
};
