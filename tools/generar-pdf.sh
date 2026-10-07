#!/usr/bin/env bash
# Genera el PDF de un documento HTML con Edge o Chrome en modo headless (desde WSL o Git Bash en Windows).
#   tools/generar-pdf.sh _docs/src/v1.0.8.html _docs/Lameyer-v1.0.8.pdf
set -euo pipefail
[ $# -eq 2 ] || { echo "uso: $0 <entrada.html> <salida.pdf>" >&2; exit 1; }

for b in "/mnt/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" \
         "/mnt/c/Program Files/Google/Chrome/Application/chrome.exe" \
         "/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"; do
    [ -x "$b" ] && BROWSER="$b" && break
done
[ -n "${BROWSER:-}" ] || { echo "No se encuentra Edge ni Chrome" >&2; exit 1; }

win() { if command -v wslpath >/dev/null; then wslpath -w "$1"; else cygpath -w "$1"; fi; }
IN="$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"
touch "$2"; OUT="$(cd "$(dirname "$2")" && pwd)/$(basename "$2")"

"$BROWSER" --headless=new --disable-gpu --no-pdf-header-footer \
    --print-to-pdf="$(win "$OUT")" "file:///$(win "$IN" | tr '\\' '/')" 2>/dev/null
echo "PDF: $2"
