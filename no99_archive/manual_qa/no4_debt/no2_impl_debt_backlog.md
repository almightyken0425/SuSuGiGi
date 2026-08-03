# Impl 技術債 backlog（承接自已刪的 ISSUES.md）

## 這份文件是什麼

- Impl git 曾有問題追蹤檔 `ISSUES.md`，於 impl commit `d8fbd00`（2026-06-12）刪除，其中未結項目自此無承載處
- 本檔承接刪除前最後一版（`d8fbd00^:ISSUES.md`）的全部未結項目，作為 impl 技術債的單一真相；來源已標完成的 5 項不搬
- 與其他檔的分工：`no3_findings/` 各輪缺陷登記收 QA 執行缺陷、同資料夾 `no1_t4_debt_ledger.md` 收 T4 手動不可測規則的自動化債；本檔收 impl 程式面技術債（安全、穩定、品質、整潔）
- 狀態欄語意：**未結**＝來源文件當時未結、尚無反證；**疑已解**＝後續工作有強證據、待逐條複核定案；複核定案後改「已解 + 證據」或回「未結」
- 位置欄記 impl 現況檔位、非來源當時檔位；來源原位查 `d8fbd00^:ISSUES.md`

## 安全性關鍵

| 項目 | 位置（現況） | 狀態 |
| --- | --- | --- |
| IAP 訂閱狀態需伺服器驗證（可偽造訂閱、明文存放） | `PremiumContext.tsx` | 疑已解——`no3_cloud_functions` 已落地收據驗證與 entitlement 體系（verifyTransaction / storeNotification / entitlementStore，測試證據見 `no1_t4_debt_ledger.md` 桶 A R-AU 系列）；client 端快取走 premiumStatusCache。待複核原指涉是否全數覆蓋 |
| 交易輸入驗證不足 | `transactionLogic.ts` | 疑已解——validationGuards 測試群（R-TX-072〜099）與 name-length backstop（R-CM-033/070）顯示驗證層已建。待複核覆蓋面 |

## 穩定性與效能

| 項目 | 位置（現況） | 狀態 |
| --- | --- | --- |
| HomeScreen 強制全 re-render | `HomeScreen.tsx` | 未結——PeriodDataStore 快取體系已建（見 `no1_t4_debt_ledger.md` R-HR 系列），但 re-render 行為本身無複核證據 |
| 同步引擎競合條件 | `syncEngine.ts` | 疑已解——syncEngine 故障注入與 watermark 測試（R-IE-093/105）已覆蓋主要競態。待複核 |
| 缺少全域 Error Boundary | `App.tsx` | 未結 |
| Promise 錯誤未處理 | 多處 | 未結 |
| 幣別換算無匯率時靜默返回原值 | `currencyService.ts` | 待裁定——R-CU-048 測試已把「無匯率回 1、不接力」鎖為預期行為；若視為設計則關閉本項，否則回未結 |

## 程式碼品質

| 項目 | 位置（現況） | 狀態 |
| --- | --- | --- |
| 幣別查詢線性搜尋 | `currencyUtils.ts` | 未結 |
| Firestore 實時監聽器未清除（記憶體洩漏） | context / service 層 | 未結 |
| console.log 正式環境洩露 | 多處 | 未結 |
| `any` 型別濫用 | `AuthContext.tsx`、`iapService.ts` | 未結——syncEngine 已於 `031da8f` 收斂，餘兩檔待處理 |

## 整潔度

| 項目 | 狀態 |
| --- | --- |
| 魔法數字具名常數化 | 未結 |
| 移除空實作 `refreshRates` | 未結 |
| 命名規範不一致（snake / camel 轉換散落） | 未結 |

## 處置節奏

- 逐條複核與關閉在 QA 場次或專項清債主題內進行；關閉時補證據欄（測試檔或 commit）
- 新增 impl 技術債直接列入本檔對應分類，不再回 impl git 開追蹤檔
