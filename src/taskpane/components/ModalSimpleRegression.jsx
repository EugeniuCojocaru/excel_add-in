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
} from "@fluentui/react-components";
import RangeSelector from "./RangeSelector";

import { getSelectedNumericColumn, insertColumn } from "../api";
import { calculateSimpleRegression } from "../../utils/math";

const ModalSimpleRegression = () => {
  const [open, setOpen] = React.useState(false);
  const [adresaX, setAdresaX] = useState("");
  const [adresaY, setAdresaY] = useState("");
  const [adresaZ, setAdresaZ] = useState("");

  const handleClick = async () => {
    const xData = await getSelectedNumericColumn(adresaX);
    console.log("Valorile numerice extrase din prima coloană selectată:", xData);
    const yData = await getSelectedNumericColumn(adresaY);
    console.log("Valorile numerice extrase din a doua coloană selectată:", yData);
    const stats = calculateSimpleRegression(xData, yData);
    console.log("Indicatorii calculați:", stats);

    const dataToWrite = [
      ["Intercept:", stats.intercept],
      ["Panta (slope):", stats.slope],
      ["R²:", stats.rSquared],
      ["Eroarea Standard a Estimării (ESE)", stats.ese],
      ["eroarea standard a parametrului b1 (sb1)", stats.sb1],
      ["Statistica t pentru b1:", stats.tStat],
      ["P-valoarea pentru b1:", stats.pValue],
      ["Este semnificativ la nivelul de 0.05?", stats.isSignificant],
    ];
    console.log("Data to write to Excel:", dataToWrite);
    await insertColumn(dataToWrite, adresaZ);
  };

  return (
    <div style={{ padding: "20px" }}>
      <Dialog open={open} onOpenChange={(event, data) => setOpen(data.open)}>
        <DialogTrigger disableButtonEnhancement>
          <Button>Regresie simpla</Button>
        </DialogTrigger>

        <DialogSurface>
          <DialogBody>
            <DialogTitle>Regresie simpla</DialogTitle>

            <DialogContent>
              <RangeSelector label="Selectează Variabila X:" onRangeChanged={setAdresaX} />
              <RangeSelector label="Selectează Variabila Y:" onRangeChanged={setAdresaY} />
              <RangeSelector
                label="Selectează unde sa inserez raspunsul:"
                placeholder="Ex: A1"
                onRangeChanged={setAdresaZ}
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
