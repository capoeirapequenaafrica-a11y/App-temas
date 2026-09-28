/* Universo Capoeira — Service Worker offline */
var CACHE_NOME = 'uc-shell-v1';
var PRECACHE = [
  './',
  './index.html',
  './core.js',
  './games.js',
  './mundo.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NOME).then(function (cache) {
      return cache.addAll(PRECACHE).catch(function (err) {
        console.warn('[SW] precache parcial', err);
        /* tenta um a um para não falhar o install inteiro */
        return Promise.all(PRECACHE.map(function (url) {
          return cache.add(url).catch(function () {});
        }));
      });
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE_NOME) return caches.delete(k);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

function isNavegacao(request) {
  return request.mode === 'navigate' ||
    (request.method === 'GET' && request.headers.get('accept') &&
      request.headers.get('accept').indexOf('text/html') !== -1);
}

function isAssetLocal(url) {
  try {
    var u = new URL(url);
    if (u.origin !== self.location.origin) return false;
    var p = u.pathname;
    return /\.(js|css|png|jpg|jpeg|webp|svg|json|ico|woff2?)$/i.test(p) ||
      p.endsWith('/') ||
      p.endsWith('/index.html') ||
      p.endsWith('manifest.json');
  } catch (e) {
    return false;
  }
}

self.addEventListener('fetch', function (event) {
  var request = event.request;
  if (request.method !== 'GET') return;

  var url = request.url;
  /* não intercepta Firebase / APIs externas / chrome-extension */
  if (url.indexOf('firestore.googleapis.com') !== -1 ||
      url.indexOf('firebase') !== -1 ||
      url.indexOf('googleapis.com') !== -1 ||
      url.indexOf('gstatic.com') !== -1 ||
      url.indexOf('cdnjs.cloudflare.com') !== -1) {
    return;
  }

  /* Navegação: network first, fallback cache (index.html) */
  if (isNavegacao(request)) {
    event.respondWith(
      fetch(request).then(function (resp) {
        var clone = resp.clone();
        caches.open(CACHE_NOME).then(function (c) { c.put('./index.html', clone); }).catch(function () {});
        return resp;
      }).catch(function () {
        return caches.match('./index.html').then(function (r) {
          return r || caches.match('index.html');
        });
      })
    );
    return;
  }

  /* Assets locais: cache first, atualiza em segundo plano */
  if (isAssetLocal(url)) {
    event.respondWith(
      caches.match(request).then(function (cached) {
        var network = fetch(request).then(function (resp) {
          if (resp && resp.ok) {
            var clone = resp.clone();
            caches.open(CACHE_NOME).then(function (c) { c.put(request, clone); }).catch(function () {});
          }
          return resp;
        }).catch(function () {
          return cached;
        });
        return cached || network;
      })
    );
  }
});

/* Mensagem para forçar atualização do cache */
self.addEventListener('message', function (event) {
  if (!event.data) return;
  if (event.data === 'SKIP_WAITING' || (event.data && event.data.type === 'SKIP_WAITING')) {
    self.skipWaiting();
  }
  if (event.data === 'CLEAR_CACHE' || (event.data && event.data.type === 'CLEAR_CACHE')) {
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) { return caches.delete(k); }));
    });
  }
});
