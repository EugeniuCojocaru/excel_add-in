import * as React from "react";
import PropTypes from "prop-types";
import Header from "./Header";
import HeroList from "./HeroList";
import TextInsertion from "./TextInsertion";
import { makeStyles } from "@fluentui/react-components";
import { Ribbon24Regular, LockOpen24Regular, DesignIdeas24Regular } from "@fluentui/react-icons";
import { insertText, logSelectedData, getFirstSelectedNumericColumn } from "../taskpane";
import { insertStatsToExcel } from "../write";
import { Button } from "@fluentui/react-components";
import { calculateDescriptiveStats } from "../../utils/math";

const useStyles = makeStyles({
  root: {
    minHeight: "100vh",
  },
});

const App = (props) => {
  const { title } = props;
  const styles = useStyles();
  // The list items are static and won't change at runtime,
  // so this should be an ordinary const, not a part of state.

  const handleClick = async () => {
    const values = await getFirstSelectedNumericColumn();
    console.log("Valorile numerice extrase din prima coloană selectată:", values);
    const stats = calculateDescriptiveStats(values);
    console.log("Indicatorii calculați:", stats);
    await insertStatsToExcel(stats);
  };
  const handleLogSelectedDataClick = () => {
    logSelectedData(); // Apelează funcția care extrage și afișează datele selectate în Excel
  };
  return (
    <div className={styles.root}>
      <Button style={{ margin: "20px" }} appearance="primary" onClick={handleClick}>
        Apasă pentru Debug
      </Button>
    </div>
  );
};

App.propTypes = {
  title: PropTypes.string,
};

export default App;
