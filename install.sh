#!/usr/bin/env bash
# One-command installer + local launcher for hollowpoint
#   curl -fsSL https://raw.githubusercontent.com/pranava-mk/hollowpoint/main/install.sh | bash
#
# - Checks for git (asks before installing via apt/pacman/brew if missing)
# - Clones the repo (or reuses an existing checkout)
# - Serves the static site locally (python3 http.server, falling back to `npx serve`)
# - Prints the local URL

set -euo pipefail

REPO_URL="https://github.com/pranava-mk/hollowpoint.git"
REPO_DIR="${HOLLOWPOINT_DIR:-$HOME/Projects/hollowpoint}"
PORT="${PORT:-8000}"

say() { printf '>> %s\n' "$1"; }

ensure_git() {
  if command -v git >/dev/null 2>&1; then
    return 0
  fi

  say "git is not installed, but is required to clone the repo."
  read -r -p "Install git now? [y/N] " reply
  case "$reply" in
    [yY][eE][sS]|[yY]) ;;
    *) echo "git is required. Aborting." >&2; exit 1 ;;
  esac

  if command -v apt-get >/dev/null 2>&1; then
    sudo apt-get update && sudo apt-get install -y git
  elif command -v pacman >/dev/null 2>&1; then
    sudo pacman -Sy --noconfirm git
  elif command -v brew >/dev/null 2>&1; then
    brew install git
  elif command -v dnf >/dev/null 2>&1; then
    sudo dnf install -y git
  else
    echo "Could not detect a supported package manager (apt/pacman/brew/dnf)." >&2
    echo "Please install git manually and re-run this script." >&2
    exit 1
  fi
}

ensure_git

if [ -d "$REPO_DIR/.git" ]; then
  say "Repo already present at $REPO_DIR — using existing checkout."
else
  say "Cloning $REPO_URL into $REPO_DIR ..."
  mkdir -p "$(dirname "$REPO_DIR")"
  git clone "$REPO_URL" "$REPO_DIR"
fi

cd "$REPO_DIR"

say "Starting local static server on port $PORT ..."

start_python_server() {
  if command -v python3 >/dev/null 2>&1; then
    say "Serving with: python3 -m http.server $PORT"
    echo "=================================================="
    echo "  Open: http://localhost:$PORT"
    echo "=================================================="
    exec python3 -m http.server "$PORT"
  fi
  return 1
}

start_npx_server() {
  if command -v npx >/dev/null 2>&1; then
    say "python3 not found — falling back to: npx serve -l $PORT"
    echo "=================================================="
    echo "  Open: http://localhost:$PORT"
    echo "=================================================="
    exec npx --yes serve -l "$PORT" .
  fi
  return 1
}

start_python_server || start_npx_server || {
  echo "Neither python3 nor npx is available to serve the site." >&2
  echo "Install python3 (or Node.js for npx) and re-run." >&2
  exit 1
}
