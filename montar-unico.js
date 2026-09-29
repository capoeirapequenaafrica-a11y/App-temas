#!/usr/bin/env node
/* ================================================================
   MONTAR-UNICO.JS — junta o index.html + todos os .js num ÚNICO arquivo
   (index-completo.html), que funciona sozinho, sem o GitHub.
   Uso:  node montar-unico.js [pasta] [saida.html]
   ================================================================ */
var fs = require('fs'), path = require('path');
var dir = path.resolve(process.argv[2] || '.'), saida = path.resolve(process.argv[3] || path.join(dir, 'index-completo.html'));
var html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), n = 0;
html = html.replace(/<script src="([A-Za-z0-9_\-]+\.js)"><\/script>/g, function (m, arq) {
  var f = path.join(dir, arq); if (!fs.existsSync(f)) { console.error('✖ falta ' + arq); process.exit(1); }
  n++; return '<script>\n/* ▼ ' + arq + ' */\n' + fs.readFileSync(f, 'utf8').replace(/<\/script/gi, '<\\/script') + '\n</script>';
});
fs.writeFileSync(saida, html);
console.log('✔ ' + path.basename(saida) + ': ' + n + ' arquivos juntos, ' + Math.round(html.length / 1024) + ' KB');
