/* Gerador procedural de planetas e ecossistemas.
   Nada é salvo em arquivo: cada planeta é recriado a partir de uma semente.
   Requer THREE carregado antes. Expõe window.GeradorPlanetas. */
(function (global) {
  'use strict';

  function prng(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function escolha(arr, R) { return arr[Math.floor(R() * arr.length)]; }

  var TIPOS = {
    rocky: { nome: 'Rochoso', biomas: ['Deserto', 'Montanha', 'Planície', 'Cratera'],
      cores: { Deserto: [214, 176, 120], Montanha: [120, 112, 104], Planície: [150, 140, 110], Cratera: [90, 84, 80] },
      fauna: { Deserto: ['escorpiões de cristal', 'lagartos solares'], Montanha: ['aves de rocha', 'cabras de altitude'], Planície: ['manadas de herbívoros', 'insetos de poeira'], Cratera: ['vermes subterrâneos'] },
      flora: { Deserto: ['cactos de vidro'], Montanha: ['líquens cinzentos'], Planície: ['gramíneas altas'], Cratera: ['fungos cinzentos'] },
      clima: ['tempestades de poeira', 'ventos fortes', 'calmo', 'calor intenso'] },
    ocean: { nome: 'Oceânico', biomas: ['Oceano', 'Ilhas', 'Gelo polar'],
      cores: { Oceano: [30, 90, 160], Ilhas: [70, 140, 80], 'Gelo polar': [225, 240, 250] },
      fauna: { Oceano: ['cardumes bioluminescentes', 'criaturas abissais'], Ilhas: ['aves marinhas'], 'Gelo polar': ['focas de gelo'] },
      flora: { Oceano: ['algas gigantes'], Ilhas: ['palmeiras azuis'], 'Gelo polar': ['musgo de gelo'] },
      clima: ['chuvas constantes', 'tempestades oceânicas', 'névoa densa', 'calmo'] },
    forest: { nome: 'Florestal', biomas: ['Floresta', 'Rio', 'Planície'],
      cores: { Floresta: [40, 110, 50], Rio: [60, 130, 170], Planície: [120, 160, 80] },
      fauna: { Floresta: ['insetos bioluminescentes', 'felinos de três patas'], Rio: ['peixes de escamas de metal'], Planície: ['manadas de herbívoros'] },
      flora: { Floresta: ['árvores de cem metros'], Rio: ['juncos flutuantes'], Planície: ['gramíneas altas'] },
      clima: ['chuvas torrenciais', 'névoa densa', 'calmo', 'ventos fortes'] },
    ice: { nome: 'Gelado', biomas: ['Gelo', 'Neve', 'Mar congelado'],
      cores: { Gelo: [190, 220, 240], Neve: [235, 242, 250], 'Mar congelado': [150, 190, 220] },
      fauna: { Gelo: ['lobos de gelo'], Neve: ['pássaros polares'], 'Mar congelado': ['baleias de cristal'] },
      flora: { Gelo: ['cristais vivos'], Neve: ['líquens brancos'], 'Mar congelado': ['algas de gelo'] },
      clima: ['nevascas', 'ventos congelantes', 'calmo', 'névoa de gelo'] },
    lava: { nome: 'Vulcânico', biomas: ['Vulcão', 'Lava', 'Cinzas'],
      cores: { Vulcão: [90, 40, 30], Lava: [240, 110, 30], Cinzas: [70, 66, 64] },
      fauna: { Vulcão: ['salamandras de magma'], Lava: ['organismos termófilos'], Cinzas: ['insetos de cinza'] },
      flora: { Vulcão: ['fungos de enxofre'], Lava: ['bactérias incandescentes'], Cinzas: ['líquens negros'] },
      clima: ['chuva de cinzas', 'tempestades elétricas', 'calor intenso', 'gases tóxicos'] },
    gas: { nome: 'Gasoso', biomas: ['Bandas de nuvens'], cores: { 'Bandas de nuvens': [200, 170, 130] },
      fauna: {}, flora: {}, clima: ['ventos de centenas de km/h', 'tempestades gigantes'] }
  };

  /* Cria as informações do planeta a partir da semente. */
  function gerar(seed, dica) {
    var R = prng(seed);
    var tipo = dica === 'gas' ? 'gas' : (dica === 'ice' ? 'ice' : (dica === 'lava' ? 'lava' : escolha(['rocky', 'ocean', 'forest'], R)));
    var T = TIPOS[tipo];
    var gravidade = +(0.4 + R() * 1.4).toFixed(2);
    var clima = escolha(T.clima, R);
    var pesos = T.biomas.map(function () { return 0.5 + R(); });
    var soma = pesos.reduce(function (a, b) { return a + b; }, 0), acc = 0;
    var biomas = T.biomas.map(function (nome, i) {
      acc += pesos[i] / soma;
      return { nome: nome, cor: T.cores[nome], fim: acc };
    });
    var fauna = [], flora = [];
    biomas.forEach(function (b) {
      if (T.fauna[b.nome]) fauna.push(escolha(T.fauna[b.nome], R));
      if (T.flora[b.nome]) flora.push(escolha(T.flora[b.nome], R));
    });
    var temp = tipo === 'lava' ? 'escaldante' : (tipo === 'ice' ? 'gelado' : (tipo === 'gas' ? 'extremo' : (R() < .5 ? 'temperado' : 'quente')));
    var resumo = T.nome + ' · ' + gravidade + ' g · ' + clima + ' · ' + biomas.map(function (b) { return b.nome; }).join(', ');
    return { seed: seed, tipo: tipo, nomeTipo: T.nome, gravidade: gravidade, temperatura: temp, clima: clima,
      biomas: biomas, fauna: fauna, flora: flora, resumo: resumo, pousavel: tipo !== 'gas' };
  }

  function vhash(ix, iy, seed) {
    var h = Math.imul(ix, 374761393) + Math.imul(iy, 668265263) + Math.imul(seed, 1442695041) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
    return (h >>> 0) / 4294967295;
  }
  function vnoise(x, y, per, seed) {
    var x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0;
    function w(v) { return ((v % per) + per) % per; }
    var a = vhash(w(x0), y0, seed), b = vhash(w(x0 + 1), y0, seed);
    var c = vhash(w(x0), y0 + 1, seed), d = vhash(w(x0 + 1), y0 + 1, seed);
    var sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
  }
  function fbm(u, v, seed) {
    var s = 0, amp = 0.5, tot = 0;
    for (var o = 0; o < 4; o++) {
      var f = Math.pow(2, o);
      s += amp * vnoise(u * 4 * f, v * 2 * f, 4 * f, seed + o);
      tot += amp; amp *= 0.5;
    }
    return s / tot;
  }

  /* Gera a textura do planeta (equiretangular, com biomas por ruído). */
  function textura(info, largura) {
    if (!info || info.tipo === 'gas') return null;
    var W = largura || 512, H = W / 2;
    var cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    var ctx = cv.getContext('2d'), img = ctx.createImageData(W, H), px = img.data;
    var seed = (info.seed | 0) % 100000;
    for (var y = 0; y < H; y++) {
      for (var x = 0; x < W; x++) {
        var n = fbm(x / W, y / H, seed), fino = vnoise(x / 4, y / 4, 1e9, seed + 99);
        var b = info.biomas[info.biomas.length - 1];
        for (var i = 0; i < info.biomas.length; i++) { if (n <= info.biomas[i].fim) { b = info.biomas[i]; break; } }
        var k = 0.82 + 0.3 * fino, idx = (y * W + x) * 4;
        px[idx] = b.cor[0] * k; px[idx + 1] = b.cor[1] * k; px[idx + 2] = b.cor[2] * k; px[idx + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    var tex = new THREE.CanvasTexture(cv);
    tex.wrapS = THREE.RepeatWrapping;
    return tex;
  }

  global.GeradorPlanetas = { gerar: gerar, textura: textura, prng: prng };
})(window);
