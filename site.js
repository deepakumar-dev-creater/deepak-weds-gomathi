/*
 * Wedding invite – all animations & widgets (replaces the Framer runtime).
 *
 * ▸ Text (names, family names, headings) lives in index.html – use Find & Replace there,
 *   because most texts exist several times (one copy per screen size).
 * ▸ Dates, links, music, event cards and photos are configured below in CONFIG.
 */
(function () {
  "use strict";
  var B = window.InviteBridge;

  // ===================================================================
  //  CONFIG – edit these
  // ===================================================================
  var DEFAULTS = {
    weddingDate: "2027-03-12T06:00:00+05:30",
    music: {
      src: "assets/audio/music.mp3",
      volume: 0.7,
      autoplay: true
    },
    mapsLink: "https://maps.app.goo.gl/os8TrKyKjXFEnBTZ9",
    rsvp: {
      endpoint: "",
      deadlineText: "Kindly respond by 25 February 2027",
      maxGuests: 10
    },
    eventsHeading: "The Celebrations",
    coupleNames: "Deepak Kumar & Gomathi",
        events: [
      {
        id: "reception",
        start: "2027-03-11T18:30:00+05:30",
        end: null,
        title: "Wedding Reception",
        date: "Thursday, 11 March 2027",
        time: "6:30 PM onwards",
        venue: "En Sesha Mahal, No. 71, Peter’s Road, Ganapathy Colony, Royapettah, Chennai - 600014",
        description: "An evening with family and friends.",
        image: "assets/img/reception_blue.jpg",
        mapLink: "https://maps.app.goo.gl/os8TrKyKjXFEnBTZ9"
      },
      {
        id: "wedding",
        start: "2027-03-12T06:00:00+05:30",
        end: "2027-03-12T07:30:00+05:30",
        title: "Wedding Ceremony (Muhurtham)",
        date: "Friday, 12 March 2027",
        time: "6:00 AM to 7:30 AM",
        venue: "En Sesha Mahal, No. 71, Peter’s Road, Ganapathy Colony, Royapettah, Chennai - 600014",
        description: "Celebrate the beginning of their married life.",
        image: "assets/img/couple_muhurtham.jpg",
        mapLink: "https://maps.app.goo.gl/os8TrKyKjXFEnBTZ9"
      }
    ],
    frameSlider: {
      images: [],
      seconds: 2
    }
  };
  var CONFIG = B.mergeConfig(DEFAULTS);

  // Which Framer boxes hold which widget (don't change unless the page layout changes)
  var SLOTS = {
    music: ".framer-fwz7u-container",
    events: "#wedding-celebrations",
    frameSlider: "",
    rsvp: "",
    location: "",
    countdown: ""
  };

  // Countdown look per box: "phone" = screens under 810px wide, "tablet" = 810–1199px, "base" = the rest
  var COUNTDOWN = {
    ".framer-uuu3on-container": {
      base: { borderRadius: 18, boxBorderRadius: 24, boxHeight: 100, boxPadding: 30, boxWidth: 72, gap: 36, padding: 28,
        font: "font-family:'Playfair Display','Playfair Display Placeholder',serif;font-style:normal;font-weight:700;letter-spacing:-0.02em;line-height:0.1em;text-align:center", fontSize: 34,
        label: "font-family:Inter,'Inter Placeholder',sans-serif;font-style:normal;font-weight:500;letter-spacing:0.25em;line-height:1em", labelSize: 18,
        labelColor: "rgba(0,0,0,0.6)", textColor: "rgb(0,0,0)" },
      phone: { borderRadius: 37, boxBorderRadius: 15, boxHeight: 60, boxPadding: 2, boxWidth: 32, gap: 12, padding: 36,
        font: "font-family:'Playfair Display','Playfair Display Placeholder',serif;font-style:normal;font-weight:700;letter-spacing:-0.02em;line-height:1.1em;text-align:center", fontSize: 27,
        label: "font-family:Inter,sans-serif;font-style:italic;font-weight:100;letter-spacing:0.25em;line-height:1em", labelSize: 15,
        labelColor: "rgb(23,9,9)" }
    }
  };

  // ===================================================================
  //  Helpers
  // ===================================================================
  var $$ = function (sel, root) { if (!sel || typeof sel !== "string" || !sel.trim()) return []; return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var breakpoint = function () {
    var w = window.innerWidth;
    return w >= 1200 ? "desktop" : w >= 810 ? "tablet" : "phone";
  };
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var onScreen = function (el, amount, cb) {
    new IntersectionObserver(function (en) { cb(en[0].isIntersecting); }, { threshold: amount }).observe(el);
  };

  // Decorative motion is owned by GSAP in temple-hero.js, wedding-theme.js,
  // and blessings.js. The legacy polling/WAAPI engine is intentionally removed.

  // ===================================================================
  //  Fit-text: Framer scales some texts inside an <svg viewBox>.
  //  If a name is changed to a longer/shorter one, resize the viewBox
  //  so the new text still fits and stays centred.
  // ===================================================================
  function fitTexts() {
    $$("svg[data-framer-component-type='RichTextContainer'][viewBox]").forEach(function (svg) {
      var fo = svg.querySelector("foreignObject");
      if (!fo || !svg.getBoundingClientRect().width) return;
      var paras = $$(":scope > *", fo);
      if (!paras.length) return;
      var vb = svg.viewBox.baseVal;
      var saved = paras.map(function (p) { return p.getAttribute("style") || ""; });
      var w = 0, h = 0;
      paras.forEach(function (p) {
        p.style.width = "max-content";
        p.style.whiteSpace = "nowrap";
      });
      paras.forEach(function (p) {
        w = Math.max(w, p.offsetWidth);
        h = Math.max(h, p.offsetTop + p.offsetHeight);
      });
      paras.forEach(function (p, i) { p.setAttribute("style", saved[i]); });
      if (!w || !h) return;
      // Names are re-typed by the couple: shrink the text to fit when it runs wider
      // than the artwork's box, but never blow a short name up past the original
      // size, and go back to the original box when the text fits again.
      if (!svg.dataset.vb0) svg.dataset.vb0 = vb.width + " " + vb.height;
      var o = svg.dataset.vb0.split(" ").map(Number);
      if (w > o[0] * 1.02 || h > o[1] * 1.08) svg.setAttribute("viewBox", "0 0 " + Math.max(w, o[0]) + " " + Math.max(o[1], h));
      else svg.setAttribute("viewBox", "0 0 " + o[0] + " " + o[1]);
    });
  }

  // ===================================================================
  //  Music button (round, bottom-right). Bars dance while the song plays.
  // ===================================================================
  function initMusic() {
    var host = document.querySelector(SLOTS.music);
    if (!host) return;
    var STORE = B.key("musicPlayerState");
    host.innerHTML =
      '<div class="mp"><audio preload="metadata" loop></audio>' +
      '<button type="button" class="mp-btn" aria-label="Play music" aria-pressed="false">' +
      '<span class="mp-bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span></button></div>';
    var root = host.querySelector(".mp"), audio = root.querySelector("audio"), btn = root.querySelector(".mp-btn");
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem(STORE) || "{}"); } catch (e) { /* storage blocked */ }
    audio.src = CONFIG.music.src;
    audio.volume = saved.volume !== undefined ? saved.volume : CONFIG.music.volume;
    if (saved.currentTime) audio.addEventListener("loadedmetadata", function () { audio.currentTime = saved.currentTime; }, { once: true });

    function ext() { return CONFIG.music.mode === "external"; }
    B.musicHooks = {
      setSrc: function (s) {
        if (!s) return;
        try { if (new URL(s, location.href).href === audio.src) return; } catch (e) { /* keep going */ }
        var was = !audio.paused;
        audio.src = s;
        if (was && !ext()) audio.play().catch(function () {});
      },
      setPlaying: function (p) {
        root.classList.toggle("playing", p);
        btn.setAttribute("aria-pressed", String(p));
        btn.setAttribute("aria-label", p ? "Pause music" : "Play music");
      },
      mode: function () { if (ext() && !audio.paused) audio.pause(); }
    };
    function save() {
      try { localStorage.setItem(STORE, JSON.stringify({ wasPlaying: !audio.paused, volume: audio.volume, currentTime: audio.currentTime })); } catch (e) { /* ignore */ }
    }
    function render() {
      var playing = !audio.paused;
      root.classList.toggle("playing", playing);
      btn.setAttribute("aria-pressed", String(playing));
      btn.setAttribute("aria-label", playing ? "Pause music" : "Play music");
    }
    function play() {
      if (ext()) { B.post({ type: "invite-music", action: "play" }); return Promise.resolve(); }
      return audio.play().catch(function () {});
    }
    btn.addEventListener("click", function () {
      if (ext()) { B.post({ type: "invite-music", action: "toggle" }); return; }
      if (audio.paused) play(); else audio.pause();
    });
    audio.addEventListener("play", function () { render(); save(); });
    audio.addEventListener("pause", function () { render(); save(); });
    audio.addEventListener("timeupdate", function () { if (!audio.paused) save(); });
    render();

    // Autoplay: try right away; browsers usually block it until the guest interacts,
    // so also start on the first tap/click/key anywhere on the page (except the button itself).
    if (CONFIG.music.autoplay) {
      play();
      var kicked = false;
      var remove = function () {
        kicked = true;
        ["click", "pointerdown", "touchstart", "touchend", "touchmove", "scroll", "keydown", "wheel"].forEach(function (t) { document.removeEventListener(t, kick, true); });
      };
      var kick = function (e) {
        if (root.contains(e.target)) return remove();
        if (audio.paused) play();
        remove();
      };
      ["click", "pointerdown", "touchstart", "touchend", "touchmove", "scroll", "keydown", "wheel"].forEach(function (t) { document.addEventListener(t, kick, true); });
      // PC view (pc.html): a click on the side background also counts as the first tap
      window.addEventListener("message", function (e) {
        if (e.data && e.data.type === "invite-kick" && !kicked) {
          if (audio.paused) play();
          remove();
        }
      });
    }
  }

  // PC view (pc.html): wheel / keys over the side background scroll the invite
  window.addEventListener("message", function (e) {
    if (e.data && e.data.type === "invite-scroll") window.scrollBy(0, e.data.dy);
  });

  // ===================================================================
  //  Celebrations – enhance the static bilingual event details
  // ===================================================================
  var ICONS = {
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4.5" width="18" height="16" rx="2.5"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>',
    left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
    right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>',
    diamond: '<svg viewBox="0 0 80 12"><path d="M0 6h32M48 6h32" stroke="currentColor" stroke-width="1"/><path d="M40 1l5 5-5 5-5-5z" fill="currentColor"/></svg>'
  };

  // UTC timestamps keep the same moment for guests in every timezone.
  // A missing end is deliberately a zero-duration start-time reminder.
  function googleCalendarLink(event) {
    var start = Date.parse(event.start);
    var end = event.end == null ? start : Date.parse(event.end);
    if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return null;
    var stamp = function (value) { return new Date(value).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z'); };
    var reminder = event.end == null;
    var details = CONFIG.coupleNames + '\n' + event.title + '\n' + event.date + ' · ' + event.time + ' IST';
    if (reminder) details += '\nStart-time reminder; no fixed end time.';
    details += '\nDirections: ' + (event.mapLink || CONFIG.mapsLink);
    var params = new URLSearchParams({
      action: 'TEMPLATE', text: CONFIG.coupleNames + ' — ' + event.title,
      dates: stamp(start) + '/' + stamp(end), ctz: 'Asia/Kolkata',
      location: event.venue, details: details
    });
    return 'https://calendar.google.com/calendar/render?' + params.toString();
  }

  // Enhance existing event text without replacing the static, bilingual section.
  function initEvents() {
    var section = document.querySelector(SLOTS.events);
    if (!section) return;
    var events = CONFIG.events || [];
    function write(root, selector, value) {
      var node = root.querySelector(selector);
      if (node && typeof value === "string" && value.trim() && node.textContent.trim() !== value.trim()) node.textContent = value;
    }
    write(section, "[data-ce-heading]", CONFIG.eventsHeading);
    $$("[data-event-key]", section).forEach(function (article, index) {
      var key = article.getAttribute("data-event-key");
      var event = events.find(function (item) { return item.id === key; }) || events[index];
      if (!event) return;
      write(article, "[data-ce-title]", event.title);
      write(article, "[data-ce-date]", event.date);
      write(article, "[data-ce-time]", event.time);
      write(article, "[data-ce-description]", event.description);
      var calendar = article.querySelector('[data-ce-calendar]');
      var calendarUrl = googleCalendarLink(event);
      if (calendar) {
        calendar.hidden = !calendarUrl;
        if (calendarUrl) calendar.href = calendarUrl;
        else calendar.removeAttribute('href');
        var calendarNote = article.querySelector('.ce-calendar-note');
        if (calendarNote) calendarNote.hidden = !calendarUrl;
      }
      var img = article.querySelector("[data-ce-image]");
      if (img && event.image && img.getAttribute("src") !== event.image) img.src = event.image;
    });
    var first = events[0];
    if (first) write(section, "[data-ce-venue]", first.venue);
    var directions = section.querySelector("[data-ce-directions]");
    var link = (first && first.mapLink) || CONFIG.mapsLink;
    if (directions && link) directions.href = link;
  }

  // ===================================================================
  //  Photo slider inside the golden frame (cross-fade)
  // ===================================================================
  function initFrameSlider() {
    var imgsSrc = CONFIG.frameSlider.images;
    $$(SLOTS.frameSlider).forEach(function (host) {
      var root = host.querySelector("div");
      if (!root || !imgsSrc.length) return;
      var tpl = root.querySelector("img");
      if (!tpl) return;
      $$("img", root).forEach(function (i) { i.remove(); });
      var imgs = imgsSrc.map(function (src, i) {
        var im = tpl.cloneNode();
        im.src = src;
        im.removeAttribute("loading");
        im.style.opacity = i === 0 ? 1 : 0;
        root.appendChild(im);
        return im;
      });
      var index = 0, visible = false;
      onScreen(root, 0.2, function (v) { visible = v; });
      if (imgs.length > 1 && !reducedMotion) {
        setInterval(function () {
          if (!visible) return;
          imgs[index].style.opacity = 0;
          index = (index + 1) % imgs.length;
          imgs[index].style.opacity = 1;
        }, Math.max(2, CONFIG.frameSlider.seconds) * 1000);
      }
    });
  }

  // ===================================================================
  //  Countdown ("Counting the Days")
  // ===================================================================
  function initCountdown() {
    var hosts = $$(SLOTS.countdown);
    if (!hosts.length) return;
    var pad = function (n) { return String(n).padStart(2, "0"); };
    function remaining() {
      var t = new Date(CONFIG.weddingDate).getTime() - Date.now();
      if (!(t > 0)) return [0, 0, 0, 0];
      return [Math.floor(t / 864e5), Math.floor(t / 36e5 % 24), Math.floor(t / 6e4 % 60), Math.floor(t / 1e3 % 60)];
    }
    function propsFor(host) {
      var key = Object.keys(COUNTDOWN).find(function (k) { return host.matches(k); });
      var set = COUNTDOWN[key] || COUNTDOWN[Object.keys(COUNTDOWN)[0]];
      var bp = breakpoint();
      return Object.assign({}, set.base, set[bp] || {}, bp === "desktop" ? set.desktop || {} : {});
    }
    function render() {
      var v = remaining(), labels = ["D", "H", "M", "S"];
      hosts.forEach(function (h) {
        var p = propsFor(h);
        var units = v.map(function (val, i) {
          return '<div style="display:flex;align-items:center;flex:0 1 auto;min-width:0"><div style="display:flex;flex-direction:column;align-items:center">' +
            '<div style="background-color:#FFFFFF;border-radius:' + p.boxBorderRadius + 'px;display:flex;justify-content:center;align-items:center;box-shadow:0 1px 3px rgba(0,0,0,0.08);' +
            "width:clamp(44px, 12vw, " + p.boxWidth + "px);height:clamp(44px, 12vw, " + p.boxHeight + "px);min-width:44px;min-height:44px;padding:clamp(4px, 2vw, " + p.boxPadding + "px) clamp(6px, 3vw, " + p.boxPadding * 1.5 + 'px)">' +
            '<span style="' + p.font + ";color:" + p.textColor + ';font-variant-numeric:tabular-nums;font-size:clamp(18px, 5vw, ' + p.fontSize + 'px)">' + pad(val) + "</span></div>" +
            '<span style="' + p.label + ";color:" + p.labelColor + ';text-transform:uppercase;white-space:nowrap;font-size:clamp(8px, 2.5vw, ' + p.labelSize + 'px);margin-top:6px;letter-spacing:0.1em">' + labels[i] + "</span></div>" +
            (i < 3 ? '<span style="color:' + p.textColor + ';font-weight:300;font-family:system-ui,-apple-system,sans-serif;opacity:.6;font-size:clamp(16px, 4vw, 24px);margin-left:clamp(4px, 2vw, ' + p.gap + 'px);margin-top:0;align-self:center">:</span>' : "") +
            "</div>";
        }).join("");
        var html = '<div style="width:100%;height:100%;position:relative;background:transparent;border-radius:' + p.borderRadius + "px;padding:" + p.padding + 'px;display:flex;justify-content:center;align-items:center;max-width:100%;box-sizing:border-box">' +
          '<div style="display:flex;align-items:center;gap:' + p.gap + 'px;flex-wrap:nowrap;width:100%;min-width:0">' + units + "</div></div>";
        if (h.innerHTML !== html) h.innerHTML = html;
      });
    }
    render();
    setInterval(render, 1000);
    window.addEventListener("resize", render);
  }

  // ===================================================================
  //  RSVP – button + form (saved locally until CONFIG.rsvp.endpoint is set)
  // ===================================================================
  var RSVP_STORE = "rsvpResponses";
  var LOTUS = '<svg viewBox="0 0 64 24" fill="currentColor"><path d="M32 2c3 4 4.5 8 4.5 11.5S35 20 32 22c-3-2-4.5-5-4.5-8.5S29 6 32 2z"/><path d="M24 8c3.5 1.5 6 4.5 7 8.5.4 1.8.4 3.6 0 5.5-3.4-.4-6.2-2-7.6-4.8C22 14.6 22.4 11 24 8zM40 8c1.6 3 2 6.6.6 9.2-1.4 2.8-4.2 4.4-7.6 4.8-.4-1.9-.4-3.7 0-5.5 1-4 3.5-7 7-8.5z" opacity=".75"/><path d="M2 21h20M42 21h20" stroke="currentColor" stroke-width="1.2" fill="none"/><circle cx="2" cy="21" r="1.4"/><circle cx="62" cy="21" r="1.4"/></svg>';

  // Sends one RSVP. Connect the backend by setting CONFIG.rsvp.endpoint: it receives
  // POST application/json { name, phone, attending, guests, events[], message, submittedAt }.
  function sendRsvp(data) {
    return B.sendRsvp(data);
  }

  function initRsvp() {
    var F = B.rsvpFields(CONFIG);
    $$(".rsvp-modal").forEach(function (m) { m.remove(); });
    document.documentElement.classList.remove("rsvp-open");
    var hosts = $$(SLOTS.rsvp);
    if (!hosts.length) return;
    var guestOptions = "";
    for (var g = 1; g <= CONFIG.rsvp.maxGuests; g++) guestOptions += '<option value="' + g + '">' + g + (g === 1 ? " guest" : " guests") + "</option>";
    var eventPills = CONFIG.events.map(function (ev) {
      return '<label class="rsvp-pill"><input type="checkbox" name="events" value="' + esc(ev.id || ev.title) + '" checked><span>' + esc(ev.title) + "</span></label>";
    }).join("");

    var modal = document.createElement("div");
    modal.className = "rsvp-modal";
    modal.hidden = true;
    modal.innerHTML =
      '<div class="rsvp-backdrop" data-close></div>' +
      '<div class="rsvp-sheet" role="dialog" aria-modal="true" aria-labelledby="rsvp-title">' +
      '<button type="button" class="rsvp-close" data-close aria-label="Close">&times;</button>' +
      '<form class="rsvp-form" novalidate>' +
      '<div class="rsvp-lotus">' + LOTUS + "</div>" +
      '<h3 id="rsvp-title">Will you join us?</h3>' +
      (CONFIG.rsvp.deadlineText ? '<p class="rsvp-sub">' + esc(CONFIG.rsvp.deadlineText) + "</p>" : "") +
      '<label class="rsvp-field"><span>Your name</span><input name="name" autocomplete="name" required maxlength="80"></label>' +
      (F.mobile ? '<label class="rsvp-field"><span>Phone number</span><input name="phone" type="tel" autocomplete="tel" inputmode="tel" required maxlength="20"></label>' : "") +
      (F.email ? '<label class="rsvp-field"><span>Email <em>(optional)</em></span><input name="email" type="email" autocomplete="email" maxlength="120"></label>' : "") +
      '<div class="rsvp-choice" role="radiogroup" aria-label="Attending">' +
      '<label><input type="radio" name="attending" value="yes" checked><span>Joyfully accept</span></label>' +
      '<label><input type="radio" name="attending" value="no"><span>Regretfully decline</span></label></div>' +
      '<div class="rsvp-if-yes">' +
      (F.guestCount ? '<label class="rsvp-field"><span>Number of guests</span><select name="guests">' + guestOptions + "</select></label>" : "") +
      '<div class="rsvp-field"><span>Events you will attend</span><div class="rsvp-pills">' + eventPills + "</div></div>" +
      "</div>" +
      (F.message ? '<label class="rsvp-field"><span>Message for the couple <em>(optional)</em></span><textarea name="message" rows="2" maxlength="500"></textarea></label>' : "") +
      '<p class="rsvp-error" role="alert"></p>' +
      '<button type="submit" class="rsvp-submit">Send RSVP</button>' +
      "</form>" +
      '<div class="rsvp-thanks" hidden><div class="rsvp-lotus">' + LOTUS + '</div><h3></h3><p></p>' +
      '<button type="button" class="rsvp-submit" data-close>Close</button></div>' +
      "</div>";
    document.body.appendChild(modal);

    var form = modal.querySelector("form"), thanks = modal.querySelector(".rsvp-thanks");
    var errorEl = modal.querySelector(".rsvp-error"), ifYes = modal.querySelector(".rsvp-if-yes");
    var submit = form.querySelector(".rsvp-submit");

    function open() {
      modal.hidden = false;
      form.hidden = false;
      thanks.hidden = true;
      errorEl.textContent = "";
      document.documentElement.classList.add("rsvp-open");
      void modal.offsetWidth; // apply the hidden state first so the fade-in runs
      modal.classList.add("show");
      setTimeout(function () { form.elements.name.focus({ preventScroll: true }); }, 350);
    }
    function close() {
      modal.classList.remove("show");
      document.documentElement.classList.remove("rsvp-open");
      setTimeout(function () { modal.hidden = true; }, 300);
    }
    $$("[data-close]", modal).forEach(function (b) { b.addEventListener("click", close); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !modal.hidden) close(); });
    form.addEventListener("change", function () { ifYes.hidden = form.elements.attending.value !== "yes"; });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = form.elements, name = f.name.value.trim(), phone = f.phone ? f.phone.value.trim() : "", email = f.email ? f.email.value.trim() : "";
      var attending = f.attending.value === "yes";
      if (name.length < 2) { errorEl.textContent = "Please enter your name."; f.name.focus(); return; }
      if (f.phone && phone.replace(/\D/g, "").length < 10) { errorEl.textContent = "Please enter a valid phone number."; f.phone.focus(); return; }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { errorEl.textContent = "Please enter a valid email address."; f.email.focus(); return; }
      var events = $$("input[name=events]:checked", form).map(function (c) { return c.value; });
      if (attending && !events.length) { errorEl.textContent = "Please pick at least one event."; return; }
      errorEl.textContent = "";
      submit.disabled = true;
      submit.textContent = "Sending…";
      var data = {
        name: name, phone: phone, email: email, attending: attending,
        guests: attending && f.guests ? parseInt(f.guests.value, 10) : 1,
        events: attending ? events : [],
        message: f.message ? f.message.value.trim() : "",
        submittedAt: new Date().toISOString()
      };
      sendRsvp(data).then(function () {
        thanks.querySelector("h3").textContent = "Thank you, " + name.split(" ")[0] + "!";
        thanks.querySelector("p").textContent = attending
          ? "Your RSVP is received. We can't wait to celebrate with you 🙏"
          : "We'll miss you! Thank you for letting us know.";
        form.hidden = true;
        thanks.hidden = false;
        form.reset();
        ifYes.hidden = false;
        try { if (!B.preview) localStorage.setItem(B.key("rsvpSent"), "1"); } catch (err) { /* ignore */ }
        hosts.forEach(function (h) { h.querySelector(".rsvp-btn span").textContent = "RSVP Sent ✓"; });
      }).catch(function () {
        errorEl.textContent = "Couldn't send right now. Please check your internet and try again.";
      }).then(function () {
        submit.disabled = false;
        submit.textContent = "Send RSVP";
      });
    });

    var sent = false;
    try { sent = localStorage.getItem(B.key("rsvpSent")) === "1"; } catch (e) { /* ignore */ }
    hosts.forEach(function (host) {
      host.innerHTML = '<button type="button" class="rsvp-btn"><span>' + (sent ? "RSVP Sent ✓" : "RSVP Now") + "</span></button>";
      host.firstChild.addEventListener("click", open);
    });
  }

  // ===================================================================
  //  Location pin button (tablet / desktop layout) with golden sparkles
  // ===================================================================
  function initLocationButton() {
    var PIN = "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z";
    var SPARK = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 0c1 6.5 5.5 11 12 12-6.5 1-11 5.5-12 12-1-6.5-5.5-11-12-12C6.5 11 11 6.5 12 0z" fill="#d9ad4c"/></svg>');
    if (!SLOTS.location) return;
    $$(SLOTS.location).forEach(function (host) {
      host.innerHTML = '<div class="loc"><button type="button" class="loc-btn" aria-label="Open location in Google Maps">' +
        '<svg viewBox="0 0 24 24"><path d="' + PIN + '"/></svg></button><div class="loc-particles"></div></div>';
      var btn = host.querySelector(".loc-btn"), layer = host.querySelector(".loc-particles");
      btn.addEventListener("click", function () {
        var D = btn.offsetWidth;
        for (var i = 0; i < 10; i++) {
          var a = Math.PI * 2 * i / 10 + (Math.random() - .5) * .9, v = (60 + Math.random() * 100) * (D / 64), size = 8 + Math.random() * 6;
          var n = document.createElement("div");
          n.style.cssText = "position:absolute;left:" + (D / 2 - size / 2) + "px;top:" + (D / 2 - size / 2) + "px;width:" + size + "px;height:" + size + "px;pointer-events:none;background:url('" + SPARK + "') center/contain no-repeat";
          layer.appendChild(n);
          if (window.gsap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            window.gsap.to(n, { x: Math.cos(a) * v, y: Math.sin(a) * v - 40, rotation: 90, scale: .6, opacity: 0,
              duration: .8, ease: 'power2.out', onComplete: function () { this.targets()[0].remove(); } });
          } else n.remove();
        }
        if (CONFIG.mapsLink) window.open(CONFIG.mapsLink, "_blank", "noopener");
      });
    });
  }

  function initCountdownNote() {
    var X = CONFIG.countdownExtra;
    $$(".cd-note").forEach(function (n) { n.remove(); });
    if (!X) return;
    $$(SLOTS.countdown).forEach(function (host) {
      if (!host.offsetParent) return;
      var n = document.createElement("div");
      n.className = "cd-note";
      var line = function (css, text) { return text ? '<p style="margin:0;' + css + '">' + esc(text) + "</p>" : ""; };
      n.innerHTML =
        line("font:italic 400 clamp(17px,5vw,24px)/1.3 'Playfair Display',serif;color:#6a1723", X.dateText) +
        line("margin-top:6px;font:500 clamp(11px,3vw,14px)/1.3 Inter,sans-serif;letter-spacing:.28em;text-transform:uppercase;color:rgba(23,9,9,.65)", X.time) +
        '<svg viewBox="0 0 80 12" width="80" height="12" style="display:block;margin:18px auto" aria-hidden="true"><path d="M0 6h32M48 6h32" stroke="#a37a2c" stroke-width="1"/><path d="M40 1l5 5-5 5-5-5z" fill="#a37a2c"/></svg>' +
        line("font:italic 600 clamp(20px,6vw,30px)/1.2 'Playfair Display',serif;color:#2b0d12", X.names) +
        (true ? line("margin-top:8px;font:400 clamp(11px,3vw,13px)/1.5 Inter,sans-serif;color:rgba(23,9,9,.7)", X.line) : "");
      n.style.cssText = "position:absolute;left:0;width:100%;text-align:center;padding:0 24px;box-sizing:border-box;top:" + (host.offsetTop + host.offsetHeight + 28) + "px;pointer-events:none";
      host.insertAdjacentElement("afterend", n);
    });
  }

  // ===================================================================
  
  // ===================================================================
  //  Closing countdown; Tamil blessing and English practical information
  // ===================================================================
  function initClosingCountdown() {
    var root = document.querySelector('.wedding-closing');
    if (!root) return;
    var target = Date.parse(CONFIG.weddingDate);
    var timer = root.querySelector('.closing-timer');
    var arrival = root.querySelector('.closing-arrival');
    var date = root.querySelector('.closing-date time');
    var fields = ['days', 'hours', 'minutes', 'seconds'].map(function (unit) {
      return root.querySelector('[data-closing-unit="' + unit + '"]');
    });
    // The static date remains readable if configuration or JavaScript is unavailable.
    if (!Number.isFinite(target)) return;
    date.dateTime = CONFIG.weddingDate;
    var day = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'long', year: 'numeric' }).format(target);
    var time = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hour12: true }).format(target);
    date.querySelector('[lang="en"]').textContent = day + ' · ' + time + ' IST';
    function render() {
      var diff = Math.max(0, target - Date.now());
      var values = [Math.floor(diff / 864e5), Math.floor(diff / 36e5 % 24), Math.floor(diff / 6e4 % 60), Math.floor(diff / 1e3 % 60)];
      fields.forEach(function (el, index) {
        var value = String(values[index]).padStart(2, '0');
        if (el.textContent !== value) el.textContent = value;
      });
      timer.hidden = diff === 0;
      arrival.hidden = diff > 0;
      var title = diff === 0 ? 'Our wedding day' : 'Counting the days';
      var heading = root.querySelector('#closing-title [lang="en"]');
      if (heading.textContent !== title) heading.textContent = title;
      return diff > 0;
    }
    if (render()) {
      var interval = setInterval(function () {
        if (!render()) clearInterval(interval);
      }, 1000);
    }
  }

//  Boot
  // ===================================================================
  // Handle smooth scroll forwarding from parent window (laptop / desktop view)
  window.addEventListener('message', function (e) {
    if (e.data && e.data.type === 'scroll-by') {
      window.scrollBy({ top: e.data.deltaY, behavior: 'auto' });
    }
  });

  B.register({
    CONFIG: CONFIG,
    DEFAULTS: DEFAULTS,
    statics: [],
    music: initMusic,
    widgets: [initEvents, initFrameSlider, initCountdown, initClosingCountdown, initRsvp, initLocationButton, initCountdownNote],
    fitTexts: fitTexts
  });

})();
