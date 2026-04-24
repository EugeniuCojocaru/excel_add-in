import React, { useState } from "react";
import { Input, Button, Field, Tooltip } from "@fluentui/react-components";
import { TableRegular } from "@fluentui/react-icons";

const RangeSelector = ({ label, placeholder = "Ex: A1:A10", onRangeChanged, value }) => {
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
      console.error("Eroare la preluarea selecției:", error);
    }
  };

  return (
    <Field label={label}>
      <Input
        value={rangeAddress}
        onChange={(e, data) => {
          setRangeAddress(data.value);
          if (onRangeChanged) onRangeChanged(data.value);
        }}
        placeholder={placeholder}
        contentAfter={
          <Tooltip content="Preluare selecție curentă din tabel" relationship="label">
            <Button
              appearance="transparent"
              icon={<TableRegular />}
              onClick={handleGetSelection}
              size="small"
              aria-label="Preluare selecție"
            />
          </Tooltip>
        }
      />
    </Field>
  );
};

export default RangeSelector;
