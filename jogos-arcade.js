/* JOGOS-ARCADE.JS — Universo Capoeira (v87) · trecho do app dividido sem alterar o código (linhas 2923–4183 + 5457–5479 do index.html original) */
/* ===== Arcade: Snake, Tetris, Corrida ===== */
var arcade = {
  tipo: null,
  rodando: false,
  pausado: false,
  score: 0,
  nivel: 1,
  maxNivel: 10,
  progresso: 0,
  objetivo: 0,
  linesCleared: 0,
  timer: null,
  canvas: null,
  ctx: null,
  // snake
  snake: [],
  dir: { x: 1, y: 0 },
  nextDir: { x: 1, y: 0 },
  food: { x: 5, y: 5 },
  grid: 16,
  cols: 20,
  rows: 25,
  // tetris
  board: [],
  piece: null,
  tCols: 10,
  tRows: 20,
  tCell: 20,
  // corrida arcade
  carX: 1,
  obstacles: [],
  speed: 4,
  frame: 0
};

var ARCADE_NIVEIS_KEY = 'uc_arcade_niveis_v87';

function carregarNiveisArcade() {
  var data = {};
  try { data = JSON.parse(localStorage.getItem(ARCADE_NIVEIS_KEY) || '{}') || {}; } catch (e) { data = {}; }
  /* mescla progresso da nuvem: aluno logado → aparelho → nome/apelido do jogador */
  try {
    var aluno = typeof alunoLogado === 'function' ? alunoLogado() : null;
    var lista = DB.listar('progressoJogos') || [];
    var ap = '';
    try { ap = localStorage.getItem('uc_aparelho_id_v87') || ''; } catch (e2) {}
    var nomeJ = '';
    try {
      if (typeof nomeJogadorArcade === 'function') nomeJ = normalizar(nomeJogadorArcade());
      else nomeJ = normalizar(localStorage.getItem('uc_nome_jogador_arcade') || '');
    } catch (e3) {}
    lista.forEach(function (p) {
      if (!p || !p.niveis) return;
      var match = false;
      if (aluno && p.alunoId && p.alunoId === aluno.id) match = true;
      else if (ap && p.aparelhoId && p.aparelhoId === ap) match = true;
      else if (nomeJ && nomeJ.length >= 2 && p.jogadorNomeNorm && p.jogadorNomeNorm === nomeJ) match = true;
      else if (nomeJ && nomeJ.length >= 2 && p.alunoNome && normalizar(p.alunoNome) === nomeJ) match = true;
      if (match) {
        Object.keys(p.niveis).forEach(function (k) {
          data[k] = Math.max(Number(data[k]) || 1, Number(p.niveis[k]) || 1);
        });
      }
    });
  } catch (e) {}
  return data;
}

function idAparelhoJogos() {
  var k = 'uc_aparelho_id_v87';
  try {
    var id = localStorage.getItem(k);
    if (!id) {
      id = 'ap_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      localStorage.setItem(k, id);
    }
    return id;
  } catch (e) { return 'ap_local'; }
}

function salvarNivelArcade(tipo, nivel) {
  var data = carregarNiveisArcade();
  var atual = Number(data[tipo]) || 1;
  if (nivel > atual) {
    data[tipo] = Math.min(10, nivel);
    try { localStorage.setItem(ARCADE_NIVEIS_KEY, JSON.stringify(data)); } catch (e) {}
    /* salva na nuvem: aluno, aparelho e nome do jogador (troca de celular com mesmo apelido) */
    try {
      var aluno = typeof alunoLogado === 'function' ? alunoLogado() : null;
      var aparelhoId = idAparelhoJogos();
      var nomeJ = '';
      try {
        if (typeof nomeJogadorArcade === 'function') nomeJ = (nomeJogadorArcade() || '').trim();
        else nomeJ = (localStorage.getItem('uc_nome_jogador_arcade') || '').trim();
      } catch (eN) {}
      if (aluno && (aluno.apelido || aluno.nome)) nomeJ = aluno.apelido || aluno.nome;
      var nomeNorm = normalizar(nomeJ);
      var lista = DB.listar('progressoJogos') || [];
      var reg = null;
      if (aluno) {
        reg = lista.find(function (p) { return p.alunoId === aluno.id; });
      }
      if (!reg && nomeNorm && nomeNorm.length >= 2) {
        reg = lista.find(function (p) {
          return (p.jogadorNomeNorm && p.jogadorNomeNorm === nomeNorm) ||
            (p.alunoNome && normalizar(p.alunoNome) === nomeNorm && !p.alunoId);
        });
      }
      if (!reg) {
        reg = lista.find(function (p) { return p.aparelhoId === aparelhoId && !p.alunoId; });
      }
      var niveis = Object.assign({}, (reg && reg.niveis) || {}, data);
      var payload = {
        alunoId: aluno ? aluno.id : '',
        alunoNome: nomeJ || (aluno ? (aluno.apelido || aluno.nome) : ''),
        jogadorNomeNorm: nomeNorm || '',
        aparelhoId: aparelhoId,
        niveis: niveis,
        atualizadoEm: agoraISO()
      };
      if (reg && reg.id) DB.salvar('progressoJogos', payload, reg.id);
      else DB.salvar('progressoJogos', payload);
    } catch (e) {}
  }
}

function nivelMaxDesbloqueado(tipo) {
  var data = carregarNiveisArcade();
  var n = Number(data[tipo]) || 1;
  return Math.max(1, Math.min(10, n));
}

function curvaDificuldade(nivel) {
  /* 0 no nível 1, sobe devagar nos níveis do meio, dispara nos últimos (8, 9, 10) */
  var n = Math.max(1, Math.min(10, Number(nivel) || 1));
  return Math.pow((n - 1) / 9, 1.7);
}

function configNivelArcade(tipo, nivel) {
  nivel = Math.max(1, Math.min(10, Number(nivel) || 1));
  var curva = curvaDificuldade(nivel);
  /* scoreParaDesbloquear: pontos na partida para liberar o PRÓXIMO nível (alternativa ao objetivo) */
  if (tipo === 'snake') {
    var objS = Math.round(6 + 64 * curva);
    return {
      nivel: nivel,
      objetivo: objS,
      velocidadeMs: Math.max(95, Math.round(240 - 130 * curva)),   /* v87: mais calmo (antes 195→65 ms) */
      scoreParaDesbloquear: objS * 10 + nivel * 20,
      label: 'Coma ' + objS + ' comidas · ou ' + (objS * 10 + nivel * 20) + ' pts'
    };
  }
  if (tipo === 'tetris') {
    var objT = Math.round(3 + 13 * curva);
    return {
      nivel: nivel,
      objetivo: objT,
      velocidadeMs: Math.max(140, Math.round(520 - 380 * curva)),
      scoreParaDesbloquear: objT * 80 + nivel * 50,
      label: 'Complete ' + objT + ' linhas · ou ' + (objT * 80 + nivel * 50) + ' pts'
    };
  }
  if (tipo === 'quebra') {
    var objQ = Math.round(8 + 37 * curva);
    return {
      nivel: nivel,
      objetivo: objQ,
      velocidadeMs: 24,   /* v87: mais calmo (antes 16 ms) */
      curva: curva,
      scoreParaDesbloquear: objQ * 12 + nivel * 30,
      label: 'Quebre ' + objQ + ' blocos · ou ' + (objQ * 12 + nivel * 30) + ' pts'
    };
  }
  if (tipo === 'pulo') {
    var objP = Math.round(8 + 32 * curva);
    return {
      nivel: nivel,
      objetivo: objP,
      velocidadeMs: Math.max(24, Math.round(42 - 18 * curva)),   /* v87: mais calmo (antes 31→15 ms) */
      scoreParaDesbloquear: objP * 8 + nivel * 25,
      label: 'Passe ' + objP + ' obstáculos · ou ' + (objP * 8 + nivel * 25) + ' pts'
    };
  }
  if (tipo === 'surfe') {
    var objSu = Math.round(25 + 195 * curva);
    return {
      nivel: nivel,
      objetivo: objSu,
      velocidadeMs: 28,   /* v87: mais calmo (antes 20 ms) */
      speedBase: +(2.0 + 3.0 * curva).toFixed(2),
      scoreParaDesbloquear: objSu,
      label: 'Faça ' + objSu + ' pts sem cair'
    };
  }
  if (tipo === 'mario') {
    var objM = Math.round(5 + 25 * curva);
    return {
      nivel: nivel,
      objetivo: objM,
      velocidadeMs: 26,   /* v87: mais calmo (antes 20 ms) */
      scoreParaDesbloquear: objM * 15 + nivel * 20,
      label: 'Pegue ' + objM + ' moedas · ou ' + (objM * 15 + nivel * 20) + ' pts'
    };
  }
  if (tipo === 'pacman') {
    /* ~180–220 pastilhas no mapa; objetivo = limpar o labirinto (HUD usa pacDotsTotal real no init) */
    var dotsEst = 200;
    return {
      nivel: nivel,
      objetivo: dotsEst,
      velocidadeMs: Math.max(44, Math.round(96 - 44 * curva)),   /* v87: mais calmo (antes 62→26 ms) */
      scoreParaDesbloquear: 800 + nivel * 200,
      label: 'Coma todas as pastilhas (~' + dotsEst + ') · ou ' + (800 + nivel * 200) + ' pts'
    };
  }
  /* corrida */
  var objC = Math.round(35 + 225 * curva);
  return {
    nivel: nivel,
    objetivo: objC,
    velocidadeMs: 62,   /* v87: mais calmo (antes 50 ms) */
    speedBase: +(1.8 + 3.2 * curva).toFixed(2),
    spawnEvery: Math.max(14, Math.round(33 - 19 * curva)),
    scoreParaDesbloquear: objC,
    label: 'Faça ' + objC + ' pts sem bater'
  };
}

function atualizarHUDNivelArcade() {
  if ($('arcadeNivel')) $('arcadeNivel').textContent = String(arcade.nivel || 1);
  if ($('arcadePlacar')) $('arcadePlacar').textContent = String(arcade.score || 0);
  if ($('arcadeObjetivo')) {
    var cfg = configNivelArcade(arcade.tipo, arcade.nivel);
    var prog = arcade.progresso || 0;
    var obj = arcade.objetivo || cfg.objetivo;
    var metaPts = Number(cfg.scoreParaDesbloquear) || 0;
    var txt = (cfg.label || '') + ' · ' + prog + '/' + obj;
    if (metaPts > 0) txt += ' · pts ' + (arcade.score || 0) + '/' + metaPts;
    $('arcadeObjetivo').textContent = txt;
  }
}

function desenharHUDArcade(ctx, w, titulo) {
  /* barra tech neon */
  var g = ctx.createLinearGradient(0, 0, w, 0);
  g.addColorStop(0, 'rgba(0,40,30,0.85)');
  g.addColorStop(0.5, 'rgba(0,20,40,0.9)');
  g.addColorStop(1, 'rgba(0,30,50,0.85)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, 28);
  ctx.strokeStyle = 'rgba(0,230,118,0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 28);
  ctx.lineTo(w, 28);
  ctx.stroke();
  /* cantos tech */
  ctx.strokeStyle = 'rgba(0,210,255,0.5)';
  ctx.beginPath();
  ctx.moveTo(0, 8); ctx.lineTo(0, 0); ctx.lineTo(10, 0);
  ctx.moveTo(w, 8); ctx.lineTo(w, 0); ctx.lineTo(w - 10, 0);
  ctx.stroke();
  ctx.fillStyle = '#00e676';
  ctx.font = 'bold 12px "Segoe UI", system-ui, sans-serif';
  ctx.shadowColor = 'rgba(0,230,118,0.6)';
  ctx.shadowBlur = 6;
  ctx.fillText('NV.' + arcade.nivel + '  ' + arcade.score, 10, 18);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffc107';
  ctx.font = 'bold 11px "Segoe UI", system-ui, sans-serif';
  var prog = (arcade.progresso || 0) + '/' + (arcade.objetivo || 0);
  ctx.fillText(prog, w / 2 - ctx.measureText(prog).width / 2, 18);
  if (titulo) {
    ctx.fillStyle = '#80d8ff';
    ctx.font = 'bold 10px "Segoe UI", system-ui, sans-serif';
    ctx.fillText(titulo, w - 10 - ctx.measureText(titulo).width, 18);
  }
}

function subirNivelArcade() {
  if (arcade.nivel >= arcade.maxNivel) {
    mostrarToast('Nível máximo! Você é lenda 🏆');
    arcade.progresso = 0;
    atualizarHUDNivelArcade();
    return;
  }
  var novo = arcade.nivel + 1;
  arcade.nivel = novo;
  arcade.progresso = 0;
  salvarNivelArcade(arcade.tipo, novo);
  var cfg = configNivelArcade(arcade.tipo, novo);
  arcade.objetivo = cfg.objetivo;
  if (arcade.timer) clearInterval(arcade.timer);
  var gamesComRampa2 = ['snake', 'tetris', 'pulo', 'quebra', 'mario', 'corrida', 'surfe', 'pacman'];
  arcade.rampaAtiva = gamesComRampa2.indexOf(arcade.tipo) >= 0;
  arcade.velAlvo = cfg.velocidadeMs;
  arcade.velAtual = arcade.rampaAtiva ? Math.round(cfg.velocidadeMs * 1.6) : cfg.velocidadeMs;
  arcade.rampTick = 0;
  arcade.timer = setInterval(arcadeLoop, arcade.velAtual);
  if (arcade.tipo === 'corrida') {
    arcade.speed = cfg.speedBase;
  }
  if (arcade.tipo === 'snake') {
    /* mantém a cobra, só acelera */
  }
  if (arcade.tipo === 'tetris') {
    /* velocidade já no interval */
  }
  /* jogos de mapa: reinicia fase no novo nível (HUD e objetivo alinhados) */
  if (arcade.tipo === 'pacman') {
    try { initPacman(); } catch (e) {}
  } else if (arcade.tipo === 'quebra') {
    try { initQuebra(); } catch (e) {}
  } else if (arcade.tipo === 'pulo') {
    try { initPulo(); } catch (e) {}
  } else if (arcade.tipo === 'mario') {
    try { initMario(); } catch (e) {}
  } else if (arcade.tipo === 'surfe') {
    try { initSurfe(); } catch (e) {}
  } else if (arcade.tipo === 'corrida') {
    try { initCorridaArcade(); } catch (e) {}
  }
  arcade._scoreUnlockFeito = false;
  mostrarToast('Nível ' + novo + '! ' + cfg.label);
  atualizarHUDNivelArcade();
}

function verificarDesbloqueioPorScore() {
  if (!arcade.tipo || !arcade.rodando) return false;
  if (arcade._scoreUnlockFeito) return false;
  var cfg = configNivelArcade(arcade.tipo, arcade.nivel || 1);
  var meta = Number(cfg.scoreParaDesbloquear) || 0;
  if (meta <= 0) return false;
  if ((arcade.score || 0) < meta) return false;
  /* desbloqueia o PRÓXIMO nível sem exigir o objetivo de missão */
  var atualSalvo = nivelMaxDesbloqueado(arcade.tipo);
  var proximo = Math.min(10, (arcade.nivel || 1) + 1);
  if (proximo > atualSalvo) {
    salvarNivelArcade(arcade.tipo, proximo);
    arcade._scoreUnlockFeito = true;
    mostrarToast('🔓 Nível ' + proximo + ' liberado por pontuação! (' + arcade.score + ' pts)');
    try { renderSeletorNiveisArcade(); } catch (e) {}
    return true;
  }
  /* já tinha o nível; só marca para não repetir toast */
  if ((arcade.score || 0) >= meta) arcade._scoreUnlockFeito = true;
  return false;
}

function desbloqueioPorScoreNoFim(tipo, score, nivelJogando) {
  if (!tipo || !(score > 0)) return 0;
  var n = Math.max(1, Math.min(10, Number(nivelJogando) || 1));
  var cfg = configNivelArcade(tipo, n);
  var meta = Number(cfg.scoreParaDesbloquear) || 0;
  if (meta <= 0 || score < meta) return 0;
  var atual = nivelMaxDesbloqueado(tipo);
  var proximo = Math.min(10, n + 1);
  if (proximo > atual) {
    salvarNivelArcade(tipo, proximo);
    return proximo;
  }
  return 0;
}

function registrarProgressoNivel(qtd) {
  arcade.progresso = (arcade.progresso || 0) + (qtd || 1);
  atualizarHUDNivelArcade();
  if (arcade.progresso >= arcade.objetivo) {
    subirNivelArcade();
  }
}

var TETRIS_SHAPES = {
  I: [[1,1,1,1]],
  O: [[1,1],[1,1]],
  T: [[0,1,0],[1,1,1]],
  S: [[0,1,1],[1,1,0]],
  Z: [[1,1,0],[0,1,1]],
  J: [[1,0,0],[1,1,1]],
  L: [[0,0,1],[1,1,1]]
};
var TETRIS_COLORS = { I: '#00d2ff', O: '#ffc107', T: '#ab47bc', S: '#00e676', Z: '#ef5350', J: '#42a5f5', L: '#ff9800' };

function toggleArcadeTelaGrande() {
  arcade.telaGrande = !arcade.telaGrande;
  var wrap = $('arcadeCanvasWrap');
  var canvas = $('arcadeCanvas');
  var btn = $('btnArcadeExpand');
  if (!wrap || !canvas) return;
  if (arcade.telaGrande) {
    wrap.style.maxWidth = '100%';
    wrap.style.flex = '1 1 auto';
    canvas.style.maxWidth = 'min(96vw, 520px)';
    canvas.style.maxHeight = 'min(68vh, 640px)';
    if (btn) btn.innerHTML = '<i class="fas fa-compress"></i>';
    mostrarToast('Tela ampliada');
  } else {
    wrap.style.maxWidth = '400px';
    canvas.style.maxWidth = 'min(96vw, 360px)';
    canvas.style.maxHeight = 'min(58vh, 440px)';
    if (btn) btn.innerHTML = '<i class="fas fa-expand"></i>';
    mostrarToast('Tela normal');
  }
}

function abrirJogoArcade(tipo, nivelInicio) {
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
  var ov = $('arcadeOverlay');
  if (ov) { ov.style.display = 'flex'; ov.setAttribute('data-jogo', tipo); }   /* v87: controles próprios de cada jogo (CSS por data-jogo) */
  try { document.body.style.overflow = 'hidden'; } catch (e) {}
  var titulos = { pacman: 'Pac-Man', snake: 'Minhoca', tetris: 'Tetris', corrida: 'Corrida', quebra: 'Quebra-Blocos', pulo: 'Pulo', surfe: 'Surfe', mario: 'Aventura' };
  if ($('arcadeTitulo')) $('arcadeTitulo').textContent = (titulos[tipo] || 'Jogo') + ' · Nv.' + nv;
  if ($('arcadeDica')) {
    var dicas = {
      pacman: '◀ ▶ ▲ ▼ fuja dos fantasmas · coma pastilhas e power pellets',
      tetris: '◀ ▶ move · ▼ desce · Girar / Queda rápida',
      corrida: 'Esquerda / Direita para desviar dos carros',
      snake: 'Dirija a minhoca · coma as maçãs',
      quebra: 'Mova a barra · quebre todos os blocos',
      pulo: 'Toque em Pular ou cima para evitar os canos',
      surfe: '◀ ▶ muda de faixa · ▲ ou Pular para saltar obstáculos',
      mario: '◀ ▶ corre · ▲ ou Pular · pegue moedas e chegue na bandeira'
    };
    $('arcadeDica').textContent = dicas[tipo] || 'Deslize ou use as setas';
  }
  var acoesT = $('arcadeAcoesTetris');
  if (acoesT) acoesT.style.display = (tipo === 'tetris') ? 'flex' : 'none';
  var acoesP = $('arcadeAcoesPulo');
  if (acoesP) acoesP.style.display = (tipo === 'pulo' || tipo === 'surfe' || tipo === 'mario') ? 'flex' : 'none';
  var acoesG = $('arcadeAcoesGeral');
  /* snake, corrida, quebra, pacman: também usam polegar direito (◀ ▶) */
  if (acoesG) {
    acoesG.style.display = (tipo === 'snake' || tipo === 'corrida' || tipo === 'quebra' || tipo === 'pacman') ? 'flex' : 'none';
  }
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
  } else if (tipo === 'corrida' || tipo === 'quebra' || tipo === 'pulo' || tipo === 'surfe' || tipo === 'mario') {
    arcade.canvas.width = 280;
    arcade.canvas.height = 400;
  }
  arcade.ctx = arcade.canvas.getContext('2d');
  if (tipo === 'snake') initSnake();
  else if (tipo === 'tetris') initTetris();
  else if (tipo === 'corrida') initCorridaArcade();
  else if (tipo === 'quebra') initQuebra();
  else if (tipo === 'pulo') initPulo();
  else if (tipo === 'surfe') initSurfe();
  else if (tipo === 'mario') initMario();
  else if (tipo === 'pacman') initPacman();
  if (arcade.timer) clearInterval(arcade.timer);
  var gamesComRampa = ['snake', 'tetris', 'pulo', 'quebra', 'mario', 'corrida', 'surfe', 'pacman'];
  arcade.rampaAtiva = gamesComRampa.indexOf(tipo) >= 0;
  arcade.velAlvo = cfg.velocidadeMs;
  arcade.velAtual = arcade.rampaAtiva ? Math.round(cfg.velocidadeMs * 2.2) : cfg.velocidadeMs;
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
  if (arcade.timer) { clearInterval(arcade.timer); arcade.timer = null; }
  window.removeEventListener('keydown', arcadeKeyHandler);
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
  else if (arcade.tipo === 'tetris') tickTetris();
  else if (arcade.tipo === 'corrida') tickCorridaArcade();
  else if (arcade.tipo === 'quebra') tickQuebra();
  else if (arcade.tipo === 'pulo') tickPulo();
  else if (arcade.tipo === 'surfe') tickSurfe();
  else if (arcade.tipo === 'mario') tickMario();
  else if (arcade.tipo === 'pacman') tickPacman();
  if ($('arcadePlacar')) $('arcadePlacar').textContent = String(arcade.score);
  try { verificarDesbloqueioPorScore(); } catch (e) {}
}

function initSnake() {
  arcade.snake = [{ x: 8, y: 12 }, { x: 7, y: 12 }, { x: 6, y: 12 }];
  arcade.dir = { x: 1, y: 0 };
  arcade.nextDir = { x: 1, y: 0 };
  spawnFood();
  drawSnake();
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
  if (head.x < 0 || head.y < 0 || head.x >= arcade.cols || head.y >= arcade.rows ||
      arcade.snake.some(function (s) { return s.x === head.x && s.y === head.y; })) {
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
  } else if (head.x === arcade.food.x && head.y === arcade.food.y) {
    arcade.score += 10 + arcade.nivel * 2;
    spawnFood();
    registrarProgressoNivel(1);
  } else {
    arcade.snake.pop();
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
  /* fundo tech */
  var grd = ctx.createLinearGradient(0, 0, 0, h);
  grd.addColorStop(0, '#041a12');
  grd.addColorStop(0.5, '#0a1f18');
  grd.addColorStop(1, '#030d0a');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, w, h);
  /* grade neon */
  ctx.strokeStyle = 'rgba(0,230,118,0.07)';
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
    ctx.shadowColor = '#00e676';
    ctx.shadowBlur = 12;
    ctx.strokeStyle = '#1b5e20';
    ctx.lineWidth = g - 2;
    ctx.beginPath();
    arcade.snake.forEach(function (s, idx) {
      var cx = s.x * g + g / 2, cy = s.y * g + g / 2;
      if (idx === 0) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);
    });
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#00e676';
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
    /* textura de escamas ao longo do corpo */
    ctx.fillStyle = 'rgba(0,60,30,0.35)';
    arcade.snake.forEach(function (s, idx) {
      if (idx === 0 || idx % 2 === 0) return;
      var cx = s.x * g + g / 2, cy = s.y * g + g / 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, (g - 10) / 2.6, (g - 10) / 4, 0, 0, Math.PI * 2);
      ctx.fill();
    });
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
  var cfg = configNivelArcade('corrida', arcade.nivel || 1);
  arcade.carX = 1;
  arcade.obstacles = [];
  arcade.speed = cfg.speedBase || 4;
  arcade.frame = 0;
  arcade._spawnEvery = cfg.spawnEvery || 25;
  arcade._lastScoreNivel = 0;
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
  /* noite tech */
  var sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#0a1628');
  sky.addColorStop(0.4, '#121212');
  sky.addColorStop(1, '#1a1a1a');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  /* asfalto neon */
  var road = ctx.createLinearGradient(0, 0, w, 0);
  road.addColorStop(0, '#0d1117');
  road.addColorStop(0.5, '#1c2333');
  road.addColorStop(1, '#0d1117');
  ctx.fillStyle = road;
  ctx.fillRect(8, 0, w - 16, h);
  /* textura de asfalto (grão) */
  var texOffset = (arcade.frame * (arcade.speed || 4)) % 40;
  ctx.fillStyle = 'rgba(255,255,255,0.035)';
  for (var ty = -40; ty < h + 40; ty += 9) {
    var yy = ty + texOffset;
    for (var tx = 10; tx < w - 10; tx += 17) {
      ctx.fillRect(tx + ((Math.floor(ty / 9)) % 2) * 5, yy, 2, 2);
    }
  }
  /* bordas neon */
  ctx.fillStyle = '#00e676';
  ctx.globalAlpha = 0.35;
  ctx.fillRect(0, 0, 6, h);
  ctx.fillRect(w - 6, 0, 6, h);
  ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(0,210,255,0.4)';
  ctx.fillRect(6, 0, 3, h);
  ctx.fillRect(w - 9, 0, 3, h);
  var laneW = w / 3;
  var offset = (arcade.frame * arcade.speed * 2) % 30;
  ctx.strokeStyle = 'rgba(255,193,7,0.85)';
  ctx.lineWidth = 3;
  ctx.shadowColor = '#ffc107';
  ctx.shadowBlur = 6;
  ctx.setLineDash([16, 12]);
  ctx.lineDashOffset = -offset;
  ctx.beginPath();
  ctx.moveTo(laneW, 0); ctx.lineTo(laneW, h);
  ctx.moveTo(laneW * 2, 0); ctx.lineTo(laneW * 2, h);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.shadowBlur = 0;
  var coresRivais = [['#ef5350', '#b71c1c'], ['#42a5f5', '#0d47a1'], ['#ab47bc', '#6a1b9a'], ['#ff9800', '#e65100']];
  arcade.obstacles.forEach(function (o, idx) {
    var x = o.lane * laneW + 12;
    var y = o.y;
    var bw = laneW - 24, bh = 40;
    var c = coresRivais[idx % coresRivais.length];
    /* rastro de velocidade atrás do carro */
    var trailG = ctx.createLinearGradient(0, y - 26, 0, y);
    trailG.addColorStop(0, 'rgba(255,255,255,0)');
    trailG.addColorStop(1, 'rgba(255,255,255,0.18)');
    ctx.fillStyle = trailG;
    ctx.fillRect(x + bw * 0.18, y - 26, bw * 0.64, 26);
    desenharCarroArcade(ctx, x, y, bw, bh, c[0], c[1]);
  });
  var px = arcade.carX * laneW + 14;
  var py = h - 64;
  var pw = laneW - 28, ph = 46;
  /* glow do carro do jogador */
  ctx.shadowColor = '#00e676';
  ctx.shadowBlur = 16;
  desenharCarroArcade(ctx, px, py, pw, ph, '#69f0ae', '#00c853');
  ctx.shadowBlur = 0;
  desenharHUDArcade(ctx, w, 'CORRIDA');
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
