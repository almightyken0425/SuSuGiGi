# 手動 QA 執行 findings

執行過程中確認的 app 缺陷登記。文件缺陷（場次假設錯、基準漏算）不登這裡，直接修 no2 / no3。

| 編號 | 狀態 | 規則 | 摘要 |
| --- | --- | --- | --- |
| FINDING-01 | open | R-TX-105 | 跨幣別轉帳每次儲存都補錄匯率，無變更儲存也補 |
| FINDING-02 | open | R-DM-035 | 匯率生效日存完整時刻，spec 要求該日 UTC 零時 |
| FINDING-03 | open | R-DM-041 | 排程開始日帶建立當下時刻，spec 要求使用者時區零時轉存 UTC |
| FINDING-04 | open | R-TX-048/R-TX-015 | 定期結束日重開編輯器顯示今天，非原設日期；有覆寫風險 |
| FINDING-05 | open | — | createSchedule 不寫 updated_on，活排程永不進增量備份，雲端還原全丟 |
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

## OBS-01 貨幣格式重設後按勾選會改寫回覆寫值

- 發現：2026-07-11，場次 A-06 步 37 / 步 50，同場踩中兩次
- 分類：UX 觀察，非規則違反（R-ST-083/084 正確操作下皆過）

### 現象

`CurrencyDetailConfigScreen` 點「重設為預設值」即時寫入 `decimal_places=NULL`；但畫面勾選標記跳到預設位數（TWD 0、KWD 3）。此時再按右上勾選，`handleDone` 把畫面選值當覆寫寫回（TWD 寫 0、KWD 寫 3），NULL 被蓋掉。

### 影響

- 顯示無差（NULL 與預設值 render 相同），僅 DB 語意漂移：`無覆寫` 變 `覆寫成預設值`
- 操作者直覺是「重設後按完成確認」，兩位數字段規則（R-DM-037 的 Null 路徑）就沒真正生效
- 改善方向：重設後 handleDone 應維持 NULL（追蹤 local state 是否來自重設），或重設即關閉畫面
