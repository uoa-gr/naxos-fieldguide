(function () {
  "use strict";
  var FG = window.FIELD_GUIDE;
  if (!FG) return;

  var DAY_COLORS = ["#0c447c", "#0f6e56", "#9a3b1d", "#855010", "#534ab7"];
  var MODE = {
    meet: { icon: "ti-flag-3", label: "Meeting point" },
    foot: { icon: "ti-walk", label: "On foot" },
    bus:  { icon: "ti-bus", label: "By bus" },
    boat: { icon: "ti-ship", label: "By boat" }
  };

  var ua = navigator.userAgent || "";
  var isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var isAndroid = /Android/.test(ua);

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var state = { day: 0, map: null, markers: [], activeStop: -1 };

  function colorFor(i) { return DAY_COLORS[i % DAY_COLORS.length]; }
  function fmtCoord(s) { return s.lat.toFixed(5) + ", " + s.lng.toFixed(5); }

  function gMaps(s) { return "https://www.google.com/maps/search/?api=1&query=" + s.lat + "," + s.lng; }
  function aMaps(s) { return "https://maps.apple.com/?ll=" + s.lat + "," + s.lng + "&q=" + encodeURIComponent(s.title); }
  function geoUri(s) { return "geo:" + s.lat + "," + s.lng + "?q=" + s.lat + "," + s.lng + "(" + encodeURIComponent(s.title) + ")"; }

  function mapOptions(s) {
    var google = { id: "google", icon: "ti-brand-google-maps", name: "Google Maps", sub: "Pin + directions", href: gMaps(s) };
    var apple = { id: "apple", icon: "ti-brand-apple", name: "Apple Maps", sub: "Pin + directions", href: aMaps(s) };
    var organic = { id: "organic", icon: "ti-leaf", name: "Organic Maps / OsmAnd", sub: "Best offline navigation", href: geoUri(s) };
    var out;
    if (isIOS) out = [apple, google];
    else if (isAndroid) out = [google, organic, apple];
    else out = [google, apple];
    if (out[0]) out[0].rec = true;
    return out;
  }

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function buildTabs() {
    var nav = $("#tabs");
    nav.setAttribute("role", "tablist");
    nav.innerHTML = "";
    FG.days.forEach(function (d, i) {
      var b = el("button", "tab");
      b.type = "button";
      b.setAttribute("role", "tab");
      b.id = "tab-" + i;
      b.innerHTML = "<b>Day " + d.n + "</b><small>" + d.weekday.slice(0, 3) + " · " + d.date.replace(" 2026", "") + "</small>";
      b.style.setProperty("--accent", colorFor(i));
      b.addEventListener("click", function () { selectDay(i); });
      nav.appendChild(b);
    });
  }

  function renderDayHead(d, i) {
    var h = $("#dayhead");
    h.style.setProperty("--accent", colorFor(i));
    h.innerHTML =
      '<p class="eyebrow">Day ' + d.n + " · " + d.weekday + " " + d.date + "</p>" +
      "<h2>" + d.theme + "</h2>" +
      '<p class="meta">' +
        '<span><i class="ti ti-clock-hour-8"></i>Departs ' + d.departure + "</span>" +
        '<span><i class="ti ti-map-pin"></i>' + d.stops.length + " stops</span>" +
        '<span><i class="ti ti-bus"></i>From the Central Bus Station</span>' +
      "</p>";
  }

  function renderStops(d, i) {
    var accent = colorFor(i);
    var ol = $("#stops");
    ol.innerHTML = "";
    ol.style.setProperty("--accent", accent);
    d.stops.forEach(function (s, idx) {
      var li = el("li", "stop");
      li.style.setProperty("--accent", accent);
      li.id = "stop-" + idx;
      var m = MODE[s.mode] || MODE.bus;
      var html = "";
      if (s.photo) html += '<img class="stop-photo" loading="lazy" alt="' + s.title + '" src="assets/img/' + s.photo + '">';
      html += '<div class="stop-body">';
      html += '<div class="stop-top">';
      html += '<span class="num' + (s.mode === "meet" ? " is-meet" : "") + '">' + (idx + 1) + "</span>";
      html += '<span class="time">' + s.time + "</span>";
      html += '<span class="mode"><i class="ti ' + m.icon + '"></i>' + m.label + "</span>";
      html += "</div>";
      html += "<h3>" + s.title + "</h3>";
      if (s.el) html += '<p class="el">' + s.el + "</p>";
      html += '<p class="desc">' + s.desc + "</p>";
      if (s.topics && s.topics.length) {
        html += '<div class="chips">';
        s.topics.forEach(function (t) { html += '<span class="chip">' + t + "</span>"; });
        html += "</div>";
      }
      if (s.bring && s.bring.length) {
        html += '<div class="chips">';
        s.bring.forEach(function (t) { html += '<span class="chip bring"><i class="ti ti-backpack"></i>' + t + "</span>"; });
        html += "</div>";
      }
      if (s.link) html += '<a class="stoplink" href="' + s.link.url + '" target="_blank" rel="noopener"><i class="ti ti-external-link"></i>' + s.link.label + "</a>";
      html += '<div class="actions"><button class="navbtn" type="button" data-stop="' + idx + '"><i class="ti ti-navigation"></i> Open in your map app</button></div>';
      html += "</div>";
      li.innerHTML = html;
      li.querySelector(".navbtn").addEventListener("click", function () { openSheet(d, idx); });
      li.addEventListener("mouseenter", function () { highlight(idx, false); });
      ol.appendChild(li);
    });
  }

  function highlight(idx, fly) {
    var prev = document.querySelector(".stop.is-active");
    if (prev) prev.classList.remove("is-active");
    var cur = $("#stop-" + idx);
    if (cur) cur.classList.add("is-active");
    state.markers.forEach(function (mk, k) {
      mk.getElement().style.zIndex = k === idx ? 5 : 1;
    });
    if (fly && state.map && FG.days[state.day].stops[idx]) {
      var s = FG.days[state.day].stops[idx];
      state.map.flyTo({ center: [s.lng, s.lat], zoom: Math.max(state.map.getZoom(), 13), speed: 0.8 });
    }
  }

  function initMap() {
    var note = $("#mapNote");
    if (!window.maplibregl) { showMapNote("Map library unavailable — your stops and the Open-in-maps buttons still work."); return; }
    try {
      state.map = new maplibregl.Map({
        container: "map",
        style: "https://tiles.openfreemap.org/styles/liberty",
        center: [FG.meta.base.lng, FG.meta.base.lat],
        zoom: 10,
        attributionControl: true,
        cooperativeGestures: true
      });
      state.map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
      state.map.on("load", function () { drawMarkers(); });
      state.map.on("error", function () {});
    } catch (e) {
      showMapNote("Map could not load — your stops and the Open-in-maps buttons still work offline.");
    }
    if (!navigator.onLine) showMapNote("You are offline — the live map needs a connection, but every stop below and the Open-in-maps buttons still work.");
  }

  function showMapNote(msg) {
    var n = $("#mapNote");
    n.innerHTML = '<i class="ti ti-info-circle"></i><span>' + msg + "</span>";
    n.classList.remove("hidden");
  }
  function hideMapNote() { $("#mapNote").classList.add("hidden"); }

  function drawMarkers() {
    if (!state.map) return;
    state.markers.forEach(function (m) { m.remove(); });
    state.markers = [];
    var d = FG.days[state.day];
    var accent = colorFor(state.day);
    var bounds = new maplibregl.LngLatBounds();
    var seen = {};
    d.stops.forEach(function (s, idx) {
      var key = s.lat.toFixed(4) + s.lng.toFixed(4);
      var elp = el("div", "pin");
      elp.style.background = accent;
      elp.innerHTML = "<span>" + (idx + 1) + "</span>";
      elp.title = s.time + " · " + s.title;
      var mk = new maplibregl.Marker({ element: elp, anchor: "bottom" })
        .setLngLat([s.lng, s.lat])
        .setPopup(new maplibregl.Popup({ offset: 18, closeButton: false })
          .setHTML("<b>" + s.time + " · " + s.title + "</b>"))
        .addTo(state.map);
      elp.addEventListener("click", function () {
        highlight(idx, false);
        var card = $("#stop-" + idx);
        if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      state.markers.push(mk);
      if (!seen[key]) { bounds.extend([s.lng, s.lat]); seen[key] = 1; }
    });
    if (!bounds.isEmpty()) {
      state.map.fitBounds(bounds, { padding: { top: 50, bottom: 50, left: 40, right: 40 }, maxZoom: 14, duration: 600 });
    }
  }

  function selectDay(i) {
    state.day = i;
    var d = FG.days[i];
    Array.prototype.forEach.call(document.querySelectorAll(".tab"), function (t, k) {
      t.setAttribute("aria-selected", k === i ? "true" : "false");
    });
    renderDayHead(d, i);
    renderStops(d, i);
    window.scrollTo({ top: 0, behavior: "instant" in document.documentElement.style ? "instant" : "auto" });
    if (state.map && state.map.loaded()) drawMarkers();
  }

  function openSheet(d, idx) {
    var s = d.stops[idx];
    $("#sheetTitle").textContent = "Day " + d.n + " · " + s.title;
    var box = $("#sheetOpts");
    box.innerHTML = "";
    mapOptions(s).forEach(function (o) {
      var a = el("a", "opt" + (o.rec ? " rec" : ""));
      a.href = o.href;
      if (o.id !== "organic") { a.target = "_blank"; a.rel = "noopener"; }
      a.innerHTML =
        '<span class="opt-ic"><i class="ti ' + o.icon + '"></i></span>' +
        '<span class="opt-txt"><b>' + o.name + "</b><small>" + o.sub + "</small></span>" +
        (o.rec ? '<span class="tagrec">recommended</span>' : '<i class="ti ti-chevron-right"></i>');
      box.appendChild(a);
    });
    var copy = el("button", "opt");
    copy.type = "button";
    copy.innerHTML =
      '<span class="opt-ic"><i class="ti ti-copy"></i></span>' +
      '<span class="opt-txt"><b>Copy coordinates</b><small>' + fmtCoord(s) + "</small></span>" +
      '<i class="ti ti-chevron-right"></i>';
    copy.addEventListener("click", function () {
      var txt = fmtCoord(s);
      if (navigator.clipboard) navigator.clipboard.writeText(txt).then(function () { toast("Coordinates copied"); }, function () { toast(txt); });
      else toast(txt);
    });
    box.appendChild(copy);
    showSheet("#sheet");
  }

  function showSheet(sel) { $(sel).classList.remove("hidden"); document.body.style.overflow = "hidden"; }
  function hideSheet(sel) { $(sel).classList.add("hidden"); document.body.style.overflow = ""; }

  var toastTimer;
  function toast(msg) {
    var t = $("#toast");
    t.textContent = msg;
    t.classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.add("hidden"); }, 2200);
  }

  function setNet() {
    var pill = $("#netPill"), txt = $("#netText");
    if (navigator.onLine) {
      pill.className = "netpill is-online";
      pill.querySelector("i").className = "ti ti-wifi";
      txt.textContent = "online";
      hideMapNote();
      if (state.map) { try { state.map.resize(); } catch (e) {} }
    } else {
      pill.className = "netpill is-offline";
      pill.querySelector("i").className = "ti ti-wifi-off";
      txt.textContent = "offline";
      showMapNote("You are offline — the live map needs a connection, but every stop below and the Open-in-maps buttons still work.");
    }
  }

  function wireUI() {
    $("#sheetClose").addEventListener("click", function () { hideSheet("#sheet"); });
    $("#sheetBackdrop").addEventListener("click", function () { hideSheet("#sheet"); });
    $("#dlBtn").addEventListener("click", function () { showSheet("#dlSheet"); });
    $("#dlClose").addEventListener("click", function () { hideSheet("#dlSheet"); });
    $("#dlBackdrop").addEventListener("click", function () { hideSheet("#dlSheet"); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") { hideSheet("#sheet"); hideSheet("#dlSheet"); } });
    window.addEventListener("online", setNet);
    window.addEventListener("offline", setNet);

    var deferred = null;
    window.addEventListener("beforeinstallprompt", function (e) {
      e.preventDefault(); deferred = e; $("#installBtn").classList.remove("hidden");
    });
    $("#installBtn").addEventListener("click", function () {
      if (!deferred) { toast("Use your browser menu: ‘Add to home screen’"); return; }
      deferred.prompt();
      deferred.userChoice.finally(function () { deferred = null; $("#installBtn").classList.add("hidden"); });
    });
  }

  buildTabs();
  wireUI();
  initMap();
  selectDay(0);
  setNet();

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {});
    });
  }
})();
