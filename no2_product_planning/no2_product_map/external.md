# 外部服務 — 第三方 SaaS，不自建

---


## LLM Provider — AI 推理服務

- **功能：**
    - 提供 LLM 推理 API，供 AI Advisor 使用
- **目的：**
    - 作為 Cloud Service / AIAdvisor / Backend 的 AI 能力來源
- **做法：**
    - AI Advisor 選型待定，候選包含 Anthropic、OpenAI 等；統一透過 LLMProxy 呼叫
- **排除：**
    - 自行訓練或部署模型
- **利弊：**
    - 快速取得 LLM 能力，但 API 成本難以固定，是 AIAdvisor 定價的主要不確定因素
