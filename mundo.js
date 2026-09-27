/* ============================================================
   MODO TESTE — gerenciar o Mundo sem login, sem salvar nada.
   Ative pelo botão "🧪 Modo Teste" na tela de entrada.
   ============================================================ */
Simulador.modoTeste = false;

/* ------------------------------------------------------------
   Aluno fake — vive só na memória
   ------------------------------------------------------------ */
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

/* ------------------------------------------------------------
   Interceptar as funções que o app já usa
   ------------------------------------------------------------ */
(function instalarModoTeste() {
  /* salva originais */
  var _alunoLogadoOriginal  = window.alunoLogado;
  var _DBAtualizarOriginal  = (window.DB && DB.atualizar) ? DB.atualizar.bind(DB) : null;

  /* ✅ alunoLogado devolve o fake quando o modo teste está ligado */
  window.alunoLogado = function () {
    if (Simulador.modoTeste) return Simulador._alunoTeste;
    return _alunoLogadoOriginal ? _alunoLogadoOriginal() : null;
  };

  /* ✅ DB.atualizar não persiste no Firebase em modo teste */
  if (window.DB && typeof DB.atualizar === 'function') {
    DB.atualizar = function (colecao, id, payload) {
      if (Simulador.modoTeste && colecao === 'alunos' && id === 'TESTE_DEV') {
        /* aplica no objeto em memória */
        Object.keys(payload || {}).forEach(function (k) {
          Simulador._alunoTeste[k] = payload[k];
        });
        /* atualiza UI sem tocar no banco */
        try {
          if (typeof renderAluno === 'function') renderAluno();
          if (Simulador._canvas) { /* nada — loop cuida */ }
        } catch (e) {}
        return Promise.resolve();
      }
      return _DBAtualizarOriginal
        ? _DBAtualizarOriginal(colecao, id, payload)
        : Promise.resolve();
    };
  }

  /* ✅ sessaoAlunoId aponta pro fake */
  try {
    Object.defineProperty(window, 'sessaoAlunoId', {
      configurable: true,
      get: function () {
        return Simulador.modoTeste ? 'TESTE_DEV' : (window._sessaoAlunoIdReal || null);
      },
      set: function (v) {
        window._sessaoAlunoIdReal = v;
      }
    });
  } catch (e) { /* fallback silencioso */ }
})();

/* ------------------------------------------------------------
   Ligar / desligar
   ------------------------------------------------------------ */
Simulador.ativarModoTeste = function () {
  Simulador.modoTeste = true;

  /* aplica um avatar padrão se ainda não escolheu */
  if (!Simulador._alunoTeste.avatarSimulador) {
    Simulador._alunoTeste.avatarSimulador = 'rootsGinga';
    Simulador._alunoTeste.apelidoAvatarSimulador = 'Teste';
    Simulador.avatarSelecionadoTemp = 'rootsGinga';
  }

  /* reseta estados de batalha e cache */
  Simulador.resetarEstadoBatalha();
  Simulador._imgObjCache = {};

  /* injeta o painel de teste */
  Simulador._injetarPainelTeste();

  /* render direto no jogo */
  Simulador.render();

  /* atualiza a barra de status do app */
  try { atualizarStatusFirebase(); } catch (e) {}
  try { mostrarToast('🧪 Modo Teste ativado — nada será salvo.'); } catch (e) {}
};

Simulador.desativarModoTeste = function () {
  Simulador.modoTeste = false;
  Simulador._removerPainelTeste();

  /* limpa o cache pra recarregar do Firebase */
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

/* ------------------------------------------------------------
   Painel flutuante
   ------------------------------------------------------------ */
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

  /* estilo dos botões (injeta uma vez) */
  if (!$('stylePainelTeste')) {
    var st = document.createElement('style');
    st.id = 'stylePainelTeste';
    st.textContent =
      '.btn-teste{background:#0f3d24;border:1px solid #00e676;color:#c8ffe0;' +
      'padding:5px 6px;border-radius:6px;font-size:11px;cursor:pointer;transition:background .15s;}' +
      '.btn-teste:hover{background:#00e676;color:#052e1a;}';
    document.head.appendChild(st);
  }

  /* popula o <select> com os personagens disponíveis */
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

/* ------------------------------------------------------------
   Botão "Modo Teste" na tela de entrada (sem login)
   ------------------------------------------------------------ */
Simulador.botaoModoTesteHTML = function () {
  return '<button class="btn btn-secondary" style="margin-top:6px;background:#212121;border:1px dashed #00e676;" ' +
    'onclick="Simulador.ativarModoTeste()"><i class="fas fa-flask"></i> 🧪 Modo Teste (dev)</button>';
};
