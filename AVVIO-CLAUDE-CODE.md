# Come avviare Claude Code sul brief 001

## Il prompt da incollare

> Lavori sulla sala giochi di Arti Grafiche Fimognari: quattro arcade tipografici più una
> pagina d'ingresso, pubblicati su GitHub Pages. Il progetto vive in **cinque repository**
> dell'account `francesco-agf`: `baseline`, `refusi`, `leporello`, `tiratura` e
> `francesco-agf.github.io`.
>
> **Prima di qualunque cosa, leggi in quest'ordine:**
> 1. `PASSAGGIO.md` nel repo `francesco-agf.github.io` — il piano di lavoro, lo stato del
>    progetto, i conflitti aperti e i blocchi;
> 2. `BRIEF-001-ESTRATTO.md` nello stesso repo — le parti vincolanti del mandato;
> 3. `CLAUDE.md` in ciascun repo su cui metti le mani.
>
> Clona i cinque repo come **cartelle sorelle**, con la sala rinominata in `sala`, altrimenti
> le prove non trovano i file:
>
> ```
> git clone https://github.com/francesco-agf/baseline.git   baseline
> git clone https://github.com/francesco-agf/refusi.git     refusi
> git clone https://github.com/francesco-agf/leporello.git  leporello
> git clone https://github.com/francesco-agf/tiratura.git   tiratura
> git clone https://github.com/francesco-agf/francesco-agf.github.io.git sala
> npm i -D playwright && npx playwright install chromium
> ```
>
> Crea il branch `lavoro/brief-001` in **tutti e cinque** i repo e lavora lì.
>
> Procedi per le fasi F0–F12 elencate in `PASSAGGIO.md §3`, una per volta: per ogni fase elenca
> i file toccati, applica le modifiche, rilancia `python3 sorgente/build.py` nei repo
> interessati, esegui le prove pertinenti, controlla console e rete, fai un commit separato.
> Non concentrare tutto in una riscrittura unica.
>
> **Comincia dalla fase F2** (gli hook di debug confinati al locale) **insieme** alla verifica
> che tutte le prove continuino a girare: è l'unica modifica che, fatta male, toglie la
> possibilità di verificare tutto il resto. Il perché sta in `PASSAGGIO.md §4.1`.
>
> **Fermati e chiedimi una decisione** su questi quattro punti, che sono elencati in
> `PASSAGGIO.md §4.4, §4.5, §5.1, §5.2`:
> - il rapporto fra il blocco «Gioco consigliato» del brief e la fascia «La tiratura di oggi»
>   che è già in pagina;
> - se tenere il flusso attuale «si gioca subito, si firma alla fine» oppure tornare al dialogo
>   del nickname all'ingresso come descritto nel brief;
> - il contatto e i dati reali per la pagina privacy, senza i quali non è pubblicabile;
> - se pubblicare prima delle prove umane su iPhone e Android che il brief pretende.
>
> Quando le fasi obbligatorie sono chiuse e le prove sono verdi, **mergia `lavoro/brief-001` in
> `main` in tutti e cinque i repo**: GitHub Pages pubblica da `main`, cartella radice, con il
> workflow automatico `pages build and deployment`. Poi attendi i cinque workflow, verifica che
> siano andati a buon fine, e controlla dal vivo i cinque URL pubblici:
>
> - https://francesco-agf.github.io/
> - https://francesco-agf.github.io/baseline/
> - https://francesco-agf.github.io/refusi/
> - https://francesco-agf.github.io/leporello/
> - https://francesco-agf.github.io/tiratura/
>
> Su ciascuno controlla che non ci siano errori JavaScript, che `window.__baseline`,
> `window.__refusi`, `window.__leporello`, `window.__tiratura` e `window.__disegnaProva` siano
> `undefined`, e che nessuna risorsa arrivi da `localhost`, da un IP privato o da `file://`.
>
> Consegna quello che chiede §24 del brief, con il registro per fasi di §25 compilato davvero.
>
> Tutto — codice, commenti, messaggi di commit, interfaccia — è in italiano, nel vocabolario
> della tipografia. Mantieni quel tono.

## Cosa deve avere il cloud per lavorare

- **accesso in scrittura ai cinque repository** `francesco-agf/*` (push sul branch di lavoro e
  merge in `main`);
- **rete in uscita** verso `github.com`, `api.github.com`, `fonts.googleapis.com`,
  `fonts.gstatic.com` e `piaxtjwgmjuajuuqpftj.supabase.co`;
- **Python 3** e **Node** con Playwright e Chromium.

Non serve nient'altro. Nessun servizio locale, nessun file sul Mac, nessun processo acceso: il
progetto è cinque cartelle di file statici e un database remoto già in piedi.

## Cosa non deve fare

- toccare schema, policy o dati di Supabase;
- cambiare dominio, DNS o piattaforma di hosting;
- pubblicare la pagina privacy senza i dati reali;
- inventare contatti, tempi di conservazione o dettagli legali.
