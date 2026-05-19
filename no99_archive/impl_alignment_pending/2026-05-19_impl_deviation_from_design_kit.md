# 2026-05-19 · 實作端偏離 Design Kit 標準清單

## Context

本檔由 2026-05-19 Module Design git 的 Foundations 重訂後生成。當時將 SuSuGiGi accounting app 的 token 系統錨定到 Apple HIG / iOS Dynamic Type，盤點 impl 端不符 design 標準的位置。

Design git 為設計標準的仲裁端，token 決議寫在 `no3_product_designs/no2_accounting_app/project/10_foundations/data.jsx`。本檔的目的是讓下一輪「impl 對齊 design」session 直接從這份清單領用工作項。

**注意：** 本檔為 archive 層的工作筆記，不是規格、不是計畫、不會被 hook 強制執行。下一輪 session 開始時 review 並挑項處理；處理完的項目從本檔劃除或移除即可。

---

## 字體偏離

實作端硬編碼 `fontSize` 數值未引用 token 的位置。新 Design 標準採 HIG TYPE_STYLES（11 種 style），元件應該使用語意層 style 而非寫死數字。

| Impl 檔案 | 硬編碼 | 應改為 | 備註 |
|---|---|---|---|
| `src/components/FloatingActionBar.tsx` | `fontSize: 14` | TYPE_STYLES.subheadline.size (15) 或 TYPOGRAPHY.size.sm (14) | 視 FAB 內文字語意決定；若為 secondary action label 採 subheadline，若為說明文字採 size.sm |
| `src/components/ListItem.tsx` | `fontSize: 13` | TYPE_STYLES.footnote.size | HIG footnote 標準值 |
| `src/components/ListItem.tsx` | `fontSize: 17` | TYPE_STYLES.body.size | HIG body 標準值 |
| `src/components/UndoDebugConsole.tsx` | 6 處硬編碼 fontSize | 逐項對應 TYPE_STYLES | 需 grep 確認 6 處的個別語境 |

---

## 圓角偏離

新 Design 標準 RADIUS 階梯：`none/sm/md/lg/xl/2xl/full = 0/4/8/12/16/20/9999`。**14 不在標準階梯內**。

| Impl 位置 | 偏離值 | 應改為 | 備註 |
|---|---|---|---|
| `src/constants/theme.ts` `LIST_TOKENS.GROUP_CARD_RADIUS` | 14 | RADIUS.lg (12) | Design 端已決議採 lg，視覺差異 2px 可接受 |
| `src/constants/theme.ts` `TX_LIST_TOKENS.SECTION_CARD_RADIUS` | 14 | RADIUS.lg (12) | 同上 |

---

## 字重註解偏離

新 Design 標準明說 TYPOGRAPHY.weight 涵蓋 HIG 9 階（ultraLight 100 → black 900），目前啟用 light/regular/medium 三檔，其餘 6 檔**保留**（不是廢除）。

| Impl 位置 | 現況描述 | 應改為 |
|---|---|---|
| `src/constants/theme.ts` 字重註解 | 「不再保留 600 / 700 / 'bold'」 | 「目前啟用 light / regular / medium；semibold 及以上保留，未來若有重要焦點需要時開放」 |

---

## Token 引用方式偏離

新 Design 標準 LIST_TOKENS / TX_LIST_TOKENS / SEARCH_BAR_TOKENS 內部一律引用上層 TYPE_STYLES / TYPOGRAPHY / SPACING / RADIUS，不再硬編碼數字。impl 端需做相同改動讓 token 系統可追溯。

需 grep 確認的引用點：

- `src/constants/theme.ts` 內 `LIST_TOKENS` 各欄位值（13、17、14 等）
- `src/constants/theme.ts` 內 `TX_LIST_TOKENS` 各欄位值（17、14、15、13、16、12 等）
- `src/constants/theme.ts` 內 `SEARCH_BAR_TOKENS` 各欄位值

對應 design 端的引用方式（已完成於 `data.jsx`）可作為 impl 改動的範本。

---

## 待全面 grep 盤點項

本檔僅列出 design git 重訂時掃到的明顯偏離點。下一輪 session 開始時建議全面 grep 以下模式：

- `fontSize:\s*\d+` — 找出所有硬編碼字體大小
- `borderRadius:\s*\d+` — 找出所有硬編碼圓角
- `fontWeight:\s*['"]?(?:300|400|500)` 之外的字重數字 — 確認沒在 impl 偷用未啟用字重
- `LIST_TOKENS\.|TX_LIST_TOKENS\.|SEARCH_BAR_TOKENS\.` — 找出元件層 token 的使用點，確認引用路徑

盤點結果可追加到本檔或開新檔（建議：`2026-MM-DD_impl_grep_findings.md`）。

---

## 領用流程

下一輪 impl 對齊 session：

1. 開新 impl branch：`feat/<r-id>-align-design-kit-hig`
2. 從本檔挑項處理（建議先做高頻元件 ListItem、FloatingActionBar）
3. 每處理一項，從本檔劃除（用 `~~刪除線~~`）或移除
4. 全部處理完成後本檔可整份移到 `no99_archive/done/`
5. impl branch merge 前確認：`grep -E "fontSize:\s*1[3-7]\b" src/` 在元件層 token 之外應為 0 hit
