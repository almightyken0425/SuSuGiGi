# 四層對齊盤點發現 記帳 App

## 文件用途

- 記錄 2026-06-10 多 agent workflow 的四層對齊盤點結果
- 範圍為 module `no2_accounting_app`
- 比對 Product Map、Design、Spec、Impl 四層
- 純 review 產物、未動任何受審檔案
- 修補主題各開 worktree 處理
- 主題處理完可刪對應章節
- 全部處理完可刪本檔

---

## 審查方法

### 流程

- canonical 清單建置 → 逐單位比對 → Product Map 反向落地
- 清單建置合併三層命名差異、以語意配對
- 三層編號不一致、不以編號配對
- 逐單位比對共 56 個單位、每單位一個 agent
- 每單位同時上溯 Product Map 節點
- 反向落地檢查每個 app 節點的下游覆蓋

### 顆粒度

- 畫面比對 design、spec、impl 三層
- 邏輯與 data model 比對 spec、impl 兩層
- 邏輯與 data model 無 design 層
- Product Map 為粗粒度節點
- 一個節點對應多個下游單位

### 仲裁流向依據

- 依產品註冊表的 sub_mapping
- 畫面視覺與互動由 design 仲裁、spec 與 impl 跟進
- 元件由 design 仲裁、impl 與 spec 跟進
- 視覺 token 由 design 仲裁、impl 跟進
- data model 由 spec 仲裁、impl 跟進
- logic 由 spec 仲裁、impl 跟進

### drift 方向定義

- design 領先: design 已定案、其他層未跟
- spec 領先: spec 有規則、impl 未實作
- impl 領先: impl 有行為、spec 未承載
- 雙向: 多方向並存
- 對齊: 無結構性差異

### 嚴重度定義

- 高: 缺整層或行為矛盾
- 中: 結構性 drift
- 低: 命名或小差異
- 無: 對齊

### 排除範圍

- Product Map 的 cloud_service、external_service、web_console 標 future、未納
- Product Map 的 firebase 群組屬 BaaS 配套、未納
- design 的 50_explorations 與 99_deprecated 未納

---

## 總結

- 56 個單位全數完成比對、零漏單
- 嚴重度分布: 高 3、中 32、低 17、無 4
- app 節點 8 個、7 個 landed、1 個 unlanded
- 孤兒下游僅 1 個
- 病灶集中 spec 層
- 高風險全與 spec 相關
- 一件為 impl 違反 spec 明文禁令
- 兩件為核心邏輯整層無 spec
- 中度最大宗為 spec 落後 design 與 impl

---

## 高風險發現

### Firestore listener 違規

- **嚴重度:** 高
- **單位:** `preference_sync_logic`
- **問題:**
    - spec 明文禁止 Firestore Real-time listener
    - impl 在 `PreferenceContext` 以 onSnapshot 訂閱偏好下行
    - 屬違規、非漂移
    - 影響配額消耗與離線行為假設
    - LWW 時間戳欄位兩層不一致
    - spec 寫 `preferences.updatedAt`
    - impl 存文件根層級 `updatedAt`
- **修法:**
    - 先拍板 listener 政策
    - 維持禁令 → impl 拆 listener、改主動拉取
    - 解禁 → 修 spec、補配額影響描述
    - 時間戳欄位同次對齊

### 本機持久層無規格

- **嚴重度:** 高
- **單位:** `local_db_service`
- **問題:**
    - 選擇器排除停用與軟刪、規則只在 impl
    - user_id 多租戶隔離、規則只在 impl
    - spec 層無對應文件
    - account 與 category 的 logic spec 也未涵蓋查詢行為
    - 持久層是所有 logic 的地基
    - 無仲裁文件、改壞無人擋
- **修法:**
    - 補一份 logic spec
    - 涵蓋查詢選擇器與租戶隔離規則

### 首頁期間狀態無規格

- **嚴重度:** 高
- **單位:** `home_period_state`
- **問題:**
    - 期間偏移規則只在 impl
    - 帳戶選取生命週期只在 impl
    - 最近十五期報表快取淘汰只在 impl
    - 無 logic spec 可仲裁
    - `no13_home_report_logic.md` 歸給 buildPeriodReport 的查詢聚合
    - 實際落在 `PeriodDataStore.processData`
    - screen spec 僅涵蓋互動表面
- **修法:**
    - 補首頁期間狀態 logic spec
    - 同次修正 `no13_home_report_logic.md` 的歸屬描述

### 批次同步政策矛盾

- **嚴重度:** 中、影響面大
- **單位:** `app_bootstrap_logic`
- **問題:**
    - 該 spec 寫 premium 限定批次同步
    - cloud_sync 節點寫全 user 不分訂閱層級
    - batch_sync spec 與 impl 都站全員側
    - 三方一致、矛盾源頭在 bootstrap spec 殘句
- **修法:**
    - 修 bootstrap spec 對齊全員政策
    - 同次清理該 spec 的時區檢查日條件描述

---

## 下游同步矩陣 畫面

| 單位 | Design | Spec | Impl | drift | 嚴重度 | 節點 |
|---|---|---|---|---|---|---|
| `home_screen` | 有 | 有 | 有 | 雙向 | 中 | home_dashboard |
| `home_filter_screen` | 有 | 有 | 有 | 雙向 | 中 | home_dashboard |
| `search_screen` | 有 | 有 | 有 | 雙向 | 中 | home_dashboard |
| `transaction_editor_screen` | 有 | 有 | 有 | 雙向 | 中 | recording_core |
| `transfer_editor_screen` | 有 | 有 | 有 | 雙向 | 中 | recording_core |
| `recurring_setting_screen` | 有 | 有 | 有 | 對齊 | 無 | recording_core |
| `settings_screen` | 有 | 有 | 有 | impl 領先 | 低 | app_setting |
| `category_list_screen` | 有 | 有 | 有 | 雙向 | 中 | app_setting |
| `category_editor_screen` | 有 | 有 | 有 | spec 領先 | 中 | recording_core |
| `account_list_screen` | 有 | 有 | 有 | 雙向 | 中 | app_setting |
| `account_editor_screen` | 有 | 有 | 有 | impl 領先 | 中 | app_setting |
| `merge_editor_screen` | 有 | 有 | 有 | impl 領先 | 中 | recording_core |
| `data_management_screen` | 有 | 有 | 有 | spec 領先 | 中 | app_setting |
| `import_screen` | 有 | 有 | 有 | 雙向 | 中 | app_setting |
| `preference_screen` | 有 | 有 | 有 | spec 領先 | 中 | app_setting |
| `theme_settings_screen` | 有 | 有 | 有 | 對齊 | 無 | app_setting |
| `launch_mode_setting_screen` | 有 | 有 | 有 | design 領先 | 低 | app_setting |
| `base_currency_setting_screen` | 有 | 有 | 有 | design 領先 | 低 | app_setting |
| `currency_list_screen` | 有 | 有 | 有 | design 領先 | 中 | app_setting |
| `currency_detail_config_screen` | 有 | 有 | 有 | spec 領先 | 低 | app_setting |
| `currency_rate_list_screen` | 有 | 有 | 有 | 雙向 | 中 | app_setting |
| `currency_rate_editor_screen` | 有 | 有 | 有 | 雙向 | 中 | app_setting |
| `language_setting_screen` | 有 | 有 | 有 | 對齊 | 無 | app_setting |
| `time_zone_setting_screen` | 有 | 有 | 有 | spec 領先 | 低 | app_setting |
| `login_screen` | 有 | 有 | 有 | 雙向 | 低 | auth |
| `paywall_screen` | 有 | 有 | 有 | 雙向 | 低 | payment |
| `debug_info_screen` | 豁免 | 缺 | 有 | impl 領先 | 低 | 無 |
| `debug_info_by_category_screen` | 豁免 | 缺 | 有 | impl 領先 | 低 | local_database |
| `mock_data_settings_screen` | 缺 | 缺 | 有 | impl 領先 | 中 | app_setting |

---

## 下游同步矩陣 邏輯與資料模型

| 單位 | Design | Spec | Impl | drift | 嚴重度 | 節點 |
|---|---|---|---|---|---|---|
| `app_bootstrap_logic` | 不適用 | 有 | 有 | 雙向 | 中 | app_setting |
| `login_logout_logic` | 不適用 | 有 | 有 | spec 領先 | 中 | auth |
| `post_auth_logic` | 不適用 | 有 | 有 | 雙向 | 中 | auth |
| `batch_sync_logic` | 不適用 | 有 | 有 | impl 領先 | 低 | cloud_sync |
| `settings_management` | 不適用 | 有 | 有 | 雙向 | 中 | app_setting |
| `premium_logic` | 不適用 | 有 | 有 | impl 領先 | 中 | payment |
| `currency_conversion_logic` | 不適用 | 有 | 有 | 雙向 | 中 | home_dashboard |
| `transfer_logic` | 不適用 | 有 | 有 | impl 領先 | 中 | recording_core |
| `transaction_logic` | 不適用 | 有 | 有 | impl 領先 | 中 | recording_core |
| `recurring_transactions_logic` | 不適用 | 有 | 有 | impl 領先 | 低 | recording_core |
| `undo_logic` | 不適用 | 有 | 有 | impl 領先 | 中 | recording_core |
| `firestore_quota_logic` | 不適用 | 有 | 有 | 雙向 | 中 | cloud_sync |
| `home_report_logic` | 不適用 | 有 | 有 | 雙向 | 中 | home_dashboard |
| `category_logic` | 不適用 | 有 | 有 | spec 領先 | 中 | app_setting |
| `account_logic` | 不適用 | 有 | 有 | spec 領先 | 中 | recording_core |
| `merge_logic` | 不適用 | 有 | 有 | impl 領先 | 中 | recording_core |
| `subscription_gate_logic` | 不適用 | 有 | 有 | 對齊 | 無 | payment |
| `preference_sync_logic` | 不適用 | 有 | 有 | impl 領先 | 高 | cloud_sync |
| `transaction_backup_logic` | 不適用 | 有 | 有 | impl 領先 | 低 | cloud_sync |
| `data_transfer_logic` | 不適用 | 有 | 有 | impl 領先 | 低 | app_setting |
| `local_db_service` | 不適用 | 缺 | 有 | impl 領先 | 高 | local_database |
| `firebase_infra` | 不適用 | 缺 | 有 | impl 領先 | 低 | auth |
| `database_adapter_infra` | 不適用 | 缺 | 有 | impl 領先 | 低 | local_database |
| `mock_data_tooling` | 不適用 | 缺 | 有 | impl 領先 | 低 | local_database |
| `home_period_state` | 不適用 | 缺 | 有 | impl 領先 | 高 | home_dashboard |
| `ui_behavior_hooks` | 不適用 | 缺 | 有 | impl 領先 | 中 | recording_core |
| `accounting_data_models` | 不適用 | 有 | 有 | 對齊 | 低 | local_database |

---

## 畫面逐項發現

- `home_screen`
    - design 缺轉帳紀錄列還原
    - design fixtures 無轉帳資料
    - spec 與 impl 轉帳列皆完整
    - design 分組預設全展開
    - spec 與 impl 預設收合、與 design 相反
- `home_filter_screen`
    - spec 定義下滑關閉手勢
    - impl 用 fullScreenModal、無此手勢
    - spec 的暗化未選卡描述與 design 定案不符
    - design 有 no-accounts 變體
    - spec 未文件化該變體
- `search_screen`
    - spec 與 design 定義多幣別換算副文字
    - impl 未實作該副文字
    - spec 與 impl 有轉帳結果列
    - design 缺轉帳結果列
    - impl 多 focus 返回重查與 loading 過場
    - spec 未載這兩項
- `transaction_editor_screen`
    - design 與 impl 互相對齊、spec 落後兩者
    - spec 未跟 design 的計算機鍵盤
    - spec 未跟定期鈕位置與並排 picker
    - spec 漏 impl 的刪除確認
    - spec 漏一般交易轉定期路徑
- `transfer_editor_screen`
    - spec 寫跨幣別才顯示箭頭與轉入框
    - spec 要求顯示隱含匯率
    - design 與 impl 為恆顯雙欄
    - 同幣別時 disabled、無匯率顯示
    - impl 的編輯轉定期重建排程、spec 未載
    - impl 的刪除確認框、spec 未載
    - `DualPickerBox` 已跨畫面共用
    - design 未促升入 20_components
- `recurring_setting_screen`
    - 三層內容與行為對齊
    - 含永不選項保留挑選器日期等細節
    - 工件走元件軸、非畫面軸
    - design 位於 20_components
    - impl 位於 `src/components/RecurringOptions.tsx`
    - 畫面軸 trace 不到屬清單誤判、非缺層
- `settings_screen`
    - impl 多出版本號文字
    - design 與 spec 皆未載
    - Debug 區塊屬 design 已載的 dev-only 例外
    - 其餘三組結構、token、五項導航三層對齊
- `category_list_screen`
    - spec 要求空清單提示
    - design 與 impl 皆缺該提示
    - reorderCategories 內聯在畫面、未成 logic 單元
    - design 定停用字樣與行高 58
    - impl 顯示關閉字樣、行高寫死 60
- `category_editor_screen`
    - spec 要求完成鈕先呼叫 canUserPerformAction
    - spec 要求禁止時導航 PaywallScreen
    - impl 的 handleSave 無此卡點
    - 僅靠列表頁入口把關
    - spec 的刪除失敗錯誤提示、impl 未實作
    - 疑似付費閘 realign 後的 spec 殘留
- `account_list_screen`
    - spec 定義標題 `我的帳戶`、空列表提示、拖拉圖示
    - design 定案與 impl 皆無此三項
    - spec 未跟 design 仲裁
    - impl 末段留白寫死 100
    - design token SPACING 5xl 為 64、未跟
- `account_editor_screen`
    - impl 經付費閘 realign、已移除 useForeignCurrency
    - createAccount 閘改設列表頁入口
    - spec 完成按鈕仍殘留兩道攔截
    - spec 引用的動作識別碼已自 gate logic 刪除
    - spec 寫停用此帳戶開關
    - design 與 impl 為啟用開關、語意相反
- `merge_editor_screen`
    - impl 多合併前確認彈窗、spec 未載
    - impl 多 id 預選進入參數、spec 未載
    - impl 已抽共用 `DualPickerBox` 與 token
    - design 仍留畫面私有 MergePickerBox
    - 未依元件促升規則跟進
- `data_management_screen`
    - spec 要求清除資料庫刪所有資料表
    - impl 只清七表
    - 漏 `users` 與 `currency_configs`
    - 其餘佈局、權限查核、匯入匯出三層對齊
- `import_screen`
    - spec 的送出付費閘、impl 未做
    - 閘僅做在 DataManagement 入口
    - 對應 i18n key 閒置
    - spec 的無符合欄位提示、impl 未做
    - `step4` 匯入摘要、impl 未跟 design 的標題加資料列結構
    - design 缺時區說明文字
    - design 缺 transfer 變體
- `preference_screen`
    - spec 規定未登入顯示登入按鈕
    - impl 固定只有登出
    - design 無登入態變體
    - spec 要求登出失敗顯示錯誤提示
    - impl 無 catch、未實作
- `theme_settings_screen`
    - 三層結構與行為對齊、無發現
- `launch_mode_setting_screen`
    - 三層結構與互動一致
    - spec 三條互動 impl 全做到
    - spec 首選項仍寫 Default
    - design 與 impl 已定名 home 首頁
    - spec 命名未跟仲裁端
- `base_currency_setting_screen`
    - 結構三層全對齊
    - Header C、Bottom Pill 搜尋、選取凍結排序、空狀態一致
    - spec 搜尋 placeholder 寫貨幣關鍵字
    - design 與 impl 用通用搜尋字串
    - 同寫法遍布選擇類 spec、屬系統性文案差
- `currency_list_screen`
    - spec 仍寫長 list 邊到邊分隔
    - spec placeholder 仍寫貨幣關鍵字
    - design 已定案群組卡片與通用搜尋
    - impl 已跟進 design
    - 核心行為與空狀態三層對齊
    - 僅 spec 視覺描述過期
- `currency_detail_config_screen`
    - spec 重置互動指名呼叫 resetCurrencyFormat
    - impl 繞過封裝、直接呼叫 setCurrencyFormat 帶 null
    - 行為等價
    - 其餘區塊結構、預設位數、儲存流程一致
- `currency_rate_list_screen`
    - spec 仍寫邊到邊 hairline 長列表
    - spec 漏空狀態與搜尋無結果行為
    - 落後 design 群組卡片與 impl 既有功能
    - design 與 impl 的空狀態文案 icon 小幅不一致
    - 搜尋 placeholder 與 header 標題小幅不一致
- `currency_rate_editor_screen`
    - spec 只寫新增模式
    - design 與 impl 已有 update 模式
    - design 缺幣別選擇 modal 視覺
    - spec 與 impl 已有該 modal
    - spec 要求未填妥不可點完成鈕
    - impl 只在儲存中鎖定
    - 按下後才以錯誤提示驗證
- `language_setting_screen`
    - 三層結構與行為對齊、無發現
- `time_zone_setting_screen`
    - spec 搜尋 placeholder 寫時區關鍵字
    - design 與 impl 用通用 `common.search`
    - 其餘結構、排序凍結、空狀態、互動對齊
- `login_screen`
    - spec 與 impl 有載入中旋轉指示
    - design 僅 default 變體
    - loading 視覺未補、design 已自列待補
    - 主結構三段、token、登入行為對齊
- `paywall_screen`
    - design 缺商品載入中變體
    - spec 與 impl 皆有該變體
    - spec 按鈕文案寫 `恢復購買` 與 `不用了謝謝`
    - design 與 impl 為 `還原購買` 與 `暫不升級`
    - spec 文案落後兩層
- `debug_info_screen`
    - impl 獨有 dev-only 資料庫統計畫面
    - spec 全無記載
    - design 明文豁免三個 debug 工具
    - 僅 spec 端缺豁免聲明
    - Product Map 無節點承載開發工具、屬孤兒
- `debug_info_by_category_screen`
    - dev-only 偵錯畫面、僅 impl 存在
    - design 已明文豁免
    - spec 連豁免記載都沒有
- `mock_data_settings_screen`
    - 畫面僅存在 impl
    - design 與 spec 整層皆缺
    - 含清空資料庫與產生 mock 資料
    - 兩項皆破壞性操作
    - 屬 dev 與 TestFlight 限定工具
    - production 不可達
    - 缺層屬刻意未納上游

---

## 邏輯逐項發現

- `app_bootstrap_logic`
    - 啟動導航落點與付費牆閘控對齊
    - impl 對全登入者觸發批次同步
    - spec 的 premium 閘門未被跟進
    - 定期交易補產生改用逐排程時間戳
    - spec 的時區檢查日條件未被跟進
    - 未登入導 Login 屬 spec 未寫的 impl 行為
    - 前景 resume 同步亦同
    - **衝突:**
        - spec 的 premium 限定批次同步與 cloud_sync 節點矛盾
        - 背景任務段兼涉 payment、recording_core、cloud_sync
        - 跨節點混雜、僅導航段屬 app_setting
- `login_logout_logic`
    - spec 要求登出清除本地 Premium 快取
    - impl 僅重設記憶體狀態
    - 持久化快取未清
    - spec 的登出失敗強制清 session token 分支
    - impl 只顯示錯誤、未實作
- `post_auth_logic`
    - spec 要求本地無 Settings 時以雲端偏好寫入
    - impl 直接 return
    - spec 要求 IAP 查詢後更新本地 Premium 狀態
    - impl 查詢結果棄用
    - impl 在雲端文件存在分支加跑冪等 initializeNewUser
    - spec 內視 Premium 決定上雲的殘句自相矛盾
- `batch_sync_logic`
    - impl 增設初次備份完成旗標
    - 完成後不再探測雲端、直接走 delta
    - spec 未載此機制
    - resetSyncState 連帶清除該旗標
    - 並多載 L4 匯入用途
- `settings_management`
    - spec 的 initializeTheme 依系統深淺色取預設
    - 預設識別碼 theme_light_default 不存在
    - impl 未實作、固定落 theme1
    - impl 的 resetCurrencyFormat 無紀錄時新建一筆
    - 主幣上雲改帶 currency 代碼欄位
    - 後兩項 spec 未寫
- `premium_logic`
    - spec 三段核心皆已實作
    - 到期判斷一致
    - impl 多 mockTier 與 launch gate
    - impl 多 AppState 自動刷新與登出降級
    - 皆 spec 未載
    - premiumLogic.ts 內容實屬 SubscriptionGateLogic
    - 掛本單位屬歸檔錯位
- `currency_conversion_logic`
    - spec 的 createInitialCurrencyRate 指定初始匯率
    - impl 以 ensureRate 一律種 1
    - createCurrencyRate 內嵌在匯率編輯器畫面
    - resolveTransferDisplay 落在 stores、非 service
    - impl 另有 ensureRatesForNewBase 與 getCurrencyPairs
    - 皆 spec 未載
- `transfer_logic`
    - impl 跨幣別寫正反兩筆匯率記錄
    - impl 多幣別驗證與 schedule 欄位
    - spec 僅規定新增一筆
    - impl 檔頭引用過期檔名 `no7_transfer_logic.md`
- `transaction_logic`
    - spec 三函式與驗證規則、impl 皆跟進
    - impl 多金額正規化
    - 含 K-Mode、乘一萬 scale、正負號
    - impl 多 update 排程連結保留語意
    - 皆 spec 未載
- `recurring_transactions_logic`
    - impl 把軟刪實例視為已存在
    - 刪過的不復活
    - spec 未明定此規則
    - 補產生依 userId 過濾
    - spec 寫遍歷所有排程
- `undo_logic`
    - spec 既有規則 impl 全跟上
    - 含可見後起算四秒倒數
    - impl 多合併撤銷資料 mergeData
    - impl 多 undoRevertCount 通知首頁重整
    - hideUndo 與 closeUndo 重複
    - spec 與 merge spec 均未載
- `firestore_quota_logic`
    - spec 的雙旗標四組合分流
    - impl 只用寫入旗標擋 L3 上傳
    - 讀取旗標無人消費
    - L2 偏好同步讀寫不計數
    - impl 另有 getStats 與讀寫值回傳欄位
    - spec 未載、getStats 無任何呼叫端
- `home_report_logic`
    - 配對檔只實作 spec 色票切分段
    - buildPeriodReport 主體落在 `src/stores/PeriodDataStore.ts`
    - 函式名實質錯位
    - impl 的 buildPeriodReport 對應 spec 的 assignChartColors
    - impl 的 assignChartColors 是 spec 未定義的取色 helper
- `category_logic`
    - spec 列四項操作
    - impl 承載點只實作 deleteCategory 級聯刪除
    - create、update、reorder 散落兩個畫面
    - 未依仲裁流向收進 logic 層
- `account_logic`
    - spec 列四項操作
    - 僅 deleteAccount 落在 service、行為吻合
    - createAccount、updateAccount、reorderAccounts 散落畫面直寫資料庫
    - 未進 logic 承載點
- `merge_logic`
    - impl 多 revertMerge 合併還原整支函式
    - impl 多 mergeCategories 同型別硬檢查
    - spec 皆未承載
    - undo spec 只定義通用復原佇列
    - 不含 merge 還原細節
- `subscription_gate_logic`
    - spec 與 impl 對齊
    - 本批最乾淨單位之一
- `preference_sync_logic`
    - 詳見高風險發現的 Firestore listener 違規
- `transaction_backup_logic`
    - 核心規則全對齊
    - 含六 collection、五百筆分批、配額預檢、單向上傳、無 listener
    - impl 以探測 transactions 單一 collection 近似偵測 user 資料
    - checkBackupQuota 內聯於 sync、未獨立成函式
    - 兩細節 spec 未載
- `data_transfer_logic`
    - spec 七項行為 impl 全跟進
    - 僅命名與小語意差
    - impl 多 validateColumnData 預覽
    - impl 多固定路徑 downloadTemplate
    - 皆無畫面引用、屬殘留死碼
- `local_db_service`
    - 詳見高風險發現的本機持久層無規格
- `firebase_infra`
    - 登入登出包裝行為由鄰近 spec 覆蓋
    - App Check 初始化僅 impl 有
    - spec 全無承載
    - Product Map 平台視角有提及
- `database_adapter_infra`
    - spec 全庫無 adapter 規格
    - impl 自帶 SQLite 與 LokiJS 平台分流
    - 內容屬第三方套件與平台 API 細節
    - 依層職責歸 impl、缺 spec 合理
- `mock_data_tooling`
    - 純開發種子工具
    - spec 無對應、impl 單方存在
    - 僅 Debug 入口呼叫、不進正式版
    - 屬可豁免工具函式
- `home_period_state`
    - 詳見高風險發現的首頁期間狀態無規格
- `ui_behavior_hooks`
    - useCalculator 四則運算、小數位上限、歸零只在 impl
    - 無 spec 仲裁
    - useFrozenSelectionOrder 凍結排序已由三個設定畫面 spec 覆蓋
    - impl 跟進一致
    - **衝突:**
        - 三 hook 跨節點混雜
        - useCalculator 服務 recording_core
        - useFrozenSelectionOrder 服務 app_setting
        - useHeaderInset 為跨畫面 layout 工具
        - 掛 recording_core 僅覆蓋計算機部分

---

## 資料模型逐項發現

- `accounting_data_models`
    - 九表欄位、型別、索引、migration 鏈皆對齊 spec
    - schema.ts 帳戶欄留過時註解
    - 該註解引用舊版 spec 寫法
    - analytics_consent 因平台限制設可空欄位
    - 讀取層補預設值、行為等價

---

## 跨單位模式歸納

- **spec 未回寫 design 定案:**
    - design 仲裁定案後、spec 未同步
    - currency 系列仍寫舊長列表
    - transaction_editor spec 漏計算機鍵盤
    - paywall spec 文案舊
    - 根因為 design 定案流程缺 spec 回寫步驟
- **付費閘 realign 殘留:**
    - 閘點已改設列表頁入口
    - editor 端 spec 仍寫舊閘
    - 涉及 category_editor、account_editor、import 三處
    - 同根因、宜同主題修
- **impl 行為超出 spec:**
    - revertMerge、mockTier、金額正規化、正反匯率
    - 各自補載即可
- **結構性錯位:**
    - category 與 account 的 CRUD 散在畫面
    - 未進 logic 層承載點
    - premiumLogic.ts 內容屬 subscription_gate
    - home_report 函式名錯位
- **dev 工具帶缺 spec 豁免聲明:**
    - design 已明文豁免 debug 工具
    - spec 端無對應條款
    - 涉及六個單位
    - 補一段聲明可收掉缺口

---

## Product 反向落地

- app 節點 8 個、7 個 landed
- data model 歸入下游邏輯計算

### home_dashboard

- 狀態: landed
- 下游畫面: home_screen、home_filter_screen、search_screen
- 下游邏輯: currency_conversion_logic、home_report_logic、home_period_state
- 四大職責全有載體
- 概覽圓餅圖與交易清單落 home_screen
- 篩選系統落 home_filter_screen
- Note 全文搜尋落 search_screen
- 報表計算與換算落 home_report 與 currency_conversion
- home_period_state 承載期間分頁與十五期快取
- 該單位 spec 缺、屬本節點最大規格缺口

### recording_core

- 狀態: landed
- 下游畫面: transaction_editor、transfer_editor、recurring_setting、category_editor、merge_editor
- 下游邏輯: transfer、transaction、recurring_transactions、undo、account、merge、ui_behavior_hooks 部分
- 三種交易類型 CRUD 落 editor 畫面與對應 logic
- 定期交易範本與補產生落 recurring 配對
- 帳戶與類別合併落 merge 配對
- 全域 Undo 落 undo_logic
- 節點 md 把 CategoryCRUD 與 AccountCRUD 寫在 AppSetting
- 下游拆法為 list 在 app_setting、editor 在 recording_core
- 與 map 子節點邊界不一致

### app_setting

- 狀態: landed
- 下游畫面: settings、category_list、account_list、account_editor、data_management、import、preference、theme_settings、launch_mode、base_currency、currency_list、currency_detail_config、currency_rate_list、currency_rate_editor、language、time_zone、mock_data_settings
- 下游邏輯: app_bootstrap、settings_management、category_logic、data_transfer
- 資料管理區塊落 data_management、import 與 data_transfer_logic
- 偏好設定區塊落 theme_settings 至 time_zone 共九個畫面
- 方案升級入口由 settings_screen 承載
- 閘控邏輯在 payment 側
- analyticsConsent 開關無專屬單位
- 假定含於 preference_screen 與 settings_management、未逐項驗證
- mock_data_settings 屬節點未提的開發工具掛靠
- app_bootstrap 跨節點混雜、premium 殘句與 cloud_sync 矛盾

### auth

- 狀態: landed
- 下游畫面: login_screen
- 下游邏輯: login_logout_logic、post_auth_logic、firebase_infra
- LoginFlow 落 login_screen 與 login_logout_logic
- PostAuthSetup 首次登入初始化落 post_auth_logic
- 含依 Locale 寫入預設偏好、建雲端用戶文件
- 不建預設帳戶與類別
- firebase_infra 屬基建掛靠、spec 缺但嚴重度低
- 登出按鈕 UI 在 app_setting 偏好側、邏輯在本節點
- 分工與 map 描述一致

### payment

- 狀態: landed
- 下游畫面: paywall_screen
- 下游邏輯: premium_logic、subscription_gate_logic
- PaywallScreen 落 paywall_screen
- IAPService、PremiumContext、PremiumStatusCache 由 premium_logic 涵蓋
- 粒度粗、職責全到
- PremiumFeatureGate 與 LEVEL 能力清單落 subscription_gate_logic

### cloud_sync

- 狀態: landed
- 下游畫面: 無、純背景節點、設計如此
- 下游邏輯: batch_sync_logic、firestore_quota_logic、preference_sync_logic、transaction_backup_logic
- PreferenceSync 落 preference_sync_logic
- TransactionBackup 落 transaction_backup_logic
- BackupEngine 與 InitialBackup 落 batch_sync_logic
- QuotaManagement 落 firestore_quota_logic
- preference_sync_logic 屬全批最高風險之一
- app_bootstrap spec 的 premium 殘句與本節點全員政策矛盾
- 矛盾源頭在 app_bootstrap spec、非本節點下游

### local_database

- 狀態: landed
- 下游畫面: debug_info_by_category_screen
- 下游邏輯: local_db_service、database_adapter_infra、mock_data_tooling、accounting_data_models
- 本機持久化與響應式查詢落 local_db_service 與 accounting_data_models
- Sync Adapter 介面落 database_adapter_infra
- 掛靠四 logic 中三個無 spec
- 基礎設施層規格整批缺
- debug 畫面與 mock 工具屬節點未明列的開發掛靠

### logic_engine

- 狀態: unlanded
- 零下游
- LEVEL_2 付費功能
- RuleEngine 含 RuleCenter 與填空式規則編輯
- TimeMachine 含非破壞性歷史重算
- 整節點無任何 screen、logic、spec、impl 對應
- 屬未動工的未來功能
- 未落地是 roadmap 狀態、非盤點流失

---

## 孤兒與範圍外單位

- 孤兒下游僅 `debug_info_screen` 一個
- Product Map 全圖無節點承載開發工具職責
- 該畫面展示跨節點系統資訊、無單一歸屬可掛
- 兼 scope creep: impl 自長、map 從未提及
- 處置選項
    - map 增開發工具描述
    - 或 spec 與 map 雙端豁免聲明
- 傾向豁免聲明、避免 map 為 dev 工具開節點

---

## 邊界觀察

- 產品註冊表的 product_map_paths 指向 `no2_product_map/no2_accounting_app/`
- 實際 Product Map 無此目錄
- map 已改 app 與平台服務視角拆分
- 註冊表欄位待更新
- 註冊表位於 `~/.claude/skills/decision_framework_router/products_registry.md`
- canonical 清單一度誤判 recurring_setting 缺 design 與 impl
- 逐單位比對更正為元件軸齊全
- analyticsConsent 覆蓋假定未逐項驗證

---

## 修補執行

- 修補逐 issue 進行、一個 issue 開一個 session
- issue 清單與處理規約見 `2026-06-10_alignment_issues.md`
- 該清單涵蓋本檔全部可修發現、含優先序與狀態追蹤
