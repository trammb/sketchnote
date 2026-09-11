/* ============================================================
   data.js — TOÀN BỘ NỘI DUNG BẠN CẦN TỰ SỬA NẰM Ở FILE NÀY
   Sửa xong lưu lại là web tự cập nhật, không cần đụng vào HTML.

   Lưu ý về hình ảnh: hiện tại web đang dùng bộ hình minh hoạ SVG
   trong assets/illustrations/. Khi có ảnh sketchnote thật, chỉ cần
   bỏ ảnh vào assets/images/ rồi đổi đường dẫn bên dưới.
   ============================================================ */

/* ------------------------------------------------------------
   1) THÔNG TIN LIÊN HỆ & MẠNG XÃ HỘI
   👉 THAY: link Instagram, TikTok, email, Zalo
------------------------------------------------------------ */
const SITE = {
  email: "hello@trammb.com",                        // 👉 THAY email thật
  instagram: "https://instagram.com/YOUR_USERNAME", // 👉 THAY link Instagram
  tiktok: "https://tiktok.com/@YOUR_USERNAME",      // 👉 THAY link TikTok
  zalo: "https://zalo.me/YOUR_PHONE",               // 👉 THAY link Zalo (để "" nếu không dùng)
  registerForm: ""   // 👉 THAY link Google Form nếu có. Để "" thì nút liên hệ mở email.
};

/* ------------------------------------------------------------
   2) PINTEREST — THƯ VIỆN HÌNH ẢNH
   Cách lấy: vào https://widgets.pinterest.com → tab "Board"
   → dán link board → Build it!  (code ở đây đã dựng sẵn theo chuẩn đó,
   bạn chỉ cần dán đúng link board vào biến dưới)
   👉 THAY: PINTEREST_BOARD_URL
------------------------------------------------------------ */
const PINTEREST_BOARD_URL = "https://www.pinterest.com/USERNAME/BOARD-NAME/"; // 👉 THAY link board thật

const PINTEREST_WIDGET = {
  imageWidth: 92,    // độ rộng mỗi ảnh nhỏ (tối đa 236)
  boardWidth: 900,   // độ rộng tổng của board (tối đa 1000)
  boardHeight: 620   // chiều cao tổng của board (tối đa 1000)
};

/* ------------------------------------------------------------
   3) ẢNH DỰ PHÒNG cho thư viện
   Hiện khi widget Pinterest tải chậm hoặc bị chặn.
   👉 THAY bằng ảnh sketchnote thật của bạn trong assets/images/
------------------------------------------------------------ */
const GALLERY_FALLBACK = [
  { src: "assets/illustrations/note-mindmap.svg", alt: "Lớp dạy sketchnote" },
  { src: "assets/illustrations/note-book.svg",    alt: "Sketchnote tóm tắt sách" },
  { src: "assets/illustrations/note-meeting.svg", alt: "Buổi workshop nhóm nhỏ" },
  { src: "assets/illustrations/note-letters.svg", alt: "Bảng luyện chữ calligraphy" },
  { src: "assets/illustrations/note-live.svg",    alt: "Vẽ trực tiếp tại sự kiện" },
  { src: "assets/illustrations/note-custom.svg",  alt: "Vẽ theo yêu cầu: sách, ly, minh hoạ" }
];

/* ------------------------------------------------------------
   4) GALLERY LIVE RECORDING
   👉 THAY: ảnh các buổi bạn từng vẽ trực tiếp + tên sự kiện
------------------------------------------------------------ */
const LIVE_GALLERY = [
  { src: "assets/illustrations/note-live.svg",    caption: "Hội thảo Giáo dục Sáng tạo — 2024" },
  { src: "assets/illustrations/note-meeting.svg", caption: "Workshop nội bộ công ty ABC — 2024" },
  { src: "assets/illustrations/note-mindmap.svg", caption: "Sự kiện ra mắt sản phẩm XYZ — 2023" },
  { src: "assets/illustrations/note-book.svg",    caption: "Toạ đàm Sách & Tư duy hình ảnh — 2023" },
  { src: "assets/illustrations/note-kids.svg",    caption: "Ngày hội hướng nghiệp trường M — 2023" },
  { src: "assets/illustrations/note-letters.svg", caption: "Team building công ty N — 2022" }
];

/* ------------------------------------------------------------
   5) 4 DỊCH VỤ
   👉 Sửa mô tả / hình thức ở đây, không cần đụng HTML
------------------------------------------------------------ */
const SERVICES = [
  {
    id: "day-sketchnote",
    tag: "Cá nhân & nhóm nhỏ",
    title: "Dạy sketchnote",
    image: "assets/illustrations/note-mindmap.svg",
    short: "Học 1:1 hoặc nhóm nhỏ, từ nét cơ bản đến một trang ghi chú hoàn chỉnh.",
    desc: "Sketchnote là cách ghi chép kết hợp chữ, hình và bố cục, để nhìn một trang giấy là nhớ lại cả buổi học. Mình dạy từ những nét đơn giản nhất — que, hộp, mũi tên, khuôn mặt — rồi ghép dần thành một trang hoàn chỉnh. Bạn không cần biết vẽ.",
    forWho: ["Học sinh, sinh viên muốn ghi bài nhanh và nhớ lâu", "Người đi làm hay phải tóm tắt sách, khoá học, cuộc họp", "Giáo viên muốn bài giảng trực quan hơn", "Trẻ em từ 8 tuổi"],
    benefits: ["Kho biểu tượng cá nhân dùng được suốt đời", "Cách bố cục trang: tiêu đề, luồng đọc, khoảng trắng", "Kỹ thuật nghe — lọc ý — vẽ cùng lúc", "Bài tập sau mỗi buổi, mình nhận xét từng bài"],
    formats: ["Online 1:1", "Offline 1:1", "Nhóm nhỏ 3–6 người", "Lớp trẻ em"],
    note: "Mỗi buổi 90 phút. Lộ trình cơ bản 4–6 buổi, điều chỉnh theo mục tiêu của bạn."
  },
  {
    id: "calligraphy",
    tag: "Chữ đẹp",
    title: "Dạy calligraphy",
    image: "assets/illustrations/note-letters.svg",
    short: "Viết chữ đẹp bằng bút brush và bút mài, dùng được ngay trong sketchnote.",
    desc: "Chữ viết tay là thứ làm một trang sketchnote có cá tính. Lớp đi từ nguyên tắc nét thanh — nét đậm, cách cầm bút, nhịp tay, rồi tới các kiểu chữ bạn dùng được ngay: tiêu đề, chữ nhấn, bảng hiệu, thiệp tặng.",
    forWho: ["Người đang học sketchnote, muốn phần chữ đẹp hơn", "Người thích viết thiệp, làm quà tặng thủ công", "Người muốn một thói quen chậm rãi, luyện tập trung"],
    benefits: ["Kiểm soát nét bằng bút brush và bút mài", "2–3 bộ chữ hoàn chỉnh, viết không cần nhìn mẫu", "Cách phối chữ với hình trong một bố cục", "File bảng luyện nét để in ra tập tại nhà"],
    formats: ["Online 1:1", "Offline 1:1", "Nhóm nhỏ 3–6 người", "Workshop 1 buổi"],
    note: "Học riêng được, hoặc học nối tiếp sau khoá sketchnote cơ bản."
  },
  {
    id: "training",
    tag: "Doanh nghiệp",
    title: "Training cho doanh nghiệp",
    image: "assets/illustrations/note-meeting.svg",
    short: "Buổi training thực hành cho team: nhớ lâu hơn, họp sinh động hơn, chốt nhanh hơn.",
    desc: "Một buổi training thực hành, thiết kế riêng theo ngành và cách làm việc của team bạn. Không phải lớp vẽ cho vui — mục tiêu là sau buổi học, mọi người dùng được hình ảnh ngay trong công việc hằng ngày.",
    forWho: ["Team 10–30 người", "Phòng ban hay phải họp và trình bày ý tưởng", "Công ty muốn một hoạt động gắn kết mà ai cũng tham gia được"],
    benefits: ["<strong>Nhớ lâu hơn:</strong> xử lý bằng cả chữ lẫn hình nên đọng lại lâu hơn ghi chép thuần chữ", "<strong>Họp sinh động hơn:</strong> mọi người vẽ ý lên bảng, ai cũng nhìn thấy cùng một thứ", "<strong>Chốt nhanh hơn:</strong> vấn đề được vẽ ra thì điểm mắc lộ ngay", "<strong>Onboarding dễ hơn:</strong> quy trình phức tạp gói vào một trang sơ đồ"],
    formats: ["Offline tại công ty", "Online qua Zoom/Meet", "Nửa ngày", "Trọn ngày", "Team building"],
    note: "Nội dung được thiết kế lại sau một buổi trao đổi ngắn với HR hoặc trưởng nhóm. Mình chuẩn bị toàn bộ dụng cụ."
  },
  {
    id: "live-recording",
    tag: "Sự kiện",
    title: "Live recording sự kiện",
    image: "assets/illustrations/note-live.svg",
    short: "Mình vẽ trực tiếp tại sự kiện, biến nội dung diễn giả thành một bức tranh tổng hợp.",
    desc: "Mình có mặt tại sự kiện và vẽ trong lúc chương trình diễn ra. Khi diễn giả nói xong, bức tranh cũng vừa hoàn thành — toàn bộ nội dung được tóm lại thành một tấm hình mà khách có thể đứng xem, chụp ảnh và chia sẻ.",
    forWho: ["Hội thảo, toạ đàm, workshop chuyên môn", "Lễ ra mắt sản phẩm, sự kiện thương hiệu", "Họp chiến lược, kick-off dự án, town hall nội bộ", "Sự kiện trường học, ngày hội hướng nghiệp"],
    benefits: ["Bản vẽ gốc khổ lớn để trưng bày tại sự kiện", "File số độ phân giải cao cho truyền thông, báo cáo sau sự kiện", "Một điểm nhấn để khách dừng lại, chụp ảnh và nhớ tới chương trình", "Tuỳ chọn: video tua nhanh quá trình vẽ để đăng mạng xã hội"],
    formats: ["Vẽ trên giấy khổ lớn", "Vẽ số hoá chiếu màn hình", "Online (sự kiện Zoom)"],
    note: "Cần trao đổi trước ít nhất 1 tuần để mình đọc kịch bản chương trình và chuẩn bị bố cục."
  },
  {
    id: "ve-theo-yeu-cau",
    tag: "Đặt vẽ riêng",
    title: "Vẽ theo yêu cầu",
    image: "assets/illustrations/note-custom.svg",
    short: "Nhận vẽ sách, vẽ ly, vẽ minh hoạ và các sản phẩm đặt riêng theo ý bạn.",
    desc: "Bạn cần một hình vẽ riêng chứ không phải một buổi học? Mình nhận vẽ theo yêu cầu — từ minh hoạ cho sách, vẽ lên ly và sổ tay, tới bộ hình cho thương hiệu. Trao đổi ý tưởng trước, mình gửi phác thảo để bạn duyệt rồi mới hoàn thiện.",
    forWho: ["Tác giả, nhà xuất bản cần minh hoạ cho sách", "Quán cà phê, cửa hàng cần vẽ lên ly, menu, bảng hiệu", "Người muốn đặt quà tặng vẽ tay cho dịp đặc biệt", "Thương hiệu cần bộ minh hoạ đồng bộ"],
    benefits: ["<strong>Vẽ sách:</strong> minh hoạ bìa, minh hoạ nội dung, sơ đồ tóm tắt chương", "<strong>Vẽ ly:</strong> vẽ tay lên ly, bình, sổ tay, túi vải", "<strong>Vẽ minh hoạ:</strong> hình cho bài viết, slide, ấn phẩm truyền thông", "File số độ phân giải cao, dùng được cho cả in ấn"],
    formats: ["Vẽ tay trên giấy", "Vẽ số hoá", "Vẽ trực tiếp lên sản phẩm", "Trọn bộ nhiều hình"],
    note: "Báo giá theo số lượng hình và độ chi tiết. Gửi mình mô tả ý tưởng để nhận báo giá cụ thể."
  }
];

/* ------------------------------------------------------------
   6) KHOÁ HỌC UDEMY
   👉 THAY: tên khoá, mô tả, ảnh cover, link Udemy thật
------------------------------------------------------------ */
const COURSES = [
  {
    title: "Sketchnote cho người mới bắt đầu",
    cover: "assets/illustrations/note-mindmap.svg",   // 👉 THAY ảnh cover thật
    desc: "Học ghi chú bằng hình từ con số 0: nét cơ bản, kho biểu tượng, bố cục trang và cách tóm tắt một bài giảng trong một trang giấy.",
    level: "Cơ bản",
    lessons: "30+ bài giảng",
    url: "https://www.udemy.com/course/YOUR-COURSE-1/"  // 👉 THAY link Udemy
  },
  {
    title: "Chữ đẹp & Calligraphy trong Sketchnote",
    cover: "assets/illustrations/note-letters.svg",   // 👉 THAY ảnh cover thật
    desc: "Nâng cấp trang sketchnote bằng typography viết tay: kiểu chữ tiêu đề, nhấn nhá, khung viền và cách phối chữ với hình.",
    level: "Cơ bản → Trung cấp",
    lessons: "25+ bài giảng",
    url: "https://www.udemy.com/course/YOUR-COURSE-2/"  // 👉 THAY link Udemy
  }
];

/* ------------------------------------------------------------
   7) FEEDBACK HỌC VIÊN
   👉 THÊM FEEDBACK MỚI: copy một khối { ... } rồi sửa nội dung.
   Phần feedback chỉ hiển thị chữ, không kèm ảnh.
------------------------------------------------------------ */
const FEEDBACKS = [
  {
    name: "Minh Anh",
    role: "Sinh viên năm 3",
    quote: "Trước đây mình ghi chép toàn chữ và chẳng nhớ gì. Sau khoá học, mình tóm cả chương sách vào một trang và nhớ được lâu hơn hẳn."
  },
  {
    name: "Chị Hồng",
    role: "Trưởng phòng nhân sự",
    quote: "Cả team mình học training của Trâm. Giờ họp nào cũng có người đứng lên vẽ bảng, cuộc họp sinh động và kết luận rõ ràng hơn nhiều."
  },
  {
    name: "Bảo Nam",
    role: "Học sinh lớp 8",
    quote: "Con thích nhất phần vẽ nhân vật que. Bây giờ con vẽ được sơ đồ bài Sử mà không cần chép lại nguyên đoạn văn."
  },
  {
    name: "Thu Hà",
    role: "Giáo viên tiểu học",
    quote: "Trâm dạy rất kiên nhẫn và luôn nói “vẽ xấu cũng không sao”. Chính câu đó làm mình dám cầm bút lại sau 20 năm."
  },
  {
    name: "Quốc Huy",
    role: "Product Manager",
    quote: "Mình dùng sketchnote để trình bày roadmap cho sếp. Lần đầu tiên cả phòng hiểu ngay trong 5 phút mà không cần slide."
  }
];
