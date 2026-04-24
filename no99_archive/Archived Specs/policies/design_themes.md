# 內建主題定義 Built-in Themes

## 主題列表

系統預設提供以下主題：

| ID | Name | Description | Type |
|----|------|-------------|------|
| `theme_light_default` | 預設淺色 Light | 系統預設的淺色主題，清晰明亮 | Light |
| `theme_dark_default` | 預設深色 Dark | 系統預設的深色主題，保護眼睛 | Dark |
| `theme_ocean_blue` | 海洋藍 Ocean | 以深藍色為主調的沈穩風格 | Light |
| `theme_forest_green` | 森林綠 Forest | 以綠色為主調的自然風格 | Dark |

---

## 主題 Token 映射

### 預設淺色 theme_light_default
- **Base**: Light Mode
- **Primary Color**: Blue #2196F3
- **Overrides**: None

### 預設深色 theme_dark_default
- **Base**: Dark Mode
- **Primary Color**: Blue #2196F3
- **Overrides**: None

### 海洋藍 theme_ocean_blue
- **Base**: Light Mode
- **Primary Color**: Ocean Blue #0277BD
- **Overrides**:
  - `color.bg.base`: #E1F5FE
  - `color.bg.surface`: #FFFFFF
  - `color.primary.main`: #0277BD

### 森林綠 theme_forest_green
- **Base**: Dark Mode
- **Primary Color**: Forest Green #2E7D32
- **Overrides**:
  - `color.bg.base`: #1B5E20
  - `color.bg.surface`: #2E7D32
  - `color.primary.main`: #81C784

---

## JSON 結構範例

```json
{
  "id": "theme_ocean_blue",
  "name": "海洋藍",
  "type": "light",
  "tokens": {
    "color.primary.main": "#0277BD",
    "color.bg.base": "#E1F5FE"
  }
}
```
