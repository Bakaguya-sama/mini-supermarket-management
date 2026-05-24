function inferValidValue(schema = {}, fieldName = '') {
  const lowerName = String(fieldName).toLowerCase();

  if (schema.default !== undefined) {
    return schema.default;
  }

  if (schema.enum && schema.enum.length > 0) {
    return schema.enum[0];
  }

  if (schema.type === 'array') {
    return [inferValidValue(schema.items || {}, fieldName)];
  }

  if (schema.type === 'object' || schema.properties) {
    const result = {};
    const properties = schema.properties || {};
    for (const [childName, childSchema] of Object.entries(properties)) {
      result[childName] = inferValidValue(childSchema || {}, childName);
    }
    return result;
  }

  if (schema.format === 'email' || /email/.test(lowerName)) {
    return 'test@example.com';
  }

  if (schema.format === 'date-time' || /date|_at$/.test(lowerName)) {
    return '2026-01-01T00:00:00.000Z';
  }

  if (schema.pattern && /24/.test(schema.pattern)) {
    return '507f1f77bcf86cd799439012';
  }

  if (schema.type === 'integer') {
    if (schema.minimum !== undefined) {
      return schema.minimum;
    }
    return 1;
  }

  if (schema.type === 'number') {
    if (schema.minimum !== undefined) {
      return schema.minimum;
    }
    return 1.0;
  }

  if (schema.type === 'boolean') {
    return true;
  }

  if (schema.type === 'string') {
    if (/id$|_id$/.test(lowerName)) {
      return '507f1f77bcf86cd799439012';
    }

    if (/phone/.test(lowerName)) {
      return '0901234567';
    }

    if (/code/.test(lowerName)) {
      return 'CODE123';
    }

    if (/status/.test(lowerName) && schema.enum && schema.enum.length > 0) {
      return schema.enum[0];
    }

    if (schema.minLength !== undefined && schema.minLength > 0) {
      return 'x'.repeat(Math.max(schema.minLength, 3));
    }

    return 'test_value';
  }

  if (/id$|_id$/.test(lowerName)) {
    return '507f1f77bcf86cd799439012';
  }

  if (/page|limit/.test(lowerName)) {
    return 1;
  }

  if (/active|enabled/.test(lowerName)) {
    return true;
  }

  return 'test_value';
}

module.exports = {
  inferValidValue,
};