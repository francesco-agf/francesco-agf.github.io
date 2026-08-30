/* La tiratura del giorno.

   Il motivo per tornare domani: ogni giorno la sequenza è identica per tutti
   fino a mezzanotte, così chi gioca lo stesso giorno si confronta alla pari.
   Baseline ce l'aveva da solo; adesso ce l'hanno tutti e quattro.

   Tutto il caso di un gioco passa da `caso()`: nel giorno è un generatore col
   seme della data, nella partita libera è `Math.random`. La prova gioca due
   volte lo stesso giorno e confronta l'impronta — quello che dipende davvero
   dal caso, non il punteggio, che a inizio partita è zero in tutti e due i
   casi e non proverebbe niente. Poi gioca quattro partite libere e pretende
   che almeno una sia diversa: se no il seme non conta.

   Dalla cartella sala/sorgente/: `node prova-giorno.js`.
*/
const { chromium } = require('playwright');
const path = require('path');
const R = path.resolve(__dirname, '..', '..');
let ko = 0;
const ok = (n,c,e)=>{ if(!c) ko++; console.log((c?'  ok  ':'  KO  ')+n+(e!==undefined?'  '+JSON.stringify(e):'')); };

async function corsa(b, g, modo){
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.addInitScript(() => { try { localStorage.setItem('agf.giocatore','Collaudo'); localStorage.setItem('agf.guida.'+'refusi','1'); } catch(e){} });
  await p.route('**/rest/v1/**', r => r.fulfill({status:200,contentType:'application/json',body:'[]'}));
  await p.goto('file://' + path.join(R, g, 'index.html'));
  await p.waitForTimeout(900);
  const out = await p.evaluate(async (arg) => {
    const modo = arg[1];
    if (modo === 'libera') document.getElementById('freeBtn').click();
    else document.getElementById('startBtn').click();
    await new Promise(r => setTimeout(r, 400));
    const api = window.__refusi || window.__leporello || window.__tiratura;
    // si avanza a mano: cosi' non dipende dai fotogrammi
    if (api.avanza) api.avanza(9000);
    else if (api.passo) for (let i = 0; i < 60; i++) api.passo(1);
    else await new Promise(r => setTimeout(r, 3400));
    return api.impronta();
  }, [g, modo]);
  await p.close();
  return out;
}
(async () => {
  const b = await chromium.launch();
  for (const g of ['refusi','leporello','tiratura']){
    const a1 = await corsa(b, g, 'giorno');
    const a2 = await corsa(b, g, 'giorno');
    ok((g + ' · due partite del giorno sono la stessa').padEnd(46), a1 === a2 && a1.length > 2, { a1, a2 });
    // e la libera dev'essere un'altra partita, se no il seme non conta niente
    const libere = [];
    for (let i = 0; i < 4; i++) libere.push(await corsa(b, g, 'libera'));
    ok((g + ' · la libera invece cambia').padEnd(46),
       libere.some(function(x){ return x !== a1; }), { libere });
  }
  await b.close();
  console.log(ko ? '\n' + ko + ' PROVE FALLITE' : '\ntutto a posto');
  process.exit(ko ? 1 : 0);
})();
