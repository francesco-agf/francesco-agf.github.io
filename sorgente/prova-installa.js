/* L'icona sulla schermata di casa, e quello che dice ai motori di ricerca.

   Tre cose che non si vedono giocando e che si rompono in silenzio:

   1. il **manifest**: senza, «Aggiungi alla schermata Home» mette una
      scorciatoia che apre il browser con la barra degli indirizzi addosso;
      con, la pagina si apre a schermo pieno come un'applicazione;
   2. le **icone**: devono esistere davvero, essere quadrate della misura
      dichiarata, e — questa è la trappola — **non essere tutte uguali**.
      Cinque icone identiche sulla schermata di casa sono cinque icone che
      nessuno sa distinguere: il monogramma resta lo stesso, ma il punto
      prende il colore del gioco, come il logotipo dentro la pagina;
   3. **robots.txt e sitemap.xml**: le cartelle `sorgente/` sono servite da
      GitHub Pages come tutto il resto, e sono la stessa pagina in forma di
      lavoro. Vanno tenute fuori dall'indice, se no la casa pubblica due
      volte la stessa cosa e i motori scelgono loro quale far vedere.

   Dalla cartella sala/sorgente/: `node prova-installa.js`.
*/
const fs = require('fs');
const path = require('path');

const RADICE = path.resolve(__dirname, '..', '..');
const CASE = {
  sala:      { dir: 'sala',      pref: '/',           punto: '#080B0F' },
  baseline:  { dir: 'baseline',  pref: '/baseline/',  punto: '#2FB0E8' },
  refusi:    { dir: 'refusi',    pref: '/refusi/',    punto: '#EC2288' },
  leporello: { dir: 'leporello', pref: '/leporello/', punto: '#F0B429' },
  tiratura:  { dir: 'tiratura',  pref: '/tiratura/',  punto: '#E8552F' }
};
const ICONE = [
  ['icona-192.png', 192, 'any'],
  ['icona-512.png', 512, 'any'],
  ['icona-maskable-512.png', 512, 'maskable']
];

let falliti = 0;
const esito = (nome, ok, extra) => {
  if (!ok) falliti++;
  console.log((ok ? '  ok  ' : '  KO  ') + nome + (extra !== undefined ? '  ' + JSON.stringify(extra) : ''));
};
const leggi = (...p) => fs.readFileSync(path.join(RADICE, ...p), 'utf8');
const c_e   = (...p) => fs.existsSync(path.join(RADICE, ...p));

/* La misura di un PNG sta nell'IHDR: due interi da quattro byte subito
   dopo la firma. Non serve una libreria per leggerli. */
function misuraPng(file){
  const b = fs.readFileSync(file);
  if (b.length < 24 || b.toString('ascii', 12, 16) !== 'IHDR') return null;
  return [b.readUInt32BE(16), b.readUInt32BE(20)];
}

console.log('\n— il manifest di ogni pagina —');
const manifesti = {};
for (const g in CASE){
  const { dir, pref } = CASE[g];
  const testa = leggi(dir, 'index.html');

  esito(g + ': la pagina dichiara il manifest',
        /<link rel="manifest" href="manifest\.webmanifest">/.test(testa));
  /* iOS non guarda il manifest per andare a schermo pieno: guarda i suoi
     meta. Senza questi, su iPhone l'icona apre Safari con la barra. */
  esito(g + ': e i meta che servono a iOS',
        /name="apple-mobile-web-app-capable" content="yes"/.test(testa) &&
        /name="apple-mobile-web-app-title"/.test(testa));

  if (!c_e(dir, 'manifest.webmanifest')){ esito(g + ': il manifest esiste', false); continue; }

  let m = null;
  try { m = JSON.parse(leggi(dir, 'manifest.webmanifest')); }
  catch (e) { esito(g + ': il manifest è JSON valido', false, e.message); continue; }
  manifesti[g] = m;
  esito(g + ': il manifest è JSON valido', true);

  esito(g + ': si apre a schermo pieno', m.display === 'standalone', m.display);
  esito(g + ': parte dalla sua pagina', m.start_url === pref, m.start_url);
  /* Lo scope è tutta la sala, non il singolo gioco: il ponte fra i giochi
     è parte del gioco, e con lo scope stretto ogni rimando uscirebbe
     dall'applicazione e aprirebbe una scheda del browser. */
  esito(g + ': lo scope tiene dentro tutta la sala', m.scope === '/', m.scope);
  esito(g + ': i colori sono quelli di casa',
        m.theme_color === '#080B0F' && m.background_color === '#080B0F',
        [m.theme_color, m.background_color]);
  esito(g + ': ha nome, nome corto e descrizione',
        !!m.name && !!m.short_name && m.short_name.length <= 12 && !!m.description,
        [m.short_name, (m.name || '').length]);
  esito(g + ': è in italiano', m.lang === 'it', m.lang);

  for (const [file, lato, scopo] of ICONE){
    const voce = (m.icons || []).find(i => i.src === pref + file);
    const su = c_e(dir, file) ? misuraPng(path.join(RADICE, dir, file)) : null;
    esito(g + ': ' + file,
          !!voce && voce.sizes === lato + 'x' + lato && voce.purpose === scopo &&
          !!su && su[0] === lato && su[1] === lato,
          { dichiarata: voce && voce.sizes, vera: su, scopo: voce && voce.purpose });
  }
}

console.log('\n— cinque icone, cinque punti —');
{
  /* Basta il contenuto del file: se due giochi hanno lo stesso byte per byte,
     qualcuno ha copiato l'icona invece di rigenerarla. */
  const impronte = {};
  for (const g in CASE){
    const p = path.join(RADICE, CASE[g].dir, 'icona-192.png');
    impronte[g] = fs.existsSync(p) ? require('crypto').createHash('sha1')
                    .update(fs.readFileSync(p)).digest('hex').slice(0, 12) : null;
  }
  const valori = Object.values(impronte);
  esito('nessuna icona è la copia di un\'altra',
        new Set(valori).size === valori.length && valori.every(Boolean), impronte);
}

console.log('\n— robots.txt —');
{
  if (!c_e('sala', 'robots.txt')) esito('robots.txt esiste', false);
  else {
    const r = leggi('sala', 'robots.txt');
    esito('robots.txt esiste', true);
    esito('le pagine si possono indicizzare', /^Allow:\s*\/\s*$/m.test(r));
    esito('le cartelle sorgente restano fuori',
          ['/sorgente/', '/baseline/sorgente/', '/refusi/sorgente/',
           '/leporello/sorgente/', '/tiratura/sorgente/']
            .every(d => r.includes('Disallow: ' + d)));
    esito('indica la sitemap',
          /^Sitemap:\s*https:\/\/francesco-agf\.github\.io\/sitemap\.xml\s*$/m.test(r));
  }
}

console.log('\n— sitemap.xml —');
{
  if (!c_e('sala', 'sitemap.xml')) esito('sitemap.xml esiste', false);
  else {
    const s = leggi('sala', 'sitemap.xml');
    const loc = [...s.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
    const attese = [
      'https://francesco-agf.github.io/',
      'https://francesco-agf.github.io/baseline/',
      'https://francesco-agf.github.io/refusi/',
      'https://francesco-agf.github.io/leporello/',
      'https://francesco-agf.github.io/tiratura/',
      'https://francesco-agf.github.io/privacy.html'
    ];
    esito('sitemap.xml esiste', true);
    esito('elenca le sei pagine e nient\'altro',
          loc.length === attese.length && attese.every(u => loc.includes(u)), loc);
    esito('ogni voce ha una data',
          [...s.matchAll(/<url>/g)].length === [...s.matchAll(/<lastmod>/g)].length);
    /* Una sitemap che nomina una pagina che non esiste è peggio che non
       averla: si dichiara al motore un indirizzo che risponde 404. */
    esito('e ogni pagina elencata esiste davvero',
          attese.every(u => {
            const coda = u.replace('https://francesco-agf.github.io/', '');
            if (coda === '') return c_e('sala', 'index.html');
            if (coda === 'privacy.html') return c_e('sala', 'privacy.html');
            return c_e(coda.replace(/\/$/, ''), 'index.html');
          }));
  }
}

console.log(falliti ? '\n' + falliti + ' controlli falliti' : '\nTutto a posto.');
process.exit(falliti ? 1 : 0);
