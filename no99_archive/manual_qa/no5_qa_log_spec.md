# SuSuGiGi QA log 埋點需求清單 V1

---

## 文件定位

- Phase 3 於 impl 埋 log 的規格
- 來源為 no1 規則清單面欄含 LOG 的規則列
- LOG 面規則共 86 條
- marker 覆蓋 73 條
- T4 共 13 條列為排除，登載原因
- 測試腳本以 marker 對賬 log 面斷言

---

## marker 合約總則

- tag 固定 QA 前綴
- 格式為 QA 模組名 事件名 key=value 串
- 模組名與事件名為固定字面
- 禁止動態組字拼 tag
- key=value 以單一空白分隔
- value 不得含空白
- 動態字串先去空白或改雜湊
- 一則 marker 一行 `console.log`
- marker 僅供對賬，不得承載邏輯

格式示例如下。

```js
if (__DEV__) console.log('QA BACKUP skip reason=cooldown sinceLastMs=120000');
```

---

## 硬規則：__DEV__ 包裹

- 全部 marker 必須包在 `__DEV__` 判斷內
- 無例外，含錯誤路徑 marker
- 理由：正式版無 console strip，禁止外洩
- 未包 `__DEV__` 的 marker 視為缺陷
- code review 以 grep `QA ` 逐筆核對

---

## 覆蓋統計

| 群 | tag | LOG 規則數 | marker 數 | 覆蓋 | T4 排除 |
| --- | --- | --- | --- | --- | --- |
| 備份守門 | BACKUP QUOTA | 29 | 12 | 25 | 4 |
| subscription gate | PREMIUM | 18 | 7 | 16 | 2 |
| 偏好上傳 | PREF | 4 | 3 | 4 | 0 |
| 報表快取 | RCACHE | 17 | 4 | 14 | 3 |
| bootstrap 委派 | BOOT | 5 | 2 | 3 | 2 |
| undo | UNDO | 1 | 1 | 1 | 0 |
| 排程補產 | SCHED | 0 | 1 | 0 | 0 |
| 其他 | VALID DBQ | 12 | 2 | 10 | 2 |
| 合計 | — | 86 | 32 | 73 | 13 |

---

## 備份守門

- 模組：`no19_transaction_backup_logic` 與 `no12_quota_management_logic`
- tag 用 BACKUP 與 QUOTA 兩組

| marker | 觸發點 | 欄位 | 對應規則 |
| --- | --- | --- | --- |
| `QA BACKUP start` | `runBackup` 通過守門開始執行 | `trigger=launch\|foreground\|login` `uid` | R-IE-083 |
| `QA BACKUP skip` | 守門擋下即返回 | `reason=no_user\|reentry\|cooldown\|quota` `sinceLastMs` | R-IE-084 R-IE-085 R-IE-086 R-IE-088 R-IE-089 R-IE-091 R-OF-005 R-XD-019 |
| `QA BACKUP cooldownStamp` | 備份起始時間寫入持久化 | `stampMs` `storage=device` | R-IE-087 |
| `QA BACKUP probe` | 遠端存在性探測完成 | `remoteHasData=true\|false` `reads=1` | R-IE-092 R-AU-083 |
| `QA BACKUP mode` | 全量增量分流決策完成 | `mode=initial\|incremental\|full_delta` `lastSyncedAt` | R-IE-094 R-IE-095 R-IE-096 |
| `QA BACKUP batch` | 每批寫入送出 | `collection` `batch` `count` 上限 500 | R-IE-099 |
| `QA BACKUP done` | 備份完成返回 | `uploaded` `lastSyncedAt=updated\|unchanged` | R-DM-007 R-IE-103 |
| `QA BACKUP error` | 備份拋錯被捕捉 | `code` `recovered=true` | R-IE-104 |
| `QA QUOTA add` | 批次寫入成功累加計數 | `added` `todayTotal` | R-AU-079 R-IE-100 |
| `QA QUOTA gate` | 批次寫入前配額判定 | `allowed=true\|false` `todayTotal` `limit=2000` | R-AU-080 |
| `QA QUOTA reset` | 跨 UTC+0 日界計數歸零 | `utcDay` | R-AU-081 |
| `QA QUOTA exempt` | 讀取或偏好上傳不計數 | `kind=read\|preference` | R-AU-082 R-AU-084 |

T4 排除如下。

| ID | 原因 |
| --- | --- |
| R-IE-082 | 內部實作黑箱不可觀察 |
| R-IE-093 | 需注入 Firestore 查詢故障 |
| R-IE-105 | 需注入 Firestore 配額錯誤 |
| R-OF-004 | 探測瞬間網路失敗時點無法手動控制 |

---

## subscription gate

- 模組：`no6_premium_logic` 與 `no2_login_logout_logic`
- 授權解析、PremiumCache、entitlement 讀取
- tag 用 PREMIUM

| marker | 觸發點 | 欄位 | 對應規則 |
| --- | --- | --- | --- |
| `QA PREMIUM resolve` | 授權解析完成 | `source=online\|cache\|fallback` `tier=LEVEL_0\|LEVEL_1\|LEVEL_2` | R-DM-047 R-DM-053 R-AU-054 R-AU-055 |
| `QA PREMIUM loaded` | `isPremiumLoaded` 轉為 true | `loaded=true` `path=online\|offline` `afterLogout=true\|false` | R-DM-049 R-DM-050 R-DM-051 |
| `QA PREMIUM cacheWrite` | 線上解析成功寫入快取 | `uid` `tier` `expiresAt` | R-DM-052 R-AU-053 |
| `QA PREMIUM cacheRead` | 讀快取判定授權 | `uid` `hit=true\|false` `valid=true\|false` `expiresAt` | R-DM-054 R-DM-056 R-AU-065 R-AU-066 |
| `QA PREMIUM cacheClear` | 換帳號選清除時 | `clearedUid` `keptUid` | R-AU-017 |
| `QA PREMIUM entitlement` | client 讀 entitlement 完成 | `tier` `status` | R-DM-076 |
| `QA PREMIUM reconcile` | reconcile 補寫決策點 | `triggered=true\|false` `reason=offline\|mismatch` | R-OF-007 |

T4 排除如下。

| ID | 原因 |
| --- | --- |
| R-DM-048 | 負向值域斷言無法窮舉驗證 |
| R-DM-055 | 現有商品皆有期限無 Null 案例 |

---

## 偏好上傳

- 模組：`no18_preference_upload_logic`
- tag 用 PREF

| marker | 觸發點 | 欄位 | 對應規則 |
| --- | --- | --- | --- |
| `QA PREF upload` | 偏好上傳送出 | `fields` `lastSyncedAt=untouched` | R-DM-009 |
| `QA PREF skip` | 無登入使用者直接返回 | `reason=no_user` | R-ST-088 |
| `QA PREF error` | 雲端寫入失敗被捕捉 | `code` `uiBlocked=false` | R-ST-099 R-OF-014 |

- 備註：離線寫入不 settle 時 error 未必出現
- 測試腳本以 upload 有無出現雙向對賬

---

## 報表快取

- 模組：`no22_home_period_state_logic`
- tag 用 RCACHE
- 快取 key 含空白時改雜湊或去空白

| marker | 觸發點 | 欄位 | 對應規則 |
| --- | --- | --- | --- |
| `QA RCACHE lookup` | 查詢進入快取層 | `key` `uid` `hit=true\|false` | R-HR-107 R-HR-108 R-HR-109 |
| `QA RCACHE store` | 未命中推導後寫入 | `key` `pinned=true\|false` `size` | R-HR-111 R-HR-112 |
| `QA RCACHE evict` | 筆數超 15 執行淘汰 | `evictedKey` `pinned` `size` | R-HR-113 |
| `QA RCACHE clear` | 清空快取 | `reason=tx_write\|merge\|undo\|account_write\|rate_change\|pref_change\|refocus\|auth_change` `cleared` | R-HR-116 R-HR-117 R-HR-118 R-HR-120 R-HR-121 R-HR-122 R-HR-123 R-HR-124 |

T4 排除如下。

| ID | 原因 |
| --- | --- |
| R-HR-110 | 併發時序手動無法構造與觀察 |
| R-HR-114 | LRU 存取順序手動無法精準控制 |
| R-HR-115 | LRU 存取順序手動無法精準控制 |

---

## bootstrap 委派

- 模組：`no1_app_bootstrap_logic`
- tag 用 BOOT

| marker | 觸發點 | 欄位 | 對應規則 |
| --- | --- | --- | --- |
| `QA BOOT delegate` | 啟動或前景委派背景任務 | `task=runBackup\|refreshStatus` `trigger=launch\|foreground` | R-BS-012 R-BS-013 R-BS-014 |
| `QA BOOT resolve` | 啟動落點解析時 | `premiumLoaded=true\|false` `landing` | 輔助 R-BS-016，不計覆蓋 |

T4 排除如下。

| ID | 原因 |
| --- | --- |
| R-BS-004 | 阻塞與否無外顯判準 |
| R-BS-016 | 就緒時序 race 無法手動重現 |

---

## undo

- 模組：undo 流程與報表快取交界
- tag 用 UNDO

| marker | 觸發點 | 欄位 | 對應規則 |
| --- | --- | --- | --- |
| `QA UNDO done` | 復原操作完成 | `action` `cacheCleared=true` | R-HR-119 |

- 與 `QA RCACHE clear` 的 `reason=undo` 成對出現
- 測試腳本兩則同時對賬

---

## 排程補產

- 模組：`no1_app_bootstrap_logic` 補產生段
- tag 用 SCHED
- 本群無 LOG 面規則
- marker 屬輔助，加速 DB 對賬定位

| marker | 觸發點 | 欄位 | 對應規則 |
| --- | --- | --- | --- |
| `QA SCHED backfill` | 補產生執行完成 | `scheduleId` `generated` `fromMs` `toMs` | 輔助 R-BS-006 至 R-BS-011 DB 對賬，不計覆蓋 |

---

## 其他

- 模組：`no9_transaction_logic` `no8_transfer_logic` `no23_local_database_logic`
- tag 用 VALID 與 DBQ

| marker | 觸發點 | 欄位 | 對應規則 |
| --- | --- | --- | --- |
| `QA VALID reject` | logic 層驗證失敗回傳 | `op=createTransaction\|updateTransaction\|createTransfer\|updateTransfer` `reason=missing_field\|zero_amount\|non_positive\|same_account` | R-TX-072 R-TX-073 R-TX-076 R-TX-077 R-TX-083 R-TX-084 R-TX-086 R-TX-096 R-TX-097 R-TX-099 |
| `QA DBQ single` | 單筆帳戶類別查詢返回 | `entity=account\|category` `found=true\|false` | 輔助 R-BS-026 R-BS-027，不計覆蓋 |

- R-TX 群配合處置欄的 harness 直呼佈置

T4 排除如下。

| ID | 原因 |
| --- | --- |
| R-BS-026 | 內部查詢無獨立操作入口 |
| R-BS-027 | 內部查詢無獨立操作入口 |

---

## Phase 3 驗收清單

- 32 個 marker 全數落地於對應模組
- 全部包在 `__DEV__` 內
- tag 字面與本檔逐字一致
- 覆蓋腳本以本檔 ID 清單機械核對 73 條
