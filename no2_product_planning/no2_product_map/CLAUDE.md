# CLAUDE.md

此目錄依平台拆分，請只讀取需要的文件，不要一次讀入全部。

入口：先讀 `structure.md` 確認目標模組所屬平台，再讀對應的 platform 文件。

| 文件 | 內容 |
|------|------|
| structure.md | 完整 tree 結構 + 模組索引，任何任務的入口 |
| app/index.md | App module 摘要索引，做 App 任務的入口 |
| app/\<module\>.md | 對應 module 的完整描述，只讀需要的 module |
| web_console/ | Web Console modules (web_console.md, ai_advisor_web_client.md) |
| firebase/ | Firebase modules (authentication.md, storage.md, firestore.md) |
| cloud_service/ | Cloud Service modules (ai_advisor_backend.md, analytics_pipeline.md, macro_data.md) |
| external_service/ | 外部服務 (llm_provider.md) |

禁止一次讀入 `app/` 目錄下全部文件。
