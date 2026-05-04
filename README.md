# Infra-Oracle

Infra-Oracle 是一个基于 Astro 的 static-first 技术展示站，面向 AI Infra、LLM、HPC、Codex 与 agent workflow 相关内容和工具原型。

这个公开仓库只保留前端站点源码、GitHub Pages 部署配置和对外 README。更细的规划、执行记录和本地协作说明保留在未公开的本地工作区中。

## 一句话定位

这是一个面向 AI Infra、LLM、HPC 与 agent workflow 实践者的 static-first 技术实验站，用统一的开发者界面承载精选情报、可执行模板和轻量趣味工具。

## 当前公开范围

当前已落地的页面包括：

- `/`：首页，包含站点定位、模块预览和 Future Experiments 入口
- `/radar/`：`Weekly AI Infra Radar` 最新一期与归档页
- `/radar/<issue-slug>/`：单期 Radar 详情页，例如 `weekly-ai-infra-radar-2026-w18`
- `/runner/`：`Web Codex Runner` 对话式任务原型页
- `/fortune/`：`Cyber Fortune` 轻量展示页壳

## 核心模块

### 1. Weekly AI Infra Radar

一个围绕 AI Infra / LLM / HPC 的精选周报模块，当前阶段以静态内容展示为主，并已具备“最新一期 + 归档 + 单期详情”的公开阅读路径。

重点关注：

- LLM 模型发布与能力变化
- AI Infra / 推理系统更新
- HPC、GPU 相关动态
- 对推理速度、成本、KV cache、并行策略有影响的方法与论文
- vLLM、SGLang、TensorRT-LLM、Triton、FlashAttention 等工具更新

当前边界：

- 自动采集只能作为候选来源
- 最终发布必须保留人工审查入口
- 当前公开版本优先验证内容结构、页面组织、GitHub Pages 部署链路，以及候选内容与已发布 issue 的分离边界

### 2. Web Codex Runner

一个面向少量普通协作者的网页端文字工作助手，前端部署在 GitHub Pages，真实对话、文件上传、联网检索、Markdown / Word 输出由受控后端承接。

当前边界：

- 当前公开仓库只包含前端；后端源码、口令、日志、上传文件和生成文件保留在本机私有工作区
- 不在前端暴露 OpenAI 或 Codex 凭证
- 公网入口使用 `api.infra-oracle.top`，仍需要共享访问口令、限流、日志、审计、额度统计和隔离工作区
- PDF / Word / 图片等附件上传后只作为资料解析；公网大文件走分片上传并显示进度，文件实体按当前后端策略过期清理
- 上传文件、生成文件、任务日志和 Word 输出不进入 GitHub 仓库

### 3. Cyber Fortune

一个娱乐化的开发者签文模块，用于增强站点识别度和轻量互动感。

当前边界：

- 仅作为轻量趣味模块
- 不作为真实决策、投资或运维判断依据

## 非目标

当前公开站点不做这些事：

- 不做通用博客模板
- 不做无人审核自动抓取和自动发布
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
