# sketchnote.trammb.com

Website tĩnh một trang (HTML/CSS/JS thuần), không cần build, deploy thẳng lên
Vercel hoặc Netlify.

## Cấu trúc

```
index.html            Toàn bộ website — một trang, điều hướng bằng anchor link
admin.html            ⭐ TRANG QUẢN TRỊ — sửa nội dung bằng form, không cần đụng code
admin.css, admin.js   Giao diện và xử lý của trang quản trị
styles.css            Giao diện: giấy kem #F8EFE9 + mực teal #0E5A66, light mode
script.js             Render nội dung + menu + carousel (ít khi cần sửa)
data.js               ⭐ MỌI NỘI DUNG CẦN THAY ĐỔI NẰM Ở ĐÂY
assets/illustrations/ Bộ minh hoạ line-art SVG tự vẽ (thay bằng ảnh thật khi có)
                      scene-hero / scene-band : 2 dải minh hoạ rộng
                      note-*  : hình vuông cho dịch vụ, gallery, khoá học
                      doodle-*: hình trang trí quanh footer
assets/images/        Bỏ ảnh thật vào đây
```

## Font

- Tiêu đề: **Dancing Script** (chữ viết tay)
- Thân bài + menu: **Mulish** (đồng bộ với trammb.com)

Cả hai đều có bộ ký tự tiếng Việt đầy đủ. Lưu ý nếu sau này muốn đổi font
viết tay: nhiều font script trên Google Fonts **không** có tiếng Việt
(Caveat, Sacramento, Kalam, Shadows Into Light...) — chữ có dấu sẽ bị rớt
sang font khác nhìn rất lệch. Các font viết tay CÓ tiếng Việt để chọn thay:
Dancing Script, Pacifico, Lobster, Great Vibes, Playball, Charm, Bad Script,
Sriracha, Mali, Patrick Hand.

## Các mục trên trang

`#top` hero · `#dich-vu` 5 dịch vụ · từng dịch vụ có anchor riêng
(`#day-sketchnote` `#calligraphy` `#training` `#live-recording`
`#ve-theo-yeu-cau`) ·
`#thu-vien` Pinterest · `#feedback` · `#khoa-hoc` Udemy · `#ve-tram` · `#lien-he`

Link gửi thẳng cho khách vẫn dùng được, ví dụ:
`sketchnote.trammb.com/#training` cho công ty muốn đặt training.

## Sửa nội dung — cách dễ (khuyên dùng)

### Cách 1 — Sửa ngay trên web (tiện nhất)

Vào **https://sketchnote.trammb.com/admin.html** → nhập mật khẩu → sửa →
bấm **Lưu**. Nội dung được ghi thẳng lên GitHub, Vercel tự deploy lại sau
khoảng 30 giây. Không cần mở máy tính có sẵn mã nguồn, dùng điện thoại cũng được.

Cần cấu hình 3 biến môi trường trên Vercel (Settings → Environment Variables):

| Biến | Ý nghĩa |
|---|---|
| `ADMIN_PASSWORD` | Mật khẩu đăng nhập trang quản trị |
| `SESSION_SECRET` | Chuỗi ngẫu nhiên dài để ký phiên đăng nhập |
| `GITHUB_TOKEN` | Token GitHub có quyền ghi nội dung repo `trammb/sketchnote` |

Phiên đăng nhập sống 12 tiếng. Cookie dạng HttpOnly + Secure + SameSite=Strict,
token có chữ ký HMAC nên không giả mạo được. Mật khẩu và token GitHub nằm ở
biến môi trường trên máy chủ, không bao giờ gửi xuống trình duyệt.

### Cách 2 — Sửa ở máy

**Bấm đúp file `mo-admin.command`** trong thư mục này.
Nó tự bật máy chủ và mở trang quản trị. Đóng cửa sổ Terminal là tắt máy chủ.

Sửa xong, bấm đúp **`dua-len-mang.command`** để đẩy lên web thật.

(Cách thủ công: chạy `python3 -m http.server 8000` rồi mở
http://localhost:8000/admin.html)

Trang quản trị cho phép sửa mọi nội dung bằng form: thông tin liên hệ, link
Pinterest, 5 dịch vụ, khoá học, feedback, thư viện ảnh. Thêm / xoá / đổi thứ
tự từng mục bằng nút, không cần biết code.

Cách dùng:

1. Sửa nội dung trong các tab.
2. Bấm **Xem trước** để mở web thật với nội dung vừa sửa (có dải báo ở đáy
   trang nhắc rằng đây chỉ là bản nháp).
3. Bấm **💾 Lưu vào data.js** (hoặc nhấn **Ctrl+S** / **Cmd+S**).
4. Đưa lại thư mục lên Netlify/Vercel để khách thấy nội dung mới.

**Lần đầu bấm Lưu**, trình duyệt hỏi chọn file — chọn đúng file `data.js`
trong thư mục web này. Những lần sau bấm Lưu là ghi thẳng, không hỏi lại.
Nút Lưu hiện "✓ Đã lưu" khi chưa có gì thay đổi, chuyển sang
"💾 Lưu vào data.js" khi có sửa đổi chưa lưu.

Vài điểm cần biết:

- Ghi thẳng vào file cần trình duyệt nhân Chromium: **Chrome, Edge, Brave,
  Cốc Cốc**. Trên **Safari và Firefox**, nút Lưu tự chuyển sang tải file
  `data.js` về máy và bạn chép đè thủ công.
- Trong lúc gõ, nội dung còn được tự lưu tạm vào bộ nhớ trình duyệt, nên
  đóng tab mở lại vẫn còn. Nhưng bản tạm đó **không phải** nội dung web thật
  cho tới khi bấm Lưu.
- Tab **Lưu file & sao lưu** có thêm: chọn lại file, bỏ liên kết file, tải
  file về để sao lưu, chép nội dung, nạp lại từ một file `data.js` khác, và
  xoá nháp quay về bản gốc.
- `admin.html` không chứa mật khẩu hay dữ liệu riêng tư, và không sửa được
  web đã deploy — nó chỉ ghi file trên máy bạn. Đưa lên mạng cũng không sao,
  nhưng không muốn ai thấy thì đơn giản là đừng upload 3 file `admin.*`.
- Trang quản trị phải mở qua máy chủ nội bộ (`python3 -m http.server`), mở
  trực tiếp bằng cách nhấp đúp file sẽ không đọc được `data.js`.

## Sửa nội dung — cách thủ công

Mở `data.js` — mọi thứ nằm trong đó, có comment 👉 đánh dấu chỗ cần thay:

- `SITE` — email, Instagram, TikTok, Zalo, link form đăng ký
- `PINTEREST_BOARD_URL` — link board Pinterest
- `SERVICES` — mô tả 5 dịch vụ (gồm "Vẽ theo yêu cầu": vẽ sách, vẽ ly, vẽ minh hoạ)
- `COURSES` — 2 khoá Udemy
- `FEEDBACKS` — thêm feedback mới = copy một khối `{ ... }`
- `LIVE_GALLERY`, `GALLERY_FALLBACK` — ảnh gallery

Chỉ 2 chỗ nằm trong `index.html`: khối ảnh/video demo ở hero và ảnh mục
"Về Trâm" — cả hai đều có comment hướng dẫn ngay bên trên.

## Chạy thử ở máy

```bash
python3 -m http.server 8000
```

Rồi mở:

- Web: http://localhost:8000
- Trang quản trị: http://localhost:8000/admin.html

## Deploy

- **Netlify:** kéo thả cả thư mục vào netlify.com/drop
- **Vercel:** chạy `vercel` trong thư mục này, framework chọn "Other"
- Sau đó trỏ `sketchnote.trammb.com` về bằng một bản ghi CNAME trong DNS
