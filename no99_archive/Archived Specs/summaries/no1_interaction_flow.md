# 全域互動總覽, Unified Interaction Overview

> **核心設計哲學**: **Local-First & Unobtrusive**
> - **不阻擋**: App 啟動後立即進入首頁，不強制登入。
> - **情境感知**: 僅在使用者嘗試執行需權限操作，如付費、備份時才要求登入；啟動時不打擾。
> - **強健性**: 登入時確保使用者資料完整建立。
> - **最終一致**: 權限與資料狀態透過背景同步達成一致，UI 始終依賴本地狀態 `PremiumContext`。

## 圖表語法說明

| 關鍵字 | 意義 | 程式邏輯類比 | 說明 |
| :--- | :--- | :--- | :--- |
| **opt** | **Optional 可選** | `if condition` | 只有當條件成立時，才會執行此區塊內的動作。 |
| **par** | **Parallel 平行** | `Thread 1` `Thread 2` | 區塊內的動作是 **同時發生** 的，不分先後順序。 |
| **alt** | **Alternative 分支** | `if else` | 條件分支，只會執行其中一條路徑。 |

## 互動時序圖, Interaction Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    participant U as User
    participant App as App Client
    participant Local as Local DB
    participant Auth as Firebase Auth
    participant Cloud as Firestore
    participant IAP as IAP Platform

    box "Client Side" #f9f9f9
        participant U
        participant App
        participant Local
    end
    
    box "Server Side" #ececec
        participant Auth
        participant Cloud
        participant IAP
    end

    %% ==========================================
    %% App 啟動與生命週期
    %% ==========================================
    note over U, Cloud: App 啟動
    
    U->>App: 開啟 App
    
    par 前景 UI 渲染
        alt 冷啟動
            App->>App: 顯示 Splash Screen
            
            opt 首次啟動
                App->>Local: 檢查 Flag isInitialized
                Local-->>App: False
                App->>Local: 執行資料 Seeding
                App->>Local: 設定 isInitialized = True
            end
            
            App->>Local: 讀取本地資料
            App->>App: 渲染 Home UI
            
        else 熱啟動
            App->>App: 恢復前景
            Note right of App: UI 與資料已存在記憶體中，直接顯示
        end
    and 背景邏輯處理
        par 定期交易與權限檢查於 Local
            App->>Local: 讀取 PremiumContext
            
            opt PremiumLogic.checkPremiumStatus is False
                App->>App: 降級為 Free
                Note right of App: 包含離線過期檢查邏輯
            end

            opt isPremium == True
                App->>Local: 檢查定期交易 (Schedules)
                Note right of App: 依賴本地資料，無網也可執行
            end
        and 身份驗證與同步 (Network)
            %% 本地快速檢查
            App->>Auth: 註冊 onAuthStateChanged (SDK)
            Auth-->>App: 回調 User 狀態 (Callback)
            
            %% 雲端同步與調和
            alt 已登入
                App->>Cloud: 建立連線
                App->>Cloud: 註冊 onSnapshot
                Cloud-->>App: 推送最新 Snapshot
                
                App->>App: 比較新舊 PremiumContext
                alt 狀態改變
                    App->>App: 更新 PremiumContext
                    App->>App: 觸發 UI 重繪
                    App->>App: 執行 升級/降級 邏輯
                else 狀態未變
                    App->>App: 維持現有狀態
                    Note right of App: 無需重繪，節省資源
                end
                
                opt PremiumLogic.checkPremiumStatus is True
                    Note right of App: 確保使用最新權限狀態執行
                    App->>App: 檢查自動同步
                end
                
            else 未登入
                Note right of App: 維持訪客模式，完全不打擾使用者 (Contextual Login)
            end
        end
    end

    %% ==========================================
    %% 登入互動
    %% ==========================================
    note over U, Cloud: 登入流程
    
    Note right of U: 觸發點: 冷啟動自動彈出 或 使用者點擊
    
    U->>App: 進行 Google 登入
    App->>Auth: signInWithGoogle
    Auth-->>App: 返回 User Token
    
    App->>IAP: Sync Purchases (Login)
    IAP-->>App: 更新 Purchases (Entitlements)
    
    rect rgb(240, 248, 255)
        note right of App: 強健資料建立流程
        App->>Cloud: 查詢 User Profile
        
        alt 查詢失敗 (Network Error)
            App->>U: 顯示錯誤 (Modal 保持開啟)
        else 查詢成功
            alt Profile 已存在
                Cloud-->>App: 返回現有資料
                App->>App: 綁定 Local Data to User
                App->>Cloud: 註冊 onSnapshot
                App->>App: 關閉 Login Modal
            else Profile 不存在
                loop Max 3 Times
                    App->>Cloud: 嘗試建立 User Profile
                    alt 建立成功
                        App->>Cloud: 再次查詢
                        Cloud-->>App: 返回新建立資料
                        Note right of App: 成功跳出迴圈
                        App->>App: 綁定 Local Data to User
                        App->>Cloud: 註冊 onSnapshot
                        App->>App: 關閉 Login Modal
                    else 建立失敗
                        App->>App: 等待後重試
                    end
                end
            
                opt 3次皆失敗
                    App->>U: 顯示錯誤 (Modal 保持開啟)
                    App->>Auth: 自動登出
                end
            end
        end
    end

    %% ==========================================
    %% 日常操作與同步
    %% ==========================================
    note over U, Cloud: 日常操作
    
    par 修改偏好設定
        U->>App: 修改語言/貨幣
        App->>Local: 更新 Local State
        App->>Cloud: 寫入 users/{uid}/preferences
    and 手動同步
        U->>App: 點擊「立即同步」
        App->>Local: 查詢變更
        App->>Cloud: 批次寫入
        App->>Cloud: 查詢變更
        App->>Local: 批次更新
    end

    %% ==========================================
    %% 外部事件
    %% ==========================================
    note over U, IAP: 權限變更
    
    IAP->>App: Callback: 訂閱狀態改變
    App->>App: 更新 PremiumContext
    
    alt 升級
        App->>App: 解鎖功能 & 觸發 Initial Sync
    else 降級
        App->>App: 鎖定功能 & 停止 Sync
    end
```
