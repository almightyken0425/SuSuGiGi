# 檔案結構計劃

## 應用程式檔案結構 Expo / React Native

```
/ 專案根目錄
|
├── assets/
│   ├── definitions/
│   │   ├── StandardCategory.json
│   │   ├── StandardAccountType.json
│   │   ├── IconDefinition.json
│   │   └── Currency.json
│   ├── images/
│   │   └── # App Icon, Logo, etc.
│   └── fonts/
│       └── # 自訂字體
|
├── src/
│   ├── components/
│   │   ├── common/             # 通用、可重用元件, e.g., Button, Modal, Card, Input
│   │   └── specific/           # 特定場景的複雜元件
│   │       ├── PieChart/
│   │       │   └── CustomPieChart.tsx
│   │       ├── TransactionList/
│   │       │   └── TransactionList.tsx
│   ├── constants/
│   │   └── theme.ts            # 主題色 THEME_COLORS, 尺寸等
│   ├── contexts/
│   │   ├── AuthContext.tsx     # 管理用戶認證狀態
│   │   └── DataContext.tsx     # 管理從 Firestore 載入的使用者資料
│   ├── hooks/
│   │   ├── useAuth.ts          # 封裝 AuthContext
│   │   └── useData.ts          # 封裝 DataContext
│   ├── locales/
│   │   ├── en.json
│   │   ├── zh-TW.json
│   │   └── i18n.ts             # i18n 初始化設定
│   ├── navigation/
│   │   └── AppNavigator.tsx    # React Navigation 導航設定
│   ├── screens/
│   │   ├── Auth/
│   │   │   └── LoginScreen.tsx
│   │   ├── Home/
│   │   │   └── HomeScreen.tsx
│   │   ├── TransactionEditor/    # 新增/編輯 交易/轉帳 的共用資料夾
│   │   │   ├── components/       # 此畫面專用的共用元件
│   │   │   │   ├── AccountSelector.tsx     # 帳戶選擇器
│   │   │   │   ├── CategorySelector.tsx    # 類別選擇器
│   │   │   │   ├── DatePicker.tsx          # 日期選擇器
│   │   │   │   └── ScheduleModal.tsx       # 定期交易設定 Modal
│   │   │   ├── TransactionEditorScreen.tsx # 收支編輯器畫面 - 組合共用元件
│   │   │   └── TransferEditorScreen.tsx    # 轉帳編輯器畫面 - 組合共用元件
│   │   ├── Settings/
│   │   │   ├── SettingsScreen.tsx          # 設定主頁
│   │   │   ├── AccountManagement/
│   │   │   │   ├── AccountListScreen.tsx
│   │   │   │   └── AccountEditorScreen.tsx
│   │   │   ├── CategoryManagement/
│   │   │   │   ├── CategoryListScreen.tsx
│   │   │   │   ├── CategoryEditorScreen.tsx
│   │   │   └── PreferenceScreen.tsx      # 偏好設定頁面 - 幣別/時區/語系
│   │   │   ├── CurrencyManagement/         # 付費功能
│   │   │   │   ├── CurrencyRateListScreen.tsx
│   │   │   │   └── CurrencyRateEditorScreen.tsx
│   │   │   └── IconPickerScreen.tsx        # 共用的圖標選擇器頁面
│   │   ├── Search/
│   │   │   └── SearchScreen.tsx
│   │   ├── Import/
│   │   │   └── ImportScreen.tsx
│   │   └── Paywall/
│   │       └── PaywallScreen.tsx
│   ├── services/
│   │   ├── firebase.ts           # Firebase 初始化設定
│   │   ├── authService.ts        # 登入/登出/首次登入邏輯
│   │   └── firestoreService.ts   # 所有 Firestore CRUD 操作
│   ├── store/
│   │   └── # 狀態管理, e.g., Zustand 或 Redux Toolkit - 可選, Context 優先
│   ├── types/
│   │   └── index.ts              # TypeScript 介面定義
│   └── utils/
│       ├── formatters.ts         # 貨幣、日期格式化
│       ├── iconHelper.ts         # Icon 映射/篩選邏輯
│       └── timeHelper.ts         # 時區、日期計算
|
├── App.tsx                   # App 入口, 載入導航和 Context Providers
├── babel.config.js
├── package.json
└── tsconfig.json
```