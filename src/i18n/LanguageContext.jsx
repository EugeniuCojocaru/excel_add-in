import React, { createContext, useState, useContext } from "react";
import { translations } from "./translations";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // const [lang, setLang] = useState(() => {
  //   return Office.context.document.settings.get("userLang") || "en";
  // });
  const [lang, setLang] = useState("ro");
  const changeLanguage = (newLang) => {
    setLang(newLang);
    Office.context.document.settings.set("userLang", newLang);
    Office.context.document.settings.saveAsync();
  };

  const t = (path) => {
    const translation = path.split(".").reduce((obj, key) => {
      return obj && obj[key];
    }, translations[lang]);

    return translation || path;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
