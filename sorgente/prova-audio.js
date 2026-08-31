/* L'audio parte spento, e la scelta vale per tutta la sala.

   Chi apre un gioco per la prima volta — su un treno, in ufficio, di notte —
   non deve sentire niente finche' non lo chiede. La chiave condivisa
   `agf.audio.enabled` porta la scelta da un gioco all'altro: chi accende gli
   effetti in Refusi li ritrova accesi in Tiratura.

   Regola che questa prova protegge: **chiave assente = silenzio**. Non
   «silenzio finche' non tocchi qualcosa», proprio assente = spento.

   Dalla cartella sala/sorgente/: `node prova-audio.js`.
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

const leggi = (p) => p.evaluate(() => {
  const b = document.getElementById('soundBtn');
  return {
    testo: b ? b.textContent.trim() : null,
    premuto: b ? b.getAttribute('aria-pressed') : null,
    chiave: (function(){ try { return localStorage.getItem('agf.audio.enabled'); } catch(e){ return 'BLOCCATO'; } })()
  };
});

(async () => {
  const b = await chromium.launch();

  console.log('\n— senza nessuna preferenza salvata —');
  for (const g of GIOCHI){
    const p = await b.newPage();
    await p.route('**/rest/v1/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    await p.goto('file://' + path.join(RADICE, g, 'index.html'));
    await p.waitForTimeout(500);
    const s = await leggi(p);
    esito(g + ': parte spento', s.testo === 'Effetti off' && s.premuto === 'false', s);
    esito(g + ': non scrive niente prima che glielo si chieda', s.chiave === null, s.chiave);
    await p.close();
  }

  console.log('\n— la scelta passa da un gioco all\'altro —');
  {
    const ctx = await b.newContext();
    const p1 = await ctx.newPage();
    await p1.route('**/rest/v1/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    await p1.goto('file://' + path.join(RADICE, 'refusi', 'index.html'));
    await p1.waitForTimeout(400);
    await p1.click('#soundBtn');
    await p1.waitForTimeout(150);
    const acceso = await leggi(p1);
    esito('refusi: acceso a mano', acceso.testo === 'Effetti on' && acceso.premuto === 'true' && acceso.chiave === '1', acceso);

    /* file:// non condivide localStorage fra cartelle diverse: la preferenza si
       verifica riscrivendo la chiave a mano, che e' esattamente quello che il
       browser fa da solo quando i quattro giochi stanno sullo stesso dominio. */
    for (const g of ['leporello', 'tiratura', 'baseline']){
      const p2 = await ctx.newPage();
      await p2.route('**/rest/v1/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
      await p2.addInitScript(() => { try { localStorage.setItem('agf.audio.enabled', '1'); } catch(e){} });
      await p2.goto('file://' + path.join(RADICE, g, 'index.html'));
      await p2.waitForTimeout(500);
      const s = await leggi(p2);
      esito(g + ': trova la preferenza accesa', s.testo === 'Effetti on' && s.premuto === 'true', s);
      await p2.close();
    }

    /* Uno «0» esplicito e' una scelta, non un'assenza: resta spento. */
    const p3 = await ctx.newPage();
    await p3.route('**/rest/v1/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    await p3.addInitScript(() => { try { localStorage.setItem('agf.audio.enabled', '0'); } catch(e){} });
    await p3.goto('file://' + path.join(RADICE, 'tiratura', 'index.html'));
    await p3.waitForTimeout(500);
    const s3 = await leggi(p3);
    esito('lo zero esplicito resta spento', s3.testo === 'Effetti off', s3);
    await ctx.close();
  }

  console.log('\n— con localStorage bloccato si gioca lo stesso —');
  {
    const p = await b.newPage();
    await p.route('**/rest/v1/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    await p.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        get(){ throw new Error('bloccato'); }
      });
    });
    const errori = [];
    p.on('pageerror', e => errori.push(String(e)));
    await p.goto('file://' + path.join(RADICE, 'tiratura', 'index.html'));
    await p.waitForTimeout(700);
    const vivo = await p.evaluate(() => !!document.getElementById('startBtn') &&
                                        !document.getElementById('startBtn').hidden);
    esito('la pagina resta viva e si puo\' partire', vivo && errori.length === 0, errori.slice(0, 2));
    await p.close();
  }

  await b.close();
  console.log(falliti ? '\n' + falliti + ' controlli falliti' : '\nTutto a posto.');
  process.exit(falliti ? 1 : 0);
})();
