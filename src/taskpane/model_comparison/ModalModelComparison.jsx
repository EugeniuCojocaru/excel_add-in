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

import { getColumnMatrix, insertColumn } from "@api";
import { calculateRegression } from "@utils/math";
import { usePrecision } from "@utils/hooks";
import { generateSummaryOutput } from "@utils/summaryOutput";

import { useLanguage } from "@i18n";
import { interpretationRegression } from "@utils/econometrics";
import ComboboxTags from "../components/ComboboxTags";
import { COMPARISSON_INTERPRETATION } from "@utils/interpretation";
import ActionButton from "../components/ActionButton";
import { ScalesFilled } from "@fluentui/react-icons";

const MODEL_TYPES = [
  { key: "linear", label: "Linear" },
  { key: "log-linear", label: "Log-Linear" },
  { key: "semi-log", label: "Semi-Log" },
  { key: "lin-log", label: "Lin-Log" },
];

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
});

const ModalModelComparison = () => {
  const styles = useStyles();
  const { t } = useLanguage();
  const { toUINumber } = usePrecision();

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

    const stats = modelKeys.map((modelKey) => {
      const statsModel = calculateRegression(yData, xData, modelKey, toUINumber, alpha);
      const modelInterpretation = econometricInterpretation
        ? interpretationRegression(statsModel, parseFloat(alpha), yData.meta, xData.meta, t)
        : null;
      return { ...statsModel, interpretation: modelInterpretation };
    });

    const comparation = COMPARISSON_INTERPRETATION.comparisonInterpretation(stats, t);
    const dataToWrite = stats.map((model) => {
      const uiData = generateSummaryOutput(model, yData.meta, xData.meta, t);
      return [...uiData, [" "], [" "]];
    });

    await insertColumn(
      [...comparation, [" "], [" "], ...dataToWrite.flat()],
      resultDestinationAddress
    );
  };

  return (
    <Dialog open={open} onOpenChange={(_, data) => setOpen(data.open)}>
      <DialogTrigger disableButtonEnhancement>
        <ActionButton
          text={t("modelComparison.title")}
          beforeIcon={<ScalesFilled style={{ color: "green" }} />}
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
              placeholder="Ex: A1"
              onRangeChanged={setResultDestinationAddress}
              value={resultDestinationAddress}
              size="large"
              input={false}
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
