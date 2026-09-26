import { en } from './src/i18n/en';
import * as fs from 'fs';
import * as path from 'path';

function getKeys(obj: any, prefix = ''): string[] {
  let keys: string[] = [];
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys = keys.concat(getKeys(obj[key], prefix + key + '.'));
    } else {
      keys.push(prefix + key);
    }
  }
  return keys;
}

const existingKeys = new Set(getKeys(en));

function findTranslationKeys(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.resolve(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(findTranslationKeys(filePath));
    } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const regex = /\bt\(\s*['"]([^'"]+)['"]/g;
      let match;
      while ((match = regex.exec(content)) !== null) {
        results.push(match[1]);
      }
    }
  }
  return results;
}

const allUsedKeys = findTranslationKeys('./src');
const missingKeys = new Set<string>();

for (const key of allUsedKeys) {
  if (!existingKeys.has(key)) {
    missingKeys.add(key);
  }
}

console.log(JSON.stringify(Array.from(missingKeys), null, 2));
