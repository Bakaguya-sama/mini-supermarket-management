const { inferValidValue } = require('./paramInferrer');
const {
  generateF1_TypeViolation,
  generateF2_BoundaryViolations,
  generateF3_RequiredMissing,
  generateF4_FormatViolation,
  generateF5_EnumViolation,
} = require('./faultGenerator');

function buildIdValue(fieldName = '') {
  const lowerName = String(fieldName).toLowerCase();
  if (/page|limit/.test(lowerName)) {
    return 1;
  }

  if (/id$|_id$|accountid|customerid|productid|supplierid|staffid|cartid|invoiceid|orderid|sectionid|shelfid|itemid/.test(lowerName)) {
    return '507f1f77bcf86cd799439012';
  }

  return inferValidValue({}, fieldName);
}

function buildFallbackBody(operationId = '', path = '') {
  const lowerOperationId = String(operationId).toLowerCase();
  const lowerPath = String(path).toLowerCase();

  if (lowerOperationId.includes('registercustomer') || lowerOperationId.includes('createcustomer')) {
    return {
      username: 'generated_customer',
      email: 'generated_customer@example.com',
      full_name: 'Generated Customer',
      phone: '0901234567',
      address: '1 Nguyen Trai',
      password: 'password123',
    };
  }

  if (lowerOperationId.includes('registerstaff') || lowerOperationId.includes('createstaff')) {
    return {
      username: 'generated_staff',
      email: 'generated_staff@example.com',
      full_name: 'Generated Staff',
      phone: '0901234567',
      password: 'password123',
      role: 'staff',
    };
  }

  if (lowerOperationId.includes('login')) {
    return {
      username: 'generated_user',
      password: 'password123',
    };
  }

  if (lowerOperationId.includes('updateprofile')) {
    return {
      full_name: 'Updated User',
      email: 'updated_user@example.com',
      phone: '0901234567',
      address: '1 Nguyen Trai',
    };
  }

  if (lowerOperationId.includes('changepassword')) {
    return {
      current_password: 'password123',
      new_password: 'password456',
    };
  }

  if (lowerOperationId.includes('verifytoken')) {
    return {
      token: 'generated.jwt.token',
    };
  }

  if (lowerOperationId.includes('createproduct') || lowerPath.includes('/products')) {
    return {
      name: 'Generated Product',
      price: 15000,
      quantity: 10,
      status: 'active',
    };
  }

  if (lowerOperationId.includes('createorder') || lowerOperationId.includes('checkoutcart')) {
    return {
      customer_id: '507f1f77bcf86cd799439012',
      cart_id: '507f1f77bcf86cd799439013',
    };
  }

  if (lowerOperationId.includes('createinvoice')) {
    return {
      customer_id: '507f1f77bcf86cd799439012',
      items: [
        {
          product_id: '507f1f77bcf86cd799439014',
          quantity: 1,
          price: 15000,
        },
      ],
    };
  }

  if (lowerOperationId.includes('createsupplier')) {
    return {
      name: 'Generated Supplier',
      email: 'supplier@example.com',
      phone: '0901234567',
      address: '1 Nguyen Trai',
    };
  }

  if (lowerOperationId.includes('createshelf')) {
    return {
      name: 'Generated Shelf',
      category: 'General',
      capacity: 100,
    };
  }

  if (lowerOperationId.includes('createsection')) {
    return {
      name: 'Generated Section',
      description: 'Generated section for tests',
    };
  }

  if (lowerOperationId.includes('createpromotion')) {
    return {
      code: 'PROMO10',
      discount_type: 'percentage',
      discount_value: 10,
    };
  }

  if (lowerOperationId.includes('createfeedback')) {
    return {
      category: 'complaint',
      subject: 'Generated feedback subject',
      detail: 'Generated feedback message for automated tests.',
      customer_id: '507f1f77bcf86cd799439012',
      rating: 5,
    };
  }

  if (lowerOperationId.includes('createdamagedproduct')) {
    return {
      product_id: '507f1f77bcf86cd799439014',
      quantity: 1,
      reason: 'Damaged during transport',
    };
  }

  if (lowerOperationId.includes('createdeliveryorder')) {
    return {
      order_id: '507f1f77bcf86cd799439015',
      staff_id: '507f1f77bcf86cd799439016',
      status: 'pending',
    };
  }

  if (lowerOperationId.includes('createbatches') || lowerOperationId.includes('createbatch')) {
    return {
      product_id: '507f1f77bcf86cd799439014',
      quantity: 1,
      expiry_date: '2026-01-01',
    };
  }

  if (lowerOperationId.includes('additemtocart')) {
    return {
      product_id: '507f1f77bcf86cd799439014',
      quantity: 1,
    };
  }

  if (lowerOperationId.includes('updateitemquantity')) {
    return {
      quantity: 2,
    };
  }

  if (lowerOperationId.includes('applypromo')) {
    return {
      promo_code: 'PROMO10',
    };
  }

  if (lowerOperationId.includes('reassignedelivery')) {
    return {
      staff_id: '507f1f77bcf86cd799439016',
    };
  }

  if (lowerOperationId.includes('markaspaid')) {
    return {
      payment_method: 'cash',
    };
  }

  if (lowerOperationId.includes('update') || lowerOperationId.includes('change')) {
    return {
      status: 'active',
    };
  }

  return {};
}

function buildSchemaFromValue(value) {
  if (Array.isArray(value)) {
    return {
      type: 'array',
      minItems: 1,
      items: buildSchemaFromValue(value[0] ?? 'dummy_value'),
    };
  }

  if (value === null) {
    return { type: 'string' };
  }

  if (typeof value === 'number') {
    return { type: Number.isInteger(value) ? 'integer' : 'number', minimum: value };
  }

  if (typeof value === 'boolean') {
    return { type: 'boolean' };
  }

  if (typeof value === 'object') {
    const properties = {};
    for (const [fieldName, fieldValue] of Object.entries(value)) {
      properties[fieldName] = buildSchemaFromValue(fieldValue);
    }
    return {
      type: 'object',
      properties,
      required: Object.keys(properties),
    };
  }

  if (/email/i.test(String(value))) {
    return { type: 'string', format: 'email' };
  }

  if (/^[0-9a-fA-F]{24}$/.test(String(value))) {
    return { type: 'string', pattern: '^[0-9a-fA-F]{24}$' };
  }

  return { type: 'string', minLength: 3 };
}

function buildFallbackSchema(operation) {
  const body = buildFallbackBody(operation.operationId, operation.path);
  if (Object.keys(body).length === 0) {
    return null;
  }

  const properties = {};
  for (const [fieldName, fieldValue] of Object.entries(body)) {
    properties[fieldName] = buildSchemaFromValue(fieldValue);
  }

  return {
    type: 'object',
    properties,
    required: Object.keys(properties),
  };
}

function extractBodySchema(operationSpec) {
  return operationSpec?.requestBody?.content?.['application/json']?.schema || null;
}

function buildValidObject(schema, fieldName = '') {
  if (!schema || typeof schema !== 'object') {
    return inferValidValue({}, fieldName);
  }

  if (schema.type === 'object' || schema.properties) {
    const body = {};
    const properties = schema.properties || {};
    const propertyNames = Object.keys(properties);
    const namesToUse = propertyNames.length > 0 ? propertyNames : (schema.required || []);

    for (const childName of namesToUse) {
      const childSchema = properties[childName] || {};
      body[childName] = buildValidObject(childSchema, childName);
    }

    return body;
  }

  return inferValidValue(schema, fieldName);
}

function buildValidParamsFromSpec(parameters = []) {
  const pathParams = {};
  const queryParams = {};

  for (const parameter of parameters) {
    const value = inferValidValue(parameter.schema || {}, parameter.name);
    if (parameter.in === 'path') {
      pathParams[parameter.name] = value;
    }
    if (parameter.in === 'query') {
      queryParams[parameter.name] = value;
    }
  }

  return { pathParams, queryParams };
}

function buildValidParamsFromPath(pathPattern) {
  const pathParams = {};
  const queryParams = {};
  const paramRegex = /:([A-Za-z0-9_]+)/g;

  for (const match of pathPattern.matchAll(paramRegex)) {
    pathParams[match[1]] = buildIdValue(match[1]);
  }

  return { pathParams, queryParams };
}

function buildValidBody(operation, operationSpec) {
  const schema = extractBodySchema(operationSpec) || buildFallbackSchema(operation);
  if (!schema) {
    return undefined;
  }

  const method = String(operation.method || '').toLowerCase();
  const fallbackBody = buildFallbackBody(operation.operationId, operation.path);

  const body = buildValidObject(schema);
  if (body && typeof body === 'object' && !Array.isArray(body) && Object.keys(body).length === 0) {
    if (method === 'get') {
      return undefined;
    }

    if (fallbackBody && typeof fallbackBody === 'object' && !Array.isArray(fallbackBody) && Object.keys(fallbackBody).length > 0) {
      return fallbackBody;
    }

    return {};
  }

  if ((body === undefined || body === null) && method !== 'get') {
    if (fallbackBody && typeof fallbackBody === 'object' && !Array.isArray(fallbackBody) && Object.keys(fallbackBody).length > 0) {
      return fallbackBody;
    }

    return {};
  }

  return body;
}

function buildValidParams(operation, operationSpec) {
  const fromSpec = buildValidParamsFromSpec(operationSpec?.parameters || []);
  const fromPath = buildValidParamsFromPath(operation.path);

  return {
    pathParams: { ...fromPath.pathParams, ...fromSpec.pathParams },
    queryParams: { ...fromPath.queryParams, ...fromSpec.queryParams },
  };
}

function buildUrl(pathPattern, pathParams = {}) {
  let url = pathPattern;

  for (const [key, value] of Object.entries(pathParams)) {
    const encodedValue = encodeURIComponent(String(value));
    url = url.replace(new RegExp(`:${key}(?=/|$)`, 'g'), encodedValue);
    url = url.replace(new RegExp(`\{${key}\}`, 'g'), encodedValue);
  }

  return url;
}

function generateNominalTests(operations, spec) {
  const tests = [];

  for (const operation of operations) {
    const operationSpec = spec?.paths?.[operation.path]?.[operation.method.toLowerCase()] || null;
    const { pathParams, queryParams } = buildValidParams(operation, operationSpec);
    const validBody = buildValidBody(operation, operationSpec);

    tests.push({
      name: `[NOMINAL] ${operation.operationId} - happy path`,
      type: 'nominal',
      method: operation.method,
      url: buildUrl(operation.path, pathParams),
      queryParams,
      body: validBody,
      expectStatus: [200, 201, 204],
      operationId: operation.operationId,
    });
  }

  return tests;
}

function generateFaultTests(operations, spec) {
  const tests = [];

  for (const operation of operations) {
    const method = operation.method.toLowerCase();
    if (method === 'get' || method === 'delete') {
      continue;
    }

    const operationSpec = spec?.paths?.[operation.path]?.[operation.method.toLowerCase()] || null;
    const schema = extractBodySchema(operationSpec) || buildFallbackSchema(operation);
    const { pathParams, queryParams } = buildValidParams(operation, operationSpec);
    const validBody = buildValidBody(operation, operationSpec);

    if (!schema || !schema.properties || Object.keys(schema.properties).length === 0) {
      continue;
    }

    const requiredFields = schema.required || [];
    for (const fault of generateF3_RequiredMissing(requiredFields)) {
      const faultyBody = { ...(validBody || {}) };
      delete faultyBody[fault.missingField];

      tests.push({
        name: `[FAULT-F3] ${operation.operationId} - missing:${fault.missingField}`,
        type: 'fault_f3_missing',
        method: operation.method,
        url: buildUrl(operation.path, pathParams),
        queryParams,
        body: faultyBody,
        expectStatus: [400, 422],
        operationId: operation.operationId,
        faultInfo: fault.constraint,
      });
    }

    for (const [fieldName, fieldSchema] of Object.entries(schema.properties)) {
      const f4Value = generateF4_FormatViolation(fieldSchema);
      if (f4Value) {
        tests.push({
          name: `[FAULT-F4] ${operation.operationId} - format:${fieldSchema.format} on ${fieldName}`,
          type: 'fault_f4_format',
          method: operation.method,
          url: buildUrl(operation.path, pathParams),
          queryParams,
          body: { ...(validBody || {}), [fieldName]: f4Value.value },
          expectStatus: [400, 422],
          operationId: operation.operationId,
          faultInfo: f4Value.constraint,
        });
      }

      const f5Value = generateF5_EnumViolation(fieldSchema);
      if (f5Value) {
        tests.push({
          name: `[FAULT-F5] ${operation.operationId} - enum on ${fieldName}`,
          type: 'fault_f5_enum',
          method: operation.method,
          url: buildUrl(operation.path, pathParams),
          queryParams,
          body: { ...(validBody || {}), [fieldName]: f5Value.value },
          expectStatus: [400, 422],
          operationId: operation.operationId,
          faultInfo: f5Value.constraint,
        });
      }
    }
  }

  return tests;
}

module.exports = {
  generateNominalTests,
  generateFaultTests,
};