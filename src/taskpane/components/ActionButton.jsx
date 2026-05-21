import React from "react";
import { Button, makeStyles, tokens } from "@fluentui/react-components";

const useStyles = makeStyles({
  button: {
    width: "100%",
    minHeight: "32px",
    padding: `0 ${tokens.spacingHorizontalM}`,
  },
  content: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    gap: tokens.spacingHorizontalS,
  },
  contentCenter: {
    justifyContent: "center",
  },
  contentLeft: {
    justifyContent: "flex-start",
  },
  icon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 0,
  },
});

const ActionButton = ({ text, handleClick, beforeIcon, afterIcon, textAlign = "center", ...rest }) => {
  const styles = useStyles();

  const justifyStyle = textAlign === "left" ? styles.contentLeft : styles.contentCenter;

  return (
    <Button className={styles.button} onClick={handleClick} {...rest}>
      <span className={`${styles.content} ${justifyStyle}`}>
        {beforeIcon && <span className={styles.icon}>{beforeIcon}</span>}
        <span>{text}</span>
        {afterIcon && <span className={styles.icon}>{afterIcon}</span>}
      </span>
    </Button>
  );
};

export default ActionButton;
