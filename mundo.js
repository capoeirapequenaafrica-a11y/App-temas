/* Universo Capoeira — gerado a partir do index.html */
/* Não edite VERSAO: arquivo sem número de versão */
/* === mundo: iniciarApp + Simulador unificado === */

/* ============================================================
   INICIAR APP
   ============================================================ */
function iniciarApp() {
  DB.iniciar();

  DB.escutar('config', function (lista) { carregarConfigApp(lista); });
  DB.escutar('*', function () {
    renderizarAba(abaAtual);
  });

  try {
    var alunoSalvo = localStorage.getItem('uc_sessao_aluno') || localStorage.getItem('uc_sessao_aluno_v87');
    if (alunoSalvo && DB.buscar('alunos', alunoSalvo)) sessaoAlunoId = alunoSalvo;
  } catch (e) {}

  aplicarConfig();
  atualizarTimerUI();
  renderInicio();
  renderCheckin();
  renderAluno();
  try { atualizarMascoteLivre(); } catch (e5) {}
  tornarCardsColapsaveis($('tab2'));
  instalarGestoAcessoEquipe();
  mostrarDicaAssistentePrimeiroAcesso();

  try {
    var abaPedida = (new URLSearchParams(window.location.search)).get('aba') ||
      (window.location.hash || '').replace('#', '');
    if (abaPedida) {
      var mapaAba = { checkin: 'tab2', inicio: 'tab1', aluno: 'tab3' };
      var idAba = mapaAba[normalizar(abaPedida)];
      if (idAba) { abrirAba(idAba); }
    }
  } catch (e) {}

  setInterval(avaliarAtrasoHoje, 60000);

  window.addEventListener('online', function () {
    atualizarStatusFirebase();
    try { DB.sincronizarFilaOffline(); } catch (e) {}
    try { renderAbaDev(); } catch (e) {}
  });
  window.addEventListener('offline', function () { atualizarStatusFirebase(); });
  setTimeout(function () { try { DB.sincronizarFilaOffline(); } catch (e) {} }, 2500);
  setInterval(function () {
    if (typeof navigator !== 'undefined' && navigator.onLine !== false) {
      try { DB.sincronizarFilaOffline(); } catch (e) {}
    }
  }, 45000);

  registroLog('app', 'App iniciado em modo ' + DB.modo);
  console.log('%cUniverso Capoeira — modo ' + DB.modo, 'color:#00e676;font-weight:bold;');
  setTimeout(atualizarBadgesInteracao, 400);

  setTimeout(function () {
    try { iniciarHeartbeatPresenca(); renderTerreiroListas(); } catch (e) {}
  }, 800);
  DB.escutar('avataresOnline', function () {
    try { renderTerreiroListas(); } catch (e) {}
    if (arcade && arcade.tipo === 'tamagotchi' && arcade._tamaModo === 'terreiro') {
      try { drawTamagotchi(); } catch (e2) {}
    }
  });
}


/* ============================================================
   SIMULADOR DE AVATARES
   ============================================================ */
var Simulador = {};

/* ------------------------------------------------------------
   IMAGENS — NÃO SUBSTITUIR
   Cole aqui o bloco ORIGINAL do seu arquivo, com todas as Base64.
   Deve começar assim:
     Simulador.imagens = {"urbanSkater": "data:image/jpeg;base64,...", ...};
   ------------------------------------------------------------ */
/* ⬇️⬇️⬇️ COLE AQUI O BLOCO 'Simulador.imagens' DO SEU ARQUIVO ORIGINAL ⬇️⬇️⬇️ */

Simulador.imagens = {
  /* ... (o bloco gigante de Base64 original vai aqui, intacto) ... */
};

/* ⬆️⬆️⬆️ FIM DO BLOCO DE IMAGENS — NÃO MEXER ACIMA ⬆️⬆️⬆️ */


Simulador.graduacoes = [
  "Crua", "Crua e Amarela", "Amarela", "Amarela e Crua", "Laranja",
  "Amarela e Laranja", "Corda Laranja", "Crua e Azul", "Amarela e Azul",
  "Laranja e Azul", "Azul", "Azul e Verde", "Verde", "Verde e Roxa",
  "Roxa", "Roxa e Marrom", "Marrom", "Marrom e Vermelha", "Vermelha"
];

/* ------------------------------------------------------------
   PERSONAGENS — apelidos tradicionais de capoeira
   As CHAVES internas (rootsGinga, urbanSkater...) ficam iguais,
   só o campo `nome` mudou. Nada quebra.
   ------------------------------------------------------------ */
Simulador.personagens = (function () {
  var dados = {
    rootsGinga:      { nome: "Raízes",     atributos:{forca:85,velocidade:60,agilidade:75}, movimentos:["Ginga Tradicional","Rasteira","Meia-Lua de Compasso"], especial:"Chamada de Angola" },
    urbanSkater:     { nome: "Skate",      atributos:{forca:65,velocidade:90,agilidade:85}, movimentos:["Ginga Veloz","Martelo Rodado","Au Sem Mao"],          especial:"Drop do Skate" },
    neonStriker:     { nome: "Relâmpago",  atributos:{forca:75,velocidade:85,agilidade:80}, movimentos:["Ginga Elétrica","Armada","Queixada Neon"],            especial:"Combo Relâmpago" },
    tribalBalance:   { nome: "Equilíbrio", atributos:{forca:70,velocidade:75,agilidade:90}, movimentos:["Ginga Cadenciada","Bênção","Au de Cabeça"],           especial:"Toque do Berimbau" },
    tribal2:         { nome: "Tribal",     atributos:{forca:80,velocidade:70,agilidade:80}, movimentos:["Ginga Firme","Chute Frontal Tático","Voo do Morcego"], especial:"Escudo Ancestral" },
    stealthMartial:  { nome: "Sombra",     atributos:{forca:70,velocidade:95,agilidade:95}, movimentos:["Ginga Agachada","Mortal Trancado","Corta-Capim Furtivo"], especial:"Ataque Fantasma" },
    futuroBananeira: { nome: "Bananeira",  atributos:{forca:75,velocidade:80,agilidade:95}, movimentos:["Ginga Invertida","Bananeira Estática","Queda de Rins"],  especial:"Au Batido Infinito" },
    classicChute:    { nome: "Bênção",     atributos:{forca:85,velocidade:75,agilidade:70}, movimentos:["Ginga Padrão","Martelo de Pé","Chute Frontal Cruzado"], especial:"Bênção Devastadora" },
    reggaeRhythm:    { nome: "Reggae",     atributos:{forca:68,velocidade:72,agilidade:85}, movimentos:["Ginga Gingada","Rasteira em Círculo","Au Agulha"],       especial:"Onda de Vibração" },
    mysticFlow:      { nome: "Místico",    atributos:{forca:60,velocidade:85,agilidade:95}, movimentos:["Ginga Leve","Meia-Lua Flutuante","Esquiva Fluida"],     especial:"Fluxo Místico" },
    sereno:          { nome: "Sereno",     atributos:{forca:75,velocidade:80,agilidade:90}, movimentos:["Ginga Serena","Bananeira Livre","Au Sem Mão"],          especial:"Equilíbrio Total" },
    agulha:          { nome: "Agulha",     atributos:{forca:70,velocidade:80,agilidade:85}, movimentos:["Ginga Precisa","Au Agulha","Rasteira Cruzada"],         especial:"Ponto Certeiro" },
    onca:            { nome: "Onça",       atributos:{forca:88,velocidade:82,agilidade:88}, movimentos:["Ginga Felina","Rasteira da Onça","Bote Certeiro"],      especial:"Salto da Onça" },
    professor:       { nome: "Mestre",     atributos:{forca:95,velocidade:85,agilidade:90}, movimentos:["Ginga do Mestre","Rasteira Ensinada","Golpe de Autoridade"], especial:"Chamada do Mestre", exclusivo:"professor" }
  };
  function congelar(o) {
    Object.getOwnPropertyNames(o).forEach(function (k) {
      if (o[k] && typeof o[k] === "object") congelar(o[k]);
    });
    return Object.freeze(o);
  }
  return congelar(dados);
})();

/* ------------------------------------------------------------
   ESTADO DE BATALHA (energia)
   ------------------------------------------------------------ */
Simulador.estadoBatalha = {};
Simulador.resetarEstadoBatalha = function () {
  var e = {};
  Object.keys(Simulador.personagens).forEach(function (k) { e[k] = { energia: 100 }; });
  Simulador.estadoBatalha = e;
};
Simulador.resetarEstadoBatalha();

Simulador.descansar = function (chave) {
  var estado = Simulador.estadoBatalha[chave];
  if (estado) estado.energia = Math.min(100, estado.energia + 25);
};

Simulador.avatarSelecionadoTemp = null;

/* ------------------------------------------------------------
   AVATARES CUSTOMIZADOS
   ------------------------------------------------------------ */
Simulador.CUSTOM_KEY = 'uc_avatares_custom_v1';
Simulador.carregarCustomLocal = function () {
  try { return JSON.parse(localStorage.getItem(Simulador.CUSTOM_KEY) || '[]'); } catch (e) { return []; }
};
Simulador.salvarCustomLocal = function (lista) {
  try { localStorage.setItem(Simulador.CUSTOM_KEY, JSON.stringify(lista)); } catch (e) {}
};
Simulador.obterPersonagem = function (chave) {
  if (Simulador.personagens[chave]) return Simulador.personagens[chave];
  var custom = Simulador.carregarCustomLocal().find(function (c) { return c.id === chave; });
  if (custom) {
    return {
      nome: custom.nome || 'Avatar Custom',
      atributos: custom.atributos || { forca: 70, velocidade: 70, agilidade: 70 },
      movimentos: custom.movimentos || ['Ginga', 'Rasteira', 'Meia-Lua'],
      especial: custom.especial || 'Golpe Especial',
      custom: true,
      img: custom.img
    };
  }
  var aluno = alunoLogado();
  if (aluno && aluno.avatarCustomId === chave && aluno.avatarCustomImg) {
    return {
      nome: aluno.apelidoAvatarSimulador || 'Meu Avatar',
      atributos: (aluno.avatarAprendizado && aluno.avatarAprendizado.atributos) || { forca: 70, velocidade: 70, agilidade: 70 },
      movimentos: ['Ginga', 'Rasteira', 'Meia-Lua'],
      especial: 'Golpe Aprendido',
      custom: true,
      img: aluno.avatarCustomImg
    };
  }
  return null;
};
Simulador.obterImagem = function (chave) {
  if (Simulador.imagens[chave]) return Simulador.imagens[chave];
  var p = Simulador.obterPersonagem(chave);
  return (p && p.img) || null;
};

/* ------------------------------------------------------------
   APRENDIZADO
   ------------------------------------------------------------ */
Simulador.obterAprendizado = function (aluno) {
  var a = (aluno && aluno.avatarAprendizado) || {};
  return {
    totalTreinos:   a.totalTreinos   || 0,
    totalCombates:  a.totalCombates  || 0,
    totalCuidados:  a.totalCuidados  || 0,
    golpes:         a.golpes         || {},
    estilo:         a.estilo         || 'iniciante',
    bonusPrecisao:  a.bonusPrecisao  || 0,
    bonusImpacto:   a.bonusImpacto   || 0,
    atributos:      a.atributos      || null
  };
};

Simulador.registrarAprendizado = function (tipo, detalhe) {
  var aluno = alunoLogado();
  if (!aluno || !sessaoAlunoId) return Promise.resolve();
  var apr = Simulador.obterAprendizado(aluno);
  if (tipo === 'treino') {
    apr.totalTreinos += 1;
    apr.bonusImpacto = Math.min(25, (apr.bonusImpacto || 0) + 1);
  } else if (tipo === 'combate') {
    apr.totalCombates += 1;
    var golpe = detalhe || 'golpe';
    apr.golpes[golpe] = (apr.golpes[golpe] || 0) + 1;
    apr.bonusPrecisao = Math.min(30, (apr.bonusPrecisao || 0) + 1);
  } else if (tipo === 'cuidado') {
    apr.totalCuidados += 1;
  }
  var total = apr.totalTreinos + apr.totalCombates + Math.floor(apr.totalCuidados / 3);
  if (total >= 40) apr.estilo = 'mestre';
  else if (total >= 20) apr.estilo = 'avancado';
  else if (total >= 8) apr.estilo = 'intermediario';
  else apr.estilo = 'iniciante';

  return DB.atualizar('alunos', sessaoAlunoId, { avatarAprendizado: apr }).then(function () {
    Simulador.atualizarUIAprendizado();
    return apr;
  });
};

Simulador.atualizarUIAprendizado = function () {
  var aluno = alunoLogado();
  if (!aluno) return;
  var apr = Simulador.obterAprendizado(aluno);
  var box = $('simBarrasAprendizado');
  var txt = $('simTxtAprendizado');
  if (txt) {
    txt.textContent = 'Estilo: ' + apr.estilo.toUpperCase() +
      ' · Treinos: ' + apr.totalTreinos +
      ' · Combates: ' + apr.totalCombates +
      ' · Cuidados: ' + apr.totalCuidados +
      ' · Bônus precisão +' + apr.bonusPrecisao + '% · impacto +' + apr.bonusImpacto + '%';
  }
  if (box) {
    var topGolpes = Object.keys(apr.golpes)
      .sort(function (a, b) { return apr.golpes[b] - apr.golpes[a]; })
      .slice(0, 3);
    box.innerHTML = topGolpes.length
      ? 'Golpes favoritos: ' + topGolpes.map(function (g) { return g + ' (' + apr.golpes[g] + ')'; }).join(' · ')
      : 'Ainda sem golpes registrados — treine e lute para o avatar aprender.';
  }
};

/* ------------------------------------------------------------
   ANIMAÇÃO: poses + interpolação
   ------------------------------------------------------------ */
Simulador._frameBalanco = 0;
Simulador._canvas = null;
Simulador._ctx = null;
Simulador._imgObjCache = {};
Simulador._ultimoFrame = 0;
Simulador._loopAtivo = false;

Simulador.PIXEL_MAP = {
  rootsGinga: 'roots', urbanSkater: 'urban', neonStriker: 'neon',
  tribalBalance: 'tribal', tribal2: 'elder', stealthMartial: 'stealth',
  futuroBananeira: 'futuro', classicChute: 'classic', reggaeRhythm: 'reggae',
  mysticFlow: 'mystic', sereno: 'roots', agulha: 'classic', onca: 'stealth',
  professor: 'elder'
};

Simulador.ANIM = {
  ginga:      { bobY: 6,  swayX: 10, rotacao:  0.04, escala: 1.00, velocidade: 1.0 },
  chute:      { bobY: 12, swayX: 22, rotacao: -0.12, escala: 1.08, velocidade: 2.2 },
  guarda:     { bobY: 2,  swayX: 0,  rotacao:  0.00, escala: 0.94, velocidade: 1.4 },
  danca:      { bobY: 14, swayX: 16, rotacao:  0.18, escala: 1.02, velocidade: 1.8 },
  bananeira:  { bobY: 4,  swayX: 0,  rotacao:  Math.PI, escala: 1.00, velocidade: 1.2 }
};

Simulador._anim = {
  poseAtual: 'ginga',
  poseAnterior: 'ginga',
  progresso: 1,
  t: 0
};
Simulador._poseAtual = 'ginga';
Simulador._poseAte = 0;

Simulador.setPose = function (pose, ms) {
  if (!Simulador.ANIM[pose]) pose = 'ginga';
  if (Simulador._anim.poseAtual !== pose) {
    Simulador._anim.poseAnterior = Simulador._anim.poseAtual;
    Simulador._anim.poseAtual = pose;
    Simulador._anim.progresso = 0;
  }
  Simulador._poseAtual = pose;
  Simulador._poseAte = Date.now() + (ms || 900);
};

function _lerp(a, b, t) { return a + (b - a) * t; }

/* ============================================================
   ENTRADA DO MUNDO
   ============================================================ */
Simulador.entrarMundoAberto = function () {
  abrirAba('tabSimulador');
};

Simulador.render = function () {
  var aluno = (typeof alunoLogado === "function") ? alunoLogado() : null;
  var areaLogin = $('simAreaLogin');
  var areaJogo = $('simAreaJogo');

  if (!aluno) {
    areaJogo.style.display = "none";
    areaLogin.style.display = "block";
    areaLogin.innerHTML =
      '<div class="card card-destaque brilho-verde" style="border:1px solid var(--primary-green);">' +
        '<h3><i class="fas fa-globe"></i> Mundo Aberto — Academia</h3>' +
        '<p style="font-size:0.8rem;margin-bottom:8px;">Bem-vindo ao Universo Capoeira! Aqui ficam o <b>avatar</b>, o <b>Terreiro</b>, o cuidado estilo Tamagotchi e o treino/combate — tudo num só lugar.</p>' +
        '<p class="mini" style="margin-bottom:10px;">Para entrar no mundo você precisa estar cadastrado na academia.</p>' +
        '<button class="btn" onclick="Simulador.pedirCadastroAcademia()"><i class="fas fa-user-plus"></i> Cadastrar na Academia</button>' +
        '<button class="btn btn-secondary" onclick="Simulador.pedirLoginAcademia()"><i class="fas fa-sign-in-alt"></i> Já tenho conta — Entrar</button>' +
        Simulador.botaoModoTesteHTML() +
      '</div>' +
      '<div class="card">' +
        '<h3><i class="fas fa-info-circle"></i> O que você encontra no Mundo</h3>' +
        '<ul class="mini" style="padding-left:18px;line-height:1.6;">' +
          '<li>Avatar que aprende com seus treinos</li>' +
          '<li>Terreiro virtual com quem está online</li>' +
          '<li>Cuidar do avatar (fome, humor, energia)</li>' +
          '<li>Combate e movimentos de capoeira</li>' +
        '</ul>' +
      '</div>';
    return;
  }

  if (!aluno.avatarSimulador) {
    areaLogin.style.display = "block";
    areaJogo.style.display = "none";
    Simulador.renderEscolhaAvatar(aluno);
  } else {
    areaLogin.style.display = "none";
    areaJogo.style.display = "block";
    Simulador.iniciarJogo(aluno);
  }
};

Simulador.pedirCadastroAcademia = function () {
  abrirAba('tab3');
  setTimeout(function () {
    try {
      if (typeof toggleAutoCadastroAluno === 'function') toggleAutoCadastroAluno(true);
      try { mostrarToast('Cadastre-se para entrar no Mundo Aberto!'); } catch (e) {}
      var card = $('cardAlunoPrimeiroCadastro');
      if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (e2) {}
  }, 200);
};

Simulador.pedirLoginAcademia = function () {
  abrirAba('tab3');
  setTimeout(function () {
    try {
      if (typeof toggleAutoCadastroAluno === 'function') toggleAutoCadastroAluno(false);
      try { mostrarToast('Entre com sua conta para acessar o Mundo.'); } catch (e) {}
      var card = $('cardAlunoLogin');
      if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      var inp = $('alunoLoginNome');
      if (inp) inp.focus();
    } catch (e2) {}
  }, 200);
};

Simulador.trocarAvatar = function () {
  var aluno = alunoLogado();
  if (!aluno) return;
  $('simAreaJogo').style.display = "none";
  $('simAreaLogin').style.display = "block";
  Simulador.renderEscolhaAvatar(aluno);
};

/* ============================================================
   TELA DE ESCOLHA — grade sem nomes, aluno batiza
   ============================================================ */
Simulador.renderEscolhaAvatar = function (aluno) {
  var modoProfessor = !!(window.equipeDesbloqueada || window.modoProfessor);
  var apelidoPadrao = aluno.apelidoAvatarSimulador || '';
  Simulador.avatarSelecionadoTemp = aluno.avatarSimulador || null;

  var html =
    '<div class="card">' +
      '<h3><i class="fas fa-user-astronaut"></i> Escolha seu avatar</h3>' +
      '<p class="mini" style="margin-bottom:10px;">Olhe as imagens, escolha a que mais combina com você e dê um <b>nome de capoeira</b>. Esse será o seu apelido no Mundo Aberto.</p>' +

      '<label class="campo-label" style="font-weight:bold;">🥋 Batize seu avatar</label>' +
      '<input id="simInputApelido" value="' + esc(apelidoPadrao) + '" placeholder="Ex: Besouro, Cobra Verde, Zumbi Jr..." autocomplete="off" maxlength="20">' +
      '<p class="mini" style="margin-top:4px;opacity:0.7;">Máximo 20 caracteres. Se deixar vazio, usaremos o nome padrão do avatar.</p>' +

      '<div id="simGridAvatares" style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:16px 0 12px 0;"></div>' +

      '<label class="campo-label">Ou adicione uma imagem do aparelho</label>' +
      '<input type="file" id="simInputCustomAvatar" accept="image/png,image/jpeg,image/webp" style="margin-bottom:8px;">' +
      '<p class="mini" style="margin-bottom:12px;">A imagem fica salva no seu cadastro. Ela também aprende com seus treinos.</p>' +

      '<button class="btn" onclick="Simulador.confirmarAvatar()"><i class="fas fa-check"></i> Confirmar</button>' +
    '</div>';

  $('simAreaLogin').innerHTML = html;
  var grid = $('simGridAvatares');

  function marcarCard(card, chave) {
    grid.querySelectorAll('[data-chave]').forEach(function (c) {
      c.style.borderColor = 'var(--card-border)';
      c.style.transform = 'scale(1)';
      c.style.boxShadow = 'none';
    });
    card.style.borderColor = 'var(--primary-green)';
    card.style.transform = 'scale(1.05)';
    card.style.boxShadow = '0 0 12px rgba(0,230,118,0.6)';
    Simulador.avatarSelecionadoTemp = chave;
  }

  /* grade SÓ com imagem — sem nome visível */
  Object.keys(Simulador.personagens).forEach(function (chave) {
    var p = Simulador.personagens[chave];
    var ehProfessor = p.exclusivo === 'professor';
    if (ehProfessor && !modoProfessor) return;
    if (!ehProfessor && modoProfessor) return;

    var img = Simulador.imagens[chave];
    var card = document.createElement('div');
    card.style.cssText =
      'background:var(--card-bg);border:2px solid var(--card-border);border-radius:10px;' +
      'padding:4px;cursor:pointer;transition:transform .15s, box-shadow .15s, border-color .15s;' +
      'aspect-ratio:1;display:flex;align-items:center;justify-content:center;overflow:hidden;';
    card.dataset.chave = chave;
    card.innerHTML = img
      ? '<img src="' + img + '" alt="avatar" style="width:100%;height:100%;object-fit:contain;background:#0a0a0a;border-radius:8px;pointer-events:none;">'
      : '<div style="width:100%;height:100%;background:#0a0a0a;border-radius:8px;"></div>';
    card.onclick = function () { marcarCard(card, chave); };
    if (Simulador.avatarSelecionadoTemp === chave) marcarCard(card, chave);
    grid.appendChild(card);
  });

  /* avatares custom salvos no aparelho */
  Simulador.carregarCustomLocal().forEach(function (c) {
    var card = document.createElement('div');
    card.style.cssText =
      'background:var(--card-bg);border:2px solid var(--card-border);border-radius:10px;' +
      'padding:4px;cursor:pointer;transition:transform .15s, box-shadow .15s, border-color .15s;' +
      'aspect-ratio:1;display:flex;align-items:center;justify-content:center;overflow:hidden;';
    card.dataset.chave = c.id;
    card.innerHTML =
      '<img src="' + c.img + '" alt="avatar" style="width:100%;height:100%;object-fit:contain;background:#0a0a0a;border-radius:8px;pointer-events:none;">';
    card.onclick = function () { marcarCard(card, c.id); };
    if (Simulador.avatarSelecionadoTemp === c.id) marcarCard(card, c.id);
    grid.appendChild(card);
  });

  var fileInput = $('simInputCustomAvatar');
  if (fileInput) {
    fileInput.onchange = function () {
      var file = fileInput.files && fileInput.files[0];
      if (!file) return;
      if (file.size > 900000) {
        try { mostrarToast('Imagem muito grande (máx ~900KB).', 'erro'); }
        catch (e) { alert('Imagem muito grande.'); }
        return;
      }
      var reader = new FileReader();
      reader.onload = function () {
        var dataUrl = reader.result;
        var id = 'custom_' + Date.now();
        var nome = ($('simInputApelido').value || '').trim() || 'Meu Avatar';
        var lista = Simulador.carregarCustomLocal();
        lista.push({
          id: id, nome: nome, img: dataUrl,
          atributos: { forca: 70, velocidade: 70, agilidade: 70 },
          movimentos: ['Ginga', 'Rasteira', 'Meia-Lua'],
          especial: 'Golpe Aprendido',
          criadoEm: (new Date()).toISOString()
        });
        Simulador.salvarCustomLocal(lista);
        Simulador.avatarSelecionadoTemp = id;
        Simulador._pendingCustomImg = dataUrl;
        Simulador._pendingCustomNome = nome;

        var card = document.createElement('div');
        card.style.cssText =
          'background:var(--card-bg);border:2px solid var(--primary-green);border-radius:10px;' +
          'padding:4px;cursor:pointer;aspect-ratio:1;display:flex;align-items:center;' +
          'justify-content:center;overflow:hidden;transform:scale(1.05);' +
          'box-shadow:0 0 12px rgba(0,230,118,0.6);';
        card.dataset.chave = id;
        card.innerHTML =
          '<img src="' + dataUrl + '" alt="avatar" style="width:100%;height:100%;object-fit:contain;background:#0a0a0a;border-radius:8px;pointer-events:none;">';
        card.onclick = function () { marcarCard(card, id); };
        grid.appendChild(card);

        try { mostrarToast('Imagem adicionada! Dê um nome e confirme.'); } catch (e2) {}
      };
      reader.readAsDataURL(file);
    };
  }

  setTimeout(function () {
    var inp = $('simInputApelido');
    if (inp) inp.focus();
  }, 100);
};

Simulador.confirmarAvatar = function () {
  if (!Simulador.avatarSelecionadoTemp) {
    try { mostrarToast('Escolha um avatar.', 'erro'); } catch (e) { alert('Escolha um avatar.'); }
    return;
  }
  var chave = Simulador.avatarSelecionadoTemp;
  var p = Simulador.obterPersonagem(chave);
  var apelido = ($('simInputApelido').value || '').trim() || (p && p.nome) || 'Avatar';
  var payload = {
    avatarSimulador: chave,
    apelidoAvatarSimulador: apelido
  };
  if (chave.indexOf('custom_') === 0) {
    var img = Simulador._pendingCustomImg || (p && p.img) || null;
    payload.avatarCustomId = chave;
    if (img) payload.avatarCustomImg = img;
  }
  DB.atualizar('alunos', sessaoAlunoId, payload).then(function () {
    Simulador._imgObjCache = {};
    Simulador._pendingCustomImg = null;
    Simulador._pendingCustomNome = null;
    try { publicarPresencaAvatar(); } catch (e) {}
    Simulador.render();
  });
};

/* ============================================================
   JOGO
   ============================================================ */
Simulador.iniciarJogo = function (aluno) {
  var chave = aluno.avatarSimulador;
  var p = Simulador.obterPersonagem(chave);
  if (!p) { Simulador.renderEscolhaAvatar(aluno); return; }

  if (!Simulador.estadoBatalha[chave]) Simulador.estadoBatalha[chave] = { energia: 100 };

  if ($('simTxtJogador')) $('simTxtJogador').innerText = aluno.apelidoAvatarSimulador || aluno.apelido || aluno.nome;
  var nivel = aluno.nivelSimulador || 1;
  if ($('simTxtGraduacao')) $('simTxtGraduacao').innerText = 'Corda: ' + (aluno.graduacao || 'Corda Crua') + ' (Nivel ' + nivel + ')';
  if ($('simBarEnergia')) $('simBarEnergia').style.width = Simulador.estadoBatalha[chave].energia + '%';
  Simulador.atualizarBarrasCuidado(aluno);
  Simulador.atualizarUIAprendizado();

  var box = $('simBoxCombate');
  if (box) {
    box.innerHTML = '';
    p.movimentos.forEach(function (mov, idx) {
      var btn = document.createElement('button');
      btn.className = 'btn';
      btn.style.background = ['#d35400', '#9b59b6', '#2980b9'][idx] || '#555';
      btn.innerText = mov;
      btn.onclick = (function (indiceFixo) {
        return function () { Simulador.jogarTurno(chave, indiceFixo); };
      })(idx);
      box.appendChild(btn);
    });
    if (p.especial) {
      var btnEsp = document.createElement('button');
      btnEsp.className = 'btn btn-gold';
      btnEsp.innerText = '⭐ ' + p.especial;
      btnEsp.onclick = function () { Simulador.jogarTurno(chave, -1); };
      box.appendChild(btnEsp);
    }
  }

  var srcImg = Simulador.obterImagem(chave);
  if (srcImg && !Simulador._imgObjCache[chave]) {
    var im = new Image();
    im.crossOrigin = 'anonymous';
    im.src = srcImg;
    Simulador._imgObjCache[chave] = im;
  }

  Simulador._canvas = $('simCanvas');
  if (Simulador._canvas) {
    Simulador._ctx = Simulador._canvas.getContext('2d');
    requestAnimationFrame(function () {
      if (!Simulador._canvas) return;
      Simulador._canvas.width  = Simulador._canvas.clientWidth || 320;
      Simulador._canvas.height = 240;
    });
  }

  try { publicarPresencaAvatar(); renderTerreiroListas(); Simulador.renderTerreiroLocal(); } catch (e) {}

  if (Simulador._loopAtivo) return;
  Simulador._loopAtivo = true;
  Simulador._ultimoFrame = performance.now();
  Simulador._loop();
};

Simulador.renderTerreiroLocal = function () {
  var box = $('listaTerreiroSimulador');
  if (!box) return;
  try {
    var lista = (typeof listarAvataresVisiveis === 'function') ? listarAvataresVisiveis() : [];
    if (!lista.length) {
      box.innerHTML = '<p class="sem-dados" style="grid-column:1/-1;">Ninguém no terreiro agora. Faça login e escolha um avatar.</p>';
      return;
    }
    box.innerHTML = lista.map(function (a) {
      return (typeof htmlAvatarChip === 'function') ? htmlAvatarChip(a, true) :
        '<div class="mini">' + esc(a.alunoApelido || a.alunoNome || '?') + '</div>';
    }).join('');
  } catch (e) {
    box.innerHTML = '<p class="sem-dados">Terreiro indisponível no momento.</p>';
  }
};

/* ------------------------------------------------------------
   LOOP DE ANIMAÇÃO
   ------------------------------------------------------------ */
Simulador._loop = function () {
  var canvas = Simulador._canvas, ctx = Simulador._ctx;
  if (!canvas || !ctx) { Simulador._loopAtivo = false; return; }

  if (canvas.offsetParent === null) {
    Simulador._loopAtivo = false;
    return;
  }

  var w = canvas.width, h = canvas.height;
  if (w === 0 || h === 0) { requestAnimationFrame(Simulador._loop); return; }

  var agora = performance.now();
  var dt = Math.min(64, agora - (Simulador._ultimoFrame || agora));
  Simulador._ultimoFrame = agora;

  /* fundo terreiro */
  var g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#0d3d1f');
  g.addColorStop(0.55, '#0a2a38');
  g.addColorStop(1, '#061018');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  /* chão */
  ctx.fillStyle = 'rgba(0,230,118,0.10)';
  ctx.fillRect(0, h - 30, w, 30);

  /* volta pra ginga automaticamente */
  if (Date.now() > Simulador._poseAte && Simulador._anim.poseAtual !== 'ginga') {
    Simulador.setPose('ginga', 0);
  }
  Simulador._anim.progresso = Math.min(1, Simulador._anim.progresso + dt / 260);
  Simulador._anim.t += dt;

  var A = Simulador.ANIM;
  var cur = A[Simulador._anim.poseAtual] || A.ginga;
  var ant = A[Simulador._anim.poseAnterior] || A.ginga;
  var p = Simulador._anim.progresso;

  var bobY   = _lerp(ant.bobY,       cur.bobY,       p);
  var swayX  = _lerp(ant.swayX,      cur.swayX,      p);
  var rot    = _lerp(ant.rotacao,    cur.rotacao,    p);
  var escala = _lerp(ant.escala,     cur.escala,     p);
  var vel    = _lerp(ant.velocidade, cur.velocidade, p);

  var t = Simulador._anim.t * 0.001 * vel;
  var dx = Math.sin(t * 3.2) * swayX;
  var dy = Math.abs(Math.cos(t * 3.2)) * bobY;
  var angulo = Math.sin(t * 3.2) * rot;
  var pulso = 1 + Math.sin(t * 2.4) * 0.015 * escala;

  /* sombra */
  var sombraLargura = Math.max(30, 60 * escala - dy * 1.4);
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.ellipse(w / 2 + dx, h - 22, sombraLargura, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  /* avatar */
  var aluno = alunoLogado();
  var chave = aluno && aluno.avatarSimulador;
  var im = chave && Simulador._imgObjCache[chave];
  var ehCustom = chave && String(chave).indexOf('custom_') === 0;

  var cx = w / 2 + dx;
  var cy = h * 0.55 - dy;
  var TAM = 150 * escala * pulso;

  if (!ehCustom && typeof TAMA_CHARS !== 'undefined' && Simulador.PIXEL_MAP[chave]) {
    var pixelId = Simulador.PIXEL_MAP[chave];
    var ch = null;
    for (var i = 0; i < TAMA_CHARS.length; i++) {
      if (TAMA_CHARS[i].id === pixelId) { ch = TAMA_CHARS[i]; break; }
    }
    if (ch && typeof tamaDrawPixelChar === 'function') {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angulo);
      tamaDrawPixelChar(ctx, ch, 0, -TAM / 2, escala, 0);
      ctx.restore();
    }
  } else if (im && im.complete && im.naturalWidth > 0) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angulo);
    ctx.drawImage(im, -TAM / 2, -TAM / 2, TAM, TAM);
    ctx.restore();

    /* aura dourada na bananeira */
    if (Simulador._anim.poseAtual === 'bananeira') {
      ctx.save();
      ctx.globalAlpha = 0.5 + Math.sin(t * 6) * 0.3;
      ctx.strokeStyle = '#ffd54f';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, TAM * 0.6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    /* flash verde no chute */
    if (Simulador._anim.poseAtual === 'chute') {
      ctx.save();
      ctx.globalAlpha = 0.35 * (1 - Simulador._anim.progresso);
      ctx.fillStyle = '#00e676';
      ctx.beginPath();
      ctx.arc(cx, cy, TAM * 0.55, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  } else if (chave) {
    ctx.fillStyle = 'rgba(0,230,118,0.6)';
    ctx.beginPath();
    ctx.arc(cx, cy, 40, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = '11px monospace';
  ctx.fillText('pose: ' + Simulador._anim.poseAtual, 8, h - 8);

  requestAnimationFrame(Simulador._loop);
};

/* ============================================================
   COMBATE
   ============================================================ */
Simulador.executarMovimento = function (chave, indice) {
  var p = Simulador.obterPersonagem(chave);
  var estado = Simulador.estadoBatalha[chave];
  if (!p || !estado) return "Personagem nao encontrado.";
  if (estado.energia < 15) return p.nome + " esta exausto! Precisa descansar na ginga.";

  var golpe = (indice === -1) ? p.especial : (p.movimentos[indice] || p.especial);
  var custo = (golpe === p.especial) ? 30 : 15;
  estado.energia = Math.max(0, estado.energia - custo);

  var aluno = alunoLogado();
  var apr = Simulador.obterAprendizado(aluno);
  var basePrec = Math.floor(Math.random() * (p.atributos.agilidade || 70));
  var baseImp  = Math.floor(((p.atributos.forca || 70) * (p.atributos.velocidade || 70)) / 100);
  var precisao = Math.min(100, basePrec + (apr.bonusPrecisao || 0));
  var impacto  = Math.min(150, baseImp  + (apr.bonusImpacto  || 0));

  return {
    texto: p.nome + " aplicou [" + golpe + "]!" + (apr.estilo !== 'iniciante' ? ' (estilo ' + apr.estilo + ')' : ''),
    precisao: precisao,
    impacto: impacto,
    energiaRestante: estado.energia,
    golpe: golpe
  };
};

Simulador.jogarTurno = function (chave, indice) {
  var r = Simulador.executarMovimento(chave, indice);
  var cons = $('simConsole');
  if (typeof r === 'string') {
    if (cons) cons.innerHTML = r;
    return;
  }

  if (indice === -1)      Simulador.setPose('bananeira', 1400);
  else if (indice === 2)  Simulador.setPose('guarda', 900);
  else if (indice === 1)  Simulador.setPose('danca', 900);
  else                    Simulador.setPose('chute', 900);

  if (cons) cons.innerHTML = r.texto + ' Impacto: ' + r.impacto + ' | Precisão: ' + r.precisao;
  if ($('simBarEnergia')) $('simBarEnergia').style.width = r.energiaRestante + '%';

  Simulador.registrarAprendizado('combate', r.golpe).then(function (apr) {
    if (cons && apr) {
      cons.innerHTML += '<br><span style="color:var(--gold);">Avatar aprendeu! Estilo: ' + apr.estilo +
        ' · Bônus precisão +' + apr.bonusPrecisao + '%</span>';
    }
  });
};

/* ============================================================
   TREINO E CUIDADOS
   ============================================================ */
Simulador.treinar = function () {
  var aluno = alunoLogado();
  if (!aluno) return;
  var chave = aluno.avatarSimulador;
  if (!Simulador.estadoBatalha[chave]) Simulador.estadoBatalha[chave] = { energia: 100 };
  var treinos = (aluno.treinosSimulador || 0) + 1;
  var nivel = (aluno.nivelSimulador || 1) + 1;

  DB.atualizar('alunos', sessaoAlunoId, {
    treinosSimulador: treinos,
    nivelSimulador: nivel
  }).then(function () {
    Simulador.descansar(chave);
    if ($('simTxtGraduacao')) $('simTxtGraduacao').innerText = 'Corda: ' + (aluno.graduacao || 'Corda Crua') + ' (Nivel ' + nivel + ')';
    if ($('simBarEnergia')) $('simBarEnergia').style.width = Simulador.estadoBatalha[chave].energia + '%';
    Simulador.setPose('danca', 900);
    Simulador.registrarAprendizado('treino').then(function (apr) {
      var cons = $('simConsole');
      if (cons) cons.innerHTML = 'Treino confirmado! Avatar evoluiu (estilo ' + ((apr && apr.estilo) || 'iniciante') + ').';
    });
  });
};

Simulador.atualizarBarrasCuidado = function (aluno) {
  var fome  = (aluno.fomeSimulador  != null) ? aluno.fomeSimulador  : 100;
  var humor = (aluno.humorSimulador != null) ? aluno.humorSimulador : 100;
  if ($('simBarFome'))  $('simBarFome').style.width  = fome + '%';
  if ($('simBarHumor')) $('simBarHumor').style.width = humor + '%';
};

Simulador.alimentar = function () {
  var aluno = alunoLogado();
  if (!aluno) return;
  var fome = Math.min(100, (aluno.fomeSimulador != null ? aluno.fomeSimulador : 100) + 20);
  DB.atualizar('alunos', sessaoAlunoId, { fomeSimulador: fome }).then(function () {
    if ($('simBarFome')) $('simBarFome').style.width = fome + '%';
    var cons = $('simConsole');
    if (cons) cons.innerHTML = 'Avatar alimentado! Fome: ' + Math.round(fome) + '%';
    Simulador.setPose('guarda', 700);
    Simulador.registrarAprendizado('cuidado');
  });
};

Simulador.alongar = function () {
  var aluno = alunoLogado();
  if (!aluno) return;
  var humor = Math.min(100, (aluno.humorSimulador != null ? aluno.humorSimulador : 100) + 15);
  var chave = aluno.avatarSimulador;
  if (!Simulador.estadoBatalha[chave]) Simulador.estadoBatalha[chave] = { energia: 100 };
  DB.atualizar('alunos', sessaoAlunoId, { humorSimulador: humor }).then(function () {
    if ($('simBarHumor')) $('simBarHumor').style.width = humor + '%';
    Simulador.descansar(chave);
    if ($('simBarEnergia')) $('simBarEnergia').style.width = Simulador.estadoBatalha[chave].energia + '%';
    var cons = $('simConsole');
    if (cons) cons.innerHTML = 'Avatar alongou! Humor: ' + Math.round(humor) + '%, energia recuperada.';
    Simulador.setPose('danca', 900);
    Simulador.registrarAprendizado('cuidado');
  });
};

Simulador.controleFlutuante = function (comando) {
  var aluno = alunoLogado();
  if (!aluno) return;
  var chave = aluno.avatarSimulador;
  var cons = $('simConsole');
  if (comando === 'golpe')   { Simulador.setPose('chute', 800);   Simulador.jogarTurno(chave, 0); return; }
  if (comando === 'defesa')  { Simulador.setPose('guarda', 800);  Simulador.jogarTurno(chave, 2); return; }
  if (comando === 'esquerda' || comando === 'direita') {
    Simulador.setPose('danca', 500);
    if (cons) cons.innerHTML = 'Ginga para a ' + (comando === 'esquerda' ? 'esquerda' : 'direita') + '!';
    return;
  }
  if (cons) cons.innerHTML = 'Movimento [' + comando + '] executado.';
};

/* ============================================================
   MODO TESTE — gerenciar o Mundo sem login
   ============================================================ */
Simulador.modoTeste = false;

Simulador._alunoTeste = {
  id: 'TESTE_DEV',
  nome: 'Visitante',
  apelido: 'Visitante',
  apelidoAvatarSimulador: null,
  avatarSimulador: null,
  graduacao: 'Corda Crua',
  nivelSimulador: 1,
  treinosSimulador: 0,
  fomeSimulador: 100,
  humorSimulador: 100,
  avatarAprendizado: {
    totalTreinos: 0, totalCombates: 0, totalCuidados: 0,
    golpes: {}, estilo: 'iniciante',
    bonusPrecisao: 0, bonusImpacto: 0
  }
};

(function instalarModoTeste() {
  var _alunoLogadoOriginal  = window.alunoLogado;
  var _DBAtualizarOriginal  = (window.DB && DB.atualizar) ? DB.atualizar.bind(DB) : null;

  window.alunoLogado = function () {
    if (Simulador.modoTeste) return Simulador._alunoTeste;
    return _alunoLogadoOriginal ? _alunoLogadoOriginal() : null;
  };

  if (window.DB && typeof DB.atualizar === 'function') {
    DB.atualizar = function (colecao, id, payload) {
      if (Simulador.modoTeste && colecao === 'alunos' && id === 'TESTE_DEV') {
        Object.keys(payload || {}).forEach(function (k) {
          Simulador._alunoTeste[k] = payload[k];
        });
        try { if (typeof renderAluno === 'function') renderAluno(); } catch (e) {}
        return Promise.resolve();
      }
      return _DBAtualizarOriginal
        ? _DBAtualizarOriginal(colecao, id, payload)
        : Promise.resolve();
    };
  }

  try {
    Object.defineProperty(window, 'sessaoAlunoId', {
      configurable: true,
      get: function () {
        return Simulador.modoTeste ? 'TESTE_DEV' : (window._sessaoAlunoIdReal || null);
      },
      set: function (v) { window._sessaoAlunoIdReal = v; }
    });
  } catch (e) {}
})();

Simulador.ativarModoTeste = function () {
  Simulador.modoTeste = true;

  if (!Simulador._alunoTeste.avatarSimulador) {
    Simulador._alunoTeste.avatarSimulador = 'rootsGinga';
    Simulador._alunoTeste.apelidoAvatarSimulador = 'Teste';
    Simulador.avatarSelecionadoTemp = 'rootsGinga';
  }

  Simulador.resetarEstadoBatalha();
  Simulador._imgObjCache = {};
  Simulador._injetarPainelTeste();
  Simulador.render();

  try { atualizarStatusFirebase(); } catch (e) {}
  try { mostrarToast('🧪 Modo Teste ativado — nada será salvo.'); } catch (e) {}
};

Simulador.desativarModoTeste = function () {
  Simulador.modoTeste = false;
  Simulador._removerPainelTeste();
  Simulador._imgObjCache = {};
  Simulador.resetarEstadoBatalha();
  Simulador.render();
  try { mostrarToast('Modo Teste desativado.'); } catch (e) {}
};

Simulador.trocarAvatarTeste = function (chave) {
  Simulador._alunoTeste.avatarSimulador = chave;
  Simulador._alunoTeste.apelidoAvatarSimulador = 'Teste';
  Simulador.avatarSelecionadoTemp = chave;
  Simulador._imgObjCache = {};
  Simulador.resetarEstadoBatalha();
  Simulador.render();
};

Simulador.definirApelidoTeste = function (novo) {
  Simulador._alunoTeste.apelidoAvatarSimulador = (novo || '').trim() || 'Teste';
  Simulador.render();
};

Simulador.resetarTeste = function () {
  Simulador._alunoTeste.treinosSimulador = 0;
  Simulador._alunoTeste.nivelSimulador = 1;
  Simulador._alunoTeste.fomeSimulador = 100;
  Simulador._alunoTeste.humorSimulador = 100;
  Simulador._alunoTeste.avatarAprendizado = {
    totalTreinos: 0, totalCombates: 0, totalCuidados: 0,
    golpes: {}, estilo: 'iniciante',
    bonusPrecisao: 0, bonusImpacto: 0
  };
  Simulador.resetarEstadoBatalha();
  Simulador.render();
  try { mostrarToast('Estado de teste resetado.'); } catch (e) {}
};

Simulador.encherEnergia = function () {
  var chave = Simulador._alunoTeste.avatarSimulador;
  if (chave) Simulador.estadoBatalha[chave] = { energia: 100 };
  if ($('simBarEnergia')) $('simBarEnergia').style.width = '100%';
  try { mostrarToast('Energia no máximo.'); } catch (e) {}
};

Simulador._injetarPainelTeste = function () {
  if ($('painelTesteDev')) return;

  var box = document.createElement('div');
  box.id = 'painelTesteDev';
  box.style.cssText =
    'position:fixed;bottom:12px;right:12px;z-index:9999;' +
    'background:rgba(8,20,14,0.94);border:1px solid #00e676;border-radius:10px;' +
    'padding:10px;max-width:260px;color:#e8f5e9;font-size:12px;' +
    'box-shadow:0 4px 20px rgba(0,230,118,0.35);backdrop-filter:blur(6px);';

  box.innerHTML =
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">' +
      '<b style="color:#00e676;">🧪 TESTE</b>' +
      '<button onclick="Simulador.desativarModoTeste()" style="background:transparent;border:none;color:#ff5252;font-size:16px;cursor:pointer;padding:0 4px;">✕</button>' +
    '</div>' +
    '<label style="display:block;font-size:11px;opacity:0.8;margin-bottom:2px;">Apelido</label>' +
    '<input id="painelTesteApelido" value="' + esc(Simulador._alunoTeste.apelidoAvatarSimulador || 'Teste') + '" ' +
      'style="width:100%;margin-bottom:8px;padding:4px;border-radius:6px;border:1px solid #00e676;background:#0a1a12;color:#fff;box-sizing:border-box;" ' +
      'onchange="Simulador.definirApelidoTeste(this.value)">' +

    '<label style="display:block;font-size:11px;opacity:0.8;margin-bottom:2px;">Avatar</label>' +
    '<select id="painelTesteAvatar" onchange="Simulador.trocarAvatarTeste(this.value)" ' +
      'style="width:100%;margin-bottom:8px;padding:4px;border-radius:6px;border:1px solid #00e676;background:#0a1a12;color:#fff;">' +
      '<option value="">— escolha —</option>' +
    '</select>' +

    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">' +
      '<button class="btn-teste" onclick="Simulador.encherEnergia()">⚡ Energia</button>' +
      '<button class="btn-teste" onclick="Simulador.resetarTeste()">♻ Resetar</button>' +
      '<button class="btn-teste" onclick="Simulador.setPose(\'chute\',1500)">🦵 Chute</button>' +
      '<button class="btn-teste" onclick="Simulador.setPose(\'bananeira\',1500)">🤸 Especial</button>' +
      '<button class="btn-teste" onclick="Simulador.setPose(\'danca\',1500)">💃 Dança</button>' +
      '<button class="btn-teste" onclick="Simulador.setPose(\'guarda\',1500)">🛡 Guarda</button>' +
    '</div>' +

    '<div style="font-size:10px;opacity:0.6;margin-top:8px;line-height:1.4;">' +
      'Modo dev · sem login · sem salvar' +
    '</div>';

  document.body.appendChild(box);

  if (!$('stylePainelTeste')) {
    var st = document.createElement('style');
    st.id = 'stylePainelTeste';
    st.textContent =
      '.btn-teste{background:#0f3d24;border:1px solid #00e676;color:#c8ffe0;' +
      'padding:5px 6px;border-radius:6px;font-size:11px;cursor:pointer;transition:background .15s;}' +
      '.btn-teste:hover{background:#00e676;color:#052e1a;}';
    document.head.appendChild(st);
  }

  var sel = $('painelTesteAvatar');
  if (sel) {
    Object.keys(Simulador.personagens).forEach(function (k) {
      var opt = document.createElement('option');
      opt.value = k;
      opt.textContent = Simulador.personagens[k].nome;
      if (k === Simulador._alunoTeste.avatarSimulador) opt.selected = true;
      sel.appendChild(opt);
    });
  }
};

Simulador._removerPainelTeste = function () {
  var box = $('painelTesteDev');
  if (box) box.remove();
};

/* Botão de Modo Teste — só aparece com ?dev=1 na URL */
Simulador.botaoModoTesteHTML = function () {
  var ehDev = /[?&]dev=1/.test(window.location.search);
  if (!ehDev) return '';
  return '<button class="btn btn-secondary" style="margin-top:6px;background:#212121;border:1px dashed #00e676;" ' +
    'onclick="Simulador.ativarModoTeste()"><i class="fas fa-flask"></i> 🧪 Modo Teste (dev)</button>';
};

/* ============================================================
   BOOT
   ============================================================ */
iniciarApp();