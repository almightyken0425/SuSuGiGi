# 導航列設計規範: Header Policy

> 已歸檔。
> 最新規範見 Module Spec git 的 no2_accounting_app 模組，路徑為 `no3_product_specs/no2_accounting_app/no2_screens/shared_ui_policies/header_policy.md`。
> 新規範採全 SF Symbol icon 按鈕，廢除 Cancel、Done 文字按鈕。

---

## 佈局結構

- **結構:**
    - `左側操作區`
    - `標題區`
    - `右側操作區`

---

## 按鈕類型與規範

- **推堆疊畫面 Push Navigation:**
    - **適用:**
      - 層級式導航
    - `左側按鈕`
        - **圖示:**
          - `<` Chevron Left
        - **行為:**
          - 返回上一頁
    - `右側按鈕`
        - **屬性:**
          - 可選
        - **內容:**
          - 依畫面需求配置

- **模態視窗表單類 Modal Form:**
    - **適用:**
      - 資料輸入、編輯、設定
    - `左側按鈕`
        - **文字:**
          - Cancel 取消
        - **行為:**
          - 放棄變更並關閉視窗
    - `右側按鈕`
        - **文字:**
          - Done 完成
        - **行為:**
          - 驗證並提交資料
        - **狀態:**
          - 若表單無效應設為 Disabled

- **模態視窗資訊類 Modal Info:**
    - **適用:**
      - 付費牆、公告、說明
    - `左側按鈕`
        - **圖示:**
          - `X` Close Icon
        - **行為:**
          - 直接關閉視窗
    - `右側按鈕`
        - **屬性:**
          - 通常為空
