# Teardown repository guidance

For machine simulators, read `SKILL.md` and the nearest example under `sims/`.
Use the user's requested language for the result. The workflow and runtime are
independent of the assistant or model provider.

- Install dependencies: `npm ci`. Build: `npm run build -- v8-live`.
- Check prerequisites: `npm run doctor`; add `-- --capture`, `-- --video` or
  `-- --sound` for the corresponding optional capabilities.
- Keep new mechanisms in separate folders with a `main.js`; build an external
  folder with `node /absolute/path/to/teardown/sims/build.mjs ./my-machine`.
- Model math, mesh poses and gauge values must share one state. Film rendering
  must be deterministic at arbitrary timestamps.
- Keep `SKILL.md` as the shared instruction source. Host adapter files should
  point to it instead of duplicating the workflow.
- Run `npm test` for installer/toolchain changes, build affected examples for
  runtime changes, and visually review changed simulations when tools permit.
- After building and installing Chromium, `npm run test:browser` checks the six
  bundled pages offline and writes screenshots to `teardown-out/review/`.
- Preserve `LICENSE`, original credits and `sfx/samples/SOURCES.md`.

Output defaults to `teardown-out/` in the command's working directory. Dependencies
resolve from this package or `TEARDOWN_DEPS`; do not assume installation under
any particular assistant's home directory. See `docs/agents.md` for integration.
