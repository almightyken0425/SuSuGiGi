# 測試規範

## 核心原則

- **目標:** 確保程式碼品質、穩定性、與規格一致
- **工具:** Jest, React Native Testing Library
- **要求:** 關鍵業務邏輯必須被測試覆蓋

## 測試類型

- **單元測試 Unit Tests**
    - **目標:** 測試獨立的函式、Hook 或輔助工具
    - **範例:**
        - `formatCurrency` 函式
        - `useReportCalculator` Hook
    - **要求:** 應模擬所有依賴
- **元件測試 Component Tests**
    - **目標:** 測試 React 元件的渲染與互動
    - **工具:** React Native Testing Library
    - **要求:**
        - **行為:** 
          - 應專注於使用者可見的行為
          - 透過 `testID` 抓取元件
        - **禁止:** 測試元件的內部狀態或實作細節
- **端對端測試 E2E Tests**
    - **目標:** 模擬完整的使用者流程
    - **工具:** Detox
    - **行為:** 未來考量
    - **範例:**
        - **流程:** 登入 -> 新增支出 -> 回到首頁 -> 確認金額更新
    - **行為:** MVP 階段非強制

## 測試規範

- **位置**
    - **行為:** 測試檔案應與原始碼檔案並存
    - **範例:** `authService.ts` 與 `authService.test.ts`
- **命名**
    - **檔案:** `[filename].test.ts` 或 `[filename].test.tsx`
    - **描述:** `describe` S應說明被測試的單元
    - **案例:** `it` 應說明預期的行為結果
- **PR 要求**
    - **IF** 新增或修改核心邏輯:
        - **要求:** 必須包含相應的測試案例
    - **IF** 僅修改 UI 或重構:
        - **要求:** 必須確保既有測試通過