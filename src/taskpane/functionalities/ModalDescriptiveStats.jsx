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

import { getColumnMatrix, insertColumn, insertColumnTo, toUIData } from "@excel";
import { descriptiveStats } from "@math/use_cases/descriptive_stats";
import { usePrecision, useInterpretation } from "../hooks";

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
    borderTopColor: tokens.colorNeutralStrokeAccessible,
    borderRightColor: tokens.colorNeutralStrokeAccessible,
    borderBottomColor: tokens.colorNeutralStrokeAccessible,
    borderLeftColor: tokens.colorNeutralStrokeAccessible,
    ":hover": {
      borderTopColor: tokens.colorNeutralStrokeAccessible,
      borderRightColor: tokens.colorNeutralStrokeAccessible,
      borderBottomColor: tokens.colorNeutralStrokeAccessible,
      borderLeftColor: tokens.colorNeutralStrokeAccessible,
    },
  },
  beforeIcon: {
    color: tokens.colorBrandForeground1,
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
  const { data, meta } = columnMatrix;

  const columns = Array.from({ length: data[0].length }, (_, j) => {
    const { name, unit } = meta[j] ?? { name: `X${j + 1}`, unit: null };
    return {
      header: unit ? `${name} <${unit}>` : name,
      stats: descriptiveStats(data.map((row) => row[j]), 0.05, { toUINumber }),
    };
  });

  const headerRow = ["", ...columns.map((c) => c.header)];
  const statRows = STAT_FIELDS.map((field, i) => [statLabels[i], ...columns.map((c) => c.stats[field])]);

  return [headerRow, ...statRows];
};

const ModalDescriptiveStats = () => {
  const styles = useStyles();
  const { t } = useLanguage();
  const { toUINumber } = usePrecision();
  const { isCompact } = useInterpretation();

  const [open, setOpen] = useState(false);
  const [adresaX, setAdresaX] = useState("");
  const [adresaY, setAdresaY] = useState("");

  const handleClick = async () => {
    const columnMatrix = await getColumnMatrix(adresaX);
    if (!columnMatrix?.data?.length) return;

    const statLabels = STAT_FIELDS.map((key) => t(`descriptiveStats.${key}`));
    const rows = buildDescriptiveStatsMatrix(columnMatrix, statLabels, toUINumber);
    const dataToWrite = {
      maxColumns: Math.max(...rows.map((r) => r.length)),
      dataToWrite: rows.map((row) => toUIData(row)),
    };

    if (isCompact) {
      await insertColumnTo(dataToWrite, "Discussion", "A1");
    } else {
      await insertColumn(dataToWrite, adresaY);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(_, data) => setOpen(data.open)}>
      <DialogTrigger disableButtonEnhancement>
        <ActionButton
          text={t("descriptiveStats.title")}
          beforeIcon={<CalculatorRegular className={styles.beforeIcon} />}
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
              placeholder={isCompact ? t("regression.label__output_compact_disabled") : "Ex: A1"}
              onRangeChanged={setAdresaY}
              value={isCompact ? "" : adresaY}
              size="large"
              input={false}
              disabled={isCompact}
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
