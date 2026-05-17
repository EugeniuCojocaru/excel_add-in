import React from "react";
import PropTypes from "prop-types";
import ModalDescriptiveStats from "./descriptive_stats/ModalDescriptiveStats";
import ModalSimpleRegression from "./regression/ModalSimpleRegression";
import ModalModelComparison from "./model_comparison/ModalModelComparison";
import { makeStyles } from "@fluentui/react-components";
import { useLanguage } from "@i18n";
import ModalDummyVariables from "./dummy_variables/ModalDummyVariables";

const useStyles = makeStyles({
  root: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
});

const App = (props) => {
  const { title } = props;
  const styles = useStyles();
  const { t } = useLanguage();
  return (
    <div className={styles.root}>
      <h1>{t("welcomePage.welcome")}</h1>
      <ModalDescriptiveStats />
      <ModalSimpleRegression />
      <ModalModelComparison />
      <ModalDummyVariables />
    </div>
  );
};

App.propTypes = {
  title: PropTypes.string,
};

export default App;
