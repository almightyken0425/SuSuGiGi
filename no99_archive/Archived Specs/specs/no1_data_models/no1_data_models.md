# 資料結構

## 使用者自訂資料結構

### 設定 Settings

- **欄位:**
    
    - `id`: String, UUID/GUID - Primary Key, 通常只有一筆記錄, Single Row
        
    - `userId`: String, Auth UID - Foreign Key to Users, Not Null, Index
        
    - `language`: String - Not Null, 介面語言代碼, 例如 zh-TW, en
        
    - `baseCurrencyId`: Number - Foreign Key to Currencies, Not Null, 主要貨幣
        
    - `timeZone`: String - Not Null, IANA Timezone ID, 例如 Asia/Taipei
        
    - `theme`: String - Not Null, 主題設定, 例如 light, dark, system
        
    - `createdOn`: Number, Unix Timestamp ms - Not Null
        
    - `updatedOn`: Number, Unix Timestamp ms - Not Null, 資料最後更新時間, 同步依據
    
    **與 User Management 的關係**: 此表為 `users/{uid}/preferences` 的本地快取。
    - `language`, `timeZone`, `theme` 直接對應。
    - `baseCurrencyId` 對應 `preferences.currency` ，需進行 ID <-> ISO Code 轉換。
    - 需保持雙向同步。
        

### 帳戶 Accounts

- **欄位:**
    
    - `id`: String, UUID/GUID - Primary Key
        
    - `userId`: String, Auth UID - Foreign Key to Users, Not Null, Index, 資料擁有者
        
    - `name`: String - Not Null
        
    - `icon`: Number - Foreign Key to IconDefinitions
        

    - `currencyId`: Number - Foreign Key to Currencies, Not Null
        
    - `standardAccountTypeId`: Number | Null - Foreign Key to StandardAccountTypes, Nullable
        
    - `sortOrder`: Number - Not Null, Default 0, 用於使用者自訂排序
        
    - `createdOn`: Number, Unix Timestamp ms - Not Null, 資料建立的系統時間
        
    - `updatedOn`: Number, Unix Timestamp ms - Not Null, 資料最後更新時間, 同步依據
    - `scheduleId`: String | Null - Foreign Key to Schedules, Nullable, 標記此筆為定期交易產生
        
    - `deletedOn`: Number | Null, Unix Timestamp ms - Nullable, Index
        
    - `disabledOn`: Number | Null, Unix Timestamp ms - Nullable, 使用者主動停用此帳戶的時間；Null 代表啟用中
        

### 類別 Categories

- **欄位:**
    
    - `id`: String, UUID/GUID - Primary Key
        
    - `userId`: String, Auth UID - Foreign Key to Users, Not Null, Index, 資料擁有者
        
    - `name`: String - Not Null
        
    - `icon`: Number - Foreign Key to IconDefinitions
                
    - `standardCategoryId`: Number - Foreign Key to StandardCategory, Not Null, 用於報表歸類
        
    - `sortOrder`: Number - Not Null, Default 0, 用於使用者自訂排序
        
    - `createdOn`: Number, Unix Timestamp ms - Not Null
        
    - `updatedOn`: Number, Unix Timestamp ms - Not Null, 資料最後更新時間, 同步依據
        
    - `deletedOn`: Number | Null, Unix Timestamp ms - Nullable, Index
        
    - `disabledOn`: Number | Null, Unix Timestamp ms - Nullable, 使用者主動停用此類別的時間；Null 代表啟用中
        

### 收支紀錄 Transactions

- **欄位:**
    
    - `id`: String, UUID/GUID - Primary Key
        
    - `userId`: String, Auth UID - Foreign Key to Users, Not Null, Index, 資料擁有者
        
    - `accountId`: String - Foreign Key to Accounts, Not Null
        
    - `categoryId`: String - Foreign Key to Categories, Not Null
        
    - `amountCents`: BigInt - Not Null, 金額正數, 收入或支出由 Category 決定
        
    - `transactionDate`: Number, Unix Timestamp ms - Not Null, 交易發生日，使用者可編輯, 用於報表與排序
        
    - `note`: String | Null - Nullable, 用於搜尋
        
    - `createdOn`: Number, Unix Timestamp ms - Not Null
        
    - `updatedOn`: Number, Unix Timestamp ms - Not Null, 資料最後更新時間, 同步依據
        
    - `scheduleId`: String | Null - Foreign Key to Schedules, Nullable
        
    - `scheduleInstanceDate`: Number | Null, Unix Timestamp ms - Nullable
        
    - `deletedOn`: Number | Null, Unix Timestamp ms - Nullable, Index
        

### 轉帳紀錄 Transfers

- **欄位:**
    
    - `id`: String,  UUID/GUID - Primary Key
        
    - `userId`: String, Auth UID - Foreign Key to Users, Not Null, Index, 資料擁有者
        
    - `accountFromId`: String - Foreign Key to Accounts, Not Null
        
    - `accountToId`: String - Foreign Key to Accounts, Not Null
        
    - `amountFromCents`: BigInt - Not Null, 轉出帳戶的金額, 以該帳戶幣別計
        
    - `amountToCents`: BigInt - Not Null, 轉入帳戶的金額, 以該帳戶幣別計
        
    - `impliedRateScaled`: BigInt - Nullable, 儲存匯率乘以一百萬後的整數
        
    - `transactionDate`: Number, Unix Timestamp ms - Not Null, 轉帳發生日, 用於報表篩選
        
    - `createdOn`: Number, Unix Timestamp ms - Not Null, 資料建立的系統時間
        
    - `updatedOn`: Number, Unix Timestamp ms - Not Null, 資料最後更新時間, 同步依據
        
    - `note`: String | Null - Nullable, 用於搜尋
        
    - `scheduleId`: String | Null - Foreign Key to Schedules, Nullable
        
    - `scheduleInstanceDate`: Number | Null, Unix Timestamp ms - Nullable
        
    - `deletedOn`: Number | Null, Unix Timestamp ms - Nullable, Index
                

### 貨幣匯率 CurrencyRates

- **欄位:**
    
    - `id`: String, UUID/GUID - Primary Key
        
    - `userId`: String, Auth UID - Foreign Key to Users, Not Null, Index, 資料擁有者
        
    - `currencyFromId`: Number - Foreign Key to Currencies, Not Null
        
    - `currencyToId`: Number - Foreign Key to Currencies, Not Null
        
    - `rateCents`: BigInt - Not Null, 儲存匯率乘以一百萬後的整數
        
    - `rateDate`: Number, Unix Timestamp ms - Not Null, 匯率生效日期, 儲存該日 00:00:00 UTC
        
    - `createdOn`: Number, Unix Timestamp ms - Not Null
        
    - `updatedOn`: Number, Unix Timestamp ms - Not Null, 資料最後更新時間, 同步依據
        

### 定期交易排程 Schedules

- **欄位:**
    
    - `id`: String, UUID/GUID - Primary Key
        
    - `userId`: String, Auth UID - Foreign Key to Users, Not Null, Index, 資料擁有者
        
    - `scheduleType`: String - Not Null, 例如 daily, weekly, monthly, yearly
        
    - `startOn`: Number, Unix Timestamp ms - Not Null, 排程開始日期, 基於使用者時區的 00:00:00 轉存 UTC
        
    - `endOn`: Number | Null, Unix Timestamp ms - Nullable, 排程結束日期
        
    - `isTransfer`: Boolean - Not Null, true 代表轉帳排程, false 代表收支排程
        
    - `templateAmountCents`: BigInt | Null, 收支金額
        
    - `templateCategoryId`: String | Null, 收支類別 ID
        
    - `templateAccountId`: String | Null, 收支帳戶 ID
        
    - `templateAmountFromCents`: BigInt | Null, 轉出金額
        
    - `templateAccountFromId`: String | Null, 轉出帳戶 ID
        
    - `templateAmountToCents`: BigInt | Null, 轉入金額
        
    - `templateAccountToId`: String | Null, 轉入帳戶 ID
        
    - `templateNote`: String | Null
        
    - `createdOn`: Number, Unix Timestamp ms - Not Null
        


---

### PremiumContext Local State

- **說明:**
  - 本地持久化狀態，用於離線檢查 Premium 權限。
- **欄位:**
    - `expirationDate`: Number | Null
        - **格式:**
          - Timestamp
        - **說明:**
          - Premium 到期時間，Null 代表無期限 Lifetime。
        - **來源:**
          - 從 IAP 平台回傳結果解析。
    - `lastChecked`: Number
        - **格式:**
          - Timestamp
        - **說明:**
          - 上次向 IAP 服務查詢的時間。
    - `rawPurchases`: Object
        - **格式:**
          - JSON
        - **說明:**
          - IAP 服務原始回傳資料，作為除錯與備用。

---

## App 標準定義資料

- **現況:**
  - 這些是 App 內建的靜態參考資料, 將打包在 App 中或從遠端載入

### 標準收支類別 StandardCategory

- **說明:**
  - 統一管理標準的收支大類，使用者自訂類別需映射到此。
- **檔案:**
  - `assets/definitions/StandardCategory.json`
- **欄位:**
    - `id`: `Number`
    - `categoryType`: `Number` - 0 代表收入, 1 代表支出
    - `translationKey`: `String`
    - `defaultName`: `String`
    

### 標準帳戶類型 StandardAccountType

- **說明:**
  - 定義帳戶的金融本質分類, 例如支付, 投資, 貸款, 其他
- **檔案:**
  - `assets/definitions/StandardAccountType.json`
- **欄位:**
    - `types`: `Array<String>`
    - `tags`: `Array<String> | Null`, 選填
    

### 貨幣 Currencies

- **說明:**
  - 定義支援的貨幣及其基本資訊。
- **檔案:**
  - `assets/definitions/Currency.json`
- **欄位:**
    - `id`: `Number` - ISO Numeric
    - `name`: `String`
    - `alphabeticCode`: `String` - ISO Alpha
    - `numericCode`: `Number`
    - `minorUnits`: `Number`
    - `symbol`: `String | Null`
    

---

## 時間格式標準

- **儲存標準:**
    - 所有在資料結構中與時間相關的欄位, 例如 `transactionDate`, `createdOn`, `updatedOn`, `deletedOn`, `rateDate`, `startOn`, `endOn`, `scheduleInstanceDate`, **必須** 儲存為 **UTC Unix Timestamp 毫秒** 的 `number` 型別
- **計算與顯示標準:**
    - 所有時間的計算, 例如判斷今天或報表區間, 以及所有時間的顯示, 都**必須**基於使用者在 `Settings` 中設定的**主要時區 timeZone** 來進行轉換
