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
- `/runner/`：`Web Codex Runner` 前端原型页壳
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

一个网页端任务入口与后续服务端执行能力的产品预演。

当前边界：

- 当前版本是前端原型，不代表真实远程执行链路已接通
- 不在前端暴露 OpenAI 或 Codex 凭证
- 未来如接入真实执行能力，需要补齐鉴权、限流、日志、审计和沙箱约束

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
