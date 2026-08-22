#!/usr/bin/env bash
# Lệnh soạn sẵn để 🧑 Khải tạo GitHub Issue cho từng bug.
#
# CHUẨN BỊ:
#   1. Tạo repo public của riêng Khải, push code lên.
#   2. gh auth login
#   3. cd vào thư mục repo rồi chạy:  bash 23127060/bug-report/gh-issue-commands.sh
#
# Script KHÔNG tự chạy `gh` — nó chỉ IN ra lệnh để Khải xem lại rồi tự chạy.
# Bỏ comment dòng `# eval "$cmd"` nếu muốn tạo Issue hàng loạt.
#
# Ảnh minh chứng nằm trong 23127060/evidence/bugs/ — GitHub CLI không upload ảnh được,
# Khải cần kéo-thả ảnh vào Issue sau khi tạo (hoặc dùng giao diện web).

set -u

REPO="${1:-}"   # tuỳ chọn: truyền owner/repo làm tham số đầu tiên
REPO_FLAG=""
[ -n "$REPO" ] && REPO_FLAG="--repo $REPO"

BUG_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# id | severity | feature | tiêu đề
BUGS=(
  "BUG-03-01|High|FR-03|Regex mat khau cua FE mau thuan voi chinh thong bao loi cua no"
  "BUG-03-02|Critical|FR-03|Ma dat lai mat khau bi tra ve trong HTTP response va hien thang tren UI"
  "BUG-03-03|Critical|FR-03|Ma dat lai chi 4 chu so, khong gioi han so lan thu"
  "BUG-03-04|High|FR-03|/api/forgot-password khong co rate limit"
  "BUG-03-05|Medium|FR-03|Phan biet email ton tai / khong ton tai (user enumeration)"
  "BUG-03-06|High|FR-03|Backend khong kiem tra do manh mat khau - dat duoc mat khau 1 ky tu"
  "BUG-03-07|Critical|FR-03|Mat khau luu plaintext va tra ve qua GET /api/users/me"
  "BUG-03-08|High|FR-03|Dat lai mat khau thanh cong nhung tai khoan van bi khoa"
  "BUG-08-01|Critical|FR-08|Khach hang tu sua tong tien thanh toan ngay tren giao dien"
  "BUG-08-02|High|FR-08|/api/checkout chap nhan tong tien am va tong tien khong phai so"
  "BUG-08-03|Medium|FR-08|Tao duoc don hang tu gio hang rong"
  "BUG-08-04|Critical|FR-08|IDOR - ai cung doc duoc don hang cua nguoi khac, khong can dang nhap"
  "BUG-08-05|High|FR-08|Gio hang khong duoc xoa sau khi thanh toan, dat trung don"
  "BUG-08-06|High|FR-08|Don hang luon duoc luu voi dia chi giao hang rong"
  "BUG-08-07|Critical|FR-08|Ma giam gia phan tram lam TANG tong tien gap 10 lan"
  "BUG-08-08|Medium|FR-08|Don hang dung bang gia tri toi thieu bi tu choi ma giam gia (off-by-one)"
  "BUG-08-09|Medium|FR-08|Gio hang bien mat khi tai lai trang"
  "BUG-15-01|Critical|FR-15|Sua 1 san pham lam toan bo bang doi sang cung mot ten"
  "BUG-15-02|Critical|FR-15|Them/sua/xoa san pham khong can dang nhap"
  "BUG-15-03|Critical|FR-15|Tai khoan nguoi dung thuong tao duoc san pham (khong phan quyen theo role)"
  "BUG-15-04|Medium|FR-15|Chap nhan san pham co ten rong / thieu ten / chi khoang trang"
  "BUG-15-05|High|FR-15|Chap nhan gia am, gia bang chu"
  "BUG-15-06|Medium|FR-15|Gia vuot MAX_SAFE_INTEGER bi sai lech gia tri"
  "BUG-15-07|Medium|FR-15|Xoa san pham khong ton tai van bao thanh cong"
  "BUG-15-08|Medium|FR-15|GET /api/products/:id voi id khong ton tai tra 200 {} thay vi 404"
  "BUG-15-09|High|FR-15|San pham id chan tra price kieu chuoi, id le tra kieu so"
  "BUG-15-10|Medium|FR-15|Chap nhan category_id tro vao danh muc khong ton tai"
  "BUG-15-11|High|FR-15|Payload XSS luu nguyen ven vao CSDL, khong he duoc lam sach"
)

mkdir -p "$BUG_DIR/issue-bodies"

for entry in "${BUGS[@]}"; do
  IFS='|' read -r id sev feature title <<< "$entry"
  body_file="$BUG_DIR/issue-bodies/$id.md"

  # Trích đúng phần chi tiết của bug này ra file body riêng.
  awk -v id="$id" '
    $0 ~ "^## " id " —" { p=1 }
    p && /^---$/ && seen { p=0 }
    p { print; if ($0 ~ "^## " id) seen=1 }
  ' "$BUG_DIR/BUG_REPORT.md" > "$body_file"

  {
    echo ""
    echo "---"
    echo "_Báo cáo bởi 23127060 — Ninh Văn Khải. Chi tiết đầy đủ: \`23127060/bug-report/BUG_REPORT.md\`._"
    echo "_Ảnh minh chứng: \`23127060/evidence/bugs/$id*.png\` (kéo-thả vào Issue này)._"
  } >> "$body_file"

  cmd="gh issue create $REPO_FLAG --title \"[$id][$feature] $title\" --label \"bug,$feature,severity:$(echo "$sev" | tr '[:upper:]' '[:lower:]')\" --body-file \"$body_file\""
  echo "$cmd"
  # eval "$cmd"      # <- bỏ comment nếu muốn tạo Issue thật hàng loạt
done

echo ""
echo "# Đã sinh $((${#BUGS[@]})) file body trong $BUG_DIR/issue-bodies/"
echo "# Lưu ý: label phải tồn tại sẵn trên repo, tạo trước bằng:"
echo "#   gh label create bug --color d73a4a"
echo "#   for f in FR-03 FR-08 FR-15; do gh label create \$f --color 0e8a16; done"
echo "#   for s in critical high medium; do gh label create severity:\$s --color b60205; done"
