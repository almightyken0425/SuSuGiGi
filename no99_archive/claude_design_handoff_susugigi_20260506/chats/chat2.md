# Transaction List Design

_Started 2026-05-05 11:55 UTC_

---

## User

我想要處理 homescreen 的 支出收入按鈕 底下的 transaction list，包含收和的row 以及 單筆紀錄的 row，請幫我發想一些提案，看怎麼改比較好，記得拆開列出 依類別 以及 依日期 分組的畫面

## Assistant

我先看一下目前的 homescreen 設計，理解現有的視覺語言再發想提案。

_[tool: list_files]_

_[tool: read_file]_

_[tool: read_file]_

我需要看 HomeScreen 目前的 transaction list 長相。

_[tool: read_file]_

我看一下 data 和 components，了解現有的視覺語言：

_[tool: read_file]_

_[tool: read_file]_

我已經理解現有的 transaction list 結構。現在來發想提案。

目前的設計：
- **依日期模式**: 大區段標題 (May 2 / 總額) + row(icon + 分類名 + note + 金額)
- **依分類模式**: 大區段標題 (圖示+分類名 + 總額) + row(金額 + note + 日期)

我會發想 6-8 個 transaction list 的提案，分別涵蓋兩種分組模式，每個提案都會同時呈現「依日期」和「依分類」兩個畫面，方便對比。

_[tool: update_todos]_

我來發想方案。會做出 7 個提案，每個都拆成「依日期」和「依分類」兩個畫面。

_[tool: write_file]_

[I'll continue with the task.]

_[tool: snip]_

Now I'll wire up a host page that shows each variant inside an iOS device frame, with the period switcher / focus row above so the section is contextualized like the real Home screen.

_[tool: str_replace_edit]_

_[tool: snip]_

Now I need to add the `TxListPreviewFrame` component which gives each variant the same context (header, period switcher, donut placeholder, focus row) as the real Home screen. Let me add it to app.jsx.

_[tool: read_file]_

_[tool: snip]_

_[tool: str_replace_edit]_

[I'll continue.]

Now load the new script and verify.

_[tool: str_replace_edit]_

[Continuing the task.]

_[tool: snip]_

_[tool: done]_

_[tool: snip]_

_[tool: fork_verifier_agent]_

我做了 7 個 transaction list 提案，每個都拆「依日期」「依分類」兩個畫面，放在 design canvas 新區段「Transaction List — 提案」：

- **V1 · Timeline rail** — 左欄固定大字日期/月份，垂直細線分隔
- **V2 · Card stack** — 每個 section 獨立白卡，靠 gap 分組
- **V3 · Pill header** — section header 縮成藥丸 chip，row 極簡
- **V4 · Header + bar** — 大字標題 + 進度條顯示佔比，掃視花最多
- **V5 · Ledger** — 紙本帳冊風，dotted 引導線連 note 與金額
- **V6 · Number-first** — 金額放最左等寬大字，掃視最大筆
- **V7 · Two-line** — 兩行高 row，含分類 chip 與帳戶名

每個 frame 都包了完整 Home context（header / 期間切換 / donut / focus row），方便和現況直接對照。

## User

提案裡面都是將當日或該類別裡面的 transaction展開的情境，請一起列出來收合的情境

## Assistant

_[tool: snip]_

我來為每個變體加入「收合」狀態的展示。讓每個提案的 by-date / by-category 各自呈現「展開 + 收合」混合狀態，這樣就能看到 header 在收合時的樣子。

我會：
1. 讓每個變體 component 接受 `collapsed` map 參數
2. 收合時只渲染 header（含「N 筆」提示），不渲染 row
3. 在 preview frame 加入預設的混合收合狀態（例如：第一段展開、其他收合）

_[tool: read_file]_

我採用比較簡潔的策略：重寫 tx-list-variants.jsx，讓每個變體都支援 `collapsed` 狀態，並在 design canvas 直接讓每個提案出兩種畫面：**全展開** 和 **全收合**（每個 section 顯示一個 collapsed header）。同時 by-date 和 by-category 都各做兩張（展開/收合），這樣每提案 4 張畫面對照。

_[tool: write_file]_

_[tool: snip]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: snip]_

_[tool: done]_

_[tool: fork_verifier_agent]_

每個提案現在都有 4 張畫面：依日期展開 / 依日期收合 / 依分類展開 / 依分類收合，section header 都加了可旋轉的 chevron 與「N 筆」提示，方便看收合態下的視覺密度與排版。

## User

Timeline rail 展開的部分看起來不錯，特別是左邊有日期/類別跟總金額的顯示，但收起的時候就很怪，一個組的高度佔很高

Card stack 整個就看起來很合理，而且每一組的區隔看起來很明顯，單筆的紀錄在依類別分組的時候應該就不用寫類別名稱的文字，在類別分組的時候日期可以跟日期分組的排列一樣方在 icon 的位置，這樣兩邊就會對齊排版，而且一個類別或一個日期一個 card 我覺得滿不錯的，視覺上比較有區分感，其他沒有 card 的就會層次感比較低，或許 divider 也是一種增加分層感或層次感的一種方式，再下一輪的提案不一定要用 card or divider，你可以想想什麼方式可以增加層次感

Phill Header 在展開的時候不錯，因為展開的時候要看單一項目，類別或日期標題比較小，看起來很合理，但收合起來的時候就顯得日期或類別的標題太小，可能可以做成收闔的時候標題是大的，跟 Card stack 的大小差不多，展開的時候變成Pill header的標題大小，中間透過動畫來處理變大變小，在展示的時候展開收闔應該不用拆兩個畫面， 就一個畫面然後展開跟收合的狀態混搭

Header + bar 很醜，不考慮
Ledger 也很醜，不考慮
Number first 有一點點醜，雖然還可以接受，但金額數字應該要在右邊

Two line 跟 card stack 或 timeline rail 很像，我覺得也不錯，我覺得缺點的部分應該跟前面講的幾個要點有重疊到

請再給我第二輪提案，第一輪的留 timeline rail, card stack, two line 其他可以砍掉

## Assistant

_[tool: snip]_

我整理一下第二輪的方向：

**第一輪保留**：V1 Timeline rail（修收合態）、V2 Card stack（依分類去掉類別字、日期放左 icon 位）、V7 Two-line  
**第一輪砍掉**：V3 Pill header、V4 Header+bar、V5 Ledger、V6 Number-first  
**改造**：V3 重做成「展開/收合 morph」單畫面動畫版（小標題 ↔ 大標題）  
**新增層次感探索**：除了 card / divider，試試其他方式（color block、indent、bg tint、left bar、background contrast、letter-spacing）

第二輪我會出 5 個新提案 + 把第一輪的 V1/V2/V7 修好，然後新增一個 V3 morph 互動版。

_[tool: update_todos]_

開始實作。先修 V1/V2/V7，再新增第二輪提案。

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: snip]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: snip]_

現在新增第二輪提案檔。第二輪會：
1. **R1 · Morph header** - V3 的進階版，收合大標題、展開小標題（單畫面動畫）
2. **R2 · Indent rhythm** - 用左側 indent + typography 階層，無 card 無 divider
3. **R3 · Tinted band** - section header 一條淡色背景帶，row 在白底
4. **R4 · Left bar accent** - 細色條 + 大留白
5. **R5 · Bg contrast** - section 在淺灰、row 在白底（反轉現況）

_[tool: write_file]_

_[tool: snip]_

_[tool: str_replace_edit]_

[I'll continue.]

Now I need to update app.jsx to:
1. Remove the砍掉 variants (V3/V4/V5/V6) from canvas
2. Switch V1/V2/V7 to single-frame mixed states (展開+收合 same screen)
3. Add R1-R5 round-2 cards

_[tool: str_replace_edit]_

_[tool: snip]_

_[tool: done]_

_[tool: update_todos]_

_[tool: fork_verifier_agent]_

_[tool: snip]_

整理完成。Canvas 現在有兩段：

- **第一輪保留 (V1 / V2 / V7)** — 每個 6 張：依日期+依分類，混合展開/收合在同一畫面（前兩段展開、後兩段收合），方便看視覺密度與分隔效果在兩種狀態下的表現。
- **第二輪 (層次感探索) R1–R5** — 同樣 6 張一組，5 種不靠 card / 大 divider 拉層次的手法：
  - **R1 · Morph header** — header 收合時變窄藥丸，展開時拉成全寬大標
  - **R2 · Indent rhythm** — 用 indent + 行高節奏拉層次
  - **R3 · Tinted band** — 淡色背景帶區隔 section
  - **R4 · Left bar** — 左側細色條當 section 標記
  - **R5 · Inverted band** — 反相背景的 header band

