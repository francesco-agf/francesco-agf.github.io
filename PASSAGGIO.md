# Passaggio a Claude Code — brief 001

**Da:** la sessione Cowork che ha lavorato al progetto fino al 30 agosto 2026, sera
**A:** Claude Code (cloud)
**Brief da attuare:** `2026-08-30_001_BRIEF_MODIFICHE_AGF_ARCADE_PER_CLAUDE.md`, versione 1.1,
in Google Drive → *Sala Giochi AGF / Documenti e verifiche ChatGPT*. **Quel documento è il
mandato**: questo file non lo sostituisce, gli dà il contesto che gli manca e segnala i punti in
cui è già stato superato dai fatti.

---

## 1. Stato del repository al momento del passaggio

Verificato il 30.08.2026 confrontando l'impronta SHA-1 di ogni file locale con l'albero Git
remoto, repo per repo:

| Repo | File | Impronta locale = remota |
|---|---:|---|
| `baseline` | 18 | ✅ `a5d8551b5606626f` |
| `refusi` | 12 | ✅ `e4e0d8be99b632e5` |
| `leporello` | 10 | ✅ `8ae9810700d3d73f` |
| `tiratura` | 11 | ✅ `0f4114349aa0af44` |
| `francesco-agf.github.io` | 19 | ✅ `bf93b836fc5e97df` |

**Non c'è niente di non committato e niente di non pushato.** I cinque URL pubblici rispondono
200 e servono esattamente questo codice. L'ultimo deploy Pages si è concluso con successo alle
22:39 UTC del 30.08.2026.

Non esiste alcuno stadio di build a monte del repository: `sorgente/<gioco>.html` è il sorgente
completo, e `sorgente/build.py` ne genera `index.html`. Tutto quello che serve è nei repo.

### Meccanismo di pubblicazione (accertato, non supposto)

GitHub Pages legge **dal branch `main`, cartella radice**, tramite il workflow automatico
`pages build and deployment` (`dynamic/pages/pages-build-deployment`). Nessuna Action
personalizzata, nessuna cartella `/docs`, nessun `gh-pages`, nessun dominio personalizzato.

**Conseguenza operativa: un branch di lavoro non è pubblicato.** Il ciclo obbligato è

    branch → fasi → collaudo → merge in `main` → attesa del workflow → verifica dell'URL pubblico

### Come mettersi in piedi

Le prove della sala aprono anche gli altri quattro giochi come **cartelle sorelle**, e cercano
la sala sotto il nome `sala`:

```bash
git clone https://github.com/francesco-agf/baseline.git   baseline
git clone https://github.com/francesco-agf/refusi.git     refusi
git clone https://github.com/francesco-agf/leporello.git  leporello
git clone https://github.com/francesco-agf/tiratura.git   tiratura
git clone https://github.com/francesco-agf/francesco-agf.github.io.git sala   # <-- il nome conta
npm i -D playwright && npx playwright install chromium
```

Poi, in ciascun repo: `python3 sorgente/build.py` dopo ogni modifica, e le prove da
`sorgente/`. In ogni repo c'è un `CLAUDE.md` con le sue trappole specifiche.

---

## 2. Il branch, e perché uno solo non basta

Francesco ha chiesto **un branch dedicato**. Il lavoro però attraversa **cinque repository**:
serve lo stesso branch, con lo stesso nome, in tutti e cinque.

    lavoro/brief-001

Un cambiamento di famiglia (un pulsante, una stringa condivisa, il comportamento dell'audio)
tocca cinque repo insieme, e `prova-famiglia-stili.js` fallisce se ne allinei quattro su cinque.
Quindi: **si lavora sui cinque branch in parallelo e si mergia in `main` nello stesso giro**,
non uno oggi e uno domani.

Ordine di merge consigliato, per non lasciare la sala a raccontare giochi che non esistono
ancora: i quattro giochi prima, la sala per ultima.

---

## 3. Le fasi

Le priorità sono quelle del brief (P0 §18, P1 §19, P2 §20). Qui sotto sono raggruppate per
**unità di lavoro coerenti**, perché alcune voci P0 sono un unico intervento su cinque file e
altre sono cinque interventi diversi.

| Fase | Cosa | Repo toccati | Prove da rifare |
|---|---|---|---|
| **F0** | Checkpoint: branch, build pulita, giro completo delle prove esistenti, stato iniziale di console e rete registrato | 5 | tutte |
| **F1** | Testi e ambito: via «Tetris», condivisione di Refusi, testi della classifica, «Sfida un collega», bonus guida di Baseline | 5 | `prova-regole`, `prova-pagina`, `prova-famiglia` |
| **F2** | Hook di debug confinati al locale (vedi §4.1: **da fare insieme alle prove**, o si rompe tutto) | 5 | **tutte** |
| **F3** | Audio spento al primo accesso, preferenza condivisa `agf.audio.enabled` | 4 giochi | nuova prova + `prova-famiglia` |
| **F4** | Nickname: microcopy, lunghezza, normalizzazione, HTML innocuo, errore vicino al campo, `localStorage` non disponibile | 4 giochi + sala | `prova-firma`, `prova-classifica` ×4 |
| **F5** | Classifiche della homepage divise per gioco, con stato di caricamento/vuoto/errore indipendenti | sala | `prova-pagina` + nuova |
| **F6** | Accessibilità: `aria-modal` e trappola del focus sulle modali, zona `aria-live`, nome accessibile del canvas, `safe-area` | 5 | `prova-bersagli` + nuova |
| **F7** | Prestazioni: `IntersectionObserver` sulle anteprime, `visibilitychange`, ricalibrazione del delta alla ripresa, nessun listener doppio dopo dieci replay | 5 | nuova |
| **F8** | Schermate finali sul modello comune e condivisione coerente (Web Share, appunti, campo selezionabile) | 4 giochi | `prova-scheda` + nuova |
| **F9** | Onboarding: i tre passaggi di Refusi e Leporello, il doppio livello di Baseline, i suggerimenti contestuali di Tiratura, `Rivedi tutorial` | 4 giochi | `prova-guida` (da estendere) |
| **F10** | Pagina privacy — **bloccata**, vedi §5 | sala | nuova |
| **F11** | Homepage: `Gioco consigliato`, difficoltà e durata — **decisione aperta**, vedi §4.4 | sala | `prova-pagina` |
| **F12** | QA finale, merge in `main`, verifica dei cinque URL pubblici | 5 | tutte |

Il brief chiede un checkpoint Git per fase: fallo, e tieni i messaggi in italiano come il resto
del progetto.

---

## 4. Dove il brief è stato superato dai fatti — **da leggere prima di scrivere codice**

Il brief è della mattina del 30 agosto. Nel pomeriggio e nella sera dello stesso giorno il
progetto ha ricevuto due passate di lavoro, approvate da Francesco, che toccano gli stessi
punti. Il brief non le conosce. Questi sono i conflitti reali, con una proposta per ciascuno.
**Non risolverli in autonomia dove è scritto «serve una decisione».**

### 4.1 §13 — gli hook di debug e le prove (conflitto tecnico, va risolto per primo)

Il brief chiede giustamente di togliere `window.__baseline`, `window.__refusi`,
`window.__leporello`, `window.__tiratura`, `window.__disegnaProva` dalla versione pubblicata.

**Ma l'intera suite di collaudo — 23 file di prova — pilota i giochi esattamente da lì.**
Toglierli senza altro azzera la capacità di verificare qualunque cosa, compreso il resto di
questo brief.

Proposta, che soddisfa il brief alla lettera e tiene in piedi le prove:

```js
/* Le prove girano da file://, dove location.hostname e' la stringa vuota. */
const IN_LOCALE = location.protocol === 'file:' ||
                  ['localhost', '127.0.0.1', ''].includes(location.hostname);
if (IN_LOCALE) {
  window.__baseline = { /* ... */ };
}
```

Da applicare **nello stesso commit** in tutti e cinque i repo, poi rifare **tutte** le prove:
se una fallisce, è perché quel gioco viene servito da un'origine che la condizione non copre.
Verifica finale obbligatoria: aprire i cinque URL pubblici e controllare che
`window.__baseline` & c. siano `undefined`.

### 4.2 §14.2 — «Tetris» (fatto a metà, e c'è un'immagine da rifare)

Il 30.08 sera l'occhiello di Baseline è stato reso minuscolo — *«il tetris tipografico»* — per
uniformarlo agli altri tre. Il brief chiede invece di **eliminare la parola** e usare
*«il puzzle tipografico»*. Il brief vince: è una questione di marchio, non di stile.

Occorrenze da cambiare: **20 in `baseline/`** (sorgente, `index.html` generato e
`sorgente/testa.html`, che contiene title, description e Open Graph), **2 in ciascuno degli
altri tre** (la scheda del gioco gemello a fine partita), **2 nella sala** (la scheda e
l'intestazione dell'albo).

⚠️ **`baseline/anteprima.jpg` — l'immagine 1200×630 che compare quando si condivide il link —
contiene le parole «il tetris tipografico» disegnate dentro.** Va rifatta, o il link condiviso
continuerà a dire «tetris». Il procedimento è documentato in `claude/collaudo-30-08.md` nel
progetto Claude, sezione *«Come si fanno le anteprime»*: la scheda si compone dentro la pagina
viva, perché i caratteri di casa non si scaricano da un ambiente di lavoro senza rete verso
Google Fonts.

### 4.3 §5.3 — i testi delle schede (uno è già scaduto)

Il testo del brief per Leporello dice *«Ogni otto facciate chiudi una segnatura»*. Il 30.08 sera
il ritmo è stato cambiato: sono **sei**. Usa il testo del brief con la correzione:

> `Mangia gli sfridi, aggiungi facciate e piega il foglio senza strapparlo. Ogni sei facciate chiudi una segnatura.`

Gli altri tre testi del brief vanno bene così come sono.

### 4.4 §5.2 — «Gioco consigliato» e la fascia della tiratura del giorno (decisione aperta)

Il brief chiede un blocco *«Non sai quale scegliere? Inizia da Tiratura»* sopra le schede.
Sopra le schede c'è già, da ieri sera, la fascia **«La tiratura di oggi»**: un gioco messo in
evidenza a rotazione dalla data, che è il meccanismo pensato per far tornare la gente domani.

Due blocchi nello stesso posto che dicono due cose diverse si annullano. Le strade sono:

1. tenere la rotazione e aggiungere il consiglio **dentro** la stessa fascia, come seconda riga
   («*se è la prima volta, comincia da Tiratura*»);
2. tenere solo il consiglio fisso su Tiratura e spostare la rotazione più in basso;
3. tenere solo la rotazione.

**Serve la decisione di Francesco.** La 1 conserva entrambe le funzioni e non aggiunge peso
visivo: è quella che consiglierei, ma non è una scelta da prendere in autonomia.

### 4.5 §6.1 — il dialogo del nickname (il flusso è cambiato ieri sera)

Il brief descrive un dialogo *«Scegli un nickname → Entra in sala»* **prima** di giocare.
Ieri sera Francesco ha approvato il contrario, e il contrario è in produzione: **non si chiede
più niente all'ingresso**, si gioca al primo tocco e si firma il punteggio alla fine, dove c'è
un motivo per metterlo. Chi ha già un nome si vede riconosciuto in una riga con «cambia nome».
È il rimedio al punto di abbandono più grosso che il progetto avesse.

I *risultati attesi* del brief (§3.8 e §3.9) sono soddisfatti dal flusso attuale; la sua
*implementazione* no. Proposta: **tenere il flusso attuale** e portarci dentro tutta la
sostanza di §6.1, che oggi manca:

- il microtesto «Il nickname e il miglior punteggio inviato possono apparire nella classifica
  pubblica. Non usare nome e cognome.» **al momento della firma**;
- massimo 20 caratteri, spazi ai bordi tolti, sequenze di soli spazi rifiutate;
- markup reso innocuo (oggi il nome finisce in `textContent`, ma va verificato ovunque);
- errore vicino al campo;
- se `localStorage` è bloccato, si gioca lo stesso e la preferenza resta in memoria, con un
  avviso discreto;
- la nota «Classifica informale: per ogni nickname conserviamo il miglior risultato.».

Se Francesco preferisce il dialogo all'ingresso, si torna indietro — ma è una scelta sua,
perché contraddice una decisione che ha preso ieri.

### 4.6 §5.5 — «Un unico nickname, quattro classifiche»

Testo giusto e da applicare. Attenzione però: dalla sera del 30.08 esiste anche **il proto della
sala**, una classifica combinata sulla somma delle posizioni per chi ha giocato a tutti e
quattro. Non è una quinta classifica di punteggi e non contraddice la frase, ma va nominata con
prudenza nella pagina privacy e in qualunque testo che spieghi come funzionano le classifiche.

### 4.7 §11 e §12 — cosa manca davvero (verificato, non supposto)

Rilevato sul codice pubblicato:

| Voce | Stato |
|---|---|
| Bersagli 44 × 44 px | ✅ fatto il 30.08, prova `prova-bersagli.js` |
| `:focus-visible` su tutte e cinque le pagine | ✅ fatto, stessa prova |
| `prefers-reduced-motion` | ✅ già rispettato dai quattro giochi |
| `aria-modal` / trappola del focus | ❌ **zero occorrenze** in tutto il progetto |
| zona `aria-live` | ❌ **zero occorrenze** |
| `safe-area` insets | ❌ **zero occorrenze** |
| `IntersectionObserver` | ❌ **zero occorrenze** |
| `visibilitychange` | ❌ **zero occorrenze** |
| audio spento al primo accesso | ❌ è `soundOn = true` in tutti e quattro |
| chiave `service_role` nel frontend | ✅ assente, verificato |

Le prime otto voci sono tutte da fare. Le ultime due sono già a posto.

### 4.8 Cose che il brief chiede e che sono già state fatte ieri

Per non farle due volte: onboarding con i comandi in campo alla prima partita (tutti e quattro,
con memoria in `agf.guida.<gioco>`), 44 px, `:focus-visible`, la bozza corretta di Refusi
(§15.5 — **è già l'artefatto che il brief chiede**, va solo verificata contro la sua lista di
contenuti), il pieghevole di Leporello, la bolla di Tiratura, la mazzetta di Baseline.

---

## 5. I blocchi veri — non aggirabili scrivendo codice

### 5.1 La pagina privacy (§7)

Il brief vieta di inventare contatti, tempi di conservazione o dettagli legali, e dice che senza
un contatto autorizzato **la pagina non è pubblicabile**. Nel repository non c'è nessun indirizzo
di contatto. Servono da Francesco:

1. l'indirizzo a cui si chiede correzione o rimozione di nickname e punteggio;
2. il criterio di conservazione dei dati, se esiste;
3. il via libera a nominare Supabase come fornitore tecnico della classifica;
4. la validazione interna del testo.

Fino ad allora: prepara la pagina, **non collegarla** e **non pubblicarla**.

### 5.2 La prova su dispositivo reale (§21.1)

Il brief pretende, **prima di qualunque pubblicazione**, una verifica umana su almeno un
dispositivo iOS/iPadOS e uno Android, e dice esplicitamente che se non sono disponibili la
pubblicazione va bloccata. Aggiunge (§4.3.6) una prova da telefono su rete cellulare.

Un agente in cloud non può farle. Sono le uniche due cose in tutto il brief che richiedono una
persona con un telefono in mano — e non hanno niente a che vedere con il Mac di Francesco, che
resta correttamente fuori dal percorso di pubblicazione.

C'è una contraddizione da sciogliere, e la scioglie Francesco: il brief dice «non pubblicare
senza le prove su dispositivo», la sua istruzione di oggi dice «pubblica e verifica gli URL
pubblici». Le strade:

- **A** — si pubblica come chiede oggi, e le due prove restano registrate come aperte, da fare
  appena ha un telefono a portata;
- **B** — si arriva fino al merge e ci si ferma lì, aspettando che le faccia lui.

Chiedi quale, e non decidere al posto suo.

### 5.3 Supabase (§13, §23)

Non toccare schema, policy RLS, viste o funzioni del progetto remoto. Se §6.3 dovesse richiedere
una vista o una RPC per il top N per gioco, **prepara la migrazione come file e chiedi
l'approvazione**: non applicarla. La prima soluzione del brief — quattro query indipendenti dal
client — non richiede niente di remoto ed è quella da provare per prima.

---

## 6. Cosa consegnare

Quello che chiede §24 del brief, con due aggiunte che valgono per questo progetto:

- il **registro per fasi** di §25, compilato davvero;
- gli **URL pubblici verificati** dopo il merge in `main`, con l'esito del workflow Pages;
- l'elenco esplicito delle **decisioni lasciate aperte** (§4.4, §4.5, §5.1, §5.2) con lo stato
  in cui le hai lasciate;
- il risultato di **tutte** le prove, prima e dopo, non solo di quelle nuove;
- se `baseline/anteprima.jpg` è stata rifatta, dillo: è l'immagine che la gente vede quando il
  link viene condiviso.

---

## 7. La cosa da non perdere di vista

Il progetto è un pezzo di marketing di una tipografia milanese che stampa dal 1950, e la sua
forza è che **non sembra fatto da un'agenzia**: parla la lingua del mestiere, i quattro giochi
sono quattro modi di raccontare come si stampa davvero, e ogni dettaglio — il fuori registro, la
piegatrice che impazzisce, il refuso che contagia il foglio, la rotativa che ti mangia il
pavimento — viene da qualcosa che in tipografia succede sul serio.

Il brief chiede di ridurre l'attrito dei primi secondi, non di ammorbidire il tono. Le due cose
non sono in conflitto: si può essere immediati restando specifici. Quando un testo va accorciato,
accorcialo tenendo la parola del mestiere e buttando via quella generica.
