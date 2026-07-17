# SuSuGiGi 手動測試計劃

## 這批文件是什麼

- 記帳 app 的手動 QA 完整計劃
- 從 spec 逐條抽出的可測行為，配上最省人力的執行腳本
- 一套 fixture 餵多條規則，操作者跑一遍場次即涵蓋整條規則清單

---

## 文件導覽

- 檔名編號即閱讀順序，本檔 no0 為起點
- 操作者實際要跑的只有 no2
- no0 本檔，總覽與導覽
- no1 規則清單，唯一真相
    - 1112 條規則，每條一個 R-ID
    - 覆蓋率的計量基準
    - 平時不需通讀，供查某條規則細節
- no2 測試腳本，操作者唯一要跑的
    - 32 場次，每場一套 fixture 與逐步操作
    - 步欄 🔎 為停下對賬點
    - 執行入口就是這份
- no3 對賬手冊，Claude 專用
    - 每個 🔎 對應的查詢語句與預期值
    - 操作者不需閱讀
- no4 資料對賬參照
    - 真實表名欄位名、key-value 鍵名、Firestore 路徑
    - Claude 對賬時查用
- no5 log 埋點需求
    - Phase 3 於 impl 埋 log 的規格
    - 32 個 marker，涵蓋 73 條 log 面規則
- no6 缺陷登記
    - 執行中確認的 app 缺陷唯一真相
    - 文件缺陷不登這裡，直接修 no2 與 no3
- no7 執行紀錄
    - 場次級執行結果的唯一真相
    - 每場收錄執行日、狀態、對賬摘要、偏差與殘留狀態
- no8 T4 自動化債處置清單
    - 98 條手動不可測規則的分流唯一真相
    - 三桶：已有測試補證、可自動化待寫、不可自動化

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

- qa_tools 內兩支腳本機械把關
- check_rules_format 驗 no1 每列格式與值域
- check_coverage 驗場次涵蓋全部非 T4 規則
- 補遺未竟段落的 ID 不計入真實覆蓋

---

## 對賬工具

- qa_tools 內三支承載三管道，Claude 於檢查點實跑
- dbq.sh 定位模擬器 watermelon.db 並下 SQL
- cdp_capture.mjs 接 8081 CDP 擷取 QA marker log
- fs_admin.mjs 讀寫 Firestore，需先放 serviceAccountKey.json
- fs_admin 依賴 firebase-admin，node_modules 與 key 皆已 gitignore

---

## 執行流程

- 操作者依 no2 場次順序操作
- 遇 🔎 停下，回報場次代號與 CP 編號
- Claude 依 no3 對賬資料層，回報過或不過
- 一場走完再進下一場，資料狀態接力
