#!/usr/bin/env node
/* ================================================================
   GERAR-MANIFESTO.JS — (re)gera abas-protegidas.js a partir dos arquivos atuais.
   O manifesto só CRESCE: funções/elementos já listados nunca saem sozinhos.
   Assim, se uma função de uma aba sumir numa atualização, o verificador acusa.
   Uso:  node gerar-manifesto.js [pasta]
   ================================================================ */
var fs = require('fs'), path = require('path');
var dir = path.resolve(process.argv[2] || '.');
var ler = function (f) { try { return fs.readFileSync(path.join(dir, f), 'utf8'); } catch (e) { return null; } };
var html = ler('index.html'); if (!html) { console.error('index.html não encontrado'); process.exit(1); }

/* ---- estrutura fixa: quem é cada aba e em quais arquivos ela vive ---- */
var ABAS = [
  { id: 'tab1', nome: 'Início', icone: 'fa-home', grupo: 'protectedSystemTabs', arquivos: ['aba-inicio.js', 'aba-inicio-2.js'] },
  { id: 'tab2', nome: 'Check-in', icone: 'fa-map-marker-alt', grupo: 'protectedSystemTabs', arquivos: ['aba-checkin.js'] },
  { id: 'tab3', nome: 'Aluno', icone: 'fa-user-graduate', grupo: 'protectedSystemTabs', arquivos: ['aba-aluno.js'] },
  { id: 'tabJogos', nome: 'Jogos', icone: 'fa-gamepad', grupo: 'protectedSystemTabs',
    arquivos: ['desafios.js', 'jogos-arcade.js', 'jogo-quebra.js', 'jogo-pulo.js', 'jogo-surfe.js', 'jogo-aventura.js', 'jogo-pacman.js'] },
  { id: 'tab4', nome: 'Professor', icone: 'fa-chalkboard-teacher', grupo: 'tabsEquipe', conteudo: 'conteudoProfessor',
    arquivos: ['aba-professor.js', 'avaliacao-semanal.js', 'interacao-aluno-professor.js'] },
  { id: 'tab5', nome: 'ADM', icone: 'fa-sliders-h', grupo: 'tabsEquipe', conteudo: 'conteudoAdm', arquivos: ['aba-adm.js'] },
  { id: 'tab6', nome: 'Dev', icone: 'fa-code', grupo: 'tabsEquipe', conteudo: 'conteudoDev', arquivos: ['aba-dev.js'] }
];
var NUCLEO = ['core-base.js', 'core-dados.js', 'core-nav.js', 'assistente.js', 'abas-retrateis.js', 'init.js'];
var VERSAO = 'v87';   /* versão TRAVADA — para mudar de propósito, edite aqui */
var CHAVES_LEGADAS = ['uc_assistente_apresentado_v1'];                                 /* marcador próprio do assistente — não mexer, senão ele se apresenta de novo */
var ACESSO_EQUIPE = { botao: 'btnToggleEquipe', menu: 'tabsEquipe', gatilho: 'headerAppTopo' };

function funcoesDe(src) {
  var s = {}, m, re = /^(?:async\s+)?function\s+([A-Za-z0-9_$]+)\s*\(/gm;
  while ((m = re.exec(src))) s[m[1]] = 1;
  re = /^var\s+([A-Za-z0-9_$]+)\s*=\s*(?:async\s+)?function\b/gm;
  while ((m = re.exec(src))) s[m[1]] = 1;
  return Object.keys(s);
}
function idsDe(src) {
  var s = {}, m, re = /(?:\$|getElementById)\(\s*['"]([A-Za-z0-9_\-]+)['"]\s*\)/g;
  while ((m = re.exec(src))) if (new RegExp('id\\s*=\\s*"' + m[1] + '"').test(html)) s[m[1]] = 1;   // só ids que existem no HTML estático
  return Object.keys(s);
}
var uniao = function (a, b) { var o = {}; (a || []).concat(b || []).forEach(function (x) { o[x] = 1; }); return Object.keys(o).sort(); };

var antigo = { ABAS: [], NUCLEO: {} };
try { antigo = require(path.join(dir, 'abas-protegidas.js')); } catch (e) {}
var antAba = {}; (antigo.ABAS || []).forEach(function (a) { antAba[a.id] = a; });

var novasAbas = ABAS.map(function (a) {
  var fn = [], el = [];
  a.arquivos.forEach(function (f) { var s = ler(f); if (s === null) { console.warn('⚠ arquivo ausente:', f); return; } fn = fn.concat(funcoesDe(s)); el = el.concat(idsDe(s)); });
  var ant = antAba[a.id] || {};
  return { id: a.id, nome: a.nome, icone: a.icone, grupo: a.grupo, conteudo: a.conteudo || null, arquivos: a.arquivos,
           elementos: uniao(ant.elementos, el).filter(function (x) { return x !== a.id; }), funcoes: uniao(ant.funcoes, fn) };
});
var nf = []; NUCLEO.forEach(function (f) { var s = ler(f); if (s !== null) nf = nf.concat(funcoesDe(s)); else console.warn('⚠ arquivo ausente:', f); });
var nuc = { arquivos: NUCLEO, funcoes: uniao((antigo.NUCLEO || {}).funcoes, nf) };

var saida = "/* ================================================================\n" +
"   ABAS-PROTEGIDAS.JS — Universo Capoeira · LISTA OFICIAL (gerada por gerar-manifesto.js)\n" +
"   Início · Check-in · Aluno · Jogos · Professor · ADM · Dev  NUNCA podem ser removidos.\n" +
"   A lista só cresce: cada função/elemento aqui é verificado por verificar-abas.js (antes do GitHub)\n" +
"   e por protecao.js (dentro do app). NÃO apague itens à mão; para atualizar, rode: node gerar-manifesto.js\n" +
"   ================================================================ */\n" +
"(function (g) {\n  'use strict';\n" +
"  var ABAS = " + JSON.stringify(novasAbas) + ";\n" +
"  var NUCLEO = " + JSON.stringify(nuc) + ";\n" +
"  var ACESSO_EQUIPE = " + JSON.stringify(ACESSO_EQUIPE) + ";\n" +
"  function congela(o) { Object.keys(o).forEach(function (k) { if (o[k] && typeof o[k] === 'object') congela(o[k]); }); return Object.freeze(o); }\n" +
"  congela(ABAS); congela(NUCLEO); congela(ACESSO_EQUIPE);\n" +
"  var VERSAO = " + JSON.stringify(VERSAO) + ", CHAVES_LEGADAS = " + JSON.stringify(CHAVES_LEGADAS) + ";\n" +
"  var M = { VERSAO: VERSAO, CHAVES_LEGADAS: CHAVES_LEGADAS, ABAS: ABAS, NUCLEO: NUCLEO, ACESSO_EQUIPE: ACESSO_EQUIPE };\n" +
"  if (typeof module !== 'undefined' && module.exports) { module.exports = M; return; }\n" +
"  Object.defineProperty(g, 'UC_PROTEGIDAS', { value: M, writable: false, configurable: false });\n" +
"  /* foto da estrutura do HTML ANTES do app rodar (o app troca conteúdo depois) */\n" +
"  try {\n    var d = g.document, foto = {};\n" +
"    ABAS.forEach(function (a) { foto[a.id] = a.elementos.filter(function (e) { return !d.getElementById(e); }); });\n" +
"    Object.defineProperty(g, 'UC_ESTRUTURA_INICIAL', { value: foto, writable: false, configurable: false });\n  } catch (e) {}\n" +
"})(typeof window !== 'undefined' ? window : this);\n";
fs.writeFileSync(path.join(dir, 'abas-protegidas.js'), saida);
console.log('✔ manifesto gerado: ' + novasAbas.map(function (a) { return a.nome + ' (' + a.funcoes.length + ' funções, ' + a.elementos.length + ' elementos)'; }).join(' · ') + ' · Núcleo (' + nuc.funcoes.length + ' funções)');
