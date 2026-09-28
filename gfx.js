/* ================================================================
   GFX.JS — Motor gráfico do Universo Capoeira
   - Gfx   : utilitários 2D (esferas iluminadas, bisel, sombras, texturas,
             brilho/bloom, vinheta, resolução HiDPI, níveis de qualidade)
   - Gfx3D : cenas Three.js (Retro Kart 3D e Mascote 3D)
   Qualidade: 'alta' | 'media' | 'baixa'  → Gfx.setQuality('media')
   ================================================================ */
(function (global) {
  'use strict';
  var Gfx = {}, Gfx3D = {};
  global.Gfx = Gfx; global.Gfx3D = Gfx3D;
  var TAU = Math.PI * 2;

  /* ---------- Qualidade ---------- */
  var QKEY = 'uc_gfx';
  function autoQuality() {
    try {
      var s = localStorage.getItem(QKEY);
      if (s === 'alta' || s === 'media' || s === 'baixa') return s;
    } catch (e) {}
    var mem = navigator.deviceMemory || 4, cores = navigator.hardwareConcurrency || 4;
    if (mem <= 2 || cores <= 2) return 'baixa';
    if (mem <= 3 || cores <= 4) return 'media';
    return 'alta';
  }
  Gfx.quality = autoQuality();
  Gfx.setQuality = function (q) {
    if (['alta', 'media', 'baixa'].indexOf(q) < 0) return;
    Gfx.quality = q;
    try { localStorage.setItem(QKEY, q); } catch (e) {}
    applyFXState();
    if (typeof global.mostrarToast === 'function') global.mostrarToast('Gráficos: ' + q + ' (vale no próximo jogo)');
  };
  /* fator de resolução do canvas (nitidez em telas de alta densidade) */
  Gfx.scale = function () {
    var d = global.devicePixelRatio || 1;
    if (Gfx.quality === 'baixa') return 1;
    return Math.min(Gfx.quality === 'alta' ? 2 : 1.5, Math.max(1, d));
  };

  /* ---------- Cores ---------- */
  function parse(c) {
    if (c.charAt(0) === '#') {
      if (c.length === 4) c = '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3];
      return [parseInt(c.substr(1, 2), 16), parseInt(c.substr(3, 2), 16), parseInt(c.substr(5, 2), 16)];
    }
    var m = c.match(/\d+/g) || [0, 0, 0];
    return [+m[0], +m[1], +m[2]];
  }
  Gfx.shade = function (c, a) {
    var p = parse(c), t = a < 0 ? 0 : 255, k = Math.abs(a);
    return 'rgb(' + Math.round(p[0] + (t - p[0]) * k) + ',' + Math.round(p[1] + (t - p[1]) * k) + ',' + Math.round(p[2] + (t - p[2]) * k) + ')';
  };
  Gfx.rgba = function (c, a) { var p = parse(c); return 'rgba(' + p[0] + ',' + p[1] + ',' + p[2] + ',' + a + ')'; };
  Gfx.lerp = function (a, b, t) { return a + (b - a) * t; };

  /* ---------- Primitivas iluminadas ---------- */
  Gfx.rr = function (c, x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    c.beginPath(); c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  };
  Gfx.shadow = function (c, x, y, rx, ry, a) {
    c.save(); c.translate(x, y); c.scale(1, ry / rx);
    var g = c.createRadialGradient(0, 0, 0, 0, 0, rx);
    g.addColorStop(0, 'rgba(0,0,0,' + (a == null ? 0.45 : a) + ')'); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g; c.beginPath(); c.arc(0, 0, rx, 0, TAU); c.fill(); c.restore();
  };
  Gfx.sphere = function (c, x, y, r, col, o) {
    o = o || {};
    var g = c.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.05, x, y, r * 1.05);
    g.addColorStop(0, Gfx.shade(col, 0.75)); g.addColorStop(0.35, col); g.addColorStop(1, Gfx.shade(col, -0.62));
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
    if (o.spec !== false) {
      c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath();
      c.ellipse(x - r * 0.34, y - r * 0.42, r * 0.26, r * 0.16, -0.6, 0, TAU); c.fill();
    }
  };
  Gfx.bevel = function (c, x, y, w, h, col, r) {
    r = r == null ? 3 : r;
    c.fillStyle = 'rgba(0,0,0,.38)'; Gfx.rr(c, x + 1, y + 2.5, w, h, r); c.fill();
    var g = c.createLinearGradient(0, y, 0, y + h);
    g.addColorStop(0, Gfx.shade(col, 0.42)); g.addColorStop(0.5, col); g.addColorStop(1, Gfx.shade(col, -0.5));
    c.fillStyle = g; Gfx.rr(c, x, y, w, h, r); c.fill();
    c.fillStyle = 'rgba(255,255,255,.28)'; Gfx.rr(c, x + 1, y + 1, w - 2, h * 0.38, r); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.22)'; c.lineWidth = 1; Gfx.rr(c, x + 0.5, y + 0.5, w - 1, h - 1, r); c.stroke();
  };
  Gfx.glow = function (c, x, y, r, col, a) {
    c.save(); c.globalCompositeOperation = 'lighter';
    var g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, Gfx.rgba(col, a == null ? 0.6 : a)); g.addColorStop(1, Gfx.rgba(col, 0));
    c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); c.restore();
  };
  Gfx.text = function (c, s, x, y, size, col, align, glow) {
    c.save(); c.font = '800 ' + size + 'px Orbitron, Inter, sans-serif'; c.textAlign = align || 'left';
    if (glow) { c.shadowColor = glow; c.shadowBlur = 8; }
    c.fillStyle = col; c.fillText(s, x, y); c.restore();
  };

  /* ---------- Texturas procedurais (cache) ---------- */
  function rng(seed) { var s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  var tiles = {};
  function makeTile(name, w, h, fn) {
    if (!tiles[name]) {
      var cv = document.createElement('canvas'); cv.width = w; cv.height = h;
      fn(cv.getContext('2d'), w, h, rng(name.length * 977 + w));
      tiles[name] = cv;
    }
    return tiles[name];
  }
  Gfx.tile = function (name) {
    if (name === 'grass') return makeTile('grass', 128, 128, function (c, w, h, R) {
      c.fillStyle = '#0c3820'; c.fillRect(0, 0, w, h);
      for (var i = 0; i < 700; i++) {
        var x = R() * w, y = R() * h, l = 3 + R() * 5;
        c.strokeStyle = 'rgba(' + (30 + R() * 40 | 0) + ',' + (110 + R() * 80 | 0) + ',' + (50 + R() * 40 | 0) + ',' + (0.25 + R() * 0.35) + ')';
        c.beginPath(); c.moveTo(x, y); c.lineTo(x + (R() - 0.5) * 3, y - l); c.stroke();
      }
    });
    if (name === 'woodL' || name === 'woodD') {
      var light = name === 'woodL';
      return makeTile(name, 96, 96, function (c, w, h, R) {
        c.fillStyle = light ? '#d8b98a' : '#5a3a25'; c.fillRect(0, 0, w, h);
        for (var i = 0; i < 46; i++) {
          var y = R() * h;
          c.strokeStyle = light ? 'rgba(120,80,40,' + (0.06 + R() * 0.16) + ')' : 'rgba(0,0,0,' + (0.1 + R() * 0.22) + ')';
          c.lineWidth = 0.6 + R() * 1.4; c.beginPath(); c.moveTo(0, y);
          c.bezierCurveTo(w * 0.3, y + (R() - 0.5) * 6, w * 0.7, y + (R() - 0.5) * 6, w, y + (R() - 0.5) * 3); c.stroke();
        }
        for (var k = 0; k < 2; k++) {
          var kx = R() * w, ky = R() * h;
          c.strokeStyle = light ? 'rgba(110,70,35,.25)' : 'rgba(0,0,0,.3)';
          for (var q = 1; q < 4; q++) { c.beginPath(); c.ellipse(kx, ky, q * 2.2, q * 1.2, 0, 0, TAU); c.stroke(); }
        }
      });
    }
    if (name === 'asphalt') return makeTile('asphalt', 64, 64, function (c, w, h, R) {
      c.fillStyle = '#2c2e33'; c.fillRect(0, 0, w, h);
      for (var i = 0; i < 260; i++) { var g = 30 + R() * 50 | 0; c.fillStyle = 'rgba(' + g + ',' + g + ',' + (g + 4) + ',' + (0.35 + R() * 0.4) + ')'; c.fillRect(R() * w, R() * h, 1.4, 1.4); }
    });
    return makeTile('vazio', 4, 4, function (c) { c.fillStyle = '#000'; c.fillRect(0, 0, 4, 4); });
  };
  Gfx.fillTile = function (c, name, x, y, w, h, alpha) {
    var t = Gfx.tile(name);
    if (!t._p) t._p = c.createPattern(t, 'repeat');
    c.save(); if (alpha != null) c.globalAlpha = alpha;
    c.fillStyle = t._p; c.fillRect(x, y, w, h); c.restore();
  };

  /* ---------- Pós-processamento: bloom + vinheta ---------- */
  var fx = { bloom: null, bctx: null, vig: null, raf: 0, frame: 0, canvas: null };
  function injectCSS() {
    if (document.getElementById('gfxCss')) return;
    var s = document.createElement('style'); s.id = 'gfxCss';
    s.textContent =
      '#arcadeCanvas{image-rendering:auto !important;filter:contrast(1.07) saturate(1.15);}' +
      '.arcade-scanlines{display:none !important;}' +
      '.gfx-bloom{position:absolute;left:3px;top:3px;width:calc(100% - 6px);height:calc(100% - 6px);border-radius:14px;' +
      'pointer-events:none;z-index:3;mix-blend-mode:screen;filter:blur(7px) brightness(1.3);opacity:.5;}' +
      '.gfx-vig{position:absolute;left:3px;top:3px;right:3px;bottom:3px;border-radius:14px;pointer-events:none;z-index:4;' +
      'background:radial-gradient(ellipse at 50% 45%,rgba(0,0,0,0) 55%,rgba(0,0,0,.4) 100%);}';
    document.head.appendChild(s);
  }
  function applyFXState() {
    if (!fx.bloom) return;
    fx.bloom.style.display = Gfx.quality === 'baixa' ? 'none' : 'block';
  }
  function fxLoop() {
    var a = global.arcade;
    if (!a || !a.rodando) { fx.raf = 0; return; }
    fx.raf = requestAnimationFrame(fxLoop);
    if (Gfx.quality === 'baixa' || !fx.canvas) return;
    fx.frame++; if (fx.frame % 2) return;
    try {
      fx.bctx.clearRect(0, 0, 64, 80);
      try { fx.bctx.filter = 'brightness(1.5) contrast(1.9)'; } catch (e) {}
      fx.bctx.drawImage(fx.canvas, 0, 0, 64, 80);
    } catch (e) {}
  }
  Gfx.attachFX = function (canvas) {
    injectCSS();
    var host = canvas && canvas.parentNode; if (!host) return;
    fx.canvas = canvas;
    if (!fx.bloom) {
      var b = document.createElement('canvas'); b.width = 64; b.height = 80; b.className = 'gfx-bloom';
      var v = document.createElement('div'); v.className = 'gfx-vig';
      host.appendChild(b); host.appendChild(v);
      fx.bloom = b; fx.bctx = b.getContext('2d'); fx.vig = v;
    }
    applyFXState();
    if (!fx.raf) fx.raf = requestAnimationFrame(fxLoop);
  };
  injectCSS();

  /* ---------- Carregar Three.js sob demanda ---------- */
  var thQ = [], thLoading = false, thFail = false;
  Gfx.loadThree = function (cb) {
    if (global.THREE) return cb(true);
    if (thFail) return cb(false);
    thQ.push(cb); if (thLoading) return; thLoading = true;
    var s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    function flush(ok) { thFail = !ok; var q = thQ.slice(); thQ.length = 0; q.forEach(function (f) { try { f(ok); } catch (e) {} }); }
    s.onload = function () { flush(!!global.THREE); };
    s.onerror = function () { flush(false); };
    document.head.appendChild(s);
  };

  function glowTexture(T) {
    var cv = document.createElement('canvas'); cv.width = cv.height = 64;
    var c = cv.getContext('2d'), g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.3, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g; c.fillRect(0, 0, 64, 64);
    return new T.CanvasTexture(cv);
  }

  /* ================================================================
     RETRO KART 3D  (Three.js → desenhado dentro do canvas do arcade)
     ================================================================ */
  var K = null, kartRaf = 0, kartToken = 0;
  var LANE = 2.5, KZ = 0.09, ROAD_LEN = 96;

  function makeCar(T, col, player, glowTex) {
    var g = new T.Group();
    var body = new T.MeshStandardMaterial({ color: col, roughness: 0.28, metalness: 0.65 });
    var dark = new T.MeshStandardMaterial({ color: 0x0b0d10, roughness: 0.4, metalness: 0.3 });
    var glass = new T.MeshStandardMaterial({ color: 0x10202e, roughness: 0.05, metalness: 0.9 });
    var sh = new T.Shape();
    sh.moveTo(-1.85, 0.3); sh.lineTo(1.85, 0.3); sh.lineTo(1.85, 0.75); sh.lineTo(1.45, 0.86);
    sh.lineTo(0.9, 0.95); sh.lineTo(0.6, 1.35); sh.lineTo(-0.5, 1.4); sh.lineTo(-1.0, 0.95); sh.lineTo(-1.85, 0.7); sh.lineTo(-1.85, 0.3);
    var geo = new T.ExtrudeGeometry(sh, { depth: 1.5, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1, bevelSegments: 2, steps: 1 });
    geo.rotateY(-Math.PI / 2); geo.translate(0.75, 0, 0);
    var bm = new T.Mesh(geo, body); bm.castShadow = true; g.add(bm);
    var rw = new T.Mesh(new T.PlaneGeometry(1.3, 0.5), glass); rw.position.set(0, 1.16, 0.77); rw.rotation.x = -0.64; g.add(rw);
    var bump = new T.Mesh(new T.BoxGeometry(1.86, 0.22, 0.2), dark); bump.position.set(0, 0.42, 1.9); g.add(bump);
    var tl = new T.MeshStandardMaterial({ color: 0x550000, emissive: 0xff1a1a, emissiveIntensity: 1.6 });
    [-0.6, 0.6].forEach(function (x) {
      var l = new T.Mesh(new T.BoxGeometry(0.42, 0.14, 0.06), tl); l.position.set(x, 0.66, 1.96); g.add(l);
      var s = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: 0xff2a2a, blending: T.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.85 }));
      s.scale.set(1.1, 1.1, 1); s.position.set(x, 0.66, 2.05); g.add(s);
    });
    var wm = new T.MeshStandardMaterial({ color: 0x111214, roughness: 0.85 });
    var rim = new T.MeshStandardMaterial({ color: 0xb8bcc4, roughness: 0.25, metalness: 0.9 });
    g.userData.wheels = [];
    [[-0.85, -1.2], [0.85, -1.2], [-0.85, 1.2], [0.85, 1.2]].forEach(function (p) {
      var wg = new T.Group();
      var tire = new T.Mesh(new T.CylinderGeometry(0.38, 0.38, 0.3, 18), wm); tire.rotation.z = Math.PI / 2; tire.castShadow = true;
      var r = new T.Mesh(new T.CylinderGeometry(0.22, 0.22, 0.32, 10), rim); r.rotation.z = Math.PI / 2;
      wg.add(tire); wg.add(r); wg.position.set(p[0], 0.38, p[1]); g.add(wg); g.userData.wheels.push(wg);
    });
    if (player) {
      var gold = new T.MeshStandardMaterial({ color: 0xffc107, roughness: 0.3, metalness: 0.8, emissive: 0x553d00 });
      [-0.94, 0.94].forEach(function (x) { var st = new T.Mesh(new T.BoxGeometry(0.05, 0.07, 3.0), gold); st.position.set(x, 0.55, 0); g.add(st); });
      var sp = new T.Mesh(new T.BoxGeometry(1.7, 0.06, 0.4), dark); sp.position.set(0, 1.12, 1.75); g.add(sp);
      [-0.7, 0.7].forEach(function (x) { var pl = new T.Mesh(new T.BoxGeometry(0.06, 0.22, 0.3), dark); pl.position.set(x, 1.0, 1.75); g.add(pl); });
    }
    return g;
  }

  function buildKart() {
    var T = global.THREE;
    var S = Gfx.quality === 'alta' ? 1.5 : (Gfx.quality === 'media' ? 1.2 : 1.0);
    var W = Math.round(320 * S), H = Math.round(400 * S);
    var rd = new T.WebGLRenderer({ antialias: Gfx.quality !== 'baixa', preserveDrawingBuffer: true });
    rd.setPixelRatio(1); rd.setSize(W, H, false);
    rd.outputEncoding = T.sRGBEncoding; rd.toneMapping = T.ACESFilmicToneMapping; rd.toneMappingExposure = 1.2;
    var shadows = Gfx.quality !== 'baixa';
    rd.shadowMap.enabled = shadows; rd.shadowMap.type = T.PCFSoftShadowMap;
    var scene = new T.Scene();

    var sky = document.createElement('canvas'); sky.width = 8; sky.height = 256;
    var sc = sky.getContext('2d'), sg = sc.createLinearGradient(0, 0, 0, 256);
    sg.addColorStop(0, '#070b24'); sg.addColorStop(0.45, '#3a2a66'); sg.addColorStop(0.8, '#d0613f'); sg.addColorStop(1, '#ffb066');
    sc.fillStyle = sg; sc.fillRect(0, 0, 8, 256);
    var skyTex = new T.CanvasTexture(sky); skyTex.encoding = T.sRGBEncoding; scene.background = skyTex;
    scene.fog = new T.Fog(0x6b4266, 16, 62);

    var camera = new T.PerspectiveCamera(58, W / H, 0.1, 120);
    camera.position.set(0, 3.5, 6.4);

    scene.add(new T.HemisphereLight(0xa9b8ff, 0x2a3a22, 0.75));
    var sun = new T.DirectionalLight(0xffd0a0, 1.15); sun.position.set(-6, 10, 6);
    sun.castShadow = shadows; sun.shadow.mapSize.set(1024, 1024);
    var sc2 = sun.shadow.camera; sc2.left = -9; sc2.right = 9; sc2.top = 9; sc2.bottom = -14; sc2.near = 1; sc2.far = 40;
    scene.add(sun); scene.add(sun.target);

    var glowTex = glowTexture(T);

    /* estrada */
    var at = document.createElement('canvas'); at.width = 256; at.height = 512;
    var ac = at.getContext('2d'), tile = Gfx.tile('asphalt');
    ac.fillStyle = ac.createPattern(tile, 'repeat'); ac.fillRect(0, 0, 256, 512);
    ac.fillStyle = 'rgba(255,255,255,.9)'; ac.fillRect(8, 0, 6, 512); ac.fillRect(242, 0, 6, 512);
    ac.fillStyle = 'rgba(255,214,90,.95)';
    [256 / 3, 512 / 3].forEach(function (x) { for (var y = 0; y < 512; y += 256) ac.fillRect(x - 3, y + 16, 6, 128); });
    var roadTex = new T.CanvasTexture(at); roadTex.wrapS = roadTex.wrapT = T.RepeatWrapping;
    roadTex.repeat.set(1, ROAD_LEN / 12); roadTex.anisotropy = 4; roadTex.encoding = T.sRGBEncoding;
    var road = new T.Mesh(new T.PlaneGeometry(LANE * 3 + 0.9, ROAD_LEN), new T.MeshStandardMaterial({ map: roadTex, roughness: 0.75, metalness: 0.05 }));
    road.rotation.x = -Math.PI / 2; road.position.z = -ROAD_LEN / 2 + 10; road.receiveShadow = true; scene.add(road);

    var gt = Gfx.tile('grass'), gcv = document.createElement('canvas'); gcv.width = gcv.height = 128;
    gcv.getContext('2d').drawImage(gt, 0, 0);
    var grassTex = new T.CanvasTexture(gcv); grassTex.wrapS = grassTex.wrapT = T.RepeatWrapping; grassTex.repeat.set(8, ROAD_LEN / 8);
    grassTex.encoding = T.sRGBEncoding;
    var gm = new T.MeshStandardMaterial({ map: grassTex, roughness: 1 });
    [-1, 1].forEach(function (sd) {
      var gp = new T.Mesh(new T.PlaneGeometry(40, ROAD_LEN), gm);
      gp.rotation.x = -Math.PI / 2; gp.position.set(sd * (LANE * 1.5 + 0.45 + 20), -0.02, -ROAD_LEN / 2 + 10); gp.receiveShadow = true; scene.add(gp);
    });

    /* objetos que passam (barreiras, árvores, postes) — reciclados */
    var props = [];
    var barA = new T.MeshStandardMaterial({ color: 0xd32f2f, roughness: 0.6 }), barB = new T.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.6 });
    var barG = new T.BoxGeometry(0.35, 0.55, 3);
    var nBar = Math.ceil(ROAD_LEN / 3);
    [-1, 1].forEach(function (sd) {
      for (var i = 0; i < nBar; i++) {
        var m = new T.Mesh(barG, i % 2 ? barA : barB); m.position.set(sd * (LANE * 1.5 + 0.7), 0.28, 10 - i * 3);
        m.castShadow = shadows; scene.add(m); props.push({ m: m, L: nBar * 3 });
      }
    });
    var trunkM = new T.MeshStandardMaterial({ color: 0x4a2f1b, roughness: 1 }), leafM = new T.MeshStandardMaterial({ color: 0x1f6b3a, roughness: 0.9 });
    var poleM = new T.MeshStandardMaterial({ color: 0x2c3138, metalness: 0.6, roughness: 0.4 });
    var lampM = new T.MeshStandardMaterial({ color: 0xfff2c8, emissive: 0xffd27a, emissiveIntensity: 2 });
    var trunkG = new T.CylinderGeometry(0.16, 0.22, 1.2, 8), leafG = new T.ConeGeometry(1.1, 2.6, 9), poleG = new T.CylinderGeometry(0.07, 0.09, 5, 8);
    var nTree = 14, spT = ROAD_LEN / nTree;
    for (var i = 0; i < nTree; i++) {
      [-1, 1].forEach(function (sd, k) {
        var g = new T.Group();
        if ((i + k) % 3 === 0) {
          var p = new T.Mesh(poleG, poleM); p.position.y = 2.5; g.add(p);
          var arm = new T.Mesh(new T.BoxGeometry(1.4, 0.07, 0.07), poleM); arm.position.set(-sd * 0.7, 5, 0); g.add(arm);
          var lp = new T.Mesh(new T.BoxGeometry(0.5, 0.1, 0.25), lampM); lp.position.set(-sd * 1.35, 4.95, 0); g.add(lp);
          var gs = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: 0xffcf7a, blending: T.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.7 }));
          gs.scale.set(3, 3, 1); gs.position.set(-sd * 1.35, 4.9, 0); g.add(gs);
        } else {
          var tr = new T.Mesh(trunkG, trunkM); tr.position.y = 0.6; tr.castShadow = shadows; g.add(tr);
          var lf = new T.Mesh(leafG, leafM); lf.position.y = 2.4; lf.castShadow = shadows; g.add(lf);
          var lf2 = new T.Mesh(leafG, leafM); lf2.scale.set(0.75, 0.75, 0.75); lf2.position.y = 3.6; g.add(lf2);
        }
        g.position.set(sd * (LANE * 1.5 + 2.4 + ((i * 7) % 5) * 0.9), 0, 10 - i * spT - (k ? spT / 2 : 0));
        scene.add(g); props.push({ m: g, L: ROAD_LEN });
      });
    }

    /* carros */
    var player = makeCar(T, 0xd9001f, true, glowTex); scene.add(player);
    var palette = [0x1e88e5, 0xfdd835, 0x8e24aa, 0x43a047, 0xf4511e, 0xeceff1, 0x00acc1, 0x6d4c41];
    var pool = [];
    for (var n = 0; n < 8; n++) { var c = makeCar(T, palette[n], false, glowTex); c.visible = false; scene.add(c); pool.push(c); }

    K = { T: T, rd: rd, scene: scene, camera: camera, sun: sun, player: player, pool: pool, props: props,
      roadTex: roadTex, grassTex: grassTex, px: 0, last: 0, fr: 0, W: W, H: H, roll: 0, lives: null, hitAt: 0 };
  }

  function kartFrame(now) {
    var a = global.arcade, ctx = a.ctx, T = K.T;
    var dt = Math.min(0.05, K.last ? (now - K.last) / 1000 : 0.016); K.last = now;
    var paused = !!a.pausado; K.fr++;
    var frac = paused ? 0 : Math.max(0, Math.min(1, (now - (a._tickAt || now)) / (a._tickMs || 40)));
    var v = (a.speed || 3) * 25 * KZ;
    if (!paused) {
      var dz = v * dt;
      K.props.forEach(function (p) { p.m.position.z += dz; if (p.m.position.z > 10) p.m.position.z -= p.L; });
      K.roadTex.offset.y += dz / 12; K.grassTex.offset.y += dz / 8;
      var rot = dz / 0.38;
      K.player.userData.wheels.forEach(function (w) { w.rotation.x -= rot; });
    }
    /* jogador */
    var tx = (a.carX - 1) * LANE, dx = tx - K.px;
    K.px += dx * Math.min(1, dt * 9);
    K.player.position.set(K.px, 0, 0);
    K.player.rotation.y = -dx * 0.16; K.player.rotation.z = dx * 0.04;
    /* tráfego */
    var stamp = K.fr;
    (a.obstacles || []).forEach(function (o) {
      var m = o._m;
      if (!m) { for (var i = 0; i < K.pool.length; i++) if (K.pool[i]._f !== stamp && !K.pool[i]._used) { m = K.pool[i]; break; } if (!m) return; m._used = true; o._m = m; }
      m._f = stamp; m.visible = true;
      var y = o.y + (paused ? 0 : (a.speed || 3) * frac);
      m.position.set((o.x - 1) * LANE, 0, (y - 350) * KZ);
      m.userData.wheels.forEach(function (w) { w.rotation.x -= (paused ? 0 : (v * 0.35 * dt) / 0.38); });
    });
    K.pool.forEach(function (m) { if (m._f !== stamp) { m.visible = false; m._used = false; } });
    /* colisão: tremor + flash */
    if (K.lives !== null && a.lives < K.lives) K.hitAt = now;
    K.lives = a.lives;
    var since = now - K.hitAt, shake = since < 450 ? (1 - since / 450) * 0.22 : 0;
    var cam = K.camera;
    cam.position.set(K.px * 0.55 + (Math.random() - 0.5) * shake, 3.5 + (Math.random() - 0.5) * shake, 6.4);
    cam.lookAt(K.px * 0.35, 0.9, -9);
    K.sun.position.set(K.px - 6, 10, 6); K.sun.target.position.set(K.px, 0, -3); K.sun.target.updateMatrixWorld();
    K.rd.render(K.scene, cam);
    ctx.drawImage(K.rd.domElement, 0, 0, 320, 400);
    /* HUD */
    var g = ctx.createLinearGradient(0, 0, 0, 44); g.addColorStop(0, 'rgba(0,0,0,.55)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 320, 44);
    for (var h = 0; h < 3; h++) Gfx.sphere(ctx, 18 + h * 20, 18, 7, h < (a.lives || 0) ? '#ff3b4a' : '#3a3f46');
    Gfx.text(ctx, String(Math.round((a.speed || 3) * 32)), 306, 26, 22, '#ffe082', 'right', 'rgba(255,193,7,.8)');
    Gfx.text(ctx, 'KM/H', 306, 38, 8, '#90a4ae', 'right');
    if (since < 300) { ctx.fillStyle = 'rgba(255,30,30,' + (0.35 * (1 - since / 300)) + ')'; ctx.fillRect(0, 0, 320, 400); }
  }

  /* API do Kart: retorna true se o 3D está ativo (senão o jogo usa o desenho 2D de reserva) */
  Gfx3D.kartAtivo = function () { return !!(K && !K.failed); };
  Gfx3D.kartIniciar = function (onReady) {
    Gfx.loadThree(function (ok) {
      if (!ok) { if (onReady) onReady(false); return; }
      try { if (!K) buildKart(); K.last = 0; K.lives = null; if (onReady) onReady(true); }
      catch (e) { console.warn('[Gfx3D] Kart 3D indisponível', e); K = { failed: true }; if (onReady) onReady(false); }
    });
  };
  Gfx3D.kartFrame = function (now) {
    if (!K || K.failed) return false;
    try { kartFrame(now); return true; } catch (e) { console.warn('[Gfx3D] erro no frame', e); K.failed = true; return false; }
  };
  Gfx3D.kartReset = function () { if (K && !K.failed) { K.px = 0; K.last = 0; K.lives = null; K.pool.forEach(function (m) { m.visible = false; m._used = false; m._f = 0; }); } };

  /* ================================================================
     MASCOTE 3D — dragão "Ginga" de abadá e corda
     ================================================================ */
  var M = null, mRaf = 0;
  function buildMascot(host) {
    var T = global.THREE;
    var w = host.clientWidth || 300, h = host.clientHeight || 210;
    var rd = new T.WebGLRenderer({ antialias: true, alpha: true });
    rd.setPixelRatio(Math.min(2, global.devicePixelRatio || 1)); rd.setSize(w, h);
    rd.outputEncoding = T.sRGBEncoding; rd.shadowMap.enabled = Gfx.quality !== 'baixa';
    rd.domElement.style.cssText = 'display:block;width:100%;height:100%;';
    var scene = new T.Scene();
    var cam = new T.PerspectiveCamera(35, w / h, 0.1, 60); cam.position.set(0, 2.7, 10.5); cam.lookAt(0, 2.15, 0);
    scene.add(new T.HemisphereLight(0xbfd4ff, 0x4a3b2a, 0.85));
    var key = new T.DirectionalLight(0xfff0d8, 1.2); key.position.set(4, 8, 6); key.castShadow = rd.shadowMap.enabled;
    key.shadow.mapSize.set(512, 512); var k2 = key.shadow.camera; k2.left = -4; k2.right = 4; k2.top = 6; k2.bottom = -2; scene.add(key);
    var rim = new T.DirectionalLight(0x66ccff, 0.7); rim.position.set(-5, 4, -5); scene.add(rim);

    var skin = new T.MeshStandardMaterial({ color: 0x2ecc71, roughness: 0.45, metalness: 0.05 });
    var cream = new T.MeshStandardMaterial({ color: 0xf6e7b0, roughness: 0.6 });
    var orange = new T.MeshStandardMaterial({ color: 0xff9800, roughness: 0.5 });
    var white = new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
    var dark = new T.MeshStandardMaterial({ color: 0x101418, roughness: 0.2, metalness: 0.4 });
    var light = new T.MeshStandardMaterial({ color: 0x58d68d, roughness: 0.5 });
    var sph = function (r, m) { return new T.Mesh(new T.SphereGeometry(r, 24, 18), m); };

    var root = new T.Group(); scene.add(root);
    var ground = new T.Mesh(new T.CircleGeometry(2.9, 48), new T.MeshStandardMaterial({ color: 0xc9a66b, roughness: 1 }));
    ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
    var ring = new T.Mesh(new T.RingGeometry(2.65, 2.9, 48), new T.MeshStandardMaterial({ color: 0x8d6a3c, roughness: 1 }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.01; scene.add(ring);

    var body = new T.Group(); body.position.y = 1.85; root.add(body);
    var torso = sph(1, skin); torso.scale.set(0.95, 1.05, 0.85); torso.castShadow = true; body.add(torso);
    var belly = sph(1, cream); belly.scale.set(0.7, 0.85, 0.5); belly.position.set(0, -0.05, 0.55); body.add(belly);
    var belt = new T.Mesh(new T.TorusGeometry(0.93, 0.08, 12, 40), new T.MeshStandardMaterial({ color: 0xffd54f, roughness: 0.6 }));
    belt.rotation.x = Math.PI / 2; belt.scale.y = 0.9; belt.position.y = -0.2; body.add(belt);
    for (var i = 0; i < 5; i++) {
      var yy = 0.7 - i * 0.32, sp = new T.Mesh(new T.ConeGeometry(0.14 - i * 0.015, 0.42, 8), orange);
      sp.rotation.x = -Math.PI / 2; sp.position.set(0, yy, -(0.85 * Math.sqrt(Math.max(0, 1 - (yy / 1.05) * (yy / 1.05)))) - 0.05); body.add(sp);
    }
    var wings = [];
    [-1, 1].forEach(function (sd) {
      var wg = new T.Group(); wg.position.set(sd * 0.78, 0.5, -0.5);
      var wm = new T.Mesh(new T.ConeGeometry(0.5, 1.3, 3), orange); wm.rotation.z = -sd * Math.PI / 2 - sd * 0.3; wm.scale.z = 0.14; wm.position.x = sd * 0.6; wg.add(wm);
      body.add(wg); wings.push(wg);
    });

    var head = new T.Group(); head.position.set(0, 1.35, 0.1); body.add(head);
    var sk = sph(0.8, skin); sk.scale.set(1, 0.92, 0.95); sk.castShadow = true; head.add(sk);
    var snout = sph(0.42, light); snout.scale.set(1, 0.7, 1); snout.position.set(0, -0.18, 0.62); head.add(snout);
    [-1, 1].forEach(function (sd) {
      var nos = sph(0.05, dark); nos.position.set(sd * 0.12, -0.05, 0.98); head.add(nos);
      var horn = new T.Mesh(new T.ConeGeometry(0.12, 0.45, 12), cream); horn.position.set(sd * 0.4, 0.72, -0.05); horn.rotation.z = -sd * 0.35; head.add(horn);
      var ch = sph(0.11, new T.MeshStandardMaterial({ color: 0xff8a80, roughness: 0.7 })); ch.scale.z = 0.4; ch.position.set(sd * 0.5, -0.06, 0.55); head.add(ch);
    });
    var eyes = [];
    [-1, 1].forEach(function (sd) {
      var eg = new T.Group(); eg.position.set(sd * 0.33, 0.2, 0.62);
      eg.add(sph(0.19, white));
      var pu = sph(0.1, dark); pu.position.z = 0.13; eg.add(pu);
      var hl = sph(0.03, white); hl.position.set(0.03, 0.04, 0.22); eg.add(hl);
      head.add(eg); eyes.push(eg);
    });
    var mouth = new T.Mesh(new T.TorusGeometry(0.14, 0.022, 8, 18, Math.PI), dark); mouth.position.set(0, -0.3, 0.96); mouth.rotation.z = Math.PI; head.add(mouth);

    var armG = new T.CylinderGeometry(0.15, 0.17, 0.75, 12); armG.translate(0, -0.375, 0);
    var arms = [];
    [-1, 1].forEach(function (sd) {
      var ag = new T.Group(); ag.position.set(sd * 0.95, 0.35, 0.15);
      var am = new T.Mesh(armG, skin); am.castShadow = true; ag.add(am);
      var hd = sph(0.2, light); hd.position.y = -0.8; ag.add(hd);
      body.add(ag); arms.push(ag);
    });
    var legG = new T.CylinderGeometry(0.24, 0.27, 0.85, 12); legG.translate(0, -0.42, 0);
    var legs = [];
    [-1, 1].forEach(function (sd) {
      var lg = new T.Group(); lg.position.set(sd * 0.4, -0.75, 0);
      var lm = new T.Mesh(legG, white); lm.castShadow = true; lg.add(lm);
      var ft = sph(0.28, skin); ft.scale.set(1, 0.6, 1.5); ft.position.set(0, -0.9, 0.2); ft.castShadow = true; lg.add(ft);
      body.add(lg); legs.push(lg);
    });
    var tail = new T.Group(); tail.position.set(0, -0.6, -0.75); body.add(tail);
    var segs = [], parent = tail;
    for (var s = 0; s < 5; s++) {
      var sg = new T.Group(); if (s) sg.position.z = -0.42;
      var sm = sph(0.38 - s * 0.055, s === 4 ? orange : skin); sg.add(sm); parent.add(sg); segs.push(sg); parent = sg;
    }
    var apple = new T.Group(); apple.visible = false;
    apple.add(sph(0.22, new T.MeshStandardMaterial({ color: 0xe53935, roughness: 0.3 })));
    var stem = new T.Mesh(new T.CylinderGeometry(0.02, 0.02, 0.12, 6), trunkMat(T)); stem.position.y = 0.24; apple.add(stem);
    scene.add(apple);

    M = { T: T, rd: rd, scene: scene, cam: cam, root: root, body: body, head: head, eyes: eyes, mouth: mouth, snout: snout,
      arms: arms, legs: legs, segs: segs, wings: wings, skin: skin, apple: apple, act: null, host: host,
      mood: { fome: 70, felicidade: 70, energia: 80 }, t0: performance.now(), blinkAt: 2 };
  }
  function trunkMat(T) { return new T.MeshStandardMaterial({ color: 0x5d4037, roughness: 1 }); }

  function mascotUpdate(t) {
    var m = M, e = m.mood.energia / 100, f = m.mood.felicidade / 100;
    var ph = t * (0.6 + e * 0.9) * 2.2, sw = Math.sin(ph);
    var ex = 0, ey = 0, spin = 0, lean = 0, kickA = 0, mouthOpen = 0, closed = false;
    m.root.position.set(sw * 0.25 * e, 0, 0); m.root.rotation.y = 0;
    m.body.position.y = 1.85 + Math.abs(sw) * 0.08 * (0.4 + e); m.body.rotation.set(0, 0, sw * 0.06);
    m.legs[0].rotation.set(sw * 0.5 * e, 0, 0.12); m.legs[1].rotation.set(-sw * 0.5 * e, 0, -0.12);
    m.arms[0].rotation.set(-0.9, 0, 0.5 + Math.sin(ph + 1) * 0.15); m.arms[1].rotation.set(-0.9, 0, -0.5 - Math.sin(ph + 1) * 0.15);
    m.head.rotation.set((1 - f) * 0.35 - Math.sin(ph * 0.5) * 0.03, Math.sin(t * 0.7) * 0.25 * e, 0);
    m.snout.scale.y = 0.7;
    var a = m.act;
    if (a) {
      var p = (t - a.t0) / a.dur;
      if (p >= 1) { m.act = null; m.apple.visible = false; }
      else if (a.n === 'brincar') {
        m.root.position.y = Math.abs(Math.sin(p * Math.PI * 3)) * 1.1; m.root.rotation.y = p * Math.PI * 4;
        m.arms[0].rotation.set(0, 0, 2.5); m.arms[1].rotation.set(0, 0, -2.5);
      } else if (a.n === 'treinar') {
        var k = (p * 3) % 1, ang = Math.sin(k * Math.PI);
        m.legs[1].rotation.set(-0.8 * ang, 0, -1.0 * ang); m.body.rotation.z = 0.25 * ang;
        m.arms[0].rotation.set(-0.4, 0, 1.4 * ang + 0.5);
      } else if (a.n === 'alimentar') {
        m.apple.visible = p < 0.9;
        var q = Math.min(1, p / 0.45);
        m.apple.position.set(1.5 * (1 - q), 2.2 + 0.85 * q, 1.6 - 0.45 * q);
        m.apple.scale.setScalar(p < 0.5 ? 1 : Math.max(0.01, 1 - (p - 0.5) / 0.4));
        if (p > 0.45) m.snout.scale.y = 0.7 + Math.abs(Math.sin(p * Math.PI * 6)) * 0.35;
        m.arms[1].rotation.set(-1.6 * (1 - q * 0.3), 0, -0.3);
      } else if (a.n === 'descansar') {
        closed = true; m.body.position.y -= 0.25; m.body.scale.y = 1 - 0.03 * Math.sin(t * 3);
        m.legs[0].rotation.set(-0.9, 0, 0.3); m.legs[1].rotation.set(-0.9, 0, -0.3);
        m.head.rotation.x = 0.35;
      }
    }
    if (!a || a.n !== 'descansar') m.body.scale.y = 1;
    m.segs.forEach(function (sg, i) { sg.rotation.y = Math.sin(t * 3 - i * 0.7) * 0.25 * (0.4 + e); });
    m.wings[0].rotation.y = 0.3 + Math.sin(t * 4) * 0.2 * (0.3 + f); m.wings[1].rotation.y = -(0.3 + Math.sin(t * 4) * 0.2 * (0.3 + f));
    var open = closed ? 0.1 : (e < 0.25 ? 0.15 : (e < 0.45 ? 0.55 : 1));
    if (t % 3.6 < 0.12) open = 0.1;
    m.eyes.forEach(function (eg) { eg.scale.y += (open - eg.scale.y) * 0.4; });
    m.mouth.rotation.z = f > 0.5 ? Math.PI : 0; m.mouth.position.y = f > 0.5 ? -0.3 : -0.36;
    var sick = Math.min(m.mood.fome, m.mood.felicidade, m.mood.energia) < 25;
    m.skin.color.setHex(sick ? 0x7fae8f : 0x2ecc71);
  }

  Gfx3D.mascoteAbrir = function (hostId, cb) {
    var host = document.getElementById(hostId); if (!host) { if (cb) cb(false); return; }
    host.style.display = 'block';
    Gfx.loadThree(function (ok) {
      if (!ok) { host.style.display = 'none'; if (cb) cb(false); return; }
      try {
        if (!M) buildMascot(host);
        if (M.rd.domElement.parentNode !== host) { host.innerHTML = ''; host.appendChild(M.rd.domElement); }
        var w = host.clientWidth || 300, h = host.clientHeight || 210;
        M.rd.setSize(w, h); M.cam.aspect = w / h; M.cam.updateProjectionMatrix(); M.host = host;
        if (!mRaf) mascoteLoop();
        if (cb) cb(true);
      } catch (e) { console.warn('[Gfx3D] Mascote 3D indisponível', e); host.style.display = 'none'; M = null; if (cb) cb(false); }
    });
  };
  function mascoteLoop() {
    mRaf = requestAnimationFrame(mascoteLoop);
    if (!M) return;
    if (!M.host || !M.host.offsetParent) return; /* overlay fechado: não gasta bateria */
    var t = (performance.now() - M.t0) / 1000;
    try { mascotUpdate(t); M.rd.render(M.scene, M.cam); } catch (e) { cancelAnimationFrame(mRaf); mRaf = 0; }
  }
  Gfx3D.mascoteFechar = function () { if (mRaf) { cancelAnimationFrame(mRaf); mRaf = 0; } };
  Gfx3D.mascoteHumor = function (t) { if (M && t) M.mood = { fome: t.fome, felicidade: t.felicidade, energia: t.energia }; };
  Gfx3D.mascoteAnim = function (n) {
    if (!M) return;
    var dur = { brincar: 1.6, treinar: 2.1, alimentar: 2.2, descansar: 2.6 }[n]; if (!dur) return;
    M.act = { n: n, t0: (performance.now() - M.t0) / 1000, dur: dur };
  };
})(typeof window !== 'undefined' ? window : this);
