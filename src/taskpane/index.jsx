import * as React from "react";
import { createRoot } from "react-dom/client";
import { FluentProvider } from "@fluentui/react-components";
import { dizeLightTheme, dizeDarkTheme } from "./theme";
import LanguageProvider from "@i18n";
import { SettingsProvider, useSettings } from "./context/SettingsContext";
import App from "./App";

/* global document, Office, module, require */

const rootElement = document.getElementById("container");
const root = rootElement ? createRoot(rootElement) : undefined;

const ThemedApp = () => {
  const { theme } = useSettings();
  return (
    <FluentProvider theme={theme === "dark" ? dizeDarkTheme : dizeLightTheme}>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </FluentProvider>
  );
};

/* Render application after Office initializes */
Office.onReady(() => {
  root?.render(
    <SettingsProvider>
      <ThemedApp />
    </SettingsProvider>
  );
});

if (module.hot) {
  module.hot.accept("./App", () => {
    const NextApp = require("./App").default;
    root?.render(NextApp);
  });
}
