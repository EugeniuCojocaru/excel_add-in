import React from "react";
import PropTypes from "prop-types";
import ModalDescriptiveStats from "./components/ModalDescriptiveStats";
import ModalSimpleRegression from "./components/ModalSimpleRegression";
import { makeStyles } from "@fluentui/react-components";

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

  return (
    <div className={styles.root}>
      Functionalitati:
      <ModalDescriptiveStats />
      <ModalSimpleRegression />
    </div>
  );
};

App.propTypes = {
  title: PropTypes.string,
};

export default App;
