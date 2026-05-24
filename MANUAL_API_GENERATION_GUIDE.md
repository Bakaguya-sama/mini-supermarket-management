# Quy Trình Từ Dự Án Bình Thường Đến Tự Sinh Test Case

Tài liệu này mô tả chi tiết, theo từng bước và theo từng file, cách một backend bình thường trong repo này có thể tự sinh test case từ mô tả API nằm trong comment `@openapi` của controller.

Quy trình hiện tại đã được tách theo controller:

- mỗi controller sinh một file YAML riêng trong `server/generated-openapi/`
- mỗi YAML đó sinh một file test riêng trong `server/generated-tests/openapi-generated/`
- generated suites dùng một môi trường mock riêng để không chạm DB/auth thật

Phạm vi chỉ giữ đúng pipeline này:

- `server/package.json`
- `server/controllers/*.js`
- `server/swaggerDef.js`
- `server/server.js`
- `server/test-generator/index.js`
- `server/test-generator/routeScanner.js`
- `server/test-generator/validateSpec.js`
- `server/test-generator/paramInferrer.js`
- `server/test-generator/faultGenerator.js`
- `server/test-generator/testSuiteGenerator.js`
- `server/test-generator/codeGen.js`
- `server/test-generator/generatedTestEnvironment.js`
- `server/generated-openapi/*.yaml`
- `server/generated-tests/openapi-generated/*.test.js`

Các workflow khác như generate test toàn hệ thống, seed, migrate, backfill, hoặc tài liệu API tổng quát không nằm trong chuỗi này.

## 1) Bắt đầu từ một backend bình thường

Nếu không có gì đặc biệt, một backend thường chỉ có 3 phần cần có để bước vào pipeline này:

- thư mục controller chứa handler API
- route mount các controller vào server
- bộ comment mô tả API trong controller

Trong repo này, phần “bình thường” đó đã tồn tại sẵn trong `server/controllers/`, `server/routes/`, và `server/server.js`.

Điểm khác biệt là thay vì viết test thủ công, dự án dùng comment `@openapi` để làm nguồn sinh spec và test.

## 2) Cài dependency ở `server/package.json`

### File: `server/package.json`

Đây là file quyết định backend có thể generate và chạy test hay không.

Các dependency quan trọng cho luồng này là:

- `swagger-jsdoc`: đọc comment OpenAPI trong controller để tạo spec
- `js-yaml`: ghi và đọc `openapi.yaml`
- `jest`: chạy test
- `supertest`: gọi API trong test
- `cross-env`: set `NODE_ENV=test`

Script liên quan trực tiếp tới pipeline này là:

```json
"generate:openapi": "node swaggerDef.js",
"generate:openapi-tests": "node test-generator/index.js",
"test:openapi-generated": "cross-env NODE_ENV=test jest --runInBand --verbose generated-tests/openapi-generated"
```

### Câu lệnh cần chạy

```powershell
cd c:\Users\PC\Documents\GitHub\mini-supermarket-management\server
npm install
```

### Ý nghĩa

`npm install` cài đủ package để các lệnh generate hoạt động. Nếu thiếu các package này, bước đọc comment, sinh YAML, và chạy Jest sẽ không chạy được.

### Kết quả mong đợi

- `node_modules` được tạo trong `server/`
- ba script generate/test ở trên có thể chạy

## 3) Viết comment API trong controller

### File: `server/controllers/customerController.js` và các controller khác

Đây là nguồn vào của cả pipeline.

Ví dụ thực tế trong controller:

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

### Vì sao comment này quan trọng

`swagger-jsdoc` sẽ đọc chính khối comment này. Nếu không có `@openapi`, `server/swaggerDef.js` sẽ không có dữ liệu spec để sinh ra.

### Các phần cần hiểu trong comment

- `@openapi`: đánh dấu đây là block OpenAPI
- `/api/customers`: đường dẫn API
- `get`: HTTP method
- `tags`: nhóm tài nguyên trong docs/spec
- `summary`: mô tả ngắn
- `operationId`: tên định danh để generator nhận diện operation
- `parameters`: tham số path/query
- `requestBody`: body của request nếu có
- `responses`: phản hồi API

### Câu lệnh cần chạy ở bước này

Không có câu lệnh tự động để viết comment. Bước này là bước sửa code thủ công trong controller.

### Kết quả mong đợi

- mỗi endpoint quan trọng có block `@openapi`
- `operationId` khớp với tên hành vi thực tế trong controller
- method và path trong comment khớp với route

## 4) Sinh OpenAPI spec từ controller

### File: `server/swaggerDef.js`

Đây là file biến comment trong controller thành `openapi.yaml`.

Nó hiện tạo hai lớp đầu ra:

- `server/openapi.yaml` cho spec tổng hợp
- `server/generated-openapi/<controller>.yaml` cho spec riêng từng controller

### Hàm chính: `generateOpenApiSpec()`

Các đoạn code quan trọng trong file này là:

```js
const outputPath = path.join(__dirname, 'openapi.yaml');
const controllersDir = path.join(__dirname, 'controllers');
```

Hai dòng này xác định:

- nơi ghi spec đầu ra là `server/openapi.yaml`
- nơi quét source OpenAPI comment là `server/controllers/`

Tiếp theo là phần lấy danh sách file controller:

```js
const apiFiles = fs
	.readdirSync(controllersDir)
	.filter((file) => file.endsWith('.js') && !file.endsWith('.OLD.js'))
	.map((file) => path.join(controllersDir, file));
```

Ý nghĩa:

- đọc tất cả file `.js` trong controllers
- bỏ qua file backup kiểu `.OLD.js`
- tạo danh sách file để `swagger-jsdoc` quét

Phần cấu hình OpenAPI:

```js
const spec = swaggerJsdoc({
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'Mini Supermarket API',
			version: '1.0.0',
			description: 'API cho hệ thống quản lý siêu thị mini',
		},
		servers: [{ url: 'http://localhost:5000' }],
		components: {
			schemas: {
				IdParam: { ... },
				PaginationQuery: { ... },
				ErrorResponse: { ... },
			},
		},
	},
	apis: apiFiles,
});
```

Ý nghĩa từng phần:

- `openapi: '3.0.0'`: phiên bản spec
- `info`: metadata của API
- `servers`: base URL của server
- `components.schemas`: schema dùng chung
- `apis`: các file controller cần được scan comment

Cuối cùng là ghi file YAML:

```js
fs.writeFileSync(outputPath, yaml.dump(spec), 'utf8');
```

Nghĩa là object spec được chuyển sang YAML và ghi ra đĩa.

### Câu lệnh cần chạy

```powershell
npm run generate:openapi
```

### Kết quả mong đợi

- file `server/openapi.yaml` được tạo mới hoặc cập nhật
- file `server/generated-openapi/<controller>.yaml` được tạo cho từng controller
- comment OpenAPI từ controller đã được gom vào một spec duy nhất

### Cách kiểm tra nhanh

```powershell
Get-Content .\openapi.yaml -TotalCount 40
```

## 5) Từ `server.js` đến route scanner

### File: `server/server.js`

File này không sinh test trực tiếp, nhưng nó rất quan trọng vì `routeScanner.js` dùng nó để biết route nào được mount ở đâu.

Trong `server.js` có các dòng kiểu:

```js
app.use("/api/customers", require("./routes/customerRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
```

Ý nghĩa:

- `server.js` khai báo route prefix thật của API
- `routeScanner.js` sẽ đọc các dòng này để ghép route file với mount path

Nếu `server.js` đổi mount path mà chưa regenerate, test generated có thể đi sai URL.

Trong pipeline mới, file này vẫn quan trọng cho việc mount thật của app, nhưng nguồn chính để sinh test đã chuyển sang YAML riêng của từng controller trong `server/generated-openapi/`.

## 6) Quét route theo controller

### File: `server/test-generator/routeScanner.js`

Đây là file quyết định test generator biết endpoint nào thuộc controller nào.

Trong pipeline mới, đây là lớp tham khảo lịch sử. Test generator đọc trực tiếp YAML riêng từng controller thay vì dựa vào scan route để quyết định output.

### Hàm 1: `parseMountMap(serverFilePath)`

Hàm này đọc `server.js` và tìm các dòng `app.use('/api/...', require('./routes/...'))`.

Code lõi:

```js
const routeRegex = /app\.use\(\s*['"]([^'"]+)['"]\s*,\s*require\(\s*['"]\.\/routes\/([^'"]+)['"]\s*\)\s*\)/g;
```

Ý nghĩa:

- bắt ra `mountPath` như `/api/customers`
- bắt ra route file như `customerRoutes.js`

Sau đó file build một `Map` để biết route file nào được mount ở path nào.

### Hàm 2: `parseControllerAliases(routeFilePath)`

Hàm này đọc file route để biết handler nào đang trỏ tới controller nào.

Ví dụ route có thể viết như:

```js
const customerController = require('../controllers/customerController');
```

Hoặc destructuring:

```js
const { getAllCustomers, getCustomerById } = require('../controllers/customerController');
```

Hàm này gom các alias đó vào map để sau đó suy ra controller file.

### Hàm 3: `extractHandlerExpression(routeLine)`

Hàm này lấy expression handler ở cuối dòng route, ví dụ:

```js
router.get('/customer/:id', customerController.getCustomerById);
```

Nó sẽ trích ra `customerController.getCustomerById`.

### Hàm 4: `resolveControllerFile(handlerExpression, aliasMap, fallbackControllerFile)`

Hàm này quyết định file controller nào sở hữu endpoint đó.

Logic chính:

- nếu có alias, lấy theo alias
- nếu tên token kết thúc bằng `Controller`, coi đó là file controller tương ứng
- nếu không suy ra được, dùng fallback

### Hàm 5: `scanRouteFile(filePath, mountPaths)`

Đây là hàm tạo danh sách operation thực tế.

Mỗi operation chứa:

- `path`: đường dẫn đầy đủ
- `method`: GET/POST/PUT/PATCH/DELETE
- `operationId`: tên hàm handler
- `controllerFile`: controller gốc
- `routePath`: path tương đối trong route file
- `routeFile`: tên file route

### Hàm 6: `scanRoutes()` và `scanRoutesByController()`

`scanRoutes()` quét toàn bộ route.

`scanRoutesByController()` nhóm operation theo controller để generator tạo test theo từng controller.

### Câu lệnh liên quan

Không chạy riêng file này trong quy trình thường ngày. Nó được gọi gián tiếp khi chạy:

```powershell
npm run generate:openapi-tests
```

### Kết quả mong đợi

- generator biết route nào thuộc controller nào
- file test được sinh đúng theo nhóm controller

## 7) Kiểm tra spec trước khi sinh test

### File: `server/test-generator/validateSpec.js`

File này chặn những spec lỗi trước khi sinh test.

### Hàm `validateSpec(specPath)`

Đầu tiên nó đọc YAML:

```js
spec = yaml.load(fs.readFileSync(specPath, 'utf8'));
```

Nếu YAML sai cú pháp, script dừng ngay.

Sau đó kiểm tra các field bắt buộc:

```js
if (!spec.openapi) errors.push('Thiếu field: openapi');
if (!spec.info?.title) errors.push('Thiếu field: info.title');
if (!spec.info?.version) errors.push('Thiếu field: info.version');
```

Rồi nó duyệt từng path/method và kiểm tra:

- `operationId` có tồn tại không
- `responses` có ít nhất một response không

Nếu lỗi, script in ra danh sách lỗi và dừng bằng `process.exit(1)`.

### Vì sao bước này cần thiết

Nếu không validate, test generator có thể sinh test dựa trên spec hỏng và lỗi sẽ khó đọc hơn.

### Câu lệnh liên quan

Không chạy riêng file này trong luồng bình thường. Nó được gọi bên trong:

```powershell
npm run generate:openapi-tests
```

### Kết quả mong đợi

- spec hợp lệ mới được dùng để sinh test
- controller nào thiếu `operationId` hoặc response sẽ bị báo lỗi sớm

## 8) Sinh test data và fault test

### File: `server/test-generator/testSuiteGenerator.js`

Đây là file tạo ra nội dung test case thật.

Nó chia thành 2 nhóm:

- test happy path / nominal
- test lỗi / fault

### Các hàm hỗ trợ chính

#### `paramInferrer.js`

File này chịu trách nhiệm suy ra giá trị hợp lệ từ schema. Nó được dùng để sinh dữ liệu nominal cho path param, query param, và các field con trong object body.

Hàm chính là `inferValidValue(schema, fieldName)`.

Nó ưu tiên theo thứ tự:

- `default` nếu schema có sẵn giá trị mặc định
- `enum[0]` nếu field là enum
- giá trị hợp lệ cho `array`, `object`, `email`, `date-time`, `pattern`, `integer`, `number`, `boolean`, `string`
- heuristic theo tên field như `id`, `phone`, `status`, `page`, `limit`

Mục tiêu của file này là tạo ra dữ liệu hợp lệ ổn định để nominal test đi đúng đường chính.

#### `faultGenerator.js`

File này sinh dữ liệu lỗi có chủ đích cho fault test.

Các hàm chính:

- `generateF1_TypeViolation(schema)`
- `generateF2_BoundaryViolations(schema)`
- `generateF3_RequiredMissing(requiredFields)`
- `generateF4_FormatViolation(schema)`
- `generateF5_EnumViolation(schema)`

Ý nghĩa:

- F1: đổi kiểu dữ liệu sai
- F2: vượt ngưỡng tối thiểu/tối đa hoặc độ dài danh sách/chuỗi
- F3: xóa field bắt buộc
- F4: làm sai format hoặc pattern
- F5: đưa giá trị không thuộc enum

Trong pipeline hiện tại, generator chỉ giữ những fault test có độ tin cậy cao hơn để tránh làm pass rate tụt mạnh vì app thật không chặn hết mọi kiểu lỗi lý thuyết.

#### `buildIdValue(fieldName)`

Hàm này tạo giá trị hợp lệ cho field kiểu ID hoặc page/limit.

Ví dụ:

- field chứa `page`, `limit` → trả về `1`
- field kết thúc bằng `id` → trả về Mongo ObjectId mẫu như `507f1f77bcf86cd799439012`

#### `buildFallbackBody(operationId, path)`

Hàm này tạo body mẫu khi spec chưa mô tả đủ chi tiết.

Ví dụ:

- `createCustomer` → tạo body có `username`, `email`, `full_name`, `phone`, `address`, `password`
- `createProduct` → tạo body có `name`, `price`, `quantity`, `status`
- `login` → tạo body có `username`, `password`
- `updateProfile` → tạo body có `full_name`, `email`, `phone`, `address`
- `changePassword` → tạo body có `current_password`, `new_password`
- `verifyToken` → tạo body có `token`

Ý nghĩa của fallback là giúp generator vẫn có body hợp lệ để test happy path.

#### `buildSchemaFromValue(value)`

Hàm này đoán schema từ một giá trị mẫu.

Ví dụ:

- số nguyên → `{ type: 'integer' }`
- email → `{ type: 'string', format: 'email' }`
- chuỗi 24 ký tự hex → ObjectId pattern

#### `buildFallbackSchema(operation)`

Hàm này biến body fallback thành schema OpenAPI tương ứng.

#### `buildValidObject(schema, fieldName)`

Hàm này tạo object hợp lệ theo schema.

Nếu schema là object, nó đi qua từng property để tạo giá trị con.
Nếu schema request body chỉ là `type: object` rỗng, generator sẽ dùng fallback body theo `operationId` và `path` để tránh gửi request rỗng cho các route body-based như `auth`, `cart`, `order`, `invoice`, `supplier`.

#### `buildValidParamsFromSpec(parameters)` và `buildValidParamsFromPath(pathPattern)`

Hai hàm này tạo param hợp lệ cho:

- path params như `:id`, `:customerId`
- query params như `page`, `limit`

### Hàm sinh test chính

#### `generateNominalTests(operations, spec)`

Hàm này tạo test happy path.

Mỗi test sẽ có:

- tên dạng `[NOMINAL] <operationId> - happy path`
- method thật của route
- URL thật của route
- body hợp lệ nếu cần
- expected status là `[200, 201, 204]`

Ý nghĩa:

- đây là test xác nhận API hoạt động với input đúng

#### `generateFaultTests(operations, spec)`

Hàm này tạo test lỗi theo các nhóm fault.

Các nhóm fault gồm:

- F1: sai kiểu dữ liệu
- F2: vi phạm giới hạn boundary
- F3: thiếu field bắt buộc
- F4: sai format
- F5: sai enum

Hiện tại generator ưu tiên F3/F4/F5 và chỉ sinh fault từ schema có property cụ thể. Những route body quá chung chung sẽ không bị ép sinh fault loại suy đoán, vì dạng đó thường làm test giả fail nhiều hơn giá trị kiểm tra thực.

Luồng chung của fault test:

1. lấy schema của request body từ spec
2. nếu không có schema thì dùng fallback schema
3. với từng field, sinh một hoặc nhiều trường hợp lỗi
4. expected status là `[400, 422]`

### Ví dụ đọc từ file generated

Trong file test sinh ra, bạn sẽ thấy kiểu test như:

```js
test("[NOMINAL] createCustomer - happy path", async () => {
	const res = await request(app)
		.post("/api/customers")
		.set('Content-Type', 'application/json')
		.send({
			"name": "testuser",
			"email": "test@example.com",
			"status": "active"
		});

	expect([200, 201, 204]).toContain(res.status);
});
```

Và fault test kiểu:

```js
test("[FAULT] createCustomer - missing required field 'name'", async () => {
	const res = await request(app)
		.post("/api/customers")
		.set('Content-Type', 'application/json')
		.send({});

	expect([400, 422]).toContain(res.status);
});
```

### Câu lệnh liên quan

File này được gọi gián tiếp khi chạy:

```powershell
npm run generate:openapi-tests
```

### Kết quả mong đợi

- test được sinh tự động theo route và schema
- mỗi endpoint có cả test đúng và test lỗi

## 9) Ghi file test bằng codeGen

### File: `server/test-generator/generatedTestEnvironment.js`

Đây là môi trường mock chỉ dùng cho generated suites.

Nó chặn các phần dễ làm test đụng runtime thật:

- middleware auth/role
- repository layer
- models
- logger

Mục tiêu là để test sinh ra chạy ổn định mà không cần DB thật.

### File: `server/test-generator/codeGen.js`

File này chịu trách nhiệm biến mảng test case thành file Jest thực tế.

### Hàm `formatQuery(queryParams)`

Nếu có query params, nó trả về chuỗi:

```js
.query({...})
```

Nếu không có query, nó trả về chuỗi rỗng.

### Hàm `formatBody(body)`

Nếu có body, nó trả về chuỗi:

```js
.send({...})
```

Nếu body rỗng, nó trả về chuỗi rỗng.

### Hàm `generateJestFile(controllerName, nominalTests, faultTests, outputPath)`

Đây là hàm tạo file cuối cùng.

Nó làm các việc sau:

1. gộp `nominalTests` và `faultTests`
2. tính đường dẫn import tới `server`
3. tạo từng block `test(...)`
4. viết file ra `outputPath`

Header file test luôn cho biết:

- controller nào đang được test
- có bao nhiêu nominal test
- có bao nhiêu fault test
- tổng số test

### Kết quả đầu ra

Ví dụ file được tạo ra:

- `server/generated-tests/openapi-generated/customerController.test.js`

Trong đó thường có dạng:

```js
const request = require('supertest');
require('../../test-generator/generatedTestEnvironment');
const app = require('../../server');

describe("customerController generated API suite", () => {
	test(...);
	test(...);
});
```

### Câu lệnh liên quan

Không chạy riêng file này. Nó chạy khi dùng:

```powershell
npm run generate:openapi-tests
```

## 10) File điều phối toàn bộ pipeline

### File: `server/test-generator/index.js`

Đây là file chính nối tất cả bước lại với nhau.

### Luồng chính trong `run()`

#### Bước 1: xác định spec và output

```js
const specPath = path.resolve(__dirname, '..', 'openapi.yaml');
const outputDir = path.resolve(__dirname, '..', 'generated-tests', 'openapi-generated');
```

Nó xác định:

- spec đầu ra là `openapi.yaml`
- nơi ghi test là `generated-tests/openapi-generated`

#### Bước 2: tạo lại OpenAPI spec

```js
generateOpenApiSpec();
```

Nghĩa là mỗi lần generate test, spec luôn được tạo lại trước.

#### Bước 3: validate spec

```js
const spec = validateSpec(specPath);
```

Nếu spec lỗi, quá trình dừng ở đây.

#### Bước 4: đọc YAML theo controller

```js
const specFiles = listYamlSpecs(specDir);
```

Kết quả là danh sách file YAML riêng từng controller.

#### Bước 5: sinh test cho từng controller

Với mỗi YAML:

```js
const operations = extractOperationsFromSpec(spec);
const nominalTests = generateNominalTests(operations, spec);
const faultTests = generateFaultTests(operations, spec);
generateJestFile(controllerName, nominalTests, faultTests, outputPath);
```

Ý nghĩa:

- `generateNominalTests`: tạo test đúng
- `generateFaultTests`: tạo test sai
- `generateJestFile`: ghi file test

### Câu lệnh cần chạy

```powershell
npm run generate:openapi-tests
```

### Kết quả mong đợi

- `openapi.yaml` được tạo lại
- test được sinh ra trong `generated-tests/openapi-generated`
- mỗi controller có một file test riêng

## 11) Chạy test đã generate

### Lệnh

```powershell
npm run test:openapi-generated
```

### File thực thi

Lệnh này chạy Jest trên:

```powershell
server/generated-tests/openapi-generated
```

### Ý nghĩa

Đây là bước kiểm tra cuối của pipeline. Nếu test pass, nghĩa là:

- comment `@openapi` đủ để sinh spec
- spec đủ để sinh test
- route đang khớp với test sinh ra

### Nếu test fail thì thường do

- `operationId` sai hoặc thiếu
- path trong comment không khớp route thật
- requestBody không đúng với controller
- route được mount khác với đường dẫn trong comment

## 12) Chu trình thực tế từ đầu đến cuối

Nếu bạn làm thủ công một vòng đầy đủ, thứ tự đúng là:

```powershell
cd c:\Users\PC\Documents\GitHub\mini-supermarket-management\server
npm install
npm run generate:openapi
npm run generate:openapi-tests
npm run test:openapi-generated
```

## 13) Diễn giải ngắn gọn toàn bộ luồng dữ liệu

1. Bạn viết comment `@openapi` trong controller.
2. `server/swaggerDef.js` đọc comment và tạo `openapi.yaml`.
3. `server/test-generator/index.js` gọi lại generate spec và validate spec.
4. `server/test-generator/index.js` đọc YAML riêng từng controller và gom operations từ spec đó.
5. `server/test-generator/testSuiteGenerator.js` tạo nominal test và fault test.
6. `server/test-generator/codeGen.js` ghi file Jest vào `generated-tests/openapi-generated`.
7. `server/test-generator/generatedTestEnvironment.js` mock runtime cho generated suites.
8. `npm run test:openapi-generated` chạy test cuối cùng.

## 14) Điều cần nhớ khi đọc code

- `server/controllers/*.js` là nguồn vào
- `server/swaggerDef.js` biến comment thành spec
- `server/test-generator/*.js` biến spec thành test
- `server/generated-openapi/*.yaml` là spec trung gian theo controller
- `server/generated-tests/openapi-generated/*.test.js` là sản phẩm cuối

## 15) Kết quả kiểm thử hiện tại

Lần chạy validation gần nhất cho generated suites cho ra:

- `125` test pass
- `29` test fail
- tổng `154` test
- pass rate khoảng `81.2%`

Pipeline đã chạy end-to-end và đã vượt mốc `80%`.

Các lỗi còn lại tập trung nhiều ở các controller như `cartController`, `customerController`, `deliveryOrderController`, `invoiceController`, `productController`, và `productShelfController`.

Nếu muốn tiếp tục đẩy pass rate lên cao hơn nữa, hướng đúng là làm rõ mô tả `@openapi` và khớp body/validation theo controller thật, thay vì sửa tay các file test đã generate.

Nếu muốn sửa hoặc mở rộng pipeline này, chỉ cần bám vào bốn điểm đó.

