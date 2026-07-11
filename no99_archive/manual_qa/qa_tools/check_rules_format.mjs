// 驗 rules.md 每列格式、ID 唯一性、欄位值域、分級一致性
// 用法：node check_rules_format.mjs ../no1_rules.md
import fs from 'fs'

const file = process.argv[2] ?? new URL('../no1_rules.md', import.meta.url).pathname
const text = fs.readFileSync(file, 'utf8')
const lines = text.split('\n')

const ROW = /^\|\s*(R-[A-Z]{2}-\d{3})\s*\|([^|]*)\|([^|]*)\|([^|]*)\|\s*(T[1-4])\s*\|\s*(P[0-2])\s*\|\s*([ABC]|無)\s*\|([^|]*)\|\s*$/
const SURFACE = new Set(['UI', 'DB', 'LOG', 'FB', '實機'])
const FULLWIDTH = /[（）「」『』【】《》〈〉［］｛｝〔〕]/
const HALF_PAREN = /[()[\]]/

const ids = new Map()
const errors = []
const stats = { total: 0, tiers: {}, priorities: {}, tracks: {}, prefixes: {} }

lines.forEach((line, i) => {
  const n = i + 1
  if (!/^\|\s*R-/.test(line)) return
  const m = line.match(ROW)
  if (!m) {
    errors.push(`L${n} 列格式不符 schema：${line.slice(0, 60)}`)
    return
  }
  const [, id, rule, source, surface, tier, prio, track, disposition] = m
  stats.total++
  stats.tiers[tier] = (stats.tiers[tier] ?? 0) + 1
  stats.priorities[prio] = (stats.priorities[prio] ?? 0) + 1
  stats.tracks[track] = (stats.tracks[track] ?? 0) + 1
  const prefix = id.slice(2, 4)
  stats.prefixes[prefix] = (stats.prefixes[prefix] ?? 0) + 1

  if (ids.has(id)) errors.push(`L${n} ID 重複 ${id}，先出現於 L${ids.get(id)}`)
  else ids.set(id, n)

  for (const s of surface.trim().split('+')) {
    if (!SURFACE.has(s.trim())) errors.push(`L${n} ${id} 面欄值非法：${s.trim()}`)
  }
  if (tier === 'T4' && track !== '無') errors.push(`L${n} ${id} T4 的軌必須為 無`)
  if (tier !== 'T4' && track === '無') errors.push(`L${n} ${id} 非 T4 不得填軌 無`)
  const disp = disposition.trim()
  if ((tier === 'T3' || tier === 'T4') && (disp === '—' || disp === ''))
    errors.push(`L${n} ${id} ${tier} 的處置欄不得為空`)

  const noCode = line.replace(/`[^`]*`/g, '')
  if (FULLWIDTH.test(noCode)) errors.push(`L${n} ${id} 含全形括號引號`)
  if (HALF_PAREN.test(noCode)) errors.push(`L${n} ${id} 含 backtick 外半形括號`)
  if (/[我你]/.test(rule)) errors.push(`L${n} ${id} 規則欄含人稱代名詞`)
})

console.log(`規則列合計 ${stats.total}`)
console.log('級分佈', stats.tiers)
console.log('P 分佈', stats.priorities)
console.log('軌分佈', stats.tracks)
console.log('前綴分佈', stats.prefixes)
if (errors.length) {
  console.log(`\nFAILED ${errors.length} 項`)
  errors.forEach(e => console.log(e))
  process.exit(1)
}
console.log('PASSED')
