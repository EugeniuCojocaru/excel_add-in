import { standardizeDataToWrite } from "@utils/ui";
export async function insertColumn(array, positions) {
  try {
    await Excel.run(async (context) => {
      console.log({ array });
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

// export async function insertMatrix(array, positions, extraInterpretation = null) {
//   try {
//     await Excel.run(async (context) => {
//       const sheet = context.workbook.worksheets.getActiveWorksheet();
//       console.log({ extraInterpretation });
//       // 1. Chunk the array into sub-arrays of size 2
//       const chunkedArray = [];
//       const chunkSize = 2;

//       for (let i = 0; i < array.length; i++) {
//         if (chunkedArray[i]) {
//           chunkedArray[i].push("");
//           array[i].forEach((row) => {
//             chunkedArray[i].concat(row);
//           });
//         } else {
//           chunkedArray.push([...array[i]]);
//         }
//         chunkedArray.push(array.slice(i, i + chunkSize));
//       }

//       // 2. Append the optional extraInterpretation at the end
//       // if (extraInterpretation !== null && extraInterpretation !== undefined) {
//       //   chunkedArray.push([extraInterpretation]);
//       // }

//       console.log({ chunkedArray });
//       // 3. Standardize the data
//       // This ensures that rows like [5] or [extra] become [5, ""] and [extra, ""]
//       // because Excel requires a perfectly rectangular matrix to write data.
//       const data = standardizeDataToWrite(chunkedArray);

//       const numRows = data.length;
//       const numCols = numRows > 0 ? data[0].length : 0;

//       if (numRows === 0 || numCols === 0) {
//         console.warn("Nu există date de inserat.");
//         return;
//       }

//       const startCell = sheet.getRange(positions).getCell(0, 0);
//       const targetRange = startCell.getResizedRange(numRows - 1, numCols - 1);

//       targetRange.values = data;
//       targetRange.format.autofitColumns();

//       await context.sync();
//       console.log("Datele au fost grupate și inserate cu succes în tabel.");
//     });
//   } catch (error) {
//     console.error("Eroare la inserarea datelor în Excel:", error);
//   }
// }
