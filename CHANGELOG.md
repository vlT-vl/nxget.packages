# Changelog

Tutte le implementazioni completate con successo, in ordine cronologico inverso.

## 2026-09-17

- **Aggiunti i manifest macOS-only di Atoll e CodexBar**, verificati contro
  gli asset reali delle rispettive release via `gh api` (nessun nome file
  indovinato, nessuna versione hardcoded nei pattern di match):
  - `atoll`: DMG universale (`Atoll-<versione>.dmg`, release stabile
    `v2.3.3`), unico asset macOS pubblicato.
  - `codexbar`: ZIP universale (`CodexBar-macos-universal-<versione>.zip`,
    release `v0.60.4`), escluso l'asset `.dSYM.zip` accanto ad esso nella
    stessa release.

## 2026-09-16

- **Creazione del progetto**: registro statico e pubblico dei manifest app
  per il catalogo nxget, separato da `nxget-app-portal` per essere
  consumabile allo stesso modo da più client (portale web, futura
  `nxget.cli` in Go). Branch unico `api`, nessuna chiamata a
  `api.github.com`, nessun `GITHUB_TOKEN`: questa repo pubblica solo i
  manifest, non risolve download da GitHub Releases.
- Migrati (copiati byte-identici, nessuna riscrittura) i manifest YAML già
  esistenti in `nxget-app-portal/src/data/apps/*.yaml`, uno per cartella
  sotto `manifests/<id>/<id>.yaml`.
- Aggiunto `scripts/build-index.js`: unico script del repo, legge
  `manifests/*/*.yaml` e scrive `v1/index.json` (id/name/publisher/category
  per app + link raw al manifest completo) — nessuna chiamata di rete.
- Aggiunto `.github/workflows/build.yml`: si attiva solo su `push` con
  modifiche sotto `manifests/**` (più `workflow_dispatch` manuale),
  rigenera e committa `v1/index.json` se cambia qualcosa.
- Aggiunto il logo `nxget-packages.svg` (stesso meccanismo dark/light
  auto-adattivo del logo di `nxget-app-portal`), innestato nel README.
- **Aggiunto il manifest di Bitwarden Desktop**, verificato contro gli
  asset reali della release `desktop-v2026.8.0` via `gh api` (Windows EXE,
  macOS DMG universale, Linux AppImage — nessuna versione hardcoded nei
  pattern di match). Introdotto il campo opzionale `releasePrefix` nello
  schema manifest, per i repo monorepo con release taggate per prodotto
  (caso reale: `bitwarden/clients` interleaved tra `desktop-v*`/
  `browser-v*`/`cli-v*`/`web-v*` — nessun consumer lo usa ancora, è
  documentazione per un futuro resolver).
- Repo pubblicata su GitHub come `vlT-vl/nxget.packages`, branch di
  default `api`.
