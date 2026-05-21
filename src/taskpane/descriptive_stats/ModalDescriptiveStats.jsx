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

import { getSelectedNumericColumn, insertColumn } from "@api";
import { calculateDescriptiveStats } from "@utils/math";

import { useLanguage } from "@i18n";
import ActionButton from "../components/ActionButton";
import { AccessTimeFilled, ChevronRightFilled } from "@fluentui/react-icons";

const ModalDescriptiveStats = () => {
  const { t } = useLanguage();

  const [open, setOpen] = useState(false);
  const [adresaX, setAdresaX] = useState("");
  const [adresaY, setAdresaY] = useState("");

  const handleClick = async () => {
    const values = await getSelectedNumericColumn(adresaX);
    const stats = calculateDescriptiveStats(values);

    const dataToWrite = [
      [t("descriptiveStats.n"), stats.n],
      [t("descriptiveStats.mean"), stats.mean],
      [t("descriptiveStats.stdDev"), stats.stdDev],
      [t("descriptiveStats.standardError"), stats.standardError],
      [t("descriptiveStats.confidenceLevel"), stats.confidenceLevel],
      [t("descriptiveStats.lowerBound"), stats.lowerBound],
      [t("descriptiveStats.upperBound"), stats.upperBound],
    ];

    await insertColumn(dataToWrite, adresaY);
  };

  return (
    <div style={{ padding: "20px" }}>
      <Dialog open={open} onOpenChange={(event, data) => setOpen(data.open)}>
        <DialogTrigger disableButtonEnhancement>
          {/* <Button>{t("descriptiveStats.title")}</Button> */}
          <ActionButton
            text={t("descriptiveStats.title")}
            handleClick={() => {}}
            beforeIcon={<AccessTimeFilled style={{ color: "green" }} />}
            afterIcon={<ChevronRightFilled style={{ color: "grey" }} />}
          />
        </DialogTrigger>

        <DialogSurface>
          <DialogBody>
            <DialogTitle>{t("descriptiveStats.title")}</DialogTitle>

            <DialogContent>
              <RangeSelector
                label={t("descriptiveStats.label__x_input")}
                onRangeChanged={setAdresaX}
              />
              <RangeSelector
                label={t("descriptiveStats.label__output")}
                placeholder="Ex: A1"
                onRangeChanged={setAdresaY}
              />
            </DialogContent>

            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary">{t("descriptiveStats.button__cancel")}</Button>
              </DialogTrigger>
              <Button appearance="primary" onClick={handleClick}>
                {t("descriptiveStats.button__submit")}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
};

export default ModalDescriptiveStats;
