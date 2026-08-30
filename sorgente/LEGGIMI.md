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
node prova-pagina.js      # albo dei record e schede dei giochi
```

Gli screenshot e i file scaricati finiscono in `sorgente/uscita/`, che è ignorata da git.

## Due trappole, imparate a spese nostre

**Il nome prima di giocare.** La partita non parte senza un nome in classifica: ogni prova
deve scrivere `localStorage.setItem('agf.giocatore', 'Collaudo')` con `addInitScript`
prima di caricare la pagina, se no ogni verifica fallisce senza motivo apparente.

**Aspettare un tempo fisso non basta.** Dopo un colpo o una battuta secca il gioco cambia
stato solo quando l'animazione ha finito. Le prove aspettano che lo stato cambi davvero,
non un `setTimeout` a caso: con un'attesa corta si legge ancora la situazione vecchia e
sembrano esserci decine di errori che non esistono.

E se si prova da un browser vero: **una scheda in secondo piano ferma `requestAnimationFrame`**.
Per misurare i movimenti si leggono i valori dichiarati, non lo spostamento reale.
