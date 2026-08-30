# Sala giochi — Arti Grafiche Fimognari

La pagina d'ingresso agli arcade tipografici di **Arti Grafiche Fimognari**, Milano, dal 1950.

https://francesco-agf.github.io/

## I giochi

- **[Baseline](https://francesco-agf.github.io/baseline/)** — il Tetris tipografico. I pezzi
  sono parti anatomiche della lettera; riga piena è riga mandata in stampa.
  Repo: [francesco-agf/baseline](https://github.com/francesco-agf/baseline)
- **[Refusi](https://francesco-agf.github.io/refusi/)** — la correzione di bozze come
  sparatutto. Si spara solo alle lettere del carattere sbagliato.
  Repo: [francesco-agf/refusi](https://github.com/francesco-agf/refusi)

Ogni gioco ha il suo repository, così può avere un giorno il suo sottodominio. Questo repo
serve solo la pagina d'ingresso, che sta alla radice di `francesco-agf.github.io`.

## La classifica

È una sola per tutta la sala. Progetto Supabase dedicato che contiene solo punteggi: la tabella
`scores` ha una colonna `gioco`, e il nome del giocatore è salvato con la stessa chiave in tutti
i giochi (`agf.giocatore`) — chi mette il nome in un gioco se lo ritrova nell'altro.

La pagina legge la vista `sala`, che restituisce il record di ciascun nome per ciascun gioco
senza scaricare tutti i punteggi.

## Tecnica

Un solo file, `index.html`. Le due anteprime animate sulle schede sono canvas: la composizione
di Baseline che si costruisce da sola e la macchina di Refusi che abbatte gli intrusi.
