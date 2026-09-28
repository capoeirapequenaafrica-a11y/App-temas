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
      if (d === 'right') arcade.paddle.x = Math.min(arcade.canvas.width - arcade.paddle.w, arcade.paddle.x + 24);
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
    arcade.canvas.width = 320;
    arcade.canvas.height = 400;
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
    hud();
  };

  global.fecharJogoArcade = function () {
    arcade.rodando = false;
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

  function loop() {
    if (!arcade.rodando || arcade.pausado) return;
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
    var c = arcade.ctx;
    if (c) {
      c.fillStyle = 'rgba(0,0,0,.72)';
      c.fillRect(0, 0, arcade.canvas.width, arcade.canvas.height);
      c.fillStyle = '#00e676';
      c.font = 'bold 20px Inter, sans-serif';
      c.textAlign = 'center';
      c.fillText(msg || 'Game Over', arcade.canvas.width / 2, arcade.canvas.height / 2 - 10);
      c.fillStyle = '#ffc107';
      c.font = '14px Inter, sans-serif';
      c.fillText('Pontos: ' + arcade.score, arcade.canvas.width / 2, arcade.canvas.height / 2 + 20);
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
  function drawSnake() {
    var c = arcade.ctx, g = arcade.grid, w = arcade.canvas.width, h = arcade.canvas.height;
    var gr = c.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#041a12'); gr.addColorStop(1, '#0a1f18');
    c.fillStyle = gr; c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(0,230,118,.07)';
    for (var x = 0; x <= arcade.cols; x++) { c.beginPath(); c.moveTo(x * g, 0); c.lineTo(x * g, h); c.stroke(); }
    for (var y = 0; y <= arcade.rows; y++) { c.beginPath(); c.moveTo(0, y * g); c.lineTo(w, y * g); c.stroke(); }
    arcade.snake.forEach(function (s, i) {
      c.globalAlpha = i === 0 ? 1 : 0.85;
      c.fillStyle = '#00e676';
      c.beginPath(); c.arc(s.x * g + g / 2, s.y * g + g / 2, g / 2 - 1, 0, Math.PI * 2); c.fill();
    });
    c.globalAlpha = 1;
    c.fillStyle = '#ff5252';
    c.beginPath(); c.arc(arcade.food.x * g + g / 2, arcade.food.y * g + g / 2, g / 2 - 2, 0, Math.PI * 2); c.fill();
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
  function drawPacman() {
    var c = arcade.ctx, g = 16, w = arcade.canvas.width, h = arcade.canvas.height;
    c.fillStyle = '#03080c'; c.fillRect(0, 0, w, h);
    Object.keys(arcade.walls).forEach(function (k) {
      var p = k.split(',');
      c.fillStyle = '#1a3a5c';
      c.fillRect(+p[0] * g, +p[1] * g, g - 1, g - 1);
    });
    arcade.dots.forEach(function (d) {
      c.fillStyle = '#ffe082';
      c.beginPath(); c.arc(d.x * g + g / 2, d.y * g + g / 2, 2, 0, Math.PI * 2); c.fill();
    });
    c.fillStyle = '#ffc107';
    c.beginPath(); c.arc(arcade.pac.x * g + g / 2, arcade.pac.y * g + g / 2, g / 2 - 1, 0.2, Math.PI * 2 - 0.2); c.fill();
    arcade.ghosts.forEach(function (gh) {
      c.fillStyle = gh.c;
      c.beginPath(); c.arc(gh.x * g + g / 2, gh.y * g + g / 2, g / 2 - 1, 0, Math.PI * 2); c.fill();
    });
  }

  /* ================================================================
     CORRIDA
     ================================================================ */
  function initCorrida() {
    arcade.carX = 1; arcade.obstacles = []; arcade.speed = 3; arcade.frame = 0; arcade.lives = 3;
    arcade._objLabel = 'Desvie dos obstáculos';
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
  function drawCorrida() {
    var c = arcade.ctx, w = arcade.canvas.width, h = arcade.canvas.height;
    c.fillStyle = '#1a1a1a'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#333';
    c.fillRect(40, 0, 80, h); c.fillRect(120, 0, 80, h); c.fillRect(200, 0, 80, h);
    c.strokeStyle = '#ffc107'; c.setLineDash([12, 12]);
    c.beginPath(); c.moveTo(120, 0); c.lineTo(120, h); c.stroke();
    c.beginPath(); c.moveTo(200, 0); c.lineTo(200, h); c.stroke();
    c.setLineDash([]);
    arcade.obstacles.forEach(function (o) {
      c.fillStyle = '#ef5350';
      c.fillRect(50 + o.x * 80, o.y, 60, 40);
    });
    c.fillStyle = '#00e676';
    c.fillRect(50 + arcade.carX * 80, 340, 60, 40);
    c.fillStyle = '#fff'; c.font = '12px sans-serif';
    c.fillText('Vidas: ' + arcade.lives, 10, 20);
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
    if (b.x < b.r || b.x > arcade.canvas.width - b.r) b.vx *= -1;
    if (b.y < b.r) b.vy *= -1;
    if (b.y > arcade.canvas.height) { gameOver('Perdeu a bola!'); return; }
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
    if (activeDir === 'right') p.x = Math.min(arcade.canvas.width - p.w, p.x + 5);
    drawQuebra();
  }
  function drawQuebra() {
    var c = arcade.ctx;
    c.fillStyle = '#03080c'; c.fillRect(0, 0, 320, 400);
    arcade.bricks.forEach(function (br) {
      if (!br.alive) return;
      c.fillStyle = br.c; c.fillRect(br.x, br.y, br.w, br.h);
    });
    c.fillStyle = '#00d2ff'; c.fillRect(arcade.paddle.x, arcade.paddle.y, arcade.paddle.w, arcade.paddle.h);
    c.fillStyle = '#fff';
    c.beginPath(); c.arc(arcade.ball.x, arcade.ball.y, arcade.ball.r, 0, Math.PI * 2); c.fill();
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
  function drawPulo() {
    var c = arcade.ctx;
    c.fillStyle = '#0a1a2a'; c.fillRect(0, 0, 320, 400);
    arcade.pipes.forEach(function (p) {
      c.fillStyle = '#00c853';
      c.fillRect(p.x, 0, 40, p.top);
      c.fillRect(p.x, p.top + p.gap, 40, 400 - p.top - p.gap);
    });
    c.fillStyle = '#ffc107';
    c.beginPath(); c.arc(50, arcade.birdY, 12, 0, Math.PI * 2); c.fill();
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

  function drawDamas() {
    var c = arcade.ctx, D = arcade.damas; if (!D) return;
    var cell = 40, offX = 0, offY = 20;
    c.fillStyle = '#0a1419'; c.fillRect(0, 0, 320, 400);
    for (var r = 0; r < 8; r++) {
      for (var col = 0; col < 8; col++) {
        var dark = (r + col) % 2 === 1;
        c.fillStyle = dark ? '#2a4a3a' : '#c8b89a';
        c.fillRect(offX + col * cell, offY + r * cell, cell, cell);
        // cursor
        if (D.cursor.r === r && D.cursor.c === col) {
          c.strokeStyle = '#00e676'; c.lineWidth = 2;
          c.strokeRect(offX + col * cell + 1, offY + r * cell + 1, cell - 2, cell - 2);
        }
        // selected
        if (D.selected && D.selected.r === r && D.selected.c === col) {
          c.fillStyle = 'rgba(0,230,118,.35)';
          c.fillRect(offX + col * cell, offY + r * cell, cell, cell);
        }
        // possible moves
        D.moves.forEach(function (m) {
          if (m.tr === r && m.tc === col) {
            c.fillStyle = 'rgba(255,193,7,.4)';
            c.beginPath(); c.arc(offX + col * cell + 20, offY + r * cell + 20, 10, 0, Math.PI * 2); c.fill();
          }
        });
        var p = D.board[r][col];
        if (p) {
          c.fillStyle = p > 0 ? '#f5f5f5' : '#1a1a1a';
          c.beginPath(); c.arc(offX + col * cell + 20, offY + r * cell + 20, 14, 0, Math.PI * 2); c.fill();
          c.strokeStyle = p > 0 ? '#bbb' : '#00e676'; c.lineWidth = 2; c.stroke();
          if (Math.abs(p) === 2) {
            c.fillStyle = '#ffc107';
            c.font = 'bold 12px sans-serif'; c.textAlign = 'center';
            c.fillText('♔', offX + col * cell + 20, offY + r * cell + 24);
          }
        }
      }
    }
    c.fillStyle = '#90a4ae'; c.font = '11px Inter, sans-serif'; c.textAlign = 'center';
    c.fillText(D.turn === 1 ? 'Você (brancas)' : 'IA (pretas)', 160, 390);
  }

  /* Canvas click for damas */
  function onCanvasClick(e) {
    if (arcade.tipo !== 'damas' || !arcade.damas || arcade.damas.turn !== 1) return;
    var rect = arcade.canvas.getBoundingClientRect();
    var scaleX = arcade.canvas.width / rect.width;
    var scaleY = arcade.canvas.height / rect.height;
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
