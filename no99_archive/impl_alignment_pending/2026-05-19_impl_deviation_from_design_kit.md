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

## Brand 偏離

**注意：本段方向與檔頭預設方向不同。** 檔頭預設「impl 對齊 design」；本段項 1 為**反方向偏離（design 對齊 impl）**，項 3 為「design 端清理冗餘 entry」，皆需在 Design git 動工，非 Impl git。

盤點來源：Foundations 的 Brand sub-section（`no3_product_designs/no2_accounting_app/project/10_foundations/foundations.jsx` 的 `FoundationsBrandSection`）的四個 artboard 對齊狀態。

### Brand 項 1 · ICON_LIBRARY（account + category）— **改 Design**

Design `data.jsx` 的 `ICON_LIBRARY` 列 43 個 mci/ant icon；Impl `assets/definitions/IconDefinition.json` 是 97 個 phosphor svg。連帶 `CATEGORIES` / `ACCOUNTS` mock data 引用的 iconId 對應錯（mock 的 iconId 13 是 `mci-bank` 屬 account；impl 的 id 13 是 `ph-coffee` 屬 category）。

**仲裁端：Impl**（Phosphor svg 是已決定的視覺風格，且實作端已有穩定 `PHOSPHOR_SVG_MAP` 渲染管線）。

工作項（Design git，branch `feat/<r-id>-align-icon-library-to-phosphor`）：
1. `data.jsx` 的 `ICON_LIBRARY` 從 impl `IconDefinition.json` 重生（97 條）
2. `data.jsx` 的 `CATEGORIES` / `ACCOUNTS` mock data 的 iconId 重新挑選符合新 library 的 id
3. `foundations.jsx` 的 `IconWallCard` 渲染管線改為能載入 phosphor svg
4. **方案 b**：design canvas 新建 `project/assets/icons/phosphor/`，從 impl `assets/icons/phosphor/` 複製 97 個 svg 過去（design git 自包，不跨 git 引用實作端資產）
5. 連帶可能要動 `project/30_screens/*.jsx` 等其他引用 iconId 的處（執行時 grep 確認）

### Brand 項 2 · UIGlyphWallCard — **建立核可清單，兩端配對**

Design `foundations.jsx` `UIGlyphWallCard` 寫死 35 個 UI glyph（SF 7 / FA 5 / MCI 23）。Impl 各 screen 自由 `import` MCI/FA 使用，無核可清單管控，兩端各做各的。

**治理決策：建立核可清單**。Impl 端新建 `src/constants/uiGlyphs.ts` 列出可用 glyph，各 screen 改為從常數引用；Design 端 UIGlyphWallCard 清單從 impl 同步重生。

工作項（Impl git + Design git 配對，branch `feat/<r-id>-introduce-ui-glyph-registry`）：
1. Impl 先 grep 實際使用清單：`MaterialCommunityIcons name="..."`、`Icon name="..."`（MCI alias）、`FontAwesome name="..."`
2. Impl 新建 `src/constants/uiGlyphs.ts`，列出核可清單與來源 library
3. Impl 改寫各 screen 改為從此檔引用常數（非字串 literal）
4. Design `foundations.jsx` `UIGlyphWallCard` 清單從 impl `uiGlyphs.ts` 重生
5. 兩 git branch 名稱、commit subject/body 一致
6. SF Symbol 已透過 `HeaderIconButton symbol="..."` 集中管控（現存 5 個：line.3.horizontal.decrease / magnifyingglass / gearshape / arrow.triangle.merge / xmark / checkmark），本項治理範圍主要為 MCI + FA

### Brand 項 3 · ACTION_ICON_MAP.add — **改 Design 刪除 entry**

Design `data.jsx` `ACTION_ICON_MAP.add` 標 `{source: 'sf', symbol: 'plus'}`；但 impl 端 add 動作不在 header，而在 FAB（`FloatingActionBar.tsx:104` 用 FontAwesome plus）與列項 leftIcon（`AccountListScreen.tsx:153`、`CategoryListScreen.tsx:148` 用 MCI plus）。`ACTION_ICON_MAP` 的角色是「header 動作」對應，add 不屬此範疇。

**仲裁端：Design**（清理冗餘）。

工作項（Design git，branch `feat/<r-id>-remove-action-add`）：
1. `data.jsx` 的 `ACTION_ICON_MAP` 刪除 `add` 那一行
2. 檢查 `foundations.jsx` 的 `ActionIconMapCard` 渲染是否預期固定 8 條，如有硬編需同步調整

### Brand 項 4 · 品牌 logo / wordmark — **本輪不處理**

Design `assets/logo.svg`、`assets/wordmark.svg` 存在但 `FoundationsBrandSection` 未展示；Impl `assets/images/` 只有 launcher / splash 用 PNG。兩端無交集面。獨立工作項另案處理（design 端先決定要不要把品牌標識正式放進 Foundations）。

---

## 領用流程

下一輪 impl 對齊 session：

1. 開新 impl branch：`feat/<r-id>-align-design-kit-hig`
2. 從本檔挑項處理（建議先做高頻元件 ListItem、FloatingActionBar）
3. 每處理一項，從本檔劃除（用 `~~刪除線~~`）或移除
4. 全部處理完成後本檔可整份移到 `no99_archive/done/`
5. impl branch merge 前確認：`grep -E "fontSize:\s*1[3-7]\b" src/` 在元件層 token 之外應為 0 hit
