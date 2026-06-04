# MacroData — 總體資料服務

- **功能：**
    - 從使用者資料擷取聚合市場情資
    - 市場情資儀表板
    - 競品趨勢分析
    - 總經 API 供企業客戶使用
- **目的：**
    - 企業版付費功能，以去識別化的聚合使用者資料提供總體市場洞察
- **做法：**
    - K-Anonymity 隱私合規處理，聚合去識別化資料後對外提供 API
    - DataPipeline 從 BigQuery analytics warehouse 提取資料
    - 上游 BigQuery 透過 firestore-bigquery-export extension 從 Firestore 鏡像而來
    - 僅含 analyticsConsent 為 true 的 user
    - BigQuery 啟動條件與 pipeline 設計依據 analytics pipeline 產品圖文件
- **排除：**
    - 個人資料直接出售
    - 個人層級的資料外洩
- **利弊：**
    - K-Anonymity 保護使用者隱私與品牌信任，但限制了資料商業化的粒度
    - 企業版收費高，但市場規模較小，需明確 B2B 銷售策略

---

## DataPipeline — 資料擷取管道

- **功能：**
    - 從 BigQuery analytics warehouse 擷取使用者資料
    - 進行去識別化處理後寫入聚合分析資料源
- **目的：**
    - 為 MarketIntelligence 和 EnterpriseDataService 提供持續更新的聚合資料來源
- **做法：**
    - 資料來源為 BigQuery
    - 上游由 firestore-bigquery-export extension 從 Firestore 鏡像
    - 僅含 analyticsConsent 為 true 的 user
    - 排程批次讀取 BigQuery
    - 個人識別資訊在聚合前移除
    - Pipeline 啟動條件與 schema 對映設計依據 analytics pipeline 產品圖文件
- **排除：**
    - 即時資料流
    - 個人層級資料的留存
    - opt-out user 的資料，已在上游 BigQuery extension filter 過濾
- **利弊：**
    - 批次處理降低成本
    - 資料即時性有限
    - 上游 filter 確保 opt-out user 不被處理
    - 符合 Settings 之下 Privacy 同意機制
    - 需確保 K-Anonymity 隱私合規流程在管道中正確執行

---

## MarketIntelligence — 市場情資

- **功能：**
    - 情資儀表板，呈現市場整體消費趨勢視覺化
    - 競品趨勢分析
- **目的：**
    - 讓企業客戶取得以使用者行為資料為基礎的市場洞察
- **做法：**
    - 聚合去識別化資料，計算跨用戶的趨勢指標後呈現於儀表板
- **排除：**
    - 個別用戶資料的直接呈現
- **利弊：**
    - 聚合資料降低隱私風險，但無法提供個體層級的精細洞察

---

### TrendDashboard — 情資儀表板

- **功能：**
    - 市場整體消費趨勢的視覺化呈現
- **目的：**
    - 讓企業客戶快速掌握市場動向
- **做法：**
    - 聚合後的趨勢指標定期更新，呈現於 Web 儀表板
- **排除：**
    - 即時資料更新
- **利弊：**
    - 定期更新降低運算成本，但即時性不足可能限制部分決策場景

---

### CompetitiveAnalysis — 競品趨勢分析

- **功能：**
    - 分析跨類別消費趨勢，協助企業客戶評估市場動向
- **目的：**
    - 為企業客戶提供基於真實使用者行為的競品分析依據
- **做法：**
    - 基於聚合類別消費資料計算市場佔比趨勢
    - App 端不提供標準分類對應，跨用戶類別於後端 data cleaning 階段標準化後再聚合
- **排除：**
    - 特定競品的直接追蹤
- **利弊：**
    - 資料基於真實使用者行為具參考價值，但聚合後解析度有限，無法做細粒度分析

---

## EnterpriseDataService — 企業資料服務

- **功能：**
    - 總經資料 API，供企業系統整合
    - K-Anonymity 隱私合規機制
- **目的：**
    - 讓企業客戶透過 API 將市場洞察整合進自身系統
- **做法：**
    - RESTful API，授權後存取
    - K-Anonymity 隱私處理在資料輸出前執行
    - 個人識別資訊在聚合前移除
- **排除：**
    - 個人資料直接出售
    - 用戶未授權的資料共享
- **利弊：**
    - API 形式靈活，但維護企業級 SLA 與合規文件的成本高

---

### MacroAPI — 總經資料 API

- **功能：**
    - 提供聚合消費趨勢資料的 API 端點
- **目的：**
    - 讓企業客戶將市場洞察資料整合至自身分析系統
- **做法：**
    - RESTful API，授權後存取，資料以聚合格式回傳
- **排除：**
    - 個人層級資料的 API 端點
- **利弊：**
    - 標準化 API 便於企業整合，但需維護版本相容性

---

### PrivacyCompliance — K-Anonymity 隱私合規

- **功能：**
    - 輸出前對資料執行 K-Anonymity 處理，確保任何記錄無法識別至個別使用者
- **目的：**
    - 保護使用者隱私，確保資料商業化符合隱私合規要求，維護品牌信任
- **做法：**
    - 聚合資料在輸出前進行 K-Anonymity 處理
    - 個人識別資訊在聚合前移除
- **排除：**
    - 可識別個人的資料對外提供
- **利弊：**
    - K-Anonymity 有效保護隱私，但處理後的資料粒度降低，限制部分分析場景
