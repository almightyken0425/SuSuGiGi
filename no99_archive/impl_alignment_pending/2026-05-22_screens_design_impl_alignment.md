# 2026-05-22 · Screens design ↔ impl 對齊盤點

## Context

對齊 SuSuGiGi accounting app 的 design git `30_screens/` 與 impl git `src/screens/`，並驗證 design screens 完全從 `10_foundations/` + `20_components/` 構成。

對齊範圍：
- design `30_screens/` ↔ impl `src/screens/`
- design `20_components/` ↔ impl `src/components/`
- design `10_foundations/` ↔ impl `src/constants/theme.ts`

仲裁原則：本任務在 sub_mapping「design 仲裁」的基礎上，套用使用者額外規則 **「Component 配對以 impl 為 true source」**——design 多畫的元件不算缺口，視為設計過剩或視覺示意，標豁免；impl 有 / design 缺的才視為真實缺口需要補 design。

Spec 範圍：本任務只盤點 design ↔ impl 兩端，spec git 不在範圍。

執行批次：B1（本檔）+ B2（DataListItem 補 design）在 branch `feat/screens-alignment-audit-2026-05-22` 同步落地。後續 B3-B6 待 review 通過後分批啟動。

---

## Screen 配對表

依「視覺上一個 screen 才列」規則，子畫面 / popover / 容器層級 impl 分檔不另列。

| Design (no1~no25 + shared) | Impl (src/screens) | 狀態 |
|---|---|---|
| no1_home_screen | Home/HomeScreen.tsx | matched |
| no2_home_filter_screen | Home/HomeFilterScreen.tsx | matched |
| no3_search_screen | Search/SearchScreen.tsx | matched |
| no4_tx_editor_screen | Transactions/TransactionEditorScreen.tsx | name_diff（tx vs Transaction）|
| no5_transfer_editor_screen | Transactions/TransferEditorScreen.tsx | matched |
| no6_settings_screen | Settings/SettingsScreen.tsx | matched |
| no7_account_list_screen | Accounts/AccountListScreen.tsx | matched |
| no8_category_list_screen | Categories/CategoryListScreen.tsx | matched |
| no9_currency_list_screen | Settings/CurrencyListScreen.tsx | matched |
| no10_currency_rate_list_screen | Settings/CurrencyRateListScreen.tsx | matched |
| no11_language_setting_screen | Settings/LanguageSettingScreen.tsx | matched |
| no12_time_zone_setting_screen | Settings/TimeZoneSettingScreen.tsx | matched |
| no13_theme_settings_screen | Settings/ThemeSettingsScreen.tsx | matched |
| no14_base_currency_setting_screen | Settings/BaseCurrencySettingScreen.tsx | matched |
| no15_launch_mode_setting_screen | Settings/LaunchModeSettingScreen.tsx | matched |
| no16_preference_screen | Settings/PreferenceScreen.tsx | matched |
| no17_data_management_screen | Settings/DataManagementScreen.tsx | matched |
| no18_account_editor_screen | Accounts/AccountEditorScreen.tsx | matched |
| no19_category_editor_screen | Categories/CategoryEditorScreen.tsx | matched |
| no20_currency_detail_config_screen | Settings/CurrencyDetailConfigScreen.tsx | matched |
| no21_currency_rate_editor_screen | Settings/CurrencyRateEditorScreen.tsx | matched |
| no22_import_screen | Settings/ImportScreen.tsx | matched |
| no23_login_screen | Auth/LoginScreen.tsx | matched |
| no24_paywall_screen | Paywall/PaywallScreen.tsx | matched |
| no25_merge_editor_screen | Merge/MergeEditorScreen.tsx | matched |

**Impl 有 / design 缺：**

| Impl | 性質 | 動作 |
|---|---|---|
| Settings/LocalizationSettingsScreen.tsx | Language + TimeZone 的容器層 screen | 補 design no26_localization_settings_screen 容器（**B3**）|

**Impl 視覺一個 screen 內部分檔（豁免）：**

| Impl | 對應 design | 理由 |
|---|---|---|
| Home/PeriodPage.tsx | no1_home_screen 內 `noN_period_page.jsx` | 視覺上 HomeScreen 內部分頁，design 已對應 |
| Home/FilterPopover.tsx | no1_home_screen 內部 popover | HomeScreen 內部 popover 元件 |
| Home/components/FocusCard.tsx | 20_components/FocusCard | impl 私有位置與 design 共用元件不一致，但功能對齊 |
| Transactions/showRecurringModeDialog.ts | no4_tx_editor 內部 logic | helper 函式非元件 |

**Impl debug-only（豁免）：**

| Impl | 理由 |
|---|---|
| Settings/DebugInfoScreen.tsx | dev-only debug 工具 |
| Settings/DebugInfoByCategoryScreen.tsx | dev-only debug 工具 |
| Settings/MockDataSettingsScreen.tsx | dev-only mock data 控制 |

design `30_screens/CLAUDE.md` 末段已主動聲明此 3 screen「dev-only 不還原」。

---

## Component 配對表

以 impl `src/components/` 33 個檔案（含 list/ 子目錄、不計 .test.tsx）為主軸反查 design 對應。

| Impl 元件 | Design 對應 | 狀態 | 動作 |
|---|---|---|---|
| AccountSelector | ✓ | matched | — |
| BottomSearchBar | ✓ | matched | — |
| CalculatorKeypad | ✓ | matched | — |
| CategorySelector | ✓ | matched | — |
| DonutChart | ✓ | matched | — |
| FloatingActionBar | ✓（含 mode='undo'）| matched + 對應關係加註 | 見「對應關係加註」段 |
| GlassView | ✓ | matched | — |
| RecurringOptions | ✓ | matched | — |
| list/ListItem | ✓ | matched | — |
| list/ListGroupCard | ✓ | matched | — |
| list/ListSection | ✓ | matched | — |
| list/ListSeparator | ✓ | matched | — |
| list/SelectionListItem | ✓ | matched | — |
| list/SelectionGridItem | ✓ | matched | — |
| list/ReorderableListItem | ✓ | matched | — |
| list/ListEmptyState | ✓ | matched | — |
| list/ListEmptyTransition | ✓ | matched | — |
| DynamicIcon + phosphorIconMap | Glyph / DynamicIconById / IconOutline / PhosphorIcon | name_diff + granularity_diff（design 4 概念 ↔ impl 2 概念）| 補 design 收斂 4→2（**B5**）|
| WheelPickerModal | StaticWheelPicker（粒度不同）| granularity_diff | 豁免 — design 視覺示意元件，impl 為 Selector 內部 helper，兩端粒度不對等 |
| **list/DataListItem** | （無）| 缺 design | **補 design**（**B2 本批已執行**）|
| AnimatedKeypad | （無）| impl_only | 豁免 — CalculatorKeypad 的 motion wrapper，工程性 |
| Snackbar | FloatingActionBar mode='undo'（對應）| granularity_diff | 豁免 — 見「對應關係加註」段 |
| UndoDebugConsole | （無）| impl_only | 豁免 — dev-only debug 工具 |
| Import/WizardStepContainer | （無）| impl_only | 豁免 — ImportScreen 私有 helper，類比 design `30_screens/shared/` 角色 |

**Impl 缺 / design 有（依「impl 為 true source」全豁免）：**

| Design | Impl 對應 | 動作 |
|---|---|---|
| Switch | （無，目前用 RN 原生 Switch）| 豁免 — 後續可獨立任務補 impl Switch wrapper（提案 A 保守，注入 theme.primary）見 **B4** |
| AmountField | TransactionEditor 內 TxAmountContainer inline / TransferEditor inline | 豁免 — impl 兩 editor 都 inline 手刻金額欄 |
| ModalCloseButton | （inline 在 screen navigation options 內）| 豁免 — impl 用 react-navigation 原生 header + inline button |
| HeaderCheckmarkButton | 同上 | 豁免 — 同上 |
| HeaderIconButton | 同上 | 豁免 — 同上 |
| HeaderButtonPill | （無）| 豁免 — design 多畫，impl 用標準 header button |
| MockBackButtonPill | （無）| 豁免 — Mock 視覺工件，design canvas 用 |
| MockNavBar | （無）| 豁免 — Mock 視覺工件，design canvas 用 |
| StaticWheelPicker | （見上 WheelPickerModal 對應）| 豁免 — 粒度不同 |

**註：** impl `src/components/no6_product_development/no2_accounting_app/CLAUDE.md` UI Coding Guideline 規定要有 `HeaderIconButton` / `HeaderCheckmarkButton` / `ModalCloseButton` 三個自訂按鈕。實際上 `src/components/` 並無對應檔（散在 screen 內 inline 寫法）。**規範與實作不一致**，本次依「impl 為 true source」豁免；後續若要把 inline 重構抽出為共用元件，另案處理。

---

## 命名差異表

| Design 名 | Impl 名 | 方向 |
|---|---|---|
| no4_tx_editor_screen | TransactionEditorScreen | design 改名 no4_transaction_editor_screen 對齊（**B6**）|
| Glyph / DynamicIconById / IconOutline / PhosphorIcon | DynamicIcon / phosphorIconMap | 豁免 — 兩端有意的設計選擇，見「Icon 系統雙端對應」加註段（**B5 取消**）|
| StaticWheelPicker | WheelPickerModal | 兩端粒度不同不強制統一，加註說明即可 |

---

## 對應關係加註

### FloatingActionBar (mode='undo') ↔ Snackbar

design `components.jsx` L979 的 `FloatingActionBar` 接受 `mode` prop。當 `mode='undo'` 時，元件渲染底部浮動的 undo bar（含 `undoMessage` / `remainingTime` / `onUndoClose` props），對應 impl 端 `Snackbar.tsx`（由 `UndoContext` 驅動，4 秒倒計時，可點復原）。

兩端粒度不同：design 一個元件涵蓋「FAB + undo snackbar」兩種 mode；impl 拆成 `FloatingActionBar.tsx`（純 FAB）+ `Snackbar.tsx`（純 undo）兩個獨立元件。功能對應、UX 概念對齊。**無需修正**，僅紀錄此對應關係供日後查找。

### Selector wraps WheelPickerModal

impl `AccountSelector.tsx` L179 與 `CategorySelector.tsx` L189 內部使用 `WheelPickerModal` 作為下拉選擇器的 modal 載體。`WheelPickerModal` 在 impl 端**不直接給 screen 使用**，只作為 Selector 元件的內部 helper。

design 端 `StaticWheelPicker` 是視覺示意元件，TransferEditor 直接用於展示「選擇器開啟狀態」。兩端粒度不同（design 是 screen-level 視覺、impl 是 component-internal helper），不強制統一。

### Icon 系統雙端對應（B5 取消）

design 端 4 個 Icon 元件（`Glyph` / `DynamicIconById` / `IconOutline` / `PhosphorIcon`）與 impl 端 2 個（`DynamicIcon` / `DynamicIconById`）的差異，**不是不對齊，是兩端有意的設計選擇**。

依 impl `src/components/DynamicIcon.tsx` 開頭註解（檔頭 L1-18）：

> Impl 端：DynamicIcon(name) — 用 PHOSPHOR_SVG_MAP 渲染 Phosphor SVG 套件；DynamicIconById(iconId) — 由 IconDefinition.json 找 def 再 dispatch 到 DynamicIcon
>
> Design 端：Glyph(name) — canvas 視覺 mock，硬寫 SVG 路徑於 switch case；DynamicIconById(id) — 由 ICON_LIBRARY 找 def 再交給 Glyph 畫
>
> 兩端共享的唯一契約：IconDefinition schema（impl `assets/definitions/IconDefinition.json` ⇔ Design `ICON_LIBRARY` 陣列，欄位 id / uniqueName / library / glyph / tags 一致）。
>
> Design 端不叫 DynamicIcon（叫 Glyph）是因為 canvas mock 與 runtime 渲染器是兩種載體，**保持不同名稱避免閱讀混淆**。DynamicIconById 名稱兩端一致，因其職責純粹是 id → icon 的 lookup，與底層渲染管道無關。

**對齊狀態：**
- ✅ `DynamicIconById` — 兩端同名同職責，已對齊
- ✅ design `Glyph` ↔ impl `DynamicIcon` — 兩端不同名但對應同角色（design 硬寫 SVG path、impl 用 PHOSPHOR_SVG_MAP），刻意命名差異避免混淆
- ✅ design `PhosphorIcon` — design canvas-only 內部 helper（CSS mask 載 svg 檔），impl 對應內含於 `DynamicIcon`
- ✅ design `IconOutline` — PeriodPage 容器視覺，design canvas-only

**結論：** Icon 系統兩端「該對齊的部分已對齊」（`DynamicIconById` + IconDefinition schema），「不該對齊的部分有意分歧」（渲染器命名與內部結構）。B5 收斂計畫於 2026-05-22 重評估後**取消**，本段為決議紀錄。

---

## 缺口處理三桶

### 桶 1: 補 design（impl 為 true source，design 缺）
- ✅ **DataListItem** — components.jsx 新增 function + Object.assign export + components-showcase.jsx List family 加 showcase（**B2 本批已執行**）
- ⏳ **no26_localization_settings_screen** — 補 design Settings/Localization 容器層 screen + router 註冊（**B3 後續**）

### 桶 2: 補 impl（design 為準，impl 缺，但本任務依「impl 為 true source」全豁免）
- ⏸ Switch wrapper — 設計選提案 A 保守包裝 RN 原生 Switch 注入 theme.primary（**B4 後續**，獨立任務）
- ⏭ 其餘（AmountField / Header 系列 / Static 系列）— 豁免，紀錄於本檔備查

### 桶 3: 命名統一（design 為主，依 impl 為 true source 調整）
- ❌ ~~Icon 系統 design 收斂 4→2~~ — **B5 取消**。重評估後確認 design 4 vs impl 2 為兩端有意設計選擇（不同渲染載體），見「Icon 系統雙端對應」加註段
- ⏳ no4_tx_editor → no4_transaction_editor 改名 + 改 router（**B6 後續**）

### 桶 4: 豁免標記（本檔記錄）
- impl: AnimatedKeypad / Snackbar / UndoDebugConsole / Import/WizardStepContainer / 3 debug-only screens
- design: HeaderButtonPill / MockBackButtonPill / MockNavBar / StaticWheelPicker（粒度差異豁免）

---

## 執行批次計畫

| 批次 | 內容 | git | 風險 | 狀態 |
|---|---|---|---|---|
| **B1** | 本檔（盤點報告 + 豁免清單）| 頂層 Product git | 零 | ✅ 本批已執行（branch `feat/screens-alignment-audit-2026-05-22`）|
| **B2** | design 補 DataListItem 到 components.jsx + showcase | Design git | 低 | ✅ 本批已執行（同名 branch）|
| B3 | design 補 no26_localization_settings_screen 容器 + router 註冊（90_workbench/app.jsx、SuSuGiGi.html、30_screens/CLAUDE.md）| Design git | 低-中 | ⏳ 待 B1+B2 review 通過 |
| B4 | impl 補 Switch wrapper（提案 A）+ 改全域 inline `import { Switch } from 'react-native'` 改用本地 Switch | Impl git | 中 | ⏳ 待 B1+B2 review 通過 |
| ~~B5~~ | ~~design Icon 4→2 收斂~~ — 取消，見「Icon 系統雙端對應」加註段 | — | — | ❌ 取消（2026-05-22 重評估） |
| B6 | design no4_tx_editor → no4_transaction_editor 改名 + 改 router（90_workbench、SuSuGiGi.html、30_screens/CLAUDE.md）| Design git | 中 | ⏳ 待 B1+B2 review 通過 |

---

## 不在本輪範圍 / 已知 open item

- **Spec git 跟進：** 本任務只動 design ↔ impl 兩端。spec git `no4_product_specs/no2_accounting_app/no2_screens/` 的 25 個 .md 是否與 design / impl 配對齊，需另案盤點。
- **30_screens/CLAUDE.md Follow-up 段所列 5 個 helper 的 component_tokens：** AmountField / StaticWheelPicker / AccountSelector / CategorySelector / RecurringOptions 尚未建立專屬 `noN_*_tokens.jsx`。屬 design 內部結構整理，不涉及對齊。
- **CurrencyRateEditor cross-currency variant、Login loading state、Paywall purchase processing state：** design 已標 follow-up，待補 variant，不影響本對齊報告。
- **`HeaderIconButton` / `HeaderCheckmarkButton` / `ModalCloseButton` impl 抽出：** impl CLAUDE.md UI Coding Guideline 規定要有此 3 元件但實際 inline 散在 screen 內。屬「impl 內部抽出共用」改動，不涉及 design 對齊，另案處理。

---

## 純度規則驗證

design `30_screens/CLAUDE.md` 已含完整「Granularity 規則」「載入順序約束」「禁止」章節，禁 raw number / 禁在 screen 檔內定義 atomic / 禁為 variant 拆檔。Phase 1 Explore agent 結論：「screens 完全從 foundations + components 構成，無發現違規」。**純度規則執行已內建於 30_screens/CLAUDE.md，本對齊任務無需另補 reviewer checklist。**
