import { applyStyle } from "@utils/excelFormats";
import { splitAndCompleteRawData } from "@utils/ui";

export async function insertColumnTo(array, sheetName, positions) {
  try {
    await Excel.run(async (context) => {
      let sheet = context.workbook.worksheets.getItemOrNullObject(sheetName);
      sheet.load("name");
      await context.sync();
      if (sheet.isNullObject) {
        sheet = context.workbook.worksheets.add(sheetName);
      }
      sheet.activate();

      const { excelData, formats } = splitAndCompleteRawData(array);

      const numRows = excelData.length;
      const numCols = excelData[0].length;

      const startCell = sheet.getRange(positions).getCell(0, 0);
      const targetRange = startCell.getResizedRange(numRows - 1, numCols - 1);

      targetRange.clear();
      await context.sync();

      targetRange.values = excelData;
      targetRange.format.autofitColumns();

      formats.forEach((cellFormat) => {
        const { row, column, format } = cellFormat;
        const { fullWidth, ...rest } = format;
        if (fullWidth) applyStyle(targetRange, rest, row);
        else applyStyle(targetRange, rest, row, column);
      });

      await context.sync();
    });
  } catch (error) {
    console.error("Eroare la inserarea datelor în Excel:", error);
  }
}

export async function insertColumn(array, positions) {
  try {
    await Excel.run(async (context) => {
      const sheet = context.workbook.worksheets.getActiveWorksheet();
      const { excelData, formats } = splitAndCompleteRawData(array);

      const numRows = excelData.length;
      const numCols = excelData[0].length;

      const startCell = sheet.getRange(positions).getCell(0, 0);
      const targetRange = startCell.getResizedRange(numRows - 1, numCols - 1);

      targetRange.clear();
      await context.sync();

      targetRange.values = excelData;
      targetRange.format.autofitColumns();

      formats.forEach((cellFormat) => {
        const { row, column, format } = cellFormat;
        const { fullWidth, ...rest } = format;
        if (fullWidth) applyStyle(targetRange, rest, row);
        else applyStyle(targetRange, rest, row, column);
      });

      await context.sync();
      console.log("Datele au fost inserate cu succes în tabel.");
    });
  } catch (error) {
    console.error("Eroare la inserarea datelor în Excel:", error);
  }
}
