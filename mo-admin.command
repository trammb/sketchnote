#!/bin/bash
# ============================================================
# Bấm đúp file này để mở trang quản trị nội dung.
# Nó bật máy chủ nội bộ rồi tự mở trình duyệt.
# Đóng cửa sổ Terminal này là tắt máy chủ.
# ============================================================

cd "$(dirname "$0")" || exit 1

PORT=8000
while lsof -i :$PORT >/dev/null 2>&1; do
  PORT=$((PORT + 1))
done

echo ""
echo "  ┌────────────────────────────────────────────────┐"
echo "  │   TRANG QUẢN TRỊ — VẼ CÙNG TRÂM                 │"
echo "  └────────────────────────────────────────────────┘"
echo ""
echo "  Quản trị:  http://localhost:$PORT/admin.html"
echo "  Xem web:   http://localhost:$PORT"
echo ""
echo "  Sửa xong nhớ bấm nút Lưu (hoặc Cmd+S) trong trang quản trị."
echo "  Muốn đưa lên mạng thì chạy thêm file  dua-len-mang.command"
echo ""
echo "  ⚠️  ĐỪNG ĐÓNG CỬA SỔ NÀY trong lúc đang dùng."
echo "     Đóng cửa sổ = tắt máy chủ."
echo ""

python3 -m http.server "$PORT" >/dev/null 2>&1 &
SERVER_PID=$!
trap 'kill $SERVER_PID 2>/dev/null; echo ""; echo "  Đã tắt máy chủ."; echo ""' EXIT

sleep 1
open "http://localhost:$PORT/admin.html"

wait $SERVER_PID
