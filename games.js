/* ================================================================
   GAMES.JS — Universo Capoeira
   Controles flutuantes + IA Minimax (Fácil / Difícil / Impossível)
   Jogos: Snake, Pac-Man, Damas, Corrida, Quebra-Blocos, Pulo
   ================================================================ */
(function (global) {
  'use strict';

  /* ---------- Dificuldade IA ---------- */
  var AI_DIFF = (function () {
    try { return localStorage.getItem('uc_ai_diff') || 'dificil'; } catch (e) { return 'dificil'; }
  })();
  var AI_CONFIG = {
    facil:      { depth: 1, random: 0.55, label: 'Fácil' },
    dificil:    { depth: 4, random: 0.08, label: 'Difícil' },
    impossivel: { depth: 8, random: 0,    label: 'Impossível' }
  };
  function getAI() { return AI_CONFIG[AI_DIFF] || AI_CONFIG.dificil; }

  global.setDificuldadeIA = function (diff) {
    if (!AI_CONFIG[diff]) return;
    AI_DIFF = diff;
    try { localStorage.setItem('uc_ai_diff', diff); } catch (e) {}
    document.querySelectorAll('.arcade-diff-btn').forEach(function (b) {
      b.classList.toggle('ativo', b.getAttribute('data-diff') === diff);
    });
    if (typeof mostrarToast === 'function') mostrarToast('IA: ' + getAI().label);
  };
  global.mostrarBarraDificuldade = function (show) {
    var bar = document.getElementById('arcadeDiffBar');
    if (!bar) return;
    bar.classList.toggle('visivel', !!show);
    if (show) {
      document.querySelectorAll('.arcade-diff-btn').forEach(function (b) {
        b.classList.toggle('ativo', b.getAttribute('data-diff') === AI_DIFF);
      });
    }
  };

  /* ---------- Estado arcade ---------- */
  var arcade = {
    tipo: null, rodando: false, pausado: false,
    score: 0, nivel: 1, progresso: 0, objetivo: 0,
    timer: null, canvas: null, ctx: null,
    keys: {}, dir: { x: 1, y: 0 }, nextDir: { x: 1, y: 0 },
    // snake
    snake: [], food: { x: 5, y: 5 }, grid: 16, cols: 20, rows: 25,
    // pacman
    pac: { x: 10, y: 12 }, ghosts: [], dots: [], walls: {},
    // corrida
    carX: 1, obstacles: [], speed: 3, frame: 0, lanes: 3,
    // quebra
    ball: null, paddle: null, bricks: [],
    // pulo
    birdY: 200, birdV: 0, pipes: [],
    // damas
    damas: null
  };
  global.arcade = arcade;
  /* tamanho lógico do jogo (o canvas real pode ter mais pixels: HiDPI) */
  var LW = 320, LH = 400, TAU = Math.PI * 2;

  var ARCADE_NIVEIS_KEY = 'uc_arcade_niveis';
  function carregarNiveis() {
    try { return JSON.parse(localStorage.getItem(ARCADE_NIVEIS_KEY) || '{}') || {}; } catch (e) { return {}; }
  }
  function salvarNivel(tipo, nivel) {
    var d = carregarNiveis();
    if (nivel > (Number(d[tipo]) || 1)) {
      d[tipo] = Math.min(10, nivel);
      try { localStorage.setItem(ARCADE_NIVEIS_KEY, JSON.stringify(d)); } catch (e) {}
    }
  }
  function nivelMax(tipo) {
    return Math.max(1, Math.min(10, Number(carregarNiveis()[tipo]) || 1));
  }

  var JOGOS_IA = { damas: 1, roda3d: 1 };

  /* ---------- HUD ---------- */
  function hud() {
    var n = document.getElementById('arcadeNivel');
    var p = document.getElementById('arcadePlacar');
    var o = document.getElementById('arcadeObjetivo');
    if (n) n.textContent = arcade.nivel;
    if (p) p.textContent = arcade.score;
    if (o && arcade._objLabel) o.textContent = arcade._objLabel;
  }

  function $(id) { return document.getElementById(id); }

  /* ================================================================
     CONTROLES FLUTUANTES — qualquer toque na tela
     ================================================================ */
  var activeDir = null;
  var actionHeld = false;

  function pressDir(dir, on) {
    if (!dir) return;
    var btn = document.querySelector('.arcade-btn[data-dir="' + dir + '"]');
    if (btn) btn.classList.toggle('arcade-pressed', !!on);
    if (on) {
      activeDir = dir;
      arcadeDir(dir);
    } else if (activeDir === dir) {
      activeDir = null;
    }
  }
  function pressAction(on) {
    actionHeld = !!on;
    document.querySelectorAll('.arcade-btn-gold, .arcade-btn-green, [data-action]').forEach(function (b) {
      b.classList.toggle('arcade-pressed', !!on);
    });
    if (on) arcadeAcao();
  }

  function dirFromLeftHalf(x, y, rect) {
    var cx = rect.left + rect.width * 0.25;
    var cy = rect.top + rect.height * 0.55;
    var dx = x - cx, dy = y - cy;
    if (Math.abs(dx) < 14 && Math.abs(dy) < 14) return null;
    return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
  }

  function bindBtn(btn) {
    if (!btn || btn._bound) return;
    btn._bound = true;
    var dir = btn.getAttribute('data-dir');
    var isAct = btn.classList.contains('arcade-btn-gold') || btn.classList.contains('arcade-btn-green') || btn.hasAttribute('data-action');
    function down(e) { e.preventDefault(); e.stopPropagation(); if (dir) pressDir(dir, true); else if (isAct) pressAction(true); }
    function up(e) { e.preventDefault(); e.stopPropagation(); if (dir) pressDir(dir, false); else if (isAct) pressAction(false); }
    btn.addEventListener('touchstart', down, { passive: false });
    btn.addEventListener('touchend', up, { passive: false });
    btn.addEventListener('touchcancel', up, { passive: false });
    btn.addEventListener('mousedown', down);
    btn.addEventListener('mouseup', up);
    btn.addEventListener('mouseleave', up);
  }
  function bindAllBtns() {
    document.querySelectorAll('.arcade-btn').forEach(bindBtn);
  }

  function setupTouchLayer() {
    var left = $('arcadeTouchLeft'), right = $('arcadeTouchRight'), ov = $('arcadeOverlay');
    if (!left || !right || !ov) return;
    var cur = null;
    function ls(e) {
      e.preventDefault();
      var t = e.touches ? e.touches[0] : e;
      var d = dirFromLeftHalf(t.clientX, t.clientY, ov.getBoundingClientRect());
      if (cur && cur !== d) pressDir(cur, false);
      cur = d; if (d) pressDir(d, true);
    }
    function lm(e) {
      e.preventDefault();
      var t = e.touches ? e.touches[0] : e;
      var d = dirFromLeftHalf(t.clientX, t.clientY, ov.getBoundingClientRect());
      if (d !== cur) { if (cur) pressDir(cur, false); cur = d; if (d) pressDir(d, true); }
    }
    function le(e) { e.preventDefault(); if (cur) pressDir(cur, false); cur = null; }
    function rs(e) { e.preventDefault(); pressAction(true); }
    function re(e) { e.preventDefault(); pressAction(false); }
    left.addEventListener('touchstart', ls, { passive: false });
    left.addEventListener('touchmove', lm, { passive: false });
    left.addEventListener('touchend', le, { passive: false });
    left.addEventListener('touchcancel', le, { passive: false });
    left.addEventListener('mousedown', ls);
    left.addEventListener('mouseup', le);
    right.addEventListener('touchstart', rs, { passive: false });
    right.addEventListener('touchend', re, { passive: false });
    right.addEventListener('touchcancel', re, { passive: false });
    right.addEventListener('mousedown', rs);
    right.addEventListener('mouseup', re);
  }

  global.arcadeDir = function (d) {
    var map = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
    var nd = map[d];
    if (!nd) return;
    if (arcade.tipo === 'snake' || arcade.tipo === 'pacman') {
      if (!(nd.x === -arcade.dir.x && nd.y === -arcade.dir.y)) arcade.nextDir = nd;
    }
    if (arcade.tipo === 'corrida') {
      if (d === 'left') arcade.carX = Math.max(0, arcade.carX - 1);
      if (d === 'right') arcade.carX = Math.min(2, arcade.carX + 1);
    }
    if (arcade.tipo === 'quebra' && arcade.paddle) {
      if (d === 'left') arcade.paddle.x = Math.max(0, arcade.paddle.x - 24);
      if (d === 'right') arcade.paddle.x = Math.min(LW - arcade.paddle.w, arcade.paddle.x + 24);
    }
    if (arcade.tipo === 'damas' && arcade.damas) damasDir(d);
  };

  global.arcadeAcao = function () {
    if (arcade.tipo === 'pulo') arcade.birdV = -7.5;
    if (arcade.tipo === 'quebra' && arcade.ball && !arcade.ball.launched) {
      arcade.ball.launched = true;
      arcade.ball.vx = (Math.random() > 0.5 ? 1 : -1) * 3;
      arcade.ball.vy = -3.5;
    }
    if (arcade.tipo === 'corrida') arcade.speed = Math.min(8, arcade.speed + 0.4);
  };

  function keyHandler(e) {
    if (!arcade.rodando) return;
    if (e.key === 'Escape') { fecharJogoArcade(); return; }
    if (arcade.pausado) return;
    var k = e.key;
    if (k === 'ArrowUp' || k === 'w' || k === 'W') arcadeDir('up');
    if (k === 'ArrowDown' || k === 's' || k === 'S') arcadeDir('down');
    if (k === 'ArrowLeft' || k === 'a' || k === 'A') arcadeDir('left');
    if (k === 'ArrowRight' || k === 'd' || k === 'D') arcadeDir('right');
    if (k === ' ' || k === 'Enter') arcadeAcao();
    e.preventDefault();
  }

  /* ================================================================
     ABRIR / FECHAR / PAUSE
     ================================================================ */
  global.abrirJogoArcade = function (tipo, nivel) {
    // Mascote — abre overlay de teste (funciona sempre)
    if (tipo === 'tamagotchi' || tipo === 'mascote') {
      if (typeof Tama !== 'undefined' && Tama.abrir) Tama.abrir();
      else if (typeof Simulador !== 'undefined' && Simulador.entrarMundoAberto) Simulador.entrarMundoAberto();
      else if (typeof mostrarToast === 'function') mostrarToast('Mascote ainda carregando...');
      return;
    }
    // Jogos ainda não implementados
    if (tipo === 'surfe' || tipo === 'mario') {
      if (typeof mostrarToast === 'function') mostrarToast((tipo === 'surfe' ? 'Surfe' : 'Aventura') + ' em breve!');
      return;
    }
    var ov = $('arcadeOverlay');
    if (!ov) return;
    var titulos = {
      pacman: 'Pac-Man', snake: 'Minhoca', corrida: 'Retro Kart',
      quebra: 'Quebra-Blocos', pulo: 'Pulo', surfe: 'Surfe',
      mario: 'Aventura', damas: 'Damas'
    };
    if ($('arcadeTitulo')) $('arcadeTitulo').textContent = (titulos[tipo] || 'Jogo') + ' · Nv.' + (nivel || 1);
    arcade.tipo = tipo;
    arcade.nivel = nivel || 1;
    arcade.score = 0;
    arcade.rodando = true;
    arcade.pausado = false;
    arcade.progresso = 0;
    ov.style.display = 'flex';
    ov.classList.add('jogando');
    arcade.canvas = $('arcadeCanvas');
    if (!arcade.canvas) return;
    arcade.ctx = arcade.canvas.getContext('2d');
    var S = global.Gfx ? global.Gfx.scale() : 1;
    arcade.S = S; arcade._rafOn = false; arcade._trail = []; arcade._maze = null;
    arcade.canvas.width = Math.round(LW * S);
    arcade.canvas.height = Math.round(LH * S);
    arcade.ctx.setTransform(S, 0, 0, S, 0, 0);
    if (global.Gfx) global.Gfx.attachFX(arcade.canvas);
    mostrarBarraDificuldade(!!JOGOS_IA[tipo]);
    bindAllBtns();
    // botão de ação extra
    var acoes = $('arcadeAcoesExtra');
    if (acoes) {
      if (tipo === 'pulo' || tipo === 'quebra' || tipo === 'corrida') {
        acoes.innerHTML = '<div class="arcade-acoes-col"><button type="button" class="arcade-btn arcade-btn-green" data-action="1">Ação</button></div>';
      } else if (tipo === 'damas') {
        acoes.innerHTML = '<div class="arcade-acoes-col"><button type="button" class="arcade-btn arcade-btn-gold" data-action="1">OK</button></div>';
      } else {
        acoes.innerHTML = '';
      }
      bindAllBtns();
    }
    if (arcade.timer) clearInterval(arcade.timer);
    window.removeEventListener('keydown', keyHandler);
    window.addEventListener('keydown', keyHandler);

    if (tipo === 'snake') initSnake();
    else if (tipo === 'pacman') initPacman();
    else if (tipo === 'corrida') initCorrida();
    else if (tipo === 'quebra') initQuebra();
    else if (tipo === 'pulo') initPulo();
    else if (tipo === 'damas') initDamas();
    else initSnake();

    var ms = tipo === 'snake' ? Math.max(55, 180 - arcade.nivel * 12) : (tipo === 'damas' ? 80 : 40);
    arcade.timer = setInterval(loop, ms);
    arcade._tickMs = ms; arcade._tickAt = performance.now();
    startRender();
    hud();
  };

  global.fecharJogoArcade = function () {
    arcade.rodando = false; arcade._rafOn = false;
    if (arcade.timer) { clearInterval(arcade.timer); arcade.timer = null; }
    window.removeEventListener('keydown', keyHandler);
    var ov = $('arcadeOverlay');
    if (ov) { ov.style.display = 'none'; ov.classList.remove('jogando'); }
    mostrarBarraDificuldade(false);
  };

  global.togglePauseArcade = function () {
    if (!arcade.rodando) return;
    arcade.pausado = !arcade.pausado;
    var ov = $('arcadePauseOverlay');
    if (ov) ov.classList.toggle('visivel', arcade.pausado);
    var icon = $('iconArcadePause');
    if (icon) icon.className = arcade.pausado ? 'fas fa-play' : 'fas fa-pause';
  };
  global.toggleArcadeTelaGrande = function () {};

  /* ---------- Render contínuo (60 fps) com interpolação entre ticks ---------- */
  var renderRaf = 0;
  function startRender() {
    if (renderRaf) cancelAnimationFrame(renderRaf);
    arcade._rafOn = true;
    renderRaf = requestAnimationFrame(renderFrame);
  }
  function renderFrame(now) {
    if (!arcade.rodando) { renderRaf = 0; return; }
    renderRaf = requestAnimationFrame(renderFrame);
    var c = arcade.ctx; if (!c) return;
    var S = arcade.S || 1;
    c.setTransform(S, 0, 0, S, 0, 0);
    var al = arcade.pausado ? 0 : Math.max(0, Math.min(1, (now - (arcade._tickAt || now)) / (arcade._tickMs || 40)));
    arcade._inRaf = true;
    try {
      var t = arcade.tipo;
      if (t === 'snake') drawSnake(al);
      else if (t === 'pacman') drawPacman(al);
      else if (t === 'corrida') {
        var ok3d = global.Gfx3D && global.Gfx3D.kartAtivo() && global.Gfx3D.kartFrame(now);
        if (!ok3d) drawCorrida(al);
      }
      else if (t === 'quebra') drawQuebra(al);
      else if (t === 'pulo') drawPulo(al);
      else if (t === 'damas') drawDamas();
    } catch (e) { console.warn('[render]', e); }
    arcade._inRaf = false;
  }

  function loop() {
    if (!arcade.rodando || arcade.pausado) return;
    arcade._tickAt = performance.now();
    if (arcade.tipo === 'snake') tickSnake();
    else if (arcade.tipo === 'pacman') tickPacman();
    else if (arcade.tipo === 'corrida') tickCorrida();
    else if (arcade.tipo === 'quebra') tickQuebra();
    else if (arcade.tipo === 'pulo') tickPulo();
    else if (arcade.tipo === 'damas') tickDamas();
    hud();
  }

  function gameOver(msg) {
    arcade.rodando = false;
    if (arcade.timer) { clearInterval(arcade.timer); arcade.timer = null; }
    var c = arcade.ctx, G = global.Gfx;
    if (c) {
      var S = arcade.S || 1; c.setTransform(S, 0, 0, S, 0, 0);
      c.fillStyle = 'rgba(2,6,10,.74)'; c.fillRect(0, 0, LW, LH);
      var g = c.createRadialGradient(LW / 2, LH / 2, 10, LW / 2, LH / 2, 170);
      g.addColorStop(0, 'rgba(0,230,118,.22)'); g.addColorStop(1, 'rgba(0,230,118,0)');
      c.fillStyle = g; c.fillRect(0, 0, LW, LH);
      if (G) {
        G.text(c, msg || 'Game Over', LW / 2, LH / 2 - 8, 24, '#00e676', 'center', 'rgba(0,230,118,.9)');
        G.text(c, 'PONTOS  ' + arcade.score, LW / 2, LH / 2 + 24, 15, '#ffc107', 'center', 'rgba(255,193,7,.7)');
      } else {
        c.fillStyle = '#00e676'; c.font = 'bold 20px Inter, sans-serif'; c.textAlign = 'center';
        c.fillText(msg || 'Game Over', LW / 2, LH / 2 - 10);
        c.fillStyle = '#ffc107'; c.font = '14px Inter, sans-serif'; c.fillText('Pontos: ' + arcade.score, LW / 2, LH / 2 + 20);
      }
    }
    setTimeout(fecharJogoArcade, 1800);
  }

  /* ================================================================
     SNAKE
     ================================================================ */
  function initSnake() {
    arcade.snake = [{ x: 8, y: 12 }, { x: 7, y: 12 }, { x: 6, y: 12 }];
    arcade.dir = { x: 1, y: 0 };
    arcade.nextDir = { x: 1, y: 0 };
    arcade._objLabel = 'Coma as frutas';
    spawnFood();
    drawSnake();
  }
  function spawnFood() {
    while (true) {
      arcade.food = { x: Math.floor(Math.random() * arcade.cols), y: 2 + Math.floor(Math.random() * (arcade.rows - 2)) };
      if (!arcade.snake.some(function (s) { return s.x === arcade.food.x && s.y === arcade.food.y; })) break;
    }
  }
  function tickSnake() {
    arcade.dir = arcade.nextDir;
    var h = { x: arcade.snake[0].x + arcade.dir.x, y: arcade.snake[0].y + arcade.dir.y };
    if (h.x < 0 || h.y < 0 || h.x >= arcade.cols || h.y >= arcade.rows) { gameOver('Bateu!'); return; }
    if (arcade.snake.some(function (s) { return s.x === h.x && s.y === h.y; })) { gameOver('Bateu!'); return; }
    arcade._prevSnake = arcade.snake.map(function (s) { return { x: s.x, y: s.y }; });
    arcade.snake.unshift(h);
    if (h.x === arcade.food.x && h.y === arcade.food.y) {
      arcade.score += 10;
      spawnFood();
      if (arcade.score >= arcade.nivel * 50) {
        arcade.nivel++;
        salvarNivel('snake', arcade.nivel);
        if (typeof mostrarToast === 'function') mostrarToast('Nível ' + arcade.nivel + '!');
      }
    } else arcade.snake.pop();
    drawSnake();
  }
  function drawSnake(al) {
    if (arcade._rafOn && !arcade._inRaf) return;
    var G = global.Gfx, c = arcade.ctx, g = arcade.grid, now = Date.now();
    al = al == null ? 1 : al;
    c.fillStyle = '#0b3a21'; c.fillRect(0, 0, LW, LH);
    G.fillTile(c, 'grass', 0, 0, LW, LH, 1);
    for (var gy = 0; gy < arcade.rows; gy++) for (var gx = 0; gx < arcade.cols; gx++) {
      if ((gx + gy) % 2) { c.fillStyle = 'rgba(0,0,0,.11)'; c.fillRect(gx * g, gy * g, g, g); }
    }
    var sun = c.createRadialGradient(60, 40, 10, 60, 40, 380);
    sun.addColorStop(0, 'rgba(255,240,170,.16)'); sun.addColorStop(1, 'rgba(0,0,0,.25)');
    c.fillStyle = sun; c.fillRect(0, 0, LW, LH);
    /* maçã */
    var fx0 = arcade.food.x * g + g / 2, fy0 = arcade.food.y * g + g / 2 + Math.sin(now / 260) * 1.2;
    G.shadow(c, fx0 + 1, arcade.food.y * g + g - 2, g * 0.42, g * 0.16, 0.5);
    G.sphere(c, fx0, fy0, g / 2 - 2, '#e53935');
    c.strokeStyle = '#5d4037'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(fx0, fy0 - g / 2 + 3); c.lineTo(fx0 + 1, fy0 - g / 2 - 1); c.stroke();
    c.fillStyle = '#43a047'; c.beginPath(); c.ellipse(fx0 + 4, fy0 - g / 2 + 1, 4, 2, -0.5, 0, TAU); c.fill();
    /* corpo como um tubo contínuo (interpolado) */
    var cur = arcade.snake, prev = arcade._prevSnake || cur, pts = [], i;
    for (i = 0; i < cur.length; i++) {
      var p = prev[i] || cur[i];
      pts.push({ x: G.lerp(p.x, cur[i].x, al) * g + g / 2, y: G.lerp(p.y, cur[i].y, al) * g + g / 2 });
    }
    var n = pts.length;
    function trilha(ox, oy) {
      c.beginPath(); c.moveTo(pts[n - 1].x + ox, pts[n - 1].y + oy);
      for (var k = n - 2; k >= 0; k--) c.lineTo(pts[k].x + ox, pts[k].y + oy);
    }
    c.lineCap = 'round'; c.lineJoin = 'round';
    trilha(2, 3); c.strokeStyle = 'rgba(0,0,0,.4)'; c.lineWidth = g * 0.86; c.stroke();
    trilha(0, 0); c.strokeStyle = '#158a45'; c.lineWidth = g * 0.88; c.stroke();
    trilha(0, -0.5); c.strokeStyle = '#22c55e'; c.lineWidth = g * 0.68; c.stroke();
    trilha(-0.8, -1.6); c.strokeStyle = 'rgba(190,255,210,.55)'; c.lineWidth = g * 0.22; c.stroke();
    c.strokeStyle = 'rgba(0,60,20,.28)'; c.lineWidth = 1;
    for (i = 1; i < n; i++) { c.beginPath(); c.arc(pts[i].x, pts[i].y, g * 0.26, 0, TAU); c.stroke(); }
    /* cabeça */
    var hd = pts[0], d = arcade.dir, px = -d.y, py = d.x;
    G.sphere(c, hd.x, hd.y, g * 0.62, '#2ee073', { spec: false });
    [-1, 1].forEach(function (s) {
      var ex = hd.x + d.x * g * 0.2 + px * s * g * 0.24, ey = hd.y + d.y * g * 0.2 + py * s * g * 0.24;
      c.fillStyle = '#fff'; c.beginPath(); c.arc(ex, ey, g * 0.16, 0, TAU); c.fill();
      c.fillStyle = '#111'; c.beginPath(); c.arc(ex + d.x * g * 0.05, ey + d.y * g * 0.05, g * 0.08, 0, TAU); c.fill();
    });
    if (Math.floor(now / 450) % 3 === 0) {
      c.strokeStyle = '#ff5252'; c.lineWidth = 1.4; c.beginPath();
      c.moveTo(hd.x + d.x * g * 0.6, hd.y + d.y * g * 0.6); c.lineTo(hd.x + d.x * g * 1.0, hd.y + d.y * g * 1.0); c.stroke();
    }
  }

  /* ================================================================
     PAC-MAN (simplificado)
     ================================================================ */
  function initPacman() {
    arcade.pac = { x: 1, y: 1 };
    arcade.dir = { x: 1, y: 0 };
    arcade.nextDir = { x: 1, y: 0 };
    arcade.ghosts = [
      { x: 10, y: 8, c: '#ef5350' },
      { x: 12, y: 8, c: '#ffc107' },
      { x: 14, y: 8, c: '#00d2ff' }
    ];
    arcade.dots = [];
    arcade.walls = {};
    // labirinto simples
    for (var y = 0; y < 20; y++) {
      for (var x = 0; x < 20; x++) {
        if (y === 0 || y === 19 || x === 0 || x === 19) arcade.walls[x + ',' + y] = 1;
        else if ((x % 4 === 0 && y % 3 === 0) && !(x === 10 && y === 8)) arcade.walls[x + ',' + y] = 1;
        else arcade.dots.push({ x: x, y: y });
      }
    }
    arcade._objLabel = 'Colete os pontos';
    drawPacman();
  }
  function tickPacman() {
    arcade._prevPac = { x: arcade.pac.x, y: arcade.pac.y };
    arcade._prevGh = arcade.ghosts.map(function (g) { return { x: g.x, y: g.y }; });
    arcade.dir = arcade.nextDir;
    var nx = arcade.pac.x + arcade.dir.x, ny = arcade.pac.y + arcade.dir.y;
    if (!arcade.walls[nx + ',' + ny] && nx >= 0 && ny >= 0 && nx < 20 && ny < 20) {
      arcade.pac.x = nx; arcade.pac.y = ny;
    }
    arcade.dots = arcade.dots.filter(function (d) {
      if (d.x === arcade.pac.x && d.y === arcade.pac.y) { arcade.score += 5; return false; }
      return true;
    });
    arcade.ghosts.forEach(function (g) {
      var opts = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];
      var m = opts[Math.floor(Math.random() * 4)];
      var gx = g.x + m.x, gy = g.y + m.y;
      if (!arcade.walls[gx + ',' + gy] && gx > 0 && gy > 0 && gx < 19 && gy < 19) { g.x = gx; g.y = gy; }
      if (g.x === arcade.pac.x && g.y === arcade.pac.y) gameOver('Fantasma!');
    });
    if (!arcade.dots.length) { arcade.score += 100; gameOver('Vitória!'); return; }
    drawPacman();
  }
  function mazeLayer() {
    if (arcade._maze && arcade._mazeKey === arcade.walls) return arcade._maze;
    var G = global.Gfx, S = arcade.S || 1, g = 16;
    var cv = document.createElement('canvas'); cv.width = Math.round(320 * S); cv.height = Math.round(320 * S);
    var m = cv.getContext('2d'); m.scale(S, S);
    var bg = m.createRadialGradient(160, 160, 20, 160, 160, 240);
    bg.addColorStop(0, '#0c1a30'); bg.addColorStop(1, '#03070f'); m.fillStyle = bg; m.fillRect(0, 0, 320, 320);
    Object.keys(arcade.walls).forEach(function (k) {
      var p = k.split(','), x = +p[0] * g, y = +p[1] * g;
      var gr = m.createLinearGradient(x, y, x, y + g);
      gr.addColorStop(0, '#2b5ea8'); gr.addColorStop(0.5, '#153a75'); gr.addColorStop(1, '#0a2149');
      m.fillStyle = gr; G.rr(m, x + 0.5, y + 0.5, g - 1, g - 1, 3); m.fill();
      m.strokeStyle = 'rgba(120,190,255,.85)'; m.lineWidth = 1; G.rr(m, x + 1.5, y + 1.5, g - 3, g - 3, 2.5); m.stroke();
      m.fillStyle = 'rgba(255,255,255,.14)'; m.fillRect(x + 3, y + 2, g - 6, 2);
    });
    arcade._maze = cv; arcade._mazeKey = arcade.walls;
    return cv;
  }
  function drawPacman(al) {
    if (arcade._rafOn && !arcade._inRaf) return;
    var G = global.Gfx, c = arcade.ctx, g = 16, oy = 40, now = Date.now(), i;
    al = al == null ? 1 : al;
    c.fillStyle = '#02050a'; c.fillRect(0, 0, LW, LH);
    c.drawImage(mazeLayer(), 0, oy, 320, 320);
    c.fillStyle = 'rgba(255,220,120,.16)'; c.beginPath();
    arcade.dots.forEach(function (d) { var x = d.x * g + g / 2, y = d.y * g + g / 2 + oy; c.moveTo(x + 3.6, y); c.arc(x, y, 3.6, 0, TAU); });
    c.fill();
    c.fillStyle = '#ffe9a8'; c.beginPath();
    arcade.dots.forEach(function (d) { var x = d.x * g + g / 2, y = d.y * g + g / 2 + oy; c.moveTo(x + 1.8, y); c.arc(x, y, 1.8, 0, TAU); });
    c.fill();
    /* Pac-Man */
    var pp = arcade._prevPac || arcade.pac;
    var px = G.lerp(pp.x, arcade.pac.x, al) * g + g / 2, py = G.lerp(pp.y, arcade.pac.y, al) * g + g / 2 + oy;
    var dd = arcade.dir, ang = Math.atan2(dd.y, dd.x), mo = 0.12 + Math.abs(Math.sin(now / 90)) * 0.32;
    G.shadow(c, px + 1, py + g / 2 - 1, g * 0.42, g * 0.14, 0.5);
    var gr = c.createRadialGradient(px - 3, py - 4, 1, px, py, g / 2);
    gr.addColorStop(0, '#fff59d'); gr.addColorStop(0.5, '#ffca28'); gr.addColorStop(1, '#b26a00');
    c.fillStyle = gr; c.beginPath(); c.moveTo(px, py);
    c.arc(px, py, g / 2 - 0.5, ang + mo * Math.PI, ang + Math.PI * 2 - mo * Math.PI); c.closePath(); c.fill();
    G.glow(c, px, py, g * 1.2, '#ffc107', 0.25);
    c.fillStyle = '#111'; c.beginPath(); c.arc(px + Math.cos(ang - 1.1) * g * 0.22, py + Math.sin(ang - 1.1) * g * 0.22 - 1, 1.3, 0, TAU); c.fill();
    /* fantasmas */
    arcade.ghosts.forEach(function (gh, k) {
      var pg = (arcade._prevGh && arcade._prevGh[k]) || gh;
      var gx = G.lerp(pg.x, gh.x, al) * g + g / 2, gy = G.lerp(pg.y, gh.y, al) * g + g / 2 + oy + Math.sin(now / 180 + k) * 0.8;
      var r = g / 2 - 0.5, wv = Math.floor(now / 140) % 2 ? r * 0.25 : 0;
      G.shadow(c, gx + 1, gy + r, r * 0.9, r * 0.3, 0.45);
      var fg = c.createLinearGradient(0, gy - r, 0, gy + r);
      fg.addColorStop(0, G.shade(gh.c, 0.45)); fg.addColorStop(0.6, gh.c); fg.addColorStop(1, G.shade(gh.c, -0.45));
      c.fillStyle = fg; c.beginPath(); c.arc(gx, gy - 1, r, Math.PI, 0);
      c.lineTo(gx + r, gy + r); c.lineTo(gx + r * 0.5 - wv, gy + r - 3); c.lineTo(gx, gy + r);
      c.lineTo(gx - r * 0.5 + wv, gy + r - 3); c.lineTo(gx - r, gy + r); c.closePath(); c.fill();
      G.glow(c, gx, gy, g * 1.1, gh.c, 0.15);
      var lx = Math.sign(arcade.pac.x - gh.x) * 1.2, ly = Math.sign(arcade.pac.y - gh.y) * 1.2;
      [-1, 1].forEach(function (s) {
        c.fillStyle = '#fff'; c.beginPath(); c.arc(gx + s * 3.2, gy - 2, 2.7, 0, TAU); c.fill();
        c.fillStyle = '#0d47a1'; c.beginPath(); c.arc(gx + s * 3.2 + lx, gy - 2 + ly, 1.3, 0, TAU); c.fill();
      });
    });
  }

  /* ================================================================
     CORRIDA
     ================================================================ */
  function initCorrida() {
    arcade.carX = 1; arcade.obstacles = []; arcade.speed = 3; arcade.frame = 0; arcade.lives = 3;
    arcade._objLabel = 'Desvie dos obstáculos';
    if (global.Gfx3D) { global.Gfx3D.kartReset(); global.Gfx3D.kartIniciar(function () {}); }
    drawCorrida();
  }
  function tickCorrida() {
    arcade.frame++;
    if (arcade.frame % Math.max(8, 22 - arcade.nivel) === 0) {
      arcade.obstacles.push({ x: Math.floor(Math.random() * 3), y: -20 });
    }
    arcade.obstacles.forEach(function (o) { o.y += arcade.speed; });
    arcade.obstacles = arcade.obstacles.filter(function (o) {
      if (o.y > 420) { arcade.score += 5; return false; }
      if (o.y > 320 && o.y < 380 && o.x === arcade.carX) {
        arcade.lives--;
        if (arcade.lives <= 0) { gameOver('Batida!'); return false; }
        return false;
      }
      return true;
    });
    drawCorrida();
  }
  /* Desenho 2D de reserva (pseudo-3D em perspectiva) — usado se o 3D não carregar */
  function carroTraseiro(c, G, x, y, sc, col, jogador) {
    var w = 54 * sc, h = 30 * sc;
    G.shadow(c, x, y + h * 0.55, w * 0.62, h * 0.22, 0.5);
    G.bevel(c, x - w / 2, y - h / 2, w, h, col, 4 * sc);
    c.fillStyle = '#0c1a26'; G.rr(c, x - w * 0.34, y - h * 0.46, w * 0.68, h * 0.34, 3 * sc); c.fill();
    c.fillStyle = '#ff2a2a'; c.fillRect(x - w * 0.46, y + h * 0.08, w * 0.2, h * 0.14); c.fillRect(x + w * 0.26, y + h * 0.08, w * 0.2, h * 0.14);
    G.glow(c, x - w * 0.36, y + h * 0.15, w * 0.35, '#ff2a2a', 0.5); G.glow(c, x + w * 0.36, y + h * 0.15, w * 0.35, '#ff2a2a', 0.5);
    if (jogador) { c.fillStyle = '#ffc107'; c.fillRect(x - w * 0.5, y - h * 0.02, w, Math.max(1, 2 * sc)); }
    c.fillStyle = '#0b0d10'; c.fillRect(x - w * 0.5, y + h * 0.42, w * 0.16, h * 0.2); c.fillRect(x + w * 0.34, y + h * 0.42, w * 0.16, h * 0.2);
  }
  function drawCorrida(al) {
    if (arcade._rafOn && !arcade._inRaf) return;
    var G = global.Gfx, c = arcade.ctx, hz = 130, span = LH - hz, i;
    al = al == null ? 1 : al;
    var sk = c.createLinearGradient(0, 0, 0, hz);
    sk.addColorStop(0, '#0a0f2c'); sk.addColorStop(0.6, '#5a3a78'); sk.addColorStop(1, '#f08a52');
    c.fillStyle = sk; c.fillRect(0, 0, LW, hz);
    c.fillStyle = '#1c1535'; c.beginPath(); c.moveTo(0, hz);
    for (var x = 0; x <= LW; x += 20) c.lineTo(x, hz - 14 - Math.abs(Math.sin(x * 0.045)) * 22);
    c.lineTo(LW, hz); c.fill();
    var base = ((arcade.frame || 0) + al) * (arcade.speed || 3) * 0.03, ph = base % 1, N = 36;
    for (i = 0; i < N; i++) {
      var u0 = Math.max(0, (i - ph) / N), u1 = (i + 1 - ph) / N, t0 = u0 * u0, t1 = u1 * u1;
      var y0 = hz + t0 * span, y1 = hz + t1 * span, h0 = 14 + t0 * 170, h1 = 14 + t1 * 170, par = (i + Math.floor(base)) % 2;
      c.fillStyle = par ? '#0f4a2a' : '#0c3f24'; c.fillRect(0, y0, LW, y1 - y0 + 1);
      c.fillStyle = par ? '#2d3036' : '#33363c';
      c.beginPath(); c.moveTo(160 - h0, y0); c.lineTo(160 + h0, y0); c.lineTo(160 + h1, y1 + 1); c.lineTo(160 - h1, y1 + 1); c.closePath(); c.fill();
      c.fillStyle = par ? '#d32f2f' : '#f5f5f5';
      c.beginPath(); c.moveTo(160 - h0 - 4 - t0 * 8, y0); c.lineTo(160 - h0, y0); c.lineTo(160 - h1, y1 + 1); c.lineTo(160 - h1 - 4 - t1 * 8, y1 + 1); c.fill();
      c.beginPath(); c.moveTo(160 + h0, y0); c.lineTo(160 + h0 + 4 + t0 * 8, y0); c.lineTo(160 + h1 + 4 + t1 * 8, y1 + 1); c.lineTo(160 + h1, y1 + 1); c.fill();
      if (par) {
        c.fillStyle = 'rgba(255,214,90,.9)';
        [-1 / 3, 1 / 3].forEach(function (f) {
          var a0 = 160 + h0 * 2 * f, a1 = 160 + h1 * 2 * f, w0 = 1 + t0 * 3, w1 = 1 + t1 * 3;
          c.beginPath(); c.moveTo(a0 - w0, y0); c.lineTo(a0 + w0, y0); c.lineTo(a1 + w1, y1); c.lineTo(a1 - w1, y1); c.fill();
        });
      }
    }
    var lista = (arcade.obstacles || []).map(function (o) { return { o: o, y: o.y + (arcade.speed || 3) * al }; });
    lista.sort(function (a, b) { return a.y - b.y; });
    var cores = ['#1e88e5', '#fdd835', '#8e24aa', '#43a047', '#f4511e'];
    function pos(y, lane) {
      var tt = Math.pow(Math.max(0, Math.min(1.1, (y + 20) / 440)), 1.6), half = 14 + tt * 170;
      return { x: 160 + (lane - 1) * (half * 2 / 3), y: hz + tt * span - 8 * tt, sc: 0.22 + tt * 0.95 };
    }
    lista.forEach(function (it) { if (it.o._c == null) it.o._c = Math.floor(Math.random() * 5); var p = pos(it.y, it.o.x); carroTraseiro(c, G, p.x, p.y, p.sc, cores[it.o._c], false); });
    var pj = pos(350, arcade.carX); carroTraseiro(c, G, pj.x, pj.y, pj.sc, '#d9001f', true);
    var gh = c.createLinearGradient(0, 0, 0, 44); gh.addColorStop(0, 'rgba(0,0,0,.55)'); gh.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = gh; c.fillRect(0, 0, LW, 44);
    for (i = 0; i < 3; i++) G.sphere(c, 18 + i * 20, 18, 7, i < (arcade.lives || 0) ? '#ff3b4a' : '#3a3f46');
    G.text(c, String(Math.round((arcade.speed || 3) * 32)), 306, 26, 22, '#ffe082', 'right', 'rgba(255,193,7,.8)');
  }

  /* ================================================================
     QUEBRA-BLOCOS
     ================================================================ */
  function initQuebra() {
    arcade.paddle = { x: 120, y: 370, w: 70, h: 10 };
    arcade.ball = { x: 155, y: 360, vx: 0, vy: 0, r: 6, launched: false };
    arcade.bricks = [];
    for (var r = 0; r < 5; r++) {
      for (var col = 0; col < 8; col++) {
        arcade.bricks.push({ x: 10 + col * 38, y: 40 + r * 18, w: 34, h: 14, alive: true, c: ['#00e676', '#00d2ff', '#ffc107', '#a855f7', '#ef5350'][r] });
      }
    }
    arcade._objLabel = 'Quebre todos os blocos';
    drawQuebra();
  }
  function tickQuebra() {
    var b = arcade.ball, p = arcade.paddle;
    if (!b.launched) { b.x = p.x + p.w / 2; return drawQuebra(); }
    b.x += b.vx; b.y += b.vy;
    if (b.x < b.r || b.x > LW - b.r) b.vx *= -1;
    if (b.y < b.r) b.vy *= -1;
    if (b.y > LH) { gameOver('Perdeu a bola!'); return; }
    if (b.y + b.r >= p.y && b.x >= p.x && b.x <= p.x + p.w && b.vy > 0) {
      b.vy *= -1;
      b.vx = ((b.x - (p.x + p.w / 2)) / (p.w / 2)) * 4;
    }
    arcade.bricks.forEach(function (br) {
      if (!br.alive) return;
      if (b.x > br.x && b.x < br.x + br.w && b.y > br.y && b.y < br.y + br.h) {
        br.alive = false; b.vy *= -1; arcade.score += 10;
      }
    });
    if (!arcade.bricks.some(function (br) { return br.alive; })) { gameOver('Vitória!'); return; }
    // hold left/right continuous
    if (activeDir === 'left') p.x = Math.max(0, p.x - 5);
    if (activeDir === 'right') p.x = Math.min(LW - p.w, p.x + 5);
    drawQuebra();
  }
  function drawQuebra(al) {
    if (arcade._rafOn && !arcade._inRaf) return;
    var G = global.Gfx, c = arcade.ctx, b = arcade.ball, p = arcade.paddle, now = Date.now();
    al = al == null ? 1 : al;
    var bg = c.createLinearGradient(0, 0, 0, LH); bg.addColorStop(0, '#050a18'); bg.addColorStop(1, '#0b1430');
    c.fillStyle = bg; c.fillRect(0, 0, LW, LH);
    c.strokeStyle = 'rgba(80,140,255,.07)'; c.lineWidth = 1;
    for (var gx = 0; gx <= LW; gx += 20) { c.beginPath(); c.moveTo(gx, 0); c.lineTo(gx, LH); c.stroke(); }
    for (var gy = 0; gy <= LH; gy += 20) { c.beginPath(); c.moveTo(0, gy); c.lineTo(LW, gy); c.stroke(); }
    G.glow(c, LW / 2, 120, 220, '#2a5cff', 0.12);
    arcade.bricks.forEach(function (br) { if (br.alive) G.bevel(c, br.x, br.y, br.w, br.h, br.c, 3); });
    /* raquete metálica com luz por baixo */
    G.glow(c, p.x + p.w / 2, p.y + p.h + 4, p.w * 0.8, '#00d2ff', 0.35);
    var pg = c.createLinearGradient(0, p.y, 0, p.y + p.h); pg.addColorStop(0, '#e8f7ff'); pg.addColorStop(0.45, '#4fc3f7'); pg.addColorStop(1, '#0a4a72');
    c.fillStyle = 'rgba(0,0,0,.4)'; G.rr(c, p.x + 1, p.y + 3, p.w, p.h, 5); c.fill();
    c.fillStyle = pg; G.rr(c, p.x, p.y, p.w, p.h, 5); c.fill();
    c.fillStyle = 'rgba(255,255,255,.55)'; G.rr(c, p.x + 4, p.y + 1.5, p.w - 8, 2.5, 1.2); c.fill();
    /* bola com rastro */
    var bx = b.launched ? b.x + b.vx * al : b.x, by = b.launched ? b.y + b.vy * al : b.y;
    var tr = arcade._trail || (arcade._trail = []);
    tr.push({ x: bx, y: by }); if (tr.length > 10) tr.shift();
    for (var i = 0; i < tr.length; i++) {
      c.fillStyle = 'rgba(200,230,255,' + (i / tr.length * 0.28) + ')';
      c.beginPath(); c.arc(tr[i].x, tr[i].y, b.r * (0.4 + i / tr.length * 0.5), 0, TAU); c.fill();
    }
    G.glow(c, bx, by, b.r * 4, '#ffffff', 0.35);
    G.shadow(c, bx + 2, by + b.r + 3, b.r * 0.9, b.r * 0.3, 0.35);
    G.sphere(c, bx, by, b.r, '#e6eef5');
  }

  /* ================================================================
     PULO (Flappy-like)
     ================================================================ */
  function initPulo() {
    arcade.birdY = 200; arcade.birdV = 0; arcade.pipes = [];
    arcade._objLabel = 'Toque para pular';
    drawPulo();
  }
  function tickPulo() {
    arcade.birdV += 0.35;
    arcade.birdY += arcade.birdV;
    if (arcade.birdY > 390 || arcade.birdY < 0) { gameOver('Caiu!'); return; }
    if (arcade.frame++ % 70 === 0) {
      var gap = 90 + Math.random() * 40;
      var top = 40 + Math.random() * 180;
      arcade.pipes.push({ x: 320, top: top, gap: gap });
    }
    arcade.pipes.forEach(function (p) {
      p.x -= 2.5;
      if (p.x < 40 && p.x > 10) {
        if (arcade.birdY < p.top || arcade.birdY > p.top + p.gap) gameOver('Tubo!');
      }
      if (p.x < -40 && !p.scored) { p.scored = true; arcade.score += 10; }
    });
    arcade.pipes = arcade.pipes.filter(function (p) { return p.x > -50; });
    drawPulo();
  }
  function drawPulo(al) {
    if (arcade._rafOn && !arcade._inRaf) return;
    var G = global.Gfx, c = arcade.ctx, now = Date.now(), i;
    al = al == null ? 1 : al;
    var sk = c.createLinearGradient(0, 0, 0, LH); sk.addColorStop(0, '#0a1230'); sk.addColorStop(0.5, '#46306e'); sk.addColorStop(0.85, '#e4805a'); sk.addColorStop(1, '#ffb877');
    c.fillStyle = sk; c.fillRect(0, 0, LW, LH);
    G.glow(c, 250, 250, 130, '#ffb060', 0.55);
    G.sphere(c, 250, 250, 26, '#ffd9a0', { spec: false });
    c.fillStyle = 'rgba(255,255,255,.14)';
    for (i = 0; i < 4; i++) {
      var cx = ((now / 40 * (0.4 + i * 0.15) + i * 130) % (LW + 120)) - 60, cy = 50 + i * 42;
      c.beginPath(); c.ellipse(cx, cy, 34, 9, 0, 0, TAU); c.ellipse(cx + 18, cy - 6, 22, 9, 0, 0, TAU); c.ellipse(cx - 20, cy - 3, 20, 7, 0, 0, TAU); c.fill();
    }
    c.fillStyle = '#2a2050'; c.beginPath(); c.moveTo(0, 340);
    for (var x = 0; x <= LW; x += 16) c.lineTo(x, 320 - Math.abs(Math.sin(x * 0.03 + 1)) * 46); c.lineTo(LW, 340); c.fill();
    c.fillStyle = '#163a2a'; c.beginPath(); c.moveTo(0, 360);
    for (x = 0; x <= LW; x += 16) c.lineTo(x, 345 - Math.abs(Math.sin(x * 0.05)) * 22); c.lineTo(LW, 360); c.fill();
    /* canos cilíndricos */
    function cano(x, y, w, h, cap, capY) {
      c.fillStyle = 'rgba(0,0,0,.28)'; c.fillRect(x + 5, y, w, h);
      var gr = c.createLinearGradient(x, 0, x + w, 0);
      gr.addColorStop(0, '#08501f'); gr.addColorStop(0.25, '#3ddc6a'); gr.addColorStop(0.5, '#1fa84a'); gr.addColorStop(1, '#08501f');
      c.fillStyle = gr; c.fillRect(x, y, w, h);
      var cg = c.createLinearGradient(x - 4, 0, x + w + 4, 0);
      cg.addColorStop(0, '#0a5f27'); cg.addColorStop(0.25, '#56f07f'); cg.addColorStop(0.55, '#22b850'); cg.addColorStop(1, '#0a5f27');
      c.fillStyle = cg; G.rr(c, x - 4, capY, w + 8, 14, 3); c.fill();
      c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(x + 6, y, 3, h);
    }
    arcade.pipes.forEach(function (p) {
      var x = p.x - 2.5 * al;
      cano(x, 0, 40, p.top - 14, true, p.top - 14);
      cano(x, p.top + p.gap + 14, 40, LH - p.top - p.gap - 14, true, p.top + p.gap);
    });
    c.fillStyle = '#1d5a2a'; c.fillRect(0, 392, LW, 8);
    /* pássaro */
    var by = arcade.birdY + arcade.birdV * al, tilt = Math.max(-0.5, Math.min(0.9, arcade.birdV * 0.08));
    G.shadow(c, 50, 396, 12, 3, 0.3);
    c.save(); c.translate(50, by); c.rotate(tilt);
    G.sphere(c, 0, 0, 12, '#ffc107');
    c.fillStyle = 'rgba(255,245,200,.7)'; c.beginPath(); c.ellipse(1, 4, 7, 5, 0, 0, TAU); c.fill();
    var fl = Math.sin(now / 60) * 6;
    c.fillStyle = '#ff9800'; c.beginPath(); c.ellipse(-4, 1 + fl * 0.3, 7, 4 + Math.abs(fl) * 0.4, -0.3 + fl * 0.05, 0, TAU); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(6, -4, 3.6, 0, TAU); c.fill();
    c.fillStyle = '#111'; c.beginPath(); c.arc(7, -4, 1.7, 0, TAU); c.fill();
    c.fillStyle = '#ff6d00'; c.beginPath(); c.moveTo(11, -1); c.lineTo(19, 1); c.lineTo(11, 4); c.closePath(); c.fill();
    c.restore();
  }

  /* ================================================================
     DAMAS — Minimax completo (Fácil / Difícil / Impossível)
     ================================================================ */
  function initDamas() {
    var board = [];
    for (var r = 0; r < 8; r++) {
      board[r] = [];
      for (var c = 0; c < 8; c++) {
        if ((r + c) % 2 === 1) {
          if (r < 3) board[r][c] = -1;      // IA (preto)
          else if (r > 4) board[r][c] = 1; // jogador (branco)
          else board[r][c] = 0;
        } else board[r][c] = 0;
      }
    }
    arcade.damas = {
      board: board,
      selected: null,
      turn: 1, // 1 = jogador, -1 = IA
      moves: [],
      cursor: { r: 5, c: 1 },
      thinking: false
    };
    arcade._objLabel = 'Sua vez — selecione e mova';
    drawDamas();
  }

  function damasDir(d) {
    var D = arcade.damas; if (!D || D.turn !== 1 || D.thinking) return;
    if (d === 'up') D.cursor.r = Math.max(0, D.cursor.r - 1);
    if (d === 'down') D.cursor.r = Math.min(7, D.cursor.r + 1);
    if (d === 'left') D.cursor.c = Math.max(0, D.cursor.c - 1);
    if (d === 'right') D.cursor.c = Math.min(7, D.cursor.c + 1);
    drawDamas();
  }

  function damasSelect() {
    var D = arcade.damas; if (!D || D.turn !== 1 || D.thinking) return;
    var r = D.cursor.r, c = D.cursor.c;
    if (D.selected) {
      var ok = D.moves.some(function (m) { return m.tr === r && m.tc === c; });
      if (ok) {
        applyDamasMove(D.board, D.selected.r, D.selected.c, r, c);
        D.selected = null; D.moves = [];
        D.turn = -1;
        arcade.score += 1;
        drawDamas();
        setTimeout(damasAI, 350);
        return;
      }
    }
    if (D.board[r][c] > 0) {
      D.selected = { r: r, c: c };
      D.moves = getMovesFor(D.board, r, c, 1);
    } else {
      D.selected = null; D.moves = [];
    }
    drawDamas();
  }

  // sobrescreve ação para damas
  var _origAcao = global.arcadeAcao;
  global.arcadeAcao = function () {
    if (arcade.tipo === 'damas') { damasSelect(); return; }
    _origAcao();
  };

  function getMovesFor(board, r, c, player) {
    var piece = board[r][c];
    if (!piece || (piece > 0 && player < 0) || (piece < 0 && player > 0)) return [];
    var isKing = Math.abs(piece) === 2;
    var dirs = isKing ? [[-1, -1], [-1, 1], [1, -1], [1, 1]] :
      (player > 0 ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]]);
    var moves = [], captures = [];
    dirs.forEach(function (d) {
      var nr = r + d[0], nc = c + d[1];
      if (nr < 0 || nr > 7 || nc < 0 || nc > 7) return;
      if (board[nr][nc] === 0) {
        moves.push({ fr: r, fc: c, tr: nr, tc: nc, capture: false });
      } else if (board[nr][nc] * player < 0) {
        var jr = nr + d[0], jc = nc + d[1];
        if (jr >= 0 && jr <= 7 && jc >= 0 && jc <= 7 && board[jr][jc] === 0) {
          captures.push({ fr: r, fc: c, tr: jr, tc: jc, capture: true, cr: nr, cc: nc });
        }
      }
    });
    return captures.length ? captures : moves;
  }

  function allMoves(board, player) {
    var list = [], caps = [];
    for (var r = 0; r < 8; r++) {
      for (var c = 0; c < 8; c++) {
        if (board[r][c] * player > 0) {
          getMovesFor(board, r, c, player).forEach(function (m) {
            if (m.capture) caps.push(m); else list.push(m);
          });
        }
      }
    }
    return caps.length ? caps : list;
  }

  function applyDamasMove(board, fr, fc, tr, tc) {
    var piece = board[fr][fc];
    board[fr][fc] = 0;
    // captura?
    if (Math.abs(tr - fr) === 2) {
      board[(fr + tr) / 2][(fc + tc) / 2] = 0;
    }
    // promoção
    if (piece === 1 && tr === 0) piece = 2;
    if (piece === -1 && tr === 7) piece = -2;
    board[tr][tc] = piece;
  }

  function cloneBoard(b) {
    return b.map(function (row) { return row.slice(); });
  }

  function evaluateBoard(board) {
    var score = 0, pCount = 0, aCount = 0;
    for (var r = 0; r < 8; r++) {
      for (var c = 0; c < 8; c++) {
        var v = board[r][c];
        if (v === 1) { score -= 10; pCount++; }
        else if (v === 2) { score -= 18; pCount++; }
        else if (v === -1) { score += 10; aCount++; }
        else if (v === -2) { score += 18; aCount++; }
        // posição central
        if (v < 0 && r >= 2 && r <= 5 && c >= 2 && c <= 5) score += 1;
        if (v > 0 && r >= 2 && r <= 5 && c >= 2 && c <= 5) score -= 1;
      }
    }
    if (pCount === 0) return 1000;
    if (aCount === 0) return -1000;
    return score;
  }

  function minimaxDamas(board, depth, maximizing, alpha, beta) {
    var moves = allMoves(board, maximizing ? -1 : 1);
    if (depth <= 0 || !moves.length) return evaluateBoard(board);
    if (maximizing) {
      var maxE = -Infinity;
      for (var i = 0; i < moves.length; i++) {
        var b = cloneBoard(board);
        var m = moves[i];
        applyDamasMove(b, m.fr, m.fc, m.tr, m.tc);
        var ev = minimaxDamas(b, depth - 1, false, alpha, beta);
        maxE = Math.max(maxE, ev);
        alpha = Math.max(alpha, ev);
        if (beta <= alpha) break;
      }
      return maxE;
    } else {
      var minE = Infinity;
      for (var j = 0; j < moves.length; j++) {
        var b2 = cloneBoard(board);
        var m2 = moves[j];
        applyDamasMove(b2, m2.fr, m2.fc, m2.tr, m2.tc);
        var ev2 = minimaxDamas(b2, depth - 1, true, alpha, beta);
        minE = Math.min(minE, ev2);
        beta = Math.min(beta, ev2);
        if (beta <= alpha) break;
      }
      return minE;
    }
  }

  function damasAI() {
    var D = arcade.damas; if (!D || !arcade.rodando) return;
    D.thinking = true;
    arcade._objLabel = 'IA pensando...';
    drawDamas();
    setTimeout(function () {
      if (!arcade.rodando || !D) return;
      var cfg = getAI();
      var moves = allMoves(D.board, -1);
      if (!moves.length) {
        gameOver('Você venceu!');
        return;
      }
      var choice;
      if (cfg.random > 0 && Math.random() < cfg.random) {
        choice = moves[Math.floor(Math.random() * moves.length)];
      } else {
        var best = -Infinity, bestM = moves[0];
        moves.forEach(function (m) {
          var b = cloneBoard(D.board);
          applyDamasMove(b, m.fr, m.fc, m.tr, m.tc);
          var sc = minimaxDamas(b, cfg.depth - 1, false, -Infinity, Infinity);
          if (sc > best) { best = sc; bestM = m; }
        });
        choice = bestM;
      }
      applyDamasMove(D.board, choice.fr, choice.fc, choice.tr, choice.tc);
      D.thinking = false;
      D.turn = 1;
      // checar fim
      if (!allMoves(D.board, 1).length) { gameOver('IA venceu!'); return; }
      if (!allMoves(D.board, -1).length) { gameOver('Você venceu!'); return; }
      arcade._objLabel = 'Sua vez — selecione e mova';
      drawDamas();
    }, 200);
  }

  function tickDamas() {
    // só redesenha se necessário; IA é async
  }

  function pecaDama(c, G, x, y, branca, rei) {
    var base = branca ? '#f3ead8' : '#23262b', edge = branca ? '#b9ac93' : '#0a0b0d', hi = branca ? '#ffffff' : '#5c626b';
    G.shadow(c, x + 2, y + 9, 14, 5, 0.5);
    c.fillStyle = edge; c.beginPath(); c.ellipse(x, y + 3, 15, 13, 0, 0, TAU); c.fill();
    var gr = c.createRadialGradient(x - 5, y - 7, 2, x, y, 16);
    gr.addColorStop(0, hi); gr.addColorStop(0.45, base); gr.addColorStop(1, edge);
    c.fillStyle = gr; c.beginPath(); c.ellipse(x, y, 15, 13, 0, 0, TAU); c.fill();
    c.strokeStyle = branca ? 'rgba(120,100,70,.5)' : 'rgba(255,255,255,.14)'; c.lineWidth = 1;
    c.beginPath(); c.ellipse(x, y, 10.5, 9, 0, 0, TAU); c.stroke();
    if (rei) {
      c.fillStyle = '#ffc107'; c.strokeStyle = '#a06a00'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(x - 7, y + 4); c.lineTo(x - 7, y - 3); c.lineTo(x - 3.5, y); c.lineTo(x, y - 5);
      c.lineTo(x + 3.5, y); c.lineTo(x + 7, y - 3); c.lineTo(x + 7, y + 4); c.closePath(); c.fill(); c.stroke();
    }
  }
  function drawDamas() {
    var G = global.Gfx, c = arcade.ctx, D = arcade.damas; if (!D) return;
    var cell = 40, offX = 0, offY = 20, now = Date.now();
    var bgm = c.createLinearGradient(0, 0, 0, LH); bgm.addColorStop(0, '#2a1a10'); bgm.addColorStop(1, '#120b07');
    c.fillStyle = bgm; c.fillRect(0, 0, LW, LH);
    G.fillTile(c, 'woodD', 0, 0, LW, offY, 1); G.fillTile(c, 'woodD', 0, offY + 320, LW, LH - offY - 320, 1);
    c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(0, offY - 3, LW, 3); c.fillRect(0, offY + 320, LW, 3);
    G.fillTile(c, 'woodL', 0, offY, LW, 320, 1);
    for (var r = 0; r < 8; r++) {
      for (var col = 0; col < 8; col++) {
        var x = offX + col * cell, y = offY + r * cell;
        if ((r + col) % 2 === 1) G.fillTile(c, 'woodD', x, y, cell, cell, 1);
        if (D.selected && D.selected.r === r && D.selected.c === col) { c.fillStyle = 'rgba(0,230,118,.38)'; c.fillRect(x, y, cell, cell); }
      }
    }
    var lg = c.createLinearGradient(0, offY, LW, offY + 320); lg.addColorStop(0, 'rgba(255,240,200,.16)'); lg.addColorStop(1, 'rgba(0,0,0,.28)');
    c.fillStyle = lg; c.fillRect(0, offY, LW, 320);
    var pul = 0.5 + 0.3 * Math.sin(now / 200);
    D.moves.forEach(function (m) {
      var x = offX + m.tc * cell + 20, y = offY + m.tr * cell + 20;
      G.glow(c, x, y, 20, '#ffc107', 0.5 * pul);
      c.fillStyle = 'rgba(255,193,7,' + (0.55 + 0.3 * pul) + ')'; c.beginPath(); c.arc(x, y, 6, 0, TAU); c.fill();
    });
    for (r = 0; r < 8; r++) {
      for (col = 0; col < 8; col++) {
        var p = D.board[r][col];
        if (p) pecaDama(c, G, offX + col * cell + 20, offY + r * cell + 20, p > 0, Math.abs(p) === 2);
      }
    }
    if (D.cursor) {
      c.strokeStyle = '#00e676'; c.lineWidth = 2; c.shadowColor = '#00e676'; c.shadowBlur = 8;
      c.strokeRect(offX + D.cursor.c * cell + 1, offY + D.cursor.r * cell + 1, cell - 2, cell - 2); c.shadowBlur = 0;
    }
    G.text(c, D.turn === 1 ? 'Você (brancas)' : 'IA (pretas)', 160, 372, 12, '#e9dcc0', 'center');
  }

  /* Canvas click for damas */
  function onCanvasClick(e) {
    if (arcade.tipo !== 'damas' || !arcade.damas || arcade.damas.turn !== 1) return;
    var rect = arcade.canvas.getBoundingClientRect();
    var scaleX = LW / rect.width;
    var scaleY = LH / rect.height;
    var x = ((e.clientX || (e.touches && e.touches[0].clientX)) - rect.left) * scaleX;
    var y = ((e.clientY || (e.touches && e.touches[0].clientY)) - rect.top) * scaleY;
    var c = Math.floor(x / 40), r = Math.floor((y - 20) / 40);
    if (r < 0 || r > 7 || c < 0 || c > 7) return;
    arcade.damas.cursor = { r: r, c: c };
    damasSelect();
  }

  /* Ranking / níveis UI */
  global.renderSeletorNiveisArcade = function () {
    var box = $('boxNiveisArcadeTab'); if (!box) return;
    var jogos = [
      { id: 'snake', n: 'Minhoca' }, { id: 'pacman', n: 'Pac-Man' },
      { id: 'corrida', n: 'Retro Kart' }, { id: 'quebra', n: 'Quebra-Blocos' },
      { id: 'pulo', n: 'Pulo' }, { id: 'damas', n: 'Damas' }
    ];
    var h = '';
    jogos.forEach(function (j) {
      var m = nivelMax(j.id);
      h += '<div class="lista-item"><div class="linha"><b>' + j.n + '</b><span class="badge-count">Nv. ' + m + '/10</span></div></div>';
    });
    box.innerHTML = h;
  };
  global.renderRankingJogos = function () {
    var box = $('listaRankingJogosTab'); if (!box) return;
    // Ranking unificado (também usado na área ADM)
    var boxAdm = document.getElementById('listaRankingJogosAdm');
    var html = '<p class="sem-dados">Jogue para pontuar! Os pontos entram no ranking quando houver nome na aba Início.</p>';
    try {
      var rank = JSON.parse(localStorage.getItem('uc_arcade_ranking') || '[]');
      if (Array.isArray(rank) && rank.length) {
        rank = rank.sort(function (a, b) { return (b.pts || 0) - (a.pts || 0); }).slice(0, 10);
        html = rank.map(function (r, i) {
          var medal = i === 0 ? '🥇' : (i === 1 ? '🥈' : (i === 2 ? '🥉' : (i + 1) + 'º'));
          return '<div class="lista-item"><div class="linha"><span>' + medal + ' ' + (r.nome || 'Jogador') + '</span><span class="badge-count">' + (r.pts || 0) + ' pts</span></div></div>';
        }).join('');
      }
    } catch (e) {}
    box.innerHTML = html;
    if (boxAdm) boxAdm.innerHTML = html;
  };

  /* Init */
  function boot() {
    setupTouchLayer();
    bindAllBtns();
    var acoes = $('arcadeAcoesExtra');
    if (acoes && typeof MutationObserver !== 'undefined') {
      new MutationObserver(function () { bindAllBtns(); }).observe(acoes, { childList: true, subtree: true });
    }
    document.querySelectorAll('.arcade-diff-btn').forEach(function (b) {
      b.classList.toggle('ativo', b.getAttribute('data-diff') === AI_DIFF);
    });
    setTimeout(function () {
      var canvas = $('arcadeCanvas');
      if (canvas) {
        canvas.addEventListener('click', onCanvasClick);
        canvas.addEventListener('touchend', function (e) {
          e.preventDefault();
          onCanvasClick(e);
        }, { passive: false });
      }
    }, 300);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

})(typeof window !== 'undefined' ? window : this);
