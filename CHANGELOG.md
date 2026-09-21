# Changelog

Tutte le implementazioni completate con successo, in ordine cronologico inverso.

## 2026-09-21

- **Aggiunti 3 manifest di software vlT**, tutti con categoria
  `vlT Software` (regola fissa per le app first-party): `svg-designer-studio`
  (SVG Designer Studio), `pmxtools-ui` (pmxtools desktop) e `pmxtools-cli`
  (pmxtools client a riga di comando). Sono soggetti a voucher lato
  consumer, quindi nel manifest **non compare nessun link di download**:
  niente `url` di app, niente `url` sugli asset. Il `repo` resta, come per
  ogni altra app, perché il portale ricava da lì ultima versione e storico
  delle release. Restano matrice
  piattaforma/architettura/formato, pattern `match` sui nomi file e
  `releasePrefix` (`ui-`/`cli-`) per distinguere i due prodotti che
  condividono una stessa sorgente di release. Introdotto il campo opzionale
  `access: voucher` (documentato in `readme.md`) e, per la CLI, il formato
  `BIN` (binari nudi senza archivio su macOS/Linux). I pattern `match`
  risolvono esattamente un asset sull'ultima release di ciascun prodotto
  (verificato, nessun link scritto). Icone 512×512 dalle icone applicative
  originali dei progetti. `v1/index.json` rigenerato, 21 app totali.
- **Aggiunto il campo opzionale `license: {name, url}`** ai tre manifest
  vlT (`svg-designer-studio`, `pmxtools-ui`, `pmxtools-cli`), pensato per
  il portale: `url` è il raw del testo della licenza su GitHub
  (`raw.githubusercontent.com/.../HEAD/LICENSE`, `text/plain` con
  `Access-Control-Allow-Origin: *`), da recuperare e mostrare in una
  modale; `name` è il titolo (`Proprietary Source-Available License`).
  Documentato in `readme.md`. Nei manifest vlT restano assenti solo
  `url` d'app e `url` degli asset. `pmxtools-ui` e
  `pmxtools-cli` condividono lo stesso link, verso un unico `LICENSE`
  aggiunto al repo pubblico di release di pmxtools e valido per entrambi i
  prodotti (stessi termini della licenza dei loro repo di sviluppo, più un
  preambolo di ambito). Tutti e tre i link rispondono 200.
- **Aggiunto il manifest `1password`** (Security), nessun repo GitHub, 5
  link statici ufficiali su `downloads.1password.com`, tutti 200:
  Windows x64 (`1PasswordSetup-latest.exe`) e arm64
  (`1PasswordSetup-arm64-latest.exe`), architetture confermate dagli header
  PE; macOS universale (`1Password.zip`, l'installer ufficiale linkato
  dalla pagina download, `lipo`: x86_64 + arm64); Linux x64 e arm64
  (`1password-latest.tar.gz`, `x86_64`/`aarch64`). Icona estratta dal
  bundle `.app` della release 8.12.36. `v1/index.json` rigenerato, 18 app
  totali.
- **Aggiunti 4 nuovi manifest**, ciascuno con la sua icona 512×512
  (`manifests/<id>/<id>.png`) e link verificati prima di scrivere qualsiasi
  cosa (nessun nome file indovinato):
  - `spotify`: nessun repo GitHub, 4 link statici ufficiali su
    `download.scdn.co` (Windows x64 `SpotifySetup.exe`, Windows arm64
    `SpotifyFullSetupARM64.exe`, macOS arm64 `SpotifyARM64.dmg`, macOS
    x64 `Spotify.dmg`), tutti 200; architetture confermate ispezionando
    gli header PE e con `lipo -archs`. Linux omesso: distribuito solo via
    Snap/Flatpak/APT, nessun installer scaricabile.
  - `cogito` (editor Markdown macOS): nessun repo GitHub, un solo link
    statico stabile (`cogito.md/download/latest`, redirect al DMG della
    versione corrente). Solo Apple Silicon (binario `arm64`), macOS 15+,
    beta pubblica.
  - `anyscp` (client SSH/SFTP/S3, `macnev2013/anySCP`, MIT): repo reale,
    4 asset (Windows x64 EXE, macOS arm64/x64 DMG, Linux x64 AppImage), un
    solo match per pattern sull'ultima release `v0.11.1`. Nessuna build
    Windows arm64 né Linux arm64 pubblicata.
  - `microsoft-365` (Office, ex Office 365): due link ufficiali Microsoft
    (`go.microsoft.com/fwlink/?linkid=2264705` per Windows, installer
    online in inglese; `?linkid=525133` per macOS, pacchetto PKG universale
    di circa 2,9 GB, primo asset con `format: PKG`). Nessuna versione
    desktop per Linux. Icona: logo esagonale Microsoft 365 (SVG ufficiale),
    non quella nuova del Copilot, che identifica l'app unificata Copilot e
    non la suite Office.
  - `v1/index.json` rigenerato, 17 app totali.
- **Icone di tutti i manifest rifatte**: ogni app ha ora la sua icona come
  PNG **512×512, sfondo trasparente, colori di brand veritieri**, salvata
  accanto al manifest (`manifests/<id>/<id>.png`); il campo `logo` punta al
  raw URL di quel file. Sostituiti tutti i vecchi riferimenti esterni
  (glifi monocolore `simple-icons`/`dashboard-icons`, favicon DuckDuckGo,
  mirror Wikimedia/`user-images`, un'icona di terze parti per
  `claude-code`). Sorgenti: repo ufficiale dell'app per le app open source
  (Audacity 4, Bitwarden, OBS, KeePassXC, qBittorrent, VSCodium,
  rasterizzando gli SVG a 512×512 dove non esisteva un PNG nativo),
  bundle `.app` della release reale per le app macOS (Atoll, ChatGPT,
  Claude, CodexBar, OnyX, Rectangle). Per `claude-code`, che non ha un
  file icona pubblicato ad alta risoluzione, l'icona ufficiale
  dell'estensione VS Code (disco arancio + spark crema, 266 px) è stata
  ricostruita in vettoriale a partire dal path ufficiale dello spark del
  logo Claude Code, con gli stessi colori.
- **Correzione `arch`** verificata con `lipo -archs` sui binari reali:
  `atoll` e `rectangle` passati da `x64` a `universal` (DMG con slice
  `x86_64` + `arm64`); `chatgpt` passato da `universal` a `arm64` (il
  binario è solo Apple Silicon).
- **Verifica di tutti i 13 manifest** contro le release reali: ogni
  pattern `match` risolve esattamente un asset sull'ultima release stabile
  (con `releasePrefix` dove serve); i link statici di `chatgpt` e `onyx`
  rispondono 200; i tre link `claude.ai/api/desktop/*/redirect` di
  `claude` rispondono 403 a `curl` (challenge Cloudflare) ma sono gli
  stessi pubblicati dalla pagina ufficiale `claude.ai/download`.
- **Workflow GitHub Actions reso solo manuale**: rimosso il trigger
  `push` su `manifests/**`, resta solo `workflow_dispatch`. Nessun commit
  automatico parte più da solo.
- **Rimossi dalla storia** i 3 commit `chore: rebuild index.json` del bot
  `github-actions[bot]` (storia riscritta, contenuto finale invariato).
- Recuperato dalla sessione precedente (commit `fix: high-res transparent
  icons, universal arch, CodexBar Linux build`, mai riportato qui):
  `arch: universal` per Bitwarden/Claude/CodexBar, asset Linux di
  CodexBar (x64/arm64 TARGZ) e link `redirect` ufficiali per `claude`.

## 2026-09-18

- **Aggiunto il campo opzionale `assets[].url`** allo schema manifest, per
  app che non hanno un repo GitHub da cui risolvere le Release (vendor
  proprietari, link di download statici). Alternativo e mutuamente
  esclusivo con `match` sullo stesso asset; quando presente, `repo` a
  livello di app può essere omesso del tutto. Nessuna versione/cronologia
  disponibile per questi asset, essendo per definizione fuori da GitHub
  Releases. Documentato in `readme.md`.
- **Aggiunti 4 nuovi manifest**, verificati via `gh api`/`curl` prima di
  scrivere qualsiasi pattern (nessun nome file o link indovinato):
  - `claude-code`: repo GitHub reale (`anthropics/claude-code`) con
    Release vere, 6 asset (Windows/macOS/Linux × x64/arm64), nessun campo
    `url` statico necessario.
  - `rectangle`: repo GitHub reale (`rxhanson/Rectangle`), un solo asset
    macOS universale (`Rectangle<versione>.dmg`, verificato coerente su
    più release passate).
  - `chatgpt`: **nessun repo GitHub** — client proprietario di OpenAI.
    Pubblicato solo l'asset macOS, un link statico fisso
    (`persistent.oaistatic.com`, verificato 200/universale). Windows non
    ha un installer scaricabile (solo Microsoft Store), quindi omesso.
  - `onyx`: **nessun repo GitHub** — utility proprietaria di Titanium
    Software. Ogni build è legata a una specifica major di macOS (non
    esiste un "ultima versione" universale come per le altre app);
    pubblicata solo la build più recente (macOS 27, Apple Silicon) come
    asset statico, per scelta esplicita dell'utente — i limiti sono
    documentati nel campo `about` del manifest stesso.
- `v1/index.json` rigenerato (12 app), eseguendo `build-index.js` su una
  copia in scratchpad (non sotto OneDrive — regola nota).
- **Modifiche coordinate in `nxget-app-portal`** (stessa sessione, vedi
  changelog di quel repo): `resolveAppDownloads` ora costruisce i download
  direttamente dagli asset con `url` statico prima/indipendentemente dalla
  risoluzione GitHub, e il link di fallback "vedi le release" degenera
  correttamente su "visita il sito" quando `app.repo` è assente.
- **Aggiunto un quinto manifest, `claude`** (Claude desktop, il client
  chat di Anthropic): correzione dell'utente arrivata a lavoro già
  concluso ("per claude intendevo anche l'app desktop") — stesso
  malinteso già corretto per Codex/ChatGPT, ma qui la richiesta finale è
  stata di **tenere entrambi i manifest** (`claude-code` per il CLI,
  `claude` per l'app desktop), non di sostituire l'uno con l'altro.
  **Nessun repo GitHub** (proprietario), 4 asset a link statico verificati
  via `curl` (`downloads.claude.ai/claude-science/latest/{mac-x64,
  mac-arm64}.dmg` + `{windows-x64,windows-arm64}.exe`, tutti 200). Linux
  omesso: la pagina di download rimanda solo a una guida
  (`code.claude.com/docs/en/desktop-linux`), nessun binario diretto.
  `v1/index.json` rigenerato di nuovo, 13 app totali.

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
