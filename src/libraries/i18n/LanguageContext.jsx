import React, { createContext, useState, useContext } from "react";
import * as dictionary from "./dictionary.json";

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

  const t = (path, variables = {}) => {
    let translation = path.split(".").reduce((obj, key) => {
      return obj && obj[key];
    }, dictionary[lang]);

    if (typeof translation === "string" && Object.keys(variables).length > 0) {
      Object.keys(variables).forEach((key) => {
        const regex = new RegExp(`{${key}}`, "g");
        translation = translation.replace(regex, variables[key]);
      });
      return translation;
    }

    return translation || path;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
