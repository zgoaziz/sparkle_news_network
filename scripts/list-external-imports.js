const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const files = [];
function walk(dir) {
  for (const dirent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (dirent.name === 'node_modules' || dirent.name === '.git' || dirent.name === 'scripts') continue;
    const full = path.join(dir, dirent.name);
    if (dirent.isDirectory()) {
      walk(full);
    } else if (/\.(js|jsx|ts|tsx|mjs|cjs)$/.test(dirent.name)) {
      files.push(full);
    }
  }
}
walk(root);
const pattern = /(?:from\s+['\"]([^'\"]+)['\"]|import\s+.*?['\"]([^'\"]+)['\"]|require\(['\"]([^'\"]+)['\"]\))/g;
const mods = new Set();
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = pattern.exec(text))) {
    const mod = match[1] || match[2] || match[3];
    if (!mod) continue;
    if (/^(\.|\/|\.\.)/.test(mod)) continue;
    mods.add(mod);
  }
}
console.log([...mods].sort().join('\n'));
