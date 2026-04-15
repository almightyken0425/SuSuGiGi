# Product Map

## Structure

```
Platform: App — 行動端 React Native
├── Auth / AppClient
│   ├── LoginFlow
│   └── PostAuthSetup
├── RecordingCore
│   ├── TransactionEditor
│   ├── TransferEditor
│   ├── RecurringTransactions
│   ├── MergeOperation
│   ├── UndoSystem
│   └── DataManagement
│       ├── DataImport
│       └── DataExport
├── HomeDashboard
│   ├── PeriodView
│   ├── FilterSystem
│   ├── ChartView
│   ├── TransactionList
│   └── SearchFunction
├── AppSetting
│   ├── DataManagement
│   │   ├── CategoryCRUD
│   │   ├── AccountCRUD
│   │   └── DataOperations
│   │       ├── DataImport
│   │       │   ├── ImportTransactions
│   │       │   ├── ImportTransfers
│   │       │   └── ImportSchedules
│   │       ├── DataExport
│   │       │   ├── ExportTransactions
│   │       │   ├── ExportTransfers
│   │       │   └── ExportSchedules
│   │       └── DangerousOperations
│   │           └── ClearDatabase
│   ├── Preference
│   │   ├── Appearance
│   │   │   ├── ThemeSystem
│   │   │   └── LaunchModeSetting
│   │   ├── CurrencyAndFinance
│   │   │   ├── BaseCurrencySetting
│   │   │   ├── CurrencyDisplayConfig
│   │   │   │   └── CurrencyDetailConfig
│   │   │   └── ExchangeRateManagement
│   │   │       └── CurrencyRateEditor
│   │   ├── RegionAndLanguage
│   │   │   ├── LanguageSetting
│   │   │   └── TimeZoneSetting
│   │   └── Account
│   │       └── LoginLogout
│   └── Plan
│       └── PlanUpgradeEntry
├── CloudSync / AppClient
│   ├── SyncEngine
│   │   ├── BatchSync
│   │   └── ConflictResolution
│   └── QuotaManagement
├── LogicEngine
│   ├── RuleEngine
│   │   ├── RuleCenter
│   │   └── RuleEditor
│   └── TimeMachine
│       └── RecalculationEngine
└── Payment / AppClient
    ├── PaywallScreen
    ├── RedeemCodeScreen
    ├── IAPService
    ├── PremiumContext
    ├── PremiumFeatureGate
    └── PremiumStatusCache

Platform: Web Console
├── WebConsole
│   ├── QueryEngine
│   │   ├── JQLInterface
│   │   └── SavedViews
│   └── ReportBuilder
│       ├── CustomDimensions
│       └── ExportFunction
└── AIAdvisor / WebClient
    ├── FinancialInsightsUI
    └── ConversationInterface

Platform: Firebase
├── Authentication
├── Storage
└── Firestore
    ├── DataCollections
    ├── SecurityRules
    └── QuotaBaseline

Platform: Cloud Service
├── AIAdvisor / Backend
│   ├── LLMProxy
│   ├── CashFlowForecastEngine
│   ├── HealthScoreEngine
│   └── NaturalLanguageQAEngine
└── MacroData
    ├── DataPipeline
    ├── MarketIntelligence
    │   ├── TrendDashboard
    │   └── CompetitiveAnalysis
    └── EnterpriseDataService
        ├── MacroAPI
        └── PrivacyCompliance

外部服務
└── LLM Provider

ExcludedModule
└── SharedLedger
```

---

## 索引

| Module                | 平台     | 說明                                           | 詳細                       |
| --------------------- | -------- | ---------------------------------------------- | -------------------------- |
| Auth / AppClient      | App      | Google 登入與首次登入初始化                    | [app/auth.md](app/auth.md)           |
| RecordingCore         | App      | 交易、轉帳、定期交易、合併、Undo、CSV 匯入匯出 | [app/recording-core.md](app/recording-core.md)           |
| HomeDashboard         | App      | 期間檢視、篩選、圓餅圖、交易清單、搜尋         | [app/home-dashboard.md](app/home-dashboard.md) |
| AppSetting            | App      | 資料管理（CategoryCRUD、AccountCRUD、匯入匯出）、偏好設定（外觀、貨幣、語言時區）、方案 | [app/app-setting.md](app/app-setting.md) |
| CloudSync / AppClient | App      | Firestore 批次雙向同步，Tier 1                 | [app/cloud-sync.md](app/cloud-sync.md)           |
| LogicEngine           | App      | 規則引擎與時光機，Tier 2，未實作               | [app/logic-engine.md](app/logic-engine.md)           |
| Payment / AppClient   | App      | Paywall、序號兌換、原生 IAP 訂閱狀態         | [app/payment.md](app/payment.md)           |
| WebConsole            | Web      | 桌面版進階查詢與報表，Tier 1                   | [web.md](web.md)           |
| AIAdvisor / WebClient | Web      | AI 財務顧問前端，Tier 3，未實作                | [web.md](web.md)           |
| Authentication        | Firebase | Firebase 身份驗證服務                          | [firebase.md](firebase.md) |
| Storage               | Firebase | Firebase 資料備份儲存                          | [firebase.md](firebase.md) |
| Firestore             | Firebase | 雲端資料庫，Delta batch sync 後端              | [firebase.md](firebase.md) |
| AIAdvisor / Backend   | Cloud    | AI 財務顧問後端，Tier 3，架構待定              | [cloud.md](cloud.md)       |
| MacroData             | Cloud    | 總體資料服務，Tier B，未實作                   | [cloud.md](cloud.md)       |
| LLM Provider          | 外部服務 | AI 推理 API 服務                               | [external.md](external.md) |
