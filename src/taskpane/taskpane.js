/* global Excel console */

export async function insertText(text) {
  // Write text to the top left cell.
  try {
    await Excel.run(async (context) => {
      const sheet = context.workbook.worksheets.getActiveWorksheet();
      const range = sheet.getRange("A1");
      range.values = [[text]];
      range.format.autofitColumns();
      await context.sync();
    });
  } catch (error) {
    console.log("Error: " + error);
  }
}

/**
 * Extrage datele din selecția curentă și le afișează în consolă.
 * Utila pentru a verifica "Datele colectate" (ex: angajați, vânzări)[cite: 23, 24].
 */
export async function logSelectedData() {
  try {
    await Excel.run(async (context) => {
      // 1. Obținem range-ul selectat de utilizator
      const range = context.workbook.getSelectedRange();

      // 2. Încărcăm proprietatea 'values' pentru a avea acces la date
      // Excel.js lucrează asincron, deci trebuie să specificăm ce proprietăți vrem să 'citim'
      range.load("values");

      // 3. Sincronizăm starea dintre script și Excel
      await context.sync();

      // 4. Datele sunt returnate ca un tablou bidimensional (2D Array): [[rand1_col1, rand1_col2], [rand2_col1...]]
      const values = range.values;

      if (values.length > 0) {
        console.log("--- DATE SELECTATE DIN EXCEL ---");
        console.log("Număr rânduri:", values.length);
        console.log("Date brute (2D Array):", values);

        // Afișăm sub formă de tabel pentru o vizibilitate mai bună (ideal pe Mac Inspect Element)
        console.table(values);
      } else {
        console.log("Nicio dată selectată sau celulele sunt goale.");
      }
    });
  } catch (error) {
    console.error("Eroare la citirea datelor din Excel:", error);
  }
}

/**
 * Citește selecția din Excel, ia prima coloană și returnează doar valorile numerice.
 * @returns {Promise<number[]>} Un array 1D cu numerele extrase.
 */
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
    return []; // Returnăm un array gol ca măsură de siguranță (fallback)
  }
}
