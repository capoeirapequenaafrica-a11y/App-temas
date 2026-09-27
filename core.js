/* Universo Capoeira — gerado a partir do index.html */
/* Não edite VERSAO: arquivo sem número de versão */
/* === core: config, DB, auth, abas === */
/* Remove qualquer Service Worker e cache antigos (de versões anteriores, ex: v86)
   que possam estar guardando uma cópia velha do app no navegador do usuário. */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function (registrations) {
    registrations.forEach(function (reg) { reg.unregister(); });
  }).catch(function () {});
}
if (window.caches && caches.keys) {
  caches.keys().then(function (nomes) {
    nomes.forEach(function (nome) { caches.delete(nome); });
  }).catch(function () {});
}

/* =====================================================================
   UNIVERSO CAPOEIRA - Web & Mobile Edition
   Arquivo único (HTML + CSS + JS) com camada de dados híbrida:
   Firestore (nuvem) quando configurado, localStorage (local) como reserva.
   ===================================================================== */

/* ---------------------------------------------------------------
   0. CONSTANTES
   --------------------------------------------------------------- */
var VERSAO_APP = '';
var CHAVE_LOCAL = 'uc_db';
var CHAVE_CONFIG_LOCAL = 'uc_config_firebase';

var FIREBASE_CONFIG_PADRAO = {
  apiKey: "AIzaSyDlmXcUACxQZ3QMjaQIXsJb_gUnv10P85A",
  authDomain: "project-10dd7ec8-159b-4351-90a.firebaseapp.com",
  projectId: "project-10dd7ec8-159b-4351-90a",
  storageBucket: "project-10dd7ec8-159b-4351-90a.firebasestorage.app",
  messagingSenderId: "944397472361",
  appId: "1:944397472361:web:f66ba584699859727b08f8",
  measurementId: "G-F8PW3VL58H"
};

var DIAS_SEMANA = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

var GRADUACOES_PADRAO = [
  'Iniciante - Corda Crua',
  'Aluno - Crua e Amarela',
  'Aluno - Amarela',
  'Aluno - Amarela e Laranja',
  'Aluno - Laranja',
  'Aluno - Laranja e Azul',
  'Aluno Formado - Azul',
  'Aluno Formado - Azul e Verde',
  'Aluno Formado - Verde',
  'Aluno Formado - Verde e Roxa',
  'Aluno Formado - Roxa',
  'Aluno Formado - Roxa e Marrom',
  'Aluno Formado - Marrom',
  'Aluno Formado - Marrom e Vermelha',
  'Professor - Vermelha',
  'Professor - Vermelha e Branca',
  'Contramestre - Branca',
  'Mestre - Branca'
];

var EQUIPE_PAPEIS = [
  { id: 'professor', nome: 'Professor' },
  { id: 'adm', nome: 'Administração' },
  { id: 'dev', nome: 'Dev / Suporte' }
];

var COLECOES = ['alunos', 'polos', 'horarios', 'presencas', 'avaliacoes', 'avisos', 'mural', 'certificados', 'equipe', 'config', 'logs', 'solicitacoes', 'testesConhecimento', 'mensagensPrivadas', 'feedbacksAula', 'perguntasSemana', 'respostasPergunta', 'leiturasAvisos', 'pontosJogos', 'professorPresenca', 'formacaoInfantil', 'formacaoProfessor', 'aulasConteudo', 'desafiosJogos', 'progressoJogos', 'avaliacoesSemanaisTurma', 'notasAvaliacoesSemanais', 'avataresOnline'];

var CONFIG_PADRAO = {
  tituloApp: 'Universo Capoeira',
  instagram: '@capoeiranapequenaafrica',
  logo1: '',
  logo2: '',
  tempoTimerSegundos: 90,
  toleranciaAtrasoMin: 15,
  janelaCheckinMin: 10,
  horasPorAula: 1.5,
  graduacoes: GRADUACOES_PADRAO.slice(),
  iaProxyUrl: '',
  baseConhecimento: '',
  avatarConhecimento: {},
  versaoPublicada: ''
};

/* ---------------------------------------------------------------
   1. UTILITÁRIOS
   --------------------------------------------------------------- */
function $(id) { return document.getElementById(id); }

/* ---------------------------------------------------------------
   1.05 CARDS RETRÁTEIS (acordeão) — usados nas abas Professor/ADM/Dev
   --------------------------------------------------------------- */
var estadoCardsColapsados = {};

function chaveDoCard(card) {
  var titulo = card.querySelector('h3');
  var texto = titulo ? titulo.textContent.replace(/\s+/g, ' ').trim() : '';
  return texto || card.id || '';
}

function toggleCardColapsavel(card) {
  var chave = chaveDoCard(card);
  var fechado = card.classList.toggle('fechado');
  estadoCardsColapsados[chave] = fechado;
}

function tornarCardsColapsaveis(container, padraoFechado) {
  if (!container) return;
  var cards = container.querySelectorAll(':scope > .card');
  cards.forEach(function (card) {
    var titulo = card.querySelector(':scope > h3');
    if (!titulo || card.dataset.colapsavelPronto) return;
    card.dataset.colapsavelPronto = '1';

    var corpo = document.createElement('div');
    corpo.className = 'card-corpo-colapsavel';
    var no = titulo.nextSibling;
    while (no) {
      var prox = no.nextSibling;
      corpo.appendChild(no);
      no = prox;
    }
    card.appendChild(corpo);

    var seta = document.createElement('i');
    seta.className = 'fas fa-chevron-down seta-colapsavel';
    titulo.appendChild(seta);
    titulo.classList.add('titulo-colapsavel');
    titulo.addEventListener('click', function () { toggleCardColapsavel(card); });

    var chave = chaveDoCard(card);
    var estadoSalvo = estadoCardsColapsados[chave];
    var deveFechar = (estadoSalvo !== undefined) ? estadoSalvo : !!padraoFechado;
    if (deveFechar) card.classList.add('fechado');
  });
}

/* ---------------------------------------------------------------
   1.1 TELEMETRIA DE ERROS
   --------------------------------------------------------------- */
window.telemetriaErros = [];

function registrarTelemetriaErro(mensagem, origem, linha) {
  var detalhe = {
    hora: new Date().toLocaleTimeString(),
    mensagem: String(mensagem || '').slice(0, 300),
    origem: origem || 'script',
    linha: linha || 'N/A'
  };
  window.telemetriaErros.unshift(detalhe);
  if (window.telemetriaErros.length > 30) window.telemetriaErros.pop();
  atualizarPainelTelemetria();
}

function atualizarPainelTelemetria() {
  var box = $('boxTelemetriaErrosLog');
  if (!box) return;
  if (!window.telemetriaErros.length) {
    box.textContent = 'Nenhum erro registrado até o momento (sistema estável).';
    return;
  }
  box.innerHTML = window.telemetriaErros.map(function (e) {
    return '<div style="border-bottom:1px solid #2c434e; padding:3px 0; color:#ff5252;">[' + e.hora + '] ' + esc(e.mensagem) + ' (linha ' + esc(String(e.linha)) + ')</div>';
  }).join('');
}

function limparTelemetriaErros() {
  window.telemetriaErros = [];
  atualizarPainelTelemetria();
  mostrarToast('Registro de erros limpo.');
}

window.onerror = function (msg, url, linha) {
  registrarTelemetriaErro(msg, 'window.onerror', linha);
  return false;
};
window.addEventListener('unhandledrejection', function (event) {
  var motivo = event.reason ? (event.reason.message || event.reason) : 'Promessa rejeitada';
  registrarTelemetriaErro(motivo, 'Promise', 0);
});

function perguntarIASobreErros(btn) {
  if (!CONFIG.iaProxyUrl) { mostrarToast('Configure a URL do Assistente IA antes (ADM > Configurações).', 'erro'); return; }
  var saida = $('diagnosticoIAErros');
  if (!window.telemetriaErros.length) { saida.textContent = 'Nenhum erro registrado pra analisar — bom sinal!'; return; }

  if (btn) { btn.classList.add('carregando'); btn.innerHTML = '<span class="spinner-btn"></span> Analisando...'; }
  saida.textContent = '';

  fetch(CONFIG.iaProxyUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      analisarErros: true,
      erros: window.telemetriaErros.slice(0, 15),
      versaoApp: VERSAO_APP
    })
  }).then(function (r) { return r.json(); })
    .then(function (data) {
      saida.textContent = (data && data.diagnostico) ? data.diagnostico : ('Erro: ' + ((data && data.erro) || 'não foi possível analisar.'));
    })
    .catch(function () {
      saida.textContent = 'Não consegui falar com a IA agora. Tente de novo.';
    })
    .finally(function () {
      if (btn) { btn.classList.remove('carregando'); btn.innerHTML = '<i class="fas fa-robot"></i> Perguntar à IA'; }
    });
}

function esc(v) {
  return String(v === undefined || v === null ? '' : v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function urlSegura(u) {
  var s = String(u || '').trim();
  if (/^data:image\/(png|jpe?g|gif|webp);base64,/i.test(s)) return s;
  if (/^https?:\/\//i.test(s)) return s;
  return '';
}

function normalizar(v) {
  return String(v || '').trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function uid() {
  return 'id' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function agoraISO() { return new Date().toISOString(); }

function doisDigitos(n) { return String(n).padStart(2, '0'); }

function dataLocalISO(d) {
  d = d || new Date();
  return d.getFullYear() + '-' + doisDigitos(d.getMonth() + 1) + '-' + doisDigitos(d.getDate());
}

function horaLocalHM(d) {
  d = d || new Date();
  return doisDigitos(d.getHours()) + ':' + doisDigitos(d.getMinutes());
}

function dataBR(iso) {
  if (!iso) return '-';
  var p = String(iso).slice(0, 10).split('-');
  if (p.length !== 3) return String(iso);
  return p[2] + '/' + p[1] + '/' + p[0];
}

function dataHoraBR(iso) {
  if (!iso) return '-';
  var d = new Date(iso);
  if (isNaN(d.getTime())) return String(iso);
  return doisDigitos(d.getDate()) + '/' + doisDigitos(d.getMonth() + 1) + '/' + d.getFullYear() + ' às ' + horaLocalHM(d);
}

function minutosDoHM(hm) {
  var p = String(hm || '').split(':');
  if (p.length < 2) return null;
  var h = parseInt(p[0], 10), m = parseInt(p[1], 10);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
}

function agoraEmMinutos() {
  var d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

function minutosParaHM(min) {
  min = ((min % 1440) + 1440) % 1440;
  return doisDigitos(Math.floor(min / 60)) + ':' + doisDigitos(min % 60);
}

var TOLERANCIA_JANELA_CHECKIN_MIN_PADRAO = 10;

function janelaCheckin(aula) {
  if (!aula) return null;
  var inicio = minutosDoHM(aula.horaInicio);
  if (inicio === null) return null;
  var fim = minutosDoHM(aula.horaFim);
  if (fim === null) fim = inicio + 60;
  var tolerancia = (CONFIG && typeof CONFIG.janelaCheckinMin === 'number') ? CONFIG.janelaCheckinMin : TOLERANCIA_JANELA_CHECKIN_MIN_PADRAO;
  return { abre: inicio - tolerancia, fecha: fim + tolerancia };
}

function dentroJanelaCheckin(aula) {
  var j = janelaCheckin(aula);
  if (!j) return true; /* sem horário cadastrado pra hoje: não bloqueia */
  var agora = agoraEmMinutos();
  return agora >= j.abre && agora <= j.fecha;
}

/* Hash simples (djb2) - apenas para evitar senha em texto puro no banco.
   NÃO é criptografia: veja as observações de segurança no relatório. */
function hashSenha(senha) {
  var str = 'uc::' + String(senha || '');
  var h = 5381;
  for (var i = 0; i < str.length; i++) {
    h = ((h << 5) + h) + str.charCodeAt(i);
    h = h & 0xffffffff;
  }
  return 'h' + (h >>> 0).toString(16);
}

function mostrarToast(msg, tipo) {
  var t = $('toastBox');
  t.innerHTML = msg;
  t.className = 'toast' + (tipo === 'erro' ? ' erro' : '');
  t.style.display = 'block';
  clearTimeout(t._timer);
  t._timer = setTimeout(function () { t.style.display = 'none'; }, 3200);
}

function abrirModal(titulo, corpoHtml, acoesHtml) {
  $('modalTitulo').innerHTML = '<i class="fas fa-circle-info"></i> ' + esc(titulo);
  $('modalCorpo').innerHTML = corpoHtml || '';
  $('modalAcoes').innerHTML = (acoesHtml || '') + '<button class="btn btn-back" onclick="fecharModal()">Fechar</button>';
  $('modalOverlay').classList.add('aberto');
}

function fecharModal() { $('modalOverlay').classList.remove('aberto'); }

function registroLog(origem, mensagem) {
  var linha = { origem: origem || 'app', mensagem: String(mensagem || '').slice(0, 400), criadoEm: agoraISO() };
  try { console.log('[' + linha.origem + ']', linha.mensagem); } catch (e) {}
  if (DB.pronto) { DB.salvar('logs', linha); }
}

function baixarArquivo(nome, conteudo, tipo) {
  var blob = new Blob([conteudo], { type: tipo || 'text/plain;charset=utf-8' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url; a.download = nome;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
}

/* ---------------------------------------------------------------
   2. CAMADA DE DADOS (Firestore + localStorage)
   --------------------------------------------------------------- */
var DB = {
  modo: 'local',
  fs: null,
  cache: {},
  listeners: {},
  pronto: false,
  primeiraCarga: {},

  carregado: function (col) {
    return this.modo === 'local' || !!this.primeiraCarga[col];
  },

  iniciar: function () {
    var cfg = carregarConfigFirebase();
    if (cfg && cfg.projectId && typeof firebase !== 'undefined' && firebase.initializeApp) {
      try {
        if (!firebase.apps || !firebase.apps.length) { firebase.initializeApp(cfg); }
        this.fs = firebase.firestore();
        this.modo = 'nuvem';
      } catch (e) {
        console.warn('[DB] Falha ao iniciar Firebase; usando modo local.', e);
        this.modo = 'local';
      }
    } else {
      this.modo = 'local';
    }

    if (this.modo === 'nuvem') {
      this.abrirEscutasNuvem();
    } else {
      this.carregarLocal();
    }
    this.pronto = true;
    atualizarStatusFirebase();
  },

  /* ---------- modo nuvem ---------- */
  abrirEscutasNuvem: function () {
    var self = this;
    COLECOES.forEach(function (col) {
      self.fs.collection(col).onSnapshot(function (snap) {
        var arr = [];
        snap.forEach(function (doc) { arr.push(Object.assign({ id: doc.id }, doc.data())); });
        self.cache[col] = arr;
        self.primeiraCarga[col] = true;
        self.avisar(col);
      }, function (err) {
        console.warn('[DB] Erro na escuta de "' + col + '".', err);
        registroLog('db', 'Erro na coleção ' + col + ': ' + err.message);
      });
    });
  },

  /* ---------- modo local ---------- */
  carregarLocal: function () {
    var bruto = null;
    try { bruto = JSON.parse(localStorage.getItem(CHAVE_LOCAL) || 'null'); } catch (e) { bruto = null; }
    var self = this;
    COLECOES.forEach(function (col) { self.cache[col] = (bruto && bruto[col]) ? bruto[col] : []; });
  },

  persistirLocal: function () {
    try {
      var obj = {};
      var self = this;
      COLECOES.forEach(function (col) { obj[col] = self.cache[col] || []; });
      localStorage.setItem(CHAVE_LOCAL, JSON.stringify(obj));
    } catch (e) {
      console.warn('[DB] Não foi possível gravar no localStorage.', e);
      mostrarToast('Armazenamento local cheio ou bloqueado.', 'erro');
    }
  },

  /* ---------- API comum ---------- */
  listar: function (col) { return this.cache[col] || []; },

  buscar: function (col, id) {
    var l = this.cache[col] || [];
    for (var i = 0; i < l.length; i++) { if (l[i].id === id) return l[i]; }
    return null;
  },

  atualizar: function (col, id, patch) {
    return this.salvar(col, patch, id);
  },

  /* fila offline (check-in e outros) — sincroniza quando voltar a internet */
  _filaKey: 'uc_fila_offline',
  _lerFila: function () {
    try { return JSON.parse(localStorage.getItem(this._filaKey) || '[]') || []; }
    catch (e) { return []; }
  },
  _gravarFila: function (fila) {
    try { localStorage.setItem(this._filaKey, JSON.stringify(fila)); } catch (e) {}
  },
  _enfileirar: function (col, id, dados) {
    var fila = this._lerFila();
    fila.push({ col: col, id: id, dados: dados, em: Date.now() });
    this._gravarFila(fila);
  },
  sincronizarFilaOffline: function () {
    var self = this;
    if (this.modo !== 'nuvem' || !this.fs) return Promise.resolve(0);
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return Promise.resolve(0);
    var fila = this._lerFila();
    if (!fila.length) return Promise.resolve(0);
    var rest = [];
    var ok = 0;
    var chain = Promise.resolve();
    fila.forEach(function (item) {
      chain = chain.then(function () {
        return self.fs.collection(item.col).doc(item.id).set(item.dados, { merge: true })
          .then(function () { ok++; })
          .catch(function () { rest.push(item); });
      });
    });
    return chain.then(function () {
      self._gravarFila(rest);
      if (ok > 0) {
        try { mostrarToast(ok + ' item(ns) sincronizado(s) com a nuvem.'); } catch (e) {}
      }
      return ok;
    });
  },

  salvar: function (col, obj, id) {
    var self = this;
    var dados = Object.assign({}, obj);
    if (this.modo === 'nuvem') {
      var idFinal = id || uid();
      /* atualização otimista: já reflete na tela na hora */
      var lista = this.cache[col] || (this.cache[col] = []);
      var achouIdx = -1;
      for (var i = 0; i < lista.length; i++) { if (lista[i].id === idFinal) { achouIdx = i; break; } }
      if (achouIdx >= 0) { lista[achouIdx] = Object.assign({}, lista[achouIdx], dados, { id: idFinal }); }
      else { lista.push(Object.assign({ id: idFinal }, dados)); }
      this.avisar(col);
      /* também guarda local para sobreviver offline */
      try { this.persistirLocal(); } catch (e) {}

      var offline = (typeof navigator !== 'undefined' && navigator.onLine === false);
      if (offline) {
        this._enfileirar(col, idFinal, dados);
        return Promise.resolve(idFinal);
      }

      var doc = this.fs.collection(col).doc(idFinal);
      return doc.set(dados, { merge: true }).then(function () { return idFinal; })
        .catch(function (e) {
          console.warn('[DB] Sem nuvem — salvando offline em ' + col, e);
          self._enfileirar(col, idFinal, dados);
          try { mostrarToast('Salvo offline. Será enviado quando houver internet.', 'erro'); } catch (e2) {}
          return idFinal; /* não falha o check-in */
        });
    }
    var lista = this.cache[col] || (this.cache[col] = []);
    if (id) {
      var achou = -1;
      for (var i = 0; i < lista.length; i++) { if (lista[i].id === id) { achou = i; break; } }
      if (achou >= 0) { lista[achou] = Object.assign({}, lista[achou], dados, { id: id }); }
      else { lista.push(Object.assign({ id: id }, dados)); }
    } else {
      id = uid();
      lista.push(Object.assign({ id: id }, dados));
    }
    this.persistirLocal();
    this.avisar(col);
    return Promise.resolve(id);
  },

  excluir: function (col, id) {
    if (this.modo === 'nuvem') {
      return this.fs.collection(col).doc(id).delete().catch(function (e) {
        console.warn('[DB] Erro ao excluir de ' + col, e);
        mostrarToast('Falha ao excluir.', 'erro');
      });
    }
    var lista = this.cache[col] || [];
    this.cache[col] = lista.filter(function (x) { return x.id !== id; });
    this.persistirLocal();
    this.avisar(col);
    return Promise.resolve();
  },

  limparColecao: function (col) {
    var self = this;
    var itens = (this.cache[col] || []).slice();
    if (this.modo === 'nuvem') {
      return Promise.all(itens.map(function (x) { return self.fs.collection(col).doc(x.id).delete(); }));
    }
    this.cache[col] = [];
    this.persistirLocal();
    this.avisar(col);
    return Promise.resolve();
  },

  /* ---------- observadores ---------- */
  escutar: function (col, cb) {
    if (!this.listeners[col]) this.listeners[col] = [];
    this.listeners[col].push(cb);
    cb(this.listar(col));
  },

  avisar: function (col) {
    var lista = this.listar(col);
    var cbs = this.listeners[col] || [];
    cbs.forEach(function (cb) { try { cb(lista); } catch (e) { console.warn(e); } });
    var globais = this.listeners['*'] || [];
    globais.forEach(function (cb) { try { cb(col, lista); } catch (e) { console.warn(e); } });
  }
};

/* ---------------------------------------------------------------
   3. CONFIGURAÇÃO DO APP
   --------------------------------------------------------------- */
var CONFIG = Object.assign({}, CONFIG_PADRAO);
var configCarregada = false;

function aplicarConfig() {
  document.title = CONFIG.tituloApp;
  if ($('headerTituloTexto')) $('headerTituloTexto').textContent = CONFIG.tituloApp;
  if ($('handleInstagramAcademiaTxt')) $('handleInstagramAcademiaTxt').textContent = CONFIG.instagram;
  var l1 = $('headerLogo1'), l2 = $('headerLogo2');
  if (CONFIG.logo1) { l1.src = CONFIG.logo1; l1.style.display = 'block'; } else { l1.style.display = 'none'; }
  if (CONFIG.logo2) { l2.src = CONFIG.logo2; l2.style.display = 'block'; } else { l2.style.display = 'none'; }
  if ($('footerInfo')) $('footerInfo').textContent = CONFIG.tituloApp;
  timerDuracaoPadrao = CONFIG.tempoTimerSegundos || 90;
  if (!timerRodando) { timerSegundos = timerDuracaoPadrao; atualizarTimerUI(); }
  renderGraduacoes();
}

function carregarConfigApp(lista) {
  var doc = null;
  for (var i = 0; i < lista.length; i++) { if (lista[i].id === 'app') { doc = lista[i]; break; } }
  CONFIG = Object.assign({}, CONFIG_PADRAO, doc || {});
  if (!Array.isArray(CONFIG.graduacoes) || !CONFIG.graduacoes.length) CONFIG.graduacoes = GRADUACOES_PADRAO.slice();
  configCarregada = true;
  aplicarConfig();
  verificarNovaVersaoPublicada();
}

function verificarNovaVersaoPublicada() {
  var remota = CONFIG.versaoPublicada;
  if (!remota) return;
  var chave = 'uc_versao_publicada_vista';
  var vista = null;
  try { vista = localStorage.getItem(chave); } catch (e) {}
  if (vista === null) {
    try { localStorage.setItem(chave, remota); } catch (e) {}
    return;
  }
  if (vista === remota) return;
  var banner = $('bannerAtualizacaoApp');
  if (banner) banner.style.display = 'flex';
}

function aplicarAtualizacaoAppAgora() {
  try { localStorage.setItem('uc_versao_publicada_vista', CONFIG.versaoPublicada || ''); } catch (e) {}
  location.reload();
}

function publicarNovaVersaoDev(btn) {
  if (btn) { btn.classList.add('carregando'); btn.innerHTML = '<span class="spinner-btn"></span> Publicando...'; }
  salvarConfigApp({ versaoPublicada: String(Date.now()) }).then(function () {
    mostrarToast('✅ Aviso de atualização enviado para todos os dispositivos!');
    registroLog('dev', 'Nova versão publicada/avisada para os alunos.');
  }).finally(function () {
    if (btn) { btn.classList.remove('carregando'); btn.innerHTML = '<i class="fas fa-bullhorn"></i> Avisar Todos os Dispositivos'; }
  });
}

function salvarConfigApp(parcial) {
  var dados = Object.assign({}, parcial);
  return DB.salvar('config', dados, 'app');
}

function renderGraduacoes() {
  ['autoCadGraduacaoSelect', 'admFiltroGraduacao', 'profCadGraduacaoSelect'].forEach(function (id) {
    var sel = $(id);
    if (!sel) return;
    var atual = sel.value;
    var html = id === 'admFiltroGraduacao' ? '<option value="">Todas as graduações</option>' : '';
    CONFIG.graduacoes.forEach(function (g) { html += '<option value="' + esc(g) + '">' + esc(g) + '</option>'; });
    sel.innerHTML = html;
    if (atual) sel.value = atual;
  });
}

/* --- configuração do Firebase (persistida localmente no navegador) --- */
function carregarConfigFirebase() {
  try {
    var salvo = JSON.parse(localStorage.getItem(CHAVE_CONFIG_LOCAL) || 'null');
    return salvo || FIREBASE_CONFIG_PADRAO;
  }
  catch (e) { return FIREBASE_CONFIG_PADRAO; }
}

function salvarConfigFirebase(cfg) {
  if (cfg) localStorage.setItem(CHAVE_CONFIG_LOCAL, JSON.stringify(cfg));
  else localStorage.removeItem(CHAVE_CONFIG_LOCAL);
}

function atualizarStatusFirebase() {
  var el = $('firebaseStatus');
  if (!el) return;
  if (DB.modo === 'nuvem') {
    el.className = 'status-firebase status-online';
    el.textContent = 'ONLINE';
    el.title = 'Dados sincronizados via Firebase Firestore';
  } else {
    el.className = 'status-firebase status-offline';
    el.textContent = 'OFFLINE';
    el.title = 'Dados salvos apenas neste dispositivo (localStorage)';
  }
}

/* ---------------------------------------------------------------
   4. SESSÕES
   --------------------------------------------------------------- */
var sessaoAlunoId = null;
var sessaoEquipe = null;
var boasVindasNovoAluno = false;
var sessaoFormacaoProfId = null;

function alunoLogado() { return sessaoAlunoId ? DB.buscar('alunos', sessaoAlunoId) : null; }

/* ---------------------------------------------------------------
   5. CRONÔMETRO
   --------------------------------------------------------------- */
var timerDuracaoPadrao = 90;
var timerSegundos = 90;
var timerRodando = false;
var timerIntervalo = null;

function formatarTempo(s) {
  s = Math.max(0, Math.round(s));
  return doisDigitos(Math.floor(s / 60)) + ':' + doisDigitos(s % 60);
}

function atualizarTimerUI() {
  var txt = formatarTempo(timerSegundos);
  if ($('timerDisplay')) $('timerDisplay').textContent = txt;
  if ($('timerDisplayGrande')) $('timerDisplayGrande').textContent = txt;
  var icone = timerRodando ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
  if ($('btnStartTimer')) $('btnStartTimer').innerHTML = icone;
  if ($('btnStartTimerGrande')) $('btnStartTimerGrande').innerHTML = icone;
}

function iniciarPausarTimer() {
  if (timerRodando) {
    clearInterval(timerIntervalo);
    timerRodando = false;
    atualizarTimerUI();
    return;
  }
  if (timerSegundos <= 0) timerSegundos = timerDuracaoPadrao;
  timerRodando = true;
  timerIntervalo = setInterval(function () {
    timerSegundos--;
    if (timerSegundos <= 0) {
      timerSegundos = 0;
      clearInterval(timerIntervalo);
      timerRodando = false;
      tocarAlarmeTimer();
    }
    atualizarTimerUI();
  }, 1000);
  atualizarTimerUI();
}

function resetarTimer() {
  clearInterval(timerIntervalo);
  timerRodando = false;
  timerSegundos = timerDuracaoPadrao;
  atualizarTimerUI();
}

function abrirTimerTelaCheia() {
  $('overlayTimerGrande').classList.add('aberto');
  atualizarTimerUI();
}

function fecharTimerTelaCheia() { $('overlayTimerGrande').classList.remove('aberto'); }

function tocarAlarmeTimer() {
  mostrarToast('<i class="fas fa-bell"></i> Tempo encerrado!');
  try {
    var ctx = new (window.AudioContext || window.webkitAudioContext)();
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    osc.start();
    setTimeout(function () { osc.stop(); ctx.close(); }, 700);
  } catch (e) { /* navegador sem áudio */ }
  if (window.navigator.vibrate) { try { window.navigator.vibrate([250, 120, 250]); } catch (e) {} }
}

/* ---------------------------------------------------------------
   6. NAVEGAÇÃO POR ABAS
   --------------------------------------------------------------- */
var abaAtual = 'tab1';

function abrirAba(id, btn) {
  abaAtual = id;
  document.querySelectorAll('.tab-content').forEach(function (el) { el.classList.remove('active'); });
  var alvo = $(id);
  if (alvo) alvo.classList.add('active');
  var pai = btn || null;
  if (!pai) {
    /* se chamado por código, procura o botão correspondente */
    document.querySelectorAll('.tabs button').forEach(function (b) {
      var oc = b.getAttribute('onclick') || '';
      if (oc.indexOf("'" + id + "'") >= 0) pai = b;
    });
  }
  if (pai) {
    var container = pai.closest('.tabs');
    if (container) container.querySelectorAll('button').forEach(function (b) { b.classList.remove('active'); });
    pai.classList.add('active');
  }
  renderizarAba(id);
}

function toggleMenuEquipe() {
  var t = $('tabsEquipe');
  var abrir = t.style.display === 'none';
  t.style.display = abrir ? 'flex' : 'none';
  $('btnToggleEquipe').classList.toggle('active', abrir);
  if (abrir) { abrirAba('tab4'); }
  else if (['tab4', 'tab5', 'tab6'].indexOf(abaAtual) >= 0) { abrirAba('tab1'); }
}

function revelarAcessoEquipe() {
  var btn = $('btnToggleEquipe');
  var dica = $('dicaAcessoEquipe');
  if (btn && btn.style.display === 'none') {
    btn.style.display = 'flex';
    try { mostrarToast('Acesso da equipe liberado.'); } catch (e) {}
  }
  if (dica) dica.style.display = 'none';
  toggleMenuEquipe();
}

function mostrarDicaAssistentePrimeiroAcesso() {
  var ja = false;
  try { ja = !!localStorage.getItem('uc_assistente_apresentado_v1'); } catch (e) {}
  if (ja) return;
  var dica = $('dicaAssistentePrimeiroAcesso');
  if (!dica) return;
  setTimeout(function () {
    if (!assistenteAberto) dica.style.display = 'block';
  }, 4000);
}

function instalarGestoAcessoEquipe() {
  var alvo = $('headerAppTopo');
  if (!alvo) return;
  var pressTimer = null;
  var iniciar = function () {
    pressTimer = setTimeout(revelarAcessoEquipe, 700);
  };
  var cancelar = function () {
    if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; }
  };
  alvo.addEventListener('touchstart', iniciar, { passive: true });
  alvo.addEventListener('touchend', cancelar);
  alvo.addEventListener('touchmove', cancelar);
  alvo.addEventListener('mousedown', iniciar);
  alvo.addEventListener('mouseup', cancelar);
  alvo.addEventListener('mouseleave', cancelar);
}


function renderizarAba(id) {
  if (id === 'tab1') renderInicio();
  if (id === 'tab2') renderCheckin();
  if (id === 'tab3') renderAluno();
  if (id === 'tabJogos') {
    try {
      var salvo = localStorage.getItem('uc_nome_jogador_arcade') || '';
      if ($('nomeJogadorTab') && !$('nomeJogadorTab').value) $('nomeJogadorTab').value = salvo;
      if ($('nomeJogadorCorrida') && !$('nomeJogadorCorrida').value) $('nomeJogadorCorrida').value = salvo;
    } catch (e) {}
    try { renderSeletorNiveisArcade(); } catch (e) {}
    renderRankingJogos();
    var box = $('listaRankingJogosTab');
    var src = $('listaRankingJogos');
    if (box && src && src.innerHTML) box.innerHTML = src.innerHTML;
    try { publicarPresencaAvatar(); renderTerreiroListas(); } catch (e2) {}
  }
  if (id === 'tabSimulador') Simulador.render();
  if (id === 'tab4') renderAbaProfessor();
  if (id === 'tab5') renderAbaAdm();
  if (id === 'tab6') renderAbaDev();
  try { atualizarMascoteLivre(); } catch (e3) {}
}

/* ---------------------------------------------------------------
   7. AUTENTICAÇÃO
   --------------------------------------------------------------- */
function autenticarAlunoNuvem(btn) {
  var nome = ($('alunoLoginNome').value || '').trim();
  var senha = $('alunoLoginSenha').value || '';
  if (!nome || !senha) { mostrarToast('Informe nome e senha.', 'erro'); return; }
  if (!DB.carregado('alunos')) {
    mostrarToast('Ainda carregando os dados da academia. Aguarde alguns segundos e tente de novo.', 'erro');
    return;
  }
  if (btn) { btn.classList.add('carregando'); btn.innerHTML = '<span class="spinner-btn"></span> Entrando...'; }

  var alvo = normalizar(nome);
  var achado = null;
  DB.listar('alunos').forEach(function (a) {
    if (!achado && (normalizar(a.nome) === alvo || normalizar(a.apelido) === alvo)) achado = a;
  });
  setTimeout(function () {
    if (btn) { btn.classList.remove('carregando'); btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Entrar no Painel'; }
    if (!achado) { mostrarToast('Aluno não encontrado. Faça o cadastro.', 'erro'); return; }
    if (achado.senhaHash !== hashSenha(senha)) { mostrarToast('Senha incorreta.', 'erro'); return; }
    sessaoAlunoId = achado.id;
    registroLog('auth', 'Aluno entrou: ' + achado.nome);
    $('alunoLoginSenha').value = '';
    renderAluno();
    try { iniciarHeartbeatPresenca(); publicarPresencaAvatar(); } catch (e) {}
    mostrarToast('Bem-vindo(a), ' + esc(achado.apelido || achado.nome) + '!');
  }, 250);
}

function sairAluno() {
  try { limparPresencaAvatar(); } catch (e) {}
  sessaoAlunoId = null;
  renderAluno();
  renderCheckin();
  mostrarToast('Sessão encerrada.');
}

function toggleAutoCadastroAluno(mostrar) {
  $('cardAlunoLogin').style.display = mostrar ? 'none' : 'block';
  $('cardAlunoPrimeiroCadastro').style.display = mostrar ? 'block' : 'none';
  $('cardAlunoPainel').style.display = 'none';
  if (mostrar) renderGraduacoes();
}

function cadastrarAlunoNuvem(btn) {
  var nome = ($('autoCadNome').value || '').trim();
  var apelido = ($('autoCadApelido').value || '').trim();
  var graduacao = $('autoCadGraduacaoSelect').value;
  var contato = ($('autoCadContato').value || '').trim();
  var s1 = $('autoCadSenha').value || '';
  var s2 = $('autoCadSenha2').value || '';

  if (nome.length < 3) { mostrarToast('Informe o nome completo.', 'erro'); return; }
  if (s1.length < 4) { mostrarToast('A senha precisa de ao menos 4 caracteres.', 'erro'); return; }
  if (s1 !== s2) { mostrarToast('As senhas não conferem.', 'erro'); return; }
  if (!DB.carregado('alunos')) {
    mostrarToast('Ainda carregando os dados da academia. Aguarde alguns segundos e tente de novo.', 'erro');
    return;
  }

  var duplicado = DB.listar('alunos').some(function (a) { return normalizar(a.nome) === normalizar(nome); });
  if (duplicado) { mostrarToast('Já existe um aluno com esse nome.', 'erro'); return; }

  if (btn) { btn.classList.add('carregando'); btn.innerHTML = '<span class="spinner-btn"></span> Salvando...'; }

  var categoria = (($('autoCadCategoria') || {}).value || 'adulto');
  if (categoria !== 'infantil') categoria = 'adulto';
  var tipoAluno = (($('autoCadTipoAluno') || {}).value || 'normal');
  if (tipoAluno !== 'gympass') tipoAluno = 'normal';

  var novo = {
    nome: nome,
    apelido: apelido || nome.split(' ')[0],
    graduacao: graduacao,
    categoria: categoria,
    contato: contato,
    tipoAluno: tipoAluno,
    senhaHash: hashSenha(s1),
    criadoEm: agoraISO(),
    ativo: true
  };

  DB.salvar('alunos', novo).then(function (novoId) {
    if (btn) { btn.classList.remove('carregando'); btn.innerHTML = '<i class="fas fa-check"></i> Concluir Cadastro'; }
    sessaoAlunoId = novoId;
    ['autoCadNome', 'autoCadApelido', 'autoCadContato', 'autoCadSenha', 'autoCadSenha2'].forEach(function (id) { if ($(id)) $(id).value = ''; });
    registroLog('cadastro', 'Novo aluno cadastrado: ' + nome);
    toggleAutoCadastroAluno(false);
    boasVindasNovoAluno = true;
    renderAluno();
    mostrarToast('Cadastro concluído! Bem-vindo(a).');
  }).catch(function () {
    if (btn) { btn.classList.remove('carregando'); btn.innerHTML = '<i class="fas fa-check"></i> Concluir Cadastro'; }
  });
}

/* --- equipe (professor / adm / dev) --- */
function montarLoginEquipe(container, papelRequerido) {
  var semEquipe = DB.listar('equipe').length === 0;
  var rotulo = (EQUIPE_PAPEIS.filter(function (p) { return p.id === papelRequerido; })[0] || { nome: 'Equipe' }).nome;
  var sufixo = '_' + papelRequerido;
  var opcoes = semEquipe
    ? '<option value="dev">Dev (primeiro acesso)</option>'
    : EQUIPE_PAPEIS.map(function (p) { return '<option value="' + p.id + '">' + p.nome + '</option>'; }).join('');
  container.innerHTML =
    '<div class="card lock-card">' +
      '<h3 style="color:var(--gold);"><i class="fas fa-lock"></i> Área restrita — ' + esc(rotulo) + '</h3>' +
      (semEquipe
        ? '<div class="aviso-info"><i class="fas fa-star"></i> Nenhum acesso de equipe cadastrado ainda. Crie o primeiro acesso (perfil <strong>Dev</strong>) para liberar as áreas Professor, ADM e Dev.</div>'
        : '<p class="mini">Entre com o nome e a senha cadastrados pela equipe.</p>') +
      '<label class="campo-label">Nome</label>' +
      '<input id="equipeLoginNome' + sufixo + '" placeholder="Nome de usuário da equipe">' +
      '<label class="campo-label">Senha</label>' +
      '<input id="equipeLoginSenha' + sufixo + '" type="password" placeholder="Senha">' +
      (semEquipe ? '<label class="campo-label">Perfil</label><select id="equipeLoginPapel' + sufixo + '">' + opcoes + '</select>' : '') +
      '<button class="btn" onclick="autenticarEquipe(\'' + papelRequerido + '\')"><i class="fas fa-sign-in-alt"></i> Entrar</button>' +
    '</div>';
  return false;
}

function autenticarEquipe(papelRequerido) {
  var sufixo = '_' + papelRequerido;
  var campoNome = $('equipeLoginNome' + sufixo);
  var campoSenha = $('equipeLoginSenha' + sufixo);
  var nome = (campoNome && campoNome.value || '').trim();
  var senha = (campoSenha && campoSenha.value) || '';
  if (nome.length < 3 || senha.length < 4) { mostrarToast('Informe nome e senha (mín. 4 caracteres).', 'erro'); return; }
  if (!DB.carregado('equipe')) {
    mostrarToast('Ainda carregando os dados da academia. Aguarde alguns segundos e tente de novo.', 'erro');
    return;
  }

  var equipe = DB.listar('equipe');

  if (equipe.length === 0) {
    var campoPapel = $('equipeLoginPapel' + sufixo);
    var papelSel = campoPapel ? campoPapel.value : 'dev';
    DB.salvar('equipe', {
      nome: nome, senhaHash: hashSenha(senha), papel: papelSel,
      criadoEm: agoraISO(), ativo: true
    }).then(function (id) {
      sessaoEquipe = { id: id, nome: nome, papel: papelSel };
      registroLog('equipe', 'Primeiro acesso criado: ' + nome + ' (' + papelSel + ')');
      mostrarToast('Acesso criado com sucesso!');
      renderizarAba(abaAtual);
    });
    return;
  }

  var alvo = normalizar(nome);
  var achado = null;
  equipe.forEach(function (u) {
    if (!achado && normalizar(u.nome) === alvo && u.senhaHash === hashSenha(senha)) achado = u;
  });
  if (!achado) { mostrarToast('Credenciais de equipe inválidas.', 'erro'); return; }

  var permitidos = { professor: ['professor', 'adm', 'dev'], adm: ['adm', 'dev'], dev: ['dev'] };
  if ((permitidos[papelRequerido] || []).indexOf(achado.papel) < 0) {
    mostrarToast('Seu perfil (' + esc(achado.papel) + ') não tem acesso a esta área.', 'erro');
    return;
  }
  sessaoEquipe = { id: achado.id, nome: achado.nome, papel: achado.papel };
  registroLog('equipe', 'Login equipe: ' + achado.nome + ' (' + achado.papel + ')');
  mostrarToast('Bem-vindo(a), ' + esc(achado.nome) + '!');
  renderizarAba(abaAtual);
}

function sairEquipe() {
  sessaoEquipe = null;
  renderizarAba(abaAtual);
  mostrarToast('Sessão de equipe encerrada.');
}

function exigirEquipe(papeis, container, rotuloPapel) {
  if (sessaoEquipe && papeis.indexOf(sessaoEquipe.papel) >= 0) return true;
  montarLoginEquipe(container, rotuloPapel || papeis[papeis.length - 1]);
  return false;
}

/* ---------------------------------------------------------------
   8. NOTIFICAÇÕES
   --------------------------------------------------------------- */
var CHAVE_NOTIF = 'uc_notif_ativa';

function pedirPermissaoNotificacao() {
  if (!('Notification' in window)) {
    mostrarToast('Este navegador não suporta notificações.', 'erro');
    return;
  }
  Notification.requestPermission().then(function (perm) {
    if (perm === 'granted') {
      localStorage.setItem(CHAVE_NOTIF, '1');
      $('btnAtivarNotificacao').innerHTML = '<i class="fas fa-bell"></i> Notificações Ativas';
      mostrarToast('Notificações ativadas!');
      notificar('Universo Capoeira', 'Você receberá os avisos do professor.');
    } else {
      localStorage.removeItem(CHAVE_NOTIF);
      mostrarToast('Permissão de notificação negada.', 'erro');
    }
  });
}

function notificacaoAtiva() { return localStorage.getItem(CHAVE_NOTIF) === '1'; }

function notificar(titulo, corpo) {
  if (!notificacaoAtiva() || !('Notification' in window) || Notification.permission !== 'granted') return;
  try { new Notification(titulo, { body: corpo, icon: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/svgs/solid/child-reaching.svg' }); }
  catch (e) { console.warn('Falha ao notificar', e); }
}

/* ---------------------------------------------------------------
   9. MÓDULO INÍCIO
   --------------------------------------------------------------- */
var ultimoAvisoNotificado = null;

function renderInicio() {
  renderHorarioFixoInicio();
  renderAvisoLocal();
  renderAvisoAvaliacaoObrigatoria();
  /* "Professor na aula" não aparece mais no Início — só na aba Check-in */
  var boxProfInicio = $('boxProfessorNaAulaInicio');
  if (boxProfInicio) boxProfInicio.innerHTML = '';
  renderRanking();
  renderRankingCompleto();
  renderCertificadosAluno();
  renderRankingJogos();
  preencherNomeJogadorCorrida();
  renderSeletorNiveisArcade();
  renderFormacaoInfantilUI();
  renderMural();
  renderFeedInstagramNota();
  renderPerguntaSemanaInicio();
  atualizarIconeFormadorUI();
  if (notificacaoAtiva() && $('btnAtivarNotificacao')) {
    $('btnAtivarNotificacao').innerHTML = '<i class="fas fa-bell"></i> Notificações Ativas';
  }
  setTimeout(atualizarBadgesInteracao, 80);
}

function inscricaoFormacaoDoAluno(aluno) {
  if (!aluno) return null;
  return DB.listar('formacaoInfantil').filter(function (f) {
    return (f.alunoId && f.alunoId === aluno.id) || normalizar(f.nome || '') === normalizar(aluno.nome || '');
  }).sort(function (a, b) { return String(b.criadoEm || '').localeCompare(String(a.criadoEm || '')); })[0] || null;
}

function alunoEmFormacaoAprovado(aluno) {
  var f = inscricaoFormacaoDoAluno(aluno || alunoLogado());
  return !!(f && f.status === 'aprovado');
}

function htmlIconeFormador() {
  return '<span class="pill" style="background:linear-gradient(135deg,#ffc107,#ff8f00); color:#1a1a1a; font-weight:800;" title="Formação infantil — pode dar aulas">' +
    '<i class="fas fa-chalkboard-teacher"></i> Formador</span>';
}

function preencherFormacaoInfantilCampos() {
  renderFormacaoInfantilUI();
}

function renderFormacaoInfantilUI() {
  var box = $('boxFormacaoInfantilUI');
  if (!box) return;
  var aluno = alunoLogado();
  if (!aluno) {
    box.innerHTML = '<div class="aviso-info"><i class="fas fa-user-lock"></i> Faça login na aba <b>Aluno</b> com seu cadastro. Depois volte aqui e use o mesmo login para se inscrever na formação.</div>' +
      '<button class="btn btn-secondary" onclick="abrirAba(\'tab3\')"><i class="fas fa-sign-in-alt"></i> Ir para login do Aluno</button>';
    renderMinhaInscricaoFormacao();
    return;
  }
  var insc = inscricaoFormacaoDoAluno(aluno);
  if (insc && insc.status === 'aprovado') {
    box.innerHTML = '<div class="aviso-info" style="border-color:var(--gold);">' +
      htmlIconeFormador() + ' <b>' + esc(aluno.apelido || aluno.nome) + '</b> está na formação e pode auxiliar/dar aulas infantis.' +
      '<br><span class="mini">Ícone de formador também aparece no check-in e no painel do aluno.</span></div>';
  } else if (insc && insc.status === 'pendente') {
    box.innerHTML = '<div class="aviso-info"><i class="fas fa-hourglass-half"></i> Inscrição de <b>' + esc(aluno.nome) + '</b> aguardando aprovação do professor.</div>';
  } else if (insc && insc.status === 'recusado') {
    box.innerHTML = '<div class="alerta-dificuldade"><i class="fas fa-times-circle"></i> Inscrição anterior não aprovada.' +
      (insc.respostaProfessor ? ' ' + esc(insc.respostaProfessor) : '') + '</div>' +
      '<label class="campo-label">Motivação (nova tentativa)</label>' +
      '<textarea id="formacaoMotivo" placeholder="Por que quer dar aula de capoeira para crianças?"></textarea>' +
      '<button class="btn btn-gold" onclick="inscreverFormacaoInfantil(this)"><i class="fas fa-paper-plane"></i> Enviar de novo com meu login</button>';
  } else {
    box.innerHTML = '<div class="aviso-info"><i class="fas fa-id-card"></i> Logado como <b>' + esc(aluno.nome) + '</b>' +
      (aluno.apelido ? ' (' + esc(aluno.apelido) + ')' : '') + '. A inscrição usa este login — não precisa criar conta nova.</div>' +
      '<label class="campo-label">Experiência com crianças (opcional)</label>' +
      '<textarea id="formacaoExp" placeholder="Ex: já ajudei em roda infantil..."></textarea>' +
      '<label class="campo-label">Motivação</label>' +
      '<textarea id="formacaoMotivo" placeholder="Por que quer dar aula de capoeira para crianças?"></textarea>' +
      '<button class="btn btn-gold" onclick="inscreverFormacaoInfantil(this)"><i class="fas fa-chalkboard-teacher"></i> Inscrever com meu login</button>';
  }
  renderMinhaInscricaoFormacao();
  atualizarIconeFormadorUI();
}

function renderMinhaInscricaoFormacao() {
  var box = $('boxMinhaInscricaoFormacao');
  if (!box) return;
  var aluno = alunoLogado();
  var f = inscricaoFormacaoDoAluno(aluno);
  if (!f) { box.innerHTML = ''; return; }
  var st = f.status === 'aprovado' ? 'pill-ok' : (f.status === 'recusado' ? 'pill-no' : 'pill-pend');
  box.innerHTML = '<div class="lista-item"><div class="linha"><span>Status da formação</span><span class="pill ' + st + '">' + esc(f.status || 'pendente') + '</span></div>' +
    (f.respostaProfessor ? '<span class="mini">Prof.: ' + esc(f.respostaProfessor) + '</span>' : '') +
    (f.status === 'aprovado' ? '<div style="margin-top:6px;">' + htmlIconeFormador() + '</div>' : '') +
    '</div>';
}

function inscreverFormacaoInfantil(btn) {
  var aluno = alunoLogado();
  if (!aluno) {
    mostrarToast('Faça login na aba Aluno primeiro.', 'erro');
    abrirAba('tab3');
    return;
  }
  var motivo = ($('formacaoMotivo') || {}).value ? $('formacaoMotivo').value.trim() : '';
  var exp = ($('formacaoExp') || {}).value ? $('formacaoExp').value.trim() : '';
  if (motivo.length < 8) { mostrarToast('Conte um pouco da sua motivação.', 'erro'); return; }
  var ja = DB.listar('formacaoInfantil').some(function (f) {
    return f.status === 'pendente' && (
      (f.alunoId && f.alunoId === aluno.id) || normalizar(f.nome) === normalizar(aluno.nome)
    );
  });
  if (ja) { mostrarToast('Você já tem uma inscrição pendente.', 'erro'); return; }
  if (btn) { btn.disabled = true; btn.classList.add('carregando'); }
  DB.salvar('formacaoInfantil', {
    alunoId: aluno.id,
    nome: aluno.nome,
    apelido: aluno.apelido || '',
    contato: aluno.contato || '',
    experiencia: exp,
    motivo: motivo,
    status: 'pendente',
    criadoEm: agoraISO()
  }).then(function () {
    if (btn) { btn.disabled = false; btn.classList.remove('carregando'); }
    mostrarToast('Inscrição enviada com seu login!');
    notificar('Nova inscrição — formação infantil', aluno.nome + ' quer se formar para dar aula para crianças');
    renderFormacaoInfantilUI();
  }).catch(function () {
    if (btn) { btn.disabled = false; btn.classList.remove('carregando'); }
    mostrarToast('Não foi possível enviar. Tente de novo.', 'erro');
  });
}

function atualizarIconeFormadorUI() {
  var aluno = alunoLogado();
  var aprovado = alunoEmFormacaoAprovado(aluno);
  /* badge no header do app */
  var titulo = $('headerTituloTexto');
  var badge = $('badgeFormadorHeader');
  if (!badge && titulo && titulo.parentNode) {
    badge = document.createElement('span');
    badge.id = 'badgeFormadorHeader';
    badge.style.marginLeft = '6px';
    titulo.parentNode.appendChild(badge);
  }
  if (badge) badge.innerHTML = aprovado ? htmlIconeFormador() : '';
  /* no check-in */
  var boxCk = $('boxIconeFormadorCheckin');
  if (!boxCk) {
    var tab2 = $('tab2');
    if (tab2) {
      boxCk = document.createElement('div');
      boxCk.id = 'boxIconeFormadorCheckin';
      tab2.insertBefore(boxCk, tab2.firstChild);
    }
  }
  if (boxCk) {
    boxCk.innerHTML = aprovado
      ? '<div class="card" style="border:1px solid var(--gold); padding:10px;">' + htmlIconeFormador() +
        ' <span class="mini">Você está na formação e pode auxiliar nas aulas infantis.</span></div>'
      : '';
  }
}

function renderBannerProfessorInicio() {
  /* desativado no Início a pedido do usuário */
  var box = $('boxProfessorNaAulaInicio');
  if (box) box.innerHTML = '';
}

function preencherNomeJogadorCorrida() {
  var campo = $('nomeJogadorCorrida');
  if (!campo || (campo.value || '').trim()) return;
  var aluno = alunoLogado();
  if (aluno) campo.value = aluno.apelido || aluno.nome || '';
}

function renderSeletorNiveisArcade() {
  var jogos = [
    { id: 'pacman', nome: 'Pac-Man' },
    { id: 'snake', nome: 'Minhoca' },
    { id: 'corrida', nome: 'Corrida' },
    { id: 'quebra', nome: 'Quebra-Blocos' },
    { id: 'pulo', nome: 'Pulo' },
    { id: 'surfe', nome: 'Surfe' },
    { id: 'mario', nome: 'Aventura' },
    { id: 'damas', nome: 'Damas' }
  ];
  var html = '<p class="mini" style="margin-bottom:6px;">Níveis na nuvem (e neste aparelho) — grátis:</p>';
  var totalMax = 0;
  jogos.forEach(function (j) {
    var max = nivelMaxDesbloqueado(j.id);
    totalMax += max;
    html += '<div class="lista-item" style="padding:6px 8px;"><div class="linha"><b>' + esc(j.nome) + '</b><span class="badge-count">Nv. ' + max + '/10</span></div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;">';
    for (var n = 1; n <= 10; n++) {
      var livre = n <= max;
      html += '<button type="button" class="btn btn-mini ' + (livre ? 'btn-secondary' : '') + '" style="width:auto;padding:4px 8px;margin:0;opacity:' + (livre ? '1' : '0.35') + ';" ' +
        (livre ? 'onclick="abrirJogoArcade(\'' + j.id + '\',' + n + ')"' : 'disabled') + '>' + n + '</button>';
    }
    html += '</div></div>';
  });
  /* mantém Início e aba Jogos sincronizados — nada removido */
  var box = $('boxNiveisArcade');
  if (box) box.innerHTML = html;
  var boxTab = $('boxNiveisArcadeTab');
  if (boxTab) boxTab.innerHTML = html;
  var resumo = $('resumoArcadeInicio');
  if (resumo) {
    resumo.innerHTML = 'Progresso médio: <b style="color:var(--primary-green);">Nv. ' +
      Math.max(1, Math.round(totalMax / jogos.length)) + '/10</b> nos jogos · toque em <b>Abrir aba Jogos</b> para jogar.';
  }
}

function rankingPontosJogos() {
  var mapa = {};
  DB.listar('pontosJogos').forEach(function (r) {
    var k = normalizar(r.nome);
    if (!k) return;
    if (!mapa[k]) mapa[k] = { nome: r.nome, pontos: 0 };
    mapa[k].pontos += Number(r.pontos) || 0;
    if (r.nome && r.nome.length > mapa[k].nome.length) mapa[k].nome = r.nome;
  });
  return Object.keys(mapa).map(function (k) { return mapa[k]; })
    .sort(function (a, b) { return b.pontos - a.pontos; });
}

function renderRankingJogos() {
  var box = $('listaRankingJogos');
  var boxTab = $('listaRankingJogosTab');
  if (!box && !boxTab) return;
  if (!box) { box = boxTab; }
  var lista = rankingPontosJogos().slice(0, 8);
  if (!lista.length) {
    var vazio = '<p class="sem-dados">Ninguém pontuou ainda. Seja o primeiro na corrida!</p>';
    box.innerHTML = vazio;
    if (boxTab && boxTab !== box) boxTab.innerHTML = vazio;
    return;
  }
  var html = '';
  lista.forEach(function (item, idx) {
    var med = ['🥇', '🥈', '🥉'][idx] || ((idx + 1) + 'º');
    html += '<div class="lista-item"><div class="linha"><span>' + med + ' <b>' + esc(item.nome) + '</b></span>' +
      '<span class="badge-count">' + item.pontos + ' pts</span></div></div>';
  });
  box.innerHTML = html;

  try {
    var boxTab = $('listaRankingJogosTab');
    if (boxTab && box) boxTab.innerHTML = box.innerHTML;
    else if (boxTab && !box) {
      /* se só a aba existe, reusa a mesma renderização */
    }
  } catch (e) {}
}

function jogarCorrida() {
  var campo = $('nomeJogadorCorrida');
  var nome = (campo && campo.value || '').trim();
  if (nome.length < 2) { mostrarToast('Digite seu nome ou apelido para jogar.', 'erro'); return; }
  var btn = $('btnJogarCorrida');
  var corredor = $('corredorEmoji');
  var status = $('txtStatusCorrida');
  if (btn) { btn.disabled = true; btn.classList.add('carregando'); }
  if (status) status.textContent = 'Largada! Acelerando...';
  if (corredor) { corredor.style.display = 'block'; corredor.style.left = '8px'; }
  setTimeout(function () { if (corredor) corredor.style.left = 'calc(100% - 40px)'; }, 50);
  var ganho = Math.floor(Math.random() * 200) + 100;
  setTimeout(function () {
    registrarPontosJogo(nome, ganho, 'corrida').then(function () {
      if (status) status.textContent = 'Chegada! +' + ganho + ' pts!';
      if (btn) { btn.disabled = false; btn.classList.remove('carregando'); }
      if (corredor) setTimeout(function () { corredor.style.left = '8px'; corredor.style.display = 'none'; }, 800);
      mostrarToast('Parabéns! Você ganhou ' + ganho + ' pontos!');
      renderRankingJogos();
    }).catch(function () {
      if (btn) { btn.disabled = false; btn.classList.remove('carregando'); }
    });
  }, 1300);
}

function sincronizarNomeJogador(val) {
  var a = $('nomeJogadorCorrida');
  var b = $('nomeJogadorTab');
  if (a && a !== document.activeElement) a.value = val || '';
  if (b && b !== document.activeElement) b.value = val || '';
  try { localStorage.setItem('uc_nome_jogador_arcade', (val || '').trim()); } catch (e) {}
}
function nomeJogadorArcade() {
  var a = ($('nomeJogadorCorrida') && $('nomeJogadorCorrida').value) || '';
  var b = ($('nomeJogadorTab') && $('nomeJogadorTab').value) || '';
  var n = (a || b || '').trim();
  if (!n) { try { n = (localStorage.getItem('uc_nome_jogador_arcade') || '').trim(); } catch (e) {} }
  if (!n) {
    var aluno = typeof alunoLogado === 'function' ? alunoLogado() : null;
    if (aluno) n = aluno.apelido || aluno.nome || '';
  }
  if (!n) n = 'Jogador';
  return n;
}

function registrarPontosJogo(nome, pontos, jogo) {
  var aluno = alunoLogado() || encontrarAlunoPorNome(nome);
  return DB.salvar('pontosJogos', {
    nome: aluno ? (aluno.apelido || aluno.nome) : nome,
    alunoId: aluno ? aluno.id : '',
    pontos: Math.max(0, Math.round(pontos)),
    jogo: jogo || 'arcade',
    criadoEm: agoraISO()
  }).then(function () { renderRankingJogos(); });
}

/* ===== Desafios de jogos entre alunos ===== */
var desafioAtivoId = null;
var JOGOS_DESAFIO = [
  { id: 'pacman', nome: 'Pac-Man' },
  { id: 'snake', nome: 'Minhoca' },
  { id: 'corrida', nome: 'Corrida' },
  { id: 'quebra', nome: 'Quebra-Blocos' },
  { id: 'pulo', nome: 'Pulo' },
  { id: 'surfe', nome: 'Surfe' },
  { id: 'mario', nome: 'Aventura' },
  { id: 'damas', nome: 'Damas' }
];

function nomeJogoDesafio(id) {
  var j = JOGOS_DESAFIO.find(function (x) { return x.id === id; });
  return j ? j.nome : id;
}

function htmlCardDesafiosJogos(aluno) {
  if (!aluno) return '';
  var lista = DB.listar('desafiosJogos').sort(function (a, b) {
    return String(b.criadoEm || '').localeCompare(String(a.criadoEm || ''));
  });
  var abertos = lista.filter(function (d) {
    return d.status === 'aberto' && d.desafianteId !== aluno.id;
  }).slice(0, 8);
  var meus = lista.filter(function (d) {
    return d.desafianteId === aluno.id || d.desafiadoId === aluno.id;
  }).slice(0, 10);

  var html = '<div class="card" style="border:1px solid var(--primary-green);">' +
    '<h3 style="color:var(--primary-green);"><i class="fas fa-fist-raised"></i> Desafios de Jogos</h3>' +
    '<p class="mini" style="margin-bottom:8px;">Lance um desafio para outro aluno. Quem fizer mais pontos no jogo vence.</p>' +
    '<label class="campo-label">Jogo</label>' +
    '<select id="desafioJogoSel">' +
      JOGOS_DESAFIO.map(function (j) {
        return '<option value="' + j.id + '">' + esc(j.nome) + '</option>';
      }).join('') +
    '</select>' +
    '<label class="campo-label">Desafiar (nome ou apelido — deixe vazio para qualquer um)</label>' +
    '<input id="desafioAlvoNome" placeholder="Ex: Formiga ou deixe em branco">' +
    '<label class="campo-label">Mensagem (opcional)</label>' +
    '<input id="desafioMsg" placeholder="Ex: Bora ver quem manda na minhoca!">' +
    '<button class="btn" onclick="lancarDesafioJogo(this)"><i class="fas fa-bolt"></i> Lançar desafio</button>';

  if (abertos.length) {
    html += '<h3 style="margin-top:12px;font-size:0.85rem;"><i class="fas fa-inbox"></i> Desafios abertos</h3>';
    abertos.forEach(function (d) {
      html += '<div class="lista-item"><div class="linha"><span><b>' + esc(d.desafianteNome) + '</b> · ' + esc(nomeJogoDesafio(d.jogo)) + '</span>' +
        '<span class="pill pill-pend">aberto</span></div>' +
        (d.mensagem ? '<span class="mini">' + esc(d.mensagem) + '</span>' : '') +
        (d.desafiadoNome ? '<span class="mini">Para: ' + esc(d.desafiadoNome) + '</span>' : '<span class="mini">Para qualquer aluno</span>') +
        '<button class="btn btn-mini" style="margin-top:6px;" onclick="aceitarDesafioJogo(\'' + d.id + '\')"><i class="fas fa-check"></i> Aceitar e jogar</button></div>';
    });
  }

  if (meus.length) {
    html += '<h3 style="margin-top:12px;font-size:0.85rem;"><i class="fas fa-history"></i> Meus desafios</h3>';
    meus.forEach(function (d) {
      var st = d.status === 'finalizado' ? 'pill-ok' : (d.status === 'cancelado' ? 'pill-no' : 'pill-pend');
      var placar = '';
      if (d.status === 'finalizado') {
        placar = '<div class="mini">Placar: ' + esc(d.desafianteNome) + ' ' + (d.scoreDesafiante || 0) +
          ' × ' + (d.scoreDesafiado || 0) + ' ' + esc(d.desafiadoNome || 'rival') +
          (d.vencedorNome ? ' · Venceu: <b>' + esc(d.vencedorNome) + '</b>' : '') + '</div>';
      } else if (d.status === 'aceito' || d.status === 'em_jogo') {
        placar = '<div class="mini">Pontos: você ' +
          (d.desafianteId === aluno.id ? (d.scoreDesafiante || '—') : (d.scoreDesafiado || '—')) +
          ' · rival ' +
          (d.desafianteId === aluno.id ? (d.scoreDesafiado || '—') : (d.scoreDesafiante || '—')) + '</div>';
      }
      html += '<div class="lista-item"><div class="linha"><span>' + esc(nomeJogoDesafio(d.jogo)) + ' · ' +
        esc(d.desafianteNome) + ' vs ' + esc(d.desafiadoNome || 'aberto') + '</span>' +
        '<span class="pill ' + st + '">' + esc(d.status) + '</span></div>' + placar;
      if (d.status === 'aceito' || d.status === 'em_jogo') {
        html += '<button class="btn btn-mini btn-gold" style="margin-top:6px;" onclick="jogarDesafioAtivo(\'' + d.id + '\')"><i class="fas fa-gamepad"></i> Jogar agora</button>';
      }
      if (d.status === 'aberto' && d.desafianteId === aluno.id) {
        html += '<button class="btn btn-mini btn-secondary" style="margin-top:6px;" onclick="cancelarDesafioJogo(\'' + d.id + '\')"><i class="fas fa-times"></i> Cancelar</button>';
      }
      html += '</div>';
    });
  }

  html += '</div>';
  return html;
}

function lancarDesafioJogo(btn) {
  var aluno = alunoLogado();
  if (!aluno) { mostrarToast('Faça login na aba Aluno.', 'erro'); return; }
  var jogo = ($('desafioJogoSel') || {}).value || 'snake';
  var alvo = ($('desafioAlvoNome') || {}).value ? $('desafioAlvoNome').value.trim() : '';
  var msg = ($('desafioMsg') || {}).value ? $('desafioMsg').value.trim() : '';
  var ja = DB.listar('desafiosJogos').some(function (d) {
    return d.desafianteId === aluno.id && (d.status === 'aberto' || d.status === 'aceito' || d.status === 'em_jogo');
  });
  if (ja) { mostrarToast('Você já tem um desafio em andamento.', 'erro'); return; }
  if (btn) { btn.disabled = true; btn.classList.add('carregando'); }
  DB.salvar('desafiosJogos', {
    desafianteId: aluno.id,
    desafianteNome: aluno.apelido || aluno.nome,
    desafiadoId: '',
    desafiadoNome: alvo,
    jogo: jogo,
    mensagem: msg,
    status: 'aberto',
    scoreDesafiante: null,
    scoreDesafiado: null,
    vencedorId: '',
    vencedorNome: '',
    criadoEm: agoraISO()
  }).then(function () {
    if (btn) { btn.disabled = false; btn.classList.remove('carregando'); }
    mostrarToast('Desafio lançado!');
    notificar('Novo desafio de jogo', (aluno.apelido || aluno.nome) + ' desafiou no ' + nomeJogoDesafio(jogo));
    renderAluno();
  }).catch(function () {
    if (btn) { btn.disabled = false; btn.classList.remove('carregando'); }
    mostrarToast('Não foi possível lançar o desafio.', 'erro');
  });
}

function aceitarDesafioJogo(id) {
  var aluno = alunoLogado();
  if (!aluno) { mostrarToast('Faça login na aba Aluno.', 'erro'); return; }
  var d = DB.buscar('desafiosJogos', id);
  if (!d || d.status !== 'aberto') { mostrarToast('Desafio indisponível.', 'erro'); return; }
  if (d.desafianteId === aluno.id) { mostrarToast('Você não pode aceitar o próprio desafio.', 'erro'); return; }
  /* se o desafio citava um nome, qualquer aluno logado ainda pode aceitar (desafio aberto na academia) */
  DB.atualizar('desafiosJogos', id, {
    desafiadoId: aluno.id,
    desafiadoNome: aluno.apelido || aluno.nome,
    status: 'aceito',
    aceitoEm: agoraISO()
  }).then(function () {
    desafioAtivoId = id;
    mostrarToast('Desafio aceito! Jogue agora.');
    if ($('nomeJogadorCorrida')) $('nomeJogadorCorrida').value = aluno.apelido || aluno.nome;
    abrirJogoArcade(d.jogo, 1);
  }).catch(function () {
    mostrarToast('Erro ao aceitar.', 'erro');
  });
}

function jogarDesafioAtivo(id) {
  var aluno = alunoLogado();
  if (!aluno) return;
  var d = DB.buscar('desafiosJogos', id);
  if (!d || (d.status !== 'aceito' && d.status !== 'em_jogo')) {
    mostrarToast('Desafio não está ativo.', 'erro');
    return;
  }
  if (d.desafianteId !== aluno.id && d.desafiadoId !== aluno.id) {
    mostrarToast('Este desafio não é seu.', 'erro');
    return;
  }
  /* já jogou? */
  var jaScore = (d.desafianteId === aluno.id && d.scoreDesafiante != null) ||
    (d.desafiadoId === aluno.id && d.scoreDesafiado != null);
  if (jaScore) {
    mostrarToast('Você já enviou sua pontuação neste desafio.', 'erro');
    return;
  }
  desafioAtivoId = id;
  DB.atualizar('desafiosJogos', id, { status: 'em_jogo' });
  if ($('nomeJogadorCorrida')) $('nomeJogadorCorrida').value = aluno.apelido || aluno.nome;
  abrirJogoArcade(d.jogo, 1);
}

function cancelarDesafioJogo(id) {
  var aluno = alunoLogado();
  var d = DB.buscar('desafiosJogos', id);
  if (!d || d.desafianteId !== (aluno && aluno.id)) return;
  DB.atualizar('desafiosJogos', id, { status: 'cancelado' }).then(function () {
    mostrarToast('Desafio cancelado.');
    renderAluno();
  });
}

function registrarScoreDesafio(score, jogo) {
  if (!desafioAtivoId) return Promise.resolve();
  var aluno = alunoLogado();
  if (!aluno) return Promise.resolve();
  var d = DB.buscar('desafiosJogos', desafioAtivoId);
  if (!d || (d.status !== 'aceito' && d.status !== 'em_jogo')) {
    desafioAtivoId = null;
    return Promise.resolve();
  }
  if (d.jogo && jogo && d.jogo !== jogo) return Promise.resolve();
  var patch = {};
  if (d.desafianteId === aluno.id) {
    if (d.scoreDesafiante != null) { desafioAtivoId = null; return Promise.resolve(); }
    patch.scoreDesafiante = Math.max(0, Math.round(score));
  } else if (d.desafiadoId === aluno.id) {
    if (d.scoreDesafiado != null) { desafioAtivoId = null; return Promise.resolve(); }
    patch.scoreDesafiado = Math.max(0, Math.round(score));
  } else {
    desafioAtivoId = null;
    return Promise.resolve();
  }
  patch.status = 'em_jogo';
  var s1 = patch.scoreDesafiante != null ? patch.scoreDesafiante : d.scoreDesafiante;
  var s2 = patch.scoreDesafiado != null ? patch.scoreDesafiado : d.scoreDesafiado;
  if (s1 != null && s2 != null) {
    patch.status = 'finalizado';
    patch.finalizadoEm = agoraISO();
    if (s1 > s2) {
      patch.vencedorId = d.desafianteId;
      patch.vencedorNome = d.desafianteNome;
    } else if (s2 > s1) {
      patch.vencedorId = d.desafiadoId;
      patch.vencedorNome = d.desafiadoNome;
    } else {
      patch.vencedorId = '';
      patch.vencedorNome = 'Empate';
    }
  }
  var id = desafioAtivoId;
  desafioAtivoId = null;
  return DB.atualizar('desafiosJogos', id, patch).then(function () {
    if (patch.status === 'finalizado') {
      mostrarToast(patch.vencedorNome === 'Empate' ? 'Desafio empatado!' : 'Desafio finalizado! Venceu: ' + patch.vencedorNome);
      notificar('Desafio finalizado', nomeJogoDesafio(d.jogo) + ': ' + (patch.vencedorNome || ''));
    } else {
      mostrarToast('Pontuação do desafio registrada! Aguarde o rival.');
    }
    try { renderAluno(); } catch (e) {}
  });
}

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

var ARCADE_NIVEIS_KEY = 'uc_arcade_niveis';

function carregarNiveisArcade() {
  var data = {};
  try { data = JSON.parse(localStorage.getItem(ARCADE_NIVEIS_KEY) || '{}') || {}; } catch (e) { data = {}; }
  /* mescla progresso da nuvem: aluno logado → aparelho → nome/apelido do jogador */
  try {
    var aluno = typeof alunoLogado === 'function' ? alunoLogado() : null;
    var lista = DB.listar('progressoJogos') || [];
    var ap = '';
    try { ap = localStorage.getItem('uc_aparelho_id') || localStorage.getItem('uc_aparelho_id_v87') || ''; } catch (e2) {}
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
  var k = 'uc_aparelho_id';
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

/* Cenários distintos por nível (visual + nome no HUD) */
var CENARIOS_ARCADE = {
  corrida: [
    { nome: 'Avenida Central', ceu: ['#0a1628', '#1a1a1a'], asfalto: '#1c2333', neon: '#00e676', tema: 'cidade' },
    { nome: 'Túnel Neon', ceu: ['#0d0221', '#1a0533'], asfalto: '#12082a', neon: '#e040fb', tema: 'neon' },
    { nome: 'Orla da Baía', ceu: ['#012a4a', '#014f86'], asfalto: '#2b2d42', neon: '#00d2ff', tema: 'agua' },
    { nome: 'Serra Noturna', ceu: ['#1b4332', '#081c15'], asfalto: '#1d3557', neon: '#95d5b2', tema: 'floresta' },
    { nome: 'Pista Industrial', ceu: ['#212529', '#343a40'], asfalto: '#495057', neon: '#ffc107', tema: 'industrial' },
    { nome: 'Deserto Vermelho', ceu: ['#3d0814', '#5c1a1a'], asfalto: '#2b1810', neon: '#ff6b35', tema: 'deserto' },
    { nome: 'Cidade Chuva', ceu: ['#0b132b', '#1c2541'], asfalto: '#3a506b', neon: '#5bc0be', tema: 'chuva' },
    { nome: 'Circuito Gelo', ceu: ['#0a1628', '#1b3a4b'], asfalto: '#274c77', neon: '#a8dadc', tema: 'gelo' },
    { nome: 'Autódromo Solar', ceu: ['#3d2b1f', '#1a120b'], asfalto: '#2d3436', neon: '#fdcb6e', tema: 'sol' },
    { nome: 'Final Capoeira', ceu: ['#004d40', '#1b5e20'], asfalto: '#0d1b1e', neon: '#00e676', tema: 'axe' }
  ],
  pacman: [
    { nome: 'Labirinto Clássico', bg: ['#03080c', '#0a1628'], parede: '#1a3a6e', accent: '#3d7cff', tema: 'classico' },
    { nome: 'Roda na Praça', bg: ['#1a0a00', '#3e2723'], parede: '#6d4c41', accent: '#ffc107', tema: 'roda' },
    { nome: 'Senzala', bg: ['#1b1008', '#3e2723'], parede: '#5d4037', accent: '#ff8f00', tema: 'senzala' },
    { nome: 'Mercado', bg: ['#0d1b2a', '#1b2838'], parede: '#37474f', accent: '#00bcd4', tema: 'mercado' },
    { nome: 'Porto', bg: ['#001e3c', '#0a2744'], parede: '#1565c0', accent: '#4fc3f7', tema: 'porto' },
    { nome: 'Morro', bg: ['#1b2e1b', '#0d1f12'], parede: '#2e7d32', accent: '#81c784', tema: 'morro' },
    { nome: 'Ilha', bg: ['#004d40', '#00695c'], parede: '#00897b', accent: '#80cbc4', tema: 'ilha' },
    { nome: 'Arena', bg: ['#311b92', '#1a237e'], parede: '#5e35b1', accent: '#b39ddb', tema: 'arena' },
    { nome: 'Templo', bg: ['#3e2723', '#4e342e'], parede: '#8d6e63', accent: '#ffcc80', tema: 'templo' },
    { nome: 'Final Mestre', bg: ['#004d40', '#1b5e20'], parede: '#00c853', accent: '#00e676', tema: 'mestre' }
  ],
  snake: [
    { nome: 'Gramado', bg: ['#041a12', '#0a1f18'], grade: 'rgba(0,230,118,0.08)', corpo: '#00e676', tema: 'grama' },
    { nome: 'Areia', bg: ['#3e2723', '#5d4037'], grade: 'rgba(255,193,7,0.1)', corpo: '#ffb300', tema: 'areia' },
    { nome: 'Mata', bg: ['#0d2818', '#1b5e20'], grade: 'rgba(129,199,132,0.12)', corpo: '#69f0ae', tema: 'mata' },
    { nome: 'Rio', bg: ['#01579b', '#0277bd'], grade: 'rgba(129,212,250,0.12)', corpo: '#4fc3f7', tema: 'rio' },
    { nome: 'Pedreira', bg: ['#37474f', '#455a64'], grade: 'rgba(176,190,197,0.12)', corpo: '#b0bec5', tema: 'pedra' },
    { nome: 'Noite', bg: ['#0a0a1a', '#1a1a2e'], grade: 'rgba(179,157,219,0.1)', corpo: '#b39ddb', tema: 'noite' },
    { nome: 'Neblina', bg: ['#263238', '#37474f'], grade: 'rgba(207,216,220,0.1)', corpo: '#cfd8dc', tema: 'neblina' },
    { nome: 'Vulcão', bg: ['#3e0000', '#b71c1c'], grade: 'rgba(255,87,34,0.15)', corpo: '#ff5722', tema: 'vulcao' },
    { nome: 'Gelo', bg: ['#0d47a1', '#1565c0'], grade: 'rgba(187,222,251,0.12)', corpo: '#81d4fa', tema: 'gelo' },
    { nome: 'Axé Final', bg: ['#004d40', '#1b5e20'], grade: 'rgba(0,230,118,0.15)', corpo: '#00e676', tema: 'axe' }
  ],
  pulo: [
    { nome: 'Canos Verdes', bg: ['#0a1628', '#1b5e20'], cano: '#00c853', tema: 'verde' },
    { nome: 'Canos Azuis', bg: ['#0d1b2a', '#0d47a1'], cano: '#2196f3', tema: 'azul' },
    { nome: 'Canos Roxos', bg: ['#1a0533', '#4a148c'], cano: '#ab47bc', tema: 'roxo' },
    { nome: 'Canos Laranja', bg: ['#3e1700', '#e65100'], cano: '#ff9800', tema: 'laranja' },
    { nome: 'Canos Neon', bg: ['#0d0221', '#1a0533'], cano: '#e040fb', tema: 'neon' },
    { nome: 'Canos Ouro', bg: ['#3e2723', '#5d4037'], cano: '#ffc107', tema: 'ouro' },
    { nome: 'Canos Gelo', bg: ['#0a1628', '#1565c0'], cano: '#81d4fa', tema: 'gelo' },
    { nome: 'Canos Fogo', bg: ['#3e0000', '#bf360c'], cano: '#ff5722', tema: 'fogo' },
    { nome: 'Canos Sombra', bg: ['#000', '#212121'], cano: '#616161', tema: 'sombra' },
    { nome: 'Canos Lenda', bg: ['#004d40', '#1b5e20'], cano: '#00e676', tema: 'lenda' }
  ],
  surfe: [
    { nome: 'Praia', bg: ['#0277bd', '#4fc3f7'], faixa: '#ffe082', tema: 'praia' },
    { nome: 'Onda Alta', bg: ['#01579b', '#0288d1'], faixa: '#80deea', tema: 'onda' },
    { nome: 'Mar Aberto', bg: ['#006064', '#00acc1'], faixa: '#b2ebf2', tema: 'aberto' },
    { nome: 'Tempestade', bg: ['#263238', '#455a64'], faixa: '#90a4ae', tema: 'tempestade' },
    { nome: 'Pôr do Sol', bg: ['#bf360c', '#ff6f00'], faixa: '#ffcc80', tema: 'por-do-sol' },
    { nome: 'Noite', bg: ['#0d1b2a', '#1a237e'], faixa: '#5c6bc0', tema: 'noite' },
    { nome: 'Recife', bg: ['#004d40', '#00695c'], faixa: '#80cbc4', tema: 'recife' },
    { nome: 'Ilha', bg: ['#1b5e20', '#43a047'], faixa: '#c8e6c9', tema: 'ilha' },
    { nome: 'Tsunami', bg: ['#0d47a1', '#1565c0'], faixa: '#e3f2fd', tema: 'tsunami' },
    { nome: 'Final Axé', bg: ['#004d40', '#00c853'], faixa: '#69f0ae', tema: 'axe' }
  ],
  mario: [
    { nome: 'Colina 1', bg: ['#4fc3f7', '#81d4fa'], chao: '#66bb6a', tema: 'colina' },
    { nome: 'Caverna', bg: ['#212121', '#424242'], chao: '#6d4c41', tema: 'caverna' },
    { nome: 'Castelo', bg: ['#4a148c', '#6a1b9a'], chao: '#5d4037', tema: 'castelo' },
    { nome: 'Floresta', bg: ['#1b5e20', '#2e7d32'], chao: '#33691e', tema: 'floresta' },
    { nome: 'Deserto', bg: ['#ffb74d', '#ffcc80'], chao: '#d84315', tema: 'deserto' },
    { nome: 'Gelo', bg: ['#b3e5fc', '#e1f5fe'], chao: '#90caf9', tema: 'gelo' },
    { nome: 'Céu', bg: ['#81d4fa', '#e1f5fe'], chao: '#fff59d', tema: 'ceu' },
    { nome: 'Subsolo', bg: ['#3e2723', '#5d4037'], chao: '#4e342e', tema: 'subsolo' },
    { nome: 'Vulcão', bg: ['#bf360c', '#e64a19'], chao: '#3e2723', tema: 'vulcao' },
    { nome: 'Bandeira Final', bg: ['#00c853', '#69f0ae'], chao: '#1b5e20', tema: 'final' }
  ],
  quebra: [
    { nome: 'Muro 1', bg: ['#1a237e', '#0d1b2a'], cores: ['#ef5350', '#ff9800', '#ffc107', '#00e676', '#42a5f5', '#ab47bc'], tema: 'classico' },
    { nome: 'Muro Neon', bg: ['#0d0221', '#1a0533'], cores: ['#e040fb', '#00e5ff', '#76ff03', '#ffea00', '#ff1744', '#d500f9'], tema: 'neon' },
    { nome: 'Muro Praia', bg: ['#01579b', '#0277bd'], cores: ['#ffcc80', '#4fc3f7', '#81c784', '#fff176', '#f48fb1', '#80deea'], tema: 'praia' },
    { nome: 'Muro Fogo', bg: ['#3e0000', '#bf360c'], cores: ['#ff5722', '#ff9800', '#ffc107', '#f44336', '#e91e63', '#ff6e40'], tema: 'fogo' },
    { nome: 'Muro Gelo', bg: ['#0d47a1', '#1565c0'], cores: ['#e3f2fd', '#90caf9', '#4fc3f7', '#80deea', '#b3e5fc', '#81d4fa'], tema: 'gelo' },
    { nome: 'Muro Ouro', bg: ['#3e2723', '#5d4037'], cores: ['#ffc107', '#ffb300', '#ff8f00', '#ffd54f', '#ffe082', '#ffca28'], tema: 'ouro' },
    { nome: 'Muro Floresta', bg: ['#1b5e20', '#0d2818'], cores: ['#66bb6a', '#43a047', '#2e7d32', '#a5d6a7', '#81c784', '#c5e1a5'], tema: 'floresta' },
    { nome: 'Muro Sombra', bg: ['#000', '#212121'], cores: ['#616161', '#9e9e9e', '#757575', '#bdbdbd', '#424242', '#eeeeee'], tema: 'sombra' },
    { nome: 'Muro Arena', bg: ['#311b92', '#1a237e'], cores: ['#7c4dff', '#536dfe', '#448aff', '#40c4ff', '#18ffff', '#ea80fc'], tema: 'arena' },
    { nome: 'Muro Final', bg: ['#004d40', '#1b5e20'], cores: ['#00e676', '#69f0ae', '#00c853', '#b9f6ca', '#1de9b6', '#64ffda'], tema: 'final' }
  ],
  damas: [
    { nome: 'Tabuleiro Clássico', clara: '#f0d9b5', escura: '#b58863', tema: 'classico' },
    { nome: 'Tabuleiro Verde', clara: '#e8f5e9', escura: '#2e7d32', tema: 'verde' },
    { nome: 'Tabuleiro Azul', clara: '#e3f2fd', escura: '#1565c0', tema: 'azul' },
    { nome: 'Tabuleiro Roxo', clara: '#f3e5f5', escura: '#6a1b9a', tema: 'roxo' },
    { nome: 'Tabuleiro Areia', clara: '#fff8e1', escura: '#8d6e63', tema: 'areia' },
    { nome: 'Tabuleiro Neon', clara: '#1a1a2e', escura: '#0f3460', tema: 'neon' },
    { nome: 'Tabuleiro Fogo', clara: '#fff3e0', escura: '#bf360c', tema: 'fogo' },
    { nome: 'Tabuleiro Gelo', clara: '#e1f5fe', escura: '#0277bd', tema: 'gelo' },
    { nome: 'Tabuleiro Noite', clara: '#37474f', escura: '#102027', tema: 'noite' },
    { nome: 'Tabuleiro Axé', clara: '#e8f5e9', escura: '#1b5e20', tema: 'axe' }
  ],
  tamagotchi: [
    { nome: 'Terreiro ao Sol', bg: ['#0d3d1f', '#0a2a38'], tema: 'sol' },
    { nome: 'Senzala', bg: ['#3e2723', '#1b1008'], tema: 'senzala' },
    { nome: 'Praia', bg: ['#0277bd', '#004d40'], tema: 'praia' },
    { nome: 'Noite de Roda', bg: ['#1a0533', '#0d0221'], tema: 'noite' },
    { nome: 'Floresta', bg: ['#1b5e20', '#0d2818'], tema: 'floresta' },
    { nome: 'Porto', bg: ['#01579b', '#0d1b2a'], tema: 'porto' },
    { nome: 'Arena', bg: ['#4a148c', '#1a0533'], tema: 'arena' },
    { nome: 'Morro', bg: ['#33691e', '#1b2e1b'], tema: 'morro' },
    { nome: 'Templo', bg: ['#4e342e', '#3e2723'], tema: 'templo' },
    { nome: 'Final Axé', bg: ['#004d40', '#1b5e20'], tema: 'axe' }
  ]
};

/* Modos especiais a cada 2 níveis (2, 4, 6, 8, 10) — desafiam e evitam repetição */
var MODOS_ESPECIAIS_ARCADE = {
  snake: {
    2:  { id: 'portal',   nome: 'Modo Portal',   desc: 'Atravessa as bordas!', cor: '#00bcd4' },
    4:  { id: 'dupla',    nome: 'Comida Dupla',  desc: 'Duas comidas na tela', cor: '#ffc107' },
    6:  { id: 'veneno',   nome: 'Modo Veneno',   desc: 'Evite a comida roxa', cor: '#9c27b0' },
    8:  { id: 'turbo',    nome: 'Turbo Ginga',   desc: 'Velocidade alta', cor: '#ff5722' },
    10: { id: 'mestre',   nome: 'Mestre Cobra',  desc: 'Grade menor · hardcore', cor: '#00e676' }
  },
  pacman: {
    2:  { id: 'pressa',   nome: 'Fantasmas Rápidos', desc: 'Eles correm mais', cor: '#ef5350' },
    4:  { id: 'poder',    nome: 'Super Power', desc: 'Power pellet dura mais', cor: '#ffc107' },
    6:  { id: 'escuridao',nome: 'Labirinto Escuro', desc: 'Só vê perto de você', cor: '#607d8b' },
    8:  { id: 'caca',     nome: 'Caça ao Fantasma', desc: 'Power no início', cor: '#e040fb' },
    10: { id: 'mestre',   nome: 'Final Mestre', desc: 'Velocidade máxima', cor: '#00e676' }
  },
  quebra: {
    2:  { id: 'rapida',   nome: 'Bola Rápida', desc: 'Bola mais veloz', cor: '#ff5722' },
    4:  { id: 'mini',     nome: 'Raquete Mini', desc: 'Raquete menor', cor: '#ffc107' },
    6:  { id: 'dupla',    nome: 'Pontos em Dobro', desc: 'Cada bloco vale 2x', cor: '#00bcd4' },
    8:  { id: 'muro',     nome: 'Muro Grosso', desc: 'Mais fileiras', cor: '#ab47bc' },
    10: { id: 'mestre',   nome: 'Quebra-Mestre', desc: 'Tudo no limite', cor: '#00e676' }
  },
  pulo: {
    2:  { id: 'estreito', nome: 'Vãos Estreitos', desc: 'Espaço menor entre canos', cor: '#ff9800' },
    4:  { id: 'vento',    nome: 'Vento Forte', desc: 'Canos mais rápidos', cor: '#00bcd4' },
    6:  { id: 'baixo',    nome: 'Voo Baixo', desc: 'Gravidade maior', cor: '#ef5350' },
    8:  { id: 'caos',     nome: 'Canos Caóticos', desc: 'Altura imprevisível', cor: '#e040fb' },
    10: { id: 'mestre',   nome: 'Pulo Mestre', desc: 'Desafio máximo', cor: '#00e676' }
  },
  surfe: {
    2:  { id: 'onda',     nome: 'Onda Pesada', desc: 'Obstáculos densos', cor: '#0277bd' },
    4:  { id: 'maré',     nome: 'Maré Alta', desc: 'Velocidade maior', cor: '#00bcd4' },
    6:  { id: 'recife',   nome: 'Recife Afiado', desc: 'Menos margem de erro', cor: '#ff5722' },
    8:  { id: 'noite',    nome: 'Surfe Noturno', desc: 'Visão reduzida', cor: '#5c6bc0' },
    10: { id: 'mestre',   nome: 'Tsunami Final', desc: 'Modo extremo', cor: '#00e676' }
  },
  mario: {
    2:  { id: 'moedas',   nome: 'Chuva de Moedas', desc: 'Mais moedas na fase', cor: '#ffc107' },
    4:  { id: 'salto',    nome: 'Salto Pesado', desc: 'Pulo mais curto', cor: '#ff9800' },
    6:  { id: 'inimigos', nome: 'Mais Inimigos', desc: 'Inimigos extras', cor: '#ef5350' },
    8:  { id: 'gelo',     nome: 'Chão Escorregadio', desc: 'Controle escorrega', cor: '#81d4fa' },
    10: { id: 'mestre',   nome: 'Castelo Final', desc: 'Desafio máximo', cor: '#00e676' }
  },
  corrida: {
    2:  { id: 'trafego',  nome: 'Tráfego Pesado', desc: 'Mais carros na pista', cor: '#ff5722' },
    4:  { id: 'noite',    nome: 'Neblina', desc: 'Visão reduzida', cor: '#90a4ae' },
    6:  { id: 'turbo',    nome: 'Pista Turbo', desc: 'Velocidade alta', cor: '#ffc107' },
    8:  { id: 'contramao',nome: 'Contramao', desc: 'Obstáculos invertidos', cor: '#e040fb' },
    10: { id: 'mestre',   nome: 'Grande Prêmio', desc: 'Final épico', cor: '#00e676' }
  },
  damas: {
    2:  { id: 'rapida',   nome: 'IA Ágil', desc: 'IA pensa mais rápido', cor: '#ff9800' },
    4:  { id: 'agressiva',nome: 'IA Agressiva', desc: 'Prioriza capturas', cor: '#ef5350' },
    6:  { id: 'tempo',    nome: 'Contra o Tempo', desc: 'Jogue com foco', cor: '#00bcd4' },
    8:  { id: 'mestre-ia',nome: 'IA Mestre', desc: 'IA bem forte', cor: '#ab47bc' },
    10: { id: 'lenda',    nome: 'Duelo de Lenda', desc: 'Nível máximo', cor: '#00e676' }
  },
  tamagotchi: {
    2:  { id: 'fome',     nome: 'Dia de Fome', desc: 'Fome sobe mais rápido', cor: '#ff9800' },
    4:  { id: 'treino',   nome: 'Semana de Treino', desc: 'XP em dobro no treino', cor: '#00bcd4' },
    6:  { id: 'festa',    nome: 'Festa na Roda', desc: 'Humor rende mais', cor: '#e040fb' },
    8:  { id: 'desafio',  nome: 'Desafio Fitness', desc: 'Meta de forma alta', cor: '#ff5722' },
    10: { id: 'mestre',   nome: 'Mascote Mestre', desc: 'Cuidado lendário', cor: '#00e676' }
  }
};

function cenarioArcade(tipo, nivel) {
  var lista = CENARIOS_ARCADE[tipo] || [];
  var idx = Math.max(0, Math.min(lista.length - 1, (Number(nivel) || 1) - 1));
  return lista[idx] || { nome: 'Nível ' + (nivel || 1) };
}

function obterModoEspecial(tipo, nivel) {
  nivel = Math.max(1, Math.min(10, Number(nivel) || 1));
  if (nivel % 2 !== 0) return null;
  var mapa = MODOS_ESPECIAIS_ARCADE[tipo];
  if (!mapa) return null;
  return mapa[nivel] || null;
}

function aplicarModoNoArcade(tipo, nivel) {
  var modo = obterModoEspecial(tipo, nivel);
  var cen = cenarioArcade(tipo, nivel);
  arcade._cenario = cen;
  arcade._modoEspecial = modo;
  return { cenario: cen, modo: modo };
}

function pintarFundoCenario(ctx, w, h, cen) {
  if (!cen) {
    ctx.fillStyle = '#03080c';
    ctx.fillRect(0, 0, w, h);
    return;
  }
  var bg = cen.bg || cen.ceu;
  if (bg && bg.length >= 2) {
    var g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, bg[0]);
    g.addColorStop(1, bg[1]);
    ctx.fillStyle = g;
  } else if (typeof bg === 'string') {
    ctx.fillStyle = bg;
  } else {
    ctx.fillStyle = '#03080c';
  }
  ctx.fillRect(0, 0, w, h);
}

function desenharBannerModo(ctx, w, modo, cen) {
  if (!modo && !cen) return;
  var y = 28;
  ctx.save();
  ctx.textAlign = 'center';
  if (cen && cen.nome) {
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(w / 2 - 90, y - 11, 180, 16);
    ctx.fillStyle = '#90a4ae';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText(cen.nome, w / 2, y);
    y += 16;
  }
  if (modo) {
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(w / 2 - 100, y - 11, 200, 28);
    ctx.fillStyle = modo.cor || '#ffc107';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('⚡ ' + modo.nome, w / 2, y);
    ctx.fillStyle = '#e0f2f1';
    ctx.font = '8px sans-serif';
    ctx.fillText(modo.desc || '', w / 2, y + 12);
  }
  ctx.restore();
}

function curvaDificuldade(nivel) {
  /* 0 no nível 1, sobe devagar nos níveis do meio, dispara nos últimos (8, 9, 10) */
  var n = Math.max(1, Math.min(10, Number(nivel) || 1));
  return Math.pow((n - 1) / 9, 1.7);
}

function enriquecerConfigNivel(tipo, nivel, cfg) {
  cfg = cfg || {};
  cfg.cenario = cenarioArcade(tipo, nivel);
  cfg.modo = obterModoEspecial(tipo, nivel);
  if (cfg.modo) {
    cfg.label = (cfg.label || '') + ' · ⚡ ' + cfg.modo.nome;
  } else if (cfg.cenario && cfg.cenario.nome) {
    cfg.label = (cfg.label || '') + ' · ' + cfg.cenario.nome;
  }
  return cfg;
}

function configNivelArcade(tipo, nivel) {
  nivel = Math.max(1, Math.min(10, Number(nivel) || 1));
  var curva = curvaDificuldade(nivel);
  var _cfg = _configNivelArcadeCore(tipo, nivel, curva);
  return enriquecerConfigNivel(tipo, nivel, _cfg);
}

function _configNivelArcadeCore(tipo, nivel, curva) {
  /* scoreParaDesbloquear: pontos na partida para liberar o PRÓXIMO nível (alternativa ao objetivo) */
  if (tipo === 'snake') {
    var objS = Math.round(6 + 64 * curva);
    return {
      nivel: nivel,
      objetivo: objS,
      velocidadeMs: Math.max(65, Math.round(195 - 130 * curva)),
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
      velocidadeMs: 16,
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
      velocidadeMs: Math.max(15, Math.round(31 - 16 * curva)),
      scoreParaDesbloquear: objP * 8 + nivel * 25,
      label: 'Passe ' + objP + ' obstáculos · ou ' + (objP * 8 + nivel * 25) + ' pts'
    };
  }
  if (tipo === 'surfe') {
    var objSu = Math.round(25 + 195 * curva);
    return {
      nivel: nivel,
      objetivo: objSu,
      velocidadeMs: 20,
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
      velocidadeMs: 20,
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
      velocidadeMs: Math.max(26, Math.round(62 - 36 * curva)),
      scoreParaDesbloquear: 800 + nivel * 200,
      label: 'Coma todas as pastilhas (~' + dotsEst + ') · ou ' + (800 + nivel * 200) + ' pts'
    };
  }
  if (tipo === 'tamagotchi') {
    return {
      nivel: nivel,
      objetivo: 5 + nivel * 2,
      velocidadeMs: 500,
      scoreParaDesbloquear: 20 + nivel * 10,
      label: 'Cuide do mascote · energia e axé'
    };
  }
  if (tipo === 'damas') {
    return {
      nivel: nivel,
      objetivo: 1,
      velocidadeMs: 200,
      scoreParaDesbloquear: 50 + nivel * 20,
      label: 'Vença a partida · dama + capturas'
    };
  }
  /* corrida — velocidade real desde o nv.1; cenários por nível */
  var objC = Math.round(40 + 200 * curva);
  var cenario = cenarioArcade('corrida', nivel);
  return {
    nivel: nivel,
    objetivo: objC,
    velocidadeMs: 33,
    speedBase: +(3.2 + 4.5 * curva).toFixed(2),
    spawnEvery: Math.max(12, Math.round(28 - 14 * curva)),
    scoreParaDesbloquear: objC,
    cenario: cenario,
    label: (cenario.nome || 'Pista') + ' · ' + objC + ' pts sem bater'
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
  aplicarModoNoArcade(arcade.tipo, novo);
  if (arcade.timer) clearInterval(arcade.timer);
  var gamesComRampa2 = ['snake', 'tetris', 'pulo', 'quebra', 'mario', 'corrida', 'surfe', 'pacman'];
  arcade.rampaAtiva = gamesComRampa2.indexOf(arcade.tipo) >= 0;
  arcade.velAlvo = cfg.velocidadeMs;
  arcade.velAtual = cfg.velocidadeMs; /* velocidade real no nível */
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
    try { arcade._keepScoreOnLevel = true; initCorridaArcade(); } catch (e) {}
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

