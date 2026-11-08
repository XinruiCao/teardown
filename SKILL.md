---
name: teardown
description: Build or edit interactive Three.js machine simulators, mechanical cutaways and exploded views as offline HTML, with synchronized motion, gauges and an automatic tour. Use for visual explanations of mechanisms; optionally record a video with sound when requested. Not a CAD importer or an engineering validation solver.
---

# Teardown

One machine, one page. The visitor sees the thing run, presses a button, and the part doing the work opens up while the gauges around it read the real numbers. Left alone, the page tours itself with a cursor. The same code records a film of the tour, frame by frame, with a score built on the same timeline.

This workflow is model-neutral: use the host assistant's file, terminal, browser and image tools. No Claude-specific tools, model API, subscription or API key are required by the runtime. The assistant itself still needs its usual account or model access.

`SKILL_DIR` below means the absolute folder containing this file, not the current project. It is notation, not an automatically supplied environment variable. Substitute the actual path or set it in your shell. Builds and renders go to `./teardown-out` of the folder you run from; `TEARDOWN_OUT` overrides this. Keep new machines in the user's project, outside a shared skill installation.

## Host capabilities and scope

- Read [docs/agents.md](docs/agents.md) for installation, host-specific entry points and a plain-prompt fallback.
- With file and shell tools, implement and build the requested machine. With browser or image tools, also inspect the result. With text-only access, supply source and commands and state which checks the user must run; do not claim to have executed them.
- Deliver the interactive page by default. Produce video and sound only when requested. Do not let unavailable recording dependencies block an HTML-only task.
- Use the user's language for visible controls, explanations and delivery notes. Keep source identifiers consistent with the examples.
- Use supplied references and dimensions when available. If absent, use a documented reference you can access, or label assumed dimensions and simplified dynamics explicitly. Do not present an illustrative mechanism or computed gauge as measured engineering data.

## First run

```
cd "$SKILL_DIR"
npm ci
node scripts/doctor.mjs
```

Node.js 20+ builds the pages. For browser review or capture, run `npx playwright install chromium` once in this folder, then `node scripts/doctor.mjs --capture`. Video and contact sheets also need `ffmpeg` on PATH; scores need Python 3 (standard library only). `node scripts/doctor.mjs --video --sound` checks the full recording toolchain. Set `FFMPEG`, `FFPROBE`, `PYTHON` or `CHROMIUM` to point at other binaries. Return to the user's project before building so outputs land there.

## The 3 examples

Build one, open the HTML, press buttons. Copy the closest one when you start a new machine.

| | The machine | What drives it | Worth stealing |
|---|---|---|---|
| `v8-*` | A cross-plane V8 with glass liners: the charge burns inside the cylinder you track, valves lift on their cams, 8 pistons move from the exact slider-crank. | Crank angle. Firing order 1-8-4-3-6-5-7-2, a chamber pressure model for the indicator diagram. | Cutaway modes (glass, section, solid), the firing order as a cylinder picker, live charts synced to the crank. |
| `cessna-*` | The Cessna 337 main landing gear folding into the airframe on takeoff and dropping on landing. | Stroke 0..1: a 201 mm rack turns a 32-tooth pinion (module 4 mm) through exactly 180°. | One degree of freedom posing a whole mechanism, flight phases as functions of time, a runway that rolls under the model. |
| `strandbeest-*` | Theo Jansen's Strandbeest, 20 legs on one crankshaft, walking broadside over sand. | Wind. The crank speed is integrated from it; every joint follows by circle intersection from Jansen's 11 link lengths. | An exact linkage solver in 67 lines, instanced tubes, foot traces, a contact chart of all 20 feet. |

Each comes in 3 folders: `<name>-shared/` holds the machine, `<name>-film/` the recorded tour, `<name>-live/` the page you drive.

```
node "$SKILL_DIR/sims/build.mjs" v8-live          # → teardown-out/dist/v8-live.html, offline, ~800 KB
node "$SKILL_DIR/sims/build.mjs"                  # all 6
```

## How a machine is built

One folder per machine, split by job. The examples follow this exactly:

| File | Job |
|---|---|
| `kin.js` / `gear.js` / `jansen.js` | The math. Real dimensions in real units, one input (crank angle, stroke, wind) and every pose and readout as a function of it. No three.js in here. |
| `engine.js` / `gear.js` / `beast.js` | The geometry, built from code: lathed parts, tubes, instanced links. `update(input)` poses it. |
| `stage.js` | Studio, lights, shadows, post (GTAO, bloom). `frame(state, cam)` draws one frame. |
| `console.js` | The overlay: fixed 1600 x 900 CSS layout of panels, charts, toggles, callouts with leaders. `update(state)` redraws it from the frame's state. |
| `film.js` | A `SCRIPT` of operator moves (views, isolate, cutaway, throttle) and `render(t)` as a pure function of time. |
| `live.js` | The same machine in real time: buttons, sliders, orbit, zoom, keys. With no input it plays `film.js`'s script as an auto tour with a cursor; any click, drag, wheel or key hands control over, 25 s of quiet hands it back. |
| `score.py` | The sound on the film's timeline. |

For a machine outside `SKILL_DIR`, make a folder with a `main.js` and import the kit by name: `import {runSim} from 'teardown-kit/runtime.js'`. Build it with `node "$SKILL_DIR/sims/build.mjs" ./my-machine`.

## Rules that decide whether it works

1. **Build against a reference.** Use a photo, a cutaway drawing from a manual or a clip of the mechanism when available. Compare geometry and motion against it. For an invented or underspecified machine, document assumptions instead of inventing provenance.
2. **Real numbers, one source.** Get the real dimensions first (bore, stroke, tooth count, link lengths). Every gauge, chart and label reads from the same function that poses the parts, so nothing on screen can disagree with the motion. Check one by hand: in the Cessna, 32 teeth × 4 mm module is a 128 mm pitch diameter, and half its circumference is the 201 mm stroke.
3. **One input drives everything.** Pose from the crank angle, the stroke or the wind. Nothing is keyframed by hand, so the film, the live page and the score never drift.
4. **The part doing the work opens up.** Isolate it, cut it, x-ray it. A camera that goes inside is worth more than ten orbits.
5. **Light studio, one accent.** Pale backgrounds read in a feed; dark ones lose the first second. The accent marks the thing that is changing. Watch near-white parts on a pale backdrop: give them an ink outline or a darker ground.
6. **Pick the camera for the mechanism.** A planar linkage seen face-on collapses into a lattice; a 3/4 view along the spine keeps every leg readable.
7. **Fix collisions with a number.** When a part pokes through another, scale or move it in the parameter block. Never hide it with the camera.

## Live page rules

- **Check the available GPU and quality tiers.** An integrated GPU may be slower than a desktop card; report the hardware actually tested. The examples carry quality tiers (`TIERS` in `live.js`): no AO, lower pixel ratio, smaller shadow maps, panels redrawn every other frame. Find the expensive shader first.
- **Warm the shaders.** `kit/warm.js` compiles every program in parallel before the first frame, so the page never freezes on first draw.
- **Prefer a compact, self-contained page.** Aim for about 1 MB where practical. If large models need external files, use `build.json` → `{"external": {"heavy.glb": "light.glb"}}` and deliver those files alongside the HTML; that build is no longer a single-file artifact.

## render(t) contract

```js
import {runSim} from '../kit/runtime.js';

const DEFAULTS = {duration: 20, fps: 60, hud: {enabled: false}, director: {enabled: false}};

runSim(DEFAULTS, async ({cfg, canvas, capture}) => {
  // build the scene, precompute anything stateful
  return {render(t) { /* draw frame t from scratch */ return {}; }, resize() {}};
});
```

- `render(t)` is pure: no `Math.random` (use `rng(seed)` from `kit/util.js` at setup), no `Date`, no state carried between frames. Capture calls it at arbitrary times.
- Anything that moves by its own rules (agents, particles) is simulated once at load into typed arrays; `render` only reads them. A quantity integrated over time (the Strandbeest's crank under a changing wind) is integrated in closed form or tabulated at load.
- Every beat goes into `<name>-film/timeline.json` in seconds. The score reads the same file.
- Frame 0 is the thumbnail. It must already show the machine.

## Commands

```
node "$SKILL_DIR/sims/build.mjs" v8-film
node "$SKILL_DIR/sims/capture.mjs" v8-film --size 1600x900 --dpr 1.2 --stills beats --cols 4 --out teardown-out/v8-beats.png
node "$SKILL_DIR/sims/capture.mjs" v8-film --size 1600x900 --dpr 1.2 --still 12.5 --out teardown-out/v8-12.5.png
node "$SKILL_DIR/sims/capture.mjs" v8-film --size 1600x900 --dpr 1.2 --out teardown-out/v8-silent.mp4
python3 "$SKILL_DIR/run_sfx.py" "$SKILL_DIR/sims/v8-shared/score.py"
ffmpeg -y -i teardown-out/v8-silent.mp4 -i teardown-out/v8-score.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart teardown-out/v8.mp4
node "$SKILL_DIR/wave.mjs" teardown-out/v8.mp4 --timeline "$SKILL_DIR/sims/v8-film/timeline.json"
```

`--size` is the CSS layout and `--dpr` multiplies it: 1600 x 900 at 1.2 gives 1920 x 1080. Capture prints the renderer it got. When a headless host has no usable GPU, set `TEARDOWN_SOFTWARE_GL=1` for software capture; identify it as software rendering and do not infer hardware performance from it.

## Review loop

Use the host's available visual tools. For HTML, open the current build and exercise orbit, zoom, pause, cutaway, gauges and the tour handover. For video, inspect frames or contact sheets, and the encoded output when supported. If visual inspection is unavailable, report that limitation explicitly with the build checks that did run.

1. `--stills beats`: one tile per timeline beat, 0.3 s after it, each labelled `t=`.
2. Read every tile against the checklist below.
3. Zoom in: `--stills every:0.2 --from A --to B` for a transition, `--still T` for one full frame.
4. Fix observed defects, rebuild and repeat the affected checks. If blocked by unavailable tools or an unresolved issue, explain it instead of claiming the review passed.
5. Final: `node "$SKILL_DIR/sheet.mjs" --video <final.mp4> --timeline <timeline.json>` and read that too: it shows what the encoder wrote.

Checklist:

- **The mechanism.** Every part that should touch touches; nothing passes through anything; the numbers on the panels match the pose.
- **Composition.** One focal point per frame. Nothing important within 60 px of an edge. Labels never cover the part they name.
- **Type.** Nothing clipped. The key readout reads at phone width.
- **3D.** Bloom eats detail: keep emissive layers under 1.0. Near-white surfaces blow out. Glossy metal under a low light streaks: roughness ≥ 0.45 and envMapIntensity ≈ 0.5 on big surfaces.
- **Timing.** Each state holds long enough to read: 1 s for a short phrase plus 0.25 s per word beyond three.

## three.js traps the examples already hit

- `smoothstep(a, b, x)` with `a > b` returns 0 on Windows (ANGLE/D3D). Write `1.0 - smoothstep(b, a, x)`.
- A `ShadowMaterial` or a decal a fraction of a millimetre above the floor loses the depth test inside a post-processing render target. Give it `polygonOffset`.
- A quad laid into the ground with a mirrored mapping gets culled as a back face. Use `DoubleSide`.
- One NaN pixel blacks out the whole frame through bloom. Clamp every `pow()` base in a shader.
- GTAO on a clipped (cutaway) model needs the same clipping planes on `gtao.normalMaterial`, or the cut half returns as a pale ghost.

## Sound

`sfx/` synthesises sound in pure Python (48 kHz, reproducible) and reads the film's timeline. `python3 "$SKILL_DIR/run_sfx.py" --list` shows the generators (use `python` on Windows if that is your Python 3 command). `sample()` adds recorded CC0 sounds in `sfx/samples/` and requires ffmpeg. `sfx/score_kit.py` has the beds and accents the 3 scores use: a chord bed, a soft thud per power stroke, a motor, air under a drag.

- Every time comes from the timeline, never a typed number.
- Mastering is automatic: −14 LUFS, true peak ≤ −2 dBFS.
- Accent, never narrate: continuous motion stays silent. One key for every tonal sound.

## Taste, with numbers

- Easing: entrances `cubic-bezier(0.16, 1, 0.3, 1)`, exits `cubic-bezier(0.6, 0, 0.9, 0.35)` at half the entrance's length, state to state `cubic-bezier(0.65, 0, 0.35, 1)`. Linear only for continuous motion.
- The machine fills 60-70% of its viewport. Labels never under 34 px on a 1080 canvas.
- One accent, and it means something: the part that is working right now.
- Nothing dead-still: one element always alive.

## Credits

The kit, frame capture, sfx engine and review rules come from [whaleyxbt/claude-motion](https://github.com/whaleyxbt/claude-motion) (MIT). The recorded samples are CC0 from Freesound, trimmed by [Barty-Bart/motion-graphics](https://github.com/Barty-Bart/motion-graphics) (MIT); sources in `sfx/samples/SOURCES.md`.
