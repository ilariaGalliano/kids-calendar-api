// Recursively sanitize all string fields in an object by removing null bytes (\x00)
export function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return obj.replace(/\x00/g, '');
  } else if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  } else if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key of Object.keys(obj)) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
    return sanitized;
  }
  return obj;
}
