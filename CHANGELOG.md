# Changelog

Le funzionalità principali del registro, in ordine cronologico inverso.

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
