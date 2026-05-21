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
import RangeSelector from "../components/RangeSelector";

import { getColumnStringMatrix, insertColumn } from "@api";
import { preprocessDummyVariables, createNewTableRows } from "@utils/dummyVariables";
import { useLanguage } from "@i18n";
import ActionButton from "../components/ActionButton";
import { TableAddFilled } from "@fluentui/react-icons";
const ModalDummyVariables = () => {
  const { t } = useLanguage();

  const [open, setOpen] = useState(false);
  const [XColumnAdress, setXColumnAddress] = useState("Sheet1!B1:B23");
  const [DColumnAddress, setDColumnAddress] = useState("Sheet1!C1");

  const handleClick = async () => {
    const xData = await getColumnStringMatrix(XColumnAdress);
    const processedDummy = preprocessDummyVariables(xData);
    const newColumns = createNewTableRows(processedDummy);

    console.log({ xData, processedDummy, newColumns });
    await insertColumn(newColumns, DColumnAddress);
  };

  return (
    <div style={{ padding: "20px" }}>
      <Dialog open={open} onOpenChange={(_, data) => setOpen(data.open)}>
        <DialogTrigger disableButtonEnhancement>
          <ActionButton
            text={t("dummyVariables.title")}
            beforeIcon={<TableAddFilled style={{ color: "green" }} />}
            textAlign="left"
          />
        </DialogTrigger>

        <DialogSurface>
          <DialogBody>
            <DialogTitle>{t("dummyVariables.title")}</DialogTitle>

            <DialogContent style={{ width: "100%", gap: "12px" }}>
              <RangeSelector
                label={t("dummyVariables.label__x_input")}
                onRangeChanged={setXColumnAddress}
                value={XColumnAdress}
              />

              <RangeSelector
                label={t("dummyVariables.label__d_output")}
                placeholder="Ex: A1"
                onRangeChanged={setDColumnAddress}
                value={DColumnAddress}
              />
            </DialogContent>

            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary">{t("dummyVariables.button__cancel")}</Button>
              </DialogTrigger>
              <Button appearance="primary" onClick={handleClick}>
                {t("dummyVariables.button__submit")}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
};

export default ModalDummyVariables;
