import React from "react";
import PropTypes from "prop-types";
import ModalDescriptiveStats from "./descriptive_stats/ModalDescriptiveStats";
import ModalSimpleRegression from "./regression/ModalSimpleRegression";
import ModalModelComparison from "./model_comparison/ModalModelComparison";
import { makeStyles, tokens } from "@fluentui/react-components";
import { SettingsRegular } from "@fluentui/react-icons";
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
  },
  app: {
    maxWidth: "500px",
    flex: "1",
    display: "flex",
    flexDirection: "column",
    border: "2px solid black",
    padding: tokens.spacingHorizontalM,
  },
  topPart: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    flex: "1",
    backgroundColor: "#f4a261",
  },
  middlePart: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    width: "100%",
    gap: tokens.spacingVerticalS,
    flex: "3",
    backgroundColor: "#2a9d8f",
  },
  bottomPart: {
    // marginTop: "auto",
    display: "flex",
    alignItems: "flex-end",
    // paddingTop: tokens.spacingVerticalM,
    cursor: "pointer",
    flex: "1",
    backgroundColor: "#e76f51",
  },
});

const App = (props) => {
  const { title } = props;
  const styles = useStyles();
  const { t } = useLanguage();
  return (
    <div className={styles.root}>
      <div className={styles.app}>
        <div className={styles.topPart}>
          <h1>{title}</h1>
          <p>{t("welcomePage.welcome")}</p>
        </div>

        <div className={styles.middlePart}>
          <ModalDescriptiveStats />
          <ModalSimpleRegression />
          <ModalModelComparison />
          <ModalDummyVariables />
        </div>

        <div className={styles.bottomPart}>
          <SettingsRegular fontSize={24} />
        </div>
      </div>
    </div>
  );
};

App.propTypes = {
  title: PropTypes.string,
};

export default App;
