const { chromium } = require('playwright');
const path = require('path');
// la pagina da provare è l'index.html rigenerato da sorgente/build.py
const USCITA = path.resolve(__dirname, 'uscita');
require('fs').mkdirSync(USCITA, { recursive: true });
const PAGINA = 'file://' + path.resolve(__dirname, '..', 'index.html');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1180, height: 1400 } });
  const errors = [];
  p.on('pageerror', e => errors.push(e.message));
  p.on('console', m => { if (m.type()==='error' && !/ERR_|fonts.g/.test(m.text())) errors.push(m.text()); });
  await p.route('**/rest/v1/**', route => route.fulfill({ status:200, contentType:'application/json',
    body: JSON.stringify([
      {gioco:'baseline', nome:'Proto',      score:24500, day:20260829},
      {gioco:'baseline', nome:'Francesco',  score:12800, day:20260830},
      {gioco:'baseline', nome:'Anna',       score:8100,  day:20260828},
      {gioco:'refusi',   nome:'Francesco',  score:9400,  day:20260830},
      {gioco:'refusi',   nome:'Bodoni',     score:6200,  day:20260830}
    ])}));
  await p.goto(PAGINA);
  await p.waitForTimeout(2500);
  const st = await p.evaluate(() => ({
    baseline: [...document.querySelectorAll('#alboBaseline li')].map(l=>l.textContent),
    refusi: [...document.querySelectorAll('#alboRefusi li')].map(l=>l.textContent),
    nota: document.getElementById('alboNota').textContent,
    record: [...document.querySelectorAll('[data-record]')].map(e=>e.textContent),
    link: [...document.querySelectorAll('a.gioco')].map(a=>a.getAttribute('href'))
  }));
  console.log(JSON.stringify(st, null, 1));
  await p.screenshot({ path: path.join(USCITA, 'sala-desktop.png'), fullPage: true });
  const m = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true });
  await m.route('**/rest/v1/**', route => route.fulfill({ status:200, contentType:'application/json', body: '[]' }));
  await m.goto(PAGINA);
  await m.waitForTimeout(2000);
  await m.screenshot({ path: path.join(USCITA, 'sala-mobile.png'), fullPage: true });
  console.log('errori:', errors.length ? errors : 'nessuno');
  await b.close();
})();
