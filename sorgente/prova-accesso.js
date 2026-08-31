/* Quello che il disegno non fa da solo.

   Cinque cose che si vedono soltanto se si prova a usare la sala senza mouse
   e senza guardare lo schermo:

   1. una finestra aperta si dichiara tale (`role="dialog"`, `aria-modal`) e
      dice come si chiama (`aria-labelledby`);
   2. il fuoco entra nella finestra, gira dentro con Tab e non scappa dietro;
   3. quando la finestra si chiude, il fuoco torna al tasto che l'ha aperta;
   4. c'e' una zona parlata che racconta avvio, pausa e fine partita — e non
      il punteggio a ogni colpo;
   5. il campo di gioco ha un nome e una descrizione dei comandi, e lo zoom
      del browser non e' bloccato.

   Dalla cartella sala/sorgente/: `node prova-accesso.js`.
*/
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const RADICE = path.resolve(__dirname, '..', '..');
const GIOCHI = ['baseline', 'refusi', 'leporello', 'tiratura'];
let falliti = 0;
const esito = (nome, ok, extra) => {
  if (!ok) falliti++;
  console.log((ok ? '  ok  ' : '  KO  ') + nome + (extra !== undefined ? '  ' + JSON.stringify(extra) : ''));
};

(async () => {
  const b = await chromium.launch();

  for (const g of GIOCHI){
    console.log('\n— ' + g + ' —');
    const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
    await p.route('**/rest/v1/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    await p.addInitScript(() => { try { localStorage.setItem('agf.giocatore', 'Collaudo'); } catch(e){} });
    await p.goto('file://' + path.join(RADICE, g, 'index.html'));
    await p.waitForTimeout(700);

    const campo = await p.evaluate(() => {
      const c = document.getElementById('field');
      const d = c && c.getAttribute('aria-describedby');
      const descr = d ? document.getElementById(d) : null;
      return {
        nome: c ? c.getAttribute('aria-label') : null,
        ruolo: c ? c.getAttribute('role') : null,
        descrizione: descr ? descr.textContent.trim().slice(0, 40) : null,
        voce: !!document.querySelector('[aria-live="polite"]')
      };
    });
    esito('il campo ha un nome', !!campo.nome && campo.ruolo === 'img', campo.nome);
    esito('e una descrizione dei comandi', !!campo.descrizione, campo.descrizione);
    esito('esiste la zona parlata', campo.voce);

    /* La finestra delle regole: si apre da tastiera e si comporta bene. */
    const apertura = await p.evaluate(() => {
      const apri = document.getElementById('rulesBtn');
      apri.focus();
      apri.click();
      const m = document.getElementById('rules');
      return { ruolo: m.getAttribute('role'), modale: m.getAttribute('aria-modal'),
               etichetta: m.getAttribute('aria-labelledby') };
    });
    await p.waitForTimeout(120);
    const dentro = await p.evaluate(() => {
      const m = document.getElementById('rules');
      return m.contains(document.activeElement);
    });
    esito('la finestra si dichiara modale', apertura.ruolo === 'dialog' && apertura.modale === 'true', apertura);
    esito('e dice come si chiama', !!apertura.etichetta, apertura.etichetta);
    esito('il fuoco ci entra dentro', dentro);

    /* Tab in fondo alla lista torna al primo: il fuoco non esce. */
    for (let i = 0; i < 25; i++) await p.keyboard.press('Tab');
    const restato = await p.evaluate(() => document.getElementById('rules').contains(document.activeElement));
    esito('venticinque Tab non lo portano fuori', restato);

    /* Chiusa la finestra, il fuoco torna da dove era partito. */
    await p.evaluate(() => document.getElementById('rulesClose').click());
    await p.waitForTimeout(150);
    const tornato = await p.evaluate(() => document.activeElement && document.activeElement.id);
    esito('il fuoco torna al tasto che l\'aveva aperta', tornato === 'rulesBtn', tornato);

    /* La voce parla quando cambia la scena, non a ogni colpo. */
    const parlato = await p.evaluate(async () => {
      const v = document.querySelector('[aria-live="polite"]');
      const prima = v.textContent;
      const via = document.getElementById('startBtn') || document.getElementById('dailyBtn');
      via.click();
      await new Promise(r => setTimeout(r, 500));
      const durante = v.textContent;
      return { prima: prima, durante: durante };
    });
    esito('annuncia l\'inizio della partita', /gioca/i.test(parlato.durante), parlato);

    await p.close();
  }

  console.log('\n— lo zoom del browser —');
  for (const g of GIOCHI.concat(['sala'])){
    const testa = fs.readFileSync(path.join(RADICE, g, 'index.html'), 'utf8');
    const m = /<meta name="viewport"[^>]*>/.exec(testa);
    esito(g + ': lo zoom non e\' bloccato',
          !!m && !/user-scalable\s*=\s*no/.test(m[0]) && !/maximum-scale\s*=\s*1/.test(m[0]),
          m && m[0]);
  }

  console.log('\n— la tacca del telefono —');
  for (const g of GIOCHI.concat(['sala'])){
    const testa = fs.readFileSync(path.join(RADICE, g, 'index.html'), 'utf8');
    esito(g + ': tiene conto della safe-area',
          /safe-area-inset/.test(testa) && /viewport-fit=cover/.test(testa));
  }

  await b.close();
  console.log(falliti ? '\n' + falliti + ' controlli falliti' : '\nTutto a posto.');
  process.exit(falliti ? 1 : 0);
})();
