# Verification record

Date: 2026-11-09 (Asia/Shanghai). Base: upstream `a91262a`.
Environment: macOS arm64, Node.js 24.18.0, Python 3.14.6, Playwright 1.58.2,
Chromium 145.0.7632.6, ffmpeg 8.1.2.

| Check | Result |
| --- | --- |
| `npm ci` | Lockfile installation succeeded; npm reported 0 vulnerabilities at this run |
| `npm test` | 9 passed, 0 failed, 0 skipped |
| `npm run build` | All 6 entries built; approximately 799–811 KB each |
| Skill Creator `quick_validate.py` | SKILL.md valid |
| `npm run doctor -- --video --sound` | All selected prerequisites available with the test browser path configured |
| `npm run test:browser` | All 6 pages loaded offline with no page/console errors or HTTP requests |
| V8 live controls | Pause, section cutaway, orbit, zoom and tour handover exercised |
| Visual review | Screenshots from all 6 pages inspected |
| Real sample decoding | ffmpeg decoded 0.1 s of a bundled CC0 sample to 4,800 non-silent samples |
| MP4 capture | H.264, 800 × 450, 60 fps, 6 frames / 0.1 s; ffprobe checked and an encoded frame inspected |
| License and attribution | LICENSE and sfx/samples/SOURCES.md unchanged from upstream |
| `git diff --check` | Passed |

The headless host could not create a GPU context with its default renderer.
Browser/capture checks used the explicit `TEARDOWN_SOFTWARE_GL=1` SwiftShader
fallback. These results do **not** establish hardware GPU performance or 60 fps
interactive playback. The MP4 check verifies encoding, not a full-length film or
an audio/video synchronization review.

The browser was installed inside the ignored output folder for this run:

```sh
PLAYWRIGHT_BROWSERS_PATH="$PWD/teardown-out/playwright" npx playwright install chromium
PLAYWRIGHT_BROWSERS_PATH="$PWD/teardown-out/playwright" TEARDOWN_SOFTWARE_GL=1 npm run test:browser
PLAYWRIGHT_BROWSERS_PATH="$PWD/teardown-out/playwright" TEARDOWN_SOFTWARE_GL=1 \
  node sims/capture.mjs v8-film --size 1600x900 --dpr 0.5 --fps 60 \
  --from 0 --to 0.1 --out teardown-out/review/v8-smoke.mp4
```

Screenshots and the smoke clip are generated locally under `teardown-out/review/`
and are not committed. Cross-platform path handling and host adapter formats
were checked; Windows/Linux runtime execution and independent end-to-end sessions
in every named model/editor were not performed.
