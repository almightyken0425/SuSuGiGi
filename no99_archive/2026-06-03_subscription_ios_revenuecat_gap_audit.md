# 2026-06-03 · Subscription iOS / RevenueCat 缺口盤點

## Context

盤點 SuSuGiGi accounting app 的 subscription 上架待辦，並查核 RevenueCat 是否拔乾淨。

- 範圍：iOS App Store 向。Android 本輪不管。
- 模組：`no2_accounting_app`。
- 背景決策：原本評估用 RevenueCat 當 IAP 中介層，後決議改為 Apple StoreKit 與 Google Play Billing 各自直串、自建封裝層、不留中介。
- 實際串接：impl 用 `react-native-iap` 直串，方向與決策一致。
- 三層 git：Product git（本檔所在）、Spec git `no4_product_specs/no2_accounting_app/`、Impl git `no6_product_development/no2_accounting_app/`。

掃描方式：三層 Explore 掃描 + 逐檔行號驗證。本檔行號為 2026-06-03 當下狀態，後續清理會位移。

---

## 結論摘要

- Product — RevenueCat 決策已記錄，且寫對。RevenueCat 只以被排除選項出現，保留不動。
- Spec — 乾淨，零 RevenueCat 殘留。
- Impl — 沒拔乾淨，5 處殘留。實際在跑的是 `react-native-iap`，RevenueCat 是裝了沒用的死重量。
- Subscription iOS — 核心流程已做，但有 3 項阻擋上架的硬傷尚未補。

---

## RevenueCat 決策確認 — Product 層

決策有寫，位置正確，毋須改動。RevenueCat 在 Product 層只以被排除的選項出現，這正是決策記錄該在的地方。

需求層 `no2_product_planning/no1_requirements/no1_requirements.md`：

- L62 `## 產品收費串接 IAP` 段，選原生 IAP Apple StoreKit + Google Play Billing。
- L76 明列「RevenueCat 已排除」。
- L80 排除理由：引進第三方中介產生額外平台費，考量長期營運成本與去依賴化，改為自建 IAP 封裝層。

Product Map `no2_product_planning/no2_product_map/app/payment.md`：

- L51 `### IAPService — 原生 IAP 封裝`。
- L61 排除項：依賴第三方中介服務例如 RevenueCat 來處理 IAP。

結論：這兩處是刻意的決策記錄，不是殘留，保留不動。清理 RevenueCat 時不要刪這兩段。

---

## RevenueCat 殘留盤點

Spec 層已掃過，零殘留，所有 IAP 描述平台中立，不提 RevenueCat。

Impl 層 5 處殘留，逐欄如下。

| 檔案 | 行 | 內容 | 處置 |
|---|---|---|---|
| `package.json` | L53 | `"react-native-purchases": "^9.6.12"`，全 src 無人 import | 移除此依賴 |
| `package-lock.json` | 9 處 | `@revenuecat/*` 鎖定條目，由上一條 transitive 帶入 | `npm install` 後自動消失 |
| `ios/Podfile.lock` | L1494 / L3319 / L3482 | `PurchasesHybridCommon (17.26.0)`、`RevenueCat (5.52.0)`、`RNPurchases (9.6.13)` 三個 pod | 主 git `pod install` 重生時清掉 |
| `CLAUDE.md` | L7 | 專案概述句寫「Firebase Auth 處理登入，RevenueCat 處理訂閱付費」，過時 | 改寫為原生 IAP `react-native-iap` |
| `CLAUDE.md` | L74 | 全域狀態段寫「`PremiumContext` — RevenueCat 訂閱狀態與 entitlements」，過時 | 改寫為原生 IAP 訂閱狀態 |
| `src/constants/limits.ts` | L9 | 死註解「BUT in standard RevenueCat, null usually means no entitlement?」，在永遠回 false 的 `checkIsPremium` 空殼內 | 清掉註解，順手處理空殼 |

殘留分兩類。lock 與 pod 屬機器產物，移掉 `react-native-purchases` 後由 `npm install` 與 `pod install` 重生即清。`CLAUDE.md` 與 `limits.ts` 屬人寫文字，需手動改。

工具落差提醒：`npm install` 因動到 `package.json`，屬 worktree symlink 規則的唯一例外，需在 worktree 內單獨 npm。`pod install` 不可在 worktree 跑，hook 會擋，需回主 git 執行，自然落在下次 iOS build。

---

## Subscription iOS 缺口

已做、方向對的部分：

- `src/services/iapService.ts` — react-native-iap 封裝，init / 取產品 / 購買 / 還原 / 監聽。
- `src/contexts/PremiumContext.tsx` — 全域 tier 狀態、購買事件監聽、前景刷新。
- `src/screens/Paywall/PaywallScreen.tsx` — 方案選擇、訂閱、還原、價格取自商店。
- `src/constants/entitlements.ts` — product id `susugigi_level1_monthly`、`susugigi_level1_yearly`。
- 功能閘控 — `src/constants/limits.ts` 的 `MAX_FREE_ACCOUNTS=3`、`MAX_FREE_CATEGORIES=10`，加 LEVEL 判斷。
- `src/database/models/User.ts` — `iapEntitlementsJson`、`iapActivePurchasesJson` 欄位。

待辦逐項如下。

| 項目 | 現況 | 缺什麼 | 負責 | 嚴重度 |
|---|---|---|---|---|
| App Store Connect 產品 | 程式內 product id 已定，商店端未建 | 建訂閱群組 + 兩個訂閱產品對上 SKU、定價、本地化、審核資訊 | 人工操作 | 阻擋上架 |
| Paywall 上架合規 | `PaywallScreen.tsx` 只有方案、訂閱、還原、不要 | 自動續訂條款、價格與週期說明、EULA 與隱私權連結、管理訂閱入口，缺則 Apple 3.1.2 退件 | 工程實作 | 阻擋上架 |
| In-App Purchase capability | `ios/` 無 `.entitlements` 檔 | Xcode 補 In-App Purchase capability | 設定，主 git | 阻擋上架 |
| 離線授權快取 | Product Map 定義 PremiumStatusCache，impl 未做；`checkIsPremium` 是空殼永遠回 false | 快取訂閱到期日供離線判斷，落實 `checkIsPremium` | 工程實作 | 中 |
| iapService 健壯化 | `iapService.ts` 含 RNIAP v14 API 版本不確定註解，錯誤處理僅 console.warn | 確認 v14 正確 API、補使用者可見錯誤訊息與重試 | 工程實作 | 低 |
| 沙盒測試 | 無沙盒帳號測試紀錄 | 沙盒帳號跑購買與還原全流程 | 人工操作 | 測試前置 |

Paywall 合規細節：Apple 3.1.2 要求自動續訂訂閱在購買畫面揭露標題、週期、每期價格，並提供可用的隱私權與條款連結，外加說明款項向 Apple ID 收取並自動續訂。`PaywallScreen.tsx` 目前完全沒有這些元素。

離線授權快取細節：Product Map `payment.md` L107 起的 PremiumStatusCache 定義本地 TTL 快取訂閱到期日。impl 端 `PremiumContext.tsx` 無到期日 / TTL / AsyncStorage 處理，每次靠查商店判斷。`limits.ts` 的 `checkIsPremium(expirationDate)` 永遠回 false，是未接線的空殼。

---

## 明確排除項，非缺口

下列項目 Product Map 已明確決策排除，不要列入待辦，也不要當缺口補。

- 伺服器端收據驗證 — `payment.md` PremiumContext 段排除，接受 client-side 付費牆繞過風險。記帳 App 核心價值在資料輸入與報表，防堵成本高於潛在損失。`iapService.ts` L60 的 send receipt to backend 註解屬此決策下的刻意留空，非待辦。
- 裝置數量限制 — `payment.md` 排除，記帳資料隱私性高、共用意願低，對營收影響有限。

---

## 建議執行順序

清理與補洞分三批，依序處理，互不混 branch。

RevenueCat 清理，impl 單層：

- 開 impl worktree，feat branch。
- 移 `package.json` L53 `react-native-purchases`，worktree 內單獨 `npm install` 重生 lock。
- 改 `CLAUDE.md` L7、L74 與 `limits.ts` L9 文字。
- `ios/Podfile.lock` 不手改，留待主 git 下次 `pod install` 自動清。
- 跑 tsc / lint，留 working tree 待 review。

Paywall 上架合規 + IAP capability，impl 為主：

- `PaywallScreen.tsx` 補自動續訂揭露、條款與隱私連結、管理訂閱入口。動 UI 檔須先讀對側 design git paywall 對應檔，過 design-impl 對齊 hook。
- Xcode 補 In-App Purchase capability，主 git。
- App Store Connect 建產品為人工前置。

功能缺口，跨 spec + impl：

- 落實 PremiumStatusCache 離線快取與 `checkIsPremium`。
- iapService 健壯化。

---

## 交叉引用與 open item

- `to_do_list.md` 既有空白 `## paywall` 標頭，本檔為其結構化版本。
- Android 端 IAP 同樣走 react-native-iap，本輪不盤，殘留清理會一併受惠。
- Spec 層 subscription 行為已具備 paywall、購買、還原、閘控規格，但收據解析、SKU 對 tier、到期 / 取消偵測屬 impl 細節，spec 刻意平台中立、不下放。後續補離線快取若牽動行為定義，再回 spec 對應。
