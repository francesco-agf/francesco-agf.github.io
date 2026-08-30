/* Il proto della sala e la tessera del garzone.

   Il proto è la classifica combinata di chi ha stampato in tutti e quattro i
   giochi. Si somma la **posizione** in ciascuno, non il punteggio: se si
   sommassero i punti vincerebbe chi ha trovato il gioco dove i numeri sono più
   grandi, che non vuol dire essere più bravi. Questa prova monta apposta due
   giocatori che si scambiano i posti — stessa somma, e nessuno dei due vince
   per via del gioco che paga di più.

   La tessera è quello che ti porti via dalla sala, non dalla partita: nome,
   quattro record con la posizione, la somma, e i colori della mazzetta, che
   stanno in questo browser e non nel database.

   Dalla cartella sala/sorgente/: `node prova-tessera.js`.
*/
const { chromium } = require('playwright');
const path = require('path');

const PAGINA = 'file://' + path.resolve(__dirname, '..', 'index.html');
let falliti = 0;
const esito = (nome, ok, extra) => {
  if (!ok) falliti++;
  console.log((ok ? '  ok  ' : '  KO  ') + nome + (extra !== undefined ? '  ' + JSON.stringify(extra) : ''));
};

/* Francesco vince Refusi e Leporello, Anna Baseline e Tiratura: somma 6 a
   testa. Bodoni ha giocato solo a Baseline e non deve comparire fra i proti. */
const RIGHE = [];
for (const [g, n, s] of [
  ['baseline', 'Anna', 24500], ['baseline', 'Francesco', 12800], ['baseline', 'Bodoni', 900],
  ['refusi', 'Francesco', 9400], ['refusi', 'Anna', 6200],
  ['leporello', 'Francesco', 14200], ['leporello', 'Anna', 1000],
  ['tiratura', 'Anna', 9000], ['tiratura', 'Francesco', 6800]
]) RIGHE.push({ gioco: g, nome: n, score: s, day: 20260830 });

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const errori = [];
  p.on('pageerror', e => errori.push('JS: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/ERR_|fonts\.g/.test(m.text())) errori.push(m.text().slice(0, 110)); });
  await p.addInitScript(() => {
    try {
      localStorage.setItem('agf.giocatore', 'Francesco');
      localStorage.setItem('agf.mazzetta', JSON.stringify(
        ['#5a9fd4', '#d4645a', '#c9d45a'].map((h, i) => ({ mix: 'C ' + i, hex: h }))));
    } catch (e) {}
  });
  await p.route('**/rest/v1/**', route => {
    const u = route.request().url();
    if (u.indexOf('select=count') !== -1)
      return route.fulfill({ status: 200, contentType: 'application/json', body: '[{"count":116}]' });
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(RIGHE) });
  });
  await p.goto(PAGINA);
  await p.waitForTimeout(2000);

  const r = await p.evaluate(() => ({
    proto: [...document.querySelectorAll('#protoLista li')].map(l => ({
      chi: (l.querySelector('.chi') || {}).textContent,
      dove: (l.querySelector('.dove') || {}).textContent,
      somma: (l.querySelector('.somma') || {}).textContent
    })),
    nota: document.getElementById('tesseraNota').textContent,
    bottone: !document.getElementById('tesseraBtn').hidden,
    misura: window.__tessera('Francesco')
  }));

  esito('il proto conta solo chi li ha stampati tutti',
        r.proto.length === 2 && r.proto.every(x => x.chi !== 'Bodoni'),
        r.proto.map(x => x.chi));
  esito('e somma le posizioni, non i punti  ',
        r.proto[0] && r.proto[0].somma === '6' && r.proto[1] && r.proto[1].somma === '6',
        r.proto.map(x => x.somma));
  esito('con il dettaglio gioco per gioco   ',
        !!r.proto[0] && /\d+º · \d+º · \d+º · \d+º/.test(r.proto[0].dove), r.proto[0]);
  esito('la tessera si offre a chi ha un nome',
        r.bottone && /Francesco/.test(r.nota) && /4 su 4|4 giochi/.test(r.nota), r.nota);
  esito('e si disegna a misura              ',
        r.misura[0] === 1000 && r.misura[1] > 400, { misura: r.misura });

  // e chi non ha ancora un nome non deve vedere un bottone che non sa compilare
  const q = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await q.route('**/rest/v1/**', route => {
    const u = route.request().url();
    if (u.indexOf('select=count') !== -1)
      return route.fulfill({ status: 200, contentType: 'application/json', body: '[{"count":0}]' });
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(RIGHE) });
  });
  await q.goto(PAGINA);
  await q.waitForTimeout(1800);
  const s = await q.evaluate(() => ({
    bottone: !document.getElementById('tesseraBtn').hidden,
    nota: document.getElementById('tesseraNota').textContent
  }));
  esito('senza nome invita a giocare, non a scaricare',
        !s.bottone && /firma|Gioca/i.test(s.nota), s);
  await q.close();

  esito('console pulita                     ', errori.length === 0, errori.slice(0, 2));

  await b.close();
  console.log(falliti ? '\n' + falliti + ' PROVE FALLITE' : '\ntutto a posto');
  process.exit(falliti ? 1 : 0);
})();
