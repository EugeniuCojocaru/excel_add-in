import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Button,
  RadioGroup,
  Radio,
  Field,
  Input,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { useLanguage } from "@i18n";
import { useSettings } from "../context/SettingsContext";

const useStyles = makeStyles({
  surface: {
    width: "350px",
    minWidth: "unset",
    maxWidth: "unset",
    padding: tokens.spacingHorizontalM,
  },
  modalBody: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalL,
  },
  content: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalL,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "auto 1fr 1fr",
    alignItems: "center",
    rowGap: tokens.spacingVerticalS,
    columnGap: tokens.spacingHorizontalS,
  },
  gridLabel: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
  },
  radioGroup: {
    display: "contents",
  },
  topPart: {
    borderBottom: "1px solid",
    padding: tokens.spacingHorizontalS,
  },

  actions: {
    justifyContent: "flex-end",
    borderTop: "1px solid",
    paddingTop: "8px",
  },
});

const ModalSettings = ({ open, onClose }) => {
  const { t, lang, setLanguage } = useLanguage();
  const { theme, interpretation, decimals, updateSettings } = useSettings();
  const styles = useStyles();

  const [draft, setDraft] = useState({ lang, theme, interpretation, decimals });

  useEffect(() => {
    if (open) {
      setDraft({ lang, theme, interpretation, decimals });
    }
  }, [open]);

  const handleSave = () => {
    setLanguage(draft.lang);
    updateSettings({
      theme: draft.theme,
      interpretation: draft.interpretation,
      decimals: Number(draft.decimals),
    });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(_, data) => {
        if (!data.open) onClose();
      }}
    >
      <DialogSurface className={styles.surface}>
        <DialogBody className={styles.modalBody}>
          <DialogTitle className={styles.topPart}>{t("settings.title")}</DialogTitle>

          <DialogContent className={styles.content}>
            <div className={styles.grid}>
              <span className={styles.gridLabel}>{t("settings.language.label")}</span>
              <RadioGroup
                className={styles.radioGroup}
                value={draft.lang}
                onChange={(_, data) => setDraft((d) => ({ ...d, lang: data.value }))}
              >
                <Radio value="ro" label={t("settings.language.romanian")} />
                <Radio value="en" label={t("settings.language.english")} />
              </RadioGroup>

              <span className={styles.gridLabel}>{t("settings.theme.label")}</span>
              <RadioGroup
                className={styles.radioGroup}
                value={draft.theme}
                onChange={(_, data) => setDraft((d) => ({ ...d, theme: data.value }))}
              >
                <Radio value="light" label={t("settings.theme.light")} />
                <Radio value="dark" label={t("settings.theme.dark")} />
              </RadioGroup>

              <span className={styles.gridLabel}>{t("settings.interpretation.label")}</span>
              <RadioGroup
                className={styles.radioGroup}
                value={draft.interpretation}
                onChange={(_, data) => setDraft((d) => ({ ...d, interpretation: data.value }))}
              >
                <Radio value="STUDENT" label={t("settings.interpretation.student")} />
                <Radio value="COMPACT" label={t("settings.interpretation.compact")} />
              </RadioGroup>
            </div>

            <Field label={t("settings.decimals.label")}>
              <Input
                type="number"
                min={2}
                max={64}
                value={String(draft.decimals)}
                placeholder={t("settings.decimals.placeholder")}
                onChange={(_, data) => setDraft((d) => ({ ...d, decimals: data.value }))}
              />
            </Field>
          </DialogContent>

          <DialogActions className={styles.actions}>
            <Button appearance="secondary" onClick={onClose}>
              {t("settings.button__cancel")}
            </Button>
            <Button appearance="primary" onClick={handleSave}>
              {t("settings.button__save")}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default ModalSettings;
