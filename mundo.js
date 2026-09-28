/* ================================================================
   MUNDO.JS — Simulador / Mascote (versão enxuta)
   ================================================================ */
(function (global) {
  'use strict';

  var Simulador = {
    personagens: {
      rootsGinga: {
        nome: 'Roots Ginga',
        atributos: { forca: 85, velocidade: 60, agilidade: 75 },
        movimentos: ['Ginga Tradicional', 'Rasteira', 'Meia-Lua'],
        especial: 'Chamada de Angola'
      },
      urbanSkater: {
        nome: 'Urban Skater',
        atributos: { forca: 70, velocidade: 90, agilidade: 80 },
        movimentos: ['Ginga Urbana', 'Armada', 'Queixada'],
        especial: 'Parafuso'
      },
      neonStriker: {
        nome: 'Neon Striker',
        atributos: { forca: 95, velocidade: 70, agilidade: 65 },
        movimentos: ['Martelo', 'Meia-Lua de Compasso', 'Bênção'],
        especial: 'Armada Pulada'
      }
    },
    entrarMundoAberto: function () {
      if (typeof abrirAba === 'function') abrirAba('tabSimulador');
      else if (typeof mostrarToast === 'function') mostrarToast('Abra a aba Mundo / Aluno logado.');
    },
    render: function () {
      var areaLogin = document.getElementById('simAreaLogin');
      var areaJogo = document.getElementById('simAreaJogo');
      if (!areaLogin && !areaJogo) return;
      var aluno = typeof alunoLogado === 'function' ? alunoLogado() : null;
      if (!areaLogin) return;
      if (!aluno) {
        if (areaJogo) areaJogo.style.display = 'none';
        areaLogin.style.display = 'block';
        areaLogin.innerHTML =
          '<div class="card card-destaque brilho-verde" style="border:1px solid var(--primary-green);">' +
          '<h3><i class="fas fa-globe"></i> Mundo Aberto</h3>' +
          '<p class="mini">Faça login na aba Aluno para acessar avatar, terreiro e combate.</p>' +
          '<button class="btn" onclick="abrirAba(\'tab3\')"><i class="fas fa-sign-in-alt"></i> Ir para login</button></div>';
        return;
      }
      if (!aluno.avatarSimulador) {
        if (areaJogo) areaJogo.style.display = 'none';
        areaLogin.style.display = 'block';
        var cards = Object.keys(Simulador.personagens).map(function (k) {
          return '<div style="border:1px solid var(--card-border);border-radius:10px;padding:8px;text-align:center;cursor:pointer;" ' +
            'onclick="Simulador.confirmarAvatar(\'' + k + '\')"><div style="font-size:1.6rem;">🥋</div>' +
            '<div class="mini">' + (Simulador.personagens[k].nome) + '</div></div>';
        }).join('');
        areaLogin.innerHTML =
          '<div class="card"><h3><i class="fas fa-user-astronaut"></i> Escolha seu avatar</h3>' +
          '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">' + cards + '</div></div>';
        return;
      }
      areaLogin.style.display = 'none';
      if (areaJogo) {
        areaJogo.style.display = 'block';
        Simulador.iniciarJogo(aluno);
      }
    },
    confirmarAvatar: function (k) {
      var aluno = alunoLogado(); if (!aluno || !DB) return;
      DB.atualizar('alunos', aluno.id, {
        avatarSimulador: k,
        apelidoAvatarSimulador: aluno.apelido || aluno.nome
      });
      if (typeof mostrarToast === 'function') mostrarToast('Avatar escolhido!');
      Simulador.render();
    },
    trocarAvatar: function () {
      var aluno = alunoLogado();
      if (aluno && DB) DB.atualizar('alunos', aluno.id, { avatarSimulador: '' });
      Simulador.render();
    },
    iniciarJogo: function (aluno) {
      var p = Simulador.personagens[aluno.avatarSimulador] || Simulador.personagens.rootsGinga;
      var tj = document.getElementById('simTxtJogador');
      var tg = document.getElementById('simTxtGraduacao');
      if (tj) tj.textContent = aluno.apelidoAvatarSimulador || aluno.apelido || aluno.nome;
      if (tg) tg.textContent = 'Corda: ' + (aluno.graduacao || 'Crua') + ' · ' + p.nome;
      var box = document.getElementById('simBoxCombate');
      if (box) {
        box.innerHTML = p.movimentos.map(function (m, i) {
          return '<button class="btn" style="background:linear-gradient(135deg,#d35400,#9b59b6);" ' +
            'onclick="Simulador.jogarTurno(\'' + aluno.avatarSimulador + '\',' + i + ')">' + m + '</button>';
        }).join('');
      }
      var cons = document.getElementById('simConsole');
      if (cons) cons.textContent = 'Pronto para treinar!';
    },
    jogarTurno: function (k, i) {
      var p = Simulador.personagens[k] || Simulador.personagens.rootsGinga;
      var g = p.movimentos[i] || p.especial;
      var imp = Math.floor((p.atributos.forca * p.atributos.velocidade) / 100);
      var prec = Math.floor(Math.random() * p.atributos.agilidade);
      var c = document.getElementById('simConsole');
      if (c) c.innerHTML = p.nome + ' aplicou <b>' + g + '</b>! Impacto: ' + imp + ' | Precisão: ' + prec;
    },
    alimentar: function () { if (typeof mostrarToast === 'function') mostrarToast('Avatar alimentado!'); },
    alongar: function () { if (typeof mostrarToast === 'function') mostrarToast('Avatar alongou!'); },
    treinar: function () { if (typeof mostrarToast === 'function') mostrarToast('Treino registrado!'); }
  };

  global.Simulador = Simulador;
  global.Tama = {
    render: function () {
      var r = document.getElementById('tamaRoot');
      if (r) r.innerHTML = '<p class="mini">Mascote: use Arcade → Mascote Virtual.</p>';
    },
    refresh: function () {}
  };

})(typeof window !== 'undefined' ? window : this);
