import React, { useState } from "react";
import { Field, Combobox, Option } from "@fluentui/react-components";

const MODEL_TYPES = [
  { key: "linear", label: "Linear" },
  { key: "log-linear", label: "Log-Linear" },
  { key: "semi-log", label: "Semi-Log" },
  { key: "lin-log", label: "Lin-Log" },
];

const ComboboxTags = () => {
  // State-ul reține direct un array cu string-uri (cheile)
  const [selectedKeys, setSelectedKeys] = useState([]);
  console.log("Selected model types:", selectedKeys);
  // Funcția apelată la bifarea/debifarea unei opțiuni din listă
  const onOptionSelect = (e, data) => {
    setSelectedKeys(data.selectedOptions);
  };

  // Transformă cheile în etichete citibile pentru a le afișa în input-ul combobox-ului
  const displayValue = selectedKeys
    .map((key) => MODEL_TYPES.find((m) => m.key === key)?.label)
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <Field label="Selectează tipurile de model">
        <Combobox
          multiselect
          placeholder="Alege opțiunile..."
          value={displayValue}
          selectedOptions={selectedKeys}
          onOptionSelect={onOptionSelect}
        >
          {MODEL_TYPES.map((model) => (
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
