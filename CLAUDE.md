# Sala giochi AGF — pagina d'ingresso

Repo `francesco-agf/francesco-agf.github.io` → https://francesco-agf.github.io/
Fa parte di una famiglia di cinque: `baseline`, `refusi`, `leporello`, `tiratura` e questo.

## Prima di toccare qualcosa

Il quaderno di progetto sta su Google Drive, in **Sala Giochi AGF / Quaderno**.
Va letto prima di cominciare — qui ci sono solo dieci righe di promemoria.

| File | Cosa contiene |
|---|---|
| `AGF-come-si-lavora.md` | come si monta, come si prova, come si pubblica |
| `AGF-decisioni.md` | che cosa è stato deciso, e perché |
| `AGF-marchio.md` | bianco su scuro, nero su bianco |
| `AGF-sala.md` | **questo repo**: classifiche, database, ponte, privacy |
| `AGF-baseline.md` · `AGF-refusi.md` · `AGF-leporello.md` · `AGF-tiratura.md` | i quattro giochi |

## Le tre cose da non sbagliare

1. **`index.html` è generato.** Si modifica `sorgente/sala.html`, poi
   `python3 sorgente/build.py`. Le prove girano su `index.html`: senza il montaggio si
   prova la versione vecchia. È la trappola numero uno.
   **Eccezione:** `privacy.html` è mantenuta a mano e non passa dal build.
2. **Si scrive in italiano.** Funzioni, variabili, commenti, messaggi.
3. **Supabase non si tocca** (schema, policy, viste, dati) e **Aruba è in stand-by**.

## Le prove

Le 32 prove Playwright stanno in `sorgente/` qui e in `sorgente/` dei quattro giochi; molte
girano su tutti e cinque i repo, che vanno clonati come cartelle sorelle — questa **deve**
chiamarsi `sala`. Si lanciano con `node prova-<nome>.js` dalla cartella `sorgente/`.
Prima di pubblicare girano tutte.

## Pubblicare

Branch di lavoro → prove → pull request → merge in `main` → GitHub Pages pubblica da sola
dalla radice → si verifica l'URL dal vivo. Dettagli in `AGF-come-si-lavora.md`.
