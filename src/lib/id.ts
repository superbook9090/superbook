/** Normalize Mongo ObjectId, populated refs, or extended JSON to a string id. */
export function toIdString(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    if (typeof obj.$oid === 'string') return obj.$oid;
    if (obj._id != null) return toIdString(obj._id);
    if (typeof obj.toString === 'function') {
      const s = obj.toString();
      if (/^[a-f\d]{24}$/i.test(s)) return s;
    }
  }
  return String(value);
}
