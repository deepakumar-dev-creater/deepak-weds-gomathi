/*
 * Bridge between a Framer-exported invitation (kashi-ghat / kedar-dham /
 * meenakshi-mandir, each in its own folder) and the SaaS that hosts it.
 *
 * The invitation runs inside an <iframe> (see src/lib/templates/hindu-invite.tsx)
 * so its Framer CSS and layout stay untouched. The parent page sends the
 * couple's content as one JSON "payload" with postMessage; this file applies it:
 *   - config  -> the widget settings in the template's own site.js (events,
 *                countdown date, photos, RSVP, music, map link)
 *   - texts   -> the static words baked into the HTML (names, parents, story),
 *                found by their original wording and rewritten in place
 * Everything is idempotent: the editor re-sends the payload on every keystroke.
 *
 * Each template's site.js ends with InviteBridge.register({...}); each
 * index.html defines window.InviteTemplate = { textRules: [...] } first.
 */
(function () {
  "use strict";

  var B = (window.InviteBridge = {});
  var root = document.documentElement;

  B.standalone = window.parent === window;
  B.siteId = "demo";
  B.preview = true;
  B.state = {}; // survives widget re-mounts (e.g. which event card is open)
  B.musicHooks = null;

  B.post = function (msg) {
    try { window.parent.postMessage(msg, "*"); } catch (e) { /* no parent */ }
  };
  // localStorage keys are per site: invitations share an origin, and one
  // guest's "RSVP sent" or music position must not leak onto another invite.
  B.key = function (name) { return name + ":" + B.siteId; };
  B.rsvpFields = function (cfg) {
    var f = (cfg.rsvp && cfg.rsvp.fields) || {};
    return { mobile: f.mobile !== false, email: f.email !== false, guestCount: f.guestCount !== false, message: f.message !== false };
  };
  B.mergeConfig = function (defaults) { return JSON.parse(JSON.stringify(defaults)); };

  // ------------------------------------------------------------------
  //  RSVP -> the SaaS's own endpoint
  // ------------------------------------------------------------------
  B.sendRsvp = function (data) {
    if (B.preview) return new Promise(function (resolve) { setTimeout(resolve, 600); });
    return fetch("/api/rsvp/" + encodeURIComponent(B.siteId), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guestName: data.name,
        phone: data.phone || "",
        email: data.email || "",
        attending: data.attending ? "yes" : "no",
        guestCount: data.attending ? Math.max(1, data.guests || 1) : 1,
        message: data.message || "",
        eventIds: data.attending ? data.events || [] : [],
        website: ""
      })
    }).then(function (res) { if (!res.ok) throw new Error("HTTP " + res.status); });
  };

  // ------------------------------------------------------------------
  //  Scope: collects everything a widget registers on document/window
  //  (intervals, listeners, observers) so a re-mount can undo it.
  // ------------------------------------------------------------------
  function scope(fn) {
    var intervals = [], listeners = [], observers = [];
    var oSI = window.setInterval, dAdd = document.addEventListener, wAdd = window.addEventListener;
    var OIO = window.IntersectionObserver, ORO = window.ResizeObserver;
    window.setInterval = function () { var id = oSI.apply(window, arguments); intervals.push(id); return id; };
    document.addEventListener = function (t, f, o) { listeners.push([document, t, f, o]); return dAdd.call(document, t, f, o); };
    window.addEventListener = function (t, f, o) { listeners.push([window, t, f, o]); return wAdd.call(window, t, f, o); };
    window.IntersectionObserver = function (cb, opts) { var o = new OIO(cb, opts); observers.push(o); return o; };
    window.IntersectionObserver.prototype = OIO.prototype;
    if (ORO) {
      window.ResizeObserver = function (cb) { var o = new ORO(cb); observers.push(o); return o; };
      window.ResizeObserver.prototype = ORO.prototype;
    }
    try { fn(); } finally {
      window.setInterval = oSI;
      document.addEventListener = dAdd;
      window.addEventListener = wAdd;
      window.IntersectionObserver = OIO;
      if (ORO) window.ResizeObserver = ORO;
    }
    return function dispose() {
      intervals.forEach(function (id) { clearInterval(id); });
      listeners.forEach(function (l) { l[0].removeEventListener(l[1], l[2], l[3]); });
      observers.forEach(function (o) { try { o.disconnect(); } catch (e) { /* ignore */ } });
    };
  }

  // ------------------------------------------------------------------
  //  Config
  // ------------------------------------------------------------------
  function nonEmpty(list) {
    return Array.isArray(list) ? list.filter(function (s) { return typeof s === "string" && s; }) : [];
  }

  function applyConfig(cfg, defaults, c) {
    ["weddingDate", "weddingDateText", "mapsLink", "eventsHeading", "coupleNames"].forEach(function (k) {
      if (typeof c[k] === "string") cfg[k] = c[k];
      else cfg[k] = defaults[k];
    });
    cfg.countdownExtra = c.countdownExtra;
    if (c.music) {
      cfg.music.mode = c.music.mode || "file";
      cfg.music.src = c.music.src || defaults.music.src;
    }
    if (c.rsvp) {
      cfg.rsvp.deadlineText = c.rsvp.deadlineText || "";
      cfg.rsvp.fields = c.rsvp.fields || {};
      if (c.rsvp.maxGuests) cfg.rsvp.maxGuests = c.rsvp.maxGuests;
    }
    if (Array.isArray(c.events) && defaults.events) {
      cfg.events = c.events.map(function (e, i) {
        var d = defaults.events[i % defaults.events.length] || {};
        return {
          id: e.id, title: e.title, date: e.date, time: e.time, venue: e.venue,
          start: e.start, end: e.end,
          description: e.description || "", mapLink: e.mapLink || "",
          image: e.image || d.image
        };
      });
    }
    if (defaults.photoStack) { var ps = nonEmpty(c.photoStack); cfg.photoStack = ps.length ? ps : defaults.photoStack.slice(); }
    if (defaults.gallery) { var g = nonEmpty(c.gallery); cfg.gallery = g.length ? g : defaults.gallery.slice(); }
    if (defaults.flipGrid) {
      cfg.flipGrid = {
        front: (c.flipGrid && c.flipGrid.front) || defaults.flipGrid.front,
        back: (c.flipGrid && c.flipGrid.back) || defaults.flipGrid.back
      };
    }
    if (defaults.frameSlider) {
      var fs = nonEmpty(c.frameSlider && c.frameSlider.images);
      cfg.frameSlider.images = fs.length ? fs : defaults.frameSlider.images.slice();
    }
  }

  // ------------------------------------------------------------------
  //  Texts: static words baked into the Framer HTML
  // ------------------------------------------------------------------
  // rules: [{ text, key, scope?, hero? }]
  //   text   exact original wording (whitespace-trimmed)
  //   key    which entry of payload.texts replaces it
  //   scope  only inside a Framer frame whose data-framer-name matches /scope/
  //   hero   "first" | "second": the hero's name slots, which follow the
  //          "groom's name first" setting (the rest of the page keeps its order)
  var records = null;

  function inFrame(node, re) {
    for (var p = node.parentElement; p; p = p.parentElement) {
      var nm = p.getAttribute && p.getAttribute("data-framer-name");
      if (nm && re.test(nm)) return true;
    }
    return false;
  }

  function collectTexts(rules) {
    records = [];
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var t = n.parentNode && n.parentNode.nodeName;
        return t === "SCRIPT" || t === "STYLE" || t === "NOSCRIPT" ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });
    var n;
    while ((n = w.nextNode())) {
      var t = n.nodeValue.trim();
      if (!t) continue;
      for (var i = 0; i < rules.length; i++) {
        var r = rules[i];
        if (r.text !== t) continue;
        if (r.scope && !inFrame(n, new RegExp(r.scope))) continue;
        records.push({ node: n, rule: r, orig: t });
        break;
      }
    }
  }

  function withCase(orig, value) {
    if (/[A-Z]/.test(orig) && orig === orig.toUpperCase()) return value.toUpperCase();
    return value;
  }

  function applyTexts(rules, texts) {
    if (!records) collectTexts(rules);
    records.forEach(function (rec) {
      var key = rec.rule.key;
      if (rec.rule.hero) key = rec.rule.hero === "first" ? "heroFirst" : "heroSecond";
      var v = texts[key];
      if (typeof v !== "string") return;
      var out = rec.rule.keepCase ? v : withCase(rec.orig, v);
      if (rec.node.nodeValue !== out) rec.node.nodeValue = out;
    });
  }

  // ------------------------------------------------------------------
  //  Hidden sections
  // ------------------------------------------------------------------
  // hideRules: { <editor section id>: { selectors: [css], texts: [words] } }
  //   selectors  elements to hide (every responsive copy matches)
  //   texts      headings/labels, found by their wording (case-insensitive,
  //              prefix match); the whole Framer text frame around them hides
  // payload.hidden lists the section ids the couple switched off. The artwork
  // behind a hidden widget stays, so nothing collapses into a gap.
  var hideRules = (window.InviteTemplate && window.InviteTemplate.hideRules) || {};
  var hideTextHosts = null;

  function collectHideTexts() {
    hideTextHosts = {};
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    var n;
    while ((n = w.nextNode())) {
      var t = n.nodeValue.trim().toLowerCase();
      if (!t) continue;
      Object.keys(hideRules).forEach(function (id) {
        (hideRules[id].texts || []).forEach(function (word) {
          if (t.indexOf(word.toLowerCase()) !== 0) return;
          var host = n.parentElement && n.parentElement.closest('[data-framer-component-type="RichTextContainer"]');
          if (host) (hideTextHosts[id] = hideTextHosts[id] || []).push(host);
        });
      });
    }
  }

  function applyHidden(hidden) {
    if (!hideTextHosts) collectHideTexts();
    var off = {};
    (hidden || []).forEach(function (id) { off[id] = true; });
    Object.keys(hideRules).forEach(function (id) {
      var els = (hideTextHosts[id] || []).slice();
      (hideRules[id].selectors || []).forEach(function (sel) {
        Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) { els.push(el); });
      });
      els.forEach(function (el) { el.classList.toggle("inv-hidden", !!off[id]); });
    });
  }

  // ------------------------------------------------------------------
  //  Lifecycle
  // ------------------------------------------------------------------
  var api = null, payload = null, booted = false, disposeWidgets = null, lastSig = "", timer = null, mountTimer = null, warmed = false;
  var rules = (window.InviteTemplate && window.InviteTemplate.textRules) || [];

  function mountWidgets() {
    if (disposeWidgets) disposeWidgets();
    disposeWidgets = scope(function () {
      api.widgets.forEach(function (fn) {
        try { fn(); } catch (err) { console.error(fn.name + " failed:", err); }
      });
    });
  }

  // The couple's names, set in big display type inside fixed-width Framer text
  // boxes, run off a phone's edge (or snap mid-word) when they are long. Shrink
  // them until each sits on one line (the frames are sized for one line per
  // name; a second line would push the names off the top of the screen). Short
  // names keep the template's own size. Both hero names match.
  function fitNameTexts() {
    if (!records) return;
    var items = [];
    records.forEach(function (rec) {
      if (rec.rule.key !== "groom" && rec.rule.key !== "bride") return;
      var el = rec.node.parentElement;
      var block = el && (el.closest("p,h1,h2,h3,h4") || el);
      // text inside an <svg viewBox> is scaled with the artwork and already
      // fitted by the page's own fitTexts(): its px are not screen px
      if (!block || block.closest("svg")) return;
      block.style.removeProperty("font-size");
      block.style.whiteSpace = "";
      block.style.maxWidth = "";
      if (!block.getClientRects().length) return;
      // laid out is enough: the hero names sit at visibility:hidden until the page is opened
      items.push({ block: block, group: rec.rule.hero ? "hero" : "" });
    });
    function drawn(el) {
      var range = document.createRange();
      range.selectNodeContents(el);
      var l = Infinity, r = -Infinity;
      Array.prototype.forEach.call(range.getClientRects(), function (b) {
        if (b.width < 2 || b.height < 2) return;
        l = Math.min(l, b.left); r = Math.max(r, b.right);
      });
      return r > l ? r - l : 0;
    }
    items.forEach(function (it) {
      // The room is the screen, not the Framer text box: the artwork lets the
      // couple's short names spill past a narrow box (centred on the page), so
      // sizing to the box would shrink every name, short ones included.
      var b = it.block;
      var avail = window.innerWidth * 0.92;
      var base = parseFloat(getComputedStyle(b).fontSize);
      var keep = { w: b.style.width, ws: b.style.whiteSpace, mw: b.style.maxWidth };
      b.style.width = "max-content"; b.style.whiteSpace = "nowrap"; b.style.maxWidth = "none";
      var natural = b.offsetWidth;
      b.style.width = keep.w; b.style.whiteSpace = keep.ws; b.style.maxWidth = keep.mw;
      it.base = base; it.avail = avail; it.text = (b.textContent || "").trim();
      it.ratio = avail > 0 && natural > 0 ? Math.min(1, (avail / natural) * 0.985) : 1;
    });
    var heroRatio = Math.min.apply(null, items.filter(function (i) { return i.group; }).map(function (i) { return i.ratio; }).concat([1]));
    items.forEach(function (it) {
      var r = it.group ? heroRatio : it.ratio;
      if (r >= 1) return;
      var b = it.block;
      b.style.whiteSpace = "nowrap"; // these frames are sized for one line per name
      b.style.setProperty("font-size", it.base * r + "px", "important");
      for (var i = 0; i < 20 && drawn(b) > it.avail + 1 && r > 0.25; i++) {
        r *= 0.94;
        b.style.setProperty("font-size", it.base * r + "px", "important");
      }
      it.final = r;
    });
    // both hero names end up the same size
    var heroFinal = Math.min.apply(null, items.filter(function (i) { return i.group && i.final; }).map(function (i) { return i.final; }).concat([1]));
    if (heroFinal < 1) items.forEach(function (it) {
      if (it.group && it.final && it.final !== heroFinal) it.block.style.setProperty("font-size", it.base * heroFinal + "px", "important");
    });
  }

  function refit() {
    try { api.fitTexts(); } catch (err) { console.error("fitTexts failed:", err); }
    try { fitNameTexts(); } catch (err) { console.error("fitNameTexts failed:", err); }
  }

  // Lazy images that decode only once they scroll into view show up as blank
  // flashes while scrolling fast. Once the first screen has settled, fetch the rest.
  function warmImages() {
    setTimeout(function () {
      // Only the ones this screen size actually draws: the page also carries
      // tablet/desktop copies (display:none) that must never be downloaded.
      Array.prototype.forEach.call(document.querySelectorAll('img[loading="lazy"]'), function (img) {
        if (img.getClientRects().length) img.loading = "eager";
      });
    }, 1500);
  }

  function reveal() {
    if (!warmed) { warmed = true; warmImages(); }
    refit();
    requestAnimationFrame(function () {
      root.classList.remove("inv-pending");
      B.post({ type: "invite-shown" });
    });
  }

  // The host page's "Made with SaveOurDate" strip, drawn as the very last section.
  function setBadge(on) {
    var el = document.getElementById("inv-badge");
    if (!on) { if (el) el.remove(); return; }
    if (el) return;
    el = document.createElement("div");
    el.id = "inv-badge";
    el.className = "inv-badge";
    el.innerHTML = 'Made with <span aria-hidden="true">❤</span> on <a href="https://saveourdate.in" target="_blank" rel="noopener noreferrer">SaveOurDate.in</a>';
    document.body.appendChild(el);
  }

  // The Dress Code card. The Framer pages have no dress code of their own, so
  // it is drawn as one more full-width section in the page's flex column, just
  // ABOVE the RSVP, and the rest slides down. Built with textContent / img.src
  // only: the couple types these words and uploads these photos. Removed when
  // the couple switches "dressCode" off.
  //
  // The Framer page the card goes in front of, first match wins (the later
  // names are fallbacks for when the RSVP page is not drawn). kashi-ghat keeps
  // the RSVP button on PAGE 4 together with the location and story.
  var DRESS_BEFORE = {
    "kashi-ghat": ["PAGE 4", "page5"],
    "kedar-dham": ["PAGE 6", "PAGE 8"],
    "meenakshi-mandir": ["PAGE 6", "ARTFUL INVITES DESIGN"]
  };

  // Shown while the couple has not uploaded any dress-code photos of their own,
  // so the card always has a pair of outfit pictures. Their own photos replace
  // these as soon as one is added. Files live next to this one (dresscode/).
  var DRESS_DEFAULTS = [
    { src: "/templates/_invite-bridge/dresscode/saree.webp", caption: "Saree" },
    { src: "/templates/_invite-bridge/dresscode/kurta.webp", caption: "Kurta" }
  ];

  // The visible Framer page the card goes in front of; the end of #main if none
  // is drawn (the template files also carry hidden responsive copies).
  function dressAnchor() {
    var names = DRESS_BEFORE[(window.InviteTemplate && window.InviteTemplate.key) || ""] || [];
    for (var n = 0; n < names.length; n++) {
      var pages = document.querySelectorAll('[data-framer-name="' + names[n] + '"]');
      for (var i = 0; i < pages.length; i++) if (pages[i].getClientRects().length) return pages[i];
    }
    return null;
  }

  var dressTimer = null;
  function stopDressSlider() { if (dressTimer) { clearInterval(dressTimer); dressTimer = null; } }

  // One photo at a time: the next one slides in from the side every few
  // seconds; dots and a swipe move it by hand; it pauses while pointed at.
  function buildDressSlider(box, items) {
    stopDressSlider();
    box.textContent = "";
    var n = items.length;
    if (!n) return;
    var view = document.createElement("div");
    view.className = "inv-dress__view";
    var track = document.createElement("div");
    track.className = "inv-dress__track";
    items.forEach(function (it, i) {
      var fig = document.createElement("figure");
      fig.className = "inv-dress__slide";
      var img = document.createElement("img");
      img.alt = "";
      img.decoding = "async";
      img.src = it.src;
      img.draggable = false;
      fig.appendChild(img);
      track.appendChild(fig);
    });
    view.appendChild(track);
    // The stage holds the photo and, over its edges, the previous / next arrows.
    var stage = document.createElement("div");
    stage.className = "inv-dress__stage";
    stage.appendChild(view);
    box.appendChild(stage);

    var idx = 0, dots = [];
    function go(i) {
      idx = (i + n) % n;
      track.style.transform = "translateX(-" + idx * 100 + "%)";
      dots.forEach(function (d, k) {
        d.classList.toggle("is-on", k === idx);
        d.setAttribute("aria-current", k === idx ? "true" : "false");
      });
    }
    var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function start() {
      stopDressSlider();
      if (n > 1 && !reduced) dressTimer = setInterval(function () { go(idx + 1); }, 3600);
    }
    if (n > 1) {
      var nav = document.createElement("div");
      nav.className = "inv-dress__dots";
      items.forEach(function (_, k) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "inv-dress__dot";
        b.setAttribute("aria-label", "Show photo " + (k + 1));
        b.addEventListener("click", function () { go(k); start(); });
        dots.push(b);
        nav.appendChild(b);
      });
      box.appendChild(nav);
      [["prev", "‹", -1, "Previous photo"], ["next", "›", 1, "Next photo"]].forEach(function (a) {
        var ar = document.createElement("button");
        ar.type = "button";
        ar.className = "inv-dress__arrow inv-dress__arrow--" + a[0];
        ar.setAttribute("aria-label", a[3]);
        ar.textContent = a[1];
        ar.addEventListener("click", function () { go(idx + a[2]); start(); });
        stage.appendChild(ar);
      });
      var x0 = null;
      view.addEventListener("pointerdown", function (e) { x0 = e.clientX; });
      view.addEventListener("pointerup", function (e) {
        if (x0 === null) return;
        var dx = e.clientX - x0;
        x0 = null;
        if (Math.abs(dx) > 40) { go(idx + (dx < 0 ? 1 : -1)); start(); }
      });
      view.addEventListener("pointercancel", function () { x0 = null; });
      box.addEventListener("pointerenter", stopDressSlider);
      box.addEventListener("pointerleave", start);
    }
    go(0);
    start();
  }

  // The optional highlighted line on each photo. Set in place (not by rebuilding
  // the slideshow) so typing a caption in the editor does not restart it.
  function applyDressCaptions(box, items) {
    var figs = box.querySelectorAll(".inv-dress__slide");
    Array.prototype.forEach.call(figs, function (fig, i) {
      var text = (items[i] && items[i].caption) || "";
      var cap = fig.querySelector("figcaption");
      var img = fig.querySelector("img");
      if (img) img.alt = text;
      if (!text) { if (cap) cap.remove(); return; }
      if (!cap) { cap = document.createElement("figcaption"); fig.appendChild(cap); }
      cap.textContent = text;
    });
  }

  function setDressCode(dc, hidden) {
    var el = document.getElementById("inv-dresscode");
    var off = (hidden || []).indexOf("dressCode") !== -1;
    if (off || !dc || (!dc.title && !dc.text)) {
      stopDressSlider();
      if (el) el.remove();
      return;
    }
    if (!el) {
      el = document.createElement("section");
      el.id = "inv-dresscode";
      el.className = "inv-dress";
      el.setAttribute("aria-label", "Dress code");
      el.innerHTML =
        '<div class="inv-dress__card">' +
        '<span class="inv-dress__orn" aria-hidden="true"></span>' +
        '<h2 class="inv-dress__title"></h2>' +
        '<p class="inv-dress__text"></p>' +
        '<div class="inv-dress__photos"></div>' +
        '</div>';
      var anchor = dressAnchor();
      if (anchor && anchor.parentNode) {
        anchor.parentNode.insertBefore(el, anchor);
      } else {
        var main = document.getElementById("main");
        if (main && main.parentNode) main.parentNode.insertBefore(el, main.nextSibling);
        else document.body.appendChild(el);
      }
    }
    el.querySelector(".inv-dress__title").textContent = dc.title || "";
    el.querySelector(".inv-dress__text").textContent = dc.text || "";

    // Photos: rebuilt only when the list changes, so typing in the editor does
    // not restart the slideshow on each keystroke.
    var items = (dc.images || [])
      .map(function (im) {
        return typeof im === "string" ? { src: im, caption: "" } : { src: (im && im.url) || "", caption: String((im && im.caption) || "").trim() };
      })
      .filter(function (it) { return it.src; })
      .slice(0, 4);
    if (!items.length) items = DRESS_DEFAULTS;
    var urls = items.map(function (it) { return it.src; });
    var box = el.querySelector(".inv-dress__photos");
    var sig = "photos:" + urls.join(",");
    if (box.getAttribute("data-sig") !== sig) {
      box.setAttribute("data-sig", sig);
      buildDressSlider(box, items);
    }
    applyDressCaptions(box, items);
  }

  function applyAll() {
    var cfg = api.CONFIG;
    if (payload) setBadge(!!payload.badge);
    if (payload) setDressCode(payload.dressCode, payload.hidden);
    if (payload) {
      B.siteId = payload.siteId || "demo";
      B.preview = payload.preview !== false;
      applyConfig(cfg, api.DEFAULTS, payload.config || {});
    }
    var sig = JSON.stringify([cfg.events, cfg.photoStack, cfg.gallery, cfg.flipGrid, cfg.frameSlider, cfg.coupleNames, cfg.eventsHeading, cfg.weddingDate, cfg.weddingDateText, cfg.countdownExtra, cfg.rsvp, cfg.mapsLink]);

    if (!booted) {
      booted = true;
      if (payload) applyTexts(rules, payload.texts || {});
      if (payload) applyHidden(payload.hidden);
      api.statics.forEach(function (fn) {
        try { fn(); } catch (err) { console.error(fn.name + " failed:", err); }
      });
      try { api.music(); } catch (err) { console.error("music failed:", err); }
      mountWidgets();
      lastSig = sig;
      reveal(); // reveal instantly - no 2.5s delay or white screen!
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(refit);
      var rt;
      window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(refit, 200); });
      return;
    }

    if (payload) applyTexts(rules, payload.texts || {});
    if (payload) applyHidden(payload.hidden);
    if (B.musicHooks) {
      B.musicHooks.setSrc(cfg.music.src);
      B.musicHooks.mode();
    }
    if (sig !== lastSig) {
      lastSig = sig;
      // Typing in the editor changes the config on every keystroke: re-mount once it settles.
      clearTimeout(mountTimer);
      mountTimer = setTimeout(mountWidgets, 160);
    }
    refit();
  }

  B.register = function (a) {
    api = a;
    if (payload || B.standalone) {
      if (!payload) timer = setTimeout(function () { applyAll(); }, 250);
      else applyAll();
    } else {
      // Waiting for the parent's payload; fall back to the defaults if none comes.
      timer = setTimeout(function () { if (!booted) applyAll(); }, 4000);
    }
  };

  window.addEventListener("message", function (e) {
    var m = e.data;
    if (!m || typeof m !== "object") return;
    if (m.type === "invite-data") {
      payload = m.payload;
      B.payload = payload; // handy when debugging in the console
      if (timer) { clearTimeout(timer); timer = null; }
      if (api) applyAll();
    } else if (m.type === "invite-music-state" && B.musicHooks) {
      B.musicHooks.setPlaying(!!m.playing);
    }
  });

  function hello() { B.post({ type: "invite-ready" }); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", hello); else hello();
})();
