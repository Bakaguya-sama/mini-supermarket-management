/**
 * Format number to VND currency
 * @param {number} amount - The amount to format
 * @param {boolean} showSymbol - Whether to show ₫ symbol (default: true)
 * @returns {string} Formatted currency string
 * 
 * Examples:
 * formatVND(145000) => "145.000₫"
 * formatVND(32000) => "32.000₫"
 * formatVND(9500) => "9.500₫"
 * formatVND(145000, false) => "145.000"
 */
export const formatVND = (amount, showSymbol = true) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return showSymbol ? "0₫" : "0";
  }

  // Round to nearest integer (VND doesn't use decimals)
  const rounded = Math.round(amount);

  // Format with thousand separators using dot (.)
  const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return showSymbol ? `${formatted}₫` : formatted;
};

/**
 * Format number to USD currency (legacy support)
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export const formatUSD = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "$0.00";
  }
  return `$${parseFloat(amount).toFixed(2)}`;
};

/**
 * Default currency formatter (VND)
 */
export const formatCurrency = formatVND;

export default formatVND;
