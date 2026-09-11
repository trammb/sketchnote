#!/bin/bash
# ============================================================
# Bấm đúp file này để đưa nội dung vừa sửa lên web thật.
# Vercel sẽ tự deploy lại sau khoảng 30 giây.
# ============================================================

cd "$(dirname "$0")" || exit 1

dong() { echo ""; read -n 1 -s -r -p "  Nhấn phím bất kỳ để đóng..."; echo ""; }

echo ""
echo "  ┌────────────────────────────────────────────────┐"
echo "  │   ĐƯA NỘI DUNG LÊN sketchnote.trammb.com       │"
echo "  └────────────────────────────────────────────────┘"
echo ""

CO_THAY_DOI=""
[ -n "$(git status --porcelain)" ] && CO_THAY_DOI="co"

# Có commit nào chưa đẩy lên GitHub không
git fetch -q origin 2>/dev/null
CHUA_GUI=$(git rev-list --count origin/main..HEAD 2>/dev/null || echo 0)

if [ -z "$CO_THAY_DOI" ] && [ "$CHUA_GUI" = "0" ]; then
  echo "  Không có gì mới để gửi."
  echo "  (Nhớ bấm Lưu trong trang quản trị trước khi chạy file này.)"
  dong
  exit 0
fi

if [ -n "$CO_THAY_DOI" ]; then
  echo "  Những file đã thay đổi:"
  git status --porcelain | sed 's/^/    /'
  echo ""
fi

if [ "$CHUA_GUI" != "0" ]; then
  echo "  Có $CHUA_GUI thay đổi đã lưu từ trước nhưng chưa gửi lên mạng."
  echo ""
fi

read -r -p "  Đưa lên mạng? (g = gửi, phím khác = huỷ): " ok
echo ""

if [ "$ok" != "g" ] && [ "$ok" != "G" ]; then
  echo "  Đã huỷ, chưa gửi gì cả."
  dong
  exit 0
fi

if [ -n "$CO_THAY_DOI" ]; then
  git add -A
  git commit -q -m "Cập nhật nội dung website $(date '+%d/%m/%Y %H:%M')"
  echo "  Đã lưu lại thay đổi."
fi

echo "  Đang gửi lên GitHub..."
if git push -q origin main 2>/dev/null; then
  echo ""
  echo "  ✅ Đã gửi xong."
  echo ""
  echo "  Vercel đang deploy. Khoảng 30 giây nữa mở lại"
  echo "  https://sketchnote.trammb.com là thấy nội dung mới."
else
  echo ""
  echo "  ❌ Gửi không thành công."
  echo "  Kiểm tra kết nối mạng, hoặc nhắn Claude xem giúp."
fi

dong
