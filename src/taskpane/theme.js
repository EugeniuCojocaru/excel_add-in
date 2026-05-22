import { createLightTheme, createDarkTheme } from "@fluentui/react-components";

const dizenBrand = {
  10: "#040F09",
  20: "#081E12",
  30: "#0D2D1B",
  40: "#113C24",
  50: "#164B2D",
  60: "#1A5A36",
  70: "#1F693F",
  80: "#217346",
  90: "#2E8E5D",
  100: "#3DA874",
  110: "#59BC8E",
  120: "#79CDA9",
  130: "#9DDDC2",
  140: "#BEEAD9",
  150: "#D6F2E9",
  160: "#E9F5ED",
};

const fontFamily = "'Libre Franklin', sans-serif";

export const dizeLightTheme = {
  ...createLightTheme(dizenBrand),

  // Surface & background
  colorNeutralBackground1: "#FDF8F6",
  colorNeutralBackground2: "#F5F0EE",
  colorNeutralBackground3: "#EDE8E6",
  colorNeutralBackground4: "#E5E0DE",
  colorNeutralBackground5: "#DDD8D6",
  colorNeutralBackground6: "#D5D0CE",

  // Brand active / selected state background
  colorBrandBackground2: "#E9F5ED",

  // Borders
  colorNeutralStroke1: "#EDEBE9",
  colorNeutralStroke2: "#E0DEDD",
  colorNeutralStroke3: "#D2D0CE",
  colorNeutralStrokeAccessible: "#605E5C",

  // Text
  colorNeutralForeground1: "#1C1B1A",
  colorNeutralForeground2: "#3B3A39",
  colorNeutralForeground3: "#605E5C",
  colorNeutralForeground4: "#797775",

  // Border radius — 4px throughout
  borderRadiusSmall: "2px",
  borderRadiusMedium: "4px",
  borderRadiusLarge: "4px",
  borderRadiusXLarge: "4px",

  // Typography
  fontFamilyBase: fontFamily,
  fontFamilyMonospace: "'Courier New', monospace",
};

export const dizeDarkTheme = {
  ...createDarkTheme(dizenBrand),

  // Surface & background
  colorNeutralBackground1: "#1C1B1A",
  colorNeutralBackground2: "#242322",
  colorNeutralBackground3: "#2C2B2A",
  colorNeutralBackground4: "#343332",
  colorNeutralBackground5: "#3C3B3A",
  colorNeutralBackground6: "#444342",

  // Brand active / selected state background (dark variant)
  colorBrandBackground2: "#0D2D1B",

  // Borders
  colorNeutralStroke1: "#3B3A39",
  colorNeutralStroke2: "#484645",
  colorNeutralStroke3: "#565452",
  colorNeutralStrokeAccessible: "#A19F9D",

  // Text
  colorNeutralForeground1: "#F3F2F1",
  colorNeutralForeground2: "#C8C6C4",
  colorNeutralForeground3: "#A19F9D",
  colorNeutralForeground4: "#797775",

  // Border radius — 4px throughout
  borderRadiusSmall: "2px",
  borderRadiusMedium: "4px",
  borderRadiusLarge: "4px",
  borderRadiusXLarge: "4px",

  // Typography
  fontFamilyBase: fontFamily,
  fontFamilyMonospace: "'Courier New', monospace",
};
