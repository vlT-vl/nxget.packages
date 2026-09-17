#!/usr/bin/env node
'use strict'

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import yaml from 'js-yaml'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const MANIFESTS_DIR = path.resolve(__dirname, '../manifests')
const OUTPUT = path.resolve(__dirname, '../v1/index.json')

// Adegua questi tre valori se la repo viene pubblicata sotto un account/org diverso.
const OWNER = 'vlT-vl'
const REPO = 'nxget.packages'
const BRANCH = 'api'
const BASE_URL = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}`

function main() {
  const ids = readdirSync(MANIFESTS_DIR, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)

  const apps = ids
    .map(id => {
      const file = path.join(MANIFESTS_DIR, id, `${id}.yaml`)
      if (!existsSync(file)) throw new Error(`manifest non trovato: ${file}`)

      const manifest = yaml.load(readFileSync(file, 'utf8'))
      return {
        id: manifest.id,
        name: manifest.name,
        publisher: manifest.publisher,
        category: manifest.category,
        manifest: `${BASE_URL}/manifests/${id}/${id}.yaml`,
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  const index = {
    api: 'nxget-packages-v1',
    schema_version: '1.0',
    generated_at: new Date().toISOString(),
    base_url: BASE_URL,
    apps,
  }

  writeFileSync(OUTPUT, JSON.stringify(index, null, 2) + '\n')
  console.log(`index.json: ${apps.length} app(s)`)
}

main()
