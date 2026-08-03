# 2026-08-03 · Xcode Cloud 版本鎖定與 fmt consteval 懸案

## Context

- 記帳 App module `no2_accounting_app` 的 iOS 雲端建置懸案
- 建置環境被迫釘在 Xcode 26.3，無法升級
- 撰寫當下 App 已送審，暫不動 code
- 本文記錄根因、驗證過的修法、與未來處理時的選項比較
- 修法全數未合入，`main` 維持送審時的狀態

---

## 現象

- 2026-08-02 重送 build 時把 Xcode Cloud workflow 從 26.3 升到 26.6
- `fmt` 編譯失敗，錯誤集中在 `format-inl.h` 的第 59、60、1387、1391、1394 行

```
Call to consteval function 'fmt::basic_format_string<...>::basic_format_string<FMT_COMPILE_STRING, 0>'
is not a constant expression
```

- 退回 26.3 後建置恢復正常
- App Store Connect 可選版本清單為 26.6、26.5、26.4.1、26.3
- 26.3 是清單中最舊的一個 → 退役後將完全無法建置

---

## 根因

- `fmt` 版本被 `RCT-Folly.podspec` 寫死 → 無法單獨升版

```ruby
# node_modules/react-native/third-party-podspecs/RCT-Folly.podspec 第 27 行
spec.dependency "fmt", "11.0.2"
```

- `fmt` 11.0.2 的格式字串建構子被標為 consteval
- 該建構子在同一次立即呼叫內把字面值求值兩次
- C++ 標準允許兩次求值得到不同指標 → 此寫法不保證成立
- clang 20 起強制這條規則，Apple Clang 21 隨 Xcode 26.4 帶入
- 於是該 consteval 呼叫不再是常數運算式 → 26.3 編得過、26.6 編不過
- 失敗的是 `fmt` 自己的實作檔，不是 App 的程式碼

- **上游修復時序:**
    - `fmt` 於 2024-08-31 的 commit `8c4b17fe` 拿掉該 overload 的 consteval 標記
    - 修復隨 `fmt` 11.1.0 於 2024-12-25 釋出
    - 11.0.2 是最後一個受影響的版本

---

## 官方開關在此版本無法從外部啟用

- `fmt` 提供 `FMT_USE_CONSTEVAL` 開關，設為 0 會退回 constexpr 舊路
- 11.0.2 的定義位置為 `base.h` 第 114 行至第 132 行
- 該處是無保護的條件編譯鏈，缺少外部覆蓋所需的 `#ifndef`
- 命令列傳入的定義會被檔案內部重新定義蓋掉

- **覆蓋口的加入時點:**
    - 使用者覆蓋口是 `fmt` 12.1.0 的 commit `a2fd48e0` 才加入
    - 11.1.4、11.2.0、12.0.0 皆尚未具備
    - 升到 12.1.0 以上才能單靠編譯器巨集關閉，不必改寫原始碼

- **本機實測結論:**
    - 傳入 `-DFMT_USE_CONSTEVAL=0` 後編譯器只丟一則巨集重複定義警告
    - 最終生效值仍為 1 → 單獨設定編譯器巨集完全無效
    - 驗證環境為 Apple clang 17.0.0 搭配 Xcode 26.2

---

## 關掉開關的真實代價

- 撰寫過程一度誤判為行為等價，實測後推翻
- 代價視格式字串的包裝方式而不同

- **實測結果:**
    - `FMT_STRING` 包裝的站點 → 編譯期檢查維持有效
    - 未包裝的純字面值站點 → 編譯期檢查失效，編譯直接通過
    - 錯誤格式降級為執行期拋出 `fmt::format_error`

- **對本專案的實際影響:**
    - `RCT-Folly` 內 `FMT_STRING` 使用數為零
    - `RCT-Folly` 內 `fmt::format` 呼叫共 13 處，全屬純字面值
    - 這些站點的格式檢查全數降級到執行期
    - 現有程式碼不會因此變壞，現在編得過即代表字串合法
    - 損失的是未來新增錯誤格式時的編譯期偵測能力

---

## 建置環境的既有條件

- 雲端建置腳本位於 `ios/ci_scripts/`
- `ci_post_clone.sh` 的執行順序為安裝 Node、`npm install`、`pod install`
- `npm install` 會觸發 patch-package 的安裝後處理
- 順序正確 → 修改 node_modules 內容的修法在雲端會生效
- 腳本開頭有 `set -e`，但 CocoaPods 的警告不會讓 `pod install` 回傳非零值

---

## 選項比較

### Podfile 改寫覆蓋口

- **狀態:**
    - 已於 branch `feat/fmt-consteval-flag` 實作完成，未合入
- **機制:**
    - 安裝後處理改寫 `base.h`，把條件編譯鏈包進 `#ifndef`
    - 再對 pod target 加入 `FMT_USE_CONSTEVAL=0` 前置處理器定義
- **已驗證的機械正確性:**
    - 重複執行安全，錨點字串在檔內唯一
    - 條件編譯結構平衡，唯讀權限先開後還原
    - 產物體積與正確性無實質差異
- **合入前必修:**
    - 兩個警告分支改為中斷 → 目前警告不會讓雲端建置停下
    - 定義收窄到 `fmt` 單一 target → 其他 pod 保住編譯期檢查
    - 修正原始碼註解中行為等價的錯誤描述
    - 前置處理器定義的字串切分會拆壞含空白的值，屬潛在缺陷
- **優點:**
    - 不動 `fmt` 版本、不動 React Native 版本，變更面最小
    - 實作已完成，機械正確性逐項驗過
- **缺點:**
    - 純字面值的格式檢查降到執行期
    - 改寫的是未進版控的第三方原始碼 → 兩台機器可有相同鎖定檔卻不同內容
    - 與上游修法分岔，每次升版都要重新確認
- **風險等級:** 中

### patch-package 升 fmt 到 12.1.0

- **機制:**
    - 照抄上游 React Native 的修法
    - 上游 commit `faeef2b9` 於 2026-03-19 進 main，只動版號
- **做法:**
    - 改 `fmt.podspec` 的版號與 tag 兩處
    - 改 `RCT-Folly.podspec` 第 27 行的依賴版號
    - 執行 `npx patch-package react-native` 產出修補檔
    - 重跑 `pod install`，連同鎖定檔一併提交
- **可行性前提已查證:**
    - 兩個 podspec 都是 node_modules 內的本地來源 → 修補一定生效
    - `package.json` 的 React Native 是精確版號 → 修補檔名不會失配
    - Podfile 端的 `fmt` 設定介面只有來源網址欄位，改不了版號
- **優點:**
    - 與上游同一條路，Meta 已在出貨相同的 folly 與 fmt 組合
    - folly 用到的 `fmt` 介面極小，12.0.0 移除的項目一項都沒碰到
    - 修補是宣告式的，進版控、可 review
    - 不犧牲任何編譯期格式檢查
- **缺點:**
    - `fast_float` 版本與上游不一致 → 此三方組合上游未曾出貨
    - `fmt` 跨兩個大版本
    - 上游該 commit 自承未測 rn-tester、未測其他 Xcode 版本
    - 標題只寫修 26.4，無任何涵蓋 26.6 的證據
- **風險等級:** 中
- **與 Podfile 改寫覆蓋口互斥:**
    - 採用此路時要把改寫段與定義一併移除
    - 12.1.0 已內建覆蓋口 → 改寫段不會命中，留著只會每次印警告

### 升 React Native

- **版本分佈是斷裂的，逐 tag 查證過:**
    - 0.79 至 0.82 全線為 `fmt` 11.0.2
    - 0.83.4 仍為 11.0.2，0.83.5 起才是 12.1.0
    - 0.84 線仍為 11.0.2，未收到回補
    - 0.85 與 0.86 線為 12.1.0
- **目標只有兩個:**
    - 0.83 線的 0.83.5 以上，跳幅最小
    - 直上 0.85 或 0.86
- **絕對要避開 0.84 線:**
    - 該線沒有修復 → 升上去問題原封不動
- **優點:**
    - 最徹底，連同其他上游修復一次吃下
    - 0.84 之後有預編譯二進位機制，這類編譯問題多一條逃生門
- **缺點:**
    - 目前版本跨四個小版本，回歸面涵蓋整個 App
    - 送審期間不可能動這種幅度
    - 升版成本與相容性完全沒評估過
    - 需重新確認 `react-native-screens` 既有修補是否仍適用
- **風險等級:** 高

### 續釘 Xcode 26.3

- **機制:**
    - 雲端建置版本維持 26.3，不使用最新版別名
- **優點:**
    - 零程式碼變更，送審期間唯一能立刻採用的選項
    - 送審側完全合規 → 現行要求只管主版本，不設次版本下限
    - 已實測可建置，沒有未知數
- **缺點:**
    - 這是延期不是修法
    - 26.3 是清單上最舊那格 → 正是下一個被修剪的位置
    - 移除是硬中斷，建置直接報版本不可用，不會自動退回
    - 有零預告移除的實績
- **風險等級:** 高
- **必須配套:**
    - 建立版本消失的早期警報，見時程風險章節

### 降 fmt 的 C++ 標準

- **機制:**
    - 安裝後處理只把 `fmt` 這個 target 的語言標準設為 `c++17`
    - `base.h` 的判斷鏈在標準低於門檻時自動把開關設為 0
    - 不需要任何編譯器巨集，也不需改寫任何原始碼
- **可行性前提:**
    - `fmt` 是獨立編譯單元，只有實作檔屬於這個 target
    - 其他 pod 只引入標頭，仍用各自的語言標準
- **優點:**
    - 活動零件最少，純建置設定
    - 不依賴字串比對命中特定文字，比改寫覆蓋口穩固
    - 失效模式乾淨 → 若 `fmt` 要求較新標準會直接報錯而非靜默降級
- **缺點:**
    - 標頭以較新標準引入、實作檔以較舊標準編譯，此組合官方未背書
    - 同樣犧牲純字面值的編譯期格式檢查
    - 查不到在 Xcode 26.4 以上實際通過建置的公開紀錄
- **風險等級:** 中

---

## 建議

- **首選 patch-package 升 fmt，Podfile 改寫覆蓋口降為後備**

- **理由:**
    - 與上游同一條路 → 相同的 folly 與 fmt 組合已由 Meta 出貨
    - 不犧牲編譯期檢查 → 另兩個 workaround 都會永久損失偵測能力
    - 修補進版控可 review → 改寫第三方原始碼的內容不受鎖定檔追蹤

- **執行順序:**
    - **驗證先行:**
        - 送審結束後、動任何程式碼前先裝 Xcode 26.6
        - 對兩條路各跑一次單檔編譯，幾秒可判定，不必燒雲端額度

    ```bash
    clang++ -std=c++20 -I ios/Pods/fmt/include -c ios/Pods/fmt/src/format.cc -o /dev/null
    ```

    - **通過就走升版路:**
        - 同時把 Podfile 的改寫段與定義整段移除
    - **升版路受阻才退回改寫路:**
        - 退回前要先修完前述四處缺陷
    - **升 React Native 列中期項目:**
        - 目前版本沒有預編譯逃生門，這類問題還會再來
        - 升的時候記得跳過 0.84 線
    - **續釘 26.3 只當臨時掩護:**
        - 不是解法，且不給預警

---

## 時程風險

- **證據邊界先講:**
    - Apple 未公布任何量化的版本保留承諾
    - 無法推出具體到期日，以下不編時程

- **查得到的官方事實:**
    - Xcode Cloud 有官方 Release Notes 頁，歷史上公告過三次批次下架
    - 官方文件明寫可用版本會定期輪替、要求更新建置流程
    - App Store Connect API 有機器可讀的可用版本端點
    - Apple 從未公布保留期長度、保留版本數、或提前通知窗口

- **屬第三方或觀察值:**
    - Release Notes 頁自 2026-02-10 起未再更新
    - Xcode 26.1.1 於 2026-04-16 無公告消失
    - 清單只留四格，而 26.0.1 至 26.2 均已消失且無任何公告

- **由此可說的:**
    - 實際行為接近保留最近少數版本、滾動修剪、不保證預告
    - 26.3 是目前最舊那格 → 下一個被修剪的位置
    - 何時發生無法從證據推導，可能是下個版本上架當天
    - 把 26.3 當長期避風港不安全

- **送審側沒有壓力:**
    - 現行硬要求自 2026-04-28 生效，只管主版本、不設次版本下限
    - 26.3 完全合規，官方待生效需求頁無任何未來日期項目

- **結論:**
    - 瓶頸在建置側不在送審側，且不給預警
    - 正確做法是兩件事並行
    - 現在就建立版本消失的早期警報
    - 送審一結束就把修法落地

- **早期警報做法:**
    - 定期輪詢可用版本端點，或人工看建置流程的版本選單
    - Release Notes 已停更，不能當偵測手段

```bash
curl -H "Authorization: Bearer <ASC_API_TOKEN>" \
  "https://api.appstoreconnect.apple.com/v1/ciXcodeVersions?fields[ciXcodeVersions]=version,name"
```

---

## 待確認

- **Xcode 26.6 下改寫覆蓋口是否真的編得過:**
    - 這是唯一的決定性未知
    - 本機只有 Apple clang 17，重現不了 26.6
    - 已驗到修法把錯誤類別結構性移除，編譯單元內已無 consteval
    - 排除不掉的殘餘風險是後備路徑改以另一個訊息再度失敗

- **fmt 12.1.0 在 Xcode 26.6 下是否編得過:**
    - 上游只宣稱修 26.4，社群回報也都是 26.4 環境
    - 12.1.0 仍有 `FMT_STRING` 呼叫點，只是不再走 consteval 路徑

- **fmt 12.1.0 搭配本專案 fast_float 版本的組合未經上游出貨:**
    - 上游主線用的 `fast_float` 較新
    - 該特定組合沒有任何實際建置紀錄
    - 本機安裝與建置可以先驗一輪

- **App target 未來若加入 C++ 檔會不會撞:**
    - 目前 App target 只編 Swift 與 Objective-C 檔
    - 定義只寫進 pod 專案，不寫進聚合設定檔
    - 若之後加入 C++ 檔，改寫覆蓋口這條路要記得補上 App target

- **升 React Native 的實際成本完全沒評估**

- **26.3 的實際存活期無官方承諾，也還沒建立偵測機制**

- **修法尚未在任何一台機器完成安裝驗證:**
    - 主 git 的相依產物是用還原後的設定重跑的，不含修法
    - branch 的工作目錄沒有相依產物
    - 合入前至少要跑一次安裝，確認安裝後處理的實際輸出

---

## 已驗證的實作全文

- 以下為 branch `feat/fmt-consteval-flag` 的內容
- 直接照抄前要先套用前述四處必修項

```ruby
# Podfile 頂層，安裝後處理區塊內兩處共用
FMT_CONSTEVAL_DEFINE = 'FMT_USE_CONSTEVAL=0'
FMT_CONSTEVAL_GUARD_MARK = '// FMT_USE_CONSTEVAL override guard (SuSuGiGi)'
```

```ruby
# post_install 內，既有的 installer.pods_project.targets.each 迴圈中
# 必修：迴圈開頭加 next unless target.name == 'fmt'，把定義收窄到 fmt 一個 target
defs = config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] || ['$(inherited)']
defs = defs.split(' ') if defs.is_a?(String)
unless defs.include?(FMT_CONSTEVAL_DEFINE)
  config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] = defs + [FMT_CONSTEVAL_DEFINE]
end
```

```ruby
# post_install 內，targets 迴圈之後
# 必修：兩個 Pod::UI.warn 都要改成 raise，否則雲端建置不會中斷、只會在編譯階段才爆
fmt_base_h = File.join(installer.sandbox.root, 'fmt', 'include', 'fmt', 'base.h')
chain_head = "#if !defined(__cpp_lib_is_constant_evaluated)\n#  define FMT_USE_CONSTEVAL 0\n"
chain_tail = "#  define FMT_USE_CONSTEVAL 0\n#endif\n#if FMT_USE_CONSTEVAL\n"

if !File.exist?(fmt_base_h)
  Pod::UI.warn "fmt base.h 不存在於 #{fmt_base_h}，跳過 FMT_USE_CONSTEVAL 覆蓋口"
elsif File.read(fmt_base_h).include?(FMT_CONSTEVAL_GUARD_MARK)
  Pod::UI.puts 'fmt base.h：FMT_USE_CONSTEVAL 覆蓋口已存在，略過'
else
  src = File.read(fmt_base_h)
  if src.include?(chain_head) && src.include?(chain_tail)
    src = src.sub(chain_head, "#{FMT_CONSTEVAL_GUARD_MARK}\n#ifndef FMT_USE_CONSTEVAL\n#{chain_head}")
    src = src.sub(chain_tail, "#  define FMT_USE_CONSTEVAL 0\n#endif\n#endif  #{FMT_CONSTEVAL_GUARD_MARK}\n#if FMT_USE_CONSTEVAL\n")
    # CocoaPods 從 cache 複製出來的 pod 原始碼是 444 唯讀，寫入前先開權限、寫完還原
    original_mode = File.stat(fmt_base_h).mode & 0o7777
    File.chmod(0o644, fmt_base_h)
    File.write(fmt_base_h, src)
    File.chmod(original_mode, fmt_base_h)
    Pod::UI.puts 'fmt base.h：已補上 FMT_USE_CONSTEVAL 覆蓋口'
  else
    Pod::UI.warn 'fmt base.h：找不到 FMT_USE_CONSTEVAL 判斷鏈，fmt 版本可能已變動，請人工確認'
  end
end
```
