# 手動 QA 執行 findings

執行過程中確認的 app 缺陷登記。文件缺陷（場次假設錯、基準漏算）不登這裡，直接修 no2 / no3。

| 編號 | 狀態 | 規則 | 摘要 |
| --- | --- | --- | --- |
| FINDING-01 | open | R-TX-105 | 跨幣別轉帳每次儲存都補錄匯率，無變更儲存也補 |
| FINDING-02 | open | R-DM-035 | 匯率生效日存完整時刻，spec 要求該日 UTC 零時 |
| FINDING-03 | open | R-DM-041 | 排程開始日帶建立當下時刻，spec 要求使用者時區零時轉存 UTC |
| FINDING-04 | open | R-TX-048/R-TX-015 | 定期結束日重開編輯器顯示今天，非原設日期；有覆寫風險 |
| FINDING-05 | open | — | createSchedule 不寫 updated_on，活排程永不進增量備份，雲端還原全丟 |
| FINDING-06 | open | R-IE-068 | 匯入非法日期未略過，Hermes 滾動進位改期落庫 |
| FINDING-07 | fixed | R-IE-024 | 備註欄含空值即被候選剔除，round-trip 重匯整批丟備註 |
| FINDING-08 | open | R-CM-104/105/R-XD-010 | 合併復原對自轉帳雙重 prepareUpdate 炸掉，轉帳段半還原 |
| FINDING-09 | open | R-BS-015 | 前景恢復因 Auth token 刷新重跑整套開機流程，含排程補產與備份 |
| FINDING-10 | open | — | 軟刪匯率仍參與換算，rate 查詢全線漏濾 deleted_on |
| FINDING-11 | fixed | R-IE-067/R-BS-078 | 欄位守門整欄封殺，說明檔承諾的逐列略過不可達 |
| OBS-01 | observation | — | 貨幣格式畫面重設後按勾選，NULL 被畫面選值改寫回覆寫 |

---

## FINDING-01 轉帳更新 dateChanged 恆真，匯率過度補錄

- 發現：2026-07-11，場次 A-05 步 43 / CP-A-05-3
- 判定：**FAIL** `R-TX-105`（匯率日期幣別對皆未變時不新增匯率記錄，spec `no8_transfer_logic`）

### 現象

跨幣別轉帳在編輯器每按一次完成，就補錄正反兩筆匯率。改備註、無變更直接儲存都會補。

### 根因

- `src/database/models/Transfer.ts` 的 `@date('date')` getter 執行期回傳 Date 物件（型別註記是 number，實際不是）
- `src/services/transferLogic.ts` `updateTransfer` 內：`const originalDate = transfer.date` 拿到 Date 物件，`dateChanged = originalDate !== input.date` 與 ms 數字比對恆為 true
- 補錄條件 `(rateChanged || dateChanged || pairChanged)` 因此恆真

### 佐證（本輪執行資料）

- 波 w2：只改備註的儲存 → 補錄 1.2 正反對
- 波 w4：步 43 無變更儲存 → 補錄 1.1 正反對（與 w3 相隔 6 秒、值完全相同）
- 修法方向：`Number(originalDate) !== input.date`（同 `transactionLogic.ts` snapshot 的 `Number(tx.date)` 前例）

### 影響與波及

- 匯率表膨脹：每次無意義儲存多 2 列（append-only 表、不影響換算正確性——換算取最新列，值相同）
- `R-TX-106`（換幣別對補錄）本輪無法乾淨歸因：恆真條件遮蔽 pairChanged 攻擊面，修復後需重驗 R-TX-105 與 R-TX-106
- 修復追蹤：spawn task「修 transferLogic dateChanged 型別比對」

---

## FINDING-02 匯率生效日存完整時刻，違反 UTC 零時規格

- 發現：2026-07-11，場次 A-07 / CP-A-07-01
- 判定：**FAIL** `R-DM-035`（匯率生效日儲存該日 UTC 零時，spec `no1_data_models.md` CurrencyRates.date 欄）

### 現象

`currency_rates.date` 全庫零列落在 UTC 零時。三條寫入路徑皆存當下完整時刻：

- 佔位種入：`currencyService.ts` 約 59 行 `rec.date = timestamp`
- 手動編輯：`currencyService.ts` 約 123 行 `rec.date = date`，caller 傳完整時刻
- 轉帳連動：`transferLogic.ts` `r.date = input.date`，轉帳含時分

### 影響

- 取值排序（date 最新優先）仍正確，功能面無立即錯
- 「同一生效日取更新較新」的並列規則（AXIS4-10）形同虛設——完整時刻幾乎不會相等
- 日界語意跨時區漂移：同一天在不同時區寫入會落在不同「日」

### 處置方向（需產品決策）

- 甲：impl 修——寫入前 normalize 到該日 UTC 零時，對齊 spec；歷史資料是否回填另議
- 乙：spec 改——承認完整時刻語意，改寫 R-DM-035 與並列規則
- 傾向甲：AXIS4-10 並列設計本意就是日粒度

---

## FINDING-03 排程開始日帶完整時刻，違反使用者時區零時規格

- 發現：2026-07-11，場次 A-08 / CP-A-08-01
- 判定：**FAIL** `R-DM-041`（spec `no1_data_models.md` Schedules.startOn：基於使用者時區的 00:00:00 轉存 UTC）

### 現象

排01 建立後 `schedules.start_on` 換算裝置時區為 19:37，即建立當下時刻，非該日零時。補產實例的 `schedule_instance_date` 全數繼承同一時刻。

### 影響

- 日粒度顯示分組不受影響，實例落日正確
- 日界邊緣風險：起始時刻接近午夜時，補產與錨定的「日」判定可能跨界偏移
- 與 FINDING-02 同族（日期欄寫入不歸零），可與 task_b7b530e4 同一波修

### 處置方向

- impl 修：排程建立時把 startOn normalize 到使用者時區零時再轉 UTC 存
- 實例時刻語意（是否同步歸零）由修復場一併決策

---

## FINDING-04 定期結束日重開編輯器顯示今天而非原設日期

- 發現：2026-07-11，場次 A-09 步 27 附近（使用者實測回報）
- 判定：**FAIL** `R-TX-048`（帶回定期設定原值）與 `R-TX-015`（編輯器回填排程規則）

### 現象

排程設 `特定日期` 結束日 7/1 存檔。重開編輯器展開定期面板，`特定日期` 選項亮起（正確），但日期 picker 顯示今天，非 7/1。

### 根因

- `src/components/RecurringOptions.tsx` 約 38 行：`pickerDate` 用 `useState` lazy init，`rule?.endOn ? new Date(rule.endOn) : new Date()`，只在 mount 執行一次
- `AnimatedCollapse`（src/components/AnimatedCollapse.tsx）children 常駐掛載，面板隨編輯器一開就 mount
- 此刻 `TransferEditorScreen.loadTransfer` 尚未完成，`recurringRule` 仍 null → `pickerDate` 落 `new Date()` 今天
- 稍後 `setRecurringRule({...endOn: sch.endOn})` 到位、`endCondition` 轉 ON_DATE 亮起，但 `pickerDate` 無 resync effect，維持今天
- 型別旁證：`Schedule.endOn` 為 `@date` 回 Date 物件，塞進宣告 `number|null` 的 `RecurringRule.endOn`，number/Date 混用

### 影響與風險

- 顯示錯：面板 picker 顯示今天，誤導使用者以為結束日是今天
- 資料覆寫風險：重開後若點一下 `特定日期`（約 118 行 `updateDraft({ endOn: pickerDate.getTime() })`），endOn 被今天覆寫，原設日期靜默丟失
- 交易編輯器同元件（TransactionEditorScreen）同享此 bug

### 修法方向

- 加 effect：`rule?.endOn` 由 null 變有值時，若使用者尚未手動改 picker，把 `pickerDate` 同步為 `new Date(Number(rule.endOn))`
- 統一 `endOn` 型別為 number：load 時 `Number(sch.endOn)`，杜絕 Date/number 混用

---

## FINDING-05 createSchedule 不寫 updated_on，活排程永不進備份

- 發現：2026-07-11，場次 A-09 / CP-A-09-07 追查中
- 判定：**FAIL**。無單一規則 id 直接對應；違反 auditStamp 不變量（D9-2）與備份完整性

### 現象

本地 6 個活排程 `updated_on` 全為 0。雲端 `users/{uid}/schedules` 11 筆全是墓碑，活排程零筆上雲。

### 根因

- `src/services/recurringLogic.ts` `createSchedule` 的 create 區塊未呼叫 `stampUpdate`——整檔只 import `stampSoftDelete`/`stampRestore`
- `updateSchedule` 的 endOn 截斷寫入與 `revertScheduleUpdate` 的 endOn 還原寫入同樣未 stamp
- 備份挑選條件 `updated_on >= lastSyncedAt`（syncEngine getLocalChanges），0 永遠小於 watermark → 增量備份永久跳過

### 實證

- sqlite：A-08/A-09 新建排程 `updated_on` 全 0.0；被 stampSoftDelete 碰過的墓碑值正常
- Firestore Admin：雲端 schedules 11 筆全帶 `deletedOn`，`排01日常` 等 6 個活排程缺席

### 影響

- 使用者換機／重裝從雲端還原：所有進行中的定期排程全數消失，僅刪掉的排程有墓碑
- 全量備份（watermark 歸零）可撈回，但現行流程僅首登走全量
- auditStamp guard test 只擋裸賦值，未擋「漏 stamp 的 create」——測試缺口一併補

### 修法方向

- `createSchedule` create 區塊補 `stampUpdate(schedule, timestamp)`
- `updateSchedule` 截斷與 `revertScheduleUpdate` 還原的 endOn 寫入補 stamp
- 歷史資料回填：對 `updated_on = 0` 的排程列補當下戳，讓下次備份撈起
- 補 guard test：每張表 create 路徑必須落 stamp

---

## FINDING-06 匯入非法日期未略過，滾動進位改期落庫

- 發現：2026-07-12，場次 A-15 步 12 至 13 / CP-A-15-03
- 判定：**FAIL** `R-IE-068`（日期解析失敗列應略過並計入略過數）

### 現象

匯入 CSV 含 `2026-07-32 00:00:00` 非法日列。該列未被略過，落庫成 `2026-08-01 00:00:00 UTC`。預覽摘要略過 1、完成對話框略過 1，皆漏計此列。金額被計入錯誤月份。

### 根因

- `src/services/importService.ts` 約 87 行：`DATE_REGEX_DATE_ONLY` / `DATE_REGEX_DATETIME` 只驗 `\d{2}` 格式，不驗月日值域，`32` 過關
- 約 348 行：`parseDate` 帶來源偏移分支用 `new Date('2026-07-32T00:00:00+00:00')` 解析。Hermes 引擎對超界日滾動進位回有效時間戳，`isNaN` guard 不觸發
- 引擎歧異：同字串在 Node/V8（Jest 環境）回 Invalid Date → NaN，`importService.parseDate.test.ts` 全綠，裝置行為與測試不一致

### 影響

- 使用者匯入含壞日期列被靜默改期落庫，月報表金額歸錯期
- 匯出檔含此列，重匯再複製一筆，污染擴散
- 三個解析分支（內嵌偏移、來源偏移、裝置本地）中前兩者皆走 `new Date(string)`，同險；本地分支走 `new Date(y,m-1,d)` 同樣滾動進位

### 修法方向

- `parseDate` 解析成功後 round-trip 驗證：把時間戳轉回年月日與輸入比對，不一致回 NaN
- 或 `isValidDateFormat` 直接驗月 1 至 12、日 1 至當月天數
- regression test 不能依賴引擎行為：直接斷言 `parseDate('2026-07-32 00:00:00', '+00:00')` 回 NaN，三分支各補一條

---

## FINDING-07 備註欄含空值即被候選剔除，round-trip 重匯整批丟備註

- 發現：2026-07-12，場次 A-15 步 18 至 21 / CP-A-15-06；回溯解釋 A-14 步 25 至 27 與 CP-A-14-03 的備註異常
- 判定：**FAIL** `R-IE-024`（同名 CSV 欄應全自動帶入；note 為 Optional 欄，空值不應使欄位失格）

### 現象

匯出 93 筆（34 筆空備註）再原樣重匯，重匯 93 筆備註全 NULL。欄位對應步驟 `備註` 未自動帶入，下拉候選也無 `note` 可選，操作者無從補救。note 屬可選欄，前進不被擋，靜默丟失。

### 根因

- `src/services/importService.ts` 約 131 行：`isValidText` 要求非空字串
- 約 157 行：`scanColumnCompliance` 要求整欄 100% 合規（`complianceRate === 1`）才進候選
- 兩者疊加：note 欄只要任一列空值，即從 `textColumns` 剔除
- 約 291 行：`suggestColumnMapping` 只在 `validTextCols` 內找 `note`，找不到 → 不帶入
- UI 候選清單同源（`getValidColumnsForField`），手動也選不到

### 影響與波及

- 匯出再匯入的 round-trip 保真斷裂：只要庫內任一筆無備註，重匯即全庫丟備註
- A-14 CP-A-14-03 的六筆備註錯值即此因：`note` 欄 8 列含 1 空值被剔除，步 27 改回 `note` 不可能成功（選項不存在），操作者被誤判為操作失誤
- 必填欄不受影響：category、account 等空值列本就該擋

### 修法方向

- 可選文字欄（note）改用寬鬆規則：空值視為合規，或 compliance 門檻對 text 型別放寬
- 或候選清單對 Optional 欄位放行全部欄，僅必填欄用 100% 門檻
- 補 regression test：含空備註列的 CSV，note 欄仍須在 text 候選內且自動帶入
- 與 FINDING-06 同檔 `importService.ts`，修復時注意與 finding06-import-date-validate branch 的合併順序

### 處置

- 2026-07-13 併入 feat/finding11-column-gate-align 修復，原獨立 branch 廢棄
- Optional 欄 note 與 toAmount 空值視為合規，非空值全數合格即入候選；必填欄維持整欄門檻
- regression test `importService.columnCandidates.test.ts` 鎖定候選門檻語意
- simulator 驗過：note 空值欄自動帶入、transfer 同幣別留空 to_amount 可匯

---

## FINDING-08 合併復原對自轉帳雙重 prepareUpdate，轉帳段半還原

- 發現：2026-07-12，場次 A-16 步 35 / CP-A-16-8
- 判定：**FAIL** `R-CM-104`（轉出入方改回來源）、`R-CM-105`（恢復冗餘轉帳）、`R-XD-010`（快照移回並恢復來源與冗餘轉帳）

### 現象

帳戶合併後點復原，跳 alert 復原失敗。帳戶、交易、排程已還原，兩筆轉帳沒還原。13004 轉出仍指目標戶、13003 自轉帳仍軟刪。半還原狀態落庫。

### 佐證

CDP console 擷取：

```
Undo failed: Diagnostic error: Cannot update a record with pending changes (transfers#Em6rxnGFOKyF53kq)
```

`Em6rxnGFOKyF53kq` 即 13003 的 source→target 轉帳。

### 根因

- `src/screens/Merge/MergeEditorScreen.tsx` 約 148 至 171 行：快照把 source→target 自轉帳**同時**收進 `affectedTransferFromIds` 與 `deletedSelfTransferIds`
- `src/services/mergeService.ts` `revertMerge` 約 260 至 301 行：兩清單各自對同一 Transfer 實例 `prepareUpdate`，WatermelonDB invariant 丟例外
- 例外拋出前，account、schedule、transaction 的 `database.batch` 已各自 commit；同一 `database.write` 內的多次 batch 不互相回滾 → 半套用
- `src/contexts/UndoContext.tsx` 約 99 行註解稱「各 revertAction 皆為單一 write，失敗即整筆未套用」，與實況不符

### 影響

- 任何含來源目標互轉紀錄的帳戶合併，undo 必炸
- 使用者資料停在半還原：帳戶回來了、轉帳留在合併後狀態，報表金額歸屬錯亂
- 觸發條件常見：合併兩戶前互轉過錢是日常場景

### 修法方向

- revert 前 dedup：`affectedTransferFromIds` / `affectedTransferToIds` 先濾掉 `deletedSelfTransferIds` 集合
- 或快照擷取端就互斥分流，自轉帳只進 deleted 清單
- 補 regression test：合併含 source↔target 轉帳後 undo，斷言帳戶、交易、兩類轉帳、排程五段全還原
- 一併修 UndoContext 註解，或把 revert 改為單一 batch 真原子

---

## FINDING-09 前景恢復因 Auth token 刷新重跑整套開機流程

- 發現：2026-07-26，場次 A-17 步 29 至 30 / CP-A-17-10
- 判定：**FAIL** `R-BS-015`（前景恢復不應觸發排程補產）

### 現象

app 僅切背景再切回前景（未殺 app），排07 卻在無新殺 app 重開的情況下補產了本應等下次冷啟才生成的實例。CDP console 佐證整套開機流程重跑：

```
QA BOOT delegate task=generateMissingInstances trigger=login
QA BOOT delegate task=runBackup trigger=login
```

### 根因

- `src/contexts/AuthContext.tsx` 約 138 行：`firebaseOnAuthStateChanged` 的 callback 對任何非 null `authUser` 都無條件呼叫 `runPostAuth(authUser)`，未區分「真正新登入」與「同一使用者的監聽器重新觸發」
- React Native Firebase 的 `auth().onAuthStateChanged`（`src/services/firebase.ts` 約 151 行）與 web SDK 行為不同，ID token 刷新（常見於 app 從背景恢復前景時的 SDK 內部有效性檢查）會重新觸發此監聽器，並非僅限真正的登入/登出事件
- `runPostAuth`（約 69 行起）內含 `detectAccountSwitch`、`generateMissingInstances`、`runBackup`、`handlePostAuth`（Premium 刷新）等整組開機工作，全部隨 token 刷新重跑

### 影響

- 使用者日常操作（切到別的 app 再切回）就會觸發，非邊角情境
- `generateMissingInstances` 有 idempotency guard 故不會重複造資料，但每次前景都多打一輪 DB 查詢
- `runBackup` 有自身 cooldown/去重，可能還好；`detectAccountSwitch` 同 uid 下為 no-op
- 風險落在測試意圖本身被破壞：任何依賴「僅殺 app 重開才補產」的邏輯或測試前提，遇到 token 刷新視窗會提前失真，R-BS-015 明確假設的行為邊界不存在

### 修法方向

- `runPostAuth` 加 guard：若 `authUser.uid === 目前已登入的 user.uid` 且非真正的新登入（例如比對前後 uid 相同），僅做輕量的 token 刷新處理，跳過 `generateMissingInstances`、`detectAccountSwitch`、`clearLocalData` 等冷啟專屬工作
- 或改用 `onIdTokenChanged` 與 `onAuthStateChanged` 分流：登入態變化走輕量 token 更新，uid 真正變化（含從 null 變有值）才觸發完整 `runPostAuth`
- 補 regression test：模擬同 uid 的 auth 監聽器重觸發，斷言 `generateMissingInstances`／`runBackup` 不重跑

---

## FINDING-10 軟刪匯率仍參與換算，rate 查詢全線漏濾 deleted_on

- 發現：2026-07-13，場次 A-90 步 11。清空資料庫後 JPY 小計仍用舊匯率換算
- 判定：**FAIL**。無單一規則 id 直接對應；違反軟刪不可見不變量，R-CU-049 的查無回 1 被墓碑架空

### 現象

A-19 清空資料庫把全部匯率軟刪。A-90 新建 JPY 交易 9003 後，`C90餐飲` 小計顯示 17,185 = 9001 + 9003 × 0.909054。0.909054 正是 7/11 已軟刪的 TWD/JPY 匯率墓碑。活匯率表為零列，換算本應回 1、小計應為 18,004。

### 根因

`src/services/currencyService.ts` 與 `src/contexts/CurrencyContext.tsx` 的 currency_rates 查詢全線缺 `deleted_on IS NULL` 過濾：

- `resolveCurrencyRate` 約 161 行：Q.or 雙向對查詢無 notDeleted，取到墓碑列
- `pairRateExists` 約 21 行：同缺，軟刪對被當作已存在、抑制 ensureRate 補種
- `ensureRatesForNewBase` 約 71 行：accounts 查詢同缺 notDeleted
- `CurrencyContext` 約 59 行：顯示端匯率訂閱同缺，墓碑灌進 rates state

### 影響

- 使用者刪除匯率記錄後，換算仍用被刪的舊匯率，畫面與報表金額錯
- 清空資料庫的重置語意破功，舊匯率幽靈續命
- `pairRateExists` 誤判已存在，會抑制新匯率補種路徑

### 修法方向

- 四處查詢補 `notDeleted()`（與 transactions 等表同慣例）
- 補 regression test：軟刪某對匯率後 `resolveCurrencyRate` 回 1、`pairRateExists` 回 false、CurrencyContext rates 不含墓碑

---

## FINDING-11 欄位守門整欄封殺，說明檔承諾的逐列略過不可達

- 發現：2026-07-13，場次 A-90 步 37 至 38 / CP-A-90-4
- 判定：**FAIL** `R-IE-067`（必填欄空值列匯入時略過）、`R-BS-078`（超界金額存檔驗證失敗略過）。兩規則的逐列略過行為經 UI 不可達

### 現象

匯入 CSV 四列，其中一列金額空值、一列金額超界。欄位對應步 `金額` 無自動帶入、下拉候選清單無 `amount` 可選，必填未對應、前進封死。好列兩筆連帶全滅，無從走到逐列略過。

### 根因與矛盾

- `scanColumnCompliance` 要求整欄 100% 合格才進候選（`importService.ts` 約 157 行），任一格壞即整欄除名
- 欄位守門與逐列略過用同一把驗證尺（`isValidAmount` 等），任何會被逐列略過的值必先觸發整欄封殺，列級略過永不可達
- 但 app 自產的說明檔（CP-A-14-01 驗過的 `$wish_transaction_guide.txt`）白紙黑字承諾：`A row is skipped if a required field is empty, or if its date, amount, or currency is not in an accepted format`
- 說明檔、規則（R-IE-067/R-BS-078）與實作三方矛盾；A-14 的 R-IE-026 又把整欄封殺當正確行為驗過，規則集內部也互相打架

### 影響

- 使用者拿到一個 100 列、僅 1 列打錯的檔，整檔不可匯入，與說明檔的預期相反
- 逐列略過的兩條規則是死規則，永遠驗不到

### 修法方向

- 這是設計層拍板題，先回上游決定：必填欄改門檻制或逐列略過（吻合說明檔與 R-IE-067/R-BS-078），或維持整欄封殺並改寫說明檔與規格、廢掉兩條列級規則
- 與 FINDING-07 同在 `importService.ts` 驗證線，修復排程需協調
- 拍板後補 regression test 鎖定選擇的語意

### 處置

- 2026-07-13 拍板維持整欄封殺，文件全面改為欄位守門語意，程式行為不動
- 下傳範圍：說明檔 templateService、spec no21、Product Map DataOperations、規則清單
- R-IE-067 改斷言必填欄含空值或非法格式整欄不入候選；R-IE-068 移除金額半句
- 前提更正：守門與存檔非同一把驗證尺——超界金額通過守門，於存檔驗證逐列略過，R-BS-078 仍可達、保留 active
- 場次 A-90 步 37 至 40 與 CP-A-90-4 改寫為守門語意，fixture 拆檔一守門、檔二超界
- 修復 branch feat/finding11-column-gate-align，regression test 鎖雙尺語意
- simulator 驗過：壞檔擋於欄位對應、說明檔新文字、超界列逐列略過

---

## OBS-01 貨幣格式重設後按勾選會改寫回覆寫值

- 發現：2026-07-11，場次 A-06 步 37 / 步 50，同場踩中兩次
- 分類：UX 觀察，非規則違反（R-ST-083/084 正確操作下皆過）

### 現象

`CurrencyDetailConfigScreen` 點「重設為預設值」即時寫入 `decimal_places=NULL`；但畫面勾選標記跳到預設位數（TWD 0、KWD 3）。此時再按右上勾選，`handleDone` 把畫面選值當覆寫寫回（TWD 寫 0、KWD 寫 3），NULL 被蓋掉。

### 影響

- 顯示無差（NULL 與預設值 render 相同），僅 DB 語意漂移：`無覆寫` 變 `覆寫成預設值`
- 操作者直覺是「重設後按完成確認」，兩位數字段規則（R-DM-037 的 Null 路徑）就沒真正生效
- 改善方向：重設後 handleDone 應維持 NULL（追蹤 local state 是否來自重設），或重設即關閉畫面
