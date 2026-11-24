const CACHE = "ict200-revision-v21";
const FILES = ["./", "./index.html", "./styles.css", "./content.js", "./erd-studio.css", "./erd-studio.js",
  "./erd-walkthrough.html", "./erd-walkthrough.css", "./erd-walkthrough.js", "./turq-water.js",
  "./normalization-model.js", "./normalization-workshop.js", "./normalization-workshop.css", "./app.js", "./manifest.webmanifest",
  "./sql-studio.css", "./sql-studio.js", "./sql-studio-worker.js", "./sql-studio-core.js",
  "./themepark-sql-data.js", "./sql-studio-content.js", "./vendor/sqljs/sql-wasm.js", "./vendor/sqljs/sql-wasm.wasm"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("ict200-revision-") && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  const studioLink = event.request.mode === "navigate" && new URL(event.request.url).pathname.endsWith("/index.html");
  event.respondWith(caches.match(event.request,{ignoreSearch:studioLink}).then(hit => hit || fetch(event.request)));
});
