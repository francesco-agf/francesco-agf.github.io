/* I comandi che si insegnano da soli.

   Nessuno legge le regole. Alla prima partita i comandi stanno in campo come
   segni sbiaditi, e ognuno se ne va appena lo usi; alla seconda non compaiono
   più. Questa prova verifica le due cose, su tutti e quattro i giochi.

   Dalla cartella sala/sorgente/: `node prova-guida.js`.
*/
const { chromium } = require('playwright');
const path = require('path');
const R = path.resolve(__dirname, '..', '..');
let ko = 0;
const ok = (n,c,e)=>{ if(!c) ko++; console.log((c?'  ok  ':'  KO  ')+n+(e!==undefined?'  '+JSON.stringify(e):'')); };
(async () => {
  const b = await chromium.launch();
  for (const g of ['baseline','refusi','leporello','tiratura']){
    const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
    const err = [];
    p.on('pageerror', e => err.push(e.message));
    p.on('console', m => { if (m.type()==='error' && !/ERR_|fonts\.g/.test(m.text())) err.push(m.text().slice(0,90)); });
    await p.route('**/rest/v1/**', r => r.fulfill({status:200,contentType:'application/json',body:'[]'}));
    await p.goto('file://' + path.join(R, g, 'index.html'));
    await p.waitForTimeout(900);
    const r = await p.evaluate(async (gioco) => {
      const via = localStorage.getItem('agf.guida.' + gioco);
      const sb = document.getElementById('startBtn') || document.getElementById('dailyBtn');
      sb.click();
      await new Promise(r => setTimeout(r, 500));
      const api = window.__baseline || window.__refusi || window.__leporello || window.__tiratura;
      return { primaPartita: via === null, accesa: !!api.guida && !!api.guida() };
    }, g);
    ok((g + ' · alla prima partita la guida c\'e\'').padEnd(40), r.primaPartita && r.accesa, r);
    // secondo giro: nessuna guida
    const s = await p.evaluate(async () => {
      const api = window.__baseline || window.__refusi || window.__leporello || window.__tiratura;
      api.spegniGuida();
      const sb = document.getElementById('startBtn') || document.getElementById('dailyBtn');
      const pb = document.getElementById('pauseBtn'); if (pb) pb.click();
      await new Promise(r => setTimeout(r, 250));
      const gu = document.getElementById('giveUpBtn'); if (gu) gu.click();
      await new Promise(r => setTimeout(r, 600));
      sb.click();
      await new Promise(r => setTimeout(r, 500));
      return { accesa: !!api.guida() };
    });
    ok((g + ' · alla seconda non c\'e\' piu\'').padEnd(40), !s.accesa, s);

    /* «Rivedi tutorial»: chi la vuole rivedere non deve svuotare i dati del
       browser. Il tasto dimentica di averla vista e la riaccende. */
    const u = await p.evaluate(async (gioco) => {
      document.getElementById('rivediBtn').click();
      await new Promise(r => setTimeout(r, 200));
      const api = window.__baseline || window.__refusi || window.__leporello || window.__tiratura;
      return { chiave: localStorage.getItem('agf.guida.' + gioco), accesa: !!api.guida() };
    }, g);
    ok((g + ' · «Rivedi tutorial» la rimette').padEnd(40), u.accesa && u.chiave === null, u);

    ok((g + ' · console pulita').padEnd(40), err.length === 0, err.slice(0,2));
    await p.close();
  }
  await b.close();
  console.log(ko ? '\n' + ko + ' PROVE FALLITE' : '\ntutto a posto');
  process.exit(ko ? 1 : 0);
})();
