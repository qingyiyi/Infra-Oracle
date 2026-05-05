---
id: radar-2026-w17
title: "Weekly AI Infra Radar #17"
week_label: 2026 W17
week_start: 2026-04-20
week_end: 2026-04-26
published_at: 2026-04-26
summary: 本期围绕 OpenAI 的模型和企业 agent 连发、Google Cloud 的 agent 平台化、Qwen 与 DeepSeek 的中国开源模型节奏，以及中美 AI 供应链与治理摩擦。
editorial_status: published
topics:
  - frontier-models
  - agent-platforms
  - china-ai
  - ai-infra
hero_note: 这一周的主线是“agent 平台化”与“长上下文开源模型”同时提速，基础设施和治理边界被一起推到台前。
editor_name: qingyiyi
reviewed_by: qingyiyi
reviewed_at: 2026-05-04
items:
  - id: radar-2026-w17-item-01
    category: model
    title: OpenAI 发布 GPT-5.5，并把 Codex 与 ChatGPT 的 agent 工作负载放到同一条主线上
    source_name: OpenAI
    source_url: https://openai.com/index/introducing-gpt-5-5/
    source_type: company_announcement
    published_at: 2026-04-23
    summary: OpenAI 在 4 月 23 日发布 GPT-5.5，面向 ChatGPT 与 Codex 用户，重点强调 coding、computer use、online research 和长任务执行能力。
    why_it_matters: GPT-5.5 的产品叙事不再只是“更聪明的聊天模型”，而是更明确地服务软件工程、研究和计算机操作类 agent 工作负载。
    background: 过去一年 OpenAI 持续把 Codex、ChatGPT 和企业工作流拉近；GPT-5.5 是这条产品线在模型层面的集中升级。
    details: 官方材料强调 GPT-5.5 在 Terminal-Bench、SWE-Bench Pro、BrowseComp、FrontierMath 等任务上的提升，并突出更少 token 与更少重试完成复杂任务。
    impact: 对开发者工具和企业 agent 平台而言，模型能力提升会直接改变“是否可以把完整任务交给模型”的边界，也会推高对上下文管理、工具调用和验证流程的要求。
    image_url: https://images.ctfassets.net/kftzwdyauwt9/cut4wyUCuBENXfd5CSI7Z/d934ffb49d8b39abea0bc33bb1a5b916/Hero_Art_Card_SEO_1x1.jpg?fm=webp&q=90&w=3840
    image_alt: OpenAI GPT-5.5 official product artwork.
    image_source_url: https://openai.com/index/introducing-gpt-5-5/
    watch_points:
      - API 侧大规模开放节奏和价格是否会影响第三方 agent 平台选型。
      - Codex 中的上下文窗口、工具权限和安全策略是否与宣传能力一致。
      - 竞品 Claude / Gemini 在 agentic coding 上的响应速度。
    highlight: true
    credibility: high
    importance: high
    review_status: approved
    tags:
      - openai
      - gpt-5-5
      - codex
      - coding-agent
  - id: radar-2026-w17-item-02
    category: model
    title: OpenAI 推出 ChatGPT Images 2.0，图像生成继续向“可编辑的工作流模型”靠拢
    source_name: OpenAI
    source_url: https://openai.com/index/introducing-chatgpt-images-2-0/
    source_type: company_announcement
    published_at: 2026-04-21
    summary: OpenAI 在 4 月 21 日推出 ChatGPT Images 2.0，并在 API 模型页同步出现 gpt-image-2 快照。
    why_it_matters: 图像模型升级不只是创意功能更新，它会进入产品图、UI 设计、文档图示和多模态 agent 的实际生产链路。
    background: GPT Image 1 已经把 OpenAI 的图像生成能力推向 API 和创意工具生态；Images 2.0 延续了面向 ChatGPT 用户和开发者的双轨路线。
    details: 官方模型页将 GPT Image 2 定位为高质量图像生成和编辑模型，支持文本输入、图像输入与图像输出，并列出 `gpt-image-2-2026-04-21` 快照。
    impact: 对 AI 工具站和文档生成工作流来说，图像质量、文字渲染和多轮编辑能力会决定“自动生成图文产物”是否能进入用户可交付阶段。
    watch_points:
      - 图片生成成本和速率限制是否适合批量文档/演示稿生产。
      - C2PA、水印和安全策略是否影响商业交付可用性。
      - 与 Nano Banana、Gemini 图像模型和开源图像栈的差距。
    credibility: high
    importance: medium
    review_status: approved
    tags:
      - openai
      - image-generation
      - multimodal
  - id: radar-2026-w17-item-03
    category: tooling
    title: OpenAI 发布 ChatGPT workspace agents，团队级自动化从 Custom GPT 走向可治理 agent
    source_name: OpenAI
    source_url: https://openai.com/index/introducing-workspace-agents-in-chatgpt/
    source_type: product_update
    published_at: 2026-04-22
    summary: OpenAI 发布 workspace agents research preview，面向 ChatGPT Business、Enterprise、Edu 和 Teachers 计划，让组织可创建、共享和运行团队 agent。
    why_it_matters: agent 不再只是个人聊天侧栏里的临时助手，而开始进入组织级复用、权限、调度和工作流治理问题。
    background: 企业采用 agent 的主要阻力并非模型本身，而是如何让 agent 带着权限、上下文和审计进入实际业务流程。
    details: 官方介绍强调 agent 可以在组织内共享，可通过 ChatGPT 或 Slack 使用，并支持团队把重复任务封装为可迭代的工作单元。
    impact: 这会推动企业把 agent 当作“数字员工”或“自动化服务”治理，也会迫使安全、IT 和业务团队重新定义 agent 的发布与回滚流程。
    watch_points:
      - workspace agents 的权限模型、审批流程和日志可见性。
      - 是否支持跨 Google Workspace、Microsoft 365、Slack 等工具的稳定操作。
      - 与 Microsoft Agent 365、Gemini Enterprise Agent Platform 的治理边界对比。
    highlight: true
    credibility: high
    importance: high
    review_status: approved
    tags:
      - openai
      - agents
      - enterprise
  - id: radar-2026-w17-item-04
    category: infra
    title: Google Cloud Next 2026 将 Gemini Enterprise 与新一代 TPU 放在 agentic enterprise 主轴
    source_name: Google Blog
    source_url: https://blog.google/innovation-and-ai/infrastructure-and-cloud/google-cloud/next-2026/
    source_type: company_announcement
    published_at: 2026-04-22
    summary: Google 在 Cloud Next 2026 更新中展示 Gemini Enterprise Agent Platform、Agent2Agent 生态和第八代 TPU 等云端 AI 基础设施方向。
    why_it_matters: Google 正把模型、agent 构建、agent 治理和专用芯片一起包装为企业 AI 平台，直接对标 AWS Bedrock、Microsoft 和 OpenAI 的组合。
    background: 企业 agent 的落地需要模型、数据访问、身份、运行时、监控、安全和算力统一协同，云厂商正在争夺这一整套控制面。
    details: Google 的 Next 2026 新闻中心把 Gemini Enterprise Agent Platform、第八代 TPU 和 cross-cloud AI infrastructure 放在同一组发布中，强调 agent 时代的云基础设施。
    impact: 对 AI Infra 团队来说，Google 的方向提示了未来平台采购会同时评估 agent runtime、模型园区、TPU/GPU 性能和治理能力，而不是只看单个模型 API。
    watch_points:
      - TPU 8 的训练/推理实际可用区域、价格和开发者工具链成熟度。
      - Gemini Enterprise 是否能真正统一 Vertex AI、Agent Builder 和第三方 agent。
      - A2A 协议生态是否会成为跨 agent 互操作标准。
    highlight: true
    credibility: high
    importance: high
    review_status: approved
    tags:
      - google-cloud
      - gemini-enterprise
      - tpu
      - agents
  - id: radar-2026-w17-item-05
    category: china_ai
    title: Qwen3.6-27B 开源，27B dense 模型瞄准 agentic coding 与长上下文本地部署
    source_name: Hugging Face - Qwen
    source_url: https://huggingface.co/Qwen/Qwen3.6-27B
    source_type: repo
    published_at: 2026-04-22
    summary: Qwen 团队发布 Qwen3.6-27B，模型页强调 agentic coding、thinking preservation、262K 原生上下文以及最高约 1M token 扩展上下文。
    why_it_matters: 这类中等规模开源权重模型会改变本地 coding agent 和私有部署的成本曲线，尤其适合不想把代码库上下文完全交给闭源云模型的团队。
    background: Qwen 系列一直是中文和多语言开源模型生态的重要来源；3.6 系列开始更明确面向 coding agent 和工具调用场景。
    details: 模型页列出 27B 参数、vision encoder、SGLang/vLLM/KTransformers 等 serving 路径，以及 Qwen-Agent / MCP 配置示例。
    impact: 对开发者和中小团队而言，Qwen3.6-27B 提供了一个可在自有基础设施上跑 agentic coding 的可选模型，降低了对闭源大模型 API 的单点依赖。
    watch_points:
      - 真实代码库任务中对 Claude / GPT / DeepSeek 的稳定性差距。
      - 量化版本在 24GB/48GB 消费级 GPU 上的可用体验。
      - 工具调用、MCP 和长上下文下的 hallucination 控制。
    highlight: true
    credibility: high
    importance: high
    review_status: approved
    tags:
      - qwen
      - open-weight
      - china-ai
      - coding-agent
  - id: radar-2026-w17-item-06
    category: china_ai
    title: DeepSeek API 文档上线 V4-Pro / V4-Flash，旧模型名进入三个月迁移倒计时
    source_name: DeepSeek API Docs
    source_url: https://api-docs.deepseek.com/updates
    source_type: official_docs
    published_at: 2026-04-24
    summary: DeepSeek API changelog 显示 V4-Pro 和 V4-Flash 已支持 OpenAI Chat Completions 与 Anthropic interface，并宣布旧 `deepseek-chat` / `deepseek-reasoner` 将在 2026-07-24 停用。
    why_it_matters: DeepSeek V4 的 API 上线把中国开源/开放模型的竞争从论文和权重延伸到真实开发者迁移窗口。
    background: DeepSeek R1 之后，市场一直等待其下一代基础模型；V4 系列同时牵动开源生态、API 成本和国产算力叙事。
    details: 官方 changelog 明确列出新模型 ID 和旧模型名停用时间，给已经集成 DeepSeek API 的服务留下三个月迁移期。
    impact: 对使用 DeepSeek 的产品和 agent 平台来说，接下来需要测试新模型的上下文、工具调用、成本和兼容性，并避免旧模型名停用造成线上中断。
    image_url: https://cdn.deepseek.com/logo.png?x-image-process=image%2Fresize%2Cw_1920
    image_alt: DeepSeek official logo from the DeepSeek homepage.
    image_source_url: https://www.deepseek.com/en/
    watch_points:
      - V4-Pro / V4-Flash 的真实 API 稳定性、限流和价格。
      - 与 Huawei Ascend、国产推理栈和国际 GPU 供应链的关系。
      - 旧 endpoint 停用前的兼容层和迁移文档是否充分。
    highlight: true
    credibility: high
    importance: high
    review_status: approved
    tags:
      - deepseek
      - api
      - china-ai
      - migration
  - id: radar-2026-w17-item-07
    category: geopolitics
    title: DeepSeek V4 发布同日引发美国外交层面对 AI IP 与供应链风险的警示
    source_name: The Neuron
    source_url: https://www.theneuron.ai/explainer-articles/around-the-horn-digest-everything-that-happened-in-ai-today-friday-april-24-2026/
    source_type: news
    published_at: 2026-04-24
    summary: 在 DeepSeek V4 发布当天，多家媒体报道美国国务院要求外交系统提醒盟友关注中国 AI 公司涉嫌知识产权与安全风险。
    why_it_matters: 这类事件会把模型发布、芯片出口、数据合规和国际市场准入绑在一起，直接影响中国模型进入海外企业采购清单的难度。
    background: 自 DeepSeek R1 之后，中国模型的成本和开源能力一直被海外政策圈视为竞争变量；V4 发布让争议重新升温。
    details: 该条作为 geopolitics 少量收录，只关注它对 AI 供应链、企业采购、跨境 API 使用和政策合规的影响，不扩展成一般国际政治新闻。
    impact: 企业如果在敏感行业使用中国模型，需要额外准备数据驻留、模型来源、权重许可、审计和政策变动预案。
    watch_points:
      - 美国及盟友是否出台更明确的 AI 模型采购或使用限制。
      - 中国模型在 Hugging Face、API 网关和云市场中的可访问性变化。
      - 出口管制是否进一步影响 GPU、推理服务和模型托管成本。
    credibility: medium
    importance: medium
    review_status: approved
    review_notes: 二手来源，保留为政策风险信号；后续应继续寻找政府原文或一手报道交叉验证。
    tags:
      - policy
      - export-controls
      - china-ai
---

## 本期观察

- OpenAI 在同一周内连续推进模型、图像、Codex 和 workspace agent，说明它正在把 ChatGPT 从“模型入口”推向“工作执行层”。
- Google Cloud 和 OpenAI 的企业 agent 路线都把治理、运行时和基础设施放到中心位置；未来模型 API 可能只是 agent 平台的一部分。
- Qwen3.6-27B 与 DeepSeek V4 把中国模型竞争重新拉回开发者工具、长上下文和 API 迁移层面。
- 本期唯一国际局势条目聚焦 DeepSeek 与美国政策风险，因为它会直接影响模型采购、芯片供应和跨境部署。
