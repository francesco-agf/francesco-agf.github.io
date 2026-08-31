/* Il ciclo di vita: quello che deve fermarsi quando nessuno guarda.

   Quattro tele animate nella sala e un gioco in campo consumano corrente
   anche quando sono fuori dallo schermo o dietro un'altra scheda. E c'e' un
   guasto peggiore del consumo: una scheda nascosta non riceve frame, ma
   l'orologio corre lo stesso, e al rientro il primo frame arriva con addosso
   tutto il tempo passato altrove. Mezz'ora di ritardo diventa mezz'ora di
   partita in un fotogramma: si muore appena si torna.

   Questa prova verifica:

   1. che le anteprime della sala girino solo mentre si vedono;
   2. che si fermino tutte quando la scheda va in secondo piano, e che al
      ritorno riparta **un solo** giro, non due;
   3. che un gioco nascosto vada in pausa e non salti in avanti al rientro;
   4. che dopo dieci partite di fila non ci siano cicli, timer o ascoltatori
      raddoppiati — il sintomo classico e' un gioco che alla decima partita
      corre al doppio della velocita'.

   Dalla cartella sala/sorgente/: `node prova-vita.js`.
*/
const { chromium } = require('playwright');
const path = require('path');

const RADICE = path.resolve(__dirname, '..', '..');
let falliti = 0;
const esito = (nome, ok, extra) => {
  if (!ok) falliti++;
  console.log((ok ? '  ok  ' : '  KO  ') + nome + (extra !== undefined ? '  ' + JSON.stringify(extra) : ''));
};

/* Conta quante volte al secondo viene chiesto un frame: un giro solo ne chiede
   una sessantina, due giri ne chiedono centoventi. */
const CONTATORE = () => {
  window.__raf = 0;
  const vero = window.requestAnimationFrame;
  window.requestAnimationFrame = function(f){ window.__raf++; return vero.call(window, f); };
};

const NASCONDI = (stato) => {
  Object.defineProperty(document, 'visibilityState', { configurable: true, get(){ return stato; } });
  document.dispatchEvent(new Event('visibilitychange'));
};

(async () => {
  const b = await chromium.launch();

  console.log('\n— le anteprime della sala —');
  {
    const p = await b.newPage({ viewport: { width: 1280, height: 700 } });
    await p.route('**/rest/v1/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    await p.goto('file://' + path.join(RADICE, 'sala', 'index.html'));
    await p.waitForTimeout(900);

    const inVista = await p.evaluate(() => window.__giro && { attivo: window.__giro.attivo(), viste: window.__giro.viste() });
    esito('con le schede in vista il giro e\' acceso', inVista && inVista.attivo && inVista.viste > 0, inVista);

    /* Si scende in fondo alla pagina: le anteprime escono dallo schermo. */
    await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await p.waitForTimeout(700);
    const fuori = await p.evaluate(() => window.__giro && { attivo: window.__giro.attivo(), viste: window.__giro.viste() });
    esito('uscite dallo schermo, il giro si spegne', fuori && fuori.viste === 0 && !fuori.attivo, fuori);

    await p.evaluate(() => window.scrollTo(0, 0));
    await p.waitForTimeout(700);
    const rientro = await p.evaluate(() => window.__giro && { attivo: window.__giro.attivo(), viste: window.__giro.viste() });
    esito('tornate in vista, riparte', rientro && rientro.attivo && rientro.viste > 0, rientro);

    /* Scheda in secondo piano. */
    await p.evaluate(NASCONDI, 'hidden');
    await p.waitForTimeout(400);
    const dietro = await p.evaluate(() => window.__giro.attivo());
    esito('scheda nascosta, tutto fermo', dietro === false, dietro);

    /* E al ritorno un solo giro, non due: si contano le richieste di frame. */
    await p.evaluate(CONTATORE);
    await p.evaluate(NASCONDI, 'visible');
    await p.evaluate(NASCONDI, 'visible');   /* due eventi di fila: il giro resta uno */
    await p.waitForTimeout(1000);
    const chieste = await p.evaluate(() => window.__raf);
    esito('un solo giro dopo il rientro (frame al secondo)', chieste > 20 && chieste < 110, chieste);

    await p.close();
  }

  console.log('\n— il gioco dietro un\'altra scheda —');
  {
    const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
    await p.route('**/rest/v1/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    await p.addInitScript(() => { try { localStorage.setItem('agf.giocatore', 'Collaudo'); } catch(e){} });
    await p.goto('file://' + path.join(RADICE, 'tiratura', 'index.html'));
    await p.waitForTimeout(600);
    await p.evaluate(() => document.getElementById('startBtn').click());
    await p.waitForTimeout(700);

    const prima = await p.evaluate(() => window.__tiratura.stato());
    await p.evaluate(NASCONDI, 'hidden');
    await p.waitForTimeout(900);
    const durante = await p.evaluate(() => window.__tiratura.stato());
    esito('nascosta, la partita si ferma', durante.fase === 'pause', { fase: durante.fase });
    esito('e i metri non avanzano', Math.abs(durante.metri - prima.metri) < 60,
          { prima: Math.round(prima.metri), durante: Math.round(durante.metri) });

    await p.evaluate(NASCONDI, 'visible');
    await p.waitForTimeout(600);
    const dopo = await p.evaluate(() => window.__tiratura.stato());
    esito('al rientro resta in pausa, non salta avanti',
          dopo.fase === 'pause' && Math.abs(dopo.metri - durante.metri) < 30,
          { fase: dopo.fase, metri: Math.round(dopo.metri) });
    await p.close();
  }

  console.log('\n— dieci partite di fila —');
  {
    const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
    await p.route('**/rest/v1/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    await p.addInitScript(() => { try { localStorage.setItem('agf.giocatore', 'Collaudo'); } catch(e){} });
    await p.addInitScript(CONTATORE);
    await p.goto('file://' + path.join(RADICE, 'tiratura', 'index.html'));
    await p.waitForTimeout(600);

    for (let i = 0; i < 10; i++){
      await p.evaluate(() => {
        const b = document.getElementById('startBtn');
        if (b && !b.hidden) b.click();
      });
      await p.waitForTimeout(220);
      await p.evaluate(() => { if (window.__tiratura.finisci) window.__tiratura.finisci(); });
      await p.waitForTimeout(220);
    }
    await p.evaluate(() => { window.__raf = 0; });
    await p.evaluate(() => document.getElementById('startBtn').click());
    await p.waitForTimeout(1000);
    const chieste = await p.evaluate(() => window.__raf);
    esito('un solo ciclo anche alla decima', chieste > 20 && chieste < 110, chieste);

    const errori = await p.evaluate(() => window.__erroriProva || 0);
    esito('nessun errore accumulato', !errori, errori);
    await p.close();
  }

  await b.close();
  console.log(falliti ? '\n' + falliti + ' controlli falliti' : '\nTutto a posto.');
  process.exit(falliti ? 1 : 0);
})();
