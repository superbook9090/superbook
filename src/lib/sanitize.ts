// Lightweight HTML sanitization for server-side use
// Avoids jsdom dependency which causes ESM errors in Next.js 15 + Turbopack
export function sanitizeHtml(html: string): string {
  // Allow only safe tags and attributes
  const allowedTags = new Set([
    'p', 'br', 'strong', 'em', 'u', 'i', 'b', 'a', 'ul', 'ol', 'li',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre',
    'span', 'div', 'img', 'table', 'thead', 'tbody', 'tr', 'td', 'th'
  ]);

  const allowedAttrs = new Set([
    'href', 'target', 'rel', 'src', 'alt', 'class', 'id', 'style'
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

      // Check for opening tag
      const tagEnd = html.indexOf('>', i);
      if (tagEnd === -1) {
        result += html[i];
        i++;
        continue;
      }

      const tagContent = html.slice(i + 1, tagEnd);
      const spaceIndex = tagContent.indexOf(' ');
      const tagName = (spaceIndex === -1 ? tagContent : tagContent.slice(0, spaceIndex)).toLowerCase().trim();

      if (allowedTags.has(tagName)) {
        // Sanitize attributes
        let sanitizedAttrs = '';
        if (spaceIndex !== -1) {
          const attrs = tagContent.slice(spaceIndex + 1);
          const attrRegex = /([a-zA-Z-]+)=["']([^"']*)["']/g;
          let match;
          while ((match = attrRegex.exec(attrs)) !== null) {
            const attrName = match[1].toLowerCase();
            if (allowedAttrs.has(attrName)) {
              // Additional security for href
              if (attrName === 'href') {
                const hrefValue = match[2].toLowerCase();
                if (hrefValue.startsWith('javascript:') || hrefValue.startsWith('data:')) {
                  continue; // Skip dangerous hrefs
                }
              }
              sanitizedAttrs += ` ${attrName}="${match[2]}"`;
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

// Sanitize search query
export function sanitizeSearchQuery(query: string): string {
  return query
    .replace(/[{}$]/g, '') // Remove NoSQL operators
    .replace(/[<>]/g, '') // Remove HTML tags
    .trim()
    .substring(0, 100); // Limit length
}
