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
import RangeSelector from "./RangeSelector";

import { getColumnMatrix, getSelectedNumericColumn, insertColumn } from "../api";
import { calculateRegression } from "../../utils/math";
import { generateSummaryOutput } from "../../utils/summaryOutput";

const ModalSimpleRegression = () => {
  const [open, setOpen] = React.useState(false);
  const [YColumnAdress, setYColumnAddress] = useState("Sheet3!B2:B11");
  const [XColumnAdress, setXColumnAddress] = useState("Sheet3!A2:A11");
  const [resultDestinationAddress, setResultDestinationAddress] = useState("Sheet3!D1");
  const [onlyValues, setOnlyValues] = useState(false);

  const handleCheckboxChange = (event, data) => {
    setOnlyValues(data.checked);
  };
  const handleClick = async () => {
    const xData = await getColumnMatrix(XColumnAdress);
    console.log("Valorile numerice extrase din prima coloană selectată:", xData);
    const yData = await getSelectedNumericColumn(YColumnAdress);
    console.log("Valorile numerice extrase din a doua coloană selectată:", yData);
    const stats = calculateRegression(yData, xData, 0.05, onlyValues);
    console.log("Indicatorii calculați:", stats);

    const dataToWrite = generateSummaryOutput(stats);
    console.log("Data to write to Excel:", dataToWrite);
    await insertColumn(dataToWrite, resultDestinationAddress);
  };

  return (
    <div style={{ padding: "20px" }}>
      <Dialog open={open} onOpenChange={(event, data) => setOpen(data.open)}>
        <DialogTrigger disableButtonEnhancement>
          <Button>Regresie</Button>
        </DialogTrigger>

        <DialogSurface>
          <DialogBody>
            <DialogTitle>Regresie</DialogTitle>

            <DialogContent>
              <RangeSelector
                label="Selectează Variabila Y:"
                onRangeChanged={setYColumnAddress}
                value={YColumnAdress}
              />
              <RangeSelector
                label="Selectează Variabila X:"
                onRangeChanged={setXColumnAddress}
                value={XColumnAdress}
              />
              <RangeSelector
                label="Selectează unde sa inserez raspunsul:"
                placeholder="Ex: A1"
                onRangeChanged={setResultDestinationAddress}
                value={resultDestinationAddress}
              />
              <Checkbox
                label="Vreau doar valorile calculate"
                checked={onlyValues}
                onChange={handleCheckboxChange}
              />
            </DialogContent>

            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary">Închide</Button>
              </DialogTrigger>
              <Button appearance="primary" onClick={handleClick}>
                Inserează în Tabel
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
};

export default ModalSimpleRegression;
