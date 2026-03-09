#!/usr/bin/env node
// Import Webflow CSV export → content/blog/*.md
// Usage: node import-csv.js "path/to/Greenfield - Blogs - ....csv"

const fs = require('fs');
const path = require('path');

const csvPath = process.argv[2];
if (!csvPath) {
  console.error('Usage: node import-csv.js <path-to-csv>');
  process.exit(1);
}

// ── CSV parser (RFC 4180) ────────────────────────────────────────────────────
function parseCSV(text) {
  const rows = [];
  let i = 0;
  const n = text.length;

  while (i < n) {
    const row = [];
    while (true) {
      if (text[i] === '"') {
        // Quoted field — collect until closing unescaped quote
        i++;
        let field = '';
        while (i < n) {
          if (text[i] === '"' && text[i + 1] === '"') { field += '"'; i += 2; }
          else if (text[i] === '"') { i++; break; }
          else { field += text[i++]; }
        }
        row.push(field);
      } else {
        // Unquoted field
        let field = '';
        while (i < n && text[i] !== ',' && text[i] !== '\r' && text[i] !== '\n') {
          field += text[i++];
        }
        row.push(field);
      }
      if (i < n && text[i] === ',') { i++; } // next field
      else break; // end of row
    }
    // Consume line ending
    if (i < n && text[i] === '\r') i++;
    if (i < n && text[i] === '\n') i++;
    if (row.length > 0 && row.some(f => f !== '')) rows.push(row);
  }
  return rows;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

// Convert slug like "david-ohana" → "David Ohana"
function slugToName(slug) {
  return slug.trim().split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// "david-ohana; meir-cohen" → "David Ohana, Meir Cohen"
function parseAuthors(raw) {
  if (!raw || !raw.trim()) return 'Greenfield Partners';
  return raw.split(';').map(s => slugToName(s.trim())).join(', ');
}

// "Mon Jan 02 2023 00:00:00 GMT+0000 (...)" → "2023-01-02"
function parseDate(raw) {
  if (!raw || !raw.trim()) return '';
  const d = new Date(raw.trim());
  if (isNaN(d.getTime())) return raw.trim();
  return d.toISOString().slice(0, 10);
}

// Category mapping from Webflow slugs → CMS select options
const CATEGORY_MAP = {
  'content': 'Insights',
  'report': 'Market',
  'investment-release': 'Portfolio',
};

function mapCategory(raw) {
  const key = (raw || '').trim().toLowerCase();
  return CATEGORY_MAP[key] || 'Insights';
}

// YAML-safe double-quoted string (escape backslash + double-quote only)
function yamlStr(s) {
  const escaped = (s || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return `"${escaped}"`;
}

// Sanitize slug to match pattern ^[a-z0-9]+(?:-[a-z0-9]+)*$
function sanitizeSlug(raw) {
  return (raw || '').trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')   // replace non-alphanum/hyphen with hyphen
    .replace(/-+/g, '-')            // collapse consecutive hyphens
    .replace(/^-|-$/g, '');         // strip leading/trailing hyphens
}

// ── Main ─────────────────────────────────────────────────────────────────────
const outDir = path.join(__dirname, 'content', 'blog');
fs.mkdirSync(outDir, { recursive: true });

const raw = fs.readFileSync(csvPath, 'utf8');
const rows = parseCSV(raw);
const [header, ...dataRows] = rows;

// Map header names → column indices
const col = {};
header.forEach((h, i) => { col[h.trim()] = i; });

const COLS = {
  name:        col['Name'],
  slug:        col['Slug'],
  archived:    col['Archived'],
  draft:       col['Draft'],
  publishAt:   col['Publish At (Custom mandatory field)'],
  authors:     col['Authors (Multi ref)'],
  mainImage:   col['Main Image'],
  description: col['Article Description'],
  body:        col['Article Body'],
  category:    col['Blog Category'],
};

let created = 0, skipped = 0;

for (const row of dataRows) {
  const archived = (row[COLS.archived] || '').trim().toUpperCase();
  if (archived === 'TRUE') { skipped++; continue; }

  const title       = (row[COLS.name]        || '').trim();
  const rawSlug     = (row[COLS.slug]        || '').trim();
  const slug        = sanitizeSlug(rawSlug) || sanitizeSlug(title) || `post-${Date.now()}`;
  const draft       = (row[COLS.draft]       || '').trim().toUpperCase() !== 'FALSE';
  const date        = parseDate(row[COLS.publishAt]);
  const author      = parseAuthors(row[COLS.authors]);
  const coverImage  = (row[COLS.mainImage]   || '').trim();
  const excerpt     = (row[COLS.description] || '').trim();
  const body        = (row[COLS.body]        || '').trim();
  const category    = mapCategory(row[COLS.category]);

  const frontmatter = [
    '---',
    `title: ${yamlStr(title)}`,
    `slug: ${slug}`,
    `date: ${date}`,
    `author: ${yamlStr(author)}`,
    `cover_image: ${yamlStr(coverImage)}`,
    `excerpt: ${yamlStr(excerpt)}`,
    `category: ${category}`,
    `draft: ${draft}`,
    '---',
    '',
    body,
    '',
  ].join('\n');

  const outFile = path.join(outDir, `${slug}.md`);
  fs.writeFileSync(outFile, frontmatter, 'utf8');
  console.log(`  ✓ ${slug}.md  [${category}] ${draft ? '(draft)' : ''}`);
  created++;
}

console.log(`\nDone: ${created} posts created, ${skipped} archived posts skipped.`);
console.log(`Output: ${outDir}`);
console.log('\nNext: run "npm run build" to generate the HTML pages.');
