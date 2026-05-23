import { applyStyle } from "@utils/excelFormats";
import { splitAndCompleteRawData } from "@utils/ui";

export async function insertColumn(array, positions) {
  try {
    await Excel.run(async (context) => {
      const sheet = context.workbook.worksheets.getActiveWorksheet();
      // const data = standardizeDataToWrite(array);
      const { excelData, formats } = splitAndCompleteRawData(array);

      console.log("!!!!!", { array });
      const numRows = excelData.length;
      const numCols = excelData[0].length;

      const startCell = sheet.getRange(positions).getCell(0, 0);
      const targetRange = startCell.getResizedRange(numRows - 1, numCols - 1);

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

// export async function insertChunkedModels(array3D, positions, extraInterpretation = null) {
//   try {
//     await Excel.run(async (context) => {
//       const sheet = context.workbook.worksheets.getActiveWorksheet();

//       // 1. Împărțim array-ul mare în bucăți (chunks) de câte 2 modele
//       const chunks = [];
//       const chunkSize = 2;
//       for (let i = 0; i < array3D.length; i += chunkSize) {
//         chunks.push(array3D.slice(i, i + chunkSize));
//       }

//       // 2. Regula cerută: extraInterpretation e mereu ultimul și stă singur
//       // Structura dorită: [[1, 2], [3, 4], [5], [extra]]
//       if (extraInterpretation) {
//         chunks.push([extraInterpretation]); // Îl punem ca un chunk separat
//       }

//       // Funcție ajutătoare: calculează lățimea maximă a unui singur model
//       // (ex: pentru [["c"], ["d", "dd"]] returnează 2)
//       const getModelMaxWidth = (model) => {
//         if (!model || model.length === 0) return 0;
//         return Math.max(...model.map((row) => (row ? row.length : 0)));
//       };

//       const finalMatrix = [];

//       // 3. Iterăm prin fiecare grupă (chunk) pentru a le pune "side-by-side"
//       for (const chunk of chunks) {
//         // Câte rânduri are cel mai înalt model din această grupă?
//         const maxRowsInChunk = Math.max(...chunk.map((m) => (m ? m.length : 0)));

//         // Calculăm ce lățime are fiecare model din grupa curentă pentru a alinia corect coloanele
//         const modelWidths = chunk.map((m) => getModelMaxWidth(m));

//         // Construim fiecare rând din grupă
//         for (let r = 0; r < maxRowsInChunk; r++) {
//           const combinedRow = [];

//           for (let mIndex = 0; mIndex < chunk.length; mIndex++) {
//             const model = chunk[mIndex];
//             const modelWidth = modelWidths[mIndex];

//             // Extragem rândul curent. Dacă modelul e mai scurt pe înălțime, luăm un array gol
//             const rowData = model && model[r] ? [...model[r]] : [];

//             // Adăugăm spații ca să păstrăm lățimea constantă a modelului
//             // (astfel "c" se aliniază perfect deasupra lui "d")
//             while (rowData.length < modelWidth) {
//               rowData.push(" ");
//             }

//             combinedRow.push(...rowData);

//             // Adăugăm coloana despărțitoare (spacer) între modelele de pe același rând
//             if (mIndex < chunk.length - 1) {
//               combinedRow.push(" ");
//             }
//           }
//           finalMatrix.push(combinedRow);
//         }
//       }

//       // 4. Acum că totul e formatat vertical/orizontal, facem padding global.
//       // Excel necesită ca FIECARE rând din finalMatrix să aibă fix aceeași lungime.
//       const maxColsGlobal = Math.max(...finalMatrix.map((r) => r.length));

//       const dataToWrite = finalMatrix.map((row) => {
//         const newRow = [...row];
//         while (newRow.length < maxColsGlobal) {
//           newRow.push(" ");
//         }
//         return newRow;
//       });

//       if (dataToWrite.length === 0 || maxColsGlobal === 0) {
//         console.warn("Nu există date de inserat.");
//         return;
//       }

//       // 5. Inserarea directă în Excel dintr-o singură mișcare (Read/Write optimizat)
//       const startCell = sheet.getRange(positions).getCell(0, 0);
//       const targetRange = startCell.getResizedRange(dataToWrite.length - 1, maxColsGlobal - 1);

//       targetRange.values = dataToWrite;
//       targetRange.format.autofitColumns();

//       await context.sync();
//       console.log("Matricea generată corespunde perfect cu exemplul dorit!");
//     });
//   } catch (error) {
//     console.error("Eroare la inserarea matricii:", error);
//   }
// }
