import * as React from "react";
import PropTypes from "prop-types";
import Header from "./components/Header";
import HeroList from "./components/HeroList";
import TextInsertion from "./components/TextInsertion";
import { makeStyles } from "@fluentui/react-components";

import { Button } from "@fluentui/react-components";
import { calculateDescriptiveStats } from "../utils/math";
import { getFirstSelectedNumericColumn, insertStatsToExcel } from "./api";

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
