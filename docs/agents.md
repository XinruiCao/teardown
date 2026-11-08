# Using Teardown with different assistants

Teardown is instructions plus a local Three.js toolchain, not an LLM API client.
The selected assistant generates or edits JavaScript using the same kit. Switching
models needs no API integration in this repository. Code quality still depends on
the model and the host tools; compatibility is not a promise of identical results.

## Work directly in this repository

Open the checkout as your workspace. Codex can use `AGENTS.md`; Cursor has both
that file and `.cursor/rules/teardown.mdc`; Claude Code has `CLAUDE.md`. All route
to the root `SKILL.md`. Reading a rule does not require installing a second copy.

For any other assistant, including Gemini, Copilot, Cline, Continue, or a local
model, explicitly attach/read `AGENTS.md` and `SKILL.md` plus the relevant example
files. This is a manual integration; no automatic discovery for those hosts is
claimed. A text-only chat can help author code but cannot build or inspect files
without a connected execution environment.

## Install as a reusable skill

From the modified checkout:

```sh
# One project installation shared by Codex and Cursor:
node scripts/install.mjs --project /path/to/your-project

# Optional: one shared user installation instead of a project installation:
node scripts/install.mjs --global

# Claude Code's separate project location:
node scripts/install.mjs --agent claude-code --project /path/to/your-project

# Another host that supports SKILL.md (use that host's documented location):
node scripts/install.mjs --target /path/to/host/skills/teardown
```

`--agent codex` and `--agent cursor` are aliases for the shared `.agents/skills`
location. Choose one shared installation; do not install both project and user
copies unless you want both to be discoverable. The installer copies the full
runtime and references, excludes dependencies and generated output, and refuses
existing destinations. It does not install packages, alter API keys, or edit a
host's settings. Updates require choosing a new destination or moving the old
installation after preserving custom work.

In the printed installation directory run `npm ci`. Add
`npx playwright install chromium` for visual review or capture. Restart/refresh
the assistant if the skill is not listed. Native invocation depends on the host:

| Host | Entry point |
| --- | --- |
| Codex CLI / IDE | `$teardown` or the skills selector |
| Codex desktop | Select Teardown in the skill picker, or name the skill in your request |
| Cursor | Type `/` and select `teardown`, or ask for a matching mechanism task |
| Other skill hosts | Use the host's skill picker or explicitly read the installed `SKILL.md` |
| Plain chat / other coding assistants | Attach the instructions and relevant source; use the prompt below |

The shared location and SKILL.md format follow the
[OpenAI skill documentation](https://developers.openai.com/codex/skills) and
[Cursor skill documentation](https://cursor.com/docs/skills). The repository rule
uses [Cursor's .mdc format](https://cursor.com/docs/rules).

## Portable prompt

> Read AGENTS.md and SKILL.md in this Teardown checkout. Build an interactive
> four-stroke engine explainer with Chinese controls, a cutaway, pause/speed
> controls and gauges synchronized to the crank. Reuse the nearest example.
> Save new source in my project and build the offline HTML. Label any assumed
> dimensions. Use available browser/image tools to inspect the result, and
> report the checks actually performed. I only need HTML for now.

For a hosted or local model with file tools, provide the repository path. For
text-only chat, attach `SKILL.md`, `paths.mjs`, `sims/kit/` and the relevant example
files rather than only the README. Video tasks additionally need the capture,
timeline and sound files. A model's name alone does not give it these files or
the ability to execute commands.

## Execution paths and requirements

Run commands from the user's output project. Point the command to the installed
skill by its absolute path. `SKILL_DIR` in examples is a user-set variable:

```sh
SKILL_DIR="/absolute/path/to/teardown"
node "$SKILL_DIR/sims/build.mjs" v8-live
node "$SKILL_DIR/sims/build.mjs" ./my-machine
```

PowerShell uses a different variable syntax:

```powershell
$TeardownDir = 'C:\path\to\teardown'
node "$TeardownDir/sims/build.mjs" v8-live
```

| Operation | Requirements |
| --- | --- |
| Build offline HTML | Node.js 20+, `npm ci` in the skill directory |
| View HTML | A browser with WebGL 2; no model service or network needed by bundled examples |
| Capture a PNG | Playwright Chromium with WebGL |
| Video / contact sheets | Chromium plus ffmpeg; ffprobe for encoded-media review |
| Procedural score | Python 3; ffmpeg when using recorded samples |

`TEARDOWN_DEPS` overrides the dependency directory. `TEARDOWN_OUT` overrides the
output directory. `CHROMIUM`, `FFMPEG`, `FFPROBE`, and `PYTHON` select executables.
Values containing spaces are supported; pass executable paths, not shell commands.
For a headless/CI host where Chromium cannot create a GPU context, explicitly set
`TEARDOWN_SOFTWARE_GL=1` to use SwiftShader for local build review/capture. This
opts into Chromium's software WebGL path; it can be slow and is not a hardware
performance test. The default continues to request hardware rendering.
Only install from trusted sources. Installation and initial npm/Chromium downloads
need network access; the bundled HTML pages are offline after building.

## Verification and limits

`npm test` checks copying, existing-file protection, relocated builds, dependency
diagnostics and portable sound decoding. `npm run build` builds all six entries.
Use `sims/capture.mjs` for actual browser/GPU inspection, as described in SKILL.md.
After building and installing Chromium, `npm run test:browser` checks all six
pages offline, exercises V8 controls and saves screenshots under `teardown-out/review/`.
These checks exercise the common toolchain, not every model or editor version.

This project creates explanatory geometry and simplified mechanics. It does not
import DWG/STEP assemblies, solve FEA, or certify dimensions, forces or collisions.
Preserve the MIT license and the original asset attribution when redistributing.
