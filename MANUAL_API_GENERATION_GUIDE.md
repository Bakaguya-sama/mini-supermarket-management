# Quy Trình Sinh Test Case Tự Động Từ OpenAPI Comment

Tài liệu này mô tả toàn bộ quá trình sinh test case tự động trong repo này, từ comment `@openapi` trong controller cho đến file Jest được ghi ra trong `server/generated-tests/openapi-generated/`.

Mục tiêu của quy trình là:

1. Lấy mô tả API ngay trong controller làm nguồn sự thật.
2. Sinh OpenAPI YAML từ comment đó.
3. Dùng YAML để tạo dữ liệu test hợp lệ và test lỗi.
4. Ghi ra file test chạy được bằng Jest + Supertest.
5. Chạy test để kiểm tra endpoint thật của backend.

## 1) Bức tranh tổng thể

Pipeline được thiết kế theo chuỗi sau:

```text
Controller comment @openapi
    ↓
swaggerDef.js
    ↓
server/openapi.yaml
server/generated-openapi/<controller>.yaml
    ↓
validateSpec.js
    ↓
paramInferrer.js + faultGenerator.js
    ↓
testSuiteGenerator.js
    ↓
codeGen.js
    ↓
server/generated-tests/openapi-generated/<controller>.test.js
    ↓
Jest + Supertest + generatedTestEnvironment.js
```

Ý nghĩa từng lớp:

- `controller` là nguồn dữ liệu gốc.
- `swaggerDef.js` biến comment thành YAML OpenAPI.
- `validateSpec.js` chặn spec lỗi trước khi sinh test.
- `paramInferrer.js` sinh giá trị hợp lệ.
- `faultGenerator.js` sinh biến thể lỗi.
- `testSuiteGenerator.js` quyết định test nào sẽ được tạo.
- `codeGen.js` ghi file Jest.
- `generatedTestEnvironment.js` mock các phần runtime khó kiểm soát.

## 2) Điều kiện đầu vào

### File: `server/package.json`

Muốn sinh test được, repo cần các dependency và script sau:

- `swagger-jsdoc`: đọc comment `@openapi`
- `js-yaml`: ghi và đọc YAML
- `jest`: chạy test sinh ra
- `supertest`: gọi HTTP endpoint trong test
- `cross-env`: set `NODE_ENV=test`

Script liên quan trực tiếp:

```json
"generate:openapi": "node swaggerDef.js",
"generate:openapi-tests": "node test-generator/index.js",
"test:openapi-generated": "cross-env NODE_ENV=test jest --runInBand --verbose --json --outputFile=generated-tests/openapi-results.json --silent generated-tests/openapi-generated"
```

### Câu lệnh chuẩn bị

```powershell
cd c:\Users\PC\Documents\GitHub\mini-supermarket-management\server
npm install
```

## 3) Nguồn vào của pipeline: comment `@openapi`

### File: `server/controllers/*.js`

Mỗi endpoint muốn sinh test phải được mô tả bằng block `@openapi` trong controller.

Ví dụ:

```js
/**
 * @openapi
 * /api/customers:
 *   get:
 *     tags: [customer]
 *     summary: Get all customers with pagination and filtering
 *     operationId: getAllCustomers
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *     responses:
 *       200:
 *         description: Successfully retrieved customers
 */
```

Các phần quan trọng trong comment:

- `@openapi`: đánh dấu block OpenAPI.
- path như `/api/customers`: đường dẫn API.
- method như `get`, `post`, `put`, `patch`, `delete`.
- `operationId`: tên định danh để generator nhận biết operation.
- `parameters`: query/path parameter.
- `requestBody`: schema cho body.
- `responses`: phản hồi hợp lệ của endpoint.

Quy tắc quan trọng:

- `operationId` phải có.
- `operationId` nên duy nhất trong toàn bộ spec.
- method và path trong comment phải khớp route thật.

## 4) Sinh OpenAPI spec từ controller

### File: `server/swaggerDef.js`

Đây là file chính biến comment `@openapi` thành YAML.

#### Hàm `buildSpec(apiFiles)`

Hàm này gọi `swagger-jsdoc` để quét danh sách file controller và xây dựng object spec OpenAPI 3.0.0.

Các phần cấu hình chính:

- `openapi: '3.0.0'`
- `info`: title, version, description
- `servers`: base URL của server
- `components.schemas`: các schema dùng chung
- `apis`: danh sách file controller cần quét

#### Hàm `writeYamlSpec(outputPath, spec)`

Hàm này tạo thư mục đích nếu cần, sau đó ghi object spec ra file YAML.

#### Hàm `generateOpenApiSpec()`

Đây là điểm trung tâm của bước sinh spec.

Luồng thực tế:

1. Đọc toàn bộ file `.js` trong `server/controllers/`.
2. Bỏ qua file backup dạng `.OLD.js`.
3. Tạo spec tổng hợp từ tất cả controller và ghi vào `server/openapi.yaml`.
4. Xóa sạch `server/generated-openapi/` cũ.
5. Tạo lại từng file YAML riêng cho từng controller.

Kết quả đầu ra:

- `server/openapi.yaml`: spec tổng hợp của toàn bộ backend.
- `server/generated-openapi/<controller>.yaml`: spec riêng từng controller.

### Câu lệnh sinh spec

```powershell
npm run generate:openapi
```

### Ví dụ kết quả mong đợi

- `openapi.yaml` có `paths`, `components`, `info`.
- `generated-openapi/customerController.yaml` chỉ chứa endpoint của `customerController`.
- `generated-openapi/productController.yaml` chỉ chứa endpoint của `productController`.

## 5) Kiểm tra spec trước khi sinh test

### File: `server/test-generator/validateSpec.js`

File này chặn các spec lỗi trước khi bước sinh test chạy tiếp.

#### Hàm `validateSpec(specPath)`

Hàm này làm ba việc chính:

1. Đọc file YAML từ đĩa bằng `js-yaml`.
2. Kiểm tra các field nền tảng như `openapi`, `info.title`, `info.version`.
3. Duyệt từng path/method và kiểm tra `operationId` cùng `responses`.

Nếu YAML sai cú pháp, hàm dừng ngay với lỗi rõ ràng.

Nếu spec thiếu dữ liệu quan trọng, hàm gom lỗi và dừng bằng `process.exit(1)`.

Các lỗi mà hàm có thể bắt:

- thiếu `openapi`
- thiếu `info.title`
- thiếu `info.version`
- operation không có `operationId`
- operation không có `responses`

Mục tiêu của bước này là tránh sinh test từ spec hỏng, vì test hỏng sẽ khó truy vết hơn nhiều.

## 6) Sinh giá trị hợp lệ cho test nominal

### File: `server/test-generator/paramInferrer.js`

File này sinh dữ liệu hợp lệ từ schema.

#### Hàm `inferValidValue(schema, fieldName)`

Đây là hàm nền tảng để tạo giá trị mặc định cho path param, query param, và các field trong body.

Quy tắc ưu tiên:

1. Dùng `default` nếu schema có sẵn.
2. Dùng phần tử đầu tiên của `enum` nếu có.
3. Sinh giá trị theo `type` và `format`.
4. Dùng heuristic theo tên field như `id`, `phone`, `status`, `page`, `limit`.

Ví dụ hành vi:

- `integer` → sinh số nguyên hợp lệ.
- `number` → sinh số hợp lệ.
- `boolean` → sinh `true`.
- `email` → sinh `test@example.com`.
- `date-time` → sinh chuỗi ISO hợp lệ.
- field kết thúc bằng `id` → sinh ObjectId 24 ký tự hex.
- field `page`, `limit` → sinh `1`.

Mục đích của file này là giữ cho nominal test đi đúng đường chính với dữ liệu ổn định và ít ngẫu nhiên.

## 7) Sinh biến thể lỗi có chủ đích

### File: `server/test-generator/faultGenerator.js`

File này sinh các payload lỗi để kiểm tra validation của endpoint.

#### Các hàm chính

- `generateF1_TypeViolation(schema)`
- `generateF2_BoundaryViolations(schema)`
- `generateF3_RequiredMissing(requiredFields)`
- `generateF4_FormatViolation(schema)`
- `generateF5_EnumViolation(schema)`

#### Ý nghĩa từng nhóm fault

- F1: đổi sai kiểu dữ liệu.
- F2: vượt giới hạn `minimum`, `maximum`, `minLength`, `maxLength`, `minItems`.
- F3: xóa field bắt buộc.
- F4: làm sai format hoặc pattern.
- F5: đưa giá trị không thuộc `enum`.

Trong code hiện tại, các fault được ưu tiên theo mức độ đáng tin cậy, đặc biệt là F3, F4, F5. Điều này giúp giảm tình trạng sinh ra lỗi lý thuyết nhưng backend thật không chặn như kỳ vọng.

## 8) Tạo danh sách test case

### File: `server/test-generator/testSuiteGenerator.js`

Đây là file quyết định test case nào sẽ được sinh ra từ spec.

#### Dữ liệu hợp lệ cho body và params

Các hàm phụ trong file này phối hợp để tạo request hợp lệ:

- `buildIdValue(fieldName)`: sinh giá trị hợp lệ cho field kiểu ID hoặc page/limit.
- `buildFallbackBody(operationId, path)`: tạo body mẫu nếu schema chưa mô tả đủ.
- `buildSchemaFromValue(value)`: đoán schema từ một giá trị mẫu.
- `buildFallbackSchema(operation)`: biến fallback body thành schema OpenAPI.
- `buildValidObject(schema, fieldName)`: tạo object hợp lệ theo schema.
- `buildValidParamsFromSpec(parameters)`: lấy path/query param từ spec.
- `buildValidParamsFromPath(pathPattern)`: parse path template như `:id`.
- `buildValidBody(operation, operationSpec)`: tạo body hợp lệ cho request.
- `buildValidParams(operation, operationSpec)`: kết hợp params từ spec và từ path.
- `buildUrl(pathPattern, pathParams)`: thay placeholder path bằng giá trị thật.

#### Hàm `generateNominalTests(operations, spec)`

Hàm này tạo test happy path.

Mỗi test nominal có:

- tên dạng `[NOMINAL] <operationId> - happy path`
- method HTTP thật
- URL thật
- query/body hợp lệ nếu cần
- `expectStatus: [200, 201, 204]`

#### Hàm `generateFaultTests(operations, spec)`

Hàm này tạo test lỗi.

Đặc điểm chính:

- chỉ sinh fault cho method không phải `GET` hoặc `DELETE`
- chỉ sinh khi schema có `properties`
- dùng `required` để tạo case thiếu field
- dùng schema `format` để tạo case sai format
- dùng `enum` để tạo case sai enum

Các test fault thường mang `expectStatus: [400, 422]`.

#### Hình dạng test case đầu ra

Một test case nominal có thể giống như:

```js
{
  name: '[NOMINAL] getAllCustomers - happy path',
  method: 'GET',
  url: '/api/customers',
  queryParams: { page: 1, limit: 10 },
  body: undefined,
  expectStatus: [200, 201, 204]
}
```

Một test case fault có thể giống như:

```js
{
  name: '[FAULT-F5] createCustomer - enum on status',
  method: 'POST',
  url: '/api/customers',
  body: { ... },
  expectStatus: [400, 422]
}
```

## 9) Ghi file Jest từ test case

### File: `server/test-generator/codeGen.js`

File này biến các test case đã sinh thành file `.test.js` thực tế.

#### Hàm `formatQuery(queryParams)`

- Nếu có query params, hàm trả về `.query({...})`.
- Nếu không có, hàm trả về chuỗi rỗng.

#### Hàm `formatBody(body)`

- Nếu có body, hàm trả về `.send({...})`.
- Nếu body rỗng hoặc không có, hàm trả về chuỗi rỗng.

#### Hàm `generateJestFile(controllerName, nominalTests, faultTests, outputPath)`

Đây là hàm ghi file cuối cùng.

Luồng của hàm:

1. Gộp nominal và fault tests thành một danh sách.
2. Tính đường dẫn import tới `server` và `generatedTestEnvironment`.
3. Tạo từng block `test(...)`.
4. Ghi file ra `outputPath`.

Mỗi file test được sinh ra sẽ có phần header như:

```js
/**
 * AUTO-GENERATED TEST FILE
 * Generated by server/test-generator
 * Do not edit manually.
 */
```

Và thường có cấu trúc:

```js
const request = require('supertest');
require('../../test-generator/generatedTestEnvironment');
const app = require('../../server');

describe('customerController generated API suite', () => {
  test(...);
});
```

### Ví dụ thực tế từ file sinh ra

Trong `server/generated-tests/openapi-generated/customerController.test.js`, có thể thấy rõ:

- nominal test gọi `GET /api/customers`
- fault test tạo payload thiếu field, sai format, hoặc sai enum
- assertion cuối dùng `expect([200, 201, 204]).toContain(res.status)` cho nominal
- assertion cuối dùng `expect([400, 422]).toContain(res.status)` cho fault

## 10) Môi trường mock cho generated suites

### File: `server/test-generator/generatedTestEnvironment.js`

File này làm nhiệm vụ chặn các phần runtime thật để generated test chạy ổn định hơn.

#### Các lớp được mock

- middleware auth
- logger
- tracing
- models
- repositories
- services

#### Cách hoạt động

File này gọi `applyMocks()` ngay khi được import.

Bên trong `applyMocks()`:

1. Nó đọc danh sách file trong `repositories/` và `services/`.
2. Nó dùng `jest.mock(...)` hoặc `jest.doMock(...)` để thay thế implementation thật.
3. Nó tạo mock động cho models bằng proxy.
4. Nó cung cấp các hành vi mặc định để route có thể chạy mà không cần DB thật.

#### Một số mock quan trọng

- `mockAuthMiddleware()`: gán user giả và bỏ qua kiểm tra quyền.
- `mockLogger()`: ghi log dạng no-op.
- `mockTracing()`: bỏ qua trace và callback wrapping.
- `mockCreateModel()`: mô phỏng các method kiểu `find`, `findById`, `create`, `updateOne`, `deleteMany`.
- `mockCreateRepository()`: mô phỏng repository layer.
- `mockCreateService()`: mô phỏng service layer cho nhiều domain như customer, order, invoice, product, supplier, staff, feedback, delivery, shelf, promotion, batch, stock, damaged product.

Mục tiêu của file này là giữ cho generated test tập trung vào contract API, thay vì phụ thuộc vào database hoặc hệ thống ngoài.

## 11) Output cuối cùng của pipeline

### Spec trung gian

- `server/openapi.yaml`
- `server/generated-openapi/<controller>.yaml`

### Test sinh ra

- `server/generated-tests/openapi-generated/<controller>.test.js`

### Ví dụ tên file thực tế

- `customerController.test.js`
- `productController.test.js`
- `invoiceController.test.js`
- `orderController.test.js`
- `cartController.test.js`
- `staffController.test.js`

### Dạng test trong file output

- nominal test: happy path
- fault test: thiếu field, sai format, sai enum

## 12) Chạy test đã sinh

### Lệnh

```powershell
npm run test:openapi-generated
```

### Ý nghĩa

Lệnh này chạy Jest trên thư mục `server/generated-tests/openapi-generated/` và ghi kết quả ra `generated-tests/openapi-results.json`.

### Khi test pass

Điều đó cho thấy:

- comment `@openapi` khớp route thật
- spec YAML hợp lệ
- test case sinh ra có thể chạy được trên app thật
- mock environment đã giảm nhiễu từ DB/auth/logging

### Khi test fail

Nguyên nhân thường gặp:

- `operationId` trong comment không khớp handler thật
- path trong YAML không khớp route mount
- body spec quá lỏng hoặc quá chặt
- backend thật không trả status đúng như schema kỳ vọng

## 13) Chu trình end-to-end chuẩn

Nếu pipeline đầy đủ được nối lại, thứ tự hợp lý sẽ là:

```powershell
cd c:\Users\PC\Documents\GitHub\mini-supermarket-management\server
npm install
npm run generate:openapi
npm run generate:openapi-tests
npm run test:openapi-generated
```

## 14) Trạng thái thực tế của repo hiện tại

Có một điểm rất quan trọng cần nói rõ để tránh hiểu sai:

- `server/test-generator/index.js` hiện đang **trống**.
- Nghĩa là script `generate:openapi-tests` đã được khai báo trong `package.json`, nhưng phần điều phối toàn bộ chuỗi sinh test chưa có mã thực thi trong file đó.

Các module nền đã có sẵn và rõ vai trò:

- `validateSpec.js` kiểm tra YAML.
- `paramInferrer.js` sinh dữ liệu hợp lệ.
- `faultGenerator.js` sinh dữ liệu lỗi.
- `testSuiteGenerator.js` dựng danh sách nominal/fault test.
- `codeGen.js` ghi file Jest.
- `generatedTestEnvironment.js` tạo môi trường mock.

Vì vậy, tài liệu này mô tả **quy trình sinh test case đúng theo thiết kế của các module hiện có**, đồng thời phản ánh trung thực rằng file điều phối hiện chưa được cài đặt trong repo.

## 15) Tóm tắt ngắn gọn

1. Viết comment `@openapi` trong controller.
2. Chạy `swaggerDef.js` để sinh `openapi.yaml` và YAML theo controller.
3. Dùng `validateSpec.js` để chặn spec lỗi.
4. Dùng `paramInferrer.js` và `faultGenerator.js` để tạo dữ liệu hợp lệ và dữ liệu lỗi.
5. Dùng `testSuiteGenerator.js` để tạo nominal test và fault test.
6. Dùng `codeGen.js` để ghi file Jest.
7. Dùng `generatedTestEnvironment.js` để mock runtime.
8. Chạy `npm run test:openapi-generated` để xác nhận kết quả.

## 16) Các lệnh cần chạy

Nếu muốn chạy trọn quy trình từ đầu đến cuối, dùng đúng thứ tự này:

```powershell
# 1. Vào thư mục server
cd c:\Users\PC\Documents\GitHub\mini-supermarket-management\server

# 2. Cài dependency nếu chưa có hoặc muốn làm mới môi trường
npm install

# 3. Sinh OpenAPI spec từ comment @openapi trong controller
npm run generate:openapi

# 4. Sinh test case từ spec
npm run generate:openapi-tests

# 5. Chạy toàn bộ test đã sinh
npm run test:openapi-generated
```

Nếu đang đứng ở thư mục gốc workspace, có thể gọi trực tiếp bằng proxy script đã thêm ở root:

```powershell
npm run generate:openapi
npm run generate:openapi-tests
npm run test:openapi-generated
```
