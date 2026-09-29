/* ================================================================
   ABAS-RETRATEIS.JS — Universo Capoeira (v87) · barra de abas retrátil
   Toque na faixa "aba atual ▲" para recolher/mostrar as abas e ganhar espaço.
   O estado fica salvo no aparelho (chave estável v87). Não altera nenhuma aba.
   ================================================================ */
(function (global) {
  'use strict';
  var CHAVE = 'uc_abas_recolhidas_v87';
  function $(id) { return document.getElementById(id); }
  function cont() { return document.querySelector('.tabs-container'); }

  function lerEstado() { try { return localStorage.getItem(CHAVE) === '1'; } catch (e) { return false; } }
  function gravarEstado(v) { try { localStorage.setItem(CHAVE, v ? '1' : '0'); } catch (e) {} }

  function rotuloAtual() {
    var ativo = document.querySelector('.tabs button.active') || document.querySelector('#protectedSystemTabs button');
    var alvo = $('rotuloAbaAtual'); if (!alvo || !ativo) return;
    alvo.innerHTML = ativo.innerHTML;
  }

  function aplicar(recolhida, salvar) {
    var c = cont(); if (!c) return;
    c.classList.toggle('recolhida', !!recolhida);
    var b = $('btnRecolherAbas'); if (b) b.setAttribute('aria-expanded', recolhida ? 'false' : 'true');
    var d = $('dicaAcessoEquipe'); if (d) d.style.display = recolhida ? 'none' : '';
    rotuloAtual();
    if (salvar) gravarEstado(!!recolhida);
  }

  global.toggleAbasRetrateis = function () {
    var c = cont(); aplicar(!(c && c.classList.contains('recolhida')), true);
  };
  global.abasRecolhidas = function () { var c = cont(); return !!(c && c.classList.contains('recolhida')); };

  function iniciar() {
    if (!cont()) return;
    /* mantém o rótulo em dia quando o app troca de aba */
    if (typeof global.abrirAba === 'function' && !global.abrirAba.__uc) {
      var orig = global.abrirAba;
      global.abrirAba = function () { var r = orig.apply(this, arguments); rotuloAtual(); return r; };
      global.abrirAba.__uc = true;
    }
    /* se a equipe revelar o botão "Equipe" com as abas recolhidas, abre a barra */
    var eq = $('btnToggleEquipe');
    if (eq && typeof MutationObserver !== 'undefined') {
      new MutationObserver(function () {
        if (eq.style.display !== 'none' && global.abasRecolhidas()) aplicar(false, false);
      }).observe(eq, { attributes: true, attributeFilter: ['style'] });
    }
    aplicar(lerEstado(), false);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})(typeof window !== 'undefined' ? window : this);
