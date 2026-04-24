# 日期顯示規範

---

## 核心策略

- **原則:**
  - 跟隨系統語系 Locale Aware 且不提供手動切換
- **技術實作:**
  - 封裝全域函式 formatAppDate
- **模式:**
  - 支援 4 種標準格式 Date, DateWithYear, DateWithoutYear, MonthYear, Year

---

## 支援格式

### Date Without Year

- **用途:**
  - 列表、日期範圍的起迄點
- **範例:**
  - Oct 25 或 10月25日
- **Intl 設定:**
    - month: short
    - day: numeric

### Date With Year

- **用途:**
  - 編輯器、單日標題、跨年顯示
- **範例:**
  - Oct 25, 24 或 24年10月25日 使用2位數年份
- **Intl 設定:**
    - year: 2-digit
    - month: short
    - day: numeric

### Month With Year

- **用途:**
  - 月份標題
- **範例:**
  - Oct 24 或 24年10月 使用2位數年份
- **Intl 設定:**
    - year: 2-digit
    - month: short

### Year

- **用途:**
  - 年份標題
- **範例:**
  - 2024 或 2024年 維持4位數
- **Intl 設定:**
    - year: numeric
