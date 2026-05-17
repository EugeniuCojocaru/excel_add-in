import { standardizeDataToWrite } from "@utils/ui";
export async function insertColumn(array, positions) {
  try {
    await Excel.run(async (context) => {
      const sheet = context.workbook.worksheets.getActiveWorksheet();
      const data = standardizeDataToWrite(array);
      const numRows = data.length;
      const numCols = data[0].length;
      const startCell = sheet.getRange(positions).getCell(0, 0);
      const targetRange = startCell.getResizedRange(numRows - 1, numCols - 1);
      targetRange.values = data;
      targetRange.format.autofitColumns();
      await context.sync();
      console.log("Datele au fost inserate cu succes în tabel.");
    });
  } catch (error) {
    console.error("Eroare la inserarea datelor în Excel:", error);
  }
}
