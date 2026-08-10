/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');
const i18nDir = path.join(srcDir, 'i18n');
const enFile = path.join(i18nDir, 'en.ts');
const hiFile = path.join(i18nDir, 'hi.ts');

if (!fs.existsSync(enFile)) {
  console.error(`Could not find en.ts at ${enFile}`);
  process.exit(1);
}

// 1. Get all file contents
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      if (file !== 'i18n') {
        arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
      }
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        arrayOfFiles.push(path.join(dirPath, file));
      }
    }
  });

  return arrayOfFiles;
}

const allSrcFiles = getAllFiles(srcDir);
const fileContents = allSrcFiles.map(f => fs.readFileSync(f, 'utf8')).join('\n');

// 2. Parse en.ts to find all nested keys
function parseKeys(content) {
  const allKeys = [];
  const lines = content.split('\n');
  const stack = []; // { key, indent }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if it's opening a namespace/object: `  name: {`
    const openMatch = line.match(/^(\s*)'?(\w+)'?: {/);
    if (openMatch) {
      const indent = openMatch[1];
      const key = openMatch[2];
      stack.push({ key, indent });
      continue;
    }
    
    // Check if it's closing an object: `  },`
    const closeMatch = line.match(/^(\s*)},?/);
    if (closeMatch) {
      const indent = closeMatch[1];
      if (stack.length > 0 && stack[stack.length - 1].indent === indent) {
        stack.pop();
      }
      continue;
    }
    
    // Check if it's a key-value pair: `    key: 'value',`
    if (stack.length > 0) {
      const kvMatch = line.match(/^(\s*)'?(\w+)'?: /);
      if (kvMatch && !line.match(/^(\s*)'?(\w+)'?: {/)) { // Ensure it's not an object opening
        const key = kvMatch[2];
        const fullKey = [...stack.map(n => n.key), key].join('.');
        allKeys.push({ fullKey, key, namespaces: stack.map(n => n.key), lineIndex: i });
      }
    }
  }
  return allKeys;
}

const enContent = fs.readFileSync(enFile, 'utf8');
const hiContent = fs.readFileSync(hiFile, 'utf8');

const allKeys = parseKeys(enContent);

// 3. Find unused keys
// To avoid breaking dynamic translations (e.g. t('contact.toast.' + status)),
// for each key (e.g. 'contact.toast.success'), we check if the exact string exists,
// OR if any prefix of the key ending in a dot (like 'contact.toast.' or 'contact.') exists in the codebase.

const unusedKeys = [];

for (const keyInfo of allKeys) {
  const { fullKey, namespaces } = keyInfo;
  let isUsed = false;

  // 1. Check exact key
  if (fileContents.includes(`'${fullKey}'`) || fileContents.includes(`"${fullKey}"`) || fileContents.includes(`\`${fullKey}\``)) {
    isUsed = true;
  } else {
    // 2. Check prefixes (e.g. 'contact.toast.success' -> 'contact.toast.', 'contact.')
    let currentPrefix = '';
    for (let i = 0; i < namespaces.length; i++) {
      currentPrefix += namespaces[i] + '.';
      // Check if this prefix exists as a string literal
      if (fileContents.includes(`'${currentPrefix}'`) || fileContents.includes(`"${currentPrefix}"`) || fileContents.includes(`\`${currentPrefix}\``)) {
        isUsed = true;
        break;
      }
    }
  }

  // Also check if it's used in a template literal like `contact.toast.${status}`
  if (!isUsed) {
    let currentPrefix = '';
    for (let i = 0; i < namespaces.length; i++) {
      currentPrefix += namespaces[i] + '.';
      if (fileContents.includes(`\`${currentPrefix}\${`)) {
        isUsed = true;
        break;
      }
    }
  }

  // Some components might pass the key without quotes if they are building it programmatically,
  // but they must have the base string SOMEWHERE.
  // We'll also just check if the full key string exists *anywhere* in the file contents as a fallback, 
  // but restricting to quotes is safer to avoid false positives. 
  // However, the user said we missed `contact.toast.success`. Let's just do a plain string search as a fallback:
  if (!isUsed && fileContents.includes(fullKey)) {
    isUsed = true;
  }

  if (!isUsed) {
    unusedKeys.push(keyInfo);
  }
}

console.log(`Found ${unusedKeys.length} unused keys out of ${allKeys.length} total keys.`);
unusedKeys.forEach(k => console.log(` - ${k.fullKey}`));

// 4. Remove unused keys from files
function removeUnusedKeys(content) {
  const lines = content.split('\n');
  const stack = [];
  const newLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Same parsing logic
    const openMatch = line.match(/^(\s*)'?(\w+)'?: {/);
    if (openMatch) {
      const indent = openMatch[1];
      const key = openMatch[2];
      stack.push({ key, indent });
      newLines.push(line);
      continue;
    }
    
    const closeMatch = line.match(/^(\s*)},?/);
    if (closeMatch) {
      const indent = closeMatch[1];
      if (stack.length > 0 && stack[stack.length - 1].indent === indent) {
        stack.pop();
      }
      newLines.push(line);
      continue;
    }
    
    if (stack.length > 0) {
      const kvMatch = line.match(/^(\s*)'?(\w+)'?: /);
      if (kvMatch && !line.match(/^(\s*)'?(\w+)'?: {/)) {
        const key = kvMatch[2];
        const fullKey = [...stack.map(n => n.key), key].join('.');
        
        if (unusedKeys.some(u => u.fullKey === fullKey)) {
          // Unused, skip pushing this line
          continue;
        }
      }
    }
    
    newLines.push(line);
  }
  
  // Optional cleanup: remove empty namespaces (like `toast: {\n  }`)
  // This is a bit tricky, but we can do a simple pass to remove empty objects
  let cleanedLines = newLines.join('\n');
  let previousCleaned = '';
  while (cleanedLines !== previousCleaned) {
    previousCleaned = cleanedLines;
    cleanedLines = cleanedLines.replace(/^\s*'?\w+'?: \{\s*\},?\n/gm, '');
  }
  
  return cleanedLines;
}

if (unusedKeys.length > 0) {
  const newEnContent = removeUnusedKeys(enContent);
  const newHiContent = removeUnusedKeys(hiContent);
  
  fs.writeFileSync(enFile, newEnContent);
  fs.writeFileSync(hiFile, newHiContent);
  console.log('Successfully removed unused keys from en.ts and hi.ts');
} else {
  console.log('No unused keys found to remove.');
}
