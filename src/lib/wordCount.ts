/**
 * Accurately calculates word count for text or HTML content.
 */
export function countWords(content: string): number {
  if (!content) return 0;
  // Strip HTML tags if present
  const strippedText = content.replace(/<[^>]*>/g, ' ');
  const words = strippedText.trim().split(/\s+/).filter(Boolean);
  return words.length;
}
