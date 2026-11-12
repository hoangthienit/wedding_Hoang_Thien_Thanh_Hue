(function () {
  "use strict";
  const C = window.WEDDING;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const get = (path) => path.split(".").reduce((o, k) => (o ? o[k] : ""), C);
  const WD = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  const pad = (n) => String(n).padStart(2, "0");
  const parseDate = (s) => {
    const [d, t = "00:00"] = s.split("T");
    const [y, m, dd] = d.split("-").map(Number);
    const [h, mi] = t.split(":").map(Number);
    // Giờ Việt Nam (UTC+7) bất kể múi giờ của người xem
    return new Date(Date.UTC(y, m - 1, dd, h - 7, mi));
  };
  // Tách mỗi sự kiện thành các mốc giờ (hỗ trợ cả dạng cũ "YYYY-MM-DDTHH:mm")
  const slotsOf = (ev) => {
    const day = ev.date.slice(0, 10);
    const times = ev.times && ev.times.length ? ev.times : [{ label: "", time: ev.date.split("T")[1] || "00:00" }];
    return times.map((t) => ({ ...ev, label: t.label || "", time: t.time, day, t: parseDate(day + "T" + t.time).getTime() }));
  };
  const mapUrl = (m) => (m === "bride" ? C.bride.map : m === "groom" ? C.groom.map : m);

  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove("show"), 2600);
  }

  /* ---------- Điền dữ liệu ---------- */
  $$("[data-f]").forEach((el) => (el.textContent = get(el.dataset.f)));
  const bg = (sel, url, pos) => {
    const el = $(sel);
    if (!el) return;
    el.style.backgroundImage = `url("${url}")`;
    if (pos) el.style.backgroundPosition = pos;
  };
  // Ngày chính trên bìa
  if (C.mainDate) {
    const [my, mm, md] = C.mainDate.split("-");
    const set = (k, v) => { const e = $(`[data-md="${k}"]`); if (e) e.textContent = v; };
    set("d", md); set("m", mm); set("y", my);
  }
  bg("#openerPhoto", C.openerPhoto || C.cover);
  bg("#heroImg", C.cover);
  $("#hero").style.setProperty("--cover", `url("${new URL(C.cover, location.href).href}")`);
  bg("#thanksImg", C.thanksPhoto);
  bg("#groomAvatar", C.groom.photo, C.groom.photoPos);
  bg("#brideAvatar", C.bride.photo, C.bride.photoPos);

  /* ---------- Tên khách mời ---------- */
  function getGuestId() {
    const q = new URLSearchParams(location.search);
    const fromQ = q.get("g") || q.get("id");
    if (fromQ && /^\d+$/.test(fromQ)) return fromQ;
    const h = location.hash.replace("#", "");
    if (/^\d+$/.test(h)) return h;
    const seg = location.pathname.replace(/\/+$/, "").split("/").pop();
    if (/^\d+$/.test(seg)) return seg;
    return null;
  }
  function setGuest(name) {
    $$("[data-guest]").forEach((el) => (el.textContent = name));
  }
  setGuest(C.defaultGuest);
  const guestId = getGuestId();
  let guestName = "";

  // Đưa URL dạng ?g=5 (từ 404.html) về dạng đẹp .../5
  if (guestId && new URLSearchParams(location.search).get("g")) {
    const base = location.pathname.replace(/[^/]*$/, "");
    try { history.replaceState(null, "", base + guestId); } catch (e) {}
  }

  // Tên khách lấy từ tab "KhachMoi" trong Google Sheet (chỉ hỏi đúng 1 mã)
  if (guestId && C.sheetApi) {
    fetch(C.sheetApi + "?action=guest&id=" + encodeURIComponent(guestId))
      .then((r) => r.json())
      .then((g) => {
        if (g && g.name) {
          guestName = g.name;
          setGuest(guestName);
          const n = $("#rsvpForm [name=name]");
          if (n && !n.value) n.value = guestName;
          document.title = `Kính mời ${guestName} — Thiệp cưới ${C.groom.shortName} & ${C.bride.shortName}`;
        }
      })
      .catch(() => {});
  }

  /* ---------- Nhạc ---------- */
  const audio = $("#audio");
  const music = $("#music");
  let order = C.playlist.map((_, i) => i);
  if (C.shuffle && order.length > 1) {
    // Xáo trộn ngẫu nhiên (Fisher–Yates)
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    // Không mở đầu bằng bài đã phát đầu tiên ở lần mở thiệp trước
    let last = null;
    try { last = localStorage.getItem("lastSong"); } catch (e) {}
    if (last !== null && String(order[0]) === last) order.push(order.shift());
    try { localStorage.setItem("lastSong", String(order[0])); } catch (e) {}
  }
  let cur = 0, failed = 0, wantPlay = false;

  function loadSong(i) {
    cur = (i + order.length) % order.length;
    const song = C.playlist[order[cur]];
    audio.src = song.file;
    $("#songTitle").textContent = "♪ " + song.title;
    $("#songTitle").parentElement.title = song.title;
  }
  function flashTitle() {
    music.classList.add("show-title");
    clearTimeout(flashTitle._t);
    flashTitle._t = setTimeout(() => music.classList.remove("show-title"), 4000);
  }
  function play() {
    wantPlay = true;
    const p = audio.play();
    if (p) p.then(() => { failed = 0; music.classList.remove("paused"); flashTitle(); }).catch(() => music.classList.add("paused"));
  }
  function pause() {
    wantPlay = false;
    audio.pause();
    music.classList.add("paused");
  }
  function next() { loadSong(cur + 1); if (wantPlay) play(); }
  audio.addEventListener("ended", next);
  audio.addEventListener("error", () => {
    // bỏ qua bài lỗi/thiếu file
    if (++failed >= order.length) { music.hidden = true; console.warn("Không tìm thấy file nhạc nào trong thư mục music/"); return; }
    next();
  });
  if (order.length) {
    loadSong(0);
    music.hidden = false;
    music.classList.add("paused");
  }
  $("#musicBtn").addEventListener("click", () => (audio.paused ? play() : pause()));
  $("#nextBtn").addEventListener("click", () => { wantPlay = true; next(); });

  /* ---------- Mở thiệp ---------- */
  $("#openBtn").addEventListener("click", () => {
    $("#opener").classList.add("hide");
    document.body.classList.remove("locked");
    if (order.length) play();
    burst(24);
    setTimeout(() => $("#opener").remove(), 1000);
  });

  /* ---------- Cánh hoa rơi ---------- */
  const petals = $("#petals");
  const shapes = ["❤", "❀", "✿", "♥"];
  function petal() {
    if (document.hidden || petals.childElementCount > 18) return;
    const p = document.createElement("span");
    p.className = "petal";
    p.textContent = shapes[(Math.random() * shapes.length) | 0];
    p.style.left = Math.random() * 100 + "vw";
    p.style.fontSize = 10 + Math.random() * 14 + "px";
    p.style.setProperty("--dx", (Math.random() * 80 - 40) + "px");
    p.style.animationDuration = 7 + Math.random() * 6 + "s";
    p.style.color = ["#e78aa6", "#f2b2c4", "#d96b8c", "#f9c6d4"][(Math.random() * 4) | 0];
    p.addEventListener("animationend", () => p.remove());
    petals.appendChild(p);
  }
  function burst(n) { for (let i = 0; i < n; i++) setTimeout(petal, i * 90); }
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) setInterval(petal, 900);

  /* ---------- Sự kiện ---------- */
  const ICONS = {
    church: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M11 2h2v2h2v2h-2v2.3l5 3.2V22h-4v-5a2 2 0 0 0-4 0v5H6V11.5l5-3.2V6H9V4h2V2ZM2 15l3-1.5V22H2v-7Zm20 0v7h-3v-8.5L22 15Z"/></svg>',
    home: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 3 2 12h3v8h5v-5h4v5h5v-8h3L12 3Z"/></svg>',
    glass: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M6.5 2 5 8a4 4 0 0 0 3 4.3V20H6v2h6v-2h-2v-7.7A4 4 0 0 0 13 8l-1.5-6h-5Zm8 0L13 8a4 4 0 0 0 3 4.3V20h-2v2h6v-2h-2v-7.7A4 4 0 0 0 21 8l-1.5-6h-5Z"/></svg>',
  };
  const now = new Date();
  const tl = $("#timeline");
  const CLOCK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 10.4 3.5 2.1-.8 1.3L11 13V7h2v5.4Z"/></svg>';
  C.events.forEach((ev) => {
    const slots = slotsOf(ev);
    const [y, m, dd] = slots[0].day.split("-");
    const past = slots[slots.length - 1].t + 6 * 3600e3 < now.getTime();
    const wd = WD[new Date(+y, +m - 1, +dd).getDay()];
    const el = document.createElement("article");
    el.className = "event reveal" + (past ? " past" : "");
    el.innerHTML = `
      <div class="event-icon">${ICONS[ev.icon] || ICONS.glass}</div>
      ${past ? '<span class="badge">Đã cử hành</span>' : ""}
      <h3></h3>
      <div class="event-date">
        <span class="ed-side">${wd}</span>
        <span class="ed-day">${dd}</span>
        <span class="ed-side">Tháng ${m}<br>${y}</span>
      </div>
      <div class="event-times${slots.length > 1 ? " multi" : ""}"></div>
      <p class="lunar"></p>
      <p class="place"></p>
      <p class="address"></p>
      <a class="btn btn-ghost" target="_blank" rel="noopener">📍 Xem bản đồ</a>`;
    const box = $(".event-times", el);
    slots.forEach((sl) => {
      const t = document.createElement("div");
      t.className = "event-time";
      if (slots.length > 1) {
        t.innerHTML = "<small></small><b></b>";
        $("small", t).textContent = sl.label || "Vào lúc";
      } else {
        t.innerHTML = CLOCK + "<span></span><b></b>";
        $("span", t).textContent = sl.label ? sl.label + " lúc" : "Vào lúc";
      }
      $("b", t).textContent = sl.time;
      box.appendChild(t);
    });
    $("h3", el).textContent = ev.title;
    $(".lunar", el).textContent = ev.lunar ? `(${ev.lunar})` : "";
    $(".place", el).textContent = ev.place;
    $(".address", el).textContent = ev.address;
    $("a", el).href = mapUrl(ev.map);
    tl.appendChild(el);
  });

  /* ---------- Lịch ---------- */
  const calYear = 2026, calMonth = 11; // tháng 12
  (function calendar() {
    const cal = $("#calendar");
    const marks = {};
    C.events.forEach((e) => {
      const d = e.date.split("T")[0];
      if (d.startsWith(`${calYear}-${pad(calMonth + 1)}`)) marks[+d.slice(8, 10)] = e.side || "";
    });
    ["T2", "T3", "T4", "T5", "T6", "T7", "CN"].forEach((d) => {
      const e = document.createElement("div"); e.className = "dow"; e.textContent = d; cal.appendChild(e);
    });
    const first = (new Date(calYear, calMonth, 1).getDay() + 6) % 7;
    const days = new Date(calYear, calMonth + 1, 0).getDate();
    for (let i = 0; i < first; i++) cal.appendChild(document.createElement("div"));
    for (let d = 1; d <= days; d++) {
      const e = document.createElement("div");
      e.className = "day" + (d in marks ? " mark" : "");
      if (d in marks) e.dataset.side = marks[d];
      e.innerHTML = `<span>${d}</span>`;
      cal.appendChild(e);
    }
  })();

  /* ---------- Đếm ngược theo Nhà Trai / Nhà Gái ---------- */
  (function countdown() {
    const box = $("#countdown");
    const html = box.innerHTML;
    const els = () => Object.fromEntries($$("[data-cd]", box).map((e) => [e.dataset.cd, e]));
    const qs = new URLSearchParams(location.search).get("ben");
    let side = qs === "gai" ? "bride" : qs === "trai" ? "groom" : null;
    if (!side) { try { side = localStorage.getItem("cd-side"); } catch (e) {} }
    if (side !== "bride" && side !== "groom") side = C.defaultSide || "groom";
    let timer;

    function target() {
      const list = C.events.filter((e) => e.side === side)
        .flatMap(slotsOf).sort((a, b) => a.t - b.t);
      return list.find((e) => e.t > Date.now()) || null;
    }
    function render() {
      clearInterval(timer);
      $$(".side-toggle button").forEach((b) => {
        const on = b.dataset.side === side;
        b.classList.toggle("on", on);
        b.setAttribute("aria-selected", on);
      });
      $$("#calendar .day.mark").forEach((d) => d.classList.toggle("dim", !!d.dataset.side && d.dataset.side !== side));
      const ev = target();
      if (!ev) {
        $("#cdLabel").textContent = "Just married";
        $("#cdWhen").textContent = "";
        box.className = "countdown done";
        box.textContent = "Chúng mình đã về chung một nhà ♥";
        return;
      }
      box.className = "countdown";
      box.innerHTML = html;
      const [y, m, d] = ev.date.split("T")[0].split("-");
      $("#cdLabel").textContent = "Đếm ngược đến " + ev.title;
      $("#cdWhen").textContent = `${ev.label ? ev.label + " " : ""}${ev.time} · ${WD[new Date(+y, +m - 1, +d).getDay()]}, ${d}.${m}.${y}`;
      const e = els();
      const tick = () => {
        const s = Math.max(0, Math.floor((ev.t - Date.now()) / 1000));
        if (s === 0) return render();
        e.d.textContent = Math.floor(s / 86400);
        e.h.textContent = pad(Math.floor((s % 86400) / 3600));
        e.m.textContent = pad(Math.floor((s % 3600) / 60));
        e.s.textContent = pad(s % 60);
      };
      tick();
      timer = setInterval(tick, 1000);
    }
    $$(".side-toggle button").forEach((b) => b.addEventListener("click", () => {
      side = b.dataset.side;
      try { localStorage.setItem("cd-side", side); } catch (e) {}
      render();
    }));
    render();
  })();

  /* ---------- Album: lưới so le + xem thêm + lightbox ---------- */
  const photos = (window.WEDDING_GALLERY && window.WEDDING_GALLERY.length
    ? window.WEDDING_GALLERY
    : (C.gallery || []).map((src) => ({ src, thumb: src, w: 2, h: 3 }))
  ).map((p) => ({ ...p, src: encodeURI(p.src), thumb: encodeURI(p.thumb || p.src) }));
  (function album() {
    const gal = $("#gallery"), more = $("#galleryMore");
    if (!photos.length) { $(".gallery-sec").remove(); return; }
    $("#galleryCount").textContent = photos.length + " khoảnh khắc đáng nhớ";
    const colCount = () => (innerWidth >= 900 ? 4 : innerWidth >= 600 ? 3 : 2);
    const batch = () => (innerWidth >= 900 ? 12 : 8);
    let shown = 0, cols = [], heights = [], n = 0;

    function build() {
      n = colCount();
      gal.innerHTML = "";
      gal.style.setProperty("--cols", n);
      cols = []; heights = [];
      for (let i = 0; i < n; i++) {
        const c = document.createElement("div");
        c.className = "g-col";
        gal.appendChild(c); cols.push(c); heights.push(0);
      }
      const upto = shown; shown = 0;
      append(upto, false);
    }
    function append(count, animate) {
      const end = Math.min(photos.length, shown + count);
      for (let i = shown; i < end; i++) {
        const p = photos[i];
        const ratio = p.w && p.h ? p.h / p.w : 1.5;
        const k = heights.indexOf(Math.min(...heights)); // xếp vào cột thấp nhất
        heights[k] += ratio;
        const b = document.createElement("button");
        b.type = "button";
        b.className = "g-item" + (animate ? " g-new" : "");
        b.style.aspectRatio = `${p.w || 2} / ${p.h || 3}`;
        b.setAttribute("aria-label", "Xem ảnh " + (i + 1));
        const img = document.createElement("img");
        img.loading = "lazy"; img.decoding = "async";
        img.alt = "Ảnh cưới " + (i + 1);
        img.src = p.thumb;
        img.onload = () => b.classList.add("loaded");
        b.appendChild(img);
        b.addEventListener("click", () => openLb(i));
        cols[k].appendChild(b);
        if (animate) b.style.animationDelay = ((i - shown) * 60) + "ms";
      }
      shown = end;
      const left = photos.length - shown;
      more.hidden = left <= 0;
      more.textContent = `Xem thêm ${Math.min(left, batch())} ảnh  ·  còn ${left}`;
    }
    shown = Math.min(batch(), photos.length);
    build();
    more.addEventListener("click", () => append(batch(), true));
    let rt;
    addEventListener("resize", () => {
      clearTimeout(rt);
      rt = setTimeout(() => { if (colCount() !== n) build(); }, 150);
    });
  })();

  const lb = $("#lightbox"), lbImg = $("img", lb);
  let lbI = 0;
  function openLb(i) {
    lbI = (i + photos.length) % photos.length;
    lbImg.src = photos[lbI].src;
    $("#lbCount").textContent = `${lbI + 1} / ${photos.length}`;
    lb.hidden = false;
    // tải trước ảnh kế bên
    [lbI + 1, lbI - 1].forEach((j) => { new Image().src = photos[(j + photos.length) % photos.length].src; });
  }
  $(".lb-close", lb).onclick = () => (lb.hidden = true);
  $(".lb-prev", lb).onclick = (e) => { e.stopPropagation(); openLb(lbI - 1); };
  $(".lb-next", lb).onclick = (e) => { e.stopPropagation(); openLb(lbI + 1); };
  lb.addEventListener("click", (e) => { if (e.target === lb) lb.hidden = true; });
  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") lb.hidden = true;
    if (e.key === "ArrowLeft") openLb(lbI - 1);
    if (e.key === "ArrowRight") openLb(lbI + 1);
  });
  let tx = 0;
  lb.addEventListener("touchstart", (e) => (tx = e.touches[0].clientX), { passive: true });
  lb.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) openLb(lbI + (dx < 0 ? 1 : -1));
  });

  /* ---------- Gửi dữ liệu lên Google Sheets ---------- */
  function send(data) {
    if (!C.sheetApi) return Promise.resolve();
    return fetch(C.sheetApi, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(data),
    });
  }
  function formData(form) { return Object.fromEntries(new FormData(form).entries()); }

  $("#rsvpForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target, btn = $("button", f), d = formData(f);
    btn.disabled = true;
    send({ type: "rsvp", guestId: guestId || "", ...d })
      .then(() => {
        $("#rsvpMsg").textContent = d.attend === "Sẽ tham dự"
          ? "Cảm ơn bạn! Hẹn gặp bạn trong ngày vui nhé 💕"
          : "Cảm ơn bạn đã báo cho chúng mình biết 💗";
        burst(14);
      })
      .catch(() => ($("#rsvpMsg").textContent = "Có lỗi kết nối, bạn thử lại giúp mình nhé!"))
      .finally(() => (btn.disabled = false));
  });

  const wishList = $("#wishList");
  function addWish(w, top) {
    const el = document.createElement("div");
    el.className = "wish";
    el.innerHTML = "<b></b><p></p>";
    $("b", el).textContent = w.name;
    $("p", el).textContent = w.message;
    top ? wishList.prepend(el) : wishList.appendChild(el);
  }
  if (C.sheetApi) {
    fetch(C.sheetApi + "?action=wishes")
      .then((r) => r.json())
      .then((list) => (list || []).forEach((w) => addWish(w)))
      .catch(() => {});
  }
  $("#wishForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target, btn = $("button", f), d = formData(f);
    btn.disabled = true;
    send({ type: "wish", guestId: guestId || "", ...d })
      .then(() => {
        addWish(d, true);
        $("[name=message]", f).value = "";
        $("#wishMsg").textContent = "Cảm ơn lời chúc của bạn! 💌";
        burst(14);
      })
      .catch(() => ($("#wishMsg").textContent = "Có lỗi kết nối, bạn thử lại giúp mình nhé!"))
      .finally(() => (btn.disabled = false));
  });

  /* ---------- Nhắn lời chúc trực tiếp ---------- */
  (function contacts() {
    const list = C.contacts || [];
    const modal = $("#giftModal"), tabs = $("#giftTabs"), panel = $("#giftPanel");
    if (!list.length) { $(".gift").remove(); return; }
    const ICON = {
      zalo: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.5 2 2 5.9 2 10.7c0 2.7 1.4 5.1 3.7 6.7L5 21.5l4.3-2.2c.9.2 1.8.3 2.7.3 5.5 0 10-3.9 10-8.8S17.5 2 12 2Zm-3.2 11.6H5.6v-.8l2-2.7H5.7v-.9h3v.8l-2 2.7h2.1v.9Zm2.9 0h-.9v-.3c-.3.2-.6.4-1 .4-.9 0-1.5-.7-1.5-1.7s.7-1.7 1.5-1.7c.4 0 .7.1 1 .4v-.3h.9v3.2Zm1.6 0h-1V8.9h1v4.7Zm2.3.1c-1 0-1.7-.8-1.7-1.7s.7-1.7 1.7-1.7 1.7.8 1.7 1.7-.7 1.7-1.7 1.7Zm-5.1-2.5c-.5 0-.8.4-.8.8 0 .5.3.9.8.9s.8-.4.8-.9c0-.4-.3-.8-.8-.8Zm5.1 0c-.5 0-.8.4-.8.8 0 .5.4.9.8.9.5 0 .8-.4.8-.9 0-.4-.3-.8-.8-.8Z"/></svg>',
      messenger: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.4 2 2 6.1 2 11.7c0 2.9 1.2 5.5 3.2 7.2V22l3-1.6c1.2.3 2.4.5 3.8.5 5.6 0 10-4.1 10-9.7S17.6 2 12 2Zm1 12.9-2.5-2.7-5 2.7 5.5-5.8 2.6 2.7 4.9-2.7-5.5 5.8Z"/></svg>',
      sms: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2ZM8 11H6V9h2v2Zm5 0h-2V9h2v2Zm5 0h-2V9h2v2Z"/></svg>',
    };
    const clean = (v) => String(v || "").replace(/[^\d+]/g, "");
    let cur = 0;

    function copy(text) {
      return navigator.clipboard ? navigator.clipboard.writeText(text).catch(() => {}) : Promise.resolve();
    }
    function show(i) {
      cur = i;
      const c = list[i];
      $$("button", tabs).forEach((b, j) => { b.classList.toggle("on", i === j); b.setAttribute("aria-selected", i === j); });
      panel.innerHTML = `
        <div class="ct-head"><div class="ct-avatar"></div><div><small></small><b></b></div></div>
        <label class="ct-msg">Lời chúc của bạn<textarea rows="4" maxlength="500"></textarea></label>
        <div class="ct-actions"></div>
        <p class="ct-hint"></p>`;
      const av = $(".ct-avatar", panel);
      av.style.backgroundImage = `url("${c.photo}")`;
      if (c.photoPos) av.style.backgroundPosition = c.photoPos;
      $(".ct-head small", panel).textContent = "Gửi đến " + c.label;
      $(".ct-head b", panel).textContent = c.name;
      const ta = $("textarea", panel);
      ta.value = panel.dataset.msg || C.blessing || "";
      ta.addEventListener("input", () => (panel.dataset.msg = ta.value));

      const acts = $(".ct-actions", panel);
      const add = (cls, label, icon, onClick) => {
        const b = document.createElement("button");
        b.type = "button"; b.className = "ct-btn " + cls;
        b.innerHTML = icon + "<span></span>";
        $("span", b).textContent = label;
        b.onclick = onClick;
        acts.appendChild(b);
      };
      if (c.zalo) add("zalo", "Zalo", ICON.zalo, () => {
        copy(ta.value).then(() => toast("Đã sao chép lời chúc — dán vào khung chat Zalo nhé!"));
        window.open("https://zalo.me/" + clean(c.zalo), "_blank", "noopener");
      });
      if (c.messenger) add("messenger", "Messenger", ICON.messenger, () => {
        copy(ta.value).then(() => toast("Đã sao chép lời chúc — dán vào Messenger nhé!"));
        window.open("https://m.me/" + encodeURIComponent(c.messenger), "_blank", "noopener");
      });
      if (c.phone) add("sms", "Tin nhắn", ICON.sms, () => {
        location.href = "sms:" + clean(c.phone) + "?&body=" + encodeURIComponent(ta.value);
      });
      if (!acts.children.length) {
        acts.innerHTML = '<p class="ct-empty">Thông tin liên lạc đang được cập nhật</p>';
      } else {
        $(".ct-hint", panel).textContent = "Lời chúc sẽ được tự động sao chép, bạn chỉ cần dán vào khung chat.";
      }
    }
    list.forEach((c, i) => {
      const b = document.createElement("button");
      b.type = "button"; b.setAttribute("role", "tab"); b.textContent = c.label;
      b.onclick = () => show(i);
      tabs.appendChild(b);
    });
    if (list.length < 2) tabs.hidden = true;
    const close = () => { modal.classList.remove("open"); setTimeout(() => (modal.hidden = true), 300); };
    $("#giftOpen").addEventListener("click", () => {
      show(cur);
      modal.hidden = false;
      requestAnimationFrame(() => modal.classList.add("open"));
    });
    $(".modal-close", modal).onclick = close;
    modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) close(); });
  })();

  /* ---------- Hiệu ứng xuất hiện khi cuộn ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold: 0.12 });
  $$(".reveal").forEach((el) => io.observe(el));
})();
