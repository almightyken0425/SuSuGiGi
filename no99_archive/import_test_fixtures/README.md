# 匯入測試 fixtures

測試記帳 App 匯入功能的 CSV 樣本。
規則對應 ImportWizardScreen 與 DataTransferLogic 的 spec、以及下載說明 guide。

## 怎麼用

1. 把某個 `.csv` 傳進模擬器，存到檔案 App。
2. App → 設定 → 資料管理 → 匯入交易（或匯入轉帳）。
3. 選該檔、跑四步精靈，對照下方「預期」。

每個 fixture 最後一欄 `result` 逐列標結果與原因，OK／BLOCKED／BAD／SKIP。
匯入時 `result` 是多出的文字欄、不會被對應、忽略即可。
`expected_result_transactions.csv` 與 `expected_result_transfers.csv` 是全部匯入後 DB 應有的記錄。

## 關鍵機制：欄位偵測是整欄 100%

- 匯入逐欄判型，分日期、金額、幣別、文字。
- 整欄每一列都合格才算該型。
- 一格壞值毀掉整欄。
- 毀掉的欄在「欄位對應」步驟不會出現在候選。
- 必填欄選不到就卡住、進不了匯入。
- 所以負向案例各自獨立檔，不跟正向混在同一欄。

兩類錯誤測法不同：

- A 類·毀欄：壞值讓整欄不被認 → 卡在欄位對應。
- B 類·執行略過：欄位過得了對應、執行時該列才被丟。

## 前置：測「沿用」要先建資料

「沿用 vs 新建」要 App 先有對應的帳戶/類別。
沿用比對看 (帳戶名+幣別)、(類別名+收支)。
測沿用前先在 App 手動建，例如：

- 帳戶 Cash、幣別 TWD
- 類別 Food、支出

之後匯入 `tx_valid_all.csv`，Cash(TWD) 與 Food(支出) 顯示沿用、其餘顯示新建。
不先建就全部顯示新建。

## 交易檔

| 檔案 | 測什麼 | 預期 |
|---|---|---|
| `tx_valid_all.csv` | 正向全餐 | 8 列全匯入。Cash 依幣別拆成 TWD/USD 兩帳戶。Adjust 依正負拆成收入/支出兩類別。`usd` 小寫視為 USD。`"lunch, drinks"` 整串進 note。日期含純日期、日期時間、`+08:00`、`Z`。 |
| `tx_invalid_amount.csv` | 金額毀欄 | 金額欄含 `1,234.56`、`$200` → 金額在欄位對應選不到 → 卡住。 |
| `tx_invalid_date.csv` | 日期毀欄 | `2026/01/03` 斜線格式 → 日期欄選不到 → 卡住。 |
| `tx_invalid_currency.csv` | 幣別毀欄 | `XYZ` 非 ISO 4217 → 幣別欄選不到 → 卡住。 |
| `tx_empty_required.csv` | 必填空毀欄 | 第 2 列 account 空 → 帳戶欄選不到 → 卡住。 |
| `tx_skip_invalid_date_value.csv` | 執行時略過 | 日期欄過格式偵測、可對應。但 `2026-02-30` 不存在 → 該列匯入時略過。結果 1 匯入、1 略過。 |

## 轉帳檔

| 檔案 | 測什麼 | 預期 |
|---|---|---|
| `transfer_valid_all.csv` | 正向全餐 | 4 列全匯入。含同幣別、跨幣別（Cash 拆 TWD/USD）、小寫幣別、整數金額。 |
| `transfer_same_currency_no_toamount.csv` | 同幣免 to_amount | `to_amount` 全空、不對應。同幣別自動補成 from_amount。2 列匯入。 |
| `transfer_skip_cross_no_toamount.csv` | 跨幣缺 to_amount 略過 | 跨幣那列缺 `to_amount` → 略過。同幣那列 → 匯入。結果 1 略過、1 匯入。 |
| `transfer_invalid_amount.csv` | 金額毀欄 | `from_amount` 含 `1,234.56` → 選不到 → 卡住。 |

## 對應的規則

- 日期：`YYYY-MM-DD` 或 `YYYY-MM-DD HH:MM:SS`，可加時區偏移 `+08:00` / `-05:00` / `Z`。
- 金額：正值收入、負值支出。句點小數最多 4 位。禁逗號、千分位、貨幣符號。
- 幣別：ISO 4217，大小寫不拘。
- 帳戶：名稱加幣別比對，同名不同幣各建獨立帳戶。
- 類別：名稱加收支正負。
- note 含逗號要用雙引號包。

## 注意：無偏移日期的 rollover

- `2026-02-30`（不帶偏移）不會略過，會默默滾成 3 月 2 日。
- 帶偏移 `2026-02-30 ...+08:00` 才會被判無效而略過。
- `tx_skip_invalid_date_value.csv` 用帶偏移版，確保是「略過」而非「滾日期」。
