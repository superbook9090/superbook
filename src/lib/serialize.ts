// src/lib/serialize.ts
// Utility function to serialize MongoDB/Mongoose documents for Next.js Client Components

/**
 * Recursively converts MongoDB ObjectIds and other non-serializable objects to plain JSON
 * This is required because Next.js cannot serialize Mongoose documents with ObjectIds when passing to Client Components
 */
export function serialize(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  // Handle ObjectId (has buffer property and toHexString method)
  if (typeof data === 'object' && data !== null) {
    // Check if it's an actual ObjectId instance (has buffer and toHexString method)
    if ('buffer' in data && 'toHexString' in data && typeof (data as { toHexString: () => string }).toHexString === 'function') {
      // It's an ObjectId, convert to string
      return (data as { toString: () => string }).toString();
    }

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map(item => serialize(item));
    }

    // Handle plain objects
    const result: Record<string, unknown> = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        // Skip Mongoose internal properties
        if (key === '__v' || key === '__t') {
          continue;
        }
        result[key] = serialize((data as Record<string, unknown>)[key]);
      }
    }
    return result;
  }

  // Handle Date objects - convert to ISO string
  if (data instanceof Date) {
    return data.toISOString();
  }

  // Handle primitives
  return data;
}

/**
 * Serialize array of documents
 */
export function serializeArray<T>(data: T[]): T[] {
  return data.map(item => serialize(item)) as T[];
}

/**
 * Safe serialization using JSON.parse(JSON.stringify())
 * Use this as a fallback for complex nested objects
 */
export function safeSerialize(data: unknown): unknown {
  try {
    return JSON.parse(JSON.stringify(data));
  } catch (error) {
    console.error('Serialization error:', error);
    return data;
  }
}
