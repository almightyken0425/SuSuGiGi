# R1 雲端架構決策矩陣

本文件保留 R1 五輪收斂的完整方案空間與最終拍板。執行細節見 `refactor_plan.md` R1 段落。

---

## 五輪收斂歷程

| 輪次 | 主要動作 | 拍板項目 |
|------|---------|---------|
| Round 1 | 拆 5 子題 A/B/C/D/E，提組合 X（BYOS hardline）vs 組合 Y（Firestore + opt-in） | （未拍板） |
| Round 2 | 方向反轉：A 取 A2 + A3；E 取 E2；D 改為主動蒐集所有 user，重點變成「記帳資料存哪裡適合分析」 | A2 + A3 / E2 |
| Round 3 | 拆 P/Q/S/D1/D2 子題；拍 P1 全 user / Q1 Firestore + BigQuery / S3 全球統一 | P1 / Q1 / S3 |
| Round 4 | 釐清 S3 原意 → 改為 S4 強制蒐集（無 opt-out 開關） | S4 |
| Round 5 | 修正：A3 砍掉只留 A2；BigQuery 延後啟動；S 從強制改為 opt-out UX-α | A2 only / BigQuery 延後 / opt-out UX-α |

---

## 子題 A：免費版跨裝置遷移

| 方案 | 描述 | 利 | 弊 |
|------|------|----|----|
| A1 | 完全不支援 | 架構最簡，付費誘因強 | 流失換手機 user |
| **A2 ✅** | 手動 export/import 全量檔（JSON ZIP，含 Settings + 所有 entity） | 使用者完全擁有資料；零後端成本 | 手動操作；referential integrity 需 ID mapping 設計 |
| A3 | A2 + 自動寫 OS 雲端（iCloud Drive / Google Drive App folder） | 無感跨裝置 | iOS/Android 平台割裂；需 native 整合（工程量大） |
| A4 | 免費版送雲端同步但配額化 | 留存最高 | 架構複雜；變現貢獻低 |

**Round 5 拍板 A2 only**：A3 砍掉，user 已有手動 export 後可自選 OS Share Intent 任意位置（iCloud / Drive / AirDrop / Email…），不需要我方做專門 native 整合。

---

## 子題 P：誰的資料進 L3 後端

| 方案 | 描述 |
|------|------|
| **P1 ✅** | 全 user 統一蒐集（含免費版） |
| P2 | 只蒐集付費 user |
| P3 | 免費版 opt-in 上傳 |

**拍板 P1**：與 S（opt-out UX-α）合成後實質意義為「面向全 user 預設蒐集」。

---

## 子題 Q：L3 記帳紀錄儲存方案

| 方案 | 描述 | 分析友善 | 月成本 | vendor lock | 工程量 |
|------|------|---------|--------|-------------|--------|
| **Q1 ✅** | Firestore + BigQuery extension 鏡像 | 高 | $5-30 | 高（Firebase） | **極小**（裝 extension） |
| Q2 | 換 Supabase（Postgres） | 中 | $0-25 | 中 | 大（重做 sync + auth） |
| Q3 | 自架 Postgres + ClickHouse | 極高 | $30-80 | 低 | 極大 |
| Q4 | R2/S3 + Parquet + DuckDB | 高 | <$5 | 低 | 大 |
| Q5 | App 直寫 BigQuery streaming | 極高 | $5-20 | 高 | 中 |
| Q6 | MongoDB Atlas | 中 | $0-9 | 中 | 大 |

**拍板 Q1**：對 SuSuGiGi 資料量級（1.5 MB/year per user）工程量最小、Google 生態整合好。

---

## 子題 Q'：BigQuery 啟動時機

| 方案 | 描述 | 啟動時 backfill 成本 |
|------|------|---------------------|
| 立即啟動 | 從現在每筆寫入都 mirror 到 BigQuery | 0 |
| **延後啟動 ✅** | 當下不裝 extension，未來啟動時做一次性 backfill | ~$30 + 數小時 + Firestore quota 規劃 |

**拍板延後啟動**。觸發條件擇一發生時 enable：
- (a) E2 個人化分析功能要 ship
- (b) macro_data.md B2B 變現要啟動
- (c) LEVEL_3 AI 顧問要 ship

延後期間條款 wording 用「我們將會匿名聚合分析」而非「我們正在分析」。

---

## 子題 S：法律基礎

| 方案 | 預設行為 | 蒐集率 | 歐盟合規 | 加州合規 |
|------|---------|--------|---------|---------|
| 強制（無開關） | 蒐集 | 100% | 否 | 否 |
| **opt-out UX-α ✅** | 蒐集（不跳通知） | 99%+ | 否 | 是（toggle 需顯眼） |
| opt-out UX-β | 蒐集（跳單鈕通知） | 95%+ | 否 | 是 |
| opt-in 雙鈕 | 不蒐集 | 30-50% | 是 | 是 |
| 嚴格 opt-in | 不蒐集 | 30-50% | 是 | 是 |
| 地區切換（歐美 opt-in / 其他 opt-out） | 混合 | 80%+ | 是 | 是 |

**拍板 opt-out UX-α**：條款 + toggle + 刪除請求 + 蒐集說明 整合在 Settings > Privacy 子頁。登入頁/onboarding 完全無條款連結。

---

## 子題 E：個人化財務分析執行位置

| 方案 | 描述 |
|------|------|
| E1 | On-device（本機規則引擎 / 小型 ML） |
| **E2 ✅** | 後端 API（user 資料上後端跑分析） |
| E3 | 混合：簡單本機 + 複雜需 user opt-in 上傳 |

**拍板 E2**：與 Q1 + 延後啟動配合，分析 API 等 BigQuery 啟動後實作。

---

## L4 全量檔（與 L3 脫鉤）

A2 全量檔屬於使用者自有副本，**與 analyticsConsent flag 完全脫鉤**。即使 user 關閉 toggle，A2 export 功能仍可用。

L4 也與付費層級脫鉤——LEVEL_0 同樣享有 A2 export。

---

## 法律風險警示

**opt-out UX-α + 條款只在 Settings > Privacy 子頁**，對歐美市場合規有兩個風險：

1. **GDPR Art.7**：opt-out 不視為有效同意（需 freely given, specific, informed, unambiguous）
2. **GDPR/CCPA "notice at collection"**：要求蒐集時或之前明確告知；條款藏 Settings 深處不滿足

**短期可行**（東亞/東南亞市場為主時 OK），**中期上歐美前必走 R-future-eu-rework**：
- (1) opt-out 改為 opt-in 或地區切換
- (2) 補登入頁/onboarding 條款連結

---

## Future-R Backlog

| Future R | 觸發條件 | 內容 |
|----------|---------|------|
| R-bigquery-pipeline | E2 / B2B / LEVEL_3 三擇一 ship | firestore-bigquery-export extension + analyticsConsent filter + analytics API + 一次性 backfill |
| R-future-eu-rework | 進歐美市場前 | opt-out → opt-in 或地區切換；補登入頁條款 |

---

## 既有 spec 衝突點與協調

R1 拍板與既有 spec 兩處硬衝突，分別在 `no2_root_value.md` 與 `no17_subscription_gate_logic.md` 處理：

1. **`no2_root_value.md`** L48「主打財務數據只屬於使用者，連開發者都看不到」→ 改寫為「預設匿名聚合分析（可關），個人層級資料不被個別查看或對外揭露」

2. **`no17_subscription_gate_logic.md`** L29 + L96-100「LEVEL_0 禁止 triggerCloudSync」→ 拆為兩個操作：
   - `triggerCloudBackup`：全 user 允許（preference + 記帳紀錄寫入 Firestore）
   - `triggerMultiDeviceSync`：LEVEL_1+ 才允許（多裝置即時同步 UI 與衝突解決）
