/* ============================================================
   admin.js — trang quản trị nội dung cho sketchnote.trammb.com
   Chạy hoàn toàn trong trình duyệt, không cần máy chủ.
   Đọc data.js → sửa bằng form → xuất ra data.js mới.
   ============================================================ */
(function () {
  "use strict";

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var DRAFT_KEY = "sketchnote-admin-draft";

  /* ============================================================
     GHI THẲNG VÀO FILE data.js
     Dùng File System Access API (Chrome, Edge, Cốc Cốc, Brave).
     Lần đầu sẽ hỏi chọn file data.js, những lần sau ghi thẳng.
     Trình duyệt không hỗ trợ (Safari, Firefox) thì tự chuyển
     sang tải file về.
  ============================================================ */
  // Chạy ở máy (localhost) thì ghi thẳng file. Chạy trên web thì lưu qua GitHub.
  var CHAY_O_MAY = location.protocol === "file:" ||
                  /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  var CHE_DO_WEB = !CHAY_O_MAY;
  var CAN_WRITE = !CHE_DO_WEB && typeof window.showOpenFilePicker === "function";
  var fileHandle = null;
  var savedSnapshot = null;   // nội dung lúc lưu thành công gần nhất

  // Lưu "chìa khoá" file vào IndexedDB để lần sau mở lại không phải chọn lại
  function idb(mode, fn) {
    return new Promise(function (resolve, reject) {
      var req = indexedDB.open("sketchnote-admin", 1);
      req.onupgradeneeded = function () { req.result.createObjectStore("handles"); };
      req.onerror = function () { reject(req.error); };
      req.onsuccess = function () {
        var db = req.result, tx, r;
        try {
          tx = db.transaction("handles", mode);
          r = fn(tx.objectStore("handles"));
        } catch (e) { db.close(); reject(e); return; }
        tx.oncomplete = function () { db.close(); resolve(r && r.result); };
        tx.onerror = tx.onabort = function () { db.close(); reject(tx.error); };
      };
    });
  }
  function rememberHandle(h) { return idb("readwrite", function (st) { return st.put(h, "dataFile"); }); }
  function recallHandle()    { return idb("readonly",  function (st) { return st.get("dataFile"); }); }
  function forgetHandle()    { return idb("readwrite", function (st) { return st.delete("dataFile"); }); }

  // Kiểm tra quyền ghi (phải gọi trong lúc người dùng vừa bấm nút)
  function ensurePermission(h) {
    if (!h.queryPermission) return Promise.resolve(true);
    return h.queryPermission({ mode: "readwrite" }).then(function (p) {
      if (p === "granted") return true;
      return h.requestPermission({ mode: "readwrite" }).then(function (p2) { return p2 === "granted"; });
    });
  }

  function pickFile() {
    return window.showOpenFilePicker({
      id: "sketchnote-data",
      types: [{ description: "File dữ liệu website", accept: { "text/javascript": [".js"] } }],
      multiple: false
    }).then(function (list) {
      fileHandle = list[0];
      // Ghi nhớ file cho lần sau. Nếu không nhớ được thì thôi, vẫn lưu bình thường.
      return rememberHandle(fileHandle)
        .catch(function () {})
        .then(function () { return fileHandle; });
    });
  }

  function writeToFile(text) {
    return fileHandle.createWritable().then(function (w) {
      return w.write(text).then(function () { return w.close(); });
    });
  }

  /* ---------- Lấy dữ liệu gốc từ data.js ---------- */
  function fromDataJs() {
    var out = {};
    ["SITE", "PINTEREST_BOARD_URL", "PINTEREST_WIDGET", "GALLERY_FALLBACK",
     "LIVE_GALLERY", "SERVICES", "COURSES", "FEEDBACKS"].forEach(function (k) {
      try { out[k] = JSON.parse(JSON.stringify(eval(k))); } catch (e) {}
    });
    return out;
  }

  var ORIGINAL = fromDataJs();
  var data;
  try {
    var saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
    data = saved && saved.SITE ? saved : JSON.parse(JSON.stringify(ORIGINAL));
  } catch (e) { data = JSON.parse(JSON.stringify(ORIGINAL)); }

  /* ---------- Lưu nháp ---------- */
  var saveTimer, stateEl = $("#save-state");
  function markSaved(txt, dirty) {
    stateEl.textContent = txt;
    stateEl.classList.toggle("dirty", !!dirty);
  }
  function isDirty() { return savedSnapshot !== JSON.stringify(data); }
  function refreshDirty() {
    var btn = $("#btn-save");
    if (!btn) return;
    btn.classList.toggle("btn--light", isDirty());
    btn.textContent = isDirty() ? "💾 Lưu vào data.js" : "✓ Đã lưu";
  }
  function save() {
    markSaved("Đang lưu nháp…", true);
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
        markSaved("Đã lưu nháp lúc " + new Date().toLocaleTimeString("vi-VN"));
      } catch (e) { markSaved("Không lưu được nháp (bộ nhớ trình duyệt đầy)", true); }
      refreshExport();
      refreshCounts();
      refreshDirty();
    }, 350);
  }

  function toast(msg, isErr) {
    var t = $("#toast");
    t.textContent = msg;
    t.classList.toggle("err", !!isErr);
    t.classList.add("show");
    clearTimeout(t._t);
    t._t = setTimeout(function () { t.classList.remove("show"); }, isErr ? 9000 : 2600);
  }

  /* ---------- Tab ---------- */
  $$(".sidenav button").forEach(function (b) {
    b.addEventListener("click", function () {
      $$(".sidenav button").forEach(function (x) { x.classList.remove("active"); });
      $$(".panel").forEach(function (p) { p.classList.remove("active"); });
      b.classList.add("active");
      $("#tab-" + b.dataset.tab).classList.add("active");
      window.scrollTo(0, 0);
    });
  });

  /* ---------- Trường đơn (data-bind="SITE.email") ---------- */
  function getPath(obj, path) {
    return path.split(".").reduce(function (o, k) { return o == null ? o : o[k]; }, obj);
  }
  function setPath(obj, path, val) {
    var ks = path.split("."), last = ks.pop();
    var target = ks.reduce(function (o, k) { if (o[k] == null) o[k] = {}; return o[k]; }, obj);
    target[last] = val;
  }
  $$("[data-bind]").forEach(function (el) {
    var path = el.dataset.bind;
    var v = getPath(data, path);
    el.value = v == null ? "" : v;
    el.addEventListener("input", function () {
      setPath(data, path, el.type === "number" ? (parseInt(el.value, 10) || 0) : el.value.trim());
      validate(el);
      save();
    });
    validate(el);
  });
  function validate(el) {
    var bad = false;
    if (el.type === "email" && el.value) bad = !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(el.value);
    if (el.type === "url" && el.value) bad = !/^https?:\/\//i.test(el.value);
    el.classList.toggle("invalid", bad);
  }

  /* ---------- Công cụ dựng form cho danh sách ---------- */
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  // Ô nhập một dòng
  function field(label, value, hint, onInput, type) {
    var f = el("div", "field");
    var id = "f" + Math.random().toString(36).slice(2, 8);
    f.appendChild(el("label", null, label)).setAttribute("for", id);
    var input = document.createElement(type === "textarea" ? "textarea" : "input");
    if (type !== "textarea") input.type = type || "text";   // luôn đặt type để khớp CSS
    input.id = id;
    input.value = value == null ? "" : value;
    input.addEventListener("input", function () { onInput(input.value); validate(input); save(); });
    f.appendChild(input);
    if (hint) f.appendChild(el("p", "hint", hint));
    return f;
  }

  // Ô nhập đường dẫn ảnh + xem thử
  function imageField(label, value, hint, onInput) {
    var f = field(label, value, hint, function (v) { onInput(v); img.src = v || ""; }, "text");
    var img = el("img", "thumb");
    img.alt = "Xem thử";
    img.src = value || "";
    img.addEventListener("error", function () { img.classList.add("missing"); });
    img.addEventListener("load", function () { img.classList.remove("missing"); });
    f.appendChild(img);
    return f;
  }

  // Danh sách chuỗi (dùng cho "Phù hợp với", "Bạn nhận được", "Hình thức")
  function stringList(label, arr, hint) {
    var wrap = el("div", "field");
    wrap.appendChild(el("label", null, label));
    if (hint) wrap.appendChild(el("p", "hint", hint)).style.marginBottom = ".4rem";
    var box = el("div", "list-editor");
    function render() {
      box.innerHTML = "";
      arr.forEach(function (val, i) {
        var line = el("div", "line");
        var inp = document.createElement("input");
        inp.type = "text"; inp.value = val;
        inp.addEventListener("input", function () { arr[i] = inp.value; save(); });
        var del = el("button", "btn btn--danger btn--xs", "✕");
        del.type = "button";
        del.title = "Xoá dòng này";
        del.addEventListener("click", function () { arr.splice(i, 1); render(); save(); });
        line.appendChild(inp); line.appendChild(del);
        box.appendChild(line);
      });
      var add = el("button", "btn btn--ghost btn--xs", "+ Thêm dòng");
      add.type = "button";
      add.addEventListener("click", function () { arr.push(""); render(); save(); });
      box.appendChild(add);
    }
    render();
    wrap.appendChild(box);
    return wrap;
  }

  // Khung một mục có nút lên/xuống/xoá
  function itemCard(titleText, list, index, rerender, buildBody) {
    var d = el("details", "item");
    var sum = el("summary");
    sum.appendChild(el("span", "title", titleText || "(chưa có tên)"));
    var tools = el("div", "tools");
    function toolBtn(txt, title, fn, cls) {
      var b = el("button", "btn btn--xs " + (cls || "btn--ghost"), txt);
      b.type = "button"; b.title = title;
      b.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); fn(); });
      return b;
    }
    tools.appendChild(toolBtn("↑", "Đưa lên trên", function () {
      if (index === 0) return;
      list.splice(index - 1, 0, list.splice(index, 1)[0]); rerender(); save();
    }));
    tools.appendChild(toolBtn("↓", "Đưa xuống dưới", function () {
      if (index === list.length - 1) return;
      list.splice(index + 1, 0, list.splice(index, 1)[0]); rerender(); save();
    }));
    tools.appendChild(toolBtn("Xoá", "Xoá mục này", function () {
      if (!confirm("Xoá “" + (titleText || "mục này") + "”?")) return;
      list.splice(index, 1); rerender(); save();
    }, "btn--danger"));
    sum.appendChild(tools);
    d.appendChild(sum);
    var body = el("div", "item-body");
    buildBody(body);
    d.appendChild(body);
    return d;
  }

  /* ---------- Dịch vụ ---------- */
  var IMG_CHOICES = [
    "assets/illustrations/note-mindmap.svg", "assets/illustrations/note-letters.svg",
    "assets/illustrations/note-meeting.svg", "assets/illustrations/note-live.svg",
    "assets/illustrations/note-custom.svg", "assets/illustrations/note-book.svg",
    "assets/illustrations/note-kids.svg"
  ];
  function renderServices() {
    var box = $("#list-services");
    box.innerHTML = "";
    data.SERVICES.forEach(function (s, i) {
      box.appendChild(itemCard(s.title, data.SERVICES, i, renderServices, function (b) {
        var row = el("div", "row row--2");
        row.appendChild(field("Tên dịch vụ", s.title, null, function (v) { s.title = v; }));
        row.appendChild(field("Mã liên kết (chữ thường, không dấu)", s.id,
          "Dùng làm link riêng: …/#" + (s.id || "ma-dich-vu"),
          function (v) { s.id = v.toLowerCase().replace(/[^a-z0-9-]/g, "-"); }));
        b.appendChild(row);
        b.appendChild(field("Nhãn nhỏ phía trên", s.tag, "Ví dụ: Doanh nghiệp, Sự kiện…", function (v) { s.tag = v; }));
        b.appendChild(field("Mô tả ngắn (hiện ở thẻ tóm tắt)", s.short, null, function (v) { s.short = v; }, "textarea"));
        b.appendChild(field("Mô tả đầy đủ", s.desc, null, function (v) { s.desc = v; }, "textarea"));
        b.appendChild(imageField("Ảnh minh hoạ", s.image,
          "Gợi ý: " + IMG_CHOICES.join(" · "), function (v) { s.image = v; }));
        b.appendChild(stringList("Phù hợp với", s.forWho));
        b.appendChild(stringList("Bạn nhận được", s.benefits, "Được phép dùng <strong>chữ đậm</strong> trong dòng."));
        b.appendChild(stringList("Hình thức", s.formats, "Hiện dạng các viên thuốc bo tròn."));
        b.appendChild(field("Ghi chú cuối", s.note, null, function (v) { s.note = v; }, "textarea"));
      }));
    });
  }

  /* ---------- Khoá học ---------- */
  function renderCourses() {
    var box = $("#list-courses");
    box.innerHTML = "";
    data.COURSES.forEach(function (c, i) {
      box.appendChild(itemCard(c.title, data.COURSES, i, renderCourses, function (b) {
        b.appendChild(field("Tên khoá học", c.title, null, function (v) { c.title = v; }));
        b.appendChild(field("Mô tả ngắn", c.desc, null, function (v) { c.desc = v; }, "textarea"));
        var row = el("div", "row row--2");
        row.appendChild(field("Trình độ", c.level, "Ví dụ: Cơ bản", function (v) { c.level = v; }));
        row.appendChild(field("Số bài", c.lessons, "Ví dụ: 30+ bài giảng", function (v) { c.lessons = v; }));
        b.appendChild(row);
        b.appendChild(field("Link Udemy", c.url, null, function (v) { c.url = v; }, "url"));
        b.appendChild(imageField("Ảnh bìa", c.cover, "Tỉ lệ đẹp nhất là 16:9.", function (v) { c.cover = v; }));
      }));
    });
  }

  /* ---------- Feedback ---------- */
  function renderFeedbacks() {
    var box = $("#list-feedbacks");
    box.innerHTML = "";
    data.FEEDBACKS.forEach(function (f, i) {
      box.appendChild(itemCard(f.name, data.FEEDBACKS, i, renderFeedbacks, function (b) {
        var row = el("div", "row row--2");
        row.appendChild(field("Tên học viên", f.name, null, function (v) { f.name = v; }));
        row.appendChild(field("Vai trò", f.role, "Ví dụ: Sinh viên năm 3", function (v) { f.role = v; }));
        b.appendChild(row);
        b.appendChild(field("Nội dung feedback", f.quote,
          "Không cần gõ dấu ngoặc kép, web tự thêm.", function (v) { f.quote = v; }, "textarea"));
      }));
    });
  }

  /* ---------- Thư viện ảnh ---------- */
  function renderLive() {
    var box = $("#list-live");
    box.innerHTML = "";
    data.LIVE_GALLERY.forEach(function (g, i) {
      box.appendChild(itemCard(g.caption, data.LIVE_GALLERY, i, renderLive, function (b) {
        b.appendChild(field("Chú thích", g.caption, "Ví dụ: Hội thảo ABC — 2024", function (v) { g.caption = v; }));
        b.appendChild(imageField("Đường dẫn ảnh", g.src, null, function (v) { g.src = v; }));
      }));
    });
  }
  function renderFallback() {
    var box = $("#list-fallback");
    box.innerHTML = "";
    data.GALLERY_FALLBACK.forEach(function (g, i) {
      box.appendChild(itemCard(g.alt, data.GALLERY_FALLBACK, i, renderFallback, function (b) {
        b.appendChild(field("Mô tả ảnh", g.alt, "Dùng cho người khiếm thị và cho Google.", function (v) { g.alt = v; }));
        b.appendChild(imageField("Đường dẫn ảnh", g.src, null, function (v) { g.src = v; }));
      }));
    });
  }

  /* ---------- Thêm mục mới ---------- */
  var ADD = {
    services: function () {
      data.SERVICES.push({
        id: "dich-vu-moi", tag: "Nhãn", title: "Dịch vụ mới",
        image: "assets/illustrations/note-custom.svg",
        short: "", desc: "", forWho: [""], benefits: [""], formats: [""], note: ""
      });
      renderServices();
    },
    courses: function () {
      data.COURSES.push({
        title: "Khoá học mới", cover: "assets/illustrations/note-mindmap.svg",
        desc: "", level: "Cơ bản", lessons: "", url: ""
      });
      renderCourses();
    },
    feedbacks: function () {
      data.FEEDBACKS.push({ name: "Tên học viên", role: "", quote: "" });
      renderFeedbacks();
    },
    live: function () {
      data.LIVE_GALLERY.push({ src: "assets/images/", caption: "Tên sự kiện — năm" });
      renderLive();
    },
    fallback: function () {
      data.GALLERY_FALLBACK.push({ src: "assets/images/", alt: "Mô tả ảnh" });
      renderFallback();
    }
  };
  $$("[data-add]").forEach(function (b) {
    b.addEventListener("click", function () {
      ADD[b.dataset.add]();
      save();
      toast("Đã thêm mục mới, nhớ điền nội dung");
    });
  });

  function refreshCounts() {
    $("#c-svc").textContent = "(" + data.SERVICES.length + ")";
    $("#c-course").textContent = "(" + data.COURSES.length + ")";
    $("#c-fb").textContent = "(" + data.FEEDBACKS.length + ")";
    $("#c-img").textContent = "(" + (data.LIVE_GALLERY.length + data.GALLERY_FALLBACK.length) + ")";
  }

  /* ---------- Sinh nội dung file data.js ---------- */
  function q(v) { return JSON.stringify(v == null ? "" : String(v)); }
  function objLines(o, keys, indent) {
    return keys.map(function (k) {
      var v = o[k];
      if (Array.isArray(v)) return indent + k + ": [" + v.map(q).join(", ") + "]";
      return indent + k + ": " + q(v);
    }).join(",\n");
  }
  function buildDataJs() {
    var d = data, L = [];
    L.push("/* ============================================================");
    L.push("   data.js — NỘI DUNG CỦA WEBSITE");
    L.push("   File này do trang admin.html sinh ra lúc " + new Date().toLocaleString("vi-VN") + ".");
    L.push("   Sửa bằng admin.html cho tiện, hoặc sửa tay trực tiếp ở đây cũng được.");
    L.push("   ============================================================ */");
    L.push("");
    L.push("/* 1) Liên hệ & mạng xã hội */");
    L.push("const SITE = {");
    L.push("  email: " + q(d.SITE.email) + ",");
    L.push("  instagram: " + q(d.SITE.instagram) + ",");
    L.push("  tiktok: " + q(d.SITE.tiktok) + ",");
    L.push("  zalo: " + q(d.SITE.zalo) + ",          // để \"\" thì ẩn khỏi footer");
    L.push("  registerForm: " + q(d.SITE.registerForm) + "   // để \"\" thì nút liên hệ mở email");
    L.push("};");
    L.push("");
    L.push("/* 2) Board Pinterest cho phần thư viện */");
    L.push("const PINTEREST_BOARD_URL = " + q(d.PINTEREST_BOARD_URL) + ";");
    L.push("");
    L.push("const PINTEREST_WIDGET = {");
    L.push("  imageWidth: " + (d.PINTEREST_WIDGET.imageWidth || 92) + ",");
    L.push("  boardWidth: " + (d.PINTEREST_WIDGET.boardWidth || 900) + ",");
    L.push("  boardHeight: " + (d.PINTEREST_WIDGET.boardHeight || 620));
    L.push("};");
    L.push("");
    L.push("/* 3) Ảnh dự phòng khi widget Pinterest tải chậm */");
    L.push("const GALLERY_FALLBACK = [");
    L.push(d.GALLERY_FALLBACK.map(function (g) {
      return "  { src: " + q(g.src) + ", alt: " + q(g.alt) + " }";
    }).join(",\n"));
    L.push("];");
    L.push("");
    L.push("/* 4) Ảnh các buổi live recording */");
    L.push("const LIVE_GALLERY = [");
    L.push(d.LIVE_GALLERY.map(function (g) {
      return "  { src: " + q(g.src) + ", caption: " + q(g.caption) + " }";
    }).join(",\n"));
    L.push("];");
    L.push("");
    L.push("/* 5) Các dịch vụ. Mã id chính là địa chỉ liên kết riêng: …/#<id> */");
    L.push("const SERVICES = [");
    L.push(d.SERVICES.map(function (s) {
      return "  {\n" + objLines(s, ["id", "tag", "title", "image", "short", "desc",
        "forWho", "benefits", "formats", "note"], "    ") + "\n  }";
    }).join(",\n"));
    L.push("];");
    L.push("");
    L.push("/* 6) Khoá học Udemy */");
    L.push("const COURSES = [");
    L.push(d.COURSES.map(function (c) {
      return "  {\n" + objLines(c, ["title", "cover", "desc", "level", "lessons", "url"], "    ") + "\n  }";
    }).join(",\n"));
    L.push("];");
    L.push("");
    L.push("/* 7) Feedback học viên — chỉ hiển thị chữ, không kèm ảnh */");
    L.push("const FEEDBACKS = [");
    L.push(d.FEEDBACKS.map(function (f) {
      return "  {\n" + objLines(f, ["name", "role", "quote"], "    ") + "\n  }";
    }).join(",\n"));
    L.push("];");
    L.push("");
    return L.join("\n");
  }
  function refreshExport() { $("#export-preview").value = buildDataJs(); }

  /* ---------- Tải file / chép / nạp / xoá nháp ---------- */
  /* ---------- NÚT LƯU ---------- */
  function downloadFile() {
    var blob = new Blob([buildDataJs()], { type: "text/javascript;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "data.js";
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  function luuQuaWeb(text, snapshot) {
    var btn = $("#btn-save");
    btn.disabled = true;
    markSaved("Đang gửi lên máy chủ…", true);
    return fetch("/api/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text })
    }).then(docTraLoi).then(function (kq) {
      btn.disabled = false;
      if (kq.status === 401) {
        moManDangNhap();
        toast("Phiên đăng nhập hết hạn, đăng nhập lại giúp mình", true);
        markSaved("Chưa lưu — cần đăng nhập lại", true);
        return;
      }
      if (!kq.body.ok) {
        var lyDo = kq.body.loi || ("Máy chủ trả về mã " + kq.status);
        if (kq.body.chiTiet) lyDo += " · " + String(kq.body.chiTiet).slice(0, 200);
        markSaved("Lưu không thành công — " + lyDo, true);
        toast(lyDo, true);
        return;
      }
      savedSnapshot = snapshot;
      markSaved("Đã lưu lúc " + new Date().toLocaleTimeString("vi-VN") +
                (kq.body.commit ? " · " + kq.body.commit : ""));
      refreshDirty();
      toast("Đã lưu. Khoảng 30 giây nữa web thật sẽ cập nhật.");
    }).catch(function (e) {
      btn.disabled = false;
      var lyDo = "Không kết nối được máy chủ (" + (e && e.message ? e.message : e) + ")";
      markSaved("Lưu không thành công — " + lyDo, true);
      toast(lyDo + ". Kiểm tra mạng rồi thử lại.", true);
    });
  }

  function doSave() {
    var text = buildDataJs();
    var snapshot = JSON.stringify(data);

    if (CHE_DO_WEB) { luuQuaWeb(text, snapshot); return; }

    if (!CAN_WRITE) {
      downloadFile();
      toast("Trình duyệt này không ghi thẳng file được — đã tải data.js về, bạn chép đè giúp mình", true);
      return;
    }

    var chain = fileHandle ? Promise.resolve(fileHandle) : pickFile();
    chain.then(function (h) {
      return ensurePermission(h).then(function (ok) {
        if (!ok) throw new Error("Chưa cấp quyền ghi file");
        return writeToFile(text);
      });
    }).then(function () {
      savedSnapshot = snapshot;
      markSaved("Đã lưu vào data.js lúc " + new Date().toLocaleTimeString("vi-VN"));
      refreshDirty();
      toast("Đã lưu vào data.js — mở lại web là thấy nội dung mới");
    }).catch(function (err) {
      if (err && err.name === "AbortError") return;   // người dùng bấm huỷ
      downloadFile();
      toast("Không ghi được file (" + (err.message || err.name) + ") — đã tải về để bạn chép đè", true);
    });
  }

  $("#btn-save").addEventListener("click", doSave);
  $("#btn-pickfile").addEventListener("click", function () {
    if (!CAN_WRITE) { toast("Trình duyệt này không hỗ trợ ghi file, hãy dùng nút Tải file", true); return; }
    pickFile().then(function () {
      toast("Đã chọn file. Từ giờ bấm Lưu là ghi thẳng vào file này.");
      refreshFileInfo();
    }).catch(function (e) { if (e.name !== "AbortError") toast("Không chọn được file", true); });
  });
  $("#btn-forget").addEventListener("click", function () {
    forgetHandle().catch(function () {}).then(function () {
      fileHandle = null;
      refreshFileInfo();
      toast("Đã bỏ liên kết file. Lần lưu tới sẽ hỏi chọn lại.");
    });
  });

  // Phím tắt Ctrl+S / Cmd+S
  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") { e.preventDefault(); doSave(); }
  });

  // Nhắc khi đóng tab lúc còn thay đổi chưa lưu vào file
  window.addEventListener("beforeunload", function (e) {
    if (isDirty()) { e.preventDefault(); e.returnValue = ""; }
  });

  function refreshFileInfo() {
    var box = $("#file-info");
    if (!box) return;
    if (CHE_DO_WEB) {
      box.innerHTML = "Đang mở trên web. Bấm <strong>Lưu</strong> là nội dung được ghi thẳng lên GitHub, " +
        "Vercel tự deploy lại sau khoảng 30 giây. Nút tải file bên dưới chỉ dùng để sao lưu.";
    } else if (!CAN_WRITE) {
      box.innerHTML = "Trình duyệt này (Safari/Firefox) chưa hỗ trợ ghi thẳng file. " +
        "Nút <strong>Lưu</strong> sẽ tải file <code>data.js</code> về máy để bạn chép đè.";
    } else if (fileHandle) {
      box.innerHTML = "Đang gắn với file <strong>" + fileHandle.name + "</strong>. " +
        "Bấm <strong>Lưu</strong> (hoặc Ctrl+S) là ghi thẳng vào file này.";
    } else {
      box.innerHTML = "Chưa gắn file nào. Lần đầu bấm <strong>Lưu</strong>, trình duyệt sẽ hỏi " +
        "chọn file — hãy chọn đúng file <code>data.js</code> trong thư mục web.";
    }
  }

  $("#btn-download").addEventListener("click", function () {
    var blob = new Blob([buildDataJs()], { type: "text/javascript;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "data.js";
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    toast("Đã tải data.js — nhớ chép đè lên file cũ");
  });
  $("#btn-export").addEventListener("click", function () {
    $$(".sidenav button").forEach(function (x) { x.classList.remove("active"); });
    $$(".panel").forEach(function (p) { p.classList.remove("active"); });
    $('.sidenav button[data-tab="xuat"]').classList.add("active");
    $("#tab-xuat").classList.add("active");
    window.scrollTo(0, 0);
  });
  $("#btn-copy").addEventListener("click", function () {
    var txt = buildDataJs();
    function fallbackCopy() {
      var ta = $("#export-preview");
      ta.select(); ta.setSelectionRange(0, ta.value.length);
      try { document.execCommand("copy"); toast("Đã chép nội dung"); }
      catch (e) { toast("Không chép được, bạn bôi đen rồi copy tay nhé", true); }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(function () { toast("Đã chép nội dung"); }, fallbackCopy);
    } else { fallbackCopy(); }
  });
  $("#btn-import").addEventListener("click", function () { $("#file-input").click(); });
  $("#file-input").addEventListener("change", function (e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var fn = new Function(reader.result +
          "\nreturn {SITE:SITE,PINTEREST_BOARD_URL:PINTEREST_BOARD_URL,PINTEREST_WIDGET:PINTEREST_WIDGET," +
          "GALLERY_FALLBACK:GALLERY_FALLBACK,LIVE_GALLERY:LIVE_GALLERY,SERVICES:SERVICES," +
          "COURSES:COURSES,FEEDBACKS:FEEDBACKS};");
        var loaded = fn();
        if (!loaded.SITE || !Array.isArray(loaded.SERVICES)) throw new Error("thiếu dữ liệu");
        data = JSON.parse(JSON.stringify(loaded));
        renderAll();
        save();
        toast("Đã nạp nội dung từ file");
      } catch (err) {
        toast("File không đọc được — cần đúng file data.js", true);
      }
      e.target.value = "";
    };
    reader.readAsText(file, "utf-8");
  });
  $("#btn-reset").addEventListener("click", function () {
    if (!confirm("Xoá toàn bộ chỉnh sửa chưa xuất và quay về nội dung trong data.js hiện tại?")) return;
    localStorage.removeItem(DRAFT_KEY);
    data = JSON.parse(JSON.stringify(ORIGINAL));
    renderAll();
    save();
    toast("Đã quay về bản gốc");
  });

  /* ---------- Xem trước ---------- */
  $("#btn-preview").addEventListener("click", function () {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); } catch (e) {}
    window.open("index.html?preview=1", "_blank", "noopener");
  });

  /* ---------- Đọc trả lời từ máy chủ một cách an toàn ---------- */
  function docTraLoi(r) {
    return r.text().then(function (t) {
      var j = null;
      try { j = JSON.parse(t); } catch (e) {}
      if (!j) {
        j = { ok: false, loi: r.status === 404
          ? "Máy chủ chưa có phần đăng nhập (thiếu thư mục api). Nếu đang chạy ở máy thì dùng bản localhost."
          : "Máy chủ trả về dữ liệu không đọc được (mã " + r.status + ")" };
      }
      return { status: r.status, body: j };
    });
  }

  /* ---------- Đăng nhập (chỉ dùng ở chế độ web) ---------- */
  function moManDangNhap() {
    var gate = $("#gate");
    if (!gate) return;
    gate.hidden = false;
    var o = $("#gate-pass");
    if (o) { o.value = ""; setTimeout(function () { o.focus(); }, 50); }
  }
  function dongManDangNhap() {
    var gate = $("#gate");
    if (gate) gate.hidden = true;
  }

  if (CHE_DO_WEB) {
    var form = $("#gate-form");
    var err = $("#gate-err");
    var nutLogout = $("#btn-logout");
    if (nutLogout) nutLogout.hidden = false;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var nut = $("#gate-btn");
      nut.disabled = true;
      nut.textContent = "Đang kiểm tra…";
      err.hidden = true;
      fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: $("#gate-pass").value })
      }).then(docTraLoi).then(function (kq) {
        nut.disabled = false;
        nut.textContent = "Đăng nhập";
        if (kq.body.ok) { dongManDangNhap(); toast("Đã đăng nhập"); }
        else { err.textContent = kq.body.loi || "Không đăng nhập được"; err.hidden = false; }
      }).catch(function (e2) {
        nut.disabled = false;
        nut.textContent = "Đăng nhập";
        err.textContent = "Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.";
        err.hidden = false;
      });
    });

    if (nutLogout) {
      nutLogout.addEventListener("click", function () {
        fetch("/api/auth", { method: "DELETE" }).then(function () {
          moManDangNhap();
          toast("Đã đăng xuất");
        });
      });
    }

    // Kiểm tra phiên hiện tại
    fetch("/api/auth").then(function (r) { return r.json(); }).then(function (j) {
      if (!j.authed) moManDangNhap();
    }).catch(function () { moManDangNhap(); });
  }

  /* ---------- Khởi động ---------- */
  function renderAll() {
    $$("[data-bind]").forEach(function (elm) {
      var v = getPath(data, elm.dataset.bind);
      elm.value = v == null ? "" : v;
      validate(elm);
    });
    renderServices(); renderCourses(); renderFeedbacks(); renderLive(); renderFallback();
    refreshCounts(); refreshExport();
  }

  if (!ORIGINAL.SITE) {
    markSaved("Không đọc được data.js", true);
    toast("Không tìm thấy data.js — hãy mở admin.html qua máy chủ nội bộ", true);
  } else {
    renderAll();
    savedSnapshot = JSON.stringify(ORIGINAL);
    markSaved(localStorage.getItem(DRAFT_KEY) ? "Đã khôi phục bản nháp đang làm dở" : "Đang dùng nội dung trong data.js");
    refreshDirty();
    refreshFileInfo();
    if (CAN_WRITE) {
      recallHandle().then(function (h) {
        if (h && h.createWritable) { fileHandle = h; refreshFileInfo(); }
      }).catch(function () {});
    }
  }
})();
