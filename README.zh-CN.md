# teardown · 多 AI 助手适配版

[English](README.md) · [详细接入说明](docs/agents.md)

根据机械结构描述生成 Three.js 交互式三维页面，包含运动展示、剖切、拆解、
同步仪表和自动导览；需要时还能导出视频并合成音效。内置示例可打包为离线 HTML。

本版本基于 [elvarofficial/teardown](https://github.com/elvarofficial/teardown)
改造，保留原运行工具、三个机械示例、MIT 许可证及原作者署名。

## 支持哪些助手

| 助手 | 使用方式 |
| --- | --- |
| Codex | 仓库内读取 `AGENTS.md`；安装为技能后，通过技能选择器或 CLI/IDE 的 `$teardown` 调用 |
| Cursor | 仓库内有 `.cursor/rules/teardown.mdc`；安装后在 `/` 菜单选择 `teardown` |
| Claude Code | 保留标准 `SKILL.md`，并增加仓库入口 `CLAUDE.md` |
| Gemini、Copilot、Cline、Continue、本地模型等 | 显式读取或附加 `AGENTS.md`、`SKILL.md` 和相关示例；本项目不宣称这些工具会自动发现配置 |
| 纯聊天模型 | 可以根据文件编写代码；需要有执行环境的人或助手完成构建与检查 |

各助手共用同一份核心说明，不需要在本项目中配置 OpenAI、Anthropic 或其他模型 API。
助手自身仍需其通常使用的账号或模型服务。模型能力和工具权限会影响最终效果。

## 立即运行

获取适配版，然后在 Codex 或 Cursor 中打开仓库目录：

```sh
git clone https://github.com/XinruiCao/teardown.git
cd teardown
npm ci
npm run doctor
npm run build -- v8-live
```

然后用支持 WebGL 2 的浏览器打开 `teardown-out/dist/v8-live.html`。
需要 Node.js 20 或更新版本。首次安装依赖需要网络，打包后的内置页面可以离线使用。

另外两个示例：

```sh
npm run build -- cessna-live
npm run build -- strandbeest-live
```

不传名称的 `npm run build` 会生成三个交互页面及对应的三个影片页面。

## 安装到其他项目

在本仓库运行，路径替换为你的项目：

```sh
# Codex、Cursor 共用一份安装
npm run install:skill -- --project /你的项目路径

# 或安装到当前用户的共享技能目录
npm run install:skill -- --global

# Claude Code 的独立目录
npm run install:skill -- --agent claude-code --project /你的项目路径
```

安装器打印目标目录后，在该目录运行 `npm ci`。它复制技能、示例和运行工具，
不复制依赖、Git 记录和生成结果，也不会覆盖已有目录。Codex 和 Cursor 共用
`.agents/skills/teardown`，不需要各装一次。若列表未刷新，重新打开助手。

其他支持技能的助手可指定 `--target /目标技能目录/teardown`。请按该助手的文档
选择路径。Windows PowerShell 示例和更多说明见 [接入指南](docs/agents.md)。

原作者的 GitHub 地址仍指向原版；适配版请使用
[XinruiCao/teardown](https://github.com/XinruiCao/teardown)。

## 可以直接发送的提示词

> 阅读本项目的 AGENTS.md 和 SKILL.md，制作一个四冲程发动机的交互式三维讲解。
> 使用中文界面，支持剖切、暂停、调速和实时仪表。优先复用现有 V8 示例的结构，
> 明确标注假设尺寸，将新源码放在我的项目中，构建离线 HTML，并检查页面交互。
> 暂时只需要网页。

有现成图纸、尺寸表或参考图片时，一起提供给助手。项目生成的是讲解模型，
没有自带 DWG/STEP 装配导入、有限元分析或工程精度认证能力。

## 可选：审片与视频

```sh
npx playwright install chromium
npm run doctor -- --capture
npm run build -- v8-film
node sims/capture.mjs v8-film --size 1600x900 --dpr 1 --still 12.5 --out teardown-out/v8.png
```

视频和联系表还需要 ffmpeg；音效需要 Python 3，录音采样解码也用到 ffmpeg。
用 `npm run doctor -- --video --sound` 检查完整工具链。
音效模块已改为读取 `FFMPEG` 环境变量或系统 PATH，不再绑定原作者的 Claude 私有路径。

构建结果默认输出到**运行命令时所在目录**的 `teardown-out/`，可用 `TEARDOWN_OUT`
更改。`CHROMIUM`、`FFMPEG`、`FFPROBE`、`PYTHON` 可指定对应程序，
`TEARDOWN_DEPS` 可指定依赖目录。只生成 HTML 时，不要求安装视频和音效工具。
无 GPU 的云端或无头环境可显式设置 `TEARDOWN_SOFTWARE_GL=1`，使用软件 WebGL
进行截图和录制检查；这种模式可能较慢，不能用于衡量硬件渲染性能。

## 检查和许可

`npm test` 检查安装、已有目录保护、异地构建、依赖诊断和音频路径；
`npm run build` 检查全部示例构建。安装 Chromium 后，`npm run test:browser`
会离线检查六个页面和 V8 交互，并保存截图到 `teardown-out/review/`。
视觉变化还应打开页面或截图检查。
这些检查验证共用工具链，不等于逐一测试过所有模型和编辑器版本。

保留 [MIT 许可证](LICENSE)。原项目及底层贡献来源见 [英文说明](README.md#credits-and-license)，
录音素材来源见 [sfx/samples/SOURCES.md](sfx/samples/SOURCES.md)。
