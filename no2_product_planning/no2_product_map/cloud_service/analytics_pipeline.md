# AnalyticsPipeline — 分析資料管道

R1 Round 5 拍板的分析後端架構。當下**未啟動**，待觸發條件達成時 enable。完整方案空間見 `no99_archive/r1_decision_matrix.md`。

---

## FirestoreToBigQueryMirror — Firestore 鏡像至 BigQuery

- **功能：**
    - 透過 firestore-bigquery-export Firebase Extension，自動將 Firestore 寫入鏡像至 BigQuery
- **目的：**
    - 提供 OLAP analytics warehouse 作為 macro_data B2B 變現、E2 個人化分析、LEVEL_3 AI 顧問的唯一資料源
    - 使 App 端零改動即享有分析能力（continued write to Firestore，extension 自動 stream 到 BigQuery）
- **做法：**
    - 安裝 Firebase Extension `firestore-bigquery-export`
    - 設定 source collections：`users/{uid}/transactions`、`users/{uid}/transfers`、`users/{uid}/accounts`、`users/{uid}/categories`、`users/{uid}/currency_rates`、`users/{uid}/schedules`
    - **不**鏡像 `users/{uid}/preferences`（Preference 無分析價值）
    - 設定 BigQuery dataset 與 table schema
    - **Filter 規則：** 僅 mirror `analyticsConsent==true` 的 user（從 `users/{uid}/preferences` 讀取 flag）
    - 對既有 Firestore 資料執行一次性 `fs-bq-import-collection` backfill
- **排除：**
    - opt-out user 的資料（filter 過濾）
    - L2 Preference 資料
    - L4 全量檔（與 BigQuery 完全脫鉤）
- **利弊：**
    - Extension 為 Google 託管，零維運
    - Streaming insert 接近即時，分析延遲低
    - Backfill 為一次性成本，~$30 + 數小時，需規劃 Firestore quota 不被打爆

---

## ActivationTrigger — 啟動條件

- **功能：**
    - 定義 BigQuery extension 與 analytics API 的啟動時機
- **目的：**
    - 避免提前啟用造成的 BigQuery storage 與維運開銷
    - 將分析架構與功能 ship 時程綁定
- **做法：**
    - 觸發條件擇一發生時 enable：
      - (a) E2 個人化分析功能要 ship
      - (b) macro_data.md 的 B2B 變現要啟動
      - (c) LEVEL_3 AI 顧問要 ship
    - 啟動時執行：安裝 extension → backfill → 驗證 → analytics API 部署
- **排除：**
    - 提前啟用作為「資料保險」（既有 L3 TransactionBackup 已是雲端備份）
- **利弊：**
    - 延後啟動省下啟動前的 BigQuery storage 月費（雖然小）
    - 延後期間條款 wording 須用「我們將會匿名聚合分析」而非「我們正在分析」，以保持誠信

---

## AnalyticsAPI — 分析服務 API

- **功能：**
    - 後端 API 接收 App 的分析請求，從 BigQuery 跑 SQL 後回傳結果給 App 端
- **目的：**
    - E2 個人化財務分析（單 user 範圍的提示）
    - macro_data B2B 變現（跨 user 聚合）
    - LEVEL_3 AI 顧問（複雜時序、ML 預測）
- **做法：**
    - 部署於 Cloud Functions 或 Cloud Run
    - 透過 Firebase Auth 驗證 user 身分，限制 user 只能查自己的資料（對 E2）；macro_data 走 service-account 級權限
    - 串接 Vertex AI / BQML 給未來 AI 顧問場景
- **排除：**
    - App 直接連 BigQuery（避免暴露 BigQuery client SDK 與計費邏輯）
    - 即時推播（屬同步層職責）
- **利弊：**
    - 後端 API 提供統一抽象，App 不需感知底層分析架構
    - 增加後端維運成本，但對標未來變現規模可接受

---

## ConsentSync — analyticsConsent 同步

- **功能：**
    - 將 App 端 Settings > Privacy 的 toggle 狀態同步到 Firestore
- **目的：**
    - 讓 BigQuery extension filter 可基於 flag 判斷是否 mirror
    - 提供 user 隨時開關的單一控制點
- **做法：**
    - toggle 變更時寫入 `users/{uid}/preferences.analyticsConsent`
    - 預設值 `true`（opt-out 預設加入）
    - BigQuery extension 讀取該 flag 作 filter
- **排除：**
    - 多裝置不一致（Preference 同步機制保證所有裝置一致）
- **利弊：**
    - 單一 flag 控制 filter 行為，邏輯簡單
    - 詳細 UX 設計屬 R-privacy-page
