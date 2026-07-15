import { EXCEL_FORMATS } from "./excelFormats";
import { toUIData } from "./ui";

/**
 * Concatenates row sections into the { dataToWrite, maxColumns } shape consumed
 * by @utils/ui's splitAndCompleteRawData and by the Excel write pipeline.
 * @param {{ row: any[], format: (object|null)[] }[]} rows
 * @returns {{ dataToWrite: { row: any[], format: (object|null)[] }[], maxColumns: number }}
 */
export const toRawData = (rows) => {
  let maxColumns = 0;
  rows.forEach((row) => {
    if (row.row.length > maxColumns) maxColumns = row.row.length;
  });
  return { dataToWrite: rows, maxColumns };
};

/**
 * Pads a single row's value/format arrays to `width`, without mutating the input.
 * @param {{ row: any[], format: (object|null)[] }} cell
 * @param {number} width
 * @returns {{ row: any[], format: (object|null)[] }}
 */
const padRow = ({ row, format }, width) => ({
  row: [...row, ...Array(Math.max(0, width - row.length)).fill("")],
  format: [...format, ...Array(Math.max(0, width - format.length)).fill(null)],
});

/**
 * A `fullWidth: true` cell means "paint this entire row" — a shorthand that only
 * makes sense when the block owns the whole sheet width on its own. Once a block
 * shares a row with another block (grid layout), that shorthand would paint over
 * its neighbour. This resolves it into an explicit per-column format spanning only
 * this block's own `width`, merging any other explicit cell format in that row on
 * top of the banner style (matching the layered look the row-wide apply produced).
 * @param {{ row: any[], format: (object|null)[] }} cell
 * @param {number} width
 * @returns {{ row: any[], format: (object|null)[] }}
 */
const localizeFullWidth = ({ row, format }, width) => {
  const bannerIndex = format.findIndex((cellFormat) => cellFormat?.fullWidth);
  if (bannerIndex === -1) return padRow({ row, format }, width);

  const { fullWidth: _fullWidth, ...bannerStyle } = format[bannerIndex];
  return {
    row: [...row, ...Array(Math.max(0, width - row.length)).fill("")],
    format: Array.from({ length: width }, (_, col) => {
      const explicit = col !== bannerIndex ? format[col] : null;
      return explicit ? { ...bannerStyle, ...explicit } : bannerStyle;
    }),
  };
};

/**
 * Wraps a block's rows in a 1-cell blank border (top, right, bottom, left).
 * @param {{ row: any[], format: (object|null)[] }[]} rows - already localized/padded to `width`
 * @param {number} width
 * @returns {{ row: any[], format: (object|null)[] }[]}
 */
const frameBlock = (rows, width) => {
  const blankBorderRow = { row: Array(width + 2).fill(""), format: Array(width + 2).fill(null) };
  const borderedRows = rows.map(({ row, format }) => ({
    row: ["", ...row, ""],
    format: [null, ...format, null],
  }));
  return [blankBorderRow, ...borderedRows, blankBorderRow];
};

/**
 * Arranges standardized raw-data blocks into an N-column grid. Each block is first
 * wrapped in its own blank border (top/right/bottom/left), then blocks on the same
 * grid row sit side by side behind a single grey divider column, and grid rows are
 * separated by a full-width grey divider row — so the visual order out from a
 * block's content is always: white border, then grey divider. Every block's rows
 * are padded to the widest block's column count first so quadrants line up
 * regardless of their own maxColumns.
 * @param {{ dataToWrite: { row: any[], format: (object|null)[] }[], maxColumns: number }[]} blocks
 * @param {{ columns?: number }} [options]
 * @returns {{ dataToWrite: { row: any[], format: (object|null)[] }[], maxColumns: number }}
 */
export const buildRawDataGrid = (blocks, { columns = 2 } = {}) => {
  if (blocks.length === 0) return { dataToWrite: [], maxColumns: 0 };

  const width = Math.max(...blocks.map((block) => block.maxColumns));
  const framedBlocks = blocks.map((block) => {
    const localized = block.dataToWrite.map((cell) => localizeFullWidth(cell, width));
    return frameBlock(localized, width);
  });
  const blankFramedRow = { row: Array(width + 2).fill(""), format: Array(width + 2).fill(null) };

  const dataToWrite = [];

  for (let start = 0; start < framedBlocks.length; start += columns) {
    const gridRow = framedBlocks.slice(start, start + columns);
    const rowCount = Math.max(...gridRow.map((rows) => rows.length));

    for (let r = 0; r < rowCount; r++) {
      let row = [];
      let format = [];
      gridRow.forEach((rows, i) => {
        if (i > 0) {
          row.push("");
          format.push(EXCEL_FORMATS.sectionDivider);
        }
        const cell = rows[r] ?? blankFramedRow;
        row = row.concat(cell.row);
        format = format.concat(cell.format);
      });
      dataToWrite.push({ row, format });
    }

    if (start + columns < framedBlocks.length) {
      dataToWrite.push(toUIData([""], [{ ...EXCEL_FORMATS.sectionDivider, fullWidth: true }]));
    }
  }

  const maxColumns = Math.max(...dataToWrite.map((cell) => cell.row.length));

  return { dataToWrite, maxColumns };
};
