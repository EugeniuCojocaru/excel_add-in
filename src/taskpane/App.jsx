import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Button,
} from "@fluentui/react-components";
import PropTypes from "prop-types";
import Header from "./components/Header";
import HeroList from "./components/HeroList";
import TextInsertion from "./components/TextInsertion";
import ModalDescriptiveStats from "./components/ModalDescriptiveStats";
import ModalSimpleRegression from "./components/ModalSimpleRegression";
import { makeStyles } from "@fluentui/react-components";
import { calculateDescriptiveStats, calculateSimpleRegression } from "../utils/math";
import {
  getFirstSelectedNumericColumn,
  getFirst2SelectedNumericColumn,
  insertStatsToExcel,
} from "./api";

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

  const [isOpen, setIsOpen] = useState(false);
  console.log({ isOpen });
  // The list items are static and won't change at runtime,
  // so this should be an ordinary const, not a part of state.

  const handleClick = async () => {
    const values = await getFirstSelectedNumericColumn();
    console.log("Valorile numerice extrase din prima coloană selectată:", values);
    const stats = calculateDescriptiveStats(values);
    console.log("Indicatorii calculați:", stats);
    await insertStatsToExcel(stats);
  };

  const handleClick2 = async () => {
    const { array1, array2 } = await getFirst2SelectedNumericColumn();
    // console.log("Valorile numerice extrase din primele două coloane selectate:", array1, array2);
    const stats = calculateSimpleRegression(array1, array2);
    console.log("Indicatorii calculați:", stats);
    // await insertStatsToExcel(stats);
  };

  const handleClick3 = async () => {
    const { array1, array2 } = await getFirst2SelectedNumericColumn();
    // console.log("Valorile numerice extrase din primele două coloane selectate:", array1, array2);
    const stats = calculateSimpleRegression(array1, array2);
    console.log("Indicatorii calculați:", stats);
    // await insertStatsToExcel(stats);
  };
  return (
    <div className={styles.root}>
      <Button style={{ margin: "20px" }} appearance="primary" onClick={handleClick}>
        Statistici descriptive
      </Button>
      <Button style={{ margin: "20px" }} appearance="primary" onClick={handleClick2}>
        Regresie simplă
      </Button>
      <ModalDescriptiveStats />
      <ModalSimpleRegression />
    </div>
  );
};

App.propTypes = {
  title: PropTypes.string,
};

export default App;
