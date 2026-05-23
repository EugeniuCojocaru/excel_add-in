/**
 * Generates a consistent, pseudo-random hex color based on the inputs.
 * @param {number} num - A numeric parameter
 * @param {string} str - A string parameter
 * @returns {string} A hex color code
 */
export function randColor(num, str) {
  // 1. Combine the inputs into a single string
  const combined = `${str}-${num}`;

  // 2. Create a simple hash from the combined string
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    // Bitwise shift to create a unique number based on character codes
    hash = combined.charCodeAt(i) + ((hash << 5) - hash);
  }

  // 3. Convert the hash into an RGB hex string
  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += value.toString(16).padStart(2, "0");
  }

  return color;
}
