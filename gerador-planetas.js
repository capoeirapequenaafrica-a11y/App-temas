/* Gerador de planetas e ecossistemas baseado em ecologia real.
   - Biomas: classificação de Whittaker (temperatura média e precipitação anual).
   - Espécies: exemplos reais de plantas e animais de cada bioma.
   - Gradiente: temperatura cai do equador aos polos, como na Terra.
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

  /* Biomas reais (Whittaker): cor aproximada da cobertura e espécies de exemplo. */
  var BIOMAS = {
    'Geleira':                 { cor: [235, 242, 250], flora: [],                                   fauna: [] },
    'Tundra':                  { cor: [160, 170, 150], flora: ['musgos', 'líquens', 'arbustos anões'], fauna: ['caribus', 'lebres-árticas', 'raposas-árticas'] },
    'Taiga':                   { cor: [45, 85, 60],    flora: ['abetos', 'pinheiros', 'bétulas'],    fauna: ['alces', 'lobos-cinzentos', 'ursos-pardos'] },
    'Floresta temperada':      { cor: [70, 120, 55],   flora: ['carvalhos', 'faias', 'bordos'],      fauna: ['veados', 'esquilos', 'corujas'] },
    'Estepe':                  { cor: [150, 150, 90],  flora: ['gramíneas baixas', 'artemísias'],    fauna: ['antílopes', 'lebres-da-estepe', 'águias'] },
    'Deserto':                 { cor: [215, 185, 130], flora: ['cactos', 'arbustos xerófilos'],      fauna: ['lagartos', 'escorpiões', 'camelos'] },
    'Savana':                  { cor: [185, 165, 80],  flora: ['gramíneas altas', 'acácias'],        fauna: ['leões', 'zebras', 'girafas'] },
    'Floresta tropical sazonal': { cor: [60, 120, 50], flora: ['árvores caducifólias', 'teca'],      fauna: ['elefantes', 'tigres', 'pavões'] },
    'Floresta tropical úmida': { cor: [25, 100, 40],  flora: ['árvores de dossel', 'orquídeas', 'bromélias'], fauna: ['macacos', 'jaguares', 'tucanos'] },
    'Oceano':                  { cor: [25, 70, 150],   flora: ['fitoplâncton', 'algas'],             fauna: ['cardumes', 'baleias', 'tubarões'] },
    'Recife de coral':         { cor: [40, 160, 170],  flora: ['corais', 'algas calcárias'],         fauna: ['peixes-papagaio', 'tartarugas-marinhas'] },
    'Gelo marinho':            { cor: [200, 225, 240], flora: ['algas de gelo'],                     fauna: ['focas', 'ursos-polares', 'krill'] }
  };
  /* Biomas vulcânicos: espécies reais de ambientes extremos (extremófilos e colonizadores pioneiros). */
  var VULCANICOS = {
    'Campo de lava':        { cor: [70, 40, 35],    flora: [],                          fauna: ['arqueias termófilas'] },
    'Cinzas vulcânicas':    { cor: [85, 80, 78],    flora: ['líquens pioneiros'],       fauna: ['ácaros', 'colêmbolos'] },
    'Fontes termais':       { cor: [60, 110, 90],   flora: ['cianobactérias termófilas'], fauna: ['bactérias termófilas'] }
  };

  /* Classificação de Whittaker: T em °C e P em mm/ano. */
  function whittaker(T, P) {
    if (T < -30) return 'Geleira';
    if (T < -10) return 'Tundra';
    if (T < 4)   return P < 250 ? 'Tundra' : 'Taiga';
    if (T < 18)  return P < 250 ? 'Deserto' : (P < 700 ? 'Estepe' : 'Floresta temperada');
    return P < 250 ? 'Deserto' : (P < 700 ? 'Savana' : (P < 1500 ? 'Floresta tropical sazonal' : 'Floresta tropical úmida'));
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
  /* u: longitude (0..1, com repetição); f: linha da textura (0..1). */
  function fbm(u, f, seed) {
    var s = 0, amp = 0.5, tot = 0;
    for (var o = 0; o < 4; o++) {
      var fr = Math.pow(2, o);
      s += amp * vnoise(u * 4 * fr, f * 2 * fr, 4 * fr, seed + o);
      tot += amp; amp *= 0.5;
    }
    return s / tot;
  }

  /* Gera as condições do planeta: temperatura média, chuva e proporção de água. */
  function gerar(seed, dica) {
    var R = prng(seed);
    var tipo = dica === 'gas' ? 'gas' : (dica === 'ice' ? 'ice' : (dica === 'lava' ? 'lava' : escolha(['rocky', 'ocean', 'forest'], R)));
    var gravidade = +(0.4 + R() * 1.4).toFixed(2);
    var Tmed, Pmed, nivelAgua;
    if (tipo === 'gas') { Tmed = -120; Pmed = 0; nivelAgua = 0; }
    else if (tipo === 'lava') { Tmed = 80 + R() * 200; Pmed = 50 + R() * 300; nivelAgua = 0.15; }
    else if (tipo === 'ice') { Tmed = -60 + R() * 40; Pmed = 100 + R() * 600; nivelAgua = 0.1 + R() * 0.2; }
    else { Tmed = -25 + R() * 75; Pmed = 150 + R() * 2200; nivelAgua = tipo === 'ocean' ? 0.55 + R() * 0.3 : 0.15 + R() * 0.3; }
    /* Obliquidade real de planetas do Sistema Solar (graus): Júpiter, Terra, Marte, Saturno, Netuno, Urano, Vênus. */
    var REF = [3.1, 23.4, 25.2, 26.7, 28.3, 97.8, 177], PESO = [1, 5, 2, 2, 2, 1, 0.4];
    var tot = PESO.reduce(function (a, b) { return a + b; }, 0), rr = R() * tot, ix = 0;
    for (; ix < REF.length - 1; ix++) { rr -= PESO[ix]; if (rr < 0) break; }
    var inc = Math.max(0, Math.min(180, REF[ix] + (R() - 0.5) * 4));
    var dia = 8 + R() * 32, sent = inc > 90 ? -1 : 1;
    var est = inc > 60 ? 'estações extremas' : (inc > 20 ? 'estações marcadas' : 'estações suaves');
    var atmCor = Tmed > 20 ? [220, 170, 120] : (Tmed < -5 ? [150, 190, 255] : [120, 170, 255]);
    var nomeTipo = { rocky: 'Rochoso', ocean: 'Oceânico', forest: 'Florestal', ice: 'Gelado', lava: 'Vulcânico', gas: 'Gasoso' }[tipo];
    return {
      seed: seed, tipo: tipo, nomeTipo: nomeTipo, gravidade: gravidade,
      Tmed: Math.round(Tmed), Pmed: Math.round(Pmed), nivelAgua: nivelAgua,
      biomas: [{ nome: 'atmosfera', cor: atmCor }],
      biomasPresentes: [], fauna: [], flora: [], inclinacao: inc, diaHoras: dia, sentido: sent, estacoes: est,
      clima: 'temperatura média de ' + Math.round(Tmed) + ' °C e chuva de ' + Math.round(Pmed) + ' mm/ano',
      resumo: nomeTipo + ' · ' + gravidade + ' g', pousavel: tipo !== 'gas'
    };
  }

  /* Bioma de um ponto da textura: u longitude (0..1), f linha (0 = topo, 1 = base). */
  function biomaPonto(info, u, f) {
    var lat = Math.abs(Math.cos(Math.PI * f));
    var T = info.Tmed - 50 * lat + (fbm(u, f, info.seed + 3) - 0.5) * 10;
    var h = fbm(u, f, info.seed + 7);
    if (info.tipo === 'gas') return { nome: 'Bandas de nuvens', cor: [200, 170, 130], flora: [], fauna: [] };
    if (info.tipo === 'lava') {
      var v = h < 0.3 ? 'Campo de lava' : (h < 0.6 ? 'Cinzas vulcânicas' : 'Fontes termais');
      return Object.assign({ nome: v }, VULCANICOS[v]);
    }
    if (h < info.nivelAgua) {
      var m = T > 22 && h > info.nivelAgua - 0.03 ? 'Recife de coral' : (T > -2 ? 'Oceano' : 'Gelo marinho');
      return Object.assign({ nome: m }, BIOMAS[m]);
    }
    var P = info.Pmed * (0.5 + fbm(u, f, info.seed + 11));
    var b = whittaker(T, P);
    return Object.assign({ nome: b }, BIOMAS[b]);
  }

  /* Textura equiretangular com os biomas do planeta. */
  function textura(info, largura) {
    if (!info || info.tipo === 'gas') return null;
    var W = largura || 512, H = W / 2;
    var cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    var ctx = cv.getContext('2d'), img = ctx.createImageData(W, H), px = img.data;
    var cont = {};
    for (var y = 0; y < H; y++) {
      for (var x = 0; x < W; x++) {
        var bio = biomaPonto(info, x / W, y / H);
        cont[bio.nome] = (cont[bio.nome] || 0) + 1;
        var k = 0.85 + 0.25 * vnoise(x / 4, y / 4, 1e9, info.seed + 99), idx = (y * W + x) * 4;
        px[idx] = bio.cor[0] * k; px[idx + 1] = bio.cor[1] * k; px[idx + 2] = bio.cor[2] * k; px[idx + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    info.biomasPresentes = Object.keys(cont).filter(function (n) { return cont[n] > W * H * 0.02; });
    info.resumo = info.nomeTipo + ' · ' + info.gravidade + ' g · ' + info.estacoes + ' (inclinação ' + info.inclinacao.toFixed(1) + '°) · ' + info.clima + ' · ' + info.biomasPresentes.join(', ');
    var tex = new THREE.CanvasTexture(cv);
    tex.wrapS = THREE.RepeatWrapping;
    return tex;
  }

  /* Ecossistema do ponto onde a nave pousou (vetor normal da superfície). */
  function ecossistemaEm(info, nx, ny, nz) {
    if (!info || info.tipo === 'gas') return { texto: '' };
    var len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
    ny = Math.max(-1, Math.min(1, ny / len));
    var phi = Math.atan2(nz / len, -nx / len);
    var u = ((phi / (2 * Math.PI)) % 1 + 1) % 1;
    var f = 1 - Math.acos(ny) / Math.PI;
    var b = biomaPonto(info, u, f);
    var fauna = b.fauna.length ? ' · fauna: ' + b.fauna.join(', ') : '';
    var flora = b.flora.length ? ' · flora: ' + b.flora.join(', ') : '';
    return { bioma: b.nome, texto: b.nome + fauna + flora };
  }

  global.GeradorPlanetas = { gerar: gerar, textura: textura, ecossistemaEm: ecossistemaEm, prng: prng, BIOMAS: BIOMAS };
})(window);
