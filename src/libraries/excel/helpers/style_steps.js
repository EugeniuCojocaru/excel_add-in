/**
 * Applies a style object's properties onto an Office.js range — the whole range,
 * a specific row, or a specific cell, depending on which of row/col are passed.
 * @param {Excel.Range} range
 * @param {object} style - font/fill/horizontalAlignment/verticalAlignment/wrapText/indentLevel/rowHeight/columnWidth/numberFormat/border
 * @param {number|null} [row]
 * @param {number|null} [col]
 * @returns {void}
 */
export const setRangeStyle = (range, style, row = null, col = null) => {
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

/**
 * Applies every absolute-coordinate format entry produced by splitAndCompleteRawData
 * onto a target range — a `fullWidth` entry paints the whole row, otherwise just the
 * one cell.
 * @param {Excel.Range} targetRange
 * @param {{ row: number, column: number, format: object }[]} formats
 * @returns {void}
 */
export const setRangeFormats = (targetRange, formats) => {
  formats.forEach((cellFormat) => {
    const { row, column, format } = cellFormat;
    const { fullWidth, ...rest } = format;
    if (fullWidth) setRangeStyle(targetRange, rest, row);
    else setRangeStyle(targetRange, rest, row, column);
  });
};
