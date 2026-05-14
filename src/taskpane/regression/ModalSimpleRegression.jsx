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
} from "@fluentui/react-components";
import RangeSelector from "../components/RangeSelector";

import { getColumnMatrix, insertColumn } from "@api";
import { calculateRegression } from "@utils/math";
import { generateSummaryOutput } from "@utils/summaryOutput";

import { useLanguage } from "@i18n";

const ModalSimpleRegression = () => {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [YColumnAdress, setYColumnAddress] = useState("Sheet1!B1:B23");
  const [XColumnAdress, setXColumnAddress] = useState("Sheet1!C1:D23");
  const [resultDestinationAddress, setResultDestinationAddress] = useState("Sheet1!H1");
  const [onlyValues, setOnlyValues] = useState(true);

  const handleCheckboxChange = (event, data) => {
    setOnlyValues(data.checked);
  };
  const handleClick = async () => {
    const xData = await getColumnMatrix(XColumnAdress);

    const yData = await getColumnMatrix(YColumnAdress);

    const stats = calculateRegression(yData, xData, 0.05, onlyValues, t);

    const dataToWrite = generateSummaryOutput(stats);

    await insertColumn(dataToWrite, resultDestinationAddress);
  };

  return (
    <div style={{ padding: "20px" }}>
      <Dialog open={open} onOpenChange={(event, data) => setOpen(data.open)}>
        <DialogTrigger disableButtonEnhancement>
          <Button>{t("regression.title")}</Button>
        </DialogTrigger>

        <DialogSurface>
          <DialogBody>
            <DialogTitle>{t("regression.title")}</DialogTitle>

            <DialogContent>
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
              <Checkbox
                label={t("regression.checkbox__only_values")}
                checked={onlyValues}
                onChange={handleCheckboxChange}
              />
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
