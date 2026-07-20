# ASC 送審協作統整表

$wish iOS 1.0 首次送審的欄位分工單一真相。多 session 並行、每 session 只寫自己那份檔、本表由統整 session 維護。

## 分工與狀態

| # | 範圍 | 產出檔 | branch | 狀態 |
| --- | --- | --- | --- | --- |
| 1 | 文案：Description / Promotional / Keywords / Copyright（en＋zh-Hant） | `no1_copy.md` | `feat/asc-copy` | 收成（d7b1c46） |
| 2 | 6.5 吋截圖組＋清單 | `screenshots/` ＋ `no2_screenshots.md` | `feat/asc-screenshots` | 收成（eb43bc9、繁中英各 6 張） |
| 3 | App Privacy 問卷逐題答案 | `no3_privacy.md` | `feat/asc-privacy` | 收成（a048b61） |
| 4 | App Information／年齡分級／Pricing | `no4_app_info.md` | `feat/asc-appinfo` | 收成（0c9fcb6） |
| 5 | App Review 資訊＋審查備註 | `no5_review_info.md` | `feat/asc-review-note` | 收成（bcf5c67） |
| 6 | Support URL（支援站 no4_support_site 部署） | 本表下方 | 統整 session | 完成、已上線 |
| 7 | 總彙整：全欄位貼入 ASC、attach 訂閱、Add for Review | 本表下方 | 統整 session | 完成（2026-07-19 送審） |

## 協作規則

- 每 session 開自己的 Product git worktree、branch 如上表、只動自己的產出檔
- 檔案互斥、merge 零衝突；完成後留 working tree 給使用者 review、說收就 /game-stop
- 產出檔內：可直接貼 ASC 的內容用 code block 包、旁註理由
- 帳號密碼一律不落檔、留【使用者自填】

## Support URL 進度（統整 session）

- 支援頁 impl git：`no6_product_development/no4_support_site`（remote SuSuGiGi-Impl-SupportSite、merge 6125d59）
- 已部署上線：`https://swish-support.web.app`（Firebase Hosting site `swish-support`、2026-07-18 驗活）
- 內容：20 語系內嵌字典、FAQ 三題（備份題移除、刪除題不含帳號字眼、據實）

## 送審風險拍板（2026-07-18）

- Sign in with Apple（Guideline 4.8）：**不補先送**、退件風險使用者接受、被退再補
- app 內刪除帳號（Guideline 5.1.1(v)）：**不補先送**、同上

## 已定事實（各 session 引用、不重查）

- 兩訂閱 `susugigi_level1_monthly` / `_yearly` Ready to Submit、Paid Apps 合約 Active
- TF build 已出、App Attest verified、煙霧全過（2026-07-18）
- 隱私政策 URL：TermsFeed（app 內 legal.ts 同源）
- 版本 1.0、Primary locale en-US

## 送審定案（2026-07-19）

- 送審包 4 項已 Submit for Review：iOS App 1.0（build 154、commit 45799cd）＋ Premium Plans 群組＋月年兩商品
- 文案：Description 與 Promotional 對調定稿、en zh 同步、`no1_copy.md` 已回寫
- 截圖：ASC 每語系實際用 5 張、付費牆兩語系皆拔除、本地 12 張檔案照留
- Subtitle：en `Effortless expense tracking`、zh `無負擔記帳`
- Pricing：Free、174 區、排除中國大陸；Mac 與 Vision Pro 相容勾選皆取消
- 隱私：7 類 App Functionality＋linked、問卷已 Publish
- 訂閱：Level 維持月 1 年 2（拍板接受）；兩商品 review 截圖換現行付費牆
- 上線方式：Automatically release
- 審後尾巴：DSA trader 申報（EU 可能要求補）、Settings Premium 用語拍板（task chip）、Firebase Console 範本 App 刪除、Firebase Auth 的 App Check enforce、demo 帳號審後降級清理（見 `no5_review_info.md`）
