export async function insertColumn(array, positions) {
  try {
    await Excel.run(async (context) => {
      const sheet = context.workbook.worksheets.getActiveWorksheet();
      const numRows = array.length;
      const numCols = array[0].length;
      const startCell = sheet.getRange(positions).getCell(0, 0);
      const targetRange = startCell.getResizedRange(numRows - 1, numCols - 1);
      targetRange.values = array;
      targetRange.format.autofitColumns();
      await context.sync();
      console.log("Datele au fost inserate cu succes în tabel.");
    });
  } catch (error) {
    console.error("Eroare la inserarea datelor în Excel:", error);
  }
}
