# 待辦追蹤

## 文件定位

- 已分派但尚未收斂的工作，一項一節
- 只記分派內容與判準，不記執行細節。執行成果落在各自的層 git
- 完成的項目連同其節一併刪除，不留已完成標記

---

## Mac 側環境補齊與 marker 通道驗證

2026-08-06 於 Windows 側完成回歸計劃的環境解封與假訊號止血後分派。Windows 能做的都做完了，剩下五項只能在 Mac 上完成。

背景：計劃的手段條件原本假設單一環境，實際上兩台機可跑的手段不同。能力側寫已改為手段表加就緒探測表兩張，就緒欄逐台機各一。Mac 欄目前全是待實測，填回前不得當成成立。

### 一、裝依賴

- app impl 主 checkout 跑 `npm ci --legacy-peer-deps`
- 後端 impl 的 `functions/` 跑 `npm ci`

app 側必須帶 `--legacy-peer-deps`。裸 `npm ci` 會被 `@types/react-native` 的 peer 衝突擋下，lockfile 本身是完整的。

### 二、確認 firebase CLI 登入

跑 `firebase login:list`，要有有效帳號。這是 `firestore-read` 十一點與 `cloud-logging` 四點的前提。

Windows 側不裝 firebase CLI 屬既定決議，不是待補項。

### 三、驗 QA 標記擷取通道

**這項是十個 qa-markers 檢查點能否免人工的唯一前提，優先於其餘各項。**

跑一次 `/sim-review`，冷啟 app 後對該次 Metro log 檔 grep `QA BOOT`。抓得到即通道成立。

判準與後果：

- 抓得到——腳本那十列照現行寫法由 Claude 自動判讀，單輪省二十到三十分鐘
- 抓不到——那十列退回使用者貼回 console 輸出，能力側寫的 `qa-markers` 執行者改回使用者

抓不到的常見原因是跑的是 Release build。`__DEV__` 為 false 時標記整批不輸出。

通道細節與指令見 sim-review skill 的回歸驗證模式段。

### 四、回填就緒探測表

前三項各自實測後，把結果填進 Module Quality git 能力側寫的就緒探測表 Mac 欄，填時標日期。

### 五、實測 sqlite-local 能否解阻

能力側寫目前把 `sqlite-local` 判為受阻，理由是資料庫檔在 Mac simulator 容器、無既定查詢流程。

在 Mac 上試 `xcrun simctl get_app_container` 定位容器後直查 WatermelonDB 的 db 檔。成立就自己寫一支查詢腳本、側寫改為可用。封存的舊 QA 工具一律不回收，需要什麼重寫。

解阻後 LD-02 與 LD-03 的落庫斷言可由 manual-ui 加 jest 夾擊改為直接查證。

**動哪些 git**——第一、三項只跑指令不改檔；第四、五項動 Module Quality git。

---

## 核心信心集尚未定義

2026-08-07 於回歸計劃四批優化收尾時補登。缺口早已寫在場次腳本層索引裡，但只活在該檔內文、沒有進本檔，是會被忘掉的那種。

背景：選集政策定了四個檔位，中間那格空著。不安心時只能二選一。要嘛 15 分鐘的 R00，要嘛 7 小時的全量，中間沒有東西接。

### 要做什麼

先為檢查點加信心級標記。再依標記導出爆炸半徑最大的一組，目標單輪 1 小時內跑完。

判準與後果：

- 信心級標記屬計劃層改動，落在回歸計劃十冊，不在場次腳本層
- 導出後回填場次腳本層索引的選集表狀態格，並刪去該檔的現況缺口段
- 缺口填上就不留已完成標記，與本檔的文件定位同規則
- 版本差異選集的範圍界定依賴這一格。這格空著時，選集下界只能拿 R00 頂替

**動哪些 git**——Module Quality git 一處。
