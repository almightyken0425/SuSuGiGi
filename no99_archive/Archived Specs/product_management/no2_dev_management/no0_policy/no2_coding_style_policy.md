# 程式碼風格規範

## 核心工具

- **Linter:** ESLint
- **Formatter:** Prettier
- **要求:**
    - **行為:** 
      - 提交 PR 前必須通過所有 Lint 檢查
      - 程式碼應在儲存時自動格式化

## 檔案與資料夾命名規範

- **原則:** 確保規格文件與實際開發程式碼之間的命名可預測且一致。
- **`lowercase`**
    - **用途:** 全小寫，用於**通用、工具性質**的資料夾。
    - **範例:**
        - `assets`
        - `components`
        - `constants`
        - `hooks`
        - `locales`
        - `services`
        - `utils`
- **`PascalCase`**
    - **用途:** 大駝峰，用於**特定功能、畫面、或複雜元件**的資料夾。
    - **範例:**
        - `HomeScreen`
        - `TransactionEditor`
        - `AccountManagement`
        - `PieChart`

## 命名規範

- **檔案 - 元件**
    - **風格:** 大駝峰式命名 PascalCase
    - **範例:** 
      - `TransactionEditorScreen.tsx`
      - `CustomPieChart.tsx`
- **檔案 - 服務/輔助/Hook**
    - **風格:** 小駝峰式命名 camelCase
    - **範例:** 
      - `authService.ts`
      - `useAuth.ts`
- **變數與函式**
    - **風格:** 小駝峰式命名 camelCase
    - **範例:**
        - `const transactionDate`
        - `function handleSave()`
- **常數**
    - **風格:** 全大寫蛇底式 SCREAMING_SNAKE_CASE
    - **範例:** 
      - `const THEME_COLORS`
- **介面與型別**
    - **風格:** 大駝峰式命名 PascalCase
    - **禁止:** 使用 `I` 或 `T` 作為型別前綴
    - **範例:** 
      - `interface Account`
      - `type TransactionType`

## React / React Native 規範

- **元件**
    - **偏好:** 函數式元件 Function Components
    - **禁止:** 類別元件 Class Components
- **狀態**
    - **偏好:** Hooks
    - **範例:** `useState`, `useContext`, `useEffect`
- **樣式**
    - **偏好:** `StyleSheet.create`
    - **禁止:** 行內樣式 Inline Styles
    - **行為:** 僅允許在極少數動態樣式情境中使用行內樣式
- **匯入**
    - **順序:**
        - React / React Native 核心
        - 第三方套件
        - 本地 `src` 絕對路徑
        - 本地相對路徑
    - **路徑:**
        - **偏好:** 絕對路徑
        - **行為:** 應設定 `tsconfig.json` 的 `baseUrl` 與 `paths`
- **副作用與資源管理**
    - **要求:** 所有建立監聽 Listener 或 Observer，或計時器 Timer 的副作用，**必須** 在 `useEffect` 的 cleanup function 中清除。
    - **禁止:** 遺漏 `unsubscribe` 或 `clearTimeout` 導致 Memory Leak。
    - **範例:**
      ```typescript
      useEffect(() => {
        const unsubscribe = firestore().onSnapshot(...);
        return () => unsubscribe(); // 必須回傳清除函式
      }, []);
      ```

## TypeScript 規範

- **嚴格模式**
    - **要求:** 必須啟用 `strict` 模式
- **型別**
    - **要求:** 盡可能提供明確型別
    - **禁止:** `any` 型別
    - **替代:**
        - **IF** 型別未知:
            - **行為:** 使用 `unknown`
        - **IF** 故意省略:
            - **行為:** 使用 `eslint-disable-next-line @typescript-eslint/no-explicit-any` 並附上理由

## 註解規範

- **要求:**
    - **行為:** 複雜的業務邏輯、演算法、或 為何如此 的決策必須有註解
    - **行為:** 註解應說明 為何 ，而非 如何
- **待辦**
    - **格式:** `// TODO: 描述未來需執行的任務`
    - **行為:** 應定期清理
- **修復**
    - **格式:** `// FIXME: 描述待修復的問題`