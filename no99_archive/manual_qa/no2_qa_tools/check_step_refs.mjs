// 驗場次檔與對賬手冊的步引用完整性：每個「步 N」引用都要解析到存活步。
// 場次檔精煉刪步留空號，引用斷鏈靠本腳本抓，check_coverage 管不到這層。
// 另列 cover 欄外散落的 R-ID 供漂移比對；--covermap 印各步 cover 多重集 JSON。
// 用法：node check_step_refs.mjs [場次檔] [對賬手冊] [--covermap]
import fs from 'fs'
import { fileURLToPath } from 'url'

const argv = process.argv.slice(2).filter(a => a !== '--covermap')
const covermapMode = process.argv.includes('--covermap')
const scenFile = argv[0] ?? fileURLToPath(new URL('../no1_test_plan/no2_scenarios.md', import.meta.url))
const cpFile = argv[1] ?? fileURLToPath(new URL('../no1_test_plan/no3_checkpoints.md', import.meta.url))
const scenText = fs.readFileSync(scenFile, 'utf8')
const cpText = fs.readFileSync(cpFile, 'utf8')

const RID = /R-[A-Z]{2}-\d{3}/g
const SCEN_H2 = /^## 場次 ([ABC]-\d{2})/
// 步號上限：金額字面自 100 起、步號遠小於此，超過即視為金額、不算步引用
const STEP_CAP = 99

// ---------- 場次檔解析：步集合、cover 多重集、cover 欄外 R-ID ----------
const stepSet = new Set()
const covermap = {}
const proseRids = []
{
  let cur = null
  let inMakeup = false // 補遺未竟段
  scenText.split('\n').forEach((line, i) => {
    const h2 = line.match(/^## +(.*)/)
    if (h2) inMakeup = h2[1].startsWith('補遺未竟')
    const m = line.match(SCEN_H2)
    if (m) cur = m[1]
    if (!cur || inMakeup) return
    const cells = line.split('|')
    const isRow = cells.length >= 6 && /^\s*$/.test(cells[0])
    const stepCell = isRow ? cells[2].trim() : ''
    if (isRow && (/^\d+$/.test(stepCell) || /^CP-/.test(stepCell))) {
      if (/^\d+$/.test(stepCell)) stepSet.add(`${cur}:${stepCell}`)
      const ids = cells[cells.length - 2].match(RID) ?? []
      if (ids.length) covermap[`${cur}:${stepCell}`] = ids
      const outside = cells.slice(0, cells.length - 2).join('|').match(RID) ?? []
      outside.forEach(id => proseRids.push({ line: i + 1, id, where: 'cover 欄以外的表格欄' }))
    } else {
      const ids = line.match(RID) ?? []
      ids.forEach(id => proseRids.push({ line: i + 1, id, where: '正文' }))
    }
  })
}

// ---------- 步引用掃描 ----------
function collectRefs(text, file, scenOfLine) {
  const out = []
  text.split('\n').forEach((line, i) => {
    for (const m of line.matchAll(/([ABC]-\d{2})\s*步\s*(\d+)(?:\s*[至到]\s*(\d+))?/g)) {
      out.push({ file, line: i + 1, scen: m[1], from: +m[2], to: m[3] ? +m[3] : null, text: line.trim() })
    }
    for (const m of line.matchAll(/(同步|對照步|依步|步驟|步)\s*(\d+)(?:\s*[至到]\s*(\d+))?/g)) {
      const before = line.slice(Math.max(0, m.index - 6), m.index)
      if (/[ABC]-\d{2}\s*$/.test(before)) continue
      out.push({ file, line: i + 1, scen: scenOfLine(i), from: +m[2], to: m[3] ? +m[3] : null, text: line.trim() })
    }
  })
  return out.filter(r => r.from <= STEP_CAP && (r.to == null || r.to <= STEP_CAP))
}

const scenAt = []
{
  let c = null
  scenText.split('\n').forEach((line, i) => {
    const m = line.match(SCEN_H2)
    if (m) c = m[1]
    scenAt[i] = c
  })
}
// 對賬手冊行所屬場次：CP 標題推導；非 CP 標題的插節向後看下一個 CP
const cpLines = cpText.split('\n')
const cpScenAt = []
{
  const raw = cpLines.map(line => {
    const m = line.match(/^## CP-([ABC])-(\d{2})-/)
    if (m) return `${m[1]}-${m[2]}`
    if (/^## /.test(line)) return 'PENDING'
    return null
  })
  let cur2 = null
  const resolved = new Array(cpLines.length).fill(null)
  for (let i = cpLines.length - 1; i >= 0; i--) {
    // 由後往前補 PENDING：插節歸屬其後第一個 CP 的場次
    if (raw[i] && raw[i] !== 'PENDING') cur2 = raw[i]
    resolved[i] = cur2
  }
  let cur3 = null
  for (let i = 0; i < cpLines.length; i++) {
    if (raw[i] === 'PENDING') cur3 = resolved[i]
    else if (raw[i]) cur3 = raw[i]
    cpScenAt[i] = cur3
  }
}

const refs = [...collectRefs(scenText, '場次檔', i => scenAt[i]), ...collectRefs(cpText, '對賬手冊', i => cpScenAt[i])]
const broken = []
for (const r of refs) {
  if (!r.scen) continue
  for (let n = r.from; n <= (r.to ?? r.from); n++) {
    if (!stepSet.has(`${r.scen}:${n}`)) broken.push({ ...r, missing: n })
  }
}

if (covermapMode) {
  console.log(JSON.stringify(covermap, null, 1))
  process.exit(0)
}

console.log(`步引用 ${refs.length} 處，存活步 ${stepSet.size} 個`)
console.log(`cover 欄外散落 R-ID ${proseRids.length} 處，屬既有形態、供漂移比對`)
if (broken.length) {
  console.log(`\n斷鏈引用 ${broken.length} 處：`)
  for (const b of broken) console.log(`  ${b.file} L${b.line} → ${b.scen} 步 ${b.missing}：${b.text.slice(0, 70)}`)
  process.exit(1)
}
console.log('PASSED 步引用完整')
