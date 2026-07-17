import React, { useState } from "react";
import { Input, Button, Field, Tooltip, makeStyles, tokens } from "@fluentui/react-components";
import { TableFilled, TargetArrowFilled } from "@fluentui/react-icons";
import { useLanguage } from "@i18n";

const useStyles = makeStyles({
  gridButton: {
    minWidth: "32px",
    padding: "4px 6px",
    borderRadius: "0",
    color: tokens.colorBrandForeground1,
    borderLeft: `1px solid ${tokens.colorNeutralStroke1}`,
    ":hover": {
      backgroundColor: tokens.colorBrandBackground,
      color: tokens.colorNeutralForegroundOnBrand,
      borderLeftColor: "transparent",
    },
    ":active": {
      backgroundColor: tokens.colorBrandBackgroundPressed,
      color: tokens.colorNeutralForegroundOnBrand,
      borderLeftColor: "transparent",
    },
  },
});

const RangeSelector = ({
  label,
  placeholder = "Ex: A1:A10",
  onRangeChanged,
  value,
  size = "medium",
  input = true,
  disabled = false,
}) => {
  const styles = useStyles();
  const { t } = useLanguage();
  const [rangeAddress, setRangeAddress] = useState(value || "");

  const handleGetSelection = async () => {
    try {
      await Excel.run(async (context) => {
        const range = context.workbook.getSelectedRange();
        range.load("address");
        await context.sync();
        setRangeAddress(range.address);
        if (onRangeChanged) {
          onRangeChanged(range.address);
        }
      });
    } catch (error) {
      console.error("Error retrieving selection:", error);
    }
  };

  return (
    <Field label={label}>
      <Input
        size={size}
        value={rangeAddress}
        disabled={disabled}
        onChange={(_, data) => {
          setRangeAddress(data.value);
          if (onRangeChanged) onRangeChanged(data.value);
        }}
        placeholder={placeholder}
        contentAfter={
          <Tooltip content={t("rangeSelector.tooltip")} relationship="label">
            <Button
              appearance="transparent"
              className={styles.gridButton}
              icon={input ? <TableFilled /> : <TargetArrowFilled />}
              onClick={handleGetSelection}
              size="small"
              disabled={disabled}
              aria-label={t("rangeSelector.ariaLabel")}
            />
          </Tooltip>
        }
      />
    </Field>
  );
};

export default RangeSelector;
