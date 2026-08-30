/* Le quattro anteprime della sala.

   Una scheda che si muove è quello che fa cliccare, ma deve raccontare il gioco
   che c'è dietro: l'anteprima di Baseline faceva scendere **quadratini singoli**
   e prometteva un gioco di caselle, mentre Baseline fa scendere le sette parti
   anatomiche della lettera. Chi arrivava dalla scheda trovava un'altra cosa.

   Qui si verifica che i pezzi siano pezzi veri, che tutte e sette le forme
   girino, e che la composizione **non soffochi**: al posto del giocatore c'è
   una regola che guarda il pezzo in arrivo e quello dopo, e se sbaglia i pesi
   la pila arriva in cima e la scheda si svuota di colpo ogni pochi secondi.

   Dalla cartella sala/sorgente/: `node prova-anteprime.js`.
*/
const { chromium } = require('playwright');
const path = require('path');

const PAGINA = 'file://' + path.resolve(__dirname, '..', 'index.html');
let falliti = 0;
const esito = (nome, ok, extra) => {
  if (!ok) falliti++;
  console.log((ok ? '  ok  ' : '  KO  ') + nome + (extra !== undefined ? '  ' + JSON.stringify(extra) : ''));
};

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const errori = [];
  p.on('pageerror', e => errori.push('JS: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/ERR_|fonts\.g/.test(m.text())) errori.push(m.text().slice(0, 110)); });
  await p.route('**/rest/v1/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
  await p.goto(PAGINA);
  await p.waitForTimeout(1200);

  const r = await p.evaluate(async () => {
    const a = window.__anteprime && window.__anteprime[0];
    if (!a || !a.stato) return { manca: true };
    /* si fa girare la composizione a mano: requestAnimationFrame si ferma con
       la scheda in secondo piano, e una prova non può aspettare il tempo vero */
    let alta = 0, somma = 0, letture = 0;
    for (let i = 0; i < 6000; i++){
      a.passo(16);
      if (i % 8 === 0){
        const s = a.stato();
        somma += s.alta; letture++;
        if (s.alta > alta) alta = s.alta;
      }
    }
    const s = a.stato();
    return { alta: alta, media: somma / letture, stampate: s.stampate,
             fogli: s.fogli, forme: s.forme, celle: s.celle, inchiostri: s.inchiostri };
  });

  if (r.manca){
    esito('le anteprime si espongono al collaudo', false);
  } else {
    esito('baseline · scendono pezzi, non caselle',
          r.celle > 1.5, { celleMedie: +r.celle.toFixed(2) });
    esito('baseline · girano tutte e sette le forme',
          r.inchiostri === 7, { inchiostri: r.inchiostri });
    esito('baseline · le righe si stampano   ',
          r.stampate > 20, { stampate: r.stampate });
    /* Soffocare ogni tanto e' nell'ordine delle cose — il foglio si riempie e
       va in stampa tutto insieme. Deve essere raro: su settecento pezzi, non
       piu' di tre fogli. */
    esito('baseline · la pila non soffoca    ',
          r.fogli <= 3, { fogli: r.fogli, forme: r.forme });
    esito('baseline · e resta bassa          ',
          r.media < 0.7, { media: +r.media.toFixed(2) });
    esito('baseline · e nemmeno si svuota    ',
          r.media > 0.15, { media: +r.media.toFixed(2) });
  }

  // le altre tre devono almeno girare senza rompersi
  const vive = await p.evaluate(async () => {
    const s = window.__anteprime || [];
    for (const a of s) for (let i = 0; i < 400; i++) a.passo(16);
    for (const a of s) a.disegna();
    return s.length;
  });
  esito('tutte e quattro le anteprime girano', vive === 4, { quante: vive });
  esito('console pulita                    ', errori.length === 0, errori.slice(0, 2));

  await b.close();
  console.log(falliti ? '\n' + falliti + ' PROVE FALLITE' : '\ntutto a posto');
  process.exit(falliti ? 1 : 0);
})();
