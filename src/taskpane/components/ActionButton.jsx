import React from "react";
import { Button, makeStyles, tokens } from "@fluentui/react-components";
import { ChevronRightFilled } from "@fluentui/react-icons";

const useStyles = makeStyles({
  button: {
    width: "100%",
    minHeight: "48px",
    padding: `0 ${tokens.spacingHorizontalM}`,
  },
  content: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
    gap: tokens.spacingHorizontalM,
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
    fontSize: "28px",
  },
  text: {
    fontSize: "16px",
    lineHeight: "24px",
    display: "flex",
    flex: "1",
  },
  defaultAfterIcon: {
    color: tokens.colorNeutralForeground3,
  },
});

const ActionButton = ({
  text,
  handleClick = () => {},
  beforeIcon,
  afterIcon,
  displayAfterIcon = true,
  textAlign = "center",
  ...rest
}) => {
  const styles = useStyles();

  const justifyStyle = textAlign === "left" ? styles.contentLeft : styles.contentCenter;

  const rightIcon = () => {
    if (!displayAfterIcon) return null;
    return (
      <span className={styles.icon}>
        {afterIcon || <ChevronRightFilled className={styles.defaultAfterIcon} />}
      </span>
    );
  };
  return (
    <Button className={styles.button} onClick={handleClick} {...rest}>
      <span className={styles.content}>
        {beforeIcon && <span className={styles.icon}>{beforeIcon}</span>}
        <span className={`${styles.text} ${justifyStyle}`}>{text}</span>
        {rightIcon()}
      </span>
    </Button>
  );
};

export default ActionButton;
