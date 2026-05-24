function generateF1_TypeViolation(schema = {}) {
  const type = schema.type;

  if (type === 'string') return 123;
  if (type === 'integer' || type === 'number') return 'wrong_type';
  if (type === 'boolean') return 'wrong_type';
  if (type === 'array') return {};
  if (type === 'object') return 'wrong_type';

  return null;
}

function generateF2_BoundaryViolations(schema = {}) {
  const faults = [];

  if (schema.minLength !== undefined) {
    faults.push({
      constraint: `String too short (minLength: ${schema.minLength})`,
      value: 'x'.repeat(Math.max(0, schema.minLength - 1)),
    });
  }

  if (schema.maximum !== undefined) {
    faults.push({
      constraint: `Number exceeds maximum`,
      value: schema.maximum + 100,
    });
  }

  if (schema.minimum !== undefined) {
    faults.push({
      constraint: `Number below minimum`,
      value: schema.minimum - 1,
    });
  }

  if (schema.maxLength !== undefined) {
    faults.push({
      constraint: `String too long (maxLength: ${schema.maxLength})`,
      value: 'x'.repeat(schema.maxLength + 1),
    });
  }

  if (schema.minItems !== undefined) {
    faults.push({
      constraint: `Array has too few items (minItems: ${schema.minItems})`,
      value: [],
    });
  }

  return faults;
}

function generateF3_RequiredMissing(requiredFields = []) {
  return requiredFields.map((field) => ({
    missingField: field,
    constraint: 'Missing required field',
  }));
}

function generateF4_FormatViolation(schema = {}) {
  if (schema.format === 'email') {
    return { constraint: 'Invalid email format', value: 'not-an-email' };
  }

  if (schema.format === 'date-time') {
    return { constraint: 'Invalid date-time format', value: 'not-a-date' };
  }

  if (schema.pattern) {
    return { constraint: `Pattern violation: ${schema.pattern}`, value: 'invalid_value' };
  }

  return null;
}

function generateF5_EnumViolation(schema = {}) {
  if (!schema.enum || schema.enum.length === 0) {
    return null;
  }

  return {
    constraint: `Enum violation: expected one of [${schema.enum.join(', ')}]`,
    value: '__invalid_enum__',
  };
}

module.exports = {
  generateF1_TypeViolation,
  generateF2_BoundaryViolations,
  generateF3_RequiredMissing,
  generateF4_FormatViolation,
  generateF5_EnumViolation,
};