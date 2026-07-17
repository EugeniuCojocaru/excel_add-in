import React, { useState } from "react";
import { Field, Combobox, Option, makeStyles } from "@fluentui/react-components";

const useStyles = makeStyles({
  combobox: {
    height: "40px",
  },
});

const ComboboxTags = ({ data, value, setValue }) => {
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
      <Field label="Selectează tipurile de model">
        <Combobox
          className={styles.combobox}
          multiselect
          placeholder="Alege opțiunile..."
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
