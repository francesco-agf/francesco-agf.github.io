/* Si gioca al primo tocco, si firma alla fine.

   Chiedere il nome **prima** era il punto in cui si perdeva chi arriva da un
   link: dieci secondi di curiosità, e la prima cosa che gli chiedi è di
   scrivere qualcosa. Adesso non si chiede più niente all'ingresso — il nome si
   firma sulla scheda del punteggio, quando c'è un motivo per metterlo — e chi
   ce l'ha già si vede riconosciuto in una riga, con la possibilità di
   cambiarlo.

   Questa prova gira su tutti e quattro i giochi, in due condizioni: senza nome
   salvato e con il nome salvato.

   Dalla cartella sala/sorgente/: `node prova-firma.js`.
*/
const { chromium } = require('playwright');
const path = require('path');
const R = path.resolve(__dirname, '..', '..');
const GIOCHI = ['baseline','refusi','leporello','tiratura'];
let ko = 0;
const ok = (n,c,e)=>{ if(!c) ko++; console.log((c?'  ok  ':'  KO  ')+n+(e!==undefined?'  '+JSON.stringify(e):'')); };
(async () => {
  const b = await chromium.launch();
  for (const g of GIOCHI){
    // 1 · senza nome salvato si gioca lo stesso
    const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
    const err = [];
    p.on('pageerror', e => err.push(e.message));
    p.on('console', m => { if (m.type()==='error' && !/ERR_|fonts\.g/.test(m.text())) err.push(m.text().slice(0,90)); });
    const inviati = [];
    await p.route('**/rest/v1/**', async route => {
      if (route.request().method() === 'POST'){ inviati.push(JSON.parse(route.request().postData())); return route.fulfill({status:201,body:''}); }
      route.fulfill({status:200,contentType:'application/json',body:'[]'});
    });
    await p.goto('file://' + path.join(R, g, 'index.html'));
    await p.waitForTimeout(900);
    const r = await p.evaluate(async () => {
      const sn = document.getElementById('startName');
      const fr = document.getElementById('firmaRiga');
      const nascosto = !!sn && sn.hidden;
      const firmaNascosta = !!fr && fr.hidden;
      const sb = document.getElementById('startBtn') || document.getElementById('dailyBtn');
      sb.click();
      await new Promise(r => setTimeout(r, 800));
      const api = window.__baseline || window.__refusi || window.__leporello || window.__tiratura;
      const st = api.stato ? api.stato() : api.state();
      return { nascosto, firmaNascosta, fase: st.fase || st.phase };
    });
    ok((g+' · senza nome il campo non si vede').padEnd(38), r.nascosto && r.firmaNascosta, r);
    ok((g+' · e si gioca lo stesso').padEnd(38), r.fase === 'play', { fase: r.fase });
    // la fine partita chiede la firma
    const f = await p.evaluate(async () => {
      const api = window.__baseline || window.__refusi || window.__leporello || window.__tiratura;
      // si abbandona dalla pausa: e' la fine partita che tutti e quattro hanno
      const pb = document.getElementById('pauseBtn'); if (pb) pb.click();
      await new Promise(r => setTimeout(r, 300));
      const gu = document.getElementById('giveUpBtn'); if (gu) gu.click();
      await new Promise(r => setTimeout(r, 900));
      const s = document.getElementById('signup'), e = document.getElementById('signupEdit');
      return { chiede: !!s && !s.hidden && !!e && !e.hidden,
               msg: (document.getElementById('signupMsg')||{}).textContent };
    });
    ok((g+' · a fine partita chiede la firma').padEnd(38), f.chiede, f);
    ok((g+' · console pulita').padEnd(38), err.length === 0, err.slice(0,2));
    await p.close();

    // 2 · chi ha gia' il nome lo vede in una riga
    const q = await b.newPage({ viewport: { width: 1280, height: 900 } });
    await q.addInitScript(() => { try { localStorage.setItem('agf.giocatore','Francesco'); } catch(e){} });
    await q.route('**/rest/v1/**', r => r.fulfill({status:200,contentType:'application/json',body:'[]'}));
    await q.goto('file://' + path.join(R, g, 'index.html'));
    await q.waitForTimeout(900);
    const s2 = await q.evaluate(() => {
      const fr = document.getElementById('firmaRiga');
      const sn = document.getElementById('startName');
      const cf = document.getElementById('cambiaFirma');
      const visibile = !!fr && !fr.hidden;
      if (cf) cf.click();
      return { visibile, nome: (document.getElementById('firmaNome')||{}).textContent,
               apre: !!sn && !sn.hidden };
    });
    ok((g+' · chi torna si vede riconosciuto').padEnd(38), s2.visibile && s2.nome === 'Francesco', s2);
    ok((g+' · e puo cambiare nome').padEnd(38), s2.apre, { apre: s2.apre });
    await q.close();
  }
  await b.close();
  console.log(ko ? '\n' + ko + ' PROVE FALLITE' : '\ntutto a posto');
  process.exit(ko ? 1 : 0);
})();
