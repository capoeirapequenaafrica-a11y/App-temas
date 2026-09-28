/* ================================================================
   CORE.JS — Universo Capoeira (núcleo offline + nuvem)
   ================================================================ */
(function (global) {
  'use strict';

  var VERSAO_APP = 'tama6';
  var CHAVE_LOCAL = 'uc_db';
  var CHAVE_CONFIG_LOCAL = 'uc_config_firebase';
  var FIREBASE_CONFIG_PADRAO = {
    apiKey: 'AIzaSyDlmXcUACxQZ3QMjaQIXsJb_gUnv10P85A',
    authDomain: 'project-10dd7ec8-159b-4351-90a.firebaseapp.com',
    projectId: 'project-10dd7ec8-159b-4351-90a',
    storageBucket: 'project-10dd7ec8-159b-4351-90a.firebasestorage.app',
    messagingSenderId: '944397472361',
    appId: '1:944397472361:web:f66ba584699859727b08f8'
  };
  var GRADUACOES_PADRAO = [
    'Iniciante - Corda Crua', 'Aluno - Crua e Amarela', 'Aluno - Amarela',
    'Aluno - Amarela e Laranja', 'Aluno - Laranja', 'Aluno - Laranja e Azul',
    'Aluno Formado - Azul', 'Aluno Formado - Azul e Verde', 'Aluno Formado - Verde',
    'Aluno Formado - Verde e Roxa', 'Aluno Formado - Roxa', 'Aluno Formado - Roxa e Marrom',
    'Aluno Formado - Marrom', 'Aluno Formado - Marrom e Vermelha',
    'Professor - Vermelha', 'Professor - Vermelha e Branca',
    'Contramestre - Branca', 'Mestre - Branca'
  ];
  var COLECOES = [
    'alunos', 'polos', 'horarios', 'presencas', 'avaliacoes', 'avisos', 'mural',
    'certificados', 'equipe', 'config', 'logs', 'solicitacoes', 'pontosJogos',
    'formacaoInfantil', 'progressoJogos'
  ];
  var CONFIG_PADRAO = {
    tituloApp: 'Universo Capoeira',
    instagram: '@capoeiranapequenaafrica',
    logo1: '', logo2: '',
    tempoTimerSegundos: 90, toleranciaAtrasoMin: 15, janelaCheckinMin: 10,
    horasPorAula: 1.5, graduacoes: GRADUACOES_PADRAO.slice()
  };
  var EQUIPE_PAPEIS = [
    { id: 'professor', nome: 'Professor' },
    { id: 'adm', nome: 'Administração' },
    { id: 'dev', nome: 'Dev / Suporte' }
  ];

  function $(id) { return document.getElementById(id); }
  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function normalizar(v) {
    return String(v || '').trim().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
  function uid() { return 'id' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  function agoraISO() { return new Date().toISOString(); }
  function hashSenha(s) {
    var str = 'uc::' + String(s || '');
    var h = 5381;
    for (var i = 0; i < str.length; i++) { h = ((h << 5) + h) + str.charCodeAt(i); h = h & 0xffffffff; }
    return 'h' + (h >>> 0).toString(16);
  }

  global.$ = $;
  global.esc = esc;
  global.normalizar = normalizar;
  global.uid = uid;
  global.agoraISO = agoraISO;
  global.hashSenha = hashSenha;

  global.mostrarToast = function (msg, tipo) {
    var t = $('toastBox'); if (!t) return;
    t.innerHTML = msg;
    t.className = 'toast' + (tipo === 'erro' ? ' erro' : '');
    t.style.display = 'block';
    clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.style.display = 'none'; }, 3200);
  };
  global.abrirModal = function (titulo, corpoHtml, acoesHtml) {
    if (!$('modalOverlay')) return;
    $('modalTitulo').innerHTML = '<i class="fas fa-circle-info"></i> ' + esc(titulo);
    $('modalCorpo').innerHTML = corpoHtml || '';
    $('modalAcoes').innerHTML = (acoesHtml || '') + '<button class="btn btn-back" onclick="fecharModal()">Fechar</button>';
    $('modalOverlay').classList.add('aberto');
  };
  global.fecharModal = function () {
    var m = $('modalOverlay'); if (m) m.classList.remove('aberto');
  };

  /* DB */
  var DB = {
    modo: 'local', fs: null, cache: {}, listeners: {}, pronto: false, primeiraCarga: {},
    iniciar: function () {
      var cfg = carregarConfigFirebase();
      if (cfg && cfg.projectId && typeof firebase !== 'undefined' && firebase.initializeApp) {
        try {
          if (!firebase.apps || !firebase.apps.length) firebase.initializeApp(cfg);
          this.fs = firebase.firestore();
          this.modo = 'nuvem';
        } catch (e) { console.warn('[DB] Firebase', e); this.modo = 'local'; }
      } else this.modo = 'local';
      if (this.modo === 'nuvem') this.abrirEscutasNuvem();
      else this.carregarLocal();
      this.pronto = true;
      atualizarStatusFirebase();
    },
    abrirEscutasNuvem: function () {
      var self = this;
      COLECOES.forEach(function (col) {
        self.fs.collection(col).onSnapshot(function (snap) {
          var arr = [];
          snap.forEach(function (doc) { arr.push(Object.assign({ id: doc.id }, doc.data())); });
          self.cache[col] = arr; self.primeiraCarga[col] = true; self.avisar(col);
        }, function (err) { console.warn('[DB]', col, err); });
      });
    },
    carregarLocal: function () {
      var bruto = null;
      try { bruto = JSON.parse(localStorage.getItem(CHAVE_LOCAL) || 'null'); } catch (e) {}
      var self = this;
      COLECOES.forEach(function (col) { self.cache[col] = (bruto && bruto[col]) ? bruto[col] : []; });
    },
    persistirLocal: function () {
      try {
        var obj = {}, self = this;
        COLECOES.forEach(function (col) { obj[col] = self.cache[col] || []; });
        localStorage.setItem(CHAVE_LOCAL, JSON.stringify(obj));
      } catch (e) { console.warn('[DB] localStorage', e); }
    },
    listar: function (col) { return this.cache[col] || []; },
    buscar: function (col, id) {
      var l = this.cache[col] || [];
      for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i];
      return null;
    },
    salvar: function (col, obj, id) {
      var dados = Object.assign({}, obj);
      if (this.modo === 'nuvem') {
        var idFinal = id || uid();
        var lista = this.cache[col] || (this.cache[col] = []);
        var idx = -1;
        for (var i = 0; i < lista.length; i++) if (lista[i].id === idFinal) { idx = i; break; }
        if (idx >= 0) lista[idx] = Object.assign({}, lista[idx], dados, { id: idFinal });
        else lista.push(Object.assign({ id: idFinal }, dados));
        this.avisar(col); try { this.persistirLocal(); } catch (e) {}
        return this.fs.collection(col).doc(idFinal).set(dados, { merge: true })
          .then(function () { return idFinal; })
          .catch(function () { return idFinal; });
      }
      var lista2 = this.cache[col] || (this.cache[col] = []);
      if (id) {
        var achou = -1;
        for (var j = 0; j < lista2.length; j++) if (lista2[j].id === id) { achou = j; break; }
        if (achou >= 0) lista2[achou] = Object.assign({}, lista2[achou], dados, { id: id });
        else lista2.push(Object.assign({ id: id }, dados));
      } else {
        id = uid();
        lista2.push(Object.assign({ id: id }, dados));
      }
      this.persistirLocal(); this.avisar(col);
      return Promise.resolve(id);
    },
    atualizar: function (col, id, patch) { return this.salvar(col, patch, id); },
    excluir: function (col, id) {
      if (this.modo === 'nuvem') return this.fs.collection(col).doc(id).delete().catch(function () {});
      this.cache[col] = (this.cache[col] || []).filter(function (x) { return x.id !== id; });
      this.persistirLocal(); this.avisar(col);
      return Promise.resolve();
    },
    escutar: function (col, cb) {
      if (!this.listeners[col]) this.listeners[col] = [];
      this.listeners[col].push(cb);
      cb(this.listar(col));
    },
    avisar: function (col) {
      var lista = this.listar(col);
      (this.listeners[col] || []).forEach(function (cb) { try { cb(lista); } catch (e) {} });
      (this.listeners['*'] || []).forEach(function (cb) { try { cb(col, lista); } catch (e) {} });
    }
  };
  global.DB = DB;

  var CONFIG = Object.assign({}, CONFIG_PADRAO);
  global.CONFIG = CONFIG;

  function aplicarConfig() {
    document.title = CONFIG.tituloApp;
    if ($('handleInstagramAcademiaTxt')) $('handleInstagramAcademiaTxt').textContent = CONFIG.instagram;
    if (CONFIG.logo1 && $('headerLogo1')) { $('headerLogo1').src = CONFIG.logo1; $('headerLogo1').style.display = 'block'; }
    if (CONFIG.logo2 && $('headerLogo2')) { $('headerLogo2').src = CONFIG.logo2; $('headerLogo2').style.display = 'block'; }
    if ($('footerInfo')) $('footerInfo').textContent = CONFIG.tituloApp;
    renderGraduacoes();
  }
  function carregarConfigApp(lista) {
    var doc = null;
    for (var i = 0; i < lista.length; i++) if (lista[i].id === 'app') { doc = lista[i]; break; }
    CONFIG = Object.assign({}, CONFIG_PADRAO, doc || {});
    if (!Array.isArray(CONFIG.graduacoes) || !CONFIG.graduacoes.length) CONFIG.graduacoes = GRADUACOES_PADRAO.slice();
    aplicarConfig();
  }
  function carregarConfigFirebase() {
    try {
      var s = JSON.parse(localStorage.getItem(CHAVE_CONFIG_LOCAL) || 'null');
      return s || FIREBASE_CONFIG_PADRAO;
    } catch (e) { return FIREBASE_CONFIG_PADRAO; }
  }
  function atualizarStatusFirebase() {
    var el = $('firebaseStatus'); if (!el) return;
    if (DB.modo === 'nuvem') { el.className = 'status-firebase status-online'; el.textContent = 'ONLINE'; }
    else { el.className = 'status-firebase status-offline'; el.textContent = 'OFFLINE'; }
  }
  function renderGraduacoes() {
    ['autoCadGraduacaoSelect'].forEach(function (id) {
      var s = $(id); if (!s) return;
      var at = s.value, h = '';
      CONFIG.graduacoes.forEach(function (g) { h += '<option value="' + esc(g) + '">' + esc(g) + '</option>'; });
      s.innerHTML = h; if (at) s.value = at;
    });
  }
  global.renderGraduacoes = renderGraduacoes;

  /* Sessão */
  var sessaoAlunoId = null, sessaoEquipe = null;
  global.alunoLogado = function () { return sessaoAlunoId ? DB.buscar('alunos', sessaoAlunoId) : null; };

  /* Abas */
  var abaAtual = 'tab1';
  global.abrirAba = function (id, btn) {
    abaAtual = id;
    document.querySelectorAll('.tab-content').forEach(function (el) { el.classList.remove('active'); });
    var alvo = $(id); if (alvo) alvo.classList.add('active');
    var pai = btn || null;
    if (!pai) {
      document.querySelectorAll('.tabs button').forEach(function (b) {
        var oc = b.getAttribute('onclick') || '';
        if (oc.indexOf("'" + id + "'") >= 0) pai = b;
      });
    }
    if (pai) {
      var c = pai.closest('.tabs');
      if (c) c.querySelectorAll('button').forEach(function (b) { b.classList.remove('active'); });
      pai.classList.add('active');
    }
    renderizarAba(id);
  };
  global.toggleMenuEquipe = function () {
    var t = $('tabsEquipe');
    var abrir = t.style.display === 'none';
    t.style.display = abrir ? 'flex' : 'none';
    $('btnToggleEquipe').classList.toggle('active', abrir);
    if (abrir) abrirAba('tab4');
    else if (['tab4', 'tab5', 'tab6'].indexOf(abaAtual) >= 0) abrirAba('tab1');
  };
  function revelarAcessoEquipe() {
    var b = $('btnToggleEquipe');
    if (b && b.style.display === 'none') {
      b.style.display = 'flex';
      mostrarToast('Acesso da equipe liberado.');
    }
    toggleMenuEquipe();
  }
  function instalarGestoAcessoEquipe() {
    var alvo = $('headerAppTopo'); if (!alvo) return;
    var t = null;
    var ini = function () { t = setTimeout(revelarAcessoEquipe, 700); };
    var canc = function () { if (t) { clearTimeout(t); t = null; } };
    alvo.addEventListener('touchstart', ini, { passive: true });
    alvo.addEventListener('touchend', canc);
    alvo.addEventListener('touchmove', canc);
    alvo.addEventListener('mousedown', ini);
    alvo.addEventListener('mouseup', canc);
    alvo.addEventListener('mouseleave', canc);
  }

  function renderizarAba(id) {
    if (id === 'tab1') renderInicio();
    if (id === 'tab2') renderCheckin();
    if (id === 'tab3') renderAluno();
    if (id === 'tabJogos') {
      if (typeof renderSeletorNiveisArcade === 'function') renderSeletorNiveisArcade();
      if (typeof renderRankingJogos === 'function') renderRankingJogos();
    }
    if (id === 'tab4') renderAbaProfessor();
    if (id === 'tab5') renderAbaAdm();
    if (id === 'tab6') renderAbaDev();
  }

  /* Auth aluno */
  global.autenticarAlunoNuvem = function (btn) {
    var nome = ($('alunoLoginNome').value || '').trim();
    var senha = $('alunoLoginSenha').value || '';
    if (!nome || !senha) { mostrarToast('Informe nome e senha.', 'erro'); return; }
    if (btn) { btn.classList.add('carregando'); btn.innerHTML = '<span class="spinner-btn"></span> Entrando...'; }
    var alvo = normalizar(nome), achado = null;
    DB.listar('alunos').forEach(function (a) {
      if (!achado && (normalizar(a.nome) === alvo || normalizar(a.apelido) === alvo)) achado = a;
    });
    setTimeout(function () {
      if (btn) { btn.classList.remove('carregando'); btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Entrar no Painel'; }
      if (!achado) { mostrarToast('Aluno não encontrado.', 'erro'); return; }
      if (achado.senhaHash !== hashSenha(senha)) { mostrarToast('Senha incorreta.', 'erro'); return; }
      sessaoAlunoId = achado.id;
      try { localStorage.setItem('uc_sessao_aluno', sessaoAlunoId); } catch (e) {}
      $('alunoLoginSenha').value = '';
      renderAluno();
      mostrarToast('Bem-vindo(a), ' + esc(achado.apelido || achado.nome) + '!');
    }, 200);
  };
  global.sairAluno = function () {
    sessaoAlunoId = null;
    try { localStorage.removeItem('uc_sessao_aluno'); } catch (e) {}
    renderAluno(); renderCheckin();
    mostrarToast('Sessão encerrada.');
  };
  global.toggleAutoCadastroAluno = function (m) {
    $('cardAlunoLogin').style.display = m ? 'none' : 'block';
    $('cardAlunoPrimeiroCadastro').style.display = m ? 'block' : 'none';
    $('cardAlunoPainel').style.display = 'none';
    if (m) renderGraduacoes();
  };
  global.cadastrarAlunoNuvem = function (btn) {
    var nome = ($('autoCadNome').value || '').trim();
    var apelido = ($('autoCadApelido').value || '').trim();
    var graduacao = $('autoCadGraduacaoSelect').value;
    var contato = ($('autoCadContato').value || '').trim();
    var s1 = $('autoCadSenha').value || '', s2 = $('autoCadSenha2').value || '';
    if (nome.length < 3) { mostrarToast('Informe o nome completo.', 'erro'); return; }
    if (s1.length < 4) { mostrarToast('Senha curta.', 'erro'); return; }
    if (s1 !== s2) { mostrarToast('Senhas não conferem.', 'erro'); return; }
    if (DB.listar('alunos').some(function (a) { return normalizar(a.nome) === normalizar(nome); })) {
      mostrarToast('Nome já cadastrado.', 'erro'); return;
    }
    if (btn) { btn.classList.add('carregando'); btn.innerHTML = '<span class="spinner-btn"></span> Salvando...'; }
    var cat = (($('autoCadCategoria') || {}).value || 'adulto');
    var tipo = (($('autoCadTipoAluno') || {}).value || 'normal');
    DB.salvar('alunos', {
      nome: nome, apelido: apelido || nome.split(' ')[0], graduacao: graduacao,
      categoria: cat, contato: contato, tipoAluno: tipo,
      senhaHash: hashSenha(s1), criadoEm: agoraISO(), ativo: true
    }).then(function (id) {
      if (btn) { btn.classList.remove('carregando'); btn.innerHTML = '<i class="fas fa-check"></i> Concluir'; }
      sessaoAlunoId = id;
      ['autoCadNome', 'autoCadApelido', 'autoCadContato', 'autoCadSenha', 'autoCadSenha2'].forEach(function (x) {
        if ($(x)) $(x).value = '';
      });
      toggleAutoCadastroAluno(false);
      renderAluno();
      mostrarToast('Cadastro concluído!');
    });
  };

  /* Equipe */
  function montarLoginEquipe(c, p) {
    var sem = DB.listar('equipe').length === 0;
    var rot = (EQUIPE_PAPEIS.filter(function (x) { return x.id === p; })[0] || { nome: 'Equipe' }).nome;
    var sufixo = '_' + p;
    c.innerHTML = '<div class="card"><h3 style="color:var(--gold);"><i class="fas fa-lock"></i> Área restrita — ' + esc(rot) + '</h3>' +
      (sem ? '<div class="aviso-info">Nenhum acesso cadastrado. Crie o primeiro (perfil Dev).</div>' : '') +
      '<label class="campo-label">Nome</label><input id="equipeLoginNome' + sufixo + '">' +
      '<label class="campo-label">Senha</label><input id="equipeLoginSenha' + sufixo + '" type="password">' +
      (sem ? '<label class="campo-label">Perfil</label><select id="equipeLoginPapel' + sufixo + '"><option value="dev">Dev (primeiro acesso)</option></select>' : '') +
      '<button class="btn" onclick="autenticarEquipe(\'' + p + '\')"><i class="fas fa-sign-in-alt"></i> Entrar</button></div>';
    return false;
  }
  global.autenticarEquipe = function (papel) {
    var sufixo = '_' + papel;
    var nome = (($('equipeLoginNome' + sufixo) || {}).value || '').trim();
    var senha = ($('equipeLoginSenha' + sufixo) || {}).value || '';
    if (nome.length < 3 || senha.length < 4) { mostrarToast('Informe nome e senha (4+).', 'erro'); return; }
    var equipe = DB.listar('equipe');
    if (equipe.length === 0) {
      DB.salvar('equipe', { nome: nome, senhaHash: hashSenha(senha), papel: 'dev', criadoEm: agoraISO(), ativo: true })
        .then(function (id) {
          sessaoEquipe = { id: id, nome: nome, papel: 'dev' };
          mostrarToast('Acesso dev criado!');
          renderizarAba(abaAtual);
        });
      return;
    }
    var alvo = normalizar(nome), achado = null;
    equipe.forEach(function (u) {
      if (!achado && normalizar(u.nome) === alvo && u.senhaHash === hashSenha(senha)) achado = u;
    });
    if (!achado) { mostrarToast('Credenciais inválidas.', 'erro'); return; }
    var perm = { professor: ['professor', 'adm', 'dev'], adm: ['adm', 'dev'], dev: ['dev'] };
    if ((perm[papel] || []).indexOf(achado.papel) < 0) { mostrarToast('Sem acesso.', 'erro'); return; }
    sessaoEquipe = { id: achado.id, nome: achado.nome, papel: achado.papel };
    mostrarToast('Bem-vindo(a), ' + esc(achado.nome) + '!');
    renderizarAba(abaAtual);
  };
  global.sairEquipe = function () {
    sessaoEquipe = null;
    renderizarAba(abaAtual);
    mostrarToast('Sessão equipe encerrada.');
  };
  function exigirEquipe(papeis, container, rot) {
    if (sessaoEquipe && papeis.indexOf(sessaoEquipe.papel) >= 0) return true;
    montarLoginEquipe(container, rot || papeis[papeis.length - 1]);
    return false;
  }

  /* Notificações */
  global.pedirPermissaoNotificacao = function () {
    if (!('Notification' in window)) { mostrarToast('Sem suporte a notificações.', 'erro'); return; }
    Notification.requestPermission().then(function (p) {
      if (p === 'granted') {
        localStorage.setItem('uc_notif_ativa', '1');
        if ($('btnAtivarNotificacao')) $('btnAtivarNotificacao').innerHTML = '<i class="fas fa-bell"></i> Notificações Ativas';
        mostrarToast('Notificações ativas!');
      }
    });
  };

  /* Renders */
  function renderInicio() {
    renderMural();
    if (typeof renderSeletorNiveisArcade === 'function') renderSeletorNiveisArcade();
    if (typeof renderRankingJogos === 'function') renderRankingJogos();
  }
  function renderCheckin() {
    var box = $('horarioAulaHojeBox');
    if (box) box.innerHTML = '<i class="fas fa-clock"></i> Configure horários na área do professor.';
  }
  function renderAluno() {
    var logado = alunoLogado();
    if (!logado) {
      $('cardAlunoLogin').style.display = 'block';
      $('cardAlunoPrimeiroCadastro').style.display = 'none';
      $('cardAlunoPainel').style.display = 'none';
      return;
    }
    $('cardAlunoLogin').style.display = 'none';
    $('cardAlunoPainel').style.display = 'block';
    $('cardAlunoPainel').innerHTML =
      '<div class="card"><h3><i class="fas fa-id-card"></i> ' + esc(logado.nome) + '</h3>' +
      '<p class="mini">' + esc(logado.graduacao || '-') + ' · ' + esc(logado.apelido || '') + '</p>' +
      '<button class="btn btn-back" onclick="sairAluno()">Sair</button></div>';
  }
  function renderAbaProfessor() {
    var box = $('conteudoProfessor');
    if (!exigirEquipe(['professor', 'adm', 'dev'], box)) return;
    box.innerHTML = '<div class="card"><h3>Professor: ' + esc(sessaoEquipe.nome) + '</h3>' +
      '<p class="mini">Painel do professor. Cadastre horários e polos pelo Dev/ADM completo.</p>' +
      '<button class="btn btn-back" onclick="sairEquipe()">Sair</button></div>';
  }
  function renderAbaAdm() {
    var box = $('conteudoAdm');
    if (!exigirEquipe(['adm', 'dev'], box, 'adm')) return;
    var jogosTeste = [
      { id: 'snake', n: 'Minhoca', cor: 'btn', icon: 'fa-dragon' },
      { id: 'tamagotchi', n: 'Mascote', cor: 'btn btn-gold', icon: 'fa-robot' },
      { id: 'damas', n: 'Damas', cor: 'btn', icon: 'fa-chess' },
      { id: 'corrida', n: 'Corrida', cor: 'btn', icon: 'fa-car', style: 'background:linear-gradient(135deg,#00c853,#00e676);' },
      { id: 'quebra', n: 'Quebra-Blocos', cor: 'btn', icon: 'fa-cubes' },
      { id: 'pulo', n: 'Pulo', cor: 'btn', icon: 'fa-dove' },
      { id: 'surfe', n: 'Surfe', cor: 'btn btn-gold', icon: 'fa-water' },
      { id: 'mario', n: 'Aventura', cor: 'btn', icon: 'fa-mountain', style: 'background:linear-gradient(135deg,#00c853,#00e676);' }
    ];
    var btns = jogosTeste.map(function (j) {
      var st = j.style ? ' style="' + j.style + '"' : '';
      return '<button type="button" class="' + j.cor + '"' + st + ' onclick="abrirJogoArcade(\'' + j.id + '\')"><i class="fas ' + j.icon + '"></i> ' + j.n + '</button>';
    }).join('');
    box.innerHTML =
      '<div class="card">' +
        '<h3><i class="fas fa-sliders-h"></i> ADM: ' + esc(sessaoEquipe.nome) + '</h3>' +
        '<p class="mini" style="margin-bottom:12px;">Abra qualquer jogo em modo teste. Os pontos ainda entram no ranking se houver nome preenchido na aba Início.</p>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">' + btns + '</div>' +
        '<h3 style="font-size:.85rem;margin:12px 0 8px;"><i class="fas fa-trophy"></i> Ranking atual (top 10)</h3>' +
        '<div id="listaRankingJogosAdm"></div>' +
        '<button class="btn btn-back" style="margin-top:14px;" onclick="sairEquipe()"><i class="fas fa-sign-out-alt"></i> Sair</button>' +
      '</div>';
    if (typeof renderRankingJogos === 'function') renderRankingJogos();
  }
  function renderAbaDev() {
    var box = $('conteudoDev');
    if (!exigirEquipe(['dev'], box)) return;
    box.innerHTML = '<div class="card"><h3>Dev: ' + esc(sessaoEquipe.nome) + '</h3>' +
      '<p class="mini">Status Firebase: ' + DB.modo + '</p>' +
      '<button class="btn btn-back" onclick="sairEquipe()">Sair</button></div>';
  }
  function renderMural() {
    var box = $('chatMessages'); if (!box) return;
    var msgs = DB.listar('mural').slice().sort(function (a, b) {
      return String(b.criadoEm || '').localeCompare(String(a.criadoEm || ''));
    }).slice(0, 30);
    if (!msgs.length) { box.innerHTML = '<p class="sem-dados">Nenhuma mensagem ainda.</p>'; return; }
    box.innerHTML = msgs.map(function (m) {
      return '<div class="chat-msg"><b>' + esc(m.autor || 'Visitante') + '</b>: ' + esc(m.texto || '') + '</div>';
    }).join('');
  }

  global.abrirInstagramOficial = function () {
    var h = (CONFIG.instagram || '').replace('@', '');
    if (h) window.open('https://instagram.com/' + h, '_blank', 'noopener');
  };
  global.enviarMensagemNuvem = function () {
    var i = $('chatInput');
    var t = (i.value || '').trim();
    if (!t) return;
    var a = alunoLogado();
    DB.salvar('mural', { autor: a ? (a.apelido || a.nome) : 'Visitante', texto: t, criadoEm: agoraISO() });
    i.value = '';
  };
  global.uploadFotoChat = function () {};
  global.confirmarPresencaHoje = function () {};
  global.alunoCheckinLocalFixoSimples = function () { mostrarToast('Check-in registrado!'); };
  global.avaliarAtrasoHoje = function () {};
  global.atualizarEstadoBotaoCheckin = function () {};

  /* Assistente */
  var assistenteAberto = false, assistenteJaCumprimentou = false;
  global.toggleAssistente = function () {
    assistenteAberto = !assistenteAberto;
    var p = $('assistentePainel'); if (!p) return;
    p.classList.toggle('aberto', assistenteAberto);
    if (assistenteAberto && !assistenteJaCumprimentou) {
      assistenteJaCumprimentou = true;
      assistenteAdicionarBolha('bot', 'Olá! Sou o Assistente Capoeira. Posso ajudar com aula, check-in, graduação e jogos.');
    }
  };
  function assistenteAdicionarBolha(tipo, texto) {
    var box = $('assistenteMsgs'); if (!box) return;
    var d = document.createElement('div');
    d.className = 'assistente-bolha ' + tipo;
    d.textContent = texto;
    box.appendChild(d);
    box.scrollTop = box.scrollHeight;
  }
  global.assistenteEnviar = function () {
    var i = $('assistenteInput'); if (!i) return;
    var t = (i.value || '').trim(); if (!t) return;
    i.value = '';
    assistentePerguntar(t);
  };
  global.assistentePerguntar = function (t) {
    if (!assistenteAberto) {
      assistenteAberto = true;
      $('assistentePainel').classList.add('aberto');
      if (!assistenteJaCumprimentou) {
        assistenteJaCumprimentou = true;
        assistenteAdicionarBolha('bot', 'Olá! Sou o Assistente Capoeira.');
      }
    }
    assistenteAdicionarBolha('user', t);
    var low = t.toLowerCase();
    var resp = 'Recebi: "' + t + '". ';
    if (low.indexOf('check') >= 0) resp = 'Para fazer check-in: abra a aba Check-in, digite seu nome, escolha o polo e confirme.';
    else if (low.indexOf('aula') >= 0) resp = 'Os horários ficam na aba Início (card Horários da Semana), quando o professor cadastrar.';
    else if (low.indexOf('gradua') >= 0) resp = 'Sua corda aparece no painel do Aluno após o login.';
    else if (low.indexOf('jogo') >= 0 || low.indexOf('damas') >= 0) resp = 'Na aba Jogos: Minhoca, Pac-Man, Damas (com IA Fácil/Difícil/Impossível), Corrida e mais.';
    else if (low.indexOf('ajuda') >= 0) resp = 'Abas: Início, Check-in, Aluno, Jogos. Segure o logo para área da equipe.';
    setTimeout(function () { assistenteAdicionarBolha('bot', resp); }, 280);
  };

  global.iniciarApp = function () {
    DB.iniciar();
    DB.escutar('config', function (l) { carregarConfigApp(l); });
    DB.escutar('mural', function () { if (abaAtual === 'tab1') renderMural(); });
    try {
      var a = localStorage.getItem('uc_sessao_aluno');
      if (a && DB.buscar('alunos', a)) sessaoAlunoId = a;
    } catch (e) {}
    aplicarConfig();
    renderInicio(); renderCheckin(); renderAluno();
    instalarGestoAcessoEquipe();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { iniciarApp(); });
  } else {
    setTimeout(iniciarApp, 50);
  }

})(typeof window !== 'undefined' ? window : this);
