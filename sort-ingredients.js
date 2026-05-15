const fs = require('fs');

const filePath = 'src/db/data/ingredients.js';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// Locate the DEFAULT_INGREDIENTS array bounds
let arrayStartLine = -1;
let arrayEndLine = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i] === 'const DEFAULT_INGREDIENTS = [') arrayStartLine = i;
  if (lines[i] === ']' && arrayStartLine !== -1 && i > arrayStartLine) {
    arrayEndLine = i;
    break;
  }
}
if (arrayStartLine === -1 || arrayEndLine === -1) {
  console.error('Could not locate DEFAULT_INGREDIENTS array bounds.'); process.exit(1);
}
console.log(`Array spans lines ${arrayStartLine + 1}–${arrayEndLine + 1}`);

// Parse every top-level ingredient object.
// Each one starts on a line that is exactly '  {' and ends when brace depth returns to 0.
const blocks = [];
let currentBlock = null;
let depth = 0;

for (let i = arrayStartLine + 1; i < arrayEndLine; i++) {
  const line = lines[i];

  if (currentBlock === null) {
    if (line === '  {') {
      currentBlock = [line];
      depth = 1;
    }
    // Skip blank lines and section-header comments
  } else {
    currentBlock.push(line);

    // Count braces, skipping quoted string contents
    let inStr = false, strChar = '';
    for (let j = 0; j < line.length; j++) {
      const ch = line[j];
      if (inStr) {
        if (ch === '\\') { j++; continue; }
        if (ch === strChar) inStr = false;
      } else {
        if (ch === '"' || ch === "'") { inStr = true; strChar = ch; }
        else if (ch === '{') depth++;
        else if (ch === '}') depth--;
      }
    }

    if (depth === 0) {
      let bodyStr = currentBlock.join('\n');

      // Fix typo: "spcies" → "spices"
      bodyStr = bodyStr.replace(/department:\s*"spcies"/, 'department: "spices"');

      const nameMatch  = bodyStr.match(/\n\s+name:\s*"([^"]+)"/);
      const deptMatch  = bodyStr.match(/\n\s+department:\s*"([^"]+)"/);
      const name       = nameMatch ? nameMatch[1] : 'zzz_unknown';
      const department = deptMatch ? deptMatch[1] : 'zzz_unknown';

      blocks.push({ body: bodyStr, name, department });
      currentBlock = null;
    }
  }
}

console.log(`Parsed ${blocks.length} ingredients.`);

// Logical store-aisle department order
const DEPT_ORDER = [
  'produce',
  'dairy',
  'butchery',
  'deli',
  'bakery',
  'frozen',
  'pantry',
  'baking',
  'spices',
  'international market',
  'snacks',
  'household',
];
const deptRank = (d) => {
  const idx = DEPT_ORDER.indexOf(d);
  return idx === -1 ? DEPT_ORDER.length : idx; // unknown departments go last
};

// Sort: primary = department (store aisle order), secondary = name A–Z
blocks.sort((a, b) => {
  const dRank = deptRank(a.department) - deptRank(b.department);
  if (dRank !== 0) return dRank;
  return a.name.localeCompare(b.name);
});

// Rebuild file — group by department with a section comment header for each group
const headerLines = lines.slice(0, arrayStartLine + 1);
const footerLines = lines.slice(arrayEndLine);

const chunks = [];
let lastDept = null;

for (const b of blocks) {
  if (b.department !== lastDept) {
    const label = b.department.charAt(0).toUpperCase() + b.department.slice(1);
    const dashes = '─'.repeat(Math.max(2, 74 - label.length));
    chunks.push(`\n  // ── ${label} ${dashes}`);
    lastDept = b.department;
  }
  chunks.push('\n' + b.body);
}

const newContent =
  headerLines.join('\n') + '\n' +
  chunks.join('\n') + '\n\n' +
  footerLines.join('\n');

fs.writeFileSync(filePath, newContent, 'utf8');
console.log(`Done — ${blocks.length} ingredients sorted by department then name.`);

// Print department summary
const deptCounts = {};
for (const b of blocks) deptCounts[b.department] = (deptCounts[b.department] || 0) + 1;
for (const [d, c] of Object.entries(deptCounts)) console.log(`  ${d}: ${c}`);
