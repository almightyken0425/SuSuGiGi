# 2026-05-20 · Donut full-circle path 拆 180° arc workaround

## 此檔目的

- 記錄一次純 Impl 側的 library workaround
- 讓未來執行四層 alignment 盤點的 auditor 能查到佐證
- 解釋為何此次 fix 只在 Impl git 出現對應 branch
- 解釋為何 Design / Spec / Product 三層無對應動作
- 歸類：**Impl-only fix**，library workaround，無 Spec / Design 耦合
- 歸檔結論：經 2026-05-20 `multi-tier-alignment-auditor` 獨立盤點驗證
- 本 fix 不需任何 Spec / Design 更新
- 詳細論證見下方對齊判定段

---

## 症狀

- 模組：`no2_accounting_app` Home 畫面 donut chart
- 可重現條件：
    - 進入只有 1 筆 transaction 的 period
    - 切到 income tab
    - 或任何只剩單一 slice 的狀態
- 表現：
    - donut 的 grow 動畫播放完
    - 結算那一刻整圈圖形瞬間消失
- 動畫過程中視覺正常
    - sweep 小於 1 期間圈仍在
- 消失只發生在 sweep 抵達 1 的最後一幀

---

## Root cause

- 繪製 donut slice 的函式 `buildDonutSlicePathWorklet`
- 位於 `src/components/DonutChart.tsx`
- 函式內部走兩個分支：
    - 一般 sector 分支
        - 觸發條件：`da < TAU - EPS`
        - 用兩段 arc 加直線收尾
    - Full-circle 分支
        - 觸發條件：`da >= TAU - EPS`
        - 用兩段完整 360° arc 畫外環與內環
- Full-circle 分支底層呼叫 RN-Skia 的 `path.arcToOval()`
- 傳入的 sweep 值是 ±360°，即 ±2π 換算
- RN-Skia 對 `sweepDeg = ±360°` 會**靜默丟棄**
    - 不報錯
    - 不繪製
    - path 收斂成 `"M x,y Z"` 的退化形式
    - bounds 歸零
- 動畫期間 sweep 小於 1
    - `da` 永遠卡在 TAU 之下
    - 落入一般 sector 分支可正常渲染
- sweep 結算到 1 的最後一幀切到 full-circle 分支
    - 整個 path 就空了
- 此為 RN-Skia 已知但無文件化的 quirk
- `arcToOval` 對 ±180° sweep 處理正常
- `arcToOval` 對 ±360° 就靜默吃掉

---

## Fix

- `buildDonutSlicePathWorklet` 的 full-circle 分支改寫
    - 外環拆成兩段 180° arc
    - 內環拆成兩段 180° arc
- 180° sweep 在 RN-Skia 的 `arcToOval` 路徑下行為正常
- 內環方向反轉維持原狀
    - non-zero winding 仍正確切出中央空洞
- 視覺輸出與原意完全一致
    - 結果仍是一個完整的環
- 連帶清理：
    - 移除診斷期間加入的 `[DONUT-BUG]` console probe
    - 該 probe 由 commit 9920fd7 加入
    - 保留 redundant-transition guard
    - 屬無害的防禦碼
- 變動範圍：
    - `src/components/DonutChart.tsx`
    - `src/screens/Home/PeriodPage.tsx`
    - 合計 +14 / -35 行

---

## Commit 與 branch

- Impl git 位於 `no6_product_development/no2_accounting_app/`
- Branch：`feat/r-donut-single-slice-disappear`
- Fix commit：`9b03357`
    - subject：fix home-donut, split full-circle path into 180° arcs
- Merge commit：`bae4e62`
    - 使用 `--no-ff` merge to main
- 已 push 到 origin
- 其他三層：**無對應 branch**
    - 依下段對齊判定結論，無需建立

---

## 驗證

- iOS simulator
    - 單筆 transaction 切 income tab
    - donut 動畫結算後維持完整環
    - 無閃失
- 實機 KeniPhone，dev build
    - 同上，視覺正常
- 使用者觀察 dev build 在實機掉幀偏多
    - simulator 同樣存在
    - 判定為 dev mode overhead
    - release build 驗證另案進行

---

## 對齊判定

- 下列論證由 2026-05-20 `multi-tier-alignment-auditor` 獨立復查
- 結論：本 fix 不需要 Spec / Design 跟進

外部可觀察行為：

- fix 純粹改變 path 的建構方式
    - 兩段 180° arc 取代兩段 360° arc
- 輸出的視覺結果為完整環形
- 動畫語意未改變
- 資料對應關係未改變
- 互動行為未改變

Spec 層：

- no2_screens 與 no3_logics 全域搜尋
    - `arcToOval` 無命中
    - `buildDonutSlicePathWorklet` 無命中
    - `sweepDeg` 無命中
    - `worklet` 無命中
- Spec 從未規格化 donut 的 path 建構細節
- 沒有需要同步更新的條目

Design 層：

- Design git 無任何檔案提及上述關鍵字
- Design 描述的是視覺樣式
    - 環形圖的色彩
    - ring 厚度
    - 尺寸 token
- Design 不描述繪製 API 的選用

sub_mapping 規則：

- `src/components/**` 的變動原則上以 Design 為 arbiter
- 此規則的觸發前提是有視覺或互動行為的實質變化
- 本 fix 的視覺輸出與規格定義完全一致
- 僅為平台 library workaround
- 不適用 design arbiter 規則

cross_layer_boundary_policy：

- fix 性質符合 Impl 層的職責定義
    - 平台 API 選用
    - library workaround
- 無越層

四層 branch 不同名：

- 為 Impl-only fix 的合理狀態
- 未來 auditor 掃描時可引用本檔為佐證

---

## 未來可借鏡

- `arcToOval` 的 ±360° sweep 靜默丟棄
- 是 RN-Skia 已知 quirk 之一
- 日後若要繪製完整圓形或環形 path
    - 避免直接傳 ±360° 給 `arcToOval`
    - 改用 180° 拆段法
    - 或改用 `addCircle` / `addOval` 等專屬 API
    - 後者前提是 API 支援
