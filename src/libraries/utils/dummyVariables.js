export const preprocessDummyVariables = (xData) => {
  const rows = xData.data;
  const meta = xData.meta || [];
  const n = rows.length;
  const k = rows[0].length;

  let newMeta = [];
  let newData = Array(n)
    .fill(0)
    .map(() => []);

  for (let colIndex = 0; colIndex < k; colIndex++) {
    // 1. Verificăm dacă respectiva coloană conține texte (adică e calitativă)
    let isCategorical = false;
    for (let i = 0; i < n; i++) {
      if (typeof rows[i][colIndex] === "string" && isNaN(Number(rows[i][colIndex]))) {
        isCategorical = true;
        break;
      }
    }

    const originalMeta = meta[colIndex] || { name: `D${colIndex + 1}` };

    // 2. Extragem categoriile unice (ex: ["licență", "master"])
    const uniqueCategories = [...new Set(rows.map((row) => row[colIndex]))].sort();

    // 3. Alegem categoria de referință (prima în ordine alfabetică)
    const referenceCategory = uniqueCategories[0];
    const dummyCategories = uniqueCategories.slice(1); // Acestea vor forma cele m-1 variabile

    // 4. Adăugăm meta-datele pentru noile coloane generate
    dummyCategories.forEach((cat) => {
      newMeta.push({
        name: `${originalMeta.name}_${cat}`, // Va genera nume ca "Studii_master" sau "Gen_B"
        isDummy: true, // Flag CRITIC pentru a proteja coloana de logaritmi mai târziu
        unit: originalMeta.unit,
        reference: referenceCategory,
      });
    });

    // 5. Populăm matricea de date cu 1 și 0
    for (let i = 0; i < n; i++) {
      const cellValue = rows[i][colIndex];
      dummyCategories.forEach((cat) => {
        newData[i].push(cellValue === cat ? 1 : 0);
      });
    }
  }

  return { data: newData, meta: newMeta };
};

export const createNewTableRows = (dummyData) => {
  const { data, meta } = dummyData;

  const newHeaders = meta.map((column) => {
    const name = `${column.name} ${column.unit ? `<${column.unit}>` : ""}`;
    return name;
  });
  return [newHeaders, ...data];
};
