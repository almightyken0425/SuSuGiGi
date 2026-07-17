# App Store Connect 送審設定表

- **適用產品:**
    - `$wish` iOS App
- **涵蓋區塊:**
    - App Information
    - 年齡分級問卷
    - Pricing and Availability
- **填寫基準:**
    - 欄位與題目字面以送審現場為準
    - 逐題以語意對照下列答案

---

## App Information

### App 名稱

- **填入:**
    - `$wish`
- **理由:**
    - 品牌定案名稱，速度雙關為主軸
    - 各語系統一同名，維持品牌一致
- **審核風險:**
    - 名稱含貨幣符號，審核可能要求說明
    - 被質疑時回覆為品牌名，非價格宣稱

### Primary Category

- **填入:**
    - `Finance`
- **理由:**
    - 記帳屬財務工具
    - 使用者瀏覽與搜尋集中在此分類

### Secondary Category

- **建議:**
    - 要選，填 `Productivity`
- **理由:**
    - 最快記一筆的定位貼近效率工具
    - 多一條分類曝光路徑，無成本

### Subtitle

- **上限:**
    - 30 字元
- **en-US:**
    - **填入:**
        - `Effortless expense tracking`
    - **字元數:**
        - 27
    - **理由:**
        - 對譯中文版的無負擔語感
        - expense 與 tracking 關鍵字完整
- **zh-Hant:**
    - **填入:**
        - `無負擔記帳`
    - **字元數:**
        - 5
    - **理由:**
        - 無負擔定調語感，不帶壓迫
        - 保留記帳搜尋關鍵字
- **備選:**
    - en-US 可換 `Track spending without trying`
    - zh-Hant 可換 `隨手一記，帳就記好了`

### Content Rights

- **點選:**
    - 不含第三方內容
- **理由:**
    - 介面與內容全數自製

---

## 年齡分級問卷

- **制度:**
    - 五級制 `4+` `9+` `13+` `16+` `18+`
- **預期結果:**
    - `4+`
- **總原則:**
    - 內容題全點 `None`
    - 功能題全點 `No`

### 內容題

- **Cartoon or Fantasy Violence:**
    - 點 `None`，無卡通或虛構暴力
- **Realistic Violence:**
    - 點 `None`，無寫實暴力
- **Prolonged Graphic or Sadistic Realistic Violence:**
    - 點 `None`，無血腥虐待內容
- **Profanity or Crude Humor:**
    - 點 `None`，文案僅財務用語
- **Mature or Suggestive Themes:**
    - 點 `None`，無成人暗示主題
- **Horror or Fear Themes:**
    - 點 `None`，無恐怖驚悚元素
- **Medical or Treatment-focused Content:**
    - 點 `None`，無醫療與治療資訊
- **Alcohol, Tobacco, or Drug Use or References:**
    - 點 `None`，無菸酒毒品指涉
- **Simulated Gambling:**
    - 點 `None`，無模擬賭博玩法
- **Sexual Content or Nudity:**
    - 點 `None`，無性與裸露內容
- **Graphic Sexual Content or Nudity:**
    - 點 `None`，無圖像式性內容

### 功能題

- **Unrestricted Web Access:**
    - 點 `No`，App 無內建瀏覽器
    - Google 登入走系統瀏覽器，不屬此項
- **Gambling:**
    - 點 `No`，無真錢賭博功能
- **Contests:**
    - 點 `No`，無競賽或抽獎活動
- **User-Generated Content 相關題:**
    - 點 `No`，記帳資料僅本人可見
    - 無跨使用者分享與瀏覽
- **Messaging 與 Chat 相關題:**
    - 點 `No`，無訊息與聊天功能
- **Advertising 相關題:**
    - 點 `No`，App 不顯示廣告
- **In-App Controls 相關題:**
    - 點 `No`，全年齡內容無需控管功能

### 分級結果檢查

- **顯示:**
    - `4+`
- **檢查:**
    - 問卷不問付費，IAP 不影響分級
    - 結果非 `4+` 時回頭檢查誤點題目

---

## Pricing and Availability

### 價格

- **點選:**
    - 價格層 `Free`
- **理由:**
    - 本體免費下載
    - premium 訂閱走 In-App Purchase
- **IAP 對應:**
    - 訂閱商品在 In-App Purchases 區另行設定

### Pre-Order

- **點選:**
    - 不啟用
- **理由:**
    - 無預購行銷排程

### 供應地區

- **點選:**
    - 全部地區勾選後排除中國大陸
- **排除中國大陸理由:**
    - 上架該區需 ICP 備案文件
    - Google 服務被擋 → 登入與同步失效 → 付費驗證失效
    - 核心體驗殘缺，不供應
- **俄羅斯保留理由:**
    - App Store 該區暫停付款 → IAP 買不到
    - 免費功能不依賴付款，可正常使用
    - 保留無額外成本與風險
- **無俄語不構成排除:**
    - 產品 20 語系不含俄語
    - 介面回退英文仍可用
- **其餘地區:**
    - 全數保留
    - 20 語系覆蓋主要市場，維持最大觸及
