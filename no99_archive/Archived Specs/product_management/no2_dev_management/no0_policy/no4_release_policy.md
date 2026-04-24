# 版本發布規範

## 核心原則

- **分支模型:** 遵循 `no2_git_workflow_policy.md`
- **主要分支:** `main`
- **`main` 分支:** 永遠處於可部署狀態

## 版本號定義

- **格式:** 語意化版本 `Major.Minor.Patch`
    - **Major:** 重大功能更新或架構變更
    - **Minor:** 新增功能, 向下相容
    - **Patch:** 錯誤修復, 向下相容
- **位置:** `package.json`

## 發布流程

- **準備階段:**
    - **行為:**
        - 從 `main` 建立 `release/vX.X.X` 分支
        - 更新 `package.json` 中的版本號
        - 更新 `CHANGELOG.md`
        - 執行最終的回歸測試
- **PR 階段:**
    - **行為:**
        - 建立 `release/vX.X.X` 指向 `main` 的 PR
        - **行為:** 此 PR 僅包含版本號與 CHANGELOG 變更
- **合併階段:**
    - **行為:**
        - 合併 `release` PR 至 `main`
        - **行為:** 採用 `Merge commit` 而非 `Squash`
- **標記 Tagging:**
    - **行為:**
        - 於 `main` 分支上建立 `git tag`
        - **格式:** `vX.X.X`
        - **推送:** `git push origin vX.X.X`
- **部署:**
    - **行為:**
        - **iOS:** 透過 `CI/CD` 流程打包並上傳至 `TestFlight`
        - **Android:** 透過 `CI/CD` 流程打包並上傳至 `Play Console` 內部測試軌道
- **正式上架:**
    - **行為:**
        - 於 `TestFlight` 或 `Play Console`
        - 將通過測試的建置版本提交審核並發布

## 緊急修復 Hotfix

- **情境:** 已上架版本出現嚴重錯誤
- **行為:**
    - **分支:** 從 `main` 建立 `hotfix/錯誤描述` 分支
    - **修復:** 於分支上修復
    - **版本:** 提升 `Patch` 版本號
    - **合併:** 建立 PR 並緊急合併回 `main`
    - **標記:** 建立新的 `vX.X.X` 標記
    - **部署:** 觸發 `CI/CD` 並提交緊急審核