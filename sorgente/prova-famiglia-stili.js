/* La sala deve sembrare fatta da una mano sola.

   Baseline è il primo nato e per mesi ha avuto una forma sua: pulsanti più
   piccoli e senza filo, pannelli a spigolo vivo, la finestra delle regole a
   tutta pagina appoggiata a sinistra, la firma «Baseline v3.0» nel piede, i
   tasti del piede alti ventuno pixel invece di trenta. Nessuna di queste cose
   è un guasto — messe insieme facevano sembrare Baseline un altro sito.

   Questa prova confronta gli **stili calcolati** dei quattro giochi e fallisce
   se divergono: è l'unico modo perché la famiglia resti tale mentre si continua
   a lavorarci.

   Dalla cartella sala/sorgente/: `node prova-famiglia-stili.js`.
*/
const { chromium } = require('playwright');
const path = require('path');

const RADICE = path.resolve(__dirname, '..', '..');
const GIOCHI = ['baseline', 'refusi', 'leporello', 'tiratura'];
let falliti = 0;
const esito = (nome, ok, extra) => {
  if (!ok) falliti++;
  console.log((ok ? '  ok  ' : '  KO  ') + nome + (extra !== undefined ? '  ' + JSON.stringify(extra) : ''));
};

(async () => {
  const b = await chromium.launch();
  const raccolto = {};
  for (const g of GIOCHI){
    const p = await b.newPage({ viewport: { width: 1440, height: 950 } });
    await p.route('**/rest/v1/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    await p.goto('file://' + path.join(RADICE, g, 'index.html'));
    await p.waitForTimeout(900);
    raccolto[g] = await p.evaluate(() => {
      const st = (sel) => { const e = document.querySelector(sel); return e ? getComputedStyle(e) : null; };
      const misura = (sel, campi) => {
        const s = st(sel); if (!s) return null;
        return campi.map(function(c){ return s[c]; }).join(' | ');
      };
      const tasto = document.querySelector('.colofoot .tool, .colofoot .sound-toggle');
      // la finestra delle regole va aperta per misurarla
      const apri = document.getElementById('rulesBtn') || document.getElementById('rulesBtn2');
      if (apri) apri.click();
      const foglio = document.querySelector('.modal:not([hidden]) .modal-sheet');
      const sf = foglio ? getComputedStyle(foglio) : null;
      const bf = foglio ? foglio.getBoundingClientRect() : null;
      return {
        btn: misura('#ovButtons .btn:not(.ghost)',
                    ['fontSize','letterSpacing','borderTopWidth','borderTopLeftRadius','padding']),
        ghost: misura('#ovButtons .btn.ghost', ['fontSize','letterSpacing','padding']),
        panel: misura('.panel', ['borderTopLeftRadius','padding']),
        titolo: misura('.ov-title', ['fontSize']),
        piede: tasto ? [getComputedStyle(tasto).fontSize, getComputedStyle(tasto).letterSpacing,
                        Math.round(tasto.getBoundingClientRect().height)].join(' | ') : null,
        firma: (document.querySelector('.colofoot .studio span:last-child') || {}).textContent,
        regole: sf ? [Math.round(bf.width), sf.borderTopLeftRadius, sf.backgroundColor].join(' | ') : null,
        chiudi: misura('.modal:not([hidden]) .modal-close', ['fontSize','padding']),
        /* La cornice del tasto e' la stessa dappertutto; il corpo no, e non
           deve esserlo: un tasto con una freccia e uno con una parola sono due
           cose diverse. Si confrontano separatamente. */
        pad: misura('.pad button', ['borderTopLeftRadius','padding']),
        padSegno: misura('.pad button:not(.parola)', ['fontSize','fontFamily']),
        padParola: misura('.pad .parola', ['fontSize','letterSpacing','textTransform']),
        pulsantiInizio: [...document.querySelectorAll('#ovButtons .btn')].filter(function(x){ return !x.hidden; }).length
      };
    });
    await p.close();
  }

  const VOCI = {
    btn: 'il pulsante primario',
    ghost: 'il pulsante fantasma',
    panel: 'il pannello',
    titolo: 'il titolo della scheda',
    piede: 'i tasti del piede',
    firma: 'la firma del piede',
    regole: 'la finestra delle regole',
    chiudi: 'il tasto «chiudi»',
    pad: 'i tasti a schermo',
    padSegno: 'i tasti a segno',
    padParola: 'i tasti a parola',
    pulsantiInizio: 'quanti pulsanti in apertura'
  };
  for (const v in VOCI){
    // chi non ha quel tasto non conta: Tiratura ha solo parole, gli altri solo segni
    const valori = GIOCHI.map(function(g){ return raccolto[g][v]; })
                         .filter(function(x){ return x !== null && x !== undefined; });
    const uguali = valori.every(function(x){ return JSON.stringify(x) === JSON.stringify(valori[0]); });
    esito((VOCI[v] + ' ').padEnd(34, '\u00b7') + ' uguale dove c\'\u00e8      ', uguali && valori.length > 0,
          uguali ? undefined : GIOCHI.reduce(function(o, g){ o[g] = raccolto[g][v]; return o; }, {}));
  }

  await b.close();
  console.log(falliti ? '\n' + falliti + ' PROVE FALLITE' : '\ntutto a posto');
  process.exit(falliti ? 1 : 0);
})();
