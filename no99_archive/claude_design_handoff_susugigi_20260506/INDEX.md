# Design Workbench · 結構說明

這份 bundle 是 **演進中的設計庫**，不是歷史快照。設計會持續換口味、加新主題、淘汰舊方案，這份結構就是為了承載這種演進。

> 入口：在瀏覽器開 `project/SuSuGiGi.html`，頂部 5 個 tab 切換各分頁。
>
> 第一次打開請從 **Intro** 開始。原始 handoff 說明見 `README.md`；原始對話脈絡見 `chats/`。

---

## 為什麼分 5 個 tab

設計檔案需要承載多種不同問題的視角，硬塞在同一頁會混亂。所以拆 5 個 tab，**每個 tab 回答一種問題**：

| Tab | 它回答什麼問題 | 目錄 |
|---|---|---|
| Intro        | 「這份檔案是什麼？怎麼用？」 | `project/00_intro/` |
| Foundations  | 「顏色、字體、間距、圓角的標準值？」 | `project/10_foundations/` |
| Components   | 「按鈕、列、卡片元件樣本」 | `project/20_components/` |
| Screens      | 「每個畫面長什麼樣？空 / 載入 / 錯誤狀態？想鳥瞰用畫布縮放。」 | `project/30_screens/` |
| Explorations | 「這個設計問題我想了好幾種做法」（並陳） | `project/50_explorations/` |

### Tab 之間的分工

- **「邊界設計」歸 Screens**：empty / loading / error / overflow 等狀態，是「同一個畫面的不同樣子」，所以放在 Screens 同一個 artboard 區內並列展示。
- **「多版本提案」歸 Explorations**：「同一個設計問題的不同解法」，每個主題自成一個子目錄 + sub-router。
- **Foundations vs Components**：Foundations 是 token（值）；Components 是視覺化的元件樣本。
- **想鳥瞰整個 app**：直接在 Screens 用畫布的縮放（trackpad 二指捏合 / Ctrl+滾輪）拉遠即可。不需要另一個 Overview 分頁複製同一份資料。

### 決策狀態詞彙

設計會演進，沒有真正的 FINAL。在 artboard label 與 README 用以下詞彙表達狀態：

| 詞彙 | 意思 |
|---|---|
| `[Current]` 或 `Current direction · YYYY-MM-DD` | 目前傾向採用（附最後變動日期） |
| `Open question` | 這個問題還沒決定 |
| `Explored` | 看過、沒採用、保留參考 |
| `Superseded by V9 · YYYY-MM-DD` | 被某版本取代 |
| `Deprecated` | 完全淘汰 |

口味換了就改日期、改狀態，不要刪歷史。歷史是判斷下一輪方向的素材。

---

## 與 impl 的關係

> **最後一次全面對齊**：2026-05-14
> Token 名稱（`TYPOGRAPHY`、`SPACING`、`LIST_TOKENS`、`TX_LIST_TOKENS`、`SEARCH_BAR_TOKENS`、`THEMES`、`PALETTE`）、元件 props、畫面版型、icon 命名（uniqueName）都對齊 impl src。

本檔案的所有 token / icon / 元件 / 畫面，**都對應到**：

- **impl repo：** `no5_product_development/no2_accounting_app/`
- **spec repo：** `no3_product_specs/no2_accounting_app/`

每個 `screens.jsx` 內的 ScreenComponent 都標註對應的 impl 檔案（搜尋 `← src/screens/...` 即可找到）。

impl 是真相，設計稿追著對齊。impl 改 token / 改畫面 / 新增畫面時，先在這份檔案改完、跟相關人對齊視覺，再回去動 impl；或者 impl 已經改了，把這份檔案追上來作為下一輪迭代的起點。兩邊不該長期偏離。

---

## 目錄結構速查

```
project/
├── SuSuGiGi.html                  主入口
├── 00_intro/intro.jsx             Intro 分頁
├── 10_foundations/
│   ├── data.jsx                   TOKENS / SPACING / TYPOGRAPHY / ICON_LIBRARY
│   └── foundations.jsx            視覺化展示
├── 20_components/
│   ├── components.jsx             元件實作
│   └── components-showcase.jsx    視覺化展示
├── 30_screens/screens.jsx         所有正式畫面（impl 對齊）
├── 50_explorations/
│   ├── scaffold.jsx               空架構 + SOP（目前無主題）
│   └── <topic_slug>/...           各主題（按需新增）
├── 90_workbench/
│   ├── app.jsx                    ViewTabs router + SCREEN_META + ScreenFrame
│   ├── design-canvas.jsx          DesignCanvas / DCSection / DCArtboard
│   └── ios-frame.jsx              IOSDevice 邊框
└── 99_deprecated/                 已淘汰
```

數字前綴 `00 / 10 / 20 / 30 / 40 / 50 / 90 / 99` 保證檔案系統內的顯示順序與 tab 概念順序一致。新增分頁時挑空著的 10 倍數段落即可。

---

## 常見操作

### 新增一個正式畫面

1. 在 `30_screens/screens.jsx` 加新 ScreenComponent，標註對應的 impl 檔案 (`← src/screens/...`)
2. 在 `90_workbench/app.jsx` 的 `SCREEN_META` 加 meta，並在 `SCREEN_LIST` 加一筆要顯示的 pinned id

### 新增一個可重用元件

1. 在 `20_components/components.jsx` 加實作
2. 在 `20_components/components-showcase.jsx` 加 DCArtboard 展示

### 新增一個探索主題

詳見 Explorations 分頁的「SOP · 新增一個探索主題」卡。摘要：

1. 在 `50_explorations/` 建子目錄 `<topic_slug>/`
2. 子目錄裡放 `README.md` 與 `variants.jsx`
3. 在 `90_workbench/app.jsx` 接 router
4. 在 `SuSuGiGi.html` 加新 script 載入

### 在現有畫面加邊界狀態（empty / loading / error）

1. 在 `30_screens/screens.jsx` 加新元件版本（如 `HomeScreenEmpty`）
2. 在 `90_workbench/app.jsx` 的 `SCREEN_META` 加對應 id（或保留舊 id 做 default、另一個 id 做邊界狀態），並在 `SCREEN_LIST` 加一筆

### 標記決策變化

直接改 artboard label：移除 `[Current]` 改成 `Superseded by X · YYYY-MM-DD`，新提案標上 `[Current]`。

---

## URL hash 對照

| Hash | View |
|---|---|
| `#intro` | Intro |
| `#foundations` | Foundations |
| `#components` | Components |
| `#screens` | Screens |
| `#explorations` | Explorations |

舊 hash 別名（向後相容，自動轉跳）：

- `#overview` → `#screens`（Overview tab 已併入 Screens）
- `#flows` → `#screens`（Flows tab 已移除）
- `#all` → `#screens`
- `#filter` / `#tx-list` / `#recurring` / `#row-height` → `#screens`
