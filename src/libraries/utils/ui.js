export const toUINumber = (num) => {
  const number = typeof num === "number" ? num : num.toNumber();

  if (number <= 0.001) return number;

  return Number(number.toFixed(5));
};

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
