/** Box-drawing and tree-outline characters used in pasted syllabus trees. */
const TREE_CHAR_PATTERN = /[│┃├┣┤┫┬┯┴┷└┗┘┛┌┏┐┓─━]/;

/** Returns true when clipboard text looks like an ASCII/Unicode tree outline. */
export function isTreeLikeText(text: string): boolean {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n').filter((line) => line.trim().length > 0);
  if (lines.length < 2) return false;

  let treeLines = 0;
  for (const line of lines) {
    if (TREE_CHAR_PATTERN.test(line)) {
      treeLines++;
    }
  }

  // At least two structural lines, or one marker line in a multi-line block
  return treeLines >= 2 || (treeLines >= 1 && lines.length >= 3);
}

/** Normalize line endings; keep trailing structure intact. */
export function normalizePasteText(text: string): string {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n+$/, '\n');
}
