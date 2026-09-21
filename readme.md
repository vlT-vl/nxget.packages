<p align="center">
  <img src="nxget-packages.svg" alt="nxget.packages" width="420" />
</p>

<p align="center">
  Static, public registry of app manifests for the nxget catalog<br/>
  <sub>Plain files · No backend · No auth required</sub>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.1.0--R210926-blue?style=flat-square" alt="version"/>
  <img src="https://img.shields.io/badge/api-v1-green?style=flat-square" alt="api-v1"/>
  <img src="https://img.shields.io/badge/format-YAML%20%2B%20JSON-orange?style=flat-square" alt="format"/>
  <img src="https://img.shields.io/badge/license-proprietary-critical?style=flat-square" alt="license"/>
</p>

---

## Overview

**nxget.packages** is the single source of truth for the nxget app catalog: one hand-written YAML manifest per app, committed by hand — never generated or modified by automation.

This repo does **not** call the GitHub Releases API and does not resolve download links for apps that publish real GitHub Releases. It only publishes the catalog itself (id, name, publisher, category, description, bilingual `about`, official site, optional source repo, logo, and per-asset either a matching rule or — for apps with no GitHub repo to resolve against — a fixed download URL). Resolving `match` rules against a live GitHub Release — turning a manifest into an actual download link — is left to each consumer (the `nxget-app-portal` web app today, a future `nxget.cli` in Go later), each running the same logic in its own language/runtime. Assets with a fixed `url` need no resolving at all: the consumer uses the link as published.

```
Consumer ──► https://raw.githubusercontent.com/<owner>/nxget.packages/api
               │
               └── v1/index.json                → discovery entry point: id/name/publisher/category
                     per app, plus a raw link to that app's full manifest
                           │
                           └── manifests/<id>/<id>.yaml   → full manifest (description, about, url,
                                                              repo, logo, assets match rules)
```

---

## Available Endpoints

| Endpoint | Description |
|---|---|
| `/v1/index.json` | Discovery document: every app's id/name/publisher/category plus a raw link to its manifest |
| `/manifests/<id>/<id>.yaml` | Full manifest for a single app |

---

## Manifest schema

```yaml
id: keepassxc
name: KeePassXC
publisher: KeePassXC Team
category: Security
description: A secure, offline, open source password manager.
about:
  it: >-
    Testo italiano, scritto da zero, non tradotto letteralmente.
  en: >-
    English text, written from scratch, not a literal translation.
url: https://keepassxc.org/
repo: https://github.com/keepassxreboot/keepassxc
logo: https://raw.githubusercontent.com/<owner>/nxget.packages/api/manifests/keepassxc/keepassxc.png
assets:
  - platform: windows
    arch: x64
    format: MSI
    match: 'Win64\.msi$'
  - platform: macos
    arch: x64
    format: DMG
    match: 'x86_64\.dmg$'
  - platform: macos
    arch: arm64
    format: DMG
    match: '-arm64\.dmg$'
  - platform: linux
    arch: x64
    format: APPIMAGE
    match: 'x86_64\.AppImage$'
```

`assets[].match` is a regular expression a consumer evaluates against the file names of `repo`'s latest GitHub Release to figure out which asset is which platform/arch/format — no download URL is stored for these.

**Logo (`logo`)**: every manifest ships its own icon as a **512×512 PNG with transparent background and the app's true brand colors**, stored next to the manifest as `manifests/<id>/<id>.png`; `logo` is the raw URL of that file. Icons are taken from the app's own current release or repository (never a mono-color icon-pack glyph, a favicon or a third-party mirror), so they match what the app looks like today. Vector sources are rasterized at 512×512; macOS icons are exported from the released app bundle.

**Optional field `releasePrefix`**: for a `repo` that is a monorepo publishing releases for several products with interleaved tags (e.g. `bitwarden/clients`, tagged `desktop-v*`/`browser-v*`/`cli-v*`/`web-v*`), `releasePrefix` tells a consumer which tag prefix identifies *this* app's releases, instead of just picking the newest non-prerelease release of the whole repo (which could belong to an unrelated product). Omit it for single-product repos.

**Optional field `license`**: `license: {name, url}` points to the app's license text so a consumer can fetch it and show it in a modal. `url` must be a raw, CORS-enabled plain-text URL (for GitHub, `https://raw.githubusercontent.com/<owner>/<repo>/HEAD/LICENSE`) and `name` is the license title to show while it loads or as a fallback. First-party vlT apps always carry it, including voucher-gated ones, since the license must be readable before a voucher is redeemed.

**Optional field `access`**: `access: voucher` marks an app whose download is gated by a voucher that the consumer (portal or CLI) validates against its own backend. Such a manifest deliberately carries **no** `repo`, no app-level `url` and no asset `url`: no link in it points to where the files are downloaded from. It still publishes the platform/arch/format matrix and each asset's `match` rule (a file-name pattern, not a link), plus `releasePrefix` where the source publishes several products. The consumer resolves the actual source only after a valid voucher, keyed by the manifest `id`. When the field is absent the app is public and follows the normal rules above. First-party vlT apps always use the category `vlT Software`.

**Apps with no GitHub repo to resolve against**: some apps aren't distributed via GitHub Releases at all (a closed-source vendor site, a single static download link). For these, omit `repo` entirely and give the asset a fixed `url` instead of `match`:

```yaml
id: chatgpt
name: ChatGPT
# ...no repo field...
assets:
  - platform: macos
    arch: arm64
    format: DMG
    url: https://persistent.oaistatic.com/sidekick/public/ChatGPT.dmg
```

`match` and `url` are mutually exclusive on a single asset entry. A consumer must check for `url` first and use it verbatim; only fall back to fetching `repo`'s Releases and evaluating `match` when `url` is absent. Because there is no Release to poll, a static `url` asset carries no version — the consumer cannot show "current version" or a version history for it, only the download link itself. Use this sparingly: it's an escape hatch for apps that plain don't have a GitHub repo, not a shortcut to avoid writing a `match` regex for a repo that does.

---

## Architecture

```
nxget.packages/                          (branch: api)
├── readme.md
├── LICENSE
├── .gitignore
├── package.json                # single dependency: js-yaml
│
├── manifests/                  # hand-written source of truth, one folder per app
│   └── <id>/                   # e.g. manifests/keepassxc/ — see v1/index.json for the actual catalog
│       ├── <id>.yaml           # the manifest
│       └── <id>.png            # 512×512 transparent PNG icon, true brand colors
│
├── scripts/
│   └── build-index.js          # reads manifests/*/*.yaml, writes v1/index.json — no network calls
│
├── .github/workflows/
│   └── build.yml               # manual only (workflow_dispatch) → rebuild + commit v1/index.json
│
└── v1/
    └── index.json              # the only generated file in this repo
```

---

## GitHub Actions automation

The only automation in this repo is a single workflow that rebuilds `v1/index.json`. It never runs on its own: it has no `push` or `schedule` trigger and starts only when launched manually from the Actions tab. It never writes a manifest itself.

| Property | Value |
|---|---|
| Trigger | `workflow_dispatch` only (manual launch) |
| Runtime | Node.js 24 |
| Branch | commits directly to `api` |
| Commit | `chore: rebuild index.json` (only if a diff is detected) |
| Network calls | none — `build-index.js` only reads the local `manifests/` checkout |

---

## Base URL

```
https://raw.githubusercontent.com/<owner>/nxget.packages/api
```

---

## Usage Example

```bash
# Discovery
curl https://raw.githubusercontent.com/<owner>/nxget.packages/api/v1/index.json

# Full manifest for one app
curl https://raw.githubusercontent.com/<owner>/nxget.packages/api/manifests/keepassxc/keepassxc.yaml
```

---

## Version & Build

| Field | Value |
|---|---|
| Version | 0.1.0 |
| Build | R210926 |
| Updated | 21 September 2026 |
| API version | v1 |
| Branch | `api` |

---

## License

nxget.packages is distributed under **Proprietary Source-Available License** — Copyright © 2026 Veronesi Lorenzo (vlT).

The source code is made publicly viewable for reference purposes, but the following are expressly prohibited without prior written consent of the owner:

- **Modification** — adaptation, translation or creation of derivative works
- **Redistribution** — copying, forking, republishing, sublicensing or repackaging
- **Commercial use** — selling, embedding in commercial products or services

All intellectual property rights remain exclusively with Veronesi Lorenzo (vlT). For licensing enquiries: [veronesilorenzo@outlook.com](mailto:veronesilorenzo@outlook.com)

---

**Copyright © 2026 vlT di Veronesi Lorenzo. All rights reserved.**
