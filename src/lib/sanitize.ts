import DOMPurify from 'isomorphic-dompurify';

// Sanitize HTML content to prevent XSS attacks
export function sanitizeHtml(html: string, options?: Record<string, unknown>): string {
  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'i', 'b', 'a', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre',
      'span', 'div', 'img', 'table', 'thead', 'tbody', 'tr', 'td', 'th'
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'src', 'alt', 'class', 'id', 'style'
    ],
    KEEP_CONTENT: true,
    ...options,
  });
  return sanitized as unknown as string;
}

// Sanitize text input to prevent injection
export function sanitizeText(text: string): string {
  return text
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim();
}

// Validate and sanitize ObjectId
export function validateObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

// Sanitize user input for queries to prevent NoSQL injection
export function sanitizeQueryValue(value: unknown): unknown {
  if (typeof value === 'string') {
    // Remove potential NoSQL injection operators
    return value.replace(/^\$/, '');
  }
  if (typeof value === 'object' && value !== null) {
    // Recursively sanitize nested objects
    const sanitized: Record<string, unknown> = {};
    for (const key in value) {
      // Skip keys that look like MongoDB operators
      if (!key.startsWith('$')) {
        sanitized[key] = sanitizeQueryValue((value as Record<string, unknown>)[key]);
      }
    }
    return sanitized;
  }
  return value;
}

// Sanitize search query
export function sanitizeSearchQuery(query: string): string {
  return query
    .replace(/[{}$]/g, '') // Remove NoSQL operators
    .replace(/[<>]/g, '') // Remove HTML tags
    .trim()
    .substring(0, 100); // Limit length
}
