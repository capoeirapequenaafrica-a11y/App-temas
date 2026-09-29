#!/usr/bin/env node
/* ================================================================
   VERIFICAR-ABAS.JS — roda ANTES de publicar (local ou GitHub Actions).
   Falha (exit 1) se qualquer aba protegida perdeu botão, área, elemento,
   função ou arquivo. Uso:  node verificar-abas.js [pasta]
   ================================================================ */
var fs = require('fs'), path = require('path');
var dir = path.resolve(process.argv[2] || '.');
var M = require(path.join(dir, 'abas-protegidas.js'));
var ler = function (f) { try { return fs.readFileSync(path.join(dir, f), 'utf8'); } catch (e) { return null; } };
var html = ler('index.html'), erros = [];
if (!html) { console.error('✖ index.html não encontrado em ' + dir); process.exit(1); }
var todosJs = fs.readdirSync(dir).filter(function (f) { return /\.js$/.test(f) && f !== 'abas-protegidas.js'; }).map(ler).join('\n');
var temId = function (id) { return new RegExp('id\\s*=\\s*["\']' + id + '["\']').test(html); };
var temFn = function (fn) {
  var n = fn.replace(/\$/g, '\\$');
  return new RegExp('function\\s+' + n + '\\s*\\(|\\b(?:var|let|const)\\s+' + n + '\\s*=|(?:window|global)\\.' + n + '\\s*=').test(todosJs);
};
var scripts = (html.match(/<script[^>]+src="[^"]+"/g) || []).map(function (s) { return s.replace(/.*src="([^"]+)".*/, '$1'); });
var ordem = function (f) { return scripts.indexOf(f); };
var lista = function (a, max) { return a.slice(0, max || 8).join(', ') + (a.length > (max || 8) ? ' … (+' + (a.length - (max || 8)) + ')' : ''); };

M.ABAS.forEach(function (a) {
  var f = function (m) { erros.push('[' + a.nome + '] ' + m); };
  if (!temId(a.id)) f('falta <div id="' + a.id + '"> no index.html');
  if (!new RegExp("abrirAba\\('" + a.id + "'").test(html)) f("falta o botão abrirAba('" + a.id + "')");
  if (a.conteudo && !temId(a.conteudo)) f('falta #' + a.conteudo);
  var semEl = a.elementos.filter(function (e) { return !temId(e); }); if (semEl.length) f('faltam elementos: #' + lista(semEl));
  var semFn = a.funcoes.filter(function (x) { return !temFn(x); }); if (semFn.length) f('faltam funções: ' + lista(semFn) + '  [' + semFn.length + ' no total]');
  a.arquivos.forEach(function (arq) {
    if (ler(arq) === null) f('arquivo ' + arq + ' não existe');
    else if (ordem(arq) < 0) f(arq + ' não está carregado no index.html');
  });
});
var n = M.NUCLEO;
n.arquivos.forEach(function (arq) { if (ler(arq) === null) erros.push('[Núcleo] arquivo ' + arq + ' não existe'); else if (ordem(arq) < 0) erros.push('[Núcleo] ' + arq + ' não está carregado no index.html'); });
var nfn = n.funcoes.filter(function (x) { return !temFn(x); }); if (nfn.length) erros.push('[Núcleo] faltam funções: ' + lista(nfn) + '  [' + nfn.length + ' no total]');
var ac = M.ACESSO_EQUIPE;
[ac.botao, ac.menu, ac.gatilho].forEach(function (id) { if (!temId(id)) erros.push('[Acesso da equipe] falta #' + id); });
/* ordem de carregamento: manifesto primeiro, core antes das abas, init depois de tudo, guardião por último */
if (ordem('abas-protegidas.js') < 0 || ordem('protecao.js') < 0) erros.push('[Sistema] abas-protegidas.js e protecao.js precisam estar no index.html');
else if (ordem('protecao.js') !== scripts.length - 1) erros.push('[Sistema] protecao.js precisa ser o ÚLTIMO script');
if (ordem('init.js') >= 0 && ordem('init.js') < Math.max.apply(null, M.ABAS.reduce(function (o, a) { return o.concat(a.arquivos.map(ordem)); }, []))) erros.push('[Sistema] init.js precisa carregar depois de todas as abas');

/* ---- VERSÃO TRAVADA: tudo em v87 (versão do app e chaves de dados do navegador) ---- */
var VER = M.VERSAO || 'v87', NUM = VER.replace(/\D/g, '');
var mv = /var\s+VERSAO_APP\s*=\s*'([^']+)'/.exec(todosJs);
if (!mv) erros.push('[Versão] não achei VERSAO_APP no código');
else if (mv[1] !== VER) erros.push('[Versão] VERSAO_APP está em ' + mv[1] + ' — precisa ser ' + VER);
var legadas = M.CHAVES_LEGADAS || [], chavesErradas = {}, mk, reK = /['"](uc_[a-z0-9_]*?_v(\d+))['"]/g;
while ((mk = reK.exec(todosJs))) if (mk[2] !== NUM && legadas.indexOf(mk[1]) < 0) chavesErradas[mk[1]] = 1;
var ce = Object.keys(chavesErradas);
if (ce.length) erros.push('[Versão] chaves de dados fora da ' + VER + ' (dados salvos "sumiriam" do navegador): ' + lista(ce));

if (erros.length) { console.error('✖ ' + erros.length + ' problema(s) nas abas protegidas:\n  - ' + erros.join('\n  - ')); process.exit(1); }
console.log('✔ Versão travada em ' + VER + ' · Abas protegidas OK: ' + M.ABAS.map(function (a) { return a.nome + ' (' + a.funcoes.length + ')'; }).join(' · ') + ' · Núcleo (' + n.funcoes.length + ' funções)');
