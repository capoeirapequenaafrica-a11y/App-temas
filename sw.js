/* Universo Capoeira — Service Worker v88
   Background Sync (fila offline) + Web Push */
var UC_SW_VER = 'uc-sw-v88';
var UC_IDB_NAME = 'uc_offline_v88';
var UC_IDB_STORE = 'fila';

function idbOpen() {
  return new Promise(function (resolve, reject) {
    var req = indexedDB.open(UC_IDB_NAME, 1);
    req.onupgradeneeded = function () {
      var db = req.result;
      if (!db.objectStoreNames.contains(UC_IDB_STORE)) {
        db.createObjectStore(UC_IDB_STORE, { keyPath: 'key' });
      }
    };
    req.onsuccess = function () { resolve(req.result); };
    req.onerror = function () { reject(req.error); };
  });
}

function idbGetFila() {
  return idbOpen().then(function (db) {
    return new Promise(function (resolve, reject) {
      var tx = db.transaction(UC_IDB_STORE, 'readonly');
      var st = tx.objectStore(UC_IDB_STORE);
      var req = st.get('fila');
      req.onsuccess = function () {
        var v = req.result;
        resolve((v && v.items) ? v.items : []);
      };
      req.onerror = function () { reject(req.error); };
    });
  });
}

function idbSetFila(items) {
  return idbOpen().then(function (db) {
    return new Promise(function (resolve, reject) {
      var tx = db.transaction(UC_IDB_STORE, 'readwrite');
      tx.objectStore(UC_IDB_STORE).put({ key: 'fila', items: items || [] });
      tx.oncomplete = function () { resolve(); };
      tx.onerror = function () { reject(tx.error); };
    });
  });
}

function idbGetCfg() {
  return idbOpen().then(function (db) {
    return new Promise(function (resolve) {
      var tx = db.transaction(UC_IDB_STORE, 'readonly');
      var req = tx.objectStore(UC_IDB_STORE).get('firebaseCfg');
      req.onsuccess = function () {
        resolve((req.result && req.result.cfg) ? req.result.cfg : null);
      };
      req.onerror = function () { resolve(null); };
    });
  });
}

/** Firestore REST: grava documento (merge) */
function firestoreSet(cfg, col, id, dados) {
  if (!cfg || !cfg.projectId || !cfg.apiKey) return Promise.reject(new Error('sem cfg'));
  var url = 'https://firestore.googleapis.com/v1/projects/' + encodeURIComponent(cfg.projectId) +
    '/databases/(default)/documents/' + encodeURIComponent(col) + '/' + encodeURIComponent(id) +
    '?key=' + encodeURIComponent(cfg.apiKey);
  /* converte para campos Firestore */
  var fields = {};
  Object.keys(dados || {}).forEach(function (k) {
    var v = dados[k];
    if (v === null || v === undefined) return;
    if (typeof v === 'number') fields[k] = { doubleValue: v };
    else if (typeof v === 'boolean') fields[k] = { booleanValue: v };
    else if (typeof v === 'object') fields[k] = { stringValue: JSON.stringify(v) };
    else fields[k] = { stringValue: String(v) };
  });
  return fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: fields })
  }).then(function (r) {
    if (!r.ok) return r.text().then(function (t) { throw new Error('FS ' + r.status + ' ' + t); });
    return r.json();
  });
}

function avisarClientes(msg) {
  return self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
    list.forEach(function (c) {
      try { c.postMessage(msg); } catch (e) {}
    });
    return list.length;
  });
}

function processarFilaNoSW() {
  return idbGetFila().then(function (fila) {
    if (!fila || !fila.length) return 0;
    return idbGetCfg().then(function (cfg) {
      if (!cfg || !cfg.projectId) {
        /* sem cfg: pede para a página sincronizar */
        return avisarClientes({ type: 'UC_SYNC_FILA' }).then(function () { return 0; });
      }
      var rest = [];
      var ok = 0;
      var chain = Promise.resolve();
      fila.forEach(function (item) {
        chain = chain.then(function () {
          var payload = Object.assign({}, item.dados || {}, { id: item.id });
          if (item.col === 'presencas') {
            payload.offline = false;
            payload.foiOffline = !!(item.dados && (item.dados.offline || item.dados.foiOffline));
            payload.sincronizadoEm = new Date().toISOString();
            payload.aguardandoSync = false;
            payload.syncVia = 'service-worker';
          }
          return firestoreSet(cfg, item.col, item.id, payload)
            .then(function () { ok++; })
            .catch(function () { rest.push(item); });
        });
      });
      return chain.then(function () {
        return idbSetFila(rest).then(function () {
          if (ok > 0) {
            return avisarClientes({
              type: 'UC_FILA_SYNC_OK',
              ok: ok,
              rest: rest.length
            }).then(function () { return ok; });
          }
          return ok;
        });
      });
    });
  });
}

self.addEventListener('install', function (event) {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('sync', function (event) {
  if (event.tag === 'uc-fila-offline') {
    event.waitUntil(
      avisarClientes({ type: 'UC_SYNC_FILA' })
        .then(function (n) {
          if (n > 0) return 0;
          return processarFilaNoSW();
        })
        .catch(function () { return processarFilaNoSW(); })
    );
  }
});

self.addEventListener('message', function (event) {
  var data = event.data || {};
  if (data.type === 'UC_SET_FILA') {
    event.waitUntil(idbSetFila(data.items || []));
  }
  if (data.type === 'UC_SET_FIREBASE_CFG') {
    event.waitUntil(idbOpen().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(UC_IDB_STORE, 'readwrite');
        tx.objectStore(UC_IDB_STORE).put({ key: 'firebaseCfg', cfg: data.cfg || null });
        tx.oncomplete = resolve;
        tx.onerror = function () { reject(tx.error); };
      });
    }));
  }
  if (data.type === 'UC_PROCESS_FILA_NOW') {
    event.waitUntil(processarFilaNoSW());
  }
});

self.addEventListener('push', function (event) {
  var titulo = 'Universo Capoeira';
  var corpo = 'Nova atualização';
  var url = './';
  try {
    var payload = event.data ? event.data.json() : null;
    if (payload) {
      if (payload.titulo) titulo = payload.titulo;
      if (payload.corpo) corpo = payload.corpo;
      if (payload.url) url = payload.url;
    } else if (event.data) {
      corpo = event.data.text();
    }
  } catch (e) {
    try { corpo = event.data.text(); } catch (e2) {}
  }
  event.waitUntil(
    self.registration.showNotification(titulo, {
      body: corpo,
      icon: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/svgs/solid/child-reaching.svg',
      badge: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/svgs/solid/child-reaching.svg',
      data: { url: url },
      tag: 'uc-push',
      renotify: true,
      vibrate: [120, 60, 120]
    })
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var url = (event.notification.data && event.notification.data.url) || './';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      for (var i = 0; i < list.length; i++) {
        var c = list[i];
        if (c.url && 'focus' in c) {
          c.postMessage({ type: 'UC_NOTIF_CLICK', url: url });
          return c.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
