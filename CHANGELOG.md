# Changelog

Le funzionalità principali del registro, in ordine cronologico inverso.

## 2026-10-13

- Aggiunto il manifest di Concat (Windows x64/arm64, macOS Apple Silicon e
  Intel, Linux x64/arm64) — catalogo a 57 app.
- Aggiunti i manifest delle 13 app della suite ArtCraft, ciascuna con il
  proprio repo GitHub: CADCraft, DeckCraft, DesignCraft, EffectCraft,
  FigCraft, FilmCraft, GridCraft, LightCraft, PdfCraft, PhotoCraft,
  SoundCraft, VectorCraft, WordCraft (Windows x64/arm64, macOS universale,
  Linux x64/arm64) — catalogo a 70 app.
- Aggiunti lo script `scripts/build-releases.js` e il workflow `releases.yml`,
  che producono `v1/releases.json`: per ogni app con `repo` GitHub pubblico,
  l'ultima release stabile (non draft né prerelease, rispettando
  `releasePrefix`), i file risolti dalle regole `match` e lo storico delle
  ultime 10 release. Il workflow legge fino a 3 pagine da 100 release, così
  trova la stabile anche quando le più recenti sono solo prerelease (caso
  Thaw). Gira ogni 3 ore, dopo "Update manifests", su push a `manifests/**` e
  a avvio manuale.
- Il file viene aggiornato sul posto: una voce cambia solo se cambia il suo
  contenuto; se non cambia nulla il file non viene riscritto né committato.
  Se GitHub non risponde per un repo, la sua voce resta quella precedente.
  Non tocca mai `manifests/` né `v1/index.json`.
- Nessuna voce per le app senza `repo` (18) e per quelle con repo privato
  (pmxtools-cli, pmxtools-ui), così nessun dato di repo privati finisce nel
  file pubblico. Stato attuale: 50 app nel file su 70 nel catalogo.

## 2026-10-12

- Aggiunto il manifest di RevPDF (Windows x64/arm64, macOS universale,
  Linux x64/arm64) — catalogo a 56 app.
- Aggiunto l'aggiornamento automatico settimanale dei manifest con link
  statici (workflow `update.yml`, ogni domenica alle 03:00 ora italiana): legge la
  versione corrente dalla fonte di ogni app, aggiorna solo le righe
  `version:` e `url:` dopo aver verificato il nuovo link, e controlla che
  tutti i link fissi e le regole `match` funzionino ancora. Le app per cui un
  aggiornamento farebbe perdere versioni di macOS supportate (AppCleaner)
  restano bloccate.
- Tutti i link di download usano ora la versione esatta invece degli alias
  `latest`, dove il vendor li offre: 1Password, Affinity (macOS), ChatGPT,
  Chrome (Linux), Claude (macOS), Claudete, Cogito, Firefox, Microsoft 365
  (macOS) e VS Code; l'aggiornamento automatico riscrive i link a ogni nuova
  versione e rimanda tutto se un link nuovo non è ancora online. Dove il
  vendor non pubblica file versionati (Chrome Windows e macOS, Spotify,
  Claude e Affinity Windows, Microsoft 365 Windows, OnyX, i Flatpak) il
  link resta, dichiarato come eccezione. Aggiunto il formato `MSIXBUNDLE`;
  1Password passa a MSI (x64), MSIXBUNDLE (arm64) e PKG (macOS), Affinity
  macOS e ChatGPT a ZIP.
- Aggiornate le versioni di: 1Password, Affinity, ChatGPT, Chrome, Claude,
  Claudete, Firefox, Krita, Microsoft 365, OnyX (macOS 27), Spotify, VS Code.

## 2026-10-05

- Aggiunti i manifest di: Zen Browser, ONLYOFFICE Desktop Editors, Wisp,
  Purge, Google Chrome, Mozilla Firefox, RVTools — catalogo a 36 app.
- Introdotta la convenzione di preferire il Flatpak ufficiale verificato
  su Flathub come asset Linux, quando disponibile, invece di AppImage/deb
  nativi.
- Aggiunto il campo opzionale `osVersion` per gli asset macOS, per le app
  che pubblicano build diverse per ogni major di macOS invece di un solo
  file compatibile con tutte le versioni supportate. Applicato a OnyX
  (Sonoma, Sequoia, Tahoe, Golden Gate).
- Aggiunto il manifest di Coucou (solo macOS) — catalogo a 37 app.
- Aggiunti i manifest di: Markd, Thaw, Visual Studio Code, Pulse Editor,
  MobaXterm, FreeFlow, Dyad, PI Desktop — catalogo a 45 app.

## 2026-09-21

- Aggiunto lo schema per le app a distribuzione riservata (`access:
  voucher`) e per la licenza mostrabile dal consumer (`license`).
- Aggiunta la convenzione per le app Linux distribuite solo come Flatpak
  (asset `FLATPAK` con riferimento Flathub).
- Aggiunto il campo `version` (con override per singolo asset) per le app
  senza `repo` GitHub da cui risolvere la versione.
- Icone di tutte le app rifatte in alta risoluzione (512×512, sfondo
  trasparente, colori di brand ufficiali).
- Corretti i manifest di Bazaar (versione dinamica dal repo invece che
  statica) e ChatGPT (distribuzione aggiornata).
- Aggiunti i manifest di: Bazaar, Krita, AppCleaner, Mist, Claudete,
  UniGetUI, Tabby, BrewUI, i tre software vlT (SVG Designer Studio,
  pmxtools UI/CLI), 1Password, Spotify, Cogito, anySCP, Microsoft 365 —
  catalogo a 29 app.
- Pubblicazione dell'indice del catalogo resa solo manuale, non più
  automatica a ogni modifica.

## 2026-09-18

- Aggiunto il supporto per app distribuite senza repository GitHub (link
  di download fissi).
- Aggiunti i manifest di: Claude Code, Rectangle, ChatGPT, OnyX, Claude
  desktop — catalogo a 13 app.

## 2026-09-17

- Aggiunti i manifest di Atoll e CodexBar.

## 2026-09-16

- Creazione del registro: fonte pubblica e statica dei manifest delle app
  del catalogo nxget, separata dal portale, consumabile da più client.
- Aggiunto il primo manifest (Bitwarden Desktop) e il supporto ai
  repository monorepo con release per più prodotti (`releasePrefix`).
