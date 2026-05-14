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

function parseUnitString(input) {
  // Regex explanation:
  // ^(.+?)     -> Match the start of the string and capture everything (lazily)
  // \s*        -> Match any optional whitespace
  // <(.+?)>    -> Match literal '<', capture the inside, then match '>'
  const regex = /^(.+?)\s*<(.+?)>/;
  const match = input.match(regex);

  if (!match) {
    return { name: input.trim(), unit: null };
  }

  return {
    name: match[1].trim(),
    unit: match[2].trim(),
  };
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
      const columnMeta = []; // data type: { names: "", unit: "" }

      if (!values || values.length === 0) {
        console.warn("Selecția este goală.");
        return [];
      }

      const isFirstRowHeader = values[0].every((cellValue) => typeof cellValue === "string");
      if (isFirstRowHeader) {
        columnMeta.push(
          ...values[0].map((header) => {
            const { name, unit } = parseUnitString(header);
            return { name, unit };
          })
        );
        values.shift();
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
      return { data: dataByColumn, meta: columnMeta };
    });
  } catch (error) {
    console.error("A apărut o eroare la extragerea datelor:", error);
    return [];
  }
}
