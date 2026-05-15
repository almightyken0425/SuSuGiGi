# no3_product_designs/

本目錄是 **SuSuGiGi 落地層設計** 的容器，承載各 module 的 Module Design git。

每個 module 一個獨立子目錄，子目錄本身是獨立的 Module Design git，由頂層 Product git 的 `.gitignore` 排除。

## 當前 module

- `no2_accounting_app/` — Accounting App design canvas（React HTML workbench；intro / foundations / components / screens / explorations 五個 tab）

## 新增 module 設計工件

依 `~/.claude/skills/decision_framework_router/products_registry.md` 末段「新 Design git」SOP 執行：

1. 在本目錄建立 `<module_id>/` 子目錄
2. `cd <module_id> && git init`
3. 建立 GitHub remote：命名格式 `SuSuGiGi-Design-<ModuleNamePascal>`
4. 撰寫該目錄的 CLAUDE.md
5. 更新註冊表的 design_repo 欄位
6. 更新本 README 的「當前 module」清單
