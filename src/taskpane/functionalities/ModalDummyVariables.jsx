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
  RadioGroup,
  Radio,
  MessageBar,
  MessageBarBody,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { TableAddFilled, ChevronRightFilled } from "@fluentui/react-icons";
import RangeSelector from "../components/RangeSelector";
import { getColumnStringMatrix, insertColumn, toUIData } from "@excel";
import {
  preprocessDummyVariables,
  buildDummyTableRows,
} from "@econometrics/use_cases/dummy_variables";
import { useLanguage } from "@i18n";
import ActionButton from "../components/ActionButton";

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
  stepIndicator: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    marginBottom: "4px",
    display: "block",
  },
  content: {
    padding: "16px 8px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  description: {
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground2,
    lineHeight: tokens.lineHeightBase300,
    margin: "0",
  },
  detectedValuesLabel: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    fontWeight: tokens.fontWeightSemibold,
    display: "block",
    marginBottom: "8px",
  },
  detectedValuesBox: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    padding: "4px 0",
    display: "flex",
    flexDirection: "column",
  },
  radioOptionWrapper: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    margin: "4px 8px",
    padding: "8px 12px",
    display: "flex",
    alignItems: "center",
  },
  footer: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 8px",
    borderTop: `1px solid ${tokens.colorNeutralStroke3}`,
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
  },
  footerStep2: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 8px",
    borderTop: `1px solid ${tokens.colorNeutralStroke3}`,
    display: "flex",
    justifyContent: "space-between",
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

const DEFAULT_STATE = {
  step: 1,
  XColumnAdress: "",
  DColumnAddress: "",
  xData: null,
  uniqueValues: [],
  columnName: "",
  baseline: "",
};

const ModalDummyVariables = () => {
  const styles = useStyles();
  const { t } = useLanguage();

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(DEFAULT_STATE.step);
  const [XColumnAdress, setXColumnAddress] = useState(DEFAULT_STATE.XColumnAdress);
  const [DColumnAddress, setDColumnAddress] = useState(DEFAULT_STATE.DColumnAddress);
  const [xData, setXData] = useState(DEFAULT_STATE.xData);
  const [uniqueValues, setUniqueValues] = useState(DEFAULT_STATE.uniqueValues);
  const [columnName, setColumnName] = useState(DEFAULT_STATE.columnName);
  const [baseline, setBaseline] = useState(DEFAULT_STATE.baseline);

  const resetState = () => {
    setOpen(false);
    setStep(DEFAULT_STATE.step);
    setDColumnAddress(DEFAULT_STATE.DColumnAddress);
    setXData(DEFAULT_STATE.xData);
    setUniqueValues(DEFAULT_STATE.uniqueValues);
    setColumnName(DEFAULT_STATE.columnName);
    setBaseline(DEFAULT_STATE.baseline);
  };

  const handleOpenChange = (_, data) => {
    if (data.open) {
      setOpen(true);
    } else {
      resetState();
    }
  };

  const handleNext = async () => {
    const data = await getColumnStringMatrix(XColumnAdress);
    const rows = data.data;
    const name = data.meta?.[0]?.name || XColumnAdress;
    const values = [...new Set(rows.map((row) => row[0]))].sort();
    setXData(data);
    setColumnName(name);
    setUniqueValues(values);
    setBaseline(values[0] || "");
    setStep(2);
  };

  const handleGenerate = async () => {
    const processedDummy = preprocessDummyVariables(xData, { referenceCategories: [baseline] });
    const rows = buildDummyTableRows(processedDummy);
    const newColumns = {
      maxColumns: Math.max(...rows.map((r) => r.length)),
      dataToWrite: rows.map((row) => toUIData(row)),
    };
    await insertColumn(newColumns, DColumnAddress);
    resetState();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger disableButtonEnhancement>
        <ActionButton
          text={t("dummyVariables.title")}
          beforeIcon={<TableAddFilled className={styles.beforeIcon} />}
          textAlign="left"
        />
      </DialogTrigger>

      <DialogSurface className={styles.surface}>
        <DialogBody className={styles.body}>
          <DialogTitle className={styles.header}>
            <span className={styles.stepIndicator}>
              {t("dummyVariables.step__indicator", { current: step, total: 2 })}
            </span>
            {step === 1 ? t("dummyVariables.title") : t("dummyVariables.step2__title")}
          </DialogTitle>

          {step === 1 && (
            <>
              <DialogContent className={styles.content}>
                <RangeSelector
                  label={t("dummyVariables.label__x_input")}
                  onRangeChanged={setXColumnAddress}
                  value={XColumnAdress}
                  size="large"
                />
                <RangeSelector
                  label={t("dummyVariables.label__d_output")}
                  placeholder="Ex: A1"
                  onRangeChanged={setDColumnAddress}
                  value={DColumnAddress}
                  size="large"
                  input={false}
                />
              </DialogContent>

              <DialogActions className={styles.footer}>
                <DialogTrigger disableButtonEnhancement>
                  <Button appearance="secondary" className={styles.cancelButton}>
                    {t("dummyVariables.button__cancel")}
                  </Button>
                </DialogTrigger>
                <Button appearance="primary" onClick={handleNext}>
                  {t("dummyVariables.button__next")}
                </Button>
              </DialogActions>
            </>
          )}

          {step === 2 && (
            <>
              <DialogContent className={styles.content}>
                {uniqueValues.length === 0 ? (
                  <MessageBar intent="warning">
                    <MessageBarBody>{t("dummyVariables.step2__empty")}</MessageBarBody>
                  </MessageBar>
                ) : (
                  <>
                    <p className={styles.description}>{t("dummyVariables.step2__description")}</p>

                    <div>
                      <span className={styles.detectedValuesLabel}>
                        {t("dummyVariables.step2__detected_values", { column: columnName })}
                      </span>
                      <div className={styles.detectedValuesBox}>
                        <RadioGroup
                          value={baseline}
                          onChange={(_, data) => setBaseline(data.value)}
                        >
                          {uniqueValues.map((val) => (
                            <div key={val} className={styles.radioOptionWrapper}>
                              <Radio value={val} label={val} />
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    </div>

                    <MessageBar intent="info">
                      <MessageBarBody>{t("dummyVariables.step2__info")}</MessageBarBody>
                    </MessageBar>
                  </>
                )}
              </DialogContent>

              <DialogActions className={styles.footerStep2}>
                <Button
                  appearance="secondary"
                  className={styles.cancelButton}
                  onClick={() => setStep(1)}
                >
                  {t("dummyVariables.button__back")}
                </Button>
                {uniqueValues.length === 0 ? (
                  <Button appearance="primary" onClick={resetState}>
                    {t("dummyVariables.button__cancel")}
                  </Button>
                ) : (
                  <Button
                    appearance="primary"
                    onClick={handleGenerate}
                    icon={<ChevronRightFilled />}
                    iconPosition="after"
                  >
                    {t("dummyVariables.button__generate")}
                  </Button>
                )}
              </DialogActions>
            </>
          )}
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default ModalDummyVariables;
