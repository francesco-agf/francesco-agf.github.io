# AGF Arcade — La sala giochi — pagina d'ingresso

Contesto per Claude Code. Il **brief operativo** in corso e il piano di lavoro stanno in
`PASSAGGIO.md` nel repo della sala (`francesco-agf/francesco-agf.github.io`): leggilo prima di
toccare qualunque cosa.

## Cos'e' questo repo

La pagina d'ingresso ai quattro arcade, e la casa delle prove che valgono per tutta la
famiglia. Contiene le quattro schede con **anteprime animate su canvas**, la fascia della
**tiratura del giorno** (un gioco a rotazione dalla data), **l'albo della sala**, **il proto
della sala** (classifica combinata sulla somma delle posizioni), **la tessera del garzone** da
scaricare, e il blocco che racconta chi e' Arti Grafiche Fimognari.

Fa parte di una **sala di cinque repository** — quattro giochi piu' la pagina d'ingresso — che
si comportano come un prodotto solo:

| Repo | Indirizzo pubblico |
|---|---|
| `francesco-agf/francesco-agf.github.io` | https://francesco-agf.github.io/ |
| `francesco-agf/baseline` | https://francesco-agf.github.io/baseline/ |
| `francesco-agf/refusi` | https://francesco-agf.github.io/refusi/ |
| `francesco-agf/leporello` | https://francesco-agf.github.io/leporello/ |
| `francesco-agf/tiratura` | https://francesco-agf.github.io/tiratura/ |

Repo separati per una ragione precisa: GitHub Pages accetta **un solo dominio personalizzato
per repository**. Gli indirizzi sono gia' stati condivisi e **non cambiano**.

## Le due forme dello stesso codice — la regola che rompe tutto se ignorata

    sorgente/sala.html   il sorgente di lavoro. Non ha doctype ne' <head>.
    index.html        la versione pubblicata, con la testata completa.
                      E' GENERATA: non si modifica a mano.

Si modifica **sempre** `sorgente/sala.html` e poi si rigenera:

    python3 sorgente/build.py

`build.py` incolla `sorgente/testa.html` davanti al corpo del sorgente. Va rilanciato **dopo
ogni modifica**: i collaudi girano su `index.html`, e le media query del telefono funzionano
solo li', perche' il sorgente non ha il meta viewport.

Se modifichi `index.html` a mano, la modifica sparisce alla prossima build. Se modifichi il
sorgente e non ricostruisci, pubblichi la versione vecchia.

## Come si collauda

Servono `playwright` e Chromium. Dalla cartella `sorgente/`:

    node prova-pagina.js           l'albo e i record sulle schede
    node prova-anteprime.js        le anteprime animate
    node prova-tessera.js          il proto della sala e la tessera
    node prova-famiglia.js         quello che deve valere per tutte e cinque le pagine
    node prova-famiglia-stili.js   gli stili dei quattro giochi non devono divergere
    node prova-firma.js            si gioca subito, si firma alla fine
    node prova-guida.js            i comandi in campo alla prima partita
    node prova-giorno.js           la partita del giorno e' la stessa per tutti
    node prova-guasti.js           i quattro guasti di macchina e il sigillo
    node prova-bersagli.js         44 px e messa a fuoco su tutte e cinque le pagine

Le prove aprono `index.html` da `file://` e pilotano il gioco dalle API di collaudo
(`window.__sala`). Non aspettano tempi fissi: chiamano l'avanzamento a mano, perche'
`requestAnimationFrame` si ferma quando la scheda va in secondo piano.

## Pubblicazione

GitHub Pages, **branch `main`, cartella radice**, workflow automatico
`pages build and deployment`. Nessuna Action personalizzata, nessuna cartella `/docs`,
nessun `gh-pages`.

**Un branch di lavoro non e' pubblicato finche' non entra in `main`.** Il ciclo e':
branch -> collaudo -> merge in `main` -> attesa del workflow -> verifica dell'URL pubblico.

## Cose da non rompere

- **La famiglia.** I quattro giochi devono sembrare fatti dalla stessa mano. C'e' una prova
  che lo pretende: `sala/sorgente/prova-famiglia-stili.js` confronta gli stili calcolati dei
  quattro giochi e fallisce se divergono. Se cambi un pulsante qui, cambialo in tutti e quattro.
- **Il nome del giocatore** sta in `localStorage` sotto la chiave condivisa `agf.giocatore`,
  uguale per tutta la sala. La vecchia `baseline.nome` resta letta come ripiego.
- **La classifica** e' la tabella `public.scores` di Supabase, condivisa fra i quattro giochi,
  con la chiave pubblicabile nel client e RLS in sola lettura e inserimento. Non toccare lo
  schema remoto.
- **Gli indirizzi nel codice sono assoluti**, non relativi: i collegamenti fra i giochi
  funzionano anche fuori dal loro sottopercorso.
- **Niente `localhost`, IP privati, `file://` o percorsi del computer** in quello che va
  pubblicato.

## Attenzione, qui — le prove sono per tutta la sala

Otto delle dieci prove di questo repo **aprono anche gli altri quattro giochi**. Cercano i file
come cartelle sorelle di questo repo:

    <cartella di lavoro>/
      baseline/
      refusi/
      leporello/
      tiratura/
      sala/            <-- questo repo, che su GitHub si chiama francesco-agf.github.io

**La cartella di questo repo deve chiamarsi `sala`**, non `francesco-agf.github.io`, o le prove
non trovano niente. Clona cosi':

    git clone https://github.com/francesco-agf/baseline.git   baseline
    git clone https://github.com/francesco-agf/refusi.git     refusi
    git clone https://github.com/francesco-agf/leporello.git  leporello
    git clone https://github.com/francesco-agf/tiratura.git   tiratura
    git clone https://github.com/francesco-agf/francesco-agf.github.io.git sala

## Altre trappole

- Le anteprime sono giochi in miniatura con una regola sciocca al posto del giocatore. Quella
  di Baseline guarda il pezzo in arrivo **e quello dopo**: con una mossa sola la pila arrivava
  in cima e la scheda si svuotava ogni pochi secondi.
- La classifica della homepage legge la vista `public.sala`, non `scores`.
- La sala **non** ha `user-select:none`: e' una pagina da leggere.

## Il tono

Il progetto e' un pezzo di marketing di una tipografia milanese del 1950. Tutto — interfaccia,
regole, commenti nel codice, messaggi di commit — e' in **italiano**, e usa il vocabolario del
mestiere: forma, registro, segnatura, passata, bozza, sigillo, mazzetta. I commenti nel codice
spiegano **perche'** una cosa e' fatta cosi', non cosa fa la riga sotto. Mantieni questo tono.
