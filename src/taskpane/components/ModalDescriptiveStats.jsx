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

const ModalDescriptiveStats = () => {
  const [open, setOpen] = React.useState(false);

  return (
    <div style={{ padding: "20px", height: "100vh" }}>
      <Dialog open={open} onOpenChange={(event, data) => setOpen(data.open)}>
        <DialogTrigger disableButtonEnhancement>
          <Button>Open dialog</Button>
        </DialogTrigger>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Rezultate Regresie Liniară</DialogTitle>

            <DialogContent>
              <p>Aici poți afișa rezultatele pe care le-ai calculat anterior:</p>
              <ul>
                <li>
                  <strong>R² (Acuratețe):</strong> 96.20%
                </li>
                <li>
                  <strong>Panta (b1):</strong> 0.51
                </li>
                <li>
                  <strong>Intercept (b0):</strong> 24.45
                </li>
              </ul>
              <p>
                Verdict: <em>Variabila X influențează semnificativ variabila Y.</em>
              </p>
            </DialogContent>

            <DialogActions>
              {/* DialogTrigger închide automat fereastra când se dă click pe elementul din interior */}
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary">Închide</Button>
              </DialogTrigger>
              <Button appearance="primary" onClick={() => console.log("Inserează în Excel...")}>
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
