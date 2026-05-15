# CLAUDE.md

本 repo 為 SuSuGiGi 產品的頂層 **Product git**，承載決策框架的前三層產出與專案管理文件。

## 四層 git 結構

SuSuGiGi 產品採四層 git 拆分。

- **頂層 Product git：**
    - 即本 repo
    - 管理 `no1_product_initiation/`、`no2_product_planning/`、`no5_project_management/`
    - 涵蓋提案層、需求層、整合層 Product Map、落地層 Roadmap
- **Module Design git：**
    - 位於 `no3_product_designs/<module_id>/`
    - 承載 design canvas、原型、視覺工件
    - 可為 null（純文字 / 邏輯 module 無設計工件）
    - 由頂層 `.gitignore` 排除，本 git 不追蹤其內容
- **Module Spec git：**
    - 位於 `no4_product_specs/<module_id>/`
    - 每個 module 一個獨立 git
    - 由頂層 `.gitignore` 排除，本 git 不追蹤其內容
- **Module Impl git：**
    - 位於 `no6_product_development/<module_id>/`
    - 每個有實作的 module 一個獨立 git
    - 由頂層 `.gitignore` 排除

## 當前 module 註冊

- `no2_accounting_app`
    - Design git：`no3_product_designs/no2_accounting_app/`
    - Spec git：`no4_product_specs/no2_accounting_app/`
    - Impl git：`no6_product_development/no2_accounting_app/`
- `no1_user_management`
    - Design git：尚無
    - Spec git：`no4_product_specs/no1_user_management/`
    - Impl git：尚無，屬純規格階段

完整權威配對表由 `decision_framework_router` skill 的 `products_registry.md` 維護。

---

## 目錄說明

- `no1_product_initiation/` — 提案層：產品心智模型、不可取代性、商業模式
- `no2_product_planning/` — 需求與整合：需求分析、Product Map、Dev Roadmap
- `no3_product_designs/` — 落地 Design 容器，子目錄為獨立 Module Design git
- `no4_product_specs/` — 落地 Spec 容器，子目錄為獨立 Module Spec git
- `no5_project_management/` — 專案管理文件
- `no6_product_development/` — 落地 Impl 容器，子目錄為獨立 Module Impl git
- `no99_archive/` — 歸檔層，工作筆記、規格衝突報告、已廢案 spec 等

---

## 撰寫規範

所有 .md 文件依循 `universal_writing_linter` skill 的通用政策。任何改動前先 consult `decision_framework_router` skill 的上游 review 四問。

---

## 術語規範

### 付費等級

使用 `LEVEL_0`、`LEVEL_1`、`LEVEL_2`、`LEVEL_3`、`LEVEL_B` 形式。禁止替代寫法。

- LEVEL 的跨 module 商業定義權威樣本位於 `no1_product_initiation/no3_business_model.md`
- LEVEL 在記帳 App 視角下的能力清單由 Module Spec git 維護

---

## Product Map 使用規範

Product Map 位於 `no2_product_planning/no2_product_map/`，依視角拆分。

- **Module 視角子目錄：**
    - 目錄名與 `no3_product_designs/<module_id>/`、`no4_product_specs/<module_id>/`、`no6_product_development/<module_id>/` 逐字一致
    - 例如 `no2_accounting_app/`
- **平台服務視角子目錄：**
    - 跨 module 共用的平台能力
    - 例如 `firebase/`、`cloud_service/`、`external_service/`

讀檔策略
- 找方向或確認模組歸屬先讀 `structure.md`
- 依主題只讀對應子目錄，不一次 glob 整個 Product Map
