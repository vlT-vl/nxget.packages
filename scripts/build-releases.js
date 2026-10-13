#!/usr/bin/env node
'use strict'

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import yaml from 'js-yaml'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const MANIFESTS_DIR = path.resolve(__dirname, '../manifests')
const OUTPUT = path.resolve(__dirname, '../v1/releases.json')
const UA = 'Mozilla/5.0 (compatible; nxget-packages-releases)'

const HISTORY_SIZE = 10
const PAGE_SIZE = 100
const MAX_PAGES = 3
const CONCURRENCY = 6

const headers = { accept: 'application/vnd.github+json', 'user-agent': UA }
if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

async function getJson(url) {
  let lastError
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { headers, signal: AbortSignal.timeout(30000) })
      if (res.ok) return await res.json()
      lastError = new Error(`HTTP ${res.status}`)
      if (res.status === 404) break
    } catch (err) {
      lastError = err
    }
    await sleep(1500)
  }
  throw lastError
}

async function pool(items, size, worker) {
  const queue = [...items]
  await Promise.all(Array.from({ length: Math.min(size, queue.length) }, async () => {
    while (queue.length) await worker(queue.shift())
  }))
}

function readManifests() {
  return readdirSync(MANIFESTS_DIR, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => {
      const file = path.join(MANIFESTS_DIR, entry.name, `${entry.name}.yaml`)
      if (!existsSync(file)) throw new Error(`manifest non trovato: ${file}`)
      return yaml.load(readFileSync(file, 'utf8'))
    })
    .filter(doc => doc?.id && doc.repo)
    .sort((a, b) => a.id.localeCompare(b.id))
}

function readPrevious() {
  if (!existsSync(OUTPUT)) return { apps: {} }
  try {
    const data = JSON.parse(readFileSync(OUTPUT, 'utf8'))
    return { ...data, apps: data.apps || {} }
  } catch {
    return { apps: {} }
  }
}

async function fetchReleases(slug, prefix) {
  const matching = []
  for (let page = 1; page <= MAX_PAGES; page++) {
    const list = await getJson(`https://api.github.com/repos/${slug}/releases?per_page=${PAGE_SIZE}&page=${page}`)
    matching.push(...list.filter(r => !r.draft && (!prefix || r.tag_name.startsWith(prefix))))
    const hasStable = matching.some(r => !r.prerelease)
    if (list.length < PAGE_SIZE || (hasStable && matching.length >= HISTORY_SIZE)) break
  }
  return matching
}

function buildEntry(doc, matching) {
  if (!matching.length) return null

  const history = matching.slice(0, HISTORY_SIZE).map(r => ({
    tag: r.tag_name,
    name: r.name || r.tag_name,
    published_at: r.published_at,
    url: r.html_url,
  }))

  const latest = matching.find(r => !r.prerelease)
  if (!latest) return { history }

  const rules = (doc.assets || [])
    .filter(rule => rule.match)
    .map(rule => ({ rule, regex: new RegExp(rule.match, 'i') }))

  const downloads = {}
  for (const asset of latest.assets || []) {
    const hit = rules.find(({ regex }) => regex.test(asset.name))
    if (!hit) continue
    const { rule } = hit
    downloads[rule.platform] ??= {}
    downloads[rule.platform][rule.arch] ??= {}
    downloads[rule.platform][rule.arch][rule.osVersion ?? 'default'] = { url: asset.browser_download_url, format: rule.format }
  }

  return { tag: latest.tag_name, published_at: latest.published_at, downloads, history }
}

async function main() {
  const docs = readManifests()
  const previous = readPrevious()
  const resolved = new Map()
  const failures = []

  await pool(docs, CONCURRENCY, async doc => {
    try {
      const slug = new URL(doc.repo).pathname.replace(/^\/|\/$/g, '')
      const matching = await fetchReleases(slug, doc.releasePrefix)
      resolved.set(doc.id, buildEntry(doc, matching))
    } catch (err) {
      failures.push(`${doc.id}: ${err.message}`)
    }
  })

  const apps = {}
  for (const doc of docs) {
    const entry = resolved.has(doc.id) ? resolved.get(doc.id) : previous.apps[doc.id]
    if (entry) apps[doc.id] = entry
  }

  for (const failure of failures) console.log(`non aggiornato: ${failure}`)

  if (!resolved.size && failures.length) {
    console.error('nessuna app risolta')
    process.exit(1)
  }

  if (JSON.stringify(apps) === JSON.stringify(previous.apps)) {
    console.log(`releases.json: nessuna modifica (${Object.keys(apps).length} app)`)
    return
  }

  const output = {
    schema_version: '1.0',
    generated_at: new Date().toISOString(),
    apps,
  }
  writeFileSync(OUTPUT, JSON.stringify(output, null, 2) + '\n')
  console.log(`releases.json: aggiornato (${Object.keys(apps).length} app)`)
}

main()
