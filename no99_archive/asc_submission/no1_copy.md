# App Store Connect 上架文案

## 品牌語境依據

- 產品代號 SuSuGiGi、對外品牌名 `$wish`
- 命名本意為速速記記，最快速記完一筆
- `$wish` 唸作 swish，兼含咻一聲與金錢雙關
- 敘事主軸是速度，願望不是主要語意
- 描述採單句問句，兩語系對照
- Promotional Text hook 維持 zh 速速記記、en swish
- 基調延續 Root Mentality，降低記帳心理負擔
- 訂閱敘事對齊 app 內 paywall 用語
    - 升級敘事用 Go Unlimited 與突破限制
    - 不使用 Premium 一詞，app 內無此稱呼

---

## 使用方式

- 各欄位文案放在 code block 內，逐字複製貼上
- Description 上限 4000 字元
- Promotional Text 上限 170 字元
- Keywords 上限 100 字元
    - 逗號分隔、不留空白
    - 不含 app 名稱字詞，已排除 wish 與 `$`
- Copyright 屬 App Information 單一欄位，不分語系
- 字元實測數字見文末檢核章節

---

## Description en-US

- 單句版對照 zh 拍板句翻譯

```
How do you make expense tracking as natural as breathing?
```

---

## Description zh-Hant

- 單句版為使用者拍板，捨棄功能列表

```
記帳該怎麼做到跟呼吸一樣自然
```

---

## Promotional Text en-US

```
Swish — one entry in seconds. No thinking, no friction, no interruption. Expense tracking, as natural as breathing.
```

---

## Promotional Text zh-Hant

```
速速記記，幾秒記完一筆。不用想、不費力、不打斷生活。記帳，就跟呼吸一樣自然。
```

---

## Keywords en-US

```
expense,budget,money,spending,tracker,bookkeeping,finance,multi-currency,offline,csv,accounting
```

---

## Keywords zh-Hant

```
記帳,收支,理財,預算,帳本,家計簿,支出,消費,開銷,存錢,儲蓄,多幣別,外幣,匯率,帳戶,現金流,薪水,旅費,財務,免費
```

---

## Copyright

- en-US 與 zh-Hant 共用同一值

```
2026 Kai Yun Chio
```

---

## 字元數檢核

- Description en-US 實測 57 字元，上限 4000、下限 10
- Description zh-Hant 實測 14 字元，上限 4000、下限 10
- Promotional Text en-US 實測 115 字元，上限 170
- Promotional Text zh-Hant 實測 38 字元，上限 170
- Keywords en-US 實測 95 字元，上限 100
- Keywords zh-Hant 實測 62 字元，上限 100
- Keywords 皆無空白、無 app 名稱字詞

---

## 送審對應補充

- LEVEL_1 兩訂閱商品需 attach 到送審版本
    - 月訂 `susugigi_level1_monthly`
    - 年訂 `susugigi_level1_yearly`
- 描述單句版不含自動續訂揭露句
    - 揭露句已在 app 內 paywall，A4 主題完成
    - 若審核要求補充，再擴寫描述即可
- 其餘 metadata 不在本文件範圍
    - 截圖、support URL、privacy policy URL 另備
