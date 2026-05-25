# Infra-Oracle

Infra-Oracle 是一个基于 Astro 的 static-first 技术展示站，面向 AI Infra、LLM、HPC、Codex 与 agent workflow 相关内容和工具原型。

这个公开仓库只保留前端站点源码、GitHub Pages 部署配置和对外 README。更细的规划、执行记录和本地协作说明保留在未公开的本地工作区中。

## 一句话定位

这是一个面向 AI Infra、LLM、HPC 与 agent workflow 实践者的 static-first 技术实验站，用统一的开发者界面承载精选情报、可执行模板和轻量趣味工具。

## 当前公开范围

当前已落地的页面包括：

- `/`：首页，作为多小组件展示面，包含短定位、Planner 本周计划、最新 Radar 三张重点卡、Runner 边界卡、右侧 Fortune / Status 和 Future Experiments 轻量入口
- `/radar/`：`Weekly AI Infra Radar` 最新一期与归档页
- `/radar/<issue-slug>/`：单期 Radar 详情页，例如 `weekly-ai-infra-radar-2026-w18`
- `/runner/`：`Web Codex Runner` 对话式任务原型页
- `/planner/`：本周时间轴页面，支持在当前浏览器里编辑通勤、工作、上课、项目、娱乐和休息安排
- 首页右侧 `Cyber Fortune` 每日小组件：轻量娱乐签面，不再提供独立 `/fortune/` 页面

## 核心模块

### 1. Weekly AI Infra Radar

一个围绕 AI Infra / LLM / HPC 的精选周报模块，当前已经从展示原型升级为真实周报阅读面，并具备“首页最新一期 + 归档 + 单期详情”的公开路径。

重点关注：

- AI 大厂模型、产品和 agent 平台发布
- AI Infra / 推理系统 / 数据中心更新
- HPC、GPU 相关动态
- NVIDIA、CUDA、推理栈和算力供应链
- 国内 AI 模型与平台动态
- 对 AI 基础设施有直接影响的少量国际局势和供应链事件
- vLLM、SGLang、TensorRT-LLM、Triton、FlashAttention 等工具更新

当前边界：

- 每周一整理上一完整周，即上周一到上周日；当前已发布 `2026 W17` 至 `2026 W21`
- 首页只展示最新完整周报的 3 条重点大卡；缩略图使用外部官方 / 公开可展示 URL，授权不确定时由自动发布 gate 降级到分类占位
- 推荐入口是 `radar:auto-publish`：自动搜索上一完整周、自动评估质量、覆盖当期期号文件，并在验证通过后提交推送
- SDK 联网脚本仍可生成固定草稿 `src/content/radar/weekly-ai-infra-radar-draft.md`
- `preview` 用于检查结构、时间窗、栏目比例和来源字段
- 自动质量闸门会检查来源 URL、来源分数、可信度、重点条目和图片授权策略；失败时会停止，不写正式 issue、不提交、不推送
- 手动 `publish` 保留为 fallback，仍要求人工把条目标为 `approved`
- 当前公开版本优先验证内容结构、深分析阅读方式、GitHub Pages 部署链路，以及候选内容与已发布 issue 的分离边界

维护命令：

```bash
npm run radar:auto-publish
npm run radar:full
npm run radar:preview
npm run radar:publish
```

默认本地验证可使用 `bash scripts/radar-weekly.sh auto-publish --dry-run --mock`，不会写正式 issue、commit 或 push。

### 2. Web Codex Runner

一个面向少量普通协作者的网页端文字工作助手，前端部署在 GitHub Pages，真实对话、文件上传、联网检索、Markdown / Word 输出由受控后端承接。

当前边界：

- 当前公开仓库只包含前端；后端源码、口令、日志、上传文件和生成文件保留在本机私有工作区
- 不在前端暴露 OpenAI 或 Codex 凭证
- 公网入口使用 `api.infra-oracle.top`，仍需要共享访问口令、限流、日志、审计、额度统计和隔离工作区
- PDF / Word / 图片等附件上传后只作为资料解析；公网大文件走分片上传并显示进度，文件实体按当前后端策略过期清理
- 上传文件、生成文件、任务日志和 Word 输出不进入 GitHub 仓库

### 3. Weekly Planner / 本周时间轴

一个轻量的本周安排工具，用于把通勤、工作、上课、读论文、改论文、看电影、休息、game、刷剧、看小说、健身、做项目和自定义任务排成按天展开的时间表。

当前边界：

- `/planner/` 是独立可编辑页面，并进入顶部导航
- 首页首屏按钮下方展示当前周计划的转置甘特图，横轴为周一到周日，纵轴为 `06:00-24:00`
- 数据以当前浏览器为单位保存，不会写回 GitHub，也不会同步到后端
- 时间轴范围为每天 `06:00-24:00`，横轴按小时展示，任务位置按分钟比例计算
- 支持多周切换、表单新增、编辑、删除、重置示例任务、JSON 导入 / 导出，以及桌面时间轴拖拽移动 / 拉伸任务时间；颜色自定义作为后续增强

### 4. Cyber Fortune 首页小组件

一个娱乐化的每日签面小组件，用于增强站点识别度和轻量互动感。

当前边界：

- 仅作为首页右侧轻量趣味模块，不进入顶层导航
- 每天按本地日期固定显示，不提供刷新抽签
- 数据来自静态 YAML 内容池，包含签面、幸运色、宜忌和公版哲学 / 文学引用来源
- 不作为真实决策、投资或运维判断依据

## 非目标

当前公开站点不做这些事：

- 不做通用博客模板
- 不做绕过质量闸门、凭证边界和 Git 提交范围防护的自动发布
- 不在浏览器端直接持有模型密钥
- 不承诺首版就提供真实远程执行和生产级运维链路
- 不把 `Cyber Fortune` 做成严肃决策系统

## 技术方向

- 前端框架：Astro
- 部署目标：GitHub Pages
- 内容形态：Markdown / YAML 等静态内容优先
- 动态能力：后续通过独立后端服务接入，不直接耦合到静态站点

## 本地开发

要求：

- Node.js `>= 22`

安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

构建静态产物：

```bash
npm run build
```

类型与 Astro 检查：

```bash
npm run check
```

## GitHub Pages 部署

本项目使用 Astro 官方 GitHub Action 部署到 GitHub Pages。

目标仓库：

- `https://github.com/qingyiyi/Infra-Oracle`

预期公开地址：

- `https://qingyiyi.github.io/Infra-Oracle/`

部署方式：

1. 将代码推送到 `main`
2. 在 GitHub 仓库 `Settings -> Pages` 中将 Source 设为 `GitHub Actions`
3. 等待 `.github/workflows/deploy.yml` 构建并发布

当前 `astro.config.mjs` 已按 GitHub Pages 项目页场景处理 `site/base`。

## 公开仓库边界

这个公开仓库默认只跟踪：

- 前端源码
- GitHub Pages workflow
- 构建配置
- 本 README

不会公开：

- 本地 planning / pipeline 记录
- 内部开发路线文档
- 本地协作约束文件
- 构建产物和依赖目录

如果你是在本地继续维护这个项目，产品定位和实现边界仍以本地工作区中的协作文档为准；这个 README 主要承担公开说明和快速上手入口。

## 文档与许可证状态

本地工作区保留 `docs/`、`.pipeline/` 和 `AGENTS.md` 等维护文档，但这些文件默认不进入公开 GitHub 仓库。当前 `docs/` 主要承担规划、运维、安全和内容模型记录，不是公开用户手册结构。

本地文档入口包括 `docs/user-guide.md`、`docs/developer.md`、`docs/platforms/github-pages.md` 和 `docs/reference/document-map.md`，用于维护者在私有工作区继续同步 README、roadmap、部署和 Runner 边界。

当前仓库尚未提供 `LICENSE` 文件，因此暂不声明开源许可证；这不等同于开源授权。外部复用代码、内容、Radar 周报文本或视觉资产前，需要先由维护者明确许可策略并补充许可证文件。
