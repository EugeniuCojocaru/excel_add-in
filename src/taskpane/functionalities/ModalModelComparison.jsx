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
  Field,
  Input,
  Switch,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import RangeSelector from "../components/RangeSelector";

import { getColumnMatrix, insertColumn, insertColumnTo, toUIData, EXCEL_FORMATS, buildRawDataGrid } from "@excel";
import { regression } from "@math/use_cases/regression";
import { usePrecision, useInterpretation } from "../hooks";
import { toUIStats } from "@econometrics";
import { generateSummaryOutput } from "@econometrics/use_cases/summary_output";

import { useLanguage } from "@i18n";
import { interpretationRegression } from "@econometrics/use_cases/regression_interpretation";
import ComboboxTags from "../components/ComboboxTags";
import { comparisonInterpretation } from "@econometrics/use_cases/model_comparison";
import ActionButton from "../components/ActionButton";
import { ScalesFilled } from "@fluentui/react-icons";
import { MODEL_TYPES } from "@constants/model_types";

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
  optionsRow: {
    display: "flex",
    gap: "8px",
    alignItems: "flex-end",
  },
  comboboxField: {
    flex: "2",
  },
  alphaField: {
    flex: "1",
  },
  switchRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  switchLabel: {
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground1,
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

const ModalModelComparison = () => {
  const styles = useStyles();
  const { t } = useLanguage();
  const { toUINumber } = usePrecision();
  const { mode, isCompact, fillFor } = useInterpretation();

  const [open, setOpen] = useState(false);
  const [YColumnAdress, setYColumnAddress] = useState("Sheet1!A1:A23");
  const [XColumnAdress, setXColumnAddress] = useState("Sheet1!B1:B23");
  const [resultDestinationAddress, setResultDestinationAddress] = useState("Sheet1!D1");
  const [alpha, setAlpha] = useState(0.05);
  const [econometricInterpretation, setEconometricInterpretation] = useState(false);
  const [modelKeys, setModelKeys] = useState([]);

  const handleClick = async () => {
    const xData = await getColumnMatrix(XColumnAdress);
    const yData = await getColumnMatrix(YColumnAdress);

    if (modelKeys.length < 2) return;

    const rawStatsArray = modelKeys.map((modelKey) =>
      regression(yData, xData, alpha, modelKey, { toUINumber })
    );

    const comparationRawData = comparisonInterpretation(rawStatsArray, t, mode);

    const modelRawDataArray = rawStatsArray.map((rawStats) => {
      const uiStats = toUIStats(rawStats);
      const modelInterpretation = econometricInterpretation
        ? interpretationRegression(uiStats, parseFloat(alpha), yData.meta, xData.meta, t, {
            mode,
            fillFor,
          })
        : null;
      return generateSummaryOutput(
        { ...uiStats, interpretation: modelInterpretation },
        yData.meta,
        xData.meta,
        t,
        { mode, fillFor, extended: econometricInterpretation }
      );
    });

    const separator = {
      maxColumns: 1,
      dataToWrite: [
        toUIData([""]),
        toUIData([""], [{ ...EXCEL_FORMATS.sectionDivider, fullWidth: true }]),
      ],
    };
    const modelsGrid = buildRawDataGrid(modelRawDataArray, { columns: 2 });

    const merged = [comparationRawData, separator, modelsGrid].reduce(
      (acc, rd) => ({
        maxColumns: Math.max(acc.maxColumns, rd.maxColumns),
        dataToWrite: [...acc.dataToWrite, ...rd.dataToWrite],
      }),
      { maxColumns: 0, dataToWrite: [] }
    );

    if (isCompact) {
      await insertColumnTo(merged, "Discussion_Comparison", "A1");
    } else {
      await insertColumn(merged, resultDestinationAddress);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(_, data) => setOpen(data.open)}>
      <DialogTrigger disableButtonEnhancement>
        <ActionButton
          text={t("modelComparison.title")}
          beforeIcon={<ScalesFilled className={styles.beforeIcon} />}
          textAlign="left"
        />
      </DialogTrigger>

      <DialogSurface className={styles.surface}>
        <DialogBody className={styles.body}>
          <DialogTitle className={styles.header}>{t("modelComparison.title")}</DialogTitle>

          <DialogContent className={styles.content}>
            <RangeSelector
              label={t("modelComparison.label__y_input")}
              onRangeChanged={setYColumnAddress}
              value={YColumnAdress}
              size="large"
            />
            <RangeSelector
              label={t("modelComparison.label__x_input")}
              onRangeChanged={setXColumnAddress}
              value={XColumnAdress}
              size="large"
            />
            <RangeSelector
              label={t("modelComparison.label__output")}
              placeholder={isCompact ? t("regression.label__output_compact_disabled") : "Ex: A1"}
              onRangeChanged={setResultDestinationAddress}
              value={isCompact ? "" : resultDestinationAddress}
              size="large"
              input={false}
              disabled={isCompact}
            />

            <div className={styles.optionsRow}>
              <div className={styles.comboboxField}>
                <ComboboxTags data={MODEL_TYPES} value={modelKeys} setValue={setModelKeys} />
              </div>
              <Field label={t("modelComparison.input__alpha.label")} className={styles.alphaField}>
                <Input
                  type="number"
                  min={0}
                  max={1}
                  step={0.01}
                  value={String(alpha)}
                  onChange={(_, data) => setAlpha(data.value)}
                  placeholder={t("modelComparison.input__alpha.placeholder")}
                  size="large"
                />
              </Field>
            </div>

            <div className={styles.switchRow}>
              <span className={styles.switchLabel}>{t("regression.switch__interpretation")}</span>
              <Switch
                checked={econometricInterpretation}
                onChange={(_, data) => setEconometricInterpretation(data.checked)}
              />
            </div>
          </DialogContent>

          <DialogActions className={styles.footer}>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="secondary" className={styles.cancelButton}>
                {t("modelComparison.button__cancel")}
              </Button>
            </DialogTrigger>
            <Button appearance="primary" onClick={handleClick}>
              {t("modelComparison.button__submit")}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default ModalModelComparison;
