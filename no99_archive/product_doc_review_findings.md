# Product 層文件 review 發現歸檔

## 文件用途

- 記錄 2026-06-10 多 agent workflow 審查的成立發現
- 發現已按修復主題分類
- 一個分類開一個 session 處理
- 分類處理完即可刪除對應章節
- 全部處理完即可刪除本檔

---

## 審查方法

- 七個維度平行審查全部 Product 層文件
- 每條發現經對抗式複核員重讀檔案裁決
- 成立 33 條、駁回 18 條
- 完整性批判另補 9 條、未經獨立複核
- 嚴重度分高、中、低、資訊四級
- 中與低多為原判高被複核降級的結果

---

## 共同施工守則

- 每個 session 各自開 worktree、branch 從 main 出
- 多分類動到同一檔案、merge 順序見各分類重疊段
- 建議先完成變現賣點定案並 merge
- 後續 session 動工前先 pull main
- 修復方向有疑義時、以各分類修法欄為起點再自行核檔

---

## 分類 變現賣點定案

- **目標:**
    - 付費賣點與承載節點單向對齊
    - 需產品決策、先拍板再改檔
- **動到的檔案:**
    - `no1_product_initiation/no3_business_model.md`
    - `no2_product_planning/no2_product_map/app/payment.md`
    - `no2_product_planning/no2_product_map/web_console/web_console.md`
    - `no2_product_planning/no2_product_map/cloud_service/ai_advisor_backend.md`
    - `no2_product_planning/no2_product_map/web_console/ai_advisor_web_client.md`
    - `no2_product_planning/no3_dev_roadmap/no3_dev_roadmap.md`
- **重疊:**
    - roadmap 檔與 roadmap 整理分類重疊
- **發現:**
    - 異常偵測賣點三方打架
        - **嚴重度:** 高
        - **問題:**
            - 商業模式 LEVEL_3 列異常偵測、主動通知異常消費
            - AI 顧問後端與前端節點皆排除主動推播通知
            - roadmap AI Advisor 段也明文排除主動推播
            - LEVEL_3 四項賣點、唯獨此項無承接節點
        - **修法:**
            - 先拍板推播做不做
            - 要做 → 移除三處排除、補推播節點
            - 不做 → 刪商業模式該賣點、改寫為被動的異常消費標示
    - web console 資料來源兩處打架
        - **嚴重度:** 高
        - **問題:**
            - web_console 節點寫讀取雲端同步資料
            - 商業模式 LEVEL_2 寫資料源為 user 上傳匯出檔
            - cloud_sync 節點明寫備份不對 user 開放取回
            - 雲端同步取回機制在架構上不存在
        - **修法:**
            - 以 cloud_sync 設計為準
            - web_console 的資料源描述改為 user 上傳匯出檔
            - 與商業模式 LEVEL_2 描述對齊
    - logic_engine 節點未自承付費屬性
        - **嚴重度:** 中
        - **問題:**
            - 索引與商業模式皆標 LEVEL_2 付費
            - 節點本文無任何 LEVEL 或付費字樣
        - **修法:**
            - 目的段補付費歸級聲明
            - 比照 macro_data 節點自承企業版付費的寫法
    - 商業模式 LEVEL_0 資料蒐集缺 opt-out 註記
        - **嚴重度:** 中
        - **問題:**
            - root_value 承諾蒐集可在 Settings 內 Privacy 關閉
            - 商業模式 LEVEL_0 的資料蒐集條無 opt-out 註記
        - **修法:**
            - 資料蒐集條補 opt-out 註記、指回 root_value 承諾
            - 擇一處明寫 opt-out 適用所有 LEVEL 與否
    - PremiumContext 等級列舉與授權哲學不一致
        - **嚴重度:** 低
        - **問題:**
            - 功能段硬列 LEVEL_0 到 LEVEL_2
            - 同檔授權邏輯採大於等於 LEVEL_1 即允許、不列舉
        - **修法:**
            - 改為不列舉寫法、自然涵蓋後續層級
    - 商業模式 LEVEL_0 未提外幣帳戶
        - **嚴重度:** 低
        - **問題:**
            - payment 節點寫 LEVEL_0 開放外幣帳戶、匯率自動建立
            - 商業模式 LEVEL_0 段全無外幣與匯率描述
        - **修法:**
            - LEVEL_0 段補一條外幣帳戶描述、與 payment 對齊

---

## 分類 product map 結構收斂

- **目標:**
    - tree 宣告與 detail 檔逐節點對齊
- **動到的檔案:**
    - `no2_product_planning/no2_product_map/structure.md`
    - `no2_product_planning/no2_product_map/app/payment.md`
    - `no2_product_planning/no2_product_map/app/app_setting.md`
    - `no2_product_planning/no2_product_map/app/cloud_sync.md`
    - `no2_product_planning/no2_product_map/firebase/storage.md`
    - `no2_product_planning/no2_product_map/cloud_service/ai_advisor_backend.md`
    - `no2_product_planning/no2_product_map/CLAUDE.md`
- **重疊:**
    - payment 與 ai_advisor_backend 檔與變現賣點定案分類重疊
- **發現:**
    - RedeemCodeScreen 放錯檔
        - **嚴重度:** 中
        - **問題:**
            - tree 歸 ExcludedModule、與 SharedLedger 並列
            - 實體卻以子節點標題寫在 payment 檔內
            - 檔內自承應比照 SharedLedger、卻保留完整節點
        - **修法:**
            - 整段移出 payment 檔
            - 排除決議理由移到歸檔層或 structure 註記
    - Account 子節點名與內容三方矛盾
        - **嚴重度:** 中
        - **問題:**
            - tree 節點名為 LoginLogout
            - Account 詳述只寫登出
            - Preference 摘要又寫登入或登出操作
            - 登入已由 Auth 模組 LoginFlow 承載
        - **修法:**
            - 先定 Account 含不含登入
            - 同步修 tree 節點名、Account 詳述、Preference 摘要三處
            - 釐清與 LoginFlow 的分工
    - storage 索引描述無內容支撐
        - **嚴重度:** 中
        - **問題:**
            - 節點本文僅功能待定義
            - 索引卻標 Firebase 資料備份儲存
            - 實際備份由 firestore 承擔
        - **修法:**
            - 索引描述改為待定義、用途未定
    - SharedLedger 排除決議無紀錄
        - **嚴重度:** 低
        - **問題:**
            - tree 宣告、全圖無詳述節點
            - 讀者查不到排除時間與理由
        - **修法:**
            - 補一段與 RedeemCodeScreen 同格式的決議紀錄
    - tree 與 detail 檔顆粒度落差無約定
        - **嚴重度:** 低
        - **問題:**
            - tree 深五層、detail 標題只到三層
            - 部分深層節點名在 detail 找不到逐字對應
        - **修法:**
            - Product Map 的 CLAUDE.md 補深度約定
            - 依約定收斂未具名的深層節點
    - cloud_sync 標題缺 AppClient 後綴
        - **嚴重度:** 低
        - **問題:**
            - tree 與索引名為 CloudSync 加 AppClient
            - detail 標題漏後綴、同層 Auth 與 Payment 皆有
        - **修法:**
            - 標題補後綴、與同層一致
    - ai_advisor_backend 與 AnalyticsAPI 前瞻指向未對齊
        - **嚴重度:** 低
        - **問題:**
            - AnalyticsAPI 宣告未來服務 LEVEL_3 AI 顧問
            - 後端輸入只寫 Firestore、未提分析管道
            - 兩端皆屬架構待定、非活斷鏈
        - **修法:**
            - 後端做法補一句未來分析資料源指向 AnalyticsAPI

---

## 分類 roadmap 整理

- **目標:**
    - roadmap 項目與 Product Map 節點對得上
- **動到的檔案:**
    - `no2_product_planning/no3_dev_roadmap/no3_dev_roadmap.md`
    - 拆匯出節點時連動 `no2_product_planning/no2_product_map/web_console/web_console.md`
- **重疊:**
    - roadmap 檔的推播排除行屬變現賣點定案分類、勿在本分類動
- **發現:**
    - MVP 缺地基排程
        - **嚴重度:** 高
        - **問題:**
            - MVP 已排登入、離線、雲端同步、解除上限
            - 賴以成立的 Payment、Firebase、LocalDatabase 全未排程
        - **修法:**
            - MVP 段補基礎設施項
            - AnalyticsPipeline 屬刻意延後、掛 Macro Data 或 AI Advisor 段
            - 勿塞進 MVP
    - 匯出項一拆二無對應節點
        - **嚴重度:** 中
        - **問題:**
            - Web Console 段同列進階匯出與報表匯出
            - 對應節點只有單一 ExportFunction
        - **修法:**
            - 合併為單一項
            - 或回 web_console 檔拆出第二個匯出子節點
    - 全檔無完成標記
        - **嚴重度:** 低
        - **問題:**
            - 純 bullet 列項、無進度狀態
        - **修法:**
            - 每階段標題後補一行整體狀態
            - 或逐項加待辦、進行中、已完成前綴
    - MVP 混列付費解鎖項
        - **嚴重度:** 低
        - **問題:**
            - 解除上限、定期交易、CSV 匯入屬 LEVEL_1 解鎖
            - 與模組節點並列同層、分層混淆
            - 多幣別屬 LEVEL_0 與 LEVEL_1 混合、非純付費項
        - **修法:**
            - 逐項標註所屬模組與 LEVEL
            - 或區分功能建置與解鎖兩類

---

## 分類 完整性缺口複核

- **目標:**
    - 先複核再修、九條皆未經對抗複核
    - 每條先自驗 grep 與檔案實況、再決定動不動
- **動到的檔案:**
    - 跨全部三層、依複核結果而定
- **發現:**
    - CFO 資金調度三層全缺席
        - **嚴重度:** 中
        - **問題:**
            - root_value 列資金調度為終極核心
            - Product Map、需求、roadmap 全無承接
        - **修法:**
            - 補節點與排程、或在提案注明遠期不落地
    - 個人版市場參照無節點
        - **嚴重度:** 中
        - **問題:**
            - root_mentality 市場參照指向個人 benchmark
            - MacroData 只服務 B2B、對象不同
        - **修法:**
            - 補個人 benchmark 能力節點、或提案注明遠期
    - MergeOperation 需求與排程雙向缺
        - **嚴重度:** 中
        - **問題:**
            - 節點完整詳述、需求層與 roadmap 皆無對應
        - **修法:**
            - 補需求根因與 roadmap 項、或注明既成實作
    - iOS Widget 無 Product Map 節點
        - **嚴重度:** 中
        - **問題:**
            - 商業模式列免費功能、需求層有完整方案
            - Product Map 全圖無 Widget 節點
        - **修法:**
            - tree 補 Widget 節點、或從前兩層移除懸空承諾
    - roadmap User Management 單位對不上
        - **嚴重度:** 中
        - **問題:**
            - roadmap 列為頂層模組
            - Product Map 把職責拆進 Auth 與 AppSetting
        - **修法:**
            - 統一切分單位、二擇一改 roadmap 或補節點
    - UndoSystem 需求與排程缺
        - **嚴重度:** 低
        - **問題:**
            - 節點完整詳述、需求層與 roadmap 無對應
        - **修法:**
            - 比照 MergeOperation 處理
    - E2 個人化分析為孤兒代號
        - **嚴重度:** 低
        - **問題:**
            - analytics_pipeline 引用四次
            - 全圖無 E2 詳述節點
        - **修法:**
            - 補具名節點、或首段注明 E2 對應節點
    - 自動化輔助落地邊界不明
        - **嚴重度:** 低
        - **問題:**
            - 提案列逐步接手重複性工作為核心策略
            - 落地僅付費規則引擎、AI 分類被排除
        - **修法:**
            - 提案注明初期由規則引擎承接、自動入帳為遠期
    - 家庭帳論據與排除矛盾
        - **嚴重度:** 低
        - **問題:**
            - root_mentality 以家庭帳為規則中心論據
            - SharedLedger 被歸 ExcludedModule
        - **修法:**
            - 提案舉例加註共享帳本本期排除

---

## 駁回誤判模式

- 修復時避免重蹈、複核員駁回 18 條的三個模式
- 把全圖慣例當單檔缺陷
    - 節點本文無狀態標記屬全圖 house style
    - 狀態集中在 structure 索引、單檔補標記反而製造不一致
    - 例外是 macro_data、因違反 will 語氣明文約定
- 把 Local-First 與 Firestore 當互斥
    - 架構本就是 App 讀本地、Firestore 單向備份
    - root_value 自己授權 opt-out 聚合變現
- 要求清單硬一一對映
    - 資料用途清單與 LEVEL 收費項屬正交範疇
    - 願景核心分階交付屬標準 freemium、非矛盾

---

## 不處理清單

- 跨平台 detail 檔標題級數差異
    - app 目錄有 index 檔、模組檔低一級正確
    - 其餘平台無 index、模組檔為獨立文件根
    - 修改反而破壞各檔內部層級
