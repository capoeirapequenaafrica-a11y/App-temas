/* ================================================================
   PROTECAO.JS — Universo Capoeira · GUARDIÃO DAS ABAS (carrega por último)
   Vigia as abas de abas-protegidas.js. Se algo estrutural sumir do HTML
   (botão da aba, área da aba, caixa de conteúdo, acesso da equipe), RECRIA na hora.
   Funções ou campos internos que faltarem: aviso no console e no cartão
   "Integridade das abas" da aba Dev.
   ================================================================ */
(function (global) {
  'use strict';
  var P = global.UC_PROTEGIDAS;
  if (!P) { console.error('[Protecao] abas-protegidas.js não carregou!'); return; }
  function $(id) { return document.getElementById(id); }

  function botaoDaAba(id) {
    var bs = document.querySelectorAll('.tabs button');
    for (var i = 0; i < bs.length; i++) if ((bs[i].getAttribute('onclick') || '').indexOf("'" + id + "'") >= 0) return bs[i];
    return null;
  }

  function restaurar() {
    var feitos = [], ac = P.ACESSO_EQUIPE, host = document.querySelector('.tabs-container');
    if (!$('protectedSystemTabs') && host) {
      var t = document.createElement('div'); t.className = 'tabs'; t.id = 'protectedSystemTabs'; host.insertBefore(t, host.firstChild); feitos.push('grupo principal');
    }
    if (!$(ac.menu) && host) {
      var m = document.createElement('div'); m.className = 'tabs tabs-equipe'; m.id = ac.menu; m.style.display = 'none'; host.appendChild(m); feitos.push('menu da equipe');
    }
    if (!$(ac.botao) && $('protectedSystemTabs')) {
      var b = document.createElement('button'); b.id = ac.botao; b.style.display = 'none';
      b.setAttribute('onclick', 'toggleMenuEquipe()'); b.innerHTML = '<i class="fas fa-users-cog"></i>Equipe';
      $('protectedSystemTabs').appendChild(b); feitos.push('botão Equipe');
    }
    P.ABAS.forEach(function (a) {
      var grupo = $(a.grupo);
      if (grupo && !botaoDaAba(a.id)) {
        var bt = document.createElement('button'); bt.setAttribute('onclick', "abrirAba('" + a.id + "', this)");
        bt.innerHTML = '<i class="fas ' + a.icone + '"></i>' + a.nome;
        var eq = $(ac.botao);
        if (a.grupo === 'protectedSystemTabs' && eq) grupo.insertBefore(bt, eq); else grupo.appendChild(bt);
        feitos.push('botão ' + a.nome);
      }
      var area = $(a.id);
      if (!area) {
        var pai = document.querySelector('.app-frame') || document.body, foot = pai.querySelector('footer');
        area = document.createElement('div'); area.id = a.id; area.className = 'tab-content';
        if (foot) pai.insertBefore(area, foot); else pai.appendChild(area);
        feitos.push('área ' + a.nome);
      }
      if (a.conteudo && !$(a.conteudo)) {
        var cx = document.createElement('div'); cx.id = a.conteudo; area.appendChild(cx); feitos.push('conteúdo ' + a.nome);
      }
    });
    return feitos;
  }

  function diagnostico() {
    var foto = global.UC_ESTRUTURA_INICIAL || {};
    var d = P.ABAS.map(function (a) {
      var f = [];
      if (!botaoDaAba(a.id)) f.push('botão da aba');
      if (!$(a.id)) f.push('área da aba');
      if (a.conteudo && !$(a.conteudo)) f.push('#' + a.conteudo);
      (foto[a.id] || []).forEach(function (e) { f.push('#' + e + ' (sumiu do HTML)'); });
      a.funcoes.forEach(function (fn) { if (typeof global[fn] !== 'function') f.push(fn + '()'); });
      return { id: a.id, nome: a.nome, ok: f.length === 0, faltas: f };
    });
    var nf = P.NUCLEO.funcoes.filter(function (fn) { return typeof global[fn] !== 'function'; }).map(function (x) { return x + '()'; });
    if (typeof global.VERSAO_APP !== 'undefined' && global.VERSAO_APP !== P.VERSAO) nf.push('versão do app ' + global.VERSAO_APP + ' (deveria ser ' + P.VERSAO + ')');
    d.push({ id: 'nucleo', nome: 'Núcleo do app · ' + P.VERSAO, ok: nf.length === 0, faltas: nf });
    return d;
  }

  var ult = '';
  function checar(motivo) {
    var feitos = restaurar(), d = diagnostico(), ruins = d.filter(function (x) { return !x.ok; });
    var chave = feitos.join('|') + '#' + ruins.map(function (x) { return x.id + x.faltas.join(','); }).join('|');
    if ((feitos.length || ruins.length) && chave !== ult) {
      ult = chave;
      if (feitos.length) console.warn('[Protecao] restaurado (' + motivo + '):', feitos.join(', '));
      ruins.forEach(function (x) { console.error('[Protecao] "' + x.nome + '" incompleto:', x.faltas.join(', ')); });
    }
    return d;
  }

  var agenda = 0, ocupado = false;
  function iniciarVigia() {
    if (typeof MutationObserver === 'undefined') return;
    new MutationObserver(function () {
      if (ocupado || agenda) return;
      agenda = setTimeout(function () { agenda = 0; ocupado = true; try { checar('remoção detectada'); } finally { ocupado = false; } }, 80);
    }).observe(document.body, { childList: true, subtree: true });
  }

  function htmlIntegridade(d) {
    var h = '<h3><i class="fas fa-shield-alt"></i> Integridade das abas</h3><p class="mini">Abas protegidas: nunca podem ser removidas.</p>';
    d.forEach(function (x) {
      h += '<div class="lista-item"><div class="linha"><b>' + x.nome + '</b><span class="badge-count">' + (x.ok ? '✅ ok' : '⚠️ ' + x.faltas.length) + '</span></div>' +
           (x.ok ? '' : '<p class="mini">Falta: ' + x.faltas.slice(0, 12).join(', ') + (x.faltas.length > 12 ? '…' : '') + '</p>') + '</div>';
    });
    return h;
  }
  function pintarIntegridade() {
    var box = $('conteudoDev'); if (!box) return;
    var logado = (typeof sessaoEquipe !== 'undefined') && sessaoEquipe;   // só mostra para a equipe já logada
    var antigo = $('cardIntegridadeAbas'); if (antigo) antigo.remove();
    if (!logado || !box.children.length) return;
    box.insertAdjacentHTML('beforeend', '<div class="card" id="cardIntegridadeAbas">' + htmlIntegridade(checar('painel dev')) + '</div>');
  }

  /* acrescenta o cartão de integridade ao final da aba Dev sem mexer no código dela */
  function envolverDev() {
    if (typeof global.renderAbaDev !== 'function' || global.renderAbaDev.__uc) return;
    var orig = global.renderAbaDev;
    var novo = function () { var r = orig.apply(this, arguments); try { pintarIntegridade(); } catch (e) { console.warn('[Protecao]', e); } return r; };
    novo.__uc = true; global.renderAbaDev = novo;
  }

  global.UCProtecao = { restaurar: restaurar, diagnostico: diagnostico, checar: checar, pintarIntegridade: pintarIntegridade };

  envolverDev();
  function boot() { setTimeout(function () { checar('início'); iniciarVigia(); }, 500); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})(typeof window !== 'undefined' ? window : this);
