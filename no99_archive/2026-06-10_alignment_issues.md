# 四層對齊修補 issue 清單 記帳 App

## 文件用途

- 承接同目錄 `2026-06-10_four_tier_alignment_audit.md` 的盤點發現
- 把發現整理成可逐一處理的 issue
- 一個 issue 開一個 Claude session 處理
- issue 編號是識別碼、不代表處理順序
- 處理順序參考優先序欄
- issue 完成後更新狀態欄、可刪該章節
- 全部處理完可刪本檔

---

## Claude 處理規約

- 使用者指定 issue 編號後、先完整重述問題
- 假設使用者完全不記得該 issue 內容
- 重述包含四件事
    - 背景與前因後果
    - 各層現況差異
    - 為何重要
    - 修法選項與建議
- 重述用對話訊息完整講、不可只說已讀完畢
- 含決策點的 issue、先請使用者拍板再動工
- 動工走修改流程規範、開 worktree 與 feat branch
- branch 名稱用 `feat/issue-<編號>-<短語>`
- 跨層改動時四層 branch 同名
- 完成後回報驗證結果、更新本檔狀態欄

---

## 總覽

| issue | 標題 | 優先序 | 牽涉層 | 狀態 |
|---|---|---|---|---|
| ISSUE-01 | 偏好同步 listener 違規 | 高 | spec、impl | 待處理 |
| ISSUE-02 | 持久層服務補規格 | 高 | spec、impl | 已完成 |
| ISSUE-03 | 首頁期間狀態補規格 | 高 | spec、impl | 已完成 |
| ISSUE-04 | app bootstrap 規格整修 | 高 | spec | 待處理 |
| ISSUE-05 | 付費閘 realign 回寫 | 中 | spec、impl | 已完成 |
| ISSUE-06 | currency 系列視覺回寫 | 中 | spec、design、impl | 已完成 |
| ISSUE-07 | 搜尋 placeholder 文案拍板 | 中 | spec | 待處理 |
| ISSUE-08 | 交易轉帳 editor 規格回寫 | 中 | spec | 已完成 |
| ISSUE-09 | DualPickerBox 元件促升 | 中 | design | 已完成 |
| ISSUE-10 | 登入鏈規格實作對齊 | 中 | spec、impl | 待處理 |
| ISSUE-11 | settings management 對齊 | 中 | spec、impl | 待處理 |
| ISSUE-12 | firestore 配額旗標收斂 | 中 | spec、impl | 待處理 |
| ISSUE-13 | 帳戶類別 CRUD 收斂 logic 層 | 中 | impl | 待處理 |
| ISSUE-14 | 清除資料庫漏兩表 | 中 | impl | 待處理 |
| ISSUE-15 | premium logic 歸檔錯位 | 中 | spec、impl | 待處理 |
| ISSUE-16 | recording 邏輯補載 | 中 | spec | 待處理 |
| ISSUE-17 | 首頁三畫面規格缺口 | 中 | spec、impl | 待處理 |
| ISSUE-18 | 清單畫面三層對齊 | 中 | spec、design、impl | 待處理 |
| ISSUE-19 | 偏好頁登入態拍板 | 中 | spec、design、impl | 待處理 |
| ISSUE-20 | 匯率換算邏輯對齊 | 中 | spec、impl | 待處理 |
| ISSUE-21 | dev 工具豁免聲明 | 中 | spec、product map | 待處理 |
| ISSUE-22 | cloud sync 細節補載 | 低 | spec | 待處理 |
| ISSUE-23 | 匯入匯出死碼清理 | 低 | impl | 待處理 |
| ISSUE-24 | design 端變體待補 | 低 | design | 待處理 |
| ISSUE-25 | 低嚴重度掃尾 | 低 | spec、impl | 待處理 |
| ISSUE-26 | 註冊表與 map 邊界整理 | 低 | product map、註冊表 | 待處理 |

---

## ISSUE-01 偏好同步 listener 違規

- **狀態:** 待處理
- **優先序:** 高
- **背景:**
    - 偏好設定走雲端雙向同步、單位是 preference_sync_logic
    - spec 在同步策略段明文禁止 Firestore Real-time listener
    - 禁令目的是控制 Firestore 讀取配額
    - impl 卻在 `PreferenceContext` 用 onSnapshot 訂閱偏好下行
    - onSnapshot 是常駐監聽、每次遠端變動都觸發讀取
    - 屬 impl 直接違反 spec 禁令、非普通漂移
    - 另有時間戳欄位不一致
    - spec 的 LWW 比較欄位寫 `preferences.updatedAt`
    - impl 存在文件根層級 `updatedAt`
- **決策點:**
    - listener 禁令維持或解除
- **修法:**
    - 方案甲 維持禁令
        - impl 拆掉 onSnapshot、改登入與前景時主動拉取
        - 優點是配額可控、符合既有 spec
        - 缺點是失去即時性、跨裝置更新有延遲
    - 方案乙 解除禁令
        - 修 spec 移除禁令、補配額影響描述
        - 優點是保留即時同步體驗
        - 缺點是配額假設與離線行為要重新評估
    - 建議方案甲、偏好資料量小且非即時敏感
    - 兩案都要同次統一時間戳欄位位置
- **動到的檔案:**
    - spec git `no3_logics/no18_preference_sync_logic.md`
    - impl git `src/contexts/PreferenceContext.tsx`

---

## ISSUE-02 持久層服務補規格

- **狀態:** 已完成、spec 新增 no23 六操作、impl 補 getCategory 對稱並改 CategoryEditor 呼叫、no22 被 ISSUE-03 先佔故接 no23
- **優先序:** 高
- **背景:**
    - impl 的 `src/services/localDbService.ts` 是本機資料庫總入口
    - 所有畫面與邏輯的查詢都經過這層
    - 內含兩組重要行為規則、目前只存在 impl
    - 查詢選擇器一律排除停用與軟刪資料
    - 查詢一律依 user_id 做多租戶隔離
    - spec 層完全沒有對應文件
    - account 與 category 的 logic spec 也沒涵蓋查詢行為
    - 等於地基規則無仲裁、改壞無人擋
    - 盤點評為高風險
- **修法:**
    - 在 spec git 的 no3_logics 新增持久層服務規格
    - 內容涵蓋選擇器排除規則、租戶隔離規則
    - 涵蓋軟刪語意與停用語意的查詢邊界
    - 依 logic spec 政策撰寫、spec 仲裁 impl 跟進
    - 寫完跑 spec-term-audit 與 lint
- **動到的檔案:**
    - spec git `no3_logics/` 新增一份
    - 編號接現有序列尾端

---

## ISSUE-03 首頁期間狀態補規格

- **狀態:** 已完成、新增 no22 四操作、no13 改名 buildChartData、impl 三檔配對改名
- **優先序:** 高
- **背景:**
    - 首頁以期間為單位分頁、可左右切換期間
    - 期間狀態核心在 impl 的 `src/stores/PeriodDataStore.ts` 與 HomeContext
    - 三組行為只存在 impl、無 spec 仲裁
    - 期間偏移規則
    - 帳戶選取的生命週期
    - 最近十五期報表快取與淘汰策略
    - 另有規格歸屬錯置
    - `no13_home_report_logic.md` 把查詢聚合歸給 buildPeriodReport
    - 實際聚合落在 `PeriodDataStore.processData`
    - impl 的 buildPeriodReport 對應的是 spec 的 assignChartColors
    - impl 的 assignChartColors 是 spec 未定義的取色 helper
    - 首頁是產品核心、規格缺口最大的一塊
- **修法:**
    - 新增首頁期間狀態 logic spec
    - 涵蓋期間偏移、選取生命週期、快取淘汰
    - 同次修 `no13_home_report_logic.md` 的函式歸屬描述
    - 函式名實質錯位是否改 impl 命名、留決策點
- **決策點:**
    - impl 函式名要不要跟 spec 對齊改名
- **動到的檔案:**
    - spec git `no3_logics/` 新增一份
    - spec git `no3_logics/no13_home_report_logic.md`
    - impl git `src/stores/PeriodDataStore.ts`、視改名決定

---

## ISSUE-04 app bootstrap 規格整修

- **狀態:** 待處理
- **優先序:** 高
- **背景:**
    - app_bootstrap_logic 管啟動流程、單位橫跨多節點
    - spec 殘留一句 premium 限定批次同步
    - cloud_sync 節點寫備份全 user 不分訂閱層級
    - batch_sync spec 與 impl 都站全員側
    - 三方一致、矛盾源頭就在 bootstrap spec 殘句
    - 定期交易補產生條件也不同步
    - spec 寫時區檢查日條件
    - impl 改用逐排程時間戳、無檢查日存檔
    - 兩段 impl 行為 spec 未載
    - 未登入時導向 Login
    - 前景 resume 觸發同步
- **修法:**
    - 刪 premium 限定殘句、對齊全員政策
    - 補產生條件以 impl 現狀為準改寫 spec
    - 補載未登入導向與 resume 同步兩段
    - 全程只動 spec、impl 不動
- **動到的檔案:**
    - spec git `no3_logics/no1_app_bootstrap_logic.md`

---

## ISSUE-05 付費閘 realign 回寫

- **狀態:** 已完成、三 spec 移 editor 攔截、清 useForeignCurrency 幽靈識別碼、impl 20 語系刪 16 閒置 import key；連帶發現待收錄——18 語系缺 5 個使用中 import key、僅 en 與 zh-Hant 完整
- **優先序:** 中
- **背景:**
    - 付費權限檢查曾做過入口重整
    - 閘點從 editor 畫面移到列表頁入口
    - impl 已完成重整、spec 三處未跟
    - category_editor spec 仍要求完成鈕先呼叫 canUserPerformAction
    - 並要求禁止時導航 PaywallScreen、impl 無此卡點
    - account_editor spec 仍殘留兩道完成鈕攔截
    - 且引用的動作識別碼已自 gate logic 刪除
    - import spec 仍寫送出前付費閘
    - impl 只在 DataManagement 入口把關、對應 i18n key 閒置
    - 三處同根因、宜一次修完
- **修法:**
    - 三份 screen spec 改為入口閘描述
    - 移除 editor 內的攔截要求
    - 對照 `no17_subscription_gate_logic.md` 覆核動作識別碼清單
    - 識別碼已刪的引用一併清掉
    - 閒置 i18n key 是否移除、留決策點
- **決策點:**
    - 閒置 i18n key 移除或保留待用
- **動到的檔案:**
    - spec git `no2_screens/no10_category_editor_screen.md`
    - spec git `no2_screens/no12_account_editor_screen.md`
    - spec git `no2_screens/no15_import_wizard_screen.md`
    - spec git `no3_logics/no17_subscription_gate_logic.md` 僅覆核

---

## ISSUE-06 currency 系列視覺回寫

- **狀態:** 已完成
    - 2026-06-11 處理完畢
    - 完成鈕拍板採禁點、改 impl 對齊其他 editor 慣例
    - 幣別選擇 modal 拍板併入本 issue、design 已補 RateCurrencySelectModal
    - spec 三檔回寫、no20 與 no22 一併補空狀態與搜尋無結果
- **優先序:** 中
- **背景:**
    - 貨幣相關畫面 design 已定案群組卡片樣式
    - impl 已跟進、spec 視覺描述停在舊版
    - currency_list spec 仍寫長 list 邊到邊分隔
    - currency_rate_list spec 仍寫邊到邊 hairline 長列表
    - currency_rate_list spec 漏空狀態與搜尋無結果行為
    - currency_rate_editor spec 只寫新增模式
    - design 與 impl 已有 update 模式
    - currency_rate_editor 的完成鈕行為也不同
    - spec 要求未填妥不可點
    - impl 只在儲存中鎖定、按下後才驗證
    - design 端缺幣別選擇 modal 視覺、spec 與 impl 已有
- **修法:**
    - 三份 spec 視覺段對齊 design 群組卡片定案
    - rate_list 補空狀態與搜尋無結果
    - rate_editor 補 update 模式
    - 完成鈕行為拍板、擇一改 spec 或 impl
    - design 補幣別選擇 modal、可併 ISSUE-24
- **決策點:**
    - 完成鈕用禁點或按後驗證
- **動到的檔案:**
    - spec git `no2_screens/no20_currency_list_screen.md`
    - spec git `no2_screens/no22_currency_rate_list_screen.md`
    - spec git `no2_screens/no23_currency_rate_editor_screen.md`
    - impl git 視完成鈕拍板結果

---

## ISSUE-07 搜尋 placeholder 文案拍板

- **狀態:** 待處理
- **優先序:** 中
- **背景:**
    - 選擇類畫面都有搜尋列
    - spec 逐畫面寫專屬 placeholder
    - base_currency 與 currency 系列寫貨幣關鍵字
    - time_zone 寫時區關鍵字
    - design 與 impl 一律用通用 `common.search` 字串
    - 差異遍布整個選擇類 spec、屬系統性文案慣例差
    - design 是視覺與文案仲裁端、spec 未跟仲裁
- **修法:**
    - 拍板採通用搜尋或逐畫面專屬
    - 採通用 → 各 spec 改寫為引用共用文案政策
    - 採專屬 → design 與 impl 補逐畫面字串
    - 建議採通用、與現行 design 及 impl 一致、改動最小
    - 共用政策段落放 shared_ui_policies、避免逐份重複
- **動到的檔案:**
    - spec git `no2_screens/no19_base_currency_setting_screen.md`
    - spec git `no2_screens/no25_time_zone_setting_screen.md`
    - spec git `no2_screens/no20_currency_list_screen.md` 等選擇類
    - spec git `no2_screens/shared_ui_policies/`

---

## ISSUE-08 交易轉帳 editor 規格回寫

- **狀態:** 已完成、2026-06-11、spec 兩檔回寫對齊 design 與 impl（`no5_transaction_editor_screen.md`、`no6_transfer_editor_screen.md`）
- **優先序:** 中
- **背景:**
    - 交易與轉帳兩個 editor 是記帳主流程
    - design 與 impl 互相對齊、spec 落後兩者
    - transaction_editor spec 缺四項
    - design 定案的計算機鍵盤
    - 定期鈕位置與並排 picker
    - impl 的刪除確認流程
    - 一般交易轉定期的路徑
    - transfer_editor 金額區三層分歧
    - spec 寫跨幣別才顯示箭頭與轉入框、並顯示隱含匯率
    - design 與 impl 為恆顯雙欄、同幣別 disabled、無匯率
    - transfer_editor 另缺兩段 impl 行為
    - 編輯轉定期會重建排程
    - 刪除確認框
- **修法:**
    - 兩份 spec 對齊 design 定案與 impl 現狀
    - 金額區以 design 仲裁為準改寫 spec
    - 隱含匯率顯示要不要留、留決策點
    - 全程預期只動 spec
- **決策點:**
    - 隱含匯率顯示從 spec 移除或要求 impl 補做
- **動到的檔案:**
    - spec git `no2_screens/no5_transaction_editor_screen.md`
    - spec git `no2_screens/no6_transfer_editor_screen.md`

---

## ISSUE-09 DualPickerBox 元件促升

- **狀態:** 已完成、2026-06-11、design 在 20_components 建 DualPickerBox 定義並汰換 Merge/Transfer 私有 picker box、showcase 同步
- **優先序:** 中
- **背景:**
    - impl 已抽出共用元件 `DualPickerBox`
    - 轉帳 editor 與合併 editor 兩處共用
    - design 端元件促升規則要求跨畫面共用即升入 20_components
    - design 仍留畫面私有的 MergePickerBox
    - 元件由 design 仲裁、目前仲裁端落後實作
- **修法:**
    - design git 在 20_components 建立 DualPickerBox 定義
    - 標注雙畫面使用情境與 token
    - 汰換畫面私有 MergePickerBox 展示
    - 必要時 components showcase 同步
- **動到的檔案:**
    - design git `project/20_components/`
    - design git `project/30_screens/no25_merge_editor_screen/` 展示對齊

---

## ISSUE-10 登入鏈規格實作對齊

- **狀態:** 待處理
- **優先序:** 中
- **背景:**
    - 登入登出與登入後初始化兩條邏輯有行為缺口
    - login_logout spec 要求登出清除本地 Premium 快取
    - impl 只重設記憶體狀態、持久化快取未清
    - 殘留快取可能讓下個帳號短暫看到錯誤權限
    - spec 另有登出失敗強制清 session token 分支
    - impl 只顯示錯誤、未實作
    - post_auth spec 要求本地無 Settings 時以雲端偏好寫入
    - impl 直接 return、雲端偏好被忽略
    - spec 要求 IAP 查詢後更新本地 Premium 狀態
    - impl 查詢結果棄用
    - impl 另在雲端文件存在分支加跑冪等 initializeNewUser
    - post_auth spec 內殘留視 Premium 決定上雲的句子
    - 與同檔全 user 一致描述自相矛盾
- **修法:**
    - 缺的四段 impl 行為逐項補實作
    - 或拍板降規、改 spec 移除要求
    - 建議補實作、四段都涉及帳號切換正確性
    - spec 矛盾殘句刪除
    - initializeNewUser 加跑行為補載進 spec
- **動到的檔案:**
    - spec git `no3_logics/no2_login_logout_logic.md`
    - spec git `no3_logics/no3_post_auth_logic.md`
    - impl git `src/contexts/AuthContext.tsx`
    - impl git `src/services/userService.ts`、依實際承載點

---

## ISSUE-11 settings management 對齊

- **狀態:** 待處理
- **優先序:** 中
- **背景:**
    - 設定管理邏輯三處不同步
    - spec 的 initializeTheme 依系統深淺色取預設
    - 預設識別碼寫 theme_light_default
    - 該識別碼整個系統不存在
    - impl 未實作、固定落 theme1
    - impl 的 resetCurrencyFormat 無紀錄時會新建一筆
    - spec 未載此行為
    - impl 主幣上雲改帶 currency 代碼欄位
    - spec 未載此欄位
- **修法:**
    - initializeTheme 拍板要不要做系統深淺色跟隨
    - 要做 → impl 補實作、spec 改用存在的識別碼
    - 不做 → spec 改寫為固定預設
    - 後兩項以 impl 現狀補載進 spec
- **決策點:**
    - 主題預設是否跟隨系統深淺色
- **動到的檔案:**
    - spec git `no3_logics/no5_settings_management.md`
    - impl git `src/services/settingsLogic.ts`、視拍板結果

---

## ISSUE-12 firestore 配額旗標收斂

- **狀態:** 待處理
- **優先序:** 中
- **背景:**
    - 配額邏輯保護 Firestore 免費額度
    - spec 設計讀寫雙旗標、四種組合分流
    - impl 只用寫入旗標擋 L3 上傳
    - 讀取旗標存在但無任何消費端
    - L2 偏好同步的讀寫完全不計數
    - impl 另有 spec 未載的 getStats
    - getStats 無任何呼叫端、屬死碼
    - 回傳欄位 readsValues 與 writesValues 也未載
- **修法:**
    - 拍板雙旗標設計留或簡化
    - 留 → impl 補讀取旗標消費與 L2 計數
    - 簡化 → spec 改寫為單寫入旗標、刪讀取旗標
    - getStats 死碼刪除或補規格、建議刪除
    - 與 ISSUE-01 拍板結果連動、listener 去留影響讀取量
- **決策點:**
    - 雙旗標維持或簡化為單旗標
- **動到的檔案:**
    - spec git `no3_logics/no12_firestore_quota_logic.md`
    - impl git `src/services/quotaService.ts`

---

## ISSUE-13 帳戶類別 CRUD 收斂 logic 層

- **狀態:** 待處理
- **優先序:** 中
- **背景:**
    - 仲裁流向規定 logic 由 spec 仲裁、impl 在 service 層跟進
    - category spec 列四項操作
    - impl 的 categoryLogic 只實作 deleteCategory 級聯刪除
    - create、update、reorder 散落兩個類別畫面內直寫資料庫
    - account spec 同樣列四項操作
    - 僅 deleteAccount 落在 accountLogic、行為吻合
    - createAccount、updateAccount、reorderAccounts 散落帳戶畫面
    - category_list 的 reorderCategories 也內聯在畫面
    - 行為本身與 spec 吻合、問題是承載點錯位
    - 畫面直寫資料庫讓規則繞過 logic 層、難測難審
- **修法:**
    - 散落操作收斂進 categoryLogic 與 accountLogic
    - 畫面改呼叫 service、行為不變
    - 既有測試補對應案例
    - 屬純重構、預期不動 spec
- **動到的檔案:**
    - impl git `src/services/categoryLogic.ts`
    - impl git `src/services/accountLogic.ts`
    - impl git `src/screens/Categories/` 兩檔
    - impl git `src/screens/Accounts/` 兩檔

---

## ISSUE-14 清除資料庫漏兩表

- **狀態:** 待處理
- **優先序:** 中
- **背景:**
    - 資料管理頁有清除資料庫功能
    - spec 要求批次刪除所有資料表
    - impl 只清七張表
    - 漏掉 `users` 與 `currency_configs`
    - 清除後殘留用戶與貨幣設定資料
    - 屬 impl 功能缺漏、非規格問題
- **修法:**
    - impl 補齊兩表刪除
    - 對照 schema 全表清單防再漏
    - 補測試鎖住全表覆蓋
- **動到的檔案:**
    - impl git `src/services/localDbService.ts`、依實際承載點
    - impl git 對應測試檔

---

## ISSUE-15 premium logic 歸檔錯位

- **狀態:** 待處理
- **優先序:** 中
- **背景:**
    - premium_logic 的 spec 三段核心 impl 皆已實作
    - 到期判斷一致、行為健康
    - 問題一是檔案歸檔錯位
    - `premiumLogic.ts` 內容實屬 SubscriptionGateLogic 範疇
    - 與 `no17_subscription_gate_logic.md` 的配對關係混淆
    - 問題二是 impl 多四段 spec 未載行為
    - mockTier 測試用假訂閱層
    - launch gate 啟動閘
    - AppState 自動刷新
    - 登出降級
- **修法:**
    - 拍板檔案歸位方式
    - 改 impl 檔名歸位或改 spec 配對描述
    - 四段未載行為補進對應 spec
    - mockTier 屬 dev 工具、可改掛豁免聲明、與 ISSUE-21 連動
- **決策點:**
    - 歸位動 impl 檔名或動 spec 配對
- **動到的檔案:**
    - spec git `no3_logics/no6_premium_logic.md`
    - spec git `no3_logics/no17_subscription_gate_logic.md`
    - impl git `src/services/premiumLogic.ts`、視拍板結果

---

## ISSUE-16 recording 邏輯補載

- **狀態:** 待處理
- **優先序:** 中
- **背景:**
    - 記帳核心五條邏輯都是 impl 領先
    - 行為合理但 spec 未承載、仲裁端失守
    - transaction 多金額正規化
    - 含 K-Mode、乘一萬 scale、正負號
    - 另多 update 時排程連結保留語意
    - transfer 跨幣別寫正反兩筆匯率記錄
    - 另多幣別驗證與 schedule 欄位
    - recurring 把軟刪實例視為已存在、刪過不復活
    - 補產生依 userId 過濾、spec 寫遍歷所有排程
    - undo 多合併撤銷資料 mergeData
    - 多 undoRevertCount 通知首頁重整
    - hideUndo 與 closeUndo 功能重複
    - merge 多 revertMerge 整支還原函式
    - 多 mergeCategories 同型別硬檢查
- **修法:**
    - 五份 spec 逐項補載 impl 行為
    - 以 impl 現狀為準、不動 impl
    - hideUndo 與 closeUndo 重複、留決策點
    - transfer_logic 檔頭過期檔名併 ISSUE-25
- **決策點:**
    - 重複的 hideUndo 與 closeUndo 是否合併
- **動到的檔案:**
    - spec git `no3_logics/no9_transaction_logic.md`
    - spec git `no3_logics/no8_transfer_logic.md`
    - spec git `no3_logics/no10_recurring_transactions_logic.md`
    - spec git `no3_logics/no11_undo_logic.md`
    - spec git `no3_logics/no16_merge_logic.md`

---

## ISSUE-17 首頁三畫面規格缺口

- **狀態:** 待處理
- **優先序:** 中
- **背景:**
    - 首頁、篩選、搜尋三畫面各有缺口
    - home_filter spec 定義下滑關閉手勢
    - impl 用 fullScreenModal、無此手勢
    - spec 的暗化未選卡描述與 design 定案不符
    - design 有 no-accounts 變體、spec 未文件化
    - search 的多幣別換算副文字 spec 與 design 已定
    - impl 未實作
    - impl 多 focus 返回重查與 loading 過場、spec 未載
    - home 的分組預設 design 全展開
    - spec 與 impl 預設收合、方向相反
- **修法:**
    - 下滑關閉拍板、改 spec 或 impl 補手勢
    - 建議改 spec、fullScreenModal 慣例無此手勢
    - 暗化描述對齊 design 定案
    - no-accounts 變體補進 spec
    - 換算副文字 impl 補實作、design 與 spec 已一致
    - focus 重查與 loading 過場補載 spec
    - 分組預設拍板、design 改收合或雙層改展開
    - 建議 design 改收合、spec 與 impl 已一致
- **決策點:**
    - 下滑關閉去留
    - 分組預設展開或收合
- **動到的檔案:**
    - spec git `no2_screens/no3_home_filter_screen.md`
    - spec git `no2_screens/no4_search_screen.md`
    - spec git `no2_screens/no2_home_screen.md`、視拍板
    - impl git `src/screens/Search/SearchScreen.tsx`
    - design git `project/30_screens/no1_home_screen/`、視拍板

---

## ISSUE-18 清單畫面三層對齊

- **狀態:** 待處理
- **優先序:** 中
- **背景:**
    - 類別與帳戶兩張清單畫面三層各有缺口
    - category_list 的空清單提示 spec 有要求
    - design 與 impl 皆缺
    - design 定停用字樣與行高 58
    - impl 顯示關閉字樣、行高寫死 60
    - account_list 的 spec 定義三項
    - 標題 `我的帳戶`、空列表提示、拖拉圖示
    - design 定案與 impl 皆無此三項
    - spec 未跟 design 仲裁
    - impl 末段留白寫死 100
    - design token SPACING 5xl 為 64、未跟
- **修法:**
    - 空清單提示拍板做不做
    - 做 → design 補視覺、impl 補實作
    - 不做 → spec 刪要求
    - account_list spec 三項以 design 定案為準刪修
    - 停用字樣與行高、impl 對齊 design
    - 留白改用 token、消 magic number
- **決策點:**
    - 空清單提示去留
- **動到的檔案:**
    - spec git `no2_screens/no9_category_list_screen.md`
    - spec git `no2_screens/no11_account_list_screen.md`
    - impl git `src/screens/Categories/CategoryListScreen.tsx`
    - impl git `src/screens/Accounts/AccountListScreen.tsx`
    - design git 視空清單拍板

---

## ISSUE-19 偏好頁登入態拍板

- **狀態:** 待處理
- **優先序:** 中
- **背景:**
    - 偏好設定頁的帳號區塊三層說法不一
    - spec 規定未登入時顯示登入按鈕
    - impl 固定只有登出按鈕
    - design 沒有登入態變體
    - 關鍵前提是該頁未登入時到不到得了
    - 若導航保證登入後才可達、spec 要求就是多餘
    - spec 另要求登出失敗顯示錯誤提示
    - impl 無 catch、完全未處理
- **修法:**
    - 先查導航可達性再拍板
    - 未登入可達 → design 補變體、impl 補登入鈕
    - 不可達 → spec 刪未登入態要求
    - 登出失敗錯誤提示 impl 補上、小改
- **決策點:**
    - 未登入態要不要存在
- **動到的檔案:**
    - spec git `no2_screens/no16_preference_screen.md`
    - impl git `src/screens/Settings/PreferenceScreen.tsx`
    - design git 視拍板結果

---

## ISSUE-20 匯率換算邏輯對齊

- **狀態:** 待處理
- **優先序:** 中
- **背景:**
    - 匯率換算邏輯多處與 spec 不同步
    - spec 的 createInitialCurrencyRate 指定初始匯率值
    - impl 以 ensureRate 一律種 1
    - 新幣種首次匯率會是錯值、靠使用者手動修
    - 職責承載點兩處錯位
    - createCurrencyRate 內嵌在匯率編輯器畫面
    - resolveTransferDisplay 落在 stores、非 service
    - impl 另有兩支 spec 未載
    - ensureRatesForNewBase
    - getCurrencyPairs
- **修法:**
    - 初始匯率拍板、照 spec 給合理值或改 spec 認可種 1
    - 建議照 spec、種 1 對非同幣種明顯錯
    - 內嵌函式收斂進 currencyService
    - 兩支未載函式補進 spec
- **決策點:**
    - 初始匯率值來源
- **動到的檔案:**
    - spec git `no3_logics/no7_currency_conversion_logic.md`
    - impl git `src/services/currencyService.ts`
    - impl git `src/screens/Settings/CurrencyRateEditorScreen.tsx`

---

## ISSUE-21 dev 工具豁免聲明

- **狀態:** 待處理
- **優先序:** 中
- **背景:**
    - 六個 dev 工具單位 spec 全缺
    - debug_info 與 debug_info_by_category 兩畫面
    - mock_data_settings 畫面、含清庫與灌資料破壞性操作
    - mock_data_tooling 種子工具
    - database_adapter_infra 平台分流
    - premium 的 mockTier、與 ISSUE-15 連動
    - design 端已明文豁免 debug 工具不還原設計
    - spec 端沒有對應豁免條款
    - 每次盤點這批都會再被標缺
    - 另有孤兒問題
    - debug_info 畫面 trace 不到任何 Product Map 節點
    - map 全圖無節點承載開發工具職責
- **修法:**
    - spec 的 shared_ui_policies 補 dev 工具豁免段
    - 列明豁免單位清單與豁免理由
    - 孤兒處置兩案
    - map 增開發工具描述
    - 或 map 端同樣豁免聲明
    - 建議豁免聲明、避免為 dev 工具開節點
- **決策點:**
    - map 端豁免或增描述
- **動到的檔案:**
    - spec git `no2_screens/shared_ui_policies/`
    - product git `no2_product_planning/no2_product_map/`、視拍板

---

## ISSUE-22 cloud sync 細節補載

- **狀態:** 待處理
- **優先序:** 低
- **背景:**
    - 兩條同步邏輯核心已對齊、剩細節未載
    - batch_sync 的 impl 增設初次備份完成旗標
    - 完成後不再探測雲端、直接走 delta
    - resetSyncState 連帶清除旗標、並多載 L4 匯入用途
    - transaction_backup 的 impl 以單一 collection 探測近似偵測
    - checkBackupQuota 內聯於 sync、未獨立成函式
- **修法:**
    - 兩份 spec 補載即可、不動 impl
- **動到的檔案:**
    - spec git `no3_logics/no4_batch_sync_logic.md`
    - spec git `no3_logics/no19_transaction_backup_logic.md`

---

## ISSUE-23 匯入匯出死碼清理

- **狀態:** 待處理
- **優先序:** 低
- **背景:**
    - data_transfer 邏輯七項行為全對齊
    - impl 多兩支無人引用的函式
    - validateColumnData 預覽
    - 固定路徑 downloadTemplate
    - 皆無畫面引用、屬殘留死碼
- **修法:**
    - 確認全庫無引用後刪除
    - 對應測試一併清
- **動到的檔案:**
    - impl git `src/services/importService.ts`
    - impl git `src/services/exportService.ts`、依實際位置

---

## ISSUE-24 design 端變體待補

- **狀態:** 待處理
- **優先序:** 低
- **背景:**
    - design 是視覺仲裁端、本批缺的是它自己的工件
    - login 缺 loading 變體、design 已自列待補
    - paywall 缺商品載入中變體
    - import 的 step4 缺時區說明文字與 transfer 變體
    - search 缺轉帳結果列展示
    - home 的 fixtures 無轉帳資料、轉帳列無從展示
    - currency_rate_editor 幣別選擇 modal 已由 ISSUE-06 補齊、本 issue 不再處理
- **修法:**
    - design git 單一 session 批次補齊
    - 全程不動 spec 與 impl
    - 補完跑 design canvas 自驗
- **動到的檔案:**
    - design git `project/30_screens/no23_login_screen/`
    - design git `project/30_screens/no24_paywall_screen/`
    - design git `project/30_screens/no22_import_screen/`
    - design git `project/30_screens/no3_search_screen/`
    - design git `project/30_screens/no1_home_screen/`

---

## ISSUE-25 低嚴重度掃尾

- **狀態:** 待處理
- **優先序:** 低
- **背景:**
    - 五件互不相干的小差異、一次掃完
    - settings 畫面 impl 多版本號文字、spec 未載
    - launch_mode spec 首選項仍寫 Default
    - design 與 impl 已定名 home 首頁
    - transfer_logic 檔頭引用過期檔名 `no7_transfer_logic.md`
    - currency_detail_config 的 impl 繞過 resetCurrencyFormat 封裝
    - 直接呼叫 setCurrencyFormat 帶 null、行為等價
    - data model 的 schema.ts 帳戶欄留過時註解
- **修法:**
    - 版本號補載 spec 一句
    - 首選項命名跟 design 改 home
    - 檔頭檔名改現行名
    - 封裝呼叫改走 resetCurrencyFormat
    - 過時註解刪除
- **動到的檔案:**
    - spec git `no2_screens/no8_settings_screen.md`
    - spec git `no2_screens/no18_launch_mode_setting_screen.md`
    - impl git `src/services/transferLogic.ts`
    - impl git `src/screens/Settings/CurrencyDetailConfigScreen.tsx`
    - impl git `src/database/schema.ts`

---

## ISSUE-26 註冊表與 map 邊界整理

- **狀態:** 待處理
- **優先序:** 低
- **背景:**
    - 三件結構層級的帳面整理
    - 產品註冊表的 product_map_paths 指向 `no2_product_map/no2_accounting_app/`
    - 實際 Product Map 已改 app 與平台服務視角拆分
    - 該目錄不存在、註冊表欄位過期
    - map 的 CategoryCRUD 與 AccountCRUD 寫在 AppSetting 節點
    - 實際下游拆法是 list 歸 app_setting、editor 歸 recording_core
    - 節點邊界描述與現狀不一致
    - analyticsConsent 開關無專屬單位
    - 盤點假定含於偏好頁與設定邏輯、未逐項驗證
    - ui_behavior_hooks 三支 hook 跨節點、難歸單一節點
- **修法:**
    - 註冊表 product_map_paths 改列實際路徑清單
    - map 節點邊界描述對齊現狀拆法
    - analyticsConsent 驗證落點、補進對應節點描述
    - hooks 歸屬寫進節點描述或維持混雜、低風險
- **動到的檔案:**
    - 註冊表 `~/.claude/skills/decision_framework_router/products_registry.md`
    - product git `no2_product_planning/no2_product_map/app/app_setting.md`
    - product git `no2_product_planning/no2_product_map/app/recording_core.md`
