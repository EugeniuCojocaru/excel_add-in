import React, { useState } from "react";
import { Field, Combobox, Option, makeStyles } from "@fluentui/react-components";

const useStyles = makeStyles({
  combobox: {
    height: "40px",
  },
});

const ComboboxTags = ({ data, value, setValue, label, placeholder }) => {
  const styles = useStyles();
  const onOptionSelect = (_, data) => {
    setValue(data.selectedOptions);
  };

  const displayValue = value
    .map((key) => data.find((m) => m.key === key)?.label)
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <Field label={label}>
        <Combobox
          className={styles.combobox}
          multiselect
          placeholder={placeholder}
          value={displayValue}
          selectedOptions={value}
          onOptionSelect={onOptionSelect}
        >
          {data.map((model) => (
            <Option key={model.key} value={model.key}>
              {model.label}
            </Option>
          ))}
        </Combobox>
      </Field>
    </>
  );
};

export default ComboboxTags;
