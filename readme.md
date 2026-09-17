<p align="center">
  <img src="nxget-packages.svg" alt="nxget.packages" width="420" />
</p>

<p align="center">
  Static, public registry of app manifests for the nxget catalog<br/>
  <sub>Plain files · No backend · No auth required</sub>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.1.0--R170926-blue?style=flat-square" alt="version"/>
  <img src="https://img.shields.io/badge/api-v1-green?style=flat-square" alt="api-v1"/>
  <img src="https://img.shields.io/badge/format-YAML%20%2B%20JSON-orange?style=flat-square" alt="format"/>
  <img src="https://img.shields.io/badge/license-proprietary-critical?style=flat-square" alt="license"/>
</p>

---

## Overview

**nxget.packages** is the single source of truth for the nxget app catalog: one hand-written YAML manifest per app, committed by hand — never generated or modified by automation.

This repo does **not** call the GitHub Releases API and does not resolve download links. It only publishes the catalog itself (id, name, publisher, category, description, bilingual `about`, official site, source repo, logo, and the asset-matching rules used to recognize platform/arch/format from a release's file names). Resolving those rules against a live GitHub Release — turning a manifest into an actual download link — is left to each consumer (the `nxget-app-portal` web app today, a future `nxget.cli` in Go later), each running the same logic in its own language/runtime.

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
logo: https://icons.duckduckgo.com/ip3/keepassxc.org.ico
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

No download URL is ever stored here — `assets[].match` is a regular expression a consumer evaluates against the file names of `repo`'s latest GitHub Release to figure out which asset is which platform/arch/format.

**Optional field `releasePrefix`**: for a `repo` that is a monorepo publishing releases for several products with interleaved tags (e.g. `bitwarden/clients`, tagged `desktop-v*`/`browser-v*`/`cli-v*`/`web-v*`), `releasePrefix` tells a consumer which tag prefix identifies *this* app's releases, instead of just picking the newest non-prerelease release of the whole repo (which could belong to an unrelated product). Omit it for single-product repos.

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
│   └── <id>/<id>.yaml          # e.g. manifests/keepassxc/keepassxc.yaml — see v1/index.json for the actual catalog
│
├── scripts/
│   └── build-index.js          # reads manifests/*/*.yaml, writes v1/index.json — no network calls
│
├── .github/workflows/
│   └── build.yml               # push on manifests/** → rebuild + commit v1/index.json
│
└── v1/
    └── index.json              # the only generated file in this repo
```

---

## GitHub Actions automation

The only automation in this repo reacts to a manifest being added or edited by hand — it never writes a manifest itself.

| Property | Value |
|---|---|
| Trigger | `push` on `manifests/**` + `workflow_dispatch` |
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
| Build | R170926 |
| Updated | 17 September 2026 |
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
