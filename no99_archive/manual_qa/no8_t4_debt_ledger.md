# T4 自動化債處置清單

## 這份文件是什麼

- no1 規則清單中 98 條 T4 手動不可測規則的處置分流，自動化債的單一真相
- 2026-07-17 以多代理工作流逐條對照 impl 與後端測試碼產出；桶 A 每條經第二輪代理複核測試內容屬實
- 三桶語意
    - 桶 A 已有測試補證：現有單元測試直接斷言規則語意，債已清，證據欄為測試檔
    - 桶 B 可自動化待寫：jest 加 mock、故障注入、fake timers 可構造，附建議手法與成本
    - 桶 C 不可自動化或無標的：UI 依設計不可達、spec 缺口無預期可斷言、規則前提不可達
- 對賬勘誤：桶 A 測試若被改壞，jest 紅燈即為警報，本清單不另設監測

## 總覽：A 41 條、B 49 條、C 8 條

## 桶 A 已有測試補證（41 條）

| ID | 判定理由 | 測試證據 |
| --- | --- | --- |
| R-AU-063 | 測試直接斷言 finishTransaction 拋錯仍通知 entitlement listener——即送後端驗證的觸發路徑不被阻斷，與規則語意吻合 | no2_accounting_app/src/services/iapService.finishTransaction.guard.test.ts：still notifies entitlement when finishTransaction throws |
| R-AU-067 | 維持至到期、失效上限為到期日的語意由純邏輯測試以構造時間戳直接斷言；離線快取端與後端推定端皆覆蓋，無需真實時間流逝；resolveTierFromCache 已接進 PremiumContext | no2_accounting_app/src/services/premiumStatusCache.test.ts（未到期維持 cached tier／過期降 LEVEL_0）＋ no3_cloud_functions deriveEntitlement.test.ts（ACTIVE 維持帶到期日、EXPIRED 降 LEVEL_0） |
| R-AU-096 | 降級映射語意已由純邏輯測試直接斷言，Apple 真退款只是遞送面；storeNotification 的 REFUND/REVOKE→refunded 旗標接線未測，可併 R-AU-093 harness 補強 | no3_cloud_functions/functions/src/logic/deriveEntitlement.test.ts：撤銷降 LEVEL_0 狀態 revoked、退款旗標壓過 active 降 LEVEL_0 refunded |
| R-AU-097 | 維持付費等級＋狀態 grace_period 的核心語意已直接斷言；附到期日為同函式 pass-through、active case 已驗同機制，僅缺一行 expiresDate 斷言可順手補 | no3_cloud_functions/functions/src/logic/deriveEntitlement.test.ts：寬限期維持 LEVEL_1、狀態 grace_period（不誤降付費者） |
| R-AU-098 | 過期推定為純狀態驅動邏輯，deriveEntitlement 對 Status.EXPIRED 回 tier 0 + status expired，測試直接斷言，無需真實時間流逝 | no3_cloud_functions functions/src/logic/deriveEntitlement.test.ts 案例「過期降 LEVEL_0，狀態 expired」，斷言 tier:0 status:expired |
| R-AU-099 | 亂序通知可用 mock 既存 apple_signed_date 構造，writeEntitlement 單調防護測試直接斷言略過寫入 | no3_cloud_functions functions/src/services/entitlementStore.test.ts 案例「較舊事件晚到，略過寫入不覆寫」，斷言 wrote=false 且 set 未呼叫 |
| R-AU-100 | 缺簽章時間事件以 signedDate=null 傳入即可構造，測試斷言照常寫入但 payload 不含 apple_signed_date | no3_cloud_functions functions/src/services/entitlementStore.test.ts 案例「簽章時間不明時寫入，但不寫 apple_signed_date 以免抹除排序鍵」 |
| R-BS-087 | SelectionGridItem.test.tsx 的 shows checkmark overlay when selected 直接斷言 selected 才渲染 overlay 圖示、未選不渲染；impl overlay 定位 top:8/right:8 右上 | src/components/list/SelectionGridItem.test.tsx |
| R-BS-101 | ListEmptyTransition.test.tsx 兩條 test 斷言非作用層 pointerEvents='none'；impl pointerEvents 是 isEmpty 的同步函式、透明度動畫期間即已擋互動，正是切換期間舊態不受互動的機制 | src/components/list/ListEmptyTransition.test.tsx |
| R-CM-022 | fallback 邏輯已抽成 getDefaultId 純函式且 CategoryEditorScreen 實際採用，空清單 fallback 有直接斷言 | src/utils/iconSelection.test.ts：清單為空時退回 fallback（getDefaultId([], 99) === 99） |
| R-CM-061 | iconSelection.test.ts 已直接斷言規則語意：getDefaultId([], 99) 回傳 fallback；AccountEditorScreen.tsx:44 初始選取即走 getDefaultId(getIconsByTag('account'), DEFAULT_ACCOUNT_ICON_ID) | src/utils/iconSelection.test.ts（it: 清單為空時退回 fallback） |
| R-CM-094 | mergeService.test.ts 已直接斷言：跨幣別帳戶 merge throw Error（message match /currency/i）且 batch 零寫入，同幣別放行對照組也在 | src/services/mergeService.test.ts（it: aborts a cross-currency account merge and writes nothing） |
| R-CM-099 | mergeService.test.ts 已直接斷言：跨 type 分類 merge throw Error（message match /type/i）且 batch 零寫入，同 type 放行對照組也在 | src/services/mergeService.test.ts（it: aborts a category merge across different types and writes nothing） |
| R-CU-059 | currencyService.test.ts 502-510 行直接斷言 createCurrencyRate 對負數、Infinity、NaN 皆 writes nothing，守門拒寫語意完整覆蓋 | currencyService.test.ts（writes nothing for a negative rate / non-finite rate） |
| R-CU-069 | defaultDecimals 測試斷言未知碼 ZZZ 經 getMinorUnits fallback 為 2；minorUnits 測試斷言 JPY/KRW 0、KWD/BHD 3、其餘 2 對齊 ISO 無特例 | currencyUtils.defaultDecimals.test.ts:24-26、currencyUtils.minorUnits.test.ts |
| R-DM-008 | syncEngine 測試以 per-user lastSyncedAt null 走 InitialBackup、非 null 走 Delta，直接斷言 null=尚未上傳語意；含多帳號不互相繼承 watermark | src/services/syncEngine.test.ts（never-synced user runs InitialBackup 等案例，header 明寫 Null = never uploaded） |
| R-DM-055 | 快取 null expirationDate 視為無期限已有雙重斷言：resolveTierFromCache 遠未來仍回 LEVEL_1、離線解析 null 到期維持付費 tier | src/services/premiumStatusCache.test.ts（keeps a null-expiry Lifetime cache）+ src/services/entitlementTier.test.ts:38 |
| R-DM-057 | MAX_STORAGE_AMOUNT 定義即 Number.MAX_SAFE_INTEGER（currencyUtils.ts:86），測試斷言 MAX 過、MAX+1 拒、Infinity/NaN 拒，並 guard 其落在 safe-integer 範圍 | src/utils/currencyUtils.storageMax.test.ts（survivesStorageMax boundary + safe-integer guard） |
| R-DM-069 | deriveEntitlement 純邏輯測試斷言 refunded 旗標壓過 active、status 為 refunded；handler 的 REFUND/REVOKE→旗標映射（storeNotification.ts:60）尚無測試，屬可另補的小缺口 | functions/src/logic/deriveEntitlement.test.ts（退款旗標壓過 active，降 LEVEL_0 refunded） |
| R-DM-070 | deriveEntitlement 測試直接斷言 BILLING_GRACE_PERIOD 狀態碼 → status grace_period 且維持付費 tier，即本規則語意 | functions/src/logic/deriveEntitlement.test.ts（寬限期維持 LEVEL_1，狀態 grace_period） |
| R-DM-071 | deriveEntitlement 測試直接斷言 BILLING_RETRY 狀態碼 → tier 0、status billing_retry | functions/src/logic/deriveEntitlement.test.ts（扣款重試降 LEVEL_0，狀態 billing_retry） |
| R-DM-072 | deriveEntitlement 測試直接斷言 REVOKED 狀態碼 → tier 0、status revoked | functions/src/logic/deriveEntitlement.test.ts（撤銷降 LEVEL_0，狀態 revoked） |
| R-DM-074 | entitlementStore 測試整組斷言 apple_signed_date 單調防護：新蓋舊、舊事件晚到略過、相等照寫、時間不明不抹排序鍵、無既有鍵補記 | functions/src/services/entitlementStore.test.ts（writeEntitlement 單調防護 describe，共 6 案例） |
| R-RC-027 | convertToSchedule 測試直接斷言先建後刪：create 成功才呼叫 deleteTransaction，create 失敗時 deleteTransaction 未被呼叫 | src/services/recurringLogic.convertToSchedule.test.ts |
| R-RC-028 | 測試注入 createSchedule 失敗，斷言 rejects（操作以失敗結束）且原交易不被刪 | src/services/recurringLogic.convertToSchedule.test.ts |
| R-RC-029 | 測試注入 deleteTransaction 失敗，斷言容忍不外拋並回傳新排程（不回滾） | src/services/recurringLogic.convertToSchedule.test.ts |
| R-RC-040 | restoreScheduleInstances 測試斷言 endOn+全部實例單一 write 單一 batch，且 mid-loop 失敗整筆未套用（FINDING-08 案例） | src/services/recurringLogic.restoreScheduleInstances.test.ts |
| R-RC-053 | generateMissingInstances 測試斷言重複呼叫第二輪零新增（同 instanceDate 去重） | src/services/recurringLogic.test.ts：a repeat call is idempotent — second run adds nothing |
| R-RC-054 | 測試以 Promise.all 並行兩次呼叫，斷言 in-flight lock 下不 double-write（共用同一執行） | src/services/recurringLogic.test.ts：concurrent calls never double-write (in-flight Promise lock) |
| R-ST-086 | 客端語意是無條件覆寫上傳、永不下載合併，測試已直接斷言（含跨裝置 create 競態 fallback 仍發布偏好）；跨裝置最終覆寫由 Firestore last-write-wins 承擔，無需真多裝置 | no2_accounting_app/src/services/userService.test.ts（既有文件單次 update 無條件覆寫偏好、跨裝置 create 競態 fallback、preferences upload-only 永不 parse 回） |
| R-TX-072 | validationGuards.test.ts 有同名 it() 直接斷言 createTransaction 缺必填欄位 throw ValidationError MISSING_FIELD，備註屬實 | src/services/validationGuards.test.ts（it 'R-TX-072 create rejects a missing required field'） |
| R-TX-073 | validationGuards.test.ts 有同名 it() 斷言金額 0 throw INVALID_AMOUNT | src/services/validationGuards.test.ts（it 'R-TX-073 create rejects a zero amount'） |
| R-TX-076 | validationGuards.test.ts 有同名 it() 斷言 updateTransaction 缺 transactionId throw MISSING_FIELD | src/services/validationGuards.test.ts（it 'R-TX-076 update rejects a missing transactionId'） |
| R-TX-077 | validationGuards.test.ts 有同名 it() 斷言 update 金額 0 throw INVALID_AMOUNT | src/services/validationGuards.test.ts（it 'R-TX-077 update rejects a zero amount'） |
| R-TX-083 | validationGuards.test.ts 有同名 it() 斷言 createTransfer 缺必填欄位 throw MISSING_FIELD | src/services/validationGuards.test.ts（it 'R-TX-083 create rejects a missing required field'） |
| R-TX-084 | validationGuards.test.ts 有同名 it() 斷言金額非正 throw INVALID_AMOUNT | src/services/validationGuards.test.ts（it 'R-TX-084 create rejects a non-positive amount'） |
| R-TX-086 | validationGuards.test.ts 有同名 it() 斷言轉出轉入同帳戶 throw SAME_ACCOUNT | src/services/validationGuards.test.ts（it 'R-TX-086 create rejects the same account on both legs'） |
| R-TX-088 | transferLogic.test.ts 直接斷言未知幣別 createTransfer throw INVALID_CURRENCY 且零 rate row、零 transfer row 寫入，即中止全部寫入語意；備註屬實 | src/services/transferLogic.test.ts（it 'aborts with INVALID_CURRENCY for an unknown currency and writes no rate row'） |
| R-TX-096 | validationGuards.test.ts 有同名 it() 斷言 updateTransfer 缺 transferId throw MISSING_FIELD | src/services/validationGuards.test.ts（it 'R-TX-096 update rejects a missing transferId'） |
| R-TX-097 | validationGuards.test.ts 有同名 it() 斷言 update 金額非正 throw INVALID_AMOUNT | src/services/validationGuards.test.ts（it 'R-TX-097 update rejects a non-positive amount'） |
| R-TX-099 | validationGuards.test.ts 有同名 it() 斷言 update 轉出轉入同帳戶 throw SAME_ACCOUNT | src/services/validationGuards.test.ts（it 'R-TX-099 update rejects the same account on both legs'） |

## 桶 B 可自動化待寫（49 條：小 26、中 23）

| ID | 成本 | 現況與缺口 | 建議手法 |
| --- | --- | --- | --- |
| R-AU-006 | 小 | 毫秒窗切網只是觸發手段，語意是 auth 拋網路錯誤要映射連線異常提示；getAuthErrorMessage 與 AuthContext.signIn catch 可 jest 直測，目前查無測試 | mock 憑證交換 reject code auth/network-request-failed，spy Alert 斷言 auth.error_network；沿用 AuthContext 既有 jest harness |
| R-AU-011 | 小 | keychain 錯誤可用 mock reject 注入；AuthContext.signOut 的 catch 不 rethrow、finally setUser(null) 清登入狀態，jest 可直測，目前查無測試 | mock firebaseSignOut rejected，斷言 user state 仍清為 null 且 Alert 報 logout_failed（AuthContext.tsx:233-253） |
| R-AU-087 | 小 | 驗簽在既有 handler 測試中已 mock 掉，無需 Apple 私鑰即可構造缺編號 txn；檢查在 verifyTransaction.ts:27-30，但現有測試只覆蓋偽造簽章與未登入，此分支未測 | 沿用 verifyTransaction.test.ts harness：mock verifyTransactionAnyEnv resolve 出缺 originalTransactionId 與 transactionId 的 txn，斷言 invalid-argument 且 claimTxnIndex/writeEntitlement 未呼叫 |
| R-AU-090 | 小 | 查無訂閱狀態可由 mock pickStatus 回 undefined 構造，不必誘發 Apple；分支在 verifyTransaction.ts:40-45，現有測試未覆蓋 | 同 verifyTransaction.test.ts harness：mock getApiClient/pickStatus 回 undefined，斷言擲 unavailable 且 writeEntitlement 未呼叫 |
| R-AU-094 | 小 | 查無 UID 分支純邏輯可 mock 構造（實作回 503 待 Apple 重送、不更新）；與 R-AU-093 共用新 harness 後增量成本小 | 同 storeNotification harness：lookupUid 回 null，斷言回 503 且 writeEntitlement 未呼叫（storeNotification.ts:50-58） |
| R-AU-095 | 小 | 分支條件（查無狀態且非退款撤銷→略過不更新）全可 mock 構造；共用 harness 增量小，目前無測試 | 同 harness：pickStatus 回 undefined 且 notificationType 非 REFUND/REVOKE，斷言回 200 且 writeEntitlement 未呼叫（storeNotification.ts:60-71） |
| R-BS-026 | 小 | getAccount/getCategory 以 try/catch 包 find()、查無回 null（localDbService.ts:21-51），localDbService.test.ts 已有 mock DB harness 但無此案例 | 在既有 localDbService.test.ts harness 加 case：mock find() reject 斷言回 null、resolve 斷言回實體 |
| R-BS-027 | 小 | getAccount/getCategory 直呼 .find(id) 無 user_id 與 deleted_on 條件（localDbService.ts:23,44），規則語意即此行為；localDbService.test.ts 已有 clause-capture mock 基建但未覆蓋單筆查詢 | 沿用 localDbService.test.ts 既有 database mock，斷言 getAccount/getCategory 直呼 find 且不帶租戶與軟刪 clause、軟刪與他租戶 id 仍可取回 |
| R-CM-033 | 小 | 後備閘已實作於 categoryLogic.ts assertNameWithinLimit（trim 後比 NAME_MAX_LENGTH、throw ValidationError NAME_TOO_LONG）但 grep 全 repo 無測試引用；throw 在 database.write 前、既有測試 harness 可直測 | 在 categoryLogic.test.ts 以超上限名稱呼叫 createCategory，斷言 throw ValidationError('NAME_TOO_LONG') |
| R-CM-070 | 小 | 後備閘已實作於 accountLogic.ts assertNameWithinLimit（trim 後比 NAME_MAX_LENGTH、throw ValidationError NAME_TOO_LONG）但 grep 全 repo 無測試引用；throw 在 database.write 前、既有測試 harness 可直測 | 在 accountLogic.test.ts 以超上限名稱呼叫 createAccount，斷言 throw ValidationError('NAME_TOO_LONG') |
| R-CU-048 | 小 | 備註稱 jest 覆蓋，實查 currencyService.test.ts 只斷言無記錄回 1 與直接/反向查找，fixture 無兩腿間接路徑，接力實作也能全過，不接力語意未被釘死 | 補 fixture 鋪 USD→EUR 與 EUR→TWD 兩筆、斷言 USD→TWD 回 1 不接力；harness 現成 |
| R-CU-074 | 小 | fallback 在 CurrencyContext.tsx:96（!currencyId 回 decimals 2、useThousandsUnit false），convertAmount 測試只驗換算 fallback，未斷言此顯示設定 fallback | 沿用 CurrencyContext.convertAmount.test.tsx 的 mount harness，斷言 getCurrencyConfig 對未知碼回 {decimals:2, useThousandsUnit:false} |
| R-DM-048 | 小 | 值域斷言目前無測試；entitlementService 只把非 number tier 回退 LEVEL_0，超界數字會穿過。guard test 可鎖 PlanTier 枚舉值域並斷言解析回退 | jest 斷言 PlanTier 值域恰為 {0,1,2} + mock Firestore snapshot 塞非法 tier 斷言回退 LEVEL_0（entitlementService.ts:54） |
| R-DM-065 | 小 | 程式路徑存在（deriveEntitlement 無 expiresDate 補 null、entitlementStore 照寫 expires_date null），但現有測試只斷言帶到期日案例，null 語意無直接斷言 | jest 呼叫 deriveEntitlement 不帶 expiresDate 斷言回 null，並用既有 entitlementStore mock 斷言寫入 expires_date null |
| R-HR-110 | 小 | impl 有 pendingRequests in-flight map（PeriodDataStore.ts:124-231）；PeriodDataStore.test.ts 僅測 await 後序列快取命中，未測並發進行中共用 | jest mock repository 回傳可控未 resolve promise，同 key 連呼 fetch 兩次再 resolve，斷言 repo 只被呼一次、兩者回同一物件 |
| R-IE-082 | 小 | 備註稱黑箱不可觀察，但 syncEngine.test.ts 已全面 mock Firestore；對 mock 加 onSnapshot spy 跑全備份流程斷言零呼叫即可觀察，非不可自動化 | syncEngine 測試 harness 的 firestore mock 加 onSnapshot spy，跑 Initial/Delta 全流程斷言 not.toHaveBeenCalled |
| R-IE-093 | 小 | impl 在 detectRemoteUserData catch 回 false 走 InitialBackup（syncEngine.ts:288-290），harness 已有 fsMock.__getDocs，惟現有測試只鋪空/有資料兩態、無探測拋錯案例 | fsMock.__getDocs.mockRejectedValue 後斷言走 InitialBackup 並 stamp watermark；harness 現成 |
| R-IE-105 | 小 | 現有測試僅注入 quotaService 拋錯驗 sync catch 短退避，未注入 Firestore 端 resource-exhausted 於 push/批次寫入；語意相鄰但配額錯誤來源未直接構造 | 對 fsMock 批次寫入 mockRejectedValue(code resource-exhausted)，斷言 sync() resolve 不外拋且戳記短退避 |
| R-OF-004 | 小 | 探測失敗時點 jest 可精準注入：detectRemoteUserData 的 getDocs 拋錯即走 catch 回 false 轉 runInitialBackup；syncEngine.test.ts harness 已備，現只 mockResolvedValue 無 rejection 案例 | 在 syncEngine.test.ts 加 fsMock.__getDocs.mockRejectedValue，斷言仍走 InitialBackup 全量上傳並蓋戳 |
| R-OF-013 | 小 | 登出失敗前提 jest 可注入：mock firebaseSignOut rejected，斷言 AuthContext.tsx:233 finally 路徑仍清本地登入狀態；現有 AuthContext 測試只 mock signOut 未測失敗分支 | 沿用 AuthContext.backupTrigger.test.tsx harness，firebaseSignOut mockRejectedValue 後呼叫 signOut，斷言 user 清空 |
| R-RC-046 | 小 | 前提（正向刪除曾容忍失敗）在 jest 可直接構造：原紀錄設為未軟刪即是該狀態，查無測試 | 併入 revertConvertToSchedule 測試：原紀錄 fixture 不帶軟刪標記，呼叫 revert 斷言不拋且紀錄維持有效 |
| R-RC-069 | 小 | impl 有 per-schedule try/catch skip（recurringLogic.ts:538）但 recurringLogic.test.ts 查無單筆失敗續跑的斷言；harness 現成 | 在既有 generateMissingInstances harness 塞一筆會拋錯的壞排程，斷言其餘排程實例照補 |
| R-ST-032 | 小 | 錯誤提示在 AuthContext.tsx:244 signOut catch 後 Alert.alert(auth.logout_failed)；jest mock firebase signOut reject 即可誘發，不需真 keychain 故障 | 沿用 AuthContext.backupTrigger.test.tsx harness，mock signOut reject + Alert spy 斷言 logout_failed |
| R-TX-081 | 小 | transactionLogic.ts 173 行有條件改寫分支（scheduleId !== undefined 才改寫），但全 repo 查無測試直呼 updateTransaction 斷言此分支；備註列債屬實 | 仿 transferLogic.test.ts 的 jest.mock('../database') harness，直呼 updateTransaction 帶／不帶排程欄位各一次，斷言改寫與保留 |
| R-TX-102 | 小 | impl 確認 updateTransfer 在 transfer.update 前解析幣別、未知即 throw 不留半套；但 transferLogic.test.ts 只測 create 路徑，update 路徑無直接斷言，共用 helper 不等於路徑已鎖 | transferLogic.test.ts 既有 harness 已含 seedTransfer；補一條 updateTransfer 帶未知幣別帳戶，斷言 INVALID_CURRENCY 且 transfer 未更新、零 rate row |
| R-TX-112 | 小 | UndoContext 刻意拆 showUndo 與 beginCountdown 兩段，語意純 JS 可測，但目前查無 UndoContext 測試 | jest fake timers + renderHook：showUndo 後推進 5 秒斷言 bar 仍在，beginCountdown 後推 4 秒斷言關閉 |
| R-AU-049 | 中 | 實機三路不可誘發，但 catch 分支真實存在（StoreKit 層拒絕仍可能），jest 故障注入可達；需 render PaywallScreen 連帶 mock 多個 context，成本中 | mock iapService.restorePurchases rejected，按恢復後 spy Alert 斷言 paywall.restore_error_msg（PaywallScreen.tsx:203-206） |
| R-AU-093 | 中 | 語意是收到通知後驗簽、TransactionIndex 歸戶、寫對應 UID 授權的純邏輯，mock payload 可測；storeNotification.ts 目前完全無測試檔，需新建 harness | 仿 verifyTransaction.test.ts mock onRequest 回原始 handler，mock 驗簽/lookupUid/writeEntitlement，fake req/res 斷言以 lookupUid 歸戶的 uid 呼叫 writeEntitlement |
| R-BS-004 | 中 | impl 為 fire-and-forget 不 await（AuthContext.tsx:127-130），但現有 backupTrigger 測試只驗有委派、未斷言不阻塞。jest 可 mock 背景任務為永不 resolve 的 promise 斷言主流程照樣完成 | 沿用 AuthContext.backupTrigger.test.tsx 的 render harness，mock runBackup 回 pending promise、斷言 signIn resolve true |
| R-BS-016 | 中 | 閘門在 AppNavigator routing effect（isPremiumLoaded 未就緒不路由，175-177 行），P1 但查無任何測試引用 isPremiumLoaded。可 mock context 驗先不導航、就緒後才解析落點 | testing-library render 或抽出 guard 純函式；mock usePremium 先 isPremiumLoaded=false 斷言不 navigate、翻 true 斷言按 tier 解析落點 |
| R-BS-079 | 中 | 截斷邏輯存在於 importService.ts:634/672（.slice(0, NAME_MAX_LENGTH)），grep 匯入相關測試檔查無截斷斷言 | jest mock 匯入寫入路徑，餵超長帳戶與分類名稱，斷言落庫 name 長度截至 NAME_MAX_LENGTH 且不報驗證失敗 |
| R-BS-098 | 中 | 載入抑制空狀態邏輯在畫面層（CurrencyRateListScreen.tsx:63 showEmptyState = isEmpty && !isLoading），查無測試覆蓋 | jest render 該畫面（或抽出述詞）mock isLoading=true 且清單為空，斷言 ListEmptyTransition 收到 isEmpty=false |
| R-CM-032 | 中 | UI 手動不可達但 jest 可構造：CategoryEditorScreen 的 catch 顯示 error_save Alert（139-141 行），mock createCategory/updateCategory reject 即可觸發；目前無 screen 測試 | render CategoryEditorScreen + jest.mock categoryLogic 使其 reject，按儲存後 spyOn Alert.alert 斷言錯誤提示 |
| R-CM-069 | 中 | UI 手動不可達但 jest 可構造：AccountEditorScreen 的 catch 顯示 error_save Alert（132-134 行），mock createAccount/updateAccount reject 即可觸發；目前無 screen 測試 | render AccountEditorScreen + jest.mock accountLogic 使其 reject，按儲存後 spyOn Alert.alert 斷言錯誤提示 |
| R-CM-093 | 中 | UI 目標清單已濾不相容項故手動不可達，但 jest 可 mock mergeAccounts/mergeCategories reject 觸發 MergeEditorScreen 的 catch → Alert（230-232 行 merge.error）；目前無 screen 測試 | render MergeEditorScreen + jest.mock mergeService 使其 reject，執行合併後 spyOn Alert.alert 斷言錯誤提示 |
| R-CU-045 | 中 | DB 故障可用 jest 故障注入：CurrencyRateEditorScreen 的 catch 顯示 error_save Alert（171-173 行），mock 寫入 service reject 即可觸發；目前無 screen 測試 | render CurrencyRateEditorScreen + jest.mock currencyService 寫入 reject，儲存後 spyOn Alert.alert 斷言錯誤提示 |
| R-HR-114 | 中 | evictCacheIfNeeded 未標記優先淘汰分支存在（PeriodDataStore.ts:265-285），PeriodDataStore.test.ts 無任何淘汰測試 | jest 塞滿快取超上限、以 fake timers 或 Date.now spy 控制 accessTime 順序，斷言淘汰的是最久未存取的未標記 key |
| R-HR-115 | 中 | 全高優先 fallback 分支存在（PeriodDataStore.ts:287-297），同樣無測試；LRU 順序 jest 可精準構造 | jest 將所有 entry 標成 high priority 後塞滿超限，控制存取順序，斷言自 high 中淘汰最久未存取一筆 |
| R-IE-008 | 中 | 對話框在 DataManagementScreen.tsx:76 catch 後 Alert.alert(export.failed)，無 screen 測試；jest mock exportService reject 即可構造故障 | RNTL render DataManagementScreen + exportService mock reject + Alert.alert spy 斷言 export.failed |
| R-IE-012 | 中 | 對話框在 DataManagementScreen.tsx:44 catch 後 Alert.alert(reset_failed_msg)，無 screen 測試；mock 清除服務 reject 可構造 | Alert spy 捕捉確認框 buttons、invoke destructive onPress、mock 清除 reject 後斷言 reset_failed_msg |
| R-IE-022 | 中 | 對話框在 ImportScreen.tsx:404/447 catch 後 Alert.alert(error_file_read)，無 screen 測試；mock RNFS/DocumentPicker reject 可注入讀檔故障 | RNTL render ImportScreen + RNFS.readFile mock reject + Alert spy 斷言 error_file_read |
| R-IE-041 | 中 | 對話框在 ImportScreen.tsx:503 catch 後 Alert.alert(import_failed)，無 screen 測試；mock importService 執行段 reject 可構造匯入失敗 | RNTL render ImportScreen + importService mock reject + Alert spy 斷言 import_failed |
| R-IE-061 | 中 | 對話框在 ImportScreen.tsx:414/424 catch 後 Alert.alert(template_download_failed)，無 screen 測試；mock 分享/範本服務 reject 可構造 | RNTL render ImportScreen + templateService/Share mock reject + Alert spy 斷言 template_download_failed |
| R-OF-011 | 中 | 毫秒級時序 jest 可凍結：mock subscribeEntitlement 延遲首個 snapshot，斷言 isPremiumLoaded 保持 false、AppNavigator 閘門 early-return 不以 LEVEL_0 判定；現有測試零覆蓋 isPremiumLoaded | 沿用 PremiumContext.accountScope.test.tsx 的 provider harness，控制 snapshot 到達前後斷言 isPremiumLoaded 翻轉與閘門行為 |
| R-RC-042 | 中 | revertScheduleCreation 存在（recurringLogic.ts:324）但查無測試；同家族 restoreScheduleInstances 已有可複用的 mock DB harness | 沿用 restoreScheduleInstances.test.ts 的 mock write/batch harness，注入 batch 失敗斷言排程與實例整筆未套用 |
| R-RC-045 | 中 | revertConvertToSchedule 存在（recurringLogic.ts:341）但查無測試；原子性語意可用 mock 失敗注入驗證 | mock database.write/batch 注入失敗，斷言原紀錄未復活時新排程也未刪（無雙亡中間態） |
| R-RC-050 | 中 | revertScheduleUpdate 存在（recurringLogic.ts:358）但查無測試；含快照輸入不重查的約定也該一併鎖住 | mock harness + 快照實例集合輸入，注入 batch 失敗斷言 endOn/實例/新排程零套用不留半套 |
| R-SR-033 | 中 | debounce 為 SearchScreen.tsx:168-173 的 setTimeout，查無測試；毫秒時序 jest fake timers 可構造 | jest fake timers render SearchScreen（mock contexts 與搜尋 service），輸入後斷言延遲未到不觸發、advanceTimersByTime 過延遲才觸發一次 |
| R-SR-036 | 中 | 重查來源為監看 undoRevertCount（SearchScreen.tsx:186-193），查無測試；內部訊號 jest mock context 可注入 | jest mock UndoContext 提供可變 undoRevertCount，render 後遞增計數，斷言搜尋 service 被重新呼叫且僅由計數變動觸發 |

## 桶 C 不可自動化或無標的（8 條）

| ID | 理由 |
| --- | --- |
| R-BS-057 | 規則前提不可達：CalendarDialog props 僅 value/onChange/mode（CalendarDialog.tsx:129），無上下限 props、亦無任何呼叫端指定範圍，impl 無此行為可斷言 |
| R-CU-032 | 匯率新增模式六條之一：UI 依設計無入口、已拍板不處理，規則前提在產品內不可達，寫測試無守護對象 |
| R-CU-036 | 匯率新增模式六條之一：依賴新增模式且 UI 無入口、已拍板不處理，規則前提不可達 |
| R-CU-038 | 匯率新增模式六條之一：依賴新增模式幣別 modal、UI 無入口、已拍板不處理，規則前提不可達 |
| R-CU-039 | 匯率新增模式六條之一：依賴新增模式幣別 modal、UI 無入口、已拍板不處理，規則前提不可達 |
| R-SR-049 | UI 依設計不可達且 impl 無實體：BottomSearchBar 無 modal 變體 prop、六個引用端全為底部 dock，spec 的 modal 變體在 impl 無對應元件與可達 modal，無物可斷言 |
| R-SR-050 | 同 R-SR-049：modal 變體搜尋列在 impl 無實體、載體 modal UI 不可達，固定頂部不隨鍵盤移動的行為無對應程式碼可測 |
| R-XD-008 | 規則本身是 spec 缺口登記，非行為規則：spec 未明定復原超上限的容忍行為，無預期值可斷言，測試無標的；需先上游拍板容忍行為並補 spec，才有可自動化的規則可測 |
