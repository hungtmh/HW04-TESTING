const fs = require('fs');
const path = require('path');

/**
 * Minimal RFC-4180-ish CSV reader (quoted fields, escaped "" inside quotes).
 * Written by hand instead of pulling in csv-parse: the data files are small and
 * the assignment only requires that test data live outside the spec files.
 */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  // Normalise line endings so a file saved on Windows parses identically.
  const src = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];

    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') inQuotes = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else field += ch;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }

  return rows.filter(r => r.some(c => c.trim() !== ''));
}

/** Reads a CSV file into an array of objects keyed by the header row. */
function readCsv(relativePath) {
  const abs = path.resolve(__dirname, '..', 'data', relativePath);
  const rows = parseCsv(fs.readFileSync(abs, 'utf8'));
  if (!rows.length) throw new Error(`CSV data file is empty: ${abs}`);

  const header = rows[0].map(h => h.trim());
  return rows.slice(1).map(cells => {
    const obj = {};
    header.forEach((key, idx) => { obj[key] = (cells[idx] ?? '').trim(); });
    return obj;
  });
}

/** Reads a JSON data file from tests/data/. */
function readJson(relativePath) {
  const abs = path.resolve(__dirname, '..', 'data', relativePath);
  return JSON.parse(fs.readFileSync(abs, 'utf8'));
}

module.exports = { parseCsv, readCsv, readJson };
