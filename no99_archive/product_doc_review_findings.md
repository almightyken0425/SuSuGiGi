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


---


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
