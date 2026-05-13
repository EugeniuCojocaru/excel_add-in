import React from "react";
import PropTypes from "prop-types";
import ModalDescriptiveStats from "./components/ModalDescriptiveStats";
import ModalSimpleRegression from "./components/ModalSimpleRegression";
import { makeStyles } from "@fluentui/react-components";
import { useLanguage } from "@i18n";

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
    </div>
  );
};

App.propTypes = {
  title: PropTypes.string,
};

export default App;
