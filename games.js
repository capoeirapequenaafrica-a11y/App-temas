/* Universo Capoeira — gerado a partir do index.html */
/* Não edite VERSAO: arquivo sem número de versão */
/* === games: arcade, tamagotchi, painéis === */
function abrirJogoArcade(tipo, nivelInicio) {
  /* Tamagotchi + Terreiro unificados no Mundo Aberto (melhor sistema) */
  if (tipo === 'tamagotchi') {
    if (typeof Simulador !== 'undefined' && Simulador.entrarMundoAberto) {
      Simulador.entrarMundoAberto();
    } else {
      abrirAba('tabSimulador');
    }
    return;
  }

  var nome = nomeJogadorArcade();
  /* permite jogar sem nome — usa "Jogador" */

  arcade.telaGrande = false;
  var wrap0 = $('arcadeCanvasWrap');
  var canvas0 = $('arcadeCanvas');
  var btn0 = $('btnArcadeExpand');
  if (wrap0) wrap0.style.maxWidth = '380px';
  if (canvas0) {
    canvas0.style.maxWidth = 'min(96vw, 360px)';
    canvas0.style.maxHeight = 'min(58vh, 440px)';
  }
  if (btn0) btn0.innerHTML = '<i class="fas fa-expand"></i>';
  /* esconde assistente e dicas para não interferir no jogo */
  try {
    var fab = $('assistenteFab'); if (fab) fab.style.display = 'none';
    var painel = $('assistentePainel'); if (painel) painel.classList.remove('aberto');
    var dica = $('dicaAssistentePrimeiroAcesso'); if (dica && dica.style.display !== 'none') { dica.dataset.wasShown = '1'; dica.style.display = 'none'; }
  } catch (e) {}
  var maxLib = nivelMaxDesbloqueado(tipo);
  var nv = Math.max(1, Math.min(maxLib, Number(nivelInicio) || 1));
  arcade.tipo = tipo;
  arcade.score = 0;
  arcade.nivel = nv;
  arcade.maxNivel = 10;
  arcade.progresso = 0;
  arcade.linesCleared = 0;
  arcade.pausado = false;
  arcade.rodando = true;
  arcade.powerFood = null;
  arcade.impulsoAte = 0;
  arcade._scoreUnlockFeito = false;
  var cfg = configNivelArcade(tipo, nv);
  arcade.objetivo = cfg.objetivo;
  aplicarModoNoArcade(tipo, nv);
  if (cfg.modo) {
    setTimeout(function () {
      mostrarToast('⚡ ' + cfg.modo.nome + ' — ' + (cfg.modo.desc || ''), 'ok');
    }, 400);
  } else if (cfg.cenario && cfg.cenario.nome) {
    setTimeout(function () {
      mostrarToast('Cenário: ' + cfg.cenario.nome);
    }, 350);
  }
  var ov = $('arcadeOverlay');
  if (ov) ov.style.display = 'flex';
  try { document.body.style.overflow = 'hidden'; } catch (e) {}
  var titulos = { pacman: 'Pac-Man', snake: 'Minhoca', corrida: 'Corrida', quebra: 'Quebra-Blocos', pulo: 'Pulo', surfe: 'Surfe', mario: 'Aventura', tamagotchi: 'Mascote Capoeira', damas: 'Damas' };
  if ($('arcadeTitulo')) $('arcadeTitulo').textContent = (titulos[tipo] || 'Jogo') + ' · Nv.' + nv;
  if ($('arcadeDica')) {
    var dicas = {
      pacman: '◀ ▶ ▲ ▼ fuja dos fantasmas · coma pastilhas e power pellets',
      corrida: 'Esquerda / Direita para desviar dos carros',
      tamagotchi: 'Escolha o personagem · alimente · alongue · treine · brinque',
      damas: 'Toque na peça · depois na casa · Capture · Dama promove no fim',
      snake: 'Dirija a minhoca · coma as maçãs',
      quebra: 'Mova a barra · quebre todos os blocos',
      pulo: 'Toque em Pular ou cima para evitar os canos',
      surfe: '◀ ▶ muda de faixa · ▲ ou Pular para saltar obstáculos',
      mario: '◀ ▶ corre · ▲ ou Pular · pegue moedas e chegue na bandeira'
    };
    $('arcadeDica').textContent = dicas[tipo] || 'Deslize ou use as setas';
  }
  var acoesT = $('arcadeAcoesTetris');
  if (acoesT) acoesT.style.display = 'none';
  var acoesP = $('arcadeAcoesPulo');
  if (acoesP) acoesP.style.display = (tipo === 'pulo' || tipo === 'surfe' || tipo === 'mario') ? 'flex' : 'none';
  var acoesG = $('arcadeAcoesGeral');
  if (acoesG) {
    acoesG.style.display = (tipo === 'snake' || tipo === 'corrida' || tipo === 'quebra' || tipo === 'pacman') ? 'flex' : 'none';
  }
  var acoesTama = $('arcadeAcoesTama');
  if (acoesTama) acoesTama.style.display = (tipo === 'tamagotchi') ? 'flex' : 'none';
  var acoesDamas = $('arcadeAcoesDamas');
  if (acoesDamas) acoesDamas.style.display = (tipo === 'damas') ? 'flex' : 'none';
  var dpad = document.querySelector('.arcade-dpad');
  if (dpad) dpad.style.display = (tipo === 'damas' || tipo === 'tamagotchi') ? 'none' : '';
  arcade.canvas = $('arcadeCanvas');
  if (!arcade.canvas) return;
  if (tipo === 'snake') {
    arcade.canvas.width = arcade.cols * arcade.grid;
    arcade.canvas.height = arcade.rows * arcade.grid;
  } else if (tipo === 'tetris') {
    arcade.canvas.width = arcade.tCols * arcade.tCell;
    arcade.canvas.height = arcade.tRows * arcade.tCell;
  } else if (tipo === 'pacman') {
    arcade.canvas.width = 336;
    arcade.canvas.height = 364;
  } else if (tipo === 'damas') {
    arcade.canvas.width = 320;
    arcade.canvas.height = 400;
  } else if (tipo === 'corrida' || tipo === 'quebra' || tipo === 'pulo' || tipo === 'surfe' || tipo === 'mario' || tipo === 'tamagotchi') {
    arcade.canvas.width = 280;
    arcade.canvas.height = 400;
  }
  arcade.ctx = arcade.canvas.getContext('2d');
  if (tipo === 'snake') initSnake();
  else if (tipo === 'corrida') initCorridaArcade();
  else if (tipo === 'quebra') initQuebra();
  else if (tipo === 'pulo') initPulo();
  else if (tipo === 'surfe') initSurfe();
  else if (tipo === 'mario') initMario();
  else if (tipo === 'pacman') initPacman();
  else if (tipo === 'tamagotchi') initTamagotchi();
  else if (tipo === 'damas') initDamas();
  if (arcade.timer) clearInterval(arcade.timer);
  var gamesComRampa = ['snake', 'tetris', 'pulo', 'quebra', 'mario', 'corrida', 'surfe', 'pacman'];
  arcade.rampaAtiva = gamesComRampa.indexOf(tipo) >= 0;
  arcade.velAlvo = cfg.velocidadeMs;
  arcade.velAtual = cfg.velocidadeMs; /* velocidade real desde o início */
  arcade.rampTick = 0;
  arcade.timer = setInterval(arcadeLoop, arcade.velAtual);
  window.removeEventListener('keydown', arcadeKeyHandler);
  window.addEventListener('keydown', arcadeKeyHandler);
  instalarSwipeArcade(arcade.canvas);
  instalarControlesArcadeTouch();
  atualizarHUDNivelArcade();
}

/* Controles multi-toque (2 dedos) — transparente e simultâneo — todos os jogos */
function instalarControlesArcadeTouch() {
  if (window._arcadeControlsOk) return;
  window._arcadeControlsOk = true;
  var bar = document.querySelector('.arcade-controls-bar');
  if (!bar) return;
  function btnFrom(e) {
    var t = e.target;
    while (t && t !== bar) {
      if (t.classList && t.classList.contains('arcade-btn')) return t;
      t = t.parentNode;
    }
    return null;
  }
  function press(btn, on) {
    if (!btn) return;
    if (on) btn.classList.add('arcade-pressed');
    else btn.classList.remove('arcade-pressed');
  }
  function handleStart(e) {
    var btn = btnFrom(e);
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    press(btn, true);
    var dir = btn.getAttribute('data-dir');
    var acao = btn.getAttribute('data-acao');
    if (dir) arcadeDir(dir);
    if (acao) arcadeAcao(acao);
  }
  function handleEnd(e) {
    var btn = btnFrom(e);
    if (!btn) return;
    e.preventDefault();
    press(btn, false);
  }
  bar.addEventListener('touchstart', handleStart, { passive: false });
  bar.addEventListener('touchend', handleEnd, { passive: false });
  bar.addEventListener('touchcancel', handleEnd, { passive: false });
  bar.addEventListener('mousedown', handleStart);
  bar.addEventListener('mouseup', handleEnd);
  bar.addEventListener('mouseleave', function () {
    bar.querySelectorAll('.arcade-pressed').forEach(function (b) { b.classList.remove('arcade-pressed'); });
  });
  bar.addEventListener('click', function (e) {
    if (btnFrom(e)) e.preventDefault();
  });
}

function togglePauseArcade() {
  if (!arcade.rodando) return;
  arcade.pausado = !arcade.pausado;
  var icon = $('iconArcadePause');
  var btn = $('btnArcadePause');
  var ov = $('arcadePauseOverlay');
  if (icon) icon.className = arcade.pausado ? 'fas fa-play' : 'fas fa-pause';
  if (btn) btn.classList.toggle('arcade-paused', !!arcade.pausado);
  if (ov) {
    if (arcade.pausado) ov.classList.add('visivel');
    else ov.classList.remove('visivel');
    ov.style.display = arcade.pausado ? 'flex' : 'none';
  }
}

function fecharJogoArcade() {
  var scoreFinal = arcade.score;
  var tipo = arcade.tipo;
  var nivelFinal = arcade.nivel || 1;
  arcade.rodando = false;
  arcade.pausado = false;
  try { damasPararOnline(); } catch (eOff) {}
  if (arcade.timer) { clearInterval(arcade.timer); arcade.timer = null; }
  window.removeEventListener('keydown', arcadeKeyHandler);
  try {
    var dpad = document.querySelector('.arcade-dpad');
    if (dpad) dpad.style.display = '';
    var ad = $('arcadeAcoesDamas'); if (ad) ad.style.display = 'none';
  } catch (e) {}
  var ov = $('arcadeOverlay');
  if (ov) ov.style.display = 'none';
  var pov = $('arcadePauseOverlay');
  if (pov) { pov.classList.remove('visivel'); pov.style.display = 'none'; }
  try { document.body.style.overflow = ''; } catch (e) {}
  /* restaura assistente e UI do app */
  try {
    var fab = $('assistenteFab'); if (fab) fab.style.display = '';
    var dica = $('dicaAssistentePrimeiroAcesso'); if (dica && dica.dataset.wasShown) dica.style.display = 'block';
  } catch (e) {}
  if (scoreFinal > 0 && tipo) {
    var pts = scoreFinal;
    if (tipo === 'snake') pts = Math.round(scoreFinal * 3);
    else if (tipo === 'tetris') pts = Math.round(scoreFinal / 2);
    else if (tipo === 'quebra') pts = Math.round(scoreFinal * 1.5);
    else if (tipo === 'pulo') pts = Math.round(scoreFinal * 2);
    else if (tipo === 'surfe') pts = Math.round(scoreFinal * 1.8);
    else if (tipo === 'mario') pts = Math.round(scoreFinal * 2);
    else if (tipo === 'pacman') pts = Math.round(scoreFinal * 1.2);
    else if (tipo === 'damas') pts = Math.round(scoreFinal * 1.5);
    /* bônus por nível alcançado (grátis) */
    pts = Math.round(pts * (1 + (nivelFinal - 1) * 0.12));
    pts = Math.max(5, Math.min(800, pts));
    var nome = nomeJogadorArcade();
    if (nome) {
      registrarPontosJogo(nome, pts, tipo).then(function () {
        mostrarToast('+' + pts + ' pts · nível ' + nivelFinal + ' (' + tipo + ')');
      });
    }
    salvarNivelArcade(tipo, nivelFinal);
    var nvScore = desbloqueioPorScoreNoFim(tipo, scoreFinal, nivelFinal);
    if (nvScore) {
      mostrarToast('🔓 Nível ' + nvScore + ' liberado por pontuação!');
    }
    try { registrarScoreDesafio(scoreFinal, tipo); } catch (e) {}
  } else if (desafioAtivoId) {
    try { registrarScoreDesafio(scoreFinal || 0, tipo); } catch (e) {}
  }
  arcade.tipo = null;
  try { renderSeletorNiveisArcade(); } catch (e) {}
}

function instalarSwipeArcade(canvas) {
  if (!canvas || canvas._swipeOk) return;
  canvas._swipeOk = true;
  var sx = 0, sy = 0, t0 = 0;
  canvas.addEventListener('touchstart', function (e) {
    if (!e.touches || !e.touches[0]) return;
    sx = e.touches[0].clientX;
    sy = e.touches[0].clientY;
    t0 = Date.now();
  }, { passive: true });
  canvas.addEventListener('touchend', function (e) {
    if (!e.changedTouches || !e.changedTouches[0]) return;
    var dx = e.changedTouches[0].clientX - sx;
    var dy = e.changedTouches[0].clientY - sy;
    var adx = Math.abs(dx), ady = Math.abs(dy);
    if (adx < 24 && ady < 24) {
      if (arcade.tipo === 'tetris') arcadeAcao('rotate');
      else if (arcade.tipo === 'pulo') arcadeAcao('jump');
      return;
    }
    if (adx > ady) arcadeDir(dx > 0 ? 'right' : 'left');
    else arcadeDir(dy > 0 ? 'down' : 'up');
  }, { passive: true });
}

function arcadeKeyHandler(e) {
  if (!arcade.rodando) return;
  var k = e.key;
  if (k === 'p' || k === 'P') { togglePauseArcade(); e.preventDefault(); return; }
  if (k === 'Escape') { fecharJogoArcade(); e.preventDefault(); return; }
  if (arcade.pausado) return; /* só P e Esc funcionam pausado */
  if (k === 'ArrowUp' || k === 'w' || k === 'W') { arcadeDir('up'); e.preventDefault(); }
  else if (k === 'ArrowDown' || k === 's' || k === 'S') { arcadeDir('down'); e.preventDefault(); }
  else if (k === 'ArrowLeft' || k === 'a' || k === 'A') { arcadeDir('left'); e.preventDefault(); }
  else if (k === 'ArrowRight' || k === 'd' || k === 'D') { arcadeDir('right'); e.preventDefault(); }
  else if (k === ' ' || k === 'Enter') {
    if (arcade.tipo === 'tetris') arcadeAcao('rotate');
    else if (arcade.tipo === 'pulo' || arcade.tipo === 'surfe' || arcade.tipo === 'mario') arcadeAcao('jump');
    e.preventDefault();
  }
}

function arcadeDir(d) {
  if (!arcade.rodando || arcade.pausado) return;
  if (arcade.tipo === 'snake') {
    var map = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
    var nd = map[d];
    if (!nd) return;
    if (nd.x === -arcade.dir.x && nd.y === -arcade.dir.y) return;
    arcade.nextDir = nd;
  } else if (arcade.tipo === 'tetris') {
    /* um passo por toque */
    if (d === 'left') moveTetris(-1, 0);
    else if (d === 'right') moveTetris(1, 0);
    else if (d === 'down') moveTetris(0, 1);
    else if (d === 'up') rotateTetris();
  } else if (arcade.tipo === 'corrida') {
    if (d === 'left') arcade.carX = Math.max(0, arcade.carX - 1);
    else if (d === 'right') arcade.carX = Math.min(2, arcade.carX + 1);
  } else if (arcade.tipo === 'quebra') {
    if (d === 'left') arcade.paddleX = Math.max(0, arcade.paddleX - 28);
    else if (d === 'right') arcade.paddleX = Math.min(arcade.canvas.width - arcade.paddleW, arcade.paddleX + 28);
  } else if (arcade.tipo === 'pulo') {
    if (d === 'up') puloJump();
  } else if (arcade.tipo === 'surfe') {
    if (d === 'left') arcade.surferLane = Math.max(0, arcade.surferLane - 1);
    else if (d === 'right') arcade.surferLane = Math.min(2, arcade.surferLane + 1);
    else if (d === 'up') surfeJump();
  } else if (arcade.tipo === 'mario') {
    if (d === 'left') arcade.marioVx = -4.2;
    else if (d === 'right') arcade.marioVx = 4.2;
    else if (d === 'up') marioJump();
  } else if (arcade.tipo === 'pacman') {
    if (d === 'left' || d === 'right' || d === 'up' || d === 'down') arcade.pacNext = d;
  }
}

function arcadeAcao(a) {
  if (!arcade.rodando) return;
  if (arcade.pausado) return;
  if (arcade.tipo === 'tamagotchi') {
    if (a === 'tama-feed') tamaAcao('feed');
    else if (a === 'tama-stretch') tamaAcao('stretch');
    else if (a === 'tama-train') tamaAcao('train');
    else if (a === 'tama-play') tamaAcao('play');
    else if (a === 'tama-trocar') tamaAcao('trocar');
    else if (a === 'tama-terreiro') tamaAcao('terreiro');
    return;
  }
  if (arcade.tipo === 'damas') {
    if (a === 'damas-ia') { arcade.damasModo = 'ia'; initDamas(); }
    else if (a === 'damas-2p') { arcade.damasModo = '2p'; initDamas(); }
    else if (a === 'damas-online-criar') { damasCriarSalaOnline(); }
    else if (a === 'damas-online-entrar') { damasEntrarSalaOnline(); }
    else if (a === 'damas-novo') {
      if (arcade.damasModo === 'online') damasPararOnline();
      initDamas();
    }
    return;
  }
  if (arcade.tipo === 'tetris') {
    if (a === 'rotate') rotateTetris();
    else if (a === 'drop') {
      while (moveTetris(0, 1)) {}
    }
  } else if (a === 'jump') {
    if (arcade.tipo === 'pulo') puloJump();
    else if (arcade.tipo === 'surfe') surfeJump();
    else if (arcade.tipo === 'mario') marioJump();
  }
}

function arcadeLoop() {
  if (!arcade.rodando || arcade.pausado) return;
  if (arcade.rampaAtiva && arcade.velAtual > arcade.velAlvo) {
    arcade.rampTick = (arcade.rampTick || 0) + 1;
    if (arcade.rampTick % 20 === 0) {
      var passo = Math.max(2, Math.round((arcade.velAtual - arcade.velAlvo) / 9));
      arcade.velAtual = Math.max(arcade.velAlvo, arcade.velAtual - passo);
      clearInterval(arcade.timer);
      arcade.timer = setInterval(arcadeLoop, arcade.velAtual);
    }
  }
  if (arcade.tipo === 'snake') tickSnake();
  else if (arcade.tipo === 'corrida') tickCorridaArcade();
  else if (arcade.tipo === 'quebra') tickQuebra();
  else if (arcade.tipo === 'pulo') tickPulo();
  else if (arcade.tipo === 'surfe') tickSurfe();
  else if (arcade.tipo === 'mario') tickMario();
  else if (arcade.tipo === 'pacman') tickPacman();
  else if (arcade.tipo === 'tamagotchi') tickTamagotchi();
  else if (arcade.tipo === 'damas') tickDamas();
  if ($('arcadePlacar')) $('arcadePlacar').textContent = String(arcade.score);
  try { verificarDesbloqueioPorScore(); } catch (e) {}
}

function initSnake() {
  aplicarModoNoArcade('snake', arcade.nivel || 1);
  var modo = arcade._modoEspecial;
  if (modo && modo.id === 'mestre') {
    arcade.cols = 14; arcade.rows = 18;
    if (arcade.canvas) {
      arcade.canvas.width = arcade.cols * arcade.grid;
      arcade.canvas.height = arcade.rows * arcade.grid;
    }
  } else {
    arcade.cols = arcade.cols || 18;
    arcade.rows = arcade.rows || 22;
  }
  arcade.snake = [{ x: 8, y: 12 }, { x: 7, y: 12 }, { x: 6, y: 12 }];
  arcade.dir = { x: 1, y: 0 };
  arcade.nextDir = { x: 1, y: 0 };
  arcade.poisonFood = null;
  spawnFood();
  if (modo && modo.id === 'dupla') spawnFoodExtra();
  if (modo && modo.id === 'turbo' && arcade.timer) {
    arcade.velAtual = Math.max(45, Math.round((arcade.velAlvo || 100) * 0.55));
    clearInterval(arcade.timer);
    arcade.timer = setInterval(arcadeLoop, arcade.velAtual);
  }
  drawSnake();
}
function spawnFoodExtra() {
  for (var t = 0; t < 30; t++) {
    var fx = Math.floor(Math.random() * arcade.cols), fy = 2 + Math.floor(Math.random() * (arcade.rows - 2));
    var livre = !arcade.snake.some(function (s) { return s.x === fx && s.y === fy; }) &&
      !(arcade.food && fx === arcade.food.x && fy === arcade.food.y);
    if (livre) { arcade.food2 = { x: fx, y: fy }; return; }
  }
}

function spawnFood() {
  var ok = false;
  while (!ok) {
    arcade.food = { x: Math.floor(Math.random() * arcade.cols), y: 2 + Math.floor(Math.random() * (arcade.rows - 2)) };
    ok = !arcade.snake.some(function (s) { return s.x === arcade.food.x && s.y === arcade.food.y; }) &&
      !(arcade.powerFood && arcade.powerFood.x === arcade.food.x && arcade.powerFood.y === arcade.food.y);
  }
  /* chance de surgir um item especial (poder), se não houver um ativo na tela */
  if (!arcade.powerFood && Math.random() < 0.25) {
    for (var tentativa = 0; tentativa < 25; tentativa++) {
      var px = Math.floor(Math.random() * arcade.cols), py = 2 + Math.floor(Math.random() * (arcade.rows - 2));
      var livre = !arcade.snake.some(function (s) { return s.x === px && s.y === py; }) &&
        !(px === arcade.food.x && py === arcade.food.y);
      if (livre) { arcade.powerFood = { x: px, y: py, expiraEm: Date.now() + 6500 }; break; }
    }
  }
}

function tickSnake() {
  arcade.dir = arcade.nextDir;
  var head = { x: arcade.snake[0].x + arcade.dir.x, y: arcade.snake[0].y + arcade.dir.y };
  var modo = arcade._modoEspecial;
  if (modo && modo.id === 'portal') {
    if (head.x < 0) head.x = arcade.cols - 1;
    if (head.x >= arcade.cols) head.x = 0;
    if (head.y < 0) head.y = arcade.rows - 1;
    if (head.y >= arcade.rows) head.y = 0;
  } else if (head.x < 0 || head.y < 0 || head.x >= arcade.cols || head.y >= arcade.rows) {
    gameOverArcade();
    return;
  }
  if (arcade.snake.some(function (s) { return s.x === head.x && s.y === head.y; })) {
    gameOverArcade();
    return;
  }
  arcade.snake.unshift(head);

  /* item especial expira sozinho se não for comido a tempo */
  if (arcade.powerFood && Date.now() > arcade.powerFood.expiraEm) {
    arcade.powerFood = null;
  }

  if (arcade.powerFood && head.x === arcade.powerFood.x && head.y === arcade.powerFood.y) {
    /* poder: cresce rápido (mais segmentos) e ganha impulso de velocidade por alguns segundos */
    for (var i = 0; i < 3; i++) { arcade.snake.push(arcade.snake[arcade.snake.length - 1]); }
    arcade.score += 25 + arcade.nivel * 3;
    arcade.powerFood = null;
    arcade.impulsoAte = Date.now() + 4000;
    if (arcade.rampaAtiva) {
      var velImpulso = Math.max(45, Math.round(arcade.velAlvo * 0.6));
      if (velImpulso < arcade.velAtual) {
        arcade.velAtual = velImpulso;
        clearInterval(arcade.timer);
        arcade.timer = setInterval(arcadeLoop, arcade.velAtual);
      }
    }
    registrarProgressoNivel(2);
    mostrarToast('⚡ Impulso! Crescimento e velocidade extra por alguns segundos.');
  } else if (arcade.poisonFood && head.x === arcade.poisonFood.x && head.y === arcade.poisonFood.y) {
    gameOverArcade();
    return;
  }
  var comeu = false;
  if (head.x === arcade.food.x && head.y === arcade.food.y) {
    arcade.score += 10 + arcade.nivel * 2;
    spawnFood();
    registrarProgressoNivel(1);
    comeu = true;
  }
  if (arcade.food2 && head.x === arcade.food2.x && head.y === arcade.food2.y) {
    arcade.score += 10 + arcade.nivel * 2;
    arcade.food2 = null;
    if (arcade._modoEspecial && arcade._modoEspecial.id === 'dupla') spawnFoodExtra();
    registrarProgressoNivel(1);
    comeu = true;
  }
  if (!comeu) {
    arcade.snake.pop();
  }
  /* modo veneno: ocasionalmente spawna comida roxa */
  if (arcade._modoEspecial && arcade._modoEspecial.id === 'veneno' && !arcade.poisonFood && Math.random() < 0.08) {
    for (var t = 0; t < 20; t++) {
      var px = Math.floor(Math.random() * arcade.cols), py = 2 + Math.floor(Math.random() * (arcade.rows - 2));
      var livre = !arcade.snake.some(function (s) { return s.x === px && s.y === py; });
      if (livre) { arcade.poisonFood = { x: px, y: py }; break; }
    }
  }

  /* fim do impulso: volta pra velocidade normal do nível */
  if (arcade.impulsoAte && Date.now() > arcade.impulsoAte) {
    arcade.impulsoAte = 0;
    if (arcade.rampaAtiva && arcade.velAtual !== arcade.velAlvo) {
      arcade.velAtual = arcade.velAlvo;
      clearInterval(arcade.timer);
      arcade.timer = setInterval(arcadeLoop, arcade.velAtual);
    }
  }

  drawSnake();
}

function drawSnake() {
  var ctx = arcade.ctx, g = arcade.grid, w = arcade.canvas.width, h = arcade.canvas.height;
  var cen = arcade._cenario || cenarioArcade('snake', arcade.nivel || 1);
  var corpoCor = (cen && cen.corpo) || '#00e676';
  /* fundo do cenário */
  pintarFundoCenario(ctx, w, h, cen);
  /* grade neon */
  ctx.strokeStyle = (cen && cen.grade) || 'rgba(0,230,118,0.07)';
  ctx.lineWidth = 1;
  for (var gx = 0; gx <= arcade.cols; gx++) {
    ctx.beginPath(); ctx.moveTo(gx * g, 0); ctx.lineTo(gx * g, h); ctx.stroke();
  }
  for (var gy = 0; gy <= arcade.rows; gy++) {
    ctx.beginPath(); ctx.moveTo(0, gy * g); ctx.lineTo(w, gy * g); ctx.stroke();
  }
  if (arcade.snake.length) {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    /* glow externo */
    ctx.shadowColor = corpoCor;
    ctx.shadowBlur = 12;
    ctx.strokeStyle = corpoCor;
    ctx.lineWidth = g - 2;
    ctx.beginPath();
    arcade.snake.forEach(function (s, idx) {
      var cx = s.x * g + g / 2, cy = s.y * g + g / 2;
      if (idx === 0) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);
    });
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = corpoCor;
    ctx.lineWidth = g - 6;
    ctx.beginPath();
    arcade.snake.forEach(function (s, idx) {
      var cx = s.x * g + g / 2, cy = s.y * g + g / 2;
      if (idx === 0) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);
    });
    ctx.stroke();
    ctx.strokeStyle = 'rgba(105,240,174,0.9)';
    ctx.lineWidth = g - 10;
    ctx.beginPath();
    arcade.snake.forEach(function (s, idx) {
      var cx = s.x * g + g / 2, cy = s.y * g + g / 2;
      if (idx === 0) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);
    });
    ctx.stroke();
    var head = arcade.snake[0];
    var hx = head.x * g + g / 2, hy = head.y * g + g / 2;
    ctx.shadowColor = '#69f0ae';
    ctx.shadowBlur = 10;
    var hg = ctx.createRadialGradient(hx - 2, hy - 2, 1, hx, hy, g / 2);
    hg.addColorStop(0, '#b9f6ca');
    hg.addColorStop(1, '#00c853');
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.arc(hx, hy, g / 2 - 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    var ex = arcade.dir.x * 3, ey = arcade.dir.y * 3;
    var ox1 = arcade.dir.y * 3, oy1 = -arcade.dir.x * 3;
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(hx + ex + ox1 * 0.5, hy + ey + oy1 * 0.5, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(hx + ex - ox1 * 0.5, hy + ey - oy1 * 0.5, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0a1a10';
    ctx.beginPath(); ctx.arc(hx + ex + ox1 * 0.5 + arcade.dir.x, hy + ey + oy1 * 0.5 + arcade.dir.y, 1.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(hx + ex - ox1 * 0.5 + arcade.dir.x, hy + ey - oy1 * 0.5 + arcade.dir.y, 1.2, 0, Math.PI * 2); ctx.fill();
  }
  /* energia / comida tech */
  var fx = arcade.food.x * g + g / 2, fy = arcade.food.y * g + g / 2;
  ctx.shadowColor = '#ff5252';
  ctx.shadowBlur = 14;
  var fg = ctx.createRadialGradient(fx - 2, fy - 2, 1, fx, fy, g / 2);
  fg.addColorStop(0, '#ff8a80');
  fg.addColorStop(0.5, '#ff1744');
  fg.addColorStop(1, '#b71c1c');
  ctx.fillStyle = fg;
  ctx.beginPath();
  ctx.arc(fx, fy, g / 2 - 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath();
  ctx.arc(fx - 2, fy - 2, 2.5, 0, Math.PI * 2);
  ctx.fill();
  /* item especial (poder): pisca em dourado, cresce e some sozinho após alguns segundos */
  if (arcade.powerFood) {
    var px = arcade.powerFood.x * g + g / 2, py = arcade.powerFood.y * g + g / 2;
    var piscar = 0.65 + 0.35 * Math.sin(Date.now() / 90);
    ctx.save();
    ctx.globalAlpha = piscar;
    ctx.shadowColor = '#ffd600';
    ctx.shadowBlur = 18;
    var pg = ctx.createRadialGradient(px - 2, py - 2, 1, px, py, g / 2 + 1);
    pg.addColorStop(0, '#fff9c4');
    pg.addColorStop(0.5, '#ffd600');
    pg.addColorStop(1, '#ff8f00');
    ctx.fillStyle = pg;
    ctx.beginPath();
    ctx.arc(px, py, g / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.shadowBlur = 0;
  }
  if (arcade.food2) {
    var f2x = arcade.food2.x * g + g / 2, f2y = arcade.food2.y * g + g / 2;
    ctx.fillStyle = '#ffc107';
    ctx.beginPath(); ctx.arc(f2x, f2y, g / 2 - 1, 0, Math.PI * 2); ctx.fill();
  }
  if (arcade.poisonFood) {
    var pox = arcade.poisonFood.x * g + g / 2, poy = arcade.poisonFood.y * g + g / 2;
    ctx.fillStyle = '#9c27b0';
    ctx.beginPath(); ctx.arc(pox, poy, g / 2 - 1, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('☠', pox, poy + 3);
  }
  desenharBannerModo(ctx, w, arcade._modoEspecial, arcade._cenario);
  desenharHUDArcade(ctx, w, 'MINHOCA');
}

function initTetris() {
  arcade.board = [];
  for (var r = 0; r < arcade.tRows; r++) {
    arcade.board[r] = [];
    for (var c = 0; c < arcade.tCols; c++) arcade.board[r][c] = 0;
  }
  spawnTetris();
  drawTetris();
}

function spawnTetris() {
  var keys = Object.keys(TETRIS_SHAPES);
  var k = keys[Math.floor(Math.random() * keys.length)];
  arcade.piece = {
    shape: TETRIS_SHAPES[k].map(function (row) { return row.slice(); }),
    color: TETRIS_COLORS[k],
    x: Math.floor(arcade.tCols / 2) - 1,
    y: 0
  };
  if (colisaoTetris(0, 0, arcade.piece.shape)) {
    gameOverArcade();
  }
}

function colisaoTetris(dx, dy, shape) {
  shape = shape || arcade.piece.shape;
  for (var r = 0; r < shape.length; r++) {
    for (var c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      var nx = arcade.piece.x + c + dx;
      var ny = arcade.piece.y + r + dy;
      if (nx < 0 || nx >= arcade.tCols || ny >= arcade.tRows) return true;
      if (ny >= 0 && arcade.board[ny][nx]) return true;
    }
  }
  return false;
}

function mergeTetris() {
  var sh = arcade.piece.shape;
  for (var r = 0; r < sh.length; r++) {
    for (var c = 0; c < sh[r].length; c++) {
      if (!sh[r][c]) continue;
      var y = arcade.piece.y + r;
      var x = arcade.piece.x + c;
      if (y >= 0) arcade.board[y][x] = arcade.piece.color;
    }
  }
  var lines = 0;
  for (var row = arcade.tRows - 1; row >= 0; row--) {
    if (arcade.board[row].every(function (cell) { return cell; })) {
      arcade.board.splice(row, 1);
      arcade.board.unshift([]);
      for (var i = 0; i < arcade.tCols; i++) arcade.board[0][i] = 0;
      lines++;
      row++;
    }
  }
  if (lines) {
    arcade.score += lines * (100 + arcade.nivel * 15);
    arcade.linesCleared = (arcade.linesCleared || 0) + lines;
    registrarProgressoNivel(lines);
  }
  spawnTetris();
}

function moveTetris(dx, dy) {
  if (colisaoTetris(dx, dy)) {
    if (dy > 0) mergeTetris();
    return false;
  }
  arcade.piece.x += dx;
  arcade.piece.y += dy;
  drawTetris();
  return true;
}

function rotateTetris() {
  var sh = arcade.piece.shape;
  var rotated = [];
  var rows = sh.length, cols = sh[0].length;
  for (var c = 0; c < cols; c++) {
    rotated[c] = [];
    for (var r = rows - 1; r >= 0; r--) rotated[c].push(sh[r][c]);
  }
  /* Wall-kick */
  if (!colisaoTetris(0, 0, rotated)) {
    arcade.piece.shape = rotated;
    drawTetris();
  } else if (!colisaoTetris(-1, 0, rotated)) {
    arcade.piece.x -= 1;
    arcade.piece.shape = rotated;
    drawTetris();
  } else if (!colisaoTetris(1, 0, rotated)) {
    arcade.piece.x += 1;
    arcade.piece.shape = rotated;
    drawTetris();
  } else if (!colisaoTetris(-2, 0, rotated)) {
    arcade.piece.x -= 2;
    arcade.piece.shape = rotated;
    drawTetris();
  } else if (!colisaoTetris(2, 0, rotated)) {
    arcade.piece.x += 2;
    arcade.piece.shape = rotated;
    drawTetris();
  }
}

function tickTetris() {
  moveTetris(0, 1);
}

function desenharBlocoTetris(ctx, x, y, cs, cor) {
  var pad = 1.5;
  var g = ctx.createLinearGradient(x, y, x + cs, y + cs);
  g.addColorStop(0, cor);
  g.addColorStop(0.45, cor);
  g.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = g;
  ctx.fillRect(x + pad, y + pad, cs - pad * 2, cs - pad * 2);
  /* brilho tech */
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillRect(x + pad + 1, y + pad + 1, cs - pad * 2 - 4, 3);
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + pad, y + pad, cs - pad * 2, cs - pad * 2);
  /* neon sutil */
  ctx.shadowColor = cor;
  ctx.shadowBlur = 4;
  ctx.strokeStyle = cor;
  ctx.globalAlpha = 0.35;
  ctx.strokeRect(x + pad, y + pad, cs - pad * 2, cs - pad * 2);
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
}

function drawTetris() {
  var ctx = arcade.ctx, cs = arcade.tCell, w = arcade.canvas.width, h = arcade.canvas.height;
  var bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#050d18');
  bg.addColorStop(0.5, '#0a1628');
  bg.addColorStop(1, '#040a12');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  /* grade tech */
  ctx.strokeStyle = 'rgba(0,210,255,0.12)';
  ctx.lineWidth = 1;
  for (var c = 0; c <= arcade.tCols; c++) {
    ctx.beginPath(); ctx.moveTo(c * cs, 0); ctx.lineTo(c * cs, h); ctx.stroke();
  }
  for (var r = 0; r <= arcade.tRows; r++) {
    ctx.beginPath(); ctx.moveTo(0, r * cs); ctx.lineTo(w, r * cs); ctx.stroke();
  }
  /* linha de base neon */
  ctx.strokeStyle = 'rgba(0,230,118,0.25)';
  ctx.beginPath();
  ctx.moveTo(0, h - 1); ctx.lineTo(w, h - 1);
  ctx.stroke();
  for (var r2 = 0; r2 < arcade.tRows; r2++) {
    for (var c2 = 0; c2 < arcade.tCols; c2++) {
      if (arcade.board[r2][c2]) {
        desenharBlocoTetris(ctx, c2 * cs, r2 * cs, cs, arcade.board[r2][c2]);
      }
    }
  }
  if (arcade.piece) {
    var sh = arcade.piece.shape;
    for (var r3 = 0; r3 < sh.length; r3++) {
      for (var c3 = 0; c3 < sh[r3].length; c3++) {
        if (sh[r3][c3]) {
          desenharBlocoTetris(ctx, (arcade.piece.x + c3) * cs, (arcade.piece.y + r3) * cs, cs, arcade.piece.color);
        }
      }
    }
  }
  desenharHUDArcade(ctx, w, 'TETRIS');
}

function initCorridaArcade() {
  aplicarModoNoArcade('corrida', arcade.nivel || 1);
  var cfg = configNivelArcade('corrida', arcade.nivel || 1);
  arcade.carX = 1;
  arcade.obstacles = [];
  arcade.speed = cfg.speedBase || 3.2;
  arcade.frame = 0;
  /* não zera score se estiver subindo de nível na mesma partida */
  if (!arcade._keepScoreOnLevel) arcade.score = 0;
  arcade._keepScoreOnLevel = false;
  arcade._spawnEvery = cfg.spawnEvery || 25;
  arcade._lastScoreNivel = arcade.score || 0;
  arcade._cenario = cfg.cenario || cenarioArcade('corrida', arcade.nivel || 1);
  if (arcade._modoEspecial && (arcade._modoEspecial.id === 'trafego' || arcade._modoEspecial.id === 'mestre')) {
    arcade._spawnMul = 0.6;
  } else { arcade._spawnMul = 1; }
  if (arcade._modoEspecial && (arcade._modoEspecial.id === 'turbo' || arcade._modoEspecial.id === 'mestre')) {
    arcade.speed = (arcade.speed || cfg.speedBase) * 1.2;
  }
  drawCorridaArcade();
}

function tickCorridaArcade() {
  arcade.frame++;
  var spawnEvery = arcade._spawnEvery || 25;
  if (arcade.frame % spawnEvery === 0) {
    arcade.obstacles.push({ lane: Math.floor(Math.random() * 3), y: -30 });
    /* em níveis altos às vezes 2 obstáculos */
    if (arcade.nivel >= 6 && Math.random() < 0.35) {
      var outra = Math.floor(Math.random() * 3);
      if (outra !== arcade.obstacles[arcade.obstacles.length - 1].lane) {
        arcade.obstacles.push({ lane: outra, y: -70 });
      }
    }
  }
  if (arcade.frame % 180 === 0) arcade.speed = Math.min(14, arcade.speed + 0.35);
  for (var i = arcade.obstacles.length - 1; i >= 0; i--) {
    arcade.obstacles[i].y += arcade.speed;
    if (arcade.obstacles[i].y > arcade.canvas.height) {
      arcade.obstacles.splice(i, 1);
      arcade.score += 5 + Math.floor(arcade.nivel / 2);
    } else if (arcade.obstacles[i].y > arcade.canvas.height - 70 && arcade.obstacles[i].y < arcade.canvas.height - 20 &&
               arcade.obstacles[i].lane === arcade.carX) {
      gameOverArcade();
      return;
    }
  }
  /* progresso de nível pela pontuação acumulada no nível */
  var ganho = arcade.score - (arcade._lastScoreNivel || 0);
  if (ganho > 0) {
    arcade._lastScoreNivel = arcade.score;
    registrarProgressoNivel(ganho);
  }
  drawCorridaArcade();
}

function desenharCarroArcade(ctx, x, y, bw, bh, cor1, cor2) {
  /* carro mais realista: carroceria, teto, rodas, faróis */
  ctx.fillStyle = '#111';
  ctx.fillRect(x + 4, y + bh - 8, 8, 7);
  ctx.fillRect(x + bw - 12, y + bh - 8, 8, 7);
  ctx.fillRect(x + 4, y + 2, 8, 7);
  ctx.fillRect(x + bw - 12, y + 2, 8, 7);
  var g = ctx.createLinearGradient(x, y, x + bw, y + bh);
  g.addColorStop(0, cor1);
  g.addColorStop(1, cor2);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x + 6, y + bh - 6);
  ctx.lineTo(x + 4, y + 14);
  ctx.lineTo(x + 10, y + 4);
  ctx.lineTo(x + bw - 10, y + 4);
  ctx.lineTo(x + bw - 4, y + 14);
  ctx.lineTo(x + bw - 6, y + bh - 6);
  ctx.closePath();
  ctx.fill();
  /* teto / vidro */
  ctx.fillStyle = 'rgba(180,220,255,0.55)';
  ctx.fillRect(x + 12, y + 10, bw - 24, 12);
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fillRect(x + 12, y + 10, bw - 24, 4);
  /* faróis */
  ctx.fillStyle = '#fff59d';
  ctx.fillRect(x + 8, y + 4, 7, 4);
  ctx.fillRect(x + bw - 15, y + 4, 7, 4);
  /* lanterna traseira */
  ctx.fillStyle = '#ff5252';
  ctx.fillRect(x + 8, y + bh - 10, 6, 4);
  ctx.fillRect(x + bw - 14, y + bh - 10, 6, 4);
}

function drawCorridaArcade() {
  var ctx = arcade.ctx;
  var w = arcade.canvas.width, h = arcade.canvas.height;
  var cen = arcade._cenario || cenarioArcade('corrida', arcade.nivel || 1);
  var ceu0 = (cen.ceu && cen.ceu[0]) || '#0a1628';
  var ceu1 = (cen.ceu && cen.ceu[1]) || '#1a1a1a';
  var asf = cen.asfalto || '#1c2333';
  var neon = cen.neon || '#00e676';
  /* fundo do cenário do nível (sem muitos gradients = menos lag) */
  ctx.fillStyle = ceu0;
  ctx.fillRect(0, 0, w, h * 0.35);
  ctx.fillStyle = ceu1;
  ctx.fillRect(0, h * 0.35, w, h * 0.65);
  ctx.fillStyle = asf;
  ctx.fillRect(8, 0, w - 16, h);
  ctx.fillStyle = neon;
  ctx.globalAlpha = 0.4;
  ctx.fillRect(0, 0, 6, h);
  ctx.fillRect(w - 6, 0, 6, h);
  ctx.globalAlpha = 1;
  var laneW = w / 3;
  var offset = (arcade.frame * arcade.speed * 2) % 30;
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 2;
  ctx.setLineDash([14, 12]);
  ctx.lineDashOffset = -offset;
  ctx.beginPath();
  ctx.moveTo(laneW, 0); ctx.lineTo(laneW, h);
  ctx.moveTo(laneW * 2, 0); ctx.lineTo(laneW * 2, h);
  ctx.stroke();
  ctx.setLineDash([]);
  var coresRivais = [['#ef5350', '#b71c1c'], ['#42a5f5', '#0d47a1'], ['#ab47bc', '#6a1b9a'], ['#ff9800', '#e65100']];
  (arcade.obstacles || []).forEach(function (o, idx) {
    var x = o.lane * laneW + 12;
    var bw = laneW - 24, bh = 40;
    var c = coresRivais[idx % coresRivais.length];
    desenharCarroArcade(ctx, x, o.y, bw, bh, c[0], c[1]);
  });
  var px = arcade.carX * laneW + 14;
  var py = h - 64;
  desenharCarroArcade(ctx, px, py, laneW - 28, 46, '#69f0ae', '#00c853');
  desenharHUDArcade(ctx, w, (cen.nome || 'CORRIDA').toUpperCase().slice(0, 14));
}

/* ===== Quebra-Blocos ===== */
function initQuebra() {
  aplicarModoNoArcade('quebra', arcade.nivel || 1);
  var w = arcade.canvas.width, h = arcade.canvas.height;
  var modo = arcade._modoEspecial;
  var cen = arcade._cenario || cenarioArcade('quebra', arcade.nivel || 1);
  arcade.paddleW = (modo && modo.id === 'mini') ? 42 : 70;
  arcade.paddleX = (w - arcade.paddleW) / 2;
  var curvaQuebra = curvaDificuldade(arcade.nivel);
  var velMul = (modo && modo.id === 'rapida') ? 1.45 : ((modo && modo.id === 'mestre') ? 1.6 : 1);
  arcade.ball = { x: w / 2, y: h - 50, vx: +(1.8 + 2.4 * curvaQuebra).toFixed(2) * velMul, vy: -(2.1 + 2.0 * curvaQuebra) * velMul, r: 6 };
  arcade._quebraPtsMul = (modo && modo.id === 'dupla') ? 2 : 1;
  arcade.bricks = [];
  var cols = 6, rows = 3 + Math.round(3 * curvaQuebra);
  if (modo && (modo.id === 'muro' || modo.id === 'mestre')) rows += 2;
  var bw = (w - 20) / cols, bh = 14;
  var cores = (cen && cen.cores) || ['#ef5350', '#ff9800', '#ffc107', '#00e676', '#42a5f5', '#ab47bc'];
  for (var r = 0; r < rows; r++) {
    for (var c = 0; c < cols; c++) {
      arcade.bricks.push({ x: 10 + c * bw, y: 36 + r * (bh + 4), w: bw - 4, h: bh, vivo: true, cor: cores[(r + c) % cores.length] });
    }
  }
  drawQuebra();
}

function tickQuebra() {
  var b = arcade.ball, w = arcade.canvas.width, h = arcade.canvas.height;
  b.x += b.vx; b.y += b.vy;
  if (b.x < b.r || b.x > w - b.r) b.vx *= -1;
  if (b.y < b.r) b.vy *= -1;
  if (b.y > h - 18 && b.x > arcade.paddleX && b.x < arcade.paddleX + arcade.paddleW) {
    b.vy = -Math.abs(b.vy);
    b.vx += (b.x - (arcade.paddleX + arcade.paddleW / 2)) * 0.08;
  }
  if (b.y > h + 10) { gameOverArcade(); return; }
  arcade.bricks.forEach(function (br) {
    if (!br.vivo) return;
    if (b.x > br.x && b.x < br.x + br.w && b.y > br.y && b.y < br.y + br.h) {
      br.vivo = false;
      b.vy *= -1;
      arcade.score += 15 * (arcade._quebraPtsMul || 1);
      registrarProgressoNivel(1);
    }
  });
  if (arcade.bricks.every(function (br) { return !br.vivo; })) {
    initQuebra();
  }
  drawQuebra();
}

function drawQuebra() {
  var ctx = arcade.ctx, w = arcade.canvas.width, h = arcade.canvas.height;
  var cen = arcade._cenario || cenarioArcade('quebra', arcade.nivel || 1);
  pintarFundoCenario(ctx, w, h, cen);
  /* estrelas de fundo */
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  for (var s = 0; s < 20; s++) {
    ctx.fillRect((s * 37) % w, (s * 53) % (h - 40) + 30, 2, 2);
  }
  arcade.bricks.forEach(function (br) {
    if (!br.vivo) return;
    var g = ctx.createLinearGradient(br.x, br.y, br.x, br.y + br.h);
    g.addColorStop(0, br.cor);
    g.addColorStop(1, 'rgba(0,0,0,0.35)');
    ctx.fillStyle = g;
    ctx.fillRect(br.x, br.y, br.w, br.h);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(br.x + 1, br.y + 1, br.w - 2, 3);
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.strokeRect(br.x, br.y, br.w, br.h);
  });
  /* raquete */
  var pg = ctx.createLinearGradient(arcade.paddleX, h - 16, arcade.paddleX, h - 6);
  pg.addColorStop(0, '#69f0ae');
  pg.addColorStop(1, '#00c853');
  ctx.fillStyle = pg;
  ctx.fillRect(arcade.paddleX, h - 16, arcade.paddleW, 11);
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillRect(arcade.paddleX + 4, h - 14, arcade.paddleW - 8, 3);
  /* bola com brilho */
  var ballG = ctx.createRadialGradient(arcade.ball.x - 2, arcade.ball.y - 2, 1, arcade.ball.x, arcade.ball.y, arcade.ball.r);
  ballG.addColorStop(0, '#fff');
  ballG.addColorStop(1, '#90caf9');
  ctx.fillStyle = ballG;
  ctx.beginPath();
  ctx.arc(arcade.ball.x, arcade.ball.y, arcade.ball.r, 0, Math.PI * 2);
  ctx.fill();
  desenharBannerModo(ctx, w, arcade._modoEspecial, arcade._cenario);
  desenharHUDArcade(ctx, w, 'QUEBRA');
}

/* ===== Pulo (estilo flappy) ===== */
function initPulo() {
  aplicarModoNoArcade('pulo', arcade.nivel || 1);
  var h = arcade.canvas.height;
  arcade.bird = { x: 50, y: h / 2, vy: 0, r: 12 };
  arcade.pipes = [];
  arcade.frame = 0;
  arcade._passed = 0;
  drawPulo();
}

function puloJump() {
  if (!arcade.rodando || arcade.tipo !== 'pulo') return;
  arcade.bird.vy = -5.2;
}

function tickPulo() {
  var w = arcade.canvas.width, h = arcade.canvas.height;
  var bird = arcade.bird;
  arcade.frame++;
  var modo = arcade._modoEspecial;
  var grav = (modo && modo.id === 'baixo') ? 0.38 : ((modo && modo.id === 'mestre') ? 0.34 : 0.28);
  bird.vy += grav;
  bird.y += bird.vy;
  if (bird.y < 0 || bird.y > h) { gameOverArcade(); return; }
  var curvaPulo = curvaDificuldade(arcade.nivel);
  var gap = Math.max(95, Math.round(160 - 65 * curvaPulo));
  if (modo && (modo.id === 'estreito' || modo.id === 'mestre')) gap = Math.max(78, gap - 28);
  var spawnEvery = Math.max(55, Math.round(120 - 65 * curvaPulo));
  if (modo && (modo.id === 'vento' || modo.id === 'mestre')) spawnEvery = Math.max(40, Math.round(spawnEvery * 0.7));
  if (arcade.frame % spawnEvery === 0) {
    var top = 40 + Math.random() * (h - gap - 100);
    if (modo && modo.id === 'caos') top = 30 + Math.random() * (h - gap - 80);
    arcade.pipes.push({ x: w + 10, top: top, gap: gap, passed: false });
  }
  for (var i = arcade.pipes.length - 1; i >= 0; i--) {
    var p = arcade.pipes[i];
    var spd = 1.5 + 2.0 * curvaPulo;
    if (modo && (modo.id === 'vento' || modo.id === 'mestre')) spd *= 1.25;
    p.x -= spd;
    if (!p.passed && p.x + 36 < bird.x) {
      p.passed = true;
      arcade.score += 10;
      registrarProgressoNivel(1);
    }
    if (p.x < -50) arcade.pipes.splice(i, 1);
    else {
      var hitX = bird.x + bird.r > p.x && bird.x - bird.r < p.x + 36;
      var hitY = bird.y - bird.r < p.top || bird.y + bird.r > p.top + p.gap;
      if (hitX && hitY) { gameOverArcade(); return; }
    }
  }
  drawPulo();
}

function drawPulo() {
  var ctx = arcade.ctx, w = arcade.canvas.width, h = arcade.canvas.height;
  var cen = arcade._cenario || cenarioArcade('pulo', arcade.nivel || 1);
  if (cen && cen.bg) {
    pintarFundoCenario(ctx, w, h, cen);
  } else {
    var sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#0277bd');
    sky.addColorStop(0.5, '#4fc3f7');
    sky.addColorStop(1, '#b3e5fc');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);
  }
  var canoCor = (cen && cen.cano) || '#00c853';
  /* nuvens */
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  var sc = (arcade.frame || 0) * 0.5;
  for (var i = 0; i < 3; i++) {
    var cx = ((i * 100 - sc) % (w + 60)) - 30;
    ctx.beginPath();
    ctx.ellipse(cx, 40 + i * 25, 28, 12, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 18, 42 + i * 25, 20, 10, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  /* chão */
  var gr = ctx.createLinearGradient(0, h - 28, 0, h);
  gr.addColorStop(0, '#7cb342');
  gr.addColorStop(1, '#33691e');
  ctx.fillStyle = gr;
  ctx.fillRect(0, h - 28, w, 28);
  ctx.fillStyle = '#8d6e63';
  ctx.fillRect(0, h - 28, w, 4);
  arcade.pipes.forEach(function (p) {
    var pg = ctx.createLinearGradient(p.x, 0, p.x + 36, 0);
    pg.addColorStop(0, '#1b5e20');
    pg.addColorStop(0.5, '#43a047');
    pg.addColorStop(1, '#2e7d32');
    ctx.fillStyle = pg;
    ctx.fillRect(p.x, 0, 36, p.top);
    ctx.fillRect(p.x, p.top + p.gap, 36, h - (p.top + p.gap) - 28);
    ctx.fillStyle = canoCor;
    ctx.fillRect(p.x - 3, p.top - 14, 42, 14);
    ctx.fillRect(p.x - 3, p.top + p.gap, 42, 14);
  });
  var b = arcade.bird;
  /* asa */
  ctx.fillStyle = '#ffa000';
  ctx.beginPath();
  ctx.ellipse(b.x - 2, b.y + 2, 8, 5, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffc107';
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(b.x + 4, b.y - 3, 3.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath(); ctx.arc(b.x + 5, b.y - 3, 1.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ff7043';
  ctx.beginPath();
  ctx.moveTo(b.x + b.r - 2, b.y);
  ctx.lineTo(b.x + b.r + 7, b.y + 2);
  ctx.lineTo(b.x + b.r - 2, b.y + 5);
  ctx.fill();
  desenharBannerModo(ctx, w, arcade._modoEspecial, arcade._cenario);
  desenharHUDArcade(ctx, w, 'PULO');
}

/* ===== Surfe (estilo Subway Surfers / corrida com pulo) ===== */
function initSurfe() {
  aplicarModoNoArcade('surfe', arcade.nivel || 1);
  var cfg = configNivelArcade('surfe', arcade.nivel || 1);
  arcade.surferLane = 1;
  arcade.surferY = 0;
  arcade.surferVy = 0;
  arcade.surferOnGround = true;
  arcade.surfeObst = [];
  arcade.surfeCoins = [];
  arcade.frame = 0;
  arcade.speed = cfg.speedBase || 3.5;
  arcade.score = 0;
  arcade._lastScoreNivel = 0;
  /* prédios laterais (cenário) */
  arcade.surfeBuildingsL = [];
  arcade.surfeBuildingsR = [];
  for (var i = 0; i < 8; i++) {
    arcade.surfeBuildingsL.push({ z: 0.15 + i * 0.12, h: 40 + Math.random() * 90, hue: 200 + Math.random() * 40 });
    arcade.surfeBuildingsR.push({ z: 0.1 + i * 0.12, h: 35 + Math.random() * 100, hue: 200 + Math.random() * 40 });
  }
  drawSurfe();
}

function surfeJump() {
  if (!arcade.rodando || arcade.tipo !== 'surfe') return;
  if (arcade.surferOnGround) {
    arcade.surferVy = -9.5;
    arcade.surferOnGround = false;
  }
}

function tickSurfe() {
  var w = arcade.canvas.width, h = arcade.canvas.height;
  arcade.frame++;
  arcade.speed = Math.min(11, (configNivelArcade('surfe', arcade.nivel).speedBase || 3.5) + arcade.frame * 0.002);
  /* gravidade do pulo */
  if (!arcade.surferOnGround) {
    arcade.surferVy += 0.55;
    arcade.surferY += arcade.surferVy;
    if (arcade.surferY >= 0) {
      arcade.surferY = 0;
      arcade.surferVy = 0;
      arcade.surferOnGround = true;
    }
  }
  /* spawn obstáculos e moedas */
  if (arcade.frame % Math.max(24, Math.round(60 - 36 * curvaDificuldade(arcade.nivel))) === 0) {
    var lane = Math.floor(Math.random() * 3);
    var tipo = Math.random() < 0.55 ? 'barreira' : 'bloco';
    arcade.surfeObst.push({ lane: lane, z: 1, tipo: tipo });
  }
  if (arcade.frame % 18 === 0) {
    arcade.surfeCoins.push({ lane: Math.floor(Math.random() * 3), z: 1 });
  }
  var groundY = h - 70;
  /* mover obstáculos */
  for (var i = arcade.surfeObst.length - 1; i >= 0; i--) {
    var o = arcade.surfeObst[i];
    o.z -= arcade.speed * 0.012;
    if (o.z < 0.08) {
      arcade.surfeObst.splice(i, 1);
      arcade.score += 3;
      continue;
    }
    /* colisão perto do jogador */
    if (o.z < 0.22 && o.z > 0.12 && o.lane === arcade.surferLane) {
      if (o.tipo === 'barreira' && arcade.surferY > -28) {
        gameOverArcade();
        return;
      }
      if (o.tipo === 'bloco' && arcade.surferY > -40) {
        gameOverArcade();
        return;
      }
    }
  }
  for (var j = arcade.surfeCoins.length - 1; j >= 0; j--) {
    var c = arcade.surfeCoins[j];
    c.z -= arcade.speed * 0.012;
    if (c.z < 0.08) { arcade.surfeCoins.splice(j, 1); continue; }
    if (c.z < 0.22 && c.z > 0.12 && c.lane === arcade.surferLane && arcade.surferY > -50) {
      arcade.score += 8;
      arcade.surfeCoins.splice(j, 1);
    }
  }
  if (arcade.frame % 8 === 0) arcade.score += 1;
  var ganho = arcade.score - (arcade._lastScoreNivel || 0);
  if (ganho > 0) {
    arcade._lastScoreNivel = arcade.score;
    registrarProgressoNivel(ganho);
  }
  drawSurfe();
}

function drawSurfe() {
  var ctx = arcade.ctx, w = arcade.canvas.width, h = arcade.canvas.height;
  var horizon = h * 0.32;
  var scroll = (arcade.frame || 0) * (arcade.speed || 3) * 0.4;

  /* céu degradê realista */
  var sky = ctx.createLinearGradient(0, 0, 0, horizon + 30);
  sky.addColorStop(0, '#0d47a1');
  sky.addColorStop(0.35, '#1976d2');
  sky.addColorStop(0.7, '#64b5f6');
  sky.addColorStop(1, '#bbdefb');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, horizon + 30);

  /* sol */
  var sx = w * 0.78, sy = horizon * 0.35;
  var sun = ctx.createRadialGradient(sx, sy, 2, sx, sy, 28);
  sun.addColorStop(0, '#fffde7');
  sun.addColorStop(0.4, '#ffe082');
  sun.addColorStop(1, 'rgba(255,200,50,0)');
  ctx.fillStyle = sun;
  ctx.beginPath(); ctx.arc(sx, sy, 28, 0, Math.PI * 2); ctx.fill();

  /* nuvens */
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  for (var n = 0; n < 4; n++) {
    var nx = ((n * 70 - scroll * 0.15) % (w + 80)) - 40;
    var ny = 18 + (n % 3) * 16;
    ctx.beginPath();
    ctx.ellipse(nx, ny, 22, 10, 0, 0, Math.PI * 2);
    ctx.ellipse(nx + 14, ny + 2, 16, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  /* silhueta de cidade no horizonte */
  ctx.fillStyle = '#1a237e';
  for (var b = 0; b < 14; b++) {
    var bx = b * (w / 13) - 5;
    var bh = 18 + (Math.sin(b * 1.7 + 2) * 0.5 + 0.5) * 36;
    ctx.fillRect(bx, horizon - bh + 8, w / 12, bh);
  }
  ctx.fillStyle = '#283593';
  for (var b2 = 0; b2 < 12; b2++) {
    var bx2 = b2 * (w / 11);
    var bh2 = 12 + (Math.cos(b2 * 2.1) * 0.5 + 0.5) * 28;
    ctx.fillRect(bx2, horizon - bh2 + 10, w / 14, bh2);
  }

  /* chão / asfalto lateral */
  var ground = ctx.createLinearGradient(0, horizon, 0, h);
  ground.addColorStop(0, '#455a64');
  ground.addColorStop(0.3, '#37474f');
  ground.addColorStop(1, '#263238');
  ctx.fillStyle = ground;
  ctx.fillRect(0, horizon, w, h - horizon);

  /* prédios laterais em perspectiva */
  function drawSideBuilding(side, z, height, hue) {
    var t = 1 - z;
    var yBase = horizon + (h - horizon) * t * 0.92;
    var scale = 0.2 + 0.8 * t;
    var bw = 28 * scale + 10;
    var bh = height * scale;
    var edge = side < 0 ? 0 : w;
    var xNear = side < 0 ? w * 0.08 * t : w - w * 0.08 * t;
    var x = side < 0 ? xNear - bw - 8 : xNear + 8;
    /* sombra perspectiva */
    ctx.fillStyle = 'hsla(' + hue + ',25%,18%,0.9)';
    ctx.beginPath();
    if (side < 0) {
      ctx.moveTo(x + bw, yBase);
      ctx.lineTo(x + bw + 10 * scale, yBase);
      ctx.lineTo(x + bw + 6 * scale, yBase - bh);
      ctx.lineTo(x + bw, yBase - bh);
    } else {
      ctx.moveTo(x, yBase);
      ctx.lineTo(x - 10 * scale, yBase);
      ctx.lineTo(x - 6 * scale, yBase - bh);
      ctx.lineTo(x, yBase - bh);
    }
    ctx.closePath();
    ctx.fill();
    /* fachada */
    var fac = ctx.createLinearGradient(x, yBase - bh, x + bw, yBase);
    fac.addColorStop(0, 'hsl(' + hue + ',30%,' + (28 + t * 12) + '%)');
    fac.addColorStop(1, 'hsl(' + hue + ',25%,' + (18 + t * 8) + '%)');
    ctx.fillStyle = fac;
    ctx.fillRect(x, yBase - bh, bw, bh);
    /* janelas */
    var rows = Math.max(2, Math.floor(bh / 12));
    var cols = Math.max(1, Math.floor(bw / 10));
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var lit = ((r + c + Math.floor(scroll / 20)) % 3) !== 0;
        ctx.fillStyle = lit ? 'rgba(255,236,150,0.75)' : 'rgba(30,40,60,0.6)';
        ctx.fillRect(x + 3 + c * (bw / cols), yBase - bh + 4 + r * (bh / rows), Math.max(2, bw / cols - 4), Math.max(2, bh / rows - 5));
      }
    }
  }

  if (!arcade.surfeBuildingsL) arcade.surfeBuildingsL = [];
  if (!arcade.surfeBuildingsR) arcade.surfeBuildingsR = [];
  /* mover prédios com o scroll */
  arcade.surfeBuildingsL.forEach(function (b) {
    b.z -= (arcade.speed || 3) * 0.004;
    if (b.z < 0.05) {
      b.z = 0.95;
      b.h = 40 + Math.random() * 90;
    }
  });
  arcade.surfeBuildingsR.forEach(function (b) {
    b.z -= (arcade.speed || 3) * 0.004;
    if (b.z < 0.05) {
      b.z = 0.95;
      b.h = 35 + Math.random() * 100;
    }
  });
  var allB = arcade.surfeBuildingsL.map(function (b) { return { side: -1, b: b }; })
    .concat(arcade.surfeBuildingsR.map(function (b) { return { side: 1, b: b }; }));
  allB.sort(function (a, c) { return c.b.z - a.b.z; });
  allB.forEach(function (item) {
    drawSideBuilding(item.side, item.b.z, item.b.h, item.b.hue);
  });

  /* trilhos / pista 3 faixas com perspectiva melhor */
  ctx.fillStyle = '#37474f';
  ctx.beginPath();
  ctx.moveTo(w * 0.42, horizon);
  ctx.lineTo(w * 0.58, horizon);
  ctx.lineTo(w * 0.98, h);
  ctx.lineTo(w * 0.02, h);
  ctx.closePath();
  ctx.fill();
  /* faixas */
  var laneCols = ['#546e7a', '#607d8b', '#546e7a'];
  for (var L = 0; L < 3; L++) {
    var x0a = w * 0.5 + (L - 1.5) * 14;
    var x0b = w * 0.5 + (L - 0.5) * 14;
    var x1a = w * (0.05 + L * 0.3);
    var x1b = w * (0.05 + (L + 1) * 0.3);
    ctx.fillStyle = laneCols[L];
    ctx.beginPath();
    ctx.moveTo(x0a, horizon);
    ctx.lineTo(x0b, horizon);
    ctx.lineTo(x1b, h);
    ctx.lineTo(x1a, h);
    ctx.closePath();
    ctx.fill();
    /* linhas tracejadas */
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 2;
    ctx.setLineDash([12, 14]);
    ctx.lineDashOffset = -scroll;
    ctx.beginPath();
    ctx.moveTo((x0a + x0b) / 2, horizon);
    ctx.lineTo((x1a + x1b) / 2, h);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  /* trilho metálico nas bordas */
  ctx.strokeStyle = '#90a4ae';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(w * 0.42, horizon); ctx.lineTo(w * 0.02, h);
  ctx.moveTo(w * 0.58, horizon); ctx.lineTo(w * 0.98, h);
  ctx.stroke();

  function proj(lane, z) {
    var y = horizon + (h - 36 - horizon) * (1 - z);
    var laneW = 22 + (w * 0.3) * (1 - z);
    var cx = w / 2 + (lane - 1) * laneW;
    var scale = 0.22 + 0.78 * (1 - z);
    return { x: cx, y: y, s: scale, lw: laneW };
  }

  /* moedas com brilho */
  arcade.surfeCoins.forEach(function (c) {
    var p = proj(c.lane, c.z);
    var rg = ctx.createRadialGradient(p.x - 2, p.y - 12 * p.s, 1, p.x, p.y - 10 * p.s, 9 * p.s);
    rg.addColorStop(0, '#fff9c4');
    rg.addColorStop(0.5, '#ffc107');
    rg.addColorStop(1, '#ff8f00');
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(p.x, p.y - 10 * p.s, 8 * p.s, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  /* obstáculos mais realistas */
  arcade.surfeObst.forEach(function (o) {
    var p = proj(o.lane, o.z);
    if (o.tipo === 'barreira') {
      ctx.fillStyle = '#c62828';
      ctx.fillRect(p.x - 20 * p.s, p.y - 18 * p.s, 40 * p.s, 12 * p.s);
      ctx.fillStyle = '#fff';
      for (var s = 0; s < 3; s++) {
        ctx.fillRect(p.x - 16 * p.s + s * 12 * p.s, p.y - 15 * p.s, 6 * p.s, 6 * p.s);
      }
      ctx.fillStyle = '#b71c1c';
      ctx.fillRect(p.x - 22 * p.s, p.y - 8 * p.s, 4 * p.s, 10 * p.s);
      ctx.fillRect(p.x + 18 * p.s, p.y - 8 * p.s, 4 * p.s, 10 * p.s);
    } else {
      /* trem / caixa */
      var g = ctx.createLinearGradient(p.x - 18 * p.s, p.y - 48 * p.s, p.x + 18 * p.s, p.y);
      g.addColorStop(0, '#546e7a');
      g.addColorStop(1, '#263238');
      ctx.fillStyle = g;
      ctx.fillRect(p.x - 18 * p.s, p.y - 48 * p.s, 36 * p.s, 48 * p.s);
      ctx.fillStyle = 'rgba(100,180,255,0.35)';
      ctx.fillRect(p.x - 12 * p.s, p.y - 40 * p.s, 24 * p.s, 12 * p.s);
      ctx.fillStyle = '#ffc107';
      ctx.fillRect(p.x - 14 * p.s, p.y - 10 * p.s, 8 * p.s, 4 * p.s);
      ctx.fillRect(p.x + 6 * p.s, p.y - 10 * p.s, 8 * p.s, 4 * p.s);
    }
  });

  /* jogador — capoeirista em movimento */
  var pp = proj(arcade.surferLane, 0.14);
  var py = pp.y + arcade.surferY;
  var bob = Math.sin((arcade.frame || 0) * 0.35) * (arcade.surferOnGround ? 2 : 0);
  /* sombra */
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(pp.x, pp.y + 2, 14, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  /* pernas */
  ctx.strokeStyle = '#1565c0';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  var leg = Math.sin((arcade.frame || 0) * 0.4) * 6;
  ctx.beginPath();
  ctx.moveTo(pp.x - 3, py - 12 + bob);
  ctx.lineTo(pp.x - 5 - (arcade.surferOnGround ? leg : 0), py + 2 + bob);
  ctx.moveTo(pp.x + 3, py - 12 + bob);
  ctx.lineTo(pp.x + 5 + (arcade.surferOnGround ? leg : 0), py + 2 + bob);
  ctx.stroke();
  /* corpo */
  var body = ctx.createLinearGradient(pp.x, py - 36, pp.x, py - 8);
  body.addColorStop(0, '#00e676');
  body.addColorStop(1, '#00a844');
  ctx.fillStyle = body;
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') ctx.roundRect(pp.x - 9, py - 34 + bob, 18, 24, 5);
  else ctx.rect(pp.x - 9, py - 34 + bob, 18, 24);
  ctx.fill();
  /* cabeça */
  ctx.fillStyle = '#ffcc80';
  ctx.beginPath();
  ctx.arc(pp.x, py - 40 + bob, 8, 0, Math.PI * 2);
  ctx.fill();
  /* abadá / faixa */
  ctx.fillStyle = '#ffc107';
  ctx.fillRect(pp.x - 9, py - 18 + bob, 18, 3);

  /* HUD moderno */
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(0, 0, w, 28);
  ctx.fillStyle = '#00e676';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('Nv.' + arcade.nivel + '   ' + arcade.score + ' pts', 8, 18);
  ctx.fillStyle = '#ffc107';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText((arcade.progresso || 0) + '/' + (arcade.objetivo || 0), w / 2 - 12, 18);
  ctx.fillStyle = '#90caf9';
  ctx.fillText('SURFE', w - 48, 18);
}

/* ===== Aventura (estilo Super Mario / plataforma) ===== */
function initMario() {
  aplicarModoNoArcade('mario', arcade.nivel || 1);
  var h = arcade.canvas.height;
  var nivel = arcade.nivel || 1;
  arcade.mario = { x: 40, y: h - 80, w: 18, h: 26, onGround: false };
  arcade.marioVx = 0;
  arcade.marioVy = 0;
  arcade.cameraX = 0;
  arcade.score = 0;
  /* plataformas */
  arcade.platforms = [
    { x: 0, y: h - 28, w: 900 + nivel * 80, h: 28 },
    { x: 140, y: h - 90, w: 70, h: 12 },
    { x: 240, y: h - 140, w: 60, h: 12 },
    { x: 340, y: h - 100, w: 80, h: 12 },
    { x: 460, y: h - 150, w: 55, h: 12 },
    { x: 560, y: h - 90, w: 90, h: 12 },
    { x: 700, y: h - 130, w: 70, h: 12 },
    { x: 820, y: h - 80, w: 100, h: 12 }
  ];
  /* inimigos */
  arcade.enemies = [];
  var curvaMario = curvaDificuldade(nivel);
  for (var e = 0; e < 1 + Math.round(3 * curvaMario); e++) {
    arcade.enemies.push({
      x: 180 + e * 160,
      y: h - 50,
      w: 16, h: 16,
      vx: (e % 2 ? 1.2 : -1.2) * (0.8 + 0.9 * curvaMario),
      minX: 160 + e * 160,
      maxX: 240 + e * 160
    });
  }
  /* moedas */
  arcade.marioCoins = [];
  for (var c = 0; c < 6 + nivel; c++) {
    arcade.marioCoins.push({
      x: 120 + c * 90,
      y: h - 120 - (c % 3) * 40,
      r: 7,
      pega: false
    });
  }
  /* bandeira no fim */
  arcade.flag = { x: 880 + nivel * 40, y: h - 120, w: 8, h: 90 };
  drawMario();
}

function marioJump() {
  if (!arcade.rodando || arcade.tipo !== 'mario') return;
  if (arcade.mario && arcade.mario.onGround) {
    arcade.marioVy = -9.8;
    arcade.mario.onGround = false;
  }
}

function tickMario() {
  var m = arcade.mario;
  var w = arcade.canvas.width, h = arcade.canvas.height;
  if (!m) return;
  /* movimento horizontal com atrito */
  m.x += arcade.marioVx || 0;
  arcade.marioVx *= 0.82;
  if (Math.abs(arcade.marioVx) < 0.3) arcade.marioVx = 0;
  /* gravidade */
  arcade.marioVy += 0.45;
  m.y += arcade.marioVy;
  m.onGround = false;
  /* colisão plataformas */
  arcade.platforms.forEach(function (p) {
    if (m.x + m.w > p.x && m.x < p.x + p.w &&
        m.y + m.h > p.y && m.y + m.h < p.y + p.h + 12 &&
        arcade.marioVy >= 0) {
      m.y = p.y - m.h;
      arcade.marioVy = 0;
      m.onGround = true;
    }
  });
  if (m.y > h + 40) { gameOverArcade(); return; }
  if (m.x < 0) m.x = 0;
  /* inimigos */
  for (var i = 0; i < arcade.enemies.length; i++) {
    var en = arcade.enemies[i];
    en.x += en.vx;
    if (en.x < en.minX || en.x > en.maxX) en.vx *= -1;
    if (m.x < en.x + en.w && m.x + m.w > en.x && m.y < en.y + en.h && m.y + m.h > en.y) {
      /* pula em cima */
      if (arcade.marioVy > 0 && m.y + m.h < en.y + en.h * 0.6) {
        arcade.enemies.splice(i, 1);
        arcade.marioVy = -6;
        arcade.score += 25;
        i--;
      } else {
        gameOverArcade();
        return;
      }
    }
  }
  /* moedas */
  arcade.marioCoins.forEach(function (c) {
    if (c.pega) return;
    if (Math.abs(m.x + m.w / 2 - c.x) < 14 && Math.abs(m.y + m.h / 2 - c.y) < 16) {
      c.pega = true;
      arcade.score += 15;
      registrarProgressoNivel(1);
    }
  });
  /* bandeira */
  var f = arcade.flag;
  if (m.x + m.w > f.x && m.x < f.x + 20) {
    arcade.score += 50;
    registrarProgressoNivel(3);
    mostrarToast('Bandeira! Fase completa');
    /* recomeça fase um pouco mais à frente / sobe nível via progresso */
    initMario();
    return;
  }
  /* câmera */
  arcade.cameraX = Math.max(0, m.x - w * 0.35);
  drawMario();
}

function drawMario() {
  var ctx = arcade.ctx, w = arcade.canvas.width, h = arcade.canvas.height;
  var cam = arcade.cameraX || 0;
  /* céu */
  var sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#4fc3f7');
  sky.addColorStop(1, '#b3e5fc');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  /* colinas */
  ctx.fillStyle = '#81c784';
  ctx.beginPath();
  ctx.ellipse(80 - cam * 0.2, h - 20, 90, 40, 0, 0, Math.PI * 2);
  ctx.ellipse(220 - cam * 0.2, h - 10, 110, 50, 0, 0, Math.PI * 2);
  ctx.fill();
  /* plataformas */
  arcade.platforms.forEach(function (p) {
    ctx.fillStyle = '#6d4c41';
    ctx.fillRect(p.x - cam, p.y, p.w, p.h);
    ctx.fillStyle = '#8bc34a';
    ctx.fillRect(p.x - cam, p.y, p.w, 5);
  });
  /* bandeira */
  var f = arcade.flag;
  ctx.fillStyle = '#fff';
  ctx.fillRect(f.x - cam, f.y, f.w, f.h);
  ctx.fillStyle = '#e53935';
  ctx.beginPath();
  ctx.moveTo(f.x - cam + f.w, f.y);
  ctx.lineTo(f.x - cam + f.w + 22, f.y + 10);
  ctx.lineTo(f.x - cam + f.w, f.y + 20);
  ctx.fill();
  /* moedas */
  arcade.marioCoins.forEach(function (c) {
    if (c.pega) return;
    ctx.fillStyle = '#ffc107';
    ctx.beginPath();
    ctx.arc(c.x - cam, c.y, c.r, 0, Math.PI * 2);
    ctx.fill();
  });
  /* inimigos */
  arcade.enemies.forEach(function (en) {
    ctx.fillStyle = '#6d4c41';
    ctx.fillRect(en.x - cam, en.y, en.w, en.h);
    ctx.fillStyle = '#ef5350';
    ctx.fillRect(en.x - cam + 2, en.y + 3, 4, 4);
    ctx.fillRect(en.x - cam + 10, en.y + 3, 4, 4);
  });
  /* jogador */
  var m = arcade.mario;
  ctx.fillStyle = '#e53935';
  ctx.fillRect(m.x - cam, m.y, m.w, m.h * 0.45);
  ctx.fillStyle = '#1565c0';
  ctx.fillRect(m.x - cam, m.y + m.h * 0.45, m.w, m.h * 0.55);
  ctx.fillStyle = '#ffcc80';
  ctx.beginPath();
  ctx.arc(m.x - cam + m.w / 2, m.y - 4, 7, 0, Math.PI * 2);
  ctx.fill();
  desenharHUDArcade(ctx, w, 'AVENTURA');
}

/* =========================================================
   DAMAS — tabuleiro 8x8, dama, captura, multi-captura
   Modos: vs IA · 2 jogadores (mesmo aparelho) · Online (sala)
   ========================================================= */
var _damasClickLock = 0;
var _damasOnlineTimer = null;

function damasPararOnline() {
  if (_damasOnlineTimer) { clearInterval(_damasOnlineTimer); _damasOnlineTimer = null; }
  arcade.damasSalaId = null;
  arcade.damasSouHost = false;
  arcade.damasOnlineCodigo = null;
}

function damasSerialBoard(board) {
  var out = [];
  for (var r = 0; r < 8; r++) {
    out[r] = [];
    for (var c = 0; c < 8; c++) {
      var p = board[r][c];
      out[r][c] = p ? { cor: p.cor, dama: !!p.dama } : null;
    }
  }
  return out;
}

function damasCodigoNovo() {
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  var s = '';
  for (var i = 0; i < 5; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function damasSalvarSala(estado) {
  if (!arcade.damasSalaId) return;
  var payload = {
    tipo: 'damas',
    codigo: arcade.damasOnlineCodigo,
    board: damasSerialBoard(arcade.damasBoard),
    vez: arcade.damasVez,
    fim: !!arcade.damasFim,
    msg: arcade.damasMsg || '',
    capturas: arcade.damasCapturas || { b: 0, p: 0 },
    hostId: estado && estado.hostId != null ? estado.hostId : (arcade.damasHostId || ''),
    guestId: estado && estado.guestId != null ? estado.guestId : (arcade.damasGuestId || ''),
    status: arcade.damasFim ? 'fim' : (arcade.damasGuestId ? 'jogando' : 'aguardando'),
    atualizadoEm: (typeof agoraISO === 'function') ? agoraISO() : new Date().toISOString()
  };
  try {
    localStorage.setItem('uc_damas_sala_' + arcade.damasOnlineCodigo, JSON.stringify(payload));
  } catch (e) {}
  if (typeof DB !== 'undefined' && DB.salvar) {
    DB.salvar('desafiosJogos', payload, arcade.damasSalaId).catch(function () {});
  }
}

function damasLerSalaLocal(codigo) {
  try {
    return JSON.parse(localStorage.getItem('uc_damas_sala_' + codigo) || 'null');
  } catch (e) { return null; }
}

function damasBuscarSala(codigo) {
  codigo = String(codigo || '').trim().toUpperCase();
  if (!codigo) return null;
  var local = damasLerSalaLocal(codigo);
  if (local) return local;
  if (typeof DB !== 'undefined' && DB.listar) {
    var lista = DB.listar('desafiosJogos') || [];
    for (var i = 0; i < lista.length; i++) {
      if (lista[i] && lista[i].tipo === 'damas' && String(lista[i].codigo || '').toUpperCase() === codigo) {
        return lista[i];
      }
    }
  }
  return null;
}

function damasAplicarEstadoRemoto(est) {
  if (!est || !est.board) return;
  arcade.damasBoard = est.board;
  arcade.damasVez = est.vez || 'b';
  arcade.damasFim = !!est.fim;
  arcade.damasMsg = est.msg || arcade.damasMsg;
  arcade.damasCapturas = est.capturas || { b: 0, p: 0 };
  if (est.guestId) arcade.damasGuestId = est.guestId;
  if (est.hostId) arcade.damasHostId = est.hostId;
  drawDamas();
}

function damasIniciarPollOnline() {
  if (_damasOnlineTimer) clearInterval(_damasOnlineTimer);
  _damasOnlineTimer = setInterval(function () {
    if (arcade.tipo !== 'damas' || arcade.damasModo !== 'online') {
      damasPararOnline();
      return;
    }
    var est = damasBuscarSala(arcade.damasOnlineCodigo);
    if (!est) return;
    /* convidado entrou */
    if (arcade.damasSouHost && est.guestId && !arcade.damasGuestId) {
      arcade.damasGuestId = est.guestId;
      arcade.damasMsg = 'Rival entrou! Você é Claras. Sua vez.';
    }
    /* sincroniza se o estado remoto for mais novo (outra pessoa jogou) */
    var remotoJson = JSON.stringify(est.board) + '|' + est.vez + '|' + (est.fim ? 1 : 0);
    var localJson = JSON.stringify(arcade.damasBoard) + '|' + arcade.damasVez + '|' + (arcade.damasFim ? 1 : 0);
    if (remotoJson !== localJson) {
      damasAplicarEstadoRemoto(est);
    }
  }, 1200);
}

function damasCriarSalaOnline() {
  var aluno = (typeof alunoLogado === 'function') ? alunoLogado() : null;
  var codigo = damasCodigoNovo();
  var id = 'damas_' + codigo;
  arcade.damasModo = 'online';
  arcade.damasOnlineCodigo = codigo;
  arcade.damasSalaId = id;
  arcade.damasSouHost = true;
  arcade.damasHostId = aluno ? (aluno.id || aluno.nome || 'host') : 'host';
  arcade.damasGuestId = '';
  arcade.damasCorOnline = 'b';
  initDamasTabuleiroBase();
  arcade.damasMsg = 'Sala ' + codigo + ' — aguarde o rival entrar (mesmo Wi‑Fi/nuvem). Você é Claras.';
  damasSalvarSala({});
  damasIniciarPollOnline();
  drawDamas();
  try { mostrarToast('Código da sala: ' + codigo); } catch (e) {}
}

function damasEntrarSalaOnline() {
  var codigo = prompt('Digite o código da sala (5 letras):');
  if (!codigo) return;
  codigo = String(codigo).trim().toUpperCase();
  var est = damasBuscarSala(codigo);
  if (!est) {
    try { mostrarToast('Sala não encontrada. Confira o código.', 'erro'); } catch (e) { alert('Sala não encontrada'); }
    return;
  }
  if (est.guestId && est.status === 'jogando') {
    try { mostrarToast('Sala já está cheia.', 'erro'); } catch (e2) {}
    return;
  }
  var aluno = (typeof alunoLogado === 'function') ? alunoLogado() : null;
  arcade.damasModo = 'online';
  arcade.damasOnlineCodigo = codigo;
  arcade.damasSalaId = est.id || ('damas_' + codigo);
  arcade.damasSouHost = false;
  arcade.damasHostId = est.hostId || '';
  arcade.damasGuestId = aluno ? (aluno.id || aluno.nome || 'guest') : 'guest';
  arcade.damasCorOnline = 'p';
  damasAplicarEstadoRemoto(est);
  arcade.damasMsg = 'Você entrou na sala ' + codigo + ' · você joga com as Escuras.';
  damasSalvarSala({ hostId: arcade.damasHostId, guestId: arcade.damasGuestId });
  damasIniciarPollOnline();
  drawDamas();
  try { mostrarToast('Entrou na sala ' + codigo); } catch (e3) {}
}

function initDamasTabuleiroBase() {
  arcade.damasVez = 'b';
  arcade.damasSel = null;
  arcade.damasFim = false;
  arcade.damasCapturas = { b: 0, p: 0 };
  arcade.score = 0;
  var board = [];
  for (var r = 0; r < 8; r++) {
    board[r] = [];
    for (var c = 0; c < 8; c++) {
      board[r][c] = null;
      if ((r + c) % 2 === 1) {
        if (r < 3) board[r][c] = { cor: 'p', dama: false };
        else if (r > 4) board[r][c] = { cor: 'b', dama: false };
      }
    }
  }
  arcade.damasBoard = board;
}

function initDamas() {
  aplicarModoNoArcade('damas', arcade.nivel || 1);
  var bar = document.getElementById('arcadeAcoesExtra');
  if (bar) {
    var box = document.getElementById('arcadeAcoesDamas');
    if (!box) {
      box = document.createElement('div');
      box.id = 'arcadeAcoesDamas';
      box.className = 'arcade-acoes-col';
      box.innerHTML =
        '<button type="button" class="arcade-btn arcade-btn-green" style="width:auto;min-width:72px;height:44px;border-radius:12px;font-size:0.6rem;padding:4px;" data-acao="damas-ia">🤖 Vs IA</button>' +
        '<button type="button" class="arcade-btn arcade-btn-gold" style="width:auto;min-width:72px;height:44px;border-radius:12px;font-size:0.6rem;padding:4px;" data-acao="damas-2p">👥 2P local</button>' +
        '<button type="button" class="arcade-btn" style="width:auto;min-width:72px;height:44px;border-radius:12px;font-size:0.6rem;padding:4px;background:rgba(0,210,255,0.3);" data-acao="damas-online-criar">🌐 Criar sala</button>' +
        '<button type="button" class="arcade-btn" style="width:auto;min-width:72px;height:44px;border-radius:12px;font-size:0.6rem;padding:4px;background:rgba(156,39,176,0.35);" data-acao="damas-online-entrar">🔑 Entrar</button>' +
        '<button type="button" class="arcade-btn" style="width:auto;min-width:64px;height:44px;border-radius:12px;font-size:0.6rem;padding:4px;background:rgba(144,202,249,0.35);" data-acao="damas-novo">🔄 Novo</button>';
      bar.appendChild(box);
    }
    box.style.display = 'flex';
  }
  var dpad = document.querySelector('.arcade-dpad');
  if (dpad) dpad.style.display = 'none';
  var acoesG = $('arcadeAcoesGeral'); if (acoesG) acoesG.style.display = 'none';
  var acoesP = $('arcadeAcoesPulo'); if (acoesP) acoesP.style.display = 'none';

  if (arcade.damasModo !== 'online') {
    damasPararOnline();
  }
  arcade.damasModo = arcade.damasModo || 'ia';
  if (arcade.damasModo !== 'online') {
    initDamasTabuleiroBase();
    arcade.damasMsg = arcade.damasModo === 'ia'
      ? 'Você (Claras) × Assistente. Toque na peça e na casa.'
      : '2 jogadores no mesmo aparelho. Claras começam — alternem.';
  }
  instalarCliqueDamas();
  drawDamas();
}

function instalarCliqueDamas() {
  if (window._damasClickOk) return;
  window._damasClickOk = true;
  var canvas = $('arcadeCanvas');
  if (!canvas) return;
  function handle(e) {
    if (arcade.tipo !== 'damas' || !arcade.rodando || arcade.pausado || arcade.damasFim) return;
    var now = Date.now();
    if (now - _damasClickLock < 280) return; /* evita toque+click duplicado */
    _damasClickLock = now;
    var rect = canvas.getBoundingClientRect();
    var clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
    var clientY = (e.touches && e.touches[0]) ? e.touches[0].clientY : e.clientY;
    var x = (clientX - rect.left) * (canvas.width / rect.width);
    var y = (clientY - rect.top) * (canvas.height / rect.height);
    var margem = 8;
    var size = Math.min(canvas.width - margem * 2, 300);
    var ox = (canvas.width - size) / 2;
    var oy = 36;
    if (x < ox || y < oy || x > ox + size || y > oy + size) return;
    var c = Math.floor((x - ox) / (size / 8));
    var r = Math.floor((y - oy) / (size / 8));
    if (r < 0 || r > 7 || c < 0 || c > 7) return;
    cliqueDamas(r, c);
  }
  canvas.addEventListener('click', handle);
  canvas.addEventListener('touchend', function (e) {
    if (arcade.tipo !== 'damas') return;
    e.preventDefault();
    if (e.changedTouches && e.changedTouches[0]) {
      var t = e.changedTouches[0];
      handle({ clientX: t.clientX, clientY: t.clientY });
    }
  }, { passive: false });
}

function damasPeca(r, c) {
  if (r < 0 || r > 7 || c < 0 || c > 7 || !arcade.damasBoard) return null;
  return arcade.damasBoard[r][c];
}

function damasEscura(r, c) { return (r + c) % 2 === 1; }

function damasMovimentos(r, c, soCaptura) {
  var p = damasPeca(r, c);
  if (!p) return [];
  var dirs = [];
  if (p.dama) {
    dirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  } else if (p.cor === 'b') {
    dirs = [[-1, -1], [-1, 1]];
  } else {
    dirs = [[1, -1], [1, 1]];
  }
  var moves = [];
  dirs.forEach(function (d) {
    var r1 = r + d[0], c1 = c + d[1];
    var r2 = r + d[0] * 2, c2 = c + d[1] * 2;
    if (r2 >= 0 && r2 < 8 && c2 >= 0 && c2 < 8) {
      var mid = damasPeca(r1, c1);
      var dest = damasPeca(r2, c2);
      if (mid && mid.cor !== p.cor && !dest) {
        moves.push({ r: r2, c: c2, captura: true, mr: r1, mc: c1 });
      }
    }
    if (!soCaptura && r1 >= 0 && r1 < 8 && c1 >= 0 && c1 < 8 && !damasPeca(r1, c1) && damasEscura(r1, c1)) {
      moves.push({ r: r1, c: c1, captura: false });
    }
  });
  if (p.dama && !soCaptura) {
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(function (d) {
      for (var k = 1; k <= 7; k++) {
        var rr = r + d[0] * k, cc = c + d[1] * k;
        if (rr < 0 || rr > 7 || cc < 0 || cc > 7) break;
        if (!damasEscura(rr, cc)) continue;
        if (damasPeca(rr, cc)) break;
        if (k >= 1) moves.push({ r: rr, c: cc, captura: false });
      }
    });
  }
  /* remove duplicados */
  var seen = {};
  return moves.filter(function (m) {
    var k = m.r + ',' + m.c + ',' + (m.captura ? 1 : 0);
    if (seen[k]) return false;
    seen[k] = 1;
    return true;
  });
}

function damasTemCaptura(cor) {
  for (var r = 0; r < 8; r++) {
    for (var c = 0; c < 8; c++) {
      var p = damasPeca(r, c);
      if (p && p.cor === cor) {
        if (damasMovimentos(r, c, true).some(function (x) { return x.captura; })) return true;
      }
    }
  }
  return false;
}

function damasTodosMovimentos(cor) {
  var obrigatorio = damasTemCaptura(cor);
  var lista = [];
  for (var r = 0; r < 8; r++) {
    for (var c = 0; c < 8; c++) {
      var p = damasPeca(r, c);
      if (!p || p.cor !== cor) continue;
      damasMovimentos(r, c, obrigatorio).forEach(function (m) {
        if (!obrigatorio || m.captura) lista.push({ deR: r, deC: c, para: m });
      });
    }
  }
  return lista;
}

function damasPodeJogarAgora() {
  if (arcade.damasModo === 'ia') return arcade.damasVez === 'b';
  if (arcade.damasModo === '2p') return true;
  if (arcade.damasModo === 'online') {
    return arcade.damasVez === arcade.damasCorOnline;
  }
  return true;
}

function cliqueDamas(r, c) {
  if (arcade.damasFim) return;
  if (arcade.damasModo === 'ia' && arcade.damasVez === 'p') return;
  if (arcade.damasModo === 'online' && !damasPodeJogarAgora()) {
    arcade.damasMsg = 'Aguarde a jogada do rival…';
    drawDamas();
    return;
  }
  /* online: só mexe nas próprias peças */
  if (arcade.damasModo === 'online') {
    var minhaCor = arcade.damasCorOnline;
    if (arcade.damasVez !== minhaCor) return;
  }

  var p = damasPeca(r, c);
  var sel = arcade.damasSel;

  if (p && p.cor === arcade.damasVez) {
    arcade.damasSel = { r: r, c: c };
    arcade.damasMsg = 'Peça selecionada · toque na casa de destino';
    drawDamas();
    return;
  }

  if (!sel) {
    arcade.damasMsg = 'Toque em uma peça da vez (' + (arcade.damasVez === 'b' ? 'claras' : 'escuras') + ')';
    drawDamas();
    return;
  }

  var moves = damasMovimentos(sel.r, sel.c, damasTemCaptura(arcade.damasVez));
  var escolhido = null;
  for (var i = 0; i < moves.length; i++) {
    if (moves[i].r === r && moves[i].c === c) { escolhido = moves[i]; break; }
  }
  if (!escolhido) {
    if (p && p.cor === arcade.damasVez) {
      arcade.damasSel = { r: r, c: c };
      arcade.damasMsg = 'Peça selecionada · toque no destino';
      drawDamas();
      return;
    }
    arcade.damasMsg = 'Movimento inválido' + (damasTemCaptura(arcade.damasVez) ? ' · captura obrigatória!' : '');
    drawDamas();
    return;
  }

  aplicarMovimentoDamas(sel.r, sel.c, escolhido);
}

function aplicarMovimentoDamas(deR, deC, mov) {
  var board = arcade.damasBoard;
  var p = board[deR][deC];
  if (!p) return;
  board[deR][deC] = null;
  board[mov.r][mov.c] = p;
  if (mov.captura) {
    board[mov.mr][mov.mc] = null;
    arcade.damasCapturas[p.cor] = (arcade.damasCapturas[p.cor] || 0) + 1;
    if (p.cor === 'b') arcade.score += 15;
  } else {
    if (p.cor === 'b') arcade.score += 2;
  }
  if (!p.dama) {
    if (p.cor === 'b' && mov.r === 0) { p.dama = true; arcade.damasMsg = '👑 Dama!'; arcade.score += 25; }
    if (p.cor === 'p' && mov.r === 7) { p.dama = true; arcade.damasMsg = '👑 Dama!'; }
  }
  if (mov.captura) {
    var mais = damasMovimentos(mov.r, mov.c, true).filter(function (x) { return x.captura; });
    if (mais.length) {
      arcade.damasSel = { r: mov.r, c: mov.c };
      arcade.damasMsg = (arcade.damasModo === 'ia' && p.cor === 'p')
        ? 'Assistente continua capturando…'
        : 'Continue capturando com a mesma peça!';
      drawDamas();
      verificarFimDamas();
      if (!arcade.damasFim && arcade.damasModo === 'ia' && p.cor === 'p') {
        setTimeout(function () { jogadaIADamasContinuacao(mov.r, mov.c); }, 400);
      }
      if (arcade.damasModo === 'online') damasSalvarSala({});
      return;
    }
  }
  arcade.damasSel = null;
  arcade.damasVez = arcade.damasVez === 'b' ? 'p' : 'b';
  if (!arcade.damasMsg || arcade.damasMsg.indexOf('Dama') < 0) {
    if (arcade.damasModo === 'online') {
      arcade.damasMsg = (arcade.damasVez === arcade.damasCorOnline)
        ? 'Sua vez!'
        : 'Vez do rival…';
    } else if (arcade.damasModo === 'ia') {
      arcade.damasMsg = arcade.damasVez === 'b' ? 'Sua vez (claras)' : 'Assistente pensando…';
    } else {
      arcade.damasMsg = arcade.damasVez === 'b' ? 'Vez do Jogador 1 (claras)' : 'Vez do Jogador 2 (escuras)';
    }
  }
  drawDamas();
  verificarFimDamas();
  if (arcade.damasModo === 'online') damasSalvarSala({});
  if (!arcade.damasFim && arcade.damasModo === 'ia' && arcade.damasVez === 'p') {
    setTimeout(jogadaIADamas, 450 + Math.random() * 350);
  }
}

/* =========================================================
   IA DAMAS — Minimax + poda alfa-beta
   Profundidade sobe com o nível do arcade (1–10)
   ========================================================= */
function damasCloneBoard(board) {
  var out = [];
  for (var r = 0; r < 8; r++) {
    out[r] = [];
    for (var c = 0; c < 8; c++) {
      var p = board[r][c];
      out[r][c] = p ? { cor: p.cor, dama: !!p.dama } : null;
    }
  }
  return out;
}

function damasPecaB(board, r, c) {
  if (r < 0 || r > 7 || c < 0 || c > 7) return null;
  return board[r][c];
}

function damasMovimentosB(board, r, c, soCaptura) {
  var p = damasPecaB(board, r, c);
  if (!p) return [];
  var dirs = p.dama ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
    : (p.cor === 'b' ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]]);
  var moves = [];
  dirs.forEach(function (d) {
    var r1 = r + d[0], c1 = c + d[1];
    var r2 = r + d[0] * 2, c2 = c + d[1] * 2;
    if (r2 >= 0 && r2 < 8 && c2 >= 0 && c2 < 8) {
      var mid = damasPecaB(board, r1, c1);
      var dest = damasPecaB(board, r2, c2);
      if (mid && mid.cor !== p.cor && !dest) {
        moves.push({ r: r2, c: c2, captura: true, mr: r1, mc: c1 });
      }
    }
    if (!soCaptura && r1 >= 0 && r1 < 8 && c1 >= 0 && c1 < 8 && !damasPecaB(board, r1, c1) && ((r1 + c1) % 2 === 1)) {
      moves.push({ r: r1, c: c1, captura: false });
    }
  });
  if (p.dama && !soCaptura) {
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(function (d) {
      for (var k = 1; k <= 7; k++) {
        var rr = r + d[0] * k, cc = c + d[1] * k;
        if (rr < 0 || rr > 7 || cc < 0 || cc > 7) break;
        if ((rr + cc) % 2 !== 1) continue;
        if (damasPecaB(board, rr, cc)) break;
        moves.push({ r: rr, c: cc, captura: false });
      }
    });
  }
  var seen = {};
  return moves.filter(function (m) {
    var k = m.r + ',' + m.c + ',' + (m.captura ? 1 : 0) + ',' + (m.mr || '') + ',' + (m.mc || '');
    if (seen[k]) return false;
    seen[k] = 1;
    return true;
  });
}

function damasTemCapturaB(board, cor) {
  for (var r = 0; r < 8; r++) {
    for (var c = 0; c < 8; c++) {
      var p = damasPecaB(board, r, c);
      if (p && p.cor === cor) {
        if (damasMovimentosB(board, r, c, true).some(function (x) { return x.captura; })) return true;
      }
    }
  }
  return false;
}

function damasTodosMovimentosB(board, cor) {
  var obrigatorio = damasTemCapturaB(board, cor);
  var lista = [];
  for (var r = 0; r < 8; r++) {
    for (var c = 0; c < 8; c++) {
      var p = damasPecaB(board, r, c);
      if (!p || p.cor !== cor) continue;
      damasMovimentosB(board, r, c, obrigatorio).forEach(function (m) {
        if (!obrigatorio || m.captura) lista.push({ deR: r, deC: c, para: m });
      });
    }
  }
  return lista;
}

/** Aplica movimento numa cópia; se multi-captura possível, continua = {r,c} */
function damasApplyB(board, deR, deC, mov) {
  var b = damasCloneBoard(board);
  var p = b[deR][deC];
  if (!p) return { board: b, continua: null };
  b[deR][deC] = null;
  b[mov.r][mov.c] = p;
  if (mov.captura) b[mov.mr][mov.mc] = null;
  if (!p.dama) {
    if (p.cor === 'b' && mov.r === 0) p.dama = true;
    if (p.cor === 'p' && mov.r === 7) p.dama = true;
  }
  var continua = null;
  if (mov.captura) {
    var mais = damasMovimentosB(b, mov.r, mov.c, true).filter(function (x) { return x.captura; });
    if (mais.length) continua = { r: mov.r, c: mov.c };
  }
  return { board: b, continua: continua };
}

/** Avaliação: positivo favorece pretas (IA) */
function damasAvaliar(board) {
  var score = 0;
  var pb = 0, pp = 0;
  for (var r = 0; r < 8; r++) {
    for (var c = 0; c < 8; c++) {
      var p = board[r][c];
      if (!p) continue;
      var base = p.dama ? 280 : 100;
      /* centro e avanço */
      var centro = 4.5 - Math.abs(r - 3.5) - Math.abs(c - 3.5);
      var avanc = p.cor === 'p' ? r : (7 - r);
      var val = base + centro * 6 + avanc * 4;
      if (p.cor === 'p') { score += val; pp++; }
      else { score -= val; pb++; }
    }
  }
  if (pb === 0) score += 10000;
  if (pp === 0) score -= 10000;
  return score;
}

function damasProfundidadeIA() {
  var nv = arcade.nivel || 1;
  if (nv <= 2) return 2;
  if (nv <= 5) return 3;
  if (nv <= 8) return 4;
  return 5;
}

/**
 * Minimax com alfa-beta.
 * maximizing = true → joga pretas (IA)
 * cont = {r,c} se for continuação de multi-captura da cor da vez
 */
function damasMinimax(board, depth, alpha, beta, maximizing, cont) {
  var cor = maximizing ? 'p' : 'b';
  var lista;
  if (cont) {
    lista = damasMovimentosB(board, cont.r, cont.c, true)
      .filter(function (m) { return m.captura; })
      .map(function (m) { return { deR: cont.r, deC: cont.c, para: m }; });
  } else {
    lista = damasTodosMovimentosB(board, cor);
  }

  if (depth <= 0 || !lista.length) {
    var ev = damasAvaliar(board);
    if (!lista.length) {
      /* quem deveria jogar não tem movimento → adversário ganha */
      ev += maximizing ? -8000 : 8000;
    }
    return { score: ev, move: null };
  }

  /* ordena: capturas primeiro (melhor poda) */
  lista.sort(function (a, b) {
    return (b.para.captura ? 1 : 0) - (a.para.captura ? 1 : 0);
  });

  var melhorMov = lista[0];
  if (maximizing) {
    var maxEval = -Infinity;
    for (var i = 0; i < lista.length; i++) {
      var m = lista[i];
      var res = damasApplyB(board, m.deR, m.deC, m.para);
      var filho;
      if (res.continua) {
        /* mesma cor continua capturando */
        filho = damasMinimax(res.board, depth, alpha, beta, maximizing, res.continua);
      } else {
        filho = damasMinimax(res.board, depth - 1, alpha, beta, false, null);
      }
      if (filho.score > maxEval) {
        maxEval = filho.score;
        melhorMov = m;
      }
      alpha = Math.max(alpha, maxEval);
      if (beta <= alpha) break;
    }
    return { score: maxEval, move: melhorMov };
  } else {
    var minEval = Infinity;
    for (var j = 0; j < lista.length; j++) {
      var m2 = lista[j];
      var res2 = damasApplyB(board, m2.deR, m2.deC, m2.para);
      var filho2;
      if (res2.continua) {
        filho2 = damasMinimax(res2.board, depth, alpha, beta, maximizing, res2.continua);
      } else {
        filho2 = damasMinimax(res2.board, depth - 1, alpha, beta, true, null);
      }
      if (filho2.score < minEval) {
        minEval = filho2.score;
        melhorMov = m2;
      }
      beta = Math.min(beta, minEval);
      if (beta <= alpha) break;
    }
    return { score: minEval, move: melhorMov };
  }
}

function jogadaIADamas() {
  if (arcade.tipo !== 'damas' || arcade.damasFim || arcade.damasVez !== 'p') return;
  var lista = damasTodosMovimentos('p');
  if (!lista.length) {
    arcade.damasFim = true;
    arcade.damasMsg = '🎉 Você venceu! Assistente sem movimentos.';
    arcade.score += 80;
    salvarNivelArcade('damas', Math.min(10, (arcade.nivel || 1) + 1));
    drawDamas();
    return;
  }
  var depth = damasProfundidadeIA();
  var resultado = damasMinimax(
    damasCloneBoard(arcade.damasBoard),
    depth,
    -Infinity,
    Infinity,
    true,
    null
  );
  var escolha = resultado.move || lista[0];
  arcade.damasMsg = 'Assistente (minimax nv' + depth + ')…';
  drawDamas();
  aplicarMovimentoDamas(escolha.deR, escolha.deC, escolha.para);
}

function jogadaIADamasContinuacao(r, c) {
  if (arcade.tipo !== 'damas' || arcade.damasFim || arcade.damasVez !== 'p') return;
  var opcoes = damasMovimentos(r, c, true).filter(function (x) { return x.captura; });
  if (!opcoes.length) return;
  var depth = Math.max(2, damasProfundidadeIA() - 1);
  var resultado = damasMinimax(
    damasCloneBoard(arcade.damasBoard),
    depth,
    -Infinity,
    Infinity,
    true,
    { r: r, c: c }
  );
  var escolha = (resultado.move && resultado.move.para) ? resultado.move.para : opcoes[0];
  var deR = (resultado.move && resultado.move.deR != null) ? resultado.move.deR : r;
  var deC = (resultado.move && resultado.move.deC != null) ? resultado.move.deC : c;
  aplicarMovimentoDamas(deR, deC, escolha);
}

function verificarFimDamas() {
  var cont = { b: 0, p: 0 };
  for (var r = 0; r < 8; r++) {
    for (var c = 0; c < 8; c++) {
      var p = damasPeca(r, c);
      if (p) cont[p.cor]++;
    }
  }
  if (cont.b === 0) {
    arcade.damasFim = true;
    arcade.damasMsg = arcade.damasModo === 'ia' ? '🤖 Assistente venceu!' : (arcade.damasModo === 'online' ? 'Escuras venceram!' : 'Jogador 2 (escuras) venceu!');
    drawDamas();
    if (arcade.damasModo === 'online') damasSalvarSala({});
    return;
  }
  if (cont.p === 0) {
    arcade.damasFim = true;
    arcade.damasMsg = '🎉 Claras venceram! Axé!';
    arcade.score += 100;
    salvarNivelArcade('damas', Math.min(10, (arcade.nivel || 1) + 1));
    drawDamas();
    if (arcade.damasModo === 'online') damasSalvarSala({});
    return;
  }
  var movs = damasTodosMovimentos(arcade.damasVez);
  if (!movs.length) {
    arcade.damasFim = true;
    var vencedor = arcade.damasVez === 'b' ? 'Escuras' : 'Claras';
    arcade.damasMsg = 'Sem movimentos · ' + vencedor + ' vencem!';
    if (arcade.damasVez === 'p') {
      arcade.score += 80;
      salvarNivelArcade('damas', Math.min(10, (arcade.nivel || 1) + 1));
    }
    drawDamas();
    if (arcade.damasModo === 'online') damasSalvarSala({});
  }
}

function tickDamas() {
  /* tabuleiro estático — desenho sob demanda */
}

function drawDamas() {
  var ctx = arcade.ctx;
  if (!ctx || !arcade.damasBoard) return;
  var w = arcade.canvas.width, h = arcade.canvas.height;
  ctx.fillStyle = '#1a120b';
  ctx.fillRect(0, 0, w, h);
  var margem = 8;
  var size = Math.min(w - margem * 2, 300);
  var ox = (w - size) / 2;
  var oy = 36;
  var cell = size / 8;
  var sel = arcade.damasSel;
  var moves = [];
  if (sel) moves = damasMovimentos(sel.r, sel.c, damasTemCaptura(arcade.damasVez));
  for (var r = 0; r < 8; r++) {
    for (var c = 0; c < 8; c++) {
      var x = ox + c * cell, y = oy + r * cell;
      var escura = (r + c) % 2 === 1;
      ctx.fillStyle = escura ? '#8b5a2b' : '#dfcfb7';
      ctx.fillRect(x, y, cell, cell);
      var isDest = moves.some(function (m) { return m.r === r && m.c === c; });
      if (isDest) {
        ctx.fillStyle = 'rgba(0,230,118,0.35)';
        ctx.fillRect(x, y, cell, cell);
      }
      if (sel && sel.r === r && sel.c === c) {
        ctx.strokeStyle = '#ffc107';
        ctx.lineWidth = 3;
        ctx.strokeRect(x + 2, y + 2, cell - 4, cell - 4);
      }
      var p = arcade.damasBoard[r][c];
      if (p) {
        var cx = x + cell / 2, cy = y + cell / 2, rad = cell * 0.36;
        if (p.cor === 'b') {
          var g = ctx.createRadialGradient(cx - 4, cy - 4, 2, cx, cy, rad);
          g.addColorStop(0, '#fff');
          g.addColorStop(1, '#bdbdbd');
          ctx.fillStyle = g;
        } else {
          var g2 = ctx.createRadialGradient(cx - 4, cy - 4, 2, cx, cy, rad);
          g2.addColorStop(0, '#555');
          g2.addColorStop(1, '#111');
          ctx.fillStyle = g2;
        }
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.fill();
        if (p.dama) {
          ctx.fillStyle = '#ffc107';
          ctx.font = 'bold ' + Math.floor(cell * 0.45) + 'px serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('♛', cx, cy + 1);
        }
      }
    }
  }
  ctx.strokeStyle = '#5c3a21';
  ctx.lineWidth = 6;
  ctx.strokeRect(ox - 3, oy - 3, size + 6, size + 6);
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(8, oy + size + 10, w - 16, 52);
  ctx.fillStyle = '#e0f2f1';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(arcade.damasMsg || '', w / 2, oy + size + 28);
  ctx.fillStyle = '#90a4ae';
  ctx.font = '10px sans-serif';
  var modoTxt = arcade.damasModo === 'ia' ? 'Vs IA' : (arcade.damasModo === 'online' ? ('Online · sala ' + (arcade.damasOnlineCodigo || '—')) : '2P local');
  ctx.fillText(modoTxt + ' · Capturas ' + (arcade.damasCapturas.b || 0) + ' × ' + (arcade.damasCapturas.p || 0), w / 2, oy + size + 46);
  ctx.textAlign = 'left';
  desenharHUDArcade(ctx, w, 'DAMAS');
}

/* =========================================================
   TAMAGOTCHI — Mascote Capoeira (Assistente Virtual)
   Escolha um personagem pixel, cuide dele todos os dias.
   Aparece animado (estilo 3D) na área do Aluno e no Assistente.
   ========================================================= */
var TAMA_KEY = 'uc_tamagotchi';

var TAMA_CHARS = [
  { id: 'roots',   nome: 'Roots Ginga',      cor: '#e53935', cor2: '#fff',     pose: 'ginga',   emoji: '🥋' },
  { id: 'urban',   nome: 'Urban Skater',     cor: '#7b1fa2', cor2: '#ce93d8', pose: 'handstand', emoji: '🛹' },
  { id: 'neon',    nome: 'Neon Striker',     cor: '#e91e63', cor2: '#f8bbd0', pose: 'kick',     emoji: '⚡' },
  { id: 'tribal',  nome: 'Tribal Balance',   cor: '#6d4c41', cor2: '#d7ccc8', pose: 'bow',      emoji: '🏹' },
  { id: 'elder',   nome: 'Tribal Elder',     cor: '#546e7a', cor2: '#cfd8dc', pose: 'kick',     emoji: '🕶️' },
  { id: 'stealth', nome: 'Stealth Martial',  cor: '#212121', cor2: '#616161', pose: 'ninja',    emoji: '🥷' },
  { id: 'futuro',  nome: 'Futuro Bananeira', cor: '#ff6f00', cor2: '#ffe0b2', pose: 'bananeira', emoji: '🤸' },
  { id: 'classic', nome: 'Classic Chute',    cor: '#1565c0', cor2: '#bbdefb', pose: 'kick',     emoji: '🦵' },
  { id: 'reggae',  nome: 'Reggae Rhythm',    cor: '#2e7d32', cor2: '#ffeb3b', pose: 'stance',   emoji: '🎵' },
  { id: 'mystic',  nome: 'Mystic Flow',      cor: '#6a1b9a', cor2: '#e1bee7', pose: 'flow',     emoji: '✨' }
];

/* Paleta e movimento de cada mascote no motor de pixel art (herdado do protótipo
   "Universo Capoeira" enviado pelo usuário). Mapeado 1:1 pelos personagens
   originais do protótipo, na mesma ordem em que apareciam lá. */
var PIXEL_TAMA_CFG = {
  roots:   { pele: '#9a5b36', roupa: '#f8f1d6', detalhe: '#d73c2f', movimento: 'ginga' },     /* Roots Ginga */
  neon:    { pele: '#d99060', roupa: '#24233c', detalhe: '#f45bd1', movimento: 'chute' },     /* Neon Striker */
  tribal:  { pele: '#70442d', roupa: '#945634', detalhe: '#e3bf3b', movimento: 'danca' },     /* Tribal Balance */
  stealth: { pele: '#c68c63', roupa: '#282932', detalhe: '#f5cb2e', movimento: 'guarda' },    /* Stealth Martial */
  futuro:  { pele: '#bd7c52', roupa: '#f5e36a', detalhe: '#70d6e7', movimento: 'bananeira' }, /* Futuro Bananeira */
  mystic:  { pele: '#f0b487', roupa: '#d6f6ff', detalhe: '#57cff0', movimento: 'gelo' },      /* Mystic Flow */
  classic: { pele: '#c98259', roupa: '#242424', detalhe: '#f0d136', movimento: 'chute' },     /* Classic Chute */
  reggae:  { pele: '#7b482f', roupa: '#f6e5bf', detalhe: '#e33b30', movimento: 'ginga' },     /* Reggae Rhythm */
  urban:   { pele: '#754526', roupa: '#4c9b4c', detalhe: '#dc4836', movimento: 'danca' },     /* (era Mystic Flow Rasta no protótipo) */
  elder:   { pele: '#8f5737', roupa: '#dd6738', detalhe: '#3cc4b4', movimento: 'salto' }      /* (era Capoeira Lenda no protótipo) */
};

function tamaCharById(id) {
  for (var i = 0; i < TAMA_CHARS.length; i++) if (TAMA_CHARS[i].id === id) return TAMA_CHARS[i];
  return TAMA_CHARS[0];
}

/* ---------------------------------------------------------------
   Conhecimento/personalidade própria por avatar (ADM), usado pela
   IA (worker-ia-capoeira.js) quando o aluno logado tem esse mascote
   escolhido. Fica salvo em CONFIG.avatarConhecimento (Firestore,
   coleção "config"), como { charId: "texto" }.
   --------------------------------------------------------------- */
function htmlConhecimentoPorAvatar() {
  var html = '<h3 style="margin-top:12px; font-size:0.82rem;"><i class="fas fa-hat-wizard"></i> Conhecimento/personalidade por avatar</h3>' +
    '<p class="mini" style="margin-bottom:6px;">Cada mascote pode ter um jeito de falar ou um conhecimento extra próprio, somado à base geral acima quando o aluno estiver com esse avatar escolhido.</p>' +
    '<label class="campo-label">Avatar</label><select id="cfgAvatarSelecionado" onchange="carregarConhecimentoAvatarSelecionado()">';
  TAMA_CHARS.forEach(function (c) { html += '<option value="' + c.id + '">' + esc(c.nome) + '</option>'; });
  html += '</select>' +
    '<textarea id="cfgAvatarConhecimentoTexto" rows="3" placeholder="Ex: fala com gírias de reggae, sempre lembra letras de cantigas antigas...">' +
    esc((CONFIG.avatarConhecimento || {})[TAMA_CHARS[0].id] || '') + '</textarea>' +
    '<button type="button" class="btn btn-secondary btn-mini" onclick="salvarConhecimentoAvatar()"><i class="fas fa-save"></i> Salvar conhecimento deste avatar</button>';
  return html;
}

function carregarConhecimentoAvatarSelecionado() {
  var sel = $('cfgAvatarSelecionado'), area = $('cfgAvatarConhecimentoTexto');
  if (!sel || !area) return;
  var mapa = CONFIG.avatarConhecimento || {};
  area.value = mapa[sel.value] || '';
}

function salvarConhecimentoAvatar() {
  var sel = $('cfgAvatarSelecionado'), area = $('cfgAvatarConhecimentoTexto');
  if (!sel || !area) return;
  var mapa = Object.assign({}, CONFIG.avatarConhecimento || {});
  mapa[sel.value] = (area.value || '').trim();
  salvarConfigApp({ avatarConhecimento: mapa }).then(function () {
    mostrarToast('Conhecimento do avatar "' + tamaCharById(sel.value).nome + '" salvo.');
    registroLog('adm', 'Conhecimento do avatar ' + sel.value + ' atualizado.');
  });
}

/* Combina a base geral com o conhecimento próprio do avatar escolhido
   pelo aluno logado (se houver), pra enviar à IA. */
function montarBaseConhecimentoComAvatar() {
  var base = CONFIG.baseConhecimento || '';
  try {
    var d = carregarTama();
    if (d && d.charId) {
      var extra = (CONFIG.avatarConhecimento || {})[d.charId];
      var ch = tamaCharById(d.charId);
      if (extra) {
        base += '\n\n[Personalidade do mascote ' + ch.nome + ']: ' + extra;
      }
    }
  } catch (e) {}
  return base;
}

function carregarTama() {
  var d = null;
  try { d = JSON.parse(localStorage.getItem(TAMA_KEY) || 'null'); } catch (e) { d = null; }
  /* migração da chave antiga */
  if (!d) {
    try {
      var old = JSON.parse(localStorage.getItem('uc_tamagotchi_v89') || 'null');
      if (old) { d = old; d.charId = d.charId || 'roots'; }
    } catch (e2) {}
  }
  var hoje = dataLocalISO();
  if (!d) {
    d = {
      charId: null,
      nome: 'Axézinho',
      fome: 60, energia: 70, humor: 75, fitness: 50,
      nivel: 1, xp: 0,
      ultimaRefeicao: '', ultimoAlongamento: '', ultimoTreino: '',
      criadoEm: agoraISO(), diasCuidado: 0, ultimaVisita: hoje,
      _feedsHoje: 0, _selectMode: true
    };
  }
  if (!d.charId) d._selectMode = true;
  /* decadência diária se não cuidou */
  if (d.ultimaVisita && d.ultimaVisita !== hoje) {
    var dias = 1;
    try {
      var a = new Date(d.ultimaVisita + 'T12:00:00');
      var b = new Date(hoje + 'T12:00:00');
      dias = Math.max(1, Math.round((b - a) / 86400000));
    } catch (e3) {}
    d.fome = Math.max(5, (d.fome || 50) - 18 * dias);
    d.energia = Math.max(5, (d.energia || 50) - 12 * dias);
    d.humor = Math.max(5, (d.humor || 50) - 10 * dias);
    d.fitness = Math.max(5, (d.fitness || 40) - 8 * dias);
    d.ultimaVisita = hoje;
    d._feedsHoje = 0;
    salvarTama(d);
  }
  return d;
}

function salvarTama(d) {
  try { localStorage.setItem(TAMA_KEY, JSON.stringify(d)); } catch (e) {}
  arcade._tama = d;
  try { atualizarCompanheiroUI(); } catch (e4) {}
}

function tamaMood(d) {
  var m = ((d.fome || 0) + (d.energia || 0) + (d.humor || 0) + (d.fitness || 0)) / 4;
  if (m >= 80) return { face: '😄', txt: 'Radiante de axé!' };
  if (m >= 60) return { face: '🙂', txt: 'Bem e animado' };
  if (m >= 40) return { face: '😐', txt: 'Precisa de carinho' };
  if (m >= 20) return { face: '😟', txt: 'Cansado e com fome' };
  return { face: '😢', txt: 'Cuide de mim, por favor!' };
}

function tamaEscolherChar(charId) {
  var ch = tamaCharById(charId);
  var d = arcade._tama || carregarTama();
  d.charId = ch.id;
  d.nome = ch.nome;
  d._selectMode = false;
  salvarTama(d);
  arcade._tamaMsg = 'E aí! Eu sou o ' + ch.nome + ' ' + ch.emoji + ' — vamos treinar juntos?';
  arcade._tamaAnim = 16;
  drawTamagotchi();
  try { atualizarCompanheiroUI(); publicarPresencaAvatar(); renderTerreiroListas(); } catch (e) {}
}

function initTamagotchi() {
  arcade._tama = carregarTama();
  if (!arcade._tamaModo) arcade._tamaModo = 'pet';
  var d = arcade._tama;
  try { publicarPresencaAvatar(); } catch (e) {}
  if (d._selectMode || !d.charId) {
    arcade._tamaMsg = 'Escolha seu personagem de capoeira!';
  } else {
    arcade._tamaMsg = 'Olá! Eu sou o ' + (d.nome || 'Axézinho') + '. Alimente, alongue e treine comigo!';
  }
  arcade._tamaAnim = 0;
  arcade._tamaSelectPage = 0;
  arcade.score = Math.round(((d.fome || 0) + (d.energia || 0) + (d.humor || 0) + (d.fitness || 0)) / 4);
  arcade.progresso = 0;
  arcade.objetivo = 5 + (arcade.nivel || 1) * 2;
  var bar = document.getElementById('arcadeAcoesExtra');
  if (bar) {
    var box = document.getElementById('arcadeAcoesTama');
    if (!box) {
      box = document.createElement('div');
      box.id = 'arcadeAcoesTama';
      box.className = 'arcade-acoes-col';
      box.innerHTML =
        '<button type="button" class="arcade-btn arcade-btn-green" style="width:auto;min-width:72px;height:48px;border-radius:12px;font-size:0.65rem;padding:4px;" data-acao="tama-feed">🍎 Comer</button>' +
        '<button type="button" class="arcade-btn arcade-btn-gold" style="width:auto;min-width:72px;height:48px;border-radius:12px;font-size:0.65rem;padding:4px;" data-acao="tama-stretch">🧘 Alongar</button>' +
        '<button type="button" class="arcade-btn" style="width:auto;min-width:72px;height:48px;border-radius:12px;font-size:0.65rem;padding:4px;background:rgba(0,210,255,0.35);" data-acao="tama-train">🥋 Treinar</button>' +
        '<button type="button" class="arcade-btn" style="width:auto;min-width:72px;height:48px;border-radius:12px;font-size:0.65rem;padding:4px;background:rgba(255,105,180,0.35);" data-acao="tama-play">🎮 Brincar</button>' +
        '<button type="button" class="arcade-btn" style="width:auto;min-width:72px;height:48px;border-radius:12px;font-size:0.62rem;padding:4px;background:rgba(255,255,255,0.12);" data-acao="tama-trocar">🔄 Trocar</button>' +
        '<button type="button" class="arcade-btn" style="width:auto;min-width:72px;height:48px;border-radius:12px;font-size:0.62rem;padding:4px;background:rgba(255,193,7,0.25);" data-acao="tama-terreiro">👥 Terreiro</button>';
      bar.appendChild(box);
    }
    box.style.display = 'flex';
  }
  var acoesT = $('arcadeAcoesTetris'); if (acoesT) acoesT.style.display = 'none';
  var acoesP = $('arcadeAcoesPulo'); if (acoesP) acoesP.style.display = 'none';
  var acoesG = $('arcadeAcoesGeral'); if (acoesG) acoesG.style.display = 'none';
  /* toque no canvas para escolher personagem */
  if (arcade.canvas && !arcade._tamaClickBound) {
    arcade._tamaClickBound = true;
    arcade.canvas.addEventListener('click', function (ev) {
      if (arcade.tipo !== 'tamagotchi') return;
      var d2 = arcade._tama || carregarTama();
      if (!d2._selectMode && d2.charId) return;
      var rect = arcade.canvas.getBoundingClientRect();
      var sx = arcade.canvas.width / rect.width;
      var sy = arcade.canvas.height / rect.height;
      var mx = (ev.clientX - rect.left) * sx;
      var my = (ev.clientY - rect.top) * sy;
      var cols = 5, rows = 2, pad = 8;
      var cw = (arcade.canvas.width - pad * 2) / cols;
      var ch = 70;
      var top = 70;
      for (var i = 0; i < TAMA_CHARS.length; i++) {
        var c = i % cols, r = Math.floor(i / cols);
        var x0 = pad + c * cw, y0 = top + r * (ch + 8);
        if (mx >= x0 && mx <= x0 + cw - 4 && my >= y0 && my <= y0 + ch) {
          tamaEscolherChar(TAMA_CHARS[i].id);
          return;
        }
      }
    });
  }
  drawTamagotchi();
}

function tamaAcao(tipo) {
  var d = arcade._tama || carregarTama();
  if (tipo === 'trocar') {
    d._selectMode = true;
    d.charId = null;
    arcade._tamaModo = 'pet';
    salvarTama(d);
    arcade._tamaMsg = 'Escolha outro personagem!';
    drawTamagotchi();
    return;
  }
  if (tipo === 'terreiro') {
    arcade._tamaModo = (arcade._tamaModo === 'terreiro') ? 'pet' : 'terreiro';
    publicarPresencaAvatar();
    arcade._tamaMsg = arcade._tamaModo === 'terreiro' ? 'Bem-vindo ao Terreiro! Quem está online ou no treino aparece aqui.' : 'De volta ao cuidado do mascote.';
    drawTamagotchi();
    return;
  }
  if (d._selectMode || !d.charId) {
    arcade._tamaMsg = 'Escolha um personagem primeiro tocando nele!';
    drawTamagotchi();
    return;
  }
  var hoje = dataLocalISO();
  var msg = '';
  if (tipo === 'feed') {
    if (d.ultimaRefeicao === hoje && (d._feedsHoje || 0) >= 3) {
      msg = 'Já comi bastante hoje! Amanhã de novo 🍎';
    } else {
      d.fome = Math.min(100, (d.fome || 0) + 22);
      d.humor = Math.min(100, (d.humor || 0) + 8);
      d.ultimaRefeicao = hoje;
      d._feedsHoje = (d._feedsHoje || 0) + 1;
      d.xp = (d.xp || 0) + 10;
      arcade.score += 10;
      arcade.progresso = (arcade.progresso || 0) + 1;
      msg = 'Que delícia! Energia renovada 🍎';
    }
  } else if (tipo === 'stretch') {
    d.energia = Math.min(100, (d.energia || 0) + 15);
    d.fitness = Math.min(100, (d.fitness || 0) + 6);
    d.ultimoAlongamento = hoje;
    d.xp = (d.xp || 0) + 12;
    arcade.score += 12;
    arcade.progresso = (arcade.progresso || 0) + 1;
    msg = 'Alongamento completo — corpo solto pra ginga 🧘';
  } else if (tipo === 'train') {
    if ((d.energia || 0) < 20) {
      msg = 'Estou sem energia… me alimente ou deixe eu descansar!';
    } else {
      d.fitness = Math.min(100, (d.fitness || 0) + 16);
      d.energia = Math.max(10, (d.energia || 0) - 8);
      d.fome = Math.max(10, (d.fome || 0) - 10);
      d.humor = Math.min(100, (d.humor || 0) + 12);
      d.ultimoTreino = hoje;
      d.xp = (d.xp || 0) + 18;
      arcade.score += 18;
      arcade.progresso = (arcade.progresso || 0) + 1;
      msg = 'Ginga, meia-lua e negativa! Treino de capoeira top 🥋';
    }
  } else if (tipo === 'play') {
    d.humor = Math.min(100, (d.humor || 0) + 18);
    d.energia = Math.max(5, (d.energia || 0) - 5);
    d.xp = (d.xp || 0) + 8;
    arcade.score += 8;
    arcade.progresso = (arcade.progresso || 0) + 1;
    msg = 'Haha! Brincadeira boa 🎮';
  }
  var xpNeed = 30 + (d.nivel || 1) * 20;
  if ((d.xp || 0) >= xpNeed) {
    d.xp -= xpNeed;
    d.nivel = Math.min(10, (d.nivel || 1) + 1);
    d.diasCuidado = (d.diasCuidado || 0) + 1;
    msg += ' · Nível do mascote ' + d.nivel + '!';
    salvarNivelArcade('tamagotchi', d.nivel);
    arcade.nivel = d.nivel;
  }
  salvarTama(d);
  arcade._tamaMsg = msg;
  arcade._tamaAnim = 12;
  atualizarHUDNivelArcade();
  if (arcade.progresso >= arcade.objetivo) {
    try { subirNivelArcade(); } catch (e) {}
  }
  drawTamagotchi();
}

function tickTamagotchi() {
  arcade._tamaAnim = Math.max(0, (arcade._tamaAnim || 0) - 1);
  drawTamagotchi();
}

/* ---- desenho pixel estilizado do personagem ---- */
/* ---------------------------------------------------------------
   Motor de pixel art dos mascotes (adaptado do protótipo
   "Universo Capoeira" enviado pelo usuário). Desenha só o personagem
   (sem fundo/chão, que já são desenhados pelo chamador), num sistema
   de coordenadas local de 180x180 centrado aproximadamente em
   (90, 90); tamaDrawPixelChar() faz o translate/scale pra qualquer
   posição/tamanho de tela.
   --------------------------------------------------------------- */
function pxSombra(ctx) {
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(50, 145, 80, 6);
}

function pxCorpo(ctx, cfg, x, y) {
  ctx.fillStyle = '#211819';
  ctx.fillRect(x - 15, y - 11, 30, 34);
  ctx.fillStyle = cfg.roupa;
  ctx.fillRect(x - 11, y - 8, 22, 27);
  ctx.fillStyle = cfg.detalhe;
  ctx.fillRect(x - 12, y + 9, 24, 5);
}

function pxCabeca(ctx, cfg, x, y) {
  ctx.fillStyle = '#211515';
  ctx.fillRect(x - 15, y - 16, 30, 32);
  ctx.fillStyle = cfg.pele;
  ctx.fillRect(x - 11, y - 12, 22, 24);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x - 7, y - 3, 5, 5);
  ctx.fillRect(x + 3, y - 3, 5, 5);
  ctx.fillStyle = '#222222';
  ctx.fillRect(x - 5, y - 2, 2, 2);
  ctx.fillRect(x + 5, y - 2, 2, 2);
}

function pxBraco(ctx, cfg, x, y, angulo) {
  var rad = angulo * Math.PI / 180;
  var comp = 28;
  var x2 = x + Math.cos(rad) * comp, y2 = y + Math.sin(rad) * comp;
  ctx.strokeStyle = '#211819'; ctx.lineWidth = 10; ctx.lineCap = 'square';
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.strokeStyle = cfg.roupa; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke();
}

function pxPerna(ctx, cfg, x, y, angulo, comp) {
  var rad = angulo * Math.PI / 180;
  var x2 = x + Math.sin(rad) * comp, y2 = y + Math.cos(rad) * comp;
  ctx.strokeStyle = '#211819'; ctx.lineWidth = 11; ctx.lineCap = 'square';
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.strokeStyle = cfg.roupa; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke();
}

function pxBananeira(ctx, cfg, movimento) {
  pxSombra(ctx);
  pxCabeca(ctx, cfg, 90, 130);
  pxCorpo(ctx, cfg, 90, 100);
  pxBraco(ctx, cfg, 82, 110, 160);
  pxBraco(ctx, cfg, 98, 110, 20);
  pxPerna(ctx, cfg, 83, 87, -145 + movimento * 10, 48);
  pxPerna(ctx, cfg, 97, 87, -35 - movimento * 10, 48);
}

function pxBrilho(ctx, cfg) {
  ctx.globalAlpha = 0.8;
  ctx.fillStyle = cfg.detalhe;
  ctx.fillRect(138, 58, 7, 7);
  ctx.fillRect(150, 72, 5, 5);
  ctx.fillRect(128, 44, 4, 4);
  ctx.globalAlpha = 1;
}

/* Desenha o mascote (sem fundo) no sistema de coordenadas 180x180. */
function desenharPersonagemPixelNucleo(ctx, cfg, tempo) {
  var movimento = Math.sin(tempo / 250);
  var pulso = Math.sin(tempo / 300);
  var x = 90 + movimento * 8;
  var y = 70 + pulso * 3;

  if (cfg.movimento === 'bananeira') { pxBananeira(ctx, cfg, movimento); return; }

  pxSombra(ctx);

  if (cfg.movimento === 'chute') {
    pxCorpo(ctx, cfg, x, y);
    pxCabeca(ctx, cfg, x, y - 29);
    pxBraco(ctx, cfg, x - 8, y + 12, -40);
    pxBraco(ctx, cfg, x + 8, y + 12, 40);
    pxPerna(ctx, cfg, x - 8, y + 38, -20, 38);
    pxPerna(ctx, cfg, x + 8, y + 38, 30 + Math.abs(movimento) * 45, 48);
    pxBrilho(ctx, cfg);
    return;
  }

  pxCorpo(ctx, cfg, x, y);
  pxCabeca(ctx, cfg, x, y - 29);

  if (cfg.movimento === 'guarda') {
    pxBraco(ctx, cfg, x - 8, y + 12, -25);
    pxBraco(ctx, cfg, x + 8, y + 12, 25);
  } else if (cfg.movimento === 'danca') {
    pxBraco(ctx, cfg, x - 8, y + 12, -70 - movimento * 20);
    pxBraco(ctx, cfg, x + 8, y + 12, 70 + movimento * 20);
  } else if (cfg.movimento === 'salto') {
    y -= Math.abs(movimento) * 18;
    pxBraco(ctx, cfg, x - 8, y + 12, -55);
    pxBraco(ctx, cfg, x + 8, y + 12, 55);
  } else {
    pxBraco(ctx, cfg, x - 8, y + 12, -35 - movimento * 25);
    pxBraco(ctx, cfg, x + 8, y + 12, 35 + movimento * 25);
  }

  pxPerna(ctx, cfg, x - 8, y + 38, -18, 38);
  pxPerna(ctx, cfg, x + 8, y + 38, 18, 38);

  if (cfg.movimento === 'gelo') pxBrilho(ctx, cfg);
}

function tamaDrawPixelChar(ctx, ch, cx, cy, scale, bob) {
  scale = scale || 1;
  bob = bob || 0;
  var cfg = (ch && PIXEL_TAMA_CFG[ch.id]) || PIXEL_TAMA_CFG.roots;
  var tempo = Date.now();
  ctx.save();
  ctx.translate(cx - 90 * scale, cy + bob - 90 * scale);
  ctx.scale(scale, scale);
  desenharPersonagemPixelNucleo(ctx, cfg, tempo);
  ctx.restore();
}

function drawTamagotchi() {
  var ctx = arcade.ctx;
  if (!ctx) return;
  var w = arcade.canvas.width, h = arcade.canvas.height;
  var d = arcade._tama || carregarTama();
  var mood = tamaMood(d);

  /* modo Terreiro Virtual — todos os avatares online/treino */
  if (arcade._tamaModo === 'terreiro') {
    drawTerreiroCanvas();
    return;
  }

  /* fundo */
  var g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#0d3d1f');
  g.addColorStop(0.5, '#0a2a38');
  g.addColorStop(1, '#061018');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  /* modo seleção de personagem */
  if (d._selectMode || !d.charId) {
    ctx.fillStyle = '#00e676';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ESCOLHA SEU PERSONAGEM', w / 2, 36);
    ctx.fillStyle = '#90a4ae';
    ctx.font = '11px sans-serif';
    ctx.fillText('Toque em um capoeirista', w / 2, 54);
    var cols = 5, pad = 8;
    var cw = (w - pad * 2) / cols;
    var chH = 70;
    var top = 70;
    for (var i = 0; i < TAMA_CHARS.length; i++) {
      var c = i % cols, r = Math.floor(i / cols);
      var x0 = pad + c * cw, y0 = top + r * (chH + 8);
      ctx.fillStyle = 'rgba(22,35,43,0.9)';
      ctx.strokeStyle = TAMA_CHARS[i].cor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x0 + 2, y0, cw - 6, chH, 8);
      else ctx.rect(x0 + 2, y0, cw - 6, chH);
      ctx.fill();
      ctx.stroke();
      tamaDrawPixelChar(ctx, TAMA_CHARS[i], x0 + cw / 2, y0 + 28, 0.55, 0);
      ctx.fillStyle = '#e0f2f1';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      var nm = TAMA_CHARS[i].nome.split(' ')[0];
      ctx.fillText(nm, x0 + cw / 2, y0 + chH - 10);
    }
    ctx.textAlign = 'left';
    desenharHUDArcade(ctx, w, 'MASCOTE');
    return;
  }

  /* chão */
  ctx.fillStyle = 'rgba(0,230,118,0.12)';
  ctx.fillRect(0, h - 70, w, 70);

  var ch = tamaCharById(d.charId);
  var bob = arcade._tamaAnim ? Math.sin(arcade._tamaAnim * 0.8) * 5 : Math.sin(Date.now() / 400) * 2;
  var cx = w / 2, cy = h * 0.36;
  tamaDrawPixelChar(ctx, ch, cx, cy, 1.35, bob);

  /* nome e humor */
  ctx.fillStyle = ch.cor;
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText((d.nome || ch.nome) + ' ' + mood.face, cx, cy + 62);
  ctx.fillStyle = '#90a4ae';
  ctx.font = '11px sans-serif';
  ctx.fillText(mood.txt, cx, cy + 78);
  ctx.fillText('Nv.' + (d.nivel || 1) + ' · XP ' + (d.xp || 0) + ' · ' + ch.emoji, cx, cy + 94);

  /* barras de status */
  function barra(label, val, y, cor) {
    ctx.textAlign = 'left';
    ctx.fillStyle = '#cfd8dc';
    ctx.font = '10px sans-serif';
    ctx.fillText(label, 16, y);
    ctx.fillStyle = '#1a2a32';
    ctx.fillRect(70, y - 9, w - 90, 10);
    ctx.fillStyle = cor;
    ctx.fillRect(70, y - 9, Math.max(2, (w - 90) * (Math.max(0, Math.min(100, val)) / 100)), 10);
    ctx.fillStyle = '#fff';
    ctx.font = '9px sans-serif';
    ctx.fillText(Math.round(val) + '%', w - 36, y);
  }
  barra('Fome', d.fome || 0, h - 52, '#ff9800');
  barra('Energia', d.energia || 0, h - 38, '#00d2ff');
  barra('Humor', d.humor || 0, h - 24, '#e040fb');
  barra('Forma', d.fitness || 0, h - 10, '#00e676');

  if (arcade._tamaMsg) {
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(10, 28, w - 20, 36);
    ctx.fillStyle = '#e0f2f1';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    var linhas = String(arcade._tamaMsg).match(/.{1,36}(\s|$)/g) || [arcade._tamaMsg];
    linhas.slice(0, 2).forEach(function (ln, i) {
      ctx.fillText(ln.trim(), w / 2, 42 + i * 14);
    });
  }
  ctx.textAlign = 'left';
  desenharHUDArcade(ctx, w, 'MASCOTE');
}

/* ---- Companheiro 3D na área do aluno / assistente ---- */
function htmlCompanheiro3D(mini) {
  var d = null;
  try { d = carregarTama(); } catch (e) { return ''; }
  if (!d || !d.charId) {
    return '<div class="card card-interacao" id="cardCompanheiro">' +
      '<h3 style="color:var(--accent-blue);"><i class="fas fa-globe"></i> Seu Avatar no Mundo</h3>' +
      '<p class="mini">Ainda sem avatar. Entre no <b>Mundo</b> para escolher e cuidar do seu capoeirista!</p>' +
      '<button class="btn btn-secondary btn-mini" onclick="Simulador.entrarMundoAberto()"><i class="fas fa-globe"></i> Abrir Mundo</button></div>';
  }
  var ch = tamaCharById(d.charId);
  var mood = tamaMood(d);
  var size = mini ? 64 : 96;
  var mediaHumor = ((d.fome || 0) + (d.energia || 0) + (d.humor || 0) + (d.fitness || 0)) / 4;
  var corAnel = mediaHumor >= 60 ? '#00e676' : (mediaHumor >= 35 ? '#ffc107' : '#ff5252');
  return '<div class="card card-interacao" id="cardCompanheiro">' +
    '<h3 style="color:' + ch.cor + ';"><i class="fas fa-child-reaching"></i> ' + esc(d.nome || ch.nome) + ' ' + mood.face + '</h3>' +
    '<div class="companheiro-3d-wrap" style="display:flex;justify-content:center;margin:10px 0;">' +
      '<div style="position:relative;width:' + size + 'px;height:' + (size + 14) + 'px;">' +
        '<div style="position:absolute;left:50%;bottom:0;transform:translateX(-50%);width:' + (size * 0.7) + 'px;height:' + (size * 0.16) + 'px;border-radius:50%;background:rgba(0,0,0,0.35);filter:blur(2px);"></div>' +
        '<div class="companheiro-3d" style="position:absolute;left:50%;bottom:' + (size * 0.12) + 'px;transform:translateX(-50%);width:' + size + 'px;height:' + size + 'px;animation:companheiroBob 2.4s ease-in-out infinite, companheiroBalanco 3.6s ease-in-out infinite;">' +
          '<div style="position:absolute;inset:-4px;border-radius:50%;box-shadow:0 0 0 2px ' + corAnel + ', 0 0 16px 3px ' + corAnel + '66;animation:mascoteAnelPulso 2.4s ease-in-out infinite;"></div>' +
          '<div style="position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle at 32% 26%, ' + ch.cor2 + ', ' + ch.cor + ' 72%);border:3px solid ' + ch.cor + ';box-shadow:inset 0 -10px 16px rgba(0,0,0,0.28), inset 0 6px 10px rgba(255,255,255,0.3), 0 8px 18px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-size:' + (size * 0.45) + 'px;">' +
            ch.emoji +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<p class="mini" style="text-align:center;">' + esc(mood.txt) + ' · Nv.' + (d.nivel || 1) + '</p>' +
    '<div class="grade-2" style="margin-top:6px;">' +
      '<span class="mini">🍎 ' + Math.round(d.fome || 0) + '%</span>' +
      '<span class="mini">⚡ ' + Math.round(d.energia || 0) + '%</span>' +
      '<span class="mini">😊 ' + Math.round(d.humor || 0) + '%</span>' +
      '<span class="mini">🥋 ' + Math.round(d.fitness || 0) + '%</span>' +
    '</div>' +
    '<button class="btn btn-secondary btn-mini" style="margin-top:8px;" onclick="Simulador.entrarMundoAberto()"><i class="fas fa-globe"></i> Abrir Mundo</button>' +
    '</div>';
}

function atualizarCompanheiroUI() {
  var box = document.getElementById('cardCompanheiro');
  if (box && box.parentNode) {
    var novo = document.createElement('div');
    novo.innerHTML = htmlCompanheiro3D(false);
    var el = novo.firstChild;
    if (el) box.parentNode.replaceChild(el, box);
  }
  var ass = document.getElementById('assistenteCompanheiroSlot');
  if (ass) ass.innerHTML = htmlCompanheiro3D(true);
  try { atualizarMascoteLivre(); } catch (e) {}
}

/* =========================================================
   MASCOTE LIVRE — o mascote solto, andando pela tela
   Aparece flutuando nas abas Aluno e Professor.
   ========================================================= */
var MASCOTE_LIVRE_ABAS = ['tab3', 'tab4'];
var _mascoteLivreTimer = null;
var _mascoteLivreDir = 1;

function mascoteLivreConteudo() {
  var d = null;
  try { d = carregarTama(); } catch (e) { return ''; }
  if (!d || !d.charId) return '';
  var ch = tamaCharById(d.charId);
  var mood = tamaMood(d);
  var media = ((d.fome || 0) + (d.energia || 0) + (d.humor || 0) + (d.fitness || 0)) / 4;
  var corAnel = media >= 60 ? '#00e676' : (media >= 35 ? '#ffc107' : '#ff5252');
  return '' +
    '<div class="mascote-livre-sombra"></div>' +
    '<div class="mascote-livre-anel" style="box-shadow:0 0 0 2px ' + corAnel + ', 0 0 14px 3px ' + corAnel + '66;"></div>' +
    '<div class="mascote-livre-esfera" style="background:radial-gradient(circle at 32% 26%, ' + ch.cor2 + ', ' + ch.cor + ' 72%);border-color:' + ch.cor + ';">' +
      '<span>' + ch.emoji + '</span>' +
      '<span class="mascote-livre-face">' + mood.face + '</span>' +
    '</div>' +
    '<div class="mascote-livre-balao">' + esc(d.nome || ch.nome) + '</div>';
}

function garantirMascoteLivreEl() {
  var el = document.getElementById('mascoteLivre');
  if (el) return el;
  el = document.createElement('div');
  el.id = 'mascoteLivre';
  el.className = 'mascote-livre';
  el.style.display = 'none';
  el.style.left = '30px';
  el.title = 'Cuidar do mascote';
  el.onclick = function () { abrirJogoArcade('tamagotchi'); };
  document.body.appendChild(el);
  return el;
}

function atualizarMascoteLivre() {
  /* Mascote flutuante desativado — tudo unificado no Mundo (não ocupa espaço) */
  var el = document.getElementById('mascoteLivre');
  if (el) el.style.display = 'none';
}

function iniciarPasseioMascoteLivre() {
  if (_mascoteLivreTimer) return;
  function passo() {
    var el = document.getElementById('mascoteLivre');
    if (!el || el.style.display === 'none') return;
    var largura = window.innerWidth || document.documentElement.clientWidth || 360;
    var margem = 20;
    var alvoMax = Math.max(margem, largura - margem - 64);
    var atual = parseFloat(el.style.left || '30');
    var alvo = margem + Math.random() * (alvoMax - margem);
    _mascoteLivreDir = alvo >= atual ? 1 : -1;
    el.style.setProperty('--dir', _mascoteLivreDir);
    el.classList.add('andando');
    el.style.left = alvo + 'px';
    setTimeout(function () { if (el) el.classList.remove('andando'); }, 3200);
  }
  passo();
  _mascoteLivreTimer = setInterval(passo, 4000);
}


/* =========================================================
   TERREIRO VIRTUAL — avatares online / na hora do treino
   ========================================================= */
var PRESENCA_TTL_MS = 120000; /* 2 min = online */
var _presencaTimer = null;

function alunoEmHorarioDeTreino() {
  var aula = typeof aulaDeHoje === 'function' ? aulaDeHoje() : null;
  if (!aula) return false;
  var agora = new Date();
  var hm = (agora.getHours() * 60) + agora.getMinutes();
  var ini = (typeof minutosDoHM === 'function' ? minutosDoHM(aula.horaInicio) : null);
  var fim = (typeof minutosDoHM === 'function' ? minutosDoHM(aula.horaFim) : null);
  if (ini == null) return false;
  if (fim == null) fim = ini + 90;
  /* margem de 20 min antes e 30 depois */
  return hm >= (ini - 20) && hm <= (fim + 30);
}

function statusPresencaAluno(aluno) {
  if (!aluno) return 'offline';
  var ck = typeof obterCheckinDoDia === 'function' ? obterCheckinDoDia(aluno) : null;
  if (ck && (ck.status === 'aprovado' || ck.status === 'pendente')) return 'treino';
  if (alunoEmHorarioDeTreino()) return 'treino';
  return 'online';
}

function publicarPresencaAvatar() {
  var aluno = typeof alunoLogado === 'function' ? alunoLogado() : null;
  if (!aluno || !aluno.id) return;
  var st = statusPresencaAluno(aluno);
  var payload = null;

  /* Preferência: avatar do Simulador (sistema unificado) */
  if (aluno.avatarSimulador && typeof Simulador !== 'undefined' && Simulador.obterPersonagem) {
    var pSim = Simulador.obterPersonagem(aluno.avatarSimulador);
    if (pSim) {
      payload = {
        alunoId: aluno.id,
        alunoNome: aluno.nome || '',
        alunoApelido: aluno.apelidoAvatarSimulador || aluno.apelido || '',
        charId: aluno.avatarSimulador,
        charNome: pSim.nome,
        charCor: '#00e676',
        charEmoji: '🥋',
        nivel: aluno.nivelSimulador || 1,
        status: st,
        lastSeen: agoraISO(),
        atualizadoEm: agoraISO(),
        origem: 'simulador'
      };
    }
  }

  /* Fallback: mascote Tamagotchi (arcade) se ainda não tiver Simulador */
  if (!payload) {
    var tama = null;
    try { tama = carregarTama(); } catch (e) { tama = null; }
    if (tama && tama.charId) {
      var ch = tamaCharById(tama.charId);
      payload = {
        alunoId: aluno.id,
        alunoNome: aluno.nome || '',
        alunoApelido: aluno.apelido || '',
        charId: tama.charId,
        charNome: ch.nome,
        charCor: ch.cor,
        charEmoji: ch.emoji,
        nivel: tama.nivel || 1,
        status: st,
        lastSeen: agoraISO(),
        atualizadoEm: agoraISO(),
        origem: 'tamagotchi'
      };
    }
  }

  if (!payload) return;
  DB.salvar('avataresOnline', payload, aluno.id).catch(function () {});
}

function limparPresencaAvatar() {
  var aluno = typeof alunoLogado === 'function' ? alunoLogado() : null;
  if (!aluno || !aluno.id) return;
  try { DB.excluir('avataresOnline', aluno.id); } catch (e) {}
}

function listarAvataresVisiveis() {
  var agora = Date.now();
  var lista = DB.listar('avataresOnline') || [];
  var out = [];
  lista.forEach(function (a) {
    if (!a || !a.charId) return;
    var ts = 0;
    try { ts = new Date(a.lastSeen || a.atualizadoEm || 0).getTime(); } catch (e) { ts = 0; }
    if (!ts || (agora - ts) > PRESENCA_TTL_MS) return;
    out.push(a);
  });
  /* se eu estou logado com avatar e ainda não apareci (atraso de sync), me incluo */
  try {
    var eu = alunoLogado();
    if (eu) {
      var ja = out.some(function (x) { return x.alunoId === eu.id; });
      if (!ja) {
        if (eu.avatarSimulador && typeof Simulador !== 'undefined' && Simulador.obterPersonagem) {
          var pSim = Simulador.obterPersonagem(eu.avatarSimulador);
          if (pSim) {
            out.push({
              alunoId: eu.id,
              alunoNome: eu.nome,
              alunoApelido: eu.apelidoAvatarSimulador || eu.apelido || '',
              charId: eu.avatarSimulador,
              charNome: pSim.nome,
              charCor: '#00e676',
              charEmoji: '🥋',
              nivel: eu.nivelSimulador || 1,
              status: statusPresencaAluno(eu),
              lastSeen: agoraISO(),
              _local: true,
              origem: 'simulador'
            });
          }
        } else {
          var tama = null;
          try { tama = carregarTama(); } catch (et) { tama = null; }
          if (tama && tama.charId) {
            var ch = tamaCharById(tama.charId);
            out.push({
              alunoId: eu.id,
              alunoNome: eu.nome,
              alunoApelido: eu.apelido || '',
              charId: tama.charId,
              charNome: ch.nome,
              charCor: ch.cor,
              charEmoji: ch.emoji,
              nivel: tama.nivel || 1,
              status: statusPresencaAluno(eu),
              lastSeen: agoraISO(),
              _local: true,
              origem: 'tamagotchi'
            });
          }
        }
      }
    }
  } catch (e2) {}
  out.sort(function (a, b) {
    var sa = a.status === 'treino' ? 0 : 1;
    var sb = b.status === 'treino' ? 0 : 1;
    if (sa !== sb) return sa - sb;
    return String(a.alunoNome || '').localeCompare(String(b.alunoNome || ''));
  });
  return out;
}

function iniciarHeartbeatPresenca() {
  if (_presencaTimer) return;
  publicarPresencaAvatar();
  _presencaTimer = setInterval(function () {
    publicarPresencaAvatar();
    try { renderTerreiroListas(); } catch (e) {}
  }, 25000);
  /* ao fechar a aba, tenta limpar */
  try {
    window.addEventListener('beforeunload', function () {
      try { limparPresencaAvatar(); } catch (e) {}
    });
  } catch (e3) {}
}

function htmlAvatarChip(a, mini) {
  var ch = tamaCharById(a.charId);
  var cor = a.charCor || ch.cor;
  var emoji = a.charEmoji || ch.emoji;
  var nome = a.alunoApelido || a.alunoNome || ch.nome;
  var treino = a.status === 'treino';
  var size = mini ? 44 : 56;
  return '<div class="terreiro-chip" title="' + esc(nome) + '" style="text-align:center;">' +
    '<div style="width:' + size + 'px;height:' + size + 'px;margin:0 auto;border-radius:50%;' +
      'background:radial-gradient(circle at 35% 30%,' + (ch.cor2 || '#fff') + '66,' + cor + ');' +
      'border:2px solid ' + (treino ? 'var(--gold)' : cor) + ';' +
      'box-shadow:0 0 12px ' + (treino ? 'rgba(255,193,7,0.45)' : 'rgba(0,230,118,0.25)') + ';' +
      'display:flex;align-items:center;justify-content:center;font-size:' + (size * 0.42) + 'px;' +
      'animation:companheiroBob 2.4s ease-in-out infinite;' +
      (treino ? 'animation-delay:0.3s;' : '') + '">' + emoji + '</div>' +
    '<div class="mini" style="margin-top:3px;max-width:72px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' +
      esc(String(nome).split(' ')[0]) + '</div>' +
    '<span class="pill ' + (treino ? 'pill-ok' : 'pill-info') + '" style="font-size:0.55rem;">' +
      (treino ? '🥋 Treino' : '🟢 Online') + '</span></div>';
}

function renderTerreiroListas() {
  var lista = listarAvataresVisiveis();
  var box = $('listaTerreiroJogos');
  if (box) {
    if (!lista.length) {
      box.innerHTML = '<p class="sem-dados" style="grid-column:1/-1;">Ninguém no terreiro agora. Faça login, escolha um mascote e fique online!</p>';
    } else {
      box.innerHTML = lista.map(function (a) { return htmlAvatarChip(a, true); }).join('');
    }
  }
  var boxAluno = $('listaTerreiroAluno');
  if (boxAluno) {
    if (!lista.length) {
      boxAluno.innerHTML = '<p class="sem-dados">Terreiro vazio no momento.</p>';
    } else {
      boxAluno.innerHTML = '<div class="grade-3" style="gap:8px;">' +
        lista.map(function (a) { return htmlAvatarChip(a, false); }).join('') + '</div>';
    }
  }
}

function htmlCardTerreiroAluno() {
  /* Card removido da aba Aluno — Terreiro fica só no Mundo */
  return '';
}
function entrarTerreiroDoApp() {
  /* Unificado: Terreiro agora vive no Mundo (Simulador) */
  if (typeof Simulador !== 'undefined' && Simulador.entrarMundoAberto) {
    Simulador.entrarMundoAberto();
  } else {
    abrirAba('tabSimulador');
  }
}


function drawTerreiroCanvas() {
  var ctx = arcade.ctx;
  if (!ctx) return;
  var w = arcade.canvas.width, h = arcade.canvas.height;
  var g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#1a0a00');
  g.addColorStop(0.4, '#0d2818');
  g.addColorStop(1, '#061018');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  /* chão do terreiro (círculo da roda) */
  ctx.strokeStyle = 'rgba(255,193,7,0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(w / 2, h * 0.62, w * 0.38, h * 0.12, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,193,7,0.06)';
  ctx.fill();

  ctx.fillStyle = '#ffc107';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('TERREIRO VIRTUAL', w / 2, 28);
  ctx.fillStyle = '#90a4ae';
  ctx.font = '11px sans-serif';
  ctx.fillText('Online agora · treino de hoje brilha em dourado', w / 2, 44);

  var lista = listarAvataresVisiveis();
  if (!lista.length) {
    ctx.fillStyle = '#90a4ae';
    ctx.font = '12px sans-serif';
    ctx.fillText('Aguardando capoeiristas...', w / 2, h * 0.5);
    ctx.fillText('Faça login e escolha seu mascote', w / 2, h * 0.5 + 18);
  } else {
    var n = lista.length;
    var cols = Math.min(5, Math.max(2, Math.ceil(Math.sqrt(n))));
    var rows = Math.ceil(n / cols);
    var cellW = (w - 24) / cols;
    var cellH = Math.min(90, (h - 100) / rows);
    lista.forEach(function (a, i) {
      var c = i % cols, r = Math.floor(i / cols);
      var cx = 12 + c * cellW + cellW / 2;
      var cy = 70 + r * cellH + cellH * 0.4;
      var ch = tamaCharById(a.charId);
      var bob = Math.sin(Date.now() / 380 + i) * 3;
      tamaDrawPixelChar(ctx, ch, cx, cy + bob, 0.7, 0);
      ctx.fillStyle = a.status === 'treino' ? '#ffc107' : '#e0f2f1';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      var nome = (a.alunoApelido || a.alunoNome || ch.nome).split(' ')[0];
      ctx.fillText(nome, cx, cy + 36);
      ctx.fillStyle = a.status === 'treino' ? '#ffc107' : '#00e676';
      ctx.font = '8px sans-serif';
      ctx.fillText(a.status === 'treino' ? 'treino' : 'online', cx, cy + 46);
    });
  }
  ctx.textAlign = 'left';
  desenharHUDArcade(ctx, w, 'TERREIRO');
}

/* CSS keyframes injetados uma vez */
(function injetarCSSCompanheiro() {
  if (document.getElementById('cssCompanheiro3d')) return;
  var st = document.createElement('style');
  st.id = 'cssCompanheiro3d';
  st.textContent =
    '@keyframes companheiroBalanco{0%,100%{rotate:-4deg}50%{rotate:4deg}}' +
    '@keyframes companheiroBob{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(-6px)}}' +
    '@keyframes mascoteAnelPulso{0%,100%{opacity:.55;transform:scale(1)}50%{opacity:.95;transform:scale(1.08)}}' +
    '.companheiro-3d-wrap .companheiro-3d{transform-origin:center bottom;}' +
    '.mascote-livre{position:fixed;bottom:92px;left:30px;width:64px;height:82px;z-index:70;cursor:pointer;transition:left 3.2s cubic-bezier(.4,0,.2,1);}' +
    '.mascote-livre-sombra{position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:36px;height:9px;border-radius:50%;background:rgba(0,0,0,0.4);filter:blur(2px);}' +
    '.mascote-livre-anel{position:absolute;bottom:16px;left:50%;transform:translate(-50%,50%);width:54px;height:54px;border-radius:50%;animation:mascoteAnelPulso 2.4s ease-in-out infinite;}' +
    '.mascote-livre-esfera{position:absolute;bottom:16px;left:50%;transform:translate(-50%,50%);width:50px;height:50px;border-radius:50%;border:2px solid;display:flex;align-items:center;justify-content:center;font-size:25px;box-shadow:0 6px 14px rgba(0,0,0,0.45), inset 0 -6px 10px rgba(0,0,0,0.22), inset 0 4px 8px rgba(255,255,255,0.28);animation:mascoteLivreBob 2s ease-in-out infinite;}' +
    '.mascote-livre-face{position:absolute;top:-6px;right:-6px;font-size:14px;}' +
    '.mascote-livre-balao{position:absolute;bottom:100%;left:50%;transform:translateX(-50%);margin-bottom:4px;background:rgba(15,20,25,0.9);color:#fff;font-size:10px;padding:2px 7px;border-radius:8px;white-space:nowrap;opacity:0;transition:opacity .25s;pointer-events:none;}' +
    '.mascote-livre:hover .mascote-livre-balao{opacity:1;}' +
    '.mascote-livre.andando .mascote-livre-esfera{animation:mascoteLivreAndar .45s ease-in-out infinite, mascoteLivreVirar .1s linear;}' +
    '.mascote-livre.andando{transform:scaleX(calc(var(--dir,1)));}' +
    '@keyframes mascoteLivreBob{0%,100%{transform:translate(-50%,50%) translateY(0)}50%{transform:translate(-50%,50%) translateY(-6px)}}' +
    '@keyframes mascoteLivreAndar{0%,100%{transform:translate(-50%,50%) translateY(0) scale(1,1)}50%{transform:translate(-50%,50%) translateY(-9px) scale(0.94,1.08)}}' +
    '@media (max-width:480px){.mascote-livre{bottom:84px;}}' +
    '@media (prefers-reduced-motion:reduce){.companheiro-3d{animation:none!important;}.mascote-livre *{animation:none!important;}}';
  document.head.appendChild(st);
})();

/* =========================================================
   PAC-MAN — labirinto clássico, 4 fantasmas, power pellets
   (adicionado sem alterar os demais jogos)
   ========================================================= */
var PAC_MAPA = [
  '111111111111111111111111',
  '122222222221122222222221',
  '121111211121121112111121',
  '131111211121121112111131',
  '122222222222222222222221',
  '121111211112211112111121',
  '122222211122211122222221',
  '111111211121121112111111',
  '111111211121121112111111',
  '111111211122221112111111',
  '111111211122221112111111',
  '111111211112211112111111',
  '111111210000000012111111',
  '222222210000000012222222',
  '111111210000000012111111',
  '111111211111111112111111',
  '111111211122221112111111',
  '111111211122221112111111',
  '111111211121121112111111',
  '111111211121121112111111',
  '122222222222222222222221',
  '121111211112211122111121',
  '132221211122211121222231',
  '111121211121121112121111',
  '122222222221122222222221',
  '111111111111111111111111'
];

function initPacman() {
  aplicarModoNoArcade('pacman', arcade.nivel || 1);
  var TILE = 14;
  arcade.pacTile = TILE;
  arcade.pacCols = 24;
  arcade.pacRows = 26;
  arcade.pacGrid = PAC_MAPA.map(function (row) { return row.split('').map(Number); });
  /* abre a porta da casa (linhas 11–12) para os fantasmas saírem */
  try {
    arcade.pacGrid[11][11] = 0;
    arcade.pacGrid[11][12] = 0;
    arcade.pacGrid[12][11] = 0;
    arcade.pacGrid[12][12] = 0;
  } catch (e) {}
  arcade.pacDots = 0;
  arcade.pacGrid.forEach(function (row) {
    row.forEach(function (c) { if (c === 2 || c === 3) arcade.pacDots++; });
  });
  arcade.pacDotsTotal = arcade.pacDots;
  arcade.pac = { x: 11.5, y: 20.5, dir: 'left', mouth: 0 };
  arcade.pacNext = 'left';
  arcade.pacFright = 0;
  arcade.pacFrame = 0;
  arcade.pacVidas = 3;
  /* Blinky já fora; demais saem com atraso (release em frames) */
  arcade.pacGhosts = [
    { x: 11.5, y: 9.5, dir: 'left', color: '#ff0000', name: 'Blinky', home: { x: 21, y: 1 }, release: 0, stuck: 0 },
    { x: 10.5, y: 13.5, dir: 'up', color: '#00ffff', name: 'Inky', home: { x: 2, y: 1 }, release: 80, stuck: 0 },
    { x: 11.5, y: 13.5, dir: 'up', color: '#ffb8ff', name: 'Pinky', home: { x: 2, y: 24 }, release: 160, stuck: 0 },
    { x: 12.5, y: 13.5, dir: 'up', color: '#ffb852', name: 'Clyde', home: { x: 21, y: 24 }, release: 240, stuck: 0 }
  ];
  arcade.progresso = 0;
  arcade.objetivo = arcade.pacDotsTotal || 1;
  var modo = arcade._modoEspecial;
  if (modo && modo.id === 'caca') {
    arcade.pacFright = 220;
  }
  drawPacman();
}

function pacCelula(x, y) {
  var c = Math.floor(x), r = Math.floor(y);
  if (r < 0 || r >= arcade.pacRows) return 1;
  if (c < 0) return arcade.pacGrid[r][arcade.pacCols - 1];
  if (c >= arcade.pacCols) return arcade.pacGrid[r][0];
  return arcade.pacGrid[r][c];
}

function pacPode(x, y) { return pacCelula(x, y) !== 1; }

function pacCentro(v) { return Math.floor(v) + 0.5; }

function pacMover(ent, vel) {
  var nx = ent.x, ny = ent.y;
  if (ent.dir === 'left') nx -= vel;
  if (ent.dir === 'right') nx += vel;
  if (ent.dir === 'up') ny -= vel;
  if (ent.dir === 'down') ny += vel;
  if (nx < -0.5) nx = arcade.pacCols - 0.5;
  if (nx > arcade.pacCols - 0.5) nx = -0.5;
  var noCentro = Math.abs(ent.x - pacCentro(ent.x)) < 0.14 && Math.abs(ent.y - pacCentro(ent.y)) < 0.14;
  if (noCentro && ent.next && ent.next !== ent.dir) {
    var tx = pacCentro(ent.x), ty = pacCentro(ent.y);
    var ox = tx, oy = ty;
    if (ent.next === 'left') ox -= 1;
    if (ent.next === 'right') ox += 1;
    if (ent.next === 'up') oy -= 1;
    if (ent.next === 'down') oy += 1;
    if (pacPode(ox, oy)) {
      ent.dir = ent.next;
      ent.x = tx; ent.y = ty;
      return;
    }
  }
  var testX = nx, testY = ny;
  if (ent.dir === 'left') testX = nx - 0.4;
  if (ent.dir === 'right') testX = nx + 0.4;
  if (ent.dir === 'up') testY = ny - 0.4;
  if (ent.dir === 'down') testY = ny + 0.4;
  if (pacPode(testX, testY)) {
    ent.x = nx; ent.y = ny;
  } else {
    if (ent.dir === 'left' || ent.dir === 'right') ent.x = pacCentro(ent.x);
    if (ent.dir === 'up' || ent.dir === 'down') ent.y = pacCentro(ent.y);
  }
}

function pacDirsOk(gx, gy, dirAtual, permitirReverso) {
  var opostos = { left: 'right', right: 'left', up: 'down', down: 'up' };
  var dirs = ['up', 'left', 'down', 'right'];
  var ok = [];
  dirs.forEach(function (d) {
    if (!permitirReverso && d === opostos[dirAtual]) return;
    var tx = Math.floor(gx) + 0.5, ty = Math.floor(gy) + 0.5;
    if (d === 'left') tx -= 1;
    if (d === 'right') tx += 1;
    if (d === 'up') ty -= 1;
    if (d === 'down') ty += 1;
    if (pacPode(tx, ty)) ok.push(d);
  });
  if (!ok.length && !permitirReverso) {
    var rev = opostos[dirAtual];
    var rx = Math.floor(gx) + 0.5, ry = Math.floor(gy) + 0.5;
    if (rev === 'left') rx -= 1; else if (rev === 'right') rx += 1;
    else if (rev === 'up') ry -= 1; else if (rev === 'down') ry += 1;
    if (pacPode(rx, ry)) ok.push(rev);
  }
  if (!ok.length) ok.push(dirAtual || 'left');
  return ok;
}

function pacEscolherGhost(g) {
  var noCentro = Math.abs(g.x - pacCentro(g.x)) < 0.18 && Math.abs(g.y - pacCentro(g.y)) < 0.18;
  if (!noCentro) return;

  /* ainda na casa: alinhar com a porta (x≈11.5) e só então subir.
     Inky (10.5) e Clyde (12.5) não nascem sob a abertura — subir direto
     esbarra na parede e eles ficam presos. */
  var naCasa = g.y > 10.5 && g.y < 15.5 && g.x > 9.2 && g.x < 14.8;
  if (naCasa) {
    var portaX = 11.5;
    if (Math.abs(g.x - portaX) > 0.25) {
      g.next = g.x < portaX ? 'right' : 'left';
      return;
    }
    if (pacPode(g.x, g.y - 1)) { g.next = 'up'; return; }
    var optsCasa = pacDirsOk(g.x, g.y, g.dir, true);
    g.next = optsCasa.indexOf('up') >= 0 ? 'up' : (optsCasa[0] || 'up');
    return;
  }

  var alvoX = arcade.pac.x, alvoY = arcade.pac.y;
  if (arcade.pacFright > 0) {
    var optsF = pacDirsOk(g.x, g.y, g.dir, false);
    g.next = optsF[Math.floor(Math.random() * optsF.length)];
    return;
  }
  if (g.name === 'Pinky') {
    if (arcade.pac.dir === 'left') alvoX -= 4;
    if (arcade.pac.dir === 'right') alvoX += 4;
    if (arcade.pac.dir === 'up') alvoY -= 4;
    if (arcade.pac.dir === 'down') alvoY += 4;
  }
  if (g.name === 'Clyde' && Math.hypot(g.x - arcade.pac.x, g.y - arcade.pac.y) < 8) {
    alvoX = g.home.x; alvoY = g.home.y;
  }
  if (g.name === 'Inky' && arcade.pacGhosts[0]) {
    alvoX = arcade.pac.x + (arcade.pac.x - arcade.pacGhosts[0].x);
    alvoY = arcade.pac.y + (arcade.pac.y - arcade.pacGhosts[0].y);
  }
  var opts = pacDirsOk(g.x, g.y, g.dir, false);
  /* Minimax 1–2 ply: avalia direção que mais aproxima do alvo
     (e prevê 1 passo do pac-man quando nível >= 4) */
  var best = opts[0], bestS = -1e9;
  var nv = arcade.nivel || 1;
  opts.forEach(function (d) {
    var tx = Math.floor(g.x) + 0.5, ty = Math.floor(g.y) + 0.5;
    if (d === 'left') tx -= 1; if (d === 'right') tx += 1;
    if (d === 'up') ty -= 1; if (d === 'down') ty += 1;
    var dist = Math.hypot(tx - alvoX, ty - alvoY);
    var score = -dist;
    /* 2º ply: se pac continuar na direção atual, onde fica a distância */
    if (nv >= 4) {
      var px = arcade.pac.x, py = arcade.pac.y;
      if (arcade.pac.dir === 'left') px -= 1;
      else if (arcade.pac.dir === 'right') px += 1;
      else if (arcade.pac.dir === 'up') py -= 1;
      else if (arcade.pac.dir === 'down') py += 1;
      score = -Math.hypot(tx - px, ty - py) * 1.15 - dist * 0.25;
    }
    /* nível alto: prefere interceptar (mínimo da distância futura) */
    if (nv >= 7) {
      var opts2 = pacDirsOk(tx, ty, d, false);
      var minD2 = 1e9;
      opts2.forEach(function (d2) {
        var t2x = Math.floor(tx) + 0.5, t2y = Math.floor(ty) + 0.5;
        if (d2 === 'left') t2x -= 1; if (d2 === 'right') t2x += 1;
        if (d2 === 'up') t2y -= 1; if (d2 === 'down') t2y += 1;
        minD2 = Math.min(minD2, Math.hypot(t2x - alvoX, t2y - alvoY));
      });
      score = -minD2;
    }
    if (score > bestS) { bestS = score; best = d; }
  });
  g.next = best || g.dir;
}

function tickPacman() {
  if (!arcade.rodando || arcade.pausado) return;
  arcade.pacFrame++;
  arcade.pac.mouth += 0.35;
  if (arcade.pacNext) arcade.pac.next = arcade.pacNext;
  var velP = 0.13 + (arcade.nivel - 1) * 0.006;
  var velG = 0.11 + (arcade.nivel - 1) * 0.008;
  var modoP = arcade._modoEspecial;
  if (modoP && (modoP.id === 'pressa' || modoP.id === 'mestre')) velG *= 1.35;
  if (arcade.pacFright > 0) { velG *= 0.55; arcade.pacFright--; }

  pacMover(arcade.pac, velP);

  var pc = Math.floor(arcade.pac.x), pr = Math.floor(arcade.pac.y);
  if (pr >= 0 && pr < arcade.pacRows && pc >= 0 && pc < arcade.pacCols) {
    if (arcade.pacGrid[pr][pc] === 2) {
      arcade.pacGrid[pr][pc] = 0;
      arcade.score += 10;
      arcade.pacDots--;
      arcade.progresso = (arcade.pacDotsTotal || 0) - arcade.pacDots;
      atualizarHUDNivelArcade();
    } else if (arcade.pacGrid[pr][pc] === 3) {
      arcade.pacGrid[pr][pc] = 0;
      arcade.score += 50;
      arcade.pacDots--;
      arcade.progresso = (arcade.pacDotsTotal || 0) - arcade.pacDots;
      var frightBase = Math.max(140, Math.round(340 - 200 * curvaDificuldade(arcade.nivel)));
      if (modoP && modoP.id === 'poder') frightBase = Math.round(frightBase * 1.6);
      arcade.pacFright = frightBase;
      atualizarHUDNivelArcade();
    }
  }

  arcade.pacGhosts.forEach(function (g) {
    if ((g.release || 0) > 0) {
      g.release--;
      /* enquanto espera, só sobe um pouco se já liberado parcialmente */
      if (g.release > 0 && g.y > 12) {
        /* fica quieto na casa */
        return;
      }
    }

    var ox = g.x, oy = g.y;
    pacEscolherGhost(g);
    /* só aplica next no centro — pacMover já faz isso; não forçar dir todo frame */
    pacMover(g, velG);

    if (Math.abs(g.x - ox) < 0.001 && Math.abs(g.y - oy) < 0.001) {
      g.stuck = (g.stuck || 0) + 1;
      if (g.stuck > 8) {
        /* destravar: permite reverso e escolhe direção aleatória válida */
        var opts = pacDirsOk(g.x, g.y, g.dir, true);
        g.dir = opts[Math.floor(Math.random() * opts.length)];
        g.next = g.dir;
        g.x = pacCentro(g.x);
        g.y = pacCentro(g.y);
        g.stuck = 0;
        pacMover(g, velG);
      }
    } else {
      g.stuck = 0;
    }

    if (Math.hypot(g.x - arcade.pac.x, g.y - arcade.pac.y) < 0.7) {
      if (arcade.pacFright > 0) {
        arcade.score += 200;
        g.x = 11.5; g.y = 13.5; g.dir = 'up'; g.next = 'up'; g.release = 40; g.stuck = 0;
      } else {
        arcade.pacVidas--;
        if (arcade.pacVidas <= 0) {
          gameOverArcade();
          return;
        }
        arcade.pac.x = 11.5; arcade.pac.y = 20.5; arcade.pac.dir = 'left'; arcade.pacNext = 'left';
        arcade.pacGhosts[0].x = 11.5; arcade.pacGhosts[0].y = 9.5; arcade.pacGhosts[0].dir = 'left'; arcade.pacGhosts[0].release = 0;
        arcade.pacGhosts[1].x = 10.5; arcade.pacGhosts[1].y = 13.5; arcade.pacGhosts[1].dir = 'up'; arcade.pacGhosts[1].release = 60;
        arcade.pacGhosts[2].x = 11.5; arcade.pacGhosts[2].y = 13.5; arcade.pacGhosts[2].dir = 'up'; arcade.pacGhosts[2].release = 120;
        arcade.pacGhosts[3].x = 12.5; arcade.pacGhosts[3].y = 13.5; arcade.pacGhosts[3].dir = 'up'; arcade.pacGhosts[3].release = 180;
        arcade.pacFright = 0;
      }
    }
  });

  if (arcade.pacDots <= 0 && (arcade.pacDotsTotal || 0) > 0) {
    arcade.score += 500;
    arcade.progresso = arcade.objetivo = arcade.pacDotsTotal;
    /* evita loop: zera total para não reentrar no mesmo frame */
    arcade.pacDotsTotal = 0;
    salvarNivelArcade('pacman', Math.min(10, (arcade.nivel || 1) + 1));
    subirNivelArcade();
  }

  drawPacman();
}

function drawPacman() {
  var ctx = arcade.ctx;
  if (!ctx) return;
  var TILE = arcade.pacTile;
  var COLS = arcade.pacCols, ROWS = arcade.pacRows;
  var cen = arcade._cenario || cenarioArcade('pacman', arcade.nivel || 1);
  pintarFundoCenario(ctx, arcade.canvas.width, arcade.canvas.height, cen);
  var paredeCor = (cen && cen.parede) || '#1a3a6e';
  var accentCor = (cen && cen.accent) || '#3d7cff';
  var modoDraw = arcade._modoEspecial;
  var pxPac = arcade.pac.x * TILE, pyPac = arcade.pac.y * TILE;

  for (var r = 0; r < ROWS; r++) {
    for (var c = 0; c < COLS; c++) {
      var cell = arcade.pacGrid[r][c];
      if (cell === 1) {
        /* modo escuridão: paredes só perto do pac */
        if (modoDraw && modoDraw.id === 'escuridao') {
          var distM = Math.hypot(c * TILE + TILE / 2 - pxPac, r * TILE + TILE / 2 - pyPac);
          if (distM > 70) continue;
        }
        ctx.fillStyle = paredeCor;
        ctx.fillRect(c * TILE + 1, r * TILE + 1, TILE - 2, TILE - 2);
        ctx.strokeStyle = accentCor;
        ctx.lineWidth = 1.2;
        ctx.strokeRect(c * TILE + 1.5, r * TILE + 1.5, TILE - 3, TILE - 3);
      } else if (cell === 2) {
        ctx.fillStyle = '#ffcc80';
        ctx.beginPath();
        ctx.arc(c * TILE + TILE / 2, r * TILE + TILE / 2, 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (cell === 3) {
        var pulse = 4 + Math.sin(arcade.pacFrame * 0.15) * 1.2;
        ctx.fillStyle = '#fff8e1';
        ctx.shadowColor = '#ffeb3b';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(c * TILE + TILE / 2, r * TILE + TILE / 2, pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
  }

  /* Pac-Man */
  var px = arcade.pac.x * TILE, py = arcade.pac.y * TILE;
  var ang = { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 }[arcade.pac.dir] || 0;
  var mouth = 0.25 + 0.22 * Math.sin(arcade.pac.mouth);
  ctx.fillStyle = '#ffe600';
  ctx.beginPath();
  ctx.arc(px, py, TILE * 0.42, ang + mouth, ang + Math.PI * 2 - mouth);
  ctx.lineTo(px, py);
  ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(px + Math.cos(ang - 0.6) * TILE * 0.15, py + Math.sin(ang - 0.6) * TILE * 0.15 - 2, 1.6, 0, Math.PI * 2);
  ctx.fill();

  /* Fantasmas */
  arcade.pacGhosts.forEach(function (g) {
    var gx = g.x * TILE, gy = g.y * TILE;
    var cor = arcade.pacFright > 0
      ? (arcade.pacFright < 60 && arcade.pacFrame % 10 < 5 ? '#fff' : '#2121ff')
      : g.color;
    ctx.fillStyle = cor;
    ctx.beginPath();
    ctx.arc(gx, gy - 2, TILE * 0.38, Math.PI, 0);
    ctx.lineTo(gx + TILE * 0.38, gy + TILE * 0.35);
    for (var i = 0; i < 4; i++) {
      var wx = gx - TILE * 0.38 + (i + 0.5) * (TILE * 0.76 / 4);
      ctx.lineTo(wx, gy + TILE * 0.35 - (i % 2 === 0 ? 4 : 0));
    }
    ctx.lineTo(gx - TILE * 0.38, gy + TILE * 0.35);
    ctx.closePath();
    ctx.fill();
    if (arcade.pacFright <= 0) {
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(gx - 4, gy - 4, 3.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(gx + 4, gy - 4, 3.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#1a237e';
      var ox = g.dir === 'left' ? -1.2 : (g.dir === 'right' ? 1.2 : 0);
      var oy = g.dir === 'up' ? -1.2 : (g.dir === 'down' ? 1.2 : 0);
      ctx.beginPath(); ctx.arc(gx - 4 + ox, gy - 4 + oy, 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(gx + 4 + ox, gy - 4 + oy, 1.5, 0, Math.PI * 2); ctx.fill();
    }
  });

  /* vidas */
  ctx.fillStyle = '#ffe600';
  for (var v = 0; v < arcade.pacVidas; v++) {
    ctx.beginPath();
    ctx.arc(12 + v * 14, arcade.canvas.height - 10, 5, 0.4, Math.PI * 2 - 0.4);
    ctx.lineTo(12 + v * 14, arcade.canvas.height - 10);
    ctx.fill();
  }
  desenharBannerModo(ctx, arcade.canvas.width, arcade._modoEspecial, arcade._cenario);
  desenharHUDArcade(ctx, arcade.canvas.width, 'PAC-MAN');
}

function gameOverArcade() {
  arcade.rodando = false;
  if (arcade.timer) { clearInterval(arcade.timer); arcade.timer = null; }
  salvarNivelArcade(arcade.tipo, arcade.nivel || 1);
  var ctx = arcade.ctx;
  if (ctx) {
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(0, 0, arcade.canvas.width, arcade.canvas.height);
    ctx.fillStyle = '#00e676';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', arcade.canvas.width / 2, arcade.canvas.height / 2 - 16);
    ctx.fillStyle = '#ffc107';
    ctx.font = '15px sans-serif';
    ctx.fillText('Pontos: ' + arcade.score + ' · Nível ' + (arcade.nivel || 1), arcade.canvas.width / 2, arcade.canvas.height / 2 + 12);
    ctx.fillStyle = '#90a4ae';
    ctx.font = '12px sans-serif';
    ctx.fillText('Grátis · progresso na nuvem / aparelho', arcade.canvas.width / 2, arcade.canvas.height / 2 + 34);
    ctx.textAlign = 'left';
  }
  setTimeout(function () { fecharJogoArcade(); }, 1800);
}

function renderPerguntaSemanaInicio() {
  var box = $('boxPerguntaSemanaInicio');
  if (!box) {
    /* cria o card dinamicamente após o card de avisos se ainda não existir */
    var tab = $('tab1');
    if (!tab) return;
    var div = document.createElement('div');
    div.id = 'boxPerguntaSemanaInicio';
    div.className = 'card';
    div.style.display = 'none';
    var avisoCard = $('boxNotificacaoAluno');
    if (avisoCard && avisoCard.parentNode) {
      avisoCard.parentNode.insertBefore(div, avisoCard.nextSibling);
    } else {
      tab.insertBefore(div, tab.firstChild);
    }
    box = div;
  }
  var aluno = alunoLogado();
  var p = perguntaAtiva();
  if (!p) { box.style.display = 'none'; return; }
  box.style.display = 'block';
  box.className = 'card card-destaque brilho-azul';
  box.style.border = '1px solid var(--accent-blue)';
  var ja = aluno && DB.listar('respostasPergunta').some(function (r) { return r.perguntaId === p.id && r.alunoId === aluno.id; });
  var html = '<h3 style="color:var(--accent-blue);"><i class="fas fa-question-circle"></i> Pergunta da Semana</h3>' +
    '<p style="font-size:0.8rem;margin-bottom:6px;">' + esc(p.pergunta) + '</p>' +
    '<span class="mini">Por ' + esc(p.autor || 'Professor') + ' • ' + dataHoraBR(p.criadoEm) + '</span>';
  if (!aluno) {
    html += '<p class="mini" style="margin-top:6px;">Faça login na aba Aluno para responder.</p>';
  } else if (ja) {
    html += '<p class="mini" style="color:var(--primary-green);margin-top:6px;"><i class="fas fa-check"></i> Você já respondeu. Obrigado!</p>';
  } else {
    html += '<label class="campo-label">Sua resposta</label>' +
      '<textarea id="respostaPerguntaTexto" placeholder="Responda em poucas palavras..."></textarea>' +
      '<button class="btn btn-secondary" onclick="responderPerguntaSemana(this)"><i class="fas fa-check"></i> Enviar resposta</button>';
  }
  box.innerHTML = html;
}

function renderFeedInstagramNota() {
  var el = $('feedInstagramInicio');
  if (!el) return;
  el.innerHTML = '<p class="mini"><i class="fas fa-info-circle"></i> Para exibir o feed incorporado é necessário gerar um token no Instagram Basic Display API. Enquanto isso, use o botão acima para abrir o perfil.</p>';
}

function renderHorarioFixoInicio() {
  var card = $('cardHorarioFixoInicio');
  var box = $('listaHorarioFixoInicio');
  var horarios = DB.listar('horarios').slice().sort(function (a, b) {
    return Number(a.diaSemana) - Number(b.diaSemana);
  });
  if (!horarios.length) { card.style.display = 'none'; return; }
  card.style.display = 'block';

  var html = '';
  horarios.forEach(function (h) {
    var polo = DB.buscar('polos', h.poloId);
    var hoje = Number(h.diaSemana) === new Date().getDay();
    html += '<div class="lista-item"' + (hoje ? ' style="border-color:var(--primary-green);"' : '') + '>' +
      '<div class="linha"><b>' + esc(DIAS_SEMANA[Number(h.diaSemana)] || '?') + (hoje ? ' <span class="pill pill-ok">HOJE</span>' : '') + '</b>' +
      '<span class="mini">' + esc(h.horaInicio) + ' - ' + esc(h.horaFim) + '</span></div>' +
      '<div class="mini">' + esc(h.modalidade || 'Treino') + (polo ? ' • ' + esc(polo.nome) : '') + '</div>' +
      '</div>';
  });
  box.innerHTML = html;

  /* botão "vou comparecer hoje" */
  var aulaHoje = aulaDeHoje();
  var btn = $('btnConfirmarPresencaHoje');
  var txt = $('txtJaConfirmouHoje');
  var aluno = alunoLogado() || nomeCheckinAtual();
  var jaConfirmou = false;
  if (aluno) {
    jaConfirmou = DB.listar('presencas').some(function (p) {
      return p.data === dataLocalISO() && p.tipo === 'antecipada' && normalizar(p.alunoNome) === normalizar(aluno);
    });
  }
  if (aulaHoje && !jaConfirmou) { btn.style.display = 'flex'; txt.style.display = 'none'; }
  else if (jaConfirmou) { btn.style.display = 'none'; txt.style.display = 'block'; }
  else { btn.style.display = 'none'; txt.style.display = 'none'; }
}

function aulaDeHoje() {
  var dia = new Date().getDay();
  var lista = DB.listar('horarios').filter(function (h) { return Number(h.diaSemana) === dia; });
  lista.sort(function (a, b) { return (minutosDoHM(a.horaInicio) || 0) - (minutosDoHM(b.horaInicio) || 0); });
  return lista.length ? lista[0] : null;
}

function nomeCheckinAtual() {
  var campo = $('checkinFixoNomeAluno');
  return campo ? (campo.value || '').trim() : '';
}

function confirmarPresencaHoje() {
  var aula = aulaDeHoje();
  var nome = alunoLogado() ? alunoLogado().nome : nomeCheckinAtual();
  if (!nome) { mostrarToast('Faça login ou preencha seu nome no Check-in.', 'erro'); return; }
  if (!aula) { mostrarToast('Nenhuma aula cadastrada para hoje.', 'erro'); return; }
  var aluno = alunoLogado() || encontrarAlunoPorNome(nome);
  if (jaFezCheckinHoje(aluno || nome)) {
    mostrarToast('Você já registrou presença para hoje. Só é permitido um check-in por aula.', 'erro');
    renderHorarioFixoInicio();
    return;
  }
  DB.salvar('presencas', {
    alunoId: aluno ? aluno.id : '',
    alunoNome: aluno ? aluno.nome : nome,
    alunoApelido: aluno ? (aluno.apelido || '') : '',
    poloId: aula.poloId || '',
    poloNome: (DB.buscar('polos', aula.poloId) || {}).nome || '',
    horarioId: aula.id,
    data: dataLocalISO(),
    hora: horaLocalHM(),
    tipo: 'antecipada',
    status: 'pendente',
    atrasoMin: 0,
    justificativa: '',
    criadoEm: agoraISO()
  }).then(function () {
    mostrarToast('Presença de hoje registrada. Bom treino!');
    renderHorarioFixoInicio();
    renderCheckin();
  });
}

function encontrarAlunoPorNome(nome) {
  var n = normalizar(nome);
  var achado = null;
  DB.listar('alunos').forEach(function (a) {
    if (!achado && (normalizar(a.nome) === n || normalizar(a.apelido) === n)) achado = a;
  });
  return achado;
}

/* Retorna o check-in do aluno na data (ignora rejeitados). Um por aluno/dia. */
function obterCheckinDoDia(nomeOuAluno, dataISO) {
  dataISO = dataISO || dataLocalISO();
  var aluno = null;
  var nomeNorm = '';
  if (typeof nomeOuAluno === 'object' && nomeOuAluno) {
    aluno = nomeOuAluno;
    nomeNorm = normalizar(aluno.nome);
  } else {
    nomeNorm = normalizar(nomeOuAluno);
    aluno = encontrarAlunoPorNome(nomeOuAluno);
  }
  if (!nomeNorm && !aluno) return null;
  var lista = DB.listar('presencas');
  for (var i = 0; i < lista.length; i++) {
    var p = lista[i];
    if (p.data !== dataISO) continue;
    if (p.status === 'rejeitado') continue;
    if (aluno && p.alunoId && p.alunoId === aluno.id) return p;
    if (nomeNorm && normalizar(p.alunoNome) === nomeNorm) return p;
    if (aluno && aluno.apelido && normalizar(p.alunoNome) === normalizar(aluno.apelido)) return p;
    if (aluno && aluno.apelido && normalizar(p.alunoApelido || '') === normalizar(aluno.apelido)) return p;
  }
  return null;
}

function jaFezCheckinHoje(nomeOuAluno) {
  return !!obterCheckinDoDia(nomeOuAluno);
}

function renderAvisoLocal() {
  var avisos = DB.listar('avisos').slice().sort(function (a, b) {
    return String(b.criadoEm || '').localeCompare(String(a.criadoEm || ''));
  });
  var box = $('boxNotificacaoAluno');
  if (!avisos.length) { box.style.display = 'none'; return; }
  var a = avisos[0];
  box.style.display = 'block';
  var aluno = alunoLogado();
  var leu = aluno ? alunoLeuAviso(a.id, aluno.id) : false;
  var nLeituras = contagemLeiturasAviso(a.id);
  $('textoNotificacaoLocal').innerHTML =
    '<strong>' + esc(a.titulo || 'Aviso') + '</strong><br>' + esc(a.texto || '') +
    '<br><span class="mini">' + esc(a.autor || 'Professor') + ' • ' + dataHoraBR(a.criadoEm) +
    (nLeituras ? ' • ' + nLeituras + ' leram' : '') + '</span>' +
    (a.poloNome ? '<br><span class="mini"><i class="fas fa-map-marker-alt"></i> ' + esc(a.poloNome) + '</span>' : '') +
    (aluno
      ? (leu
          ? '<br><span class="mini" style="color:var(--primary-green);"><i class="fas fa-check-circle"></i> Você confirmou a leitura</span>'
          : '<br><button class="btn btn-secondary btn-mini" style="margin-top:6px;" onclick="marcarAvisoLido(\'' + a.id + '\')"><i class="fas fa-eye"></i> Confirmar leitura</button>')
      : '<br><span class="mini">Faça login na aba Aluno para confirmar leitura</span>');
  var link = $('linkGmapsNotificacao');
  if (a.gmaps) { link.href = a.gmaps; link.style.display = 'inline-block'; } else { link.style.display = 'none'; }

  if (ultimoAvisoNotificado !== a.id) {
    if (ultimoAvisoNotificado !== null) { notificar('Aviso do professor', (a.titulo || '') + ' — ' + (a.texto || '')); }
    ultimoAvisoNotificado = a.id;
  }
}

function renderRanking() {
  var card = $('cardRankingInicio');
  var contagem = {};
  DB.listar('presencas').forEach(function (p) {
    if (p.status !== 'aprovado') return;
    var k = normalizar(p.alunoNome);
    if (!k) return;
    if (!contagem[k]) contagem[k] = { nome: p.alunoNome, apelido: p.alunoApelido || '', total: 0 };
    contagem[k].total++;
  });
  var lista = Object.keys(contagem).map(function (k) { return contagem[k]; })
    .sort(function (a, b) { return b.total - a.total; }).slice(0, 5);
  if (!lista.length) { card.style.display = 'none'; return; }
  card.style.display = 'block';
  var html = '';
  lista.forEach(function (a, i) {
    var medalha = ['🥇', '🥈', '🥉'][i] || (i + 1) + 'º';
    html += '<div class="lista-item"><div class="linha"><span>' + medalha + ' <b>' + esc(a.nome) + '</b>' +
      (a.apelido ? ' (' + esc(a.apelido) + ')' : '') + '</span>' +
      '<span class="badge-count">' + a.total + ' presenças</span></div></div>';
  });
  $('conteudoRankingInicio').innerHTML = html;
}

function mediaAvaliacao(av) {
  if (av && av.notas && typeof av.notas === 'object') {
    var valores = Object.keys(av.notas).map(function (k) { return Number(av.notas[k]); }).filter(function (v) { return !isNaN(v); });
    if (!valores.length) return 0;
    var soma100 = valores.reduce(function (s, v) { return s + v; }, 0);
    return (soma100 / valores.length) / 10;
  }
  var campos = ['tecnica', 'disciplina', 'ritmo', 'musicalidade', 'compromisso'];
  var soma = 0, n = 0;
  campos.forEach(function (c) {
    var v = parseFloat(av[c]);
    if (!isNaN(v)) { soma += v; n++; }
  });
  return n ? soma / n : 0;
}

/* Análise de desempenho atlético com base em presenças, avaliações e engajamento */
function identificarAlunosParaAdvertencia() {
  var alunos = DB.listar('alunos');
  var presencas = DB.listar('presencas');
  var avaliacoes = DB.listar('avaliacoes');
  var testes = DB.listar('testesConhecimento');
  var resultado = [];

  alunos.forEach(function (a) {
    var motivos = [];
    var presDoAluno = presencas.filter(function (p) { return p.alunoId === a.id || normalizar(p.alunoNome) === normalizar(a.nome); });
    var rejeitadas = presDoAluno.filter(function (p) { return p.status === 'rejeitado'; });
    var comAtraso = presDoAluno.filter(function (p) { return (p.atrasoMin || 0) > 0; });

    if (rejeitadas.length >= 2) motivos.push(rejeitadas.length + ' presença(s) recusada(s) pelo professor');
    if (comAtraso.length >= 3) motivos.push(comAtraso.length + ' chegada(s) com atraso registrada(s)');

    var avalsDoAluno = avaliacoes.filter(function (v) { return v.alunoId === a.id; });
    var ultimaAval = avalsDoAluno.sort(function (x, y) { return String(y.data || '').localeCompare(String(x.data || '')); })[0];
    if (ultimaAval && ultimaAval.dificuldades && ultimaAval.dificuldades.length >= 4) {
      motivos.push(ultimaAval.dificuldades.length + ' pontos de atenção na última avaliação');
    }

    var testesDoAluno = testes.filter(function (t) { return t.alunoId === a.id; });
    if (testesDoAluno.length >= 2) {
      var media = testesDoAluno.reduce(function (s, t) { return s + (t.acertos / t.total); }, 0) / testesDoAluno.length;
      if (media < 0.5) motivos.push('média baixa nos testes de conhecimento (' + Math.round(media * 100) + '%)');
    }

    if (motivos.length) resultado.push({ aluno: a, motivos: motivos });
  });

  return resultado;
}

function gerarAdvertenciaIA(alunoId) {
  if (!CONFIG.iaProxyUrl) { mostrarToast('Configure a URL do Assistente IA antes (ADM > Configurações).', 'erro'); return; }
  var aluno = DB.buscar('alunos', alunoId);
  if (!aluno) return;
  var flags = identificarAlunosParaAdvertencia().filter(function (f) { return f.aluno.id === alunoId; })[0];
  var motivos = flags ? flags.motivos : [];

  abrirModal('Gerando advertência...', '<p class="mini"><span class="spinner-btn"></span> A IA está redigindo, aguarde...</p>', '');

  fetch(CONFIG.iaProxyUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      gerarAdvertencia: true,
      aluno: { nome: aluno.apelido || aluno.nome, motivos: motivos },
      baseConhecimento: montarBaseConhecimentoComAvatar()
    })
  }).then(function (r) { return r.json(); })
    .then(function (data) {
      var texto = (data && data.texto) ? data.texto : ('Não consegui gerar agora: ' + ((data && data.erro) || 'erro desconhecido.'));
      abrirModal('Advertência para ' + (aluno.apelido || aluno.nome),
        '<p class="mini" style="margin-bottom:6px;">Motivos identificados: ' + esc(motivos.join('; ') || '-') + '</p>' +
        '<label class="campo-label">Revise ou edite antes de enviar:</label>' +
        '<textarea id="textoAdvertenciaGerada" rows="6">' + esc(texto) + '</textarea>',
        '<button class="btn btn-danger" onclick="enviarAdvertenciaAluno(\'' + alunoId + '\')"><i class="fas fa-paper-plane"></i> Enviar ao Aluno</button>' +
        '<button class="btn btn-back" onclick="fecharModal()">Cancelar</button>');
    })
    .catch(function () {
      abrirModal('Erro', '<p class="mini">Não consegui falar com a IA agora. Tente de novo.</p>', '<button class="btn btn-back" onclick="fecharModal()">Fechar</button>');
    });
}

function enviarAdvertenciaAluno(alunoId) {
  var aluno = DB.buscar('alunos', alunoId);
  var texto = ($('textoAdvertenciaGerada').value || '').trim();
  if (!aluno || !texto) { mostrarToast('Escreva o texto da advertência.', 'erro'); return; }

  DB.salvar('mensagensPrivadas', {
    alunoId: aluno.id,
    alunoNome: aluno.nome,
    alunoApelido: aluno.apelido || '',
    texto: texto.slice(0, 1200),
    de: 'professor',
    tipo: 'advertencia',
    professorNome: sessaoEquipe ? sessaoEquipe.nome : 'Professor',
    lidaPeloAluno: false,
    lidaPeloProfessor: true,
    criadoEm: agoraISO()
  }).then(function () {
    fecharModal();
    mostrarToast('Advertência enviada a ' + (aluno.apelido || aluno.nome) + '.');
    registroLog('professor', 'Advertência enviada a ' + aluno.nome + ' (gerada por IA).');
  });
}

function analisarDesempenhoAtletico(aluno) {
  if (!aluno) return null;
  var campos = ['tecnica', 'disciplina', 'ritmo', 'musicalidade', 'compromisso'];
  var labels = {
    tecnica: 'Técnica',
    disciplina: 'Disciplina',
    ritmo: 'Ritmo',
    musicalidade: 'Musicalidade',
    compromisso: 'Compromisso'
  };

  var presencas = DB.listar('presencas').filter(function (p) {
    return p.alunoId === aluno.id || normalizar(p.alunoNome) === normalizar(aluno.nome);
  });
  var aprovadas = presencas.filter(function (p) { return p.status === 'aprovado'; });
  var pendentes = presencas.filter(function (p) { return p.status === 'pendente'; });
  var rejeitadas = presencas.filter(function (p) { return p.status === 'rejeitado'; });
  var comAtraso = aprovadas.filter(function (p) { return (p.atrasoMin || 0) > 0; });
  var atrasoMedio = comAtraso.length
    ? Math.round(comAtraso.reduce(function (s, p) { return s + (p.atrasoMin || 0); }, 0) / comAtraso.length)
    : 0;

  /* frequência últimos 30 dias */
  var agora = Date.now();
  var trintaDias = 30 * 24 * 60 * 60 * 1000;
  var aprovadas30 = aprovadas.filter(function (p) {
    var t = new Date(p.data || p.criadoEm || 0).getTime();
    return !isNaN(t) && (agora - t) <= trintaDias;
  }).length;

  var avals = DB.listar('avaliacoes').filter(function (a) {
    return a.alunoId === aluno.id || normalizar(a.alunoNome) === normalizar(aluno.nome);
  }).sort(function (a, b) { return String(a.data || '').localeCompare(String(b.data || '')); });

  var mediasPorCampo = {};
  campos.forEach(function (c) { mediasPorCampo[c] = { soma: 0, n: 0 }; });
  avals.forEach(function (av) {
    campos.forEach(function (c) {
      var v = parseFloat(av[c]);
      if (!isNaN(v)) { mediasPorCampo[c].soma += v; mediasPorCampo[c].n++; }
    });
  });
  var habilidades = campos.map(function (c) {
    var m = mediasPorCampo[c].n ? mediasPorCampo[c].soma / mediasPorCampo[c].n : null;
    return { id: c, nome: labels[c], media: m };
  });
  var mediaGeral = null;
  if (avals.length) {
    var s = 0;
    avals.forEach(function (av) { s += mediaAvaliacao(av); });
    mediaGeral = s / avals.length;
  }

  /* tendência: última vs penúltima avaliação */
  var tendencia = null;
  if (avals.length >= 2) {
    var ult = mediaAvaliacao(avals[avals.length - 1]);
    var pen = mediaAvaliacao(avals[avals.length - 2]);
    var diff = ult - pen;
    if (diff > 0.3) tendencia = 'evoluindo';
    else if (diff < -0.3) tendencia = 'precisa_atencao';
    else tendencia = 'estavel';
  } else if (avals.length === 1) {
    tendencia = 'primeira_avaliacao';
  }

  var pontoForte = null;
  var pontoFraco = null;
  habilidades.forEach(function (h) {
    if (h.media === null) return;
    if (!pontoForte || h.media > pontoForte.media) pontoForte = h;
    if (!pontoFraco || h.media < pontoFraco.media) pontoFraco = h;
  });

  /* score composto 0-100 */
  var scoreFreq = Math.min(100, aprovadas30 * 20); /* ~5 aulas/mês = 100 */
  var scoreNota = mediaGeral !== null ? (mediaGeral / 10) * 100 : 50;
  var scorePontual = aprovadas.length
    ? Math.max(0, 100 - (comAtraso.length / Math.max(1, aprovadas.length)) * 100)
    : 50;
  var scoreConsist = rejeitadas.length === 0 ? 100 : Math.max(0, 100 - rejeitadas.length * 15);
  var score = Math.round(scoreFreq * 0.3 + scoreNota * 0.4 + scorePontual * 0.15 + scoreConsist * 0.15);

  var nivel = 'Iniciante em evolução';
  if (score >= 85) nivel = 'Excelente desempenho';
  else if (score >= 70) nivel = 'Bom desempenho';
  else if (score >= 55) nivel = 'Desempenho regular';
  else if (score >= 40) nivel = 'Em desenvolvimento';

  var recomendacoes = [];
  if (aprovadas30 < 2) recomendacoes.push('Aumente a frequência de treinos nas próximas semanas para consolidar a evolução.');
  if (pontoFraco && pontoFraco.media !== null && pontoFraco.media < 7) {
    recomendacoes.push('Foque em treinos de ' + pontoFraco.nome.toLowerCase() + ' — use "Pedir Treino Específico" na aba Aluno.');
  }
  if (comAtraso.length >= 2) recomendacoes.push('Trabalhe a pontualidade: atrasos frequentes afetam o compromisso e a graduação.');
  if (mediaGeral !== null && mediaGeral >= 8) recomendacoes.push('Ótimo nível técnico — participe de rodas e apresentações para consolidar.');
  if (!avals.length) recomendacoes.push('Aguarde a primeira avaliação do professor para um diagnóstico mais preciso.');
  if (!recomendacoes.length) recomendacoes.push('Mantenha a constância nos treinos e peça feedback ao professor após as rodas.');

  return {
    score: score,
    nivel: nivel,
    aprovadas: aprovadas.length,
    pendentes: pendentes.length,
    rejeitadas: rejeitadas.length,
    aprovadas30: aprovadas30,
    comAtraso: comAtraso.length,
    atrasoMedio: atrasoMedio,
    mediaGeral: mediaGeral,
    habilidades: habilidades,
    pontoForte: pontoForte,
    pontoFraco: pontoFraco,
    tendencia: tendencia,
    totalAvals: avals.length,
    recomendacoes: recomendacoes
  };
}

function htmlBarraHabilidade(nome, media) {
  if (media === null) return '<div class="mini" style="margin:3px 0;">' + esc(nome) + ': sem dados</div>';
  var pct = Math.max(0, Math.min(100, (media / 10) * 100));
  var cor = pct >= 80 ? 'var(--primary-green)' : (pct >= 60 ? 'var(--gold)' : 'var(--danger)');
  return '<div style="margin:5px 0;">' +
    '<div class="linha"><span class="mini">' + esc(nome) + '</span><span class="mini" style="color:' + cor + ';">' + media.toFixed(1) + '</span></div>' +
    '<div style="height:7px; background:#0a1419; border-radius:6px; overflow:hidden; border:1px solid var(--card-border);">' +
    '<div style="height:100%; width:' + pct + '%; background:' + cor + '; border-radius:6px;"></div></div></div>';
}

function htmlAnaliseDesempenho(aluno) {
  var a = analisarDesempenhoAtletico(aluno);
  if (!a) return '';
  var corScore = a.score >= 70 ? 'var(--primary-green)' : (a.score >= 50 ? 'var(--gold)' : 'var(--danger)');
  var tendenciaTxt = {
    evoluindo: '📈 Em evolução',
    precisa_atencao: '📉 Precisa de atenção',
    estavel: '➡️ Estável',
    primeira_avaliacao: '🆕 Primeira avaliação'
  };
  var html = '<div class="card" style="margin-top:12px; border:1px solid var(--accent-blue);">' +
    '<h3 style="color:var(--accent-blue);"><i class="fas fa-chart-line"></i> Análise de Desempenho Atlético</h3>' +
    '<div style="text-align:center; margin:8px 0 10px;">' +
      '<div style="font-size:2rem; font-weight:800; color:' + corScore + ';">' + a.score + '</div>' +
      '<div class="mini">Índice geral (0–100)</div>' +
      '<div style="margin-top:4px; font-size:0.82rem; color:var(--gold);"><b>' + esc(a.nivel) + '</b></div>' +
      (a.tendencia ? '<div class="mini" style="margin-top:3px;">' + (tendenciaTxt[a.tendencia] || '') + '</div>' : '') +
    '</div>' +
    '<div class="grade-3">' +
      '<div class="lista-item" style="text-align:center;"><div class="badge-count">' + a.aprovadas + '</div><div class="mini">aulas ok</div></div>' +
      '<div class="lista-item" style="text-align:center;"><div class="badge-count">' + a.aprovadas30 + '</div><div class="mini">últimos 30d</div></div>' +
      '<div class="lista-item" style="text-align:center;"><div class="badge-count">' + (a.mediaGeral !== null ? a.mediaGeral.toFixed(1) : '-') + '</div><div class="mini">média notas</div></div>' +
    '</div>';

  if (a.totalAvals) {
    html += '<h3 style="margin-top:10px; font-size:0.82rem;"><i class="fas fa-dumbbell"></i> Habilidades</h3>';
    a.habilidades.forEach(function (h) {
      html += htmlBarraHabilidade(h.nome, h.media);
    });
    if (a.pontoForte && a.pontoForte.media !== null) {
      html += '<p class="mini" style="margin-top:8px; color:var(--primary-green);"><i class="fas fa-star"></i> Ponto forte: <b>' + esc(a.pontoForte.nome) + '</b> (' + a.pontoForte.media.toFixed(1) + ')</p>';
    }
    if (a.pontoFraco && a.pontoFraco.media !== null && a.pontoForte && a.pontoFraco.id !== a.pontoForte.id) {
      html += '<p class="mini" style="color:var(--gold);"><i class="fas fa-bullseye"></i> Priorizar: <b>' + esc(a.pontoFraco.nome) + '</b> (' + a.pontoFraco.media.toFixed(1) + ')</p>';
    }
  } else {
    html += '<p class="sem-dados" style="margin-top:8px;">Ainda sem avaliações — o índice usa principalmente frequência e pontualidade.</p>';
  }

  html += '<div class="grade-2" style="margin-top:8px;">' +
    '<div class="lista-item"><span class="mini">Atrasos em aulas aprovadas</span><br><b>' + a.comAtraso + '</b>' +
    (a.atrasoMedio ? ' <span class="mini">(média ' + a.atrasoMedio + ' min)</span>' : '') + '</div>' +
    '<div class="lista-item"><span class="mini">Check-ins rejeitados</span><br><b>' + a.rejeitadas + '</b></div>' +
  '</div>';

  html += '<h3 style="margin-top:10px; font-size:0.82rem;"><i class="fas fa-lightbulb"></i> Recomendações</h3>';
  a.recomendacoes.forEach(function (r) {
    html += '<div class="aviso-info" style="margin:4px 0;">' + esc(r) + '</div>';
  });
  html += '</div>';
  return html;
}

function renderRankingCompleto() {
  var card = $('cardRankingCompletoInicio');
  var avals = DB.listar('avaliacoes');
  if (!avals.length) { card.style.display = 'none'; return; }
  var porAluno = {};
  avals.forEach(function (av) {
    var k = av.alunoId || normalizar(av.alunoNome);
    if (!k) return;
    if (!porAluno[k] || String(av.data || '') > String(porAluno[k].data || '')) porAluno[k] = av;
  });
  var lista = Object.keys(porAluno).map(function (k) { return porAluno[k]; })
    .map(function (av) { return { av: av, media: mediaAvaliacao(av) }; })
    .sort(function (a, b) { return b.media - a.media; });
  card.style.display = 'block';
  var html = '';
  lista.forEach(function (it, i) {
    html += '<div class="lista-item"><div class="linha"><span>' + (i + 1) + 'º <b>' + esc(it.av.alunoNome || 'Aluno') + '</b></span>' +
      '<span class="badge-count">' + it.media.toFixed(1) + '</span></div>' +
      '<span class="mini">' + esc(it.av.graduacao || '') + ' • avaliação de ' + esc(it.av.data || '-') + '</span></div>';
  });
  $('listaRankingCompletoInicio').innerHTML = html;
}

function certificadosDoAluno(aluno) {
  return DB.listar('certificados').filter(function (c) {
    return c.alunoId === aluno.id || normalizar(c.alunoNome) === normalizar(aluno.nome);
  }).sort(function (a, b) { return String(b.data || '').localeCompare(String(a.data || '')); });
}

function renderCertificadosAluno() {
  /* Seção de certificados removida da aba Início — mantém função vazia para não quebrar chamadas */
  var card = $('cardCertificadosAluno');
  if (card) {
    card.style.display = 'none';
    card.setAttribute('aria-hidden', 'true');
  }
}

function baixarCertificado(id) {
  var c = DB.buscar('certificados', id);
  if (!c) { mostrarToast('Certificado não encontrado.', 'erro'); return; }
  var logo1 = urlSegura(CONFIG.logo1);
  var logo2 = urlSegura(CONFIG.logo2);
  var logosHtml = '';
  if (logo1 || logo2) {
    logosHtml = '<div style="display:flex;justify-content:center;align-items:center;gap:18px;margin-bottom:12px;flex-wrap:wrap;">' +
      (logo1 ? '<img src="' + logo1 + '" alt="Logo" style="max-height:80px;max-width:160px;object-fit:contain;">' : '') +
      (logo2 ? '<img src="' + logo2 + '" alt="Logo 2" style="max-height:80px;max-width:160px;object-fit:contain;">' : '') +
      '</div>';
  }
  var html = '<!DOCTYPE html><html lang="pt-br"><head><meta charset="utf-8"><title>Certificado</title>' +
    '<style>body{font-family:Georgia,serif;background:#f4f4f4;padding:24px;}' +
    '.c{background:#fffdf5;border:8px double #b8860b;border-radius:10px;padding:36px;max-width:720px;margin:auto;text-align:center;color:#222;}' +
    'h1{font-size:26px;color:#1b5e20;margin-bottom:6px;}h2{font-size:18px;color:#8d6e00;margin:18px 0 6px;}' +
    '.nome{font-size:30px;font-weight:bold;color:#0b3d0b;margin:14px 0;}' +
    'p{font-size:15px;line-height:1.6;} .rodape{margin-top:28px;font-size:13px;color:#555;}' +
    '@media print{body{background:#fff;padding:0;}}</style></head><body>' +
    '<div class="c">' + logosHtml +
    '<h1>' + esc(CONFIG.tituloApp) + '</h1>' +
    '<p>Capoeira na Pequena África</p><h2>CERTIFICADO DE PARTICIPAÇÃO</h2>' +
    '<p>Certificamos que</p><div class="nome">' + esc(c.alunoNome || '-') + '</div>' +
    '<p>participou de <strong>' + esc(c.evento || 'apresentação da academia') + '</strong>, ' +
    'realizada em <strong>' + dataBR(c.data) + '</strong>' + (c.cargaHoraria ? ', com carga horária de ' + esc(c.cargaHoraria) : '') + '.</p>' +
    '<div class="rodape">Código de autenticidade: <strong>' + esc(c.codigo || '-') + '</strong><br>' +
    'Emitido em ' + esc(c.emitidoEm ? dataBR(String(c.emitidoEm).slice(0, 10)) : '-') + ' por ' + esc(c.emitidoPor || 'Equipe') + '<br><br>' +
    '_______________________________<br>' + esc(c.assinatura || 'Professor responsável') + '</div></div>' +
    '<script>setTimeout(function(){window.print();},600);<\/script></body></html>';
  var w = window.open('', '_blank');
  if (!w) { mostrarToast('Permita pop-ups para abrir o certificado.', 'erro'); return; }
  w.document.write(html);
  w.document.close();
}

/* --- mural --- */
function renderMural() {
  var box = $('chatMessages');
  if (!box) return;
  var msgs = DB.listar('mural').slice().sort(function (a, b) {
    return String(a.criadoEm || '').localeCompare(String(b.criadoEm || ''));
  }).slice(-60);
  if (!msgs.length) { box.innerHTML = '<p class="sem-dados">Nenhuma mensagem ainda. Seja o primeiro a publicar!</p>'; return; }
  var html = '';
  msgs.forEach(function (m) {
    html += '<div class="chat-msg"><div class="linha"><b style="color:var(--primary-green); font-size:0.72rem;">' + esc(m.autor || 'Aluno') + '</b>' +
      '<span class="mini">' + dataHoraBR(m.criadoEm) + '</span></div>' +
      (m.texto ? '<div>' + esc(m.texto) + '</div>' : '') +
      (m.imagem && urlSegura(m.imagem) ? '<img src="' + urlSegura(m.imagem) + '" alt="Foto enviada no mural">' : '') + '</div>';
  });
  box.innerHTML = html;
  box.scrollTop = box.scrollHeight;
}

function enviarMensagemNuvem(textoImagem) {
  var input = $('chatInput');
  var texto = (input.value || '').trim();
  var aluno = alunoLogado();
  if (!texto && !textoImagem) { mostrarToast('Escreva uma mensagem ou envie uma foto.', 'erro'); return; }
  input.value = '';
  DB.salvar('mural', {
    autor: aluno ? (aluno.apelido || aluno.nome) : ((sessaoEquipe && sessaoEquipe.nome) || 'Visitante'),
    autorId: aluno ? aluno.id : '',
    texto: texto,
    imagem: textoImagem || '',
    criadoEm: agoraISO()
  }).then(function () { renderMural(); });
}

function uploadFotoChat(input) {
  var arquivo = input.files && input.files[0];
  if (!arquivo) return;
  mostrarToast('Processando foto...');
  comprimirImagem(arquivo, 900, 0.7).then(function (dataUrl) {
    input.value = '';
    enviarMensagemNuvem(dataUrl);
  }).catch(function () { mostrarToast('Não foi possível processar a imagem.', 'erro'); });
}

function comprimirImagem(arquivo, maxLado, qualidade) {
  return new Promise(function (resolve, reject) {
    var leitor = new FileReader();
    leitor.onerror = reject;
    leitor.onload = function () {
      var img = new Image();
      img.onerror = reject;
      img.onload = function () {
        var w = img.width, h = img.height;
        var escala = Math.min(1, maxLado / Math.max(w, h));
        var c = document.createElement('canvas');
        c.width = Math.round(w * escala);
        c.height = Math.round(h * escala);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', qualidade || 0.7));
      };
      img.src = leitor.result;
    };
    leitor.readAsDataURL(arquivo);
  });
}

function abrirInstagramOficial() {
  var handle = (CONFIG.instagram || '').replace('@', '').trim();
  if (!handle) { mostrarToast('Instagram não configurado.', 'erro'); return; }
  window.open('https://instagram.com/' + handle, '_blank', 'noopener');
}

/* ---------------------------------------------------------------
   10. MÓDULO CHECK-IN
   --------------------------------------------------------------- */
function renderCheckin() {
  var logado = alunoLogado();
  var campoNome = $('checkinFixoNomeAluno');
  if (campoNome && logado && !(campoNome.value || '').trim()) {
    campoNome.value = logado.nome;
  }
  var boxProf = $('boxProfessorNaAulaCheckin');
  if (boxProf) boxProf.innerHTML = htmlBannerProfessorNaAula();
  var boxGympass = $('boxGympassCheckin');
  if (boxGympass) boxGympass.innerHTML = htmlCardGympassAluno(logado);
  renderHorarioAulaHoje();
  renderSelectPolos();
  renderMinhasPresencasCheckin();
  avaliarAtrasoHoje();
  atualizarEstadoBotaoCheckin();
  atualizarIconeFormadorUI();
}

function atualizarEstadoBotaoCheckin() {
  var btn = $('btnConfirmarCheckinLocal');
  var box = $('boxJaCheckinHoje');
  if (!btn || !box) return;

  var nome = alunoLogado() ? alunoLogado().nome : nomeCheckinAtual();
  var checkin = nome ? obterCheckinDoDia(alunoLogado() || nome) : null;

  if (checkin) {
    var statusTxt = checkin.status === 'aprovado' ? 'APROVADO' : (checkin.status === 'pendente' ? 'PENDENTE' : String(checkin.status).toUpperCase());
    box.style.display = 'block';
    box.innerHTML = '<i class="fas fa-check-circle" style="color:var(--primary-green);"></i> <strong>Check-in de hoje já registrado</strong> (' + statusTxt + ')' +
      '<br><span class="mini">' + esc(checkin.poloNome || checkin.tipo || '') + ' • ' + esc(checkin.hora || '') +
      ' — só é permitido um por aula.</span>';
    btn.disabled = true;
    btn.classList.add('carregando');
    btn.innerHTML = '<i class="fas fa-lock"></i> Já fez check-in hoje';
    btn.style.opacity = '0.65';
    return;
  }

  var aulaHojeBtn = aulaDeHoje();
  if (aulaHojeBtn && !dentroJanelaCheckin(aulaHojeBtn)) {
    var jw = janelaCheckin(aulaHojeBtn);
    box.style.display = 'block';
    box.innerHTML = '<i class="fas fa-clock" style="color:var(--danger);"></i> <strong>Fora do horário de check-in</strong>' +
      '<br><span class="mini">Só é permitido entre ' + minutosParaHM(jw.abre) + ' e ' + minutosParaHM(jw.fecha) + ' (aula: ' + esc(aulaHojeBtn.horaInicio) + ' às ' + esc(aulaHojeBtn.horaFim) + ').</span>';
    btn.disabled = true;
    btn.classList.remove('carregando');
    btn.innerHTML = '<i class="fas fa-clock"></i> Fora do horário';
    btn.style.opacity = '0.65';
  } else {
    box.style.display = 'none';
    box.innerHTML = '';
    btn.disabled = false;
    btn.classList.remove('carregando');
    btn.innerHTML = '<i class="fas fa-check"></i> Confirmar Presença Local';
    btn.style.opacity = '1';
  }
}

function renderHorarioAulaHoje() {
  var box = $('horarioAulaHojeBox');
  if (!box) return;
  var dias = [];
  var aula = aulaDeHoje();
  if (aula) {
    var polo = DB.buscar('polos', aula.poloId);
    box.innerHTML = '<i class="fas fa-clock" style="color:var(--primary-green);"></i> <strong>Hoje (' + esc(DIAS_SEMANA[new Date().getDay()]) + ')</strong>: ' +
      esc(aula.horaInicio) + ' - ' + esc(aula.horaFim) + ' • ' + esc(aula.modalidade || 'Treino') +
      (polo ? '<br><i class="fas fa-map-marker-alt"></i> ' + esc(polo.nome) + (polo.endereco ? ' — ' + esc(polo.endereco) : '') : '');
  } else {
    DB.listar('horarios').sort(function (a, b) { return Number(a.diaSemana) - Number(b.diaSemana); })
      .slice(0, 4).forEach(function (h) { dias.push(esc(DIAS_SEMANA[Number(h.diaSemana)]) + ' ' + esc(h.horaInicio)); });
    box.innerHTML = '<i class="fas fa-clock"></i> Sem aula cadastrada para hoje.' +
      (dias.length ? '<br><span class="mini">Próximos horários: ' + dias.join(' • ') + '</span>' : '');
  }
}

function renderSelectPolos() {
  var sel = $('selectPoloFixoTreino');
  if (!sel) return;
  var atual = sel.value;
  var polos = DB.listar('polos');
  if (!polos.length) {
    sel.innerHTML = '<option value="">Aguardando professor cadastrar local...</option>';
    return;
  }
  var html = '<option value="">Selecione o polo deste treino...</option>';
  polos.forEach(function (p) { html += '<option value="' + p.id + '">' + esc(p.nome) + (p.endereco ? ' — ' + esc(p.endereco) : '') + '</option>'; });
  sel.innerHTML = html;
  if (atual) sel.value = atual;
}

function avaliarAtrasoHoje() {
  var box = $('boxJustificativaAtraso');
  if (!box) return;
  var aula = aulaDeHoje();
  if (!aula) { box.style.display = 'none'; return; }
  var inicio = minutosDoHM(aula.horaInicio);
  var agora = agoraEmMinutos();
  var atrasado = inicio !== null && agora > (inicio + (CONFIG.toleranciaAtrasoMin || 15));
  box.style.display = atrasado ? 'block' : 'none';
  if (atrasado && $('justificativaAtrasoInput') && !$('justificativaAtrasoInput').placeholder.match(/atraso de/)) {
    $('justificativaAtrasoInput').placeholder = 'Ex: trânsito, imprevisto no trabalho... (aula começou ' + aula.horaInicio + ')';
  }
}

function renderMinhasPresencasCheckin() {
  var card = $('cardMinhasPresencasCheckin');
  var nome = alunoLogado() ? alunoLogado().nome : nomeCheckinAtual();
  if (!nome) { card.style.display = 'none'; return; }
  var aluno = alunoLogado() || encontrarAlunoPorNome(nome);
  var lista = DB.listar('presencas').filter(function (p) {
    if (aluno && p.alunoId && p.alunoId === aluno.id) return true;
    return normalizar(p.alunoNome) === normalizar(nome);
  }).sort(function (a, b) { return String(b.criadoEm || '').localeCompare(String(a.criadoEm || '')); });
  if (!lista.length) { card.style.display = 'none'; return; }
  card.style.display = 'block';

  var aprovadas = lista.filter(function (p) { return p.status === 'aprovado'; });
  var pendentes = lista.filter(function (p) { return p.status === 'pendente'; });
  var outras = lista.filter(function (p) { return p.status !== 'aprovado' && p.status !== 'pendente'; });

  var html = '';
  if (aprovadas.length) {
    html += '<p class="mini" style="color:var(--primary-green); margin-bottom:4px;"><i class="fas fa-check-circle"></i> Aulas confirmadas (' + aprovadas.length + ')</p>';
    aprovadas.slice(0, 10).forEach(function (p) {
      html += '<div class="lista-item" style="border-color:rgba(0,230,118,0.35);">' +
        '<div class="linha"><span><b>' + dataBR(p.data) + '</b> ' + esc(p.hora || '') + '</span>' + pillStatus(p.status) + '</div>' +
        '<span class="mini">' + esc(p.poloNome || p.tipo || '') + (p.atrasoMin ? ' • atraso ' + p.atrasoMin + ' min' : '') + '</span>' +
        (p.observacaoProfessor ? '<div class="mini" style="color:var(--gold);">Prof.: ' + esc(p.observacaoProfessor) + '</div>' : '') +
        '</div>';
    });
  }
  if (pendentes.length) {
    html += '<p class="mini" style="color:var(--gold); margin:8px 0 4px;"><i class="fas fa-hourglass-half"></i> Aguardando aprovação (' + pendentes.length + ')</p>';
    pendentes.forEach(function (p) {
      html += '<div class="lista-item">' +
        '<div class="linha"><span>' + dataBR(p.data) + ' ' + esc(p.hora || '') + '</span>' + pillStatus(p.status) + '</div>' +
        '<span class="mini">' + esc(p.poloNome || p.tipo || '') + '</span></div>';
    });
  }
  if (outras.length) {
    html += '<p class="mini" style="margin:8px 0 4px;">Outros registros</p>';
    outras.slice(0, 5).forEach(function (p) {
      html += '<div class="lista-item"><div class="linha"><span>' + dataBR(p.data) + '</span>' + pillStatus(p.status) + '</div>' +
        '<span class="mini">' + esc(p.poloNome || p.tipo || '') + '</span></div>';
    });
  }
  $('listaMinhasPresencasCheckin').innerHTML = html || '<p class="sem-dados">Nenhum check-in ainda.</p>';
}

function pillStatus(status) {
  if (status === 'aprovado') return '<span class="pill pill-ok">APROVADO</span>';
  if (status === 'rejeitado') return '<span class="pill pill-no">REJEITADO</span>';
  return '<span class="pill pill-pend">PENDENTE</span>';
}

function alunoCheckinLocalFixoSimples() {
  var nome = ($('checkinFixoNomeAluno').value || '').trim();
  var poloId = $('selectPoloFixoTreino').value;
  var just = ($('justificativaAtrasoInput').value || '').trim();
  var atrasado = $('boxJustificativaAtraso').style.display !== 'none';

  if (nome.length < 3) { mostrarToast('Informe seu nome completo.', 'erro'); return; }
  if (!poloId) { mostrarToast('Selecione o polo do treino.', 'erro'); return; }
  if (atrasado && just.length < 4) { mostrarToast('Justifique o atraso para concluir o check-in.', 'erro'); return; }

  var aulaJanela = aulaDeHoje();
  if (aulaJanela && !dentroJanelaCheckin(aulaJanela)) {
    var j = janelaCheckin(aulaJanela);
    mostrarToast('Check-in só é permitido entre ' + minutosParaHM(j.abre) + ' e ' + minutosParaHM(j.fecha) + ' (aula de hoje: ' + aulaJanela.horaInicio + ' às ' + aulaJanela.horaFim + ').', 'erro');
    return;
  }

  var aluno = encontrarAlunoPorNome(nome);
  var jaExiste = obterCheckinDoDia(aluno || nome);
  if (jaExiste) {
    var statusTxt = jaExiste.status === 'aprovado' ? 'aprovado' : (jaExiste.status === 'pendente' ? 'pendente de aprovação' : jaExiste.status);
    mostrarToast('Você já fez check-in hoje (' + statusTxt + '). Só é permitido um por aula.', 'erro');
    renderCheckin();
    return;
  }

  var aula = aulaDeHoje();
  var polo = DB.buscar('polos', poloId);
  var atrasoMin = 0;
  if (aula && minutosDoHM(aula.horaInicio) !== null) {
    atrasoMin = Math.max(0, agoraEmMinutos() - minutosDoHM(aula.horaInicio));
  }

  var btn = $('btnConfirmarCheckinLocal');
  if (btn) { btn.classList.add('carregando'); btn.disabled = true; btn.innerHTML = '<span class="spinner-btn"></span> Enviando...'; }

  var horaAgora = horaLocalHM();
  var dataAgora = dataLocalISO();
  var offlineAgora = (typeof navigator !== 'undefined' && navigator.onLine === false);
  DB.salvar('presencas', {
    alunoId: aluno ? aluno.id : '',
    alunoNome: aluno ? aluno.nome : nome,
    alunoApelido: aluno ? (aluno.apelido || '') : '',
    poloId: poloId,
    poloNome: polo ? polo.nome : '',
    horarioId: aula ? aula.id : '',
    data: dataAgora,
    hora: horaAgora,
    tipo: 'local',
    status: 'pendente',
    atrasoMin: atrasado ? atrasoMin : 0,
    justificativa: just,
    offline: offlineAgora,
    criadoEm: agoraISO()
  }).then(function () {
    if (btn) { btn.classList.remove('carregando'); btn.disabled = false; btn.innerHTML = '<i class="fas fa-check"></i> Confirmar Presença Local'; }
    $('justificativaAtrasoInput').value = '';
    mostrarToast(offlineAgora ? 'Check-in salvo offline! Sincroniza quando houver internet.' : 'Check-in enviado com sucesso!');
    abrirModal('Check-in registrado',
      '<div style="text-align:center; padding:6px 0;">' +
        '<div style="font-size:2rem; color:var(--primary-green); margin-bottom:8px;"><i class="fas fa-check-circle"></i></div>' +
        '<p style="font-size:0.9rem; margin-bottom:6px;"><strong>' + (offlineAgora ? 'Presença salva neste aparelho!' : 'Presença enviada!') + '</strong></p>' +
        '<p class="mini">Aluno: <b>' + esc(aluno ? aluno.nome : nome) + '</b></p>' +
        '<p class="mini">Data: <b>' + dataBR(dataAgora) + '</b> às <b>' + esc(horaAgora) + '</b></p>' +
        '<p class="mini">Local: <b>' + esc(polo ? polo.nome : '-') + '</b></p>' +
        (offlineAgora
          ? '<p class="mini" style="margin-top:8px; color:var(--gold);"><b>OFFLINE</b> — quando a internet voltar, o check-in sobe automaticamente para o professor.</p>'
          : '<p class="mini" style="margin-top:8px; color:var(--gold);">Status: <b>PENDENTE</b> — aguarde a aprovação do professor.</p>') +
        '<p class="mini" style="margin-top:6px;">Você pode acompanhar em “Meus Check-ins Recentes” e na aba Aluno.</p>' +
      '</div>');
    renderMinhasPresencasCheckin();
    renderCheckin();
  }).catch(function () {
    if (btn) { btn.classList.remove('carregando'); btn.disabled = false; btn.innerHTML = '<i class="fas fa-check"></i> Confirmar Presença Local'; }
  });
}

function htmlCardGympassAluno(logado) {
  if (!logado || logado.tipoAluno !== 'gympass') return '';
  var link = logado.gympassLink || '';
  return '<div class="card" style="border:1px solid var(--gympass-red);">' +
    '<h3 style="color:var(--gympass-red);"><i class="fas fa-ticket-alt"></i> Check-in Gympass / Wellhub</h3>' +
    '<p class="mini" style="margin-bottom:8px;">Seu check-in é feito direto no app Wellhub — o professor valida no Portal de Parceiros.</p>' +
    (link
      ? '<a class="btn btn-gympass" href="' + esc(link) + '" target="_blank" rel="noopener" style="display:flex; align-items:center; justify-content:center; text-decoration:none;"><i class="fas fa-external-link-alt"></i>&nbsp; Abrir meu Wellhub</a>'
      : '<p class="mini">Você ainda não salvou seu link do Wellhub. Adicione em <b>Meu Perfil</b>, mais abaixo.</p>') +
    '</div>';
}

/* ---------------------------------------------------------------
   11. MÓDULO ALUNO (painel)
   --------------------------------------------------------------- */
function renderAluno() {
  function seguro(fn) { try { return fn(); } catch (e) { try { console.error('[Aluno] erro num card, ignorado pra nao travar a aba:', e); } catch (e2) {} return ''; } }
  try {
    if (sessaoAlunoId) localStorage.setItem('uc_sessao_aluno', sessaoAlunoId);
    else localStorage.removeItem('uc_sessao_aluno');
    try { localStorage.removeItem('uc_sessao_aluno_v87'); } catch (eSess) {}
  } catch (e) {}
  var logado = alunoLogado();
  var testeCard = $('cardTesteConhecimento');
  if (!logado) {
    $('cardAlunoLogin').style.display = 'block';
    $('cardAlunoPrimeiroCadastro').style.display = 'none';
    $('cardAlunoPainel').style.display = 'none';
    if (testeCard) testeCard.style.display = 'none';
    return;
  }
  $('cardAlunoLogin').style.display = 'none';
  $('cardAlunoPrimeiroCadastro').style.display = 'none';
  $('cardAlunoPainel').style.display = 'block';
  try {
  if (testeCard) { testeCard.style.display = CONFIG.iaProxyUrl ? 'block' : 'none'; renderAreaTesteConhecimento(); }

  var presencas = DB.listar('presencas').filter(function (p) {
    return p.alunoId === logado.id || normalizar(p.alunoNome) === normalizar(logado.nome);
  }).sort(function (a, b) { return String(b.criadoEm || '').localeCompare(String(a.criadoEm || '')); });

  var aprovadas = presencas.filter(function (p) { return p.status === 'aprovado'; }).length;
  var cargaAluno = calcularCargaHorariaAluno(logado);
  var pendentes = presencas.filter(function (p) { return p.status === 'pendente'; }).length;
  var avals = DB.listar('avaliacoes').filter(function (a) {
    return a.alunoId === logado.id || normalizar(a.alunoNome) === normalizar(logado.nome);
  }).sort(function (a, b) { return String(b.data || '').localeCompare(String(a.data || '')); });
  var certs = certificadosDoAluno(logado);
  var falhas = presencas.filter(function (p) { return p.status === 'rejeitado'; }).length;
  var solicitacoes = DB.listar('solicitacoes').filter(function (s) {
    return s.alunoId === logado.id || normalizar(s.alunoNome) === normalizar(logado.nome);
  }).sort(function (a, b) { return String(b.criadoEm || '').localeCompare(String(a.criadoEm || '')); });
  var solPendentes = solicitacoes.filter(function (s) { return s.status === 'pendente'; }).length;
  var mediaGeral = avals.length ? (avals.reduce(function (acc, a) { return acc + mediaAvaliacao(a); }, 0) / avals.length).toFixed(1) : '-';
  var aulaHoje = aulaDeHoje();
  var poloHoje = aulaHoje ? DB.buscar('polos', aulaHoje.poloId) : null;

  var tiposTreino = [
    'Ginga e base',
    'Esquivas e defesas',
    'Ataques e golpes',
    'Sequências e combinações',
    'Floreios e acrobacias',
    'Musicalidade (berimbau, atabaque, pandeiro)',
    'Canto e coro',
    'Roda de capoeira',
    'Treino de condicionamento',
    'Preparação para batizado / troca de corda',
    'Treino particular / individual',
    'Outro (descrever na observação)'
  ];

  var html =
    (boasVindasNovoAluno
      ? '<div class="card card-destaque" style="border:1px solid var(--primary-green); background:rgba(0,230,118,0.08);">' +
          '<h3 style="color:var(--primary-green);"><i class="fas fa-circle-check"></i> Cadastro concluído!</h3>' +
          '<p class="mini">Pronto, ' + esc(logado.apelido || logado.nome.split(' ')[0]) + '! Agora é só ir na aba <b>Check-in</b> sempre que vier treinar. Toque no robozinho no canto da tela se tiver alguma dúvida.</p>' +
          '<button class="btn btn-secondary" onclick="abrirAba(\'tab2\'); this.closest(\'.card\').remove();"><i class="fas fa-map-marker-alt"></i> Ir para o Check-in</button>' +
        '</div>'
      : '') +
    '<button class="btn btn-back" onclick="sairAluno()"><i class="fas fa-sign-out-alt"></i> Sair</button>' +

    /* ===== CABEÇALHO DO ALUNO ===== */
    '<div style="text-align:center; margin-bottom:10px;">' +
      (logado.foto && urlSegura(logado.foto) ? '<img class="preview-foto" src="' + urlSegura(logado.foto) + '" alt="Foto do aluno">' : '<div style="width:72px;height:72px;border-radius:50%;background:#0a1419;border:2px solid var(--primary-green);margin:0 auto 6px;display:flex;align-items:center;justify-content:center;font-size:1.6rem;color:var(--primary-green);"><i class="fas fa-user"></i></div>') +
      '<h3 style="justify-content:center; margin:4px 0;"><i class="fas fa-id-card"></i> ' + esc(logado.apelido || logado.nome) + '</h3>' +
      '<p class="mini">' + esc(logado.nome) + '</p>' +
      '<p class="mini" style="color:var(--gold); font-size:0.8rem;"><i class="fas fa-medal"></i> ' + esc(logado.graduacao || 'Sem graduação registrada') + '</p>' +
      (alunoEmFormacaoAprovado(logado) ? '<div style="margin-top:4px;">' + htmlIconeFormador() + '</div>' : '') +
      (logado.contato ? '<p class="mini"><i class="fab fa-whatsapp"></i> ' + esc(logado.contato) + '</p>' : '') +
    '</div>' +

    /* ===== ESTATÍSTICAS ===== */
    '<div class="grade-3" style="margin-top:4px;">' +
      '<div class="lista-item" style="text-align:center;"><div class="badge-count">' + aprovadas + '</div><div class="mini">presenças</div></div>' +
      '<div class="lista-item" style="text-align:center;"><div class="badge-count">' + mediaGeral + '</div><div class="mini">média</div></div>' +
      '<div class="lista-item" style="text-align:center;"><div class="badge-count">' + certs.length + '</div><div class="mini">certificados</div></div>' +
    '</div>' +
    '<div class="grade-3" style="margin-top:6px;">' +
      '<div class="lista-item" style="text-align:center;"><div class="badge-count">' + pendentes + '</div><div class="mini">check-ins pend.</div></div>' +
      '<div class="lista-item" style="text-align:center;"><div class="badge-count">' + solPendentes + '</div><div class="mini">pedidos pend.</div></div>' +
      '<div class="lista-item" style="text-align:center;"><div class="badge-count">' + avals.length + '</div><div class="mini">avaliações</div></div>' +
    '</div>' +
    '<div class="card" style="margin-top:8px; border:1px solid var(--gold);">' +
      '<h3 style="color:var(--gold);"><i class="fas fa-clock"></i> Carga horária para certificado</h3>' +
      '<div class="linha"><span class="mini">Aulas aprovadas</span><b>' + cargaAluno.aulas + '</b></div>' +
      '<div class="linha"><span class="mini">Carga acumulada</span><b style="color:var(--gold);">' + cargaAluno.texto + '</b></div>' +
      '<p class="mini" style="margin-top:6px;">Cada presença aprovada soma ' + formatarCargaHoraria(horasPorAulaConfig()) + '. O professor usa essa carga ao emitir o certificado.</p>' +
    '</div>' +

    (falhas
      ? '<div class="alerta-dificuldade" style="margin-top:8px;"><i class="fas fa-exclamation-triangle"></i> ' + falhas + ' presença(s) rejeitada(s) — isso pode afetar sua graduação.</div>'
      : '') +

    /* ===== PRÓXIMA AULA ===== */
    '<div class="card" style="margin-top:12px; border-color: var(--primary-green); padding:10px 12px;">' +
      '<h3 style="margin-bottom:4px;"><i class="fas fa-calendar-check"></i> Próxima Aula</h3>' +
      (aulaHoje
        ? '<p style="font-size:0.8rem;"><strong>Hoje</strong> • ' + esc(aulaHoje.horaInicio) + ' - ' + esc(aulaHoje.horaFim) +
          '<br><span class="mini">' + esc(aulaHoje.modalidade || 'Treino') + (poloHoje ? ' • ' + esc(poloHoje.nome) : '') + '</span></p>' +
          '<button class="btn btn-mini" style="margin-top:6px;" onclick="abrirAba(\'tab2\')"><i class="fas fa-map-marker-alt"></i> Ir para Check-in</button>'
        : '<p class="sem-dados">Nenhuma aula cadastrada para hoje. Confira o horário fixo na aba Início.</p>') +
    '</div>' +

    /* ===== ANÁLISE DE DESEMPENHO ATLÉTICO ===== */
    seguro(function () { return htmlAnaliseDesempenho(logado); }) +

    /* ===== DESAFIOS DE JOGOS ENTRE ALUNOS ===== */
    seguro(function () { return htmlCardDesafiosJogos(logado); }) +

    /* ===== INTERAÇÃO: FALAR COM PROFESSOR + FEEDBACK + PERGUNTA ===== */
    seguro(function () { return htmlCardMensagensAluno(logado); }) +
    seguro(function () { return htmlCardFeedbackAula(logado); }) +
    seguro(function () { return htmlCardPerguntaSemanaAluno(logado); }) +

    /* Mascote/Terreiro unificados no Mundo — não ocupam espaço na aba Aluno */

    /* ===== AULAS E ALONGAMENTOS (professor publica) ===== */
    seguro(function () { return htmlCardAulasConteudoAluno(); }) +

    /* ===== PEDIR TREINO ESPECÍFICO (NOVO) ===== */
    '<div class="card" style="margin-top:4px; border:1px solid var(--accent-blue);">' +
      '<h3 style="color:var(--accent-blue);"><i class="fas fa-hand-point-up"></i> Pedir Treino Específico</h3>' +
      '<p class="mini" style="margin-bottom:8px;">Solicite ao professor um treino focado no que você mais precisa evoluir.</p>' +
      '<label class="campo-label">Tipo de treino desejado</label>' +
      '<select id="solicitacaoTipo">' +
        tiposTreino.map(function (t) { return '<option value="' + esc(t) + '">' + esc(t) + '</option>'; }).join('') +
      '</select>' +
      '<label class="campo-label">Preferência de data (opcional)</label>' +
      '<input id="solicitacaoData" type="date" min="' + dataLocalISO() + '">' +
      '<label class="campo-label">Observação / o que você quer trabalhar</label>' +
      '<textarea id="solicitacaoObs" placeholder="Ex: Quero reforçar esquivas e entradas de rasteira..."></textarea>' +
      '<button class="btn btn-secondary" onclick="enviarSolicitacaoTreino(this)"><i class="fas fa-paper-plane"></i> Enviar pedido ao professor</button>' +
    '</div>' +

    /* ===== MEUS PEDIDOS DE TREINO ===== */
    '<h3 style="margin-top:12px;"><i class="fas fa-list-check"></i> Meus Pedidos de Treino</h3>' +
    seguro(function () { return htmlPedidosComConversa(solicitacoes); }) +

    /* ===== PRESENÇAS ===== */
    '<h3 style="margin-top:14px;"><i class="fas fa-history"></i> Minhas Presenças</h3>' +
    (presencas.length
      ? presencas.slice(0, 8).map(function (p) {
          return '<div class="lista-item"><div class="linha"><span>' + dataBR(p.data) + ' ' + esc(p.hora || '') + '</span>' + pillStatus(p.status) + '</div>' +
            '<span class="mini">' + esc(p.poloNome || p.tipo || '') + (p.atrasoMin ? ' • atraso ' + p.atrasoMin + ' min' : '') + '</span>' +
            (p.justificativa ? '<div class="mini">Justificativa: ' + esc(p.justificativa) + '</div>' : '') +
            (p.observacaoProfessor ? '<div class="mini" style="color:var(--gold);">Prof.: ' + esc(p.observacaoProfessor) + '</div>' : '') + '</div>';
        }).join('')
      : '<p class="sem-dados">Nenhuma presença registrada.</p>') +

    /* ===== AVALIAÇÕES ===== */
    '<h3 style="margin-top:14px;"><i class="fas fa-star-half-alt"></i> Minhas Avaliações Semanais</h3>' +
    seguro(function () { return htmlAvaliacoesComComentario(avals); }) +

    /* ===== CERTIFICADOS ===== */
    '<h3 style="margin-top:14px;"><i class="fas fa-award"></i> Meus Certificados</h3>' +
    (certs.length
      ? certs.map(function (c) {
          return '<div class="lista-item"><div class="linha"><span>' + esc(c.evento || '-') + '</span><span class="mini">' + dataBR(c.data) + '</span></div>' +
            '<button class="btn btn-gold btn-mini" style="margin-top:6px;" onclick="baixarCertificado(\'' + c.id + '\')"><i class="fas fa-file-arrow-down"></i> Abrir</button></div>';
        }).join('')
      : '<p class="sem-dados">Nenhum certificado emitido.</p>') +

    /* ===== PERFIL ===== */
    '<h3 style="margin-top:14px;"><i class="fas fa-user-edit"></i> Meu Perfil</h3>' +
    '<label class="campo-label">Nome completo</label><input id="perfilNome" value="' + esc(logado.nome) + '">' +
    '<label class="campo-label">Apelido</label><input id="perfilApelido" value="' + esc(logado.apelido || '') + '">' +
    '<label class="campo-label">Contato (WhatsApp)</label><input id="perfilContato" value="' + esc(logado.contato || '') + '">' +
    '<label class="campo-label">Graduação (alterada somente pela equipe)</label>' +
    '<input value="' + esc(logado.graduacao || '-') + '" disabled>' +
    (logado.tipoAluno === 'gympass'
      ? '<label class="campo-label"><i class="fas fa-ticket-alt" style="color:var(--gympass-red);"></i> Link do meu Wellhub/Gympass</label>' +
        '<input id="perfilGympassLink" placeholder="Cole aqui o link do seu perfil/check-in no app Wellhub" value="' + esc(logado.gympassLink || '') + '">' +
        '<p class="mini" style="margin:-4px 0 8px;">O professor pode usar esse link para conferir seu check-in mais rápido.</p>'
      : '') +
    '<label class="campo-label">Foto de perfil</label>' +
    '<input type="file" accept="image/*" onchange="uploadFotoPerfil(this)">' +
    '<button class="btn" onclick="salvarPerfilAluno(this)"><i class="fas fa-save"></i> Salvar Perfil</button>' +
    '<button class="btn btn-secondary" onclick="trocarSenhaAluno()"><i class="fas fa-key"></i> Trocar Senha</button>' +
    '<button class="btn btn-secondary" onclick="baixarMeusDados()"><i class="fas fa-download"></i> Baixar meus dados (JSON)</button>';

  $('cardAlunoPainel').innerHTML = html;
  tornarCardsColapsaveis($('cardAlunoPainel'));
  boasVindasNovoAluno = false;
  setTimeout(atualizarBadgesInteracao, 50);
  try { renderTerreiroListas(); publicarPresencaAvatar(); } catch (e) {}
  } catch (erroFatalAluno) {
    try { console.error('[Aluno] erro ao montar o painel, mostrando modo seguro:', erroFatalAluno); } catch (e2) {}
    $('cardAlunoPainel').innerHTML =
      '<div class="card" style="border:1px solid var(--danger);">' +
      '<h3 style="color:var(--danger);"><i class="fas fa-triangle-exclamation"></i> Deu um erro ao montar sua área</h3>' +
      '<p class="mini">Isso não deveria travar o app. Toque no botão abaixo pra tentar de novo, ou saia e entre de novo.</p>' +
      '<button class="btn btn-secondary" onclick="renderAluno()"><i class="fas fa-rotate"></i> Tentar de novo</button>' +
      '<button class="btn btn-back" onclick="sairAluno()"><i class="fas fa-sign-out-alt"></i> Sair</button>' +
      '</div>';
  }
}

function salvarPerfilAluno(btn) {
  var logado = alunoLogado();
  if (!logado) return;
  var nome = ($('perfilNome').value || '').trim();
  var apelido = ($('perfilApelido').value || '').trim();
  var contato = ($('perfilContato').value || '').trim();
  if (nome.length < 3) { mostrarToast('Nome inválido.', 'erro'); return; }
  var dados = { nome: nome, apelido: apelido, contato: contato };
  if ($('perfilGympassLink')) dados.gympassLink = ($('perfilGympassLink').value || '').trim();
  if (btn) { btn.classList.add('carregando'); btn.innerHTML = '<span class="spinner-btn"></span> Salvando...'; }
  DB.salvar('alunos', dados, logado.id).then(function () {
    if (btn) { btn.classList.remove('carregando'); btn.innerHTML = '<i class="fas fa-save"></i> Salvar Perfil'; }
    mostrarToast('Perfil atualizado.');
    renderAluno();
    renderCheckin();
  });
}

function uploadFotoPerfil(input) {
  var logado = alunoLogado();
  var arquivo = input.files && input.files[0];
  if (!logado || !arquivo) return;
  comprimirImagem(arquivo, 320, 0.75).then(function (dataUrl) {
    input.value = '';
    DB.salvar('alunos', { foto: dataUrl }, logado.id).then(function () {
      mostrarToast('Foto atualizada.');
      renderAluno();
    });
  });
}

function trocarSenhaAluno() {
  var logado = alunoLogado();
  if (!logado) return;
  var atual = prompt('Digite sua senha atual:');
  if (atual === null) return;
  if (hashSenha(atual) !== logado.senhaHash) { mostrarToast('Senha atual incorreta.', 'erro'); return; }
  var nova = prompt('Digite a nova senha (mín. 4 caracteres):');
  if (nova === null) return;
  if (String(nova).length < 4) { mostrarToast('Senha muito curta.', 'erro'); return; }
  DB.salvar('alunos', { senhaHash: hashSenha(nova) }, logado.id).then(function () {
    mostrarToast('Senha alterada com sucesso.');
    registroLog('auth', 'Aluno trocou a senha: ' + logado.nome);
  });
}

function baixarMeusDados() {
  var logado = alunoLogado();
  if (!logado) return;
  var copia = Object.assign({}, logado);
  delete copia.senhaHash;
  var pacote = {
    exportadoEm: agoraISO(),
    aluno: copia,
    presencas: DB.listar('presencas').filter(function (p) { return p.alunoId === logado.id; }),
    avaliacoes: DB.listar('avaliacoes').filter(function (a) { return a.alunoId === logado.id; }),
    certificados: certificadosDoAluno(logado)
  };
  baixarArquivo('meus-dados-' + normalizar(logado.nome).replace(/\s+/g, '-') + '.json', JSON.stringify(pacote, null, 2), 'application/json');
}

function pillStatusSolicitacao(status) {
  if (status === 'aprovado') return '<span class="pill pill-ok">APROVADO</span>';
  if (status === 'rejeitado') return '<span class="pill pill-no">RECUSADO</span>';
  if (status === 'realizado') return '<span class="pill pill-info">REALIZADO</span>';
  return '<span class="pill pill-pend">PENDENTE</span>';
}

function enviarSolicitacaoTreino(btn) {
  var logado = alunoLogado();
  if (!logado) { mostrarToast('Faça login para solicitar treino.', 'erro'); return; }
  var tipo = ($('solicitacaoTipo').value || '').trim();
  var dataPref = ($('solicitacaoData').value || '').trim();
  var obs = ($('solicitacaoObs').value || '').trim();
  if (!tipo) { mostrarToast('Escolha o tipo de treino.', 'erro'); return; }

  if (btn) { btn.classList.add('carregando'); btn.innerHTML = '<span class="spinner-btn"></span> Enviando...'; }

  DB.salvar('solicitacoes', {
    alunoId: logado.id,
    alunoNome: logado.nome,
    alunoApelido: logado.apelido || '',
    graduacao: logado.graduacao || '',
    tipo: tipo,
    dataPreferida: dataPref,
    observacao: obs,
    status: 'pendente',
    respostaProfessor: '',
    criadoEm: agoraISO()
  }).then(function () {
    if (btn) { btn.classList.remove('carregando'); btn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar pedido ao professor'; }
    if ($('solicitacaoObs')) $('solicitacaoObs').value = '';
    if ($('solicitacaoData')) $('solicitacaoData').value = '';
    mostrarToast('Pedido enviado! O professor vai avaliar.');
    registroLog('aluno', 'Solicitação de treino: ' + tipo + ' por ' + logado.nome);
    renderAluno();
  }).catch(function () {
    if (btn) { btn.classList.remove('carregando'); btn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar pedido ao professor'; }
  });
}

/* ---------------------------------------------------------------
   12. ABA PROFESSOR
   --------------------------------------------------------------- */
function renderAbaProfessor() {
  var box = $('conteudoProfessor');
  if (!exigirEquipe(['professor', 'adm', 'dev'], box)) return;

  var pendentes = DB.listar('presencas').filter(function (p) { return p.status === 'pendente'; })
    .sort(function (a, b) { return String(a.criadoEm || '').localeCompare(String(b.criadoEm || '')); });
  var solicitacoesPend = DB.listar('solicitacoes').filter(function (s) { return s.status === 'pendente'; })
    .sort(function (a, b) { return String(a.criadoEm || '').localeCompare(String(b.criadoEm || '')); });
  var solicitacoesRecentes = DB.listar('solicitacoes').filter(function (s) { return s.status !== 'pendente'; })
    .sort(function (a, b) { return String(b.criadoEm || '').localeCompare(String(a.criadoEm || '')); }).slice(0, 10);
  var polos = DB.listar('polos');
  var horarios = DB.listar('horarios').slice().sort(function (a, b) { return Number(a.diaSemana) - Number(b.diaSemana); });
  var alunos = DB.listar('alunos').slice().sort(function (a, b) { return normalizar(a.nome).localeCompare(normalizar(b.nome)); });

  var html = '';

  html += '<div class="card" style="border:1px solid var(--accent-blue);">' +
    '<h3><i class="fas fa-user-shield"></i> Sessão: ' + esc(sessaoEquipe.nome) + ' <span class="pill pill-info">' + esc(sessaoEquipe.papel) + '</span></h3>' +
    '<button class="btn btn-back" style="margin:0;" onclick="sairEquipe()"><i class="fas fa-sign-out-alt"></i> Sair da equipe</button></div>';

  /* --- Atalho Portal de Parceiros Wellhub/Gympass --- */
  html += '<div class="card" style="border:1px solid var(--gympass-red);">' +
    '<h3 style="color:var(--gympass-red);"><i class="fas fa-ticket-alt"></i> Check-ins Wellhub / Gympass</h3>' +
    '<p class="mini" style="margin-bottom:8px;">Valide os check-ins dos alunos Wellhub direto no Portal de Parceiros (você tem até 20 min após o pedido do aluno).</p>' +
    '<a class="btn btn-gympass" href="https://partners.gympass.com/validation/capoeira-na-pequena-africa-gamboa" target="_blank" rel="noopener" style="display:flex; align-items:center; justify-content:center; text-decoration:none;">' +
    '<i class="fas fa-external-link-alt"></i>&nbsp; Abrir Portal de Parceiros</a></div>';

  /* --- Check-in do professor na aula --- */
  var presProf = professorPresenteHoje();
  html += '<div class="card" style="border:1px solid var(--primary-green);">' +
    '<h3 style="color:var(--primary-green);"><i class="fas fa-chalkboard-teacher"></i> Check-in do Professor na Aula</h3>' +
    '<p class="mini" style="margin-bottom:8px;">Marque sua presença. Os alunos verão que o professor já está no treino.</p>';
  if (presProf) {
    html += '<div class="aviso-info"><i class="fas fa-check-circle"></i> Você está marcado como <b>presente</b> hoje' +
      (presProf.hora ? ' desde ' + esc(presProf.hora) : '') +
      (presProf.poloNome ? ' • ' + esc(presProf.poloNome) : '') + '.</div>' +
      '<button class="btn btn-danger" onclick="professorCheckoutAula()"><i class="fas fa-sign-out-alt"></i> Encerrar presença de hoje</button>';
  } else {
    html += '<label class="campo-label">Polo / local (opcional)</label>' +
      '<select id="profCheckinPoloAuto"><option value="">— selecionar —</option>' +
      polos.map(function (p) { return '<option value="' + p.id + '">' + esc(p.nome) + '</option>'; }).join('') +
      '</select>' +
      '<label class="campo-label">Observação (opcional)</label>' +
      '<input id="profCheckinObsAuto" placeholder="Ex: roda aberta, foco em ginga...">' +
      '<button class="btn" onclick="professorCheckinAula()"><i class="fas fa-map-marker-alt"></i> Estou na aula — fazer check-in</button>';
  }
  html += '</div>';

  /* --- INTERAÇÃO ALUNO-PROFESSOR --- */
  html += htmlPainelInteracaoProfessor();

  /* --- check-ins pendentes --- */
  html += '<div class="card"><h3><i class="fas fa-clipboard-check"></i> Check-ins Pendentes <span class="badge-count">' + pendentes.length + '</span></h3>';
  if (!pendentes.length) { html += '<p class="sem-dados">Nenhum check-in aguardando aprovação.</p>'; }
  pendentes.forEach(function (p) {
    html += '<div class="lista-item">' +
      '<div class="linha"><b>' + esc(p.alunoNome) + '</b><span class="mini">' + dataBR(p.data) + ' ' + esc(p.hora || '') + '</span></div>' +
      '<span class="mini">' + esc(p.tipo === 'gympass' ? 'Gympass/Wellhub' : (p.poloNome || p.tipo)) +
      (p.atrasoMin ? ' • <span style="color:var(--danger);">atraso ' + p.atrasoMin + ' min</span>' : '') + '</span>' +
      (p.justificativa ? '<div class="mini">Justificativa: ' + esc(p.justificativa) + '</div>' : '') +
      '<input id="obsPresenca_' + p.id + '" placeholder="Observação do professor (opcional)" style="margin-top:6px;">' +
      '<div class="flex-btn" style="margin-top:4px;">' +
        '<button class="btn btn-mini" onclick="decidirPresenca(\'' + p.id + '\',\'aprovado\')"><i class="fas fa-check"></i> Aprovar</button>' +
        '<button class="btn btn-danger btn-mini" onclick="decidirPresenca(\'' + p.id + '\',\'rejeitado\')"><i class="fas fa-xmark"></i> Rejeitar</button>' +
      '</div></div>';
  });
  html += '</div>';

  /* --- advertências sugeridas pela IA --- */
  var flagsAdvertencia = identificarAlunosParaAdvertencia();
  html += '<div class="card" style="border:1px solid var(--danger);"><h3><i class="fas fa-triangle-exclamation"></i> Advertências (IA) <span class="badge-count">' + flagsAdvertencia.length + '</span></h3>';
  html += '<p class="mini" style="margin-bottom:6px;">A IA só redige o texto com base em dados reais — você revisa e decide se envia.</p>';
  if (!flagsAdvertencia.length) { html += '<p class="sem-dados">Nenhum aluno com padrão preocupante no momento.</p>'; }
  else {
    html += flagsAdvertencia.map(function (f) {
      return '<div class="lista-item"><b style="color:var(--danger); font-size:0.78rem;">' + esc(f.aluno.apelido || f.aluno.nome) + '</b>' +
        '<div class="mini" style="margin-top:2px;">' + f.motivos.map(esc).join('; ') + '</div>' +
        '<button class="btn btn-danger btn-mini" style="margin-top:6px;" onclick="gerarAdvertenciaIA(\'' + f.aluno.id + '\')"><i class="fas fa-robot"></i> Gerar Advertência com IA</button></div>';
    }).join('');
  }
  html += '</div>';

  /* --- cadastro de aluno pelo professor --- */
  html += '<div class="card" style="border:1px solid var(--primary-green);"><h3><i class="fas fa-user-plus"></i> Cadastrar Novo Aluno</h3>' +
    '<p class="mini" style="margin-bottom:6px;">Use isso pra cadastrar alunos que não têm celular/app, ou que preferem que você faça por eles.</p>' +
    '<label class="campo-label">Nome completo</label><input id="profCadNome" placeholder="Nome completo">' +
    '<label class="campo-label">Apelido na capoeira</label><input id="profCadApelido" placeholder="Opcional">' +
    '<label class="campo-label">Graduação</label><select id="profCadGraduacaoSelect"></select>' +
    '<label class="campo-label">Contato (WhatsApp, opcional)</label><input id="profCadContato" placeholder="(21) 90000-0000">' +
    '<label class="campo-label">Como treina?</label><select id="profCadTipoAluno"><option value="normal">Aluno normal (matrícula direta)</option><option value="gympass">Aluno Gympass / Wellhub</option></select>' +
    '<button class="btn" onclick="cadastrarAlunoPeloProfessor(this)"><i class="fas fa-user-plus"></i> Cadastrar Aluno</button>' +
    '<p class="mini" style="margin-top:6px;">Uma senha provisória é gerada automaticamente — o aluno pode trocar depois em "Esqueci minha senha".</p></div>' +

  /* --- lançamento manual de presença (caso o check-in do aluno dê erro) --- */
  '<div class="card" style="border:1px solid var(--gold);"><h3><i class="fas fa-user-check"></i> Lançar/Corrigir Presença Manualmente</h3>' +
    '<p class="mini" style="margin-bottom:6px;">Use isso se o check-in do aluno não aparecer aqui por algum erro — você registra a presença na hora.</p>' +
    '<label class="campo-label">Aluno</label><select id="manualPresencaAluno">' +
    '<option value="">Selecione...</option>' +
    alunos.map(function (a) { return '<option value="' + a.id + '">' + esc(a.nome) + (a.apelido ? ' (' + esc(a.apelido) + ')' : '') + '</option>'; }).join('') +
    '</select>' +
    '<label class="campo-label">Data</label><input type="date" id="manualPresencaData" value="' + dataLocalISO() + '">' +
    '<label class="campo-label">Polo (opcional)</label><select id="manualPresencaPolo"><option value="">— Não informado —</option>' +
    polos.map(function (p) { return '<option value="' + p.id + '">' + esc(p.nome) + '</option>'; }).join('') + '</select>' +
    '<label class="campo-label">Observação (opcional)</label><input id="manualPresencaObs" placeholder="Ex: check-in deu erro, lançado manualmente">' +
    '<button class="btn btn-gold" onclick="lancarPresencaManual()"><i class="fas fa-check-circle"></i> Registrar Presença Aprovada</button></div>';

  /* --- check-in manual pelo professor (ajuda em caso de erro) --- */
  html += '<div class="card" style="border:1px solid var(--gold);">' +
    '<h3 style="color:var(--gold);"><i class="fas fa-user-plus"></i> Registrar Check-in Manual</h3>' +
    '<p class="mini" style="margin-bottom:8px;">Use quando o aluno teve problema no app, esqueceu o celular ou houve erro no check-in.</p>' +
    '<label class="campo-label">Aluno</label>' +
    '<select id="profCheckinAluno">' +
      (alunos.length
        ? alunos.map(function (a) { return '<option value="' + a.id + '">' + esc(a.nome) + (a.apelido ? ' (' + esc(a.apelido) + ')' : '') + '</option>'; }).join('')
        : '<option value="">Nenhum aluno cadastrado</option>') +
    '</select>' +
    '<label class="campo-label">Polo / local</label>' +
    '<select id="profCheckinPolo">' +
      (polos.length
        ? polos.map(function (p) { return '<option value="' + p.id + '">' + esc(p.nome) + '</option>'; }).join('')
        : '<option value="">Cadastre um polo primeiro</option>') +
    '</select>' +
    '<label class="campo-label">Status</label>' +
    '<select id="profCheckinStatus">' +
      '<option value="aprovado">Aprovado (já confirma presença)</option>' +
      '<option value="pendente">Pendente (vai para lista de aprovação)</option>' +
    '</select>' +
    '<label class="campo-label">Observação (opcional)</label>' +
    '<input id="profCheckinObs" placeholder="Ex: aluno sem celular / correção de erro">' +
    '<button class="btn btn-gold" onclick="professorRegistrarCheckinManual()"><i class="fas fa-plus"></i> Registrar check-in do aluno</button>' +
  '</div>';

  /* --- pedidos de treino específico (NOVO) --- */
  /* --- painel de avaliação de conhecimentos (IA) --- */
  var todosTestes = DB.listar('testesConhecimento');
  var porAlunoTeste = {};
  todosTestes.forEach(function (t) {
    if (!porAlunoTeste[t.alunoId]) porAlunoTeste[t.alunoId] = { nome: t.alunoApelido || t.alunoNome, testes: [] };
    porAlunoTeste[t.alunoId].testes.push(t);
  });
  var listaPorAlunoTeste = Object.keys(porAlunoTeste).map(function (id) {
    var item = porAlunoTeste[id];
    item.testes.sort(function (a, b) { return String(b.semana || '').localeCompare(String(a.semana || '')); });
    var soma = item.testes.reduce(function (s, t) { return s + (t.acertos / t.total); }, 0);
    item.mediaPct = Math.round((soma / item.testes.length) * 100);
    item.id = id;
    return item;
  }).sort(function (a, b) { return b.mediaPct - a.mediaPct; });

  html += '<div class="card"><h3><i class="fas fa-graduation-cap"></i> Painel de Avaliação de Conhecimentos (IA) <span class="badge-count">' + todosTestes.length + '</span></h3>';
  html += '<p class="mini" style="margin-bottom:6px;">Testes semanais gerados pela IA. A decisão de certificado/corda continua sempre com você.</p>';
  if (!listaPorAlunoTeste.length) { html += '<p class="sem-dados">Nenhum teste feito ainda.</p>'; }
  else {
    html += listaPorAlunoTeste.map(function (item) {
      var idSeguro = String(item.id).replace(/[^a-zA-Z0-9]/g, '');
      var historico = item.testes.map(function (t) {
        return '<div class="linha mini"><span>' + esc(t.semana) + ' • ' + dataBR(t.data) + '</span><span>' + t.acertos + '/' + t.total + '</span></div>';
      }).join('');
      return '<div class="lista-item">' +
        '<div class="linha"><b style="color:var(--primary-green); font-size:0.78rem;">' + esc(item.nome) + '</b><span class="badge-count">' + item.mediaPct + '%</span></div>' +
        '<span class="mini">' + item.testes.length + ' teste(s) feito(s)</span>' + historico +
        '<button class="btn btn-secondary" style="margin-top:6px;" onclick="gerarParecerIA(\'' + item.id + '\', \'parecer' + idSeguro + '\')"><i class="fas fa-magic"></i> Gerar Parecer da IA</button>' +
        '<div id="parecer' + idSeguro + '" class="mini" style="margin-top:6px; color:var(--gold);"></div></div>';
    }).join('');
  }
  html += '</div>';

  html += '<div class="card" style="border:1px solid var(--accent-blue);"><h3 style="color:var(--accent-blue);"><i class="fas fa-hand-point-up"></i> Pedidos de Treino Específico <span class="badge-count">' + solicitacoesPend.length + '</span></h3>';
  if (!solicitacoesPend.length) { html += '<p class="sem-dados">Nenhum pedido de treino aguardando resposta.</p>'; }
  solicitacoesPend.forEach(function (s) {
    html += '<div class="lista-item">' +
      '<div class="linha"><b>' + esc(s.alunoNome) + (s.alunoApelido ? ' (' + esc(s.alunoApelido) + ')' : '') + '</b>' +
      '<span class="mini">' + dataHoraBR(s.criadoEm) + '</span></div>' +
      '<div style="margin:4px 0;"><span class="pill pill-info">' + esc(s.tipo) + '</span>' +
      (s.graduacao ? ' <span class="mini">' + esc(s.graduacao) + '</span>' : '') + '</div>' +
      (s.dataPreferida ? '<span class="mini"><i class="fas fa-calendar"></i> Preferência: ' + dataBR(s.dataPreferida) + '</span><br>' : '') +
      (s.observacao ? '<div class="mini" style="margin-top:3px;">' + esc(s.observacao) + '</div>' : '') +
      htmlConversaSolicitacao(s, 'professor') +
      '<input id="respSolic_' + s.id + '" placeholder="Resposta oficial ao aluno (opcional)" style="margin-top:6px;">' +
      '<div class="flex-btn" style="margin-top:4px;">' +
        '<button class="btn btn-mini" onclick="decidirSolicitacao(\'' + s.id + '\',\'aprovado\')"><i class="fas fa-check"></i> Aprovar</button>' +
        '<button class="btn btn-secondary btn-mini" onclick="decidirSolicitacao(\'' + s.id + '\',\'realizado\')"><i class="fas fa-check-double"></i> Já realizado</button>' +
        '<button class="btn btn-danger btn-mini" onclick="decidirSolicitacao(\'' + s.id + '\',\'rejeitado\')"><i class="fas fa-xmark"></i> Recusar</button>' +
      '</div></div>';
  });
  if (solicitacoesRecentes.length) {
    html += '<h3 style="margin-top:12px; font-size:0.82rem; color:var(--text-sub);"><i class="fas fa-history"></i> Histórico recente</h3>';
    solicitacoesRecentes.forEach(function (s) {
      html += '<div class="lista-item" style="opacity:0.85;"><div class="linha"><span>' + esc(s.alunoNome) + ' — ' + esc(s.tipo) + '</span>' +
        pillStatusSolicitacao(s.status) + '</div>' +
        '<span class="mini">' + dataHoraBR(s.criadoEm) + '</span>' +
        (s.respostaProfessor ? '<div class="mini" style="color:var(--gold);">Resp.: ' + esc(s.respostaProfessor) + '</div>' : '') +
        '</div>';
    });
  }
  html += '</div>';

  /* --- polos --- */
  html += '<div class="card"><h3><i class="fas fa-map-marked-alt"></i> Polos / Locais de Treino</h3>';
  if (!polos.length) html += '<p class="sem-dados">Nenhum polo cadastrado.</p>';
  polos.forEach(function (p) {
    html += '<div class="lista-item"><div class="linha"><b>' + esc(p.nome) + '</b>' +
      '<button class="btn btn-danger btn-mini" onclick="excluirPolo(\'' + p.id + '\')"><i class="fas fa-trash"></i></button></div>' +
      '<span class="mini">' + esc(p.endereco || 'sem endereço') + '</span>' +
      (p.gmaps ? ' <a class="mini" href="' + esc(p.gmaps) + '" target="_blank" rel="noopener">Maps</a>' : '') + '</div>';
  });
  html += '<label class="campo-label">Nome do polo</label><input id="poloNome" placeholder="Ex: Sede - Pedra do Sal">' +
    '<label class="campo-label">Endereço</label><input id="poloEndereco" placeholder="Rua, número, bairro">' +
    '<label class="campo-label">Link do Google Maps</label><input id="poloGmaps" placeholder="https://maps.google.com/...">' +
    '<button type="button" class="btn btn-secondary" onclick="usarGpsParaPolo()"><i class="fas fa-location-arrow"></i> Usar Minha Localização Atual (GPS)</button>' +
    '<button class="btn" onclick="salvarPolo()"><i class="fas fa-plus"></i> Cadastrar Polo</button></div>';

  /* --- horários --- */
  html += '<div class="card"><h3><i class="fas fa-calendar-week"></i> Horário Fixo da Semana</h3>';
  if (!horarios.length) html += '<p class="sem-dados">Nenhum horário cadastrado.</p>';
  horarios.forEach(function (h) {
    var polo = DB.buscar('polos', h.poloId);
    html += '<div class="lista-item"><div class="linha"><b>' + esc(DIAS_SEMANA[Number(h.diaSemana)]) + '</b>' +
      '<button class="btn btn-danger btn-mini" onclick="excluirHorario(\'' + h.id + '\')"><i class="fas fa-trash"></i></button></div>' +
      '<span class="mini">' + esc(h.horaInicio) + ' - ' + esc(h.horaFim) + ' • ' + esc(h.modalidade || 'Treino') + (polo ? ' • ' + esc(polo.nome) : '') + '</span></div>';
  });
  html += '<label class="campo-label">Dia da semana</label><select id="horarioDia">' +
    DIAS_SEMANA.map(function (d, i) { return '<option value="' + i + '">' + d + '</option>'; }).join('') + '</select>' +
    '<div class="grade-2"><div><label class="campo-label">Início</label><input id="horarioInicio" type="time" value="19:00"></div>' +
    '<div><label class="campo-label">Fim</label><input id="horarioFim" type="time" value="21:00"></div></div>' +
    '<label class="campo-label">Modalidade</label><input id="horarioModalidade" placeholder="Ex: Treino de corda / Roda">' +
    '<label class="campo-label">Polo</label><select id="horarioPolo">' +
    (polos.length ? polos.map(function (p) { return '<option value="' + p.id + '">' + esc(p.nome) + '</option>'; }).join('') : '<option value="">Cadastre um polo primeiro</option>') +
    '</select>' +
    '<button class="btn" onclick="salvarHorario()"><i class="fas fa-plus"></i> Adicionar Horário</button></div>';

  /* --- avisos --- */
  html += '<div class="card"><h3><i class="fas fa-bullhorn"></i> Publicar Aviso / Local do Treino</h3>' +
    '<label class="campo-label">Título</label><input id="avisoTitulo" placeholder="Ex: Treino na Pedra do Sal">' +
    '<label class="campo-label">Mensagem</label><textarea id="avisoTexto" placeholder="Ex: Hoje o treino será às 19h na Pedra do Sal, levem a corda!"></textarea>' +
    '<label class="campo-label">Polo (opcional)</label><select id="avisoPolo"><option value="">— Nenhum —</option>' +
    polos.map(function (p) { return '<option value="' + p.id + '">' + esc(p.nome) + '</option>'; }).join('') + '</select>' +
    '<button class="btn" onclick="publicarAviso()"><i class="fas fa-paper-plane"></i> Publicar Aviso</button>' +
    '<button class="btn btn-secondary" onclick="notificarLocalAlunos()"><i class="fas fa-broadcast-tower"></i> Notificar local aos alunos agora</button></div>';

  /* --- avaliação semanal + desenvolvimento --- */
  html += '<div class="card" id="cardAvaliacaoSemanalProfessor" style="border:1px solid var(--gold);">' +
    '<h3 style="color:var(--gold);"><i class="fas fa-clipboard-list"></i> Avaliação Semanal por Item</h3>' +
    '<p class="mini" style="margin-bottom:8px;">Avalie cada habilidade (0–10) e registre o desenvolvimento do aluno na semana.</p>' +
    '<label class="campo-label">Aluno</label>' +
    '<select id="avalAluno" onchange="carregarDesenvolvimentoAluno()">' +
    (alunos.length ? alunos.map(function (a) { return '<option value="' + a.id + '">' + esc(a.nome) + (a.apelido ? ' (' + esc(a.apelido) + ')' : '') + '</option>'; }).join('') : '<option value="">Nenhum aluno cadastrado</option>') +
    '</select>' +
    '<label class="campo-label">Semana de referência</label>' +
    '<input id="avalSemana" type="week" value="' + semanaISOAtual() + '" onchange="carregarDesenvolvimentoAluno()">' +
    '<div id="boxDesenvolvimentoAluno" style="margin:8px 0;"></div>' +
    '<div class="grade-2">' +
      '<div><label class="campo-label">Técnica (0-10)</label><input id="avalTecnica" type="number" min="0" max="10" step="0.5" value="8"></div>' +
      '<div><label class="campo-label">Disciplina (0-10)</label><input id="avalDisciplina" type="number" min="0" max="10" step="0.5" value="8"></div>' +
      '<div><label class="campo-label">Ritmo (0-10)</label><input id="avalRitmo" type="number" min="0" max="10" step="0.5" value="8"></div>' +
      '<div><label class="campo-label">Musicalidade (0-10)</label><input id="avalMusicalidade" type="number" min="0" max="10" step="0.5" value="8"></div>' +
    '</div>' +
    '<label class="campo-label">Compromisso (0-10)</label><input id="avalCompromisso" type="number" min="0" max="10" step="0.5" value="8">' +
    '<label class="campo-label">Desenvolvimento na semana</label>' +
    '<textarea id="avalDesenvolvimento" placeholder="Ex: Melhorou a ginga e as esquivas; ainda trava no berimbau; mais presente nas rodas..."></textarea>' +
    '<label class="campo-label">Observação geral / feedback</label>' +
    '<textarea id="avalObservacao" placeholder="Pontos fortes, o que melhorar e metas para a próxima semana"></textarea>' +
    '<button class="btn btn-gold" onclick="salvarAvaliacao()"><i class="fas fa-save"></i> Salvar avaliação semanal</button>' +
    '<p class="mini" style="margin-top:6px;">Se já existir avaliação desta semana para o aluno, ela será atualizada.</p>' +
  '</div>';

  /* --- certificados --- */
  html += '<div class="card"><h3><i class="fas fa-award"></i> Emitir Certificado</h3>' +
    '<label class="campo-label">Aluno</label><select id="certAluno" onchange="atualizarCargaCertificado()">' +
    (alunos.length ? alunos.map(function (a) { return '<option value="' + a.id + '">' + esc(a.nome) + '</option>'; }).join('') : '<option value="">Nenhum aluno cadastrado</option>') +
    '</select>' +
    '<div id="certCargaInfo" class="aviso-info" style="margin:8px 0;">Selecione um aluno para ver a carga horária acumulada pelas aulas.</div>' +
    '<label class="campo-label">Evento / título do certificado</label><input id="certEvento" placeholder="Ex: Curso de Capoeira — semestre">' +
    '<label class="campo-label">Data</label><input id="certData" type="date" value="' + dataLocalISO() + '">' +
    '<label class="campo-label">Carga horária (preenchida pelas aulas)</label><input id="certCarga" placeholder="Ex: 12h">' +
    '<label class="campo-label">Assinatura</label><input id="certAssinatura" placeholder="Ex: Mestre Formiga">' +
    '<button class="btn btn-gold" onclick="emitirCertificado()"><i class="fas fa-award"></i> Emitir Certificado</button>' +
    '<p class="mini" style="margin-top:6px;">A carga é calculada automaticamente: cada check-in <b>aprovado</b> soma ' + formatarCargaHoraria(horasPorAulaConfig()) + ' (configurável na ADM).</p></div>';

  /* --- lista de certificados já emitidos, com opção de apagar --- */
  var todosCerts = DB.listar('certificados').slice().sort(function (a, b) { return String(b.data || '').localeCompare(String(a.data || '')); });
  html += '<div class="card"><h3><i class="fas fa-list"></i> Certificados Emitidos <span class="badge-count">' + todosCerts.length + '</span></h3>';
  if (!todosCerts.length) { html += '<p class="sem-dados">Nenhum certificado emitido ainda.</p>'; }
  else {
    html += todosCerts.map(function (c) {
      return '<div class="lista-item"><div class="linha"><b style="color:var(--primary-green); font-size:0.78rem;">' + esc(c.alunoNome || '-') + '</b>' +
        '<span class="mini">' + dataBR(c.data) + '</span></div>' +
        '<span class="mini">' + esc(c.evento || '-') + ' • Código: ' + esc(c.codigo || '-') + '</span>' +
        '<div class="flex-btn" style="margin-top:6px;">' +
          '<button class="btn btn-gold btn-mini" onclick="baixarCertificado(\'' + c.id + '\')"><i class="fas fa-file-arrow-down"></i> Abrir</button>' +
          '<button class="btn btn-whatsapp btn-mini" onclick="compartilharCertificadoWhatsApp(\'' + c.id + '\')"><i class="fab fa-whatsapp"></i> WhatsApp</button>' +
          '<button class="btn btn-danger btn-mini" onclick="apagarCertificado(\'' + c.id + '\')"><i class="fas fa-trash"></i> Apagar</button>' +
        '</div></div>';
    }).join('');
  }
  html += '</div>';

  /* --- Aulas com alongamento (fotos + textos) --- */
  html += htmlPainelAulasConteudoProfessor();

  box.innerHTML = html;
  tornarCardsColapsaveis(box);
  setTimeout(function () {
    carregarDesenvolvimentoAluno();
    atualizarBadgesInteracao();
    atualizarCargaCertificado();
  }, 50);
}

function htmlPainelAulasConteudoProfessor() {
  var lista = DB.listar('aulasConteudo').slice().sort(function (a, b) {
    return String(b.atualizadoEm || b.criadoEm || '').localeCompare(String(a.atualizadoEm || a.criadoEm || ''));
  });
  var html = '<div class="card" style="border:1px solid var(--primary-green);">' +
    '<h3 style="color:var(--primary-green);"><i class="fas fa-book-open"></i> Aulas e Alongamentos <span class="badge-count">' + lista.length + '</span></h3>' +
    '<p class="mini" style="margin-bottom:8px;">Cadastre aulas com texto e fotos de alongamento. Os alunos veem na aba Aluno.</p>' +
    '<input type="hidden" id="aulaConteudoId" value="">' +
    '<label class="campo-label">Título da aula</label>' +
    '<input id="aulaConteudoTitulo" placeholder="Ex: Alongamento pré-treino — membros inferiores">' +
    '<label class="campo-label">Categoria</label>' +
    '<select id="aulaConteudoCategoria">' +
      '<option value="alongamento">Alongamento</option>' +
      '<option value="aquecimento">Aquecimento</option>' +
      '<option value="tecnica">Técnica</option>' +
      '<option value="musicalidade">Musicalidade</option>' +
      '<option value="roda">Roda</option>' +
      '<option value="outro">Outro</option>' +
    '</select>' +
    '<label class="campo-label">Texto / orientação</label>' +
    '<textarea id="aulaConteudoTexto" placeholder="Descreva os passos, duração, cuidados..."></textarea>' +
    '<label class="campo-label">Fotos (alongamento / demonstração)</label>' +
    '<input type="file" id="aulaConteudoFotos" accept="image/*" multiple onchange="prepararFotosAula(this)">' +
    '<div id="aulaConteudoPreview" style="display:flex; flex-wrap:wrap; gap:6px; margin:6px 0;"></div>' +
    '<input type="hidden" id="aulaConteudoFotosData" value="[]">' +
    '<div class="flex-btn">' +
      '<button class="btn" onclick="salvarAulaConteudo()"><i class="fas fa-save"></i> Salvar aula</button>' +
      '<button class="btn btn-secondary" onclick="limparFormAulaConteudo()"><i class="fas fa-plus"></i> Nova</button>' +
    '</div>';

  if (!lista.length) {
    html += '<p class="sem-dados" style="margin-top:10px;">Nenhuma aula cadastrada ainda.</p>';
  } else {
    html += '<h3 style="margin-top:12px; font-size:0.82rem;"><i class="fas fa-list"></i> Aulas publicadas</h3>';
    lista.forEach(function (a) {
      var fotos = Array.isArray(a.fotos) ? a.fotos : [];
      html += '<div class="lista-item">' +
        '<div class="linha"><b>' + esc(a.titulo || 'Sem título') + '</b><span class="pill pill-info">' + esc(a.categoria || 'outro') + '</span></div>' +
        '<span class="mini">' + dataHoraBR(a.atualizadoEm || a.criadoEm) + (a.autor ? ' • ' + esc(a.autor) : '') + '</span>' +
        (a.texto ? '<div class="mini" style="margin-top:4px;">' + esc(String(a.texto).slice(0, 120)) + (a.texto.length > 120 ? '…' : '') + '</div>' : '') +
        (fotos.length ? '<div style="display:flex;gap:4px;margin-top:6px;flex-wrap:wrap;">' +
          fotos.slice(0, 4).map(function (f) {
            return urlSegura(f) ? '<img src="' + urlSegura(f) + '" alt="foto" style="width:56px;height:56px;object-fit:cover;border-radius:8px;border:1px solid var(--card-border);">' : '';
          }).join('') + '</div>' : '') +
        '<div class="flex-btn" style="margin-top:6px;">' +
          '<button class="btn btn-secondary btn-mini" onclick="carregarAulaConteudoEdicao(\'' + a.id + '\')"><i class="fas fa-pen"></i> Editar</button>' +
          '<button class="btn btn-danger btn-mini" onclick="excluirAulaConteudo(\'' + a.id + '\')"><i class="fas fa-trash"></i> Apagar</button>' +
        '</div></div>';
    });
  }
  html += '</div>';
  return html;
}

function limparFormAulaConteudo() {
  if ($('aulaConteudoId')) $('aulaConteudoId').value = '';
  if ($('aulaConteudoTitulo')) $('aulaConteudoTitulo').value = '';
  if ($('aulaConteudoCategoria')) $('aulaConteudoCategoria').value = 'alongamento';
  if ($('aulaConteudoTexto')) $('aulaConteudoTexto').value = '';
  if ($('aulaConteudoFotosData')) $('aulaConteudoFotosData').value = '[]';
  if ($('aulaConteudoPreview')) $('aulaConteudoPreview').innerHTML = '';
  if ($('aulaConteudoFotos')) $('aulaConteudoFotos').value = '';
  mostrarToast('Formulário limpo — nova aula.');
}

function prepararFotosAula(input) {
  var files = input.files;
  if (!files || !files.length) return;
  var existentes = [];
  try { existentes = JSON.parse(($('aulaConteudoFotosData') || {}).value || '[]'); } catch (e) { existentes = []; }
  if (!Array.isArray(existentes)) existentes = [];
  var restantes = Math.max(0, 6 - existentes.length);
  if (!restantes) { mostrarToast('Máximo de 6 fotos por aula.', 'erro'); return; }
  var lista = Array.prototype.slice.call(files, 0, restantes);
  mostrarToast('Processando fotos...');
  var chain = Promise.resolve();
  lista.forEach(function (file) {
    if (!/^image\//i.test(file.type || '')) return;
    chain = chain.then(function () {
      return comprimirImagem(file, 900, 0.8).then(function (dataUrl) {
        existentes.push(dataUrl);
      }).catch(function () {});
    });
  });
  chain.then(function () {
    if ($('aulaConteudoFotosData')) $('aulaConteudoFotosData').value = JSON.stringify(existentes);
    renderPreviewFotosAula(existentes);
    if (input) input.value = '';
    mostrarToast(existentes.length + ' foto(s) pronta(s).');
  });
}

function renderPreviewFotosAula(fotos) {
  var box = $('aulaConteudoPreview');
  if (!box) return;
  if (!fotos || !fotos.length) { box.innerHTML = ''; return; }
  box.innerHTML = fotos.map(function (f, i) {
    if (!urlSegura(f)) return '';
    return '<div style="position:relative;">' +
      '<img src="' + urlSegura(f) + '" alt="foto" style="width:64px;height:64px;object-fit:cover;border-radius:8px;border:1px solid var(--card-border);">' +
      '<button type="button" class="btn btn-danger btn-mini" style="position:absolute;top:-4px;right:-4px;padding:2px 6px;margin:0;font-size:0.6rem;" onclick="removerFotoAula(' + i + ')">×</button></div>';
  }).join('');
}

function removerFotoAula(idx) {
  var fotos = [];
  try { fotos = JSON.parse(($('aulaConteudoFotosData') || {}).value || '[]'); } catch (e) { fotos = []; }
  if (!Array.isArray(fotos)) fotos = [];
  fotos.splice(idx, 1);
  if ($('aulaConteudoFotosData')) $('aulaConteudoFotosData').value = JSON.stringify(fotos);
  renderPreviewFotosAula(fotos);
}

function carregarAulaConteudoEdicao(id) {
  var a = DB.buscar('aulasConteudo', id);
  if (!a) { mostrarToast('Aula não encontrada.', 'erro'); return; }
  if ($('aulaConteudoId')) $('aulaConteudoId').value = a.id;
  if ($('aulaConteudoTitulo')) $('aulaConteudoTitulo').value = a.titulo || '';
  if ($('aulaConteudoCategoria')) $('aulaConteudoCategoria').value = a.categoria || 'alongamento';
  if ($('aulaConteudoTexto')) $('aulaConteudoTexto').value = a.texto || '';
  var fotos = Array.isArray(a.fotos) ? a.fotos : [];
  if ($('aulaConteudoFotosData')) $('aulaConteudoFotosData').value = JSON.stringify(fotos);
  renderPreviewFotosAula(fotos);
  mostrarToast('Editando: ' + (a.titulo || 'aula'));
  try {
    var el = $('aulaConteudoTitulo');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch (e) {}
}

function salvarAulaConteudo() {
  var titulo = ($('aulaConteudoTitulo') || {}).value || '';
  titulo = titulo.trim();
  if (titulo.length < 3) { mostrarToast('Informe um título para a aula.', 'erro'); return; }
  var texto = ($('aulaConteudoTexto') || {}).value || '';
  texto = texto.trim();
  var categoria = ($('aulaConteudoCategoria') || {}).value || 'alongamento';
  var fotos = [];
  try { fotos = JSON.parse(($('aulaConteudoFotosData') || {}).value || '[]'); } catch (e) { fotos = []; }
  if (!Array.isArray(fotos)) fotos = [];
  fotos = fotos.filter(function (f) { return urlSegura(f); }).slice(0, 6);
  var id = ($('aulaConteudoId') || {}).value || '';
  var dados = {
    titulo: titulo,
    categoria: categoria,
    texto: texto,
    fotos: fotos,
    autor: sessaoEquipe ? sessaoEquipe.nome : 'Professor',
    atualizadoEm: agoraISO()
  };
  var promessa;
  if (id && DB.buscar('aulasConteudo', id)) {
    promessa = DB.salvar('aulasConteudo', dados, id);
  } else {
    dados.criadoEm = agoraISO();
    promessa = DB.salvar('aulasConteudo', dados);
  }
  promessa.then(function () {
    mostrarToast(id ? 'Aula atualizada!' : 'Aula publicada!');
    registroLog('professor', (id ? 'Editou' : 'Publicou') + ' aula: ' + titulo);
    limparFormAulaConteudo();
    renderAbaProfessor();
  }).catch(function () {
    mostrarToast('Não foi possível salvar a aula.', 'erro');
  });
}

function excluirAulaConteudo(id) {
  var a = DB.buscar('aulasConteudo', id);
  if (!a) return;
  abrirModal('Apagar aula',
    '<div class="alerta-dificuldade">Apagar <strong>' + esc(a.titulo || 'esta aula') + '</strong>?</div>',
    '<button class="btn btn-danger" onclick="confirmarExcluirAulaConteudo(\'' + id + '\')">Apagar</button>');
}

function confirmarExcluirAulaConteudo(id) {
  fecharModal();
  DB.excluir('aulasConteudo', id).then(function () {
    mostrarToast('Aula removida.');
    registroLog('professor', 'Removeu aula conteúdo');
    renderAbaProfessor();
  });
}

function htmlCardAulasConteudoAluno() {
  var lista = DB.listar('aulasConteudo').slice().sort(function (a, b) {
    return String(b.atualizadoEm || b.criadoEm || '').localeCompare(String(a.atualizadoEm || a.criadoEm || ''));
  });
  if (!lista.length) {
    return '<div class="card"><h3><i class="fas fa-book-open"></i> Aulas e Alongamentos</h3>' +
      '<p class="sem-dados">O professor ainda não publicou aulas com fotos.</p></div>';
  }
  var html = '<div class="card" style="border:1px solid var(--primary-green);">' +
    '<h3 style="color:var(--primary-green);"><i class="fas fa-book-open"></i> Aulas e Alongamentos</h3>' +
    '<p class="mini" style="margin-bottom:8px;">Conteúdo publicado pelo professor — textos e fotos.</p>';
  lista.forEach(function (a) {
    var fotos = Array.isArray(a.fotos) ? a.fotos : [];
    html += '<div class="lista-item">' +
      '<div class="linha"><b>' + esc(a.titulo || 'Aula') + '</b><span class="pill pill-info">' + esc(a.categoria || '') + '</span></div>' +
      '<span class="mini">' + dataHoraBR(a.atualizadoEm || a.criadoEm) + (a.autor ? ' • ' + esc(a.autor) : '') + '</span>' +
      (a.texto ? '<div style="font-size:0.78rem; margin-top:6px; white-space:pre-wrap; line-height:1.4;">' + esc(a.texto) + '</div>' : '') +
      (fotos.length ? '<div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;">' +
        fotos.map(function (f) {
          return urlSegura(f) ? '<img src="' + urlSegura(f) + '" alt="Alongamento" style="width:96px;height:96px;object-fit:cover;border-radius:10px;border:1px solid var(--card-border);cursor:pointer;" onclick="abrirFotoAulaAmpliada(this.src)">' : '';
        }).join('') + '</div>' : '') +
      '</div>';
  });
  html += '</div>';
  return html;
}

function abrirFotoAulaAmpliada(src) {
  if (!urlSegura(src)) return;
  abrirModal('Foto da aula',
    '<img src="' + urlSegura(src) + '" alt="Foto" style="max-width:100%; border-radius:10px; display:block; margin:0 auto;">',
    '');
}

function gerarImagemCertificado(c) {
  return new Promise(function (resolve) {
    var canvas = document.createElement('canvas');
    canvas.width = 1000; canvas.height = 700;
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = '#fffdf5'; ctx.fillRect(0, 0, 1000, 700);
    ctx.strokeStyle = '#b8860b'; ctx.lineWidth = 6; ctx.strokeRect(20, 20, 960, 660);
    ctx.strokeStyle = '#b8860b'; ctx.lineWidth = 2; ctx.strokeRect(32, 32, 936, 636);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#1b5e20';
    ctx.font = 'bold 42px Georgia, serif';
    ctx.fillText(CONFIG.tituloApp || 'Universo Capoeira', 500, 130);

    ctx.fillStyle = '#333';
    ctx.font = '20px Georgia, serif';
    ctx.fillText('Capoeira na Pequena África', 500, 165);

    ctx.fillStyle = '#8d6e00';
    ctx.font = 'bold 24px Georgia, serif';
    ctx.fillText('CERTIFICADO DE PARTICIPAÇÃO', 500, 225);

    ctx.fillStyle = '#333';
    ctx.font = '18px Georgia, serif';
    ctx.fillText('Certificamos que', 500, 280);

    ctx.fillStyle = '#0b3d0b';
    ctx.font = 'bold 40px Georgia, serif';
    ctx.fillText(c.alunoNome || '-', 500, 340);

    ctx.fillStyle = '#333';
    ctx.font = '18px Georgia, serif';
    var linha1 = 'participou de ' + (c.evento || 'apresentação da academia') + ',';
    var linha2 = 'realizada em ' + dataBR(c.data) + (c.cargaHoraria ? ', com carga horária de ' + c.cargaHoraria : '') + '.';
    ctx.fillText(linha1, 500, 400);
    ctx.fillText(linha2, 500, 430);

    ctx.fillStyle = '#555';
    ctx.font = '14px Arial, sans-serif';
    ctx.fillText('Código de autenticidade: ' + (c.codigo || '-'), 500, 510);
    ctx.fillText('Emitido em ' + (c.emitidoEm ? dataBR(String(c.emitidoEm).slice(0, 10)) : '-') + ' por ' + (c.emitidoPor || 'Equipe'), 500, 534);

    ctx.strokeStyle = '#555'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(350, 590); ctx.lineTo(650, 590); ctx.stroke();
    ctx.fillText(c.assinatura || 'Professor responsável', 500, 615);

    canvas.toBlob(function (blob) { resolve(blob); }, 'image/png');
  });
}

function compartilharCertificadoWhatsApp(id) {
  var c = DB.buscar('certificados', id);
  if (!c) { mostrarToast('Certificado não encontrado.', 'erro'); return; }

  gerarImagemCertificado(c).then(function (blob) {
    var arquivo = null;
    try { arquivo = new File([blob], 'certificado-' + (c.codigo || 'uc') + '.png', { type: 'image/png' }); } catch (e) {}

    if (arquivo && navigator.canShare && navigator.canShare({ files: [arquivo] })) {
      navigator.share({
        files: [arquivo],
        title: 'Certificado - ' + (c.evento || CONFIG.tituloApp),
        text: 'Certificado de ' + (c.alunoNome || '') + ' — ' + (c.evento || '')
      }).catch(function () {});
    } else {
      var texto = 'Certificado de ' + (c.alunoNome || '') + '\nEvento: ' + (c.evento || '-') + '\nData: ' + dataBR(c.data) + '\nCódigo: ' + (c.codigo || '-');
      window.open('https://wa.me/?text=' + encodeURIComponent(texto), '_blank');
      mostrarToast('Seu navegador não permite anexar a imagem direto — abri o WhatsApp com o resumo. Pra mandar a imagem, toca em "Abrir" e tira um print ou salva o PDF.');
    }
  });
}

function apagarCertificado(id) {
  var c = DB.buscar('certificados', id);
  if (!c) return;
  abrirModal('Apagar certificado',
    '<p class="mini">Apagar o certificado de <strong>' + esc(c.alunoNome || '') + '</strong> (' + esc(c.evento || '') + ')? Essa ação não pode ser desfeita.</p>',
    '<button class="btn btn-danger" onclick="confirmarApagarCertificado(\'' + id + '\')">Apagar definitivamente</button>');
}

function confirmarApagarCertificado(id) {
  DB.excluir('certificados', id).then(function () {
    fecharModal();
    mostrarToast('Certificado apagado.');
    registroLog('professor', 'Certificado apagado (id ' + id + ').');
  });
}

function gerarSenhaProvisoria() {
  return 'capoeira' + Math.floor(1000 + Math.random() * 9000);
}

function cadastrarAlunoPeloProfessor(btn) {
  var nome = ($('profCadNome').value || '').trim();
  var apelido = ($('profCadApelido').value || '').trim();
  var graduacao = $('profCadGraduacaoSelect').value;
  var contato = ($('profCadContato').value || '').trim();
  var tipoAluno = (($('profCadTipoAluno') || {}).value || 'normal');
  if (tipoAluno !== 'gympass') tipoAluno = 'normal';

  if (nome.length < 3) { mostrarToast('Informe o nome completo do aluno.', 'erro'); return; }
  var duplicado = DB.listar('alunos').some(function (a) { return normalizar(a.nome) === normalizar(nome); });
  if (duplicado) { mostrarToast('Já existe um aluno com esse nome.', 'erro'); return; }

  var senhaProvisoria = gerarSenhaProvisoria();
  if (btn) { btn.classList.add('carregando'); btn.innerHTML = '<span class="spinner-btn"></span> Cadastrando...'; }

  DB.salvar('alunos', {
    nome: nome,
    apelido: apelido || nome.split(' ')[0],
    graduacao: graduacao,
    contato: contato,
    tipoAluno: tipoAluno,
    senhaHash: hashSenha(senhaProvisoria),
    criadoEm: agoraISO(),
    ativo: true,
    cadastradoPeloProfessor: true
  }).then(function () {
    if (btn) { btn.classList.remove('carregando'); btn.innerHTML = '<i class="fas fa-user-plus"></i> Cadastrar Aluno'; }
    ['profCadNome', 'profCadApelido', 'profCadContato'].forEach(function (id) { if ($(id)) $(id).value = ''; });
    registroLog('professor', 'Aluno cadastrado pelo professor: ' + nome);
    abrirModal('Aluno cadastrado!',
      '<p class="mini">Nome: <strong>' + esc(nome) + '</strong></p>' +
      '<p class="mini">Senha provisória: <strong style="color:var(--gold); font-size:1rem;">' + esc(senhaProvisoria) + '</strong></p>' +
      '<p class="mini" style="margin-top:8px;">Anota ou avisa o aluno agora — essa senha não fica salva em nenhum outro lugar visível depois.</p>',
      '<button class="btn" onclick="fecharModal()">Entendi</button>');
  }).catch(function () {
    if (btn) { btn.classList.remove('carregando'); btn.innerHTML = '<i class="fas fa-user-plus"></i> Cadastrar Aluno'; }
  });
}

function lancarPresencaManual() {
  var alunoId = $('manualPresencaAluno').value;
  var aluno = DB.buscar('alunos', alunoId);
  if (!aluno) { mostrarToast('Selecione um aluno.', 'erro'); return; }
  var data = $('manualPresencaData').value || dataLocalISO();
  var poloId = $('manualPresencaPolo').value;
  var polo = poloId ? DB.buscar('polos', poloId) : null;
  var obs = ($('manualPresencaObs').value || '').trim() || 'Lançado manualmente pelo professor.';

  DB.salvar('presencas', {
    alunoId: aluno.id,
    alunoNome: aluno.nome,
    data: data,
    hora: new Date().toTimeString().slice(0, 5),
    tipo: 'manual',
    poloId: poloId || '',
    poloNome: polo ? polo.nome : '',
    status: 'aprovado',
    observacaoProfessor: obs,
    aprovadoPor: sessaoEquipe ? sessaoEquipe.nome : 'Professor',
    criadoEm: agoraISO()
  }).then(function () {
    mostrarToast('Presença registrada para ' + aluno.nome + '!');
    registroLog('professor', 'Presença manual lançada para ' + aluno.nome + ' (' + data + ').');
    $('manualPresencaObs').value = '';
  });
}

function professorPresenteHoje() {
  var hoje = dataLocalISO();
  return DB.listar('professorPresenca').filter(function (p) {
    return p.data === hoje && p.status === 'presente';
  }).sort(function (a, b) { return String(b.criadoEm || '').localeCompare(String(a.criadoEm || '')); })[0] || null;
}

function professorCheckinAula() {
  if (!sessaoEquipe) { mostrarToast('Faça login na equipe.', 'erro'); return; }
  if (professorPresenteHoje()) { mostrarToast('Você já está com check-in de hoje.'); return; }
  var poloId = ($('profCheckinPoloAuto') || {}).value || '';
  var polo = poloId ? DB.buscar('polos', poloId) : null;
  var agora = new Date();
  var hora = String(agora.getHours()).padStart(2, '0') + ':' + String(agora.getMinutes()).padStart(2, '0');
  DB.salvar('professorPresenca', {
    professorId: sessaoEquipe.id || '',
    professorNome: sessaoEquipe.nome,
    data: dataLocalISO(),
    hora: hora,
    poloId: polo ? polo.id : '',
    poloNome: polo ? polo.nome : '',
    observacao: ($('profCheckinObsAuto') || {}).value ? $('profCheckinObsAuto').value.trim() : '',
    status: 'presente',
    criadoEm: agoraISO()
  }).then(function () {
    mostrarToast('Check-in do professor registrado! Alunos já podem ver.');
    registroLog('professor', 'Check-in na aula: ' + sessaoEquipe.nome);
    notificar('Professor na aula', sessaoEquipe.nome + ' está no treino' + (polo ? ' — ' + polo.nome : ''));
    renderAbaProfessor();
    renderCheckin();
    renderInicio();
  });
}

function professorCheckoutAula() {
  var p = professorPresenteHoje();
  if (!p) { mostrarToast('Nenhum check-in ativo hoje.'); return; }
  DB.salvar('professorPresenca', {
    status: 'encerrado',
    encerradoEm: agoraISO()
  }, p.id).then(function () {
    mostrarToast('Presença do professor encerrada.');
    registroLog('professor', 'Checkout da aula');
    renderAbaProfessor();
    renderCheckin();
    renderInicio();
  });
}

function htmlBannerProfessorNaAula() {
  var p = professorPresenteHoje();
  if (!p) return '';
  return '<div class="card card-destaque brilho-verde" style="border:1px solid var(--primary-green);">' +
    '<h3 style="color:var(--primary-green); margin-bottom:4px;"><i class="fas fa-chalkboard-teacher"></i> Professor na aula</h3>' +
    '<p style="font-size:0.8rem;"><b>' + esc(p.professorNome) + '</b> já está no treino' +
    (p.hora ? ' desde <b>' + esc(p.hora) + '</b>' : '') +
    (p.poloNome ? '<br><span class="mini"><i class="fas fa-map-marker-alt"></i> ' + esc(p.poloNome) + '</span>' : '') +
    (p.observacao ? '<br><span class="mini">' + esc(p.observacao) + '</span>' : '') +
    '</p></div>';
}

function horasPorAulaConfig() {
  var h = Number(CONFIG.horasPorAula);
  if (!isFinite(h) || h <= 0) h = 1.5;
  return h;
}

function formatarCargaHoraria(horas) {
  var n = Number(horas) || 0;
  if (n <= 0) return '0h';
  var arred = Math.round(n * 10) / 10;
  return (arred % 1 === 0 ? String(Math.round(arred)) : arred.toFixed(1).replace('.', ',')) + 'h';
}

function calcularCargaHorariaAluno(alunoRef) {
  if (!alunoRef) return { aulas: 0, horas: 0, texto: '0h' };
  var alunoId = typeof alunoRef === 'object' ? alunoRef.id : alunoRef;
  var nomeNorm = '';
  if (typeof alunoRef === 'object') {
    nomeNorm = normalizar(alunoRef.nome || '');
  } else {
    var a = DB.buscar('alunos', alunoRef);
    if (a) nomeNorm = normalizar(a.nome || '');
  }
  var horasAula = horasPorAulaConfig();
  var aulas = 0;
  var horas = 0;
  DB.listar('presencas').forEach(function (p) {
    if (p.status !== 'aprovado') return;
    var match = false;
    if (alunoId && p.alunoId && p.alunoId === alunoId) match = true;
    else if (nomeNorm && normalizar(p.alunoNome || '') === nomeNorm) match = true;
    if (!match) return;
    aulas += 1;
    var h = Number(p.horasAula);
    if (!isFinite(h) || h <= 0) h = horasAula;
    horas += h;
  });
  return { aulas: aulas, horas: horas, texto: formatarCargaHoraria(horas) };
}

function decidirPresenca(id, status) {
  var p = DB.buscar('presencas', id);
  if (!p) return;
  var obs = $('obsPresenca_' + id) ? $('obsPresenca_' + id).value.trim() : '';
  var patch = {
    status: status,
    observacaoProfessor: obs,
    avaliadoPor: sessaoEquipe ? sessaoEquipe.nome : 'Professor',
    avaliadoEm: agoraISO()
  };
  if (status === 'aprovado') {
    patch.horasAula = Number(p.horasAula) > 0 ? Number(p.horasAula) : horasPorAulaConfig();
  }
  DB.salvar('presencas', patch, id).then(function () {
    registroLog('professor', 'Check-in de ' + p.alunoNome + ' → ' + status);
    if (status === 'aprovado') {
      var carga = calcularCargaHorariaAluno({ id: p.alunoId, nome: p.alunoNome });
      mostrarToast('Check-in aprovado! Carga de ' + p.alunoNome + ': ' + carga.texto + ' (' + carga.aulas + ' aulas)');
      notificar('Check-in aprovado!', 'Sua presença de ' + dataBR(p.data) + ' foi confirmada. Carga horária acumulada: ' + carga.texto + '.');
    } else {
      mostrarToast('Check-in de ' + p.alunoNome + ' rejeitado.');
      notificar('Check-in não aprovado', 'Seu check-in de ' + dataBR(p.data) + ' foi rejeitado.' + (obs ? ' Motivo: ' + obs : ''));
    }
    renderAbaProfessor();
  });
}

/* Professor registra check-in manual (corrige erro / aluno sem celular) */
function professorRegistrarCheckinManual() {
  var alunoId = ($('profCheckinAluno') || {}).value || '';
  var poloId = ($('profCheckinPolo') || {}).value || '';
  var status = ($('profCheckinStatus') || {}).value || 'aprovado';
  var obs = (($('profCheckinObs') || {}).value || '').trim();
  var aluno = DB.buscar('alunos', alunoId);
  if (!aluno) { mostrarToast('Selecione o aluno.', 'erro'); return; }
  if (!poloId) { mostrarToast('Selecione o polo.', 'erro'); return; }

  var jaExiste = obterCheckinDoDia(aluno);
  if (jaExiste && jaExiste.status !== 'rejeitado') {
    abrirModal('Aluno já tem check-in hoje',
      '<p>Este aluno já possui check-in em <strong>' + dataBR(jaExiste.data) + '</strong> (' + esc(jaExiste.status) + ').</p>' +
      '<p class="mini">Polo: ' + esc(jaExiste.poloNome || '-') + '</p>' +
      '<p style="margin-top:8px;">Deseja <strong>substituir</strong> pelo novo registro?</p>',
      '<button class="btn" onclick="professorForcarCheckinManual()">Substituir check-in</button>');
    window._profCheckinPendente = { aluno: aluno, poloId: poloId, status: status, obs: obs, substituirId: jaExiste.id };
    return;
  }
  salvarCheckinManualProfessor(aluno, poloId, status, obs, null);
}

function professorForcarCheckinManual() {
  fecharModal();
  var d = window._profCheckinPendente;
  if (!d) return;
  salvarCheckinManualProfessor(d.aluno, d.poloId, d.status, d.obs, d.substituirId);
  window._profCheckinPendente = null;
}

function salvarCheckinManualProfessor(aluno, poloId, status, obs, substituirId) {
  var polo = DB.buscar('polos', poloId);
  var aula = aulaDeHoje();
  var dados = {
    alunoId: aluno.id,
    alunoNome: aluno.nome,
    alunoApelido: aluno.apelido || '',
    poloId: poloId,
    poloNome: polo ? polo.nome : '',
    horarioId: aula ? aula.id : '',
    data: dataLocalISO(),
    hora: horaLocalHM(),
    tipo: 'manual',
    status: status,
    atrasoMin: 0,
    justificativa: '',
    observacaoProfessor: obs || 'Registrado manualmente pelo professor',
    avaliadoPor: sessaoEquipe ? sessaoEquipe.nome : 'Professor',
    avaliadoEm: agoraISO(),
    criadoEm: agoraISO()
  };
  if (status === 'aprovado') dados.horasAula = horasPorAulaConfig();

  var promessa;
  if (substituirId) {
    promessa = DB.salvar('presencas', dados, substituirId);
  } else {
    promessa = DB.salvar('presencas', dados);
  }
  promessa.then(function () {
    registroLog('professor', 'Check-in manual: ' + aluno.nome + ' → ' + status);
    if (status === 'aprovado') {
      var carga = calcularCargaHorariaAluno(aluno);
      mostrarToast('Check-in de ' + aluno.nome + ' aprovado. Carga: ' + carga.texto);
      notificar('Check-in confirmado', 'Presença registrada. Carga horária acumulada: ' + carga.texto + '.');
    } else {
      mostrarToast('Check-in de ' + aluno.nome + ' registrado (' + status + ').');
    }
    renderAbaProfessor();
  });
}

function decidirSolicitacao(id, status) {
  var s = DB.buscar('solicitacoes', id);
  if (!s) return;
  var resp = $('respSolic_' + id) ? $('respSolic_' + id).value.trim() : '';
  DB.salvar('solicitacoes', {
    status: status,
    respostaProfessor: resp,
    respostaVistaAluno: false,
    respondidoPor: sessaoEquipe ? sessaoEquipe.nome : 'Professor',
    respondidoEm: agoraISO()
  }, id).then(function () {
    var msg = status === 'aprovado' ? 'aprovado' : (status === 'realizado' ? 'marcado como realizado' : 'recusado');
    registroLog('professor', 'Pedido de treino de ' + s.alunoNome + ' → ' + status);
    mostrarToast('Pedido ' + msg + '.');
    if (status === 'aprovado') {
      notificar('Pedido de treino aprovado', s.alunoNome + ': ' + (s.tipo || ''));
    }
    renderAbaProfessor();
  });
}

function usarGpsParaPolo() {
  if (!navigator.geolocation) { mostrarToast('GPS não suportado neste navegador.', 'erro'); return; }
  mostrarToast('Obtendo localização...');
  navigator.geolocation.getCurrentPosition(function (pos) {
    var link = 'https://www.google.com/maps?q=' + pos.coords.latitude + ',' + pos.coords.longitude;
    if ($('poloGmaps')) $('poloGmaps').value = link;
    mostrarToast('Localização capturada!');
  }, function (err) {
    mostrarToast('Erro de GPS: ' + err.message, 'erro');
  });
}

function salvarPolo() {
  var nome = ($('poloNome').value || '').trim();
  if (nome.length < 3) { mostrarToast('Informe o nome do polo.', 'erro'); return; }
  DB.salvar('polos', {
    nome: nome,
    endereco: ($('poloEndereco').value || '').trim(),
    gmaps: ($('poloGmaps').value || '').trim(),
    criadoEm: agoraISO()
  }).then(function () {
    mostrarToast('Polo cadastrado.');
    renderAbaProfessor();
  });
}

function excluirPolo(id) {
  abrirModal('Excluir polo', '<p>Tem certeza que deseja excluir este polo?</p>',
    '<button class="btn btn-danger" onclick="confirmarExcluirPolo(\'' + id + '\')">Excluir</button>');
}

function confirmarExcluirPolo(id) {
  fecharModal();
  DB.excluir('polos', id).then(function () { mostrarToast('Polo excluído.'); renderAbaProfessor(); });
}

function salvarHorario() {
  var dia = parseInt($('horarioDia').value, 10);
  var inicio = $('horarioInicio').value;
  var fim = $('horarioFim').value;
  var poloId = $('horarioPolo').value;
  if (!inicio || !fim) { mostrarToast('Informe horário de início e fim.', 'erro'); return; }
  if ((minutosDoHM(fim) || 0) <= (minutosDoHM(inicio) || 0)) { mostrarToast('O fim deve ser depois do início.', 'erro'); return; }
  DB.salvar('horarios', {
    diaSemana: dia, horaInicio: inicio, horaFim: fim,
    modalidade: ($('horarioModalidade').value || 'Treino').trim(),
    poloId: poloId, criadoEm: agoraISO()
  }).then(function () {
    mostrarToast('Horário adicionado.');
    renderAbaProfessor();
  });
}

function excluirHorario(id) {
  DB.excluir('horarios', id).then(function () { mostrarToast('Horário removido.'); renderAbaProfessor(); });
}

function publicarAviso() {
  var titulo = ($('avisoTitulo').value || '').trim();
  var texto = ($('avisoTexto').value || '').trim();
  var poloId = $('avisoPolo').value;
  var polo = poloId ? DB.buscar('polos', poloId) : null;
  if (!texto) { mostrarToast('Escreva a mensagem do aviso.', 'erro'); return; }
  DB.salvar('avisos', {
    titulo: titulo || 'Aviso do professor',
    texto: texto,
    poloId: poloId,
    poloNome: polo ? polo.nome : '',
    gmaps: polo ? (polo.gmaps || '') : '',
    autor: sessaoEquipe ? sessaoEquipe.nome : 'Professor',
    criadoEm: agoraISO()
  }).then(function () {
    $('avisoTitulo').value = '';
    $('avisoTexto').value = '';
    mostrarToast('Aviso publicado!');
    registroLog('professor', 'Aviso publicado: ' + titulo);
    notificar('Aviso do professor', titulo + ' — ' + texto);
  });
}

function notificarLocalAlunos() {
  var texto = ($('avisoTexto').value || '').trim() || 'Confira o local do treino no app.';
  notificar('Local do treino', texto);
  mostrarToast('Notificação enviada para este dispositivo.');
}

function semanaISOAtual() {
  var d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  var week1 = new Date(d.getFullYear(), 0, 4);
  var weekNo = 1 + Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return d.getFullYear() + '-W' + String(weekNo).padStart(2, '0');
}

function avaliacoesDoAluno(alunoId) {
  var aluno = DB.buscar('alunos', alunoId);
  if (!aluno) return [];
  return DB.listar('avaliacoes').filter(function (a) {
    return a.alunoId === aluno.id || normalizar(a.alunoNome) === normalizar(aluno.nome);
  }).sort(function (a, b) { return String(a.data || a.semana || '').localeCompare(String(b.data || b.semana || '')); });
}

function carregarDesenvolvimentoAluno() {
  var box = $('boxDesenvolvimentoAluno');
  var alunoId = ($('avalAluno') || {}).value;
  if (!box || !alunoId) return;
  var aluno = DB.buscar('alunos', alunoId);
  if (!aluno) { box.innerHTML = ''; return; }

  var lista = avaliacoesDoAluno(alunoId);
  var semana = ($('avalSemana') || {}).value || semanaISOAtual();
  var daSemana = lista.filter(function (a) { return a.semana === semana; })[0];
  var ultima = lista.length ? lista[lista.length - 1] : null;

  /* pré-preenche se já existe avaliação da semana */
  if (daSemana) {
    if ($('avalTecnica')) $('avalTecnica').value = daSemana.tecnica != null ? daSemana.tecnica : 8;
    if ($('avalDisciplina')) $('avalDisciplina').value = daSemana.disciplina != null ? daSemana.disciplina : 8;
    if ($('avalRitmo')) $('avalRitmo').value = daSemana.ritmo != null ? daSemana.ritmo : 8;
    if ($('avalMusicalidade')) $('avalMusicalidade').value = daSemana.musicalidade != null ? daSemana.musicalidade : 8;
    if ($('avalCompromisso')) $('avalCompromisso').value = daSemana.compromisso != null ? daSemana.compromisso : 8;
    if ($('avalDesenvolvimento')) $('avalDesenvolvimento').value = daSemana.desenvolvimento || '';
    if ($('avalObservacao')) $('avalObservacao').value = daSemana.observacao || '';
  } else if (ultima) {
    if ($('avalTecnica')) $('avalTecnica').value = ultima.tecnica != null ? ultima.tecnica : 8;
    if ($('avalDisciplina')) $('avalDisciplina').value = ultima.disciplina != null ? ultima.disciplina : 8;
    if ($('avalRitmo')) $('avalRitmo').value = ultima.ritmo != null ? ultima.ritmo : 8;
    if ($('avalMusicalidade')) $('avalMusicalidade').value = ultima.musicalidade != null ? ultima.musicalidade : 8;
    if ($('avalCompromisso')) $('avalCompromisso').value = ultima.compromisso != null ? ultima.compromisso : 8;
    if ($('avalDesenvolvimento')) $('avalDesenvolvimento').value = '';
    if ($('avalObservacao')) $('avalObservacao').value = '';
  }

  var html = '';
  var an = analisarDesempenhoAtletico(aluno);
  if (an) {
    html += '<div class="aviso-info"><i class="fas fa-chart-line"></i> Índice atual: <b>' + an.score + '/100</b> — ' + esc(an.nivel) +
      (an.mediaGeral !== null ? ' • média ' + an.mediaGeral.toFixed(1) : '') +
      ' • ' + an.aprovadas + ' aulas confirmadas</div>';
  }

  if (lista.length) {
    html += '<p class="mini" style="margin:6px 0 4px;"><i class="fas fa-history"></i> Histórico de desenvolvimento (' + lista.length + ' avaliações)</p>';
    lista.slice(-5).reverse().forEach(function (av) {
      var media = mediaAvaliacao(av).toFixed(1);
      html += '<div class="lista-item">' +
        '<div class="linha"><b>' + esc(av.semana || dataBR(av.data)) + '</b><span class="badge-count">' + media + '</span></div>' +
        '<span class="mini">Téc ' + esc(av.tecnica || '-') + ' • Disc ' + esc(av.disciplina || '-') +
        ' • Rit ' + esc(av.ritmo || '-') + ' • Mus ' + esc(av.musicalidade || '-') +
        ' • Comp ' + esc(av.compromisso || '-') + '</span>' +
        (av.desenvolvimento ? '<div class="mini" style="margin-top:3px; color:var(--accent-blue);"><i class="fas fa-seedling"></i> ' + esc(av.desenvolvimento) + '</div>' : '') +
        (av.observacao ? '<div class="mini" style="color:var(--gold);">' + esc(av.observacao) + '</div>' : '') +
        '</div>';
    });
    if (ultima && !daSemana) {
      html += '<p class="mini" style="margin-top:4px;">Notas da última avaliação carregadas como base — ajuste para esta semana.</p>';
    }
    if (daSemana) {
      html += '<p class="mini" style="color:var(--gold); margin-top:4px;"><i class="fas fa-pen"></i> Já existe avaliação desta semana — ao salvar, ela será atualizada.</p>';
    }
  } else {
    html += '<p class="sem-dados">Primeira avaliação semanal deste aluno.</p>';
  }

  /* comparação item a item com a última (se diferente da semana atual) */
  if (ultima && lista.length >= 1) {
    var ref = daSemana && lista.length >= 2 ? lista[lista.length - 2] : (daSemana ? null : ultima);
    if (ref && ref !== daSemana) {
      html += '<p class="mini" style="margin-top:6px;">Referência anterior (' + esc(ref.semana || dataBR(ref.data)) + '): média ' + mediaAvaliacao(ref).toFixed(1) + '</p>';
    }
  }

  box.innerHTML = html;
}

function salvarAvaliacao() {
  var alunoId = $('avalAluno').value;
  var aluno = DB.buscar('alunos', alunoId);
  if (!aluno) { mostrarToast('Selecione um aluno.', 'erro'); return; }
  var semana = ($('avalSemana') || {}).value || semanaISOAtual();
  var tecnica = parseFloat($('avalTecnica').value);
  var disciplina = parseFloat($('avalDisciplina').value);
  var ritmo = parseFloat($('avalRitmo').value);
  var musicalidade = parseFloat($('avalMusicalidade').value);
  var compromisso = parseFloat($('avalCompromisso').value);
  var campos = [tecnica, disciplina, ritmo, musicalidade, compromisso];
  for (var i = 0; i < campos.length; i++) {
    if (isNaN(campos[i]) || campos[i] < 0 || campos[i] > 10) {
      mostrarToast('Preencha todas as notas entre 0 e 10.', 'erro');
      return;
    }
  }

  var existente = DB.listar('avaliacoes').filter(function (a) {
    return a.alunoId === aluno.id && a.semana === semana;
  })[0];

  var dados = {
    alunoId: aluno.id,
    alunoNome: aluno.nome,
    alunoApelido: aluno.apelido || '',
    graduacao: aluno.graduacao || '',
    tipo: 'semanal',
    semana: semana,
    tecnica: tecnica,
    disciplina: disciplina,
    ritmo: ritmo,
    musicalidade: musicalidade,
    compromisso: compromisso,
    desenvolvimento: ($('avalDesenvolvimento') || {}).value ? $('avalDesenvolvimento').value.trim() : '',
    observacao: ($('avalObservacao').value || '').trim(),
    data: dataLocalISO(),
    professor: sessaoEquipe ? sessaoEquipe.nome : 'Professor',
    criadoEm: existente ? (existente.criadoEm || agoraISO()) : agoraISO(),
    atualizadoEm: agoraISO()
  };

  var promessa = existente
    ? DB.salvar('avaliacoes', dados, existente.id)
    : DB.salvar('avaliacoes', dados);

  promessa.then(function () {
    mostrarToast('Avaliação semanal de ' + aluno.nome + ' salva!');
    registroLog('professor', 'Avaliação semanal (' + semana + '): ' + aluno.nome);
    carregarDesenvolvimentoAluno();
  });
}

function atualizarCargaCertificado() {
  var sel = $('certAluno');
  var info = $('certCargaInfo');
  var campo = $('certCarga');
  if (!sel) return;
  var aluno = DB.buscar('alunos', sel.value);
  if (!aluno) {
    if (info) info.innerHTML = 'Selecione um aluno para ver a carga horária acumulada pelas aulas.';
    if (campo) campo.value = '';
    return;
  }
  var carga = calcularCargaHorariaAluno(aluno);
  if (info) {
    info.innerHTML = '<i class="fas fa-clock"></i> <b>' + esc(aluno.nome) + '</b>: ' +
      carga.aulas + ' aula(s) aprovada(s) = <b>' + carga.texto + '</b> ' +
      '<span class="mini">( ' + formatarCargaHoraria(horasPorAulaConfig()) + ' por aula )</span>';
  }
  if (campo && !((campo.value || '').trim())) {
    campo.value = carga.texto;
  } else if (campo && carga.aulas > 0) {
    campo.value = carga.texto;
  }
}

function emitirCertificado() {
  var aluno = DB.buscar('alunos', $('certAluno').value);
  if (!aluno) { mostrarToast('Selecione um aluno.', 'erro'); return; }
  atualizarCargaCertificado();
  var carga = calcularCargaHorariaAluno(aluno);
  if (carga.aulas < 1) {
    abrirModal('Atenção', '<div class="alerta-dificuldade">Este aluno ainda não possui check-in aprovado. Sem aulas, a carga horária fica zerada. Deseja emitir mesmo assim?</div>',
      '<button class="btn btn-gold" onclick="confirmarEmissaoCertificado()">Emitir mesmo assim</button>');
    return;
  }
  confirmarEmissaoCertificado();
}

function confirmarEmissaoCertificado() {
  fecharModal();
  var aluno = DB.buscar('alunos', $('certAluno').value);
  if (!aluno) return;
  var evento = ($('certEvento').value || '').trim() || 'Participação nas aulas de Capoeira';
  var data = $('certData').value || dataLocalISO();
  var carga = calcularCargaHorariaAluno(aluno);
  var cargaTxt = (($('certCarga') || {}).value || '').trim() || carga.texto;
  var codigo = 'UC-' + data.replace(/-/g, '') + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
  DB.salvar('certificados', {
    alunoId: aluno.id,
    alunoNome: aluno.nome,
    alunoApelido: aluno.apelido || '',
    evento: evento,
    data: data,
    cargaHoraria: cargaTxt,
    aulasComputadas: carga.aulas,
    assinatura: ($('certAssinatura').value || '').trim(),
    codigo: codigo,
    emitidoPor: sessaoEquipe ? sessaoEquipe.nome : 'Equipe',
    emitidoEm: agoraISO()
  }).then(function (novoId) {
    if ($('certEvento')) $('certEvento').value = '';
    mostrarToast('Certificado emitido! ' + cargaTxt + ' • Código ' + codigo);
    registroLog('professor', 'Certificado emitido para ' + aluno.nome + ' (' + codigo + ', ' + cargaTxt + ')');
    baixarCertificado(novoId);
    renderAbaProfessor();
  });
}

/* ---------------------------------------------------------------
   13. ABA ADM
   --------------------------------------------------------------- */
function renderAbaAdm() {
  var box = $('conteudoAdm');
  if (!exigirEquipe(['adm', 'dev'], box, 'adm')) return;

  var alunos = DB.listar('alunos').slice().sort(function (a, b) { return normalizar(a.nome).localeCompare(normalizar(b.nome)); });
  var presencas = DB.listar('presencas');
  var html = '';

  html += '<div class="card" style="border:1px solid var(--accent-blue);">' +
    '<h3><i class="fas fa-user-shield"></i> Sessão: ' + esc(sessaoEquipe.nome) + ' <span class="pill pill-info">' + esc(sessaoEquipe.papel) + '</span></h3>' +
    '<button class="btn btn-back" style="margin:0;" onclick="sairEquipe()"><i class="fas fa-sign-out-alt"></i> Sair da equipe</button></div>';

  /* --- resumo --- */
  var aprovadas = presencas.filter(function (p) { return p.status === 'aprovado'; }).length;
  var pendentes = presencas.filter(function (p) { return p.status === 'pendente'; }).length;
  html += '<div class="card"><h3><i class="fas fa-chart-simple"></i> Resumo Geral</h3>' +
    '<div class="grade-3">' +
    '<div class="lista-item" style="text-align:center;"><div class="badge-count">' + alunos.length + '</div><div class="mini">alunos</div></div>' +
    '<div class="lista-item" style="text-align:center;"><div class="badge-count">' + aprovadas + '</div><div class="mini">presenças ok</div></div>' +
    '<div class="lista-item" style="text-align:center;"><div class="badge-count">' + pendentes + '</div><div class="mini">pendentes</div></div>' +
    '</div>' +
    '<div class="grade-3" style="margin-top:6px;">' +
    '<div class="lista-item" style="text-align:center;"><div class="badge-count">' + DB.listar('avaliacoes').length + '</div><div class="mini">avaliações</div></div>' +
    '<div class="lista-item" style="text-align:center;"><div class="badge-count">' + DB.listar('certificados').length + '</div><div class="mini">certificados</div></div>' +
    '<div class="lista-item" style="text-align:center;"><div class="badge-count">' + DB.listar('polos').length + '</div><div class="mini">polos</div></div>' +
    '</div></div>';

  /* --- alunos --- */
  html += '<div class="card"><h3><i class="fas fa-users"></i> Alunos Cadastrados</h3>' +
    '<label class="campo-label">Filtrar por nome</label><input id="admBuscaAluno" placeholder="Digite para filtrar..." oninput="filtrarAlunosAdm()">' +
    '<div id="listaAlunosAdm">' + htmlListaAlunosAdm(alunos) + '</div></div>';

  /* --- aparência e parâmetros --- */
  html += '<div class="card"><h3><i class="fas fa-paint-brush"></i> Aparência, Logotipos e Parâmetros</h3>' +
    '<label class="campo-label">Título do app</label><input id="cfgTitulo" value="' + esc(CONFIG.tituloApp) + '">' +
    '<label class="campo-label">Instagram (com @)</label><input id="cfgInstagram" value="' + esc(CONFIG.instagram) + '">' +
    '<label class="campo-label">URL do Assistente IA (Cloudflare Worker)</label><input id="cfgIaProxyUrl" value="' + esc(CONFIG.iaProxyUrl || '') + '" placeholder="https://seu-worker.workers.dev">' +
    '<label class="campo-label">Base de conhecimento para a IA (história, currículo, termos da sua academia)</label><textarea id="cfgBaseConhecimento" rows="4" placeholder="Cole aqui o que a IA deve saber.">' + esc(CONFIG.baseConhecimento || '') + '</textarea>' +
    htmlConhecimentoPorAvatar() +
    '<h3 style="margin-top:12px; font-size:0.82rem;"><i class="fas fa-image"></i> Logotipos da academia</h3>' +
    '<p class="mini" style="margin-bottom:8px;">Envie do armazenamento do aparelho (galeria/arquivos). Os logos aparecem no cabeçalho e nos certificados.</p>' +
    '<div class="grade-2">' +
      '<div style="text-align:center;">' +
        '<label class="campo-label">Logo principal</label>' +
        (CONFIG.logo1 && urlSegura(CONFIG.logo1)
          ? '<img id="previewLogo1" src="' + urlSegura(CONFIG.logo1) + '" alt="Logo 1" style="max-height:72px; max-width:100%; border-radius:8px; border:1px solid var(--card-border); margin:4px auto; display:block; background:#fff; padding:4px;">'
          : '<div id="previewLogo1" class="sem-dados" style="padding:16px 0;">Sem logo</div>') +
        '<input type="file" id="cfgLogo1File" accept="image/*" onchange="uploadLogoApp(this, 1)" style="font-size:0.7rem;">' +
        '<input type="hidden" id="cfgLogo1" value="' + esc(CONFIG.logo1 || '') + '">' +
        '<button type="button" class="btn btn-danger btn-mini" style="margin-top:4px;" onclick="removerLogoApp(1)"><i class="fas fa-trash"></i> Remover</button>' +
      '</div>' +
      '<div style="text-align:center;">' +
        '<label class="campo-label">Logo secundário (opcional)</label>' +
        (CONFIG.logo2 && urlSegura(CONFIG.logo2)
          ? '<img id="previewLogo2" src="' + urlSegura(CONFIG.logo2) + '" alt="Logo 2" style="max-height:72px; max-width:100%; border-radius:8px; border:1px solid var(--card-border); margin:4px auto; display:block; background:#fff; padding:4px;">'
          : '<div id="previewLogo2" class="sem-dados" style="padding:16px 0;">Sem logo</div>') +
        '<input type="file" id="cfgLogo2File" accept="image/*" onchange="uploadLogoApp(this, 2)" style="font-size:0.7rem;">' +
        '<input type="hidden" id="cfgLogo2" value="' + esc(CONFIG.logo2 || '') + '">' +
        '<button type="button" class="btn btn-danger btn-mini" style="margin-top:4px;" onclick="removerLogoApp(2)"><i class="fas fa-trash"></i> Remover</button>' +
      '</div>' +
    '</div>' +
    '<label class="campo-label">Tempo padrão do cronômetro (segundos)</label><input id="cfgTimer" type="number" min="10" max="3600" value="' + esc(CONFIG.tempoTimerSegundos) + '">' +
    '<label class="campo-label">Tolerância de atraso (minutos)</label><input id="cfgTolerancia" type="number" min="0" max="120" value="' + esc(CONFIG.toleranciaAtrasoMin) + '">' +
    '<label class="campo-label">Janela de check-in (minutos antes/depois da aula)</label><input id="cfgJanelaCheckin" type="number" min="0" max="60" value="' + esc(CONFIG.janelaCheckinMin) + '">' +
    '<label class="campo-label">Carga horária por aula (horas) — para certificado</label><input id="cfgHorasPorAula" type="number" min="0.5" max="8" step="0.5" value="' + esc(horasPorAulaConfig()) + '">' +
    '<p class="mini">Cada check-in aprovado soma esse valor na carga do aluno.</p>' +
    '<label class="campo-label">Graduações (uma por linha)</label><textarea id="cfgGraduacoes" style="min-height:120px;">' + esc(CONFIG.graduacoes.join('\n')) + '</textarea>' +
    '<button class="btn" onclick="salvarConfiguracaoAdm()"><i class="fas fa-save"></i> Salvar Configurações</button></div>';

  /* --- mural --- */
  html += '<div class="card"><h3><i class="fas fa-comments"></i> Mural</h3>' +
    '<p class="mini">' + DB.listar('mural').length + ' mensagens publicadas.</p>' +
    '<button class="btn btn-danger" onclick="limparMural()"><i class="fas fa-trash"></i> Limpar mural</button></div>';

  /* --- testes de jogos arcade --- */
  var rank = rankingPontosJogos().slice(0, 10);
  html += '<div class="card" style="border:1px solid var(--accent-blue);">' +
    '<h3 style="color:var(--accent-blue);"><i class="fas fa-gamepad"></i> Testar Jogos Arcade</h3>' +
    '<p class="mini" style="margin-bottom:8px;">Abra qualquer jogo em modo teste. Os pontos ainda entram no ranking se houver nome preenchido na aba Início.</p>' +
    '<div class="grade-2">' +
      '<button class="btn btn-secondary" onclick="testarJogoAdm(\'snake\')"><i class="fas fa-dragon"></i> Minhoca</button>' +
      '<button class="btn btn-gold" onclick="testarJogoAdm(\'tamagotchi\')"><i class="fas fa-robot"></i> Mascote</button>' +
      '<button class="btn btn-secondary" onclick="testarJogoAdm(\'damas\')"><i class="fas fa-chess"></i> Damas</button>' +
      '<button class="btn" onclick="testarJogoAdm(\'corrida\')"><i class="fas fa-car"></i> Corrida</button>' +
      '<button class="btn btn-secondary" onclick="testarJogoAdm(\'quebra\')"><i class="fas fa-cubes"></i> Quebra-Blocos</button>' +
      '<button class="btn btn-secondary" onclick="testarJogoAdm(\'pulo\')"><i class="fas fa-dove"></i> Pulo</button>' +
      '<button class="btn btn-gold" onclick="testarJogoAdm(\'surfe\')"><i class="fas fa-running"></i> Surfe</button>' +
      '<button class="btn" onclick="testarJogoAdm(\'mario\')"><i class="fas fa-mountain"></i> Aventura</button>' +
    '</div>' +
    '<h3 style="margin-top:12px; font-size:0.82rem;"><i class="fas fa-trophy"></i> Ranking atual (top 10)</h3>' +
    (rank.length
      ? rank.map(function (item, idx) {
          var med = ['🥇', '🥈', '🥉'][idx] || ((idx + 1) + 'º');
          return '<div class="lista-item"><div class="linha"><span>' + med + ' <b>' + esc(item.nome) + '</b></span><span class="badge-count">' + item.pontos + ' pts</span></div></div>';
        }).join('')
      : '<p class="sem-dados">Nenhuma pontuação ainda.</p>') +
    '<button class="btn btn-danger btn-mini" style="margin-top:8px;" onclick="confirmarLimparPontosJogos()"><i class="fas fa-trash"></i> Zerar ranking de jogos</button>' +
  '</div>';

  /* --- backup --- */
  html += '<div class="card"><h3><i class="fas fa-database"></i> Backup e Restauração</h3>' +
    '<button class="btn btn-secondary" onclick="exportarBackup()"><i class="fas fa-download"></i> Exportar backup (JSON)</button>' +
    '<label class="campo-label">Importar backup</label><input type="file" accept="application/json" onchange="importarBackup(this)">' +
    '<button class="btn btn-danger" onclick="confirmarLimparTudo()"><i class="fas fa-triangle-exclamation"></i> Apagar TODOS os dados</button>' +
    '<p class="mini" style="margin-top:6px;">O backup contém alunos, presenças, avaliações, certificados, avisos, polos e horários. Senhas são exportadas como hash.</p></div>';

  box.innerHTML = html;
  tornarCardsColapsaveis(box);
}

function testarJogoAdm(tipo) {
  var campo = $('nomeJogadorCorrida');
  if (campo && !(campo.value || '').trim()) campo.value = 'ADM Teste';
  abrirJogoArcade(tipo);
}

function confirmarLimparPontosJogos() {
  abrirModal('Zerar ranking de jogos',
    '<div class="alerta-dificuldade">Apagar todas as pontuações de mini-jogos?</div>',
    '<button class="btn btn-danger" onclick="limparPontosJogosAgora()">Apagar ranking</button>');
}

function limparPontosJogosAgora() {
  fecharModal();
  DB.limparColecao('pontosJogos').then(function () {
    mostrarToast('Ranking de jogos zerado.');
    registroLog('adm', 'Ranking de jogos zerado');
    renderAbaAdm();
    renderRankingJogos();
  });
}

function htmlListaAlunosAdm(alunos) {
  if (!alunos.length) return '<p class="sem-dados">Nenhum aluno cadastrado.</p>';
  var html = '';
  alunos.forEach(function (a) {
    html += '<div class="lista-item" data-nome="' + esc(normalizar(a.nome + ' ' + (a.apelido || ''))) + '">' +
      '<div class="linha"><b>' + esc(a.nome) + '</b><span class="mini">' + esc(a.apelido || '') + '</span></div>' +
      '<span class="mini">' + esc(a.graduacao || '-') + (a.contato ? ' • ' + esc(a.contato) : '') +
      (a.tipoAluno === 'gympass' ? ' • <span class="pill" style="background:var(--gympass-red);color:#fff;">Gympass</span>' : '') + '</span>' +
      '<div class="flex-btn" style="margin-top:6px;">' +
        '<button class="btn btn-secondary btn-mini" onclick="alterarGraduacao(\'' + a.id + '\')"><i class="fas fa-medal"></i> Graduação</button>' +
        '<button class="btn btn-secondary btn-mini" onclick="resetarSenhaAluno(\'' + a.id + '\')"><i class="fas fa-key"></i> Reset senha</button>' +
        '<button class="btn btn-danger btn-mini" onclick="confirmarExcluirAluno(\'' + a.id + '\')"><i class="fas fa-trash"></i> Excluir</button>' +
      '</div></div>';
  });
  return html;
}

function filtrarAlunosAdm() {
  var termo = normalizar($('admBuscaAluno').value);
  var itens = document.querySelectorAll('#listaAlunosAdm .lista-item');
  itens.forEach(function (el) {
    var nome = el.getAttribute('data-nome') || '';
    el.style.display = (!termo || nome.indexOf(termo) >= 0) ? 'block' : 'none';
  });
}

function alterarGraduacao(id) {
  var a = DB.buscar('alunos', id);
  if (!a) return;
  var opcoes = CONFIG.graduacoes.map(function (g) {
    return '<option value="' + esc(g) + '"' + (g === a.graduacao ? ' selected' : '') + '>' + esc(g) + '</option>';
  }).join('');
  abrirModal('Graduação de ' + a.nome,
    '<label class="campo-label">Nova corda / graduação</label><select id="admNovaGraduacao">' + opcoes + '</select>',
    '<button class="btn" onclick="confirmarNovaGraduacao(\'' + id + '\')">Salvar</button>');
}

function confirmarNovaGraduacao(id) {
  var nova = $('admNovaGraduacao').value;
  DB.salvar('alunos', { graduacao: nova }, id).then(function () {
    fecharModal();
    mostrarToast('Graduação atualizada.');
    registroLog('adm', 'Graduação alterada para ' + nova);
    renderAbaAdm();
  });
}

function resetarSenhaAluno(id) {
  var a = DB.buscar('alunos', id);
  if (!a) return;
  var nova = 'capoeira' + Math.floor(1000 + Math.random() * 9000);
  DB.salvar('alunos', { senhaHash: hashSenha(nova) }, id).then(function () {
    abrirModal('Senha redefinida', '<p>Senha provisória de <strong>' + esc(a.nome) + '</strong>:</p>' +
      '<p style="font-size:1.1rem; font-weight:bold; color:var(--primary-green); text-align:center;">' + esc(nova) + '</p>' +
      '<p class="mini">Oriente o aluno a trocar a senha no primeiro acesso.</p>');
    registroLog('adm', 'Senha redefinida para ' + a.nome);
  });
}

function confirmarExcluirAluno(id) {
  var a = DB.buscar('alunos', id);
  if (!a) return;
  abrirModal('Excluir aluno', '<div class="alerta-dificuldade">Excluir <strong>' + esc(a.nome) + '</strong>? Os check-ins já registrados serão mantidos no histórico.</div>',
    '<button class="btn btn-danger" onclick="excluirAlunoDefinitivo(\'' + id + '\')">Excluir definitivamente</button>');
}

function excluirAlunoDefinitivo(id) {
  fecharModal();
  DB.excluir('alunos', id).then(function () {
    mostrarToast('Aluno excluído.');
    registroLog('adm', 'Aluno excluído: ' + id);
    renderAbaAdm();
  });
}

function uploadLogoApp(input, num) {
  var arquivo = input.files && input.files[0];
  if (!arquivo) return;
  if (!/^image\//i.test(arquivo.type)) {
    mostrarToast('Selecione um arquivo de imagem.', 'erro');
    return;
  }
  mostrarToast('Processando logo...');
  comprimirImagem(arquivo, 400, 0.85).then(function (dataUrl) {
    var hidden = $('cfgLogo' + num);
    if (hidden) hidden.value = dataUrl;
    var prev = $('previewLogo' + num);
    if (prev) {
      if (prev.tagName === 'IMG') {
        prev.src = dataUrl;
      } else {
        var img = document.createElement('img');
        img.id = 'previewLogo' + num;
        img.src = dataUrl;
        img.alt = 'Logo ' + num;
        img.style.cssText = 'max-height:72px; max-width:100%; border-radius:8px; border:1px solid var(--card-border); margin:4px auto; display:block; background:#fff; padding:4px;';
        prev.parentNode.replaceChild(img, prev);
      }
    }
    var urlCampo = $('cfgLogo' + num + 'Url');
    if (urlCampo) urlCampo.value = '';
    input.value = '';
    mostrarToast('Logo ' + num + ' carregado. Clique em Salvar Configurações.');
  }).catch(function () {
    mostrarToast('Não foi possível processar a imagem.', 'erro');
  });
}

function removerLogoApp(num) {
  var hidden = $('cfgLogo' + num);
  if (hidden) hidden.value = '';
  var urlCampo = $('cfgLogo' + num + 'Url');
  if (urlCampo) urlCampo.value = '';
  var prev = $('previewLogo' + num);
  if (prev) {
    if (prev.tagName === 'IMG') {
      var div = document.createElement('div');
      div.id = 'previewLogo' + num;
      div.className = 'sem-dados';
      div.style.padding = '16px 0';
      div.textContent = 'Sem logo';
      prev.parentNode.replaceChild(div, prev);
    } else {
      prev.textContent = 'Sem logo';
    }
  }
  mostrarToast('Logo ' + num + ' removido. Clique em Salvar Configurações.');
}

function salvarConfiguracaoAdm() {
  var graduacoes = $('cfgGraduacoes').value.split('\n').map(function (l) { return l.trim(); }).filter(function (l) { return l; });
  if (!graduacoes.length) { mostrarToast('Informe ao menos uma graduação.', 'erro'); return; }

  var logo1 = ($('cfgLogo1') && $('cfgLogo1').value || '').trim();
  var logo2 = ($('cfgLogo2') && $('cfgLogo2').value || '').trim();
  if (logo1 && !urlSegura(logo1)) { mostrarToast('Logo 1 inválido (envie um arquivo de imagem).', 'erro'); return; }
  if (logo2 && !urlSegura(logo2)) { mostrarToast('Logo 2 inválido (envie um arquivo de imagem).', 'erro'); return; }

  salvarConfigApp({
    tituloApp: ($('cfgTitulo').value || 'Universo Capoeira').trim(),
    instagram: ($('cfgInstagram').value || '').trim(),
    iaProxyUrl: ($('cfgIaProxyUrl').value || '').trim(),
    baseConhecimento: ($('cfgBaseConhecimento').value || '').trim(),
    logo1: logo1,
    logo2: logo2,
    tempoTimerSegundos: Math.max(10, parseInt($('cfgTimer').value, 10) || 90),
    toleranciaAtrasoMin: Math.max(0, parseInt($('cfgTolerancia').value, 10) || 15),
    janelaCheckinMin: Math.max(0, parseInt($('cfgJanelaCheckin').value, 10) || 10),
    horasPorAula: Math.max(0.5, Math.min(8, parseFloat(($('cfgHorasPorAula') || {}).value) || 1.5)),
    graduacoes: graduacoes
  }).then(function () {
    mostrarToast('Configurações salvas. Logos atualizados no cabeçalho e certificados.');
    registroLog('adm', 'Configurações do app atualizadas (logos inclusos).');
    resetarTimer();
    aplicarConfig();
    renderAbaAdm();
  });
}

function limparMural() {
  abrirModal('Limpar mural', '<div class="alerta-dificuldade">Apagar todas as mensagens do mural?</div>',
    '<button class="btn btn-danger" onclick="confirmarLimparMural()">Apagar tudo</button>');
}

function confirmarLimparMural() {
  fecharModal();
  DB.limparColecao('mural').then(function () { mostrarToast('Mural limpo.'); renderAbaAdm(); });
}

function exportarBackup() {
  var pacote = { app: CONFIG.tituloApp, exportadoEm: agoraISO(), dados: {} };
  COLECOES.forEach(function (col) { pacote.dados[col] = DB.listar(col); });
  baixarArquivo('backup-universo-capoeira-' + dataLocalISO() + '.json', JSON.stringify(pacote, null, 2), 'application/json');
  mostrarToast('Backup gerado.');
}

function importarBackup(input) {
  var arquivo = input.files && input.files[0];
  if (!arquivo) return;
  var leitor = new FileReader();
  leitor.onload = function () {
    var pacote;
    try { pacote = JSON.parse(leitor.result); } catch (e) { mostrarToast('Arquivo JSON inválido.', 'erro'); return; }
    if (!pacote || !pacote.dados) { mostrarToast('Backup sem dados reconhecíveis.', 'erro'); return; }
    abrirModal('Importar backup', '<div class="aviso-info">Foram encontrados dados de ' + Object.keys(pacote.dados).length + ' coleções (exportado em ' + esc(pacote.exportadoEm || '-') + '). Os registros serão adicionados aos existentes.</div>',
      '<button class="btn" onclick="confirmarImportacao()">Importar agora</button>');
    window._backupPendente = pacote;
  };
  leitor.readAsText(arquivo);
  input.value = '';
}

function confirmarImportacao() {
  fecharModal();
  var pacote = window._backupPendente;
  if (!pacote) return;
  var tarefas = [];
  Object.keys(pacote.dados).forEach(function (col) {
    if (COLECOES.indexOf(col) < 0) return;
    (pacote.dados[col] || []).forEach(function (item) {
      var copia = Object.assign({}, item);
      delete copia.id;
      tarefas.push(DB.salvar(col, copia));
    });
  });
  Promise.all(tarefas).then(function () {
    window._backupPendente = null;
    mostrarToast('Backup importado (' + tarefas.length + ' registros).');
    registroLog('adm', 'Backup importado com ' + tarefas.length + ' registros.');
    renderAbaAdm();
  });
}

function confirmarLimparTudo() {
  abrirModal('Apagar todos os dados',
    '<div class="alerta-dificuldade">Esta ação apaga alunos, presenças, avaliações, certificados, avisos, mural, polos, horários e logs. Não há como desfazer. Recomendamos exportar um backup antes.</div>',
    '<button class="btn btn-danger" onclick="limparTudoDefinitivo()">Apagar tudo definitivamente</button>');
}

function limparTudoDefinitivo() {
  fecharModal();
  var alvos = ['alunos', 'polos', 'horarios', 'presencas', 'avaliacoes', 'avisos', 'mural', 'certificados', 'logs', 'solicitacoes', 'testesConhecimento', 'mensagensPrivadas', 'feedbacksAula', 'perguntasSemana', 'respostasPergunta', 'leiturasAvisos', 'pontosJogos', 'professorPresenca', 'aulasConteudo', 'avaliacoesSemanaisTurma', 'notasAvaliacoesSemanais'];
  Promise.all(alvos.map(function (c) { return DB.limparColecao(c); })).then(function () {
    sessaoAlunoId = null;
    mostrarToast('Todos os dados foram apagados.');
    renderAbaAdm();
  });
}

/* ---------------------------------------------------------------
   14. ABA DEV
   --------------------------------------------------------------- */
function renderAbaDev() {
  var box = $('conteudoDev');
  if (!exigirEquipe(['dev'], box)) return;

  var cfgAtual = carregarConfigFirebase();
  var contagens = COLECOES.map(function (c) {
    return '<div class="lista-item"><div class="linha"><b>' + c + '</b><span class="badge-count">' + DB.listar(c).length + '</span></div></div>';
  }).join('');

  var equipe = DB.listar('equipe').map(function (u) {
    return '<div class="lista-item"><div class="linha"><b>' + esc(u.nome) + '</b><span class="pill pill-info">' + esc(u.papel) + '</span></div>' +
      '<button class="btn btn-danger btn-mini" style="margin-top:6px;" onclick="excluirAcessoEquipe(\'' + u.id + '\')"><i class="fas fa-trash"></i> Remover acesso</button></div>';
  }).join('') || '<p class="sem-dados">Somente o seu acesso atual.</p>';

  var logs = DB.listar('logs').slice().sort(function (a, b) {
    return String(b.criadoEm || '').localeCompare(String(a.criadoEm || ''));
  }).slice(0, 40).map(function (l) {
    return '<div class="lista-item"><span class="mini">' + dataHoraBR(l.criadoEm) + ' [' + esc(l.origem) + ']</span><br>' + esc(l.mensagem) + '</div>';
  }).join('') || '<p class="sem-dados">Sem registros.</p>';

  box.innerHTML =
    '<div class="card" style="border:1px solid var(--accent-blue);">' +
      '<h3><i class="fas fa-user-shield"></i> Sessão: ' + esc(sessaoEquipe.nome) + ' <span class="pill pill-info">' + esc(sessaoEquipe.papel) + '</span></h3>' +
      '<button class="btn btn-back" style="margin:0;" onclick="sairEquipe()"><i class="fas fa-sign-out-alt"></i> Sair da equipe</button></div>' +

    '<div class="card"><h3><i class="fas fa-server"></i> Conexão de Dados</h3>' +
      '<div class="aviso-info">Modo atual: <strong>' + (DB.modo === 'nuvem' ? 'Firebase Firestore (nuvem)' : 'localStorage (somente neste dispositivo)') + '</strong></div>' +
      '<label class="campo-label">Configuração do Firebase (JSON)</label>' +
      '<textarea id="devFirebaseCfg" style="min-height:140px;" placeholder=\'{"apiKey":"...","authDomain":"...","projectId":"...","storageBucket":"...","messagingSenderId":"...","appId":"..."}\'>' + esc(cfgAtual ? JSON.stringify(cfgAtual, null, 2) : '') + '</textarea>' +
      '<button class="btn" onclick="salvarFirebaseDev()"><i class="fas fa-plug"></i> Salvar e reconectar</button>' +
      '<button class="btn btn-danger" onclick="removerFirebaseDev()"><i class="fas fa-unlink"></i> Remover configuração (voltar ao local)</button>' +
      '<p class="mini" style="margin-top:6px;">Sem configuração, o app funciona 100% offline e os dados ficam apenas neste navegador.</p></div>' +

    '<div class="card"><h3><i class="fas fa-user-plus"></i> Acessos da Equipe</h3>' + equipe +
      '<label class="campo-label">Nome</label><input id="devEquipeNome" placeholder="Nome do integrante">' +
      '<label class="campo-label">Senha</label><input id="devEquipeSenha" type="password" placeholder="Mínimo 4 caracteres">' +
      '<label class="campo-label">Perfil</label><select id="devEquipePapel">' +
      EQUIPE_PAPEIS.map(function (p) { return '<option value="' + p.id + '">' + p.nome + '</option>'; }).join('') + '</select>' +
      '<button class="btn" onclick="criarAcessoEquipe()"><i class="fas fa-plus"></i> Criar acesso</button></div>' +

    '<div class="card"><h3><i class="fas fa-table-list"></i> Registros por Coleção</h3>' + contagens +
      '<button class="btn btn-secondary" onclick="inspecionarColecao()"><i class="fas fa-magnifying-glass"></i> Inspecionar dados brutos</button></div>' +

    '<div class="card"><h3><i class="fas fa-terminal"></i> Registros de Atividade</h3>' + logs +
      '<button class="btn btn-danger" onclick="limparLogs()"><i class="fas fa-trash"></i> Limpar registros</button></div>' +

    '<div class="card"><h3><i class="fas fa-circle-info"></i> Ambiente</h3>' +
      '<div class="lista-item">App: <b>Universo Capoeira</b></div>' +
      '<div class="lista-item">Ambiente: <b>' + (DB.modo === 'nuvem' ? 'produção (nuvem)' : 'local (offline)') + '</b></div>' +
      '<div class="lista-item">Usuário: <b>' + esc(navigator.userAgent.slice(0, 60)) + '...</b></div>' +
      '<div class="lista-item">Offline: <b>' + (navigator.onLine ? 'conectado' : 'sem internet') + '</b></div>' +
      '<div class="lista-item">Notificações: <b>' + (notificacaoAtiva() ? 'ativas' : 'inativas') + '</b></div>' +
      '<button class="btn btn-secondary" onclick="limparCacheLocal()"><i class="fas fa-broom"></i> Limpar cache local do navegador</button>' +
      '<button class="btn btn-secondary" onclick="location.reload()"><i class="fas fa-sync-alt"></i> Recarregar app</button>' +
      '<button class="btn btn-secondary" onclick="mostrarToast(\'Tela: \' + window.innerWidth + \'x\' + window.innerHeight + \'px\')"><i class="fas fa-mobile-alt"></i> Informações da tela</button></div>' +

    '<div class="card" style="border:1px solid var(--danger);"><h3><i class="fas fa-bug"></i> Telemetria & Monitor de Erros</h3>' +
      '<p class="mini" style="margin-bottom:6px;">Qualquer erro de script neste dispositivo é capturado abaixo, em tempo real.</p>' +
      '<div id="boxTelemetriaErrosLog" style="max-height:160px; overflow-y:auto; font-size:0.7rem; color:#fff; background:#081217; padding:6px; border-radius:6px;">Nenhum erro registrado até o momento (sistema estável).</div>' +
      '<div class="flex-btn" style="margin-top:6px;">' +
        '<button class="btn btn-secondary" onclick="perguntarIASobreErros(this)"><i class="fas fa-robot"></i> Perguntar à IA</button>' +
        '<button class="btn btn-danger" onclick="limparTelemetriaErros()"><i class="fas fa-trash"></i> Limpar</button>' +
      '</div>' +
      '<div id="diagnosticoIAErros" class="mini" style="margin-top:8px; color:var(--gold); white-space:pre-wrap;"></div></div>' +

    '<div class="card" style="border:1px solid var(--gold);"><h3><i class="fas fa-box-archive"></i> Importar Dados da Versão Antiga</h3>' +
      '<p class="mini" style="margin-bottom:6px;">Traz alunos e avaliações que ficaram guardados nas coleções antigas (boletins/historico_avaliacoes) pro formato atual. Pode rodar quantas vezes quiser — não duplica.</p>' +
      '<button class="btn btn-secondary" onclick="importarDadosAntigos(this)"><i class="fas fa-box-archive"></i> Importar Dados da Versão Antiga</button></div>' +

    '<div class="card" style="border:1px solid var(--gold);"><h3><i class="fas fa-bullhorn"></i> Publicar Atualização</h3>' +
      '<p class="mini" style="margin-bottom:6px;">Depois de subir o arquivo novo no GitHub Pages / hospedagem, toque aqui pra avisar todos os aparelhos (professor, alunos, todo mundo) a atualizar. Isso não substitui subir o arquivo — só avisa quem já tem o app aberto ou instalado.</p>' +
      '<button class="btn btn-gold" onclick="publicarNovaVersaoDev(this)"><i class="fas fa-bullhorn"></i> Avisar Todos os Dispositivos</button></div>';
  atualizarPainelTelemetria();
  tornarCardsColapsaveis(box);
}

function semanaAtualISO(d) {
  d = d ? new Date(d) : new Date();
  var date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  var diaSemanaISO = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - diaSemanaISO);
  var inicioAno = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  var numSemana = Math.ceil((((date - inicioAno) / 86400000) + 1) / 7);
  return date.getUTCFullYear() + '-S' + String(numSemana).padStart(2, '0');
}

var quizAtual = null;
var quizOrigemTurmaId = null; /* id do doc em avaliacoesSemanaisTurma quando o quiz atual é o oficial da turma */

function renderAreaTesteConhecimento() {
  var area = $('areaTesteConhecimento');
  var aluno = alunoLogado();
  if (!area || !aluno) return;

  var semana = semanaAtualISO();
  var testeTurma = testeSemanalDaTurmaAtual();

  if (testeTurma) {
    var notas = DB.listar('notasAvaliacoesSemanais').filter(function (n) { return n.testeId === testeTurma.id && n.alunoId === aluno.id; });
    var jaRespondeu = notas[0] || null;
    var prazoPassou = testeTurma.prazo && new Date(testeTurma.prazo).getTime() < Date.now();

    var evolucaoTurmaHtml = '';
    var historico = DB.listar('notasAvaliacoesSemanais').filter(function (n) { return n.alunoId === aluno.id; })
      .slice().sort(function (a, b) { return String(b.semana || '').localeCompare(String(a.semana || '')); });
    if (historico.length) {
      evolucaoTurmaHtml = '<h4 style="font-size:0.78rem; color:var(--gold); margin-top:10px;">Suas Avaliações Semanais</h4>' +
        historico.slice(0, 8).map(function (n) {
          return '<div class="lista-item"><div class="linha"><span class="mini">' + esc(n.temaNome || n.tema || '') + ' • ' + esc(n.semana) + '</span>' +
            '<span class="badge-count">' + n.nota.toFixed(1) + '</span></div></div>';
        }).join('');
    }

    if (jaRespondeu) {
      area.innerHTML = '<p class="sem-dados">Você já respondeu a avaliação semanal desta semana (' + esc(testeTurma.temaNome) + '). Nota: <b>' + jaRespondeu.nota.toFixed(1) + '/10</b> (' + jaRespondeu.acertos + '/' + jaRespondeu.total + ')</p>' + evolucaoTurmaHtml;
      return;
    }
    if (prazoPassou) {
      area.innerHTML = '<p class="sem-dados">O prazo da avaliação semanal (' + esc(testeTurma.temaNome) + ') encerrou. Aguarde a próxima semana.</p>' + evolucaoTurmaHtml;
      return;
    }
    area.innerHTML = '<p class="mini" style="margin-bottom:6px;">📌 Tema da semana: <b>' + esc(testeTurma.temaNome) + '</b> — responda até domingo.</p>' +
      '<button class="btn" onclick="iniciarQuizTurma()"><i class="fas fa-magic"></i> Fazer Avaliação Semanal da Turma</button>' + evolucaoTurmaHtml;
    return;
  }

  var testes = DB.listar('testesConhecimento').filter(function (t) { return t.alunoId === aluno.id; })
    .slice().sort(function (a, b) { return String(b.semana || '').localeCompare(String(a.semana || '')); });
  var jaFezEstaSemana = testes.some(function (t) { return t.semana === semana; });

  var evolucaoHtml = '';
  if (testes.length) {
    evolucaoHtml = '<h4 style="font-size:0.78rem; color:var(--gold); margin-top:10px;">Sua Evolução</h4>' +
      testes.slice(0, 8).map(function (t) {
        return '<div class="lista-item"><div class="linha"><span class="mini">' + esc(t.semana) + ' • ' + dataBR(t.data) + '</span>' +
          '<span class="badge-count">' + t.acertos + '/' + t.total + '</span></div></div>';
      }).join('');
  }

  if (jaFezEstaSemana) {
    area.innerHTML = '<p class="sem-dados">Você já fez o teste desta semana (' + semana + '). Volte semana que vem!</p>' + evolucaoHtml;
    return;
  }
  if (!CONFIG.iaProxyUrl) {
    area.innerHTML = '<p class="sem-dados">Assistente de IA ainda não configurado pelo ADM.</p>';
    return;
  }

  var lembrete = testes.length ? '<p class="mini" style="color:var(--gold); margin-bottom:6px;">📅 Ainda não fez o teste desta semana — bora manter a sequência?</p>' : '';
  area.innerHTML = lembrete + '<button class="btn" onclick="gerarTesteConhecimento()"><i class="fas fa-magic"></i> Fazer Teste desta Semana</button>' + evolucaoHtml;
}

function iniciarQuizTurma() {
  var testeTurma = testeSemanalDaTurmaAtual();
  if (!testeTurma) { renderAreaTesteConhecimento(); return; }
  quizAtual = testeTurma.perguntas;
  quizOrigemTurmaId = testeTurma.id;
  renderizarQuizConhecimento();
}

function gerarTesteConhecimento() {
  var area = $('areaTesteConhecimento');
  quizOrigemTurmaId = null;
  area.innerHTML = '<p class="sem-dados"><span class="spinner-btn"></span> Gerando seu teste...</p>';

  fetch(CONFIG.iaProxyUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gerarQuiz: true, contexto: montarContextoAluno(), baseConhecimento: montarBaseConhecimentoComAvatar() })
  }).then(function (r) { return r.json(); })
    .then(function (data) {
      if (!data || !data.perguntas || !data.perguntas.length) {
        area.innerHTML = '<p class="sem-dados">Não consegui gerar o teste agora. Tente de novo em instantes.</p><button class="btn" onclick="gerarTesteConhecimento()">Tentar de novo</button>';
        return;
      }
      quizAtual = data.perguntas;
      renderizarQuizConhecimento();
    })
    .catch(function () {
      area.innerHTML = '<p class="sem-dados">Erro ao gerar o teste. Tente de novo.</p><button class="btn" onclick="gerarTesteConhecimento()">Tentar de novo</button>';
    });
}

function renderizarQuizConhecimento() {
  var area = $('areaTesteConhecimento');
  if (!area || !quizAtual) return;
  area.innerHTML = quizAtual.map(function (p, i) {
    return '<div class="lista-item"><p style="font-weight:bold; margin-bottom:6px;">' + (i + 1) + '. ' + esc(p.pergunta) + '</p>' +
      p.opcoes.map(function (op, j) {
        return '<label style="display:flex; align-items:center; gap:6px; font-size:0.78rem; margin-bottom:4px;"><input type="radio" name="quizP' + i + '" value="' + j + '" style="width:auto;">' + esc(op) + '</label>';
      }).join('') + '</div>';
  }).join('') + '<button class="btn" onclick="enviarRespostasQuiz()"><i class="fas fa-check"></i> Enviar Respostas</button>';
}

function enviarRespostasQuiz() {
  if (!quizAtual) return;
  var aluno = alunoLogado();
  var acertos = 0, semResposta = false;
  quizAtual.forEach(function (p, i) {
    var marcado = document.querySelector('input[name="quizP' + i + '"]:checked');
    if (!marcado) { semResposta = true; return; }
    if (Number(marcado.value) === Number(p.correta)) acertos++;
  });
  if (semResposta) { mostrarToast('Responda todas as perguntas antes de enviar.', 'erro'); return; }

  var total = quizAtual.length;

  if (quizOrigemTurmaId) {
    var testeTurma = DB.buscar('avaliacoesSemanaisTurma', quizOrigemTurmaId);
    var nota = Math.round((acertos / total) * 10 * 10) / 10;
    DB.salvar('notasAvaliacoesSemanais', {
      alunoId: aluno.id,
      alunoNome: aluno.nome,
      alunoApelido: aluno.apelido || '',
      testeId: quizOrigemTurmaId,
      tema: testeTurma ? testeTurma.tema : '',
      temaNome: testeTurma ? testeTurma.temaNome : '',
      semana: testeTurma ? testeTurma.semana : semanaAtualISO(),
      data: dataLocalISO(),
      acertos: acertos,
      total: total,
      nota: nota,
      criadoEm: agoraISO()
    }).then(function () {
      mostrarToast('Avaliação enviada! Nota: ' + nota.toFixed(1) + '/10.');
      quizAtual = null;
      quizOrigemTurmaId = null;
      renderAreaTesteConhecimento();
    });
    return;
  }

  DB.salvar('testesConhecimento', {
    alunoId: aluno.id,
    alunoNome: aluno.nome,
    alunoApelido: aluno.apelido || '',
    semana: semanaAtualISO(),
    data: dataLocalISO(),
    acertos: acertos,
    total: total,
    criadoEm: agoraISO()
  }).then(function () {
    mostrarToast('Teste enviado! Você acertou ' + acertos + ' de ' + total + '.');
    quizAtual = null;
    renderAreaTesteConhecimento();
  });
}

function gerarParecerIA(alunoId, idAlvo) {
  var alvo = $(idAlvo);
  if (!alvo) return;
  if (!CONFIG.iaProxyUrl) { mostrarToast('Assistente de IA ainda não configurado.', 'erro'); return; }
  var aluno = DB.buscar('alunos', alunoId);
  var testes = DB.listar('testesConhecimento').filter(function (t) { return t.alunoId === alunoId; })
    .slice().sort(function (a, b) { return String(a.semana || '').localeCompare(String(b.semana || '')); });

  alvo.innerHTML = '<span class="spinner-btn"></span> Gerando parecer...';
  fetch(CONFIG.iaProxyUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      gerarParecer: true,
      aluno: { nome: aluno ? (aluno.apelido || aluno.nome) : 'Aluno', historico: testes.map(function (t) { return { semana: t.semana, acertos: t.acertos, total: t.total }; }) },
      baseConhecimento: montarBaseConhecimentoComAvatar()
    })
  }).then(function (r) { return r.json(); })
    .then(function (data) {
      alvo.textContent = (data && data.parecer) ? data.parecer : ('Erro: ' + ((data && data.erro) || 'não foi possível gerar.'));
    })
    .catch(function () { alvo.textContent = 'Não consegui gerar o parecer agora. Tente de novo.'; });
}

function capitalizarSlug(slug) {
  return String(slug || '').replace(/_/g, ' ').split(' ').map(function (p) {
    return p ? p.charAt(0).toUpperCase() + p.slice(1) : p;
  }).join(' ').trim() || 'Aluno';
}

function importarDadosAntigos(btn) {
  if (DB.modo !== 'nuvem' || !DB.fs) { mostrarToast('Conecte ao Firebase (modo nuvem) antes de importar.', 'erro'); return; }
  if (btn) { btn.classList.add('carregando'); btn.innerHTML = '<span class="spinner-btn"></span> Importando...'; }

  var mapaEtapa = { '1a_avaliacao': '1ª Avaliação do Ano', '2a_avaliacao': '2ª Avaliação do Ano' };
  var alunosExistentes = DB.listar('alunos');
  var idsRecuperados = {};
  var alunosCriados = 0, avaliacoesImportadas = 0, ignoradas = 0;

  DB.fs.collection('boletins').get().then(function (snapBoletins) {
    var promessasAlunos = [];

    snapBoletins.forEach(function (doc) {
      var slug = doc.id;
      var jaExiste = alunosExistentes.some(function (a) { return a.id === slug; });
      idsRecuperados[slug] = true;
      if (jaExiste) return;

      var b = doc.data();
      promessasAlunos.push(DB.salvar('alunos', {
        nome: capitalizarSlug(slug),
        apelido: capitalizarSlug(slug),
        graduacao: b.proximaCorda || 'Iniciante - Corda Crua',
        contato: '',
        senhaHash: hashSenha('capoeira123'),
        criadoEm: agoraISO(),
        importadoDeVersaoAntiga: true
      }, slug));
      alunosCriados++;
    });

    return Promise.all(promessasAlunos);
  }).then(function () {
    return DB.fs.collection('historico_avaliacoes').get();
  }).then(function (snapHistorico) {
    var alunosAtualizados = DB.listar('alunos');
    var existentesAvals = DB.listar('avaliacoes');
    var promessasAvals = [];

    snapHistorico.forEach(function (doc) {
      var origemId = 'antigo_' + doc.id;
      var jaImportado = existentesAvals.some(function (a) { return a.origemHistoricoId === origemId; });
      if (jaImportado) { ignoradas++; return; }

      var b = doc.data();
      var slug = b.alunoId || '';
      var aluno = alunosAtualizados.filter(function (a) { return a.id === slug; })[0];
      if (!aluno) { ignoradas++; return; }

      var dataConvertida = '';
      try { if (b.atualizadoEm && b.atualizadoEm.toDate) dataConvertida = dataLocalISO(b.atualizadoEm.toDate()); } catch (e) {}

      promessasAvals.push(DB.salvar('avaliacoes', {
        alunoId: aluno.id,
        alunoNome: aluno.nome,
        alunoApelido: aluno.apelido || '',
        graduacao: b.proximaCorda || aluno.graduacao || '',
        etapa: mapaEtapa[b.etapa] || b.etapa || 'Avaliação importada',
        notas: b.notas || {},
        dificuldades: b.dificuldades || [],
        proximaCorda: b.proximaCorda || '',
        observacao: b.obs || '',
        professor: b.avaliadoPor || 'Professor (importado)',
        data: dataConvertida || dataLocalISO(),
        criadoEm: agoraISO(),
        origemHistoricoId: origemId
      }));
      avaliacoesImportadas++;
    });

    return Promise.all(promessasAvals);
  }).then(function () {
    if (btn) { btn.classList.remove('carregando'); btn.innerHTML = '<i class="fas fa-box-archive"></i> Importar Dados da Versão Antiga'; }
    mostrarToast(alunosCriados + ' aluno(s) recuperado(s), ' + avaliacoesImportadas + ' avaliação(ões) importada(s)' + (ignoradas ? ', ' + ignoradas + ' ignorada(s)' : '') + '.');
    registroLog('dev', 'Importação de dados antigos: ' + alunosCriados + ' alunos, ' + avaliacoesImportadas + ' avaliações.');
  }).catch(function (err) {
    if (btn) { btn.classList.remove('carregando'); btn.innerHTML = '<i class="fas fa-box-archive"></i> Importar Dados da Versão Antiga'; }
    mostrarToast('Erro ao importar: ' + err.message, 'erro');
  });
}

function salvarFirebaseDev() {
  var texto = ($('devFirebaseCfg').value || '').trim();
  if (!texto) { mostrarToast('Cole o JSON de configuração.', 'erro'); return; }
  var cfg;
  try { cfg = JSON.parse(texto); } catch (e) { mostrarToast('JSON inválido.', 'erro'); return; }
  if (!cfg.projectId || !cfg.apiKey) { mostrarToast('O JSON precisa conter projectId e apiKey.', 'erro'); return; }
  salvarConfigFirebase(cfg);
  registroLog('dev', 'Configuração do Firebase salva: ' + cfg.projectId);
  mostrarToast('Configuração salva. Recarregando o app...');
  setTimeout(function () { location.reload(); }, 1200);
}

function removerFirebaseDev() {
  abrirModal('Remover Firebase', '<div class="alerta-dificuldade">O app voltará ao modo local e os dados da nuvem não serão mais acessados neste dispositivo.</div>',
    '<button class="btn btn-danger" onclick="confirmarRemoverFirebase()">Remover e recarregar</button>');
}

function confirmarRemoverFirebase() {
  fecharModal();
  salvarConfigFirebase(null);
  setTimeout(function () { location.reload(); }, 600);
}

function criarAcessoEquipe() {
  var nome = ($('devEquipeNome').value || '').trim();
  var senha = $('devEquipeSenha').value || '';
  var papel = $('devEquipePapel').value;
  if (nome.length < 3) { mostrarToast('Informe o nome.', 'erro'); return; }
  if (senha.length < 4) { mostrarToast('Senha muito curta.', 'erro'); return; }
  var existe = DB.listar('equipe').some(function (u) { return normalizar(u.nome) === normalizar(nome); });
  if (existe) { mostrarToast('Já existe um acesso com esse nome.', 'erro'); return; }
  DB.salvar('equipe', { nome: nome, senhaHash: hashSenha(senha), papel: papel, criadoEm: agoraISO(), ativo: true })
    .then(function () {
      mostrarToast('Acesso criado para ' + nome + '.');
      registroLog('dev', 'Novo acesso de equipe: ' + nome + ' (' + papel + ')');
      renderAbaDev();
    });
}

function excluirAcessoEquipe(id) {
  if (sessaoEquipe && sessaoEquipe.id === id) { mostrarToast('Você não pode remover o seu próprio acesso.', 'erro'); return; }
  DB.excluir('equipe', id).then(function () { mostrarToast('Acesso removido.'); renderAbaDev(); });
}

function inspecionarColecao() {
  var opcoes = COLECOES.map(function (c) { return '<option value="' + c + '">' + c + '</option>'; }).join('');
  abrirModal('Dados brutos',
    '<label class="campo-label">Coleção</label><select id="devInspecCol" onchange="mostrarDadosBrutos()">' + opcoes + '</select>' +
    '<pre id="devInspecSaida" style="max-height:44vh; overflow:auto; font-size:0.6rem; background:#050b0e; border-radius:6px; padding:8px; margin-top:8px; white-space:pre-wrap;"></pre>');
  mostrarDadosBrutos();
}

function mostrarDadosBrutos() {
  var col = $('devInspecCol').value;
  var dados = DB.listar(col).map(function (x) {
    var copia = Object.assign({}, x);
    if (copia.senhaHash) copia.senhaHash = '***';
    if (copia.imagem && copia.imagem.length > 60) copia.imagem = copia.imagem.slice(0, 60) + '...(imagem)';
    return copia;
  });
  $('devInspecSaida').textContent = JSON.stringify(dados, null, 1);
}

function limparLogs() {
  DB.limparColecao('logs').then(function () { mostrarToast('Registros apagados.'); renderAbaDev(); });
}

function limparCacheLocal() {
  abrirModal('Limpar cache local', '<div class="alerta-dificuldade">Isso remove os dados salvos no navegador (modo local) e as preferências. No modo nuvem os dados permanecem no Firestore.</div>',
    '<button class="btn btn-danger" onclick="confirmarLimparCache()">Limpar agora</button>');
}

function confirmarLimparCache() {
  fecharModal();
  localStorage.removeItem(CHAVE_LOCAL);
  localStorage.removeItem(CHAVE_NOTIF);
  mostrarToast('Cache local limpo. Recarregando...');
  setTimeout(function () { location.reload(); }, 900);
}

/* ---------------------------------------------------------------
   14b. ASSISTENTE VIRTUAL
   --------------------------------------------------------------- */
var assistenteAberto = false;
var assistenteJaCumprimentou = false;

function toggleAssistente() {
  assistenteAberto = !assistenteAberto;
  var painel = $('assistentePainel');
  if (!painel) return;
  var dica = $('dicaAssistentePrimeiroAcesso');
  if (dica) dica.style.display = 'none';
  try { localStorage.setItem('uc_assistente_apresentado_v1', '1'); } catch (e) {}
  painel.classList.toggle('aberto', assistenteAberto);
  if (assistenteAberto && !assistenteJaCumprimentou) {
    assistenteJaCumprimentou = true;
    assistenteAdicionarBolha('bot', assistenteMensagemBoasVindas());
  }
  if (assistenteAberto) {
    try { atualizarCompanheiroUI(); } catch (e) {}
    setTimeout(function () {
      var inp = $('assistenteInput');
      if (inp) inp.focus();
    }, 200);
  }
}

/* ================================================================
   INDEX DE CONHECIMENTO — Formação de Professor
   Aquecimento • Alongamento • Mobilidade • Mobilidade de Quadril
   Fonte: ACSM, revisões sistemáticas, consenso Delphi, fisioterapia
   ================================================================ */
var INDEX_FORMACAO_PROFESSOR = {
  definicoes: {
    aquecimento: 'Preparação fisiológica e neuromuscular do corpo para o esforço. Foco: temperatura, circulação e sistema nervoso. Sempre ANTES do treino.',
    alongamento: 'Técnica para aumentar o comprimento dos tecidos moles (músculos e tendões). Amplitude passiva. Ideal pós-treino ou sessão dedicada.',
    flexibilidade: 'Capacidade PASSIVA de alcançar amplitude máxima. Resultado do alongamento.',
    mobilidade: 'Capacidade ATIVA de mover a articulação com controle, força e estabilidade. Ideal no aquecimento ou treino específico.'
  },
  resumoChave: 'Alongamento = “esticar o músculo”. Mobilidade = “mover a articulação com controle e força”. É possível ser flexível e ter má mobilidade.',
  aquecimento: {
    objetivos: [
      'Elevar temperatura muscular',
      'Aumentar circulação e lubrificação articular',
      'Ativar o sistema nervoso',
      'Preparar o padrão de movimento do treino',
      'Reduzir risco de lesão e melhorar desempenho'
    ],
    estrutura: [
      '1. Geral (2–4 min): caminhada rápida, bike leve, polichinelos, pular corda',
      '2. Específico / mobilidade dinâmica (4–8 min): movimentos que imitam o treino (ginga, meia-lua, negativa…)',
      '3. Ativação (força): séries leves do exercício principal'
    ],
    evidencia: [
      'Alongamento estático prolongado (>45–60 s) antes do treino pode reduzir força e potência temporariamente.',
      'Alongamento dinâmico de 7–10 min melhora desempenho explosivo (salto, sprint).',
      'Aquecimento bem estruturado melhora performance; prevenção de lesão fica mais clara com força e equilíbrio no protocolo.'
    ]
  },
  alongamento: {
    tipos: [
      'Estático: segura a posição 15–60 s ou mais',
      'Dinâmico: movimentos controlados pela amplitude (melhor no aquecimento)',
      'PNF: contrai → relaxa → alonga (muito eficaz)',
      'Balístico: balanços rápidos (não recomendado para a maioria)'
    ],
    recomendacoes: [
      'Antes do treino: dinâmico (ou estático muito curto ≤ 30–45 s total por músculo)',
      'Depois do treino ou sessão dedicada: estático ou PNF',
      'Frequência para ganho: ≥ 2–3x por semana (ideal diário)',
      'Dose crônica: 2–3 séries de 30–120 s por grupo muscular',
      'Treino de força em amplitude completa também melhora flexibilidade'
    ],
    importante: 'Alongar NÃO é a principal estratégia de prevenção de lesões. Força e controle motor são mais relevantes.'
  },
  mobilidade: {
    oQue: 'Mobilidade = amplitude ativa + estabilidade + controle neuromuscular.',
    superior: [
      'Ensina o sistema nervoso a usar a nova amplitude',
      'Previne compensações (lombar, joelhos…)',
      'Melhora a qualidade do movimento no dia a dia e no treino'
    ],
    principios: [
      'Movimentos lentos e controlados (CARs – Controlled Articular Rotations)',
      'Trabalhe a amplitude + controle no final (isometria ou força leve)',
      'Respire de forma estável; evite forçar dor aguda',
      'Prefira mobilidade ativa no aquecimento da capoeira'
    ]
  },
  quadril: {
    importancia: 'O quadril é central na capoeira (ginga, meia-lua, aú, negativa, rolê). Má mobilidade de quadril gera compensação na lombar e nos joelhos.',
    focos: [
      'Flexão e extensão controladas',
      'Abdução / adução e rotações internas e externas',
      'CARs de quadril em 90/90 ou em pé',
      'Ponte glútea e ativação de glúteo médio antes da roda'
    ],
    dicaAula: 'No aquecimento de capoeira: 2–3 min geral + 4–6 min mobilidade de quadril e coluna (círculos, 90/90, world greatest stretch adaptado) + 2 min ativação (ponte, agachamento leve, ginga lenta).'
  },
  protocoloAulaCapoeira: [
    '1. Aquecimento geral 2–4 min (deslocamentos, polichinelos leves)',
    '2. Mobilidade dinâmica 4–6 min (quadril, tornozelo, coluna, ombros) — sem alongamento estático longo',
    '3. Ginga e fundamentos em ritmo baixo 3–5 min',
    '4. Parte principal (técnica / jogo / força)',
    '5. Volta à calma: alongamento estático ou PNF 5–8 min (posteriores, adutores, peitoral, flexores de quadril)'
  ]
};

function assistenteFormacaoProfessor(texto) {
  var t = normalizar(texto);
  var I = INDEX_FORMACAO_PROFESSOR;

  /* só responde formação se a pergunta for do tema OU se for professor pedindo formação */
  var temaFormacao = /aquec|along|flexib|mobilid|quadril|cars|pnf|protocolo.*aula|estrutura.*aula|preparar.*aula|formacao|formação.*professor|dar aula|aquecer|esticar|dinamico|estatico/.test(t);
  if (!temaFormacao) return null;

  if (/diferenca|vs|versus|x\s|o que e|definição|definicao|conceito/.test(t) && /aquec|along|mobil|flexib/.test(t)) {
    return '📚 Definições (Formação de Professor)\n\n' +
      '🔥 Aquecimento: ' + I.definicoes.aquecimento + '\n\n' +
      '🧘 Alongamento: ' + I.definicoes.alongamento + '\n\n' +
      '📏 Flexibilidade: ' + I.definicoes.flexibilidade + '\n\n' +
      '🎯 Mobilidade: ' + I.definicoes.mobilidade + '\n\n' +
      '💡 ' + I.resumoChave;
  }

  if (/aquec/.test(t)) {
    return '🔥 Aquecimento — Formação de Professor\n\n' +
      'Objetivos:\n• ' + I.aquecimento.objetivos.join('\n• ') + '\n\n' +
      'Estrutura (5–12 min):\n' + I.aquecimento.estrutura.join('\n') + '\n\n' +
      'Evidência:\n• ' + I.aquecimento.evidencia.join('\n• ') + '\n\n' +
      'Na capoeira: evite alongamento estático longo antes da roda; prefira mobilidade dinâmica + ginga leve.';
  }

  if (/along|esticar|pnf|estatico|dinamico.*along/.test(t)) {
    return '🧘 Alongamento — Formação de Professor\n\n' +
      'Tipos:\n• ' + I.alongamento.tipos.join('\n• ') + '\n\n' +
      'Recomendações (ACSM / Delphi):\n• ' + I.alongamento.recomendacoes.join('\n• ') + '\n\n' +
      '⚠️ ' + I.alongamento.importante;
  }

  if (/quadril/.test(t)) {
    return '🦴 Mobilidade de Quadril — Capoeira\n\n' +
      I.quadril.importancia + '\n\n' +
      'Focos:\n• ' + I.quadril.focos.join('\n• ') + '\n\n' +
      '💡 Dica de aula:\n' + I.quadril.dicaAula;
  }

  if (/mobilid|cars|controle motor|amplitude ativa/.test(t)) {
    return '🎯 Mobilidade — Formação de Professor\n\n' +
      I.mobilidade.oQue + '\n\n' +
      'Por que é superior ao alongamento isolado:\n• ' + I.mobilidade.superior.join('\n• ') + '\n\n' +
      'Princípios:\n• ' + I.mobilidade.principios.join('\n• ');
  }

  if (/protocolo|estrutura.*aula|como montar|preparar.*aula|inicio.*aula|comecar.*aula/.test(t)) {
    return '📋 Protocolo de aula de Capoeira (aquecimento → volta à calma)\n\n' +
      I.protocoloAulaCapoeira.join('\n') + '\n\n' +
      'Pergunte também: "aquecimento", "alongamento", "mobilidade" ou "quadril" para aprofundar.';
  }

  if (/formacao|formação.*professor|index|conhecimento|ajuda.*professor|menu formacao/.test(t)) {
    return '🎓 Formação de Professor — Index de Conhecimento\n\n' +
      'Temas disponíveis:\n' +
      '1. Definições (aquecimento × alongamento × mobilidade)\n' +
      '2. Aquecimento (estrutura 5–12 min + evidência)\n' +
      '3. Alongamento (tipos, ACSM, PNF)\n' +
      '4. Mobilidade e CARs\n' +
      '5. Mobilidade de quadril na capoeira\n' +
      '6. Protocolo completo de aula\n\n' +
      'Exemplos: "como aquecer a turma?", "alongamento antes ou depois?", "mobilidade de quadril", "protocolo de aula"';
  }

  /* fallback genérico do tema */
  return '🎓 Formação de Professor\n\n' +
    I.resumoChave + '\n\n' +
    'Pergunte de forma mais específica:\n' +
    '• "aquecimento"\n• "alongamento"\n• "mobilidade"\n• "quadril"\n• "protocolo de aula"\n• "diferença alongamento e mobilidade"';
}


/** Resumo personalizado do aluno (histórico do app — não altera avaliações/graduações) */
function assistenteColetarHistorico(aluno) {
  var h = {
    nome: '',
    checkinHoje: null,
    presencasOk: 0,
    presencasPend: 0,
    nivelMundo: 1,
    treinosMundo: 0,
    fome: 100,
    humor: 100,
    estilo: 'iniciante',
    golpesTop: [],
    temAvatar: false,
    niveisJogos: {},
    dicas: []
  };
  if (!aluno) return h;
  h.nome = aluno.apelido || aluno.nome || '';
  h.temAvatar = !!(aluno.avatarSimulador);
  h.nivelMundo = aluno.nivelSimulador || 1;
  h.treinosMundo = aluno.treinosSimulador || 0;
  h.fome = (aluno.fomeSimulador != null) ? aluno.fomeSimulador : 100;
  h.humor = (aluno.humorSimulador != null) ? aluno.humorSimulador : 100;
  try {
    if (typeof obterCheckinDoDia === 'function') h.checkinHoje = obterCheckinDoDia(aluno);
  } catch (e) {}
  try {
    var lista = (DB.listar('presencas') || []).filter(function (p) {
      return p.alunoId === aluno.id || normalizar(p.alunoNome) === normalizar(aluno.nome);
    });
    h.presencasOk = lista.filter(function (p) { return p.status === 'aprovado'; }).length;
    h.presencasPend = lista.filter(function (p) { return p.status === 'pendente'; }).length;
  } catch (e2) {}
  try {
    var apr = aluno.avatarAprendizado || {};
    h.estilo = apr.estilo || 'iniciante';
    var golpes = apr.golpes || {};
    h.golpesTop = Object.keys(golpes).sort(function (a, b) { return golpes[b] - golpes[a]; }).slice(0, 3);
  } catch (e3) {}
  try {
    if (typeof carregarNiveisArcade === 'function') h.niveisJogos = carregarNiveisArcade() || {};
  } catch (e4) {
    try {
      h.niveisJogos = JSON.parse(localStorage.getItem('uc_arcade_niveis') || '{}');
    } catch (e5) {}
  }
  if (!h.checkinHoje) h.dicas.push('Ainda sem check-in hoje — vale registrar na aba Check-in se for treinar.');
  else if (h.checkinHoje.status === 'pendente') h.dicas.push('Seu check-in de hoje está pendente de aprovação do professor.');
  if (!h.temAvatar) h.dicas.push('Escolha seu avatar no Mundo para treinar, cuidar e lutar vs IA.');
  if (h.fome < 40) h.dicas.push('Seu avatar está com fome (' + Math.round(h.fome) + '%) — alimente no Mundo.');
  if (h.humor < 40) h.dicas.push('Humor do avatar baixo (' + Math.round(h.humor) + '%) — alongue ou brinque no Mundo.');
  if (h.treinosMundo < 3) h.dicas.push('Faça alguns treinos no Mundo para o avatar evoluir de estilo.');
  if (h.estilo === 'iniciante' && h.treinosMundo >= 1) h.dicas.push('Continue treinando e combatendo — o estilo do avatar sobe com a prática.');
  var jogoFraco = null, menor = 99;
  Object.keys(h.niveisJogos || {}).forEach(function (k) {
    var nv = Number(h.niveisJogos[k]) || 1;
    if (nv < menor) { menor = nv; jogoFraco = k; }
  });
  if (jogoFraco && menor <= 2) h.dicas.push('No arcade, experimente subir o nível de ' + jogoFraco + ' (está no nv.' + menor + ').');
  if (!h.dicas.length) h.dicas.push('Você está em dia! Que tal um combate vs IA no Mundo ou uma partida de damas?');
  return h;
}

function assistenteResumoProgresso(aluno) {
  if (!aluno) return 'Faça login na aba Aluno (ou cadastre-se no Mundo) para eu personalizar com o seu histórico.';
  var h = assistenteColetarHistorico(aluno);
  var linhas = [];
  linhas.push('📊 Seu progresso no app, ' + h.nome + ':');
  linhas.push('');
  linhas.push('🥋 Mundo: nível ' + h.nivelMundo + ' · treinos ' + h.treinosMundo + (h.temAvatar ? ' · avatar ativo' : ' · sem avatar'));
  linhas.push('🎭 Estilo do avatar: ' + String(h.estilo).toUpperCase());
  if (h.golpesTop.length) linhas.push('⚡ Golpes mais usados: ' + h.golpesTop.join(', '));
  linhas.push('💚 Cuidado: fome ' + Math.round(h.fome) + '% · humor ' + Math.round(h.humor) + '%');
  linhas.push('✅ Presenças aprovadas: ' + h.presencasOk + (h.presencasPend ? ' · pendentes: ' + h.presencasPend : ''));
  if (h.checkinHoje) {
    linhas.push('📍 Check-in hoje: ' + String(h.checkinHoje.status).toUpperCase());
  } else {
    linhas.push('📍 Check-in hoje: ainda não registrado');
  }
  var jogos = Object.keys(h.niveisJogos || {});
  if (jogos.length) {
    linhas.push('🎮 Jogos: ' + jogos.slice(0, 6).map(function (k) {
      return k + ' nv.' + (h.niveisJogos[k] || 1);
    }).join(' · '));
  }
  linhas.push('');
  linhas.push('💡 Dica: ' + h.dicas[0]);
  if (h.dicas[1]) linhas.push('💡 ' + h.dicas[1]);
  return linhas.join('\n');
}

function assistenteDicaDoDia(aluno) {
  var h = assistenteColetarHistorico(aluno);
  if (!aluno) {
    return 'Dica: entre na aba Aluno ou abra o Mundo e cadastre-se — aí eu personalizo as dicas com o seu histórico.';
  }
  return '💡 Dica personalizada para ' + h.nome + ':\n\n' + h.dicas[0] +
    (h.dicas[1] ? '\n\nTambém: ' + h.dicas[1] : '') +
    '\n\nPergunte "meu progresso" para o resumo completo.';
}

function assistenteMensagemBoasVindas() {
  var aluno = alunoLogado();
  var h = assistenteColetarHistorico(aluno);
  var nome = h.nome;
  var saudacao = nome ? ('Olá, ' + nome + '! ') : 'Olá! ';
  var extraProfessor = assistenteEhProfessor()
    ? '\n\n👨‍🏫 Modo equipe:\n• "avaliação de [nome]" ou "ficha de [nome]" — abre a ficha\n• "formação" / "aquecimento" / "mobilidade" / "protocolo de aula" — Index de Formação de Professor'
    : '';
  var personal = '';
  if (aluno) {
    personal = '\n\n📌 Agora, no seu ritmo:\n• ' + h.dicas[0];
    if (h.temAvatar) {
      personal += '\n• Mundo: nível ' + h.nivelMundo + ' · estilo ' + h.estilo;
    }
    personal += '\n\nAtalhos úteis: "meu progresso" · "dica" · "mundo" · "meu check-in"';
  } else {
    personal = '\n\nEntre na aba Aluno ou abra o Mundo e cadastre-se para eu personalizar com o seu histórico.';
  }
  return saudacao + 'Sou o Assistente Capoeira.' + personal + '\n\n' +
    'Também ajudo com:\n' +
    '• Próxima aula e horários\n' +
    '• Check-in e presenças\n' +
    '• Pedidos de treino e avisos\n' +
    '• Formação de professor (aquecimento, mobilidade…)' + extraProfessor + '\n\n' +
    'Toque em um atalho ou digite sua pergunta.';
}

function assistenteAdicionarBolha(tipo, texto) {
  var box = $('assistenteMsgs');
  if (!box) return;
  var div = document.createElement('div');
  div.className = 'assistente-bolha ' + tipo;
  div.textContent = texto;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

function assistenteEnviar() {
  var inp = $('assistenteInput');
  if (!inp) return;
  var texto = (inp.value || '').trim();
  if (!texto) return;
  inp.value = '';
  assistentePerguntar(texto);
}

function assistentePerguntar(texto) {
  if (!assistenteAberto) {
    assistenteAberto = true;
    $('assistentePainel').classList.add('aberto');
    if (!assistenteJaCumprimentou) {
      assistenteJaCumprimentou = true;
      assistenteAdicionarBolha('bot', assistenteMensagemBoasVindas());
    }
  }
  assistenteAdicionarBolha('user', texto);
  if (assistenteInterceptarAvaliacaoSemanal(texto)) return;
  if (assistenteInterceptarGerenciarAluno(texto)) return;
  setTimeout(function () {
    var resp = assistenteProcessar(texto);
    if (resp !== null) {
      assistenteAdicionarBolha('bot', resp);
      return;
    }
    if (!CONFIG.iaProxyUrl) {
      assistenteAdicionarBolha('bot', 'Não entendi completamente, e o assistente de IA ainda não foi configurado pelo ADM.\n\nTente perguntar, por exemplo:\n• "próxima aula"\n• "meu check-in"\n• "horários"\n• "pedir treino"\n• "ajuda"');
      return;
    }
    assistenteAdicionarBolha('bot', '💭 Pensando...');
    var bolhas = document.querySelectorAll('#assistenteMsgs .assistente-bolha.bot');
    var ultimaBolha = bolhas[bolhas.length - 1];
    chamarAssistenteIA(texto, ultimaBolha);
  }, 280);
}

function assistenteProcessar(texto) {
  var t = normalizar(texto);
  var aluno = alunoLogado();

  /* --- Formação de Professor (Index científico) --- */
  var respForm = assistenteFormacaoProfessor(texto);
  if (respForm) return respForm;

  /* --- atalhos e intenções --- */
  if (/ajuda|o que voce faz|comandos|menu/.test(t)) {
    return 'Posso responder sobre:\n\n' +
      '1. Próxima aula / horários da semana\n' +
      '2. Meu check-in de hoje\n' +
      '3. Como fazer check-in\n' +
      '4. Pedir treino específico\n' +
      '5. Minha graduação e avaliações\n' +
      '6. Certificados\n' +
      '7. Avisos do professor\n' +
      '8. Polos / locais de treino\n' +
      '9. Falar com o professor (mensagem privada)\n' +
      '10. Feedback da aula e pergunta da semana\n' +
      '11. Formação de professor (aquecimento, alongamento, mobilidade, quadril, protocolo de aula)\n\n' +
      'Exemplos: "qual a próxima aula?", "formação", "aquecimento", "mobilidade de quadril"';
  }

  if (/meu progresso|meu historico|minha evolucao|como estou|resumo|desempenho no app/.test(t)) {
    return assistenteResumoProgresso(aluno);
  }
  if (/^dica|dica do dia|o que fazer|sugestao|me orienta|proximo passo/.test(t)) {
    return assistenteDicaDoDia(aluno);
  }
  if (/\bmundo\b|simulador|avatar|tamagotchi|cuidar do mascote|lutar vs ia/.test(t)) {
    var h2 = assistenteColetarHistorico(aluno);
    if (!aluno) {
      return 'No Mundo Aberto você cuida do avatar, treina e luta vs IA (minimax).\n\nAbra a aba Mundo e cadastre-se / entre para começar.';
    }
    var msg = '🌍 Mundo Aberto — personalizado para você:\n\n';
    if (!h2.temAvatar) {
      msg += 'Você ainda não escolheu avatar. Abra a aba Mundo e escolha um personagem.\n';
    } else {
      msg += 'Avatar ativo · nível ' + h2.nivelMundo + ' · estilo ' + h2.estilo + '\n';
      msg += 'Fome ' + Math.round(h2.fome) + '% · humor ' + Math.round(h2.humor) + '% · treinos ' + h2.treinosMundo + '\n';
      if (h2.golpesTop.length) msg += 'Golpes favoritos: ' + h2.golpesTop.join(', ') + '\n';
      msg += '\nSugestão: ';
      if (h2.fome < 50) msg += 'alimente o avatar, depois treine.';
      else if (h2.humor < 50) msg += 'alongue ou brinque para subir o humor.';
      else msg += 'toque em "Lutar vs IA (minimax)" para um combate com a IA.';
    }
    msg += '\n\n💡 ' + h2.dicas[0];
    return msg;
  }

  if (/proxima aula|aula de hoje|quando e a aula|horario de hoje/.test(t)) {
    return assistenteInfoProximaAula();
  }

  if (/horario|horarios|quando treina|dias de treino|semana/.test(t)) {
    return assistenteInfoHorarios();
  }

  if (/meu check.?in|ja fiz check|status.*check|presenca hoje|check.?in hoje/.test(t)) {
    return assistenteInfoCheckin(aluno);
  }

  if (/como.*check.?in|fazer check.?in|check.?in local|gympass|wellhub/.test(t)) {
    return 'Como fazer check-in:\n\n' +
      '1. Abra a aba Check-in\n' +
      '2. Digite seu nome completo\n' +
      '3. Selecione o polo do treino\n' +
      '4. Se estiver atrasado, justifique\n' +
      '5. Toque em "Confirmar Presença Local"\n\n' +
      '• Só é permitido 1 check-in por aula/dia\n' +
      '• O professor precisa aprovar\n' +
      '• Aluno Gympass/Wellhub: o check-in do benefício é feito no próprio app Wellhub — o professor valida no Portal de Parceiros\n\n' +
      'Se der erro, peça ao professor para registrar o check-in manual na área Equipe.';
  }

  if (/esqueci.*senha|nao lembro.*senha|perdi.*senha|trocar.*senha|redefinir.*senha|recuperar.*senha/.test(t)) {
    return 'Esqueceu sua senha? Eu não posso trocar por aqui (só o professor pode, por segurança).\n\n' +
      '1. Toque em "Falar com o professor" (ou chame pessoalmente)\n' +
      '2. Peça pra resetar sua senha de aluno\n' +
      '3. O professor faz isso em segundos na aba Equipe\n' +
      '4. Você recebe uma senha provisória e troca no primeiro login';
  }

  if (/check.?in.*erro|erro.*check.?in|check.?in.*nao funciona|deu errado.*check|nao consigo.*check.?in|check.?in.*travou/.test(t)) {
    var msgErro = 'Vamos resolver! Confira nesta ordem:\n\n' +
      '1. Confira se digitou seu nome exatamente como foi cadastrado\n' +
      '2. Veja se já não fez check-in hoje (só é permitido 1 por dia)\n' +
      '3. Confira sua internet — sem conexão, o check-in fica salvo no aparelho e envia sozinho depois\n' +
      '4. Se continuar travando, feche e abra o app de novo\n\n' +
      'Se nada disso resolver, ';
    msgErro += aluno
      ? 'toque no atalho "Falar com o professor" aqui embaixo e explique o problema — ele registra seu check-in manualmente.'
      : 'peça para o professor registrar seu check-in manualmente na área Equipe.';
    return msgErro;
  }

  if (/pedir treino|treino especifico|solicitar treino|pedido de treino/.test(t)) {
    return 'Para pedir treino específico:\n\n' +
      '1. Entre na aba Aluno e faça login\n' +
      '2. No painel, use o card "Pedir Treino Específico"\n' +
      '3. Escolha o tipo (ginga, defesa, musicalidade, roda…)\n' +
      '4. Opcional: data preferida e observação\n' +
      '5. Envie — o professor recebe e responde\n\n' +
      (aluno ? assistenteInfoPedidos(aluno) : 'Faça login na aba Aluno para ver seus pedidos.');
  }

  if (/desempenho|performance|analise|como estou|evolucao atlet|indice/.test(t)) {
    if (!aluno) return 'Faça login na aba Aluno para ver sua análise de desempenho atlético.';
    var an = analisarDesempenhoAtletico(aluno);
    if (!an) return 'Não foi possível calcular o desempenho.';
    return 'Análise de desempenho atlético:\n\n' +
      '🏆 Índice: ' + an.score + '/100 — ' + an.nivel + '\n' +
      '✅ Aulas confirmadas: ' + an.aprovadas + ' (últimos 30 dias: ' + an.aprovadas30 + ')\n' +
      (an.mediaGeral !== null ? '📊 Média das avaliações: ' + an.mediaGeral.toFixed(1) + '\n' : '') +
      (an.pontoForte && an.pontoForte.media !== null ? '⭐ Ponto forte: ' + an.pontoForte.nome + ' (' + an.pontoForte.media.toFixed(1) + ')\n' : '') +
      (an.pontoFraco && an.pontoFraco.media !== null ? '🎯 Priorizar: ' + an.pontoFraco.nome + ' (' + an.pontoFraco.media.toFixed(1) + ')\n' : '') +
      '\nRecomendações:\n• ' + an.recomendacoes.join('\n• ') +
      '\n\nVeja o detalhe completo na aba Aluno.';
  }

  if (/graduacao|corda|nivel|minha corda/.test(t)) {
    if (!aluno) return 'Faça login na aba Aluno para eu consultar sua graduação.';
    return 'Sua graduação atual:\n\n🥋 ' + (aluno.graduacao || 'Não registrada') +
      '\n\nApenas a equipe pode alterar a corda. Em caso de dúvida, fale com o professor.';
  }

  if (/avaliacao|nota|media|desempenho/.test(t)) {
    return assistenteInfoAvaliacoes(aluno);
  }

  if (/certificado/.test(t)) {
    return assistenteInfoCertificados(aluno);
  }

  if (/aviso|avisos|comunicado|notificacao/.test(t)) {
    return assistenteInfoAvisos();
  }

  if (/polo|local|onde treina|endereco|maps/.test(t)) {
    return assistenteInfoPolos();
  }

  if (/ranking|presencas|quantas aulas/.test(t)) {
    return assistenteInfoPresencas(aluno);
  }

  if (/falar com (o )?professor|mensagem privada|msg professor|conversar com/.test(t)) {
    if (!aluno) return 'Faça login na aba Aluno. Lá tem o card "Falar com o Professor" para mensagem privada.';
    return 'Para falar com o professor:\n\n1. Abra a aba Aluno\n2. Use o card "Falar com o Professor"\n3. Digite e envie — só a equipe vê';
  }

  if (/pergunta da semana|responder pergunta/.test(t)) {
    var p = perguntaAtiva();
    if (!p) return 'Não há pergunta da semana ativa no momento.';
    return 'Pergunta da semana:\n\n' + p.pergunta + '\n\nResponda na aba Início ou no painel do Aluno.';
  }

  if (/feedback.*(aula|treino)|avaliar a aula/.test(t)) {
    return 'Após o check-in aprovado de hoje, no painel do Aluno aparece o card "Feedback da Aula".';
  }

  if (/instagram|rede social/.test(t)) {
    return 'Instagram da academia: ' + (CONFIG.instagram || '@capoeiranapequenaafrica') +
      '\n\nAbra pela aba Início → "Acessar Instagram Oficial".';
  }

  if (/mural|bate.?papo|mensagem/.test(t)) {
    return 'O Mural fica na aba Início.\nVocê pode publicar texto ou foto. As mensagens ficam visíveis para a academia.';
  }

  if (/cronometro|timer|roda/.test(t)) {
    return 'O cronômetro fica no topo do app (tempo da roda).\nToque no tempo para tela cheia. Use ▶ para iniciar e ↺ para zerar.';
  }

  if (/professor|equipe|adm|login equipe/.test(t)) {
    return 'Áreas da equipe (Professor / ADM / Dev):\n\n' +
      'Toque em Equipe nas abas superiores.\n' +
      'É necessário login da equipe.\n' +
      'Lá o professor aprova check-ins, cadastra polos/horários, avalia alunos e registra check-in manual se houver erro.';
  }

  if (/obrigado|valeu|thanks/.test(t)) {
    return 'Disponha! Qualquer dúvida sobre a academia ou o app, é só perguntar. Axé! 💚';
  }

  /* fallback inteligente com dados */
  var dicas = [];
  var aula = aulaDeHoje();
  if (aula) dicas.push('Hoje tem aula às ' + aula.horaInicio + '.');
  if (aluno) {
    var ck = obterCheckinDoDia(aluno);
    if (ck) dicas.push('Seu check-in de hoje está ' + ck.status + '.');
    else dicas.push('Você ainda não fez check-in hoje.');
  }
  return null;
}

function montarContextoAluno() {
  var aluno = alunoLogado();
  if (!aluno) return null;

  var avaliacoes = DB.listar('avaliacoes').filter(function (a) { return a.alunoId === aluno.id; })
    .slice().sort(function (a, b) { return String(b.data || '').localeCompare(String(a.data || '')); });
  var ultima = avaliacoes[0];

  var horariosTexto = DB.listar('horarios').map(function (h) {
    var polo = DB.buscar('polos', h.poloId);
    return (DIAS_SEMANA[Number(h.diaSemana)] || '') + (polo ? ' - ' + polo.nome : '') + ' (' + (h.horaInicio || '') + '-' + (h.horaFim || '') + ')';
  }).join('; ') || 'Nenhum horário fixo cadastrado.';

  var contexto = {
    nome: aluno.apelido || aluno.nome,
    graduacaoAtual: aluno.graduacao || 'não informada',
    horariosFixos: horariosTexto,
    ultimaAvaliacao: null
  };

  if (ultima) {
    contexto.ultimaAvaliacao = {
      data: ultima.data || '',
      media: mediaAvaliacao(ultima).toFixed(1)
    };
  }

  return contexto;
}

var historicoAssistenteIA = [];

function chamarAssistenteIA(texto, bolhaCarregando) {
  historicoAssistenteIA.push({ role: 'user', content: texto });

  fetch(CONFIG.iaProxyUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mensagens: historicoAssistenteIA.slice(-12),
      contexto: montarContextoAluno(),
      baseConhecimento: montarBaseConhecimentoComAvatar()
    })
  }).then(function (r) { return r.json(); })
    .then(function (data) {
      var resposta = data && data.resposta ? data.resposta : (data && data.erro ? ('Não consegui responder: ' + data.erro) : 'Não consegui responder agora.');
      historicoAssistenteIA.push({ role: 'assistant', content: resposta });
      if (bolhaCarregando) bolhaCarregando.textContent = resposta;
      else assistenteAdicionarBolha('bot', resposta);
    })
    .catch(function () {
      var msg = 'Não consegui falar com o assistente de IA agora. Tente de novo em instantes.';
      if (bolhaCarregando) bolhaCarregando.textContent = msg;
      else assistenteAdicionarBolha('bot', msg);
    });
}

/* ---------------------------------------------------------------
   14c. AVALIAÇÃO SEMANAL DA TURMA (via Assistente Virtual)
   --------------------------------------------------------------- */
var TEMAS_AVALIACAO_SEMANAL = {
  T1: { nome: 'Capoeira Angola', foco: 'Mestre Pastinha, jogo baixo, malícia, ritual, tradição' },
  T2: { nome: 'Capoeira Regional', foco: 'Mestre Bimba, jogo rápido, objetivo, esportivo' },
  T3: { nome: 'Capoeira Carioca e Maltas', foco: 'Luta de rua no Rio de Janeiro no século XIX, Nagoas, Guaiamús, repressão de 1890' },
  T4: { nome: 'Instrumentos e Toques de Berimbau', foco: 'Bateria de instrumentos, partes do berimbau, principais toques e seus significados' }
};

/* Banco fixo de perguntas revisado pelo professor — usado em vez de gerar por IA para T1/T2/T3 */
var BANCO_PERGUNTAS_SEMANAL = {
  T1: [
    { pergunta: 'Quem é o principal nome associado à Capoeira Angola moderna?', opcoes: ['Mestre Bimba', 'Mestre Pastinha', 'Mestre Sinhozinho', 'Mestre Zuma'], correta: 1, feedback: 'Mestre Pastinha (Vicente Ferreira Pastinha) fundou o Centro Esportivo de Capoeira Angola em 1941 e defendeu a preservação das tradições antigas. O estilo valoriza malícia, jogo baixo e ritual.' },
    { pergunta: 'A Capoeira Angola é caracterizada principalmente por:', opcoes: ['Movimentos rápidos e aéreos', 'Jogo mais lento, cadenciado e próximo ao chão', 'Uso obrigatório de armas', 'Ausência de música'], correta: 1, feedback: 'A Angola prioriza estratégia, malícia e movimentos próximos ao solo, mantendo forte ligação com as raízes afro-brasileiras.' },
    { pergunta: 'Qual instrumento é o principal na bateria de Capoeira Angola?', opcoes: ['Atabaque', 'Berimbau', 'Pandeiro', 'Agogô'], correta: 1, feedback: 'A bateria típica de Angola usa três berimbaus, dois pandeiros, atabaque, agogô e reco-reco. O berimbau comanda a roda.' },
    { pergunta: 'O que significa "malícia" na Capoeira Angola?', opcoes: ['Força física', 'Estratégia, enganação e esperteza no jogo', 'Velocidade dos golpes', 'Uniforme formal'], correta: 1, feedback: 'Malícia é a capacidade de enganar o adversário, usar fintas e ler o jogo. É um dos pilares da Angola.' },
    { pergunta: 'Em que cidade a Capoeira Angola se desenvolveu com mais força?', opcoes: ['Rio de Janeiro', 'Salvador (Bahia)', 'Recife', 'São Paulo'], correta: 1, feedback: 'Embora existisse em várias regiões, a Angola moderna se consolidou na Bahia, especialmente com Mestre Pastinha.' },
    { pergunta: 'A Capoeira Angola valoriza mais:', opcoes: ['Competição esportiva', 'Aspectos ritualísticos, culturais e lúdicos', 'Golpes letais', 'Ranking por cordas'], correta: 1, feedback: 'Diferente da Regional, a Angola enfatiza o jogo como expressão cultural e ritual, e não apenas como luta.' },
    { pergunta: 'Qual mestre é considerado grande discípulo e continuador de Pastinha?', opcoes: ['Mestre João Grande', 'Mestre Camisa', 'Mestre Bimba', 'Mestre Suassuna'], correta: 0, feedback: 'Mestre João Grande é um dos principais herdeiros da tradição de Pastinha e ajudou a difundir a Angola pelo mundo.' }
  ],
  T2: [
    { pergunta: 'Quem criou a Capoeira Regional?', opcoes: ['Mestre Pastinha', 'Mestre Bimba', 'Mestre João Pequeno', 'Mestre Canjiquinha'], correta: 1, feedback: 'Manoel dos Reis Machado (Mestre Bimba) criou a Regional na década de 1930, inicialmente chamada de Luta Regional Baiana.' },
    { pergunta: 'Qual era o objetivo principal de Mestre Bimba ao criar a Regional?', opcoes: ['Tornar a capoeira mais ritualística', 'Fortalecer o lado marcial e estruturar o ensino', 'Eliminar a música', 'Voltar às raízes africanas puras'], correta: 1, feedback: 'Bimba queria tirar a capoeira da marginalidade, criar método de ensino e torná-la eficiente como luta.' },
    { pergunta: 'A Capoeira Regional é conhecida por ser:', opcoes: ['Mais lenta e baixa', 'Mais rápida, alta e objetiva', 'Sem floreios', 'Apenas com armas'], correta: 1, feedback: 'A Regional tem ritmo mais acelerado, muitos movimentos aéreos e foco em ataque e contra-ataque.' },
    { pergunta: 'Em 1953, Mestre Bimba apresentou a Regional para qual presidente?', opcoes: ['Juscelino Kubitschek', 'Getúlio Vargas', 'Café Filho', 'João Goulart'], correta: 1, feedback: 'Vargas assistiu à demonstração e afirmou que a capoeira era "o único esporte verdadeiramente nacional".' },
    { pergunta: 'Qual elemento Mestre Bimba incorporou de outra luta?', opcoes: ['Capoeira Carioca', 'Batuque (luta de seu pai)', 'Jiu-jitsu japonês puro', 'Boxe inglês'], correta: 1, feedback: 'Bimba adicionou golpes do batuque e estruturou sequências de ensino, algo inédito na época.' },
    { pergunta: 'A Regional ajudou a:', opcoes: ['Manter a capoeira ilegal', 'Legalizar e popularizar a capoeira', 'Eliminar a roda', 'Acabar com a música'], correta: 1, feedback: 'Graças ao trabalho de Bimba, a capoeira deixou de ser crime e passou a ser reconhecida como prática cultural e esportiva.' },
    { pergunta: 'Qual característica visual é comum na Capoeira Regional?', opcoes: ['Roupas pretas e amarelas', 'Calças e camisas brancas com cordas coloridas', 'Terno e chapéu', 'Sem uniforme definido'], correta: 1, feedback: 'O uniforme branco com cordas (graduações) foi uma das inovações de Bimba para dar organização e respeito à prática.' }
  ],
  T3: [
    { pergunta: 'A Capoeira Carioca do século XIX era praticada principalmente em:', opcoes: ['Salvador', 'Rio de Janeiro', 'Recife', 'Minas Gerais'], correta: 1, feedback: 'Foi a versão de luta de rua violenta que se desenvolveu no Rio no século XIX.' },
    { pergunta: 'As maltas de capoeira eram:', opcoes: ['Toques de berimbau', 'Grupos organizados que controlavam territórios', 'Escolas oficiais', 'Instrumentos'], correta: 1, feedback: 'As maltas eram bandos de capoeiristas que dominavam bairros inteiros do Rio.' },
    { pergunta: 'Quais eram as duas maiores maltas rivais?', opcoes: ['Nagoas e Guaiamús', 'Angola e Regional', 'Pastinha e Bimba', 'Senzala e Abadá'], correta: 0, feedback: 'Os Nagoas (periferia, tradição africana) e os Guaiamús (centro, mais mestiços) eram as principais rivais.' },
    { pergunta: 'Os capoeiras das maltas usavam com frequência:', opcoes: ['Apenas o corpo', 'Navalha, faca e cacetes', 'Só berimbau', 'Uniforme oficial'], correta: 1, feedback: 'A Capoeira Carioca e as maltas eram conhecidas pelo uso de armas, especialmente a navalha.' },
    { pergunta: 'Em que ano a capoeira foi criminalizada em todo o Brasil?', opcoes: ['1888', '1890', '1932', '1941'], correta: 1, feedback: 'O Código Penal de 1890 criminalizou a "capoeiragem". Houve prisões em massa e deportações.' },
    { pergunta: 'Os Nagoas se diferenciavam visualmente dos Guaiamús pelo:', opcoes: ['Tipo de berimbau', 'Chapéu (cinta e posição das abas)', 'Cor da calça', 'Número de cordas'], correta: 1, feedback: 'Nagoas usavam chapéu com cinta branca sobre vermelho e abas para baixo; Guaiamús usavam o inverso.' },
    { pergunta: 'A Capoeira Carioca era mais:', opcoes: ['Ritualística e musical', 'Violenta e de combate de rua', 'Acadêmica', 'Esportiva moderna'], correta: 1, feedback: 'Era uma luta de rua que misturava chutes, cabeçadas, golpes de mão e armas.' },
    { pergunta: 'Após a repressão, a Capoeira Carioca:', opcoes: ['Desapareceu completamente', 'Continuou influenciando a prática no Rio, embora de forma mais discreta', 'Virou o estilo oficial do Brasil', 'Foi transformada em dança de salão'], correta: 1, feedback: 'Embora muito reprimida, elementos da tradição carioca sobreviveram e ainda influenciam grupos no Rio.' },
    { pergunta: 'Quem fundou, em 1916 no Rio de Janeiro, uma das primeiras academias especializadas em Capoeira, a Escola de Ginástica Nacional?', opcoes: ['Mestre Bimba e Mestre Pastinha', 'Raphael Lothus (Raphael Pereira da Silva) e Mário Aleixo', 'Mestre João Grande', 'Annibal Burlamaqui'], correta: 1, feedback: 'Raphael Pereira da Silva (1882–1917), conhecido como Raphael Lothus, e Mário Aleixo fundaram em 1916 a Escola de Ginástica Nacional perto da Avenida Central, mostrando que a Capoeira já era ensinada de forma organizada no Rio muito antes da Regional de Bimba.' }
  ],
  T4: [
    { pergunta: 'Quantos berimbaus compõem, tradicionalmente, uma bateria completa de capoeira?', opcoes: ['Um', 'Dois', 'Três', 'Cinco'], correta: 2, feedback: 'A bateria clássica usa três berimbaus, cada um com afinação e função diferentes: gunga (grave), médio e viola (agudo).' },
    { pergunta: 'Qual berimbau tem o som mais grave e costuma comandar a roda?', opcoes: ['Viola', 'Médio', 'Gunga (berra-boi)', 'Nenhum, todos tocam igual'], correta: 2, feedback: 'O gunga (também chamado berra-boi) é o berimbau mais grave e geralmente é tocado por quem lidera a roda.' },
    { pergunta: 'Como se chama a cabaça de resonância presa na base do berimbau?', opcoes: ['Baqueta', 'Cabaço', 'Dobrão', 'Caxixi'], correta: 1, feedback: 'O cabaço é a cabaça oca amarrada na base do arame, responsável pela ressonância do som.' },
    { pergunta: 'O objeto de metal ou pedra que o capoeirista encosta na corda do berimbau para alterar o tom se chama:', opcoes: ['Caxixi', 'Baqueta', 'Dobrão (ou pedra)', 'Vareta'], correta: 2, feedback: 'O dobrão (uma moeda ou pedra) é pressionado contra o arame para mudar a afinação do som durante o toque.' },
    { pergunta: 'O toque de berimbau usado para chamar um capoeirista mais experiente para jogar (geralmente sinalizando respeito ou pedido de substituição) é:', opcoes: ['São Bento Grande', 'Cavalaria', 'Iúna', 'Idalina'], correta: 2, feedback: 'O toque Iúna costuma estar associado a jogos mais lentos, rasteiros e de respeito, e em algumas tradições marca a chamada de um mestre.' },
    { pergunta: 'Qual toque de berimbau avisa tradicionalmente sobre a chegada da polícia, mandando os capoeiristas disfarçarem o jogo?', opcoes: ['São Bento Pequeno', 'Cavalaria', 'Santa Maria', 'Amazonas'], correta: 1, feedback: 'O toque Cavalaria tem origem histórica como aviso de que a polícia se aproximava, quando a capoeira era perseguida.' },
    { pergunta: 'Além dos berimbaus, quais outros instrumentos normalmente compõem a bateria de capoeira?', opcoes: ['Apenas atabaque', 'Pandeiro, atabaque, agogô e reco-reco', 'Violão e cavaquinho', 'Bateria de bumbo e caixa'], correta: 1, feedback: 'A bateria tradicional inclui berimbaus, pandeiros, atabaque, agogô e reco-reco, cada um com seu papel rítmico.' }
  ]
};

var assistenteEstadoProf = null; /* null | 'aguardando_tema' | 'gerando' | 'aguardando_aprovacao' */
var assistenteTemaPendente = null;
var assistenteQuizPendente = null;

function assistenteEhProfessor() {
  return !!(sessaoEquipe && ['professor', 'adm', 'dev'].indexOf(sessaoEquipe.papel) >= 0);
}

/* --- Assistente como gerente virtual: professor pede pra abrir/editar a ficha de um aluno --- */
function assistenteInterceptarGerenciarAluno(texto) {
  if (!assistenteEhProfessor()) return false;
  var t = normalizar(texto);

  var gatilho = /^(editar|gerenciar|abrir|mudar|alterar|corrigir)?\s*(a\s+)?(ficha|avaliacao|avaliação|prova|nota|notas)\s+(d[eoa]\s+|do\s+aluno\s+|da\s+aluna\s+)?(.{2,40})$/i.exec(texto.trim())
    || /^(editar|gerenciar|abrir)\s+(o\s+)?aluno\s+(.{2,40})$/i.exec(texto.trim());
  if (!gatilho) return false;

  var nomeBuscado = normalizar(gatilho[gatilho.length - 1]);
  if (!nomeBuscado || nomeBuscado.length < 2) return false;

  var alunos = DB.listar('alunos');
  var encontrados = alunos.filter(function (a) {
    return normalizar(a.nome).indexOf(nomeBuscado) >= 0 || normalizar(a.apelido || '').indexOf(nomeBuscado) >= 0;
  });

  if (encontrados.length === 0) {
    assistenteAdicionarBolha('bot', 'Não achei nenhum aluno chamado "' + gatilho[gatilho.length - 1].trim() + '". Confira o nome e tente de novo — ex: "avaliação da Maria".');
    return true;
  }
  if (encontrados.length > 1) {
    var nomes = encontrados.slice(0, 6).map(function (a) { return '• ' + a.nome + (a.apelido ? ' (' + a.apelido + ')' : ''); }).join('\n');
    assistenteAdicionarBolha('bot', 'Achei mais de um aluno com esse nome:\n\n' + nomes + '\n\nDigite o nome completo pra eu abrir a ficha certa.');
    return true;
  }

  var aluno = encontrados[0];
  var avals = avaliacoesDoAluno(aluno.id);
  var ultima = avals.length ? avals[avals.length - 1] : null;
  var pendencias = DB.listar('solicitacoes').filter(function (s) { return s.alunoId === aluno.id && s.status === 'pendente'; }).length;

  var resumo = '👤 ' + aluno.nome + (aluno.apelido ? ' (' + aluno.apelido + ')' : '') + '\n' +
    'Graduação: ' + (aluno.graduacao || '—') + '\n' +
    'Avaliações registradas: ' + avals.length + (ultima ? ' (última: ' + mediaAvaliacao(ultima).toFixed(1) + ', semana ' + (ultima.semana || '-') + ')' : '') + '\n' +
    (pendencias ? '⚠️ ' + pendencias + ' solicitação(ões) pendente(s) dele\n' : '') +
    '\nAbri a ficha dele na aba Professor, no card "Avaliação Semanal por Item" — já pode lançar ou corrigir a nota.';

  abrirAba('tab4');
  setTimeout(function () {
    var sel = $('avalAluno');
    if (sel) { sel.value = aluno.id; }
    if (typeof carregarDesenvolvimentoAluno === 'function') carregarDesenvolvimentoAluno();
    var card = $('cardAvaliacaoSemanalProfessor');
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 150);

  assistenteAdicionarBolha('bot', resumo);
  return true;
}


function proximoDomingo2359ISO() {
  var d = new Date();
  var dias = (7 - d.getDay()) % 7;
  var alvo = new Date(d.getFullYear(), d.getMonth(), d.getDate() + dias, 23, 59, 0);
  return alvo.toISOString();
}

function testeSemanalDaTurmaAtual() {
  var semana = semanaAtualISO();
  return DB.listar('avaliacoesSemanaisTurma').filter(function (t) { return t.semana === semana; })
    .sort(function (a, b) { return String(b.criadoEm || '').localeCompare(String(a.criadoEm || '')); })[0] || null;
}

function renderAvisoAvaliacaoObrigatoria() {
  var box = $('cardAvisoAvaliacaoObrigatoria');
  var texto = $('textoAvisoAvaliacaoObrigatoria');
  if (!box || !texto) return;
  var aluno = alunoLogado();
  var teste = testeSemanalDaTurmaAtual();
  if (!aluno || !teste) { box.style.display = 'none'; return; }
  var prazoPassou = teste.prazo && new Date(teste.prazo).getTime() < Date.now();
  if (prazoPassou) { box.style.display = 'none'; return; }
  var jaRespondeu = DB.listar('notasAvaliacoesSemanais').some(function (n) { return n.testeId === teste.id && n.alunoId === aluno.id; });
  if (jaRespondeu) { box.style.display = 'none'; return; }
  texto.textContent = 'Você ainda não fez a avaliação desta semana (' + teste.temaNome + '). É obrigatória e o prazo termina domingo. Vá na aba Aluno para responder.';
  box.style.display = 'block';
}

function assistenteInterceptarAvaliacaoSemanal(texto) {
  var t = normalizar(texto);

  if (/avaliacao semanal|teste semanal|prova semanal/.test(t) && assistenteEstadoProf === null) {
    if (assistenteEhProfessor()) {
      assistenteEstadoProf = 'aguardando_tema';
      assistenteAdicionarBolha('bot',
        'Escolha o tema da avaliação semanal da turma:\n\n' +
        'T1 → Capoeira Angola\n' +
        'T2 → Capoeira Regional\n' +
        'T3 → Capoeira Carioca e Maltas\n' +
        'T4 → Instrumentos e Toques de Berimbau\n\n' +
        'Digite T1, T2, T3 ou T4.');
      return true;
    }
    var testeAtivo = testeSemanalDaTurmaAtual();
    if (!testeAtivo) {
      assistenteAdicionarBolha('bot', 'Ainda não há avaliação semanal publicada pelo professor para esta semana.');
    } else {
      assistenteAdicionarBolha('bot', 'A avaliação semanal (' + testeAtivo.temaNome + ') já foi publicada. Abra a aba Aluno, no card "Teste de Conhecimentos Gerais", para responder até domingo.');
    }
    return true;
  }

  if (assistenteEstadoProf === 'aguardando_tema' && assistenteEhProfessor()) {
    if (/cancelar/.test(t)) { assistenteEstadoProf = null; assistenteAdicionarBolha('bot', 'Ok, cancelado.'); return true; }
    var codigo = /\bt1\b/.test(t) ? 'T1' : /\bt2\b/.test(t) ? 'T2' : /\bt3\b/.test(t) ? 'T3' : /\bt4\b/.test(t) ? 'T4' : null;
    if (!codigo) {
      assistenteAdicionarBolha('bot', 'Não entendi. Digite T1, T2, T3 ou T4 (ou "cancelar" para sair).');
      return true;
    }
    assistenteTemaPendente = codigo;
    assistenteEstadoProf = 'gerando';
    assistenteAdicionarBolha('bot', '🧠 Gerando o teste sobre ' + TEMAS_AVALIACAO_SEMANAL[codigo].nome + '...');
    gerarTesteSemanalTurma(codigo);
    return true;
  }

  if (assistenteEstadoProf === 'aguardando_aprovacao' && assistenteEhProfessor()) {
    if (/aprovar|publicar|confirmar/.test(t)) { publicarTesteSemanalTurma(); return true; }
    if (/gerar outro|refazer|regenerar|de novo/.test(t)) {
      if (BANCO_PERGUNTAS_SEMANAL[assistenteTemaPendente]) {
        assistenteAdicionarBolha('bot', 'Esse tema já usa o banco de perguntas revisado — não há uma segunda versão pronta. Digite "aprovar" para publicar ou "cancelar".');
        return true;
      }
      assistenteEstadoProf = 'gerando';
      assistenteAdicionarBolha('bot', '🧠 Gerando outro teste sobre ' + TEMAS_AVALIACAO_SEMANAL[assistenteTemaPendente].nome + '...');
      gerarTesteSemanalTurma(assistenteTemaPendente);
      return true;
    }
    if (/cancelar/.test(t)) {
      assistenteEstadoProf = null; assistenteTemaPendente = null; assistenteQuizPendente = null;
      assistenteAdicionarBolha('bot', 'Ok, cancelado. Nada foi publicado.');
      return true;
    }
    assistenteAdicionarBolha('bot', 'Digite "aprovar" para publicar, "gerar outro" para refazer, ou "cancelar".');
    return true;
  }

  return false;
}

function gerarTesteSemanalTurma(codigo) {
  var tema = TEMAS_AVALIACAO_SEMANAL[codigo];
  var banco = BANCO_PERGUNTAS_SEMANAL[codigo];

  if (banco) {
    assistenteQuizPendente = banco;
    assistenteEstadoProf = 'aguardando_aprovacao';
    var previewBanco = banco.map(function (p, i) {
      var letras = ['a', 'b', 'c', 'd'];
      return (i + 1) + '. ' + p.pergunta + '\n' +
        p.opcoes.map(function (op, j) { return '   ' + letras[j] + ') ' + op; }).join('\n');
    }).join('\n\n');
    assistenteAdicionarBolha('bot',
      'Teste pronto — ' + tema.nome + ' (' + banco.length + ' perguntas):\n\n' + previewBanco +
      '\n\nDigite "aprovar" para publicar aos alunos (prazo até domingo), ou "cancelar".');
    return;
  }

  if (!CONFIG.iaProxyUrl) {
    assistenteEstadoProf = null;
    assistenteAdicionarBolha('bot', 'O Assistente de IA ainda não foi configurado (ADM > Configurações). Não consigo gerar o teste.');
    return;
  }
  fetch(CONFIG.iaProxyUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      gerarQuiz: true,
      gerarQuizTema: true,
      tema: codigo,
      temaNome: tema.nome,
      temaFoco: tema.foco,
      baseConhecimento: montarBaseConhecimentoComAvatar()
    })
  }).then(function (r) { return r.json(); })
    .then(function (data) {
      if (!data || !data.perguntas || !data.perguntas.length) {
        assistenteEstadoProf = null;
        assistenteAdicionarBolha('bot', 'Não consegui gerar o teste agora. Digite "avaliação semanal" para tentar de novo.');
        return;
      }
      assistenteQuizPendente = data.perguntas;
      assistenteEstadoProf = 'aguardando_aprovacao';
      var preview = data.perguntas.map(function (p, i) {
        var letras = ['a', 'b', 'c', 'd'];
        return (i + 1) + '. ' + p.pergunta + '\n' +
          (p.opcoes || []).map(function (op, j) { return '   ' + letras[j] + ') ' + op; }).join('\n');
      }).join('\n\n');
      assistenteAdicionarBolha('bot',
        'Teste gerado — ' + tema.nome + ' (' + data.perguntas.length + ' perguntas):\n\n' + preview +
        '\n\nDigite "aprovar" para publicar aos alunos (prazo até domingo), "gerar outro" para refazer, ou "cancelar".');
    })
    .catch(function () {
      assistenteEstadoProf = null;
      assistenteAdicionarBolha('bot', 'Erro ao gerar o teste. Digite "avaliação semanal" para tentar de novo.');
    });
}

function publicarTesteSemanalTurma() {
  if (!assistenteQuizPendente || !assistenteTemaPendente) {
    assistenteEstadoProf = null;
    assistenteAdicionarBolha('bot', 'Não há teste pendente para aprovar.');
    return;
  }
  var tema = TEMAS_AVALIACAO_SEMANAL[assistenteTemaPendente];
  var semana = semanaAtualISO();
  var dados = {
    tema: assistenteTemaPendente,
    temaNome: tema.nome,
    perguntas: assistenteQuizPendente,
    semana: semana,
    prazo: proximoDomingo2359ISO(),
    status: 'publicado',
    aprovadoPor: sessaoEquipe ? sessaoEquipe.nome : 'Professor',
    criadoEm: agoraISO()
  };
  var existente = testeSemanalDaTurmaAtual();
  DB.salvar('avaliacoesSemanaisTurma', dados, existente ? existente.id : null).then(function () {
    assistenteAdicionarBolha('bot', '✅ Avaliação semanal publicada — ' + tema.nome + ' (' + assistenteQuizPendente.length + ' perguntas). Os alunos já podem responder na aba Aluno, até domingo.');
    assistenteEstadoProf = null;
    assistenteTemaPendente = null;
    assistenteQuizPendente = null;
    try { registroLog('avaliacao_semanal', 'Publicada: ' + tema.nome + ' (' + semana + ')'); } catch (e) {}
  });
}

function assistenteInfoProximaAula() {
  var aula = aulaDeHoje();
  if (aula) {
    var polo = DB.buscar('polos', aula.poloId);
    return 'Aula de hoje (' + DIAS_SEMANA[new Date().getDay()] + '):\n\n' +
      '🕐 ' + aula.horaInicio + ' – ' + aula.horaFim + '\n' +
      '📋 ' + (aula.modalidade || 'Treino') + '\n' +
      (polo ? ('📍 ' + polo.nome + (polo.endereco ? ' — ' + polo.endereco : '')) : '') +
      '\n\nFaça o check-in na aba Check-in ao chegar.';
  }
  var horarios = DB.listar('horarios').slice().sort(function (a, b) { return Number(a.diaSemana) - Number(b.diaSemana); });
  if (!horarios.length) return 'Nenhum horário cadastrado ainda. Peça ao professor para cadastrar na área Equipe.';
  var hoje = new Date().getDay();
  var prox = null;
  for (var i = 0; i < 7; i++) {
    var dia = (hoje + i) % 7;
    var lista = horarios.filter(function (h) { return Number(h.diaSemana) === dia; });
    if (lista.length) { prox = lista[0]; break; }
  }
  if (!prox) return 'Não encontrei a próxima aula.';
  var polo2 = DB.buscar('polos', prox.poloId);
  return 'Não há aula cadastrada para hoje.\n\nPróximo horário:\n' +
    DIAS_SEMANA[Number(prox.diaSemana)] + ' • ' + prox.horaInicio + ' – ' + prox.horaFim +
    (polo2 ? '\n📍 ' + polo2.nome : '');
}

function assistenteInfoHorarios() {
  var horarios = DB.listar('horarios').slice().sort(function (a, b) { return Number(a.diaSemana) - Number(b.diaSemana); });
  if (!horarios.length) return 'Nenhum horário fixo cadastrado. O professor pode cadastrar em Equipe → Professor.';
  var linhas = horarios.map(function (h) {
    var polo = DB.buscar('polos', h.poloId);
    return '• ' + DIAS_SEMANA[Number(h.diaSemana)] + ' ' + h.horaInicio + '–' + h.horaFim +
      ' (' + (h.modalidade || 'Treino') + ')' + (polo ? ' @ ' + polo.nome : '');
  });
  return 'Horário fixo da semana:\n\n' + linhas.join('\n');
}

function assistenteInfoCheckin(aluno) {
  var nome = aluno ? aluno.nome : nomeCheckinAtual();
  if (!nome && !aluno) return 'Informe seu nome na aba Check-in ou faça login na aba Aluno para eu consultar seu check-in.';
  var ck = obterCheckinDoDia(aluno || nome);
  if (!ck) return 'Você ainda não tem check-in registrado para hoje.\n\nVá em Check-in → escolha o polo → Confirmar Presença Local.\nSó é permitido 1 por aula/dia.';
  return 'Check-in de hoje:\n\n' +
    '📅 ' + dataBR(ck.data) + ' às ' + (ck.hora || '-') + '\n' +
    '📍 ' + (ck.poloNome || ck.tipo || '-') + '\n' +
    '📌 Status: ' + String(ck.status).toUpperCase() +
    (ck.observacaoProfessor ? '\n💬 Prof.: ' + ck.observacaoProfessor : '') +
    (ck.status === 'pendente' ? '\n\nAguarde a aprovação do professor.' : '') +
    (ck.status === 'aprovado' ? '\n\nPresença confirmada! Bom treino 💚' : '');
}

function assistenteInfoPedidos(aluno) {
  var lista = DB.listar('solicitacoes').filter(function (s) {
    return s.alunoId === aluno.id || normalizar(s.alunoNome) === normalizar(aluno.nome);
  }).sort(function (a, b) { return String(b.criadoEm || '').localeCompare(String(a.criadoEm || '')); }).slice(0, 3);
  if (!lista.length) return 'Você ainda não tem pedidos de treino.';
  return 'Seus pedidos recentes:\n' + lista.map(function (s) {
    return '• ' + s.tipo + ' — ' + String(s.status).toUpperCase() +
      (s.respostaProfessor ? ' (Prof.: ' + s.respostaProfessor + ')' : '');
  }).join('\n');
}

function assistenteInfoAvaliacoes(aluno) {
  if (!aluno) return 'Faça login na aba Aluno para ver suas avaliações.';
  var avals = DB.listar('avaliacoes').filter(function (a) {
    return a.alunoId === aluno.id || normalizar(a.alunoNome) === normalizar(aluno.nome);
  }).sort(function (a, b) { return String(b.data || '').localeCompare(String(a.data || '')); });
  if (!avals.length) return 'Nenhuma avaliação lançada ainda para você.';
  var ultima = avals[0];
  var media = mediaAvaliacao(ultima).toFixed(1);
  return 'Última avaliação (' + (ultima.data || '-') + '):\n\n' +
    'Média: ' + media + '\n' +
    'Técnica ' + (ultima.tecnica || '-') + ' • Disciplina ' + (ultima.disciplina || '-') +
    ' • Ritmo ' + (ultima.ritmo || '-') + ' • Musicalidade ' + (ultima.musicalidade || '-') +
    ' • Compromisso ' + (ultima.compromisso || '-') +
    (ultima.observacao ? '\n\nObs.: ' + ultima.observacao : '');
}

function assistenteInfoCertificados(aluno) {
  if (!aluno) return 'Faça login na aba Aluno para ver certificados.';
  var certs = certificadosDoAluno(aluno);
  if (!certs.length) return 'Você ainda não tem certificados emitidos.';
  return 'Seus certificados:\n' + certs.slice(0, 5).map(function (c) {
    return '• ' + (c.evento || 'Apresentação') + ' — ' + dataBR(c.data) + ' (cód. ' + (c.codigo || '-') + ')';
  }).join('\n') + '\n\nAbra na aba Aluno ou Início para baixar/imprimir.';
}

function assistenteInfoAvisos() {
  var avisos = DB.listar('avisos').slice().sort(function (a, b) {
    return String(b.criadoEm || '').localeCompare(String(a.criadoEm || ''));
  }).slice(0, 3);
  if (!avisos.length) return 'Nenhum aviso publicado no momento.';
  return 'Últimos avisos:\n\n' + avisos.map(function (a) {
    return '📢 ' + (a.titulo || 'Aviso') + '\n' + (a.texto || '') +
      (a.poloNome ? '\n📍 ' + a.poloNome : '') +
      '\n—' + (a.autor || 'Professor') + ' • ' + dataHoraBR(a.criadoEm);
  }).join('\n\n');
}

function assistenteInfoPolos() {
  var polos = DB.listar('polos');
  if (!polos.length) return 'Nenhum polo cadastrado ainda.';
  return 'Locais de treino:\n\n' + polos.map(function (p) {
    return '📍 ' + p.nome + (p.endereco ? '\n   ' + p.endereco : '') + (p.gmaps ? '\n   Maps disponível no app' : '');
  }).join('\n\n');
}

function assistenteInfoPresencas(aluno) {
  if (!aluno) return 'Faça login na aba Aluno para ver suas presenças.';
  var lista = DB.listar('presencas').filter(function (p) {
    return p.alunoId === aluno.id || normalizar(p.alunoNome) === normalizar(aluno.nome);
  });
  var ok = lista.filter(function (p) { return p.status === 'aprovado'; }).length;
  var pend = lista.filter(function (p) { return p.status === 'pendente'; }).length;
  return 'Suas presenças:\n\n✅ Aprovadas: ' + ok + '\n⏳ Pendentes: ' + pend + '\n📋 Total registradas: ' + lista.length +
    '\n\nVeja o detalhe na aba Aluno ou em Check-in → Minhas Aulas e Check-ins.';
}


/* ---------------------------------------------------------------
   14c. INTERAÇÃO ALUNO ↔ PROFESSOR
   Coleções novas: mensagensPrivadas, feedbacksAula, perguntasSemana,
   respostasPergunta, leiturasAvisos.
   Campos aditivos em existentes: avaliacoes.comentarioAluno,
   solicitacoes.conversa (array).
   --------------------------------------------------------------- */

function contarNaoLidosAluno(aluno) {
  if (!aluno) return 0;
  var n = 0;
  DB.listar('mensagensPrivadas').forEach(function (m) {
    if (m.alunoId === aluno.id && m.de === 'professor' && !m.lidaPeloAluno) n++;
  });
  DB.listar('solicitacoes').forEach(function (s) {
    if ((s.alunoId === aluno.id || normalizar(s.alunoNome) === normalizar(aluno.nome)) && s.respostaProfessor && !s.respostaVistaAluno) n++;
    (s.conversa || []).forEach(function (c) {
      if (c.de === 'professor' && !c.lidaPeloAluno) n++;
    });
  });
  DB.listar('avaliacoes').forEach(function (a) {
    if ((a.alunoId === aluno.id || normalizar(a.alunoNome) === normalizar(aluno.nome)) && a.observacao && !a.comentarioAluno && !a.vistaPeloAluno) n++;
  });
  return n;
}

function contarNaoLidosProfessor() {
  var n = 0;
  DB.listar('mensagensPrivadas').forEach(function (m) {
    if (m.de === 'aluno' && !m.lidaPeloProfessor) n++;
  });
  DB.listar('solicitacoes').forEach(function (s) {
    if (s.status === 'pendente') n++;
    (s.conversa || []).forEach(function (c) {
      if (c.de === 'aluno' && !c.lidaPeloProfessor) n++;
    });
  });
  DB.listar('feedbacksAula').forEach(function (f) {
    if (!f.vistoProfessor) n++;
  });
  DB.listar('respostasPergunta').forEach(function (r) {
    if (!r.vistoProfessor) n++;
  });
  return n;
}

function atualizarBadgesInteracao() {
  var aluno = alunoLogado();
  var nAluno = contarNaoLidosAluno(aluno);
  var elTab = document.querySelector('.tabs button[onclick*="tab3"]');
  if (elTab) {
    var base = '<i class="fas fa-user-graduate"></i>Aluno';
    elTab.innerHTML = nAluno > 0 ? (base + '<span class="badge-notif">' + nAluno + '</span>') : base;
  }
  var nProf = contarNaoLidosProfessor();
  var elEq = $('btnToggleEquipe');
  if (elEq && sessaoEquipe) {
    var baseEq = '<i class="fas fa-users-cog"></i>Equipe';
    elEq.innerHTML = nProf > 0 ? (baseEq + '<span class="badge-notif">' + nProf + '</span>') : baseEq;
  }
}

/* ---------- 1. Mensagens privadas ---------- */
function mensagensDoAluno(alunoId) {
  return DB.listar('mensagensPrivadas').filter(function (m) { return m.alunoId === alunoId; })
    .sort(function (a, b) { return String(a.criadoEm || '').localeCompare(String(b.criadoEm || '')); });
}

function htmlThreadMensagens(alunoId, paraProfessor) {
  var lista = mensagensDoAluno(alunoId);
  if (!lista.length) return '<p class="sem-dados">Nenhuma mensagem ainda. Envie a primeira!</p>';
  return lista.map(function (m) {
    var lado = m.de === 'aluno' ? 'aluno' : 'professor';
    var ehAdvertencia = m.tipo === 'advertencia';
    var estiloExtra = ehAdvertencia ? ' style="border:2px solid var(--danger); background:rgba(239,83,80,0.12);"' : '';
    var prefixo = ehAdvertencia ? '<div style="color:var(--danger); font-weight:800; font-size:0.68rem; margin-bottom:3px;"><i class="fas fa-triangle-exclamation"></i> ADVERTÊNCIA</div>' : '';
    return '<div class="msg-priv-bolha ' + lado + '"' + estiloExtra + '>' + prefixo + esc(m.texto) +
      '<div class="msg-priv-meta">' + (m.de === 'aluno' ? (m.alunoNome || 'Aluno') : (m.professorNome || 'Professor')) +
      ' • ' + dataHoraBR(m.criadoEm) + '</div></div>';
  }).join('');
}

function enviarMensagemPrivadaAluno(btn) {
  var aluno = alunoLogado();
  if (!aluno) { mostrarToast('Faça login para enviar mensagem.', 'erro'); return; }
  var texto = ($('msgPrivAlunoTexto') && $('msgPrivAlunoTexto').value || '').trim();
  if (!texto) { mostrarToast('Escreva a mensagem.', 'erro'); return; }
  if (btn) { btn.classList.add('carregando'); btn.innerHTML = '<span class="spinner-btn"></span>'; }
  DB.salvar('mensagensPrivadas', {
    alunoId: aluno.id,
    alunoNome: aluno.nome,
    alunoApelido: aluno.apelido || '',
    texto: texto.slice(0, 800),
    de: 'aluno',
    professorNome: '',
    lidaPeloAluno: true,
    lidaPeloProfessor: false,
    criadoEm: agoraISO()
  }).then(function () {
    if (btn) { btn.classList.remove('carregando'); btn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar'; }
    if ($('msgPrivAlunoTexto')) $('msgPrivAlunoTexto').value = '';
    mostrarToast('Mensagem enviada ao professor!');
    registroLog('aluno', 'Mensagem privada de ' + aluno.nome);
    renderAluno();
    atualizarBadgesInteracao();
  }).catch(function () {
    if (btn) { btn.classList.remove('carregando'); btn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar'; }
  });
}

function enviarMensagemPrivadaProfessor(alunoId, btn) {
  var aluno = DB.buscar('alunos', alunoId);
  if (!aluno) { mostrarToast('Aluno não encontrado.', 'erro'); return; }
  var campo = $('msgPrivProfTexto_' + alunoId);
  var texto = (campo && campo.value || '').trim();
  if (!texto) { mostrarToast('Escreva a resposta.', 'erro'); return; }
  if (btn) { btn.classList.add('carregando'); btn.innerHTML = '<span class="spinner-btn"></span>'; }
  DB.salvar('mensagensPrivadas', {
    alunoId: aluno.id,
    alunoNome: aluno.nome,
    alunoApelido: aluno.apelido || '',
    texto: texto.slice(0, 800),
    de: 'professor',
    professorNome: sessaoEquipe ? sessaoEquipe.nome : 'Professor',
    lidaPeloAluno: false,
    lidaPeloProfessor: true,
    criadoEm: agoraISO()
  }).then(function () {
    if (btn) { btn.classList.remove('carregando'); btn.innerHTML = '<i class="fas fa-paper-plane"></i> Responder'; }
    if (campo) campo.value = '';
    mostrarToast('Resposta enviada a ' + aluno.nome);
    notificar('Mensagem do professor', texto.slice(0, 80));
    registroLog('professor', 'Mensagem privada para ' + aluno.nome);
    renderAbaProfessor();
    atualizarBadgesInteracao();
  }).catch(function () {
    if (btn) { btn.classList.remove('carregando'); btn.innerHTML = '<i class="fas fa-paper-plane"></i> Responder'; }
  });
}

function marcarMensagensLidasAluno(alunoId) {
  mensagensDoAluno(alunoId).forEach(function (m) {
    if (m.de === 'professor' && !m.lidaPeloAluno) {
      DB.salvar('mensagensPrivadas', { lidaPeloAluno: true }, m.id);
    }
  });
}

function marcarMensagensLidasProfessor(alunoId) {
  mensagensDoAluno(alunoId).forEach(function (m) {
    if (m.de === 'aluno' && !m.lidaPeloProfessor) {
      DB.salvar('mensagensPrivadas', { lidaPeloProfessor: true }, m.id);
    }
  });
}

/* ---------- 2. Comentário do aluno na avaliação ---------- */
function salvarComentarioAvaliacao(avalId, btn) {
  var aluno = alunoLogado();
  if (!aluno) return;
  var campo = $('comentarioAval_' + avalId);
  var texto = (campo && campo.value || '').trim();
  if (!texto) { mostrarToast('Escreva um comentário.', 'erro'); return; }
  if (btn) { btn.classList.add('carregando'); }
  DB.salvar('avaliacoes', {
    comentarioAluno: texto.slice(0, 500),
    comentarioAlunoEm: agoraISO(),
    vistaPeloAluno: true
  }, avalId).then(function () {
    if (btn) { btn.classList.remove('carregando'); }
    mostrarToast('Comentário enviado ao professor!');
    registroLog('aluno', 'Comentário em avaliação por ' + aluno.nome);
    renderAluno();
  });
}

function marcarAvaliacaoVista(avalId) {
  DB.salvar('avaliacoes', { vistaPeloAluno: true }, avalId);
}

/* ---------- 3. Feedback pós-aula ---------- */
function enviarFeedbackAula(rating, btn) {
  var aluno = alunoLogado();
  if (!aluno) { mostrarToast('Faça login para enviar feedback.', 'erro'); return; }
  var ck = obterCheckinDoDia(aluno);
  if (!ck || ck.status !== 'aprovado') {
    mostrarToast('Só é possível avaliar aulas com check-in aprovado hoje.', 'erro');
    return;
  }
  var ja = DB.listar('feedbacksAula').some(function (f) {
    return f.alunoId === aluno.id && f.data === dataLocalISO();
  });
  if (ja) { mostrarToast('Você já enviou feedback de hoje.', 'erro'); return; }
  var texto = ($('feedbackAulaTexto') && $('feedbackAulaTexto').value || '').trim();
  if (btn) { btn.classList.add('carregando'); }
  DB.salvar('feedbacksAula', {
    alunoId: aluno.id,
    alunoNome: aluno.nome,
    alunoApelido: aluno.apelido || '',
    data: dataLocalISO(),
    presencaId: ck.id || '',
    rating: rating,
    texto: texto.slice(0, 400),
    vistoProfessor: false,
    criadoEm: agoraISO()
  }).then(function () {
    if (btn) { btn.classList.remove('carregando'); }
    mostrarToast('Obrigado pelo feedback! 💚');
    registroLog('aluno', 'Feedback pós-aula: ' + rating + ' por ' + aluno.nome);
    renderAluno();
    atualizarBadgesInteracao();
  });
}

function marcarFeedbacksVistos() {
  DB.listar('feedbacksAula').forEach(function (f) {
    if (!f.vistoProfessor) DB.salvar('feedbacksAula', { vistoProfessor: true }, f.id);
  });
}

/* ---------- 4. Badge já coberto por atualizarBadgesInteracao ---------- */

/* ---------- 5. Pergunta da semana ---------- */
function perguntaAtiva() {
  var lista = DB.listar('perguntasSemana').filter(function (p) { return p.ativa !== false; })
    .sort(function (a, b) { return String(b.criadoEm || '').localeCompare(String(a.criadoEm || '')); });
  return lista.length ? lista[0] : null;
}

function publicarPerguntaSemana(btn) {
  var texto = ($('perguntaSemanaTexto') && $('perguntaSemanaTexto').value || '').trim();
  if (!texto) { mostrarToast('Escreva a pergunta.', 'erro'); return; }
  if (btn) { btn.classList.add('carregando'); }
  /* desativa anteriores */
  var tarefas = DB.listar('perguntasSemana').filter(function (p) { return p.ativa !== false; })
    .map(function (p) { return DB.salvar('perguntasSemana', { ativa: false }, p.id); });
  Promise.all(tarefas).then(function () {
    return DB.salvar('perguntasSemana', {
      pergunta: texto.slice(0, 400),
      ativa: true,
      autor: sessaoEquipe ? sessaoEquipe.nome : 'Professor',
      criadoEm: agoraISO()
    });
  }).then(function () {
    if (btn) { btn.classList.remove('carregando'); btn.innerHTML = '<i class="fas fa-paper-plane"></i> Publicar pergunta'; }
    if ($('perguntaSemanaTexto')) $('perguntaSemanaTexto').value = '';
    mostrarToast('Pergunta da semana publicada!');
    notificar('Pergunta do professor', texto.slice(0, 80));
    registroLog('professor', 'Pergunta da semana publicada');
    renderAbaProfessor();
  });
}

function responderPerguntaSemana(btn) {
  var aluno = alunoLogado();
  if (!aluno) { mostrarToast('Faça login para responder.', 'erro'); return; }
  var p = perguntaAtiva();
  if (!p) { mostrarToast('Nenhuma pergunta ativa no momento.', 'erro'); return; }
  var campoResposta = btn && btn.previousElementSibling;
  var texto = ((campoResposta && campoResposta.value) || ($('respostaPerguntaTexto') && $('respostaPerguntaTexto').value) || '').trim();
  if (!texto) { mostrarToast('Escreva sua resposta.', 'erro'); return; }
  var ja = DB.listar('respostasPergunta').some(function (r) {
    return r.perguntaId === p.id && r.alunoId === aluno.id;
  });
  if (ja) { mostrarToast('Você já respondeu esta pergunta.', 'erro'); return; }
  if (btn) { btn.classList.add('carregando'); }
  DB.salvar('respostasPergunta', {
    perguntaId: p.id,
    perguntaTexto: p.pergunta,
    alunoId: aluno.id,
    alunoNome: aluno.nome,
    alunoApelido: aluno.apelido || '',
    texto: texto.slice(0, 500),
    vistoProfessor: false,
    criadoEm: agoraISO()
  }).then(function () {
    if (btn) { btn.classList.remove('carregando'); btn.innerHTML = '<i class="fas fa-check"></i> Enviar resposta'; }
    if ($('respostaPerguntaTexto')) $('respostaPerguntaTexto').value = '';
    mostrarToast('Resposta enviada!');
    registroLog('aluno', 'Resposta à pergunta da semana por ' + aluno.nome);
    renderAluno();
    renderInicio();
    atualizarBadgesInteracao();
  });
}

function marcarRespostasPerguntaVistas() {
  DB.listar('respostasPergunta').forEach(function (r) {
    if (!r.vistoProfessor) DB.salvar('respostasPergunta', { vistoProfessor: true }, r.id);
  });
}

/* ---------- 6. Thread no pedido de treino ---------- */
function enviarMsgSolicitacao(solicId, de, btn) {
  var s = DB.buscar('solicitacoes', solicId);
  if (!s) return;
  var campoId = de === 'aluno' ? ('convAluno_' + solicId) : ('convProf_' + solicId);
  var campo = $(campoId);
  var texto = (campo && campo.value || '').trim();
  if (!texto) { mostrarToast('Escreva a mensagem.', 'erro'); return; }
  var conversa = (s.conversa || []).slice();
  conversa.push({
    de: de,
    texto: texto.slice(0, 400),
    em: agoraISO(),
    lidaPeloAluno: de === 'aluno',
    lidaPeloProfessor: de === 'professor',
    autor: de === 'aluno' ? (s.alunoNome || 'Aluno') : (sessaoEquipe ? sessaoEquipe.nome : 'Professor')
  });
  if (btn) { btn.classList.add('carregando'); }
  DB.salvar('solicitacoes', { conversa: conversa }, solicId).then(function () {
    if (btn) { btn.classList.remove('carregando'); }
    if (campo) campo.value = '';
    mostrarToast('Mensagem enviada na conversa do pedido.');
    if (de === 'professor') notificar('Resposta no pedido de treino', texto.slice(0, 60));
    if (de === 'aluno') renderAluno();
    else renderAbaProfessor();
    atualizarBadgesInteracao();
  });
}

function htmlConversaSolicitacao(s, modo) {
  var conv = s.conversa || [];
  var html = '';
  if (conv.length) {
    html += '<div class="conversa-thread">';
    conv.forEach(function (c) {
      html += '<div class="mini" style="margin:3px 0;"><b style="color:' + (c.de === 'aluno' ? 'var(--primary-green)' : 'var(--accent-blue)') + ';">' +
        esc(c.autor || c.de) + ':</b> ' + esc(c.texto) +
        ' <span style="opacity:0.6;">' + dataHoraBR(c.em) + '</span></div>';
    });
    html += '</div>';
  }
  if (modo === 'aluno') {
    html += '<div style="display:flex;gap:4px;margin-top:4px;">' +
      '<input id="convAluno_' + s.id + '" placeholder="Continuar conversa..." style="flex:1;margin:0;">' +
      '<button class="btn btn-secondary btn-mini" style="margin:0;" onclick="enviarMsgSolicitacao(\'' + s.id + '\',\'aluno\',this)"><i class="fas fa-paper-plane"></i></button></div>';
  } else if (modo === 'professor') {
    html += '<div style="display:flex;gap:4px;margin-top:4px;">' +
      '<input id="convProf_' + s.id + '" placeholder="Responder na conversa..." style="flex:1;margin:0;">' +
      '<button class="btn btn-secondary btn-mini" style="margin:0;" onclick="enviarMsgSolicitacao(\'' + s.id + '\',\'professor\',this)"><i class="fas fa-paper-plane"></i></button></div>';
  }
  return html;
}

/* ---------- 7. Atalho "Falar com o professor" — no renderAluno ---------- */

/* ---------- 8. Confirmação de leitura de aviso ---------- */
function marcarAvisoLido(avisoId) {
  var aluno = alunoLogado();
  if (!aluno) { mostrarToast('Faça login para confirmar leitura.', 'erro'); return; }
  var ja = DB.listar('leiturasAvisos').some(function (l) {
    return l.avisoId === avisoId && l.alunoId === aluno.id;
  });
  if (ja) { mostrarToast('Leitura já confirmada.'); return; }
  DB.salvar('leiturasAvisos', {
    avisoId: avisoId,
    alunoId: aluno.id,
    alunoNome: aluno.nome,
    lidoEm: agoraISO()
  }).then(function () {
    mostrarToast('Leitura confirmada ✓');
    renderInicio();
    renderAluno();
  });
}

function contagemLeiturasAviso(avisoId) {
  return DB.listar('leiturasAvisos').filter(function (l) { return l.avisoId === avisoId; }).length;
}

function alunoLeuAviso(avisoId, alunoId) {
  return DB.listar('leiturasAvisos').some(function (l) { return l.avisoId === avisoId && l.alunoId === alunoId; });
}

function htmlCardMensagensAluno(aluno) {
  marcarMensagensLidasAluno(aluno.id);
  var n = mensagensDoAluno(aluno.id).length;
  return '<div class="card card-interacao" id="cardFalarProfessor">' +
    '<h3 style="color:var(--accent-blue);"><i class="fas fa-comments"></i> Falar com o Professor</h3>' +
    '<p class="mini" style="margin-bottom:6px;">Canal privado — só você e a equipe veem.</p>' +
    '<div id="threadMsgAluno" style="max-height:180px;overflow-y:auto;margin-bottom:6px;">' +
    htmlThreadMensagens(aluno.id, false) + '</div>' +
    '<div style="display:flex;gap:4px;">' +
      '<input id="msgPrivAlunoTexto" placeholder="Digite sua mensagem..." style="flex:1;margin:0;" onkeypress="if(event.key===\'Enter\')enviarMensagemPrivadaAluno()">' +
      '<button class="btn btn-secondary" style="width:auto;margin:0;padding:8px 12px;" onclick="enviarMensagemPrivadaAluno(this)"><i class="fas fa-paper-plane"></i> Enviar</button>' +
    '</div></div>';
}

function htmlCardFeedbackAula(aluno) {
  var ck = obterCheckinDoDia(aluno);
  var ja = DB.listar('feedbacksAula').some(function (f) { return f.alunoId === aluno.id && f.data === dataLocalISO(); });
  if (!ck || ck.status !== 'aprovado') {
    return '<div class="card"><h3><i class="fas fa-heart"></i> Feedback da Aula</h3>' +
      '<p class="sem-dados">Disponível após check-in aprovado de hoje.</p></div>';
  }
  if (ja) {
    return '<div class="card"><h3><i class="fas fa-heart"></i> Feedback da Aula</h3>' +
      '<p class="mini" style="color:var(--primary-green);"><i class="fas fa-check-circle"></i> Feedback de hoje já enviado. Obrigado!</p></div>';
  }
  return '<div class="card card-interacao"><h3 style="color:var(--accent-blue);"><i class="fas fa-heart"></i> Feedback da Aula de Hoje</h3>' +
    '<p class="mini" style="margin-bottom:6px;">Como foi o treino? O professor vê o resumo.</p>' +
    '<div class="feedback-btns">' +
      '<button class="btn btn-mini" onclick="enviarFeedbackAula(\'gostei\',this)"><i class="fas fa-thumbs-up"></i> Gostei</button>' +
      '<button class="btn btn-gold btn-mini" onclick="enviarFeedbackAula(\'dificil\',this)"><i class="fas fa-dumbbell"></i> Foi difícil</button>' +
      '<button class="btn btn-secondary btn-mini" onclick="enviarFeedbackAula(\'repetir\',this)"><i class="fas fa-redo"></i> Quero repetir</button>' +
    '</div>' +
    '<label class="campo-label">Comentário (opcional)</label>' +
    '<textarea id="feedbackAulaTexto" placeholder="Ex: quero treinar mais ginga..."></textarea></div>';
}

function htmlCardPerguntaSemanaAluno(aluno) {
  var p = perguntaAtiva();
  if (!p) return '';
  var ja = DB.listar('respostasPergunta').some(function (r) { return r.perguntaId === p.id && r.alunoId === aluno.id; });
  var html = '<div class="card card-destaque brilho-azul" style="border:1px solid var(--accent-blue);">' +
    '<h3 style="color:var(--accent-blue);"><i class="fas fa-question-circle"></i> Pergunta da Semana</h3>' +
    '<p style="font-size:0.8rem;margin-bottom:6px;">' + esc(p.pergunta) + '</p>' +
    '<span class="mini">Por ' + esc(p.autor || 'Professor') + ' • ' + dataHoraBR(p.criadoEm) + '</span>';
  if (ja) {
    html += '<p class="mini" style="color:var(--primary-green);margin-top:6px;"><i class="fas fa-check"></i> Você já respondeu. Obrigado!</p>';
  } else {
    html += '<label class="campo-label">Sua resposta</label>' +
      '<textarea id="respostaPerguntaTexto" placeholder="Responda em poucas palavras..."></textarea>' +
      '<button class="btn btn-secondary" onclick="responderPerguntaSemana(this)"><i class="fas fa-check"></i> Enviar resposta</button>';
  }
  html += '</div>';
  return html;
}

function htmlAvaliacoesComComentario(avals) {
  if (!avals.length) return '<p class="sem-dados">Nenhuma avaliação semanal lançada ainda.</p>';
  return avals.map(function (a) {
    var html = '<div class="lista-item"><div class="linha"><span><b>' + esc(a.semana || dataBR(a.data) || '-') + '</b></span><span class="badge-count">' + mediaAvaliacao(a).toFixed(1) + '</span></div>' +
      '<span class="mini">Técnica ' + esc(a.tecnica || '-') + ' • Disciplina ' + esc(a.disciplina || '-') + ' • Ritmo ' + esc(a.ritmo || '-') +
      ' • Musicalidade ' + esc(a.musicalidade || '-') + ' • Compromisso ' + esc(a.compromisso || '-') + '</span>' +
      (a.desenvolvimento ? '<div class="mini" style="margin-top:3px; color:var(--accent-blue);"><i class="fas fa-seedling"></i> Desenvolvimento: ' + esc(a.desenvolvimento) + '</div>' : '') +
      (a.observacao ? '<div class="mini" style="color:var(--gold);">Feedback: ' + esc(a.observacao) + '</div>' : '');
    if (a.comentarioAluno) {
      html += '<div class="mini" style="color:var(--primary-green);margin-top:4px;"><i class="fas fa-comment"></i> Seu comentário: ' + esc(a.comentarioAluno) + '</div>';
    } else if (a.observacao || a.desenvolvimento) {
      html += '<label class="campo-label" style="margin-top:6px;">Comentar esta avaliação</label>' +
        '<textarea id="comentarioAval_' + a.id + '" placeholder="Ex: entendi, quero focar nisso na próxima semana..." style="min-height:48px;"></textarea>' +
        '<button class="btn btn-secondary btn-mini" onclick="salvarComentarioAvaliacao(\'' + a.id + '\',this)"><i class="fas fa-paper-plane"></i> Enviar comentário</button>';
    }
    html += '</div>';
    return html;
  }).join('');
}

function htmlPedidosComConversa(solicitacoes) {
  if (!solicitacoes.length) return '<p class="sem-dados">Você ainda não pediu nenhum treino específico.</p>';
  solicitacoes.forEach(function (s) {
    if (s.respostaProfessor && !s.respostaVistaAluno) {
      DB.salvar('solicitacoes', { respostaVistaAluno: true }, s.id);
    }
  });
  return solicitacoes.slice(0, 8).map(function (s) {
    return '<div class="lista-item">' +
      '<div class="linha"><b>' + esc(s.tipo || '-') + '</b>' + pillStatusSolicitacao(s.status) + '</div>' +
      '<span class="mini">' + dataHoraBR(s.criadoEm) + (s.dataPreferida ? ' • preferência: ' + dataBR(s.dataPreferida) : '') + '</span>' +
      (s.observacao ? '<div class="mini">' + esc(s.observacao) + '</div>' : '') +
      (s.respostaProfessor ? '<div class="mini" style="color:var(--gold); margin-top:3px;"><i class="fas fa-comment"></i> Prof.: ' + esc(s.respostaProfessor) + '</div>' : '') +
      htmlConversaSolicitacao(s, 'aluno') +
      '</div>';
  }).join('');
}

/* Painel professor: mensagens, feedbacks, pergunta, leituras */
function htmlPainelInteracaoProfessor() {
  var alunos = DB.listar('alunos').slice().sort(function (a, b) { return normalizar(a.nome).localeCompare(normalizar(b.nome)); });
  var msgs = DB.listar('mensagensPrivadas').slice().sort(function (a, b) { return String(b.criadoEm || '').localeCompare(String(a.criadoEm || '')); });
  var porAluno = {};
  msgs.forEach(function (m) {
    if (!porAluno[m.alunoId]) porAluno[m.alunoId] = { nome: m.alunoNome, apelido: m.alunoApelido || '', msgs: [], naoLidas: 0 };
    porAluno[m.alunoId].msgs.push(m);
    if (m.de === 'aluno' && !m.lidaPeloProfessor) porAluno[m.alunoId].naoLidas++;
  });
  var conversas = Object.keys(porAluno).map(function (id) {
    var item = porAluno[id];
    item.id = id;
    item.ultima = item.msgs[item.msgs.length - 1];
    return item;
  }).sort(function (a, b) { return String(b.ultima.criadoEm || '').localeCompare(String(a.ultima.criadoEm || '')); });

  var html = '<div class="card card-interacao"><h3 style="color:var(--accent-blue);"><i class="fas fa-comments"></i> Mensagens Privadas dos Alunos <span class="badge-count">' +
    conversas.reduce(function (s, c) { return s + c.naoLidas; }, 0) + '</span></h3>';
  if (!conversas.length) {
    html += '<p class="sem-dados">Nenhuma mensagem privada ainda.</p>';
  } else {
    conversas.slice(0, 12).forEach(function (c) {
      marcarMensagensLidasProfessor(c.id);
      html += '<div class="lista-item">' +
        '<div class="linha"><b>' + esc(c.nome) + (c.apelido ? ' (' + esc(c.apelido) + ')' : '') + '</b>' +
        (c.naoLidas ? '<span class="badge-notif">' + c.naoLidas + '</span>' : '') + '</div>' +
        '<div style="max-height:120px;overflow-y:auto;margin:4px 0;">' + htmlThreadMensagens(c.id, true) + '</div>' +
        '<div style="display:flex;gap:4px;">' +
          '<input id="msgPrivProfTexto_' + c.id + '" placeholder="Responder..." style="flex:1;margin:0;">' +
          '<button class="btn btn-secondary btn-mini" style="margin:0;" onclick="enviarMensagemPrivadaProfessor(\'' + c.id + '\',this)"><i class="fas fa-paper-plane"></i> Responder</button>' +
        '</div></div>';
    });
  }
  html += '</div>';

  /* Feedbacks pós-aula */
  var feedbacks = DB.listar('feedbacksAula').slice().sort(function (a, b) { return String(b.criadoEm || '').localeCompare(String(a.criadoEm || '')); }).slice(0, 20);
  var naoVistos = feedbacks.filter(function (f) { return !f.vistoProfessor; }).length;
  html += '<div class="card"><h3><i class="fas fa-heart"></i> Feedbacks Pós-Aula <span class="badge-count">' + naoVistos + '</span></h3>';
  if (!feedbacks.length) html += '<p class="sem-dados">Nenhum feedback ainda.</p>';
  else {
    var labels = { gostei: '👍 Gostei', dificil: '💪 Foi difícil', repetir: '🔁 Quero repetir' };
    feedbacks.forEach(function (f) {
      html += '<div class="lista-item"><div class="linha"><b>' + esc(f.alunoNome) + '</b><span class="mini">' + dataBR(f.data) + '</span></div>' +
        '<span class="pill pill-info">' + esc(labels[f.rating] || f.rating) + '</span>' +
        (f.texto ? '<div class="mini" style="margin-top:3px;">' + esc(f.texto) + '</div>' : '') + '</div>';
    });
    if (naoVistos) html += '<button class="btn btn-secondary btn-mini" onclick="marcarFeedbacksVistos();mostrarToast(\'Marcados como vistos\');renderAbaProfessor();"><i class="fas fa-eye"></i> Marcar todos como vistos</button>';
  }
  html += '</div>';

  /* Pergunta da semana */
  var pAtiva = perguntaAtiva();
  var respostas = pAtiva ? DB.listar('respostasPergunta').filter(function (r) { return r.perguntaId === pAtiva.id; })
    .sort(function (a, b) { return String(b.criadoEm || '').localeCompare(String(a.criadoEm || '')); }) : [];
  html += '<div class="card" style="border:1px solid var(--gold);"><h3 style="color:var(--gold);"><i class="fas fa-question-circle"></i> Pergunta da Semana</h3>' +
    '<p class="mini" style="margin-bottom:6px;">Publique uma pergunta aberta. As respostas ficam só para a equipe.</p>';
  if (pAtiva) {
    html += '<div class="aviso-info"><b>Ativa:</b> ' + esc(pAtiva.pergunta) + '<br><span class="mini">' + esc(pAtiva.autor) + ' • ' + dataHoraBR(pAtiva.criadoEm) + ' • ' + respostas.length + ' resposta(s)</span></div>';
    respostas.forEach(function (r) {
      html += '<div class="lista-item"><div class="linha"><b>' + esc(r.alunoNome) + '</b><span class="mini">' + dataHoraBR(r.criadoEm) + '</span></div>' +
        '<div class="mini">' + esc(r.texto) + '</div></div>';
    });
    if (respostas.some(function (r) { return !r.vistoProfessor; })) {
      html += '<button class="btn btn-secondary btn-mini" onclick="marcarRespostasPerguntaVistas();mostrarToast(\'Respostas vistas\');renderAbaProfessor();"><i class="fas fa-eye"></i> Marcar respostas como vistas</button>';
    }
  }
  html += '<label class="campo-label">Nova pergunta</label>' +
    '<textarea id="perguntaSemanaTexto" placeholder="Ex: Qual movimento você quer revisar na próxima semana?"></textarea>' +
    '<button class="btn btn-gold" onclick="publicarPerguntaSemana(this)"><i class="fas fa-paper-plane"></i> Publicar pergunta</button></div>';

  /* Leituras de avisos */
  var avisos = DB.listar('avisos').slice().sort(function (a, b) { return String(b.criadoEm || '').localeCompare(String(a.criadoEm || '')); }).slice(0, 8);
  html += '<div class="card"><h3><i class="fas fa-eye"></i> Leituras de Avisos</h3>';
  if (!avisos.length) html += '<p class="sem-dados">Nenhum aviso publicado.</p>';
  else {
    avisos.forEach(function (a) {
      var n = contagemLeiturasAviso(a.id);
      html += '<div class="lista-item"><div class="linha"><b>' + esc(a.titulo || 'Aviso') + '</b><span class="badge-count">' + n + ' leram</span></div>' +
        '<span class="mini">' + dataHoraBR(a.criadoEm) + '</span></div>';
    });
  }
  html += '</div>';

  /* Comentários de avaliações */
  var avalsComComent = DB.listar('avaliacoes').filter(function (a) { return a.comentarioAluno; })
    .sort(function (a, b) { return String(b.comentarioAlunoEm || '').localeCompare(String(a.comentarioAlunoEm || '')); }).slice(0, 15);
  html += '<div class="card"><h3><i class="fas fa-comment-dots"></i> Comentários dos Alunos nas Avaliações</h3>';
  if (!avalsComComent.length) html += '<p class="sem-dados">Nenhum comentário ainda.</p>';
  else {
    avalsComComent.forEach(function (a) {
      html += '<div class="lista-item"><div class="linha"><b>' + esc(a.alunoNome) + '</b><span class="mini">' + esc(a.semana || dataBR(a.data)) + '</span></div>' +
        '<div class="mini" style="color:var(--primary-green);">' + esc(a.comentarioAluno) + '</div></div>';
    });
  }
  html += '</div>';

  /* Avaliação Semanal da Turma (via Assistente Virtual) */
  var testeTurmaAtual = testeSemanalDaTurmaAtual();
  html += '<div class="card"><h3><i class="fas fa-clipboard-list"></i> Avaliação Semanal da Turma</h3>' +
    '<p class="mini" style="margin-bottom:6px;">Para gerar e publicar, abra o Assistente Virtual (ícone flutuante) e digite "avaliação semanal".</p>';
  if (!testeTurmaAtual) {
    html += '<p class="sem-dados">Nenhuma avaliação semanal publicada ainda para esta semana.</p>';
  } else {
    var notasTurma = DB.listar('notasAvaliacoesSemanais').filter(function (n) { return n.testeId === testeTurmaAtual.id; })
      .slice().sort(function (a, b) { return b.nota - a.nota; });
    html += '<div class="aviso-info"><b>' + esc(testeTurmaAtual.temaNome) + '</b> • ' + esc(testeTurmaAtual.perguntas.length) + ' perguntas' +
      '<br><span class="mini">Prazo: ' + dataHoraBR(testeTurmaAtual.prazo) + ' • ' + notasTurma.length + ' aluno(s) responderam</span></div>';
    if (!notasTurma.length) {
      html += '<p class="sem-dados">Ninguém respondeu ainda.</p>';
    } else {
      notasTurma.forEach(function (n) {
        html += '<div class="lista-item"><div class="linha"><b>' + esc(n.alunoApelido || n.alunoNome) + '</b><span class="badge-count">' + n.nota.toFixed(1) + '</span></div></div>';
      });
    }
  }
  html += '</div>';

  return html;
}


/* ---------------------------------------------------------------
   15. INICIALIZAÇÃO
   --------------------------------------------------------------- */
