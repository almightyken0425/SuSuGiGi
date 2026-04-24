# 商業模式與定價策略

## 核心戰略

本文件依據產品定義的四大產品個體，制定相應的收費策略與商業模式。
為確保內部維護的穩定性，採用 **Tier, 層級** 作為內部核心定義，外部行銷名稱, Marketing Name 僅為參考。

- **混合式多層級模型:**
    - 結合 **工具軟體 SaaS** 與 **數據服務 DaaS** 的混合模式
    - C 端透過工具價值獲取海量用戶與微觀數據
    - B 端透過數據價值變現宏觀趨勢並回饋 C 端研發

---

## 記帳 App + Firestore, Accounting App

**策略:** Freemium, 免費增值
**目標:** 獲取, Acquisition & 留存, Retention

- **Tier 0: Local, 本機版, Marketing: Free**
    - **定價:** $0 / 月
    - **功能:**
        - 完整記帳功能, CRUD
        - 本地資料庫, WatermelonDB
        - 基礎報表, 圓餅圖、趨勢圖
        - Widget 小工具
    - **限制:** 無雲端同步、單一裝置、無進階報表

- **Tier 1: Cloud, 雲端版, Marketing: Standard**
    - **定價:** $30 / 月, 或 $300 / 年
    - **價值主張:** 資料安全與跨裝置便利
    - **功能:**
        - **包含 Tier 0 所有功能**
        - **雲端同步:** 多裝置即時同步
        - **自動備份:** 每日雲端備份
        - **基礎自動化:** 簡單的週期性交易設定

---

## 邏輯引擎與規則中心, Logic Engine

**策略:** Value-Based Pricing, 價值導向定價
**目標:** 提升 ARPU Average Revenue Per User

- **Tier 2: Automation, 自動化版, Marketing: Pro**
    - **定價:** $90 / 月, 或 $900 / 年
    - **價值主張:** 駕馭複雜性，個人財務的邏輯除錯器
    - **功能:**
        - **包含 Tier 1 所有功能**
        - **規則中心:** 無限量的自動化規則 Mad Libs UI
        - **Web 控制台:** 大螢幕管理與 JQL 查詢
        - **時光機回溯:** 規則修改後的歷史重構 Replay
        - **進階匯出:** 完整 CSV/Excel 匯出

---

## AI 個人化建議, AI Advisor

**策略:** High-End Tier, 頂級訂閱
**目標:** 增加黏著度與提供高階價值

- **Tier 3: Intelligence, 智能版, Marketing: Ultra**
    - **定價:** $140 / 月, 或 $1,400 / 年
    - **價值主張:** 專屬財務顧問，預知未來
    - **功能:**
        - **包含 Tier 2 所有功能**
        - **AI Agent:** 自然語言邏輯除錯 Chat Debugging
        - **異常偵測:** 主動通知異常消費
        - **現金流預測:** 未來財務狀況模擬
        - **財務健康:** 診斷報告與建議

---

## 總經分析報表與 API, Macro Data Service

**策略:** B2B 訂閱與流量計費
**目標:** 數據變現, Data Monetization

- **Tier B: Enterprise, 企業版**
    - **定價:** 依專案報價 或 企業訂閱制, $500+ / 月
    - **客戶:** 市場研究機構、品牌商、金融機構
    - **產品:**
        - **市場情資儀表板:** 存取特定受眾的聚合消費數據
        - **總經數據 API:** 依 API 呼叫次數計費, Usage-Based
    - **合規:** 僅提供 K-Anonymity 聚合數據，絕無 PII

---

## 飛輪效應

- **Tier 0, Local** 吸引大量用戶，建立數據基底。
- **Tier 1, Cloud** 提供安全與便利，轉化付費用戶，支撐基礎營運。
- **Tier 2, Automation** 提供強大的邏輯引擎，讓用戶從 記帳 升級為 管理規則。
- **Tier 3, Intelligence** 提供主動式 AI 服務，最大化用戶終身價值 LTV。
- **Tier B, Enterprise** 變現宏觀價值，回饋 C 端研發，形成正向循環。
