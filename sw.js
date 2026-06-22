var CACHE = "naxos-fieldguide-v1";

var CORE = [
  "./",
  "index.html",
  "assets/css/styles.css",
  "assets/js/app.js",
  "assets/js/data.js",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/apple-touch-icon.png",
  "downloads/naxos-fieldguide.gpx",
  "downloads/naxos-fieldguide.kml",
  "assets/img/melanes.jpg",
  "assets/img/ursulines.jpg",
  "assets/img/apeiranthos.jpg",
  "assets/img/lagoon.jpg",
  "assets/img/grotta.jpg",
  "assets/img/dunes.jpg",
  "assets/img/kagkanis.jpg",
  "assets/img/koufonisi.jpg",
  "assets/img/beachrock.jpg"
];

self.addEventListener("install", function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return Promise.all(CORE.map(function (u) {
      return c.add(new Request(u, { cache: "reload" })).catch(function () {});
    }));
  }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.map(function (k) { if (k !== CACHE) return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  var sameOrigin = url.origin === self.location.origin;

  if (sameOrigin) {
    e.respondWith(
      caches.match(req).then(function (hit) {
        if (hit) return hit;
        return fetch(req).then(function (res) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
          return res;
        }).catch(function () { return caches.match("index.html"); });
      })
    );
    return;
  }

  // Cross-origin (map tiles, CDN libs, fonts): cache-first, then network, runtime-cache opportunistically.
  e.respondWith(
    caches.match(req).then(function (hit) {
      return hit || fetch(req).then(function (res) {
        if (res && (res.ok || res.type === "opaque")) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () { return hit; });
    })
  );
});
