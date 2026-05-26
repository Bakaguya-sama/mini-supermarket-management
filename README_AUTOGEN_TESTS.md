# Mô tả các bước thực hiện phầntự sinh test case OpenAPI

Tài liệu này chỉ giữ đúng một luồng chạy từ đầu đến cuối để giáo viên có thể copy một lần và chạy luôn.

## Cách chạy từ đầu ( Thầy copy hết vào terminal rùi chạy là xong luôn ạ! Nếu thầy muốn xóa file .yaml và file test cũ thì chạy lệnh tổng hợp ở phần dưới cùng ạ!)

Mở PowerShell ở thư mục gốc của dự án rồi chạy đúng các lệnh sau theo thứ tự:

```powershell
npm install ; npm run install:client ; npm run install:server ; npm run generate:openapi ; npm run generate:openapi-tests ; npm run test:openapi-generated
```

Nếu muốn nhìn rõ từng bước thì dùng danh sách này:

- `npm install` (cài package gốc của dự án)
- `npm run install:client` (cài dependency cho frontend)
- `npm run install:server` (cài dependency cho backend)
- `Remove-Item server\generated-openapi\*.yaml -Force -ErrorAction SilentlyContinue` (xóa YAML cũ)
- `Remove-Item server\generated-tests\openapi-generated\*.test.js -Force -ErrorAction SilentlyContinue` (xóa test cũ)
- `npm run generate:openapi` (sinh file OpenAPI)
- `npm run generate:openapi-tests` (sinh test tự động)
- `npm run test:openapi-generated` (chạy toàn bộ test tự sinh)

Các package như `swagger-jsdoc`, `js-yaml` và các package OpenAPI khác không cần viết lệnh riêng, vì chúng đã được khai báo sẵn trong `package.json` và sẽ được cài bằng `npm install` ở đúng thư mục.

## Lệnh tổng hợp ( thêm phần xóa file cũ)

Chỉ cần paste đúng dòng này vào Terminal là chạy từ đầu đến cuối:

npm install ; npm run install:client ; npm run install:server ; Remove-Item server\generated-openapi\*.yaml -Force -ErrorAction SilentlyContinue ; Remove-Item server\generated-tests\openapi-generated\*.test.js -Force -ErrorAction SilentlyContinue ; npm run generate:openapi ; npm run generate:openapi-tests ; npm run test:openapi-generated


## Kết quả sau khi chạy

- File OpenAPI tổng hợp: `server/openapi.yaml`
- File OpenAPI theo từng controller: `server/generated-openapi/*.yaml`
- Test tự sinh: `server/generated-tests/openapi-generated/*.test.js`
- Kết quả test: `server/generated-tests/openapi-results.json`