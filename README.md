# teardown · multi-assistant edition

[简体中文](README.zh-CN.md) · [Assistant setup](docs/agents.md)

Turn a machine description into an interactive Three.js simulator: moving parts,
cutaways, exploded views, synchronized gauges, an automatic tour and optional
video with procedural sound. Build one offline HTML file you can open and share.

Adapted from [elvarofficial/teardown](https://github.com/elvarofficial/teardown).
The common `SKILL.md` now supports **Codex, Cursor and Claude Code**, plus other
coding assistants through explicit file/prompt loading. The runtime has no LLM
API dependency. Your assistant uses its own selected model and tools.

![Mellis HB-7 robotic bee simulator](docs/bee.gif)

| Telson SC-8 robotic scorpion | Pelagos OC-8 robotic octopus |
|---|---|
| ![Telson SC-8 robotic scorpion](docs/scorpion.gif) | ![Pelagos OC-8 robotic octopus](docs/octopus.gif) |

These upstream preview images illustrate generated work; the included source
examples are a V8 engine, Cessna landing gear and Strandbeest linkage.

## Quick start

Open **this modified checkout** in Codex, Cursor or another coding assistant.
To get this edition and run the first example:

```sh
git clone https://github.com/XinruiCao/teardown.git
cd teardown
npm ci
npm run doctor
npm run build -- v8-live
```

Open `teardown-out/dist/v8-live.html` in a WebGL 2 browser. Build all six live/film
entries with `npm run build`. Node.js 20+ is required. Downloading dependencies
needs network access; the resulting bundled examples work offline.

Ask the assistant:

> Read SKILL.md and build a four-stroke engine simulator with a cutaway, live
> gauges, pause and speed controls. Label assumed dimensions. Build and inspect
> the offline HTML.

Repository entry points are `AGENTS.md` (Codex and compatible hosts),
`.cursor/rules/teardown.mdc` (Cursor), and `CLAUDE.md` (Claude Code). They all
point to the same workflow.

## Install into another project

From this modified checkout:

```sh
# Shared by Codex and Cursor; install only once:
npm run install:skill -- --project /path/to/your-project

# Or install for your user instead:
npm run install:skill -- --global

# Claude Code uses a separate directory:
npm run install:skill -- --agent claude-code --project /path/to/your-project
```

The installer prints the destination. Run `npm ci` there before use. It copies
the complete skill and runtime, excludes dependencies/output and never overwrites
an existing destination. For another skill host, use `--target /path/to/skills/teardown`.
The full [assistant guide](docs/agents.md) covers invocation, Windows commands,
shared paths, updates and text-only models.

Installing from `elvarofficial/teardown` retrieves the upstream edition. Use
[XinruiCao/teardown](https://github.com/XinruiCao/teardown) for this multi-assistant
edition, or distribute your own modified checkout.

## Optional visual review and recording

```sh
npx playwright install chromium
npm run doctor -- --capture
npm run build -- v8-film
node sims/capture.mjs v8-film --size 1600x900 --dpr 1 --still 12.5 --out teardown-out/v8.png
```

Video and contact sheets require ffmpeg. Sound needs Python 3; recorded samples
also use ffmpeg. Check all recording prerequisites with
`npm run doctor -- --video --sound`. The film, audio and contact-sheet commands
are in [SKILL.md](SKILL.md). HTML-only tasks do not require those optional tools.

## Package layout

| Path | Purpose |
|---|---|
| `SKILL.md` | Shared mechanical, visual, build and review workflow |
| `agents/openai.yaml` | Codex skill display metadata |
| `scripts/install.mjs`, `scripts/doctor.mjs` | Portable installation and prerequisite checks |
| `sims/kit/` | Runtime, stage, shader warm-up |
| `sims/v8-*`, `sims/cessna-*`, `sims/strandbeest-*` | Shared geometry, live pages and recorded tours |
| `sims/build.mjs` | Bundle HTML with Three.js and fonts inlined |
| `sims/capture.mjs` | Render frames, contact sheets and video |
| `sfx/`, `run_sfx.py` | Procedural sound and CC0 samples |
| `tests/` | Installer, diagnostics, relocated-build and audio regression checks |

For a custom machine, create a project folder with `main.js`, import
`teardown-kit/runtime.js`, and build it using the absolute path to
`sims/build.mjs`. Outputs default to `teardown-out/` in your working directory;
`TEARDOWN_OUT` overrides that. See [docs/agents.md](docs/agents.md) for path overrides.

## Validation and scope

Run `npm test` and `npm run build`. Inspect the current build in a browser or
capture tool for visual changes. With Chromium installed, `npm run test:browser`
checks all six pages offline, exercises V8 controls and saves review screenshots
to `teardown-out/review/`. Assistant configuration follows the documented
skill/rule formats; tests validate the shared toolchain, not output quality from
every model. Text-only models need someone to execute the generated commands.

This is a visual explanation toolkit, not a DWG/STEP importer, an FEA solver or
an engineering verification system. Assumed dimensions and simplified models
should be identified in generated work.

## Credits and license

Original project: [elvarofficial/teardown](https://github.com/elvarofficial/teardown).
Built on [whaleyxbt/claude-motion](https://github.com/whaleyxbt/claude-motion)
(MIT): runtime, capture, sound engine and review workflow. Recorded samples are
CC0 from Freesound, prepared by
[Barty-Bart/motion-graphics](https://github.com/Barty-Bart/motion-graphics);
sources in [sfx/samples/SOURCES.md](sfx/samples/SOURCES.md).

The original [MIT license](LICENSE) and copyright notices are preserved.
