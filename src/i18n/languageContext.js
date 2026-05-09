import React, { createContext, useState, useContext } from "react";
import { translations } from "./translations";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return Office.context.document.settings.get("userLang") || "en";
  });

  const changeLanguage = (newLang) => {
    setLang(newLang);
    Office.context.document.settings.set("userLang", newLang);
    Office.context.document.settings.saveAsync();
  };

  const t = (key) => translations[lang]?.[key] || key;

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
