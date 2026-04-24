# 開發計劃順序

本文件定義 MVP 範圍內的建議開發階段與優先級，並已根據本地優先與混合付費牆新策略更新。

## 基礎建設 Setup

- [ ] 建立 Expo React Native 專案。
    
- [ ] 實作 `src/types/index.ts`，必須包含 `updatedOn` 欄位。
    
- [ ] 建立 `assets/definitions/` 並置入所有標準 JSON 檔案。
    
- [ ] 建立 `src/utils/`，包含格式化、圖標、時間輔助功能。
    
- [ ] 建立 `src/constants/`，用於定義主題色。
    
- [ ] 建立 `src/locales/` 並設定 `i18n.ts`。
    
- [ ] 設定 Firebase 專案，此專案僅用於 Auth。
    

## 本機資料庫 Local-First Architecture

- [ ] 關鍵決策是選擇本機資料庫方案，例如 `SQLite`、`WatermelonDB` 或 `AsyncStorage` 搭配狀態管理。
    
- [ ] 實作本機資料庫的 `Schema`。
    
- [ ] 實作本機資料庫的 CRUD 服務，包含 Create、Read、Update、Delete，例如 `localDbService.ts`。
    
- [ ] 實作 首次啟動流程 ：偵測新用戶，並在**本機資料庫**建立預設資料。
    

## 核心功能與 UI Local CRUD

- [ ] 實作 `AuthContext` 與 `useAuth` Hook，用於登入登出。
    
- [ ] 建立 `LoginScreen.tsx`，包含 UI 與 Google 登入邏輯。
    
- [ ] 建立 App 導航 `AppNavigator.tsx`，根據登入狀態切換 `LoginScreen` 或 `HomeScreen`。
    
- [ ] 建立 `AccountManagement/` 畫面，此為 CRUD 介面，完全對接本機資料庫並處理 3 個帳戶限制。
    
- [ ] 建立 `IconPickerScreen.tsx`。
    
- [ ] 建立 `CategoryManagement/` 畫面，此為 CRUD 介面，完全對接本機資料庫並處理 10 個類別限制。
    
- [ ] 建立 `src/screens/TransactionEditor/`，包含收支與轉帳表單 UI，完全對接本機資料庫。
    
- [ ] 建立 `HomeScreen.tsx`，此為儀表板 UI，完全對接本機資料庫。
    
- [ ] 建立 `SearchScreen.tsx`，此畫面完全對接本機資料庫。
    
- [ ] 建立 `SettingsScreen.tsx` 及 `PreferenceScreen.tsx`，包含 UI、登出、語系切換等功能。
    

## 付費牆與功能解鎖 Monetization

- [ ] 建立 `PaywallScreen.tsx` 的 UI 介面。
    
- [ ] 串接 **RevenueCat** 或類似服務處理 App Store 與 Google Play 訂閱。
    
- [ ] 實作 `PremiumContext` 或狀態 來管理 `isPremiumUser` 狀態。
    
- [ ] 在所有 付費功能觸發點 加入付費牆檢查：
    
    - [ ] 建立第 4 個帳戶 / 第 11 個類別時。
        
    - [ ] 導航至多幣別相關功能 `CurrencyRateScreen`。
        
    - [ ] 導航至 定期交易 建立畫面。
        
    - [ ] 導航至匯入資料 `ImportScreen`。
        
    - [ ] 點擊 立即同步 按鈕。
        

## 付費版功能 Premium Features

- [ ] 關鍵任務是建立批次同步引擎：
    
    - [ ] 實作上傳邏輯 Client-to-Server。
        
    - [ ] 實作下載邏輯 Server-to-Client。
        
    - [ ] 實作 Last Write Wins 衝突解決策略。
        
    - [ ] 實作每日自動觸發邏輯。
        
- [ ] 將立即同步 Sync Now 按鈕包含冷卻機制接入 `PreferenceScreen`。
    
- [ ] 實作多幣別功能，包含跨幣別轉帳與 `CurrencyRateScreen` 的 CRUD。
    
- [ ] 實作定期交易 `Schedules` 功能，包含建立介面與 App 啟動時的本機檢查邏輯。
    
- [ ] 實作 `ImportScreen.tsx` 的 CSV 匯入邏輯。
    

## 測試與打包 Release

- [ ] 完整測試所有功能，特別是本機 CRUD、付費流程、同步引擎與資料還原。
    
- [ ] 準備 App Icon、啟動畫面。
    
- [ ] 準備 App Store 與 Google Play 上架資料，包含隱私權政策與訂閱項目設定。
    
- [ ] 打包並提交審核。