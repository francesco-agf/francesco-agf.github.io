/* Le cose che devono valere per TUTTA la sala, non per un gioco solo.

   Nata dal collaudo del 30.08.2026, che ha trovato quattro guai di questo tipo:
   la pagina di Baseline scorreva di lato di 268 px sul telefono (la barra audio
   nel piede non andava a capo); in Refusi mancava «Abbandona la partita», che è
   il pulsante con cui si manda il punteggio in classifica senza aspettare di
   perdere; nessuna delle cinque pagine aveva un'immagine di anteprima, quindi
   ogni link condiviso usciva come una riga grigia; e la favicon c'era solo su
   Baseline.

   Sono tutte cose che non si vedono giocando e che rientrano di soppiatto alla
   prima modifica: per questo stanno in una prova.

       node prova-famiglia.js      (dalla cartella sala/sorgente/)
*/
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const RADICE = path.resolve(__dirname, '..', '..');
const GIOCHI = ['baseline', 'refusi', 'leporello', 'tiratura'];
const PAGINE = GIOCHI.concat(['sala']);
let falliti = 0;
const esito = (nome, ok, extra) => {
  if (!ok) falliti++;
  console.log((ok ? '  ok  ' : '  KO  ') + nome + (extra !== undefined ? '  ' + JSON.stringify(extra) : ''));
};

(async () => {
  const b = await chromium.launch();

  /* ---------- 1 · la testa del documento ---------- */
  console.log('\nla testa del documento');
  for (const g of PAGINE){
    const file = path.join(RADICE, g, 'index.html');
    const s = fs.readFileSync(file, 'utf8');
    const testa = s.slice(0, s.indexOf('</head>') + 7 || 9000);
    const cartella = path.join(RADICE, g);
    const mancanti = [];
    if (!/<meta name="description"/.test(testa)) mancanti.push('description');
    if (!/<meta property="og:image"/.test(testa)) mancanti.push('og:image');
    if (!/<meta name="twitter:card" content="summary_large_image"/.test(testa)) mancanti.push('twitter:card');
    if (!/<link rel="icon"/.test(testa)) mancanti.push('favicon');
    if (!/<link rel="apple-touch-icon"/.test(testa)) mancanti.push('apple-touch-icon');
    if (!/<link rel="canonical"/.test(testa)) mancanti.push('canonical');
    if (!fs.existsSync(path.join(cartella, 'anteprima.jpg'))) mancanti.push('il file anteprima.jpg');
    if (!fs.existsSync(path.join(cartella, 'apple-touch-icon.png'))) mancanti.push('il file apple-touch-icon.png');
    esito(g.padEnd(10) + 'testa completa', mancanti.length === 0, mancanti.length ? mancanti : undefined);
  }

  /* ---------- 2 · niente scorrimento laterale ---------- */
  console.log('\nla pagina non scorre di lato');
  for (const g of PAGINE){
    for (const [nome, w, h] of [['telefono', 390, 844], ['telefono stretto', 360, 780], ['monitor', 1440, 900]]){
      const p = await b.newPage({ viewport: { width: w, height: h }, isMobile: w < 500, hasTouch: w < 500 });
      await p.addInitScript(() => { try { localStorage.setItem('agf.giocatore', 'Francesco'); } catch(e){} });
      await p.route('**/rest/v1/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
      await p.goto('file://' + path.join(RADICE, g, 'index.html'));
      await p.waitForTimeout(900);
      const avanzo = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      esito((g + ' · ' + nome).padEnd(30), avanzo <= 1, avanzo > 1 ? { avanzoPx: avanzo } : undefined);
      await p.close();
    }
  }

  /* ---------- 3 · dalla pausa si può abbandonare, e il punteggio parte ---------- */
  console.log('\nin pausa si può abbandonare la partita');
  for (const g of GIOCHI){
    const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
    await p.addInitScript(() => { try { localStorage.setItem('agf.giocatore', 'Francesco'); } catch(e){} });
    const inviati = [];
    await p.route('**/rest/v1/**', async (route) => {
      if (route.request().method() === 'POST'){
        inviati.push(JSON.parse(route.request().postData()));
        return route.fulfill({ status: 201, body: '' });
      }
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });
    await p.goto('file://' + path.join(RADICE, g, 'index.html'));
    await p.waitForTimeout(900);
    const r = await p.evaluate(async () => {
      const ni = document.getElementById('nameInput'); if (ni) ni.value = 'Francesco';
      const sb = document.getElementById('startBtn') || document.getElementById('dailyBtn');
      if (sb) sb.click();
      await new Promise(r => setTimeout(r, 700));
      const pb = document.getElementById('pauseBtn'); if (pb) pb.click();
      await new Promise(r => setTimeout(r, 400));
      const gu = document.getElementById('giveUpBtn');
      const visibile = !!gu && !gu.hidden && gu.getBoundingClientRect().height > 0;
      if (visibile) gu.click();
      await new Promise(r => setTimeout(r, 900));
      const api = window.__baseline || window.__refusi || window.__leporello || window.__tiratura;
      const st = api.stato ? api.stato() : api.state();
      return { visibile: visibile, rosso: gu ? gu.className.indexOf('rosso') >= 0 : false,
               fase: st.fase || st.phase, punti: st.punti !== undefined ? st.punti : st.score };
    });
    esito((g + ' · il pulsante c\'è ed è rosso').padEnd(34), r.visibile && r.rosso, r);
    esito((g + ' · la partita si chiude').padEnd(34), r.fase === 'over', { fase: r.fase });
    /* Il punteggio parte se c'è qualcosa da mandare: Baseline non manda le
       partite a zero punti, e manda in classifica solo la composizione del
       giorno — differenza voluta, non un guasto. */
    const attesoInvio = r.punti > 0 && g !== 'baseline';
    esito((g + ' · il punteggio parte').padEnd(34), attesoInvio ? (inviati.length === 1 && inviati[0].gioco === g) : true,
          inviati.length ? { gioco: inviati[0].gioco, punti: inviati[0].score } : { inviati: 0, punti: r.punti });
    await p.close();
  }

  /* ---------- 4 · il grigio più tenue deve reggere il testo piccolo ---------- */
  console.log('\ncontrasto del rimando alla sala');
  const luminanza = (c) => {
    const v = c.map(function(x){ x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); });
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
  };
  for (const g of GIOCHI){
    const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
    await p.route('**/rest/v1/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    await p.goto('file://' + path.join(RADICE, g, 'index.html'));
    await p.waitForTimeout(700);
    const m = await p.evaluate(() => {
      const a = document.querySelector('.sala-link');
      const c = getComputedStyle(a);
      const r = a.getBoundingClientRect();
      const num = (s) => s.match(/\d+/g).slice(0, 3).map(Number);
      return { testo: num(c.color), fondo: num(getComputedStyle(document.body).backgroundColor),
               alto: Math.round(r.height) };
    });
    const l1 = luminanza(m.testo), l2 = luminanza(m.fondo);
    const rapporto = Math.round(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)) * 100) / 100;
    esito((g + ' · contrasto e bersaglio').padEnd(34), rapporto >= 4.5 && m.alto >= 40,
          { contrasto: rapporto, altoPx: m.alto });
    await p.close();
  }

  await b.close();
  console.log(falliti ? '\n' + falliti + ' PROVE FALLITE' : '\ntutto a posto');
  process.exit(falliti ? 1 : 0);
})();
