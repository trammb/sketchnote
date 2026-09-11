/* ============================================================
   api/auth.js — đăng nhập trang quản trị
   GET    → cho biết đã đăng nhập chưa
   POST   → kiểm tra mật khẩu, cấp phiên đăng nhập
   DELETE → đăng xuất
   Mật khẩu đặt ở biến môi trường ADMIN_PASSWORD trên Vercel.
   ============================================================ */
const crypto = require("crypto");

var COOKIE = "vct_admin";
var THOI_HAN = 12 * 60 * 60 * 1000;   // phiên sống 12 tiếng

function ky(payload, secret) {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

function taoToken(secret) {
  var han = String(Date.now() + THOI_HAN);
  return han + "." + ky(han, secret);
}

function tokenHopLe(token, secret) {
  if (!token || token.indexOf(".") < 0) return false;
  var phan = token.split(".");
  var han = phan[0], chuKy = phan[1];
  if (!/^\d+$/.test(han) || Number(han) < Date.now()) return false;
  var mong = ky(han, secret);
  var a = Buffer.from(chuKy || "", "utf8");
  var b = Buffer.from(mong, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
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

function soSanhChuoi(a, b) {
  var x = Buffer.from(String(a), "utf8");
  var y = Buffer.from(String(b), "utf8");
  if (x.length !== y.length) return false;
  return crypto.timingSafeEqual(x, y);
}

// Dùng lại ở api/save.js
function daDangNhap(req) {
  var secret = process.env.SESSION_SECRET;
  if (!secret) return false;
  return tokenHopLe(docCookie(req), secret);
}

module.exports = async function handler(req, res) {
  var matKhau = process.env.ADMIN_PASSWORD;
  var secret = process.env.SESSION_SECRET;

  if (!matKhau || !secret) {
    return res.status(500).json({
      ok: false,
      loi: "Chưa cấu hình ADMIN_PASSWORD hoặc SESSION_SECRET trên Vercel."
    });
  }

  if (req.method === "GET") {
    return res.status(200).json({ authed: daDangNhap(req) });
  }

  if (req.method === "DELETE") {
    res.setHeader("Set-Cookie", COOKIE + "=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict");
    return res.status(200).json({ ok: true });
  }

  if (req.method === "POST") {
    var body = req.body;
    if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = {}; } }
    var nhap = (body && body.password) || "";

    if (!soSanhChuoi(nhap, matKhau)) {
      // chậm lại một nhịp để đỡ bị dò mật khẩu
      await new Promise(function (r) { setTimeout(r, 1000); });
      return res.status(401).json({ ok: false, loi: "Mật khẩu không đúng" });
    }

    res.setHeader("Set-Cookie",
      COOKIE + "=" + taoToken(secret) +
      "; Path=/; Max-Age=" + (THOI_HAN / 1000) + "; HttpOnly; Secure; SameSite=Strict");
    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", "GET, POST, DELETE");
  return res.status(405).json({ ok: false, loi: "Phương thức không hỗ trợ" });
};

module.exports.daDangNhap = daDangNhap;
