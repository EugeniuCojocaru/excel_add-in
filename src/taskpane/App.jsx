import React from "react";
import PropTypes from "prop-types";
import ModalDescriptiveStats from "./descriptive_stats/ModalDescriptiveStats";
import ModalSimpleRegression from "./regression/ModalSimpleRegression";
import ModalModelComparison from "./model_comparison/ModalModelComparison";
import { makeStyles, tokens } from "@fluentui/react-components";
import { SettingsFilled } from "@fluentui/react-icons";
import { useLanguage } from "@i18n";
import ModalDummyVariables from "./dummy_variables/ModalDummyVariables";

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
  return (
    <div className={styles.root}>
      <div className={styles.app}>
        <div className={styles.topPart}>
          <h1 className={styles.title}>{t("welcomePage.title")}</h1>
          <p className={styles.subtitle}>{t("welcomePage.subtitle")}</p>
        </div>

        <div className={styles.middlePart}>
          <ModalDescriptiveStats />
          <ModalSimpleRegression />
          <ModalModelComparison />
          <ModalDummyVariables />
        </div>

        <div className={styles.bottomPart}>
          <SettingsFilled fontSize={32} />
        </div>
      </div>
    </div>
  );
};

App.propTypes = {
  title: PropTypes.string,
};

export default App;
