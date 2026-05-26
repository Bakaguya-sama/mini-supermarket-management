const fs = require('fs');
const yaml = require('js-yaml');

function validateSpec(specPath) {
  const errors = [];

  let spec;
  try {
    spec = yaml.load(fs.readFileSync(specPath, 'utf8'));
  } catch (error) {
    console.error('❌ YAML syntax lỗi:', error.message);
    process.exit(1);
  }

  if (!spec.openapi) errors.push('Thiếu field: openapi');
  if (!spec.info?.title) errors.push('Thiếu field: info.title');
  if (!spec.info?.version) errors.push('Thiếu field: info.version');

  for (const [routePath, pathItem] of Object.entries(spec.paths || {})) {
    for (const method of ['get', 'post', 'put', 'delete', 'patch']) {
      const operation = pathItem[method];
      if (!operation) continue;

      if (!operation.operationId) {
        errors.push(`❌ Path '${routePath}' ${method.toUpperCase()}: Missing operationId`);
      }

      if (!operation.responses || Object.keys(operation.responses).length === 0) {
        errors.push(`❌ Path '${routePath}' ${method.toUpperCase()}: Không có response nào`);
      }
    }
  }

  if (errors.length > 0) {
    console.error('\nValidation thất bại:');
    for (const error of errors) {
      console.error(' ', error);
    }
    console.error('\n→ Quay lại controller, sửa @openapi comment tương ứng\n');
    process.exit(1);
  }

  console.log('✅ Spec hợp lệ! Tổng paths:', Object.keys(spec.paths || {}).length);
  return spec;
}

module.exports = {
  validateSpec,
};