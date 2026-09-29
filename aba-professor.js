/* ABA-PROFESSOR.JS — Universo Capoeira (v87) · trecho do app dividido sem alterar o código (linhas 6672–7879 do index.html original) */
/* ---------------------------------------------------------------
   12. ABA PROFESSOR
   --------------------------------------------------------------- */
function renderAbaProfessor() {
  var box = $('conteudoProfessor');
  if (!exigirEquipe(['professor', 'adm', 'dev'], box, 'professor')) return;   /* v87: cada aba usa ids próprios no login (antes repetia os da aba Dev) */

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
