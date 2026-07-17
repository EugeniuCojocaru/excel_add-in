import React, { useState } from "react";
import PropTypes from "prop-types";
import ModalDescriptiveStats from "./functionalities/ModalDescriptiveStats";
import ModalRegression from "./functionalities/ModalRegression";
import ModalModelComparison from "./functionalities/ModalModelComparison";
import ModalDummyVariables from "./functionalities/ModalDummyVariables";
import ModalSettings from "./components/ModalSettings";
import { makeStyles, tokens } from "@fluentui/react-components";
import { SettingsFilled } from "@fluentui/react-icons";
import { useLanguage } from "@i18n";
import ActionButton from "./components/ActionButton";

const useStyles = makeStyles({
  root: {
    width: "100%",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "'Libre Franklin', sans-serif",
  },
  app: {
    maxWidth: "500px",
    width: "100%",
    flex: "1",
    display: "flex",
    flexDirection: "column",
    padding: tokens.spacingHorizontalM,
  },
  topPart: {
    display: "flex",
    flexDirection: "column",
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalM}`,
    borderBottom: "1px solid",
  },
  title: {
    margin: "0",
    fontSize: "40px",
    lineHeight: "60px",
    fontWeight: "700",
  },
  subtitle: {
    margin: `${tokens.spacingVerticalXS} 0 0 0`,
    fontSize: "24px",
    lineHeight: "32px",
  },
  middlePart: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    width: "100%",
    gap: tokens.spacingVerticalS,
    flex: "1",
    boxSizing: "border-box",
    paddingTop: `${tokens.spacingVerticalM}`,
    paddingBottom: `${tokens.spacingVerticalM}`,
  },
  bottomPart: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderTop: "1px solid",
  },
});

const App = () => {
  const styles = useStyles();
  const { t } = useLanguage();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className={styles.root}>
      <div className={styles.app}>
        <div className={styles.topPart}>
          <h1 className={styles.title}>{t("welcomePage.title")}</h1>
          <p className={styles.subtitle}>{t("welcomePage.subtitle")}</p>
        </div>

        <div className={styles.middlePart}>
          <ModalDescriptiveStats />
          <ModalRegression />
          <ModalModelComparison />
          <ModalDummyVariables />
        </div>

        <div className={styles.bottomPart} onClick={() => setSettingsOpen(true)}>
          <SettingsFilled fontSize={32} style={{cursor: "pointer"}} />
        </div>

        <ModalSettings open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      </div>
    </div>
  );
};

App.propTypes = {
  title: PropTypes.string,
};

export default App;
