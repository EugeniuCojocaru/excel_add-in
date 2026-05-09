import * as React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import LanguageProvider from "../i18n";

/* global document, Office, module, require */

const title = "Jenu's Awesome Excel Add-in";

const rootElement = document.getElementById("container");
const root = rootElement ? createRoot(rootElement) : undefined;

/* Render application after Office initializes */
Office.onReady(() => {
  root?.render(
    <FluentProvider theme={webLightTheme}>
      <LanguageProvider>
        <App title={title} />
      </LanguageProvider>
    </FluentProvider>
  );
});

if (module.hot) {
  module.hot.accept("./App", () => {
    const NextApp = require("./App").default;
    root?.render(NextApp);
  });
}
