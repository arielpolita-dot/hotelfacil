export function validateId(id, name) {
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    throw new Error(`${name} is required and must be a non-empty string`);
  }
  if (id.includes('/')) {
    throw new Error(`${name} must not contain path separators`);
  }
}

export function validateRequired(value, name) {
  if (value === null || value === undefined || (typeof value === 'string' && value.trim().length === 0)) {
    throw new Error(`${name} is required`);
  }
}
