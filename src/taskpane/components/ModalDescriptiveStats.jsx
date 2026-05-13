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
import { calculateDescriptiveStats } from "@utils/math";

import { useLanguage } from "@i18n";

const ModalDescriptiveStats = () => {
  const { t } = useLanguage();

  const [open, setOpen] = useState(false);
  const [adresaX, setAdresaX] = useState("");
  const [adresaY, setAdresaY] = useState("");

  const handleClick = async () => {
    const values = await getSelectedNumericColumn(adresaX);
    console.log("Valorile numerice extrase din prima coloană selectată:", values);
    const stats = calculateDescriptiveStats(values);
    console.log("Indicatorii calculați:", stats);

    const dataToWrite = [
      ["Volum eșantion (n):", stats.n],
      ["Media (mean):", stats.mean],
      ["Abaterea standard (stdDev):", stats.stdDev],
      ["Eroarea standard:", stats.standardError],
      ["Nivel încredere (95%):", stats.confidenceLevel],
      ["Limita inferioară:", stats.lowerBound],
      ["Limita superioară:", stats.upperBound],
    ];
    console.log("Data to write to Excel:", dataToWrite);
    await insertColumn(dataToWrite, adresaY);
  };

  return (
    <div style={{ padding: "20px" }}>
      <Dialog open={open} onOpenChange={(event, data) => setOpen(data.open)}>
        <DialogTrigger disableButtonEnhancement>
          <Button>Statistici descriptive</Button>
        </DialogTrigger>

        <DialogSurface>
          <DialogBody>
            <DialogTitle>Statistici descriptive</DialogTitle>

            <DialogContent>
              <RangeSelector label="Selectează Variabila X (Venit):" onRangeChanged={setAdresaX} />
              <RangeSelector
                label="Selectează unde sa inserez raspunsul:"
                placeholder="Ex: A1"
                onRangeChanged={setAdresaY}
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

export default ModalDescriptiveStats;
