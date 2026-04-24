# 設計代幣定義 Design Tokens

## 色彩系統 Color System

### 基礎色盤 Base Palette
定義系統中使用的所有原始顏色。

- **Neutral 中性色**: 用於背景、文字、邊框
  - `neutral-0`: #FFFFFF
  - `neutral-50`: #FAFAFA
  - `neutral-100`: #F5F5F5
  - `neutral-200`: #EEEEEE
  - `neutral-300`: #E0E0E0
  - `neutral-400`: #BDBDBD
  - `neutral-500`: #9E9E9E
  - `neutral-600`: #757575
  - `neutral-700`: #616161
  - `neutral-800`: #424242
  - `neutral-900`: #212121
  - `neutral-950`: #121212
  - `neutral-1000`: #000000

- **Primary 主色**: 品牌識別色
  - `primary-100`: #E3F2FD Lightest
  - `primary-500`: #2196F3 Main
  - `primary-900`: #0D47A1 Darkest

- **Semantic 語意色**
  - `success`: #4CAF50
  - `warning`: #FFC107
  - `error`: #F44336
  - `info`: #2196F3

### 語意代幣 Semantic Tokens
將基礎顏色映射到具體用途，支援 Light/Dark 模式切換。

| Token Name | Description | Light Mode Default | Dark Mode Default |
|------------|-------------|--------------------|-------------------|
| `color.bg.base` | 應用程式背景色 | `neutral-50` | `neutral-950` |
| `color.bg.surface` | 卡片、對話框背景色 | `neutral-0` | `neutral-900` |
| `color.bg.surface.hover` | 懸停狀態背景色 | `neutral-100` | `neutral-800` |
| `color.text.primary` | 主要文字 | `neutral-900` | `neutral-50` |
| `color.text.secondary` | 次要文字 | `neutral-600` | `neutral-400` |
| `color.text.disabled` | 停用文字 | `neutral-400` | `neutral-600` |
| `color.border.base` | 一般邊框 | `neutral-200` | `neutral-800` |
| `color.border.focus` | 聚焦邊框 | `primary-500` | `primary-500` |
| `color.primary.main` | 主色按鈕、圖標 | `primary-500` | `primary-500` |
| `color.primary.contrast` | 主色上的文字 | `neutral-0` | `neutral-0` |
| `color.status.success` | 成功狀態 | `success` | `success` |
| `color.status.error` | 錯誤狀態 | `error` | `error` |

---

## 字型系統 Typography System

### 字型家族 Font Family
- **Base**: Inter, Roboto, "Noto Sans TC", sans-serif
- **Monospace**: "JetBrains Mono", Consolas, monospace

### 字級 Font Size
- `text-xs`: 12px
- `text-sm`: 14px
- `text-base`: 16px
- `text-lg`: 18px
- `text-xl`: 20px
- `text-2xl`: 24px
- `text-3xl`: 30px

### 字重 Font Weight
- `font-regular`: 400
- `font-medium`: 500
- `font-bold`: 700

---

## 間距系統 Spacing System
基於 4px 的網格系統。

- `space-1`: 4px
- `space-2`: 8px
- `space-3`: 12px
- `space-4`: 16px
- `space-6`: 24px
- `space-8`: 32px
- `space-12`: 48px
- `space-16`: 64px

---

## 圓角系統 Radius System
- `radius-sm`: 4px
- `radius-md`: 8px
- `radius-lg`: 12px
- `radius-full`: 9999px

---

## 陰影系統 Shadow System
- `shadow-sm`: `0 1px 2px 0 rgba(0, 0, 0, 0.05)`
- `shadow-md`: `0 4px 6px -1px rgba(0, 0, 0, 0.1)`
- `shadow-lg`: `0 10px 15px -3px rgba(0, 0, 0, 0.1)`
