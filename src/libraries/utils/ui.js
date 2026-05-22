export const standardizeDataToWrite = (array) => {
  let max = array[0].length;

  array.forEach((row) => {
    if (row.length > max) max = row.length;
  });

  const finishedData = array.map((row) => {
    const diff = max - row.length;
    if (diff !== 0) row.push(...Array(diff).fill(""));
    return row;
  });
  console.log(finishedData);
  return finishedData;
};
