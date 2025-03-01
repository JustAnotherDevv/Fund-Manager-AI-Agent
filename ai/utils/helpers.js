/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} - Promise that resolves after the specified time
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Format a number with commas for thousands separator
 * @param {number} number - Number to format
 * @returns {string} - Formatted number string
 */
const formatNumber = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/**
 * Format a currency value with specified decimals and symbol
 * @param {number} value - Value to format
 * @param {number} decimals - Number of decimal places
 * @param {string} symbol - Currency symbol (default: '$')
 * @returns {string} - Formatted currency string
 */
const formatCurrency = (value, decimals = 2, symbol = "$") => {
  return `${symbol}${formatNumber(value.toFixed(decimals))}`;
};

/**
 * Format a percentage value
 * @param {number} value - Value to format (e.g., 0.156 for 15.6%)
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted percentage string
 */
const formatPercentage = (value, decimals = 2) => {
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Truncate ETH address to a shorter form
 * @param {string} address - ETH address
 * @returns {string} - Truncated address (e.g., 0x1234...5678)
 */
const truncateAddress = (address) => {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

module.exports = {
  sleep,
  formatNumber,
  formatCurrency,
  formatPercentage,
  truncateAddress,
};
