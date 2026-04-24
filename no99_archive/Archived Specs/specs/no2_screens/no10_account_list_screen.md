# 帳戶列表畫面: AccountListScreen

## 畫面目標

- **提供:**
  - 查看、排序、管理所有帳戶的介面
- **作為:**
  - 新增、編輯特定帳戶的入口

```text
+--------------------------------+
| < Back      Accounts     Merge |
+--------------------------------+
| My Accounts        [+ Add]     |
| [Icon] Account Name      [=]   |
|        Type                    |
| [Icon] Account Name      [=]   |
|        Type                    |
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
    - `標題` 帳戶管理
    - `合併按鈕`
        - **導航:**
          - MergeEditorScreen
        - **參數:**
          - mode = Account
- **帳戶區:**
    - **區塊標題:**
        - `標題` 我的帳戶
        - `新增按鈕`
            - **觸發:**
              - 付費牆檢查
            - **導航:**
              - AccountEditorScreen
    - **帳戶列表:**
        - **UI:**
          - DraggableFlatList
        - **排序:**
          - 依 `sortOrder` 排序
        - **空狀態:**
          - 您尚未建立任何帳戶
        - **列表項目:**
            - `圖示`
            - `名稱`
            - `帳戶類型`
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
      - 所有 `Accounts`
    - **過濾:**
      - `deletedOn` 為 null
    - **排序:**
      - 依 `sortOrder` 初始排序
- **互動:**
    - **點擊項目:**
        - **導航:**
          - AccountEditorScreen
        - **模式:**
          - 編輯
        - **參數:**
          - accountId
    - **拖拉排序:**
        - **行為:**
          - 更新受影響帳戶的 `sortOrder`
        - **儲存:**
          - 寫入本機 DB
        - **欄位:**
          - 必須更新所有受影響帳戶的 `updatedOn`
    - **點擊新增:**
        - **導航:**
          - AccountEditorScreen
        - **模式:**
          - 新增
    - **點擊合併:**
        - **導航:**
          - MergeEditorScreen
        - **參數:**
          - mode = Account
- **付費牆檢查:**
    - **觸發:**
      - 點擊新增按鈕
    - **檢查:**
        - `PremiumLogic.checkPremiumAccess()`
        - `PremiumLogic.checkPremiumAccess()`
        - 檢查全域限制 帳戶 <= 3 AND 類別 <= 10
    - **IF 被限制:**
        - **導航:**
          - PaywallScreen
    - **ELSE:**
        - **導航:**
          - AccountEditorScreen

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
      - AccountEditorScreen 或 PaywallScreen 或 MergeEditorScreen