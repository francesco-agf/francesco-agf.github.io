# Come si lavora a questo file

Il gioco è **un solo file HTML**, senza dipendenze a parte i caratteri da Google Fonts.
Ma esiste in due forme dello stesso codice, e la differenza conta:

| file | cos'è |
|---|---|
| `sorgente/sala.html` | il **sorgente di lavoro**. Non ha doctype né `<head>`: quando lo si pubblica come artifact su claude.ai è la cornice a metterli. È qui che si modifica. |
| `../index.html` | la versione **autonoma**, quella che GitHub Pages pubblica: testata completa, viewport per il telefono, theme-color, meta per la condivisione. **Generata, non si tocca a mano.** |
| `sorgente/testa.html` | la testata che il build incolla davanti al corpo del sorgente |

## Rigenerare

```sh
python3 sorgente/build.py
```

**Va rilanciato dopo ogni modifica.** I collaudi girano su `index.html`, e le media query
del telefono funzionano solo lì: il sorgente di lavoro non ha il meta viewport, quindi
provandolo direttamente si vede sempre e solo il disegno da scrivania.

## Collaudi

Servono Node e Playwright:

```sh
npm install -D playwright
npx playwright install chromium
```

Poi, dalla cartella `sorgente/`:

```sh
node prova-pagina.js       # albo dei record e schede dei giochi
node prova-classifiche.js  # quattro classifiche, quattro richieste separate
node prova-nickname.js     # limiti e ripulitura del nome
node prova-audio.js        # l'audio parte spento, la scelta vale per tutti
node prova-accesso.js      # finestre, fuoco, zona parlata, zoom, safe-area
node prova-vita.js         # anteprime e cicli che si fermano quando nessuno guarda
```

Le prove che cominciano per `prova-` in questa cartella aprono **anche gli altri
quattro giochi**, che devono stare in cartelle sorelle.

Gli screenshot e i file scaricati finiscono in `sorgente/uscita/`, che è ignorata da git.

## `privacy.html`: l'unica pagina scritta a mano

`../privacy.html` non ha un sorgente separato e non passa da `build.py`: è testo,
non gioco, e la doppia forma non servirebbe a niente. Si modifica direttamente lì.
Contiene solo comportamenti **verificati nel codice** — le chiavi salvate nel
browser, i campi inviati alla classifica, i fornitori tecnici: se si cambia uno di
quelli, va cambiata anche lei.

## Due trappole, imparate a spese nostre

**Il nome.** Dal 30.08 la partita parte anche senza nome — si firma alla fine — ma
molte prove si aspettano di trovarne uno gia' salvato: scrivono
`localStorage.setItem('agf.giocatore', 'Collaudo')` con `addInitScript` prima di
caricare la pagina. Toglierlo fa fallire verifiche che con il nome non c'entrano.

**Aspettare un tempo fisso non basta.** Dopo un colpo o una battuta secca il gioco cambia
stato solo quando l'animazione ha finito. Le prove aspettano che lo stato cambi davvero,
non un `setTimeout` a caso: con un'attesa corta si legge ancora la situazione vecchia e
sembrano esserci decine di errori che non esistono.

E se si prova da un browser vero: **una scheda in secondo piano ferma `requestAnimationFrame`**.
Per misurare i movimenti si leggono i valori dichiarati, non lo spostamento reale.
