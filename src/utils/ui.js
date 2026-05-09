export const toUINumber = (num) => {
  const number = typeof num === "number" ? num : num.toNumber();

  if (number <= 0.001) return number;

  return Number(number.toFixed(5));
};
