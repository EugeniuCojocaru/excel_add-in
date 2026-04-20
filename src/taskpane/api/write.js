export async function insertStatsToExcel(stats) {
  try {
    await Excel.run(async (context) => {
      const sheet = context.workbook.worksheets.getActiveWorksheet();

      // Pregătim datele sub formă de tablou bidimensional pentru o coloană: [[val1], [val2], ...]
      // Această structură corespunde formulelor de calcul pentru intervalele de încredere[cite: 141].
      const valuesToInsert = [
        [stats.n], // D1
        [stats.mean], // D2
        [stats.stdDev], // D3
        [stats.standardError], // D4
        [stats.confidenceLevel], // D5
        [stats.lowerBound], // D6: mean - confidenceLevel [cite: 141]
        [stats.upperBound], // D7: mean + confidenceLevel [cite: 141]
      ];

      // Definim intervalul de destinație în coloana D (de la rândul 1 la 7)
      const range = sheet.getRange("D1:D7");

      // Inserăm valorile
      range.values = valuesToInsert;

      // Opțional: Putem adăuga etichete în coloana C pentru claritate
      const labels = [
        ["Volum eșantion (n):"],
        ["Media (mean):"],
        ["Abaterea standard (stdDev):"],
        ["Eroarea standard:"],
        ["Nivel încredere (95%):"],
        ["Limita inferioară:"],
        ["Limita superioară:"],
      ];
      sheet.getRange("C1:C7").values = labels;

      await context.sync();
      console.log("Datele au fost inserate cu succes în tabel.");
    });
  } catch (error) {
    console.error("Eroare la inserarea datelor în Excel:", error);
  }
}
