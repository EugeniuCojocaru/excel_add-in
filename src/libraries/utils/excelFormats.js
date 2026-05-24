export const EXCEL_FORMATS = {
  // ──────────────────────────────────────────
  // H1 — Title, maximum presence
  // ──────────────────────────────────────────
  h1Title: {
    font: {
      name: "Libre Franklin",
      bold: true,
      size: 20,
      color: "#1C1B1A",
    },
    fill: { color: "#E9F5ED" }, // Primary Light
    horizontalAlignment: "Left",
    verticalAlignment: "Center",
    rowHeight: 40,
    border: {
      EdgeBottom: { color: "#217346", style: "Continuous", weight: "Medium" },
    },
  },
  h1Subtitle: {
    font: {
      name: "Libre Franklin",
      bold: true,
      size: 13,
      color: "#217346", // Primary green carries the emphasis
    },
    // No fill — keeps the sheet breathable
    horizontalAlignment: "Left",
    verticalAlignment: "Center",
    rowHeight: 26,
  },

  // ──────────────────────────────────────────
  // Section divider — muted fill, no border, no text
  // ──────────────────────────────────────────
  sectionDivider: {
    fill: { color: "#EDEBE9" },
    rowHeight: 28,
    horizontalAlignment: "Left",
    verticalAlignment: "Center",
  },

  // ──────────────────────────────────────────
  // H3 — Section heading, lighter touch
  // ──────────────────────────────────────────
  h3Subtitle: {
    font: {
      name: "Libre Franklin",
      bold: true,
      size: 13,
      color: "#217346", // Primary green carries the emphasis
    },
    // No fill — keeps the sheet breathable
    horizontalAlignment: "Left",
    verticalAlignment: "Center",
    rowHeight: 26,
    border: {
      EdgeBottom: { color: "#EDEBE9", style: "Continuous", weight: "Thin" },
    },
  },

  // ──────────────────────────────────────────
  // Table column header — filled, unmistakable
  // ──────────────────────────────────────────
  tableColHeader: {
    font: {
      name: "Libre Franklin",
      bold: true,
      size: 11,
      color: "#FFFFFF",
    },
    fill: { color: "#217346" }, // Primary green
    horizontalAlignment: "Center",
    verticalAlignment: "Center",
    rowHeight: 28,
    border: {
      EdgeBottom: { color: "#1A5A37", style: "Continuous", weight: "Thin" },
    },
  },

  // ──────────────────────────────────────────
  // Table row header — no fill, distinctive
  // ──────────────────────────────────────────
  tableRowHeader: {
    font: {
      name: "Libre Franklin",
      bold: true,
      size: 11,
      color: "#217346", // Same green as col headers — ties them together
    },
    // No fill
    horizontalAlignment: "Left",
    verticalAlignment: "Center",
    indentLevel: 1, // Subtle inset
    border: {
      EdgeRight: { color: "#217346", style: "Continuous", weight: "Thin" },
    },
  },
};

export const applyStyle = (range, style, row = null, col = null) => {
  let target;

  if (row !== null && col !== null) {
    target = range.getCell(row, col); // specific cell
  } else if (row !== null) {
    target = range.getRow(row); // whole row
  } else {
    target = range; // whole range
  }

  if (style.font) Object.assign(target.format.font, style.font);
  if (style.fill) Object.assign(target.format.fill, style.fill);
  if (style.horizontalAlignment) target.format.horizontalAlignment = style.horizontalAlignment;
  if (style.verticalAlignment) target.format.verticalAlignment = style.verticalAlignment;
  if (style.wrapText !== undefined) target.format.wrapText = style.wrapText;
  if (style.indentLevel !== undefined) target.format.indentLevel = style.indentLevel;
  if (style.rowHeight) target.format.rowHeight = style.rowHeight;
  if (style.columnWidth) target.format.columnWidth = style.columnWidth;
  if (style.numberFormat) target.numberFormat = [[style.numberFormat]];

  if (style.border) {
    for (const [edge, spec] of Object.entries(style.border)) {
      const b = target.format.borders.getItem(edge);
      if (spec.style) b.style = spec.style;
      if (spec.color) b.color = spec.color;
      if (spec.weight) b.weight = spec.weight;
    }
  }
};
