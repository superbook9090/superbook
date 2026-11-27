function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&#x([0-9a-f]+);?/gi, (_, hex: string) => {
      const code = parseInt(hex, 16);
      return Number.isFinite(code) && code >= 0 && code <= 0x10ffff
        ? String.fromCodePoint(code)
        : '';
    })
    .replace(/&#([0-9]+);?/g, (_, dec: string) => {
      const code = parseInt(dec, 10);
      return Number.isFinite(code) && code >= 0 && code <= 0x10ffff
        ? String.fromCodePoint(code)
        : '';
    })
    .replace(/&colon;?/gi, ':')
    .replace(/&tab;?/gi, '\t')
    .replace(/&newline;?/gi, '\n')
    .replace(/&amp;?/gi, '&');
}

function isDangerousUrl(rawValue: string): boolean {
  let decoded = rawValue;
  for (let pass = 0; pass < 3; pass++) {
    const next = decodeHtmlEntities(decoded);
    if (next === decoded) break;
    decoded = next;
  }
  const normalized = decoded.replace(/[\u0000-\u0020\u007f]+/g, '').toLowerCase();
  return (
    normalized.startsWith('javascript:') ||
    normalized.startsWith('vbscript:') ||
    normalized.startsWith('data:')
  );
}

function escapeAttrValue(value: string): string {
  return value
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function findTagEnd(html: string, startIndex: number): number {
  let quote: '"' | "'" | null = null;
  for (let idx = startIndex + 1; idx < html.length; idx++) {
    const ch = html[idx];
    if (quote) {
      if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (ch === '>') {
      return idx;
    }
  }
  return -1;
}

// Lightweight HTML sanitization for server-side use
// Avoids jsdom dependency which causes ESM errors in Next.js 15 + Turbopack
export function sanitizeHtml(html: string): string {
  // Allow only safe tags and attributes (strip style to prevent CSS injection)
  const allowedTags = new Set([
    'p', 'br', 'strong', 'em', 'u', 'i', 'b', 'a', 'ul', 'ol', 'li',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre',
    'span', 'div', 'img', 'table', 'thead', 'tbody', 'tr', 'td', 'th'
  ]);

  const allowedAttrs = new Set([
    'href', 'target', 'rel', 'src', 'alt', 'class', 'id'
  ]);

  let result = '';
  const tagStack: string[] = [];
  let i = 0;

  while (i < html.length) {
    if (html[i] === '<') {
      // Check for closing tag
      if (html[i + 1] === '/') {
        const closeTagEnd = html.indexOf('>', i);
        if (closeTagEnd === -1) {
          result += html[i];
          i++;
          continue;
        }
        const tagName = html.slice(i + 2, closeTagEnd).toLowerCase().trim();
        if (allowedTags.has(tagName)) {
          // Close the tag
          while (tagStack.length > 0 && tagStack[tagStack.length - 1] !== tagName) {
            result += `</${tagStack.pop()}>`;
          }
          if (tagStack.length > 0) {
            tagStack.pop();
            result += `</${tagName}>`;
          }
        }
        i = closeTagEnd + 1;
        continue;
      }

      // Check for opening tag (quote-aware so `>` inside attribute values cannot break tag parsing)
      const tagEnd = findTagEnd(html, i);
      if (tagEnd === -1) {
        result += html[i];
        i++;
        continue;
      }

      const tagContent = html.slice(i + 1, tagEnd);
      const separatorIndex = tagContent.search(/[\s/]/);
      const tagName = (
        separatorIndex === -1 ? tagContent : tagContent.slice(0, separatorIndex)
      )
        .toLowerCase()
        .trim();

      if (allowedTags.has(tagName)) {
        // Sanitize attributes
        let sanitizedAttrs = '';
        if (separatorIndex !== -1) {
          const attrs = tagContent.slice(separatorIndex + 1);
          const attrRegex = /([a-zA-Z][a-zA-Z0-9-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
          let match;
          while ((match = attrRegex.exec(attrs)) !== null) {
            const attrName = match[1].toLowerCase();
            const rawVal = match[2] ?? match[3] ?? '';
            if (allowedAttrs.has(attrName)) {
              if (attrName === 'href' || attrName === 'src') {
                if (isDangerousUrl(rawVal)) {
                  continue; // Skip dangerous URLs
                }
              }
              sanitizedAttrs += ` ${attrName}="${escapeAttrValue(rawVal)}"`;
            }
          }
        }

        // Special handling for self-closing tags
        if (['img', 'br'].includes(tagName)) {
          result += `<${tagName}${sanitizedAttrs} />`;
        } else {
          result += `<${tagName}${sanitizedAttrs}>`;
          tagStack.push(tagName);
        }
      }

      i = tagEnd + 1;
    } else {
      result += html[i];
      i++;
    }
  }

  // Close any remaining open tags
  while (tagStack.length > 0) {
    result += `</${tagStack.pop()}>`;
  }

  return result;
}

export function validateObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

// Escape regex special characters for safe MongoDB $regex matching
export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Sanitize search query
export function sanitizeSearchQuery(query: string): string {
  return query
    .replace(/[{}$]/g, '') // Remove NoSQL operators
    .replace(/[<>]/g, '') // Remove HTML tags
    .trim()
    .substring(0, 100); // Limit length
}
