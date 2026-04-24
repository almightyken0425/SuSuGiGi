# 主題管理規格: ThemeManagement

## 邏輯摘要

- **名稱:**
  - ThemeManagement
- **目的:**
  - 負責 App 的主題初始化、切換、持久化以及系統主題跟隨。

## 狀態管理

- **Context / Store:**
    - `currentTheme`
        - **型別:**
          - ThemeObject
        - **說明:**
          - 當前生效的主題物件
    - `currentThemeId`
        - **型別:**
          - String
        - **說明:**
          - 當前主題 ID
    - `isSystemTheme`
        - **型別:**
          - Boolean
        - **說明:**
          - 是否跟隨系統

## 初始化邏輯

- **觸發:**
  - App 啟動
- **讀取:**
  - `Settings` 表中的 `currentThemeId`
- **IF 無設定值，例如首次啟動:**
    - **行為:**
      - 使用預設值 `theme_light_default`
    - **行為:**
      - 或根據系統深淺色決定
- **查找:**
  - 根據 ID 從 `BuiltInThemes` 查找對應的主題物件
- **注入:**
  - 將主題物件注入 App 的 Theme Provider
    - **範例:**
      - React Context 或 Styled Components ThemeProvider

## 切換邏輯

- **觸發:**
  - 使用者選擇新主題
- **輸入:**
  - `themeId`
- **檢查:**
  - `themeId` 是否存在於 `BuiltInThemes`
- **更新 App State:**
    - **更新:**
      - `currentThemeId`
    - **更新:**
      - `currentTheme`
    - **效果:**
      - 觸發 UI 重繪
- **持久化:**
  - 非同步寫入 `Settings` 表
    - **Key:**
      - `currentThemeId`
    - **Value:**
      - `themeId`
- **Analytics:**
  - 發送 Analytics 事件

## 擴充性設計

- **遠端主題 Remote Themes:**
    - **來源:**
      - Server 下載 JSON 格式定義
    - **儲存:**
      - 本地資料庫 `Themes` 表
    - **優先級:**
      - 初始化時優先查找本地 `Themes` 表，再查找 `BuiltInThemes`
