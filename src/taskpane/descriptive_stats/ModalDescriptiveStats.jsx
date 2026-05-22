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
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import RangeSelector from "../components/RangeSelector";

import { getSelectedNumericColumn, insertColumn } from "@api";
import { calculateDescriptiveStats } from "@utils/math";

import { useLanguage } from "@i18n";
import ActionButton from "../components/ActionButton";
import { CalculatorRegular } from "@fluentui/react-icons";

const useStyles = makeStyles({
  surface: {
    padding: "8px",
  },
  body: {
    padding: "0",
    gap: "0",
  },
  header: {
    padding: "12px 8px",
    margin: "0",
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  content: {
    padding: "16px 8px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  footer: {
    padding: "12px 8px",
    borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
  },
});

const ModalDescriptiveStats = () => {
  const styles = useStyles();
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
    <Dialog open={open} onOpenChange={(_, data) => setOpen(data.open)}>
      <DialogTrigger disableButtonEnhancement>
        <ActionButton
          text={t("descriptiveStats.title")}
          beforeIcon={<CalculatorRegular style={{ color: "green" }} />}
          textAlign="left"
        />
      </DialogTrigger>

      <DialogSurface className={styles.surface}>
        <DialogBody className={styles.body}>
          <DialogTitle className={styles.header}>{t("descriptiveStats.title")}</DialogTitle>

          <DialogContent className={styles.content}>
            <RangeSelector
              label={t("descriptiveStats.label__x_input")}
              onRangeChanged={setAdresaX}
              size="large"
            />
            <RangeSelector
              label={t("descriptiveStats.label__output")}
              placeholder="Ex: A1"
              onRangeChanged={setAdresaY}
              size="large"
              input={false}
            />
          </DialogContent>

          <DialogActions className={styles.footer}>
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
  );
};

export default ModalDescriptiveStats;
