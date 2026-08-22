// Reporter tuỳ biến — đóng dấu banner chống gian lận (§11 đề bài) vào index.html của HTML report.
//
// LÝ DO TỒN TẠI: Playwright 1.62 KHÔNG còn dùng option `title` của html reporter để ghi vào
// index.html (đã kiểm chứng: `report.json` trong blob base64 có `title: null`, `<title>` vẫn là
// "Playwright Test Report", `grep 23127060 index.html` ⇒ 0 kết quả). Metadata thì có được nhúng,
// nhưng nằm trong zip base64 nên không grep được và không nhìn thấy ngay khi mở report.
//
// Reporter này chạy SAU html reporter (đăng ký sau nó trong mảng `reporter`) và chèn:
//   1. <title> mang banner  -> hiện trên tab trình duyệt, grep được
//   2. một thẻ <div> banner  -> nhìn thấy ngay khi mở report, dùng để chụp màn hình minh chứng
//
// KHÔNG bịa số liệu: mọi giá trị đều lấy từ chính lần chạy vừa kết thúc (metadata + stats thật).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const STUDENT_ID = '23127060';
const STUDENT_NAME = 'Ninh Văn Khải';

const escapeHtml = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export default class BannerReporter {
  onBegin(config) {
    this.config = config;
    this.counts = { passed: 0, failed: 0, flaky: 0, skipped: 0, total: 0 };
  }

  onTestEnd(test, result) {
    this.counts.total += 1;
    if (result.status === 'passed' && test.outcome() === 'flaky') this.counts.flaky += 1;
    else if (result.status === 'passed') this.counts.passed += 1;
    else if (result.status === 'skipped') this.counts.skipped += 1;
    else this.counts.failed += 1;
  }

  async onEnd(result) {
    const reportDir = process.env.PW_REPORT_DIR || 'playwright-report/local';
    const indexPath = resolve(this.config.rootDir, '..', reportDir, 'index.html');

    if (!existsSync(indexPath)) {
      console.warn(`[banner-reporter] Không thấy ${indexPath} — bỏ qua việc đóng dấu.`);
      return;
    }

    const meta = this.config.metadata || {};
    const runAt = meta['Run at (ISO)'] || new Date().toISOString();
    const feature = meta.feature || 'all';
    const projects = this.config.projects.map((p) => p.name).join(', ');
    const banner = `Run by: ${STUDENT_ID} — ${runAt}`;

    const bannerHtml = `
    <div id="hw04-run-banner" style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;
         background:#0f172a;color:#f8fafc;padding:14px 20px;border-bottom:3px solid #22c55e;
         font-size:14px;line-height:1.6">
      <strong style="font-size:16px">${escapeHtml(banner)}</strong><br>
      Sinh viên: ${escapeHtml(STUDENT_NAME)} — MSSV ${STUDENT_ID} ·
      Feature: <code>${escapeHtml(feature)}</code> ·
      Browser: <code>${escapeHtml(projects)}</code><br>
      Kết quả thật: ${this.counts.passed} passed · ${this.counts.failed} failed ·
      ${this.counts.flaky} flaky · ${this.counts.skipped} skipped ·
      tổng ${this.counts.total} test · ${(result.duration / 1000).toFixed(1)}s ·
      status <code>${escapeHtml(result.status)}</code>
    </div>`;

    let html = readFileSync(indexPath, 'utf8');
    html = html.replace(
      /<title>[^<]*<\/title>/,
      `<title>${escapeHtml(banner)} · ${escapeHtml(feature)}</title>`,
    );
    html = html.replace("<div id='root'></div>", `${bannerHtml}\n    <div id='root'></div>`);
    writeFileSync(indexPath, html, 'utf8');

    console.log(`[banner-reporter] Đã đóng dấu "${banner}" vào ${reportDir}/index.html`);
  }
}
