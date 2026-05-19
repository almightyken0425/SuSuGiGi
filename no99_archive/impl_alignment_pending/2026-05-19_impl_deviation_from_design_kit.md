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

## ~~Spacing 偏離~~（2026-05-19 已對齊，branch `feat/align-design-kit-type` 一併處理）

Design SPACING 階梯重訂為語意命名（Tailwind 風）：`2xs=2, xs=4, sm=8, md=12, lg=16, xl=24, 2xl=32, 3xl=40, 4xl=48, 5xl=64`，新增 `2xs=2` 階供主標題下副標題行內補位。處理完成項：

- Design `data.jsx` SPACING 改新階梯 + 語意命名；TX_LIST_TOKENS / LIST_TOKENS 內 `+2` magic 改 `+ SPACING['2xs']`；components / screens / BRAND 跨檔 209 處 SPACING[數字] 換 key
- `foundations.jsx` SpacingSection subtitle 補 `2xs` 政策說明，SpacingCard key 欄寬擴大
- Impl `theme.ts` SPACING 改新階梯 + 語意命名；LIST_TOKENS / TX_LIST_TOKENS / SEARCH_BAR_TOKENS 內所有引用換 key
- `LIST_TOKENS.GROUP_CARD_MARGIN_BOTTOM` 35 → `SPACING['2xl']` (32)
- `TX_LIST_TOKENS.SECTION_CARD_MARGIN_BOTTOM` 14 → `SPACING.md + SPACING['2xs']` (14，對齊 Design 公式)
- `TX_LIST_TOKENS.SECTION_HEADER_PADDING_V_COLLAPSED` 12 → `SPACING.md` (引用化)
- `TX_LIST_TOKENS.SECTION_HEADER_PADDING_V_EXPANDED` 10 → `SPACING.sm + SPACING['2xs']` (10，對齊 Design 公式)
- `LIST_TOKENS.SECTION_TITLE_PADDING_BOTTOM` `SPACING[1]+2` → `SPACING.xs + SPACING['2xs']` (公式化引用)
- `HeaderIconButton` / `HeaderCheckmarkButton` / `ModalCloseButton` padding 10 → `SPACING.md` (12)
- `TransferEditorScreen` arrow paddingTop 20 → `SPACING.xl` (24)，中間箭頭 inline marginTop:30 改進 `pickerSpacer` styles 用 `SPACING['2xl']` (32)
- `HomeFilterScreen` currencyGroups.gap 14 → `SPACING.lg` (16)、accountCard.paddingVertical 14 → `SPACING.md` (12)、accountCard.gap `SPACING[2]+2` → `SPACING.md` (12)、tileRow.marginBottom 40 → `SPACING['3xl']` (40)
- 9 處子元件 `marginTop: 2` → `SPACING['2xs']`（ListItem / DataListItem / SelectionListItem / ReorderableListItem / AccountSelector / CategorySelector / PaywallScreen / ImportScreen）
- 額外項：`PeriodPage.tsx` marginRight:2 / marginBottom:2 → `SPACING['2xs']`；`ListItem.tsx` chevronWithValue.marginLeft 6 → `SPACING.xs + SPACING['2xs']`（公式維持 6）；ImportScreen.tsx requiredMark.marginLeft 4 → `SPACING.xs`
- Impl src/ 全域 309 處 `SPACING[數字]` → 語意 key
- Impl 跑 tsc 通過；spacing 觸及檔案 lint 0 errors

**方向校正：** 盤點時假設 14、10 屬「不在階梯」要改 16、8；但 Design 端 `data.jsx` 既有公式 `SPACING.md+2` / `SPACING.sm+2` 表達 14、10，視為認可值。Impl 改為對齊 Design 公式（`+ SPACING['2xs']`），保留原視覺。

**不在本輪範圍 / 已知 open item：**

- `paddingBottom: 80/100`（CategoryListScreen / PeriodPage / AccountListScreen 共 4 處）— 屬 BottomSearchBar 高度的計算值，不視為設計 spacing 偏離；impl CLAUDE.md UI Coding Guideline 規定的 `BOTTOM_SEARCH_BAR_TOTAL_HEIGHT + insets.bottom` 寫法另案處理
- `UndoDebugConsole.tsx` 多處 `marginBottom: 2/6` — debug-only UI，整檔豁免
- `BottomSearchBar.test.tsx bottom: 34` — test mock，豁免

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
