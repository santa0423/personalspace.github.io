const CACHE_NAME = "keepod-v3";

const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",

  "./test.html",
  "./test.css",
  "./test.js",

  "./result.html",
  "./result.css",
  "./result.js",

  "./images/테스트지.png",
  "./images/테스트지 수정.png",

  "./images/앱 UX/보더.png",
  "./images/앱 UX/리스니.png",
  "./images/앱 UX/네티.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});
