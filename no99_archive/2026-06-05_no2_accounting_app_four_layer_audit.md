# SuSuGiGi no2_accounting_app 四層審查報告

日期 2026-06-05 ｜ 範圍：Product / Design / Spec / Impl 四層 ｜ 方法：各層各自審查 + 跨層對齊 + 對抗式驗證

## 摘要

本次共 101 項原始發現。對抗式驗證機械統計：confirmed 57、partial 37、refuted 6。另 1 項（IAP 收據後端驗證）驗證 agent 未回判、未獨立復驗，依原始 high 嚴重度保留於 Impl 區。

兩區實列的可行動發現（confirmed＋partial，跨層重複已併）依 severity：high 22、medium 31、low 38。

最關鍵的議題：

- 幣別代碼轉 ID 在 impl 有四套實作，`transferLogic.getCurrencyId` 寫死 8 幣別、其餘 147 幣別落 default 901，跨幣別轉帳把錯誤匯率永久寫進 `currency_rates`。
- 免費額度只擋在 UI 與 navigator，mutation 層零防護，CSV 匯入與定期補產生可繞過 LEVEL_0 上限。
- IAP 收據從未送後端驗證，訂閱授權純 client 端，可被改機偽造。
- Product Map 的 CloudSync 子樹仍是已廢的 SyncEngine/ConflictResolution，與重寫後的 cloud_sync.md 嚴重脫節，誤導下游對齊。
- `analytics_pipeline.md` 被多處引為權威上游，卻完全不在 structure.md 樹與索引，是孤兒節點。
- 多幣別模式下找不到匯率時靜默回原值，支出收入合計與圓餅比例靜默錯誤、無警告。

---

## 第一區 · 各層問題

### Impl 層

**Editor 類 screen 把貨幣換算與資料完整性邏輯寫在 onPress，未下沉 service**　`high`　維度：分層職責

- 現況：`TransactionEditorScreen` 的 handleSave 在 onPress 內做金額換算與正負號；`AccountEditorScreen` 的 handleDelete 手刻帳戶加相關交易與轉帳的級聯軟刪及反向 undo；`MergeEditorScreen` 的 merge undo 快照整段在 onPress。service 層 `transactionLogic` / `transferLogic` / `mergeService` 已存在卻被繞過。
- 判斷：級聯刪除、merge 反向、金額換算都是領域與完整性邏輯，正確的家是 service 層。`localDbService.softDeleteAccount` 明文不級聯（行 47-48 註解），逼 screen 自補，等於核心一致性規則藏在 UI。確認 high。註：Transfer onPress 內重複的是單位換算，匯率數學其實已正確封裝在 `transferLogic`。
- 建議：級聯刪除抽成 `accountLogic.deleteAccountCascade` / `categoryLogic.deleteCategoryCascade`；金額換算抽成 input 正規化併入 `transactionLogic` / `transferLogic`；merge 反向抽成 `mergeService.revertMerge`。screen 只留表單狀態與呼叫。
- 證據：`no6_product_development/no2_accounting_app/src/screens/Transactions/TransactionEditorScreen.tsx`、`AccountEditorScreen.tsx`、`MergeEditorScreen.tsx`、`src/services/localDbService.ts`

**14/32 個 screen 與 2 個 component 直接 import database 繞過 service 層**　`high`　維度：模組耦合

- 現況：實際 15 個 screen 加 2 個 component 直接 import 並操作 database，寫 `Q.where` / `database.write` / `database.batch`。`AccountSelector` 與 `CategorySelector` 的查詢漏掉 user_id 過濾（service 版本有），屬實際正確性風險。
- 判斷：UI 層直接持有 database handle 是跨層洩漏。WatermelonDB 換掉或 schema 改名時，散在多個 screen 的查詢全得改。刪除語意也不一致：`DataManagementScreen` 用 markAsDeleted 全清、其餘用 deletedOn 軟刪，無單一 service 守門人。確認 high。
- 建議：建 read/write repository（或擴充 `localDbService`）涵蓋查詢與變更，screen 與 selector 一律經此層；至少先把 editor 的 find/write 與 selector 的清單查詢遷入。
- 證據：`src/components/AccountSelector.tsx`、`CategorySelector.tsx`、`src/services/localDbService.ts`

**幣別代碼到 ID 換算有四套互相矛盾的實作，transferLogic 寫死匯率表 ID**　`high`　維度：核心記帳邏輯 / 多幣別換算

> 🟢 **完成（2026-06-06）**：branch `feat/unify-currency-id-resolution`（impl 單層）已 merge 進 main（merge commit `188de36`、squash `90a0f4c`）。收斂為單一 resolver `currencyUtils.getCurrencyId`，移除寫死 switch 與持久化路徑的 901 fallback，並補 guard test。code-review 後修掉「未知幣別 throw 落在寫入之後留孤兒 transfer」（解析前移、抽 `resolveTransferCurrencyIds`）。sim-review 時另發現並順帶修掉新增外幣帳戶的 WatermelonDB nested-writer 死鎖（`AccountEditorScreen` 的 `ensureRateForNewAccount` 移到 `database.write` 外，對齊 importService Phase 1.5）。tsc／eslint／jest 綠、sim-review 在模擬器驗過 JPY 帳戶與跨幣轉帳。其餘邊角（UI 錯誤訊息誤導 + i18n、定期排程吞錯、syncEngine 省略欄位、resolver Map 索引、同未知碼互轉繞過）未動，列為後續。

- 現況：`src/services/transferLogic.ts` 的 getCurrencyId 是寫死 8 幣別的 switch（default 901）；`currencyService.ts` 與 `PreferenceContext` 改查 `Currency.json` 完整 155 幣別；`syncEngine.ts` 又自己 find 完整表 fallback 901。帳戶幣別下拉開放全 155 幣別。
- 判斷：任何牽涉其餘 147 幣別的跨幣別轉帳會命中 default 901，把錯誤的 currency_from_id/to_id 寫進 `currency_rates`。錯誤形態依情況而定：單側未列（如 AED 到 USD）寫成 901 到 840，雙側皆未列且相異才寫成 901 對 901。污染為 Append-Only 永久殘留，後續 resolveCurrencyRate 讀回髒值導致顯示換算錯誤。這是記帳 App 資料正確性核心，確認 high。
- 建議：刪除 `transferLogic` 的本地 switch，統一改用 `currencyService.getCurrencyId`（查不到回 undefined 並中止匯率寫入或報錯），移除 default 901。
- 證據：`src/services/transferLogic.ts`、`src/services/currencyService.ts`、`src/services/syncEngine.ts`

**convertAmount 找不到匯率時靜默回原金額，污染多幣別總額**　`high`　維度：資料層與同步

- 現況：`PreferenceContext.tsx` 的 convertAmount 末段找不到匯率時直接 return 原值；`PeriodDataStore.ts` 多幣別時用 convertAmount 結果累加成支出收入總額與圓餅。
- 判斷：找不到匯率時回原始外幣分值，例如 1000 日圓被當 1000 基準幣別單位直接累進。更常見的觸發路徑是 ensureRate 在無紀錄時 seed 的是 1.0，即使匯率紀錄存在，使用者沒手動設真實匯率前外幣仍以 1:1 累加。合計與圓餅比例靜默錯誤、無任何警告。單幣別使用者不受影響。確認 high。
- 建議：convertAmount 對找不到匯率回傳明確 sentinel（null 或 NaN）讓 `PeriodDataStore` 標示此筆無法換算，或在 UI 警示而非把錯誤數字算進總額；至少加 console.warn 與遙測。
- 證據：`src/contexts/PreferenceContext.tsx`、`src/services/currencyService.ts`、`src/stores/PeriodDataStore.ts`

**export/import 的 schedule 分支硬寫死 ×100、÷100，JPY/KRW 排程金額錯 100 倍**　`high`　維度：核心記帳邏輯 / 金額精度

> 🟢 **完成（2026-06-06）**：branch `feat/remove-schedule-csv`（四層協同）已 merge 進 main。不修 scale，改為整支移除排程的 CSV 匯入與匯出——code-review 查實該匯入路徑早已全失效（`analyzeCsvContent` 無 schedule 分支、每列 skip、匯入 0 筆），補齊不划算。四層下架：Product Map 移除 ImportSchedules／ExportSchedules 節點（`188c000`）、Spec 兩 screen（`0605b18`）、Design 兩 screen（`c3b5cd0`）、Impl 程式碼與 20 locale（`50112a3`）。排程（定期交易）功能本身保留。本條 finding 消因解決。

- 現況：`exportService.ts` schedule 模板金額用 `÷100`、`importService.ts` schedule 分支用 `Math.round(...×100)`。對照 `currencyUtils.ts` 的 toMinorUnits 註解明言不可寫死 ×100。同檔 transaction/transfer 分支已正確改用 toMinorUnits。
- 判斷：transaction 與 transfer 路徑已依幣別 minorUnits 正確 scale，唯獨 schedule 路徑漏改。JPY、KRW 等 0 小數幣別的定期排程模板金額，匯出被除以 100、匯入被乘 100，round-trip 與顯示全錯 100 倍。schedule 匯出格式不帶 currency 欄，正確值只能從連動 account 推導，無法自我修正。確認 high。
- 建議：schedule 分支改用 toMinorUnits / fromMinorUnits 依模板幣別 scale；補一個 round-trip guard test 涵蓋 JPY/KRW 排程。
- 證據：`src/services/exportService.ts`、`src/services/importService.ts`、`src/utils/currencyUtils.ts`

**免費額度只擋在 UI / navigator，mutation 與非 UI 寫入路徑完全繞過上限**　`high`　維度：付費配額強制點層級

- 現況：`canUserPerformAction` 全部呼叫處都在 presentation 層（`AppNavigator` 與 6 個 screen 的 onPress）。mutation 層 `transactionLogic` / `transferLogic` 與 collection.create 零 entitlement 檢查。`importService`、`recurringLogic` 直接建資料不經閘。
- 判斷：授權卡點放在 UI 擋得了正常按鈕、擋不了底層寫入。免費用戶透過匯入即可建立超過 3 帳戶 10 分類。更糟的是 `ImportScreen.tsx` 既有的 importData 檢查本身是死碼，回傳的 boolean 被丟棄、無 if、無導向 Paywall。RN 為 client，唯一可信的強制點是寫入內部，而該處完全沒有。確認 high。
- 建議：把 entitlement gate 下沉到 mutation 邊界，在 createTransaction / createTransfer 及 accounts/categories 的 create 包一層 assertCanCreate，讓 import / 定期 / UI 共用同一道關卡。UI 層檢查保留為提前導向 Paywall 的體驗優化。
- 證據：`src/services/premiumLogic.ts`、`src/services/transactionLogic.ts`、`src/services/importService.ts`、`src/services/recurringLogic.ts`、`src/screens/Settings/ImportScreen.tsx`

**訂閱真相來源純 client 端、IAP 收據從未送後端驗證，授權可被偽造**　`high`　維度：entitlement 信任邊界 / IAP 收據驗證

- 現況：`PremiumContext.tsx` 的 refreshStatus 直接用 `iapService.getAvailablePurchases` 的 productId 推導 currentTier，無伺服器交叉驗證；`AuthContext.tsx` 的 checkIsPremiumFromIAP 是第二份相同邏輯。`iapService.ts` 收據處理只留註解後直接 finishTransaction，收據未上傳。`FirestoreUser` 以 iap_entitlements_json 等明文欄位承載授權。
- 判斷：premium 與否完全由裝置端決定，後端沒有權威 entitlement。越獄、改機、mock StoreKit 都能讓 getAvailablePurchases 回傳偽造已購項，client 即升級為 LEVEL_1。再加上 mutation 層無防護，付費牆兩道防線同時缺席。
- 建議：建立後端收據驗證，由後端寫入並只信任後端回的 entitlement；client 的 IAP 查詢僅作觸發 refresh 的訊號。Firestore 的 iap_*_json 欄位改為僅後端可寫。
- 證據：`src/contexts/PremiumContext.tsx`、`src/contexts/AuthContext.tsx`、`src/services/iapService.ts`、`src/services/userService.ts`
- （註：F53 此項在輸入中無對抗式 verdict，依其原始嚴重度 high 列入，未經獨立復驗。）

**Firestore 拉取入口 subscribeToUser 用 doc.data() as FirestoreUser 寫入本地 DB，零驗證**　`medium`（部分成立）　維度：型別與外部邊界

- 現況：`userService.ts` 的 subscribeToUser 與 getUserDocument 以裸 `doc.data() as FirestoreUser` 取得遠端文件、零結構驗證，且為遠端資料流入本地的唯一活路徑。未驗證值經 syncSettingsFromCloud 與訂閱回呼原樣寫入本地 Settings DB。
- 判斷：原 finding 列舉的兩個末日症狀被既有 guard 化解、不會發生：i18n.locale 每次賦值都過 resolveSupportedLocale 白名單 clamp，無效語系退 en；未知 currencyCode 經 currencyCodeToId 回 null 後被 if 守門靜默丟棄。實際殘留風險限於 theme / timezone / language 字串以未驗證裸值持久化進本地 DB，屬資料完整性與健壯性問題，降為 medium。另 `ISSUES.md` 仍指向已刪的 processRemoteChange，需重新定位。
- 建議：在 subscribeToUser / getUserDocument 回呼加 runtime schema 驗證（zod 或手寫 guard），不合法則丟棄該次更新並記錄；同步更新 `ISSUES.md` 該條目標位置為 subscribeToUser。
- 證據：`src/services/userService.ts`、`src/contexts/PreferenceContext.tsx`、`src/ISSUES.md`

**syncEngine 模型到 Firestore 映射全程 (model as any) 取欄位，無編譯期保護**　`medium`　維度：型別與外部邊界

- 現況：`syncEngine.ts` 的 modelToFirestore 對每個欄位寫 `(model as any).xxx`，六分支皆然，函式回傳型別也標 any，全檔 47 處 any。tsconfig strict 開啟，這些是刻意的 escape hatch。
- 判斷：上傳備份是寫入遠端真相的邊界。兩端其實都有完整型別合約（WatermelonDB typed accessor 與 coreSchema interface），mapper 卻兩端皆不被檢查。若 Account.iconId 改名，typed 呼叫點會編譯失敗被修，但 `(model as any).iconId` 靜默回 undefined 寫入 Firestore。amountCents 等財務欄位同樣無保護。屬潛伏型，當前欄位一致且 merge:true 部分緩衝，定 medium。
- 建議：為各 model 定義明確 accessor 型別（或用既有 getter 而非 _raw），讓 modelToFirestore 輸出對齊 coreSchema interface 並由 tsc 驗證；移除 `SynchronizableModel._raw: any`。
- 證據：`src/services/syncEngine.ts`

**Schedule 排程併發無鎖，重入會重複產生定期交易**　`medium`（部分成立）　維度：核心記帳邏輯 / 定期排程併發

- 現況：`recurringLogic.ts` 的 generateMissingInstances 無鎖、無 in-progress 旗標，讀 lastGenerationDate 與寫入間有非原子 TOCTOU 窗口。schema 對 (schedule_id, schedule_instance_date) 無唯一約束，WatermelonDB schema 不支援 unique，DB 層擋不住重複。
- 判斷：並發呼叫兩次時可讀到同一 stale lastGenerationDate、對同一 schedule_instance_date 各 create 一筆，造成金額翻倍。但原 evidence 的觸發敘述錯誤：前景化只呼叫 refreshStatus、不觸發回填；登入加 createSchedule 也被 UI 順序隔開。真正可能的並發來源是 onAuthStateChanged 重複觸發或 mockData 與 auth callback 重疊，較少見，降為 medium。
- 建議：加 module-level 互斥鎖或 per-user in-flight Promise 去重；產生前以 (schedule_id, schedule_instance_date) 查重後才 create，並加 guard test。
- 證據：`src/services/recurringLogic.ts`、`src/contexts/AuthContext.tsx`、`src/database/schema.ts`

**generateMissingInstances 用裝置本地 today 邊界，跨時區產生日期漂移**　`medium`（部分成立）　維度：核心記帳邏輯 / 定期排程時區

- 現況：`recurringLogic.ts` 用裝置本地午夜判斷今日邊界，違反 spec no10 明文要求的使用者時區當日結束時間。問題本質是排程路徑完全不引用使用者可設定的 timeZone，與 `PeriodDataStore` 用 timezone 的作法不一致。
- 判斷：當裝置時區與使用者設定時區分歧時（最大約 16h 窗），today 邊界在錯誤時區求值，且實例落日被顯示層用使用者 tz 重新分桶造成日期錯位。但原述機制不正確：date-fns addMonths/addDays 在 local 時區運算、保留本地牆鐘時間（非 UTC 時刻），單一時區跨 DST 本地日曆日仍正確，故 UTC 戳保留原 UTC 時刻與 DST 算術漂移均不成立。維持 medium。
- 建議：排程生成改走 timeHelper 的時區感知函式（以使用者 settings.timeZone 計算當地午夜與當地今天），或在 spec 明確定義排程錨定時區，並補跨時區 guard test。
- 證據：`src/services/recurringLogic.ts`、`src/stores/PeriodDataStore.ts`

**型別模型分裂：types/index 與 coreSchema 對同一概念異名異型**　`low`（部分成立）　維度：型別與外部邊界

- 現況：`types/index.ts` 與 `coreSchema.ts` 對 Account.icon、standardCategoryId 等異型；`FirestoreUser` 在 coreSchema 與 userService 兩份定義分歧。
- 判斷：型別重複與型別債屬實，但衝突與改一處不連動的風險被誇大——分裂的型別多數是死碼。coreSchema 的 Firestore* interface 全專案無 import，modelToFirestore 回傳 any 根本不引用；types/index 的 Account/Category 也零 import。唯一活路徑 `PreferenceContext` import 的是正確的 userService 版。無可達 bug，降為 low。
- 建議：收斂成單一 Firestore 契約模組，刪重複的 `FirestoreUser`；映射集中到一層 mapper。
- 證據：`src/types/index.ts`、`src/services/schema/coreSchema.ts`、`src/services/userService.ts`

**AccountSelector 與 CategorySelector 為近乎逐行雙胞胎**　`medium`　維度：元件複用

- 現況：兩檔約 290 行近乎逐行相同（載入、resolveAutoPick、三模式渲染、styles）。auto-pick 已抽到共用 util，但 component 外殼仍整份重複。差異除實體與過濾條件外，CategorySelector 另有 type 著色與 income/expense 子標籤。
- 判斷：兩百多行兩份維護，任何 picker 行為調整都得改兩處且容易漏。屬可維護性而非正確性，維持 medium。合併需 render-slot 抽象、非單純泛型化。
- 建議：抽共用 `EntitySelector<T>`，兩個 selector 退化成薄 wrapper；或至少抽出共用的 picker render + autoPick 子元件。
- 證據：`src/components/AccountSelector.tsx`、`src/components/CategorySelector.tsx`、`src/utils/pickerAutoSelect.ts`

**交易列 row renderer 在 PeriodPage 與 SearchScreen 各手刻一份**　`low`（部分成立）　維度：元件複用

- 現況：`PeriodPage.tsx` 的 renderRecord 與 `SearchScreen.tsx` 的 renderRow 各手刻交易列，共用 `TX_LIST_TOKENS`，且 recurIconWrap 22×22 定期 chip 樣式逐字重複（連註解都對應）。
- 判斷：可抽出的是 recur chip 樣式。但兩列整體 layout 實質不同（PeriodPage 雙列在左金額在右；SearchScreen title 金額在上排、note 日期在下排）。且 CLAUDE.md 的 canonical 列元件僅規範 settings 選擇清單、未涵蓋交易列，交易列刻意用獨立 token、不屬約束範圍。實質問題僅 recur chip 樣式重複，維持 low。
- 建議：抽出共用的 recur chip 樣式子元件即可。
- 證據：`src/screens/Home/PeriodPage.tsx`、`src/screens/Search/SearchScreen.tsx`

**死碼與重複 service：settingsService 全空、localDbService 寫入函式無人用且與 transactionLogic 行為分歧**　`low`　維度：元件複用

- 現況：`settingsService.ts` 全檔 @deprecated、no-op、零引用（已被 userService 取代）。`localDbService.ts` 的 createTransaction/deleteTransaction/createAccount/softDeleteAccount/deleteItem 無人 import（只有讀 helper getAccount/getAccounts/getCategories 被用），且 createTransaction 用 Object.assign 不驗證、與 canonical `transactionLogic.createTransaction`（有 validate）行為不同。`services/firebase.ts.disabled` 為孤兒檔。
- 判斷：死碼讓讀者誤以為有兩條合法寫入路徑，實際只有後者被用且更嚴格。屬整潔度、無 runtime 風險，維持 low。
- 建議：刪除 `settingsService.ts`、`firebase.ts.disabled`；移除 `localDbService` 中未使用且重複的寫入函式，保留被引用的讀 helper。
- 證據：`src/services/settingsService.ts`、`src/services/localDbService.ts`、`src/services/transactionLogic.ts`、`src/services/firebase.ts.disabled`

**importService.executeImport baseCurrencyId 預設值 140 為錯誤 TWD ID（潛伏雷）**　`medium`（部分成立）　維度：核心記帳邏輯 / 多幣別換算

- 現況：`importService.ts` 的 executeImport 預設參數 `baseCurrencyId = 140`，註解寫 TWD，但 `Currency.json` 無 id 140，TWD 真值為 901。註解雙重錯誤——TWD 的 numericCode 也是 901。
- 判斷：這是潛伏缺陷而非現行資料損毀。executeImport 全專案唯一 runtime caller（`ImportScreen.tsx`）總是從 usePreference 顯式傳入使用者真實 base currency，故 140 default 在 production path 不可達。風險在於未來新增 caller 若漏傳會 silently 壞，且誤導註解會讓維護者誤信 140 正確。維持 medium（F40 與 F42 指向同一處，F40 視角為 low 潛伏、F42 視角為 medium，並列保留兩條觀察）。
- 建議：把預設改為 901，或更佳做法移除魔法數字、強制 caller 傳入當前 baseCurrencyId；可加 guard 從 `Currency.json` 推導 TWD id。
- 證據：`src/services/importService.ts`、`assets/definitions/Currency.json`

**PreferenceContext 兩個 observe 訂閱依賴 baseCurrencyId，頻繁重訂閱**　`low`　維度：資料層與同步 / 監聽器生命週期

- 現況：`PreferenceContext.tsx` 的 rates observe useEffect deps 為 [user, baseCurrencyId]，每次換基準幣別都 unsubscribe 重 subscribe。所有 5 個 observe 站點皆有對應 cleanup，無洩漏。
- 判斷：唯一可優化點是 rates 訂閱把 baseCurrencyId 放進 deps，使用者每改一次基準幣別就重建一次訂閱；雖會正確清理舊的，頻繁切換時有額外 churn。屬效能整潔層級、非正確性，且舊訂閱會被清、本地 query 便宜、使用者極少改基準幣別，維持 low。
- 建議：可接受現狀；若要優化，把 rates 查詢改為不綁 baseCurrencyId、在記憶體過濾。低優先。
- 證據：`src/contexts/PreferenceContext.tsx`

**migrations toVersion:2 steps 為空**　`low`（部分成立）　維度：資料層與同步 / migration 一致性

- 現況：`migrations.ts` 的 `{ toVersion: 2, steps: [] }` 空步驟為字面屬實。
- 判斷：但賦予分量的崩潰風險敘事不成立。git 史顯示原始碼即帶註解，空 v2 自始為刻意鷹架，從不存在被漏寫的真實 v1 到 v2 欄位變更。WatermelonDB 硬性禁止 toVersion 小於 2，v1 由 schema 直接建是框架強制契約。migration v2-v5 連續、maxVersion 等於 schema version，現況合法。唯一殘餘是無專屬 migration 測試，屬極小覆蓋缺口，維持 low、近 informational。
- 建議：確認 v2 確實無結構變更後，加註解說明此空 migration 的緣由，避免後人誤刪導致版本號跳號。
- 證據：`src/database/migrations.ts`、`src/database/schema.ts`

**HomeFilterContext 帳戶選取重建邏輯糾結、註解自相矛盾**　`low`（部分成立）　維度：狀態管理 / 邏輯正確性

- 現況：`HomeFilterContext.tsx` 的帳戶選取 updater 註解自相矛盾、區塊內兩子分支殊途同歸全選、單一 updater 混多情境難維護，且 selectAll/deselectAll 為死碼（context 暴露但全庫零呼叫），persisted state 註解誤導（實為純 useState）。
- 判斷：但原 finding 所稱使用者清空全選後列表一變動即被強制重置回全選的具體 bug 不成立：唯一設空的 deselectAll 未接任何 UI，toggleAccount 硬擋取消最後一個帳戶，故空選狀態實機不可達。屬 low 級維護性與死碼味道，非可預期的執行期錯誤。
- 建議：把四種情境抽成具名分支或獨立 helper，刪掉被推翻的歷史註解，讓最終策略單一可讀。
- 證據：`src/contexts/HomeFilterContext.tsx`

**useUserData 依賴 user._id 與專案其餘 user.id 欄位不一致，且為非反應式讀取**　`low`（部分成立）　維度：狀態管理 / hook 範式

- 現況：`src/hooks/useData.ts` 用 `user._id` 作條件與比對鍵，與專案其餘一律用 `user.id` 不一致，且為一次性 fetch 非 observe。執行期 `user._id` 恆為 undefined（WatermelonDB _raw 只帶 id，無處 assign _id），故守門恆 false、hook 恆回 { settings: null }，正確 key 應為 user.id。
- 判斷：但此 hook 全 src 零 caller，是 dead code，對 App 行為無實際影響，嚴重度受此封頂。另原稱型別上不一致不正確——types/index 明文宣告 _id，TS 不報錯；真正問題是型別宣告了執行期不存在的 _id 並經強轉掩蓋。維持 low。
- 建議：改用 user.id 對齊全專案；若仍保留評估直接改用 `PreferenceContext` 既有反應式 settings，移除這份平行讀取路徑。
- 證據：`src/hooks/useData.ts`、`src/contexts/AuthContext.tsx`、`src/types/index.ts`

**六個 Context 的 value 物件全部未 memo**　`low`（部分成立）　維度：狀態管理 / 不必要的 re-render

- 現況：六個 provider 的 value 物件均為行內字面值、無 useMemo/React.memo，usePreference 被 69 檔 consume。
- 判斷：這是真實但低影響的 React 效能 smell。原 evidence 三項論據不準確——`PreferenceContext` 內只有兩個 reactive observe（rates、currencyConfigs），所謂第三個 settings 訂閱實為一次性 fetch；theme 是 module-level const 的穩定查表非每 render 重算；兩個真實訂閱只在幣別匯率與設定變動時 fire，屬低頻。與 ISSUES.md 的 HomeScreen metadataVersion 強制重繪是無關的另一機制。降為 low。
- 建議：把每個 provider 的 value 以 useMemo 包起、依賴列只列真正會變的值；高頻廣消費的 `PreferenceContext` 可再拆成穩定 actions context 與會變 state context。
- 證據：`src/contexts/PreferenceContext.tsx` 等六個 context 檔

**premium 狀態存在兩份平行判定邏輯，AuthContext 與 PremiumContext 各算一次**　`low`（部分成立）　維度：狀態管理 / 真相來源重複

- 現況：`AuthContext` 與 `PremiumContext` 各自複製一份比對 PRODUCT_IDS 的 IAP 判定邏輯（DRY 違反）。
- 判斷：但 entitlement 真相來源並未分裂——全 app 付費 gating 一律讀 `PremiumContext.currentTier`，無一 consumer 讀 AuthContext 的 boolean。`checkIsPremiumFromIAP` 的結果只流入 handlePostAuth 的 _isPremium，而該參數已明示不再分流、被刻意丟棄。即使未來新增 LEVEL_2 漏改也不會造成錯誤付費判定。屬單一真相加一份被丟棄的 dead computation，降為 low。
- 建議：刪除 dead 的 `checkIsPremiumFromIAP` 與 vestigial 的 _isPremium 參數。
- 證據：`src/contexts/AuthContext.tsx`、`src/contexts/PremiumContext.tsx`、`src/services/userService.ts`

### Spec 層

**PreferenceScreen 登出呼叫未定義操作 signOut，logic 實際定義為 logout**　`high`　維度：內部一致（screen 對 logic 操作引用）

- 現況：`no2_screens/no16_preference_screen.md:100` 寫呼叫 signOut；但 `no3_logics/no2_login_logout_logic.md:18` 定義的操作為 logout，全 no3_logics 無任何 signOut heading。
- 判斷：screen_spec_policy 規定互動引用的操作名稱須已在 no3_logics 定義。signOut 在 Logic 層不存在，是懸空引用。比對所有其他 screen 的呼叫皆對得上，signOut 是整個 screen 層唯一孤例。確認 high。
- 建議：將 no16:100 的呼叫 signOut 改為呼叫 logout，與 LoginLogoutLogic 對齊。
- 證據：`no4_product_specs/no2_accounting_app/no2_screens/no16_preference_screen.md`、`no3_logics/no2_login_logout_logic.md`

**CurrencyRateEditor 呼叫未定義操作 createCurrencyRate，logic 僅有 createInitialCurrencyRate**　`high`　維度：內部一致（screen 對 logic 操作引用）

- 現況：`no2_screens/no23_currency_rate_editor_screen.md:59` 寫呼叫 createCurrencyRate；CurrencyConversionLogic（no7）只定義 resolveCurrencyRate / createInitialCurrencyRate / resolveTransferDisplay。全 repo exact grep 只命中 no23:59 一處。
- 判斷：匯率編輯器是使用者手動新增匯率的唯一入口，但引用的操作名在 Logic 層不存在。createInitialCurrencyRate 語意為為新帳戶寫初始匯率、由 AccountLogic 觸發，與手動新增匯率是不同入口。確認 high。
- 建議：在 CurrencyConversionLogic 補一個 createCurrencyRate 操作，或把 no23:59 改引用既有操作；同時釐清手動新增匯率與帳戶初始匯率是否共用同一操作。
- 證據：`no2_screens/no23_currency_rate_editor_screen.md`、`no3_logics/no7_currency_conversion_logic.md`

**data model 內指向 logic 的路徑寫成 no3_product_specs，實際為 no4_product_specs**　`medium`　維度：術語一致 / 結構合理（跨檔路徑引用）

- 現況：`no1_data_models/no1_data_models.md:212` 寫 `no3_product_specs/no2_accounting_app/no3_logics/no17_subscription_gate_logic.md`，但 specs 實際位於 `no4_product_specs`（no3 對應的是 product_designs 容器）。目標檔確實存在於 no4_ 下，照 :212 路徑找不到。
- 判斷：屬可直接驗證的事實錯誤、斷掉的交叉引用。修正措辭：:211 與 :212 用的是相同 Product-root 基準、並非不同根基準，唯一的錯是 no3_ 誤植為 no4_。另注同一誤植也出現在 `no2_product_planning/no2_product_map/app/payment.md:129`（屬 Product git）。確認 medium。
- 建議：改為 `no4_product_specs/no2_accounting_app/no3_logics/no17_subscription_gate_logic.md`，或與 :211 一致改成 module 內相對引用。
- 證據：`no1_data_models/no1_data_models.md`

**CurrencyDetailConfig 寫入 Impl 元件名與 props（ListItem / SelectionListItem / titleColor）**　`medium`　維度：跨層職責（View 越界 Impl）

- 現況：`no2_screens/no21_currency_detail_config_screen.md:61` 寫最後 Reset 列改用 ListItem 並以 titleColor 強調、非 SelectionListItem。三個詞皆為真實 Impl 工件（components/list 有 export，ListItemProps 含 titleColor，Impl screen 確實 import 並使用）。
- 判斷：cross_layer_boundary_policy 類型 3 明列元件名與 props 設計為禁止，違規範例正是新建 ListItem 承載 slot。這是全 26 個 screen 中唯一直接寫 Impl 元件名的地方。確認 medium。
- 建議：改寫成行為描述，例如 Reset 列為導向動作列、非選取列，標題以強調色呈現；元件選型與 prop 留給 Impl。
- 證據：`no2_screens/no21_currency_detail_config_screen.md`、`src/components/list/`

**undo_bar_policy 把操作引用寫成帶物件前綴的 UndoLogic.showUndo（部分成立）**　`low`　維度：跨層職責 / MVC 分層政策

- 現況：`no2_screens/shared_ui_policies/undo_bar_policy.md` 在合規範例把操作引用寫成呼叫 UndoLogic.showUndo，並擴散到 7 個編輯器 screen 行（共 11 處），成為整個 module 唯一帶 Logic. 前綴的操作引用——其餘約 50 處（含同一 UndoLogic 的 closeUndo、executeUndo）全是裸名。
- 判斷：這是真實的文件一致性瑕疵，根因在 policy 範例。但它不是 View 層字面禁止的 Service.method() 形式：該禁令原文要求點符號與括號引數並存，而 showUndo 無括號；policy 亦明文允許裸操作名引用。spec-guard hook 也不掃此形式。屬風格與一致性層級、影響低，降為 low。
- 建議：把 undo_bar_policy 的合規寫法與正文改為裸名呼叫 showUndo，並同步改 6 個編輯器 screen 的引用。
- 證據：`no2_screens/shared_ui_policies/undo_bar_policy.md`、各編輯器 screen spec

**AccountLogic 以點記法做 Logic 間呼叫（部分成立）**　`low`　維度：跨層職責 / MVC 分層政策

- 現況：`no3_logics/no15_account_logic.md:12-14` 的跨 Logic 引用用了標準標籤詞彙表外的粗體標籤，且用 `Object.method` 點記法 `CurrencyConversionLogic.createInitialCurrencyRate`，而全 no3_logics 其他跨 Logic 引用一律裸名 inline 或敘述句。
- 判斷：屬格式與標籤一致性瑕疵，非真正的層邊界越界——Logic 呼叫 Logic 本身合法。註：原 finding 兩處行號引用有誤（iapService 禁令在 :24 非 :80；:228 未明列呼叫）。降為 low。
- 建議：改為裸名 inline 句、移除粗體標籤與物件前綴，對齊 cross_layer_boundary_policy 合規範式。
- 證據：`no3_logics/no15_account_logic.md`

**LoginScreen 直接呼叫 handlePostAuth，跳過 handleLogin（部分成立）**　`low`　維度：內部一致（登入流程 screen 對 logic）

- 現況：`no1_login_screen.md:49` 引用了錯誤的操作名：應引用 handleLogin（完整登入協調者）卻寫成下游的 handlePostAuth。此單一命名錯誤同時造成 handleLogin 無 screen caller（孤兒）與互動描述偏差。
- 判斷：屬 spec 內部交叉引用 bug，但非 screen 跳過認證的流程矛盾——該呼叫被包在含操作失敗顯示登入失敗提示的分支內，可見本意即整段登入；impl 也證實登入接線正確、無行為影響。降為 low。
- 建議：把 no1:49 改為呼叫 handleLogin；handlePostAuth 由 handleLogin 內部呼叫、不由 screen 直接引用。
- 證據：`no2_screens/no1_login_screen.md`、`no3_logics/no2_login_logout_logic.md`

**PremiumContext.currentTier 僅列 LEVEL_0/1/2，缺 LEVEL_3/LEVEL_B（部分成立）**　`low`　維度：內部一致（data model 列舉 vs 商業術語）

- 現況：`no1_data_models.md` 的 currentTier 只列 LEVEL_0/1/2 並非與術語表不一致，而是正確的範圍收斂：LEVEL_3 是 web/cloud 的 AI Advisor、LEVEL_B 是 B2B Macro Data API，兩者都不是記帳 App 透過 IAP 解析持有的 runtime tier。
- 判斷：CLAUDE.md 的五級列舉是術語拼寫標準、非五級皆為本 App 有效 tier 的宣告。真正可改進處僅為文件清晰度，降為 low。
- 建議：在 currentTier 語意說明補一句 LEVEL_3/LEVEL_B 因屬 web/B2B 交付面而不列入，避免讀者自行推斷範圍。
- 證據：`no1_data_models/no1_data_models.md`

**兩個 logic 檔 LogicName 缺 Logic 後綴（部分成立）**　`low`　維度：術語一致（Logic 命名慣例）

- 現況：no3_logics 同層 20 個 LogicName 出現三種風格：帶 Logic 後綴 17 檔、Flow 後綴 1 檔（no1 AppBootstrapFlow）、無後綴 2 檔（no5 SettingsManagement、no10 RecurringTransactions）。原標題 18 檔應為 17 檔。
- 判斷：logic_spec_policy 僅要求 PascalCase、未強制 Logic 後綴，故為命名一致性問題而非硬違規。實務影響有限：跨層對應由路徑配對而非 LogicName。維持 low。
- 建議：統一後綴慣例（如 SettingsManagement 改 SettingsLogic），或在 module CLAUDE.md 明文允許多後綴並說明分界。
- 證據：`no3_logics/no5_settings_management.md`、`no3_logics/no10_recurring_transactions_logic.md`

**ImportWizard 執行匯入未引用任何具名 Logic 操作（部分成立）**　`low`　維度：內部一致（screen 對 logic CSV 匯入）

- 現況：CSV 匯入匯出整族在 Spec 無 Logic 層落點，非 ImportWizard 單一畫面問題。ImportWizard 的執行匯入與 DataManagement 的三個執行匯出都用裸敘述、皆無具名 Logic 操作、no3_logics 也無對應 CSV 單表 heading（僅有 JSON ZIP 的 export/importFullBackup）。
- 判斷：原文以 DataManagement 呼叫 importFullBackup 作正面對比不準——該引用只屬 JSON ZIP 還原路徑。另 subscription_gate 已定義的 importData 付費 gate 在兩畫面 screen spec 亦未引用。維持 low。
- 建議：在 Logic 層補一個 CSV 匯入操作並讓 screen 引用，或明文承認 CSV 族採淺規格。
- 證據：`no2_screens/no15_import_wizard_screen.md`、`no2_screens/no14_data_management_screen.md`

### Design 層

**Calendar Dialog（第 13 個 component token）未進治理文件，多份數字漂移**　`medium`（部分成立）　維度：canvas 可運行（文件 vs 工件一致性）

- 現況：Calendar Dialog（no13）已完整建置且可運行（token + visualizer + section + app.jsx FOUNDATIONS_GROUPS 均註冊），但多份治理文件未同步：`10_foundations/CLAUDE.md` 寫 5 group × 22 leaf、TOC 表只列 no1-no12 漏 no13、另寫過時的 97 phosphor SVG；`visualizers/CLAUDE.md` 分層樹只到 no12；`README.md` 三處過時；`app.jsx` header 過時。實際正確值：component token 13、screen 26、icon 205。
- 判斷：屬文件漂移與治理一致性問題，canvas 本身可運行、無 runtime 破壞。修正原 finding 兩處不準——evidence (c) 不成立（component_tokens/CLAUDE.md 無 no1–no8 載入順序字串）；多處 line number 偏移。維持 medium（涉及自稱權威來源、影響跨層對齊判斷）。
- 建議：一次性同步把 Calendar Dialog 補進各治理文件 TOC 與 leaf 計數、載入順序、分層樹，並更正 97/8/22 三組過時數字為 205/13/26。
- 證據：`no3_product_designs/no2_accounting_app/project/10_foundations/CLAUDE.md`、`visualizers/CLAUDE.md`、`README.md`、`90_workbench/app.jsx`

**ImportScreen 內嵌自繪時區 wheel，硬寫 raw 尺寸與 opacity（部分成立）**　`low`　維度：screen 純度

- 現況：`project/30_screens/no22_import_screen/no2_subsections.jsx` 的時區 wheel 在 JSX 內硬寫 raw 尺寸（height 180、top 72、height 36）與五行 opacity，無 screen token 也無 literal 標記，違反 30_screens/CLAUDE.md 禁直接寫 raw number 純度規則；同 repo 已有 StaticWheelPicker 與 STATIC_WHEEL_PICKER_TOKENS 模擬同一個 native Picker，本可複用而未複用。
- 判斷：純度違規與未複用既有 stub 成立。但原 finding 把它升級為同 app 兩種 wheel dim 程度的視覺不一致來源屬誇大：兩者皆 canvas-only 視覺 stub、不下傳 impl，impl 端 Picker 無任何 opacity 值、dim 由 iOS 原生渲染，shipped app 無實際視覺差異；數值差異本質是 3 行 stub vs 5 行 stub 的保真度漂移。降為 low。
- 建議：改用 StaticWheelPicker 元件，或把 wheel 的尺寸與 dim opacity 收進 IMPORT_SCREEN_TOKENS 並對齊既有值；無法對齊的視覺校準值補 literal 註解。
- 證據：`project/30_screens/no22_import_screen/no2_subsections.jsx`

**no13_calendar_dialog_tokens.jsx 漏 Object.assign export（部分成立）**　`low`　維度：component_tokens 完整 / canvas 可運行

- 現況：`no13_calendar_dialog_tokens.jsx` 確實缺檔尾 `Object.assign(window, { CALENDAR_DIALOG_TOKENS })`，是 13 個 component_tokens 檔中唯一缺的，違反 component_tokens/CLAUDE.md 約定，應補上以維持一致性。
- 判斷：但這只是約定一致性瑕疵、非運行風險：babel-standalone 把每個 script 編譯後注入全域作用域、react/env preset 無 targets 會把 const 降級為 var。no13 本身以裸識別字引用 SPACING/RADIUS/TYPOGRAPHY 且能正常運行，已證明裸 const 跨檔當全域是 sandbox 既有運作契約；所有消費端都用裸名、無一走 window.X，故缺 window 掛載對現行 canvas 零影響。降為 low。
- 建議：在檔尾補 `Object.assign(window, { CALENDAR_DIALOG_TOKENS })`，與其餘 12 個對齊。
- 證據：`project/10_foundations/component_tokens/no13_calendar_dialog_tokens.jsx`

**DEFAULT_THEME 與 DEFAULT_THEME_ID 在 canvas 零消費（部分成立）**　`low`　維度：foundations token 健康度

- 現況：`no1_atomic_tokens.jsx` 的 DEFAULT_THEME_ID / DEFAULT_THEME 在 design canvas 自身渲染中確實零消費（showcase 直接讀 THEME_1/THEME_2/THEMES）。
- 判斷：但兩者並非 dead export，是 foundations 設計標準面與 impl theme.ts 的 mirror export 對。impl 端 DEFAULT_THEME_ID 被 PreferenceContext 在 production 5 處消費，DEFAULT_THEME 被 10 個元件 test 檔消費。屬 design canvas 自身不渲染、但作為 impl 對齊面有效的 token，不是殘留 dead export。降為 low。
- 建議：真正偏薄的只有 DEFAULT_THEME（非 _ID）在 impl 僅 test 與 back-compat 用，可考慮標註用途；DEFAULT_THEME_ID 應保留。
- 證據：`project/10_foundations/no1_atomic_tokens.jsx`、`src/contexts/PreferenceContext.tsx`、`src/constants/theme.ts`

**IconOutline 為 orphan 元件：已 export 但全 repo 0 引用**　`low`　維度：元件純度

- 現況：`components.jsx` 定義並 export 的 IconOutline，全 repo 0 處 JSX 使用，且無 showcase。澄清兩點措辭——其用途並非被 home 內聯取代，而是 design 與 impl 兩端一向各自內聯（design 用 DynamicIconById；impl 用無 border 的 sectionIconOutline View），IconOutline 元件從未接線；孤兒的僅是元件本身，ICON_OUTLINE_* token 群仍被大量重用、非死碼。
- 判斷：約 13 行、token 對齊、無行為風險、無視覺分歧風險的小 wrapper 死碼，僅屬整潔度與 showcase 覆蓋率輕微違規。確認 low。
- 建議：確認 impl 端是否仍有對應元件：若兩端皆無用，刪除 IconOutline；若保留，補一個 showcase artboard。
- 證據：`project/20_components/components.jsx`、`no1_home_screen/no3_subsections.jsx`

**DataListItem 有 showcase 但無真實 screen 消費，且 showcase 標籤宣稱用途與事實不符**　`low`　維度：canvas 可運行 / 元件純度

- 現況：`components-showcase.jsx` 渲染 DataListItem，label 稱用於 AccountList / CategoryList。但 grep DataListItem 於整個 30_screens 0 命中；兩個 list 畫面實際用的是 ReorderableListItem。impl 端也沒有任何 screen 消費 DataListItem。
- 判斷：label 宣稱的兩個消費點在 design 與 impl 兩層皆不存在，對後續 design 對 impl 跨層元件對應比對會給出錯誤線索。但矛盾可自我發現（同檔 ReorderableListItem showcase 正確標 AccountList/CategoryList），blast radius 小。屬真實但輕微、低影響的 showcase 標註不實。確認 low。
- 建議：修正 showcase 的 CompLabel，改為 DataListItem 的真實或預期消費點，或標明 library 元件、當前 design 畫面未使用、對齊 impl。
- 證據：`project/20_components/components-showcase.jsx`、`no7_account_list_screen/no2_subsections.jsx`、`no8_category_list_screen/no2_subsections.jsx`

**design no26 entry 檔名前綴與其餘 25 screen 不一致**　`low`　維度：screen 命名一致性

- 現況：`30_screens/no26_localization_settings_screen/` 內 entry 檔為 no26_ 前綴；其餘 25 個 screen 資料夾的 entry 檔皆 no1_ 前綴。不影響 render（SuSuGiGi.html 用實際檔名載入），但破壞每個 screen 資料夾 entry 一律 no1_ 起算的目錄慣例。
- 判斷：純命名規約偏差。且這張畫面本身已是 localization 分歧的當事者，留怪名會加重未來整理時的誤判。確認 low。
- 建議：若 localization hub 決定保留，把 entry 檔名正規化為 no1_localization_settings_screen.jsx；若決定刪除該 hub，本項隨之消除。
- 證據：`project/30_screens/no26_localization_settings_screen/no26_localization_settings_screen.jsx`

### Product 層

**structure.md 的 CloudSync 子樹整段過時，與 cloud_sync.md 內容完全脫節**　`high`　維度：Map 結構完整

- 現況：`structure.md:57-61` CloudSync 樹為 SyncEngine 到 BatchSync/ConflictResolution 加 QuotaManagement；但 `app/cloud_sync.md` 已整檔改寫成 L2 PreferenceSync / L3 TransactionBackup / L4 FullBackupExport backup 模型。樹裡的舊節點在 cloud_sync.md 已不存在，新層完全沒進樹。
- 判斷：structure.md 是任何任務的入口與找模組歸屬先讀的唯一導航圖。任何人照樹找 CloudSync 會找到一套已廢棄架構，下游對齊會對到錯的節點名。波及面比原 evidence 更廣：`app/index.md:9` 同樣殘留過時描述。非 100% disjoint（QuotaManagement 是唯一共存節點）。確認 high。
- 建議：把 structure.md 的 CloudSync 子樹改成 L2/L3/L4 三軌與 cloud_sync.md 對齊，移除舊節點；同步修 app/index.md 過時描述。
- 證據：`no2_product_planning/no2_product_map/structure.md`、`app/cloud_sync.md`、`app/index.md`

**analytics_pipeline.md 是完整 R1 module 檔卻完全未列入 structure.md 樹與索引**　`high`　維度：Map 結構完整

- 現況：`cloud_service/analytics_pipeline.md` 存在且為實體檔（4 子節點，標 R1 拍板）。但 structure.md 的 Cloud Service 區塊只有 AIAdvisor/Backend 與 MacroData，無 AnalyticsPipeline；索引表與 map CLAUDE.md cloud_service 欄也漏此檔。同時 cloud_sync.md 與 macro_data.md 都把它當權威引用。
- 判斷：一個被多處引為唯一真相、承載 BigQuery 鏡像與 analyticsConsent filter 的核心架構 module，在導航樹與索引裡完全隱形。ConsentSync 寫 preferences.analyticsConsent 是分析退出機制需求的真正落點，卻無法從 Map 樹追溯。確認 high。
- 建議：在 structure.md Cloud Service 區塊補 AnalyticsPipeline 節點與四個子節點，並在索引表與 CLAUDE.md cloud_service 行補 `analytics_pipeline.md`。
- 證據：`no2_product_planning/no2_product_map/cloud_service/analytics_pipeline.md`、`structure.md`、`no2_product_map/CLAUDE.md`

**RedeemCodeScreen 已正式決議不做，卻仍同時殘留在 structure.md 與 payment.md**　`high`　維度：需求到 Map 追溯

- 現況：memory 記 2026-06-03 確認序號兌換不做、只走原生 IAP。但 `structure.md:70` 仍列 RedeemCodeScreen 於 Payment 樹；`payment.md:5` 與 :35-47 完整 RedeemCodeScreen 段仍在；index.md:11 與 structure.md:130 摘要也仍寫序號兌換。需求層只談原生 IAP，從未提序號兌換。
- 判斷：孤兒節點兩頭不對：上游需求從未要求、下游已決議不做且 Spec/impl 本就無此功能，唯獨 Product Map 還把它當正式 Payment 子模組。Map 作為整合層應反映最新決策，現狀會讓讀 Map 的人誤以為序號兌換在範圍內。確認 high。
- 建議：移除 structure.md:70 與 payment.md:5/35-47 整段（或明確標記為已排除模組，比照 SharedLedger 放 ExcludedModule），同步修 index.md:11 與 structure.md:130 摘要。收尾後刪該則 memory。
- 證據：`structure.md`、`app/payment.md`、`app/index.md`、memory `project_susugigi_redeem_code_dropped.md`

**WebConsole 的 LEVEL 歸屬：提案層屬 LEVEL_2，Map 索引卻標 LEVEL_1（部分成立）**　`medium`　維度：LEVEL 分級定義自洽

- 現況：`business_model.md:42-44`（LEVEL_2 區塊）與 Product Map `structure.md:131`（標 LEVEL_1）對 WebConsole 的付費層級標註不一致，且 business_model 為 CLAUDE.md 指定的 LEVEL 商業定義權威，理應以 LEVEL_2 為準。
- 判斷：但這是文件層 pricing-tier 標籤矛盾，非閘控邏輯矛盾：WebConsole 在 Spec/Impl 完全不存在，且屬獨立 Web 平台、不受 App 的 PremiumFeatureGate 約束；App 側閘控採大於等於 LEVEL_1 即允許、LEVEL_1 與 LEVEL_2 在 App 視角能力相同，故無下游閘控行為分歧。降為 medium。
- 建議：對齊 structure.md 索引的 LEVEL 標註（改為 LEVEL_2 或註明 WebConsole 隨 Logic Engine LEVEL_2 解鎖），非調整任何 gate 邏輯。
- 證據：`no3_business_model.md`、`structure.md`

**app/index.md 七個 module 連結全部指向不存在的 hyphen 檔名**　`medium`　維度：Map 結構完整

- 現況：`app/index.md` 的 7 條 module 連結中，5 條（recording-core.md 等 hyphen 命名）與 underscore 實體檔不符而 404；僅 auth.md、payment.md 可用。此檔由 map CLAUDE.md 指定為做 App 任務的入口。同目錄 structure.md 索引用正確 underscore 連結。
- 判斷：入口檔的模組連結幾乎全斷，點任何一個多字模組都 404。雖不影響規劃邏輯本身，但破壞 Map 作為導航工具的可用性，且與 structure.md 命名不一致。確認 medium。
- 建議：把 app/index.md 的 hyphen 連結改為 underscore，與實體檔名及 structure.md 索引一致。
- 證據：`no2_product_planning/no2_product_map/app/index.md`、`structure.md`

**payment.md 引用 Spec 路徑層號寫錯（no3_product_specs 應為 no4_product_specs）**　`medium`　維度：Map 結構完整

- 現況：`payment.md:129` 把 Spec 容器層號 no4 誤寫為 no3，目標檔 no17_subscription_gate_logic.md 真正位於 no4_product_specs 下。照字面引用會落到不存在的路徑（死路）。
- 判斷：LEVEL 能力清單明確要求下游引這個檔做動作識別碼，路徑錯會讓 spec/impl 對齊斷鏈。修正措辭：並非如原述會誤入 designs 目錄（no3_product_designs 下無對應結構）。確認 medium。
- 建議：把 `payment.md:129` 的 no3_product_specs 改為 no4_product_specs。
- 證據：`no2_product_planning/no2_product_map/app/payment.md`

**DataManagement/DataImport/DataExport 同時掛 RecordingCore 與 AppSetting 兩個父節點**　`medium`　維度：Map 結構完整

- 現況：`structure.md` 內 DataManagement / DataImport / DataExport 三節點名同時掛在 RecordingCore（16-18）與 AppSetting（26-37）底下。兩棵子樹定義發散：recording_core 版扁平兩節點泛述 CSV；app_setting 版較豐富（細分交易/轉帳/定期、五步 Wizard、含 ClearDatabase）。
- 判斷：同一份 CSV 匯入匯出能力被建模成兩個父模組底下兩棵子樹，職責歸屬不明。無任何文件消歧此重名是刻意分層。下游要決定畫面與邏輯掛哪個 module 時缺乏權威依據。確認 medium。
- 建議：決定 CSV 資料操作的唯一 owner（實作落點通常在設定頁），把另一處改為引用或移除重複子樹，讓 structure.md 單一歸屬。
- 證據：`no2_product_planning/no2_product_map/structure.md`、`app/recording_core.md`、`app/app_setting.md`

**FocusFilter 與 LocalDatabase 兩個節點存在於 module .md 但缺席 structure.md 樹**　`medium`　維度：Map 結構完整

- 現況：`home_dashboard.md:68-85` 定義 FocusFilter（圖表來源切換、與 FilterSystem 共用篩選狀態），但 structure.md 的 HomeDashboard 樹無此節點。LocalDatabase 在 `logic_engine.md:1-13` 為檔首獨立 section（WatermelonDB 本機層），但 structure.md 全樹無此節點、index.md 也無。
- 判斷：FocusFilter 是 HomeDashboard 主內容區構成元件，不在樹上等於下游照樹盤點會漏。LocalDatabase 是本機資料庫需求 WatermelonDB 決議的落點、被多處依賴，卻既不在樹也不在 index、還寄生在 logic_engine.md（歸檔位置怪）。確認 medium。
- 建議：structure.md HomeDashboard 下補 FocusFilter；樹中補 LocalDatabase 節點（建議獨立成 app 視角的基礎設施節點），並在 index.md 對應補列。
- 證據：`app/home_dashboard.md`、`app/logic_engine.md`、`structure.md`

**Roadmap 把 LEVEL_0/1/2 三個付費層的功能全部塞進單一 MVP 標題（部分成立）**　`low`　維度：Map 到 Roadmap 覆蓋

- 現況：Roadmap MVP 區塊把 LEVEL_2 的 LogicEngine 功能（規則中心、填空規則、規則開關、時光機）折進 MVP，與 Product Map index.md 標註的 LEVEL_2 未實作及 business_model 將 Logic Engine 列為獨立段落不一致，宜把這 4 行移出或標註層級。
- 判斷：至於 LEVEL_0 加 LEVEL_1 的記帳雲端外幣定期功能併在 MVP，吻合 business_model 自身把 LEVEL_0 與 LEVEL_1 併於記帳 App 同一段的分組，非缺陷。原主張三個付費層無差別並列、失去發布優先序誇大——business_model 全文無發布順序語言。降為 low。
- 建議：把 LogicEngine 那 4 行移出 MVP 或標註 LEVEL_2。
- 證據：`no3_dev_roadmap/no3_dev_roadmap.md`、`app/index.md`、`no3_business_model.md`

**CloudSync 的 L2/L3/L4 backup 軌道標籤與 LEVEL_2/LEVEL_3 訂閱層級視覺撞名（部分成立）**　`low`　維度：Map 結構完整 / 術語規範

- 現況：CloudSync 的 backup 軌道用 L2/L3/L4 命名，與付費層級 LEVEL_0~3 共用 L 加數字形態，構成純視覺命名形態的可讀性 nit。
- 判斷：但這不是術語規範違規：CLAUDE.md 的禁止替代寫法只規範付費等級概念須寫成 LEVEL_x，而 L2/L3/L4 是 backup 軌道名、從不指代付費層。實際易混的 L3 vs LEVEL_3 在 cloud_sync.md 從未同檔出現；該檔 L3 含 LEVEL_0 反而消歧義。降為 low。
- 建議：若要消形態撞名，可把 backup 軌道改非 L 前綴命名（如 Track-A/B/C 或直接用功能名），屬可選優化、非合規問題。
- 證據：`app/cloud_sync.md`、`app/app_setting.md`

**firebase/storage.md 為僅待定義一行的空殼節點**　`low`　維度：Map 結構完整

- 現況：`firebase/storage.md` 實體內容僅 # Storage 加功能加待定義。但 structure.md:90、索引表（:134）、map CLAUDE.md 都正式列 Storage 為 Firebase 三大 module 之一、摘要寫 Firebase 資料備份儲存。同層 authentication.md、firestore.md 皆有完整內容。
- 判斷：Storage 被當正式 module 列進三處索引並給摘要，實體卻只有待定義。對照 L4 FullBackupExport 已明確排除 Firebase Storage 上傳，此節點用途不明（預留還是殘留不清楚），會誤導盤點者。確認 low。
- 建議：若 Storage 暫無用途，明確標註待定義或保留狀態；若確定不用，考慮移除或歸入 ExcludedModule。
- 證據：`no2_product_planning/no2_product_map/firebase/storage.md`、`structure.md`

---

## 第二區 · 對齊缺口

### logic 軸

結論：logic 層整體可運作，但 spec 的具名操作模型與 impl 的實際落點普遍漂移——多個 spec 操作折疊進 store 或 context 而無具名函式，且有兩條真正的資料正確性缺口（幣別 ID 寫死、entitlement 強制點放錯層）混在其中。

**TransferLogic 的 getCurrencyId 硬寫死 8 幣別 default 901，與 currencyService 完整表分裂**　`high`　維度：行為漂移（幣別 ID 解析）

- 現況：`src/services/transferLogic.ts` 的 getCurrencyId 是 8-case 寫死 switch（default 901），與 `currencyService` 的完整 155 幣別表查詢分裂。對 8 個寫死幣別兩者一致，但帳戶幣別下拉開放全 155，故任何牽涉其餘 147 幣別的跨幣別轉帳會命中 default 901。
- 判斷：把錯誤的 currency_from_id/to_id 寫入 `currency_rates`。錯誤形態依情況而定：單側未列寫成 901 到 840，雙側皆未列且相異才寫成 901 對 901。污染為 Append-Only 永久殘留，後續 resolveCurrencyRate 讀回髒幣別對導致顯示換算錯誤。確認 high。
- 建議：transferLogic 改用 `currencyService.getCurrencyId`（查不到回 undefined 並中止匯率寫入或報錯），移除 default 901。註：syncEngine 亦有 901 fallback（查完整表 miss 後才退），901 default 非 transferLogic 獨有，但 transferLogic 在 147 幣別未查表即 miss、範圍嚴格更大。
- 證據：`src/services/transferLogic.ts`、`src/services/currencyService.ts`、`no3_logics/no8_transfer_logic.md`

**FullBackupLogic 整支未實作，JSON ZIP 全量備份完全缺席**　`high`　維度：spec 寫了 impl 沒做

- 現況：spec `no20_full_backup_logic.md` 定義 exportFullBackup 與 importFullBackup（序列化全量 entity 到壓 ZIP 到 OS Share Intent、import 走五步 Wizard 加版本檢查）。impl 全 repo grep zip/FullBackup 零命中；services 只有 CSV 單表。
- 判斷：這是需求層拍板的功能。requirements 與 business_model LEVEL_0 都明列 JSON ZIP 全量檔加 CSV 單表。impl 只做了 CSV 一半，JSON ZIP 全量遷移、誤刪保險、隱私退出三個用途全部落空。package.json 雖宣告 jszip，但 src 對它零 import。確認 high。
- 建議：確認 FullBackupLogic 是否排入 roadmap；若仍要做，新增 fullBackupService。若決議不做，回 spec 標 deferred 並同步 business_model 能力清單。
- 證據：`no3_logics/no20_full_backup_logic.md`、`src/services/exportService.ts`、`src/services/importService.ts`

**SubscriptionGateLogic：triggerCloudBackup 與 triggerMultiDeviceSync 被併成單一 triggerCloudSync**　`medium`（部分成立）　維度：行為漂移 + entitlement 缺口

- 現況：Spec 列 10 個動作識別碼（含分離的 triggerCloudBackup 全 LEVEL 允許、triggerMultiDeviceSync L0 禁止），impl `premiumLogic.ts` 只有 9 個、把兩者併成 spec 未定義的單一 triggerCloudSync 並對 LEVEL_0 一律 return false——這是真實的 spec 對 impl 列舉動作集合不一致。
- 判斷：但原宣稱的免費版雲端備份授權點被擋、行為與 spec 相反不成立：triggerCloudSync 是死碼，全 src 無 caller；真正的雲端備份走 syncEngine.sync()，由 PremiumContext 對所有登入用戶無條件觸發（不查 tier），免費 LEVEL_0 照樣備份。故問題本質是 spec drift 加潛在陷阱，非當前 runtime 危害，降為 medium。
- 建議：impl 補回兩個識別碼 triggerCloudBackup（return true）與 triggerMultiDeviceSync（L0 false），或在 spec 註明合併決策並改寫規則表。
- 證據：`no3_logics/no17_subscription_gate_logic.md`、`src/services/premiumLogic.ts`、`src/contexts/PremiumContext.tsx`

**canUserPerformAction 只在 UI/navigator 設防，mutation 層與非 UI 寫入路徑繞過上限**　`medium`（部分成立）　維度：entitlement 強制點與 spec 守門範圍不符

- 現況：entitlement 強制只貼在 UI/navigator 層，mutation 層與 premiumLogic 以外的 service 對 canUserPerformAction 零呼叫——此架構漂移屬實。
- 判斷：但實際 runtime 唯一裸奔路徑是開 App 自動跑的 generateMissingInstances，且僅在曾 LEVEL_1 建立 schedule 後降回 LEVEL_0 時持續越過上限；CSV 匯入路徑的 UI 入口已設 importData 閘。性質為純營收洩漏、非安全或資料完整性問題，且 payment.md 上游已明示接受 client-side 繞過風險。降為 medium。
- 建議：把上限檢查下沉到 mutation service 或在 import/recurring 寫入前補 gate；若維持 UI-only 是刻意決策，於 spec 明文限定強制點範圍。
- 證據：`src/services/premiumLogic.ts`、`src/services/transactionLogic.ts`、`src/services/recurringLogic.ts`、`src/contexts/AuthContext.tsx`

**CategoryLogic 與 AccountLogic 無 canonical service，CRUD 全手刻在 editor/list screen**　`medium`（部分成立）　維度：spec 是 service、impl 散在 screen

- 現況：CategoryLogic 與 AccountLogic 在 spec 定義為 logic 操作，但 impl 無實際使用的 canonical service 層，CRUD（含級聯軟刪、禁改 type、reorder 批次、手刻反向 undo）整段內嵌於 editor/list screen——與 transaction/transfer/recurring/merge 皆有 service 形成非對稱。
- 判斷：修正兩點——帳戶側 localDbService 有 createAccount/softDeleteAccount 但屬死碼，真正 create/delete 仍 inline；any 污染只有 transfer 的 (rec: any) 真正源自缺層。屬維護負債與架構一致性缺陷，非 runtime/安全問題。降為 medium。
- 建議：抽 `categoryLogic.ts` / `accountLogic.ts` service，比照 transactionLogic 收斂 CRUD 與級聯軟刪；screen 只呼叫 service。
- 證據：`src/screens/Categories/CategoryEditorScreen.tsx`、`src/screens/Accounts/AccountEditorScreen.tsx`、`src/services/localDbService.ts`

**HomeReportLogic 落在 PeriodDataStore，無 buildPeriodReport 邊界**　`medium`　維度：行為漂移（函式邊界）

- 現況：spec `no13_home_report_logic.md` 定義 assignChartColors（門檻 5/6、截止點規則）與 buildPeriodReport 為具名操作。impl 在 `PeriodDataStore.ts` 內嵌（buildPieFromCatMap closure），無具名函式，整段融進 processData。色票規則數值與 spec 一致。
- 判斷：行為核心對得上，但 spec 把 HomeReportLogic 定為兩個具名 logic 操作、impl 是 store 內單例的私有計算、無對外 logic 邊界，且落在 src/stores 不符配對表的 contexts/services/hooks。屬層歸屬與函式邊界漂移，且無任何 test pin 住。確認 medium。
- 建議：至少抽出 assignChartColors 為純函式（便於 spec 對應與測試）；或回 spec 註明 HomeReportLogic 由 PeriodDataStore 實現、不拆兩函式。
- 證據：`no3_logics/no13_home_report_logic.md`、`src/stores/PeriodDataStore.ts`

**PreferenceSyncLogic 三個操作無具名 impl，全折疊進 syncEngine/userService/PreferenceContext**　`medium`　維度：spec 是獨立 logic、impl 折疊

- 現況：spec `no18_preference_sync_logic.md` 定義 getSyncedPreferenceFields / pushPreferenceToCloud / pullPreferenceFromCloud，impl grep 三名稱零命中。同步欄位清單散落四處（非原述兩處），currency 在 LWW pull 路徑被排除、其餘三處保留，欄位分歧已實際存在。無單一真相、無 guard test。
- 判斷：spec 政策層在 impl 不存在、行為散落，易因兩處欄位不同步出 bug。確認 medium。
- 建議：抽 preferenceSync 薄層或至少把同步欄位清單集中為一個常數，push/pull 共用。
- 證據：`no3_logics/no18_preference_sync_logic.md`、`src/services/userService.ts`、`src/contexts/PreferenceContext.tsx`、`src/services/syncEngine.ts`

**TransactionBackupLogic 折疊為 syncEngine 內部函式，checkBackupQuota 委派層被攤平**　`medium`　維度：spec 是獨立 logic、impl 折疊

- 現況：spec `no19` 定義 runInitialBackup/runDeltaBackup/checkBackupQuota 為 BackupEngine 三操作。impl `syncEngine.ts` 有前兩者但為 module-private、無 checkBackupQuota——sync() 直接 inline quotaService.checkQuota。行為一致（6 集合每批 500、配額分流）。
- 判斷：被攤平的是 BackupEngine wrapper 層本身，QuotaLogic 在 impl 仍是獨立 quotaService。純層邊界漂移、行為無誤。確認 medium。
- 建議：可接受合併，但建議回 spec 註明三者由 syncEngine 統一承載；或 impl 補一個 checkBackupQuota wrapper 對齊委派語意，讓配額預檢點可獨立測試。
- 證據：`no3_logics/no19_transaction_backup_logic.md`、`src/services/syncEngine.ts`、`src/services/quotaService.ts`

**CurrencyConversionLogic 三操作無具名對應，散在 service 與 context**　`medium`　維度：行為漂移（函式邊界與命名）

- 現況：spec `no7` 定義 resolveCurrencyRate（無紀錄回 1）/createInitialCurrencyRate/resolveTransferDisplay，impl 三名稱零命中。對應：resolveCurrencyRate 約等於 `currencyService.getLatestRate`（但無紀錄回 undefined 而非 1）、createInitialCurrencyRate 約等於 ensureRate（建 1.0）、resolveTransferDisplay 散在 PeriodDataStore/convertAmount。
- 判斷：兩點漂移——命名邊界跨 service 與 context；行為上 spec 無紀錄回 1、impl 回 undefined，呼叫端各自 fallback 1.0 或靜默回原值，無紀錄行為不統一。AccountLogic spec 點記法呼 createInitialCurrencyRate 但 impl 走 ensureRateForNewAccount，名稱對不上。確認 medium。
- 建議：統一無匯率回傳語意（都回 1 或都回 undefined 並由呼叫端顯式處理），並在 spec 或 impl 對齊 createInitialCurrencyRate 與 ensureRate 命名。
- 證據：`no3_logics/no7_currency_conversion_logic.md`、`src/services/currencyService.ts`、`src/contexts/PreferenceContext.tsx`

**SettingsManagement 的 setCurrencyFormat/resetCurrencyFormat 未集中，currency_configs 寫入手刻在 screen**　`medium`　維度：行為漂移 + 命名

- 現況：spec `no5_settings_management.md` 定義 setCurrencyFormat/resetCurrencyFormat 操作 CurrencyConfig 表。impl `PreferenceContext` 有其他 setter 但無這兩個；實際寫 currency_configs 手刻在 `CurrencyDetailConfigScreen.tsx` 的 database find/write。另 spec 用 switchTheme/setBaseCurrency、impl 為 setThemeId/setBaseCurrencyId（語意同字面異）。
- 判斷：多數 setter 對得上，但 currency format 兩操作沒進 context 統一層、邏輯內嵌 screen，與其他 setter 走 PreferenceContext 的模式不一致。逐檔比對五個設定 screen 全部委派 context、database.write 為 0，唯獨此檔是例外。確認 medium。
- 建議：把 currency format 讀寫收進 `PreferenceContext` 或 settings service，screen 只呼叫；命名上 impl 與 spec 二擇一對齊。
- 證據：`no3_logics/no5_settings_management.md`、`src/contexts/PreferenceContext.tsx`、`src/screens/Settings/CurrencyDetailConfigScreen.tsx`

**MergeLogic 帳戶合併缺幣別前置檢查（部分成立）**　`low`　維度：行為漂移

- 現況：spec `no16` 在 mergeAccounts 第一步要求幣別前置檢查，impl `mergeService.performMerge` 函式體內確無幣別比對。
- 判斷：但守門並非缺席，只是不在 performMerge 內——在 `mergeHelpers.isMergeCompatible`，且唯一呼叫端 `MergeEditorScreen` 在呼叫前硬擋加目標 picker 預過濾，並有 guard test 鎖 cross-currency 拒絕。現行系統跨幣別合併實際無法發生，原宣稱的污染金額與非 UI 路徑繞過均不成立（全 repo performMerge 僅一個呼叫端）。降為 low。
- 建議：把幣別與型別檢查下沉進 performMerge 作為硬保證，避免未來新增 caller 漏呼叫 isMergeCompatible。
- 證據：`src/services/mergeService.ts`、`src/utils/mergeHelpers.ts`、`src/screens/Merge/MergeEditorScreen.tsx`

**LoginLogoutLogic 的 handleReLogin 未實作（部分成立）**　`low`　維度：spec 寫了 impl 沒做

- 現況：spec `no2` 的 handleReLogin 是一個無 caller 的孤兒函式（LoginScreen 與 bootstrap 都不呼叫它，登入鈕走已實作的 handlePostAuth）。其同帳號分支已由 impl handlePostAuth 到 syncSettingsFromCloud 實作。真正未實作的只有不同帳號分支（換帳號登入後通知保留或清除本地殘留）。
- 判斷：此情境可達，但所有本地查詢以 user_id 範圍化，舊帳號資料被隔離、不會混入新帳號畫面；真實影響是換帳號不清舊資料導致本地殘留累積，非跨帳號汙染。原稱 spec 註明 handleLogin 未被引用為捏造。降為 low。
- 建議：要做則於 signIn 後判斷 uid 與本地 Settings.userId 是否相同，走同帳號 LWW 或不同帳號提示分支；不做則回 spec 標 deferred。
- 證據：`no3_logics/no2_login_logout_logic.md`、`src/contexts/AuthContext.tsx`、`src/services/userService.ts`

**localDbService 與 settingsService 為無人引用死碼（部分成立）**　`low`　維度：impl 有 spec 沒寫（死碼）

- 現況：`settingsService.ts` 為純死碼（整檔 @deprecated、no-op、零引用），可移除。但 `localDbService.ts` 本身並非死碼——被三個 screen import 使用 getAccounts/getAccount/getCategories，是 live 讀取路徑。
- 判斷：真正的問題範圍是 localDbService 內四個 orphan 寫入函式無 caller，其中 deleteItem 硬刪與 deleteTransaction 軟刪和 canonical transactionLogic 行為分歧，留著為未來誤用風險。原對 canonical AccountLogic 的引用不成立（無此檔）。維持 low。
- 建議：刪除 `settingsService.ts`；移除 localDbService 內未使用且與 transactionLogic 重複的寫入函式，保留讀 helper。
- 證據：`src/services/settingsService.ts`、`src/services/localDbService.ts`、`src/services/transactionLogic.ts`

精簡配對表（僅列非 aligned 與值得注意的 row；本軸略過 8 個 aligned row：PostAuthLogic、BatchSyncLogic、TransactionLogic、RecurringTransactions、UndoLogic、FirestoreQuotaLogic、PremiumLogic 等）：

| item | spec | impl | status |
| --- | --- | --- | --- |
| AppBootstrapFlow | no3_logics/no1 | AuthContext + AppNavigator | drift |
| LoginLogoutLogic | no3_logics/no2 | AuthContext + firebase.ts | drift |
| SettingsManagement | no3_logics/no5 | PreferenceContext + userService + CurrencyDetailConfigScreen | drift |
| CurrencyConversionLogic | no3_logics/no7 | currencyService + PreferenceContext | drift |
| TransferLogic | no3_logics/no8 | transferLogic.ts | drift |
| HomeReportLogic | no3_logics/no13 | PeriodDataStore.ts | drift |
| CategoryLogic | no3_logics/no14 | screen inline，無 service | spec-only |
| AccountLogic | no3_logics/no15 | screen inline，無 service | spec-only |
| MergeLogic | no3_logics/no16 | mergeService.ts | drift |
| SubscriptionGateLogic | no3_logics/no17 | premiumLogic.ts | drift |
| PreferenceSyncLogic | no3_logics/no18 | 折疊，無具名函式 | drift |
| TransactionBackupLogic | no3_logics/no19 | syncEngine 內部 | drift |
| FullBackupLogic | no3_logics/no20 | 無（僅 CSV） | spec-only |
| localDbService 重複寫入 | 無 | localDbService.ts | orphan |
| settingsService | 無 | settingsService.ts | orphan |
| importService/exportService CSV | 僅 screen 層 | importService/exportService | impl-only |

### screen 軸

結論：26 張正規 screen spec 對 design 對 impl 三方絕大多數 aligned；唯一實質三方分歧是 localization hub，加上幾張 impl-only 工具畫面。

**localization 分組三方分歧：spec 無此 screen、design 有 hub、impl 有 hub 但未接線**　`high`　維度：screen 三方對齊

- 現況：design `no26_localization_settings_screen` 存在（地區設定 4 入口 hub）；impl `LocalizationSettingsScreen.tsx` 存在但 AppNavigator 無註冊、PreferenceScreen/SettingsScreen 也無引用，是 build 不到的死畫面；spec `no16_preference_screen.md` 直接列七個直達導航（其中語言/時區/幣別相關五個），無任何 localization 中間 hub。
- 判斷：三層對同一件事的資訊架構給了不一致的答案。spec 扁平直達、design 多畫一張二級 hub、impl 照 design 建了卻沒接進導航樹。真正接線的 impl PreferenceScreen 反而與 spec 扁平模型完全對齊。確認 high。
- 建議：回 spec 上游決定 localization 要扁平直達還是收進二級 hub。採 hub 則補 spec、改 PreferenceScreen 路由、註冊 LocalizationSettingsScreen；維持扁平則刪除 design no26 與 impl LocalizationSettingsScreen.tsx 兩處 orphan。
- 證據：`30_screens/no26_localization_settings_screen/`、`src/screens/Settings/LocalizationSettingsScreen.tsx`、`no2_screens/no16_preference_screen.md`

**impl 有 3 張 Debug 畫面加 1 個 FilterPopover，spec/design 皆無對應**　`low`　維度：screen 獨有畫面

- 現況：impl 獨有 DebugInfoScreen、DebugInfoByCategoryScreen、MockDataSettingsScreen（以 debug build 條件註冊）與 FilterPopover（HomeFilter 內嵌子元件）。spec 與 design 兩處皆無這 4 個語意名。
- 判斷：Debug 三張屬開發工具、僅 debug build 出現，本就不該進 spec/design。FilterPopover 是單一 spec 畫面的實作級分解。兩類都不需回填 spec。確認 low（屬三方數量盤點完整性註記）。
- 建議：無需動作。標記為已知 impl-only。
- 證據：`src/screens/Settings/DebugInfoScreen.tsx` 等、`src/screens/Home/FilterPopover.tsx`

精簡配對表（僅列非 aligned 的 row；本軸略過 25 個 aligned 的 screen row）：

| item | spec | design | impl | status |
| --- | --- | --- | --- | --- |
| preference | no2_screens/no16 | 30_screens/no16 | PreferenceScreen.tsx | 配對表標 design-mismatch，惟 F73 駁回後實為 aligned |
| localization_settings_hub | 無 | 30_screens/no26 | LocalizationSettingsScreen.tsx（未註冊） | missing-spec |
| filter_popover | 無 | 無 | FilterPopover.tsx | impl-only |
| debug_info | 無 | 無 | DebugInfoScreen.tsx（debug build） | impl-only |
| debug_info_by_category | 無 | 無 | DebugInfoByCategoryScreen.tsx（debug build） | impl-only |
| mock_data_settings | 無 | 無 | MockDataSettingsScreen.tsx（debug build） | impl-only |

### data model 軸

結論：九張 WatermelonDB 表 spec 對 impl 大致對齊，但 Accounts/Categories 兩張有未文件化的 impl-only 欄位、deletedOn 索引在 impl 全缺、且部分欄位在 Firestore 同步邊界被丟。

**Account.typeId / Category.standardCategoryId 為 impl-only 欄位，spec 完全未定義**　`high`　維度：data model

- 現況：impl `Account.ts` 的 typeId、`Category.ts` 的 standardCategoryId 為被編輯器寫入、被雲端同步、被 seed 種子使用的 persisted 欄位，但 spec data model 的 Accounts/Categories 欄位列表皆無。
- 判斷：spec 是 data model 唯一真相，缺欄位代表後續任何依 spec 開發者都不知道帳戶有標準帳戶類型、類別有標準分類這兩個概念。且 Firestore 端 standardAccountTypeId 為 number | null 但本地 type_id 是 non-optional，nullability 邊界未被規範。實際範圍更廣：account editor 的 screen spec 也只列三欄、無帳戶類型選擇器，而 impl 實際 render 了該 ButtonGroup。確認 high。
- 建議：在 spec Accounts 補 typeId（對 StandardAccountTypes 的 FK）、Categories 補 standardCategoryId，並標明 nullability；若決議不該存在則反向從 impl 移除欄位與寫入點。
- 證據：`src/database/models/Account.ts`、`src/database/models/Category.ts`、`no1_data_models/no1_data_models.md`、`no2_screens/no12_account_editor_screen.md`

**Account/Category 的 disabledOn 在 Firestore 同步邊界被靜默丟棄**　`medium`　維度：data model

- 現況：disabledOn 是 spec 定義的持久化使用者資料，impl 本地完整存取且用於過濾可選清單，但 `coreSchema.ts` 的 FirestoreAccount/FirestoreCategory 與 `syncEngine.ts` 的上傳映射均未帶此欄，使其在 L3 Firestore 備份邊界被丟。
- 判斷：spec 未聲明 disabledOn 屬不同步欄位，故 Firestore 雲端備份不是 spec 使用者資料的忠實副本，屬同步映射漏欄。修正後果敘事：syncEngine 無下載/還原路徑，換機還原依 spec 走 L4 本地 JSON ZIP（會帶 disabledOn），故換機還原後停用帳戶重新出現在當前設計下不成立；真實風險是 Firestore 雲端備份本身不完整。確認 medium。
- 建議：在 FirestoreAccount/FirestoreCategory 補 disabledOn，syncEngine 補對應映射；若刻意不同步則在 spec 該欄位註明僅本地不同步。
- 證據：`src/services/schema/coreSchema.ts`、`src/services/syncEngine.ts`、`no1_data_models/no1_data_models.md`

**deletedOn spec 標 Index，impl schema 六張表全未建索引（部分成立）**　`low`　維度：data model

- 現況：spec 對六表的 deletedOn 標 Index，impl `schema.ts` 六行 deleted_on 全未建 isIndexed（migration 亦同）。屬真實 spec 對 impl 契約分歧。
- 判斷：但高頻查詢全表掃描的 high 風險不成立：會成長的 transactions/transfers 熱查詢已帶 user_id 與 date 索引過濾，SQLite 單表單索引、deleted_on 近全 NULL 選擇度差，補此索引邊際效益低；accounts/categories 列數小。降為 low（一致性缺口）。
- 建議：impl 補 isIndexed 或 spec 修正去掉 Index 標記，二者擇一對齊。
- 證據：`no1_data_models/no1_data_models.md`、`src/database/schema.ts`

**Transactions/Transfers 的 date 欄位 spec 未標 Index，impl 建了索引（部分成立）**　`low`　維度：data model

- 現況：spec 與 impl 的 Index 標記雙向都有 drift。impl 建索引但 spec 未標的有 date 加 5 個 FK 欄共 8 欄；反向且更值得關注的是 spec 在六表把 deletedOn 標 Index、impl 一個都沒建。
- 判斷：原 explanation 把方向講反——實際 spec 承諾、impl 未建的反向缺口比 impl 多建索引更該優先對齊。整體屬文件與實作未對齊、非執行期錯誤。維持 low。
- 建議：spec 補 date 與 FK 欄的 Index 標記；同時優先處理 deletedOn 反向缺口。
- 證據：`src/database/schema.ts`、`no1_data_models/no1_data_models.md`

**CurrencyConfig 無 deletedOn 且非同步集合，但 spec 未標明此例外（部分成立）**　`low`　維度：data model

- 現況：CurrencyConfig 欄位層 spec 對 impl 一致（都不軟刪），且 impl 確實把它排除在所有 sync 路徑外，換機會遺失幣別顯示格式設定。
- 判斷：但此排除並非完全沒記——它在 Logic 層明確記載（no19/no18/no20 都逐項列出參與備份的六張表、可見地排除 CurrencyConfig）。依 MVC 分層，sync 成員歸 Logic 層、欄位形狀歸 Model 層，故 data model 檔不列 sync 成員是正確分層。殘餘改進僅為文件完整度。降為 low。
- 建議：可在 data model CurrencyConfig 段補一行指向 backup logic 的 cross-reference。
- 證據：`no1_data_models/no1_data_models.md`、`no3_logics/no19_transaction_backup_logic.md`

**User 與 Settings 的 children/parent 關聯只存在於 impl，spec 未描述為關聯**　`low`　維度：data model

- 現況：impl `User.ts` 有 @children('settings')，`Settings.ts` 以 user_id 持有外鍵。spec 把 Settings 到 User 當單向 FK 描述，User 欄位列表無任何指向 Settings 的反向關聯。
- 判斷：這是 ORM 慣例層的補充，spec 不寫反向關聯本身可接受。@children 是 additive、不與 spec 單向 FK 矛盾。確認 low（盤點完整標記）。
- 建議：可選在 spec User 段補一句一個 User 對應一筆 Settings，使一對一基數可見；不補則維持現狀。
- 證據：`src/database/models/User.ts`、`src/database/models/Settings.ts`、`no1_data_models/no1_data_models.md`

精簡配對表（僅列 drift / spec-only / impl-only 的 row；略過 11 個 aligned row：Settings、Transactions、Transfers、CurrencyRates、CurrencyConfig、Schedules、User、schema version 5、migrations v5 等）：

| item | spec | impl | status |
| --- | --- | --- | --- |
| Accounts 帳戶 | no1_data_models.md | Account.ts + schema accounts | drift |
| Categories 類別 | no1_data_models.md | Category.ts + schema categories | drift |
| Account.typeId / standard_category_id 等 impl-only 欄位 | 無對應 | Account.ts / Category.ts / schema | impl-only |
| IconDefinitions 圖示定義 | 標準定義 JSON | 非 WatermelonDB model | spec-only |
| Currencies 貨幣 | 標準定義 JSON | 非 WatermelonDB model | spec-only |
| PremiumContext Local State | Local State | 執行期 React context | spec-only |

### 付費鏈軸

結論：LEVEL 分級定義與多數受限動作在四層大致 aligned，但有兩個會繞過付費牆的真實缺口（外幣帳戶閘門是死的、mutation 層無防護），加上一處跨層 ActionId 漂移與若干 Map 殘留。

**useForeignCurrency 是 spec 定義的 L0 禁止動作，但 impl 從未在任何 screen 呼叫，外幣帳戶閘門實際不存在**　`high`　維度：付費鏈強制點缺漏

- 現況：spec `no17` 加 payment.md 明訂 L0 僅限本地幣別、禁用外幣帳戶。impl `premiumLogic.ts` 有 case useForeignCurrency return false，但 grep 全 src 零 call site。`AccountEditorScreen` 幣別 SearchableDropdown 列出全 155 幣別、無 tier-based disabled，handleSave 寫 currencyCode 並呼 ensureRateForNewAccount，整段無 canUserPerformAction 檢查。
- 判斷：商業模式把外幣支援當 LEVEL_1 賣點、spec 也定義了閘門識別碼，但 impl 的閘門從沒被接到 UI。LEVEL_0 免費使用者可選日圓美金等外幣並存檔，完全繞過付費。ensureRateForNewAccount 也在 save 時自動建匯率記錄、無 gate，rate 側也漏。只有跨層比對 call site 才暴露這條 gate 是死的。確認 high。
- 建議：`AccountEditorScreen` 儲存外幣帳戶前補 canUserPerformAction，blocked 導向 Paywall；幣別下拉對 L0 也可鎖非本地幣別選項。屬 impl 對齊缺口、不需動 spec。
- 證據：`src/services/premiumLogic.ts`、`src/screens/Accounts/AccountEditorScreen.tsx`、`no3_logics/no17_subscription_gate_logic.md`

**所有 entitlement 強制點只落在 UI / navigator 層，mutation 與非 UI 寫入路徑完全繞過上限**　`high`　維度：付費鏈強制點分層

- 現況：強制點全在 `AppNavigator` 與 6 個 editor/list screen 的 onPress。mutation 層與 collection.create 零 entitlement 檢查。非 UI 寫入路徑 `importService`、`recurringLogic` 直接建資料不經 canUserPerformAction。
- 判斷：spec 把 canUserPerformAction 定位成判斷唯一依據，但 impl 只在按鈕擋。更尖銳的是 import 不只 mutation 層繞過，連 `ImportScreen` 既有的 importData 檢查本身就是死碼（回傳值被丟棄、無導 Paywall），且入口以裸 navigation.navigate 進場、不經 navigator gate——對 import 三道防線全部失效，免費用戶經正常 Settings UI 即可無限突破上限。確認 high。
- 建議：把 entitlement 檢查下沉到 mutation service create 入口，或在 import/recurring 補限額檢查。spec 若維持 UI 層攔截立場需明文說明非 UI 路徑豁免理由。
- 證據：`src/navigation/AppNavigator.tsx`、`src/services/transactionLogic.ts`、`src/services/importService.ts`、`src/services/recurringLogic.ts`、`src/screens/Settings/ImportScreen.tsx`

**triggerCloudBackup 與 triggerMultiDeviceSync 在 impl 被合併成單一 triggerCloudSync，語意相反卻共用一個識別碼**　`medium`（部分成立）　維度：付費鏈 ActionId 漂移

- 現況：三層對 cloud sync 概念的識別碼數量與授權結論不一致——spec 拆成 triggerCloudBackup（全 LEVEL 允許）與 triggerMultiDeviceSync（L0 禁止），impl `premiumLogic.ts` 只有單一 triggerCloudSync 並一律 return false，與 Product Map cloud_sync.md 的 L3 silent backup（全 user 含 L0）語意相左。
- 判斷：屬定義層 latent 漂移、非 high：triggerCloudSync 零 call site，真正的 L3 backup 由 `syncEngine` 經 quotaService 把關、完全不走此 gate，當前無錯誤 runtime 行為。降為 medium。
- 建議：impl 補回兩個識別碼 triggerCloudBackup（return true）與 triggerMultiDeviceSync（L0 return false），對齊 spec 的 10 個識別碼；或反過來在 spec 註明合併決策並改寫規則表。
- 證據：`no3_logics/no17_subscription_gate_logic.md`、`src/services/premiumLogic.ts`、`app/cloud_sync.md`

**PremiumStatusCache 離線授權快取 Product/Map 有完整設計，但 impl checkIsPremium 永遠 return false（部分成立）**　`low`　維度：付費鏈 / 離線快取未接線

- 現況：設計對實作的離線授權缺口真實存在，但指認的成因與檔案位置錯。checkIsPremium 不在 entitlements.ts 而在 `src/constants/limits.ts`，且該函式全 repo 零呼叫、是 dead code，return false 對 runtime 毫無影響——它不是離線降級的執行路徑。
- 判斷：真正會把付費 user 離線降級的是另一條：`iapService.getAvailablePurchases` catch 回空陣列、refreshStatus catch 設 LEVEL_0，整條 tier 解析無任何持久化快取。Design/Spec/Impl 三層缺口方向正確，但作為可執行發現它指向的 fix target（限 stub）是無效的。降為 low。
- 建議：若離線快取仍在 scope，impl 補實作離線 tier 快取（比對到期日）讓離線不降級；或在 payment.md 標註未實作、premium spec 補一行離線降級行為。需先回上游確認離線快取是否仍在 scope。
- 證據：`src/constants/limits.ts`、`src/contexts/PremiumContext.tsx`、`src/services/iapService.ts`、`app/payment.md`

**Product Map payment.md 仍完整保留 RedeemCodeScreen 節點，與序號功能不做的決議衝突**　`medium`　維度：付費鏈 Map 殘留

- 現況：`payment.md:3` 功能列序號兌換介面、:35-48 完整 RedeemCodeScreen 子節點。impl 全 repo 零 redeem 引用、AppNavigator 無 Redeem route、spec 層亦無對應 screen spec。決議不做。
- 判斷：Map 作為整合層真相仍把序號當付費渠道描述，三層對付費入口有哪些說法不一致。讀 Map 的人會以為序號是 in-scope。確認 medium。
- 建議：從 payment.md 移除 RedeemCodeScreen 節點與序號兌換字樣，或改標已廢案。屬 Product git 上游清理。
- 證據：`app/payment.md`

**setMockTier 可在非 production build 偽造任意 tier**　`low`　維度：付費鏈 setMockTier 繞過

- 現況：`PremiumContext.tsx` 的 setMockTier 直接 setCurrentTier，僅靠 isProductionBuild 擋生產。註解自承此 context method 在生產仍 reachable、靠這裡 gating 才防止翻成 premium。
- 判斷：這是 payment.md 接受 client-side 付費牆繞過風險既定取捨的具體落點，不是新缺口。isProductionBuild 其實是 robust discriminator（讀 runtime iOS receipt path、非可偽造 flag），且唯一 caller 在 debug build 後。殘留風險為理論性。確認 low。
- 建議：無需立即動作，符合既定取捨。若日後要收緊，走伺服器端收據驗證（屬獨立 feat）。
- 證據：`src/contexts/PremiumContext.tsx`、`app/payment.md`

精簡配對表（僅列非 aligned 的 row；本軸略過 14 個 aligned row：LEVEL_0/1/2 分級、createAccount/createCategory/createTransaction/manageCurrencyRate/importData/createRecurringTransaction/refreshStatus/quotaService 等）：

| item | product | spec | impl | status |
| --- | --- | --- | --- | --- |
| LEVEL_3 分級 | business_model:52 | 未列入規則表 | enum 無 | spec-only |
| LEVEL_B 分級 | business_model:70 | 未列入規則表 | enum 無 | spec-only |
| useForeignCurrency 受限動作 | 僅限本地幣別 | no17:85 L0 禁 | 有 case 但零 call site | missing-downstream |
| triggerCloudBackup（全 LEVEL 允許） | L0 含系統端備份 | no17 全 LEVEL 允許 | ActionId 無此識別碼 | drift |
| triggerMultiDeviceSync（L0 禁止） | 取消多裝置即時同步 | no17:103 L0 禁 | 併入 triggerCloudSync | drift |
| triggerCloudSync（impl 獨有） | 無 | 無此識別碼 | 定義 return false、零 call site | orphan |
| 強制點位置 | payment.md:96 執行前檢查 | 各 screen spec 標 | 全在 UI/navigator 層 | impl-only |
| 離線授權快取 PremiumStatusCache | payment.md:107 TTL 快取 | 無獨立規格 | checkIsPremium 恆 false、死碼 | product-only |
| RedeemCodeScreen 序號兌換 | payment.md:35 完整節點 | 無 screen spec | 全 repo 零 redeem | product-only |

### Map 落地軸

結論：Product Map app 視角絕大多數節點三層落地完整，但有兩個高嚴重度結構斷裂（CloudSync 樹過時、AnalyticsPipeline 孤兒）、若干 spec 對 impl 中途消失（FullBackup、entitlement 強制點），以及已廢的 RedeemCode 殘留。LogicEngine 整群與 web/cloud 平台是有意的未來節點、不催 impl。

**CloudSync structure.md 樹仍是舊 SyncEngine/BatchSync/ConflictResolution，與 cloud_sync.md 重寫不一致**　`high`　維度：Map 落地

- 現況：`structure.md:57-61` CloudSync 子樹仍為舊架構，但 cloud_sync.md 已整份重寫為 L2/L3/L4 三軌。spec 明寫不使用 Firestore Real-time listener、L3 單向上傳，impl syncEngine 為 push-only。ConflictResolution 在下游僅以 LWW 形式落在 no18，無獨立雙向衝突解決機制。
- 判斷：同一 module 兩份權威來源描述兩套不相容架構。git history 證明重寫只落在 cloud_sync.md 未傳播到樹。structure.md 是任何任務的入口，讀者拿到被誤導的雲端架構。app/index.md 索引同樣 stale。確認 high。
- 建議：更新 structure.md CloudSync 子樹改為 L2/L3/L4 與 cloud_sync.md 對齊，移除舊節點。屬 Product Map 改動，走 decision_framework_router 四問。
- 證據：`structure.md`、`app/cloud_sync.md`、`app/index.md`、`no3_logics/no4_batch_sync_logic.md`、`src/services/syncEngine.ts`

**analytics_pipeline 被 macro_data/cloud_sync 引為權威上游，卻完全不在 structure 樹與索引**　`high`　維度：Map 落地（上游引用節點缺席）

- 現況：`cloud_service/macro_data.md` 兩處明寫上游依據 analytics pipeline 產品圖文件；但 structure.md 的 Cloud Service 樹只列 AIAdvisor/Backend 與 MacroData、索引表亦無此列、map CLAUDE.md cloud_service 欄也漏。
- 判斷：analytics_pipeline.md 是完整且被多處引為唯一上游的權威節點（R1 拍板），卻是孤兒——不在 tree、索引、CLAUDE.md。任何人照 structure.md 入口讀 Cloud Service 永遠看不到它，卻又被 macro_data 指去讀它。其下 ConsentSync 預期 app 端有 analyticsConsent toggle，impl 亦無。確認 high。
- 建議：把 AnalyticsPipeline 補進 structure.md Cloud Service 樹（與 AIAdvisor/Backend、MacroData 平級）、補進索引表、補進 map CLAUDE.md。ConsentSync 對 app 端的 analyticsConsent toggle 需求另立一條下達給 app 視角 Map 與後續 impl。
- 證據：`cloud_service/analytics_pipeline.md`、`cloud_service/macro_data.md`、`structure.md`、`no2_product_map/CLAUDE.md`

**PremiumFeatureGate：Map 定義執行前置檢查，impl 強制點只在 UI 層、mutation 層完全繞過**　`high`　維度：Map 落地

- 現況：`payment.md:87-104` PremiumFeatureGate 定義為受限動作執行前依 LEVEL 能力清單前置檢查。impl canUserPerformAction 存在但強制點全在 UI/navigator 層，mutation 層 transactionLogic/transferLogic 與 collection.create 零檢查，import/recurring 等非 UI 路徑繞過。
- 判斷：閘控節點落地了，但位置與 Map 動作執行前前置檢查的意圖有實質落差。更尖銳：`ImportScreen` 的 importData gate 是死碼（回傳值丟棄），入口以裸 navigation.navigate 進場，import 三道防線全失效。LEVEL_0 經正常 Settings UI 即可無限突破上限。確認 high。
- 建議：把 entitlement 檢查下沉到 mutation service create 入口，或在 import/recurring 補限額檢查。spec 若要維持 UI 層攔截需明文說明非 UI 路徑豁免。
- 證據：`app/payment.md`、`src/services/premiumLogic.ts`、`src/services/importService.ts`、`src/services/recurringLogic.ts`

**RedeemCodeScreen：Map 列了序號兌換，三層下游全缺，且已決議不做**　`medium`　維度：Map 落地

- 現況：`app/payment.md:35-48` 完整描述 RedeemCodeScreen、structure.md:70 樹內也列。但 grep redeem 在 spec、impl src、design project 三處皆 0 命中。memory 記此功能已決議不做。
- 判斷：典型 Product Map 列了但下游零落地，且非未來功能而是已廢案。Map 仍保留完整節點與樹條目，會誤導讀者以為在規劃範圍內。殘留實為三處（payment.md 功能清單加整段加 structure.md 索引），比原述兩處多。確認 medium。
- 建議：把 RedeemCodeScreen 從 payment.md 與 structure.md 樹移除，或明確標註已廢案、僅走原生 IAP。歸檔理由放 no99_archive。動 Product Map 走 decision_framework_router 四問。
- 證據：`app/payment.md`、`structure.md`、memory `project_susugigi_redeem_code_dropped.md`

**PremiumStatusCache：Map 寫 TTL 快取 expirationDate，impl 無 TTL、改用即時推 tier**　`medium`　維度：Map 落地

- 現況：`payment.md:107-120` L4 PremiumStatusCache 明寫本地 TTL 快取訂閱 expirationDate 供離線驗證。但此離線快取節點尚未落地——impl 唯一接線的授權路徑皆即時查 getAvailablePurchases 並以 productId 推 tier、不快取到期日。expirationDate 形式僅存在於 `limits.ts` 的 checkIsPremium（硬寫 return false、零呼叫、死碼）。
- 判斷：離線時 getAvailablePurchases 回空，已付費者 tier 塌回 LEVEL_0、被誤降級，與 Map 節點目的相反。drift 不只 Map 對 impl，Spec（no6/no17）亦完全未承載此快取概念。屬 Map 節點未落地加未下傳 Spec，非落地了但機制換成即時推。確認 medium。
- 建議：二擇一對齊——若即時推 tier 是定案，更新 payment.md 去掉 TTL 敘述改寫為 IAP 即時推導；若 TTL 離線快取仍是目標，補 spec 與 impl。對齊前先確認哪邊是現行真相。
- 證據：`app/payment.md`、`src/contexts/PremiumContext.tsx`、`src/constants/limits.ts`、`no3_logics/no6_premium_logic.md`

**L4 FullBackupExport：Map 定 JSON ZIP 全量備份，spec 有 logic 但 impl 全缺**　`medium`　維度：Map 落地

- 現況：`app/cloud_sync.md:133-164` L4 明定全量檔 JSON ZIP 含 Settings 加所有 entity 加 referential mapping 走 OS Share Intent。spec `no20` 有 exportFullBackup/importFullBackup。但 impl 這兩函式在整個 src 零定義零呼叫，jszip 僅為未被 import 的傳遞依賴，exportService 與 importService 皆純 CSV。
- 判斷：核心斷鏈成立並應加強措辭——L4 JSON ZIP 全量在 Product 與 Spec 兩層完整定義，但 impl 端完全未落地，為 spec 有、impl 全缺的乾淨斷鏈，而非呼叫存在但後端不明。修正：DataManagementScreen 並未呼叫 exportFullBackup/importFullBackup（只呼叫 exportService 做 CSV）。確認 medium。
- 建議：確認 impl 是否要做 JSON ZIP 全量；若缺，標為 spec-only 下游缺口待補 impl 並排入 roadmap。
- 證據：`app/cloud_sync.md`、`no3_logics/no20_full_backup_logic.md`、`src/services/exportService.ts`、`src/services/importService.ts`

**LocalDatabase 節點寄生在 logic_engine.md 檔首，未列入 structure.md 樹與 index**　`medium`　維度：Map 落地

- 現況：`app/logic_engine.md:1-13` LocalDatabase（WatermelonDB）放在規則引擎檔最前面、語意無關。structure.md 樹無 LocalDatabase 節點、index.md 表也無。impl `src/database/*` 完整實作（schema/models/adapter）。
- 判斷：LocalDatabase 是已落地 impl 的核心基礎設施，但 Map 上寄生在錯誤檔案、且未進樹也未進 index。屬 impl 有、Map 結構未正確承載的反向落差——讀 Map 樹的人找不到本機資料層節點。需求層有 WatermelonDB 定案選型條目。確認 medium。
- 建議：把 LocalDatabase 節點從 logic_engine.md 抽出，獨立成 app/local_database.md 並列入 structure.md 樹與 index.md，或確認屬平台基礎設施另置。改 Map 結構走 decision_framework_router 上游。
- 證據：`app/logic_engine.md`、`structure.md`、`app/index.md`、`src/database/`

**LogicEngine 整支：Map 列了，spec/impl/design 全零**　`low`　維度：Map 落地

- 現況：`app/logic_engine.md:16-109` 完整描述 LogicEngine/RuleEngine/TimeMachine/RecalculationEngine、structure.md 樹列出。grep rule/timemachine 在 spec、impl src 0 命中、design 無對應目錄。
- 判斷：整個功能群只活在 Product Map，下游三層全缺。但 logic_engine.md 與 index.md 都明標 LEVEL_2 未實作、business_model LEVEL_2 也列 Logic Engine。是有意的未來規劃節點，非遺漏型中途消失。確認 low。
- 建議：無需動作。標記為 product-only by design（LEVEL_2 未實作），與 RedeemCode 那種已廢殘留區隔。
- 證據：`app/logic_engine.md`、`structure.md`、`app/index.md`、`no3_business_model.md`

**LocalizationSettingsScreen：design 與 impl 多出地區設定 hub，Map 無對應節點且 impl 未接線（部分成立）**　`low`　維度：Map 落地

- 現況：design `no26` 與 impl `LocalizationSettingsScreen.tsx` 都有聚合四入口的地區設定 hub，但 Product Map app_setting.md 的 Preference 段只平列 CurrencyAndFinance 與 RegionAndLanguage 兩組、無此中介 hub 節點，屬下游多出、Map 未承載的反向落差。impl 這支為孤兒（AppNavigator 無註冊、無 import、無 navigate）。
- 判斷：原 evidence 稱 impl 內容地圖註明未接線一句出處不成立——孤兒狀態為查 AppNavigator 後獨立確認。影響低，不影響現行導航。確認 low。
- 建議：決定 hub 是否保留：保留則在 app_setting.md 補此中介節點並把 impl 接線進 AppNavigator；不保留則 impl 移除死碼、design 標為探索。spec 目前無此 screen 可作裁決參考。
- 證據：`app/app_setting.md`、`30_screens/no26_localization_settings_screen/`、`src/screens/Settings/LocalizationSettingsScreen.tsx`

精簡配對表（僅列 drift / spec-only / impl-only / orphan / design-mismatch 的 row；本軸略過約 40 個 aligned 的逐節點 row，含 Auth/RecordingCore/HomeDashboard/AppSetting/CloudSync/Payment 多數子節點）：

| item | product | spec | impl | status |
| --- | --- | --- | --- | --- |
| AppSetting ▸ ClearDatabase | app_setting.md:58 | no14 | DataManagementScreen handleClearDatabase | 配對表標 drift，惟 F90 駁回後實為 aligned（軟刪） |
| AppSetting design 額外 LocalizationSettingsScreen | 無對應節點 | 無 | LocalizationSettingsScreen.tsx（未註冊） | design-mismatch |
| CloudSync ▸ L4 FullBackupExport | cloud_sync.md:133 | no20 | 無 JSON ZIP、僅 CSV | drift |
| CloudSync ▸ SyncEngine ▸ ConflictResolution | structure.md:60 | 僅 LWW 落 no18 | 無獨立模組 | drift |
| LocalDatabase（寄生 logic_engine.md） | logic_engine.md:1（未入樹/index） | 無明文承載 | src/database/* 完整 | impl-only |
| LogicEngine（LEVEL_2 未實作） | logic_engine.md:16 | 無 | 無 | spec-only |
| LogicEngine ▸ RuleEngine/TimeMachine | logic_engine.md:33/81 | 無 | 無 | spec-only |
| Payment ▸ RedeemCodeScreen | payment.md:35 + structure.md:70 | 無 | 無 | orphan |
| Payment ▸ PremiumFeatureGate | payment.md:87 | no17 | premiumLogic 強制點全在 UI 層 | drift |
| Payment ▸ PremiumStatusCache | payment.md:107 | 無 TTL 規格 | checkIsPremium 死碼 | product-only |

### web_console 軸

結論：web_console、cloud_service、external_service 三類節點 impl 全缺席，多數屬規劃中、未到實作階段的正常時序留白（不催 impl）。真正要修的是 Map 自身：WebConsole 缺狀態標兼 LEVEL 跨層矛盾，以及 AnalyticsPipeline 孤兒。

**analytics_pipeline 被 macro_data/cloud_sync 引為權威上游，卻完全不在 structure 樹與索引**　`high`　維度：上游引用節點缺席於 structure 樹

- 現況：與 Map 落地軸同一議題（見上）。`macro_data.md` 兩處明寫上游依據 analytics pipeline 產品圖文件，但 analytics_pipeline.md 既不在 tree、不在索引、不在 map CLAUDE.md。其下 ConsentSync 預期 app 端有 analyticsConsent toggle，impl 亦無。
- 判斷：Map 內部結構斷裂，比 impl 缺席嚴重——它讓正常未落地的判斷都無從建立，因為節點根本沒被登記。確認 high。
- 建議：把 AnalyticsPipeline 補進 structure.md Cloud Service 樹、索引表、map CLAUDE.md cloud_service 欄；ConsentSync 的 app 端 analyticsConsent toggle 需求另立一條下達。
- 證據：`cloud_service/analytics_pipeline.md`、`cloud_service/macro_data.md`、`structure.md`

**WebConsole 的 LEVEL 在 structure.md 索引(LEVEL_1)與 business_model(LEVEL_2)矛盾（部分成立）**　`medium`　維度：跨層 LEVEL 衝突

- 現況：`structure.md:131` 標 WebConsole 為 LEVEL_1，而被 CLAUDE.md 指定為跨 module LEVEL 商業定義權威的 `no3_business_model.md:42-43` 把同一個帶 JQL 的 Web 控制台列在 LEVEL_2 下，兩份權威文件給出相反答案。
- 判斷：屬須在動工前修正的規劃/定義層級缺口，非當前 paywall runtime 實害——WebConsole 全未實作、無任何 entitlement 代碼消費此值。roadmap 佐證被高估（MVP 已混入 LEVEL_2 項目，非按 LEVEL 嚴格分期）。降為 medium。
- 建議：以 business_model 為準把 structure.md WebConsole 改標 LEVEL_2，與 LogicEngine 同級；若 product 端確實想讓它早於 LEVEL_2 出貨，則反向改 business_model，但須先在提案層拍板。
- 證據：`structure.md`、`no3_business_model.md`

**WebConsole 節點在 structure.md 索引缺未實作狀態標，與同軸其他節點標法不一致**　`medium`　維度：狀態標註一致性

- 現況：`structure.md:131` WebConsole 只寫桌面版進階查詢與報表加 LEVEL_1；對照同表 AIAdvisor/WebClient、MacroData、AIAdvisor/Backend、LogicEngine 皆帶未實作或架構待定狀態詞。WebConsole 與三個帶未實作的鄰居同屬 0 impl，卻獨缺狀態詞。
- 判斷：LEVEL_1 本身不傳遞已實作訊號（LEVEL 是付費層級不是實作狀態），少了狀態詞才是真缺口，掃索引者會誤判 WebConsole 為已實作或進行中。修正兩處框架：狀態詞慣例只在索引表說明欄、所有節點本文皆無狀態標記；CloudSync 同為 LEVEL_1 無狀態詞但因已實作而正確，故 WebConsole 是唯一帶 LEVEL 標籤卻未實作未標狀態的節點。確認 medium。
- 建議：structure.md WebConsole 索引補上未實作狀態，與 LogicEngine/AIAdvisor/MacroData 對齊。
- 證據：`structure.md`、`web_console/web_console.md`

**web_console + cloud_service 全軸 impl 缺席屬規劃中、尚未到實作階段（部分成立）**　`low`　維度：整軸落地狀態判斷

- 現況：真正屬 web_console 加 cloud_service 加 external_service 軸的 7 個節點（JQLInterface/WebConsole 到 web；MacroData/CashFlowForecastEngine/HealthScoreEngine/BigQuery/LLMProxy 到 cloud/external）impl 全缺席，且 structure.md 索引明標為 LEVEL 加未實作，roadmap 排在 MVP 之後三 phase——屬規劃中、未到實作階段，非實作缺口，無需補 impl。
- 判斷：但證據清單誤把 RuleEngine、TimeMachine 兩個 App 平台節點算進全軸，且誤稱兩者全是 MVP 之後——實則 roadmap 把規則中心/時光機列在 MVP 段內。RuleEngine/TimeMachine 是 MVP 範圍內 app 功能尚未實作，與整條 web/cloud 平台 git 未建立屬不同類別。維持 low。
- 建議：全軸維持未落地現狀、不催 impl。建議 Map 對這類規劃中節點統一狀態詞彙（索引欄固定寫 LEVEL_X、未實作、Roadmap phase N），讓正常未落地與該落地卻沒落地一眼可分。
- 證據：`structure.md`、`no3_dev_roadmap/no3_dev_roadmap.md`、`web_console/`、`cloud_service/`

**AIAdvisor 前後端與 MacroData 在需求層無對應條目，僅靠 business_model/roadmap 支撐（部分成立）**　`low`　維度：需求源頭可追溯性

- 現況：AIAdvisor/Backend、AIAdvisor/WebClient、MacroData 三個 LEVEL_3/LEVEL_B 節點在需求層 `no1_requirements.md` 無對應條目，其源頭僅 business_model 與 roadmap 支撐，中間需求層空白。
- 判斷：屬遠期節點正常留白、非缺陷。修正旁證——WebConsole 並非同樣無需求條，needs 層已有評估方案 Web Console 報表作為其需求源頭。維持 low。
- 建議：不需現在補需求條。建議在 structure.md 索引對 LEVEL_3/LEVEL_B 節點統一加註需求細化待該 LEVEL 啟動，讓遠期留白與真實遺漏可區分。
- 證據：`no2_product_planning/no1_requirements/no1_requirements.md`、`no3_business_model.md`、`no3_dev_roadmap/no3_dev_roadmap.md`

精簡配對表（本軸所有 web/cloud/external 節點 impl 皆缺；列出代表性 row 與孤兒，略過其餘約 15 個同為 missing-downstream 的子節點如 SavedViews、ExportFunction、ConversationInterface、LLMProxy、各 Engine、DataPipeline、MarketIntelligence、EnterpriseDataService 等）：

| item | product | impl | status |
| --- | --- | --- | --- |
| WebConsole（桌面進階查詢與報表） | web_console/web_console.md | 無 | missing-downstream |
| WebConsole ▸ QueryEngine ▸ JQLInterface | web_console.md:36 | 無 | missing-downstream |
| AIAdvisor / WebClient | ai_advisor_web_client.md | 無 | missing-downstream |
| AIAdvisor / Backend | cloud_service/ai_advisor_backend.md | 無（無 cloud function） | missing-downstream |
| MacroData（總體資料服務） | cloud_service/macro_data.md | 無 | missing-downstream |
| AnalyticsPipeline（4 子節點） | cloud_service/analytics_pipeline.md | 無（ConsentSync 預期 app toggle 亦無） | orphan |
| LLM Provider（外部 LLM 推理） | external_service/llm_provider.md | 無（外部第三方） | missing-downstream |

---

## 附錄 · 已駁回

下列發現經對抗式驗證判定為 refuted（不成立），集中列出以保持透明，不靜默丟棄。

| gid | 原標題 | 駁回理由 |
| --- | --- | --- |
| F6 | HomeReportLogic 在 Logic 內指派具體色票 token slot（chart[0]、primary[300]） | 誤讀政策。`chart[0]`/`primary[300]` 是對 Design 已定義 theme token 的按名引用，落在 cross_layer_boundary_policy 類型1 白名單，非禁止的具體色值；檔內無任何 hex/rgba。最多屬風格偏好。 |
| F9 | screen 引用 *_TOKENS 群組名並寫顯式色角結果，踩 cross-layer 高信號禁區 | 兩子主張皆建立在政策未做的區分上。裸 token 群組名引用結構同政策明示允許的範例；語意色角映射為全 spec 通行寫法，政策違規範例綁的是具體 token 路徑加 opacity。Claim 並自相矛盾。 |
| F27 | 存取模型在不可取代性層是 Local-First opt-out，需求層卻拍板 Auth-First | 把資料主權軸的 Local-First 誤當存取模型軸。root_value 的 opt-out 指退出聚合資料蒐集，與登入牆無關；finding 把極低起始門檻、訪客可用安在 root_value 頭上屬事實錯誤（該措辭僅見於被否決選項）。銜接句已存在於 firestore.md。 |
| F55 | 免費版交易筆數實際無上限，createTransaction 規則只在帳戶/分類已超標時才擋 | impl 與權威 Spec no17:113-121 逐字一致——LEVEL_0 在帳戶達 3 或類別達 10 時禁建交易，且設計上本就不設交易筆數上限（payment.md 明文以帳戶/類別數為牆並排除漸進釋放）。是 spec 背書行為、非 bug。 |
| F73 | design PreferenceScreen 與 spec 路由結構不一致（少了 4 個進入點） | 誤讀 design 檔。design、spec、impl 三方 PreferenceScreen 完全對齊（皆 4 組、7 個導航入口加登出，匯率走 paywall）。finding 因只看 design 檔 line 39-40 而虛構只剩語言時區。 |
| F90 | ClearDatabase：Map 與 spec 都講批次標刪，impl 卻硬刪 destroyPermanently | 核心事實主張錯誤。handleClearDatabase 實際只有 markAsDeleted 軟刪、無 destroyPermanently（後者在另一支不相干的 localDbService.deleteItem）。impl 正確實作軟刪加 tombstone 同步，三層其實對齊。 |

---

## 附錄 · 配對總表

每軸完整 pairings 的精簡表（item / 各層 / status）。aligned row 為對齊正常狀態，列出供查全貌。

### logic 軸（23 row）

| item | spec | impl | status |
| --- | --- | --- | --- |
| AppBootstrapFlow (no1) | no3_logics/no1 | AuthContext + AppNavigator | drift |
| LoginLogoutLogic (no2) | no3_logics/no2 | AuthContext + firebase.ts | drift |
| PostAuthLogic (no3) | no3_logics/no3 | userService.ts | aligned |
| BatchSyncLogic (no4) | no3_logics/no4 | syncEngine.ts | aligned |
| SettingsManagement (no5) | no3_logics/no5 | PreferenceContext + userService + CurrencyDetailConfigScreen | drift |
| PremiumLogic (no6) | no3_logics/no6 | PremiumContext + iapService | aligned |
| CurrencyConversionLogic (no7) | no3_logics/no7 | currencyService + PreferenceContext | drift |
| TransferLogic (no8) | no3_logics/no8 | transferLogic.ts | drift |
| TransactionLogic (no9) | no3_logics/no9 | transactionLogic.ts | aligned |
| RecurringTransactions (no10) | no3_logics/no10 | recurringLogic.ts | aligned |
| UndoLogic (no11) | no3_logics/no11 | UndoContext.tsx | aligned |
| FirestoreQuotaLogic (no12) | no3_logics/no12 | quotaService.ts | aligned |
| HomeReportLogic (no13) | no3_logics/no13 | PeriodDataStore.ts | drift |
| CategoryLogic (no14) | no3_logics/no14 | screen inline，無 service | spec-only |
| AccountLogic (no15) | no3_logics/no15 | screen inline，無 service | spec-only |
| MergeLogic (no16) | no3_logics/no16 | mergeService.ts | drift |
| SubscriptionGateLogic (no17) | no3_logics/no17 | premiumLogic.ts | drift |
| PreferenceSyncLogic (no18) | no3_logics/no18 | folded，無具名函式 | drift |
| TransactionBackupLogic (no19) | no3_logics/no19 | syncEngine 內部 | drift |
| FullBackupLogic (no20) | no3_logics/no20 | 無（僅 CSV） | spec-only |
| localDbService 重複 create/delete | 無 | localDbService.ts | orphan |
| settingsService stub | 無 | settingsService.ts | orphan |
| importService/exportService CSV | screen 層 only | importService + exportService | impl-only |

### screen 軸（31 row）

| item | spec | design | impl | status |
| --- | --- | --- | --- | --- |
| login | no1 | no23 | LoginScreen.tsx | aligned |
| home | no2 | no1 | HomeScreen + PeriodPage + FocusCard | aligned |
| home_filter | no3 | no2 | HomeFilterScreen.tsx | aligned |
| search | no4 | no3 | SearchScreen.tsx | aligned |
| transaction_editor | no5 | no4 | TransactionEditorScreen.tsx | aligned |
| transfer_editor | no6 | no5 | TransferEditorScreen.tsx | aligned |
| recurring_options（嵌入） | no7 | no4 內嵌 | RecurringOptions.tsx | aligned |
| settings | no8 | no6 | SettingsScreen.tsx | aligned |
| category_list | no9 | no8 | CategoryListScreen.tsx | aligned |
| category_editor | no10 | no19 | CategoryEditorScreen.tsx | aligned |
| account_list | no11 | no7 | AccountListScreen.tsx | aligned |
| account_editor | no12 | no18 | AccountEditorScreen.tsx | aligned |
| merge_editor | no13 | no25 | MergeEditorScreen.tsx | aligned |
| data_management | no14 | no17 | DataManagementScreen.tsx | aligned |
| import_wizard | no15 | no22 | ImportScreen.tsx | aligned |
| preference | no16 | no16 | PreferenceScreen.tsx | design-mismatch（F73 駁回後實為 aligned） |
| theme_settings | no17 | no13 | ThemeSettingsScreen.tsx | aligned |
| launch_mode_setting | no18 | no15 | LaunchModeSettingScreen.tsx | aligned |
| base_currency_setting | no19 | no14 | BaseCurrencySettingScreen.tsx | aligned |
| currency_list | no20 | no9 | CurrencyListScreen.tsx | aligned |
| currency_detail_config | no21 | no20 | CurrencyDetailConfigScreen.tsx | aligned |
| currency_rate_list | no22 | no10 | CurrencyRateListScreen.tsx | aligned |
| currency_rate_editor | no23 | no21 | CurrencyRateEditorScreen.tsx | aligned |
| language_setting | no24 | no11 | LanguageSettingScreen.tsx | aligned |
| time_zone_setting | no25 | no12 | TimeZoneSettingScreen.tsx | aligned |
| paywall | no26 | no24 | PaywallScreen.tsx | aligned |
| localization_settings_hub | 無 | no26 | LocalizationSettingsScreen.tsx（未註冊） | missing-spec |
| filter_popover（內嵌） | 無 | 無 | FilterPopover.tsx | impl-only |
| debug_info | 無 | 無 | DebugInfoScreen.tsx | impl-only |
| debug_info_by_category | 無 | 無 | DebugInfoByCategoryScreen.tsx | impl-only |
| mock_data_settings | 無 | 無 | MockDataSettingsScreen.tsx | impl-only |

### data model 軸（15 row）

| item | spec | impl | status |
| --- | --- | --- | --- |
| Settings 設定 | no1_data_models.md | Settings.ts + schema | aligned |
| Accounts 帳戶 | no1_data_models.md | Account.ts + schema | drift |
| Categories 類別 | no1_data_models.md | Category.ts + schema | drift |
| Transactions 收支紀錄 | no1_data_models.md | Transaction.ts + schema | aligned |
| Transfers 轉帳紀錄 | no1_data_models.md | Transfer.ts + schema | aligned |
| CurrencyRates 貨幣匯率 | no1_data_models.md | CurrencyRate.ts + schema | aligned |
| CurrencyConfig 貨幣顯示設定 | no1_data_models.md | CurrencyConfig.ts + schema | aligned |
| Schedules 定期交易排程 | no1_data_models.md | Schedule.ts + schema | aligned |
| User 使用者 | no1_data_models.md | User.ts + schema | aligned |
| IconDefinitions 圖示定義 | 標準定義 JSON | 非 WatermelonDB model | spec-only |
| Currencies 貨幣 | 標準定義 JSON | 非 WatermelonDB model | spec-only |
| PremiumContext Local State | Local State | 執行期 React context | spec-only |
| Account.typeId / standard_category_id | 無對應 | Account.ts / Category.ts / schema | impl-only |
| schema.ts version 5 | 整體形狀 | schema.ts version 5 | aligned |
| migrations.ts v5 | launchMode + deletedOn | migrations.ts v5 | aligned |

### 付費鏈軸（22 row）

| item | product | spec | impl | status |
| --- | --- | --- | --- | --- |
| LEVEL_0 分級定義 | business_model:5 | no17:21 | premiumLogic + limits | aligned |
| LEVEL_1 分級定義 | business_model:19 | no17:38 | premiumLogic >= LEVEL_1 | aligned |
| LEVEL_2 記帳能力=LEVEL_1 | business_model:35 | no17:43 | PlanTier.LEVEL_2 | aligned |
| LEVEL_3 分級 | business_model:52 | 未列入規則表 | enum 無 | spec-only |
| LEVEL_B 分級 | business_model:70 | 未列入規則表 | enum 無 | spec-only |
| createAccount 受限動作 | 帳戶≤3 | no17:67 | premiumLogic fetchCount | aligned |
| createCategory 受限動作 | 類別≤10 | no17:76 | premiumLogic | aligned |
| createTransaction/createTransfer 受限動作 | L0 上限 | no17:113 | premiumLogic 兩條件 AND | aligned |
| useForeignCurrency 受限動作 | 僅限本地幣別 | no17:85 L0 禁 | 有 case 但零 call site | missing-downstream |
| createRecurringTransaction 受限動作 | 無定期交易 | no17:95 L0 禁 | premiumLogic + onPress gate | aligned |
| manageCurrencyRate 受限動作 | 匯率屬外幣衍生 | no17:90 L0 禁 | premiumLogic + PreferenceScreen gate | aligned |
| importData 受限動作 | CSV 匯入屬進階 | no17:108 L0 禁 | premiumLogic + ImportScreen gate（按鈕層） | aligned |
| triggerCloudBackup（全 LEVEL 允許） | L0 含系統端備份 | no17 全 LEVEL 允許 | ActionId 無此識別碼 | drift |
| triggerMultiDeviceSync（L0 禁止） | 取消多裝置即時同步 | no17:103 L0 禁 | 併入 triggerCloudSync | drift |
| triggerCloudSync（impl 獨有） | 無 | 無此識別碼 | 定義 return false、零 call site | orphan |
| refreshStatus 更新訂閱狀態 | payment.md:74 | no6:10 | PremiumContext refreshStatus | aligned |
| 授權判斷職責歸屬 | payment.md:87 | no6:6 委由 SubscriptionGateLogic | PremiumContext 管 tier、canUserPerformAction 在 premiumLogic | aligned |
| 強制點位置 | payment.md:96 執行前檢查 | 各 screen spec 標 | 全在 UI/navigator 層、mutation 繞過 | impl-only |
| 離線授權快取 PremiumStatusCache | payment.md:107 TTL | 無獨立規格 | checkIsPremium 恆 false（未接線） | product-only |
| RedeemCodeScreen 序號兌換 | payment.md:35 | 無 screen spec | 全 repo 零 redeem | product-only |
| quotaService 配額管理 | requirements:103 | no12 checkQuota | quotaService 2000/2000 UTC reset | aligned |

### Map 落地軸（頂層與多數子節點 aligned，列代表性節點與所有非 aligned）

aligned 涵蓋：Auth/LoginFlow/PostAuthSetup、RecordingCore 全子樹、HomeDashboard 全子樹（含 FocusFilter/ChartView/TransactionList/SearchFunction）、AppSetting 全子樹（含 Category/AccountCRUD 與各 Preference 設定）、CloudSync 的 L2/L3/QuotaManagement、Payment 的 Paywall/IAPService/PremiumContext。非 aligned row：

| item | product | spec | impl | status |
| --- | --- | --- | --- | --- |
| AppSetting ▸ ClearDatabase | app_setting.md:58 | no14 | DataManagementScreen handleClearDatabase | drift（F90 駁回後實為 aligned 軟刪） |
| AppSetting design 額外 LocalizationSettingsScreen | 無對應節點 | 無 | LocalizationSettingsScreen.tsx（未註冊） | design-mismatch |
| CloudSync ▸ L4 FullBackupExport | cloud_sync.md:133 | no20 | 無 JSON ZIP、僅 CSV | drift |
| CloudSync ▸ SyncEngine ▸ ConflictResolution | structure.md:60 | 僅 LWW 落 no18 | 無獨立模組 | drift |
| LocalDatabase（寄生 logic_engine.md） | logic_engine.md:1（未入樹/index） | 無明文承載 | src/database/* 完整 | impl-only |
| LogicEngine（LEVEL_2 未實作） | logic_engine.md:16 | 無 | 無 | spec-only |
| LogicEngine ▸ RuleEngine ▸ RuleCenter/RuleEditor | logic_engine.md:33 | 無 | 無 | spec-only |
| LogicEngine ▸ TimeMachine ▸ RecalculationEngine | logic_engine.md:81 | 無 | 無 | spec-only |
| Payment ▸ RedeemCodeScreen | payment.md:35 + structure.md:70 | 無 | 無 | orphan |
| Payment ▸ PremiumFeatureGate | payment.md:87 | no17 canUserPerformAction | 強制點全在 UI 層 | drift |
| Payment ▸ PremiumStatusCache | payment.md:107 | 無 TTL 規格 | checkIsPremium 死碼 | product-only |

### web_console 軸（21 row，全節點 impl 缺席）

| item | product | impl | status |
| --- | --- | --- | --- |
| WebConsole | web_console.md; structure.md:76 | 無 | missing-downstream |
| WebConsole ▸ QueryEngine | web_console.md:19 | 無 | missing-downstream |
| WebConsole ▸ QueryEngine ▸ JQLInterface | web_console.md:36 | 無 | missing-downstream |
| WebConsole ▸ QueryEngine ▸ SavedViews | web_console.md:51 | 無 | missing-downstream |
| WebConsole ▸ ReportBuilder | web_console.md:67 | 無 | missing-downstream |
| WebConsole ▸ ReportBuilder ▸ CustomDimensions | web_console.md:84 | 無 | missing-downstream |
| WebConsole ▸ ReportBuilder ▸ ExportFunction | web_console.md:99 | 無（app CSV 屬 LEVEL_0 DataExport） | missing-downstream |
| AIAdvisor / WebClient | ai_advisor_web_client.md; structure.md:84 | 無 | missing-downstream |
| AIAdvisor/WebClient ▸ FinancialInsightsUI | ai_advisor_web_client.md:18 | 無 | missing-downstream |
| AIAdvisor/WebClient ▸ ConversationInterface | ai_advisor_web_client.md:35 | 無 | missing-downstream |
| AIAdvisor / Backend | cloud_service/ai_advisor_backend.md; structure.md:97 | 無 | missing-downstream |
| AIAdvisor/Backend ▸ LLMProxy | ai_advisor_backend.md:21 | 無 | missing-downstream |
| AIAdvisor/Backend ▸ CashFlowForecastEngine | ai_advisor_backend.md:38 | 無 | missing-downstream |
| AIAdvisor/Backend ▸ HealthScoreEngine | ai_advisor_backend.md:55 | 無 | missing-downstream |
| AIAdvisor/Backend ▸ NaturalLanguageQAEngine | ai_advisor_backend.md:71 | 無 | missing-downstream |
| MacroData | cloud_service/macro_data.md; structure.md:102 | 無 | missing-downstream |
| MacroData ▸ DataPipeline | macro_data.md:25 | 無 | missing-downstream |
| MacroData ▸ MarketIntelligence | macro_data.md:52 | 無 | missing-downstream |
| MacroData ▸ EnterpriseDataService | macro_data.md:99 | 無 | missing-downstream |
| AnalyticsPipeline（4 子節點） | cloud_service/analytics_pipeline.md | 無（ConsentSync 預期 app toggle 亦無） | orphan |
| LLM Provider | external_service/llm_provider.md; structure.md:111 | 無（外部第三方） | missing-downstream |

---

_本報告由 multi-agent workflow（114 agents、6 階段並行）產出：各層各自審查 → 跨層對齊 → 對抗式驗證 → 合併排序。摘要兩處統計數字由主控端機械重算後校正（原 synthesis 估算有偏差）。_
