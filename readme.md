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

This repo does **not** call the GitHub Releases API and does not resolve download links for apps that publish real GitHub Releases. It only publishes the catalog itself: for each app its id, name, publisher, category, description, bilingual `about`, official site, optional source repo, a 512×512 icon, an optional license link, an optional voucher flag and, per asset, either a matching rule or — for apps with no GitHub repo to resolve against — a fixed download URL. Resolving `match` rules against a live GitHub Release — turning a manifest into an actual download link — is left to each consumer (the `nxget-app-portal` web app today, a future `nxget.cli` in Go later), each running the same logic in its own language/runtime. Assets with a fixed `url` need no resolving at all: the consumer uses the link as published.

```
Consumer ──► https://raw.githubusercontent.com/<owner>/nxget.packages/api
               │
               └── v1/index.json                → discovery entry point: id/name/publisher/category
                     per app, plus a raw link to that app's full manifest
                           │
                           ├── manifests/<id>/<id>.yaml   → full manifest (description, about, url, repo,
                           │                                  license, access, assets match rules or urls)
                           └── manifests/<id>/<id>.png    → the app's 512×512 icon (the manifest's logo)
```

---

## Available Endpoints

| Endpoint | Description |
|---|---|
| `/v1/index.json` | Discovery document: every app's id/name/publisher/category plus a raw link to its manifest |
| `/manifests/<id>/<id>.yaml` | Full manifest for a single app |
| `/manifests/<id>/<id>.png` | The app's icon, 512×512 PNG with transparent background |

---

## Manifest schema

A manifest is one YAML file, `manifests/<id>/<id>.yaml`, written by hand. The three examples below show every field in use: a public app resolved from GitHub Releases, a voucher-gated app, and an app with fixed download links.

**Public app resolved from GitHub Releases** — every optional field except `access`:

```yaml
id: example-app
name: Example App
publisher: Example Publisher
category: Development
description: A one-sentence summary of what the app does.
about:
  it: >-
    Testo italiano, scritto da zero, non tradotto letteralmente.
  en: >-
    English text, written from scratch, not a literal translation.
url: https://example.com/
repo: https://github.com/example/example-app
logo: https://raw.githubusercontent.com/<owner>/nxget.packages/api/manifests/example-app/example-app.png
license:
  name: MIT License
  url: https://raw.githubusercontent.com/example/example-app/HEAD/LICENSE
releasePrefix: desktop-
assets:
  - platform: windows
    arch: x64
    format: MSI
    match: 'Win64\.msi$'
  - platform: macos
    arch: universal
    format: DMG
    match: 'universal\.dmg$'
  - platform: linux
    arch: x64
    format: APPIMAGE
    match: 'x86_64\.AppImage$'
  - platform: linux
    arch: arm64
    format: TARGZ
    match: 'linux-arm64\.tar\.gz$'
```

**Voucher-gated app** — `access: voucher`, no app-level `url`, no asset `url`, and the license always present:

```yaml
id: example-first-party
name: Example First-Party
publisher: vlT
category: vlT Software
description: A one-sentence summary of what the app does.
about:
  it: >-
    Testo italiano, scritto da zero.
  en: >-
    English text, written from scratch.
repo: https://github.com/example/example-releases
logo: https://raw.githubusercontent.com/<owner>/nxget.packages/api/manifests/example-first-party/example-first-party.png
license:
  name: Proprietary Source-Available License
  url: https://raw.githubusercontent.com/example/example-releases/HEAD/LICENSE
releasePrefix: ui-
access: voucher
assets:
  - platform: windows
    arch: x64
    format: ZIP
    match: '^build-windows-amd64\.zip$'
  - platform: macos
    arch: arm64
    format: ZIP
    match: '^build-darwin-arm64\.zip$'
  - platform: linux
    arch: x64
    format: BIN
    match: '^example-[\d.]+-linux-amd64$'
```

**App with fixed download links** — no `repo`, every asset carries a `url` instead of `match`, including a Flatpak reference for Linux:

```yaml
id: example-vendor-app
name: Example Vendor App
publisher: Example Vendor
category: Multimedia
description: A one-sentence summary of what the app does.
about:
  it: >-
    Testo italiano, scritto da zero.
  en: >-
    English text, written from scratch.
url: https://vendor.example.com/download/
logo: https://raw.githubusercontent.com/<owner>/nxget.packages/api/manifests/example-vendor-app/example-vendor-app.png
assets:
  - platform: windows
    arch: x64
    format: EXE
    url: https://vendor.example.com/download/setup.exe
  - platform: macos
    arch: arm64
    format: DMG
    url: https://vendor.example.com/download/app-arm64.dmg
  - platform: macos
    arch: x64
    format: DMG
    url: https://vendor.example.com/download/app-intel.dmg
  - platform: linux
    arch: universal
    format: FLATPAK
    url: https://dl.flathub.org/repo/appstream/com.example.App.flatpakref
```

### Fields

| Field | Required | Description |
|---|---|---|
| `id` | yes | Lowercase kebab-case identifier, identical to the folder and file name (`manifests/<id>/<id>.yaml`) |
| `name` | yes | Display name |
| `publisher` | yes | The publisher or maintainer, by real name (the account's real name, not its username) |
| `category` | yes | Free text. In use: `Development`, `Multimedia`, `Productivity`, `Security`, `Utility`, `vlT Software` (first-party apps, always) |
| `description` | yes | One sentence, in English |
| `about` | yes | `it` and `en` texts, each written from scratch, never a literal translation |
| `url` | yes* | The official site. *Omitted only for voucher-gated apps |
| `repo` | no | GitHub repository whose Releases the consumer reads for the latest version, the release history and the `match` rules. Omit it for apps not published on GitHub Releases |
| `logo` | yes | Raw URL of `manifests/<id>/<id>.png` |
| `license` | no | `{name, url}`, the license text a consumer can show in a modal. Always present for first-party apps |
| `releasePrefix` | no | Tag prefix identifying this app's releases inside a multi-product repo |
| `access` | no | `voucher` for apps whose download is gated by a voucher; absent means public |
| `assets` | yes | List of downloadable files, one per platform/architecture |

### Assets

| Field | Values | Description |
|---|---|---|
| `platform` | `windows`, `macos`, `linux` | Target operating system |
| `arch` | `x64`, `arm64`, `universal` | CPU architecture. `universal` means a single file for every CPU of that platform: a universal macOS binary, an installer stub that picks the right build, or a Flatpak reference. Other architectures (32-bit ARM, x86) are not published |
| `format` | `EXE`, `MSI`, `PKG`, `DMG`, `ZIP`, `TARGZ`, `DEB`, `APPIMAGE`, `BIN`, `FLATPAK` | File type. `BIN` is a bare executable with no archive around it; `FLATPAK` is a Flathub `.flatpakref` reference file |
| `match` | regular expression | Evaluated against the file names of `repo`'s latest release; no download URL is stored |
| `url` | link | A fixed download link the consumer uses as published |

`match` and `url` are mutually exclusive on a single asset. A consumer must check for `url` first and use it verbatim; only fall back to fetching `repo`'s Releases and evaluating `match` when `url` is absent. Publish one file per platform and architecture, and never an asset that is not a plain download (symbols, checksums, delta updates, portable variants of an already listed installer).

### Details

**Logo (`logo`)**: every manifest ships its own icon as a **512×512 PNG with transparent background and the app's true brand colors**, stored next to the manifest as `manifests/<id>/<id>.png`. Icons are taken from the app's own current release or repository (never a mono-color icon-pack glyph, a favicon or a third-party mirror), so they match what the app looks like today. Vector sources are rasterized at 512×512; macOS icons are exported from the released app bundle.

**`releasePrefix`**: for a `repo` that is a monorepo publishing releases for several products with interleaved tags (e.g. `bitwarden/clients`, tagged `desktop-v*`/`browser-v*`/`cli-v*`/`web-v*`), it tells a consumer which tag prefix identifies *this* app's releases, instead of just picking the newest non-prerelease release of the whole repo (which could belong to an unrelated product). Omit it for single-product repos.

**`license`**: `url` must be a raw, CORS-enabled plain-text URL (for GitHub, `https://raw.githubusercontent.com/<owner>/<repo>/HEAD/LICENSE`); `name` is the license title to show while it loads or as a fallback. First-party vlT apps always carry it, including voucher-gated ones, since the license must be readable before a voucher is redeemed.

**`access: voucher`**: the download is gated by a voucher that the consumer (portal or CLI) validates against its own backend. Such a manifest keeps `repo` exactly like any other app, so the consumer can read the latest version and the release history from it as usual, but carries no app-level `url` and no asset `url`: no download link is stored in it. It publishes the platform/arch/format matrix and each asset's `match` rule (a file-name pattern, not a link), plus `releasePrefix` where the source publishes several products. Turning a `match` rule into an actual download is what the voucher gates, and that logic lives in the consumer. First-party vlT apps always use the category `vlT Software`.

**Apps with no GitHub repo to resolve against**: some apps aren't distributed via GitHub Releases at all (a closed-source vendor site, a single static download link). Omit `repo` and give each asset a fixed `url`. Because there is no Release to poll, a static `url` asset carries no version — the consumer cannot show a current version or a version history for it, only the download link itself. Use this sparingly: it's an escape hatch for apps that don't have a repo publishing Releases, not a shortcut to avoid writing a `match` regex for one that does. When a vendor publishes only versioned file names and no stable "latest" alias, the link has to pin a version and the manifest needs updating by hand on each release.

**Flatpak-only Linux apps**: when an app's only Linux distribution is Flatpak (no downloadable installer), publish the Flathub reference file as the asset: `platform: linux`, `arch: universal`, `format: FLATPAK` and `url: https://dl.flathub.org/repo/appstream/<app-id>.flatpakref`. A `.flatpakref` is a small real file that the system's software center (or `flatpak install`) opens to add the Flathub remote and install the app for the machine's own architecture, so `universal` is accurate. The `about` text should say the Linux file is a Flatpak reference. Snap has no equivalent downloadable file and is not published.

### Writing rules

- Manifests are written and committed by hand and contain no YAML comments.
- Every `match` pattern must resolve to exactly one file of the latest stable release, and every fixed `url` must answer with a file — check both before publishing.
- `description` is an unquoted YAML value: it must not contain a colon followed by a space, or the manifest will not parse.
- Never hard-code a version in a `match` pattern; use a wildcard such as `[\d.]+`.
- After adding or editing a manifest, rebuild `v1/index.json` so the catalog lists it.

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
