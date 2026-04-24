# 類別列表畫面: CategoryListScreen

## 畫面目標

- **提供:**
  - 查看、排序、管理所有自訂收入與支出類別的介面
- **作為:**
  - 新增、編輯特定類別的入口

```text
+--------------------------------+
| < Back      Categories   Merge |
+--------------------------------+
| Expense            [+ Add]     |
| [Icon] Category Name     [=]   |
| [Icon] Category Name     [=]   |
|                                |
| Income             [+ Add]     |
| [Icon] Category Name     [=]   |
| [Icon] Category Name     [=]   |
|                                |
|                                |
+--------------------------------+
```

---

## UI 佈局

- **頂部導航列:**
    - `返回按鈕`
        - **導航:**
          - SettingsScreen
    - `標題` 類別管理
    - `合併按鈕`
        - **導航:**
          - MergeEditorScreen
        - **參數:**
          - mode = Category
- **支出區:**
    - **區塊標題:**
        - `標題` 支出
        - `新增按鈕`
            - **觸發:**
              - 付費牆檢查
            - **導航:**
              - CategoryEditorScreen
            - **參數:**
              - categoryType 支出
    - **類別列表:**
        - **UI:**
          - DraggableFlatList
        - **空狀態:**
          - 您尚未建立任何支出類別
        - **列表項目:**
            - `圖示`
            - `名稱`
            - `拖拉圖示`
            - **視覺標示停用:**
                - **條件:**
                  - `disabledOn` 非 null
                - **UI:**
                  - 灰色文字或已停用標籤
- **收入區:**
    - **區塊標題:**
        - `標題` 收入
        - `新增按鈕`
            - **觸發:**
              - 付費牆檢查
            - **導航:**
              - CategoryEditorScreen
            - **參數:**
              - categoryType 收入
    - **類別列表:**
        - **UI:**
          - DraggableFlatList
        - **空狀態:**
          - 您尚未建立任何收入類別
        - **列表項目:**
            - `圖示`
            - `名稱`
            - `拖拉圖示`
            - **視覺標示停用:**
                - **條件:**
                  - `disabledOn` 非 null
                - **UI:**
                  - 灰色文字

---

## 核心邏輯

- **資料載入:**
    - **觸發:**
      - 畫面載入
    - **來源:**
      - 本機 DB
    - **查詢:**
      - 所有 `Categories`
    - **過濾:**
      - `deletedOn` 為 null
    - **分組:**
      - 依 `categoryType` 篩選為支出、收入兩個陣列
    - **排序:**
      - 依 `sortOrder` 初始排序
- **互動:**
    - **點擊項目:**
        - **導航:**
          - CategoryEditorScreen
        - **模式:**
          - 編輯
        - **參數:**
          - categoryId
    - **點擊合併:**
        - **導航:**
          - MergeEditorScreen
        - **參數:**
          - mode = Category
        - **參數:**
          - categoryId
    - **拖拉排序:**
        - **限制:**
          - 僅限在各自區塊內
        - **行為:**
          - 更新受影響類別的 `sortOrder`
        - **儲存:**
          - 寫入本機 DB
        - **欄位:**
          - 必須更新所有受影響類別的 `updatedOn`
- **付費牆檢查:**
    - **觸發:**
      - 點擊任一新增按鈕
    - **檢查:**
        - `PremiumLogic.checkPremiumAccess()`
        - `PremiumLogic.checkPremiumAccess()`
        - 檢查全域限制 帳戶 <= 3 AND 類別 <= 10
    - **IF 被限制:**
        - **導航:**
          - PaywallScreen
    - **ELSE:**
        - **導航:**
          - CategoryEditorScreen

---

## 導航

- **進入:**
    - **來源:**
      - SettingsScreen
- **退出:**
    - **觸發:**
      - 頂部導航列返回按鈕
    - **導航:**
      - SettingsScreen
- **導出:**
    - **觸發:**
      - 點擊列表項目或新增按鈕
    - **導航:**
      - CategoryEditorScreen 或 PaywallScreen 或 MergeEditorScreen