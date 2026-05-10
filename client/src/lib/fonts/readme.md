# Fonts Library
Thư mục này dùng để chứa các file font chữ của dự án.

## Cách sử dụng:
1. Copy các file font (`.ttf`, `.woff`, `.woff2`) vào đây.
2. Khai báo `@font-face` trong file CSS và trỏ đường dẫn vào thư mục này.

Ví dụ:
```css
@font-face {
  font-family: 'CustomFont';
  src: url('./lib/fonts/your-font.woff2') format('woff2');
}
```
