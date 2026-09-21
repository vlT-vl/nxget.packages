# Changelog

Tutte le implementazioni completate con successo, in ordine cronologico inverso.

## 2026-09-21

- **`bazaar`: aggiunto il `repo` GitHub `bazaar-org/bazaar`**, che mancava, e
  **rimossa la `version` statica**: con un `repo` la versione e la cronologia
  le ricava il portale dalle Release, non si mescolano dati statici. Regola
  ribadita in `readme.md`: `version` nel manifest **solo** per le app senza
  `repo`, mai per quelle che ce l'hanno, qualunque siano i loro asset.
  Il repo GitHub è archiviato (upstream su GNOME GitLab) e l'ultima release è
  `v0.9.4`, senza asset: l'asset Linux resta il riferimento Flatpak a link
  fisso.
- **`chatgpt` spostato alla distribuzione attuale di OpenAI**: il link
  precedente serviva una build vecchia (`com.openai.chat` 1.2026.183, 9 luglio
  2026), mentre l'app corrente, confermata dalla finestra "Informazioni su
  ChatGPT" (Versione 26.915.31945, 18 settembre 2026), è la `ChatGPT.app`
  `com.openai.codex` distribuita da `codex-app-prod`. Nuovo link stabile
  `persistent.oaistatic.com/codex-app-prod/ChatGPT.dmg` (200, 645 MB),
  verificato sul DMG scaricato: versione 26.915.31945, **solo arm64** (`lipo`),
  macOS 13+; `version` aggiornata a `26.915.31945` (coincide con appcast e cask
  Homebrew) e `arch` da `universal` a `arm64`. Icona rigenerata da quella
  dell'app (nodo in grigio-blu scuro). La build Intel ha solo URL con la versione
  nel nome (`ChatGPT-darwin-x64-<ver>.zip`), quindi non è pubblicata; il testo
  `about` lo dice.
- **Aggiunto il campo `version` alle 11 app senza `repo`** (1password,
  appcleaner, bazaar, chatgpt, claude, claudete, cogito, krita,
  microsoft-365, onyx, spotify), le uniche per cui il consumer non può
  ricavare la versione dalle Release: è la versione servita in questo momento
  dai link fissi, controllata su una fonte autorevole (feed del produttore,
  bundle dell'app, registri di pacchetti), mai stimata. Le app con `repo`
  non hanno il campo. Override opzionale `assets[].version` solo dove la
  versione cambia tra file: `spotify` (Flatpak `1.2.95.453.g0eeebbed`, indietro
  rispetto a `1.3.1.234` di Windows/macOS) e `microsoft-365`, dove Windows
  (`2608 (Build 20326.20158)`) e macOS (`16.113.1`) hanno numerazioni diverse e
  quindi non c'è una versione a livello app. Versioni: 1password 8.12.36,
  appcleaner 3.6.8, bazaar 0.9.6, chatgpt 1.2026.183, claude 2.2553.1
  (Windows x64/arm64 e macOS allineati), claudete 1.1.83, cogito 0.12.3,
  krita 5.3.4, onyx 5.1.0, spotify 1.3.1.234. Documentato in `readme.md`
  (tabelle campi/asset, dettagli, esempio, regole di scrittura); la frase
  "gli asset con `url` non hanno versione" è stata sostituita. Va aggiornata a
  mano a ogni release del produttore, come i link con versione fissa.
- **`readme.md` riscritto e allineato allo stato reale del catalogo**: sezione
  schema rifatta con tre manifest di esempio completi (app pubblica con
  `repo`, app a voucher, app con link fissi incluso il Flatpak), tabella di
  tutti i campi con obbligatorietà, tabella degli asset con i valori
  ammessi (`platform`, `arch` `x64`/`arm64`/`universal`, `format` tra cui i
  nuovi `PKG`, `BIN`, `FLATPAK`), dettagli su logo, `releasePrefix`,
  `license`, `access`, link fissi con versione e Flatpak, e regole di
  scrittura (nessun commento YAML, `description` senza `: `, nessuna versione
  hardcoded nei `match`). Endpoint e schema del flusso aggiornati con
  l'icona. Verificato con uno script una-tantum: i 3 esempi rispettano lo
  schema documentato e tutti i 29 manifest reali lo rispettano (campi,
  valori ammessi, `match` xor `url`, regole `vlT Software`/voucher, logo
  raw corretto, icona 512×512 con alpha, indice allineato).
- **Nuova convenzione per le app Linux distribuite solo come Flatpak**:
  asset `platform: linux`, `arch: universal`, `format: FLATPAK` con `url` =
  riferimento Flathub `https://dl.flathub.org/repo/appstream/<app-id>.flatpakref`
  (file reale, contiene il remote Flathub e la chiave GPG; si apre dal centro
  software o con `flatpak install`, e installa l'architettura della macchina,
  per questo `universal`). Documentata in `readme.md`. Snap non ha un file
  scaricabile equivalente e non viene pubblicato.
- **`spotify` aggiornato con l'asset Linux Flatpak**
  (`com.spotify.Client.flatpakref`, 200) e testo `about` riscritto: prima
  dichiarava Linux non pubblicato.
- **Aggiunto il manifest `bazaar`** (Utility, Bazaar, l'app store per Linux
  focalizzato sui Flatpak, GPL-3.0-or-later): solo Linux, un asset
  `FLATPAK` (`io.github.kolunmi.Bazaar.flatpakref`, 200). Il repo GitHub
  è archiviato e spostato su GNOME GitLab, quindi nel manifest non c'è
  `repo`. Icona 512×512 rasterizzata dall'SVG del repo (Flathub pubblica
  solo 128 px). `v1/index.json` rigenerato, 29 app totali.
- **Aggiunti i manifest `krita`, `appcleaner` e `mist`**:
  - `krita` (Multimedia, Krita Foundation): il repo GitHub `kde/krita` è un
    mirror di sola lettura con tag ma **nessuna release né asset**, quindi
    non serve a risolvere i download; usati i link ufficiali di
    `download.kde.org` della pagina `krita.org/en/download`: Windows x64
    (`setup.exe`), macOS universale (`signed.dmg`, universale secondo il
    sito), Linux x86_64 (AppImage), tutti 200. **Versione fissata nel link
    (5.3.4)**: KDE non offre un alias "latest", quindi il manifest va
    aggiornato a mano a ogni nuova release. Nessuna build Windows arm64 né
    Linux arm64. Icona: branding `default` (release stabile) del repo, 512×512.
  - `appcleaner` (Utility, FreeMacSoft): nessun repo GitHub, un solo link
    statico ufficiale, `AppCleaner_3.6.8.zip` (200; universale, `lipo`: x86_64
    + arm64, macOS 10.14+). **Versione fissata nel link**: il sito non ha un
    alias "latest" (ultimo aggiornamento del file: luglio 2023). Icona dal
    bundle `.app`.
  - `mist` (Utility, Nindi Gill, MIT, `ninxsoft/Mist` `v0.40`): asset DMG
    universale (`lipo`: x86_64 + arm64, macOS 12+), risolto con `match`;
    escluso il `.pkg`. Icona dal bundle `.app`.
  `v1/index.json` rigenerato, 28 app totali. (Spotify era già nel catalogo.)
- **Aggiunto il manifest `claudete`** (Development, Claudete, pannello di
  controllo macOS per flotte di agenti AI per il codice, non affiliato ad
  Anthropic): **nessun repo GitHub** (ricerca fatta, nessun repo
  dell'app), quindi due link statici ufficiali dalla pagina di download,
  `claudete.co/download-apple` (Apple Silicon) e `claudete.co/download-intel`
  (Intel), redirect stabili al DMG dell'ultima versione, entrambi 200;
  architetture confermate con `lipo` (arm64 e x86_64), versione 1.1.83.
  Linux omesso: esiste solo una CLI per server installabile con
  `curl | sh`, senza pacchetto scaricabile con link stabile. Icona 512×512
  estratta dal bundle `.app`. `v1/index.json` rigenerato, 25 app totali.
- **Aggiunto il manifest `unigetui`** (Utility, `Devolutions/UniGetUI`, MIT,
  release `v2026.3.0`), l'interfaccia grafica unica per i gestori di
  pacchetti, ora mantenuta da Devolutions: sei asset, Windows x64/arm64
  (installer EXE), macOS x64/arm64 (DMG), Linux x64/arm64 (TARGZ); esclusi i
  portable `.zip`, i `.deb`/`.rpm`, i `.json`/`checksums`. Ogni pattern
  risolve esattamente un asset. Icona 512×512 nativa del repo
  (`media/icon.png`). `v1/index.json` rigenerato, 24 app totali.
- **Aggiunti i manifest `tabby` e `brewui`**, entrambi con repo GitHub
  reale e pattern `match` che risolvono esattamente un asset sull'ultima
  release stabile (nessuna versione hardcoded):
  - `tabby` (Development, `eugeny/tabby`, MIT, release `v1.0.235`): sei
    asset, Windows x64/arm64 (EXE `setup`), macOS x64/arm64 (DMG), Linux
    x64/arm64 (AppImage); esclusi i `.blockmap`, i `.zip` portable e i
    pacchetti `.deb`/`.rpm`/`.pacman`/`.tar.gz`. La build Linux `armv7l`
    (ARM a 32 bit) è omessa: il campo `arch` del catalogo non ha un valore
    per lei. Icona: quella in stile macOS del repo (`Icon-MacOS`).
  - `brewui` (Utility, `Homebrew/BrewUI`, AGPL-3.0, release `v0.4.3`), l'app
    macOS ufficiale di Homebrew: un solo asset, lo ZIP con `Homebrew.app`
    universale (`lipo`: x86_64 + arm64), lo stesso usato dal cask
    `homebrew-app`; escluso `.dSYMs.zip`; il `.pkg` esiste ma non è
    pubblicato. Richiede macOS 26.2 o successivo (`LSMinimumSystemVersion`).
    Il nome è `BrewUI` (non "Homebrew") per non confonderla con la CLI.
    Icona estratta dal bundle `.app`.
  Icone 512×512 trasparenti; `v1/index.json` rigenerato, 23 app totali.
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
