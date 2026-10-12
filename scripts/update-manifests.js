#!/usr/bin/env node
'use strict'

import { appendFileSync, existsSync, readdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import yaml from 'js-yaml'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const MANIFESTS_DIR = path.resolve(__dirname, '../manifests')
const SOURCES_FILE = path.resolve(__dirname, 'sources.json')
const UA = 'Mozilla/5.0 (compatible; nxget-packages-updater)'

const args = process.argv.slice(2)
const flag = name => args.includes(`--${name}`)
const option = name => args.find(a => a.startsWith(`--${name}=`))?.slice(name.length + 3)

const WRITE = flag('write')
const SKIP_LINKS = flag('skip-links')
const SKIP_REPOS = flag('skip-repos')
const ONLY = option('only')?.split(',').filter(Boolean)
const COMMIT_MSG = option('commit-msg')

const problems = []
const notes = []
const changes = []

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

async function request(url, init = {}) {
  let lastError
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, {
        redirect: 'follow',
        signal: AbortSignal.timeout(30000),
        ...init,
        headers: { 'user-agent': UA, ...init.headers },
      })
      if (res.ok) return res
      lastError = new Error(`HTTP ${res.status}`)
      await res.body?.cancel()
    } catch (err) {
      lastError = err
    }
    await sleep(1500)
  }
  throw lastError
}

const getText = async (url, headers) => (await request(url, { headers })).text()
const getJson = async (url, headers) => (await request(url, { headers })).json()

function dig(value, pathString) {
  return pathString.split('.').reduce((acc, key) => {
    if (acc === undefined || acc === null) throw new Error(`percorso non trovato: ${pathString}`)
    return acc[key]
  }, value)
}

const versionTokens = v => (String(v).match(/\d+/g) || []).map(Number)

function compareVersions(a, b) {
  const x = versionTokens(a)
  const y = versionTokens(b)
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    const diff = (x[i] ?? 0) - (y[i] ?? 0)
    if (diff !== 0) return diff
  }
  return 0
}

const isSaneVersion = v => typeof v === 'string' && v.length > 0 && v.length < 60 && /^\d[\w.() -]*$/.test(v)

const transforms = {
  beforeComma: v => v.split(',')[0],
  joinComma: v => v.replace(',', '.'),
}

function applyTransform(value, name) {
  if (!name) return value
  if (!transforms[name]) throw new Error(`transform sconosciuta: ${name}`)
  return transforms[name](value)
}

function stripTags(text) {
  return text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
}

async function probeUrl(url) {
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      headers: { 'user-agent': UA },
      signal: AbortSignal.timeout(20000),
    })
    return res.status === 200
  } catch {
    return false
  }
}

const adapters = {
  async cask(source) {
    const data = await getJson(`https://formulae.brew.sh/api/cask/${source.token}.json`)
    return { version: applyTransform(String(data.version), source.transform) }
  },

  async json(source) {
    const data = await getJson(source.url)
    return { version: applyTransform(String(dig(data, source.path)), source.transform) }
  },

  async regex(source) {
    let text = await getText(source.url)
    if (source.stripTags) text = stripTags(text)
    const match = new RegExp(source.regex, source.flags || '').exec(text)
    if (!match) throw new Error(`nessuna corrispondenza per ${source.regex}`)
    const { version, ...vars } = match.groups || {}
    return { version: applyTransform(version ?? match[1], source.transform), vars }
  },

  async redirect(source) {
    const res = await request(source.url, { headers: { range: 'bytes=0-0' } })
    await res.body?.cancel()
    const match = new RegExp(source.regex).exec(res.url)
    if (!match) throw new Error(`nessuna corrispondenza per ${source.regex} in ${res.url}`)
    return { version: match[1], url: res.url }
  },

  async linkScan(source) {
    const text = await getText(source.url)
    const found = [...text.matchAll(new RegExp(source.regex, 'g'))].map(m => ({ url: m[1], version: m[2] }))
    if (!found.length) throw new Error(`nessun link per ${source.regex}`)
    return found.sort((a, b) => compareVersions(b.version, a.version))[0]
  },

  async chromeHistory(source) {
    const base = `https://versionhistory.googleapis.com/v1/chrome/platforms/${source.platform}/channels/stable/versions`
    const data = await getJson(`${base}?pageSize=1&orderBy=version%20desc`)
    const version = data.versions[0].version
    let released
    try {
      const history = await getJson(`${base}/all/releases?pageSize=20&orderBy=version%20desc`)
      released = history.releases.find(r => r.version === version)?.serving?.startTime
    } catch {
      released = undefined
    }
    return { version, released }
  },

  async officeFeed(source) {
    const data = await getJson('https://clients.config.office.net/releases/v1.0/OfficeReleases')
    const channel = data.find(c => c.channelId === source.channelId)
    if (!channel) throw new Error(`canale ${source.channelId} non trovato`)
    const latest = [...channel.officeVersions].sort((a, b) => b.availabilityDate.localeCompare(a.availabilityDate))[0]
    return { version: `${latest.releaseVersion} (Build ${latest.buildVersion})` }
  },

  async flathub(source) {
    const data = await getJson(`https://flathub.org/api/v2/appstream/${source.appId}`)
    return { version: String(data.releases[0].version) }
  },

  async probe(source, current) {
    const [major, minor = 0, patch = 0] = versionTokens(current)
    const candidates = [
      `${major}.${minor}.${patch + 1}`,
      `${major}.${minor}.${patch + 2}`,
      `${major}.${minor + 1}.0`,
      `${major + 1}.0.0`,
    ]
    let best = current
    for (const candidate of candidates) {
      if (compareVersions(candidate, best) > 0 && (await probeUrl(source.urlTemplate.replace('{version}', candidate)))) best = candidate
    }
    return { version: best }
  },
}

async function fetchSource(source, current) {
  const adapter = adapters[source.type]
  if (!adapter) throw new Error(`tipo di fonte sconosciuto: ${source.type}`)
  return adapter(source, current)
}

async function checkUrl(url) {
  let reason
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, {
        redirect: 'follow',
        headers: { 'user-agent': UA, range: 'bytes=0-1023' },
        signal: AbortSignal.timeout(30000),
      })
      const type = res.headers.get('content-type') || ''
      await res.body?.cancel()
      if (res.status !== 200 && res.status !== 206) {
        reason = `HTTP ${res.status}`
      } else if (/text\/html/i.test(type)) {
        reason = `content-type ${type}`
      } else {
        return { ok: true }
      }
    } catch (err) {
      reason = err.message
    }
    await sleep(1500)
  }
  return { ok: false, reason }
}

const matchesSelect = (asset, select) => Object.entries(select).every(([key, value]) => String(asset[key]) === String(value))

function rewriteUrl(url, rewrites, version, vars = {}) {
  const tokens = versionTokens(version)
  const values = { version, majorMinor: tokens.slice(0, 2).join('.'), last: String(tokens[tokens.length - 1]), ...vars }
  return rewrites.reduce((acc, { from, to }) => {
    const filled = to.replace(/\{([A-Za-z]\w*)\}/g, (_, key) => {
      if (!(key in values)) throw new Error(`segnaposto sconosciuto: ${key}`)
      return values[key]
    })
    return acc.replace(new RegExp(from), (...m) => filled.replace(/\{(\d)\}/g, (_, i) => m[Number(i)]))
  }, url)
}

const urlIsCovered = (rule, url) => Boolean(rule.urlFromSource) || (rule.urls || []).some(({ from }) => new RegExp(from).test(url))

async function lastModified(url) {
  const res = await fetch(url, {
    redirect: 'follow',
    headers: { 'user-agent': UA, range: 'bytes=0-0' },
    signal: AbortSignal.timeout(30000),
  })
  await res.body?.cancel()
  const value = res.headers.get('last-modified')
  return value ? new Date(value) : null
}

function indexLines(lines) {
  const app = { versionLine: -1 }
  const assets = []
  let inAssets = false
  let current = null
  lines.forEach((line, i) => {
    if (/^assets:\s*$/.test(line)) {
      inAssets = true
      return
    }
    if (/^\S/.test(line)) {
      inAssets = false
      current = null
      if (/^version:/.test(line)) app.versionLine = i
      return
    }
    if (!inAssets) return
    if (/^ {2}- /.test(line)) {
      current = { versionLine: -1, urlLine: -1 }
      assets.push(current)
    }
    if (!current) return
    if (/^ {4}version:/.test(line)) current.versionLine = i
    if (/^ {4}url:/.test(line)) current.urlLine = i
  })
  return { app, assets }
}

const isSafeUrl = url => /^https:\/\/[^\s#'"]+$/.test(url)

async function updateManifest(id, config, globalConfig) {
  const file = path.join(MANIFESTS_DIR, id, `${id}.yaml`)
  const text = readFileSync(file, 'utf8')
  const doc = yaml.load(text)
  const expected = structuredClone(doc)

  if (config?.pinned) {
    notes.push(`${id}: aggiornamenti automatici disattivati (${config.pinned})`)
    return { doc, expected }
  }

  const hasStatic = doc.version !== undefined || (doc.assets || []).some(a => a.version !== undefined)
  if (!config) {
    if (hasStatic) notes.push(`${id}: ha una versione statica ma nessuna fonte in sources.json`)
    return { doc, expected }
  }
  if (doc.repo && doc.version !== undefined && (doc.assets || []).some(a => a.match)) {
    problems.push(`${id}: ha repo e match ma anche una version statica`)
  }

  if (text.includes('\r')) {
    problems.push(`${id}: fine riga CRLF non supportata, manifest non toccato`)
    return { doc, expected }
  }

  const lines = text.split('\n')
  const layout = indexLines(lines)
  if (layout.assets.length !== (doc.assets || []).length) {
    problems.push(`${id}: struttura assets non riconosciuta, manifest non toccato`)
    return { doc, expected }
  }

  const edits = []
  const ruleChanges = []

  const covered = new Set()
  for (const rule of config.rules) {
    const idx = (doc.assets || []).map((_, i) => i)
    const picked = rule.target === 'app' ? idx : idx.filter(i => matchesSelect(doc.assets[i], rule.select || {}))
    for (const i of picked) if (doc.assets[i].url && urlIsCovered(rule, doc.assets[i].url)) covered.add(i)
  }

  for (const rule of config.rules) {
    const assetIdx = (doc.assets || []).map((_, i) => i)
    const selected = rule.target === 'app' ? assetIdx : assetIdx.filter(i => matchesSelect(doc.assets[i], rule.select))

    if (rule.target === 'asset' && !selected.length) {
      problems.push(`${id}: la selezione ${JSON.stringify(rule.select)} non corrisponde a nessun asset`)
      continue
    }

    const holders =
      rule.target === 'app'
        ? [{ kind: 'app', current: doc.version }]
        : selected.map(i => ({ kind: 'asset', idx: i, current: doc.assets[i].version }))

    if (holders.some(h => h.current === undefined || h.current === null)) {
      problems.push(`${id}: manca il campo version dove la fonte lo aggiornerebbe`)
      continue
    }

    let found
    try {
      found = await fetchSource(rule.source, String(holders[0].current))
    } catch (err) {
      problems.push(`${id}: fonte non raggiungibile (${rule.source.type}): ${err.message}`)
      continue
    }

    if (!isSaneVersion(found.version)) {
      problems.push(`${id}: versione non valida dalla fonte: ${JSON.stringify(found.version)}`)
      continue
    }

    const stale = holders.filter(h => compareVersions(found.version, String(h.current)) > 0)
    const older = holders.filter(h => compareVersions(found.version, String(h.current)) < 0)
    if (older.length) {
      notes.push(`${id}: la fonte riporta ${found.version}, più vecchia di ${older[0].current}, ignorata`)
      continue
    }

    const urlEdits = []
    try {
      for (const i of selected) {
        const url = doc.assets[i].url
        if (!url) continue
        let next = url
        if (rule.urlFromSource && found.url) next = found.url
        else if (rule.urls) next = rewriteUrl(url, rule.urls, found.version, found.vars)
        if (next !== url) urlEdits.push({ idx: i, from: url, to: next })
      }
    } catch (err) {
      problems.push(`${id}: ${err.message}`)
      continue
    }

    if (!stale.length && !urlEdits.length) continue

    let blocked = false
    for (const edit of urlEdits) {
      if (!isSafeUrl(edit.to)) {
        problems.push(`${id}: url generato non valido: ${edit.to}`)
        blocked = true
        continue
      }
      const check = await checkUrl(edit.to)
      if (!check.ok) {
        problems.push(`${id}: ${found.version} disponibile ma ${edit.to} non è ancora raggiungibile (${check.reason}), aggiornamento rimandato`)
        blocked = true
      }
    }
    if (blocked) continue

    if (rule.freshness && found.released && stale.length) {
      for (const i of selected) {
        const url = doc.assets[i].url
        if (!url || covered.has(i)) continue
        const modified = await lastModified(url).catch(() => null)
        if (modified && modified.getTime() < new Date(found.released).getTime() - 86400000) {
          problems.push(`${id}: ${found.version} è uscita il ${found.released.slice(0, 10)} ma ${url} serve un file del ${modified.toISOString().slice(0, 10)}, aggiornamento rimandato`)
          blocked = true
        }
      }
    }
    if (blocked) continue

    const staged = []
    const stagedChanges = []

    for (const holder of stale) {
      if (holder.kind === 'app') {
        if (layout.app.versionLine < 0) {
          problems.push(`${id}: riga version non trovata`)
          blocked = true
          continue
        }
        staged.push({ line: layout.app.versionLine, text: `version: '${found.version}'`, apply: e => (e.version = found.version) })
        stagedChanges.push({ id, field: 'version', from: holder.current, to: found.version })
      } else {
        const line = layout.assets[holder.idx].versionLine
        if (line < 0) {
          problems.push(`${id}: riga version dell'asset ${holder.idx} non trovata`)
          blocked = true
          continue
        }
        staged.push({ line, text: `    version: '${found.version}'`, apply: e => (e.assets[holder.idx].version = found.version) })
        const a = doc.assets[holder.idx]
        const label = `${a.platform}/${a.arch}${a.osVersion ? `/${a.osVersion}` : ''}${a.format === 'FLATPAK' ? '/flatpak' : ''}`
        stagedChanges.push({ id, field: `version ${label}`, from: holder.current, to: found.version })
      }
    }

    for (const edit of urlEdits) {
      const line = layout.assets[edit.idx].urlLine
      if (line < 0) {
        problems.push(`${id}: riga url dell'asset ${edit.idx} non trovata`)
        blocked = true
        continue
      }
      staged.push({ line, text: `    url: ${edit.to}`, apply: e => (e.assets[edit.idx].url = edit.to) })
      stagedChanges.push({ id, field: 'url', from: edit.from, to: edit.to })
    }
    if (blocked) continue

    for (const item of staged) {
      edits.push({ line: item.line, text: item.text, trailing: lines[item.line] })
      item.apply(expected)
    }
    ruleChanges.push(...stagedChanges)
  }

  const allowed = config.unversioned || []
  const allowedFormats = globalConfig.unversionedFormats || {}
  ;(doc.assets || []).forEach((asset, i) => {
    if (!asset.url || covered.has(i)) return
    if (allowedFormats[asset.format]) return
    if (allowed.some(a => matchesSelect(asset, a.select))) return
    problems.push(`${id}: ${asset.platform}/${asset.arch} usa un link senza versione (${asset.url}) non dichiarato in sources.json`)
  })

  if (!edits.length) return { doc, expected }

  if (edits.some(e => /\s#/.test(e.trailing))) {
    problems.push(`${id}: commento a fine riga su un campo da aggiornare, manifest non toccato`)
    return { doc, expected: doc }
  }

  const next = [...lines]
  for (const edit of edits) next[edit.line] = edit.text
  const nextText = next.join('\n')

  let nextDoc
  try {
    nextDoc = yaml.load(nextText)
  } catch (err) {
    problems.push(`${id}: il manifest aggiornato non è YAML valido (${err.message}), non scritto`)
    return { doc, expected: doc }
  }
  if (JSON.stringify(nextDoc) !== JSON.stringify(expected) || nextDoc.id !== id) {
    problems.push(`${id}: il manifest aggiornato differisce da quello atteso oltre ai campi previsti, non scritto`)
    return { doc, expected: doc }
  }

  changes.push(...ruleChanges)

  if (WRITE) {
    const tmp = `${file}.tmp-${process.pid}`
    writeFileSync(tmp, nextText)
    renameSync(tmp, file)
  }
  return { doc, expected }
}

async function pool(items, limit, worker) {
  const queue = [...items]
  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (queue.length) await worker(queue.shift())
    }),
  )
}

async function checkLinks(docs, skipHosts) {
  const urls = new Map()
  for (const [id, doc] of docs) {
    for (const asset of doc.assets || []) {
      if (!asset.url) continue
      const host = new URL(asset.url).hostname
      if (skipHosts.some(h => host === h || host.endsWith(`.${h}`))) continue
      if (!urls.has(asset.url)) urls.set(asset.url, [])
      urls.get(asset.url).push(id)
    }
  }
  await pool([...urls.keys()], 6, async url => {
    const result = await checkUrl(url)
    if (!result.ok) problems.push(`${[...new Set(urls.get(url))].join(', ')}: link non valido ${url} (${result.reason})`)
  })
  return urls.size
}

async function checkRepos(docs) {
  const headers = { accept: 'application/vnd.github+json' }
  if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`

  const cache = new Map()
  let checked = 0
  for (const [id, doc] of docs) {
    const matchAssets = (doc.assets || []).filter(a => a.match)
    if (!doc.repo || !matchAssets.length) continue

    const slug = new URL(doc.repo).pathname.replace(/^\/|\/$/g, '')
    if (!cache.has(slug)) {
      try {
        cache.set(slug, await getJson(`https://api.github.com/repos/${slug}/releases?per_page=40`, headers))
      } catch (err) {
        cache.set(slug, null)
        notes.push(`${id}: release di ${slug} non leggibili (${err.message}), controllo dei match saltato`)
      }
    }
    const releases = cache.get(slug)
    if (!releases) continue

    const release = releases.find(r => !r.draft && !r.prerelease && (!doc.releasePrefix || r.tag_name.startsWith(doc.releasePrefix)))
    if (!release) {
      problems.push(`${id}: nessuna release stabile${doc.releasePrefix ? ` con prefisso ${doc.releasePrefix}` : ''} in ${slug}`)
      continue
    }
    checked++
    for (const asset of matchAssets) {
      const hits = release.assets.filter(a => new RegExp(asset.match).test(a.name))
      if (hits.length !== 1) {
        problems.push(`${id}: il match ${asset.match} trova ${hits.length} asset in ${release.tag_name} (atteso 1)`)
      }
    }
  }
  return checked
}

function report(summary) {
  const lines = []
  lines.push(`## nxget.packages updater${WRITE ? '' : ' (dry-run)'}`, '')
  lines.push(summary, '')
  if (changes.length) {
    lines.push('### Aggiornamenti', '')
    for (const c of changes) lines.push(`- \`${c.id}\` ${c.field}: \`${c.from}\` → \`${c.to}\``)
    lines.push('')
  }
  if (problems.length) {
    lines.push('### Problemi', '')
    for (const p of problems) lines.push(`- ${p}`)
    lines.push('')
  }
  if (notes.length) {
    lines.push('### Note', '')
    for (const n of notes) lines.push(`- ${n}`)
    lines.push('')
  }
  const out = lines.join('\n')
  console.log(out)
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, out + '\n')
}

async function main() {
  const sources = JSON.parse(readFileSync(SOURCES_FILE, 'utf8'))
  const ids = readdirSync(MANIFESTS_DIR, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .filter(id => existsSync(path.join(MANIFESTS_DIR, id, `${id}.yaml`)))
    .filter(id => !ONLY || ONLY.includes(id))
    .sort()

  const docs = new Map()
  for (const id of ids) {
    try {
      const { expected } = await updateManifest(id, sources.apps[id], sources)
      docs.set(id, expected)
    } catch (err) {
      problems.push(`${id}: errore inatteso: ${err.message}`)
    }
  }

  const linkCount = SKIP_LINKS ? 0 : await checkLinks(docs, sources.skipUrlCheckHosts || [])
  const repoCount = SKIP_REPOS ? 0 : await checkRepos(docs)

  for (const id of Object.keys(sources.apps)) {
    if (!ONLY && !ids.includes(id)) problems.push(`${id}: presente in sources.json ma senza manifest`)
  }

  const touched = [...new Set(changes.map(c => c.id))]
  report(
    `Manifest controllati: ${ids.length}, aggiornati: ${touched.length}, link verificati: ${linkCount}, repo verificati: ${repoCount}, problemi: ${problems.length}`,
  )

  if (WRITE && COMMIT_MSG && touched.length) {
    const body = changes.map(c => `- ${c.id} ${c.field}: ${c.from} -> ${c.to}`).join('\n')
    writeFileSync(COMMIT_MSG, `chore: update manifest versions (${touched.join(', ')})\n\n${body}\n`)
  }

  process.exitCode = problems.length ? 2 : 0
}

main().catch(err => {
  console.error(err)
  process.exitCode = 1
})
