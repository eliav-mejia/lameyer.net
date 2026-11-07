#!/bin/sh
# Imprime un documento HTML autocontenido a PDF con Chrome headless.
# Uso:    sh _docs/src/build-pdf.sh <nombre>
# Lee:    _docs/src/<nombre>.html
# Escribe: _docs/<nombre>.pdf
set -e

name="${1:?Uso: sh _docs/src/build-pdf.sh <nombre>}"
dir="$(cd "$(dirname "$0")" && pwd)"
src="$dir/$name.html"
out="$(cd "$dir/.." && pwd)/$name.pdf"
[ -f "$src" ] || { echo "No existe $src" >&2; exit 1; }

chrome=""
for c in "$CHROME" google-chrome chromium chrome \
         "/c/Program Files/Google/Chrome/Application/chrome.exe" \
         "/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" \
         "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"; do
  [ -n "$c" ] || continue
  if command -v "$c" >/dev/null 2>&1 || [ -x "$c" ]; then chrome="$c"; break; fi
done
[ -n "$chrome" ] || { echo "No se encontró Chrome; define CHROME=/ruta/a/chrome" >&2; exit 1; }

# En Windows (Git Bash) Chrome necesita rutas nativas.
if command -v cygpath >/dev/null 2>&1; then
  url="file:///$(cygpath -m "$src")"; pdf="$(cygpath -w "$out")"
else
  url="file://$src"; pdf="$out"
fi

# virtual-time-budget da tiempo a que carguen las Google Fonts (display=block).
"$chrome" --headless=new --disable-gpu --no-pdf-header-footer \
  --virtual-time-budget=15000 --run-all-compositor-stages-before-draw \
  --print-to-pdf="$pdf" "$url"

echo "PDF: $out"
