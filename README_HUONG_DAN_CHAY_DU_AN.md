# Hướng dẫn chạy dự án và xem API

Tài liệu này viết theo kiểu dễ làm theo để giáo viên có thể chạy dự án, đăng nhập tài khoản manager, xem trang mô tả API và mở trang test API ở frontend.

## 1) Chạy dự án

### Cách nhanh nhất

Mở Terminal ở thư mục gốc của dự án rồi chạy:

npm run dev

Lệnh này chạy cả frontend và backend cùng lúc nên không cần chạy từng cái
```



### Khi chạy thành công

- Backend thường chạy ở `http://localhost:5000`
- Frontend thường chạy ở `http://localhost:5173`
- Nếu cổng 5173 đang bị dùng, Vite sẽ tự chuyển sang `5174` hoặc cổng tiếp theo

## 2) Tài khoản manager để đăng nhập (Quan trọng)

Vào trang đăng nhập của web, chọn tab **Staff** rồi dùng một trong các tài khoản sau:

- Username: `manager1`, Password: `password123`

Sau khi đăng nhập xong, hệ thống sẽ đưa vào khu vực quản lý, thường là trang dashboard.



## 3) Cách vào trang API Test ở frontend

Trang test API nằm trong giao diện manager của frontend.

### Cách vào bằng menu ( Quan trọng)

1. Mở frontend ở cổng đang hiện trong terminal, thường là `5173` hoặc `5174`.
2. Đăng nhập bằng tài khoản manager ở trên.
3. Ở thanh menu bên trái, chọn **API Test Monitor**.

### Cách vào trực tiếp bằng đường dẫn

Nếu muốn mở nhanh, có thể vào thẳng đường dẫn:

```text
http://localhost:5173/openapi-test-monitor
```

Nếu frontend đang chạy ở cổng khác thì thay `5173` bằng đúng cổng đang dùng.

### Trên trang này có gì

- Nút tạo lại bộ test OpenAPI từ các controller và comment @openapi
- Nút chạy lại toàn bộ test tự sinh để kiểm tra từng API một cách tự động
- Khu vực xem log của quá trình sinh test và quá trình chạy test, tiện theo dõi khi có lỗi
- Bảng tổng hợp số suite đã sinh, số test pass/fail, trạng thái từng controller và lịch sử các lần chạy trước đó
- Màn hình xem chi tiết từng file test của từng controller để biết chính xác endpoint nào đang pass hay fail
- Phần xem trạng thái hiện tại của tác vụ để biết job đang chạy, đã xong hay bị dừng
- Có thể dừng một tác vụ đang chạy nếu cần kiểm tra lại dữ liệu hoặc chạy lại từ đầu

Nói ngắn gọn, trang này gom toàn bộ luồng sinh test OpenAPI vào giao diện web để giáo viên không phải mở terminal và gõ từng lệnh thủ công.

## 5) Nếu muốn kiểm tra lại test tự sinh  (chạy trong terminal thay vì chạy trên trang web)

Trong terminal gốc của dự án, chạy:

```powershell
npm run test:openapi-generated
```

Trang `API Test Monitor` ở frontend sẽ đọc kết quả mới nhất từ file `server/generated-tests/openapi-results.json`.

## 6) Lưu ý nhỏ

- Nếu không vào được trang manager, hãy chắc chắn đã chọn đúng tab **Staff** khi đăng nhập.
- Nếu frontend đổi sang cổng `5174`, vẫn vào đúng đường dẫn `/openapi-test-monitor` trên cổng đó.
- Nếu backend chưa chạy thì trang API docs sẽ không mở đúng.