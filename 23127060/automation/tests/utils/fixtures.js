// Helper dùng chung cho cả 3 spec — gom lại để 3 file spec không định nghĩa lặp cùng một logic.
//
// Vì sao cần: CSDL bị DROP và seed lại mỗi lần backend khởi động (database.js:14-20), nên mọi test
// phải TỰ tạo dữ liệu tiền đề của mình. Trước đây mỗi spec tự viết một hàm `freshUser` riêng với
// hành vi hơi khác nhau; gom về một chỗ để hành vi thống nhất và sửa một lần là xong.
import { createAndLoginUser, registerUser } from './api.js';
import { uniqueEmail } from './data.js';

/**
 * Tạo một user hoàn toàn mới cho riêng 1 test.
 * @param {import('@playwright/test').APIRequestContext} request
 * @param {object} opts
 * @param {string} opts.prefix   tiền tố email, nên đặt theo mã test để dễ truy vết trong CSDL
 * @param {string} opts.password mật khẩu ban đầu (mặc định hợp lệ với regex của FE)
 * @param {boolean} [opts.login=true] có đăng nhập luôn để lấy token hay không
 * @returns {Promise<{email:string,password:string,token?:string,user?:object}>}
 */
export async function freshUser(request, { prefix, password, login = true }) {
  const email = uniqueEmail(prefix);
  if (!login) {
    await registerUser(request, { name: 'PW Fresh User', email, password });
    return { email, password };
  }
  return createAndLoginUser(request, { email, password, name: 'PW Fresh User' });
}

/**
 * Gắn metadata truy vết vào test để HTML report hiển thị được:
 * mã bug liên quan, dòng source làm căn cứ expected, và các assertion pattern đã dùng.
 * @param {import('@playwright/test').TestInfo} testInfo
 * @param {{bug?: string|null, source?: string, patterns?: string[]}} meta
 */
export function annotate(testInfo, { bug, source, patterns } = {}) {
  if (bug) testInfo.annotations.push({ type: 'bug', description: bug });
  if (source) testInfo.annotations.push({ type: 'source', description: source });
  if (patterns?.length) {
    testInfo.annotations.push({ type: 'assertions', description: patterns.join(', ') });
  }
}
