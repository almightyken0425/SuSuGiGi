// 比對 no1_rules.md 與 no2_scenarios.md 覆蓋率
// T1 T2 T3 必須被場次 cover，T4 豁免
// 用法：node check_coverage.mjs ../no1_rules.md ../no2_scenarios.md
import fs from 'fs'

const rulesFile = process.argv[2] ?? new URL('../no1_rules.md', import.meta.url).pathname
const scenFile = process.argv[3] ?? new URL('../no2_scenarios.md', import.meta.url).pathname
const rules = fs.readFileSync(rulesFile, 'utf8')
const scenRaw = fs.readFileSync(scenFile, 'utf8')

// 補遺未竟段落內的 ID 不算真實覆蓋，逐段剝除
const scen = scenRaw
  .split(/^##\s+/m)
  .filter(sec => !sec.startsWith('補遺未竟'))
  .join('\n')

const ROW = /^\|\s*(R-[A-Z]{2}-\d{3})\s*\|(?:[^|]*\|){3}\s*(T[1-4])\s*\|/gm
const declared = new Map()
for (const m of rules.matchAll(ROW)) declared.set(m[1], m[2])

const covered = new Set(scen.match(/R-[A-Z]{2}-\d{3}/g) ?? [])

const required = [...declared].filter(([, t]) => t !== 'T4').map(([id]) => id)
const missing = required.filter(id => !covered.has(id))
const unknown = [...covered].filter(id => !declared.has(id))

console.log(`規則 ${declared.size} 條，其中須覆蓋 ${required.length}`)
console.log(`場次引用 ${covered.size} 條`)
if (missing.length) {
  console.log(`\n未覆蓋 ${missing.length} 條：`)
  console.log(missing.join(' '))
}
if (unknown.length) {
  console.log(`\n場次引用了不存在的 ID ${unknown.length} 條：`)
  console.log(unknown.join(' '))
}
if (missing.length || unknown.length) process.exit(1)
console.log('PASSED 覆蓋完整')
