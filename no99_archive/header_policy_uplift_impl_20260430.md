# Header Policy Uplift Impl 執行報告 20260430

## 任務脈絡

- SuSuGiGi 過去做過一次 header 重構，參考 LiquidGlassHeaderTemplate
- HomeScreen 已調教完整
- 其他 screen 仍存在 header 蓋住搜尋輸入框
- 完成按鈕風格不一致
- 規範缺失，沒有跨產品 Header 規範總則

---

## 政策層 Branch 結論

- 已 ship hash bc6b04a 與 35cc084
- 政策文件落在 no2_accounting_app spec 模組的 shared_ui_policies header_policy
- 26 個 screen spec 全部標 Header 模式 A 到 E
- 線框圖統一改用 X、checkmark、chevron、Merge icon

---

## 落地層 Branch 改動

### 共用元件

- 新建 useHeaderInset hook
- 新建 HeaderCheckmarkButton 元件
- 新建 HeaderIconButton 元件
- 樣板沿用既有 ModalCloseButton 風格

### 重構範圍

- 12 處 modal-form screen 的 setOptions headerRight 走 HeaderCheckmarkButton
    - TransactionEditor
    - TransferEditor
    - AccountEditor
    - CategoryEditor
    - MergeEditor
    - CurrencyRateEditor
    - ThemeSettings
    - LaunchModeSetting
    - BaseCurrencySetting
    - CurrencyDetailConfig
    - LanguageSetting
    - TimeZoneSetting
- HomeScreen 三顆 inline icon 走 HeaderIconButton
    - 篩選 line.3.horizontal.decrease
    - 搜尋 magnifyingglass
    - 設定 gearshape
- CategoryListScreen 與 AccountListScreen 的合併按鈕改 SF Symbol arrow.triangle.merge
- AppNavigator 移除 RecurringSetting deprecated route 殘留
- 刪除手刻 ModalFormHeader、ModalInfoHeader、PushNavigationHeader 共三檔

### Bug 順帶修復

- SearchScreen 搜尋輸入框緊貼 header 的 sticky 行為失效
- 5 處 list 型 screen 搜尋輸入框被透明 header 蓋住
    - SelectionScreen
    - BaseCurrencySettingScreen
    - CurrencyListScreen
    - CurrencyRateListScreen
    - TimeZoneSettingScreen
- PaywallScreen 缺漏 contentInsetAdjustmentBehavior automatic

### Bug 統一修法

- 引入 useHeaderHeight from react-navigation elements
- 對 sticky 搜尋輸入框 container 加動態 marginTop 或 paddingTop
- 數值取 useHeaderHeight 結果
- 不寫死數字，避免不同裝置變化失準

---

## 不動

- 既有 ModalCloseButton 元件
- AppNavigator 全域 pushScreenOptions
- ImportScreen 既有 getStepTitle 動態 title 邏輯
- react-native-screens patch 與 4.19.0 版本

---

## 驗證

- tsc noEmit 無錯
- ESLint baseline 129 errors 866 warnings 降至 128 errors 822 warnings
- 本 branch 未引入新錯
- grep ModalFormHeader 等 unused header 命中 0
- grep RecurringSetting 命中 0
- grep header 文字按鈕殘留命中 0

---

## 共用元件規格

### useHeaderInset hook

- 包裝 useHeaderHeight from react-navigation elements
- 給純 View 容器使用

### HeaderCheckmarkButton 元件

- SF Symbol checkmark
- size 17 weight semibold scale medium
- enabled 色 theme primary main
- disabled 色 theme text disabled
- padding 10 10
- hitSlop 8 8 8 8

### HeaderIconButton 元件

- 通用 SF Symbol icon 按鈕
- 預設色 PlatformColor label
- 接受 symbol 與 onPress 必填參數
- 接受 color 選填參數覆蓋預設色
- 接受 disabled 選填
- 接受 accessibilityLabel 選填

---

## 後續可考慮的工作

- AppNavigator 兩處 modal group 可合併為一
- modalCloseButton helper 可改用 ModalCloseButton 元件直接渲染
- 移除 13 處 modal-form 既有的 unused TouchableOpacity 與 Text import
- RootStackParamList 部分 param 可加更精準型別
