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

import { getColumnMatrix, insertColumn } from "@api";
import { calculateDescriptiveStats } from "@utils/math";
import usePrecision from "@utils/hooks/usePrecision";

import { useLanguage } from "@i18n";
import ActionButton from "../components/ActionButton";
import { CalculatorRegular } from "@fluentui/react-icons";

const useStyles = makeStyles({
  surface: {
    padding: "8px",
  },
  body: {
    display: "flex",
    flexDirection: "column",
    padding: "0",
    gap: "0",
  },
  header: {
    padding: "12px 8px",
    margin: "0",
    borderBottom: `1px solid ${tokens.colorNeutralStroke3}`,
  },
  content: {
    padding: "16px 8px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  footer: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 8px",
    borderTop: `1px solid ${tokens.colorNeutralStroke3}`,
    display: "flex",
    justifyContent: "flex-end",
  },
  cancelButton: {
    borderColor: tokens.colorNeutralStrokeAccessible,
    ":hover": {
      borderColor: tokens.colorNeutralStrokeAccessible,
    },
  },
});

const STAT_FIELDS = [
  "n",
  "mean",
  "stdDev",
  "standardError",
  "confidenceLevel",
  "lowerBound",
  "upperBound",
];

export const buildDescriptiveStatsMatrix = (columnMatrix, statLabels, toUINumber) => {
  const k = columnMatrix.data[0].length;
  const meta = columnMatrix.meta;

  const allStats = Array.from({ length: k }, (_, j) => {
    const colValues = columnMatrix.data.map((row) => row[j]);
    return calculateDescriptiveStats(colValues);
  });

  const headerRow = [
    "",
    ...Array.from({ length: k }, (_, j) => {
      const { name, unit } = meta[j] ?? { name: `X${j + 1}`, unit: null };
      return unit ? `${name} <${unit}>` : name;
    }),
  ];

  const statRows = STAT_FIELDS.map((field, i) => [
    statLabels[i],
    ...allStats.map((s) => (field === "n" ? s[field] : toUINumber(s[field]))),
  ]);

  return [headerRow, ...statRows];
};

const ModalDescriptiveStats = () => {
  const styles = useStyles();
  const { t } = useLanguage();
  const { toUINumber } = usePrecision();

  const [open, setOpen] = useState(false);
  const [adresaX, setAdresaX] = useState("");
  const [adresaY, setAdresaY] = useState("");

  const handleClick = async () => {
    const columnMatrix = await getColumnMatrix(adresaX);
    if (!columnMatrix?.data?.length) return;

    const statLabels = STAT_FIELDS.map((key) => t(`descriptiveStats.${key}`));
    const dataToWrite = buildDescriptiveStatsMatrix(columnMatrix, statLabels, toUINumber);

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
              <Button appearance="secondary" className={styles.cancelButton}>
                {t("descriptiveStats.button__cancel")}
              </Button>
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
