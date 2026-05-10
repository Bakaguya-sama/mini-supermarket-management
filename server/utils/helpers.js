// server/utils/helpers.js

/**
 * Định dạng tiền tệ VND
 * @param {number} amount - Số tiền
 * @returns {string} Chuỗi đã định dạng
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

/**
 * Định dạng ngày tháng
 * @param {Date|string} date - Ngày cần định dạng
 * @returns {string} Chuỗi dd/mm/yyyy
 */
const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('vi-VN');
};

/**
 * Tạo slug từ chuỗi (cho URL hoặc tìm kiếm)
 * @param {string} text - Chuỗi gốc
 * @returns {string} Chuỗi slug
 */
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

module.exports = {
  formatCurrency,
  formatDate,
  slugify
};
