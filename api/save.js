/* ============================================================
   api/save.js — lưu nội dung từ trang quản trị lên GitHub
   Cần đăng nhập trước (cookie do api/auth.js cấp).
   Ghi đè file data.js trong repo → Vercel tự deploy lại.

   Biến môi trường cần đặt trên Vercel:
     GITHUB_TOKEN   token GitHub có quyền ghi nội dung repo
     GITHUB_REPO    mặc định trammb/sketchnote
     GITHUB_BRANCH  mặc định main
   ============================================================ */
const crypto = require("crypto");

var COOKIE = "vct_admin";

function ky(payload, secret) {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}
function docCookie(req) {
  var raw = req.headers.cookie || "";
  var found = null;
  raw.split(";").forEach(function (c) {
    var i = c.indexOf("=");
    if (i > 0 && c.slice(0, i).trim() === COOKIE) found = c.slice(i + 1).trim();
  });
  return found;
}
function daDangNhap(req) {
  var secret = process.env.SESSION_SECRET;
  var token = docCookie(req);
  if (!secret || !token || token.indexOf(".") < 0) return false;
  var phan = token.split(".");
  var han = phan[0], chuKy = phan[1];
  if (!/^\d+$/.test(han) || Number(han) < Date.now()) return false;
  var a = Buffer.from(chuKy || "", "utf8");
  var b = Buffer.from(ky(han, secret), "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function gh(duongDan, tuyChon) {
  return fetch("https://api.github.com" + duongDan, Object.assign({
    headers: {
      "Authorization": "Bearer " + process.env.GITHUB_TOKEN,
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "vecungtram-admin",
      "Content-Type": "application/json"
    }
  }, tuyChon || {}));
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, loi: "Phương thức không hỗ trợ" });
  }
  if (!daDangNhap(req)) {
    return res.status(401).json({ ok: false, loi: "Chưa đăng nhập hoặc phiên đã hết hạn" });
  }
  if (!process.env.GITHUB_TOKEN) {
    return res.status(500).json({ ok: false, loi: "Chưa cấu hình GITHUB_TOKEN trên Vercel" });
  }

  var body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  var noiDung = body && body.content;

  // Kiểm tra sơ bộ để không ghi đè bằng nội dung hỏng
  if (typeof noiDung !== "string" || noiDung.length < 200) {
    return res.status(400).json({ ok: false, loi: "Nội dung trống hoặc quá ngắn" });
  }
  if (noiDung.length > 1000000) {
    return res.status(400).json({ ok: false, loi: "Nội dung quá lớn" });
  }
  var batBuoc = ["const SITE", "const SERVICES", "const COURSES", "const FEEDBACKS",
                 "const PINTEREST_BOARD_URL", "const GALLERY_FALLBACK", "const LIVE_GALLERY"];
  for (var i = 0; i < batBuoc.length; i++) {
    if (noiDung.indexOf(batBuoc[i]) < 0) {
      return res.status(400).json({ ok: false, loi: "Nội dung thiếu phần " + batBuoc[i] });
    }
  }

  var repo = process.env.GITHUB_REPO || "trammb/sketchnote";
  var nhanh = process.env.GITHUB_BRANCH || "main";
  var duongDan = "/repos/" + repo + "/contents/data.js";

  try {
    // Lấy sha hiện tại của file
    var r1 = await gh(duongDan + "?ref=" + encodeURIComponent(nhanh));
    if (!r1.ok) {
      var t1 = await r1.text();
      return res.status(502).json({ ok: false, loi: "Không đọc được data.js trên GitHub (" + r1.status + ")", chiTiet: t1.slice(0, 300) });
    }
    var hienTai = await r1.json();

    var r2 = await gh(duongDan, {
      method: "PUT",
      body: JSON.stringify({
        message: "Cập nhật nội dung từ trang quản trị " +
                 new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }),
        content: Buffer.from(noiDung, "utf8").toString("base64"),
        sha: hienTai.sha,
        branch: nhanh
      })
    });

    if (!r2.ok) {
      var t2 = await r2.text();
      var goiY = "";
      if (r2.status === 403) {
        goiY = " GITHUB_TOKEN thiếu quyền ghi: vào GitHub → token → Permissions → Contents đổi thành Read and write.";
      } else if (r2.status === 404) {
        goiY = " GITHUB_TOKEN chưa được cấp quyền cho repo " + repo +
               ": vào GitHub → token → Repository access → chọn repo này, và Contents = Read and write.";
      } else if (r2.status === 409 || r2.status === 422) {
        goiY = " Nhánh " + nhanh + " có thể đang bị khoá (branch protection) hoặc file vừa bị sửa nơi khác. Thử lưu lại.";
      }
      goiY += " Sửa xong nhớ Redeploy trên Vercel.";
      return res.status(502).json({
        ok: false,
        loi: "GitHub từ chối ghi file (" + r2.status + ")." + goiY,
        chiTiet: t2.slice(0, 300)
      });
    }
    var kq = await r2.json();
    return res.status(200).json({
      ok: true,
      commit: kq.commit && kq.commit.sha ? kq.commit.sha.slice(0, 7) : null
    });
  } catch (e) {
    return res.status(500).json({ ok: false, loi: "Lỗi khi gọi GitHub: " + (e.message || e) });
  }
};
