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
  Combobox,
  Option,
  makeStyles,
} from "@fluentui/react-components";
import RangeSelector from "../components/RangeSelector";

import { getColumnMatrix, insertColumn } from "@api";
import { calculateRegression } from "@utils/math";
import { generateSummaryOutput } from "@utils/summaryOutput";

import { useLanguage } from "@i18n";
import { interpretationRegression } from "@utils/econometrics";

const MODEL_TYPES = [
  { key: "linear", label: "Linear" },
  { key: "log-linear", label: "Log-Linear" },
  { key: "semi-log", label: "Semi-Log" },
  { key: "lin-log", label: "Lin-Log" },
];

const ModalSimpleRegression = () => {
  const { t } = useLanguage();

  const [open, setOpen] = useState(false);
  const [YColumnAdress, setYColumnAddress] = useState("Sheet5!A1:A10");
  const [XColumnAdress, setXColumnAddress] = useState("Sheet5!D1:F10");
  const [resultDestinationAddress, setResultDestinationAddress] = useState("Sheet5!A15");
  const [onlyValues, setOnlyValues] = useState(true);
  const [modelType, setModelType] = useState("Linear");
  const [alpha, setAlpha] = useState(0.05);

  console.log("Model type selected:", modelType);
  const handleCheckboxChange = (_, data) => {
    setOnlyValues(data.checked);
  };

  const handleClick = async () => {
    const xData = await getColumnMatrix(XColumnAdress);

    const yData = await getColumnMatrix(YColumnAdress);

    const modelTypeKey = MODEL_TYPES.find((type) => type.label === modelType)?.key || "linear";
    const stats = calculateRegression(yData, xData, modelTypeKey);
    const interpretation = onlyValues
      ? null
      : interpretationRegression(stats, alpha, yData.meta, xData.meta, t);
    const dataToWrite = generateSummaryOutput(
      { interpretation, ...stats },
      yData.meta,
      xData.meta,
      t
    );

    await insertColumn(dataToWrite, resultDestinationAddress);
  };

  return (
    <div style={{ padding: "20px" }}>
      <Dialog open={open} onOpenChange={(_, data) => setOpen(data.open)}>
        <DialogTrigger disableButtonEnhancement>
          <Button>{t("regression.title")}</Button>
        </DialogTrigger>

        <DialogSurface>
          <DialogBody>
            <DialogTitle>{t("regression.title")}</DialogTitle>

            <DialogContent style={{ width: "100%", gap: "12px" }}>
              <RangeSelector
                label={t("regression.label__y_input")}
                onRangeChanged={setYColumnAddress}
                value={YColumnAdress}
              />
              <RangeSelector
                label={t("regression.label__x_input")}
                onRangeChanged={setXColumnAddress}
                value={XColumnAdress}
              />
              <RangeSelector
                label={t("regression.label__output")}
                placeholder="Ex: A1"
                onRangeChanged={setResultDestinationAddress}
                value={resultDestinationAddress}
              />
              <p>{t("regression.label__extra_options")}</p>
              <Checkbox
                label={t("regression.checkbox__only_values")}
                checked={onlyValues}
                onChange={handleCheckboxChange}
              />

              <Field label={t("regression.combobox__model_type.label")} style={{ flex: "1" }}>
                <Combobox
                  placeholder={t("regression.combobox__model_type.placeholder")}
                  value={modelType}
                  onOptionSelect={(_, data) => setModelType(data.optionValue || "")}
                >
                  {MODEL_TYPES.map((type) => (
                    <Option key={type.key} value={type.label}>
                      {type.label}
                    </Option>
                  ))}
                </Combobox>
              </Field>
              <Field label={t("regression.input__alpha.label")} style={{ flex: "1" }}>
                <Input
                  value={alpha}
                  onChange={(_, data) => setAlpha(data.value)}
                  placeholder={t("regression.input__alpha.placeholder")}
                />
              </Field>
            </DialogContent>

            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary">{t("regression.button__cancel")}</Button>
              </DialogTrigger>
              <Button appearance="primary" onClick={handleClick}>
                {t("regression.button__submit")}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
};

export default ModalSimpleRegression;
