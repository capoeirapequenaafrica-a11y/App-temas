/* ================================================================
   MUNDO.JS — Simulador / Mascote (versão completa + teste)
   ================================================================ */
(function (global) {
  'use strict';

  /* ---------- Estado simples do mascote (localStorage) ---------- */
  var TAMA_KEY = 'uc_mascote_v1';
  function loadTama() {
    try {
      var d = JSON.parse(localStorage.getItem(TAMA_KEY) || '{}');
      return {
        fome: typeof d.fome === 'number' ? d.fome : 70,
        felicidade: typeof d.felicidade === 'number' ? d.felicidade : 70,
        energia: typeof d.energia === 'number' ? d.energia : 80,
        nome: d.nome || 'Ginga',
        ultimo: d.ultimo || Date.now()
      };
    } catch (e) {
      return { fome: 70, felicidade: 70, energia: 80, nome: 'Ginga', ultimo: Date.now() };
    }
  }
  function saveTama(t) {
    try { localStorage.setItem(TAMA_KEY, JSON.stringify(t)); } catch (e) {}
  }
  function decayTama(t) {
    var agora = Date.now();
    var horas = Math.min(12, (agora - (t.ultimo || agora)) / 3600000);
    if (horas > 0.15) {
      t.fome = Math.max(0, t.fome - horas * 4);
      t.felicidade = Math.max(0, t.felicidade - horas * 3);
      t.energia = Math.max(0, t.energia - horas * 2);
      t.ultimo = agora;
      saveTama(t);
    }
    return t;
  }

  /* ---------- Overlay do Mascote (funciona sem login) ---------- */
  function garantirOverlayMascote() {
    if (document.getElementById('mascoteOverlay')) return;
    var div = document.createElement('div');
    div.id = 'mascoteOverlay';
    div.style.cssText = 'display:none;position:fixed;inset:0;z-index:12000;background:rgba(0,0,0,.82);backdrop-filter:blur(8px);align-items:center;justify-content:center;padding:16px;';
    div.innerHTML =
      '<div style="background:linear-gradient(160deg,#16232b,#0f1a20);border:1px solid rgba(0,230,118,.35);border-radius:20px;max-width:360px;width:100%;padding:20px;box-shadow:0 20px 60px rgba(0,0,0,.6);position:relative;">' +
        '<button type="button" onclick="Tama.fechar()" style="position:absolute;top:12px;right:12px;background:rgba(239,83,80,.2);border:1px solid #ef5350;color:#ef5350;width:36px;height:36px;border-radius:50%;font-size:1.1rem;cursor:pointer;">×</button>' +
        '<div style="text-align:center;margin-bottom:14px;">' +
          '<div id="mascoteEmoji" style="font-size:4.2rem;line-height:1;margin:8px 0;">🐉</div>' +
          '<h3 id="mascoteNome" style="color:var(--gold,#ffc107);margin:0 0 4px;">Ginga</h3>' +
          '<p id="mascoteStatus" class="mini" style="color:#90a4ae;margin:0;">Seu mascote virtual</p>' +
        '</div>' +
        '<div style="display:grid;gap:10px;margin:16px 0;">' +
          '<div><div style="display:flex;justify-content:space-between;font-size:.75rem;margin-bottom:3px;"><span>Fome</span><span id="tamaFomeVal">70%</span></div><div style="height:10px;background:#1a2a32;border-radius:6px;overflow:hidden;"><div id="tamaFomeBar" style="height:100%;width:70%;background:linear-gradient(90deg,#ff9800,#ffc107);transition:width .3s;"></div></div></div>' +
          '<div><div style="display:flex;justify-content:space-between;font-size:.75rem;margin-bottom:3px;"><span>Felicidade</span><span id="tamaFelizVal">70%</span></div><div style="height:10px;background:#1a2a32;border-radius:6px;overflow:hidden;"><div id="tamaFelizBar" style="height:100%;width:70%;background:linear-gradient(90deg,#e91e63,#ff4081);transition:width .3s;"></div></div></div>' +
          '<div><div style="display:flex;justify-content:space-between;font-size:.75rem;margin-bottom:3px;"><span>Energia</span><span id="tamaEnergiaVal">80%</span></div><div style="height:10px;background:#1a2a32;border-radius:6px;overflow:hidden;"><div id="tamaEnergiaBar" style="height:100%;width:80%;background:linear-gradient(90deg,#00bcd4,#00e676);transition:width .3s;"></div></div></div>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px;">' +
          '<button type="button" class="btn" style="background:linear-gradient(135deg,#ff9800,#f57c00);" onclick="Tama.acao(\'alimentar\')"><i class="fas fa-utensils"></i> Alimentar</button>' +
          '<button type="button" class="btn" style="background:linear-gradient(135deg,#e91e63,#c2185b);" onclick="Tama.acao(\'brincar\')"><i class="fas fa-gamepad"></i> Brincar</button>' +
          '<button type="button" class="btn" style="background:linear-gradient(135deg,#00bcd4,#0097a7);" onclick="Tama.acao(\'descansar\')"><i class="fas fa-bed"></i> Descansar</button>' +
          '<button type="button" class="btn" style="background:linear-gradient(135deg,#7b1fa2,#9c27b0);" onclick="Tama.acao(\'treinar\')"><i class="fas fa-fist-raised"></i> Treinar</button>' +
        '</div>' +
        '<p class="mini" style="text-align:center;margin-top:14px;color:#90a4ae;">Modo teste liberado · dados salvos no aparelho</p>' +
      '</div>';
    document.body.appendChild(div);
  }

  var Tama = {
    abrir: function () {
      garantirOverlayMascote();
      var ov = document.getElementById('mascoteOverlay');
      if (ov) {
        ov.style.display = 'flex';
        Tama.atualizarUI();
      }
    },
    fechar: function () {
      var ov = document.getElementById('mascoteOverlay');
      if (ov) ov.style.display = 'none';
    },
    atualizarUI: function () {
      var t = decayTama(loadTama());
      var emoji = document.getElementById('mascoteEmoji');
      var nome = document.getElementById('mascoteNome');
      var status = document.getElementById('mascoteStatus');
      if (nome) nome.textContent = t.nome;
      if (emoji) {
        if (t.fome < 25 || t.felicidade < 25 || t.energia < 25) emoji.textContent = '😵';
        else if (t.fome < 45 || t.felicidade < 45) emoji.textContent = '😔';
        else if (t.energia < 40) emoji.textContent = '😴';
        else emoji.textContent = '🐉';
      }
      if (status) {
        if (t.fome < 30) status.textContent = 'Está com fome!';
        else if (t.felicidade < 30) status.textContent = 'Quer brincar!';
        else if (t.energia < 30) status.textContent = 'Precisa descansar...';
        else status.textContent = 'Animado e pronto pro treino!';
      }
      var setBar = function (idBar, idVal, v, cor) {
        var b = document.getElementById(idBar);
        var l = document.getElementById(idVal);
        if (b) b.style.width = Math.round(v) + '%';
        if (l) l.textContent = Math.round(v) + '%';
      };
      setBar('tamaFomeBar', 'tamaFomeVal', t.fome);
      setBar('tamaFelizBar', 'tamaFelizVal', t.felicidade);
      setBar('tamaEnergiaBar', 'tamaEnergiaVal', t.energia);
    },
    acao: function (tipo) {
      var t = decayTama(loadTama());
      if (tipo === 'alimentar') {
        t.fome = Math.min(100, t.fome + 28);
        t.felicidade = Math.min(100, t.felicidade + 6);
        if (typeof mostrarToast === 'function') mostrarToast('Comeu bem! 🍖');
      } else if (tipo === 'brincar') {
        t.felicidade = Math.min(100, t.felicidade + 25);
        t.energia = Math.max(0, t.energia - 12);
        t.fome = Math.max(0, t.fome - 8);
        if (typeof mostrarToast === 'function') mostrarToast('Brincou bastante! 🎮');
      } else if (tipo === 'descansar') {
        t.energia = Math.min(100, t.energia + 30);
        if (typeof mostrarToast === 'function') mostrarToast('Descansou... 😴');
      } else if (tipo === 'treinar') {
        t.energia = Math.max(0, t.energia - 15);
        t.fome = Math.max(0, t.fome - 10);
        t.felicidade = Math.min(100, t.felicidade + 12);
        if (typeof mostrarToast === 'function') mostrarToast('Treino de capoeira feito! 🥋');
      }
      t.ultimo = Date.now();
      saveTama(t);
      Tama.atualizarUI();
    },
    render: function () {
      var r = document.getElementById('tamaRoot');
      if (r) r.innerHTML = '<p class="mini">Mascote: use Arcade → Abrir Mascote Virtual.</p>';
    },
    refresh: function () { Tama.atualizarUI(); }
  };

  /* ---------- Simulador (avatar / combate) — mantido ---------- */
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
      // Agora abre o mascote de teste (funciona sempre)
      Tama.abrir();
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
          '<button class="btn" onclick="abrirAba(\'tab3\')"><i class="fas fa-sign-in-alt"></i> Ir para login</button>' +
          '<button class="btn btn-gold" style="margin-top:8px;" onclick="Tama.abrir()"><i class="fas fa-dragon"></i> Testar Mascote</button></div>';
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
    alimentar: function () { Tama.acao('alimentar'); },
    alongar: function () { if (typeof mostrarToast === 'function') mostrarToast('Avatar alongou!'); },
    treinar: function () { Tama.acao('treinar'); }
  };

  global.Simulador = Simulador;
  global.Tama = Tama;

})(typeof window !== 'undefined' ? window : this);
