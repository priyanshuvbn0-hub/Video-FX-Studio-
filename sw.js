const CACHE_NAME = "videofx-pro-v5";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./effects.js",
  "./overlays.js",
  "./stickers.js",
  "./audio.js",
  "./visualizer.js",
  "./recorder.js",
  "./app.js",
  "./manifest.json"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
