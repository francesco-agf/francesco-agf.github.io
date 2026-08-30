/* Bersagli da dito e focus da tastiera.

   Su un telefono un bersaglio sotto i 44 px si sbaglia: il piede dei giochi
   stava a 21–30 px, il rimando alla sala a 40, i tasti «Tasti» a 21. E il
   contorno di messa a fuoco c'era solo in Baseline, quindi negli altri quattro
   chi naviga da tastiera non sapeva dove fosse.

   Dalla cartella sala/sorgente/: `node prova-bersagli.js`.
*/
const { chromium } = require('playwright');
const path = require('path');

const RADICE = path.resolve(__dirname, '..', '..');
const PAGINE = ['baseline', 'refusi', 'leporello', 'tiratura', 'sala'];
let falliti = 0;
const esito = (nome, ok, extra) => {
  if (!ok) falliti++;
  console.log((ok ? '  ok  ' : '  KO  ') + nome + (extra !== undefined ? '  ' + JSON.stringify(extra) : ''));
};

(async () => {
  const b = await chromium.launch();

  console.log('bersagli da dito, su un telefono');
  for (const g of PAGINE){
    const p = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await p.route('**/rest/v1/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    await p.goto('file://' + path.join(RADICE, g, 'index.html'));
    await p.waitForTimeout(900);
    const piccoli = await p.evaluate(() => {
      const out = [];
      for (const e of document.querySelectorAll('button, a, select, .lnk')){
        if (e.hidden || !e.offsetParent) continue;
        /* I collegamenti dentro una frase sono esclusi: la regola sui bersagli
           fa un'eccezione per i bersagli in linea nel testo, e allargarli a 44
           px gonfierebbe la riga che li contiene. */
        if (e.closest('.firma, .modo, p')) continue;
        const r = e.getBoundingClientRect();
        if (r.width < 1 || r.height < 1) continue;
        if (r.height < 44 || r.width < 44)
          out.push(((e.id ? '#' + e.id : e.className.split(' ')[0] || e.tagName) + ' ' +
                    Math.round(r.width) + '\u00d7' + Math.round(r.height)));
      }
      return out;
    });
    esito((g + ' \u00b7 tutto almeno 44 px').padEnd(34), piccoli.length === 0, piccoli.slice(0, 4));
    await p.close();
  }

  console.log('\ncontorno di messa a fuoco da tastiera');
  for (const g of PAGINE){
    const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
    await p.route('**/rest/v1/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    await p.goto('file://' + path.join(RADICE, g, 'index.html'));
    await p.waitForTimeout(700);
    await p.keyboard.press('Tab');
    await p.keyboard.press('Tab');
    const r = await p.evaluate(() => {
      const e = document.activeElement, s = getComputedStyle(e);
      return { chi: e.id || e.className || e.tagName, larghezza: s.outlineWidth, stile: s.outlineStyle };
    });
    esito((g + ' \u00b7 si vede dove sei').padEnd(34),
          r.stile !== 'none' && parseFloat(r.larghezza) >= 1.5, r);
    await p.close();
  }

  await b.close();
  console.log(falliti ? '\n' + falliti + ' PROVE FALLITE' : '\ntutto a posto');
  process.exit(falliti ? 1 : 0);
})();
