# 手動 QA 資料對賬參照

- 用途：手動 QA 時對賬本機 sqlite、key-value 儲存、Firestore
- 來源：impl `src/database/schema.ts`、models、services 逐檔核對
- 實庫驗證：模擬器 `watermelon.db` 已跑 `.schema` 比對
- schema version：code 與實庫皆為 8，`PRAGMA user_version` 回 8
- 差異：`settings` 的 `week_start` 實庫排最後、code 排中間，migration 追加所致，欄位集合一致

---

## sqlite 查詢注意事項

- 底層是 WatermelonDB，每表自帶 `id`、`_changed`、`_status` 欄
- `_status` 為 `deleted` 的 row 是隱形墓碑，raw dump 會撈出來
- 六張軟刪表另有 `deleted_on` 墓碑欄，非 null 即已刪
- 對賬 SQL 固定加雙重過濾

```sql
WHERE _status != 'deleted' AND deleted_on IS NULL
```

- 無 `deleted_on` 的表只加 `_status != 'deleted'`
- `disabled_on` 是停用非刪除，帳戶分類停用後資料仍計入
- 時間戳皆為 ms 整數；model 的 date setter 會把 0 寫成 null，驗數值讀 `_raw`
- `local_storage` 表是 WatermelonDB 內部 kv，目前實庫為空
- 金額欄位存分為單位的整數，顯示值另經幣別小數位換算

---

## 表一覽

| 表名 | 軟刪欄 | 停用欄 | model 檔 |
| --- | --- | --- | --- |
| users | 無 | 無 | `User.ts` |
| settings | 無 | 無 | `Settings.ts` |
| accounts | deleted_on | disabled_on | `Account.ts` |
| categories | deleted_on | disabled_on | `Category.ts` |
| transactions | deleted_on | 無 | `Transaction.ts` |
| transfers | deleted_on | 無 | `Transfer.ts` |
| currency_rates | deleted_on | 無 | `CurrencyRate.ts` |
| schedules | deleted_on | 無 | `Schedule.ts` |
| currency_configs | 無 | 無 | `CurrencyConfig.ts` |

---

## users

- 本機使用者列，含 IAP 快照 JSON 字串欄

```text
users
  email                      string  optional
  display_name               string  optional
  photo_url                  string  optional
  last_login_at              number
  iap_entitlements_json      string  optional
  iap_active_purchases_json  string  optional
  created_at                 number
  updated_on                 number
```

---

## settings

- 每 user 一 row，`user_id` 綁定
- `week_start` 即週起始日偏好，值為 auto、sunday、monday 之一，不在 key-value 儲存
- `last_synced_at` 是備份 Delta 水位線，per-user 不跨帳號

```text
settings
  user_id            string   indexed
  language           string
  base_currency_id   number
  time_zone          string
  theme              string
  launch_mode        string
  analytics_consent  boolean  optional
  week_start         string   optional
  created_at         number
  updated_on         number
  last_synced_at     number   optional
```

---

## accounts

```text
accounts
  user_id        string  indexed
  name           string
  icon_id        number
  currency_code  string
  sort_order     number
  schedule_id    string  optional
  disabled_on    number  optional
  created_at     number
  updated_on     number
  deleted_on     number  optional
```

---

## categories

- `type` 值為 expense 或 income

```text
categories
  user_id      string  indexed
  name         string
  type         string
  icon_id      number
  sort_order   number
  disabled_on  number  optional
  created_at   number
  updated_on   number
  deleted_on   number  optional
```

---

## transactions

- `amount` 以分為單位

```text
transactions
  user_id                 string  indexed
  account_id              string  indexed
  category_id             string  indexed
  amount                  number
  date                    number  indexed
  note                    string  optional
  schedule_id             string  optional
  schedule_instance_date  number  optional
  created_at              number
  updated_on              number
  deleted_on              number  optional
```

---

## transfers

- 雙帳戶雙金額，跨幣別轉帳存 `implied_rate`

```text
transfers
  user_id                 string  indexed
  account_from_id         string  indexed
  account_to_id           string  indexed
  amount_from             number
  amount_to               number
  date                    number  indexed
  implied_rate            number  optional
  note                    string  optional
  schedule_id             string  optional
  schedule_instance_date  number  optional
  created_at              number
  updated_on              number
  deleted_on              number  optional
```

---

## currency_rates

```text
currency_rates
  user_id           string  indexed
  currency_from_id  number
  currency_to_id    number
  rate              number
  date              number  indexed
  created_at        number
  updated_on        number
  deleted_on        number  optional
```

---

## schedules

- `frequency` 值為 DAILY、WEEKLY、MONTHLY、YEARLY
- template 欄依 `is_transfer` 二選一填交易組或轉帳組

```text
schedules
  user_id                   string   indexed
  frequency                 string
  interval                  number
  start_on                  number
  end_on                    number   optional
  is_transfer               boolean
  template_amount           number   optional
  template_category_id      string   optional
  template_account_id       string   optional
  template_amount_from      number   optional
  template_account_from_id  string   optional
  template_amount_to        number   optional
  template_account_to_id    string   optional
  template_note             string   optional
  created_at                number
  updated_on                number
  deleted_on                number   optional
```

---

## currency_configs

```text
currency_configs
  user_id             string   indexed
  currency_id         number   indexed
  decimal_places      number   optional
  use_thousands_unit  boolean
  created_at          number
  updated_on          number
```

---

## key-value 儲存鍵名

- 儲存機制全為 AsyncStorage，impl 無 MMKV
- iOS 實體位置為 app 沙盒的 RCTAsyncLocalStorage 目錄

| key | 用途 | 值格式 | 定義檔 |
| --- | --- | --- | --- |
| `sync_last_at` | 備份冷卻時間戳，裝置層級跨帳號共用，冷卻 5 分鐘 | ms 整數字串 | `src/services/syncEngine.ts` |
| `sync_quota_date` | 配額計數器日期，換日即歸零 | ISO 日期字串 UTC | `src/services/quotaService.ts` |
| `sync_quota_writes` | 每日雲端寫入計數，上限 2000 | 整數字串 | `src/services/quotaService.ts` |
| `premium_status_cache_<uid>` | premium 離線快取，帳號範圍綁 uid | JSON 含 tier 與 expirationDate | `src/services/premiumStatusCache.ts` |
| `last_signed_in_uid` | 上次登入 uid，換帳號偵測用 | uid 字串 | `src/services/userService.ts` |
| `sync_last_push_at` | legacy 水位線，升級首同步讀一次即刪 | ms 整數字串 | `src/services/syncEngine.ts` |
| `sync_initial_backup_done` | legacy 初次備份旗標，升級首同步後刪 | 旗標字串 | `src/services/syncEngine.ts` |

- 週起始日不在此層，見 settings 表 `week_start` 欄
- premium 快取登出不清、換帳號各讀各的 key
- 備份失敗時 `sync_last_at` 回拉，有效冷卻縮為 30 秒

---

## Firestore 集合路徑

- client 端集合名常數定義於 `src/services/schema/coreSchema.ts` 的 `COLLECTIONS`
- users 文件路徑定義於 `src/services/userService.ts`
- entitlements 路徑定義於 `src/services/entitlementService.ts`

| 路徑 | 用途 | 寫入方 |
| --- | --- | --- |
| `users/{uid}` | 使用者主文件，profile、preferences map、IAP JSON 快照 | client |
| `users/{uid}/accounts/{id}` | 帳戶備份，六備份集合之一 | client 備份引擎 |
| `users/{uid}/categories/{id}` | 分類備份 | client 備份引擎 |
| `users/{uid}/transactions/{id}` | 交易備份 | client 備份引擎 |
| `users/{uid}/transfers/{id}` | 轉帳備份 | client 備份引擎 |
| `users/{uid}/currency_rates/{id}` | 匯率備份 | client 備份引擎 |
| `users/{uid}/schedules/{id}` | 排程備份 | client 備份引擎 |
| `entitlements/{uid}` | server 驗證後授權，client 唯讀訂閱 | Cloud Functions |

- 備份文件 id 與本機 WatermelonDB row id 一致，可逐筆對賬
- 備份為 up-only，含墓碑 row 一併上傳，對賬雲端同樣要濾 `deletedOn`
- preferences 只上傳不下載，本機 settings 是偏好唯一真相
- `entitlements/{uid}` 欄位為 tier、expires_date、status
