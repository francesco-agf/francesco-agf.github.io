/* I quattro guasti di macchina e il sigillo.

   In tipografia il mostro non è un mostro: è la cosa che va storta sulla
   macchina, e ogni stampatore la chiama per nome. Ogni gioco della sala ne ha
   uno, e tutti finiscono allo stesso modo — se lo batti, la f della casa resta
   impressa a secco sul foglio e si conta in classifica.

     Baseline   il fuori registro   si rimette a registro chiudendo una quadricromia
     Refusi     il Comic Sans       cinque colpi, e intanto contagia le altre lettere
     Leporello  la piegatrice       ti impone la piega ogni tre passi, per un tratto
     Tiratura   la rotativa         ti mangia il pavimento: 260 metri per seminarla

   Questa prova verifica che si possano chiamare, che si possano battere e che
   il sigillo arrivi. Dalla cartella sala/sorgente/: `node prova-guasti.js`.
*/
const { chromium } = require('playwright');
const path = require('path');

const RADICE = path.resolve(__dirname, '..', '..');
let falliti = 0;
const esito = (nome, ok, extra) => {
  if (!ok) falliti++;
  console.log((ok ? '  ok  ' : '  KO  ') + nome + (extra !== undefined ? '  ' + JSON.stringify(extra) : ''));
};

async function apri(b, gioco){
  const p = await b.newPage({ viewport: { width: 1280, height: 950 } });
  const errori = [];
  p.on('pageerror', e => errori.push('JS: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/ERR_|fonts\.g/.test(m.text())) errori.push(m.text().slice(0, 110)); });
  await p.addInitScript(() => { try { localStorage.setItem('agf.giocatore', 'Francesco'); } catch(e){} });
  await p.route('**/rest/v1/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
  await p.goto('file://' + path.join(RADICE, gioco, 'index.html'));
  await p.waitForTimeout(1100);
  return { p, errori };
}

(async () => {
  const b = await chromium.launch();

  /* ---------- Baseline · il fuori registro ---------- */
  {
    const { p, errori } = await apri(b, 'baseline');
    const r = await p.evaluate(async () => {
      const B = window.__baseline;
      B.svuotaMazzetta();
      document.getElementById('nameInput').value = 'Francesco';
      B.start('free');
      await new Promise(r => setTimeout(r, 300));
      B.chiamaGuasto();
      await new Promise(r => setTimeout(r, 400));
      const acceso = !!B.guasto();
      // fuori registro le righe non pagano: la quadricromia è l'unica uscita
      const primaPunti = B.state().score;
      B.preparaQuad();
      B.rotate(1);
      for (let i = 0; i < 6; i++) B.move(1);
      B.hardDrop();
      await new Promise(r => setTimeout(r, 900));
      const m = B.mazzetta();
      return { acceso: acceso, risolto: !B.guasto(), sigilli: B.sigilli(),
               colori: m.length, formula: m.length ? m[m.length - 1].mix : null,
               guadagno: B.state().score - primaPunti, fase: B.state().phase };
    });
    esito('baseline · il guasto si accende ', r.acceso);
    esito('baseline · la quadricromia lo chiude', r.risolto && r.fase === 'play', { fase: r.fase });
    esito('baseline · arriva il sigillo    ', r.sigilli === 1, { sigilli: r.sigilli });
    esito('baseline · il colore entra in mazzetta', r.colori === 1 && !!r.formula, { formula: r.formula });
    esito('baseline · e paga               ', r.guadagno > 3000, { guadagno: r.guadagno });
    esito('baseline · console pulita       ', errori.length === 0, errori.slice(0, 2));
    await p.close();
  }

  /* ---------- Refusi · il Comic Sans ---------- */
  {
    const { p, errori } = await apri(b, 'refusi');
    const r = await p.evaluate(async () => {
      const R = window.__refusi;
      document.getElementById('nameInput').value = 'Francesco';
      document.getElementById('startBtn').click();
      await new Promise(r => setTimeout(r, 300));
      R.chiamaRefuso();
      await new Promise(r => setTimeout(r, 3000));
      const vivo = R.stato().refusoVivo;
      const infette = R.stato().infette;
      const primaPunti = R.stato().punti;
      R.battiRefuso();
      await new Promise(r => setTimeout(r, 500));
      const s = R.stato();
      return { vivo: vivo, infette: infette, morto: !s.refusoVivo,
               sigilli: s.sigilli, guadagno: s.punti - primaPunti, fase: s.fase };
    });
    esito('refusi   · il refuso scende     ', r.vivo);
    esito('refusi   · e contagia           ', r.infette > 0, { infette: r.infette });
    esito('refusi   · cinque colpi lo abbattono', r.morto && r.fase === 'play', { fase: r.fase });
    esito('refusi   · arriva il sigillo    ', r.sigilli === 1, { sigilli: r.sigilli });
    esito('refusi   · e paga               ', r.guadagno > 2000, { guadagno: r.guadagno });
    esito('refusi   · console pulita       ', errori.length === 0, errori.slice(0, 2));
    await p.close();
  }

  /* ---------- Leporello · la piegatrice ---------- */
  {
    const { p, errori } = await apri(b, 'leporello');
    const r = await p.evaluate(async () => {
      const L = window.__leporello;
      document.getElementById('nameInput').value = 'Francesco';
      document.getElementById('startBtn').click();
      await new Promise(r => setTimeout(r, 300));
      L.chiamaPiegatrice(5);
      const acceso = !!L.piegatrice();
      const pieghePrima = L.stato().pieghe;
      // dieci passi con lo sfrido sempre davanti: la macchina deve piegare da sola
      for (let i = 0; i < 10; i++){
        const s = L.stato();
        if (s.fase !== 'play') break;
        L.mettiSfrido(s.testa.x + 1, s.testa.y);
        L.passo(1);
      }
      const dopo = L.piegatrice();
      const pieghe = L.stato().pieghe - pieghePrima;
      L.finePiegatrice();
      await new Promise(r => setTimeout(r, 300));
      const s = L.stato();
      return { acceso: acceso, imposte: pieghe, scesa: dopo ? dopo.restano : null,
               sigilli: s.sigilli, spenta: !s.piegatriceOn };
    });
    esito('leporello· la piegatrice parte   ', r.acceso);
    esito('leporello· impone le pieghe      ', r.imposte >= 2, { imposte: r.imposte });
    esito('leporello· e conta i passi       ', r.scesa !== null && r.scesa < 54, { restano: r.scesa });
    esito('leporello· finita, arriva il sigillo', r.spenta && r.sigilli === 1, { sigilli: r.sigilli });
    esito('leporello· console pulita        ', errori.length === 0, errori.slice(0, 2));
    await p.close();
  }

  /* ---------- Tiratura · la rotativa e la commessa ---------- */
  {
    const { p, errori } = await apri(b, 'tiratura');
    const r = await p.evaluate(async () => {
      const T = window.__tiratura;
      document.getElementById('nameInput').value = 'Francesco';
      document.getElementById('startBtn').click();
      await new Promise(r => setTimeout(r, 300));
      const c0 = T.commessa();
      T.chiamaRotativa();
      const rot = T.rotativa();
      T.avanza(1200);
      const rot2 = T.rotativa();
      T.fineRotativa();
      const primaPunti = T.stato().punti;
      T.evadi();
      await new Promise(r => setTimeout(r, 300));
      const s = T.stato();
      return { commessa: !!(c0 && c0.metri && c0.numero), avanzata: !!(rot && rot2 && rot2.x > rot.x),
               sigilli: s.sigilli, spenta: !s.rotativaViva,
               evase: s.commesse, guadagno: s.punti - primaPunti,
               bolla: T.bolla() };
    });
    esito('tiratura · la commessa esiste   ', r.commessa);
    esito('tiratura · la rotativa avanza   ', r.avanzata);
    esito('tiratura · seminata, arriva il sigillo', r.spenta && r.sigilli === 1, { sigilli: r.sigilli });
    esito('tiratura · la commessa si evade ', r.evase === 1 && r.guadagno >= 2000, { evase: r.evase, guadagno: r.guadagno });
    esito('tiratura · la bolla si compila  ', r.bolla[0] === 1000 && r.bolla[1] > 400, { bolla: r.bolla });
    esito('tiratura · console pulita       ', errori.length === 0, errori.slice(0, 2));
    await p.close();
  }

  await b.close();
  console.log(falliti ? '\n' + falliti + ' PROVE FALLITE' : '\ntutto a posto');
  process.exit(falliti ? 1 : 0);
})();
