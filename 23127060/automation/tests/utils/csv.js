// Parser CSV tối giản — không dùng thư viện ngoài (đề bài không cho thêm dependency nặng).
// Hỗ trợ: header dòng đầu, dấu phẩy phân tách, ô bọc trong "..." (cho phép phẩy và "" escape bên trong).

/**
 * Tách 1 dòng CSV thành mảng ô, tôn trọng dấu ngoặc kép.
 * @param {string} line
 * @returns {string[]}
 */
function splitCsvLine(line) {
  const cells = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];

    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"'; // "" -> literal "
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      cells.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  cells.push(cur);
  return cells.map((c) => c.trim());
}

/**
 * Parse nội dung CSV thành mảng object theo header.
 * Bỏ qua dòng trống và dòng comment bắt đầu bằng '#'.
 * @param {string} text
 * @returns {Record<string, string>[]}
 */
export function parseCsv(text) {
  const lines = text
    .replace(/^﻿/, '') // bỏ BOM nếu có
    .split(/\r?\n/)
    .filter((l) => l.trim() !== '' && !l.trimStart().startsWith('#'));

  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    const row = {};
    headers.forEach((h, i) => {
      row[h] = cells[i] ?? '';
    });
    return row;
  });
}
