## LocalDatabase — 本機資料層

App 平台的基礎設施節點，全 module 共用的 Local-First 本機持久化層。所有 App 資料先落本地，再由 CloudSync 背景同步至雲端。

- **技術：**
    - WatermelonDB
- **功能：**
    - 所有 App 資料的本機持久化儲存
    - 支援響應式查詢，資料變動自動觸發 UI 更新
    - 提供 Sync Adapter 介面，對接 Firestore 批次同步
- **目的：**
    - 實現 Local-First 架構，確保 App 在離線狀態下完整運作
- **排除：**
    - 直接操作 SQLite；AsyncStorage
