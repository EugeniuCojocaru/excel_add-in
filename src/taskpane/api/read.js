export async function getFirstSelectedNumericColumn() {
  try {
    return await Excel.run(async (context) => {
      // 1. Obținem range-ul selectat de utilizator
      const range = context.workbook.getSelectedRange();

      // 2. Cerem Excel-ului să pregătească proprietatea "values"
      range.load("values");
      await context.sync();

      const values = range.values;
      const numericData = [];

      // 3. Dacă nu s-a selectat nimic, ne oprim
      if (!values || values.length === 0) {
        console.warn("Selecția este goală.");
        return [];
      }

      // 4. Parcurgem fiecare rând din selecție
      for (let i = 0; i < values.length; i++) {
        // Luăm mereu elementul de pe indexul 0 (prima coloană a selecției)
        const cellValue = values[i][0];

        // 5. Verificăm dacă elementul este strict număr (ignorăm string-uri sau celule goale)
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
export async function getFirst2SelectedNumericColumn() {
  try {
    return await Excel.run(async (context) => {
      // 1. Obținem range-ul selectat de utilizator
      const range = context.workbook.getSelectedRange();

      // 2. Cerem Excel-ului să pregătească proprietatea "values"
      range.load("values");
      await context.sync();

      const values = range.values;
      const numericData = [];
      const numericData2 = [];

      // 3. Dacă nu s-a selectat nimic, ne oprim
      if (!values || values.length === 0) {
        console.warn("Selecția este goală.");
        return [];
      }

      // 4. Parcurgem fiecare rând din selecție
      for (let i = 0; i < values.length; i++) {
        // Luăm mereu elementul de pe indexul 0 (prima coloană a selecției)
        const cellValue = values[i][0];
        const cellValue2 = values[i][1];
        // 5. Verificăm dacă elementul este strict număr (ignorăm string-uri sau celule goale)
        if (typeof cellValue === "number" && !isNaN(cellValue)) {
          numericData.push(cellValue);
        }
        if (typeof cellValue2 === "number" && !isNaN(cellValue2)) {
          numericData2.push(cellValue2);
        }
      }

      console.log("Date extrase (curățate):", numericData);
      return { array1: numericData, array2: numericData2 };
    });
  } catch (error) {
    console.error("A apărut o eroare la extragerea datelor:", error);
    return [];
  }
}
