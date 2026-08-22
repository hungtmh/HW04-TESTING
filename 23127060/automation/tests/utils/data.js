// Nạp dữ liệu test từ file (data-driven). Spec KHÔNG được hardcode mảng case inline (§4.2 SKILL).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { parseCsv } from './csv.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(HERE, '..', 'data');

/**
 * Đọc file JSON trong tests/data/.
 * @param {string} fileName ví dụ 'fr03-reset-cases.json'
 */
export function loadJson(fileName) {
  return JSON.parse(readFileSync(resolve(DATA_DIR, fileName), 'utf8'));
}

/**
 * Đọc file CSV trong tests/data/ -> mảng object.
 * @param {string} fileName ví dụ 'fr03-token-variants.csv'
 */
export function loadCsv(fileName) {
  return parseCsv(readFileSync(resolve(DATA_DIR, fileName), 'utf8'));
}

let seq = 0;

/**
 * Email duy nhất cho mỗi test — tránh đụng nhau khi chạy song song / lặp lại.
 * DB bị DROP mỗi lần restart backend nên không cần cleanup email cũ.
 * @param {string} prefix
 */
export function uniqueEmail(prefix = 'ts') {
  seq += 1;
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now()}-${seq}-${rand}@eshop.test`;
}

/**
 * Tên sản phẩm duy nhất — dùng để định vị đúng dòng trong bảng admin.
 * @param {string} prefix
 */
export function uniqueProductName(prefix = 'PW') {
  seq += 1;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-23127060-${Date.now()}-${seq}${rand}`;
}

/** Ép chuỗi từ CSV về kiểu JS thật ('' -> undefined, '123' -> 123, 'true' -> true, 'null' -> null). */
export function coerce(value) {
  if (value === undefined || value === '') return undefined;
  if (value === 'null') return null;
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  return value;
}
