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
