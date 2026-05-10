// client/src/utils/helpers.js

/**
 * Định dạng tiền tệ VND
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount || 0);
};

/**
 * Định dạng ngày tháng (dd/mm/yyyy)
 */
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('vi-VN');
};

/**
 * Lưu thông tin vào LocalStorage
 */
export const setLocalStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

/**
 * Lấy thông tin từ LocalStorage
 */
export const getLocalStorage = (key) => {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : null;
};
