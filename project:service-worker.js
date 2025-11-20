const CACHE_NAME = 'keepod-cache-v1';

// 오프라인에서 필요할 파일 목록 (네 파일 구조에 맞게 수정 가능)
const ASSETS = [
  '/index.html',
  '/style.css',
  '/script.js',
  '/images/bg.png',
  '/images/logo.png'
];

// 설치 단계: 지정한 파일들을 캐시에 저장
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// 요청 가로채기: 캐시에 있으면 캐시에서, 없으면 네트워크에서 가져오기
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});
