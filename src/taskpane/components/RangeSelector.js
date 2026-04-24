import React, { useState } from "react";
import { Input, Button, Field, Tooltip } from "@fluentui/react-components";
import { TableRegular } from "@fluentui/react-icons";

const RangeSelector = ({ label, placeholder = "Ex: A1:A10", onRangeChanged , value }) => {
  const [rangeAddress, setRangeAddress] = useState(value || "");

  // Funcția care ia adresa selecției curente din Excel
  const handleGetSelection = async () => {
    try {
      await Excel.run(async (context) => {
        // 1. Obținem range-ul evidențiat de utilizator cu mouse-ul
        const range = context.workbook.getSelectedRange();

        // 2. Cerem adresa (ex: "Sheet1!A1:A15")
        range.load("address");
        await context.sync();

        // 3. Salvăm adresa în starea componentei pentru a o afișa în Input
        setRangeAddress(range.address);

        // 4. (Opțional) Trimitem adresa mai departe către componenta părinte
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
        // Permite și scrierea manuală a adresei, dacă utilizatorul preferă tastatura
        onChange={(e, data) => {
          setRangeAddress(data.value);
          if (onRangeChanged) onRangeChanged(data.value);
        }}
        placeholder={placeholder}
        // Aici adăugăm butonul în interiorul inputului, la final (în dreapta)
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
