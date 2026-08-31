/* Quattro classifiche, quattro richieste, quattro destini separati.

   Prima l'albo era una richiesta sola: trecento righe ordinate per punteggio.
   Ma i quattro giochi non hanno la stessa scala — in Baseline si fanno decine
   di migliaia di punti, in Leporello qualche centinaio — e bastava una manciata
   di partite fortunate a Baseline per riempire l'elenco e lasciare gli altri
   tre vuoti. Peggio: se quella richiesta cadeva, cadeva tutto l'albo.

   Adesso ogni gioco chiede la sua, con il suo limite. Questa prova verifica:

   1. che le richieste siano quattro, filtrate per gioco e limitate;
   2. che il crollo di una non porti giu' le altre tre;
   3. che un gioco senza punteggi dica di essere vuoto, non di essere rotto;
   4. che con tutte e quattro a terra si possa comunque entrare nei giochi;
   5. che lo stesso nickname compaia una volta sola per gioco.

   Dalla cartella sala/sorgente/: `node prova-classifiche.js`.
*/
const { chromium } = require('playwright');
const path = require('path');

const RADICE = path.resolve(__dirname, '..', '..');
const PAGINA = 'file://' + path.join(RADICE, 'sala', 'index.html');
const GIOCHI = ['baseline', 'refusi', 'leporello', 'tiratura'];
const NOMI = { baseline: 'Baseline', refusi: 'Refusi', leporello: 'Leporello', tiratura: 'Tiratura' };
let falliti = 0;
const esito = (nome, ok, extra) => {
  if (!ok) falliti++;
  console.log((ok ? '  ok  ' : '  KO  ') + nome + (extra !== undefined ? '  ' + JSON.stringify(extra) : ''));
};

const finto = (g, quanti) => Array.from({ length: quanti }, (_, i) => ({
  gioco: g, nome: g.slice(0, 3) + '-' + (i + 1), score: 1000 - i * 10, day: 20260831
}));

/* Instrada le richieste per gioco. `caduti` elenca i giochi che devono fallire;
   `vuoti` quelli che rispondono con un elenco vuoto. */
async function apri(b, { caduti = [], vuoti = [], riepilogoCade = false } = {}){
  const p = await b.newPage({ viewport: { width: 1440, height: 1200 } });
  const chiamate = [];
  await p.route('**/rest/v1/**', route => {
    const url = route.request().url();
    chiamate.push(url);
    const m = /gioco=eq\.([a-z]+)/.exec(url);
    if (!m){
      if (riepilogoCade) return route.fulfill({ status: 500, contentType: 'application/json', body: '{}' });
      return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    }
    const g = m[1];
    if (caduti.includes(g)) return route.fulfill({ status: 503, contentType: 'application/json', body: '{}' });
    const corpo = vuoti.includes(g) ? [] : finto(g, 5);
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(corpo) });
  });
  const errori = [];
  p.on('pageerror', e => errori.push(String(e)));
  await p.goto(PAGINA);
  await p.waitForTimeout(1500);
  return { p, chiamate, errori };
}

const leggi = (p) => p.evaluate((NOMI) => {
  const out = {};
  for (const g in NOMI){
    const ol = document.getElementById('albo' + NOMI[g]);
    const righe = [...ol.querySelectorAll('li')];
    out[g] = {
      quante: righe.length,
      nomi: righe.map(li => (li.querySelector('.chi') || {}).textContent || ''),
      errore: !!ol.querySelector('.chi.ko'),
      vuoto: !!ol.querySelector('.chi.vuoto'),
      badge: (document.querySelector('[data-record="' + g + '"]') || {}).textContent || ''
    };
  }
  out._nota = (document.getElementById('alboNota') || {}).textContent || '';
  out._link = [...document.querySelectorAll('a.gioco')].map(a => a.getAttribute('href'));
  return out;
}, NOMI);

(async () => {
  const b = await chromium.launch();

  console.log('\n— tutto in piedi —');
  {
    const { p, chiamate, errori } = await apri(b);
    const r = await leggi(p);
    const perGioco = GIOCHI.map(g => chiamate.filter(u => u.includes('gioco=eq.' + g)).length);
    esito('una richiesta per ciascun gioco', perGioco.every(n => n === 1), perGioco);
    esito('ogni richiesta ha il suo limite', chiamate.filter(u => /gioco=eq\./.test(u)).every(u => /limit=5/.test(u)));
    esito('i pareggi si sciolgono su un campo temporale',
          chiamate.filter(u => /gioco=eq\./.test(u)).every(u => /order=score\.desc%2Cday\.asc|order=score\.desc,day\.asc/.test(decodeURIComponent(u))));
    esito('cinque righe per gioco', GIOCHI.every(g => r[g].quante === 5), GIOCHI.map(g => r[g].quante));
    esito('nessun nickname ripetuto', GIOCHI.every(g => new Set(r[g].nomi).size === r[g].nomi.length));
    esito('il record compare sulla scheda', GIOCHI.every(g => /Record/.test(r[g].badge)));
    esito('nessun errore in console', errori.length === 0, errori.slice(0, 2));
    await p.close();
  }

  console.log('\n— una cade, le altre no —');
  {
    const { p } = await apri(b, { caduti: ['refusi'] });
    const r = await leggi(p);
    esito('Refusi dice che non risponde', r.refusi.errore, r.refusi.nomi);
    esito('gli altri tre restano pieni',
          ['baseline', 'leporello', 'tiratura'].every(g => r[g].quante === 5 && !r[g].errore));
    esito('la nota lo dice senza allarmare', /non ha risposto/.test(r._nota), r._nota);
    await p.close();
  }

  console.log('\n— uno e\' semplicemente vuoto —');
  {
    const { p } = await apri(b, { vuoti: ['leporello'] });
    const r = await leggi(p);
    esito('Leporello invita, non si scusa', r.leporello.vuoto && !r.leporello.errore, r.leporello.nomi);
    esito('la sua scheda propone il primo record', /mettici il tuo/.test(r.leporello.badge), r.leporello.badge);
    await p.close();
  }

  console.log('\n— tutte e quattro a terra: si gioca lo stesso —');
  {
    const { p, errori } = await apri(b, { caduti: GIOCHI, riepilogoCade: true });
    const r = await leggi(p);
    esito('ogni colonna spiega il guasto', GIOCHI.every(g => r[g].errore));
    esito('la nota resta comprensibile', /non raggiungibile/.test(r._nota), r._nota);
    esito('i quattro giochi restano raggiungibili',
          r._link.length === 4 && r._link.every(h => /^(baseline|refusi|leporello|tiratura)\/$/.test(h)), r._link);
    esito('nessun errore in console', errori.length === 0, errori.slice(0, 2));
    await p.close();
  }

  await b.close();
  console.log(falliti ? '\n' + falliti + ' controlli falliti' : '\nTutto a posto.');
  process.exit(falliti ? 1 : 0);
})();
