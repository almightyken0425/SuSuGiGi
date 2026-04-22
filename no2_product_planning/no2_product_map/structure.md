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
| RecordingCore         | App      | 交易、轉帳、定期交易、合併、Undo、CSV 匯入匯出 | [app/recording_core.md](app/recording_core.md)           |
| HomeDashboard         | App      | 期間檢視、篩選、圓餅圖、交易清單、搜尋         | [app/home_dashboard.md](app/home_dashboard.md) |
| AppSetting            | App      | 資料管理（CategoryCRUD、AccountCRUD、匯入匯出）、偏好設定（外觀、貨幣、語言時區）、方案 | [app/app_setting.md](app/app_setting.md) |
| CloudSync / AppClient | App      | Firestore 批次雙向同步，LEVEL_1                 | [app/cloud_sync.md](app/cloud_sync.md)           |
| LogicEngine           | App      | 規則引擎與時光機，LEVEL_2，未實作               | [app/logic_engine.md](app/logic_engine.md)           |
| Payment / AppClient   | App      | Paywall、序號兌換、原生 IAP 訂閱狀態         | [app/payment.md](app/payment.md)           |
| WebConsole            | Web      | 桌面版進階查詢與報表，LEVEL_1                   | [web_console.md](web_console/web_console.md) |
| AIAdvisor / WebClient | Web      | AI 財務顧問前端，LEVEL_3，未實作                | [ai_advisor_web_client.md](web_console/ai_advisor_web_client.md) |
| Authentication        | Firebase | Firebase 身份驗證服務                          | [authentication.md](firebase/authentication.md) |
| Storage               | Firebase | Firebase 資料備份儲存                          | [storage.md](firebase/storage.md) |
| Firestore             | Firebase | 雲端資料庫，Delta batch sync 後端              | [firestore.md](firebase/firestore.md) |
| AIAdvisor / Backend   | Cloud    | AI 財務顧問後端，LEVEL_3，架構待定              | [ai_advisor_backend.md](cloud_service/ai_advisor_backend.md) |
| MacroData             | Cloud    | 總體資料服務，LEVEL_B，未實作                   | [macro_data.md](cloud_service/macro_data.md) |
| LLM Provider          | 外部服務 | AI 推理 API 服務                               | [llm_provider.md](external_service/llm_provider.md) |
