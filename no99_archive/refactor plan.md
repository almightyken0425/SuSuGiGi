# SuSuGiGi Refactor Plan

## R1：定期操作缺少模式選擇 UI ✅ DONE (2026-04-24)

- **Spec 側：** no5 TransactionEditorScreen、no6 TransferEditorScreen 中，編輯定期的完成按鈕與定期的刪除按鈕需補充僅此一筆或此筆及未來的選擇對話框互動
- **Impl 側：** TransactionEditorScreen / TransferEditorScreen 需實作對話框，並接線至 updateSchedule 的此筆及未來模式 / deleteSchedule

> **狀態：** 2026-04-24 執行完成。Product git 於 `main` 上 commit `docs(product-map): note recurring edit scope dialog in editors`；Spec git 與 Impl git 的 `feat/r1-recurring-mode-dialog` branch 各有一個 commit，subject 與 body 完全一致為 `feat(editor): surface recurring mode dialog on finish/delete`。執行 plan 檔：`~/.claude/plans/r1-ui-sorted-stream.md`。R2 的 Spec 完成按鈕部分已併入 R1（本文件無獨立 R2 章節）。待使用者實機驗證後各層 merge 到 main。

> **編號更正：** 原寫 no4 / no5，實際檔名是 `no5_transaction_editor_screen.md` 與 `no6_transfer_editor_screen.md`。

> **Scope 調整：** R1 吸收 R2 的 Spec 完成按鈕部分。完成按鈕 編輯模式 + 定期 分支的對話框沒有可消費 mode 的下游操作，除非改呼叫 `updateSchedule`，故 R1 直接包含這個切換。規劃紀錄於 `~/.claude/plans/r1-ui-partitioned-crab.md`。

### R1-a. 上游層級審視結論（Product git）

- 提案層 `no1_product_initiation/`：**不改**。僅 `no3_business_model.md` 在 LEVEL_1 寫一行「基礎自動化：簡單的週期性交易設定」，R1 不動搖此前提。
- 需求層 `no2_product_planning/no1_requirements/no1_requirements.md`：**不改**。「定期交易機制」小節講觸發與補產生（何時生成），R1 處理作用範圍（如何修改），兩者不重疊；此行為已由 Logic Spec `no10_recurring_transactions_logic.md` 精確定義。
- 整合層 `no2_product_planning/no2_product_map/no2_accounting_app/recording_core.md`：**建議小補**。RecurringTransactions 小節已寫「支援僅此筆或此筆之後兩種範圍」，但 TransactionEditor / TransferEditor 兩子節（line 24-37、41-55）未提對話框收集作用範圍；建議各補一行：「編輯定期時透過對話框選擇僅此一筆或此筆及未來作用範圍」。
- Roadmap `no2_product_planning/no3_dev_roadmap/`：**不改**。不追蹤 UI 級 refactor。
- 專案管理 `no4_project_management/`：**不改**。僅 CSV 模組角色表，非 refactor 追蹤位置。

### R1-b. Spec 側改動細節

目標檔 `no3_product_specs/no2_accounting_app/no2_screens/no5_transaction_editor_screen.md`：

**完成按鈕 編輯模式 + 定期分支（現 86–101 行）**

現：
```
- **IF** 編輯模式:
  - 呼叫 deleteTransaction
  - 呼叫 createSchedule
```

改為：
```
- **IF** 編輯模式:
  - 顯示定期編輯模式對話框
  - **IF** 選擇僅此一筆 或 此筆及未來:
    - 呼叫 updateSchedule
```

**刪除按鈕 定期分支（現 103–111 行）**

現：
```
- **IF** 定期交易:
  - 呼叫 deleteSchedule
```

改為：
```
- **IF** 定期交易:
  - 顯示定期刪除模式對話框
  - **IF** 選擇僅此一筆 或 此筆及未來:
    - 呼叫 deleteSchedule
```

`no6_transfer_editor_screen.md` 做對稱改動（完成按鈕 編輯模式分支現 87–102 行、刪除按鈕分支現 104–112 行；`deleteTransfer → createSchedule` 改為「顯示定期編輯模式對話框 → IF 選擇 → 呼叫 updateSchedule」；刪除分支加「顯示定期刪除模式對話框 → IF 選擇」）。

**政策對齊重點：**

- 術語用「對話框」「僅此一筆」「此筆及未來」與 Logic Spec `no10_recurring_transactions_logic.md`（`updateSchedule` / `deleteSchedule` 的「選項」參數）一致。
- 模式內部分派屬 Logic 產出，Screen 只寫「呼叫」不重述「IF 選項為 X」，避免違反 `spec_writer` 的 `screen_spec_policy` 禁令。
- 對話框寫法對齊 `no10_category_editor_screen.md` 的「顯示 {名詞型} 對話框 / IF 確認…」格式。

### R1-c. Impl 側改動細節

目標檔：

- `no5_product_development/no2_accounting_app/src/screens/Transactions/TransactionEditorScreen.tsx`
- `no5_product_development/no2_accounting_app/src/screens/Transactions/TransferEditorScreen.tsx`

**可重用的既有資產（不新增組件）：**

- `Alert.alert` 3-button：原生支援，已在 `AccountEditorScreen.tsx:141-150` 與 `TransactionEditorScreen.tsx:298-337` 用於刪除確認。
- `updateSchedule` / `deleteSchedule`：`src/services/recurringLogic.ts:96-205` 與 `:207-247`，簽章已有 mode 參數。

**簽章（落地時對齊）：**

```
updateSchedule(originalScheduleId, mode: 'THIS_INSTANCE' | 'FUTURE', instanceDate, newData, targetInstanceId)
deleteSchedule(scheduleId, mode: 'THIS_INSTANCE' | 'FUTURE', targetInstanceId, instanceDate)
```

**`TransactionEditorScreen.tsx`：**

- `handleSave` (現 181–296)：編輯分支 `:262-270` 呼叫 `updateTransaction()`、新增分支 `:227-238` 呼叫 `createSchedule()`，加「編輯模式 + 是 schedule instance」判斷（透過編輯中 entity 的 `scheduleId` 或 recurring flag，以實際 data model 為準），條件成立 → `Alert.alert` 3-button → 依選項呼叫 `updateSchedule(..., 'THIS_INSTANCE' | 'FUTURE', ...)`。Cancel → 不做事不關畫面。其他三條路徑（新增一般 / 編輯一般 / 新增定期）保持不變。
- `handleDelete` (現 298–337)：現直接 `deleteTransaction(id)` (`:313`)。加 schedule instance 判斷；是 → `Alert.alert` 3-button → `deleteSchedule(...)`；否 → 維持現 2-button → `deleteTransaction`。

**`TransferEditorScreen.tsx`：** `handleSave` (現 221–336) 與 `handleDelete` (現 338–371) 對稱修改，`updateTransfer` / `deleteTransfer` 分支不變，只處理「是 schedule instance」那條。

**共用抽取（選做）：** 若兩 screen 的 3-button Alert config 重複明顯，抽 `showRecurringModeDialog(title, onPick)` helper 到 `src/screens/Transactions/` 下。

### R1-d. 驗證流程

- Dev server 起於 `no5_product_development/no2_accounting_app/`。
- 編輯 schedule instance → 完成 → 3-button：
  - 「僅此一筆」只改當筆；後續 instance 維持原內容。
  - 「此筆及未來」連帶之後 instance 變更；此筆之前不變。
  - Cancel → 停留 Editor 無動作。
- 刪除 schedule instance → 3-button → 驗 `deleteSchedule FUTURE` 把原 Schedule 的 `endOn` 往前調一週期。
- 一般交易對照：編輯 / 刪除**不應**跳 3-button。
- 新增定期：**不應**跳 3-button（走 `createSchedule`）。
- TransferEditor 對稱驗證。
- `/spec-term-audit` 對 no5 / no6 檢查新增名詞。
- TypeScript 編譯無錯。

### R1-e. 三層 git 同步

- Spec git (`no3_product_specs/no2_accounting_app/`) 與 Impl git (`no5_product_development/no2_accounting_app/`) 的 branch 名完全一致、統一 `feat/` 前綴。
- 兩層 commit subject + body 完全一致。
- 完成後把本 R1 章節標 DONE、R2 標「已併入 R1」。
- Product Map 微補（若採用 R1-a 建議）屬 SuSuGiGi 頂層 Product git，與 Spec / Impl `feat/` branch 分離，可單獨 commit。

---

## R4：Developer Section 缺乏 dev-only 保護 ✅ DONE (2026-04-24)

- **Impl 側：** `SettingsScreen.tsx` 的 Developer Section 含 Debug Info、Mock Data Settings、Mock Tier Toggle，在正式 build 中永遠顯示，無任何環境保護；以 `__DEV__` 條件包裹整個區塊

> **狀態：** 2026-04-24 執行完成。Impl git（SuSuGiGi-Impl-AccountingApp）於 `feat/r4-dev-section-env-guard` branch 單層 commit `1794682`，subject `feat(settings): guard developer section with __DEV__ flag`，已 push origin。Product git 與 Spec git 本次無改動（上游四層與 Spec 皆判定不改，理由見 R4-a / R4-b）。待使用者實機驗證 dev / release 兩側顯示差異後 merge 到 main。

### R4-a. 上游層級審視結論（Product git）

- 提案層 `no1_product_initiation/`：**不改**。無 dev tooling / debug UI / mock data 相關前提，R4 不觸及商業模式。
- 需求層 `no2_product_planning/no1_requirements/no1_requirements.md`：**不改**。無「開發者工具」「除錯」「mock 模式」等功能需求，R4 改動不動搖需求層前提。
- 整合層 Product Map `no2_product_planning/no2_product_map/app/app_setting.md`：**不改**。Product Map 描述對使用者的功能承諾；Developer Section 在 release build 中完全不存在（加 `__DEV__` 後尤甚），屬純工程 convenience，寫入 Product Map 反而造成「整合層定義 → release 看不到」的 drift。Impl 側行 88 原有註解 `{/* Developer Section (Hidden from spec but useful) */}` 亦印證此判斷。
- Roadmap `no2_product_planning/no3_dev_roadmap/`：**不改**。不追蹤 UI-level refactor / 環境保護議題。
- 專案管理 `no4_project_management/`：**不存在**。此層此產品尚未建立。

### R4-b. Spec 側改動細節

**不改。**

`no3_product_specs/no2_accounting_app/no2_screens/no8_settings_screen.md`（70 行）完全不描述 Developer Section；其線框圖僅涵蓋 Data Management、Preferences、Upgrade 三分組。Logic Spec `no3_logics/no5_settings_management.md` 亦無 mock / debug / dev mode 描述。R4 屬**純 Impl 層 refactor**。

### R4-c. Impl 側改動細節

**目標檔：**

- `no5_product_development/no2_accounting_app/src/screens/Settings/SettingsScreen.tsx`（205 行）

**改動範圍：** 行 88-139 整段 Developer Section。

**改動內容：** 外層包 `{__DEV__ && (...)}` 條件渲染。`__DEV__` 為 React Native 全域常數，release build 時為 `false`，整段 JSX tree 不會進入渲染。

**對齊 codebase 慣例：**

- `AppNavigator.tsx:327` 使用 `{__DEV__ && <UndoDebugConsole />}` — R4 採同一形式
- `appCheck.ts:23` 使用 `__DEV__ ? ... : ...` — 條件執行慣例
- 不另引新 helper / flag；Mock 機制入口 `PremiumContext.tsx` 本身不需改（`mockTier` 狀態在 release 無入口可觸發，等同惰性失效）

**Section 內部四個入口（包裹後一併受 `__DEV__` 保護）：**

- Debug Info by Account（行 93-99）→ `DebugInfo` screen
- Debug Info by Category（行 104-110）→ `DebugInfoByCategory` screen
- Mock Data Settings（行 115-121）→ `MockDataSettings` screen
- Mock Tier Toggle（行 126-137）→ 呼叫 `setMockTier`

### R4-d. 驗證流程

- Dev build（`__DEV__=true`）：Developer Section 四個入口正常顯示，功能不變。
  - Debug Info by Account / Category 可正常導航
  - Mock Data Settings 可正常導航
  - Mock Tier Toggle 按下能切換 LEVEL_0 / LEVEL_1
- Release build（`__DEV__=false`）：整個 Section（含區塊標題、divider）不渲染，下方 Version 文字位置上移、畫面無空白殘留。
- TypeScript 編譯無錯。
- 單次 build 兩側目視對照（dev vs. production mode）。

### R4-e. 三層 git 同步

- 僅 Impl git（`no5_product_development/no2_accounting_app/`）有改動，branch `feat/r4-dev-section-env-guard`。
- Product git 與 Spec git **無改動**，不開對應 branch。R-UPSTREAM-FIRST 規則下 branch 命名一致性僅適用於「有改動的層」。
- 完成後本 R4 章節標記 DONE。

---

## R5：CurrencyRateList 缺少 LEVEL_0 管控 ⏸ BLOCKED ON R9

- **Spec 側：** `no16_preference_screen.md` 的匯率管理互動目前無 LEVEL 分流；補 LEVEL_0 → PaywallScreen 的分流邏輯
- **Impl 側：** `PreferenceScreen.tsx` 的 Exchange Rate Management 入口直接導航至 CurrencyRateListScreen；加入付費牆分流判斷

> **狀態：** 規劃凍結於 2026-04-24。R5 的 Impl 寫法必須走 `canUserPerformAction('manageCurrencyRate', ...)` 才能正確表達「LEVEL_0 一律禁止、無總數 fallback」語義；但 Impl 層的 `premiumLogic.ts` 仍是舊 API `checkPremiumAccess(userId, currentTier, requiredTier)`，其 fallback 邏輯會讓 LEVEL_0 帳戶<3 且類別<10 的使用者誤入匯率管理。等 R9 Impl 完成 API 轉換後，R5 方可依本章節 R5-b / R5-c 定義執行。

> **檔名更正：** 原寫 `no15_preference_screen.md`，實際檔名是 `no16_preference_screen.md`，匯率管理互動在 line 84-85。

### R5-a. 上游層級審視結論（Product git）

- 提案層 `no1_product_initiation/`：**不改**。`no3_business_model.md` 已將外幣與匯率列在 LEVEL_1，R5 不動搖前提。
- 需求層 `no2_product_planning/no1_requirements/no1_requirements.md`：**不改**。「匯率架構」小節定義手動維護匯率的機制，無 LEVEL 限制描述；R5 的 gate 邏輯由整合層背書，此層不需動。
- 整合層 Product Map `no2_product_planning/no2_product_map/app/payment.md`：**不改**。line 134 已寫 LEVEL_0「禁用外幣帳戶」，line 142 已寫 LEVEL_1「開放外幣帳戶與匯率」，背書充分。
- Roadmap `no2_product_planning/no3_dev_roadmap/`：**不改**。不追蹤此類 UI gate refactor。
- 專案管理 `no4_project_management/`：**不存在**。

### R5-b. Spec 側改動細節（R9 解鎖後執行）

**目標檔 1：** `no3_product_specs/no2_accounting_app/no3_logics/no17_subscription_gate_logic.md`

- LEVEL 規則表 LEVEL_0「禁止動作」清單補一項：`manageCurrencyRate`
- 動作識別碼清單補一項：`manageCurrencyRate`
- `canUserPerformAction` 執行段落補 IF 分支：

  ```
  - **IF** 動作識別碼為 manageCurrencyRate:
    - **IF** 當前訂閱等級為 LEVEL_0:
      - **回傳:** 禁止
    - **ELSE:**
      - **回傳:** 允許
  ```

- 位置：緊接在 `useForeignCurrency` 分支之後（與 `createRecurringTransaction` / `triggerCloudSync` / `importData` 共同屬「LEVEL_0 一律禁止、無 fallback」類）

**目標檔 2：** `no3_product_specs/no2_accounting_app/no2_screens/no16_preference_screen.md`

- line 84-85 匯率管理互動現況為：

  ```
  - **點按匯率管理:**
    - 導航至 CurrencyRateListScreen
  ```

- 改寫為（對齊 R9 已完成的 CategoryEditorScreen spec 格式）：

  ```
  - **點按匯率管理:**
    - 呼叫 canUserPerformAction，動作識別碼 manageCurrencyRate
    - **IF** 回傳禁止:
      - 導航至 PaywallScreen
    - **ELSE:**
      - 導航至 CurrencyRateListScreen
  ```

### R5-c. Impl 側改動細節（R9 解鎖後執行）

**前提：** R9 Impl 已把 `premiumLogic.ts` 的 `checkPremiumAccess(userId, currentTier, requiredTier)` 改為 `canUserPerformAction(currentTier, actionId)`，並已在 `actionId` 分支實作中加入 `manageCurrencyRate`（LEVEL_0 回禁止、LEVEL_1+ 回允許）。

**目標檔：** `no5_product_development/no2_accounting_app/src/screens/Settings/PreferenceScreen.tsx`

- 現況（line 122-125）：

  ```tsx
  {renderItem({
       label: i18n.t('settings.currency_rates') || "Exchange Rate Management",
       onPress: () => navigation.navigate('CurrencyRateList')
  })}
  ```

- 改寫：
  - 新增 `import { usePremium } from '../../contexts/PremiumContext';`
  - 在 component 內取 `const { currentTier } = usePremium();`
  - `onPress` 改為 async handler：呼叫 `canUserPerformAction(currentTier, 'manageCurrencyRate')`，回傳禁止則 `navigation.navigate('Paywall')`，否則 `navigation.navigate('CurrencyRateList')`
- 對齊 R9 後其他呼叫點的統一寫法

### R5-d. 驗證流程（R9 解鎖後執行）

- Dev server 起於 `no5_product_development/no2_accounting_app/`
- LEVEL_0 + 帳戶<3 + 類別<10：點匯率管理 → 導 Paywall（驗證反證那條路徑不再誤允許）
- LEVEL_0 + 帳戶滿 3：點匯率管理 → 導 Paywall
- LEVEL_1：點匯率管理 → 導 CurrencyRateList
- LEVEL_2：點匯率管理 → 導 CurrencyRateList
- 其他偏好入口不受影響
- `/spec-term-audit` 對 `no16`、`no17` 檢查新增名詞
- TypeScript 編譯無錯

### R5-e. 三層 git 同步

- Spec git branch：`feat/r5-currency-rate-level-gate`
- Impl git branch：`feat/r5-currency-rate-level-gate`（同名）
- Spec / Impl 兩層 commit subject + body 完全一致
- Product Map 無改動，Product git 無 branch
- 與 R9 Impl 收尾 commit **分離**（不共用 branch）——R9 解鎖的前提是 `premiumLogic.ts` 已完成 API 轉換；R5 是新增一個 actionId + 新增一個呼叫點，邏輯獨立

---

## R6：switchTheme 缺少 theme ID 防護 ✅ DONE (2026-04-24)

- **Impl 側：** `PreferenceContext.tsx` 的 `setThemeId` 不驗證 ID 是否存在於 THEMES；傳入無效 ID 時 Settings 表仍會寫入無效值；加入 `if (!THEMES[id]) return;` 提早退出

> **狀態：** 2026-04-24 執行完成。Impl git（SuSuGiGi-Impl-AccountingApp）於 `feat/r6-theme-id-guard` branch 單層 commit `4129dac`，subject `feat(preference): guard theme id against unknown values`；已 push 並 merge 至 main（R4 先 ff merge，R6 採三方合併，合併 commit `e182360`）。Scope 擴展至雙 guard：`setThemeId` 本身加 `if (!THEMES[id]) return;`，Firestore `subscribeToUser` callback 條件擴為 `if (prefs.theme && THEMES[prefs.theme])`，兩條注入路徑皆封閉。

### R6-a. 上游層級審視結論（Product git）

- 提案層 `no1_product_initiation/`：**不改**。主題屬視覺呈現細節，不在商業模式範圍；無 input validation 原則描述。
- 需求層 `no2_product_planning/no1_requirements/no1_requirements.md`：**不改**。需求層未描述主題切換；無輸入驗證需求。
- 整合層 Product Map `no2_product_planning/no2_product_map/app/app_setting.md`（Appearance 小節 line 96-114）：**不改**。Product Map 描述「做法」（主題設計以全域 Token 管理），不描述 defensive programming；R6 的 guard 屬 Impl 技術責任。
- Roadmap `no2_product_planning/no3_dev_roadmap/`：**不改**。不追蹤 UI 防禦性 guard。
- 專案管理 `no4_project_management/`：**不存在**。

### R6-b. Spec 側改動細節

**不改。**

`no3_product_specs/no2_accounting_app/no3_logics/no5_settings_management.md` 的整檔風格**不描述 input validation**：`setLaunchMode`、`setBaseCurrency`、`setLanguage`、`setTimeZone`、`setCurrencyFormat` 等兄弟函式皆無 ID 驗證描述。R6 僅在 Impl 層加 guard，保持與 Spec 既有風格一致。

注意：line 8-11 的 `initializeTheme` 有「IF theme 不存在 → 預設」，但處理的是 Settings 表**空值**情境（首次啟動），不是「無效 ID」情境，語義不同，R6 不需對齊該 IF 分支。

### R6-c. Impl 側改動細節

**目標檔：** `no5_product_development/no2_accounting_app/src/contexts/PreferenceContext.tsx`

**改動 1：`setThemeId` 方法首行加 guard（line 251-254）**

- 現況：
  ```tsx
  const setThemeId = async (id: string) => {
      setCurrentThemeIdState(id);
      await updateSetting('theme', id);
  };
  ```
- 改為：
  ```tsx
  const setThemeId = async (id: string) => {
      if (!THEMES[id]) return;
      setCurrentThemeIdState(id);
      await updateSetting('theme', id);
  };
  ```
- 用途：堵使用者主動切換路徑（ThemeSettingsScreen 傳入無效 ID 的未來 regression）。

**改動 2：Firestore `subscribeToUser` callback 的 theme 回寫條件擴展（line 204）**

- 現況：
  ```tsx
  if (prefs.theme) setCurrentThemeIdState(prefs.theme);
  ```
- 改為：
  ```tsx
  if (prefs.theme && THEMES[prefs.theme]) setCurrentThemeIdState(prefs.theme);
  ```
- 用途：堵 Firestore 同步回來的髒資料。此路徑**不經過** `setThemeId`，直接寫 React state，若不加 guard 則改動 1 的保護會被繞過。

**對齊 codebase early-return 慣例：**

- `PreferenceContext.tsx:320` 的 `getCurrencyConfig`：`if (!currencyId) return { decimals: 2, useThousandsUnit: false };`
- `PreferenceContext.tsx:360` 的 `convertAmount`：`if (!fromId) return amount;`

R6 的 guard 形式一致（`if (!x) return;`）。

### R6-d. 驗證流程

- Dev server 起於 `no5_product_development/no2_accounting_app/`
- **正常主動切換：** 從 ThemeSettingsScreen 切 `theme1` / `theme2` → UI 立即變色、本地 DB 寫入、Firestore 同步
- **無效主動切換（模擬）：** console 呼叫 `setThemeId('bogus')` → 無任何變化（state / DB / Firestore 皆不變）
- **Firestore 正常同步：** 遠端 `prefs.theme` 設為合法 ID → 本地 React state 跟隨變更
- **Firestore 髒資料同步：** 遠端 `prefs.theme` 設為 `'bogus'` → 本地 React state 不變
- TypeScript 編譯無錯

### R6-e. 三層 git 同步

- 僅 Impl git（`no5_product_development/no2_accounting_app/`）有改動，branch `feat/r6-theme-id-guard`。
- Product git 與 Spec git **無改動**，不開對應 branch（R-UPSTREAM-FIRST 規則下 branch 命名一致性僅適用於「有改動的層」）。
- 完成後本 R6 章節標記 DONE。

---

## R7：updateSetting 無 Premium 判斷 ⏸ BLOCKED ON R9

- **Spec 側：** `no5_settings_management.md` 的 `updateUserPreferences` 無 LEVEL 分流；補「Premium 篩選」段落走 `canUserPerformAction('triggerCloudSync', ...)`，LEVEL_0 結束不寫 Firestore
- **Impl 側：** `PreferenceContext.tsx` 的 `updateSetting` 無條件呼叫 `updateUserPreferences`（Firestore 寫入），不區分方案等級；加入 `currentTier < PlanTier.LEVEL_1` 提早 return，本地 DB 寫入保留不受影響

> **狀態：** 規劃凍結於 2026-04-24。R7 的 Spec 改動須走 `canUserPerformAction('triggerCloudSync', ...)`（對齊 R9 已改的 CategoryEditorScreen / no17 spec 風格）；Impl 寫法會與 R9 Impl 的「呼叫點轉 actionId」任務交織。使用者指示凍結節奏與 R5 一致，等 R9 Impl 完成 API 轉換後，R7 方可依本章節 R7-b / R7-c 定義執行。R7 不受 R5 那種「`checkPremiumAccess` fallback 誤允許」風險影響（R7 Impl 直接比 tier 不經 `checkPremiumAccess`），純為節奏管理凍結。

### R7-a. 上游層級審視結論（Product git）

- 提案層 `no1_product_initiation/`：**不改**。`no3_business_model.md` LEVEL_0「無雲端同步」已充分背書。
- 需求層 `no2_product_planning/no1_requirements/no1_requirements.md`：**不改**。需求層不涉同步 gating 細節。
- 整合層 Product Map：**不改**。`cloud_sync.md:18-20` 已明確 Sync Engine 僅 LEVEL_1+ 啟動、Upgrade 觸發 Initial Sync、Downgrade 停 Sync Engine；`app_setting.md:88`「同步引擎同步至雲端」與 cloud_sync.md 一致，LEVEL 限制由後者背書。`payment.md:136` / `:144` 亦已明確 LEVEL_0 禁用 / LEVEL_1 開放雲端同步。三處互相呼應，R7 揭露的是**實作繞過 Sync Engine 直寫 Firestore**的旁路，屬 Impl / Spec 落地層議題，非 Product Map 問題。
- Roadmap `no2_product_planning/no3_dev_roadmap/`：**不改**。不追蹤 UI gate refactor。
- 專案管理 `no4_project_management/`：**不存在**。

### R7-b. Spec 側改動細節（R9 解鎖後執行）

**目標檔：** `no3_product_specs/no2_accounting_app/no3_logics/no5_settings_management.md`

- `updateUserPreferences` 小節（line 27-36）現況：

  ```
  - 偏好設定的 Firestore 寫入統一透過此操作執行
  - **輸入:**
    - 本次需變更的偏好設定欄位，未傳入的欄位不受影響
  - **執行:**
    - 以逐欄 dot notation 方式更新 preferences，避免覆寫整個 preferences 物件
    - 自動更新 updatedAt 為當前時間，無論傳入欄位數量
    - **IF** Firestore 寫入失敗:
      - 不拋出例外，錯誤僅記錄於 log
  ```

- 在「**執行:**」第一行之前補「**Premium 篩選:**」段落：

  ```
  - **Premium 篩選:**
    - 呼叫 canUserPerformAction，動作識別碼 triggerCloudSync
    - **IF** 回傳禁止:
      - 結束，不寫入 Firestore
  ```

- **不新增 actionId**：沿用 R9 既有 `triggerCloudSync`（語義涵蓋「寫 Firestore」），避免與 R5 新增 `manageCurrencyRate` 疊加、降低 R9 Impl 收尾 scope。
- 本地 DB 寫入（由呼叫端 `setThemeId` / `setLanguage` / `setTimeZone` / `setBaseCurrency` 等控制）不受此篩選影響。

### R7-c. Impl 側改動細節（R9 解鎖後執行）

**前提：** R9 Impl 已完成 API 轉換，`premiumLogic.ts` 提供 `canUserPerformAction(currentTier, actionId)`，且已將 `checkPremiumAccess` 介面移除。

**目標檔：** `no5_product_development/no2_accounting_app/src/contexts/PreferenceContext.tsx`

- `updateSetting` 現況（line 221-249）：

  ```tsx
  const updateSetting = async (field: keyof Settings, value: any) => {
      if (!user) return;
      const settingsCollection = database.get<Settings>('settings');
      const userSettings = await settingsCollection.query(Q.where('user_id', user.id)).fetch();

      if (userSettings.length > 0) {
          await database.write(async () => {
              await userSettings[0].update(s => {
                  (s as any)[field] = value;
                  s.updatedOn = getCurrentTimestamp();
              });
          });

          // Sync to Firestore
          const updates: Partial<UserPreferences> = {};
          if (field === 'theme') updates.theme = value;
          ...
          if (Object.keys(updates).length > 0) {
              await updateUserPreferences(user.id, updates);
          }
      }
  };
  ```

- 改動：
  - 新增 `import { usePremium } from './PremiumContext';`
  - 在 component 內取 `const { currentTier } = usePremium();`
  - 在 `// Sync to Firestore` 區塊前加 gate：若 R9 Impl 完工走 `canUserPerformAction(currentTier, 'triggerCloudSync')`；R9 Impl 完工前可暫先 `currentTier < PlanTier.LEVEL_1` 直接比
  - LEVEL_0 直接 return；本地 DB 寫入已於前段完成不受影響

- **對齊 codebase 慣例：** 與 R9 收尾時其他呼叫點（`AppNavigator.tsx`、`AccountListScreen.tsx` 等）統一 API。

### R7-d. 驗證流程（R9 解鎖後執行）

- Dev server 起於 `no5_product_development/no2_accounting_app/`
- LEVEL_0：改 theme / language / timeZone / baseCurrencyId → 本地 DB 立即寫入、UI 立即反映、**Firestore `users/{uid}.preferences` 不變**
- LEVEL_1：改同樣欄位 → 本地 DB + Firestore 皆更新
- LEVEL_2：同 LEVEL_1 行為
- 升級 LEVEL_0 → LEVEL_1 後：偏好經由 CloudSync Initial Sync 上傳至 Firestore（驗證 `cloud_sync.md:19` 的 Initial Sync 路徑仍能覆蓋 R7 前 LEVEL_0 期間累積的本地偏好變更）
- `/spec-term-audit` 對 `no5_settings_management.md` 檢查新增名詞
- TypeScript 編譯無錯

### R7-e. 三層 git 同步

- Spec git branch：`feat/r7-preference-sync-premium-gate`
- Impl git branch：`feat/r7-preference-sync-premium-gate`（同名）
- Spec / Impl 兩層 commit subject + body 完全一致
- Product Map 無改動，Product git 無 branch
- 與 R9 Impl 收尾 commit **分離**——R7 是新增一個呼叫點 gate，邏輯獨立

---

## R8：launchMode 儲存層不一致 ✅ DONE (2026-04-24)

- **決策：** 維持 launchMode 存於 AsyncStorage，明確標為「裝置專屬設定」，不跨裝置同步
- **Product Map 側：** `app_setting.md` Preference 小節補「啟動模式為例外」；LaunchModeSetting 小節改為「裝置專屬、不參與雲端同步」
- **Spec 側：** `no5_settings_management.md` 的 `setLaunchMode` 首行補「裝置專屬設定，不參與雲端同步」宣告
- **Impl 側：** 無改動。現況 AsyncStorage 行為本就符合決策結論

> **狀態：** 2026-04-24 執行完成。Product git 與 Spec git 同名 branch `feat/r8-launchmode-local-only`，commit subject / body 完全一致 `feat(preference): mark launch mode as device-local only`。Product git commit `c4117b4`、Spec git commit `f9e7637`，皆已 push origin。Impl git 無改動。待使用者 merge 兩層到 main。

> **設計洞察：** `no5_settings_management.md:40-45` 的 `setLaunchMode` 原寫「本機快取」已隱含 Spec 意圖本機專屬，與其他 setter 的「更新 Settings 表 + updateUserPreferences」明顯不同，drift 僅在 Product Map 層的文字矛盾（line 88 全局同步 vs. line 111「持久化於本地」）；R8 把此意圖正式文字化。

### R8-a. 上游層級審視結論（Product git）

- 提案層 `no1_product_initiation/`：**不改**。無 launchMode / 裝置專屬設定相關前提。
- 需求層 `no2_product_planning/no1_requirements/no1_requirements.md`：**不改**。需求層未涉裝置專屬 vs. 跨裝置偏好區分。
- **整合層 Product Map `no2_product_planning/no2_product_map/app/app_setting.md`：改**。
  - Preference 小節做法區塊（line 87-89）：補第三條「啟動模式為例外，屬裝置專屬偏好，不參與雲端同步」
  - Appearance 小節做法區塊（line 111）：「啟動模式偏好設定持久化於本地」改為「啟動模式偏好設定屬裝置專屬，持久化於本地快取，不參與雲端同步」
  - 目的：消除原 line 88 / line 111 的表面矛盾
- Roadmap `no2_product_planning/no3_dev_roadmap/`：**不改**。無 launchMode 獨立工作項。
- 專案管理 `no4_project_management/`：**不存在**。

### R8-b. Spec 側改動細節

**目標檔：** `no3_product_specs/no2_accounting_app/no3_logics/no5_settings_management.md`

- `setLaunchMode` 小節（line 40-45）現況：

  ```
  ## setLaunchMode 設定啟動模式

  - **輸入:**
    - 目標啟動模式
  - **執行:**
    - 將啟動模式寫入本機快取
  ```

- 在「**輸入:**」之前補一行宣告：`- 啟動模式為裝置專屬設定，不參與雲端同步`
- **不新增欄位** 到 Settings Model；launchMode 不進 `UserPreferences` interface
- 對齊 R8-a 的 Product Map 措辭

### R8-c. Impl 側改動細節

**無改動。**

- `PreferenceContext.tsx:282-285` 的 `setLaunchMode` 當前走 AsyncStorage（`preference_launch_mode` key）
- `PreferenceContext.tsx:141-147` 的 `loadLaunchMode` 從 AsyncStorage 讀取
- WatermelonDB Settings 表不含 launch_mode 欄位；Firestore `UserPreferences` interface 不含 launchMode 欄位
- 以上皆符合 R8 決策（維持本機專屬），**無需任何 Impl 變動**

### R8-d. 驗證流程

- 人工閱讀 Product Map 與 Spec 新措辭無矛盾、表達清楚
- `/spec-term-audit` 對 `no5_settings_management.md` 檢查新宣告「裝置專屬設定」術語
- 確認 Impl 行為不變：launchMode 改變僅寫 AsyncStorage，Firestore `users/{uid}.preferences` 不變

### R8-e. 三層 git 同步

- Product git branch：`feat/r8-launchmode-local-only`
- Spec git branch：`feat/r8-launchmode-local-only`（同名）
- Impl git：無 branch（無改動）
- Product / Spec 兩層 commit subject + body 完全一致

---

## R9：LEVEL 授權檢查改為動作識別碼式 API

- **Spec 側：** 已完成
  - `no17_subscription_gate_logic.md` 定義 `canUserPerformAction` 的 8 個動作識別碼與 LEVEL_0 規則
  - 相關 screen spec 的 IF LEVEL_0 分支已改寫為呼叫此方法
  - `no6_premium_logic.md` 移除 `checkPremiumAccess`，授權判斷交由 `canUserPerformAction`
  - **待 R5 解鎖時補完：** `no17_subscription_gate_logic.md` 需新增第 9 個 actionId `manageCurrencyRate`（LEVEL_0 禁止）；`no16_preference_screen.md` 匯率管理入口加 LEVEL 分流。詳見 R5-b。
- **Impl 側：**
  - `premiumLogic.ts` 的 `checkPremiumAccess(userId, currentTier, requiredTier)` 改為 `canUserPerformAction(currentTier, actionId)`，介面不再接收 `requiredTier`，改以 `actionId` 決定查何種上限
  - 依 `actionId` 分支實作 8 種判斷：
    - `createAccount`：LEVEL_0 時讀取當前使用者帳戶總數，小於 3 允許，否則禁止
    - `createCategory`：LEVEL_0 時讀取當前使用者類別總數，小於 10 允許，否則禁止
    - `createTransaction`、`createTransfer`：LEVEL_0 時讀取帳戶與類別總數，任一達上限則禁止
    - `useForeignCurrency`、`createRecurringTransaction`、`triggerCloudSync`、`importData`：LEVEL_0 一律禁止
    - `manageCurrencyRate`：LEVEL_0 一律禁止（與 `useForeignCurrency` 同類；R5 新增）
    - LEVEL_1 以上：所有動作一律允許
  - 呼叫點改為傳入動作識別碼：
    - `AppNavigator.tsx` 的 `handleGlobalNavigation`
    - `AccountListScreen.tsx` 新建帳戶入口
    - `CategoryListScreen.tsx` 新建類別入口
    - `TransactionEditorScreen.tsx`、`TransferEditorScreen.tsx` 的儲存流程
    - `ImportScreen.tsx` 匯入前檢查
    - `PreferenceScreen.tsx` 匯率管理入口（原本無 LEVEL gate；R5 新增）
    - `PreferenceContext.tsx` 的 `updateSetting` Firestore 寫入（原本無 LEVEL gate；R7 新增，走 `triggerCloudSync`）
  - 掃描其他引用 `currentTier` 的 screen 是否需對齊：
    - `HomeScreen.tsx`
    - `DataManagementScreen.tsx`
  - `entitlements.ts` 的 `LEVEL_2` 註解改為 Logic Engine 訂閱者，繼承 LEVEL_1 記帳 App 能力
  - 驗證 `MAX_FREE_ACCOUNTS`、`MAX_FREE_CATEGORIES` 常數仍為 3 / 10，與規格對齊

---

## R10：PostAuthLogic 雙向同步流程未實作

- **Spec 側：** 已完成
  - `no3_post_auth_logic.md` 定義 `handlePostAuth` 應依 Firestore `users/{uid}` 文件存在與否分派 `syncSettingsFromCloud` 或 `initializeNewUser`
- **Impl 側：**
  - `AuthContext.tsx` 登入後僅呼叫 `syncUserToFirestore`，缺少讀取 Firestore 用戶文件再分派的雙向流程
  - `userService.ts` 的 `syncUserToFirestore` 是單向寫入，不執行 Last Write Wins 比對
  - 需新增 `syncSettingsFromCloud`：讀取雲端 preferences 與 updatedAt，與本機 Settings 表 updatedOn 比對，遠端較新時覆寫本機
  - 需新增 `initializeNewUser`：依裝置 Locale 決定預設值，建立本機 Users / Settings 記錄與預設分類帳戶；Premium 有效時建立雲端 `users/{uid}` 文件
  - PreferenceContext 已透過 `subscribeToUser` 接收雲端變更，可作為部分基礎，但缺少登入時的「首次拉取」分派流程

---

## R11：登出未清除 Premium 快取與每日配額計數

- **Spec 側：** 已完成
  - `no2_login_logout_logic.md` 定義 logout 應清除本地 Premium 快取狀態與每日 Firestore 讀寫計數
- **Impl 側：**
  - `AuthContext.tsx` 的 logout 流程僅呼叫 `signOut`，未清除本機 Premium tier 狀態與配額計數
  - `PremiumContext.tsx` 雖在 user 變為 null 時會走 mockTier 清理，但未重置 `quotaService` 的計數
  - 需於 logout 流程中呼叫 `quotaService.reset` 並清除 PremiumContext 的快取狀態
  - 規格亦提及 `handleReLogin` 流程（重新登入時的處理路徑）需另行實作
