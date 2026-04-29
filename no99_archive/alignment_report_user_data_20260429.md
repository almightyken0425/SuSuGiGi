# 使用者資料備份與蒐集 — no1 / no2 對齊報告

> **報告建立時間:** 2026-04-29
> **基準:** 本回合 plan susugigi-c-users-ken-chio-doc-ai-compan-goofy-dawn 的 G1 至 G9 決議
> **修改範圍:** Product git 提案層 no1_product_initiation 與需求 / Product Map no2_product_planning，不動 spec 與 impl

---

## 主題範圍

本報告盤點 SuSuGiGi 的使用者資料備份與使用者資料蒐集兩件事，在 Product git 提案層與需求 / Product Map 兩層的對齊狀態。

不涵蓋 spec 層與 impl 層；兩層待後續另開 plan 比對。

---

## 文件位置對照

- Root Value 文件：`no1_product_initiation/no2_root_value.md`
- 商業模式文件：`no1_product_initiation/no3_business_model.md`
- Requirements 需求文件：`no2_product_planning/no1_requirements/no1_requirements.md`
- CloudSync 產品圖：`no2_product_planning/no2_product_map/app/cloud_sync.md`
- Payment 產品圖：`no2_product_planning/no2_product_map/app/payment.md`
- AnalyticsPipeline 產品圖：`no2_product_planning/no2_product_map/cloud_service/analytics_pipeline.md`

---

## 核心決議

### 兩概念分離框架

| 概念 | 對使用者的承諾 | 對應的技術機制 | 適用對象 |
| --- | --- | --- | --- |
| 資料備份 | user 可拿到自己資料的副本 | L4 FullBackupExport JSON ZIP 加 CSV 單表 | 不分 LEVEL 全 user |
| 資料蒐集 | 系統寫入 Firestore 作內部備份與分析來源，user 不取回 | L2 PreferenceSync 加 L3 TransactionBackup | 不分 LEVEL 全 user |

無資料同步概念；跨裝置使用走 user 主動匯出匯入流程銜接。

### 法律基礎分層

| 動作 | 法律基礎 | user 能否阻止 |
| --- | --- | --- |
| L3 TransactionBackup 系統端內部備份 | contract 履行記帳服務契約 | 不能 |
| BigQuery 鏡像供分析、AI、B2B 使用 | consent | analyticsConsent flag 隨時撤回 |

analyticsConsent toggle 全球統一提供，符合歐盟 GDPR、加州 CCPA、巴西 LGPD、日本 APPI、韓國 PIPA、中國 PIPL 等各國隱私法規對退出機制的強制要求。

---

## no1 修改清單

### Root Value 文件

- 隱私章節 opt-out 描述擴大，明寫涵蓋個人化分析、AI 顧問訓練、B2B 聚合資料三種用途
- 改寫 Settings 路徑表達為 Settings 之下 Privacy

### 商業模式文件

- LEVEL_0 補入兩條能力，分別為資料備份提供 JSON ZIP 全量檔加 CSV 單表，以及資料蒐集屬系統端內部備份且 user 不取回
- LEVEL_0 限制條目重寫為帳戶數上限、類別數上限、僅限本地幣別、無定期交易、無資料匯入、無進階報表
- LEVEL_1 價值主張改為解除 LEVEL_0 的功能限制
- LEVEL_1 移除雲端同步、自動備份、基礎自動化三條
- LEVEL_1 改為無上限帳戶與類別、外幣支援、定期交易、資料匯入四條
- LEVEL_2 移除進階匯出整條，含完整 CSV 加 Excel 匯出描述
- LEVEL_2 Web 控制台副說明補入資料來源為 user 主動上傳的全量備份檔，採瀏覽器端儲存

---

## no2 修改清單

### Requirements 需求文件新增主題

- 使用者資料取回
- 使用者資料蒐集的法律基礎
- 分析使用退出機制
- 對外資料輸出的隱私合規
- 訂閱層級與資料機制的關係

### CloudSync 產品圖

- CloudSync 概要表四條軌道改為三條軌道
- 移除 L3 MultiDeviceSync 整段含 ConflictResolution 子段，因為單向 Silent Backup 沒有衝突
- L3 TransactionBackup 之下補入三個子段，分別為 BackupEngine 單向 Delta 上傳、InitialBackup 首次完整上傳、QuotaManagement 寫入配額管控
- QuotaManagement 限縮為 writes only，移除 reads 配額管控，移除 5 分鐘冷卻
- BackupEngine 移除原 SyncEngine 的權限觸發邏輯，改為全 user 都備份不分 LEVEL
- L3 TransactionBackup 移除舊的對 user 開放雲端備份保險與換手機 fallback 描述
- L3 TransactionBackup 改寫為系統端內部冗餘備份用途，明寫法律基礎為 contract
- L4 FullBackupExport 標註為 user 端唯一資料取回管道
- 概要段落補入跨裝置使用場景由 user 主動走匯出匯入流程銜接，無雲端即時同步機制
- L4 軌道概要、標題、功能段落移除 A2 代號，改為自然語言全量檔
- L4 利弊條目移除 R-fullbackup-format 代號，改為待專屬規格落地的自然敘述
- L2 PreferenceSync 利弊移除 cloud_backup entitlement 拆解承接條目，因為完全找不到定義
- L2 PreferenceSync 利弊移除既有 LEVEL_0 禁雲端同步 spec 衝突條目，因為本回合決議後此衝突已消解

### AnalyticsPipeline 產品圖

- ConsentSync 利弊條目移除 R-privacy-page 代號，改為 Privacy 設定子頁專屬規格的自然敘述

### Payment 產品圖

- LEVEL_0 移除禁用雲端同步與備份條目
- LEVEL_1 移除開放雲端同步與每日備份條目

---

## no1 對 no2 對齊結果矩陣

| 項目 | no1 立場 | no2 立場 | 對齊狀態 |
| --- | --- | --- | --- |
| LEVEL_0 資料備份 | LEVEL_0 補入資料備份能力 | CloudSync L4 全 user 享有 | closed |
| LEVEL_0 資料蒐集 | LEVEL_0 補入資料蒐集描述 | CloudSync L3 TransactionBackup 全 user 寫入 | closed |
| 多裝置即時同步 | LEVEL_1 拿掉雲端同步與自動備份 | CloudSync 移除 MultiDeviceSync 整段，Payment 拿掉條目 | closed |
| LEVEL_1 付費差異 | 改為帳戶、類別、外幣、定期交易、資料匯入 | Payment 既有條目延續 | closed |
| 進階匯出歸屬 | LEVEL_2 拿掉進階匯出 | recording_core 既有 CSV 匯出全 user 享有延續 | closed |
| Excel 匯出 | no1 拿掉 Excel 描述，僅留 CSV | no2 既有僅支援 CSV | closed |
| Web 控制台資料來源 | LEVEL_2 副說明補入瀏覽器端儲存 | web_console DataImport 待 web console 落地時再補 | open，已標註 |
| analyticsConsent 涵蓋範圍 | Root Value 擴大為三種用途 | analytics_pipeline 既有 ConsentSync 延續 | closed |
| 資料蒐集法律基礎 | no1 不揭露 Silent Backup | Requirements 新增使用者資料蒐集的法律基礎主題 | closed |
| K-Anonymity 隱私合規 | no1 不寫實作細節 | Requirements 新增對外資料輸出的隱私合規主題 | closed |
| 取消 MultiDeviceSync 決議 | 商業模式 LEVEL_1 拿掉雲端同步條目 | Requirements 新增訂閱層級與資料機制的關係主題 | closed |

---

## 待 no3 spec 比對清單

本回合不處理，留給後續另開 plan 跨層比對。

- subscription gate logic 規格是否仍含 LEVEL_0 禁雲端同步條目，若有應移除
- subscription gate logic 規格的 LEVEL_1 能力差異是否涵蓋本回合新付費差異
- batch sync spec 是否仍存在，若有應廢除
- post auth logic 是否含跨裝置同步初始化邏輯，若有應簡化
- firestore quota logic 是否需重新定義，因為 sync 取消後讀寫量大幅下降
- analytics pipeline 規格是否符合 contract 與 consent 分層
- privacy page 規格 R-privacy-page 落地時需明寫 contract 與 consent 分層
- fullbackup format 規格 R-fullbackup-format 落地

---

## 待 no5 impl 比對清單

本回合不處理，留給後續另開 plan 跨層比對。

- App 端 Sync Engine 程式碼可廢除
- App 端 BatchSync、ConflictResolution、QuotaManagement 模組可廢除
- Settings 之下 Privacy toggle UI 待實作
- analyticsConsent flag 寫入 Firestore 的邏輯待實作
- L4 FullBackupExport JSON ZIP 格式待依規格落地
- App Onboarding 待揭露 contract 與 consent 分層

---

## 待 no99_archive 整理清單

- 既有 spec conflict report 系列中與 LEVEL_0 禁雲端同步、Bootstrap Flow 同步時序、PremiumStatusCache 同步配額相關項目，可標註為本案決議後自動消解

---

## 本案執行所遵照的 skill 與規則

依 plan 第七章執行：

- decision_framework_router skill 啟動
- universal_writing_linter skill 對所有改動執行檢查
- 從 main 開 feat/user-data-alignment branch
- 改動全部留 working tree
- 不主動 commit、merge、push
- 等使用者明確指示
