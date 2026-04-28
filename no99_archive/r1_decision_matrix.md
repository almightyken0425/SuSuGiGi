# R1 雲端架構決策矩陣

## 五輪收斂歷程

- **Round 1 拆題:**
    - 拆出五個子題 A 到 E
    - 提案組合 X 主打 BYOS hardline
    - 提案組合 Y 主打 Firestore 加 opt-in
    - 收斂結果: 無
- **Round 2 反轉:**
    - A 取 A2 加 A3
    - E 取 E2
    - D 改為主動蒐集所有 user
    - 焦點轉為記帳資料儲存位置選擇
- **Round 3 收斂:**
    - 拆出 P Q S 子題
    - 拍 P1 全 user 統一蒐集
    - 拍 Q1 Firestore 加 BigQuery
    - 拍 S3 全球統一
- **Round 4 強制誤判:**
    - 釐清 S3 原意後一度改為 S4 強制蒐集
    - 此版無 opt-out 開關
- **Round 5 校正:**
    - A3 砍除只留 A2
    - BigQuery 延後啟動
    - S 從強制改為 opt-out UX-α

---

## 子題 A 免費版跨裝置遷移

- **A1 完全不支援:**
    - 描述: 換手機等同重新開始
    - 利: 架構最簡，付費誘因強
    - 弊: 流失換手機的 user
- **A2 手動全量檔 已採納:**
    - 描述: JSON ZIP 含 Settings 與所有 entity
    - 利: 使用者完全擁有資料，零後端成本
    - 弊: 手動操作；referential integrity 需 ID mapping 設計
- **A3 自動寫 OS 雲端:**
    - 描述: A2 加上自動寫 iCloud Drive 與 Google Drive App folder
    - 利: 無感跨裝置
    - 弊: iOS 與 Android 平台割裂；需 native 整合，工程量大
- **A4 免費版送雲端同步但配額化:**
    - 利: 留存最高
    - 弊: 架構複雜；變現貢獻低

A3 在 Round 5 被砍除。理由為 user 已有手動 export 後可自選 OS Share Intent 任意位置。涵蓋 iCloud 與 Drive 與 AirDrop 與 Email 等去處。不需要平台做專門的 native 整合。

---

## 子題 P 蒐集範圍

- **P1 全 user 統一蒐集 已採納:**
    - 含免費版
    - 與 S 採 opt-out UX-α 合成後實質意義為面向全 user 預設蒐集
- **P2 只蒐集付費 user**
- **P3 免費版 opt-in 上傳**

---

## 子題 Q 記帳紀錄儲存方案

- **Q1 Firestore 加 BigQuery extension 鏡像 已採納:**
    - 分析友善: 高
    - 月成本: 個位數美元到三十美元範圍
    - vendor lock: 高，綁 Firebase
    - 工程量: 極小，裝 extension 即可
- **Q2 換 Supabase Postgres:**
    - 分析友善: 中
    - 月成本: 零到二十五美元範圍
    - vendor lock: 中
    - 工程量: 大，重做 sync 加 auth
- **Q3 自架 Postgres 加 ClickHouse:**
    - 分析友善: 極高
    - 月成本: 三十到八十美元範圍
    - vendor lock: 低
    - 工程量: 極大
- **Q4 R2 加 S3 加 Parquet 加 DuckDB:**
    - 分析友善: 高
    - 月成本: 五美元以下
    - vendor lock: 低
    - 工程量: 大
- **Q5 App 直寫 BigQuery streaming:**
    - 分析友善: 極高
    - 月成本: 五到二十美元範圍
    - vendor lock: 高
    - 工程量: 中
- **Q6 MongoDB Atlas:**
    - 分析友善: 中
    - 月成本: 零到九美元範圍
    - vendor lock: 中
    - 工程量: 大

採 Q1 理由: 對量級每年每位 user 約 1.5 MB 而言工程量最小，Google 生態整合好。

---

## 子題 Q' BigQuery 啟動時機

- **立即啟動:**
    - 從現在起每筆寫入都鏡像至 BigQuery
    - 啟動時 backfill 成本為零
- **延後啟動 已採納:**
    - 當下不裝 extension
    - 未來啟動時做一次性 backfill
    - backfill 成本: 約三十美元加上數小時加上 Firestore quota 規劃

採延後啟動。觸發條件擇一發生時 enable:

- 個人化分析功能要 ship
- B2B 變現要啟動
- AI 顧問要 ship

延後期間條款 wording 用 will 語氣而非 currently 語氣，避免承諾與實作落差。

---

## 子題 S 法律基礎

- **強制 無開關:**
    - 預設行為: 蒐集
    - 蒐集率: 全部
    - 歐盟合規: 否
    - 加州合規: 否
- **opt-out UX-α 已採納:**
    - 預設行為: 蒐集且不跳通知
    - 蒐集率: 接近全部
    - 歐盟合規: 否
    - 加州合規: 是，toggle 需顯眼
- **opt-out UX-β:**
    - 預設行為: 蒐集且跳單鈕通知
    - 蒐集率: 高於九成
    - 歐盟合規: 否
    - 加州合規: 是
- **opt-in 雙鈕:**
    - 預設行為: 不蒐集
    - 蒐集率: 三到五成
    - 歐盟合規: 是
    - 加州合規: 是
- **嚴格 opt-in:**
    - 預設行為: 不蒐集
    - 蒐集率: 三到五成
    - 歐盟合規: 是
    - 加州合規: 是
- **地區切換 歐美 opt-in 其他 opt-out:**
    - 預設行為: 混合
    - 蒐集率: 高於八成
    - 歐盟合規: 是
    - 加州合規: 是

opt-out UX-α 細節:

- 條款與 toggle 與刪除請求與蒐集說明 整合在 Settings 之下 Privacy 子頁
- 登入頁與 onboarding 完全無條款連結

---

## 子題 E 個人化財務分析執行位置

- **E1 On-device:**
    - 本機規則引擎或小型 ML
- **E2 後端 API 已採納:**
    - user 資料上後端跑分析
- **E3 混合:**
    - 簡單本機加上複雜需 user opt-in 上傳

E2 與 Q1 加延後啟動配合。分析 API 等 BigQuery 啟動後實作。

---

## L4 全量檔與 L3 脫鉤

- A2 全量檔屬於使用者自有副本
- 與 analyticsConsent flag 完全脫鉤
- 即使 user 關閉 toggle，A2 export 功能仍可用
- L4 與付費層級脫鉤，LEVEL_0 同樣享有 A2 export

---

## 法律風險警示

opt-out UX-α 加上條款只在 Settings 之下 Privacy 子頁，對歐美市場合規兩個風險點:

- **GDPR Art.7:**
    - opt-out 不視為有效同意
    - 有效同意必須是 freely given
    - 必須是 specific
    - 必須是 informed
    - 必須是 unambiguous
- **GDPR 與 CCPA notice at collection:**
    - 要求蒐集時或之前明確告知
    - 條款藏 Settings 深處不滿足

短期適用範圍:

- 東亞與東南亞市場為主時可行

中期上歐美前必走 R-future-eu-rework:

- opt-out 改為 opt-in 或地區切換
- 補登入頁與 onboarding 條款連結

---

## Future R Backlog

- **R-bigquery-pipeline:**
    - 觸發條件: E2 或 B2B 或 LEVEL_3 三擇一 ship
    - 內容: firestore-bigquery-export extension 加 analyticsConsent filter 加 analytics API 加一次性 backfill
- **R-future-eu-rework:**
    - 觸發條件: 進歐美市場前
    - 內容: opt-out 改為 opt-in 或地區切換；補登入頁條款

---

## 既有 spec 衝突點與協調

R1 與既有 spec 兩處硬衝突，分別在 root value 立場文件與 subscription gate logic 規格處理:

- **root value 立場文件:**
    - 原句: 主打財務數據只屬於使用者，連開發者都看不到
    - 改寫為: 預設匿名聚合分析可關
    - 個人層級資料不被個別查看或對外揭露
- **subscription gate logic 規格:**
    - 原規則: LEVEL_0 禁止 triggerCloudSync
    - 拆為兩個操作:
        - **triggerCloudBackup:**
            - 全 user 允許
            - 涵蓋 preference 與記帳紀錄寫入 Firestore
        - **triggerMultiDeviceSync:**
            - LEVEL_1 以上才允許
            - 涵蓋多裝置即時同步 UI 與衝突解決
