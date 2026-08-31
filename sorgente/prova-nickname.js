/* Il nickname: cosa entra in classifica e cosa no.

   Il nome lo scrive uno sconosciuto e lo legge tutta la sala. Questa prova
   tiene ferme quattro regole:

   1. venti caratteri, non uno di piu';
   2. spazi ai bordi tolti, spazi interni ridotti a uno, un nome di soli spazi
      vale come nome vuoto;
   3. le parentesi angolari non arrivano mai al posto in cui il nome viene
      scritto in pagina — nella sala il record di ogni gioco si componeva con
      innerHTML, ed era l'unico punto dove un nome poteva diventare markup;
   4. chi lascia il campo vuoto vede l'errore accanto al campo, non un alert,
      e il fuoco torna dove deve scrivere.

   Dalla cartella sala/sorgente/: `node prova-nickname.js`.
*/
const { chromium } = require('playwright');
const path = require('path');

const RADICE = path.resolve(__dirname, '..', '..');
let falliti = 0;
const esito = (nome, ok, extra) => {
  if (!ok) falliti++;
  console.log((ok ? '  ok  ' : '  KO  ') + nome + (extra !== undefined ? '  ' + JSON.stringify(extra) : ''));
};

const CATTIVO = '  <img src=x onerror=alert(1)>  Proto   della   sala  che non finisce mai  ';

(async () => {
  const b = await chromium.launch();

  console.log('\n— la ripulitura del nome, gioco per gioco —');
  for (const g of ['baseline', 'refusi', 'leporello', 'tiratura']){
    const p = await b.newPage();
    await p.route('**/rest/v1/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    await p.goto('file://' + path.join(RADICE, g, 'index.html'));
    await p.waitForTimeout(400);

    const r = await p.evaluate((cattivo) => {
      const api = window.__baseline || window.__refusi || window.__leporello || window.__tiratura;
      const inp = document.getElementById('nameInput');
      inp.value = cattivo;
      /* chiediNome() non e' esposta: si passa dal campo, come farebbe una persona */
      const start = document.getElementById('startBtn');
      const apri = document.getElementById('cambiaFirma');
      if (apri && !apri.closest('[hidden]')) apri.click();
      return { presente: !!api, valore: inp.value, lungh: inp.maxLength };
    }, CATTIVO);

    esito(g + ': il campo non accetta piu\' di venti caratteri', r.lungh === 20, r.lungh);

    /* La ripulitura vera si osserva su quello che finisce salvato. */
    const salvato = await p.evaluate((cattivo) => {
      const inp = document.getElementById('nameInput');
      const startName = document.getElementById('startName');
      startName.hidden = false;
      inp.value = cattivo;
      const via = document.getElementById('startBtn') || document.getElementById('dailyBtn');
      via.click();
      try { return localStorage.getItem('agf.giocatore'); } catch(e){ return 'BLOCCATO'; }
    }, CATTIVO);

    const buono = salvato !== null && salvato.length <= 20 &&
                  !/[<>]/.test(salvato) && salvato === salvato.trim() &&
                  !/\s\s/.test(salvato);
    esito(g + ': il nome salvato e\' ripulito', buono, salvato);
    await p.close();
  }

  console.log('\n— soli spazi: non e\' un nome —');
  {
    const p = await b.newPage();
    await p.route('**/rest/v1/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    await p.goto('file://' + path.join(RADICE, 'tiratura', 'index.html'));
    await p.waitForTimeout(400);
    const r = await p.evaluate(() => {
      document.getElementById('signup').hidden = false;
      document.getElementById('signupEdit').hidden = false;
      const campo = document.getElementById('playerName');
      campo.value = '     ';
      document.getElementById('submitScore').click();
      const msg = document.getElementById('signupMsg');
      return { classe: msg.className, testo: msg.textContent,
               fuoco: document.activeElement && document.activeElement.id };
    });
    esito('l\'errore compare accanto al campo', /ko/.test(r.classe) && /nickname/i.test(r.testo), r);
    esito('il fuoco torna sul campo', r.fuoco === 'playerName', r.fuoco);
    await p.close();
  }

  console.log('\n— nella sala il nome non diventa mai markup —');
  {
    const p = await b.newPage();
    const errori = [];
    p.on('pageerror', e => errori.push(String(e)));
    p.on('dialog', async d => { errori.push('ALERT: ' + d.message()); await d.dismiss(); });
    await p.route('**/rest/v1/**', r => r.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify([
        { gioco: 'baseline', nome: '<img src=x onerror="window.__bucato=1">', score: 9000, day: 20260831 },
        { gioco: 'refusi', nome: 'Proto', score: 4200, day: 20260831 }
      ])
    }));
    await p.goto('file://' + path.join(RADICE, 'sala', 'index.html'));
    await p.waitForTimeout(1400);
    const r = await p.evaluate(() => {
      const badge = document.querySelector('[data-record="baseline"]');
      return {
        bucato: !!window.__bucato,
        immagini: document.querySelectorAll('[data-record] img').length,
        testo: badge ? badge.textContent : null,
        grassetti: badge ? badge.querySelectorAll('b').length : 0
      };
    });
    esito('nessun elemento iniettato dal nickname', !r.bucato && r.immagini === 0, r);
    esito('il nome resta leggibile come testo', /img src=x/.test(r.testo || '') && r.grassetti === 1, r.testo);
    esito('nessun errore in console', errori.length === 0, errori.slice(0, 2));
    await p.close();
  }

  await b.close();
  console.log(falliti ? '\n' + falliti + ' controlli falliti' : '\nTutto a posto.');
  process.exit(falliti ? 1 : 0);
})();
