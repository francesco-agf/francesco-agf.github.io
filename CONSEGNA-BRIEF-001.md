# Consegna del brief 001

**Data:** 31 agosto 2026
**Mandato:** `2026-08-30_001_BRIEF_MODIFICHE_AGF_ARCADE_PER_CLAUDE.md`, v1.1
**Branch di lavoro:** `lavoro/brief-001`, in tutti e cinque i repository, poi mergiato in `main`
**Stato:** pubblicato e verificato sui cinque URL pubblici

---

## 1. Le quattro decisioni

Francesco ha sciolto i quattro punti che il passaggio aveva lasciato aperti:

| Punto | Decisione |
|---|---|
| §5.2 «Gioco consigliato» | **No.** Resta solo la fascia «La tiratura di oggi», che ruota con la data. |
| §6.1 dialogo del nickname all'ingresso | **No.** Resta il flusso attuale: si gioca subito, si firma alla fine. La sostanza di §6.1 (microtesto, limiti, errore vicino al campo) è stata portata **dentro** quel flusso. |
| §7 pagina privacy | **Sì ai dati veri.** La pagina è pubblicata con il contatto reale, i fornitori tecnici accertati e i comportamenti verificati nel codice. |
| §21.1 prove umane prima della pubblicazione | **No.** Si è pubblicato; le due prove su dispositivo restano **aperte** (§6). |

---

## 2. Che cosa è cambiato, sala per sala e titolo per titolo

### La sala giochi

- **Quattro classifiche, quattro richieste.** Prima l'albo era una sola query da 300 righe
  ordinata per punteggio: bastava una manciata di partite a Baseline per riempire l'elenco.
  Adesso ogni gioco chiede la sua, con `gioco=eq.<nome>`, `limit=5` e pareggi sciolti su
  `day`. Ogni colonna ha il suo stato di caricamento, vuoto ed errore: se cade Refusi restano
  in piedi gli altri tre, e se cadono tutte e quattro si entra comunque nei giochi.
  *(La vista remota `sala` restituisce già una riga sola per gioco e nickname, quindi il
  limite si chiede al server senza rischio di top N sbagliata. Nessuna modifica a Supabase.)*
- **Testi della classifica** (§5.5): «Un unico nickname, quattro classifiche», «per ogni
  nickname resta il miglior risultato», «N giocatori hanno lasciato il segno · M hanno
  provato più di un gioco» — i numeri restano dinamici.
- **Schede accorciate** (§5.3) con i testi del brief; per Leporello «ogni **sei** facciate»,
  perché la segnatura è stata accorciata il 30.08.
- **Difficoltà e durata** (§5.4) su ogni scheda. La durata è **qualitativa** — «Partita
  rapida», «Durata libera» — perché nel database non c'è la durata delle partite e mettere
  «2–5 min» senza averli misurati sarebbe un numero inventato.
- **Il nickname non diventa più markup.** Il record di ogni gioco si componeva con
  `innerHTML`: era l'unico punto in tutto il progetto dove un nome con delle parentesi
  angolari poteva diventare codice. Adesso si compone con nodi veri.
- Collegamento alla **privacy** nel piede.

### Baseline

- **Via «Tetris»** da titolo, sottotitolo, metadati, Open Graph, testi di condivisione e
  README: adesso è *«il puzzle tipografico»*.
- **`anteprima.jpg` rifatta**: le parole «il tetris tipografico» erano *disegnate dentro*
  l'immagine 1200×630 che compare quando si condivide il link. Ricomposta con il carattere
  di casa e ripubblicata.
- §14.5: «Chiuderla su una guida **vale il doppio**» → «**dà un bonus di allineamento**»,
  che è quello che fa davvero.

### Refusi

- §15.3: sparita la vecchia regola sbagliata («spara solo alle lettere del carattere
  sbagliato»). Il testo di condivisione adesso descrive il gioco che c'è.

### Leporello

- «otto facciate» → «sei facciate» ovunque, metadati compresi.

### Tiratura

- Il testo di condivisione porta i metri veri.

### Tutti e quattro

- **Audio spento al primo accesso**, con preferenza condivisa `agf.audio.enabled`: chiave
  assente = silenzio, e la scelta fatta in un gioco vale negli altri tre.
- **«Sfida un collega»** al posto di «Invita gli amici» (§5.6).
- **«Condividi risultato»**: una sola strategia in tutta la sala — pannello di sistema se
  c'è, appunti se non c'è, testo da selezionare a mano se non c'è neanche quello.
  L'annullamento del pannello non è né un successo né un errore (§10).
- **Nickname** (§6.1): venti caratteri, spazi ai bordi tolti, soli spazi rifiutati,
  parentesi angolari e caratteri di controllo ripuliti, errore accanto al campo con il fuoco
  che ci torna, microtesto sulla classifica pubblica al momento della firma, nota
  «Classifica informale: per ogni nickname conserviamo il miglior risultato».
  Con `localStorage` bloccato si gioca lo stesso.
- **Accessibilità** (§11): `role="dialog"` e `aria-modal` su tutte le finestre, fuoco che
  entra, gira dentro e torna al tasto che l'ha aperta; zona `aria-live` che annuncia avvio,
  pausa, ripresa e fine partita — e non il punteggio a ogni colpo; nome e descrizione dei
  comandi sul campo di gioco; inset `safe-area` per i telefoni con la tacca; **zoom del
  browser riabilitato** (c'era `user-scalable=no`).
- **Ciclo di vita** (§12): la partita va in pausa quando la scheda si nasconde e l'orologio
  riparte da adesso al rientro — una scheda nascosta per mezz'ora non fa più mezz'ora di
  partita in un fotogramma. Nella sala le quattro anteprime girano solo mentre si vedono
  (`IntersectionObserver`) e si fermano tutte a scheda nascosta, con **un solo** ciclo alla
  ripresa.
- **`Rivedi tutorial`** nel piede: cancella il ricordo dei comandi già visti e li rimette.
- **Hook di debug confinati al locale** (§13): `window.__baseline` & c. esistono solo da
  `file://`, `localhost`, `127.0.0.1` o `[::1]`. Sulla versione pubblicata sono `undefined`
  — verificato dal vivo su tutte e cinque le pagine.

### Nuovo

- **`privacy.html`** (§7): che cosa resta nel browser (le chiavi vere, una per una), che
  cosa arriva alla classifica (i campi veri), chi ospita cosa, nessun cookie, per quanto
  tempo, e come far togliere il proprio punteggio. Solo comportamenti verificati nel codice.

---

## 3. File toccati

| Repo | File |
|---|---|
| `baseline` | `README.md`, `index.html`, `anteprima.jpg`, `sorgente/baseline.html`, `sorgente/testa.html` |
| `refusi` | `README.md`, `index.html`, `sorgente/refusi.html`, `sorgente/testa.html` |
| `leporello` | `README.md`, `index.html`, `sorgente/leporello.html`, `sorgente/testa.html`, `sorgente/prova-gioco.js` |
| `tiratura` | `index.html`, `sorgente/tiratura.html`, `sorgente/testa.html`, `sorgente/prova-gioco.js` |
| `francesco-agf.github.io` | `README.md`, `index.html`, **`privacy.html` (nuovo)**, `sorgente/sala.html`, `sorgente/LEGGIMI.md`, `sorgente/prova-guida.js`, e cinque prove nuove |

Prove nuove: `prova-audio.js`, `prova-nickname.js`, `prova-classifiche.js`, `prova-accesso.js`,
`prova-vita.js` — tutte in `francesco-agf.github.io/sorgente/`, tutte girano anche sugli altri
quattro giochi.

---

## 4. Le prove

**32 file di prova, tutti verdi**, girati per intero dopo ogni fase.

| Prova | Che cosa tiene fermo |
|---|---|
| `prova-audio.js` | chiave assente = silenzio; la scelta passa da un gioco all'altro; `localStorage` bloccato non impedisce di giocare |
| `prova-nickname.js` | venti caratteri, ripulitura, errore accanto al campo, il nome non diventa mai markup nella sala |
| `prova-classifiche.js` | quattro richieste separate col loro limite; una che cade non porta giù le altre; stato vuoto ≠ stato rotto |
| `prova-accesso.js` | `aria-modal`, fuoco che entra, gira e torna; zona parlata; nome del campo; zoom non bloccato; safe-area |
| `prova-vita.js` | anteprime ferme fuori vista e a scheda nascosta; **un solo** ciclo alla ripresa; il gioco non salta avanti al rientro; dieci partite di fila non raddoppiano niente |
| le 27 esistenti | nessuna regressione nei quattro gameplay |

Tre prove esistenti sono state aggiornate perché la regola che verificavano è cambiata per
volontà del brief: le due `prova-gioco.js` (cinque link nel piede invece di quattro, per via
della privacy) e `prova-guida.js` (che adesso verifica anche «Rivedi tutorial»).

---

## 5. Pubblicazione e verifica

Cinque branch `lavoro/brief-001`, due commit ciascuno, cinque pull request mergiate in `main`.
GitHub Pages ha pubblicato da `main`, cartella radice, workflow automatico: **cinque deploy,
cinque successi.**

Verificato dal vivo su ogni URL:

- <https://francesco-agf.github.io/> — 200
- <https://francesco-agf.github.io/baseline/> — 200
- <https://francesco-agf.github.io/refusi/> — 200
- <https://francesco-agf.github.io/leporello/> — 200
- <https://francesco-agf.github.io/tiratura/> — 200
- <https://francesco-agf.github.io/privacy.html> — 200

Su ciascuno: nessun errore in console; `window.__baseline`, `__refusi`, `__leporello`,
`__tiratura`, `__disegnaProva`, `__sala`, `__anteprime`, `__tessera` tutti `undefined`;
nessuna occorrenza di «Tetris»; audio spento; collegamento alla privacy presente. Le uniche
risorse che arrivano da fuori sono `fonts.googleapis.com`, `fonts.gstatic.com` e il progetto
Supabase — nessun `localhost`, nessun IP privato, nessun `file://`, niente che dipenda da un
computer acceso da qualche parte.

---

## 6. Che cosa resta aperto

1. **Le due prove umane** che il brief §21.1 pretende — una su iPhone/iPad, una su Android —
   e la prova da telefono su rete cellulare di §4.3.6. Nessuna macchina può farle.
2. **La validazione interna del testo privacy** (§7). Il testo dice solo cose verificate nel
   codice, ma il contatto è l'indirizzo di Francesco: se la casa preferisce un `info@` o
   aggiungere la ragione sociale completa, è una riga da cambiare.
3. **P2 non eseguite**, come previsto dal brief: autohosting dei font, `robots.txt` e
   `sitemap.xml`, `manifest.webmanifest`, la modalità rapida da 90 secondi di Baseline, la
   vista Supabase per il top N (non serve: la vista attuale basta), il rate limiting lato
   server.

---

## 7. Conferme esplicite (§24.11)

- **Nessun coupon, premio o concorso** è stato introdotto: la classifica è descritta come
  informale in ogni punto in cui compare.
- **Nessun collegamento al dominio principale AGF**: i soli link di servizio sono interni
  (sala giochi, i quattro titoli, privacy).
- **DNS e hosting non sono stati toccati**: stessa GitHub Pages, stessi URL, stesso workflow.
- **La versione è pubblicata sulla GitHub Pages esistente** e verificata dal vivo.
- **Il funzionamento non dipende dal Mac di Francesco** né da alcun servizio locale: cinque
  cartelle di file statici e un database remoto già in piedi.
- **Supabase non è stato toccato**: né schema, né policy, né viste, né dati.
