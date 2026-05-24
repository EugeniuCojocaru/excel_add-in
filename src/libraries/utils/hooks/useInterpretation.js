import { useSettings } from "../../../taskpane/context/SettingsContext";

const useInterpretation = () => {
  const { interpretation } = useSettings();
  const mode = interpretation;
  const isStudent = mode === "STUDENT";
  const isCompact = mode === "COMPACT";

  const fillFor = (uiStat) => {
    if (!isStudent || !uiStat?.color) return null;
    return { fill: { color: uiStat.color } };
  };

  return { mode, isStudent, isCompact, fillFor };
};

export default useInterpretation;
