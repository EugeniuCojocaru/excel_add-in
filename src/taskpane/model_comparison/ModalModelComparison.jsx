import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Button,
  Checkbox,
  Field,
  Input,
} from "@fluentui/react-components";
import RangeSelector from "../components/RangeSelector";

import { getColumnMatrix, insertColumn } from "@api";
import { calculateRegression } from "@utils/math";
import { generateSummaryOutput } from "@utils/summaryOutput";

import { useLanguage } from "@i18n";
import { interpretationRegression } from "@utils/econometrics";
import ComboboxTags from "../components/ComboboxTags";
import { COMPARISSON_INTERPRETATION } from "@utils/interpretation";
const MODEL_TYPES = [
  { key: "linear", label: "Linear" },
  { key: "log-linear", label: "Log-Linear" },
  { key: "semi-log", label: "Semi-Log" },
  { key: "lin-log", label: "Lin-Log" },
];

const ModalModelComparison = () => {
  const { t } = useLanguage();

  const [open, setOpen] = useState(false);
  const [YColumnAdress, setYColumnAddress] = useState("Sheet1!A1:A23");
  const [XColumnAdress, setXColumnAddress] = useState("Sheet1!B1:B23");
  const [resultDestinationAddress, setResultDestinationAddress] = useState("Sheet1!H1");
  const [alpha, setAlpha] = useState(0.05);
  const [onlyValues, setOnlyValues] = useState(true);
  const [modelKeys, setModelKeys] = useState([]);

  const handleCheckboxChange = (_, data) => {
    setOnlyValues(data.checked);
  };
  const handleClick = async () => {
    const xData = await getColumnMatrix(XColumnAdress);
    const yData = await getColumnMatrix(YColumnAdress);
    let interpretation = [];
    if (modelKeys.length < 2) {
      interpretation.push("Selectează cel puțin două tipuri de model pentru comparație");
      return;
    }
    const stats = modelKeys.map((modelKey) => {
      const stats = calculateRegression(yData, xData, modelKey);
      //   const modelInterpretation = onlyValues
      //     ? null
      //     : interpretationRegression(stats, alpha, yData.meta, xData.meta, modelKey, t);

      return { ...stats, modelKey, interpretation: null };
    });

    console.log({ stats });
    // const stats = calculateRegression(yData, xData, modelTypeKey);
    const comparation = COMPARISSON_INTERPRETATION.comparisonInterpretation(stats, t);
    // const interpretation = onlyValues
    //   ? null
    //   : interpretationRegression(stats, alpha, yData.meta, xData.meta, modelTypeKey, t);

    // const dataToWrite = generateSummaryOutput(
    //   { interpretation, ...stats },
    //   yData.meta,
    //   xData.meta,
    //   t
    // );
console.log({comparation})
    await insertColumn(comparation, resultDestinationAddress);
  };

  return (
    <div style={{ padding: "20px" }}>
      <Dialog open={open} onOpenChange={(_, data) => setOpen(data.open)}>
        <DialogTrigger disableButtonEnhancement>
          <Button>{t("modelComparison.title")}</Button>
        </DialogTrigger>

        <DialogSurface>
          <DialogBody>
            <DialogTitle>{t("modelComparison.title")}</DialogTitle>

            <DialogContent style={{ width: "100%", gap: "12px" }}>
              <RangeSelector
                label={t("modelComparison.label__y_input")}
                onRangeChanged={setYColumnAddress}
                value={YColumnAdress}
              />
              <RangeSelector
                label={t("modelComparison.label__x_input")}
                onRangeChanged={setXColumnAddress}
                value={XColumnAdress}
              />
              <RangeSelector
                label={t("modelComparison.label__output")}
                placeholder="Ex: A1"
                onRangeChanged={setResultDestinationAddress}
                value={resultDestinationAddress}
              />

              <Field label={t("modelComparison.input__alpha.label")} style={{ flex: "1" }}>
                <Input
                  value={alpha}
                  onChange={(_, data) => setAlpha(data.value)}
                  placeholder={t("modelComparison.input__alpha.placeholder")}
                />
              </Field>
              <ComboboxTags data={MODEL_TYPES} value={modelKeys} setValue={setModelKeys} />
              <Checkbox
                label={t("regression.checkbox__only_values")}
                checked={onlyValues}
                onChange={handleCheckboxChange}
              />
            </DialogContent>

            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary">{t("modelComparison.button__cancel")}</Button>
              </DialogTrigger>
              <Button appearance="primary" onClick={handleClick}>
                {t("modelComparison.button__submit")}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
};

export default ModalModelComparison;
