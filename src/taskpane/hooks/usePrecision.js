import { useSettings } from "../context/SettingsContext";

const usePrecision = () => {
  const { decimals } = useSettings();

  const toUINumber = (num) => {
    const number = typeof num === "number" ? num : num.toNumber();
    if (Math.abs(number) < 0.001) return number;
    return Number(number.toFixed(decimals));
  };

  return { toUINumber };
};

export default usePrecision;
