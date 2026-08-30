# Brief 001 — estratto vincolante

Il testo integrale è `2026-08-30_001_BRIEF_MODIFICHE_AGF_ARCADE_PER_CLAUDE.md`, versione 1.1,
30 agosto 2026, in Google Drive → *Sala Giochi AGF / Documenti e verifiche ChatGPT*
([apri](https://drive.google.com/file/d/1CIUK6H2VH8Gt3IraGS8O8f1sWbFICCdF/view)).

**Quel file è il mandato e fa fede.** Qui sotto ci sono l'indice completo, così sai cosa cercare,
e le parti che vincolano l'esito riportate **alla lettera**, così valgono anche se lavori senza
accesso a Drive. Se una frase di questo estratto sembra in contrasto con l'originale, vale
l'originale.

---

## Indice del documento integrale

**Preambolo** — §1 Mandato · §2 Decisioni di progetto vincolanti (2.1 cosa resta invariato,
2.2 fuori ambito) · §3 Risultato atteso · §4 Metodo di lavoro (4.1 prima di modificare,
4.2 durante l'implementazione, 4.3 pubblicazione)

**Parte A — modifiche globali** — §5 Sala giochi: gerarchia, scelta e testi (5.1 impianto
visivo, 5.2 ingresso consigliato, 5.3 descrizioni brevi, 5.4 difficoltà e durata, 5.5 testi
della classifica, 5.6 linguaggio di condivisione, 5.7 link di servizio) · §6 Nickname, record e
identità (6.1 dialogo, 6.2 natura informale, 6.3 query della homepage, 6.4 invio dei punteggi) ·
§7 Privacy locale · §8 Preferenza audio condivisa · §9 Modello comune della schermata finale ·
§10 Condivisione coerente · §11 Accessibilità trasversale (11.1 modali, 11.2 stato del gioco,
11.3 controlli e leggibilità) · §12 Prestazioni e ciclo di vita (12.1 anteprime homepage,
12.2 giochi) · §13 Hook di debug e sicurezza

**Parte B — per pagina** — §14 Baseline (14.1 obiettivo, 14.2 terminologia, 14.3 primo accesso a
due livelli, 14.4 comandi mobile, 14.5 testi da correggere, 14.6 fine partita, 14.7 attività
successiva) · §15 Refusi (15.1 obiettivo, 15.2 onboarding, 15.3 condivisione, 15.4 fine partita,
15.5 foglio di correzione) · §16 Leporello (16.1 obiettivo, 16.2 onboarding, 16.3 legenda
visiva, 16.4 valorizzare il risultato, 16.5 fine partita) · §17 Tiratura (17.1 obiettivo,
17.2 tutorial contestuale, 17.3 fine partita)

**Parte C — priorità** — §18 P0 · §19 P1 · §20 P2

**Parte D — test** — §21 Matrice minima (21.1 browser e dispositivi, 21.2 flusso per gioco,
21.3–21.6 test specifici) · §22 Criteri di accettazione globali · §23 Criteri di stop

**Parte E — consegna** — §24 Output finali · §25 Registro per fasi · §26 Definizione di
completato

---

## §2.2 — Fuori ambito, alla lettera

> Non realizzare, predisporre o menzionare nell'interfaccia:
>
> - coupon, buoni sconto o premi;
> - concorsi o classifiche a premi;
> - vincitori mensili;
> - regolamenti promozionali;
> - DNS o dominio personalizzato;
> - redirect, link o call to action verso il dominio principale AGF;
> - collegamenti al sito commerciale;
> - integrazioni con il preventivatore o con lo stato della richiesta di preventivo;
> - sistemi che promettano vantaggi SEO legati al tempo trascorso nei giochi;
> - dipendenze da `localhost`, indirizzi di rete privata, file presenti sul Mac o processi
>   avviati manualmente su un computer.
>
> Le classifiche devono restare **informali, ricreative e senza premi**.

Evitare sempre `classifica ufficiale`, `vincitore`, `premio`, `campione del mese` o
formulazioni che facciano pensare a una graduatoria verificata (§5.5).

## §2.1 — Cosa resta invariato, alla lettera

> - Hosting e URL GitHub Pages correnti.
> - Funzionamento completamente online e autonomo tramite GitHub Pages e servizi remoti già
>   presenti: nessun Mac, server locale o processo sempre acceso deve essere necessario.
> - Identità editoriale e arcade del progetto.
> - Palette, tipografie, atmosfera, illustrazioni e animazioni, salvo correzioni mirate di
>   leggibilità o prestazioni.
> - Meccaniche fondamentali dei quattro giochi.
> - Personalità distinta di ogni gioco.
> - Classifiche separate per gioco e record locali.
> - Artefatti scaricabili già presenti: prova di stampa, pieghevole, bolla di consegna e altri
>   output di fine partita.
> - Architettura statica attuale: non introdurre framework o build system nuovi senza una
>   necessità reale e documentata.

## §23 — Criteri di stop, alla lettera

> Fermati e chiedi indicazioni prima di procedere se una modifica richiede:
>
> - perdita, trasformazione o cancellazione di dati Supabase;
> - variazioni incompatibili con record o classifiche esistenti;
> - modifica sostanziale delle regole o del bilanciamento;
> - rimozione di funzionalità non richiesta;
> - un servizio esterno a pagamento;
> - credenziali o autorizzazioni non già configurate;
> - una migrazione dello stack o del framework;
> - cambiamenti a dominio, DNS o piattaforma di hosting; il normale deploy sulla GitHub Pages
>   esistente è invece parte obbligatoria della consegna;
> - invenzione di dati legali, contatti o policy di conservazione.

## §22 — Criteri di accettazione globali, alla lettera

> - [ ] La sala e i quattro giochi mantengono identità visiva e meccaniche correnti.
> - [ ] Non esistono coupon, premi, concorsi o vincitori mensili.
> - [ ] Non esistono link, redirect o CTA verso il dominio principale AGF.
> - [ ] Canonical, Open Graph e condivisioni restano sugli URL GitHub Pages correnti.
> - [ ] `Tetris` non compare in nessuna stringa pubblica di Baseline.
> - [ ] Il testo di condivisione di Refusi descrive il gameplay attuale.
> - [ ] `Un unico nickname, quattro classifiche` è coerente con l'interfaccia.
> - [ ] La classifica è descritta come informale e senza premi.
> - [ ] Ogni gioco è avviabile senza leggere il manuale lungo.
> - [ ] I controlli essenziali sono visibili e comprensibili su mobile.
> - [ ] Nickname e preferenza audio persistono correttamente tra i quattro giochi.
> - [ ] Audio disattivato al primo accesso.
> - [ ] Le modali gestiscono focus, Escape e ritorno del focus.
> - [ ] Tutti i controlli hanno focus visibile e target touch adeguati.
> - [ ] `prefers-reduced-motion` è rispettato.
> - [ ] Le classifiche della homepage sono caricate per gioco.
> - [ ] Lo stesso nickname compare una sola volta per gioco, con il proprio miglior punteggio.
> - [ ] L'errore di una classifica non impedisce alle altre tre di essere mostrate.
> - [ ] Stato vuoto, timeout ed errore Supabase non bloccano la navigazione o il gioco.
> - [ ] Ogni partita produce al massimo un invio di punteggio.
> - [ ] Non sono state cancellate o alterate righe storiche della classifica.
> - [ ] Nessuna chiave privilegiata compare nel frontend.
> - [ ] Gli hook di debug non sono disponibili nella versione pubblicabile.
> - [ ] Web Share e copia mostrano successo soltanto quando appropriato.
> - [ ] Nessun artefatto viene scaricato automaticamente.
> - [ ] Dieci replay consecutivi non duplicano listener, timer, RAF, audio o invii.
> - [ ] Le animazioni homepage si fermano fuori viewport e a scheda nascosta.
> - [ ] Non ci sono errori JavaScript nei flussi principali.
> - [ ] La pagina privacy descrive soltanto comportamenti realmente verificati.
> - [ ] La pagina privacy è stata validata internamente ed è presente prima di qualsiasi
>       pubblicazione.
> - [ ] Il sito resta utilizzabile a 320 px e con zoom browser.
> - [ ] Nessuna funzione pubblica dipende da richieste, asset o dati provenienti da
>       `localhost`, IP privati, `file://` o percorsi del Mac.
> - [ ] Il deploy GitHub Pages si è concluso correttamente.
> - [ ] Sala giochi e quattro giochi sono stati verificati sui rispettivi URL pubblici.
> - [ ] Il sito e la classifica funzionano da telefono su rete cellulare, indipendentemente dal
>       Mac e dalla rete locale.

## §4.3 — Pubblicazione, alla lettera

> L'ambiente locale o di anteprima serve esclusivamente per collaudare le modifiche prima del
> rilascio. La consegna finale deve essere pubblicata sugli URL GitHub Pages esistenti e
> funzionare 24 ore su 24 anche con il Mac di Francesco spento.
>
> Dopo aver completato P0, P1 e i test obbligatori:
>
> 1. identifica il meccanismo di pubblicazione già usato dal repository: branch configurato,
>    cartella `/docs`, `gh-pages` oppure GitHub Actions;
> 2. conserva tale meccanismo senza cambiare piattaforma di hosting;
> 3. esegui commit e push delle modifiche sul repository corretto;
> 4. attendi il completamento del deploy GitHub Pages e controlla l'esito dell'eventuale
>    workflow;
> 5. verifica dal vivo la sala e tutti e quattro i giochi agli URL indicati nel §1;
> 6. ripeti il controllo da browser anonimo e da telefono tramite rete cellulare, non collegato
>    alla stessa rete del Mac;
> 7. verifica che HTML, JavaScript, CSS, font, immagini, audio, download e classifica arrivino
>    esclusivamente da risorse online raggiungibili;
> 8. controlla che il codice pubblicato non carichi asset, dati o API da `localhost`,
>    `127.0.0.1`, IP privati, percorsi `file://` o percorsi assoluti del computer di sviluppo.
>    Una stringa usata unicamente per disabilitare strumenti di debug fuori dall'ambiente locale
>    non costituisce una dipendenza.
>
> Se il push o il deploy non sono autorizzati dalle credenziali già disponibili, non simulare la
> pubblicazione: restituisci il commit pronto, l'errore preciso e l'unica azione necessaria per
> sbloccarla.

*(Il punto 1 è già stato accertato: branch `main`, cartella radice, workflow automatico
`pages build and deployment`. Vedi `PASSAGGIO.md` §1.)*

## §18 — P0, alla lettera

> 1. Applicare i vincoli di fuori ambito e verificare che non esistano coupon, premi, concorsi,
>    CTA o link al dominio principale.
> 2. Correggere tutti i testi incoerenti: rimozione di `Tetris` da Baseline; condivisione
>    aggiornata di Refusi; testi corretti della classifica in homepage; `Sfida un collega` al
>    posto di `Invita gli amici`; bonus guida di Baseline descritto correttamente.
> 3. Implementare scelta nickname, microcopy privacy e compatibilità della persistenza.
> 4. Dividere il caricamento homepage in classifiche per gioco.
> 5. Rimuovere o confinare localmente gli hook globali di debug.
> 6. Impostare audio inizialmente disattivato e preferenza condivisa.
> 7. Implementare onboarding breve e comandi touch espliciti per tutti i giochi.
> 8. Rendere accessibili dialoghi, focus, controlli e stati principali.
> 9. Gestire rete lenta/assente senza bloccare il gioco.
> 10. Eseguire test reali desktop e mobile e correggere i bug bloccanti.

## §21.1 — La clausola che blocca la pubblicazione, alla lettera

> Cowork deve completare browser ed emulazione disponibili. Prima di qualunque pubblicazione è
> inoltre obbligatoria una verifica umana su almeno un dispositivo iOS/iPadOS e uno Android; se
> i dispositivi non sono disponibili durante lo sviluppo, registrare esplicitamente questi due
> test come aperti e bloccare la pubblicazione.

*(Vedi `PASSAGGIO.md` §5.2: questa clausola confligge con l'istruzione data a voce il 30.08
sera — «pubblica e verifica gli URL pubblici». La scelta spetta a Francesco.)*

## §7 — Privacy, la parte che blocca

> Non inventare dettagli legali, indirizzi email o tempi di conservazione. Riusa un contatto già
> autorizzato e presente nel repository; se non esiste, lascia la pagina non pubblicabile e
> chiedi a Francesco il contatto corretto. Segnala che il testo richiede validazione interna
> prima della pubblicazione.

*(Nel repository non c'è nessun contatto. Vedi `PASSAGGIO.md` §5.1.)*

## §26 — Definizione di completato, alla lettera

> Il lavoro non è completato quando il codice "sembra funzionare" su desktop. È completato
> quando:
>
> - i P0 sono implementati e verificati;
> - i P1 sono implementati oppure ogni eccezione è motivata e approvata;
> - tutti i criteri di accettazione applicabili sono spuntati con evidenza;
> - non ci sono regressioni nei quattro gameplay;
> - il deploy GitHub Pages è completato senza errori;
> - la versione online è stata verificata da una connessione esterna alla rete locale;
> - il funzionamento non richiede che il Mac di Francesco sia acceso.
