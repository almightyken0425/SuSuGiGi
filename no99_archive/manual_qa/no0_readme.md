# SuSuGiGi 手動測試計劃

## 這批文件是什麼

- 記帳 app 的手動 QA 完整計劃
- 從 spec 逐條抽出的可測行為，配上最省人力的執行腳本
- 一套 fixture 餵多條規則，操作者跑一遍場次即涵蓋整條規則清單

---

## 目錄結構

- 資料夾編號即閱讀順序，本檔為起點
- `no1_test_plan/` 測試計劃本體，跨輪沿用
- `no2_qa_tools/` QA 工具腳本
- `no3_findings/` 各輪執行產物，一輪一資料夾
- `no4_debt/` 跨輪債務帳本
- 規則清單 `no1_test_plan/no1_rules.md` 不在本批，留在 Module Quality git `no6_product_quality/no2_accounting_app/`

---

## 文件代稱

- 活文件引用其他文件時用下列代稱，不用裸編號
- 規則清單 `no1_test_plan/no1_rules.md`
    - 1112 條規則，每條一個 R-ID
    - 覆蓋率的計量基準
    - 平時不需通讀，供查某條規則細節
- 場次檔 `no1_test_plan/no2_scenarios.md`
    - 操作者唯一要跑的
    - 32 場次，每場一套 fixture 與逐步操作
    - 步欄 🔎 為停下對賬點
- 對賬手冊 `no1_test_plan/no3_checkpoints.md`
    - Claude 專用，操作者不需閱讀
    - 每個 🔎 對應的查詢語句與預期值
- 資料對賬參照 `no1_test_plan/no4_schema_ref.md`
    - 真實表名欄位名、key-value 鍵名、Firestore 路徑
    - Claude 對賬時查用
- log 埋點需求 `no1_test_plan/no5_qa_log_spec.md`
    - 於 impl 埋 log 的規格
    - 32 個 marker，涵蓋 73 條 log 面規則
- 缺陷登記與執行紀錄，輪資料夾內兩檔
- T4 債清單與 impl 債清單，`no4_debt/` 內兩檔

---

## 輪次慣例

- 一輪 QA 開跑時在 `no3_findings/` 建輪資料夾
- 資料夾名依序遞增，如 `no1_round1/`、`no2_round2/`
- 輪資料夾內固定兩檔
    - `no1_findings.md` 缺陷登記，執行中確認的 app 缺陷唯一真相
    - `no2_execution_log.md` 執行紀錄，場次級執行結果的唯一真相
- 文件缺陷不登缺陷登記，直接修場次檔與對賬手冊
- FINDING 與 OBS 編號全域遞增，跨輪不歸零
    - round 2 缺陷從 FINDING-14 起編
    - round 2 觀察從 OBS-04 起編
- 歷史輪資料夾內容凍結，引用以各檔頂部歸檔標記所述 tag 為準

---

## 債務帳本

- `no4_debt/no1_t4_debt_ledger.md` T4 手動不可測規則的分流唯一真相
    - 98 條，三桶：已有測試補證、可自動化待寫、不可自動化
- `no4_debt/no2_impl_debt_backlog.md` impl 程式面技術債 backlog
- 兩檔跨輪持續維護，不隨輪歸檔

---

## 執行環境分軌

- A 軌單機 simulator，免額外帳號，最大批
- B 軌需兩個測試 Google 帳號，驗雲端對賬與帳號隔離
- C 軌需實體 iPhone 與 sandbox Apple ID，驗 IAP

---

## 可測性分級

- T1 操作者看畫面即可判定
- T2 需 Claude 對賬 sqlite 或 log 或 Firestore
- T3 需前置佈置才可測，處置欄載明方式
- T4 手動不可測，登載為自動化債，不排場次

---

## 覆蓋率把關

- no2_qa_tools 內兩支腳本機械把關
- check_rules_format 驗規則清單每列格式與值域
- check_coverage 驗場次涵蓋全部非 T4 規則
- 補遺未竟段落的 ID 不計入真實覆蓋

---

## 對賬工具

- no2_qa_tools 內三支承載三管道，Claude 於檢查點實跑
- dbq.sh 定位模擬器 watermelon.db 並下 SQL
- cdp_capture.mjs 接 8081 CDP 擷取 QA marker log
- fs_admin.mjs 讀寫 Firestore，需先放 serviceAccountKey.json
- fs_admin 依賴 firebase-admin，node_modules 與 key 皆已 gitignore

---

## 執行流程

- 操作者依場次檔順序操作
- 遇 🔎 停下，回報場次代號與 CP 編號
- Claude 依對賬手冊對賬資料層，回報過或不過
- 一場走完再進下一場，資料狀態接力
