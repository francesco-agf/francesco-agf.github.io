#!/bin/bash
# I tre caratteri di casa, ospitati da noi invece che da Google.
#
# Perché non è già fatto: la sessione che ha scritto questo script non aveva
# uscita di rete — né npm, né PyPI, né i CDN, né fonts.gstatic.com — e i file
# dei caratteri non si possono scrivere a mano. Serve una macchina che possa
# scaricare. Da lì in poi è un comando.
#
# Che cosa scarica: i tre caratteri dell'interfaccia, sottoinsieme latino,
# nella versione woff2 che Google serve a Chrome. Archivo e Bodoni Moda sono
# variabili: un file solo copre tutti i pesi.
#
#   Archivo        variabile        ~35 KB    400 500 600 700
#   Bodoni Moda    variabile        ~46 KB    400 700 900
#   IBM Plex Mono  400, 500, 600    ~10 KB l'uno
#
# Che cosa NON scarica: i caratteri di gioco di Baseline (Zilla Slab, Libre
# Baskerville, Anton) e di Refusi (le otto facce delle passate). Quelli Google
# li serve già ritagliati sulle poche lettere che servono — `&text=` — e
# ospitarli interi vorrebbe dire mettere in pagina mezzo megabyte al posto di
# pochi chilobyte. Restano dove sono: è una scelta, non una dimenticanza.
#
# Risultato: sala, Leporello e Tiratura non chiedono più niente a Google.
# Baseline e Refusi tengono una sola richiesta, quella delle facce di gioco.
#
# Uso:  bash caratteri-in-casa.sh /percorso/della/cartella/che/contiene/i/cinque/repo
#
set -euo pipefail

RADICE="${1:-$(cd "$(dirname "$0")/../.." && pwd)}"
CASE=(francesco-agf.github.io baseline refusi leporello tiratura)

# Gli indirizzi vanno riletti prima di fidarsi: Google cambia il numero di
# versione (v25, v28…) quando aggiorna un carattere, e i vecchi restano in
# piedi ma invecchiano. Per rileggerli, aprire in Chrome
#   https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Bodoni+Moda:opsz,wght@6..96,400;6..96,700;6..96,900&display=swap
# e prendere gli url dei blocchi con unicode-range che comincia per U+0000-00FF.
declare -A FILE=(
  [archivo-variabile.woff2]="https://fonts.gstatic.com/s/archivo/v25/k3kPo8UDI-1M0wlSV9XAw6lQkqWY8Q82sLydOxKsv4Rn.woff2"
  [bodoni-moda-variabile.woff2]="https://fonts.gstatic.com/s/bodonimoda/v28/aFTQ7PxzY382XsXX63LUYJSKSKjWXFBP.woff2"
  [plex-mono-400.woff2]="https://fonts.gstatic.com/s/ibmplexmono/v20/-F63fjptAgt5VM-kVkqdyU8n1i8q131nj-o.woff2"
  [plex-mono-500.woff2]="https://fonts.gstatic.com/s/ibmplexmono/v20/-F6qfjptAgt5VM-kVkqdyU8n3twJwlBFgsAXHNk.woff2"
  [plex-mono-600.woff2]="https://fonts.gstatic.com/s/ibmplexmono/v20/-F6qfjptAgt5VM-kVkqdyU8n3vAOwlBFgsAXHNk.woff2"
)

echo "Radice: $RADICE"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

for f in "${!FILE[@]}"; do
  echo -n "  scarico $f … "
  curl -sSfL -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36" \
       -o "$TMP/$f" "${FILE[$f]}"
  # Un woff2 comincia per 'wOF2'. Se Google avesse risposto con una pagina di
  # errore, il file ci sarebbe lo stesso e nessuno se ne accorgerebbe fino a
  # quando la pagina non esce in Times New Roman.
  head -c 4 "$TMP/$f" | grep -q 'wOF2' || { echo "NON è un woff2"; exit 1; }
  echo "$(wc -c < "$TMP/$f") byte"
done

for casa in "${CASE[@]}"; do
  mkdir -p "$RADICE/$casa/caratteri"
  cp "$TMP"/*.woff2 "$RADICE/$casa/caratteri/"
  echo "  → $casa/caratteri/  (5 file)"
done

cat <<'BLOCCO'

────────────────────────────────────────────────────────────────────────
Fatto. Restano due passaggi a mano, in ognuno dei cinque sorgente/testa.html.

1 · TOGLIERE le due righe del preconnect e la riga del foglio di stile che
    porta ad Archivo, IBM Plex Mono e Bodoni Moda:

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo…">

    In Baseline e Refusi resta la SECONDA riga di fonts.googleapis.com,
    quella con &text=: sono le facce di gioco, e restano lì.

2 · METTERE al loro posto questo blocco, prima del resto dello stile:

<style>
  /* I tre caratteri di casa stanno nel repository: nessuna richiesta esce
     dalla pagina per averli. font-display:swap tiene il testo leggibile
     mentre arrivano. */
  @font-face{font-family:"Archivo";src:url(caratteri/archivo-variabile.woff2) format("woff2-variations"),
             url(caratteri/archivo-variabile.woff2) format("woff2");
             font-weight:100 900;font-style:normal;font-display:swap}
  @font-face{font-family:"Bodoni Moda";src:url(caratteri/bodoni-moda-variabile.woff2) format("woff2-variations"),
             url(caratteri/bodoni-moda-variabile.woff2) format("woff2");
             font-weight:400 900;font-style:normal;font-display:swap}
  @font-face{font-family:"IBM Plex Mono";src:url(caratteri/plex-mono-400.woff2) format("woff2");
             font-weight:400;font-style:normal;font-display:swap}
  @font-face{font-family:"IBM Plex Mono";src:url(caratteri/plex-mono-500.woff2) format("woff2");
             font-weight:500;font-style:normal;font-display:swap}
  @font-face{font-family:"IBM Plex Mono";src:url(caratteri/plex-mono-600.woff2) format("woff2");
             font-weight:600;font-style:normal;font-display:swap}
</style>

3 · Rimontare i cinque index.html:  python3 sorgente/build.py  in ogni repo.

4 · Girare tutte le prove, e in più guardare una pagina dal vivo: nella
    scheda Rete del browser non deve comparire nessun indirizzo di Google
    (tranne le facce di gioco in Baseline e Refusi).

5 · Correggere privacy.html: il paragrafo «Chi ospita la classifica» dice
    che i caratteri arrivano da Google Fonts. Dopo questo lavoro è vero
    solo per Baseline e Refusi, e va scritto così.
────────────────────────────────────────────────────────────────────────
BLOCCO
