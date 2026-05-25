---
id: radar-2026-w21
title: "Weekly AI Infra Radar #21"
week_label: 2026 W21
week_start: 2026-05-18
week_end: 2026-05-24
published_at: 2026-05-24
summary: 本期 AI 基础设施主线从模型发布转向“可运行的代理系统”。Google I/O 把 Gemini、Antigravity 和 Managed Agents 放进同一套产品叙事，OpenAI、Anthropic 则继续把企业数据、SDK/MCP 与安全工具链纳入代理平台。
editorial_status: published
topics:
  - ai-agents
  - enterprise-ai
  - datacenter
  - nvidia
  - model-runtime
  - security
  - china-ai
hero_note: 从模型能力到代理运行时，本周的关键词是把 AI 接进企业数据、工具链与真实基础设施。
editor_name: qingyiyi
reviewed_by: qingyiyi
reviewed_at: 2026-05-25
items:
  - id: radar-2026-w21-item-01
    category: model
    title: Google I/O 2026 发布 Gemini 3.5 Flash、Gemini Omni 与 Antigravity 代理平台更新
    source_name: Google Blog
    source_url: https://blog.google/innovation-and-ai/technology/ai/google-io-2026-all-our-announcements/
    source_type: company_announcement
    published_at: 2026-05-20
    summary: Google 在 I/O 2026 集中发布 Gemini 3.5 Flash、Gemini Omni、Gemini Spark、Search agents、Antigravity 2.0 与 Gemini API Managed Agents 等模型和产品更新。
    why_it_matters: Google 把新一代模型、搜索、视频生成、开发者代理和托管沙箱放在同一套产品叙事中，显示大型实验室正在把单次调用模型升级为长期运行、可调用工具、可部署到生产环境的代理系统。
    background: 过去一年，Gemini 系列的竞争重点从多模态能力扩展到编码、搜索和 Workspace 等高频入口。I/O 2026 的更新进一步把 Gemini 3.5 Flash 与 Antigravity 代理框架绑定。
    details: 官方称 Gemini 3.5 Flash 已在 Gemini API、Google AI Studio、Android Studio 与 Antigravity 中可用；Gemini Omni 从视频输出起步，面向跨图像、文本、视频、音频参考的生成与编辑；Managed Agents 通过单次 API 调用提供远程 Linux 环境，支持推理、工具调用、代码执行与文件管理。
    impact: 对开发者而言，Google 正在把模型 API、沙箱执行环境、IDE / 桌面代理和搜索入口打包成更完整的 agent stack；对基础设施团队而言，托管代理意味着更高的隔离、状态管理、计费、监控与工具安全要求。
    watch_points:
      - 关注 Gemini 3.5 Pro 的发布时间和与 3.5 Flash 的路由边界。
      - 审查 Managed Agents 的权限边界、审计能力和数据保留策略。
      - 观察 Antigravity 与 Google Cloud、Firebase、Workspace 的集成深度。
    highlight: true
    credibility: high
    importance: high
    review_status: approved
    tags:
      - google
      - gemini
      - antigravity
      - agentic-ai
      - multimodal
  - id: radar-2026-w21-item-02
    category: infra
    title: OpenAI 与 Dell 合作，将 Codex 带入混合云和本地企业环境
    source_name: OpenAI
    source_url: https://openai.com/index/dell-codex-enterprise-partnership/
    source_type: company_announcement
    published_at: 2026-05-18
    summary: OpenAI 宣布与 Dell Technologies 合作，让 Codex 连接 Dell AI Data Platform，并探索与 Dell AI Factory 的集成，以服务混合云和本地部署场景。
    why_it_matters: Codex 从编码助手走向企业代理，需要靠近代码库、文档、业务系统和受治理数据。该合作把 OpenAI 的代理产品与 Dell 的企业基础设施绑定，是 AI lab 向 on-prem / hybrid enterprise infra 渗透的典型信号。
    background: OpenAI 称 Codex 每周已有超过 400 万开发者使用，并被用于代码评审、测试覆盖、事故响应和大型代码库推理。企业客户则普遍要求数据驻留、权限控制和既有系统集成。
    details: OpenAI 表示 Codex 将连接 Dell AI Data Platform，使企业可在本地数据治理体系附近使用代理；双方还将探索 Codex、ChatGPT Enterprise 和 API 方案如何与 Dell AI Factory 协作，用于准备数据、管理记录系统、运行测试和部署 AI 应用。
    impact: 这可能推动大型企业把 AI agent 部署从公有云 API 试点推进到内部数据平台、软件工程流水线和私有基础设施。对 CIO / 平台团队而言，重点将转向身份权限、审计、数据边界、模型调用成本和 agent 操作可回滚性。
    watch_points:
      - 确认具体可用时间、支持的 Dell 平台版本和部署形态。
      - 区分是否涉及私有推理，还是主要是连接器和编排。
      - 跟踪 Codex 在本地数据上的上下文索引方式和安全工具链集成。
    highlight: true
    credibility: high
    importance: high
    review_status: approved
    tags:
      - openai
      - dell
      - codex
      - enterprise-ai
      - hybrid-cloud
  - id: radar-2026-w21-item-03
    category: tooling
    title: Anthropic 收购 Stainless，加强 Claude API、SDK 与 MCP 工具链
    source_name: Anthropic
    source_url: https://www.anthropic.com/news/anthropic-acquires-stainless
    source_type: company_announcement
    published_at: 2026-05-18
    summary: Anthropic 宣布收购 Stainless，后者为 Anthropic 官方 SDK 生成提供支持，并提供 SDK、CLI 与 MCP server tooling。
    why_it_matters: AI agent 的能力越来越取决于能否稳定连接外部 API、工具和数据源。Anthropic 收购 SDK/MCP 工具链公司，说明模型实验室正在向开发者体验、连接器标准和工具调用生态纵深整合。
    background: Anthropic 推出 MCP 后，围绕 Claude 的 agent connectivity 成为平台竞争重点。Stainless 的核心能力是把 API spec 转换为 TypeScript、Python、Go、Java 等语言的原生 SDK、CLI 和 MCP server。
    details: Anthropic 表示 Stainless 自早期 Claude API 起就支撑其官方 SDK 生成，并服务数百家公司生成 SDK、CLI 与 MCP 服务器。收购后，Stainless 团队将进入 Anthropic，继续推进 Claude 平台的开发者体验和代理连接能力。
    impact: Claude 平台可能在 API 一致性、SDK 更新速度、MCP server 生成、企业集成和 agent 工具调用可靠性上提升。对于第三方开发者，这意味着 Anthropic 更可能把 MCP 变成端到端工具链，而不仅是协议。
    watch_points:
      - 观察 Stainless 是否继续服务非 Anthropic 客户。
      - 关注 MCP server 自动生成工具是否开放。
      - 跟踪官方 SDK 的发布节奏和连接器市场的企业化边界。
    credibility: high
    importance: medium
    review_status: approved
    tags:
      - anthropic
      - claude
      - stainless
      - mcp
      - sdk
  - id: radar-2026-w21-item-04
    category: tooling
    title: Anthropic 更新 Project Glasswing：Mythos Preview 已发现上万高危或严重漏洞
    source_name: Anthropic
    source_url: https://www.anthropic.com/research/glasswing-initial-update
    source_type: blog
    published_at: 2026-05-22
    summary: Anthropic 发布 Project Glasswing 初步进展，称其与约 50 家合作伙伴使用 Claude Mythos Preview 发现超过一万个高危或严重漏洞，并推出面向企业的 Claude Security 公测与相关工具。
    why_it_matters: 这是 AI 安全工具从辅助代码审计走向大规模漏洞发现的高强度案例，也暴露出新瓶颈：发现漏洞的速度正在超过验证、披露和修补能力。
    background: Project Glasswing 于 2026 年 4 月启动，目标是在更强 AI 模型被滥用前帮助关键软件生态提升防御能力。Anthropic 同时强调 Mythos 级网络能力模型尚未公开发布。
    details: Anthropic 称多数合作伙伴各自发现数百个 critical / high 漏洞；在开源扫描方面，Mythos Preview 扫描超过 1000 个项目，估计发现 6202 个高危或严重漏洞，其中部分已由安全公司或 Anthropic 复核。官方还提到 Claude Security 公测可帮助企业扫描代码库并生成修复建议。
    impact: 对 AI infra 读者来说，安全自动化正在成为 agent 基础设施的重要组成部分：代码扫描、漏洞 triage、补丁生成、披露流程和权限控制都需要系统化。对开源维护者而言，AI 生成漏洞报告的质量和数量管理将成为新负担。
    watch_points:
      - 跟踪 Mythos-class 模型是否开放和 Claude Security 的客户范围。
      - 观察漏洞 dashboard 的真实修复率与维护者反馈。
      - 评估这类模型的防滥用措施能否经受外部审计。
    credibility: high
    importance: high
    review_status: approved
    tags:
      - anthropic
      - claude
      - cybersecurity
      - software-supply-chain
      - vulnerability-research
  - id: radar-2026-w21-item-05
    category: infra
    title: NVIDIA Q1 FY2027：数据中心收入 752 亿美元，下一季展望不计入中国数据中心计算收入
    source_name: NVIDIA Newsroom
    source_url: https://nvidianews.nvidia.com/news/nvidia-announces-financial-results-for-first-quarter-fiscal-2027
    source_type: company_announcement
    published_at: 2026-05-20
    summary: NVIDIA 公布 2027 财年第一季度业绩：总收入 816 亿美元，同比增长 85%；数据中心收入 752 亿美元，同比增长 92%。公司同时表示 Q2 展望未假设来自中国的数据中心计算收入。
    why_it_matters: 财报继续验证 AI factory 建设的资本开支周期仍在扩张；同时，中国数据中心计算收入被排除在下一季展望外，提示出口管制、市场准入与本地替代对 GPU 供应链和收入结构的影响。
    background: NVIDIA 已把增长叙事从单卡 GPU 转向 Blackwell、Vera Rubin、Dynamo、网络、存储和整机架 AI factory。Q1 FY2027 财报进一步把业务划分为 Data Center 与 Edge Computing，并在数据中心内细分 Hyperscale 与 ACIE。
    details: 官方披露 Q1 FY2027 总收入 816.15 亿美元，数据中心收入 752 亿美元；旧口径下数据中心计算收入 604 亿美元、网络收入 148 亿美元。公司称下一季度收入展望为 910 亿美元正负 2%，且未假设任何来自中国的数据中心计算收入。
    impact: 对云厂商、AI lab 和企业客户而言，NVIDIA 的供给、定价和系统级产品路线仍将主导训练与推理成本曲线。对中国市场而言，NVIDIA 收入口径变化也会加速国产 AI 加速器、推理优化和模型压缩生态的需求。
    watch_points:
      - 关注 Blackwell / Blackwell Ultra 交付节奏和 Vera Rubin 上云时间。
      - 观察 Dynamo 在主流推理框架中的采用。
      - 跟踪中国数据中心计算业务是否恢复，以及 Hyperscale / ACIE 新口径如何影响需求判断。
    highlight: true
    credibility: high
    importance: high
    review_status: approved
    tags:
      - nvidia
      - data-center
      - blackwell
      - ai-factory
      - gpu
      - china-market
  - id: radar-2026-w21-item-06
    category: paper
    title: PALS 论文提出把 GPU 功耗上限作为 LLM Serving 的一等控制变量
    source_name: arXiv
    source_url: https://arxiv.org/abs/2605.21427
    source_type: paper
    published_at: 2026-05-20
    summary: "论文《PALS: Power-Aware LLM Serving for Mixture-of-Experts Models》提出面向 LLM serving 的功耗感知运行时，在 vLLM 中实现，无需模型重训或 API 改动。"
    why_it_matters: 随着推理成为数据中心主负载，电力和散热约束正在从设施层问题变成运行时调度问题。PALS 将 GPU power cap 与 batch size 等软件参数联合优化，契合 AI 数据中心走向能耗比例化和电网互动的趋势。
    background: 现有 LLM serving 系统主要优化吞吐、延迟、批处理、并行和缓存，但往往把 GPU 功耗视为静态约束。MoE 模型推理的负载波动更强，给功耗控制和 QoS 稳定带来额外挑战。
    details: 论文称 PALS 结合轻量离线 power-performance 模型与反馈控制器，在满足吞吐目标的同时最大化能效；在多 GPU、dense 和 MoE 模型上，最高提升 26.3% 能效，并在功耗约束下将 QoS violations 降低 4 到 7 倍。
    impact: 如果结果可复现，云服务商和企业推理平台可以把 power cap、批大小、调度与服务等级目标统一纳入控制面，用于应对电力受限机房、峰谷电价、液冷容量和碳排约束。
    watch_points:
      - 关注开源代码、与 vLLM 主线的集成可能性和生产环境复现实验。
      - 观察在 H100、H200、B200 等不同 GPU 上的可迁移性。
      - 评估与 KV cache、offloading、PD disaggregation 的交互。
    credibility: medium
    importance: medium
    review_status: approved
    tags:
      - llm-serving
      - vllm
      - gpu-power
      - energy-efficiency
      - moe
  - id: radar-2026-w21-item-07
    category: china_ai
    title: 小鹏首台量产 Robotaxi 下线，采用 VLA 2.0 端到端大模型
    source_name: XPENG via PRNewswire
    source_url: https://www.prnewswire.com/news-releases/xpeng-robotaxi-first-mass-produced-unit-officially-rolls-off-the-production-line-302774673.html
    source_type: company_announcement
    published_at: 2026-05-18
    summary: 小鹏宣布首台量产 Robotaxi 在广州下线，采用纯视觉方案，由 VLA 2.0 端到端大模型驱动决策，并计划 2026 年下半年启动试运营。
    why_it_matters: 中国 AI 动态不只在大语言模型，也在物理 AI 与智能驾驶落地。小鹏把 Robotaxi、机器人 IRON 和飞行汽车放在同一 VLA 2.0 模型底座下，体现中国车企对端到端物理 AI 平台化的投入。
    background: Robotaxi 正从技术验证进入商业化验证阶段。中国车企和出行平台正在围绕无图、少传感器、端到端模型、车规芯片和规模化制造寻找成本优势。
    details: 公告称该 Robotaxi 不使用 LiDAR 或高精地图，采用纯视觉方案；VLA 2.0 省去传统 Vision-Language-Action 三阶段架构中的语言翻译步骤，将系统响应延迟压缩到 80 毫秒以内。小鹏计划 2026 年下半年开始试运营，并在 2027 年初实现无现场安全员的完全自动运营目标。
    impact: 如果试运营进展顺利，Robotaxi 竞争将进一步转向模型泛化、数据闭环、车端推理成本、监管许可和运营安全。对 AI infra 观察者而言，物理 AI 会带来边缘推理芯片、车端模型压缩、仿真与数据平台的新需求。
    watch_points:
      - 关注试运营城市、监管批准、安全员配置和接管率。
      - 审查 VLA 2.0 的训练数据、算力依赖和长尾安全表现。
      - 跟踪 Amap 合作范围和纯视觉方案在复杂路况下的事故率。
    credibility: medium
    importance: medium
    review_status: approved
    tags:
      - china-ai
      - xpeng
      - robotaxi
      - physical-ai
      - autonomous-driving
  - id: radar-2026-w21-item-08
    category: geopolitics
    title: 中美同意举行政府间 AI 对话
    source_name: The State Council of the People's Republic of China
    source_url: https://english.www.gov.cn/news/202605/19/content_WS6a0c2a5ec6d00ca5f9a0b169.html
    source_type: policy
    published_at: 2026-05-19
    summary: 中国政府英文网援引外交部发言人消息称，中美两国元首就人工智能进行建设性交流，并同意举行政府间 AI 对话。
    why_it_matters: 本栏目仅纳入一个地缘政治事件：中美 AI 对话可能影响芯片出口管制、模型治理、数据安全、能源与供应链协作边界。对 AI 基础设施行业而言，政策沟通方向会影响 GPU 供给、中国替代路径和跨境云服务。
    background: 过去数年，中美 AI 竞争的核心议题包括先进 GPU/加速器出口、半导体设备、云算力访问、模型安全与军事 / 关键基础设施应用。AI 对话机制若启动，可能成为技术与安全议题的缓冲渠道。
    details: 官方消息较短，仅确认双方同意举行政府间 AI 对话，并称两国元首进行了建设性交流。公告未披露时间表、议程、参与机构或是否涉及芯片出口、数据中心、电力供应链等具体议题。
    impact: 短期影响更多在预期层面：市场会关注是否出现关于先进芯片出口许可、AI 安全评测、开源模型、云服务与供应链的沟通信号。长期看，对话机制可能降低误判，但不必然改变技术竞争主线。
    watch_points:
      - 跟踪首次对话日期、美国与中国参与部门和议题范围。
      - 观察议题是否覆盖 AI 芯片、云算力和模型安全评测。
      - 关注是否影响 NVIDIA、AMD 和中国本土加速器的市场预期。
    credibility: high
    importance: medium
    review_status: approved
    tags:
      - china
      - united-states
      - ai-policy
      - export-controls
      - chips
---

## 本期观察

- 本周的主线不是单点模型分数，而是代理系统工程化：Google 把 Gemini、Antigravity、Managed Agents 与搜索和应用层打通，OpenAI 与 Dell 则瞄准企业本地数据和 AI Factory。
- Anthropic 的两个动作值得放在一起看：收购 Stainless 是补齐 SDK/MCP 连接层，Glasswing 则说明高能力模型已经能显著改变软件安全的发现到修复节奏。
- NVIDIA 财报继续确认 AI 数据中心扩建周期，但“Q2 展望不计入中国数据中心计算收入”把中国市场、出口管制和本土算力替代重新拉回基础设施视野。
- 中国侧本周最具产业信号的事件来自物理 AI：小鹏量产 Robotaxi 下线，把端到端 VLA 模型、车端推理和规模制造放进同一条路线图。
