export async function getSelectedNumericColumn(addressRange) {
  try {
    return await Excel.run(async (context) => {
      const sheet = context.workbook.worksheets.getActiveWorksheet();
      const range = sheet.getRange(addressRange);

      range.load("values");
      await context.sync();

      const values = range.values;
      const numericData = [];

      if (!values || values.length === 0) {
        console.warn("Selecția este goală.");
        return [];
      }

      for (let i = 0; i < values.length; i++) {
        const cellValue = values[i][0];

        if (typeof cellValue === "number" && !isNaN(cellValue)) {
          numericData.push(cellValue);
        }
      }

      console.log("Date extrase (curățate):", numericData);
      return numericData;
    });
  } catch (error) {
    console.error("A apărut o eroare la extragerea datelor:", error);
    return [];
  }
}

export async function getColumnMatrix(addressRange) {
  try {
    return await Excel.run(async (context) => {
      const sheet = context.workbook.worksheets.getActiveWorksheet();
      const range = sheet.getRange(addressRange);

      range.load("values");
      await context.sync();

      const values = range.values;
      const dataByColumn = [];

      if (!values || values.length === 0) {
        console.warn("Selecția este goală.");
        return [];
      }

      for (let i = 0; i < values.length; i++) {
        const currentRow = values[i];

        const isRowValid = currentRow.every(
          (cellValue) => typeof cellValue === "number" && !isNaN(cellValue)
        );

        if (isRowValid) {
          dataByColumn.push(currentRow);
        } else {
          console.log(`Rândul ${i + 1} a fost ignorat (conține text sau date lipsă).`);
        }
      }
      console.log("Date extrase (curățate):", dataByColumn);
      return dataByColumn;
    });
  } catch (error) {
    console.error("A apărut o eroare la extragerea datelor:", error);
    return [];
  }
}
