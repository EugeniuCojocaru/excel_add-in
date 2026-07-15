/**
 * Parses a "Name <unit>" header string into its parts.
 * @param {string} header
 * @returns {{ name: string, unit: string|null }}
 */
export const toColumnMeta = (header) => {
  // ^(.+?)\s*<(.+?)>  — capture "name" then "<unit>"
  const regex = /^(.+?)\s*<(.+?)>/;
  const match = header.match(regex);

  if (!match) return { name: header.trim(), unit: null };

  return { name: match[1].trim(), unit: match[2].trim() };
};

/**
 * Detects and strips a header row (present when every cell of the first row is a
 * string), parsing it into column meta.
 * @param {any[][]} values
 * @returns {{ meta: { name: string, unit: string|null }[], rows: any[][] }}
 */
export const getHeaderMeta = (values) => {
  const isFirstRowHeader = values[0].every((cellValue) => typeof cellValue === "string");
  if (!isFirstRowHeader) return { meta: [], rows: values };

  return { meta: values[0].map(toColumnMeta), rows: values.slice(1) };
};

/**
 * Keeps only rows where every cell is a valid finite number.
 * @param {any[][]} rows
 * @returns {{ data: number[][], ignored: number[] }} ignored holds the index of every dropped row
 */
export const getNumericRows = (rows) => {
  const data = [];
  const ignored = [];

  rows.forEach((row, i) => {
    const isRowValid = row.every((cellValue) => typeof cellValue === "number" && !isNaN(cellValue));
    if (isRowValid) data.push(row);
    else ignored.push(i);
  });

  return { data, ignored };
};

/**
 * Keeps only rows where every cell is a non-empty string.
 * @param {any[][]} rows
 * @returns {{ data: string[][], ignored: number[] }} ignored holds the index of every dropped row
 */
export const getStringRows = (rows) => {
  const data = [];
  const ignored = [];

  rows.forEach((row, i) => {
    const isRowValid = row.every((cellValue) => typeof cellValue === "string" && cellValue.length > 0);
    if (isRowValid) data.push(row);
    else ignored.push(i);
  });

  return { data, ignored };
};
