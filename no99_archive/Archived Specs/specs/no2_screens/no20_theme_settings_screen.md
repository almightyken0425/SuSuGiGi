# 主題設定畫面: ThemeSettingsScreen

## 畫面目標

- **提供:**
  - 瀏覽 App 內建配色主題
- **提供:**
  - 切換並即時預覽主題效果

```text
+--------------------------------+
| < Back      Themes             |
+--------------------------------+
| [ Preview ]   [ Preview ]      |
| Name (Light)  Name (Dark)      |
| [ Selected ]                   |
|                                |
| [ Preview ]   [ Preview ]      |
| Name (Light)  Name (Dark)      |
|                                |
+--------------------------------+
```

---

## UI 佈局

- **頂部導航列:**
    - `返回按鈕`
        - **導航:**
          - PreferenceScreen
    - `標題` 配色主題
- **主題列表:**
    - **UI:**
      - Grid 2 欄位或 List
    - **資料來源:**
      - `ThemeManager.getAvailableThemes()`
    - **主題卡片:**
        - `預覽區`
            - **顯示:**
              - 主題核心配色，包含 Primary, Background, Surface
        - `名稱`
            - **顯示:**
              - 主題名稱，例如海洋藍
        - `標籤`
            - **顯示:**
              - "Light" 或 "Dark"
        - **選取狀態:**
            - **IF 為當前主題:**
                - **UI:**
                  - 顯示打勾圖示或高亮邊框

---

## 核心邏輯

- **資料載入:**
    - **觸發:**
      - 畫面載入 On Mount
    - **獲取:**
      - `ThemeManager` 所有可用主題列表
    - **獲取:**
      - `Settings` 或 Context 中的 `currentThemeId`
- **切換主題:**
    - **觸發:**
      - 點擊任一主題卡片
    - **輸入:**
      - `themeId`
    - **呼叫:**
      - `ThemeManager.setTheme(themeId)`
    - **更新:**
      - Context 中的 `currentTheme`
    - **儲存:**
      - 持久化 `currentThemeId` 到 `Settings` 表
    - **效果:**
      - App UI 即時反應新主題配色

---

## 導航

- **進入:**
    - **來源:**
      - PreferenceScreen
- **退出:**
    - **觸發:**
      - 頂部導航列返回按鈕
    - **導航:**
      - PreferenceScreen
