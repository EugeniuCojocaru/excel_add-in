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
  Combobox,
  Option,
  Switch,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import RangeSelector from "../components/RangeSelector";

import { getColumnMatrix, insertColumn, insertColumnTo } from "@excel";
import { regression } from "@math/use_cases/regression";
import { usePrecision, useInterpretation } from "../hooks";
import { generateSummaryOutput } from "@econometrics/use_cases/summary_output";
import { toUIStats } from "@econometrics";

import { useLanguage } from "@i18n";
import { interpretationRegression } from "@econometrics/use_cases/regression_interpretation";
import { DataTrendingFilled } from "@fluentui/react-icons";
import ActionButton from "../components/ActionButton";
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
  modelTypeField: {
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

const ModalRegression = () => {
  const styles = useStyles();
  const { t } = useLanguage();
  const { toUINumber } = usePrecision();
  const { mode, isCompact, fillFor } = useInterpretation();

  const [open, setOpen] = useState(false);
  const [YColumnAdress, setYColumnAddress] = useState("Sheet1!A13:A64");
  const [XColumnAdress, setXColumnAddress] = useState("Sheet1!B13:C64");
  const [resultDestinationAddress, setResultDestinationAddress] = useState("Sheet1!E13");
  const [econometricInterpretation, setEconometricInterpretation] = useState(false);
  const [modelType, setModelType] = useState("Linear");
  const [alpha, setAlpha] = useState(0.05);

  const handleClick = async () => {
    const xData = await getColumnMatrix(XColumnAdress);
    const yData = await getColumnMatrix(YColumnAdress);

    const modelTypeKey = MODEL_TYPES.find((type) => type.label === modelType)?.key || "linear";
    const rawStats = regression(yData, xData, alpha, modelTypeKey, { toUINumber });
    const uiStats = toUIStats(rawStats);
    const interpretation = econometricInterpretation
      ? interpretationRegression(uiStats, parseFloat(alpha), yData.meta, xData.meta, t, {
          mode,
          fillFor,
        })
      : null;
    const rawFullData = generateSummaryOutput(
      { interpretation, ...uiStats },
      yData.meta,
      xData.meta,
      t,
      { mode, fillFor, extended: econometricInterpretation }
    );

    if (isCompact) {
      await insertColumnTo(rawFullData, "Discussion_Regression", "A1");
    } else {
      await insertColumn(rawFullData, resultDestinationAddress);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(_, data) => setOpen(data.open)}>
      <DialogTrigger disableButtonEnhancement>
        <ActionButton
          text={t("regression.title")}
          beforeIcon={<DataTrendingFilled className={styles.beforeIcon} />}
          textAlign="left"
        />
      </DialogTrigger>

      <DialogSurface className={styles.surface}>
        <DialogBody className={styles.body}>
          <DialogTitle className={styles.header}>{t("regression.title")}</DialogTitle>

          <DialogContent className={styles.content}>
            <RangeSelector
              label={t("regression.label__y_input")}
              onRangeChanged={setYColumnAddress}
              value={YColumnAdress}
              size="large"
            />
            <RangeSelector
              label={t("regression.label__x_input")}
              onRangeChanged={setXColumnAddress}
              value={XColumnAdress}
              size="large"
            />
            <RangeSelector
              label={t("regression.label__output")}
              placeholder={isCompact ? t("regression.label__output_compact_disabled") : "Ex: A1"}
              onRangeChanged={setResultDestinationAddress}
              value={isCompact ? "" : resultDestinationAddress}
              size="large"
              input={false}
              disabled={isCompact}
            />

            <div className={styles.optionsRow}>
              <Field
                label={t("regression.combobox__model_type.label")}
                className={styles.modelTypeField}
              >
                <Combobox
                  placeholder={t("regression.combobox__model_type.placeholder")}
                  value={modelType}
                  onOptionSelect={(_, data) => setModelType(data.optionValue || "")}
                  size="large"
                >
                  {MODEL_TYPES.map((type) => (
                    <Option key={type.key} value={type.label}>
                      {type.label}
                    </Option>
                  ))}
                </Combobox>
              </Field>
              <Field label={t("regression.input__alpha.label")} className={styles.alphaField}>
                <Input
                  type="number"
                  min={0}
                  max={1}
                  step={0.01}
                  value={String(alpha)}
                  onChange={(_, data) => setAlpha(data.value)}
                  placeholder={t("regression.input__alpha.placeholder")}
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
                {t("regression.button__cancel")}
              </Button>
            </DialogTrigger>
            <Button appearance="primary" onClick={handleClick}>
              {t("regression.button__submit")}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default ModalRegression;
