# SuSuGiGi 手動測試對賬手冊 V1

## 文件定位

- Claude 專用，操作者不需讀
- 測試腳本每個 🔎 檢查點對應本文件一段
- 每段載明時點、管道、查詢語句、預期值與判定
- 查詢管道分三類：sqlite 本機資料庫、log runtime 記錄、Firestore 雲端

---

## 對賬工具

- qa_tools 內三支工具承載三管道，各檢查點的 code block 為示意、實跑走這三支
- sqlite 定位查詢用 `qa_tools/dbq.sh`
    - `qa_tools/dbq.sh "<SQL>"` 動態定位 watermelon.db 後執行
    - `qa_tools/dbq.sh --path` 只印路徑、`--tables` 列表
- log 擷取用 `qa_tools/cdp_capture.mjs`
    - `node qa_tools/cdp_capture.mjs "<marker 前綴>" <秒數>`
- Firestore 讀寫用 `qa_tools/fs_admin.mjs`
    - `node qa_tools/fs_admin.mjs get <docPath>`、`count <collPath>`、`query <collPath> <n>`、`set <docPath> <json>`
    - 需先放 `qa_tools/serviceAccountKey.json`，已 gitignore
    - `firebase-admin` 依賴由 `qa_tools/package.json` 安裝、node_modules 已 gitignore

---

## sqlite 對賬通則

- 資料庫路徑由 simulator 容器動態決定，`dbq.sh` 已封裝定位
- WatermelonDB 軟刪不刪列，查詢一律加過濾
- 過濾條件：`_status != 'deleted' AND deleted_on IS NULL`
- 金額欄為整數縮放值，判定前先還原
- 表名欄位名以資料對賬參照文件為準

---

## log 對賬通則

- RN 0.79 的 JS console 走 CDP，不進 Metro log
- `cdp_capture.mjs` 接 8081 的 json 端點、撈 consoleAPICalled、只印比對到的 marker
- 有秒數上限與前綴過濾，避免無界錄爆磁碟
- marker 格式與觸發點見 QA log 埋點需求文件
- 全部 marker 包在 __DEV__ 判斷內，正式版不印

---

## Firestore 對賬通則

- 讀寫走 `fs_admin.mjs`，背後為 service account key
- key 存 `qa_tools/serviceAccountKey.json`、不進 git
- set 為 merge 寫入，供注入 entitlement 或毀損偏好值等 T3 佈置
- 路徑慣例見資料對賬參照文件

---

## CP-A-01-01 settings 預設值與空庫基線

- 時點：步 5 完成後，尚未進任何編輯畫面
- 管道：sqlite
- 資料庫路徑取得與查詢

```bash
DB="$(xcrun simctl get_app_container booted com.almightyken0425.susugigiapp data)/Documents/watermelon.db"
sqlite3 "$DB" "SELECT COUNT(*) FROM settings WHERE _status != 'deleted';"
sqlite3 "$DB" "SELECT launch_mode, week_start, analytics_consent FROM settings WHERE _status != 'deleted';"
sqlite3 "$DB" "SELECT 'categories', COUNT(*) FROM categories WHERE _status != 'deleted' AND deleted_on IS NULL
UNION ALL SELECT 'accounts', COUNT(*) FROM accounts WHERE _status != 'deleted' AND deleted_on IS NULL
UNION ALL SELECT 'transactions', COUNT(*) FROM transactions WHERE _status != 'deleted' AND deleted_on IS NULL
UNION ALL SELECT 'transfers', COUNT(*) FROM transfers WHERE _status != 'deleted' AND deleted_on IS NULL
UNION ALL SELECT 'currency_rates', COUNT(*) FROM currency_rates WHERE _status != 'deleted' AND deleted_on IS NULL
UNION ALL SELECT 'schedules', COUNT(*) FROM schedules WHERE _status != 'deleted' AND deleted_on IS NULL;"
```

- 預期與判定
    - settings 列數為 1，符合即 `R-DM-001` 過
    - `launch_mode` 為 `home`，符合即 `R-DM-002` 過
    - `week_start` 為 `auto`，符合即 `R-DM-004` 過
    - `analytics_consent` 為 1，符合即 `R-DM-006` 過
    - 六業務表計數全為 0，屬入場態確認，不掛規則

---

## CP-A-01-02 啟動 entitlement 解析 log

- 時點：步 5 完成後，與 CP-A-01-01 同輪執行
- 管道：log，Claude 以 CDP 接 Metro `8081` 擷取 device console
- grep marker

```text
[IAP] serverTier ←
```

- 預期與判定
    - 冷啟後出現該行，tier 值為 1 以上，status 為 `active`
    - 該行出現後 app 已正常落首頁，未卡載入、未閃現付費牆
    - 兩者皆符即線上更新完成、`isPremiumLoaded` 為 true 外顯成立，`R-DM-050` 過

---

## CP-A-01-03 首筆類別寫入對賬

- 時點：步 23 建立 `類01支-餐飲` 返回列表後
- 管道：sqlite

```bash
DB="$(xcrun simctl get_app_container booted com.almightyken0425.susugigiapp data)/Documents/watermelon.db"
sqlite3 "$DB" "SELECT name, type, icon_id, sort_order FROM categories
WHERE _status != 'deleted' AND deleted_on IS NULL;"
```

- 預期與判定
    - 僅一列，`name` 恰為 `類01支-餐飲`，無前後空白，符合即 `R-DM-021` `R-CM-012` 過
    - `type` 為 `expense` 且與畫面所選一致，僅此一列寫入，符合即 `R-CM-034` 過
    - `icon_id` 為 12，即 category 圖示清單首枚麵包圖示，符合即 `R-CM-035` 過
    - `sort_order` 為 0，空清單首筆自 0 起，符合即 `R-DM-024` 過

---

## CP-A-01-04 編輯結果對賬

- 時點：步 32 存檔返回列表後
- 管道：sqlite

```bash
DB="$(xcrun simctl get_app_container booted com.almightyken0425.susugigiapp data)/Documents/watermelon.db"
sqlite3 "$DB" "SELECT name, type, icon_id, sort_order FROM categories
WHERE _status != 'deleted' AND deleted_on IS NULL AND type = 'expense' AND sort_order = 3;"
sqlite3 "$DB" "SELECT COUNT(*) FROM categories
WHERE _status != 'deleted' AND deleted_on IS NULL AND name = '類03支-娛樂';"
```

- 預期與判定
    - 排序 3 那列 `name` 已為 `類04支-居家`，`icon_id` 不為 12，符合即 `R-CM-036` 過
    - 同列 `type` 仍為 `expense` 未被改動，符合即 `R-CM-037` 過
    - `類03支-娛樂` 計數回到 1，確認改名收斂重複列，屬佈置確認不掛規則

---

## CP-A-01-05 拖拉排序持久化對賬

- 時點：步 41 拖拉鬆手、動畫落定後
- 管道：sqlite

```bash
DB="$(xcrun simctl get_app_container booted com.almightyken0425.susugigiapp data)/Documents/watermelon.db"
sqlite3 "$DB" "SELECT sort_order, name FROM categories
WHERE _status != 'deleted' AND deleted_on IS NULL AND type = 'expense'
ORDER BY sort_order ASC;"
```

- 預期與判定
    - 依序為 0 `類02支-交通`、1 `類01支-餐飲`、2 `類03支-娛樂`、3 `類04支-居家`
    - 排序欄位已批次改寫且與畫面一致，符合即 `R-CM-041` 過

---

## CP-A-01-06 六表收尾總對賬

- 時點：步 43 回到 `設定` 後，場次收尾
- 管道：sqlite

```bash
DB="$(xcrun simctl get_app_container booted com.almightyken0425.susugigiapp data)/Documents/watermelon.db"
sqlite3 "$DB" "SELECT type, COUNT(*) FROM categories
WHERE _status != 'deleted' AND deleted_on IS NULL GROUP BY type;"
sqlite3 "$DB" "SELECT COUNT(*) FROM categories
WHERE _status != 'deleted' AND deleted_on IS NULL AND type NOT IN ('expense','income');"
sqlite3 "$DB" "SELECT 'accounts', COUNT(*) FROM accounts WHERE _status != 'deleted' AND deleted_on IS NULL
UNION ALL SELECT 'transactions', COUNT(*) FROM transactions WHERE _status != 'deleted' AND deleted_on IS NULL
UNION ALL SELECT 'transfers', COUNT(*) FROM transfers WHERE _status != 'deleted' AND deleted_on IS NULL
UNION ALL SELECT 'currency_rates', COUNT(*) FROM currency_rates WHERE _status != 'deleted' AND deleted_on IS NULL
UNION ALL SELECT 'schedules', COUNT(*) FROM schedules WHERE _status != 'deleted' AND deleted_on IS NULL;"
```

- 預期與判定
    - `expense` 4 筆、`income` 2 筆，值域外型別計數為 0，符合即 `R-DM-022` 過
    - 其餘五業務表計數全為 0，符合出場態，供 A 軌後續場次接續

---

## CP-A-02-00 共用前置

- 管道：sqlite，模擬器 app 容器內 `watermelon.db`
- 本場單一使用者，查詢不加 `user_id` 過濾
- db 定位指令

```bash
APP=$(xcrun simctl get_app_container booted com.almightyken0425.susugigiapp data)
DB=$(find "$APP" -name 'watermelon.db' | head -1)
```

- 幣別 id 對照：TWD 901、USD 840、JPY 392、EUR 978
- account 用途圖示 id 集合首段為 1 至 11，第 1 格 id 1、第 2 格 id 2、第 3 格 id 3

---

## CP-A-02-01 帳戶 fixture 與佔位匯率落庫

- 時點：步 28 之後，拖拉重排之前
- 管道：sqlite

```sql
SELECT name, currency_code, icon_id, sort_order, created_at, updated_on
FROM accounts
WHERE _status != 'deleted' AND deleted_on IS NULL
ORDER BY sort_order;
```

```sql
SELECT COUNT(*)
FROM accounts
WHERE name = 'A3美金'
  AND (_status = 'deleted' OR deleted_on IS NOT NULL);
```

```sql
SELECT currency_from_id, currency_to_id, rate, date, created_at
FROM currency_rates
WHERE _status != 'deleted' AND deleted_on IS NULL
ORDER BY currency_from_id;
```

- 預期與判定
    - 帳戶查詢恰 5 列，依序 A1現金 A2銀行 A3美金 A4日圓 A5歐元
    - 幣別依序 TWD TWD USD JPY EUR
    - 各名稱無前後空白，A1現金 與 A3美金 輸入時帶空白已被去除，符合即 R-DM-015 R-CM-052 過
    - A1現金 `sort_order` 為 0，首筆帳戶取預設值，符合即 R-DM-018 過
    - 五列 `sort_order` 依序 0 1 2 3 4
    - A1現金 名稱已由 A1現 更為 A1現金 且 `icon_id` 為 3 非建立時的 2，符合即 R-CM-074 過
    - 每帳戶恰 1 列，`icon_id` 皆屬 account 圖示集合，本場應為 3 與 1，符合即 R-CM-071 過
    - `created_at` `updated_on` 與匯率 `date` 皆 13 位 ms 整數，且落在本場執行時間窗，符合即 R-DM-061 過
    - 墓碑查詢回 1，步 25 復原留軟刪墓碑，屬預期，僅供佐證不掛 ID
    - 匯率查詢恰 3 列：392 對 901、840 對 901、978 對 901，`rate` 皆 1.0，符合即 R-CM-072 R-CU-055 過
    - 無任何 from 901 的列，TWD 帳戶未種佔位匯率，符合即 R-CM-073 過
    - 840 對 901 恰 1 列，步 24 重複 USD 帳戶未重複種入，符合即 R-CU-056 過
- Claude 於本檢查點記下 5 帳戶 `updated_on` 值，供 CP-A-02-02 比對

---

## CP-A-02-02 拖拉重排批次更新且持久

- 時點：步 32 之後
- 管道：sqlite

```sql
SELECT name, sort_order, updated_on
FROM accounts
WHERE _status != 'deleted' AND deleted_on IS NULL
ORDER BY sort_order;
```

- 預期與判定
    - 5 列依序 A1現金 至 A5歐元，`sort_order` 為 0 1 2 3 4
    - 全 5 列 `updated_on` 皆大於 CP-A-02-01 記下的值，兩次拖拉皆批次改寫全部位移列
    - 兩項皆符合，加上步 31 重進列表順序持久的畫面結果，即 R-CM-079 過

---

## CP-A-02-03 主幣 TWD 到 USD 與新種佔位匯率

- 時點：步 36 之後
- 管道：sqlite

```sql
SELECT base_currency_id
FROM settings
WHERE _status != 'deleted';
```

```sql
SELECT currency_from_id, currency_to_id, rate
FROM currency_rates
WHERE _status != 'deleted' AND deleted_on IS NULL
ORDER BY currency_from_id, currency_to_id;
```

- 預期與判定
    - `base_currency_id` 為 840，符合即 R-ST-069 過
    - 匯率共 5 列：原 3 列不動，新增 392 對 840 與 978 對 840，`rate` 皆 1.0
    - 新增 2 列符合即 R-ST-070 過
    - 不出現 901 對 840 列：pair 判存為雙向，840 對 901 已在庫故不種，此為預期非缺漏

---

## CP-A-02-04 主幣回 TWD 無重複種入

- 時點：步 37 之後
- 管道：sqlite

```sql
SELECT base_currency_id
FROM settings
WHERE _status != 'deleted';
```

```sql
SELECT COUNT(*)
FROM currency_rates
WHERE _status != 'deleted' AND deleted_on IS NULL;
```

```sql
SELECT MIN(currency_from_id, currency_to_id) AS low,
       MAX(currency_from_id, currency_to_id) AS high,
       COUNT(*) AS cnt
FROM currency_rates
WHERE _status != 'deleted' AND deleted_on IS NULL
GROUP BY low, high
HAVING cnt > 1;
```

- 預期與判定
    - `base_currency_id` 回 901
    - 匯率總數仍 5，切回主幣未新增任何列
    - 重複幣別對查詢回空，任一幣別對至多 1 列
    - 三項皆符合即 R-ST-071 過

---

## CP-A-03-1 建立寫入對賬

- 時點：步 14 完成後、批量佈置前，庫內僅 2 筆交易
- 管道：sqlite

```bash
APP=$(xcrun simctl get_app_container booted com.almightyken0425.susugigiapp data)
DB=$(find "$APP" -name watermelon.db | head -1)
sqlite3 "$DB" "
SELECT amount, note, amount = CAST(amount AS INTEGER) AS is_exact_int
FROM transactions
WHERE _status != 'deleted' AND deleted_on IS NULL
ORDER BY created_at;"
```

- 預期共 2 列
- 第 1 列 `amount` 為 -1010000，`is_exact_int` 為 1
- 第 2 列 `amount` 為 1050000，`is_exact_int` 為 1
- 註：WatermelonDB 數字欄一律以 float64 storage class 儲存，`typeof` 恆回 real；整數性以值判定，不看 storage class
- 第 1 列 `note` 逐字為 `QAKEY午餐`，無前後空白
- 第 2 列 `note` 逐字為 `QAKEY薪資`
- 判定
    - 101 元存為 1010000 整數，固定倍率一萬縮放 → R-DM-026 R-TX-069 過
    - 支出列為負值 → R-TX-070 過
    - 收入列為正值 → R-TX-071 過
    - 兩筆建立各新增一列 → R-TX-075 過
    - 帶前後空白輸入的備註落庫已去空白 → R-DM-028 R-TX-009 R-BS-075 過

---

## CP-A-03-2 更新寫入對賬

- 時點：步 22 完成後、刪除流程前
- 管道：sqlite

```bash
APP=$(xcrun simctl get_app_container booted com.almightyken0425.susugigiapp data)
DB=$(find "$APP" -name watermelon.db | head -1)
sqlite3 "$DB" "
SELECT COUNT(*)
FROM transactions
WHERE _status != 'deleted' AND deleted_on IS NULL;
SELECT COUNT(*)
FROM transactions
WHERE _status != 'deleted' AND deleted_on IS NULL AND amount = -1010000;
SELECT amount, LENGTH(note), substr(note,1,5), instr(note,'ILXX')
FROM transactions
WHERE _status != 'deleted' AND deleted_on IS NULL AND amount = -19950000;"
```

- 預期第一段查詢回 20，總筆數不因更新增加
- 預期第二段查詢回 0，原 -1010000 值已不存在
- 預期第三段查詢恰 1 列
    - `amount` 為 -19950000，即 1995 元乘一萬取負（TWD 零小數、`.` 鍵不採計）
    - `LENGTH(note)` 為 200
    - 前綴為 `QAKEY`
    - `instr` 回 0，哨兵 `ILXX` 未落庫
- 判定
    - 原列 in-place 改寫、無新增列 → R-TX-079 過
    - 204 字元貼上截為 200 字元 → R-DM-027 過

---

## CP-A-03-3 軟刪除對賬

- 時點：步 24 完成、復原列消失後
- 管道：sqlite

```bash
APP=$(xcrun simctl get_app_container booted com.almightyken0425.susugigiapp data)
DB=$(find "$APP" -name watermelon.db | head -1)
sqlite3 "$DB" "
SELECT amount, note, deleted_on
FROM transactions
WHERE amount = -1110000;
SELECT COUNT(*)
FROM transactions
WHERE _status != 'deleted' AND deleted_on IS NULL;"
```

- 預期第一段查詢仍回 1 列
    - `note` 為 `QAKEY刪除用`
    - `deleted_on` 為非 null 的 ms 整數
- 預期第二段查詢回 19，存活筆數少一
- 判定
    - 列仍實體存在、僅標記 `deleted_on` → R-TX-082 過

---

## CP-A-04-1 佈置對賬與期間餘額

- 時點：步 17 完成後、視覺驗證開始前
- 管道：sqlite

查詢：

```bash
APP=$(xcrun simctl get_app_container booted com.almightyken0425.susugigiapp data)
DB=$(find "$APP" -name watermelon.db | head -1)
sqlite3 "$DB" "
SELECT t.date, t.amount, c.name AS category, a.name AS account, t.note
FROM transactions t
LEFT JOIN categories c ON c.id = t.category_id
LEFT JOIN accounts a ON a.id = t.account_id
WHERE t._status != 'deleted' AND t.deleted_on IS NULL
ORDER BY t.date;"
```

讀值注意：

- `amount` 存分為單位整數；1500 元存為 150000
- 支出為負值、收入為正值
- `date` 為 ms 時間戳；Claude 依裝置時區換算月份分桶

預期值：

- 佈置 18 筆全在庫；金額、類別、帳戶、日期、備註逐筆相符
- 金額全域唯一，可直接以金額比對逐筆
- 各期合計如下表，單位元：

| 期間 | 支出合計 | 收入合計 | 預期中心餘額 |
| --- | --- | --- | --- |
| 上上上月 | 2050 | 0 | -2050 |
| 上上月 | 8400 | 239 | -8161 |
| 上月 | 2100 | 700 | -1400 |
| 當月 | 含基礎交易、不定 | 不定 | 不設固定值 |
| 下月 | 8755 | 245 | -8510 |
| 下下月 | 2780 | 610 | -2170 |
| 下下下月 | 0 | 2150 | 2150 |

判定：

- Claude 以 DB 重算各期收入減支出、與上表一致
- 操作者滑至上月頁、比對環中心顯示 -1400
- 兩者一致即 R-HR-092 過
- Claude 回報最早與最晚紀錄所在月份，供步 57 與步 65 邊界判定
- 佈置期間若混入非佈置紀錄，Claude 重算受影響的弧比、色票、餘額預期值並回報操作者

---

## CP-A-05-1 同幣別轉帳落庫

- 時點：步 23 之後，同幣別轉帳 3001 元剛建立
- 管道：sqlite

```bash
DB=$(find "$(xcrun simctl get_app_container booted com.almightyken0425.susugigiapp data)" -name watermelon.db | head -1)
sqlite3 "$DB" "
SELECT id, amount_from, amount_to, implied_rate, schedule_id,
       '[' || note || ']' AS note_probe
FROM transfers
WHERE _status != 'deleted' AND deleted_on IS NULL;
SELECT COUNT(*) AS rate_rows
FROM currency_rates
WHERE _status != 'deleted' AND deleted_on IS NULL;
"
```

- transfers 恰一筆，即 R-TX-089 過
- `amount_from` 與 `amount_to` 皆為 30010000，縮放萬倍整數，即 R-DM-031 過
- `implied_rate` 為 NULL，即 R-TX-090 過
- `schedule_id` 為 NULL，即 R-TX-091 過
- `note_probe` 為 `[轉帳QA備註]`，前後空白已去除，即 R-TX-043 與 R-DM-033 過
- `rate_rows` 與場前基準持平（A-02 佔位 5 筆），同幣別不補錄匯率，供後續 CP 基準

---

## CP-A-05-2 跨幣別建立與正反匯率補錄

- 時點：步 31 之後，跨幣別轉帳 3200 元對 3840 元剛建立
- 管道：sqlite
- 幣別 id 對照：TWD 為 901，JPY 為 392

```bash
DB=$(find "$(xcrun simctl get_app_container booted com.almightyken0425.susugigiapp data)" -name watermelon.db | head -1)
sqlite3 "$DB" "
SELECT amount_from, amount_to, implied_rate, date, LENGTH(note) AS note_len
FROM transfers
WHERE amount_from = 32000000 AND _status != 'deleted' AND deleted_on IS NULL;
SELECT currency_from_id, currency_to_id, rate, date, created_at
FROM currency_rates
WHERE _status != 'deleted' AND deleted_on IS NULL
ORDER BY created_at;
"
```

- `implied_rate` 為 1.2，等於 38400000 除以 32000000，即 R-TX-087 過
- `note_len` 為 200，貼上 205 字僅收 200，即 R-DM-032 過
- currency_rates 較基準多恰 2 筆（佔位 5 筆外新增正反向各一），即 R-TX-092 與 R-XD-020 過
- 正向筆 `currency_from_id` 901、`currency_to_id` 392、rate 1.2，即 R-TX-093 過
- 反向筆 392 對 901、rate 約 0.833333，為 1.2 倒數，即 R-TX-094 過
- 兩筆 `date` 皆等於該 transfer 的 `date` 毫秒值，即 R-TX-095 過

---

## CP-A-05-3 更新連動補錄與不補錄

- 時點：步 49 之後，該筆已歷經改金額、無變更儲存、失敗中止、換帳戶對調、改日期
- 管道：sqlite

```bash
DB=$(find "$(xcrun simctl get_app_container booted com.almightyken0425.susugigiapp data)" -name watermelon.db | head -1)
sqlite3 "$DB" "
SELECT amount_from, amount_to, implied_rate, date
FROM transfers
WHERE amount_from = 32000000 AND _status != 'deleted' AND deleted_on IS NULL;
SELECT currency_from_id, currency_to_id, rate, date, created_at
FROM currency_rates
WHERE _status != 'deleted' AND deleted_on IS NULL
ORDER BY created_at;
"
```

- transfer 終態 `implied_rate` 為 1.0（步 47 對調經同幣別過場、金額重設 3200 對 3200），步 42 後曾為 1.1；更新即重算成立，即 R-TX-100 過
- currency_rates 共 13 筆（A-02 佔位 5 筆 + 本場四波各 2 筆），本場四波依 `created_at` 排序：建立、改金額、對調帳戶、改日期
- 波二為改金額補錄，901 對 392 rate 1.1 加反向 392 對 901 約 0.909091，`date` 為當時轉帳日，即 R-TX-104 過
- 步 43 無變更儲存與步 45 失敗中止皆無對應波，總數恰 13，即 R-TX-105 過
- 波三為對調帳戶補錄，正向改為 392 對 901；金額經同幣別過場重設，rate 為 1.0，即 R-TX-106 過（註：FINDING-01 修復前 dateChanged 恆真遮蔽歸因，修復後重驗）
- 波四兩筆 rate 1.0、`date` 等於更新後轉帳日，落在上月 5 日，即 R-TX-107 過

---

## CP-A-05-4 改同幣別後隱含匯率清空

- 時點：步 55 之後，3300 元該筆剛改為 `A1現金` 對 `A2銀行` 同幣別
- 管道：sqlite

```bash
DB=$(find "$(xcrun simctl get_app_container booted com.almightyken0425.susugigiapp data)" -name watermelon.db | head -1)
sqlite3 "$DB" "
SELECT amount_from, amount_to, implied_rate
FROM transfers
WHERE amount_from = 33000000 AND _status != 'deleted' AND deleted_on IS NULL;
SELECT COUNT(*) AS rate_rows
FROM currency_rates
WHERE _status != 'deleted' AND deleted_on IS NULL;
"
```

- `implied_rate` 為 NULL 且 `amount_to` 為 33000000，即 R-TX-101 過
- `rate_rows` 為 15（含佔位 5），建立該筆時加兩筆、改同幣別不新增，供 CP-A-05-5 基準

---

## CP-A-05-5 軟刪與匯率殘留

- 時點：步 59 之後，3300 元該筆已改回跨幣別並刪除
- 管道：sqlite

```bash
DB=$(find "$(xcrun simctl get_app_container booted com.almightyken0425.susugigiapp data)" -name watermelon.db | head -1)
sqlite3 "$DB" "
SELECT amount_from, deleted_on, _status
FROM transfers
WHERE amount_from = 33000000;
SELECT COUNT(*) AS rate_rows
FROM currency_rates
WHERE _status != 'deleted' AND deleted_on IS NULL;
"
```

- 該 row 仍存在且 `deleted_on` 非 NULL，非物理刪除，即 R-TX-108 過
- `rate_rows` 為 17（含佔位 5），步 56 改回跨幣別加兩筆、刪除未減任何筆，即 R-TX-109 過
- 17 筆殘留（本場新增 12）同時支撐步 61 的 R-XD-022 畫面判定，換算沿用最新 392 對 901 約 0.909091

---

## CP-A-06-01 KWD 交易儲存縮放

- 時點：步 16 後，KWD 與 TWD 交易建立完成
- 管道：sqlite

```sql
SELECT t.amount
FROM transactions t
JOIN accounts a ON a.id = t.account_id
WHERE a.name = 'A6科威特'
  AND t._status != 'deleted' AND t.deleted_on IS NULL;
```

- 預期：恰一列，amount 為 -40012340
- 判定：4001.234 乘一萬、支出為負；KWD minorUnits 3 不影響縮放；符合即 R-CU-070 過

---

## CP-A-06-02 KWD 首次重設新增紀錄

- 時點：步 30 後，KWD 首次點重設、尚未按完成
- 管道：sqlite

```sql
SELECT currency_id, decimal_places, use_thousands_unit
FROM currency_configs
WHERE currency_id = 414 AND _status != 'deleted';
```

- 預期：恰一列，decimal_places 為 NULL，use_thousands_unit 為 0
- 判定：無紀錄時重設新增位數 Null、千分位 false 紀錄；符合即 R-ST-084 過

---

## CP-A-06-03 KWD 覆寫更新既有紀錄

- 時點：步 32 後，KWD 小數位 2 已按勾選完成
- 管道：sqlite

```sql
SELECT COUNT(*) AS cnt FROM currency_configs
WHERE currency_id = 414 AND _status != 'deleted';

SELECT decimal_places, use_thousands_unit, created_at, updated_on
FROM currency_configs
WHERE currency_id = 414 AND _status != 'deleted';
```

- 預期：cnt 為 1，decimal_places 為 2，use_thousands_unit 為 0
- 預期：updated_on 大於 created_at
- 判定：有紀錄時更新非新增；符合即 R-ST-081 過

---

## CP-A-06-04 TWD 無紀錄時新增

- 時點：步 35 後，TWD 小數位 1 已按勾選完成
- 管道：sqlite

```sql
SELECT currency_id, decimal_places, use_thousands_unit
FROM currency_configs
WHERE currency_id = 901 AND _status != 'deleted';
```

- 預期：恰一列，decimal_places 為 1，use_thousands_unit 為 0
- 判定：TWD 原無紀錄，setCurrencyFormat 新增 CurrencyConfig；符合即 R-ST-082 過

---

## CP-A-06-05 TWD 重設回 Null

- 時點：步 37 後，TWD 已點重設並以關閉鈕離開
- 管道：sqlite

```sql
SELECT decimal_places, use_thousands_unit
FROM currency_configs
WHERE currency_id = 901 AND _status != 'deleted';
```

- 預期：decimal_places 為 NULL
- 判定：resetCurrencyFormat 將位數設 Null 回歸預設；UI 半部於步 37 已見勾選回 0；符合即 R-ST-083 過

---

## CP-A-06-06 K-mode 儲存乘一千

- 時點：步 47 後，K-mode 3 元輸入交易已建立
- 管道：sqlite

```sql
SELECT t.amount
FROM transactions t
JOIN accounts a ON a.id = t.account_id
WHERE a.name = 'A1現金' AND ABS(t.amount) = 30000000
  AND t._status != 'deleted' AND t.deleted_on IS NULL;
```

- 預期：恰一列，amount 為 -30000000
- 判定：輸入 3 先乘一千成 3000 元，再乘一萬縮放儲存；符合即 R-TX-068 過

---

## CP-A-06-07 格式還原對賬

- 時點：步 50 後，場尾還原完成
- 管道：sqlite

```sql
SELECT currency_id, decimal_places, use_thousands_unit
FROM currency_configs
WHERE currency_id IN (414, 901) AND _status != 'deleted';
```

- 預期：兩列 decimal_places 皆 NULL，use_thousands_unit 皆 0
- 判定：無對應規則，純還原確認；不符則回步 48 至 50 重做還原

---

## CP-A-07-01 JPY 配對匯率落庫

- 時點：步 24 後，手動還原 `2` 已完成、尚未執行佈置 R1
- 管道：sqlite，模擬器 app 容器內 `watermelon.db`

```bash
DB=$(find "$(xcrun simctl get_app_container booted com.almightyken0425.susugigiapp data)" -name watermelon.db | head -1)
```

```sql
SELECT currency_from_id, currency_to_id, rate, date, updated_on, created_at
FROM currency_rates
WHERE _status != 'deleted' AND deleted_on IS NULL
  AND ((currency_from_id = 392 AND currency_to_id = 901)
   OR  (currency_from_id = 901 AND currency_to_id = 392))
ORDER BY date DESC, updated_on DESC;
```

- 392 為 JPY、901 為 TWD 的貨幣 id
- 預期：依 `date` 再 `updated_on` 倒序，第一列為 392 至 901、rate 0.5，即步 24 手動筆
- 預期：本場新增 8 筆到齊——轉帳甲正反 4 與 0.25、轉帳乙正反 5 與 0.2、甲編輯追加正反 2 與 0.5、手動 2 筆約 1e-12 與 0.5
- 預期：前場既有列原樣仍在，無任何列被就地改寫
- 預期：rate 欄皆主單位對主單位數值，無乘一萬縮放；轉帳正反兩筆互為倒數
- 預期：兩筆手動列 `date` 為該日 UTC 零時，即 date 可被 86400000 整除
- 判定：手動寫入為 Append-Only 新增且 8 筆到齊，符合即 R-CU-061 過
- 判定：主單位儲存符合即 R-DM-036 過
- 判定：手動列 date 為 UTC 零時即 R-DM-035 過；若存完整時刻則不過，登載缺陷後續行

---

## CP-A-07-02 KWD 注入落地確認

- 時點：步 25 後，app 已重啟、尚未進匯率列表
- 管道：sqlite

```sql
SELECT currency_from_id, currency_to_id, rate, date
FROM currency_rates
WHERE _status != 'deleted' AND deleted_on IS NULL
  AND ((currency_from_id = 414 AND currency_to_id = 901)
   OR  (currency_from_id = 901 AND currency_to_id = 414))
ORDER BY date DESC, updated_on DESC
LIMIT 1;
```

- 414 為 KWD 的貨幣 id
- 預期：恰一列，方向 901 至 414、rate 0.008，即注入列為該幣別對最新
- 判定：無對應規則，純佈置確認；不符則回步 25 重跑佈置 R1
- 判定：本檢查點成立後，步 26 的列表倒數顯示才可作為 R-CU-050 判準

---

## CP-A-07-03 場尾資料保留對賬

- 時點：步 38 後，重複帳戶已刪除
- 管道：sqlite

```sql
SELECT name, deleted_on IS NOT NULL AS is_deleted, created_at
FROM accounts
WHERE name = 'A4日圓' AND _status != 'deleted'
ORDER BY created_at;

SELECT COUNT(*) AS jpy_pair_cnt
FROM currency_rates
WHERE _status != 'deleted' AND deleted_on IS NULL
  AND ((currency_from_id = 392 AND currency_to_id = 901)
   OR  (currency_from_id = 901 AND currency_to_id = 392));
```

- 預期：accounts 兩列，`created_at` 較早列 is_deleted 0、較晚列 is_deleted 1
- 預期：`jpy_pair_cnt` 較 CP-A-07-01 所見多 1，即步 30 手動 0.25 一筆；匯率記錄無誤刪
- 判定：無對應規則，純收尾確認；不符則檢查步 36 至 38 執行狀況

---

## CP-A-08-00 共用前置

- 管道：sqlite，模擬器 app 容器內 `watermelon.db`
- 本場單一使用者，查詢不加 `user_id` 過濾
- db 定位指令

```bash
APP=$(xcrun simctl get_app_container booted com.almightyken0425.susugigiapp data)
DB=$(find "$APP" -name 'watermelon.db' | head -1)
```

- 金額縮放：元值乘 100 落庫；6001 元即 600100、6102 元即 610200、6203 元即 620300、6304 元即 630400、6405 元即 640500
- 時間欄位皆 UTC Unix ms；相對日期由 Claude 依對賬當下與裝置時區換算成毫秒區間再比對
- 軟刪過濾固定 `_status != 'deleted' AND deleted_on IS NULL`
- 排程補產由建立當下觸發，對賬前不需冷啟 app

---

## CP-A-08-01 排01 排程與過去起始補產

- 時點：步 47 之後、步 48 之前
- 管道：sqlite

```sql
SELECT id, frequency, interval, start_on, end_on, is_transfer,
       template_amount, template_note, template_account_id, template_category_id
FROM schedules
WHERE _status != 'deleted' AND deleted_on IS NULL;
```

```sql
SELECT COUNT(*) AS n,
       MIN(schedule_instance_date) AS first_on,
       MAX(schedule_instance_date) AS last_on,
       SUM(CASE WHEN schedule_id IS NULL
                  OR schedule_instance_date IS NULL THEN 1 ELSE 0 END) AS broken
FROM transactions
WHERE amount = 600100
  AND _status != 'deleted' AND deleted_on IS NULL;
```

- 預期值與判定
    - 排程查詢恰 1 列；`frequency` 為 DAILY、`interval` 1、`is_transfer` 0、`template_amount` 600100；排程記錄新增成立即 R-RC-023 過
    - `template_note` 逐字為 `排01日常`，無前後空白，R-DM-043 過
    - `end_on` 為 NULL，點永不後儲存無結束日，R-RC-019 過
    - `start_on` 換算裝置時區落上月 25 日且時刻為零時，R-DM-041 過；落當日但帶時刻則 R-DM-041 登偏差，續場不擋
    - 實例 n 等於上月 25 日至今日含兩端的天數；`first_on` 換算裝置時區落上月 25 日；`last_on` 不晚於對賬當下；broken 為 0
    - 首筆實例 `schedule_id` 指向排01 排程 id、`schedule_instance_date` 等於 `start_on` 對應時刻，R-RC-025 過

---

## CP-A-08-02 排03 轉帳排程與月底錨定

- 時點：步 56 之後、步 57 之前
- 管道：sqlite

```sql
SELECT id, frequency, interval, start_on, end_on,
       template_amount_from, template_amount_to,
       template_account_from_id, template_account_to_id
FROM schedules
WHERE is_transfer = 1
  AND _status != 'deleted' AND deleted_on IS NULL;
```

```sql
SELECT date, schedule_instance_date, amount_from, amount_to, schedule_id
FROM transfers
WHERE _status != 'deleted' AND deleted_on IS NULL
ORDER BY schedule_instance_date;
```

- 預期值與判定
    - 轉帳排程恰 1 列；`frequency` 為 MONTHLY、`interval` 1；`template_amount_from` 與 `template_amount_to` 皆 620300
    - 首列轉帳 `schedule_id` 非空且指向該排程、`schedule_instance_date` 換算裝置時區落起始月 31 日，R-RC-024 過
    - 實例逐月一筆；月天數不足 31 的月，實例日落該月最末日；後續含 31 日的月回到 31 日；月底錨定樣本屬佈置驗證，無單獨規則 id
    - 全列 `schedule_instance_date` 不晚於對賬當下；`amount_from` 與 `amount_to` 全為 620300

---

## CP-A-08-03 排04 結束日與四排程總對賬

- 時點：步 61 之後、步 62 之前
- 管道：sqlite

```sql
SELECT id, frequency, start_on, end_on
FROM schedules
WHERE is_transfer = 0 AND template_amount = 630400
  AND _status != 'deleted' AND deleted_on IS NULL;
```

```sql
SELECT COUNT(*) AS n, MAX(schedule_instance_date) AS last_on
FROM transactions
WHERE amount = 630400
  AND _status != 'deleted' AND deleted_on IS NULL;
```

```sql
SELECT
  (SELECT COUNT(*) FROM transactions
    WHERE schedule_id IS NOT NULL AND schedule_instance_date IS NULL
      AND _status != 'deleted' AND deleted_on IS NULL) AS tx_broken,
  (SELECT COUNT(*) FROM transfers
    WHERE schedule_id IS NOT NULL AND schedule_instance_date IS NULL
      AND _status != 'deleted' AND deleted_on IS NULL) AS tr_broken,
  (SELECT COUNT(*) FROM transactions
    WHERE schedule_id IS NOT NULL
      AND _status != 'deleted' AND deleted_on IS NULL) AS tx_n,
  (SELECT COUNT(*) FROM transfers
    WHERE schedule_id IS NOT NULL
      AND _status != 'deleted' AND deleted_on IS NULL) AS tr_n;
```

```sql
SELECT s.id, s.frequency, s.interval,
  (SELECT COUNT(*) FROM transactions t
     WHERE t.schedule_id = s.id
       AND t._status != 'deleted' AND t.deleted_on IS NULL)
  + (SELECT COUNT(*) FROM transfers r
     WHERE r.schedule_id = s.id
       AND r._status != 'deleted' AND r.deleted_on IS NULL) AS n,
  (SELECT MAX(t.schedule_instance_date) FROM transactions t
     WHERE t.schedule_id = s.id) AS tx_max,
  (SELECT MAX(r.schedule_instance_date) FROM transfers r
     WHERE r.schedule_id = s.id) AS tr_max
FROM schedules s
WHERE s._status != 'deleted' AND s.deleted_on IS NULL;
```

- 預期值與判定
    - 排04 排程恰 1 列 MONTHLY；`end_on` 換算裝置時區落當月 10 日；由今天改選為當月 10 日的同步更新成立，R-RC-021 過
    - 排04 實例數為上月 5 日、當月 5 日兩時點中，不晚於今日且不晚於當月 10 日者的個數；下月 5 日不得存在
    - tx_broken 與 tr_broken 皆 0；tx_n 與 tr_n 皆大於 0；排程產生的交易與轉帳皆成對寫入 `schedule_id` 與實例日，R-DM-030 過
    - 逐排程實例數符合各頻率公式：排01 為天數差加 1、排02 為週數差加 1、排03 為錨定月數、排04 見上；且四排程 tx_max 或 tr_max 皆不晚於對賬當下毫秒，未到期不提前產、到期無缺漏，R-TZ-005 過

---

## CP-A-08-04 單筆轉排程對賬

- 時點：步 63 之後、步 64 之前
- 管道：sqlite

```sql
SELECT id, frequency, interval, end_on, template_amount, template_note
FROM schedules
WHERE template_amount = 640500
  AND _status != 'deleted' AND deleted_on IS NULL;
```

```sql
SELECT COUNT(*) AS inst_n
FROM transactions
WHERE amount = 640500 AND schedule_id IS NOT NULL
  AND _status != 'deleted' AND deleted_on IS NULL;
```

```sql
SELECT COUNT(*) AS orig_tombstone
FROM transactions
WHERE amount = 640500 AND schedule_id IS NULL
  AND (deleted_on IS NOT NULL OR _status = 'deleted');
```

- 預期值與判定
    - 新排程恰 1 列；MONTHLY、`interval` 1、`end_on` NULL、`template_note` 為 `QA08轉換`
    - inst_n 為 1，首筆實例帶 `schedule_id` 存在
    - orig_tombstone 為 1，原單筆紀錄已軟刪
    - 三者同時成立即 R-RC-026 過

---

## CP-A-09-01 撤銷單筆轉排程

- 時點：步 8 後，轉排程已於復原列點 `復原`
- 管道：sqlite，路徑取法如下，後續各 CP 沿用 `$DB`

```bash
DB="$(xcrun simctl get_app_container booted com.almightyken0425.susugigiapp data)/Documents/watermelon.db"
```

```sql
SELECT deleted_on IS NULL AS alive, schedule_id
FROM transactions
WHERE note = '排05-交易轉排程' AND schedule_id IS NULL
  AND _status != 'deleted';

SELECT s.deleted_on IS NOT NULL AS schedule_dead,
       (SELECT COUNT(*) FROM transactions t
        WHERE t.schedule_id = s.id
          AND t._status != 'deleted' AND t.deleted_on IS NULL) AS live_instances
FROM schedules s
WHERE s.template_note = '排05-交易轉排程' AND s._status != 'deleted';
```

- 預期：原單筆恰一列，alive 為 1，`schedule_id` 為 NULL
- 預期：排程恰一列，schedule_dead 為 1，live_instances 為 0
- 判定：原紀錄清除軟刪標記復活，符合即 R-RC-043 過
- 判定：新排程本體與名下實例全軟刪，符合即 R-RC-044 過

---

## CP-A-09-02 排05 成立與月末錨定補產生

- 時點：步 9 後，第二次轉排程完成且未撤銷
- 管道：sqlite

```sql
SELECT id, frequency, interval, end_on,
       date(start_on/1000, 'unixepoch', 'localtime') AS start_d
FROM schedules
WHERE template_note = '排05-交易轉排程'
  AND _status != 'deleted' AND deleted_on IS NULL;

SELECT COUNT(*) AS orig_live
FROM transactions
WHERE note = '排05-交易轉排程' AND schedule_id IS NULL
  AND _status != 'deleted' AND deleted_on IS NULL;

SELECT date(t.schedule_instance_date/1000, 'unixepoch', 'localtime') AS d,
       t.amount, t.schedule_id IS NOT NULL AS has_sid,
       t.schedule_instance_date IS NOT NULL AS has_inst
FROM transactions t
JOIN schedules s ON s.id = t.schedule_id
WHERE s.template_note = '排05-交易轉排程' AND s.deleted_on IS NULL
  AND t._status != 'deleted' AND t.deleted_on IS NULL
ORDER BY t.schedule_instance_date;
```

- 預期：活排程恰一列，MONTHLY、interval 1、`end_on` NULL、start 去年 12 月 31 日
- 預期：orig_live 為 0，原單筆已軟刪
- 預期：實例自去年 12 月 31 日起每月恰一筆，最晚不超過當下，amount 皆 -70010000
- 預期：31 天月落 31 日，30 天月落 30 日，2 月落月底，每筆 has_sid 與 has_inst 皆 1
- 判定：轉排程建排程刪原筆，符合即 R-TX-025 過
- 判定：日號錨定 `start_on` 的 31 號，符合即 R-RC-060 過
- 判定：短月夾到該月最後一天，符合即 R-RC-061 過
- 判定：夾短後下一個 31 天月回到 31 日，符合即 R-RC-062 過
- 判定：無晚於當下的實例，符合即 R-RC-064 過
- 判定：每筆帶 `schedule_id` 與 `schedule_instance_date`，符合即 R-RC-068 過

---

## CP-A-09-03 啟動補產生與重複防護

- 時點：步 11 後，硬刪注入加冷啟完成
- 管道：sqlite

```sql
SELECT date(t.schedule_instance_date/1000, 'unixepoch', 'localtime') AS d,
       COUNT(*) AS cnt
FROM transactions t
JOIN schedules s ON s.id = t.schedule_id
WHERE s.template_note = '排05-交易轉排程' AND s.deleted_on IS NULL
  AND t._status != 'deleted' AND t.deleted_on IS NULL
GROUP BY d ORDER BY d;

SELECT COUNT(*) AS tomb_live
FROM transactions t
JOIN schedules s ON s.id = t.schedule_id
WHERE s.template_note = '排05-交易轉排程' AND s.deleted_on IS NOT NULL
  AND t._status != 'deleted' AND t.deleted_on IS NULL;
```

- 預期：實例序列回到 CP-A-09-02 的完整月列，被硬刪的最新一期重新出現
- 預期：每期 cnt 皆 1，無任何一期重複
- 預期：tomb_live 為 0，步 8 撤銷的墓碑排程沒長新實例
- 判定：啟動補齊到期未產生實例，符合即 R-RC-052 過
- 判定：僅補回最後實例往後一期那筆，其餘未動，符合即 R-RC-057 過
- 判定：同排程同實例時刻不重複產生，符合即 R-BS-010 與 R-RC-066 過
- 判定：已軟刪排程不補產生，符合即 R-RC-056 過

---

## CP-A-09-04 僅此一筆更新

- 時點：步 15 後，上月實例改 7003 元選 `僅此一筆`
- 管道：sqlite

```sql
SELECT date(t.schedule_instance_date/1000, 'unixepoch', 'localtime') AS d,
       t.amount, t.schedule_id IS NOT NULL AS has_sid
FROM transactions t
JOIN schedules s ON s.id = t.schedule_id
WHERE s.template_note = '排05-交易轉排程' AND s.deleted_on IS NULL
  AND ABS(t.amount) = 70030000
  AND t._status != 'deleted' AND t.deleted_on IS NULL;

SELECT end_on, ABS(template_amount) AS tmpl_amt
FROM schedules
WHERE template_note = '排05-交易轉排程'
  AND _status != 'deleted' AND deleted_on IS NULL;
```

- 預期：7003 元恰一筆，日期為上月最後一日，has_sid 為 1
- 預期：排程 `end_on` 仍 NULL，tmpl_amt 仍 70010000
- 判定：只更新該筆、Schedules 表不受影響，符合即 R-RC-030 過
- 判定：更新未帶排程欄位時 `schedule_id` 保留原值，符合即 R-TX-080 過

---

## CP-A-09-05 僅此一筆刪除

- 時點：步 17 後，上上月實例已刪且未點復原
- 管道：sqlite

```sql
SELECT date(t.schedule_instance_date/1000, 'unixepoch', 'localtime') AS d,
       t.deleted_on IS NOT NULL AS dead
FROM transactions t
JOIN schedules s ON s.id = t.schedule_id
WHERE s.template_note = '排05-交易轉排程' AND s.deleted_on IS NULL
  AND t._status != 'deleted'
ORDER BY t.schedule_instance_date;

SELECT end_on FROM schedules
WHERE template_note = '排05-交易轉排程'
  AND _status != 'deleted' AND deleted_on IS NULL;
```

- 預期：上上月最後一日那筆 dead 為 1，其餘各期 dead 皆 0
- 預期：排程 `end_on` 仍 NULL
- 判定：僅該實例軟刪、排程不變，符合即 R-RC-034 過

---

## CP-A-09-06 軟刪實例不重生

- 時點：步 18 後，冷啟完成
- 管道：sqlite

```sql
SELECT COUNT(*) AS all_rows,
       SUM(t.deleted_on IS NULL) AS live_rows
FROM transactions t
JOIN schedules s ON s.id = t.schedule_id
WHERE s.template_note = '排05-交易轉排程' AND s.deleted_on IS NULL
  AND t._status != 'deleted'
  AND date(t.schedule_instance_date/1000, 'unixepoch', 'localtime')
      = date('now', 'localtime', 'start of month', '-1 month', '-1 day');
```

- 預期：all_rows 為 1，live_rows 為 0
- 判定：上上月月底那期僅剩軟刪那筆、未再長活筆，符合即 R-RC-067 過

---

## CP-A-09-07 撤銷排程更新

- 時點：步 19 後，`此筆及未來` 更新已於 4 秒內撤銷
- 管道：sqlite

```sql
SELECT end_on FROM schedules
WHERE template_note = '排05-交易轉排程'
  AND _status != 'deleted' AND deleted_on IS NULL;

SELECT date(t.schedule_instance_date/1000, 'unixepoch', 'localtime') AS d,
       t.deleted_on IS NULL AS alive, ABS(t.amount) AS amt
FROM transactions t
JOIN schedules s ON s.id = t.schedule_id
WHERE s.template_note = '排05-交易轉排程' AND s.deleted_on IS NULL
  AND t._status != 'deleted'
ORDER BY t.schedule_instance_date;

SELECT s.deleted_on IS NOT NULL AS dead,
       (SELECT COUNT(*) FROM transactions t
        WHERE t.schedule_id = s.id
          AND t._status != 'deleted' AND t.deleted_on IS NULL) AS live_inst
FROM schedules s
WHERE ABS(s.template_amount) = 70040000 AND s._status != 'deleted';
```

- 預期：原排程 `end_on` 回 NULL
- 預期：4 個月前月底起各期 alive 回 1，上月月底那筆 amt 保持 70030000
- 預期：上上月月底那筆 alive 仍 0
- 預期：7004 元模板的新排程與其實例本地無任何存活列（live_inst 為 0）；雲端亦無 7004 orphan
    - 註：撤銷發生在同步推送前，新排程建了又撤、未上雲，可能整組不留痕而非留墓碑；本地與雲端皆無 7004 存活列即滿足「新排程撤掉」語意
- 判定：`end_on` 寫回截斷前的值，符合即 R-RC-047 過
- 判定：快照集合內實例軟刪標記清除，符合即 R-RC-048 過
- 判定：新排程與名下實例不再存活、無雲端 orphan，符合即 R-RC-049 過
- 判定：先前自行刪除的上上月實例不復活，符合即 R-RC-051 過

---

## CP-A-09-08 此筆及未來截斷落地

- 時點：步 20 後，7005 元 `此筆及未來` 已套用且未撤銷
- 管道：sqlite

```sql
SELECT date(end_on/1000, 'unixepoch', 'localtime') AS end_d
FROM schedules
WHERE template_note = '排05-交易轉排程'
  AND _status != 'deleted' AND deleted_on IS NULL;

SELECT date(t.schedule_instance_date/1000, 'unixepoch', 'localtime') AS d,
       t.deleted_on IS NULL AS alive
FROM transactions t
JOIN schedules s ON s.id = t.schedule_id
WHERE s.template_note = '排05-交易轉排程' AND s.deleted_on IS NULL
  AND t._status != 'deleted'
ORDER BY t.schedule_instance_date;

SELECT date(s.start_on/1000, 'unixepoch', 'localtime') AS start_d,
       s.end_on, s.deleted_on IS NULL AS alive,
       (SELECT COUNT(*) FROM transactions t
        WHERE t.schedule_id = s.id
          AND t._status != 'deleted' AND t.deleted_on IS NULL) AS live_inst,
       (SELECT MAX(ABS(t.amount)) FROM transactions t
        WHERE t.schedule_id = s.id
          AND t._status != 'deleted' AND t.deleted_on IS NULL) AS amt
FROM schedules s
WHERE ABS(s.template_amount) = 70050000
  AND s._status != 'deleted' AND s.deleted_on IS NULL;
```

- 預期：原排程 end_d 為 5 個月前月底，即此筆日期回推一個月夾月底
- 預期：原排程 4 個月前月底起各期 alive 全 0，之前各期 alive 為 1
- 預期：後繼排程恰一列，start_d 為 4 個月前月底，`end_on` NULL
- 預期：後繼排程 live_inst 為 4 個月前至上月每月一筆，amt 為 70050000
- 判定：原排程 `end_on` 截為此筆前一週期，符合即 R-RC-031 過
- 判定：此筆日期起原排程實例全軟刪，符合即 R-RC-032 過
- 判定：新排程 `start_on` 為此筆日期並補實例至當前，符合即 R-RC-033 過

---

## CP-A-09-09 排06 轉出與 endOn 截停

- 時點：步 25 後，轉帳轉排程完成且未撤銷
- 管道：sqlite

```sql
SELECT frequency, interval, is_transfer,
       date(start_on/1000, 'unixepoch', 'localtime') AS start_d,
       date(end_on/1000, 'unixepoch', 'localtime') AS end_d
FROM schedules
WHERE template_note = '排06-轉帳轉排程'
  AND _status != 'deleted' AND deleted_on IS NULL;

SELECT COUNT(*) AS orig_live
FROM transfers
WHERE note = '排06-轉帳轉排程' AND schedule_id IS NULL
  AND _status != 'deleted' AND deleted_on IS NULL;

SELECT date(t.schedule_instance_date/1000, 'unixepoch', 'localtime') AS d,
       t.amount_from, t.amount_to,
       (t.schedule_instance_date
        - LAG(t.schedule_instance_date) OVER (ORDER BY t.schedule_instance_date))
        / 86400000.0 AS gap_days
FROM transfers t
JOIN schedules s ON s.id = t.schedule_id
WHERE s.template_note = '排06-轉帳轉排程' AND s.deleted_on IS NULL
  AND t._status != 'deleted' AND t.deleted_on IS NULL
ORDER BY t.schedule_instance_date;
```

- 預期：排程恰一列，WEEKLY、interval 2、is_transfer 1、start 上月 1 日、end 當月 1 日
- 預期：orig_live 為 0，原單筆轉帳已軟刪
- 預期：實例落在 transfers 表，首筆上月 1 日，gap_days 皆 14
- 預期：最後一筆不晚於當月 1 日，再推 14 天會超過 `end_on`
- 預期：amount_from 與 amount_to 皆 70020000
- 判定：實例逐期推進 2 個週單位，符合即 R-RC-059 過
- 判定：超過 `end_on` 即停止，符合即 R-RC-065 過
- 判定：轉帳型排程建立轉帳實例，符合即 R-RC-070 過
- 判定：步 25 的 UI 半部加本查詢，R-TX-060 於場次表步 25 落 cover

---

## CP-A-09-10 截斷復原

- 時點：步 32 後，`此筆及未來` 刪除已於 4 秒內撤銷
- 管道：sqlite

```sql
SELECT date(end_on/1000, 'unixepoch', 'localtime') AS end_d
FROM schedules
WHERE template_note = '排06-轉帳轉排程'
  AND _status != 'deleted' AND deleted_on IS NULL;

SELECT date(t.schedule_instance_date/1000, 'unixepoch', 'localtime') AS d,
       t.deleted_on IS NULL AS alive, t.amount_from
FROM transfers t
JOIN schedules s ON s.id = t.schedule_id
WHERE s.template_note = '排06-轉帳轉排程' AND s.deleted_on IS NULL
  AND t._status != 'deleted'
ORDER BY t.schedule_instance_date;
```

- 預期：end_d 回當月 1 日
- 預期：上月 1 日與上月 29 日等被截各筆 alive 回 1
- 預期：上月 15 日那筆 alive 仍 0，其 amount_from 為 70060000 佐證步 29 已更新
- 判定：`end_on` 寫回截斷前的值，符合即 R-RC-037 過
- 判定：快照集合內實例軟刪標記清除，符合即 R-RC-038 過
- 判定：先前自行刪除的上月 15 日實例不復活，符合即 R-RC-039 過

---

## CP-A-09-11 截斷落地

- 時點：步 33 後，自上月 1 日起 `此筆及未來` 刪除已套用
- 管道：sqlite

```sql
SELECT date(end_on/1000, 'unixepoch', 'localtime') AS end_d
FROM schedules
WHERE template_note = '排06-轉帳轉排程'
  AND _status != 'deleted' AND deleted_on IS NULL;

SELECT COUNT(*) AS all_rows,
       SUM(t.deleted_on IS NULL) AS live_rows
FROM transfers t
JOIN schedules s ON s.id = t.schedule_id
WHERE s.template_note = '排06-轉帳轉排程' AND s.deleted_on IS NULL
  AND t._status != 'deleted';
```

- 預期：end_d 為上月 1 日回推 14 天那一日，即上上月中
- 預期：live_rows 為 0，all_rows 維持原實例數
- 判定：`end_on` 截為此筆前一週期，符合即 R-RC-035 過
- 判定：此筆日期當日起實例全軟刪，上月 15 日那筆為先前自行刪除，符合即 R-RC-036 過

---

## CP-A-09-12 撤銷排程建立

- 時點：步 35 後，7007 元週排程建立已於 4 秒內撤銷
- 管道：sqlite

```sql
SELECT s.deleted_on IS NOT NULL AS dead,
       (SELECT COUNT(*) FROM transactions t
        WHERE t.schedule_id = s.id
          AND t._status != 'deleted' AND t.deleted_on IS NULL) AS live_inst,
       (SELECT COUNT(*) FROM transactions t
        WHERE t.schedule_id = s.id AND t._status != 'deleted') AS all_inst
FROM schedules s
WHERE ABS(s.template_amount) = 70070000 AND s._status != 'deleted';
```

- 預期：恰一列，dead 為 1，live_inst 為 0，all_inst 至少 1
- 判定：排程本體與名下實例整批軟刪，符合即 R-RC-041 過
- Claude 同時記下排05 系與排06 兩類實例總數，供 CP-A-09-13 比對

```sql
SELECT COUNT(*) FROM transactions t
JOIN schedules s ON s.id = t.schedule_id
WHERE t._status != 'deleted'
  AND (s.template_note = '排05-交易轉排程'
       OR ABS(s.template_amount) IN (70040000, 70050000, 70070000));

SELECT COUNT(*) FROM transfers t
JOIN schedules s ON s.id = t.schedule_id
WHERE t._status != 'deleted'
  AND s.template_note = '排06-轉帳轉排程';
```

---

## CP-A-09-13 場尾收斂

- 時點：步 36 後，冷啟完成
- 管道：sqlite，重跑 CP-A-09-12 的兩條計數查詢

```sql
SELECT COUNT(*) FROM transactions t
JOIN schedules s ON s.id = t.schedule_id
WHERE t._status != 'deleted'
  AND (s.template_note = '排05-交易轉排程'
       OR ABS(s.template_amount) IN (70040000, 70050000, 70070000));

SELECT COUNT(*) FROM transfers t
JOIN schedules s ON s.id = t.schedule_id
WHERE t._status != 'deleted'
  AND s.template_note = '排06-轉帳轉排程';
```

- 預期：兩計數與 CP-A-09-12 時點一致，冷啟未長出新實例
- 例外：若當日恰為本月最後一日，7005 後繼排程會多一筆當月實例，屬正常補產生
- 判定：無對應規則，純收斂確認；不符則回 CP-A-09-08 至 CP-A-09-12 追異動來源

---

## CP-A-10-1 補充 fixture 與排序基準對賬

- 時點：步 10 完成後，QAKEY 結果列表停留畫面上
- 管道：sqlite

```bash
APP=$(xcrun simctl get_app_container booted com.almightyken0425.susugigiapp data)
DB=$(find "$APP" -name watermelon.db | head -1)
sqlite3 "$DB" "
SELECT amount_from, amount_to, note
FROM transfers
WHERE _status != 'deleted' AND deleted_on IS NULL AND note = 'QAKEY轉帳';
SELECT frequency, template_amount, template_note, is_transfer
FROM schedules
WHERE _status != 'deleted' AND deleted_on IS NULL AND template_note = 'QAKEY排程';
SELECT COUNT(*)
FROM transactions
WHERE _status != 'deleted' AND deleted_on IS NULL
  AND note = 'QAKEY排程'
  AND schedule_id IS NOT NULL
  AND schedule_instance_date IS NOT NULL;
SELECT note, date FROM (
  SELECT note, date FROM transactions
  WHERE _status != 'deleted' AND deleted_on IS NULL AND note LIKE '%QAKEY%'
  UNION ALL
  SELECT note, date FROM transfers
  WHERE _status != 'deleted' AND deleted_on IS NULL AND note LIKE '%QAKEY%'
) ORDER BY date DESC;"
```

- 預期段 1 恰 1 列：`amount_from` 與 `amount_to` 皆 80010000，8001 元乘一萬
- 預期段 2 恰 1 列：`frequency` 為 MONTHLY；`template_amount` 為 80020000；`is_transfer` 為 0
- 預期段 3 回 1 以上：排程實例已補產生且帶 schedule 標記欄位
- 段 4 為排序基準清單，日期新至舊
- Claude 將段 4 逐列列給操作者；操作者核對畫面結果順序逐列一致
- 判定
    - 畫面順序與段 4 完全一致 → R-SR-012 過
    - 段 1 至段 3 任一不符 → 佈置失敗，回步 1 重佈置再續場

---

## CP-A-10-2 場尾資料近不變對賬

- 時點：步 41 完成後，場次收尾
- 管道：sqlite

```bash
APP=$(xcrun simctl get_app_container booted com.almightyken0425.susugigiapp data)
DB=$(find "$APP" -name watermelon.db | head -1)
sqlite3 "$DB" "
SELECT amount
FROM transactions
WHERE _status != 'deleted' AND deleted_on IS NULL AND note = 'QAKEY01';
SELECT COUNT(*)
FROM transfers
WHERE _status != 'deleted' AND deleted_on IS NULL AND note = 'QAKEY轉帳';
SELECT COUNT(*)
FROM schedules
WHERE _status != 'deleted' AND deleted_on IS NULL AND template_note = 'QAKEY排程';"
```

- 預期段 1 恰 1 列：`amount` 為 -1200000，步 30 的復原已把 8003 元編輯回滾為 120 元支出
- 預期段 2 回 1：補充轉帳留庫
- 預期段 3 回 1：補充排程留庫
- 判定
    - 三段皆符 → 場尾狀態成立，資料近不變、僅補充紀錄留庫
    - 段 1 非 -1200000 → 步 30 復原未生效，登載缺陷並人工還原後結場
    - 本點為出場狀態對賬，無規則 ID 掛此點

---

## CP-A-11-1 快取鍵組成與命中回傳

- 時點：步 37 之後，當日與昨日頁往返完成
- 管道：log，Metro `8081` CDP device console
- 窗口：步 36 關閉篩選起，涵蓋當日頁重載至步 37 結束

```text
grep marker：QA RCACHE lookup
grep marker：QA RCACHE store
```

- 存在 `lookup` 帶 `hit=false`，其後同 `key` 出現 `store`，未命中即推導寫入，即 R-HR-111 過
- 同一 `key` 出現第二次 `lookup` 且 `hit=true`，命中回傳快取，即 R-HR-109 過
- `key` 字串含 `uid` 與偏移、粒度、帳戶集、分組、時區、週起始、圖表來源、主幣、匯率版本各維度；當日頁前後兩則 `lookup` 的 `key` 逐字相同，同鍵共用快取，即 R-HR-107 過
- 備註：PagerView 相鄰頁預載，昨日頁的首查可能早於箭頭點按，判定以 marker 序列存在性為準、不綁步驟時點

---

## CP-A-11-2 年與全粒度優先保留

- 時點：步 38 之後，年頁與全頁各載入一次
- 管道：log，Metro `8081` CDP device console

```text
grep marker：QA RCACHE store
```

- `key` 含 `year` 的 `store` 帶 `pinned=true`
- `key` 含 `all` 的 `store` 帶 `pinned=true`
- 窗口內 `key` 含 `day` 或 `week` 的 `store` 皆 `pinned=false`
- 以上齊備即 R-HR-112 過

---

## CP-A-11-3 超額淘汰

- 時點：步 39 之後，日粒度往過去載入 16 頁
- 管道：log，Metro `8081` CDP device console

```text
grep marker：QA RCACHE evict
grep marker：QA RCACHE store
```

- 自步 39 篩選關閉起算，`store` 累計達第 16 筆之後出現 `evict`
- `evict` 的 `size` 欄不超過 16，淘汰後回 15 筆以內
- `evictedKey` 為 `pinned=false` 的日粒度 entry
- 以上齊備即 R-HR-113 過

---

## CP-A-11-4 重取焦點清空與附帶紀錄

- 時點：步 41 之後，設定頁往返回首頁
- 管道：log，Metro `8081` CDP device console

```text
grep marker：QA RCACHE clear
grep marker：QA RCACHE lookup
```

- 返回首頁時出現 `clear` 帶 `reason=refocus` 與 `cleared` 筆數，即 R-HR-123 過
- `clear` 之後首則 `lookup` 對步 40 剛回訪過的當日 `key` 回 `hit=false`；快取與存取時間、優先標記、進行中紀錄同清，命中不再發生，即 R-HR-116 過

---

## CP-A-11-5 帳戶停用落庫與清單對賬

- 時點：步 46 之後，`A4日圓` 剛停用
- 管道：sqlite

```bash
DB=$(find "$(xcrun simctl get_app_container booted com.almightyken0425.susugigiapp data)" -name watermelon.db | head -1)
sqlite3 "$DB" "
SELECT name, disabled_on FROM accounts
WHERE name = 'A4日圓' AND _status != 'deleted' AND deleted_on IS NULL;
SELECT COUNT(*) AS mgmt_rows FROM accounts
WHERE _status != 'deleted' AND deleted_on IS NULL;
SELECT COUNT(*) AS tombstones FROM accounts
WHERE _status != 'deleted' AND deleted_on IS NOT NULL;
SELECT COUNT(*) AS a3_tx FROM transactions t JOIN accounts a ON a.id = t.account_id
WHERE a.name = 'A4日圓' AND t.amount = -90040000
  AND t._status != 'deleted' AND t.deleted_on IS NULL;
SELECT COUNT(*) AS a3_tf FROM transfers f JOIN accounts a ON a.id = f.account_to_id
WHERE a.name = 'A4日圓' AND f.amount_from = 90060000
  AND f._status != 'deleted' AND f.deleted_on IS NULL;
"
```

- `A4日圓` 的 `disabled_on` 為毫秒整數非 NULL，即 R-CM-075 過
- `mgmt_rows` 等於操作者步 44 回報列數，停用列計入；`tombstones` 大於 0 時該數不計入列表，軟刪排除成立，即 R-BS-028 過
- `a3_tx` 為 1 且 `a3_tf` 為 1，9004 元交易與 9006 元轉帳仍在庫未刪，僅自報表視圖隱藏，即 R-HR-080 過

---

## CP-A-11-6 類別停用落庫與清單對賬

- 時點：步 58 之後，`類02支-交通` 剛停用
- 管道：sqlite

```bash
DB=$(find "$(xcrun simctl get_app_container booted com.almightyken0425.susugigiapp data)" -name watermelon.db | head -1)
sqlite3 "$DB" "
SELECT name, type, disabled_on FROM categories
WHERE name = '類02支-交通' AND _status != 'deleted' AND deleted_on IS NULL;
SELECT COUNT(*) AS mgmt_rows FROM categories
WHERE _status != 'deleted' AND deleted_on IS NULL;
"
```

- `類02支-交通` 的 `disabled_on` 為毫秒整數非 NULL 且 `type` 為 `expense`，即 R-CM-038 過
- `mgmt_rows` 等於操作者步 56 回報列數，停用列計入、軟刪由查詢條件排除，即 R-BS-031 過

---

## CP-A-11-7 重新啟用後停用欄回 Null

- 時點：步 69 之後，三筆停用全數重新啟用
- 管道：sqlite

```bash
DB=$(find "$(xcrun simctl get_app_container booted com.almightyken0425.susugigiapp data)" -name watermelon.db | head -1)
sqlite3 "$DB" "
SELECT name, disabled_on FROM accounts
WHERE name IN ('A2銀行','A4日圓') AND _status != 'deleted' AND deleted_on IS NULL;
SELECT name, disabled_on FROM categories
WHERE name = '類02支-交通' AND _status != 'deleted' AND deleted_on IS NULL;
"
```

- `A2銀行` 與 `A4日圓` 的 `disabled_on` 皆為 NULL；對照 CP-A-11-5 曾非 NULL，停用寫入、啟用中為 Null，即 R-DM-019 過
- `類02支-交通` 的 `disabled_on` 為 NULL；對照 CP-A-11-6 曾非 NULL，即 R-DM-025 過

---

## CP-A-12-01 分析同意落庫

- 時點：步 25 開關轉關閉後，尚未執行步 26 還原
- 管道：sqlite

```bash
DB="$(xcrun simctl get_app_container booted com.almightyken0425.susugigiapp data)/Documents/watermelon.db"
sqlite3 "$DB" "SELECT analytics_consent FROM settings WHERE _status != 'deleted';"
```

- 預期與判定
    - 僅一列，`analytics_consent` 為 0，與畫面關閉態一致
    - 符合即 setAnalyticsConsent 更新落庫成立，`R-ST-079` 過
    - 步 26 還原後的 1 由 CP-A-12-06 收尾覆核

---

## CP-A-12-02 啟動模式落 expense

- 時點：步 32 按勾號返回偏好設定後
- 管道：sqlite

```bash
DB="$(xcrun simctl get_app_container booted com.almightyken0425.susugigiapp data)/Documents/watermelon.db"
sqlite3 "$DB" "SELECT launch_mode FROM settings WHERE _status != 'deleted';"
```

- 預期與判定
    - `launch_mode` 恰為 `expense`，逐字一致無別名
    - 符合即 setLaunchMode 更新為目標值成立，`R-ST-067` 過
    - 觀測值記入值域清單，供 CP-A-12-06 判 `R-DM-003`

---

## CP-A-12-03 啟動模式落 income

- 時點：步 33 按勾號返回後
- 管道：sqlite

```bash
DB="$(xcrun simctl get_app_container booted com.almightyken0425.susugigiapp data)/Documents/watermelon.db"
sqlite3 "$DB" "SELECT launch_mode FROM settings WHERE _status != 'deleted';"
```

- 預期與判定
    - `launch_mode` 恰為 `income`
    - 屬 `R-DM-003` 值域證據累積，本點不單獨掛規則

---

## CP-A-12-04 啟動模式落 transfer

- 時點：步 34 按勾號返回後
- 管道：sqlite

```bash
DB="$(xcrun simctl get_app_container booted com.almightyken0425.susugigiapp data)/Documents/watermelon.db"
sqlite3 "$DB" "SELECT launch_mode FROM settings WHERE _status != 'deleted';"
```

- 預期與判定
    - `launch_mode` 恰為 `transfer`
    - 屬 `R-DM-003` 值域證據累積，本點不單獨掛規則

---

## CP-A-12-05 主題套用與非同步寫入

- 時點：步 42 介面轉藍後，尚未執行步 43 還原
- 管道：sqlite

```bash
DB="$(xcrun simctl get_app_container booted com.almightyken0425.susugigiapp data)/Documents/watermelon.db"
sqlite3 "$DB" "SELECT theme FROM settings WHERE _status != 'deleted';"
```

- 預期與判定
    - `theme` 為 `theme2`，即 `海洋藍`
    - 步 42 操作者已見介面即時轉藍，本點確認落庫
    - 即時套用與非同步寫入兩者皆立，`R-ST-065` 過

---

## CP-A-12-06 場尾偏好還原與值域總對賬

- 時點：步 49 回到首頁後
- 管道：sqlite

```bash
DB="$(xcrun simctl get_app_container booted com.almightyken0425.susugigiapp data)/Documents/watermelon.db"
sqlite3 "$DB" "SELECT theme, launch_mode, analytics_consent, week_start FROM settings WHERE _status != 'deleted';"
```

- 預期與判定
    - `launch_mode` 為 `home`
    - 彙整 CP-A-12-02 至 04 與本點觀測，四次寫入恰為 `expense` `income` `transfer` `home`
    - 四值皆逐字落庫且未出現第五值，符合即 `R-DM-003` 過
    - `theme` 為 `theme1`、`analytics_consent` 為 1、`week_start` 為 `auto`，屬場尾還原確認不掛規則
    - 任一還原欄位不符即回報操作者補做對應還原步驟

---

## CP-A-13-1 語系寫入 Settings 表

- 時點：步 11 完成後、步 12 前
- 管道：sqlite

```bash
APP=$(xcrun simctl get_app_container booted com.almightyken0425.susugigiapp data)
DB=$(find "$APP" -name 'watermelon.db' | head -1)
sqlite3 "$DB" "SELECT language FROM settings WHERE _status != 'deleted';"
```

- 預期：回傳單列，值為 `de`
- 判定：符合即 R-ST-073 過；介面即時切換由步 11 目視補全

---

## CP-A-13-2 週起始寫入 monday

- 時點：步 17 完成後、步 18 前
- 管道：sqlite

```bash
APP=$(xcrun simctl get_app_container booted com.almightyken0425.susugigiapp data)
DB=$(find "$APP" -name 'watermelon.db' | head -1)
sqlite3 "$DB" "SELECT week_start FROM settings WHERE _status != 'deleted';"
```

- 預期：回傳單列，值為 `monday`
- 判定：符合即 R-ST-077 過

---

## CP-A-13-3 週起始寫入 sunday 與值域

- 時點：步 19 完成後、步 20 前
- 管道：sqlite

```bash
APP=$(xcrun simctl get_app_container booted com.almightyken0425.susugigiapp data)
DB=$(find "$APP" -name 'watermelon.db' | head -1)
sqlite3 "$DB" "SELECT week_start FROM settings WHERE _status != 'deleted';"
```

- 預期：回傳單列，值為 `sunday`
- 判定：本 CP 觀測 `sunday`；CP-A-13-2 已觀測 `monday`；CP-A-13-5 收尾觀測 `auto`
- 三次觀測恰為值域全集、無集外值，即 R-DM-005 過

---

## CP-A-13-4 切時區重跑排程不多產

- 時點：步 28 重啟後、步 29 前
- 管道：sqlite

```bash
APP=$(xcrun simctl get_app_container booted com.almightyken0425.susugigiapp data)
DB=$(find "$APP" -name 'watermelon.db' | head -1)
sqlite3 "$DB" "SELECT time_zone FROM settings WHERE _status != 'deleted';"
sqlite3 "$DB" "SELECT s.id, s.template_amount, COUNT(t.id) AS n, COUNT(DISTINCT t.schedule_instance_date) AS d FROM schedules s LEFT JOIN transactions t ON t.schedule_id = s.id AND t._status != 'deleted' AND t.deleted_on IS NULL WHERE s._status != 'deleted' AND s.deleted_on IS NULL GROUP BY s.id;"
sqlite3 "$DB" "SELECT schedule_id, schedule_instance_date, COUNT(*) AS c FROM transactions WHERE _status != 'deleted' AND deleted_on IS NULL AND schedule_id IS NOT NULL GROUP BY schedule_id, schedule_instance_date HAVING c > 1;"
```

- 本場排程識別：`template_amount` 對應 10021 元縮放值 `1002100`
- 縮放倍率以 100 計；實庫倍率不同時以 10021 元換算值替換
- 預期一：`time_zone` 為 `Pacific/Auckland`
- 預期二：本場排程 n 為 4 且 n 等於 d；當日實例時刻未過時容忍 n 為 3
- 預期三：重複查詢回傳零列
- 判定：預期二與預期三皆符合即 R-TZ-004 過
- 預期一為 setTimeZone 目標值寫入佐證，正式判定在 CP-A-13-5

---

## CP-A-13-5 場尾還原對賬

- 時點：步 33 完成後、場次收尾
- 管道：sqlite

```bash
APP=$(xcrun simctl get_app_container booted com.almightyken0425.susugigiapp data)
DB=$(find "$APP" -name 'watermelon.db' | head -1)
sqlite3 "$DB" "SELECT language, time_zone, week_start FROM settings WHERE _status != 'deleted';"
sqlite3 "$DB" "SELECT start_on, end_on FROM schedules WHERE _status != 'deleted' AND deleted_on IS NULL AND template_amount = 1002100;"
sqlite3 "$DB" "SELECT COUNT(*) FROM transactions WHERE _status != 'deleted' AND deleted_on IS NULL AND schedule_id IN (SELECT id FROM schedules WHERE template_amount = 1002100);"
```

- 預期一：settings 單列為 `zh-Hant`、`Asia/Taipei`、`auto`
- 預期二：本場排程 `end_on` 非空且早於當日零時，不再補產
- 預期三：本場排程活躍實例數為 0
- 判定：`time_zone` 等於目標值 `Asia/Taipei` 即 R-ST-075 過
- Auckland 目標值寫入已於 CP-A-13-4 佐證
- 預期一之 `auto` 併入 CP-A-13-3 的 R-DM-005 值域判定
- 預期二與預期三為場尾還原稽核，不另掛規則

---

## CP-A-14-01 交易範本與說明檔內容

- 時點：步 13 完成後、步 14 前
- 管道：檔案，讀 simulator 檔案 App 本機儲存區

```bash
FP="$(xcrun simctl get_app_container booted com.apple.DocumentsApp groups | grep 'group.com.apple.FileProvider.LocalStorage' | awk '{print $2}')/File Provider Storage"
cat "$FP"'/$wish_transaction_template.csv'
echo '----'
cat "$FP"'/$wish_transaction_guide.txt'
```

- 預期一：範本首列標頭為 `transaction_datetime,category,account,amount,currency,note`，欄序即日期類別帳戶金額幣別備註
- 預期二：標頭下附兩列合法範例列，非只有標頭
- 預期三：說明檔逐欄列出欄位名，每欄標 `Required` 或 `Optional`
- 預期四：說明檔含 `Notes` 段，涵蓋列略過條件與句點小數等格式規則
- 判定：預期一過 R-IE-042；預期二過 R-IE-051；預期三過 R-IE-057；預期四過 R-IE-058

---

## CP-A-14-02 轉帳範本欄序

- 時點：步 17 完成後、步 18 前
- 管道：檔案，讀 simulator 檔案 App 本機儲存區

```bash
FP="$(xcrun simctl get_app_container booted com.apple.DocumentsApp groups | grep 'group.com.apple.FileProvider.LocalStorage' | awk '{print $2}')/File Provider Storage"
head -1 "$FP"'/$wish_transfer_template.csv'
```

- 預期：標頭為 `transfer_datetime,from_account,from_currency,from_amount,to_account,to_currency,to_amount,note`，欄序即日期轉出戶幣額轉入戶幣額備註
- 判定：符合即 R-IE-043 過

---

## CP-A-14-03 交易匯入六筆落庫對賬

- 時點：步 41 完成後、步 42 前
- 管道：sqlite
- 縮放倍率固定萬倍，顯示值乘 10000 得落庫整數

```bash
APP=$(xcrun simctl get_app_container booted com.almightyken0425.susugigiapp data)
DB=$(find "$APP" -name 'watermelon.db' | head -1)
sqlite3 "$DB" "SELECT t.amount, t.date, t.note, c.name, c.type, a.name, a.currency_code FROM transactions t JOIN categories c ON c.id = t.category_id JOIN accounts a ON a.id = t.account_id WHERE t._status != 'deleted' AND t.deleted_on IS NULL AND t.amount IN (-110010000,110020000,-110031234,110040000,-110050000,-110080000) ORDER BY t.amount;"
sqlite3 "$DB" "SELECT COUNT(*) FROM transactions WHERE _status != 'deleted' AND deleted_on IS NULL AND amount IN (-110060000,-110070000);"
```

- 預期一：第一查詢回六列，金額分別為 `-110010000` `110020000` `-110031234` `110040000` `-110050000` `-110080000`
- 預期二：金額正負與類別 type 一致，負值歸 `expense` 類別、正值歸 `income` 類別
- 預期三：`-110031234` 一列存在，四位小數縮放後無精度損失
- 預期四：`110040000` 一列歸戶帳戶 `A7匯入現金` 且 `currency_code` 為 `USD`，證小寫 `usd` 比對成功
- 預期五：`-110050000` 一列存在，`note` 為空仍成功落庫
- 預期六：`-110010000` 一列 `date` 換算 UTC+08:00 後為當月 01 日 00:00:00
- 預期七：第二查詢回 0，`-110060000` 與 `-110070000` 兩列不存在，證收支同名跳過與幣別不符跳過
- 判定：預期六過 R-IE-044；預期二過 R-IE-045；預期三過 R-IE-046；預期四過 R-IE-047；預期五過 R-IE-048

---

## CP-A-14-04 轉帳匯入落庫對賬

- 時點：步 46 完成後、步 47 前
- 管道：sqlite

```bash
APP=$(xcrun simctl get_app_container booted com.almightyken0425.susugigiapp data)
DB=$(find "$APP" -name 'watermelon.db' | head -1)
sqlite3 "$DB" "SELECT amount_from, amount_to, implied_rate, note FROM transfers WHERE _status != 'deleted' AND deleted_on IS NULL AND amount_from IN (110090000,110100000) ORDER BY amount_from;"
```

- 預期一：僅回一列，`amount_from` 為 `110100000`
- 預期二：該列 `amount_to` 亦為 `110100000`，同幣別省略轉入額時以轉出額補齊
- 預期三：`110090000` 一列不存在，跨幣別缺轉入額的列匯入時略過
- 判定：預期三過 R-IE-049；預期二過 R-IE-050

---

## CP-A-14-05 範本範例列原樣重匯

- 時點：步 47 完成後、步 48 前
- 管道：sqlite

```bash
APP=$(xcrun simctl get_app_container booted com.almightyken0425.susugigiapp data)
DB=$(find "$APP" -name 'watermelon.db' | head -1)
sqlite3 "$DB" "SELECT t.amount, c.name, c.type, a.name, a.currency_code FROM transactions t JOIN categories c ON c.id = t.category_id JOIN accounts a ON a.id = t.account_id WHERE t._status != 'deleted' AND t.deleted_on IS NULL AND a.name IN ('Cash','Bank') ORDER BY t.amount;"
```

- 預期：回兩列，`-1500000` 歸 `Food` `expense` `Cash`、`500000000` 歸 `Salary` `income` `Bank`，兩帳戶幣別皆 `TWD`
- 判定：範例列零略過原樣落庫即 R-IE-052 過

---

## CP-A-14-06 場尾出場態與範本殘留清除

- 時點：步 50 完成後、場次收尾
- 管道：sqlite

```bash
APP=$(xcrun simctl get_app_container booted com.almightyken0425.susugigiapp data)
DB=$(find "$APP" -name 'watermelon.db' | head -1)
sqlite3 "$DB" "SELECT name, currency_code, deleted_on FROM accounts WHERE name IN ('Cash','Bank');"
sqlite3 "$DB" "SELECT name, type, deleted_on FROM categories WHERE name IN ('Food','Salary');"
sqlite3 "$DB" "SELECT name, currency_code FROM accounts WHERE name = 'A7匯入現金' AND _status != 'deleted' AND deleted_on IS NULL ORDER BY currency_code;"
sqlite3 "$DB" "DELETE FROM categories WHERE id = 'qa14-tombstone-cat';"
```

- 預期一：`Cash` `Bank` 兩帳戶 `deleted_on` 非空，已軟刪
- 預期二：`Food` `Salary` 兩類別 `deleted_on` 非空，已軟刪
- 預期三：`A7匯入現金` 仍回兩列，幣別 `TWD` 與 `USD` 完整留存為出場態
- 預期四：末句刪除佈置注入的同名軟刪墓碑，避免殘留污染
- 判定：範本殘留已除、匯入出場 fixture 完整即收尾稽核通過，不另掛規則

---

## CP-A-15-01 匯入落庫與同名異幣拆分

- 時點：步 13 送出後、步 14 前
- 管道：sqlite

```bash
APP=$(xcrun simctl get_app_container booted com.almightyken0425.susugigiapp data)
DB=$(find "$APP" -name 'watermelon.db' | head -1)
sqlite3 "$DB" "SELECT name, currency_code, id FROM accounts WHERE name = 'A9澳幣' AND _status != 'deleted' AND deleted_on IS NULL ORDER BY currency_code;"
sqlite3 "$DB" "SELECT COUNT(*) FROM transactions t JOIN accounts a ON t.account_id = a.id WHERE a.name = 'A9澳幣' AND a.currency_code = 'AUD' AND t._status != 'deleted' AND t.deleted_on IS NULL;"
sqlite3 "$DB" "SELECT note FROM transactions WHERE note = '午餐, 咖啡' AND _status != 'deleted' AND deleted_on IS NULL;"
```

- 預期：帳戶查詢回兩列，`currency_code` 各為 `AUD` 與 `TWD`，兩 id 相異
- 預期：AUD 戶交易計數為 4，帶前後空白名稱那列併入同戶不另開帳
- 預期：逗號備註完整落庫單列，值為 `午餐, 咖啡`
- 判定：兩帳戶各自建立且採該列幣別即 R-IE-062 R-IE-063 過；併戶不重複即 R-IE-071 過；逗號備註完整即 R-IE-070 過

---

## CP-A-15-02 時區解析落點

- 時點：步 13 送出後、步 14 前
- 管道：sqlite 加對照計算

```bash
APP=$(xcrun simctl get_app_container booted com.almightyken0425.susugigiapp data)
DB=$(find "$APP" -name 'watermelon.db' | head -1)
sqlite3 "$DB" "SELECT note, date FROM transactions WHERE note IN ('無偏移依來源時區', '內嵌偏移優先') AND _status != 'deleted' AND deleted_on IS NULL;"
Y=$(date +%Y); M=$(date +%m)
echo "無偏移期望 $(( $(date -u -j -f '%Y-%m-%d %H:%M:%S %z' "$Y-$M-15 12:00:00 +0000" +%s) * 1000 ))"
echo "內嵌期望 $(( $(date -j -f '%Y-%m-%d %H:%M:%S %z' "$Y-$M-16 08:00:00 +0500" +%s) * 1000 ))"
```

- 預期：無偏移依來源時區 列的 `date` 等於 無偏移期望，即以來源時區 `+00:00` 解析、非 app 顯示時區 `+09:00`
- 預期：內嵌偏移優先 列的 `date` 等於 內嵌期望，即以字串內嵌 `+05:00` 解析、來源 `+00:00` 對該列無效
- 判定：無偏移列依來源時區即 R-IE-065 R-TZ-007 過；內嵌列依內嵌偏移即 R-IE-064 R-TZ-006 過

---

## CP-A-15-03 略過列不落庫與計數

- 時點：步 13 送出後、步 14 前
- 管道：sqlite 加步 13 對話框計數

```bash
APP=$(xcrun simctl get_app_container booted com.almightyken0425.susugigiapp data)
DB=$(find "$APP" -name 'watermelon.db' | head -1)
sqlite3 "$DB" "SELECT COUNT(*) FROM transactions WHERE note IN ('壞日期跳過', '既有戶設跳過') AND _status != 'deleted' AND deleted_on IS NULL;"
```

- 預期：計數為 0，`$M-32` 非法日列與比對設跳過列皆未落庫
- 預期：步 13 對話框略過數為 2
- 判定：日期解析失敗列略過計數即 R-IE-068 過；比對動作選跳過的帳戶列計入略過即 R-IE-069 過

---

## CP-A-15-04 匯入不種佔位匯率查無回 1

- 時點：步 13 送出後、步 14 前
- 管道：sqlite 加首頁 UI

```bash
APP=$(xcrun simctl get_app_container booted com.almightyken0425.susugigiapp data)
DB=$(find "$APP" -name 'watermelon.db' | head -1)
sqlite3 "$DB" "SELECT COUNT(*) FROM currency_rates WHERE (currency_from_id = 36 OR currency_to_id = 36) AND _status != 'deleted' AND deleted_on IS NULL;"
```

- 預期：計數為 0，AUD 幣別 id 36 由匯入建立帳戶卻無任何匯率列
- 預期：步 14 首頁 AUD 交易列的 `≈` 換算副文字數值等同原始金額
- 判定：匯入不種佔位匯率即 R-CU-057 過；查無匯率記錄回傳匯率 1 即 R-CU-049 過

---

## CP-A-15-05 匯出內容欄序與偏移

- 時點：步 17 存檔後、步 18 前
- 管道：讀匯出 CSV 檔

```bash
FP="$(xcrun simctl get_app_container booted com.apple.DocumentsApp groups | grep 'group.com.apple.FileProvider.LocalStorage' | awk '{print $2}')/File Provider Storage"
head -1 "$FP"/transactions_*.csv
grep 'A9澳幣' "$FP"/transactions_*.csv | head
```

- 預期：首列標頭為 `transaction_datetime,category,account,amount,currency,note`，欄序同範本可原樣重匯
- 預期：`account` 欄為帳戶名 `A9澳幣`、`category` 欄為類別名，非任何識別碼
- 預期：時間欄帶 `+00:00` UTC 偏移後綴
- 預期：檔內僅當前使用者活躍紀錄，無軟刪列與他帳號列
- 判定：欄序同範本即 R-IE-074 過；輸出帳戶類別名而非識別碼即 R-IE-073 過；時間欄帶 UTC 偏移即 R-IE-075 過；僅活躍紀錄排除軟刪即 R-IE-072 過

---

## CP-A-15-06 重匯翻倍同絕對時刻

- 時點：步 20 重匯送出後、步 21 後
- 管道：sqlite

```bash
APP=$(xcrun simctl get_app_container booted com.almightyken0425.susugigiapp data)
DB=$(find "$APP" -name 'watermelon.db' | head -1)
sqlite3 "$DB" "SELECT COUNT(*) FROM transactions t JOIN accounts a ON t.account_id = a.id WHERE a.name = 'A9澳幣' AND a.currency_code = 'AUD' AND t._status != 'deleted' AND t.deleted_on IS NULL;"
sqlite3 "$DB" "SELECT date, COUNT(*) FROM transactions WHERE note = '內嵌偏移優先' AND _status != 'deleted' AND deleted_on IS NULL GROUP BY date;"
```

- 預期：AUD 戶交易由 4 增為 8，每列配新主鍵成獨立紀錄
- 預期：內嵌偏移優先 兩筆落在同一 `date` 值，計數為 2
- 判定：重匯新增獨立紀錄即 R-IE-066 過；帶偏移匯出原樣重匯還原同一絕對時刻即 R-TZ-008 過

---

## 共用前置

- 所有 sqlite 檢查點共用下列取庫指令
- 金額縮放倍率以 100 計；實庫倍率不同時以該元值換算替換
- 名稱對照：13001 元縮放為 `1300100`、13003 為 `1300300`、13004 為 `1300400`、13005 為 `1300500`、13010 為 `1301000`、13011 為 `1301100`、13021 為 `1302100`、13030 為 `1303000`、13031 為 `1303100`

```bash
APP=$(xcrun simctl get_app_container booted com.almightyken0425.susugigiapp data)
DB=$(find "$APP" -name 'watermelon.db' | head -1)
```

---

## CP-A-16-1 復原新增交易後軟刪隱沒

- 時點：步 12 完成後、步 13 前
- 管道：sqlite

```bash
sqlite3 "$DB" "SELECT id, amount, _status, deleted_on FROM transactions WHERE amount = 1302100;"
```

- 預期：回傳該筆，`deleted_on` 非空或 `_status` 為 `deleted`
- 判定：13021 元列已軟刪隱沒即 R-TX-114 過

---

## CP-A-16-2 復原編輯交易後欄位寫回舊值

- 時點：步 17 完成後、步 18 前
- 管道：sqlite

```bash
sqlite3 "$DB" "SELECT amount FROM transactions WHERE amount IN (1303000, 1303100) AND _status != 'deleted' AND deleted_on IS NULL;"
```

- 預期：活躍列金額為 `1303000`、無 `1303100` 活躍列
- 判定：欄位回復更新前的 13030 元即 R-TX-115 過

---

## CP-A-16-3 刪除類別串聯軟刪

- 時點：步 19 完成後、步 20 前
- 管道：sqlite

```bash
sqlite3 "$DB" "SELECT id, deleted_on, _status FROM categories WHERE name = 'C09合併源';"
sqlite3 "$DB" "SELECT amount, deleted_on, _status FROM transactions WHERE amount IN (1301000, 1301100);"
```

- 預期一：`C09合併源` 列 `deleted_on` 非空
- 預期二：13010 與 13011 兩筆交易 `deleted_on` 皆非空
- 判定：類別軟刪即 R-CM-039 過；所屬交易串聯軟刪即 R-CM-040 過

---

## CP-A-16-4 復原刪除後取消軟刪還原

- 時點：步 20 完成後、步 21 前
- 管道：sqlite

```bash
sqlite3 "$DB" "SELECT id, deleted_on FROM categories WHERE name = 'C09合併源' AND _status != 'deleted' AND deleted_on IS NULL;"
sqlite3 "$DB" "SELECT amount, deleted_on FROM transactions WHERE amount IN (1301000, 1301100) AND _status != 'deleted' AND deleted_on IS NULL;"
```

- 預期一：`C09合併源` 回為單一活躍列、`deleted_on` 為空
- 預期二：13010 與 13011 兩筆交易皆回為活躍列
- 判定：記錄取消軟刪還原即 R-TX-116 過

---

## CP-A-16-5 刪除帳戶串聯軟刪且排程存活

- 時點：步 22 完成後、步 23 前
- 管道：sqlite

```bash
sqlite3 "$DB" "SELECT id, deleted_on FROM accounts WHERE name = 'A10合併源';"
sqlite3 "$DB" "SELECT amount, deleted_on FROM transactions WHERE amount IN (1300100, 1300500);"
sqlite3 "$DB" "SELECT amount_from, deleted_on FROM transfers WHERE amount_from IN (1300300, 1300400);"
sqlite3 "$DB" "SELECT id, deleted_on FROM schedules WHERE template_account_id = (SELECT id FROM accounts WHERE name = 'A10合併源' LIMIT 1);"
```

- 預期一：`A10合併源` 帳戶列 `deleted_on` 非空
- 預期二：13001 與 13005 兩筆交易 `deleted_on` 皆非空
- 預期三：13003 與 13004 兩筆轉帳 `deleted_on` 皆非空
- 預期四：模板指向 `A10合併源` 的排程列 `deleted_on` 為空、未隨帳戶刪除
- 判定：帳戶軟刪即 R-CM-076 過；所屬交易串聯軟刪即 R-CM-077 過；轉出轉入方轉帳串聯軟刪即 R-CM-078 過
- R-XD-001 判定：刪除帳戶不軟刪其排程、排程存活可續產，續產路徑明定；full 續產產出實例另需跨期補產，此處以排程存活斷定停續分野

---

## CP-A-16-6 合併類別後改屬與來源軟刪

- 時點：步 29 完成後、步 30 前
- 管道：sqlite

```bash
sqlite3 "$DB" "SELECT amount, category_id, (SELECT name FROM categories WHERE id = t.category_id) AS cat FROM transactions t WHERE amount IN (1301000, 1301100) AND _status != 'deleted' AND deleted_on IS NULL;"
sqlite3 "$DB" "SELECT deleted_on FROM categories WHERE name = 'C09合併源';"
```

- 預期一：13010 與 13011 兩筆交易 `cat` 皆為 `類01支-餐飲`
- 預期二：`C09合併源` 列 `deleted_on` 非空
- 判定：來源交易全改屬目標即 R-CM-100 過；來源類別軟刪即 R-CM-101 過

---

## CP-A-16-7 合併帳戶後改屬冗餘軟刪與排程轉指

- 時點：步 34 完成後、步 35 前
- 管道：sqlite 與首頁報表目視

```bash
A2=$(sqlite3 "$DB" "SELECT id FROM accounts WHERE name = 'A2銀行' LIMIT 1;")
A1=$(sqlite3 "$DB" "SELECT id FROM accounts WHERE name = 'A1現金' LIMIT 1;")
sqlite3 "$DB" "SELECT amount, account_id FROM transactions WHERE amount IN (1300100, 1300500) AND _status != 'deleted' AND deleted_on IS NULL;"
sqlite3 "$DB" "SELECT amount_from, account_from_id, account_to_id, deleted_on FROM transfers WHERE amount_from IN (1300300, 1300400);"
sqlite3 "$DB" "SELECT deleted_on FROM accounts WHERE name = 'A10合併源';"
sqlite3 "$DB" "SELECT id, deleted_on FROM schedules WHERE template_account_id = (SELECT id FROM accounts WHERE name = 'A10合併源' LIMIT 1);"
```

- 預期一：13001 與 13005 兩筆交易 `account_id` 皆等於 `A2銀行` 的 id
- 預期二：13004 轉帳 `account_from_id` 改為 `A2銀行`、`account_to_id` 仍為 `A1現金`、`deleted_on` 為空
- 預期三：13003 轉帳合併後轉出轉入同為 `A2銀行`、`deleted_on` 非空
- 預期四：`A10合併源` 帳戶列 `deleted_on` 非空
- 預期五：模板指向 `A10合併源` 的排程列 `deleted_on` 非空
- 預期六：首頁報表於返回時即反映改屬後合計、無舊快取殘值
- 判定：來源交易全改屬目標即 R-CM-095 過；來源轉出入方轉帳改指目標即 R-CM-096 過；轉出轉入相同的轉帳軟刪即 R-CM-097 過；來源帳戶軟刪即 R-CM-098 過
- R-XD-004 判定：合併後模板指向來源的排程被軟刪、停止續產指向已消滅來源，轉指行為明定即過
- R-HR-118 判定：報表快取隨底層資料表變更自動失效、返回即重查；無專屬 log marker，以首頁合計即時反映改屬為觀測依據，符合即過

---

## CP-A-16-8 復原合併依快照移回並恢復冗餘

- 時點：步 35 完成後、步 36 前
- 管道：sqlite 與首頁報表目視

```bash
A10=$(sqlite3 "$DB" "SELECT id FROM accounts WHERE name = 'A10合併源' LIMIT 1;")
sqlite3 "$DB" "SELECT deleted_on FROM accounts WHERE name = 'A10合併源';"
sqlite3 "$DB" "SELECT amount, account_id FROM transactions WHERE amount IN (1300100, 1300500) AND _status != 'deleted' AND deleted_on IS NULL;"
sqlite3 "$DB" "SELECT amount_from, account_from_id, account_to_id, deleted_on FROM transfers WHERE amount_from IN (1300300, 1300400);"
sqlite3 "$DB" "SELECT COUNT(*) FROM transfers WHERE account_from_id = (SELECT id FROM accounts WHERE name = 'A2銀行' LIMIT 1) AND account_to_id = (SELECT id FROM accounts WHERE name = 'A2銀行' LIMIT 1) AND _status != 'deleted' AND deleted_on IS NULL;"
```

- 預期一：`A10合併源` 帳戶列 `deleted_on` 回為空、來源恢復
- 預期二：13001 與 13005 兩筆交易 `account_id` 依快照移回 `A10合併源` 的 id
- 預期三：13004 轉帳 `account_from_id` 依快照改回 `A10合併源`
- 預期四：13003 冗餘轉帳 `deleted_on` 回為空、恢復為 `A10合併源` 轉出至 `A2銀行`
- 預期五：目標 `A2銀行` 原有記錄逐 id 比對維持不變、無殘留 A2 至 A2 自轉帳
- 預期六：首頁報表於復原後即重查、合計回復合併前分佈
- 判定：來源恢復即 R-CM-102 過；快照逐 id 移回交易即 R-CM-103 過；轉出入方改回來源即 R-CM-104 過；恢復冗餘轉帳即 R-CM-105 過；目標原有記錄不變即 R-CM-106 過；快照移回並恢復來源與冗餘轉帳即 R-XD-010 過
- R-HR-119 判定：復原後報表快取失效重查、合計即時回復；無專屬 log marker，以首頁合計即時回復為觀測依據，符合即過

---

## 檢查點索引

- 對賬庫為 simulator 的 `watermelon.db`
- 所有 SQL 固定加軟刪過濾 `_status != 'deleted' AND deleted_on IS NULL`
- 排07 以唯一每日排程定位，先取其 id

定位排07 id 與 db 路徑

```bash
DB=$(find ~/Library/Developer/CoreSimulator/Devices -name watermelon.db | head -1)
sqlite3 "$DB" "SELECT id, start_on, end_on, template_amount FROM schedules WHERE frequency='DAILY' AND _status != 'deleted' AND deleted_on IS NULL;"
```

---

## CP-A-17-01 undo 殺 app 後被刪紀錄維持已刪

- 時點：步 15 重開後
- 管道：sqlite

```sql
SELECT amount, deleted_on, _status FROM transactions
WHERE user_id = '<uid>' AND note IS NULL AND amount = <14010 縮放值>;
```

- 14010 元那筆 `deleted_on` 非 null 即符合 R-KR-001
- 無同金額第二筆存活列

---

## CP-A-17-02 啟動讀 Settings theme 套用主題

- 時點：步 6 重開後
- 管道：sqlite 加畫面觀察

```sql
SELECT theme FROM settings
WHERE user_id = '<uid>' AND _status != 'deleted';
```

- `theme` 欄值為 theme2
- 重開後畫面套用第二主題即符合 R-ST-063

---

## CP-A-17-03 編輯器殺 app 重開不留草稿

- 時點：步 9 重開後
- 管道：sqlite

```sql
SELECT count(*) FROM transactions
WHERE user_id = '<uid>' AND amount = <14030 縮放值>
  AND _status != 'deleted' AND deleted_on IS NULL;
```

- 計數為 0，草稿 14030 元未落庫
- 重開編輯器金額欄空白即符合 R-KR-010

---

## CP-A-17-04 匯入送出前殺 app 無新增

- 時點：步 21 重開後
- 管道：sqlite

```sql
SELECT count(*) FROM transactions
WHERE user_id = '<uid>' AND amount BETWEEN <14040 縮放值> AND <14099 縮放值>
  AND _status != 'deleted' AND deleted_on IS NULL;
SELECT count(*) FROM accounts WHERE user_id = '<uid>' AND created_at > <步20前時戳>
  AND _status != 'deleted' AND deleted_on IS NULL;
SELECT count(*) FROM categories WHERE user_id = '<uid>' AND created_at > <步20前時戳>
  AND _status != 'deleted' AND deleted_on IS NULL;
```

- 三計數皆為 0 即符合 R-KR-004
- 送出前殺 app 不新增帳戶類別與紀錄

---

## CP-A-17-05 匯入寫入中殺 app 不留半套

- 時點：步 22 重開後
- 管道：sqlite

```sql
SELECT count(*) FROM transactions
WHERE user_id = '<uid>' AND amount BETWEEN <14040 縮放值> AND <14099 縮放值>
  AND _status != 'deleted' AND deleted_on IS NULL;
```

- 計數為 0 或等於 CSV 全列數，二者其一即符合 R-KR-003
- 非 0 且非全列即半套，判定失敗
- executeImport 為原子批次，落庫應全有或全無

---

## CP-A-17-06 匯入成功後殺 app 筆數與摘要一致

- 時點：步 23 重開後
- 管道：sqlite 加成功對話框摘要
- 摘要取自`匯入完成`對話框的共匯入與略過重複數字

```sql
SELECT count(*) FROM transactions
WHERE user_id = '<uid>' AND amount BETWEEN <14040 縮放值> AND <14099 縮放值>
  AND _status != 'deleted' AND deleted_on IS NULL;
```

- 存活列數等於摘要共匯入數即符合 R-KR-005
- 若步 22 已全量落庫，本步摘要應顯示全略過，存活列數不變仍算一致

---

## CP-A-17-07 重開首查報表與 DB 對賬無殘留快取

- 時點：步 19 重開後
- 管道：sqlite 加首頁報表數值

```sql
SELECT amount FROM transactions
WHERE user_id = '<uid>' AND amount IN (<14020 縮放值>, <14021 縮放值>)
  AND _status != 'deleted' AND deleted_on IS NULL;
```

- 存活列金額為 14021 縮放值，14020 縮放值不存在
- 首頁報表小計採 14021 元而非殺前 14020 元即符合 R-KR-008

---

## CP-A-17-08 已刪排程實例補產時不重建

- 時點：步 25 重開後
- 管道：sqlite

```sql
SELECT schedule_instance_date, deleted_on, _status FROM transactions
WHERE schedule_id = '<排07 id>'
ORDER BY schedule_instance_date;
```

- 當月 9 日零時對應列 `deleted_on` 非 null 且無同 `schedule_instance_date` 的存活列
- 存活實例仍止於當月 8 日，重開未重建當月 9 日即符合 R-BS-011

---

## CP-A-17-09 時鐘跨期補產冷啟

- 時點：步 28 重開補產後
- 管道：sqlite

```sql
SELECT schedule_instance_date FROM transactions
WHERE schedule_id = '<排07 id>'
  AND _status != 'deleted' AND deleted_on IS NULL
ORDER BY schedule_instance_date;
```

- 存活實例為當月 1 日至當月 25 日每日一筆扣除已刪的當月 9 日
- 最新實例為當月 25 日，無晚於當月 25 日的列即符合 R-BS-009
- 補產自最後實例當月 8 日往後推起於當月 10 日，未重造當月 1 至 8 日即符合 R-BS-007
- 補產於殺 app 重開後發生即符合 R-KR-011
- 步 26 已切差異大時區，實例筆數不受 app 時區影響，以絕對時刻定截止即符合 R-BS-006

---

## CP-A-17-10 前景恢復不補產定期交易

- 時點：步 30 切回前景後
- 管道：sqlite

```sql
SELECT count(*) FROM transactions
WHERE schedule_id = '<排07 id>'
  AND _status != 'deleted' AND deleted_on IS NULL;
```

- 計數與步 28 補產後相同，未新增當月 26 日實例
- 前景恢復跨過排程時刻不補產即符合 R-BS-015

---

## CP-A-17-11 停用帳戶排程補產且不列報表

- 時點：步 32 重開補產後
- 管道：sqlite 加首頁報表數值

```sql
SELECT schedule_instance_date FROM transactions
WHERE schedule_id = '<排07 id>'
  AND _status != 'deleted' AND deleted_on IS NULL
ORDER BY schedule_instance_date DESC LIMIT 3;
```

- 存活實例延伸至下月 20 日止，含當月 26 日至下月 20 日
- 帳戶已停用排程仍補產實例即符合 R-XD-002
- 最新實例為下月 20 日結束日，無下月 21 至 25 日的列
- 首頁當期支出小計不含排07的 14007 元停用帳戶實例即符合 R-XD-003

---

## CP-A-18-01 主題欄缺失回退固定預設

- 時點：步 4 清空 `theme` 並重啟後
- 管道：sqlite

```sql
SELECT theme FROM settings
WHERE user_id = '<uid>';
```

- 重啟後 app 記憶體套用 `theme1`，操作者於畫面確認主題為預設
- `theme` 欄若被 app 回寫則為 `theme1`，若仍空字串則 app 執行期以 `theme1` 解析
- 任一成立即缺失回退固定預設，R-ST-064 過

---

## CP-A-18-02 無實例排程補產生自起始日

- 時點：步 5 注入 `排08` 並重啟補產生後
- 管道：sqlite

```sql
SELECT id, schedule_instance_date, amount, date
FROM transactions
WHERE schedule_id = '<排08_id>' AND _status != 'deleted' AND deleted_on IS NULL
ORDER BY schedule_instance_date ASC;
```

- 最早一列 `schedule_instance_date` 對應上月 5 日零時 UTC 即起點為 `start_on`
- `amount` 為 15070 元縮放值
- 成立即補產生自起始日起算，R-BS-008 與 R-RC-058 過

---

## CP-A-18-03 漂移實例不回溯改寫未來期錨定

- 時點：步 6 漂移最新實例日並二次補產生後
- 管道：sqlite

```sql
SELECT schedule_instance_date, date
FROM transactions
WHERE schedule_id = '<排08_id>' AND _status != 'deleted' AND deleted_on IS NULL
ORDER BY schedule_instance_date ASC;
```

- 被漂移那列 `date` 維持當月 7 日不被回溯改寫
- 二次補產生新增的未來期列日號錨定為 5，不跟隨漂移
- 兩者皆成立即僅未來期套用錨定，R-RC-063 過

---

## CP-A-18-04 搜尋交易與轉帳各自上限五十

- 時點：步 8 搜尋 `K1零用` 後
- 管道：sqlite 與 UI

```sql
SELECT count(*) FROM transactions
WHERE note LIKE '%K1零用%' AND _status != 'deleted' AND deleted_on IS NULL;

SELECT count(*) FROM transfers
WHERE note LIKE '%K1零用%' AND _status != 'deleted' AND deleted_on IS NULL;
```

- 注入計數各 51 筆確認超過上限
- 搜尋結果頁交易區與轉帳區各自最多顯示 50 筆
- 成立即各自上限五十，R-SR-011 過

---

## CP-A-18-05 停用排除後結果可少於上限

- 時點：步 9 搜尋 `K2零用` 後
- 管道：sqlite 與 UI

```sql
SELECT count(*) FROM transactions t
JOIN accounts a ON a.id = t.account_id
WHERE t.note LIKE '%K2零用%'
  AND t._status != 'deleted' AND t.deleted_on IS NULL
  AND a.disabled_on IS NULL;
```

- 注入 51 筆中 20 筆掛停用帳戶，啟用帳戶下計數為 31
- 搜尋交易結果少於 50 筆上限
- 成立即停用排除後可少於上限，R-SR-016 過

---

## CP-A-18-06 匯出以儲存精度輸出

- 時點：步 10 匯出收入支出後
- 管道：匯出檔

```bash
# 取匯出 CSV，定位 15505 縮放值所在列的金額欄
grep -n "$(python3 -c 'print(15505/10000)')" export_transactions.csv
```

- 該列金額以儲存精度輸出，保留細於 JPY 小數位的位數
- 未被截斷為 JPY 預設小數位即依儲存精度輸出，R-IE-076 過

---

## CP-A-18-07 超上限擋新增交易與轉帳

- 時點：步 18 至步 20 於 `LEVEL_0` 超上限點各 FAB 後
- 管道：sqlite 與 UI

```sql
SELECT
  (SELECT count(*) FROM accounts
    WHERE user_id='<uid>' AND _status!='deleted' AND deleted_on IS NULL) AS acc,
  (SELECT count(*) FROM categories
    WHERE user_id='<uid>' AND _status!='deleted' AND deleted_on IS NULL) AS cat;
```

- acc 為 4 超過上限 3 或 cat 為 8 超過上限 7
- 此態下新增支出收入轉帳皆導 PaywallScreen 未寫入
- 成立即總數超上限擋新增交易與轉帳，R-XD-005 過

---

## CP-A-18-08 攔截不改寫啟動設定值

- 時點：步 21 `launch_mode` 為 `expense` 且超上限重啟攔截後
- 管道：sqlite

```sql
SELECT launch_mode FROM settings
WHERE user_id = '<uid>';
```

- 攔截導 PaywallScreen 後 `launch_mode` 仍為 `expense`
- 未被攔截流程改寫即僅攔截當次啟動不改設定值，R-BS-022 過

---

## CP-A-19-1 取消清除後六表資料未變

- 時點：步 8 點 `取消` 後
- 管道：sqlite
- 前置：步 7 前先記錄六表活動列數作為基準

清除前基準與取消後各跑一次，逐表比對

```sql
SELECT
  (SELECT COUNT(*) FROM accounts       WHERE user_id='<當前使用者 id>' AND _status!='deleted' AND deleted_on IS NULL) AS acc,
  (SELECT COUNT(*) FROM categories     WHERE user_id='<當前使用者 id>' AND _status!='deleted' AND deleted_on IS NULL) AS cat,
  (SELECT COUNT(*) FROM transactions   WHERE user_id='<當前使用者 id>' AND _status!='deleted' AND deleted_on IS NULL) AS txn,
  (SELECT COUNT(*) FROM transfers      WHERE user_id='<當前使用者 id>' AND _status!='deleted' AND deleted_on IS NULL) AS trf,
  (SELECT COUNT(*) FROM currency_rates WHERE user_id='<當前使用者 id>' AND _status!='deleted' AND deleted_on IS NULL) AS rate,
  (SELECT COUNT(*) FROM schedules      WHERE user_id='<當前使用者 id>' AND _status!='deleted' AND deleted_on IS NULL) AS sch;
```

- 取消後六欄數值與清除前基準完全相同，符合即 R-IE-010 過
- 任一欄變動即 R-IE-010 不過

---

## CP-A-19-2 確認清除後六表軟刪三表保留

- 時點：步 9 點 `刪除` 見成功框後
- 管道：sqlite

六表活動列歸零，證明批次軟刪

```sql
SELECT
  (SELECT COUNT(*) FROM accounts       WHERE user_id='<當前使用者 id>' AND _status!='deleted' AND deleted_on IS NULL) AS acc,
  (SELECT COUNT(*) FROM categories     WHERE user_id='<當前使用者 id>' AND _status!='deleted' AND deleted_on IS NULL) AS cat,
  (SELECT COUNT(*) FROM transactions   WHERE user_id='<當前使用者 id>' AND _status!='deleted' AND deleted_on IS NULL) AS txn,
  (SELECT COUNT(*) FROM transfers      WHERE user_id='<當前使用者 id>' AND _status!='deleted' AND deleted_on IS NULL) AS trf,
  (SELECT COUNT(*) FROM currency_rates WHERE user_id='<當前使用者 id>' AND _status!='deleted' AND deleted_on IS NULL) AS rate,
  (SELECT COUNT(*) FROM schedules      WHERE user_id='<當前使用者 id>' AND _status!='deleted' AND deleted_on IS NULL) AS sch;
```

軟刪列仍實體留存，deleted_on 已戳記，證明非實體刪除

```sql
SELECT
  (SELECT COUNT(*) FROM accounts       WHERE user_id='<當前使用者 id>' AND deleted_on IS NOT NULL) AS acc_tomb,
  (SELECT COUNT(*) FROM transactions   WHERE user_id='<當前使用者 id>' AND deleted_on IS NOT NULL) AS txn_tomb;
```

users、settings、currency_configs 三表保留

```sql
SELECT
  (SELECT COUNT(*) FROM users            WHERE id='<當前使用者 id>') AS usr,
  (SELECT COUNT(*) FROM settings         WHERE user_id='<當前使用者 id>') AS setting,
  (SELECT COUNT(*) FROM currency_configs WHERE user_id='<當前使用者 id>') AS cfg;
```

- 六表活動列六欄皆為 0，符合即 R-BS-034 過
- 軟刪列 acc_tomb 與 txn_tomb 皆大於 0，符合即 R-BS-036 過
- usr 為 1、setting 為 1、cfg 與清除前相同，符合即 R-BS-038 過
- 六表僅當前使用者列被軟刪且三表完整保留，符合即 R-XD-016 過

---

## CP-A-19-3 登出後備份直接返回

- 時點：步 11 登出回 LoginScreen 後
- 管道：log
- 前置：dev harness 直呼 `syncEngine.sync()`，此時 user 為空值

RN 0.79 device console 走 CDP，於擷取的 console log 檔 grep 三個標記皆 0 命中

```text
grep -c "🔄 [SyncEngine] Starting Sync for User" <console_log>
grep -c "✅ [SyncEngine] Sync Complete!" <console_log>
grep -c "❌ [SyncEngine] Sync Failed" <console_log>
```

- 三個標記皆 0 命中，且 harness 呼叫未 throw
- 無雲端寫入標記代表 user 為空即早退，符合即 R-IE-084 過
- 出現任一標記或 throw 即 R-IE-084 不過

---

## CP-A-19-4 登出後偏好上傳跳過雲端寫入

- 時點：CP-A-19-3 之後
- 管道：log
- 前置：dev harness 直呼 `uploadPreferences('', { launchMode: 'home' })`

於擷取的 console log 檔 grep 兩個標記皆 0 命中

```text
grep -c "✅ [PrefUpload] Preferences uploaded (server acked)" <console_log>
grep -c "❌ [Firestore] Failed to upload preferences" <console_log>
```

- 兩個標記皆 0 命中，且 harness 呼叫未 throw
- 無寫入成功標記亦無錯誤，代表空 uid 早退不報錯，符合即 R-ST-088 過
- 出現任一標記或 throw 即 R-ST-088 不過

---

## CP-A-90-1 定期永不排程結束日為空

- 時點：步 30 建立定期支出後
- 管道：sqlite
- 對象：template_note 為 `定期90` 的排程

排程以 `永不` 儲存時 end_on 應為 null

```sql
SELECT id, template_note, end_on
FROM schedules
WHERE user_id='<當前使用者 id>'
  AND template_note='定期90'
  AND _status!='deleted' AND deleted_on IS NULL;
```

- 命中一列且 end_on 為 NULL，符合即 R-RC-022 過
- end_on 有值即 R-RC-022 不過

---

## CP-A-90-2 僅此一筆更新保留排程欄位

- 時點：步 26 點 `僅此一筆` 後
- 管道：sqlite
- 對象：note 為 `轉帳90` 的轉帳，金額已改 9021 元

更新未帶排程欄位時 schedule_id 與 schedule_instance_date 應保留原值

```sql
SELECT id, note, amount_from, schedule_id, schedule_instance_date
FROM transfers
WHERE user_id='<當前使用者 id>'
  AND note='轉帳90'
  AND _status!='deleted' AND deleted_on IS NULL;
```

- 命中一列，schedule_id 與 schedule_instance_date 皆 NOT NULL，符合即 R-TX-103 過
- 任一欄被清為 NULL 即 R-TX-103 不過
- amount_from 為 90210000，佐證此列即編輯後的 9021 元轉帳

---

## CP-A-90-3 LEVEL_0 匯入使帳戶總數超上限

- 時點：步 41 匯入完成後
- 管道：sqlite
- 前置：步 36 已切 `Mock Tier: Level 0 (Free)`

匯入不經配額判斷，活躍帳戶數應為 5，超過免費上限 3

```sql
SELECT COUNT(*) AS acc
FROM accounts
WHERE user_id='<當前使用者 id>'
  AND _status!='deleted' AND deleted_on IS NULL;
```

- acc 為 5，超過 MAX_FREE_ACCOUNTS 3，符合即 R-XD-007 過
- acc 未超過 3 即匯入被配額攔阻，R-XD-007 不過

---

## CP-A-90-4 匯入越界與缺欄列略過

- 時點：步 40 匯入完成後
- 管道：sqlite
- 對象：匯入檔一四列的落地結果

有效兩列落地，缺金額列與超界列皆略過

```sql
SELECT
  (SELECT COUNT(*) FROM transactions WHERE user_id='<當前使用者 id>' AND note IN ('匯入90','匯入91') AND _status!='deleted' AND deleted_on IS NULL) AS imported,
  (SELECT COUNT(*) FROM transactions WHERE user_id='<當前使用者 id>' AND note='超界'   AND _status!='deleted' AND deleted_on IS NULL) AS over_max,
  (SELECT COUNT(*) FROM transactions WHERE user_id='<當前使用者 id>' AND note='缺金額' AND _status!='deleted' AND deleted_on IS NULL) AS missing_field;
```

- imported 為 2、over_max 為 0，符合即 R-BS-078 過
- imported 為 2、missing_field 為 0，符合即 R-IE-067 過
- over_max 大於 0 代表超界金額落地，R-BS-078 不過
- missing_field 大於 0 代表缺金額列落地，R-IE-067 不過

---

## CP-B-01-01 首登本機 DB 建檔與衍生值

- 時點：帳號一首次登入落首頁後
- 管道：sqlite
- 前置：先自 Firebase console 取帳號一 `users/{uid}` 文件 id，記為 `UID`，供 users.id 比對

users 與 settings 兩表皆無軟刪欄，查詢不加軟刪過濾。

```bash
BUNDLE=com.almightyken0425.susugigiapp
APPDATA=$(xcrun simctl get_app_container booted $BUNDLE data)
DB=$(find "$APPDATA" -name 'watermelon*.db' | head -1)
sqlite3 "$DB" "SELECT id, last_login_at, created_at FROM users;"
sqlite3 "$DB" "SELECT user_id, language, base_currency_id, time_zone, theme, launch_mode, week_start FROM settings;"
```

- users 恰一列且 `id` 等於 `UID` → R-AU-021 R-DM-044 過
- users `last_login_at` 為登入當下 ms 時間戳，接近 now → R-DM-045 過
- settings 恰一列且 `user_id` 等於 `UID` → R-AU-021 印證建 Settings
- settings `base_currency_id` 等於 `392`，即地區日本推導的 `JPY`，非查無時的預設 `901` TWD → R-AU-025 過
- settings `time_zone` 等於裝置時區 `Asia/Tokyo` → R-AU-028 過

---

## CP-B-01-02 首登 Firestore 用戶文件

- 時點：帳號一首次登入落首頁後
- 管道：Firestore console 或 Admin
- 路徑：`users/{UID}`
- 對賬欄位：文件存在性、`uid` `email` `provider` `createdAt` `preferences` 五欄、`preferences` 三項衍生值

`preferences` 為上傳專用不下載，本機 settings 是唯一真相。開場 locale 佈置使衍生值全異於程式寫死預設，故 `preferences` 若呈衍生值即證取本機實際值。

- 程式寫死預設為 language `zh-TW`、currency `TWD`、timezone host 時區
- 本機衍生值為 language `en`、currency `JPY`、timezone `Asia/Tokyo`

判定：

- `users/{UID}` 文件存在 → R-AU-022 過
- 文件含 `uid` `email` `provider` `createdAt` `preferences` 五欄 → R-AU-032 過
- `preferences.currency` 為 `JPY` 且非預設 `TWD` → 印證取實際值
- `preferences.language` 為 `en` 且非預設 `zh-TW` → 印證取實際值
- `preferences.timezone` 為 `Asia/Tokyo` → 三項 preferences 皆本機實際值非寫死預設 → R-AU-033 過

---

## CP-B-02-01 主題逐欄上傳

- 時點：步 3 主題切海洋藍後
- 管道：CDP console log 加 Firestore
- log marker，於 CDP console dump 檔搜尋

```bash
grep -F '[PrefUpload] setter theme = theme2' console_dump.txt
grep -F '[PrefUpload] uploadPreferences' console_dump.txt
```

- Firestore 讀路徑 `users/{uid}`，欄位 `preferences.theme` 與根層 `updatedAt`

- 判定
- `uploadPreferences` log 的 updates 物件僅含 `preferences.theme` 與 `updatedAt` 兩鍵，非整包 preferences 物件，符合 R-ST-089
- `preferences.theme` 值為 `theme2`，setter 委派帶入 theme，符合 R-ST-066

---

## CP-B-02-02 啟動模式上傳

- 時點：步 4 啟動切支出後
- 管道：CDP console log 加 Firestore

```bash
grep -F '[PrefUpload] setter launchMode = expense' console_dump.txt
```

- Firestore 讀 `users/{uid}` 欄位 `preferences.launchMode`

- 判定
- `preferences.launchMode` 值為 `expense`，符合 R-ST-068

---

## CP-B-02-03 貨幣轉 ISO 上傳且貨幣顯示設定不同步

- 時點：步 5 基準貨幣切 JPY 後
- 管道：CDP console log 加 Firestore

```bash
grep -F '[PrefUpload] setter baseCurrencyId' console_dump.txt
```

- Firestore 讀 `users/{uid}`，檢查 `preferences.currency` 值，並確認整份文件無 `currency_configs` 或 decimalPlaces、useThousandsUnit 鏡像

- 判定
- `preferences.currency` 值為字串 `JPY`，非數字 id，setter 委派帶入且轉 ISO 4217，符合 R-ST-072 R-DM-012 R-ST-090
- Firestore 無任何貨幣顯示設定欄位，CurrencyConfig 僅存本地，符合 R-DM-039

---

## CP-B-02-04 語言與主題欄名值直送

- 時點：步 6 語言切 English 後，未還原前
- 管道：CDP console log 加 Firestore

```bash
grep -F '[PrefUpload] setter language = en' console_dump.txt
```

- Firestore 讀 `users/{uid}` 欄位 `preferences.language` 與 `preferences.theme`

- 判定
- `preferences.language` 值為 `en`，setter 委派帶入，符合 R-ST-074
- `preferences.language` 等於本機值 `en` 且 `preferences.theme` 等於本機值 `theme2`，欄名與值皆直送無轉換，符合 R-ST-096

---

## CP-B-02-05 時區欄名值直送

- 時點：步 8 時區切東京後
- 管道：CDP console log 加 Firestore

```bash
grep -F '[PrefUpload] setter timeZone = Asia/Tokyo' console_dump.txt
```

- Firestore 讀 `users/{uid}` 欄位 `preferences.timezone`

- 判定
- 遠端欄位名為 `timezone`，值為 `Asia/Tokyo` 直送，setter 委派帶入，符合 R-ST-076 R-ST-092

---

## CP-B-02-06 週起始上傳

- 時點：步 9 週起始切週一後
- 管道：CDP console log 加 Firestore

```bash
grep -F '[PrefUpload] setter weekStart = monday' console_dump.txt
```

- Firestore 讀 `users/{uid}` 欄位 `preferences.weekStart`

- 判定
- `preferences.weekStart` 值為 `monday`，符合 R-ST-078

---

## CP-B-02-07 分析同意上傳且免費帳號不篩選

- 時點：步 10 分析同意關閉後
- 管道：CDP console log 加 Firestore

```bash
grep -F '[PrefUpload] setter analyticsConsent = false' console_dump.txt
grep -F '[IAP] serverTier' console_dump.txt
```

- Firestore 讀 `users/{uid}` 欄位 `preferences.analyticsConsent`；讀 `entitlements/{uid}` 確認 tier

- 判定
- `preferences.analyticsConsent` 值為 false，opt-out 布林被保留，符合 R-ST-080
- 帳號一為 LEVEL_0 免費帳號，entitlements 無 active 訂閱或 tier 為 0，偏好仍上傳成功，不做 Premium 篩選，符合 R-ST-087

---

## CP-B-02-08 輪改回基準雲端逐欄對賬

- 時點：步 16 七欄全數還原基準後
- 管道：Firestore

- Firestore 讀 `users/{uid}` 全 `preferences` map 與根層 `updatedAt`，逐欄比對基準快照

- 判定
- `preferences` 七欄等於基準，theme `theme1`、launchMode `home`、currency `TWD`、timezone `Asia/Taipei`、weekStart `auto`、language `zh-Hant`、analyticsConsent true，變更後系統確有上傳，符合 R-DM-011
- 根層 `updatedAt` 大於基準快照的 `updatedAt`，每次上傳皆刷新，符合 R-ST-098

---

## CP-B-02-09 偏好上傳不動水位線

- 時點：步 16 後，全部偏好變更完成
- 管道：sqlite 加 CDP console log

```sql
SELECT last_synced_at FROM settings
WHERE user_id = '<uid>' AND _status != 'deleted';
```

```bash
grep -F '[SyncEngine] Sync Complete' console_dump.txt
```

- 判定
- `last_synced_at` 等於基準快照值，未被偏好上傳推進，符合 R-DM-009
- console 無由偏好變更觸發的 SyncEngine 交易備份完成 log，佐證偏好上傳走 `users/{uid}` 文件寫入而非 Delta 備份

---

## CP-B-02-10 BigQuery mirror 排除偏好

- 時點：步 16 後
- 管道：BigQuery mirror

- BigQuery 查該 uid 的鏡像資料集，列出所有欄位

```sql
SELECT column_name FROM `<mirror_dataset>`.INFORMATION_SCHEMA.COLUMNS
WHERE table_name = '<user_mirror_table>';
```

- 判定
- 鏡像 schema 無 language、currency、timezone、theme、launchMode、weekStart、analyticsConsent 等偏好欄，preference 資料未納入 BigQuery mirror，符合 R-ST-101

---

## CP-B-02-11 雲端異值不下載回套本機

- 時點：步 17 注入後，步 18 重啟後
- 管道：Firestore Admin 注入，simctl 重啟，sqlite 對賬
- 注入語句，將雲端鏡像改為異值

```bash
node -e '
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require("./serviceAccount.json")) });
admin.firestore().doc("users/<uid>").set({
  preferences: {
    language: "ja", currency: "JPY", timezone: "Asia/Tokyo",
    theme: "theme2", launchMode: "expense", weekStart: "monday",
    analyticsConsent: false
  }
}, { merge: true }).then(() => process.exit());
'
```

- 重啟指令

```bash
xcrun simctl terminate booted com.almightyken0425.susugigiapp
xcrun simctl launch booted com.almightyken0425.susugigiapp
```

- 重啟後對賬本機 settings

```bash
APP=$(xcrun simctl get_app_container booted com.almightyken0425.susugigiapp data)
DB=$(find "$APP" -name watermelon.db | head -1)
sqlite3 "$DB" "SELECT theme, launch_mode, base_currency_id, time_zone, week_start, language, analytics_consent FROM settings WHERE user_id='<uid>' AND _status != 'deleted';"
```

- 判定
- 本機 settings 仍等基準，theme1、home、901、Asia/Taipei、auto、zh-Hant、1，雲端異值未套回，符合 R-DM-010 R-ST-085
- 重啟後 post-auth 會將本機基準重新上傳覆蓋異值，不影響本機不變的判定

---

## CP-B-02-12 登出保留本機帳務資料

- 時點：步 22 登出導回 LoginScreen 後
- 管道：sqlite

```bash
APP=$(xcrun simctl get_app_container booted com.almightyken0425.susugigiapp data)
DB=$(find "$APP" -name watermelon.db | head -1)
sqlite3 "$DB" "SELECT
  (SELECT COUNT(*) FROM accounts WHERE user_id='<uid>' AND _status!='deleted' AND deleted_on IS NULL),
  (SELECT COUNT(*) FROM categories WHERE user_id='<uid>' AND _status!='deleted' AND deleted_on IS NULL),
  (SELECT COUNT(*) FROM transactions WHERE user_id='<uid>' AND _status!='deleted' AND deleted_on IS NULL),
  (SELECT COUNT(*) FROM transfers WHERE user_id='<uid>' AND _status!='deleted' AND deleted_on IS NULL);"
```

- 判定
- 四表筆數與登出前一致，含步 19 新增的 3201 元支出，登出不清除也不軟刪本機資料，符合 R-AU-009 R-BS-024

---

## CP-B-02-13 登出後授權旗標與報表快取

- 時點：步 22 登出後
- 管道：CDP console log

```bash
grep -F 'setIsPremiumLoaded' console_dump.txt
grep -F '[IAP]' console_dump.txt
```

- 判定
- signOut 路徑不觸及 isPremiumLoaded，console 無將其重置為 false 的軌跡，登出後維持 true，符合 R-DM-051
- signOut 於 finally 呼叫 periodDataStore.clearCache，報表快取清空；佐證為重登後首頁報表為未命中重建而非命中前帳號 entry，符合 R-HR-124

---

## CP-B-02-14 重登不下載全量上傳覆寫

- 時點：步 23 再注入後，步 24 重登後
- 管道：Firestore Admin 注入，CDP console log，Firestore 與 sqlite 對賬
- 重登前再注入異值

```bash
node -e '
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require("./serviceAccount.json")) });
admin.firestore().doc("users/<uid>").set({
  preferences: {
    language: "ja", currency: "JPY", timezone: "Asia/Tokyo",
    theme: "theme2", launchMode: "expense", weekStart: "monday",
    analyticsConsent: false
  }
}, { merge: true }).then(() => process.exit());
'
```

- 重登後 log marker

```bash
grep -F '[PrefUpload] handlePostAuth: remote doc EXISTS' console_dump.txt
grep -F '[PrefUpload] buildPreferencesFromLocal' console_dump.txt
grep -E '\[SyncEngine\] (Starting Sync|Sync cooldown active|Sync Complete)' console_dump.txt
```

- 重登後對賬本機 settings 與雲端 preferences

```bash
APP=$(xcrun simctl get_app_container booted com.almightyken0425.susugigiapp data)
DB=$(find "$APP" -name watermelon.db | head -1)
sqlite3 "$DB" "SELECT theme, launch_mode, base_currency_id, time_zone, week_start, language, analytics_consent FROM settings WHERE user_id='<uid>' AND _status != 'deleted';"
```

- Firestore 讀 `users/{uid}.preferences` 七欄

- 判定
- 本機 settings 重登後仍等基準，雲端注入的異值未套回本機，符合 R-AU-024
- handlePostAuth 走 remote doc EXISTS 分支，buildPreferencesFromLocal log 列出七欄本機實際值，符合 R-AU-012 R-ST-100
- Firestore `preferences` 重登後被覆寫回基準值，非注入的異值，本機實際值覆寫雲端，符合 R-AU-023
- SyncEngine 出現 Starting Sync、cooldown skip 或 Sync Complete 任一 log，證重登委派 runBackup，符合 R-AU-013

---

## CP-B-03-01 初次全量備份觸發與路由

- 時點：步驟 4 清空雲端後冷啟動備份完成
- 管道：log 與 Firestore console read 計量

```text
grep marker（依序出現）
🔄 [SyncEngine] Starting Sync for User:
📦 [SyncEngine] Running InitialBackup (full upload)...
✅ [SyncEngine] InitialBackup complete.
✅ [SyncEngine] Sync Complete!
```

- 探測路由印證，無獨立 log 走間接證

```text
Firestore console 的 users/{uid}/transactions 讀取計量本次為 1
```

- 出現 `Starting Sync` 且啟動即觸發，無手動介入：R-BS-012 過
- 遠端六集合已清空、探測 transactions 取回空，走 InitialBackup 非 Delta，console 顯示該探測僅 1 筆讀取：R-IE-092 過
- 落 `Running InitialBackup (full upload)` 且完成：R-IE-094 過

---

## CP-B-03-02 初次備份寫入計數只計寫不計讀

- 時點：CP-B-03-01 備份完成後
- 管道：log 與 AsyncStorage manifest

```text
grep marker
✅ [SyncEngine] Total Pushed: <N> changes.
```

- 讀 sync_quota_writes 跑 S4

```bash
xcrun simctl terminate booted $BUNDLE
python3 - "$MANIFEST" <<'PY'
import json,sys
d=json.load(open(sys.argv[1]))
print('writes', d.get('sync_quota_writes'))
PY
```

- 對賬本機六集合活躍列總數，跑各表

```sql
SELECT
 (SELECT count(*) FROM accounts       WHERE _status!='deleted' AND deleted_on IS NULL)
+(SELECT count(*) FROM categories     WHERE _status!='deleted' AND deleted_on IS NULL)
+(SELECT count(*) FROM transactions   WHERE _status!='deleted' AND deleted_on IS NULL)
+(SELECT count(*) FROM transfers      WHERE _status!='deleted' AND deleted_on IS NULL)
+(SELECT count(*) FROM currency_rates WHERE _status!='deleted' AND deleted_on IS NULL)
+(SELECT count(*) FROM schedules      WHERE _status!='deleted' AND deleted_on IS NULL) AS total;
```

- `Total Pushed` 的 N 等於本機六集合列總數：R-IE-100 過、R-AU-079 過
- sync_quota_writes 值等於 N 且不含探測讀取加成：R-AU-082 過、R-AU-083 過

---

## CP-B-03-03 雲端六集合與本機一致

- 時點：CP-B-03-01 備份完成後
- 管道：Firestore console 六集合逐集合與 sqlite 對賬

```text
Firestore 路徑，逐集合比對文件 id 與筆數（排除 deletedOn 非空文件）
users/{uid}/accounts
users/{uid}/categories
users/{uid}/transactions
users/{uid}/transfers
users/{uid}/currency_rates
users/{uid}/schedules
```

- 本機逐表活躍 id 清單，六表各跑一次替換表名

```sql
SELECT id FROM transactions WHERE _status!='deleted' AND deleted_on IS NULL ORDER BY id;
```

- 跨幣別轉帳文件欄位檢查

```text
users/{uid}/transfers/{轉帳 id}
需含欄位 impliedRateScaled，型別數值
不得出現欄位 implied_rate
```

- 六集合寫入路徑為 `users/{uid}/{collection}`：R-IE-079 過
- 各集合雲端活躍 id 集合與本機一致、無漏無多：R-IE-098 過
- 帳號一為 LEVEL_0 且步驟 2 已關分析同意，備份仍產生六集合文件：R-IE-080 過
- 跨幣別轉帳文件以 `impliedRateScaled` 承載匯率、無 `implied_rate`：R-DM-034 過

---

## CP-B-03-04 lastSyncedAt 與裝置冷卻戳更新

- 時點：CP-B-03-01 備份完成後
- 管道：sqlite 與 AsyncStorage manifest

```sql
SELECT last_synced_at FROM settings WHERE user_id = '<uid>';
```

```bash
xcrun simctl terminate booted $BUNDLE
python3 - "$MANIFEST" <<'PY'
import json,sys
d=json.load(open(sys.argv[1]))
print('sync_last_at', d.get('sync_last_at'))
PY
```

- settings.last_synced_at 為非空且接近備份當下 ms：R-IE-101 過、R-DM-007 過
- manifest 的 sync_last_at 存在且接近當下 ms，屬裝置層級鍵：R-IE-087 過

---

## CP-B-03-05 冷卻返回且跨重啟不重置

- 時點：步驟 5 五分鐘內再冷啟動後
- 管道：log 與 manifest

```text
grep marker
⏱️ [SyncEngine] Sync cooldown active, skipping.
```

- 反向確認本次不得出現

```text
不得出現 📦 [SyncEngine] Running InitialBackup
不得出現 ✅ [SyncEngine] Total Pushed
```

- 讀 sync_last_at 與上輪比對

```bash
xcrun simctl terminate booted $BUNDLE
python3 - "$MANIFEST" <<'PY'
import json,sys
d=json.load(open(sys.argv[1]))
print('sync_last_at', d.get('sync_last_at'))
PY
```

- 距上次備份未滿 5 分鐘落 cooldown active 直接返回、無上傳：R-IE-086 過
- 重啟後 sync_last_at 仍為前一輪值、冷卻續生效：R-IE-088 過

---

## CP-B-03-06 重新登入增量備份僅傳變更

- 時點：步驟 7 至 10 建 3300 至 3304 後觸發備份完成
- 管道：log 與 Firestore console

```text
grep marker
📊 [SyncEngine] Found <M> changes since <ts>
✅ [SyncEngine] Total Pushed: <M> changes.
```

- 反向確認不得走全量

```text
不得出現 📦 [SyncEngine] Running InitialBackup
```

- 雲端新增文件核對，依金額識別

```text
users/{uid}/transactions 出現 amountCents 對應 3300 3301 3302 三筆新文件
users/{uid}/transfers    出現 amountFromCents 對應 3303、amountToCents 對應 3304 一筆
```

- 遠端已有資料，本輪走 Delta 非 InitialBackup：R-IE-095 過、R-IE-083 過
- Found 的 M 僅涵蓋 lastSyncedAt 之後變更的六集合列、等於本輪新建 4 筆：R-IE-102 過

---

## CP-B-03-07 冪等重傳與無變更跳過

- 時點：步驟 11 進 6 分鐘後重觸備份
- 管道：Firestore console 與 log 與 sqlite

```text
第一次重觸（步驟 11 進 6 分後有效冷卻已過，但自上次備份無新增列）
grep marker 不得出現 ✅ [SyncEngine] Total Pushed
Firestore 六集合文件總數與 CP-B-03-06 後相同、無重複 id
```

```sql
SELECT last_synced_at FROM settings WHERE user_id = '<uid>';
```

- 對同一批資料重傳採 upsert、雲端文件 id 不新增不重複：R-IE-097 過
- 本輪無新增列，跳過上傳且 settings.last_synced_at 維持前值不前移：R-IE-103 過

---

## CP-B-03-08 前景恢復委派備份與刷新訂閱

- 時點：步驟 12 建 3305 後退前景回來
- 管道：log 與 Firestore console 與 manifest

```text
grep marker（前景 active 後）
🔄 [SyncEngine] Starting Sync for User:
✅ [SyncEngine] Total Pushed: 1 changes.
[IAP] reconcile：StoreKit LEVEL_1 購買數 =
```

- 前景後改偏好驗配額不動

```text
先讀 sync_quota_writes 記為 W0
設定頁切換 主題 觸發偏好上傳
再讀 sync_quota_writes 應仍為 W0
```

```bash
xcrun simctl terminate booted $BUNDLE
python3 - "$MANIFEST" <<'PY'
import json,sys
d=json.load(open(sys.argv[1]))
print('writes', d.get('sync_quota_writes'))
PY
```

- 前景恢復委派 runBackup、上傳 3305 一筆：R-BS-013 過
- 前景恢復觸發 reconcile 刷新訂閱狀態、落 reconcile marker：R-BS-014 過
- 偏好上傳前後 sync_quota_writes 不變、preference 上傳不計配額：R-AU-084 過

---

## CP-B-03-09 配額封頂禁止批次上傳

- 時點：步驟 13 建 3306、步驟 14 注入配額 2000 後冷啟動
- 管道：log 與 Firestore console

```text
grep marker
⚠️ [SyncEngine] Write quota exceeded; L3 skipped until next UTC+0 reset.
```

- 反向確認未上傳

```text
不得出現 ✅ [SyncEngine] Total Pushed
Firestore users/{uid}/transactions 無 amountCents 對應 3306 文件
```

```sql
SELECT last_synced_at FROM settings WHERE user_id = '<uid>';
```

- 當日寫入達 2000 上限，checkQuota canWrite 為否、批次寫入被禁：R-AU-080 過
- 配額禁止時跳過本次上傳、等跨日重置、settings.last_synced_at 不前移：R-IE-091 過、R-OF-005 過

---

## CP-B-03-10 跨 UTC 日界計數歸零後恢復

- 時點：步驟 15 進時鐘一日後冷啟動備份完成
- 管道：manifest 與 log 與 Firestore console

```text
grep marker
✅ [SyncEngine] Total Pushed: <K> changes.
✅ [SyncEngine] Sync Complete!
```

```bash
xcrun simctl terminate booted $BUNDLE
python3 - "$MANIFEST" <<'PY'
import json,sys,datetime
d=json.load(open(sys.argv[1]))
print('quota_date', d.get('sync_quota_date'))
print('writes', d.get('sync_quota_writes'))
print('utc_today', datetime.datetime.utcnow().strftime('%Y-%m-%d'))
PY
```

```text
Firestore users/{uid}/transactions 出現 amountCents 對應 3306 文件
```

- sync_quota_date 更新為跨日後新 UTC 日期、sync_quota_writes 自 2000 歸零後再累加本輪 K 筆、待傳 3306 上傳成功：R-AU-081 過

---

## CP-B-04-01 600 筆全量 Delta 上傳且每批上限 500

- 時點：步 6 冷啟備份完成後
- 管道：log 與 Firestore
- log 抓兩個 marker，全量 Delta 走 since 為 0、每批提交上限 500

```bash
xcrun simctl spawn booted log stream --level debug \
  --predicate 'eventMessage CONTAINS "[SyncEngine]"' &
```

- grep marker `📊 [SyncEngine] Found` 該行結尾為 `since 0`
- grep marker `🚀 [SyncEngine] Committed batch of 500 writes.`
- Firestore 讀 `users/UID/transactions` 集合筆數

判定

- 見 `Found 6NN changes since 0` 即遠端有資料且 lastSyncedAt 空走全量 Delta，R-IE-096 過
- 見至少一行 `Committed batch of 500 writes.` 即分批上限 500，R-IE-099 過
- Firestore transactions 較注入前多 600 筆，佐證上傳落地

---

## CP-B-04-02 備份進行中重入直接返回

- 時點：步 6 同一次冷啟 log 視窗內
- 管道：log
- 冷啟時登入後備份與前景恢復兩觸發並發，第二次進 sync 撞單飛閘

```bash
xcrun simctl spawn booted log show --last 3m \
  --predicate 'eventMessage CONTAINS "Sync already in progress"'
```

判定

- 見 `🔄 [SyncEngine] Sync already in progress, skipping.` 即重入直接返回，R-IE-085 過
- 未見該行需以更大 600 筆延長備份重跑冷啟再抓

---

## CP-B-04-03 偏好非法值上傳前正規化

- 時點：步 11 重登觸發全量偏好上傳後
- 管道：log 與 Firestore
- 上傳前經 localToUploadValue 正規化，log 印出送上傳的偏好物件

```bash
xcrun simctl spawn booted log show --last 5m \
  --predicate 'eventMessage CONTAINS "[PrefUpload] buildPreferencesFromLocal"'
```

- 再讀 Firestore `users/UID` 文件 preferences map 各欄

判定

- log 物件不含 `currency` 鍵，且 Firestore preferences.currency 維持前值未被非法覆寫，即幣別無法解析略過，R-ST-091 過
- Firestore preferences.launchMode 為 `home`，即非法 launchMode 正規化，R-ST-093 過
- Firestore preferences.weekStart 為 `auto`，即非法 weekStart 正規化，R-ST-094 過
- Firestore preferences.analyticsConsent 為 true，即 Null 視為 true，R-ST-095 過
- log 物件不含 `timezone` 鍵，且 preferences.timezone 未被寫空，即空值略過不寫入，R-ST-097 過

---

## CP-B-04-04 注入 Entitlement 即時更新等級並寫快取

- 時點：步 12 注入 entitlements 文件後
- 管道：log 與 AsyncStorage
- onSnapshot 收到文件即更新 serverTier 並存快取

```bash
xcrun simctl spawn booted log show --last 3m \
  --predicate 'eventMessage CONTAINS "[IAP] serverTier"'

CACHE="$CONTAINER/Documents/RCTAsyncLocalStorage_V1/manifest.json"
python3 - "$CACHE" <<'PY'
import json, sys
d = json.load(open(sys.argv[1]))
for k, v in d.items():
    if k.startswith('premium_status_cache_'):
        print(k, v)
PY
```

判定

- 見 `[IAP] serverTier ← 1 ( active )` 即後端 Entitlement 即時更新本機等級，R-AU-052 過
- AsyncStorage 有鍵 `premium_status_cache_UID`，其 JSON tier 為 1、expirationDate 為注入的未來時戳，即等級與到期日寫入當前帳號授權快取，R-AU-053 過

---

## CP-B-04-05 entitlements client 寫入遭安全規則拒絕

- 時點：步 17 取得 ID token 後
- 管道：Firestore REST
- entitlements 文件 allow write 為 false，client 帶合法 token 仍不得寫

```bash
curl -s -X PATCH \
  "https://firestore.googleapis.com/v1/projects/susugigi-c4fb1/databases/(default)/documents/entitlements/UID?updateMask.fieldPaths=tier" \
  -H "Authorization: Bearer ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fields":{"tier":{"integerValue":"2"}}}'
```

判定

- 回應 HTTP 403，body status 為 PERMISSION_DENIED，即 Entitlement client 唯讀寫入限伺服器，R-DM-063 過

---

## CP-B-04-06 未登入呼叫 verifyTransaction 拒絕

- 時點：步 17 之後
- 管道：Cloud Functions callable curl
- 不帶 Authorization header 呼叫 callable

```bash
curl -s -X POST \
  "https://us-central1-susugigi-c4fb1.cloudfunctions.net/verifyTransaction" \
  -H "Content-Type: application/json" \
  -d '{"data":{"signedTransaction":"dummy"}}'
```

判定

- 回應 error status 為 UNAUTHENTICATED，訊息為登入後才能驗證購買，即未登入拒絕請求，R-AU-085 過

---

## CP-B-04-07 Apple 簽章驗證失敗拒絕

- 時點：步 17 之後
- 管道：Cloud Functions callable curl
- 帶合法 ID token 但送偽造 signedTransaction，簽章驗證先於原始編號檢查

```bash
curl -s -X POST \
  "https://us-central1-susugigi-c4fb1.cloudfunctions.net/verifyTransaction" \
  -H "Authorization: Bearer ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"data":{"signedTransaction":"forged.header.payload"}}'
```

- 對賬 Firestore `entitlements/UID` 是否被本次請求改動

判定

- 回應為 error 非成功 tier，且 entitlements 文件未因本次呼叫變動，即 Apple 簽章驗證失敗拒絕請求，R-AU-086 過

---

## CP-B-04-08 刪 Entitlement 後授權快取維持 LEVEL_1

- 時點：步 19 刪 entitlements 文件後
- 管道：log 與 AsyncStorage 與 UI
- 空快照不直接降 LEVEL_0，改以快取推定等級

```bash
xcrun simctl spawn booted log show --last 2m \
  --predicate 'eventMessage CONTAINS "尚無文件"'

CACHE="$CONTAINER/Documents/RCTAsyncLocalStorage_V1/manifest.json"
python3 - "$CACHE" <<'PY'
import json, sys
d = json.load(open(sys.argv[1]))
for k, v in d.items():
    if k.startswith('premium_status_cache_'):
        print(k, v)
PY
```

判定

- 見 `[IAP] entitlement 快照：尚無文件` 且 SettingsScreen 升級至 Premium 列仍不顯示，即無 Entitlement 不直接降 LEVEL_0 以快取推定等級，R-AU-054 過
- 快取鍵 `premium_status_cache_UID` tier 仍為 1，作為 B-05 前置狀態

---

## CP-B-05-01 離線交易落地且水位線凍結

- 時點：步 2 之後，步 3 之前
- 管道：sqlite
- baseline：場首先讀一次 `last_synced_at` 記為 B，供本檢查點比對

```sql
SELECT amount, date, created_at FROM transactions
WHERE _status != 'deleted' AND deleted_on IS NULL
ORDER BY created_at DESC LIMIT 5;

SELECT last_synced_at FROM settings;
```

- 見一列 `amount` 為 `-35000000`，即 `3500` 元支出，scale `×10000` 支出取負
- `last_synced_at` 等於 baseline B，未前移
- 該交易 `created_at` 大於 B，屬未同步的離線新增
- 符合即 R-OF-002 過，並佐證 R-OF-001 本機落地

---

## CP-B-05-02 離線備份跳過不崩潰

- 時點：步 3 之後
- 管道：log，Metro 或裝置 console

```text
grep marker: 📴 [SyncEngine] Offline, skipping sync.
```

- 見該 marker，代表離線守衛攔下備份未進 commit
- app 未閃退，冷啟動後停在首頁
- 後續步 6 線上備份能成功，證明可重試
- 符合即 R-IE-104 過

---

## CP-B-05-03 離線偏好寫入不阻塞僅記 log

- 時點：步 4 之後
- 管道：sqlite 與 log

```sql
SELECT launch_mode, updated_on FROM settings;
```

```text
grep marker 應現: 🔍 [PrefUpload] uploadPreferences →
grep marker 應缺: ✅ [PrefUpload] Preferences uploaded
grep marker 應缺: ❌ [Firestore] Failed to upload preferences
```

- `launch_mode` 為 `expense`，本機即時寫入，UI 未阻塞
- 見上傳嘗試 marker，未見 ack 也未見錯誤 marker
- 離線寫入掛起不 settle，故不 ack 不拋錯，僅嘗試
- rules 拒寫才會出現 `❌` marker，離線僅掛起，屬 impl 已知行為
- 符合即 R-OF-014 與 R-ST-099 過

---

## CP-B-05-04 恢復連線 Delta 補上雲

- 時點：步 6 之後
- 管道：sqlite 與 Firestore

```sql
SELECT last_synced_at FROM settings;
```

- Firestore 讀 `users/<uid>/transactions`
- 找 `amount` 為 `-35000000` 的文件

判定：

- Firestore transactions 集合含該 `3500` 交易文件
- `last_synced_at` 已前移，大於 baseline B
- 符合即 R-OF-003 過

---

## CP-B-05-05 同帳號重登補跑偏好全量與備份

- 時點：步 18 之後
- 管道：Firestore

- 讀 `users/<uid>` 文件
- 根層 `updatedAt` 較重登前前移
- `preferences.launchMode` 為 `expense`，證明全量偏好上傳
- 讀 `users/<uid>/transactions` 子集合
- 含 `amount` 為 `-35010000` 與 `-35020000` 的文件，即離線期 `3501` 與 `3502`

判定：

- 偏好全量上傳且交易備份補跑上述兩筆
- 符合即 R-OF-015 過

---

## CP-B-06-01 換帳號保留兩帳號並存

- 時點：步 9 選保留進首頁後
- 管道：sqlite `watermelon.db`

```sql
SELECT user_id, COUNT(*) FROM accounts
WHERE _status != 'deleted' AND deleted_on IS NULL
GROUP BY user_id;
SELECT user_id, COUNT(*) FROM transactions
WHERE _status != 'deleted' AND deleted_on IS NULL
GROUP BY user_id;
SELECT id FROM users WHERE _status != 'deleted';
```

- `uid1` 與 `uid2` 兩列並存，資料庫保存所有曾登入帳號資料，符合 R-BS-023
- 帳號一 marker 3601 3602 仍在 `uid1` 名下未被清，選保留直接繼續，符合 R-AU-018
- 對話框曾明示兩選項未自動清除，資料未消失，符合 R-AU-014

---

## CP-B-06-02 清單查詢與報表快取帳號隔離

- 時點：步 12 帳號二建交易 3702 後
- 管道：sqlite 對賬加操作者看畫面

```sql
SELECT amount, user_id FROM transactions
WHERE _status != 'deleted' AND deleted_on IS NULL
ORDER BY amount;
```

- 帳號二首頁與清單僅顯金額 3702，帳號一 marker 3601 3602 不現，清單查詢以 `userId` 限定，符合 R-BS-025
- sqlite 同時存在 `uid1` 的 3601 3602 與 `uid2` 的 3702，但畫面只讀當前帳號
- 報表快取鍵含當前使用者維度，帳號一預載數字未被帳號二讀到，符合 R-HR-108

---

## CP-B-06-03 補產生依 userId 過濾

- 時點：步 14 重啟補產生後
- 管道：sqlite 對賬

```sql
SELECT user_id, schedule_id, COUNT(*) FROM transactions
WHERE _status != 'deleted' AND deleted_on IS NULL
  AND schedule_id IS NOT NULL
GROUP BY user_id, schedule_id;
```

- `B6-S1` 起始日在上月 1 日過去點，補產生為 `uid2` 建至少一筆排程實例
- 新增排程實例 `user_id` 皆為 `uid2`，帳號一排程未於本輪被補產生，符合 R-RC-055
- 判定：對照基準快照帳號一排程實例數未增

---

## CP-B-06-04 備份冷卻裝置層級換帳號不重置

- 時點：步 14 重啟後
- 管道：log 對賬加 AsyncStorage 讀取加 Firestore

```text
CDP console grep marker：⏱️ [SyncEngine] Sync cooldown active, skipping.
```

```text
AsyncStorage 讀 sync_last_at 值，比對步 6 帳號一備份寫入的時間戳應相同
```

```text
Firestore 讀 users/{uid2}/accounts 應為空或不含 B6-01
```

- 步 6 帳號一備份寫 `sync_last_at`，5 分鐘內換帳號未重置冷卻
- 步 14 帳號二重啟的備份因冷卻未滿被跳過，log 印冷卻 marker，符合 R-XD-019
- `sync_last_at` 屬裝置層級跨帳號共用，切換後值未歸零，帳號二資料尚未上雲，符合 R-IE-089

---

## CP-B-06-05 per-user 水位線獨立

- 時點：步 15 清 `sync_last_at` 強制帳號二備份後
- 管道：sqlite 對賬加 log

```sql
SELECT user_id, last_synced_at FROM settings
WHERE _status != 'deleted';
```

```text
CDP console grep marker：✅ [SyncEngine] Sync Complete!
```

- `settings` 表 `uid1` 與 `uid2` 各一列，兩者 `last_synced_at` 皆非 Null 且數值互異
- `last_synced_at` 為 per-user 各帳號獨立水位線非裝置層級，符合 R-IE-090
- 判定：帳號二備份完成後其列水位線推進，帳號一列水位線不受影響

### 佈置指令參照

```bash
# 前景重啟 app, 步 4 步 14 步 15 步 21 共用
xcrun simctl terminate booted com.almightyken0425.susugigiapp
xcrun simctl launch booted com.almightyken0425.susugigiapp

# 清 sync_last_at 繞冷卻, 步 6 步 15 步 21
CONTAINER=$(xcrun simctl get_app_container booted com.almightyken0425.susugigiapp data)
MANIFEST="$CONTAINER/Documents/RCTAsyncLocalStorage_V1/manifest.json"
jq 'del(.sync_last_at)' "$MANIFEST" > "$MANIFEST.tmp" && mv "$MANIFEST.tmp" "$MANIFEST"
```

---

## CP-B-06-06 偏好後寫覆前寫

- 時點：步 16 帳號二兩度改主題後
- 管道：Firestore

```text
Firestore 讀 users/{uid2}
  preferences.theme 應為最後一次寫入 theme1 經典紫對應值
  非中途 Admin 注入的異值
根層 updatedAt 已推進
```

- 各次偏好變更各自上傳，最後寫入覆寫前值，`preferences` 只存最新值，符合 R-DM-013
- 判定：中途 Admin 注入的異值被帳號二後續上傳覆蓋，雲端無合併殘留

---

## CP-B-06-07 匯入不經配額超上限

- 時點：步 18 匯入完成後
- 管道：sqlite 對賬

```sql
SELECT COUNT(*) FROM accounts
WHERE user_id = '<uid2>'
  AND _status != 'deleted' AND deleted_on IS NULL;
```

- 帳號二帳戶總數為 5，含手建 `B6-01` 與匯入 `B6-02` 至 `B6-05`
- 匯入路徑不經配額判斷，總數超過 LEVEL_0 上限 3，符合 R-AU-073
- 判定：全部 4 筆匯入帳戶皆寫入，無因上限被擋

### 佈置 CSV 內容參照

```text
帳戶,日期,類別,金額,備註
B6-02,上月 5 日,B6-C1,3711,匯入甲
B6-03,上月 5 日,B6-C1,3712,匯入乙
B6-04,上月 5 日,B6-C1,3713,匯入丙
B6-05,上月 5 日,B6-C1,3714,匯入丁
```

- 帳戶欄填不存在的新帳戶名，匯入時新建帳戶
- 匯入精靈帳戶對應步驟的既有帳戶下拉僅列帳號二的 `B6-01`，不含帳號一帳戶，符合主表格步 18 的 R-IE-036

---

## CP-B-06-08 換帳號授權不沿用降 LEVEL_0

- 時點：步 19 帳號二點支出鍵導 Paywall 後
- 管道：log 對賬加 Firestore

```text
CDP console grep 帳號二 tier 解析日誌，runtime tier 應為 LEVEL_0
Firestore 讀 entitlements/{uid2} 應不存在
```

- 帳號二無 entitlement 文件，runtime tier 落 LEVEL_0，未沿用帳號一 LEVEL_2，符合 R-AU-068
- 判定：帳號二超上限點支出鍵導 PaywallScreen，證實為免費等級

### 帳號一授權注入參照

```text
Admin 寫 entitlements/{uid1}
  tier: 2
  status: "active"
  expires_date: 未來時間戳 ms
  updated_on: 當下時間戳 ms
```

---

## CP-B-06-09 重置僅當前帳號軟刪傳播雲端

- 時點：步 20 帳號二重置且步 21 備份後
- 管道：sqlite 對賬加 Firestore

```sql
-- 帳號二記錄應全數帶墓碑
SELECT COUNT(*) FROM accounts WHERE user_id = '<uid2>' AND deleted_on IS NOT NULL;
SELECT COUNT(*) FROM transactions WHERE user_id = '<uid2>' AND deleted_on IS NOT NULL;
-- 帳號一記錄墓碑欄應仍為 Null
SELECT COUNT(*) FROM accounts WHERE user_id = '<uid1>' AND deleted_on IS NULL AND _status != 'deleted';
SELECT COUNT(*) FROM transactions WHERE user_id = '<uid1>' AND deleted_on IS NULL AND _status != 'deleted';
```

```text
Firestore 讀 users/{uid2}/accounts 各文件 deletedOn 欄應非 Null
Firestore 讀 users/{uid1}/accounts 各文件 deletedOn 欄應仍 Null
```

- 重置只標記 `uid2` 記錄六表軟刪，帳號一 `uid1` 記錄未動，符合 R-BS-035 與 R-XD-017
- 重置採軟刪帶 `deleted_on` 墓碑非硬刪，備份把墓碑傳播成雲端刪除標記，符合 R-BS-037 與 R-XD-018
- 判定：帳號一本機與雲端資料在帳號二重置後完好

---

## CP-B-06-10 換帳號清除硬重置重建新帳號

- 時點：步 25 帳號一登入選清除後
- 管道：sqlite 對賬

```sql
SELECT id FROM users WHERE _status != 'deleted';
SELECT user_id, COUNT(*) FROM settings WHERE _status != 'deleted' GROUP BY user_id;
SELECT COUNT(*) FROM accounts;
SELECT COUNT(*) FROM transactions;
```

- 清除採硬重置整庫清空，`users` 僅剩重建的 `uid1` 一列，不分 `userId` 全清，符合 R-AU-015 與 R-XD-013
- 帳號二 `uid2` 全部記錄連同步 22 未上傳 marker 一併硬刪不留墓碑
- 清除後重建帳號一 User 與 Settings 新種值，`settings` 中 `uid1` 一列且 `last_synced_at` 為 Null，符合 R-AU-019
- 判定：`accounts` 與 `transactions` 硬刪後不含任何墓碑列

---

## CP-B-06-11 換帳號清除的雲端與快取邊界

- 時點：步 25 選清除後
- 管道：Firestore 加 AsyncStorage 讀取

```text
Firestore 讀 users/{uid1} 六集合文件數，比對基準快照與帳號一 marker 上傳後應完整保留
Firestore 讀 users/{uid2} 六集合，除步 21 傳播的重置墓碑外無新增刪除標記
Firestore 讀 users/{uid2}/accounts 不含步 22 未上傳的新 B6-01 active 列
```

```bash
CONTAINER=$(xcrun simctl get_app_container booted com.almightyken0425.susugigiapp data)
MANIFEST="$CONTAINER/Documents/RCTAsyncLocalStorage_V1/manifest.json"
# 前帳號快取應已清、當前帳號快取應留
jq 'has("premium_status_cache_<uid2>")' "$MANIFEST"   # 期望 false
jq 'has("premium_status_cache_<uid1>")' "$MANIFEST"   # 期望 true
```

- 清除未傳播雲端刪除標記，帳號一雲端六集合完整保留，帳號二雲端資料不因清除被動，符合 R-AU-016
- 清除連帶清前帳號 `premium_status_cache_<uid2>`，當前帳號 `premium_status_cache_<uid1>` 未動，符合 R-AU-017 與 R-XD-015
- 步 22 冷卻內新建的 B6-01 在清除前未先行備份即被硬刪，雲端無此列，觀察 spec 未明定行為為不先備份，符合 R-XD-014

### 帳號二快取注入與授權清除參照

```text
Admin 寫 AsyncStorage premium_status_cache_<uid2>
  值為 JSON 字串 含 tier 與 expirationDate
```

```text
Admin 刪 entitlements/{uid1} 與 entitlements/{uid2}，兩帳號授權回 LEVEL_0
```

---

## CP-B-90-01 帳號三首登語系 Locale 推導對賬

- 時點 步驟 6 帳號三首登進首頁後
- 管道 sqlite 對賬加設定頁 UI 觀測
- uid 來源 帳號三登入後 `settings` 表最新一列的 `user_id`，或 Debug Info by Account 頁讀取，記為 `uid3`
- 對賬對象 模擬器 `watermelon.db`

sqlite 讀取

```sql
SELECT user_id, language
FROM settings
WHERE user_id = '<uid3>'
  AND _status != 'deleted';
```

- 規則原意
    - R-AU-026 稱首登語系從 Locale 推導比對支援清單匹配則採該語系
    - 裝置語言於步驟 2 設為日本語，日本語為支援清單成員
- 實測必得
    - `language` 為 `ja`
    - 非帳號一原語系，非 fallback `en`
- UI 佐證
    - 帳號三首登後進設定頁
    - 項目顯日語假名 `環境設定` `データ管理` `サインアウト`
    - 非繁中 `偏好設定` `資料管理` `登出`
    - 佐證 `settings.language` 已驅動 `i18n.locale`
- 對照組
    - 步驟 3 帳號一在裝置已日語時 UI 仍非日語
    - 佐證 UI 語言取 `settings.language` 非裝置 locale
    - 帳號三差別僅在首登以 locale 種入 `ja`
- 判定
    - `language` 為 `ja` 且 UI 日語即 R-AU-026 通過
    - 計入 coveredIds

---

## CP-C-01-01 查無可還原的後端佐證

- 時點：步 10 見 `沒有可恢復的購買項目` 之後
- 管道：Firestore 加 Cloud Functions log 加 sqlite 加 key-value
- 前提：`<C1_uid>` 為 C1 的 Firebase Auth UID

Firestore 授權文件：

```
路徑 entitlements/{C1_uid}
欄位 tier expires_date status
```

sqlite users 表 IAP 快照，users 無軟刪欄：

```sql
SELECT iap_entitlements_json, iap_active_purchases_json
FROM users
WHERE id = '<C1_uid>' AND _status != 'deleted';
```

key-value 離線快取，AsyncStorage：

```
key premium_status_cache_<C1_uid>
```

Cloud Functions log，Firebase console 濾還原時窗：

```
grep marker verifyTransaction
```

預期值與判定：

- Firestore `entitlements/{C1_uid}` 文件不存在
- users 兩欄 `iap_entitlements_json` 與 `iap_active_purchases_json` 皆 null 或空
- `premium_status_cache_<C1_uid>` key 不存在，本場未寫快取
- 還原時窗內無 `<C1_uid>` 的 `verifyTransaction` 呼叫，空還原不送後端
- 四項皆符 ⇒ `沒有可恢復的購買項目` 為真實查無而非誤報，R-AU-047 過
- 四項與入場一致 ⇒ 全場零資料寫入、出場等於入場成立

---

## CP-C-02-01 待處理購買不送驗證

- 時點：步 5 觸發待處理購買後，尚未關 Interrupted Purchases 前
- 管道：Cloud Functions log 與 device log

Firebase console → Functions → 記錄，篩 verifyTransaction，看購買當下時窗。

device log 檢查以下 marker 不出現：

```
[IAP] verifyTransaction → 送後端驗證
```

- Cloud Functions 無 verifyTransaction 執行紀錄於該待處理時窗，符合即 R-AU-061 過
- device log 無 `[IAP] verifyTransaction → 送後端驗證`，且無 finishTransaction 確認該交易，佐證 R-AU-061

---

## CP-C-02-02 後端驗證與本機等級

- 時點：步 14 購買成功、付費牆關閉後
- 管道：device log，需 dev build

device log 檢查以下 marker 依序出現：

```
[IAP] verifyTransaction → 送後端驗證
[IAP] verifyTransaction verified
[IAP] entitlement 快照
[IAP] serverTier ←
```

- 見 `[IAP] verifyTransaction → 送後端驗證` 後見 `[IAP] verifyTransaction verified`，憑證送後端驗證由訂閱更新本機等級，符合即 R-AU-058 過
- 見 `[IAP] entitlement 快照` 且其內 tier 為 1 status 為 active，client 讀 entitlement tier 判定授權落點，符合即 R-DM-076 過
- 見 `[IAP] serverTier ← 1 ( active )`，currentTier 解析為 LEVEL_1，符合即 R-DM-047 過
- 同一 serverTier 分支呼叫 savePremiumCache 寫 `premium_status_cache_<uid>`，device log 無 `Failed to save premium cache` 警告，符合即 R-DM-052 過
- R-DM-052 補佐：可自 app 沙盒 RCTAsyncLocalStorage 讀 `premium_status_cache_<uid>`，JSON 含 tier 1

---

## CP-C-02-03 Firestore entitlement 文件

- 時點：購買成功後
- 管道：Firestore，Firebase console
- 前置：取 C1 的 Auth uid，Firebase Auth console 以 C1 email 查，或自 verifyTransaction Cloud Functions log 的 request.auth.uid 取

讀文件路徑與欄位：

```
entitlements/{C1_uid}
  欄位 tier product_id expires_date original_transaction_id environment status updated_on
```

- 文件 id 等於 C1 的 Auth uid，符合即 R-DM-062 過
- tier 為 1，LEVEL_0 為 0 依層級遞增，符合即 R-DM-064 過
- product_id 為 `susugigi_level1_monthly`，依產品識別碼對應 LEVEL_1，符合即 R-AU-092 過
- status 為 `active`，購買驗證成功後為 active，符合即 R-DM-068 過
- environment 為 `Sandbox`，符合即 R-DM-067 過
- 文件同時含 tier 與 expires_date，驗證成功寫入等級與到期日，符合即 R-AU-091 過
- updated_on 與 expires_date 為毫秒整數，13 位數量級，符合即 R-DM-079 過

---

## CP-C-02-04 TransactionIndex 歸戶

- 時點：購買成功後
- 管道：Firestore，Firebase console
- 前置：取 original_transaction_id，自 CP-C-02-03 entitlement 文件 original_transaction_id 欄取，或自 Cloud Functions log 取

讀文件路徑與欄位：

```
txnIndex/{original_transaction_id}
  欄位 uid
```

- 文件 id 等於該 original_transaction_id，TransactionIndex 文件 id 為原始交易編號，符合即 R-DM-077 過
- uid 等於 C1 的 Auth uid，購買後寫入 uid 對應，符合即 R-DM-078 過
- uid 為 C1，C1 先購買先寫入得該交易，符合即 R-AU-088 過

---

## CP-C-02-05 續訂對賬

- 時點：場尾等 1 至 2 期 sandbox 自動續訂後
- 管道：Firestore，Firebase console
- 前置：記錄續訂前 entitlement 的 original_transaction_id 與 updated_on，CP-C-02-03 已讀

重讀文件並比對：

```
entitlements/{C1_uid}
  比對 original_transaction_id 與 updated_on 對續訂前值
```

- original_transaction_id 與續訂前相同，續訂沿用同一原始交易編號，符合即 R-DM-066 過
- updated_on 大於續訂前值，伺服器每次更新 entitlement 刷新 updated_on，符合即 R-DM-075 過

---

## CP-C-03-01 啟動查憑證更新本地到期狀態

- 時點：冷啟後首頁載入時
- 管道：device log 加 Firestore

device log 篩選啟動時序的憑證刷新 marker

```text
grep "\[IAP\] serverTier ←" console.log
```

Firestore 讀 C1 授權文件的到期真相

```text
entitlements/<C1 uid>
  欄位 expires_date  status  tier
```

- 冷啟 log 見 `[IAP] serverTier ← 1 ( active )`，本地等級由憑證刷新
- Firestore `expires_date` 為未來時戳，`status` 為 active
- log 顯示啟動即刷新本地到期狀態，非佔位 → R-BS-005 過

---

## CP-C-03-02 前景恢復觸發 reconcile 補送

- 時點：退背景回前景後數秒
- 管道：device log 加 Firestore

device log 篩選前景 reconcile 補送 marker

```text
grep "\[IAP\] reconcile：StoreKit LEVEL_1 購買數 =" console.log
grep "\[IAP\] verifyTransaction verified" console.log
```

Firestore 讀授權文件的刷新時戳

```text
entitlements/<C1 uid>
  欄位 updated_on
```

- 回前景後 log 見 reconcile 購買數 marker 與 verified marker
- 兩 marker 時戳皆晚於回前景時刻
- `updated_on` 較回前景前變大，後端重寫一次
- reconcile 於前景恢復補送未驗購買 → R-AU-059 過

---

## CP-C-03-03 無 Entitlement 非離線時 reconcile 補寫

- 時點：手刪 entitlement 文件後在線前景數秒內
- 管道：Firestore 加 device log

device log 篩選補寫時序 marker

```text
grep "\[IAP\] reconcile：StoreKit LEVEL_1 購買數 =" console.log
grep "\[IAP\] verifyTransaction verified" console.log
```

Firestore 讀補寫後的授權文件

```text
entitlements/<C1 uid>
  欄位 status  tier  original_transaction_id
```

- 刪除後文件重新出現於集合
- `status` 為 active，`tier` 為 1
- `original_transaction_id` 仍為 C1 原購買編號
- log 見 reconcile marker 證明非離線分支 → R-AU-056 過

---

## CP-C-03-04 原始交易編號已歸戶他帳號後端拒絕

- 時點：C2 點還原購買送驗後
- 管道：Cloud Functions log 加 Firestore

Cloud Functions log 篩選拒絕訊息

```text
firebase functions:log --only verifyTransaction
grep "此訂閱已綁定其他帳號" functions.log
```

client device log 篩選送驗失敗 marker

```text
grep "verifyTransaction (reconcile) failed" console.log
```

Firestore 讀交易歸戶索引與 C2 授權

```text
txnIndex/<original transaction id>
  欄位 uid
entitlements/<C2 uid>
  欄位 status
```

- functions log 見 `此訂閱已綁定其他帳號` 對應 C2 uid 呼叫
- client log 見 `verifyTransaction (reconcile) failed`
- `txnIndex/<original transaction id>.uid` 仍為 C1 uid，未改派
- `entitlements/<C2 uid>` 不存在或 status 非 active
- 後端 already-exists 拒絕且歸戶不變 → R-AU-089 過

---

## CP-C-03-05 PremiumCache 不跨帳號沿用

- 時點：C2 登入後
- 管道：device log 加 AsyncStorage kv

device log 篩選 C2 等級落點 marker

```text
grep "\[IAP\] serverTier ←" console.log
```

AsyncStorage 讀兩帳號各自快取 key

```text
premium_status_cache_<C2 uid>
  值格式 JSON 含 tier expirationDate
premium_status_cache_<C1 uid>
  值格式 JSON 含 tier expirationDate
```

- C2 登入後 log 見 `[IAP] serverTier ← 0`，未繼承 C1 付費
- `premium_status_cache_<C2 uid>` 查無或 tier 為 LEVEL_0
- `premium_status_cache_<C1 uid>` 仍為 C1 付費快取，未被 C2 讀用
- 兩 key 各自獨立不跨帳號沿用 → R-DM-054 過

---

## CP-C-04-1 C1 訂閱自然到期

- 時點 步驟 5 恢復網路後、步驟 6 重新登入前
- 管道 Firestore
- uid 來源 C1 前場已登載，或 C1 登入後 Debug Info by Account 頁讀取
- log 撈法 device 端 JS log 走 React Native DevTools 或 CDP console

Firestore 讀取

```text
路徑 entitlements/<C1 uid>
讀 status 欄與 expires_date 欄
```

- 預期
    - `status` 為 `expired`
    - `expires_date` 早於當下
    - 若仍為 `active`，等數分鐘後 sandbox 月訂到期再讀
    - 兩者符合即 R-DM-073 過

---

## CP-C-04-2 C1 離線冷啟動維持等級且不觸發 reconcile

- 時點 步驟 9 C1 離線冷啟動當次
- 管道 log 加 Debug Info by Account 頁

出現的 marker

```text
entitlement snapshot error, using offline cache
```

不得出現的 marker

```text
[IAP] reconcile：StoreKit LEVEL_1 購買數 =
```

- 判定
    - 離線回退 marker 出現，且當前 tier 為 LEVEL_1，付費者未誤降，符合即 R-DM-053 過
    - 無 reconcile marker，訂閱連線失敗未觸發補寫，符合即 R-OF-007 過

---

## CP-C-04-3 越期快取失效降 LEVEL_0

- 時點 步驟 13 越期後重啟當次
- 管道 log 加 設定 頁

出現的 marker

```text
entitlement snapshot error, using offline cache
```

- 判定
    - 快取 `expirationDate` 早於等於當下，`checkIsPremium` 回 false
    - 離線回退解析 tier 為 LEVEL_0，`升級至 Premium` 列出現
    - 符合即 R-DM-056 過

---

## CP-C-90-1 users 表 IAP 欄位對賬佐證補遺未竟

- 時點 步驟 5 下載 C1 容器後
- 管道 sqlite 對賬
- uid 來源 C1 前場已登載，或 C1 登入後 Debug Info by Account 頁讀取
- 對賬對象 下載容器內的 `watermelon.db`

sqlite 讀取

```sql
SELECT id, email, iap_entitlements_json, iap_active_purchases_json
FROM users
WHERE id = '<C1 uid>'
  AND _status != 'deleted';
```

- 規則原意
    - R-DM-046 稱 IAP entitlements 與有效訂閱以 JSON 存 User 表
    - 依規則預期二欄應為非空有效 JSON
- 實測必得
    - `iap_entitlements_json` 為 null
    - `iap_active_purchases_json` 為 null
    - 因 impl 無寫入端，見場次檔 impl 核實
- 判定
    - 二欄恆 null，無正向可觀測狀態
    - 本場無法確立 R-DM-046 通過
    - 判 補遺未竟，計入 misfitIds
    - 本檢查點僅作佐證，不覆蓋任何規則
